import { buildStructuralModel } from './structuralModel.js';
import { getExplicitAccessibleName, normalizeText } from './accessibilityName.js';
import {
  getComposedParent,
  getDeepActiveElement,
  hasAriaHiddenAncestor,
  isComposedWithin,
  isDocument,
  isElement,
  isOpenKeyNavGeneratedUI,
  isShadowRoot,
} from './domUtilities.js';
import {
  matchesShortcut,
  MODIFIER_KEYS,
  normalizeShortcut,
  preventAcceptedCommand,
} from './keyboardEvents.js';
import { discoverTabbableTargets } from './tabbableTargets.js';

export const STRUCTURAL_NAVIGATION_COMMANDS = Object.freeze({
  previousTarget: 'previousTarget',
  nextTarget: 'nextTarget',
  previousSiblingContext: 'previousSiblingContext',
  nextSiblingContext: 'nextSiblingContext',
  broadenContext: 'broadenContext',
  narrowContext: 'narrowContext',
  previousPeerContext: 'previousPeerContext',
  nextPeerContext: 'nextPeerContext',
});

const STRUCTURAL_STATUS_CHANNEL = 'structural-navigation';
const STRUCTURAL_EXIT_STATUS_CHANNEL = 'structural-navigation-exit';
const ARROW_OWNING_ROLES = new Set([
  'combobox',
  'grid',
  'listbox',
  'menu',
  'menubar',
  'radiogroup',
  'scrollbar',
  'slider',
  'spinbutton',
  'tablist',
  'toolbar',
  'tree',
  'treegrid',
]);
const ESCAPE_OWNING_ROLES = new Set([
  ...ARROW_OWNING_ROLES,
  'dialog',
]);
const TEXT_INPUT_TYPES = new Set([
  'date',
  'datetime-local',
  'email',
  'month',
  'number',
  'password',
  'range',
  'search',
  'tel',
  'text',
  'time',
  'url',
  'week',
]);

const SHORTCUT_MODIFIER_LABELS = Object.freeze({
  ctrlKey: 'Ctrl',
  altKey: 'Alt',
  shiftKey: 'Shift',
  metaKey: 'Meta',
});

const shortcutLabel = shortcut => {
  const normalized = normalizeShortcut(shortcut);
  if (!normalized) return '';

  const modifiers = MODIFIER_KEYS
    .filter(modifier => normalized[modifier])
    .map(modifier => SHORTCUT_MODIFIER_LABELS[modifier]);
  const key = normalized.key === 'Escape'
    ? 'Esc'
    : (normalized.key === ' ' ? 'Space' : normalized.key);
  return [...modifiers, key].join('+');
};

/**
 * Matches one exact configured shortcut. Unspecified modifiers are false.
 * Callers may explicitly permit an extra ownership-override modifier.
 */
export const matchesStructuralShortcut = matchesShortcut;

const getEventPath = event => {
  if (typeof event.composedPath === 'function') {
    const path = event.composedPath();
    if (path.length) return path;
  }

  const path = [];
  let current = event.target;
  while (current) {
    path.push(current);
    current = getComposedParent(current);
  }
  return path;
};

const hasEditableContent = element => {
  if (!isElement(element)) return false;
  const value = element.getAttribute('contenteditable');
  return element.isContentEditable ||
    value === '' ||
    value === 'true' ||
    value === 'plaintext-only';
};

const elementKeyOwnership = element => {
  const ownership = {
    all: false,
    arrows: false,
    escape: false,
    character: false,
  };
  if (!isElement(element)) return ownership;

  const declared = [
    element.getAttribute('data-openkeynav-key-owner'),
    element.getAttribute('data-openkeynav-owns-keys'),
  ].filter(Boolean).join(' ').toLowerCase();

  if (declared.includes('all')) {
    return { all: true, arrows: true, escape: true, character: true };
  }
  if (declared.includes('arrow')) ownership.arrows = true;
  if (declared.includes('escape')) ownership.escape = true;
  if (declared.includes('character')) ownership.character = true;

  if (hasEditableContent(element)) {
    ownership.arrows = true;
    ownership.escape = true;
    ownership.character = true;
  }

  const tagName = element.tagName.toLowerCase();
  if (tagName === 'textarea' || tagName === 'select') {
    ownership.arrows = true;
    ownership.escape = true;
    ownership.character = true;
  } else if (tagName === 'input') {
    const type = (element.getAttribute('type') || 'text').toLowerCase();
    if (TEXT_INPUT_TYPES.has(type) || type === 'radio') {
      ownership.arrows = true;
      ownership.escape = true;
      ownership.character = true;
    }
  }

  const role = (element.getAttribute('role') || '').toLowerCase();
  if (ARROW_OWNING_ROLES.has(role)) {
    ownership.arrows = true;
    ownership.character = true;
  }
  if (ESCAPE_OWNING_ROLES.has(role)) ownership.escape = true;

  let openPopover = false;
  try {
    openPopover = element.matches('[popover]:popover-open');
  } catch (error) {
    openPopover = false;
  }
  if (
    (tagName === 'dialog' && element.hasAttribute('open')) ||
    openPopover
  ) {
    ownership.escape = true;
  }

  return ownership;
};

/**
 * Classifies page/widget ownership before OpenKeyNav prevents any key.
 */
export const classifyStructuralKeyOwnership = (event, config = {}) => {
  const path = getEventPath(event);
  const result = {
    all: false,
    arrows: false,
    escape: false,
    character: false,
  };

  path.forEach(node => {
    const ownership = elementKeyOwnership(node);
    result.all = result.all || ownership.all;
    result.arrows = result.arrows || ownership.arrows;
    result.escape = result.escape || ownership.escape;
    result.character = result.character || ownership.character;
  });

  if (typeof config.ownsKey === 'function') {
    const declared = config.ownsKey(event, path);
    if (declared === true) {
      return { all: true, arrows: true, escape: true, character: true };
    }
    if (declared && typeof declared === 'object') {
      result.all = result.all || Boolean(declared.all);
      result.arrows = result.arrows || Boolean(declared.arrows);
      result.escape = result.escape || Boolean(declared.escape);
      result.character = result.character || Boolean(declared.character);
    }
  }

  return result;
};

const resolveValue = (value, details) => (
  typeof value === 'function' ? value(details) : value
);

const contextTargets = context => {
  if (!context) return [];
  return context.targets || context.flattenedTargets || [];
};

const contextChildren = context => {
  if (!context) return [];
  return context.children || [];
};

const contextId = context => context && context.id;

const modelContextById = (model, id) => {
  if (!model || id === null || typeof id === 'undefined') return null;
  if (model.contexts instanceof Map) return model.contexts.get(id) || null;
  if (Array.isArray(model.contexts)) {
    return model.contexts.find(context => context.id === id) || null;
  }
  return model.contexts?.[id] || null;
};

const modelTypedContextById = (model, id) => {
  if (!model || id === null || typeof id === 'undefined') return null;
  if (model.typedContexts instanceof Map) return model.typedContexts.get(id) || null;
  if (Array.isArray(model.typedContexts)) {
    return model.typedContexts.find(context => context.id === id) || null;
  }
  return model.typedContexts?.[id] || null;
};

const directContextForTarget = (model, target) => {
  if (!model || !target) return null;
  const map = model.directContextByTarget || model.targetContexts ||
    model.directContexts;
  if (map instanceof Map) {
    const value = map.get(target);
    return typeof value === 'object' ? value : modelContextById(model, value);
  }
  if (typeof model.getDirectContext === 'function') {
    return model.getDirectContext(target);
  }
  return null;
};

const structuralContextForElement = (model, element) => {
  if (!model || !element) return null;

  const direct = directContextForTarget(model, element);
  if (direct) return direct;

  const contexts = modelStructuralContexts(model);
  const exact = contexts.filter(context => (
    context.boundary === element || context.associatedHeading === element
  ));
  const containing = exact.length ? exact : contexts.filter(context => {
    if (context.visualElements?.includes(element)) return true;
    const boundary = context.boundary;
    return (
      isDocument(boundary) ||
      isShadowRoot(boundary) ||
      isElement(boundary)
    ) && isComposedWithin(boundary, element);
  });

  return containing.sort((left, right) => (
    contextHierarchyLevel(model, right) - contextHierarchyLevel(model, left) ||
    contextTargets(left).length - contextTargets(right).length ||
    contextOrder(left) - contextOrder(right)
  ))[0] || model.rootContext || null;
};

const typedContextsForTarget = (model, target) => {
  if (!model || !target) return [];
  const map = model.typedContextsByTarget || model.targetTypedContexts;
  let values = map instanceof Map ? map.get(target) : null;
  if (!values && typeof model.getTypedContexts === 'function') {
    values = model.getTypedContexts(target);
  }
  return Array.from(values || [])
    .map(value => typeof value === 'object'
      ? value
      : modelTypedContextById(model, value))
    .filter(Boolean);
};

const parentContext = (model, context) => {
  if (!context || !context.parent) return null;
  return typeof context.parent === 'object'
    ? context.parent
    : modelContextById(model, context.parent);
};

const contextHierarchyLevel = (model, context) => {
  let level = 0;
  let current = context;
  const seen = new Set();

  while (current && !seen.has(current)) {
    seen.add(current);
    level += 1;
    current = parentContext(model, current);
  }

  return Math.max(1, level);
};

const normalizeContextChildren = (model, context) => (
  contextChildren(context)
    .map(child => typeof child === 'object' ? child : modelContextById(model, child))
    .filter(Boolean)
);

const modelStructuralContexts = model => {
  if (!model?.contexts) return [];
  if (model.contexts instanceof Map) return Array.from(model.contexts.values());
  if (Array.isArray(model.contexts)) return model.contexts.slice();
  return Object.values(model.contexts);
};

const contextHeadingLevel = context => {
  const level = Number(context?.headingLevel);
  return Number.isInteger(level) && level > 0 ? level : null;
};

const contextOrder = context => {
  const order = Number(context?.order);
  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER;
};

/**
 * Heading-backed contexts use the authored heading level as their horizontal
 * lane, regardless of inferred container ancestry. Contexts without a heading
 * level use ordinary structural siblings.
 */
const horizontalContextPeers = (model, context) => {
  const headingLevel = contextHeadingLevel(context);
  const structuralParent = parentContext(model, context);
  const contexts = headingLevel === null
    ? normalizeContextChildren(model, structuralParent)
    : modelStructuralContexts(model).filter(candidate => (
      contextHeadingLevel(candidate) === headingLevel
    ));

  return {
    headingLevel,
    contexts: contexts
      .filter(candidate => contextTargets(candidate).length > 0)
      .sort((left, right) => (
        contextOrder(left) - contextOrder(right) ||
        String(contextId(left)).localeCompare(String(contextId(right)))
      )),
  };
};

/**
 * Finds the next page-forward context. A heading-backed context advances by
 * authored heading level; an unheaded context advances by inferred structural
 * depth.
 */
const nextNarrowFallbackContext = (model, context) => {
  const headingLevel = contextHeadingLevel(context);
  if (headingLevel !== null && headingLevel >= 6) return null;

  const orderedContexts = modelStructuralContexts(model)
    .filter(candidate => contextTargets(candidate).length > 0)
    .sort((left, right) => (
      contextOrder(left) - contextOrder(right) ||
      String(contextId(left)).localeCompare(String(contextId(right)))
    ));
  const currentIndex = orderedContexts.indexOf(context);
  const followingContexts = currentIndex >= 0
    ? orderedContexts.slice(currentIndex + 1)
    : orderedContexts;

  if (headingLevel !== null) {
    return followingContexts.find(candidate => (
      contextHeadingLevel(candidate) === headingLevel + 1
    )) || null;
  }

  const hierarchyLevel = contextHierarchyLevel(model, context);
  return followingContexts.find(candidate => (
    contextHeadingLevel(candidate) === null &&
    contextHierarchyLevel(model, candidate) === hierarchyLevel + 1
  )) || null;
};

const targetName = target => {
  if (!target) return '';

  if (hasAriaHiddenAncestor(target)) {
    return target.tagName ? target.tagName.toLowerCase() : 'target';
  }

  const explicitName = getExplicitAccessibleName(target);
  if (explicitName) return explicitName;

  const labelText = Array.from(target.labels || [])
    .map(label => normalizeText(label.textContent))
    .filter(Boolean)
    .join(' ');
  if (labelText) return labelText;

  const value = target.getAttribute?.('title') ||
    target.getAttribute?.('name') ||
    target.textContent;
  const normalized = normalizeText(value);
  return normalized.slice(0, 80) ||
    target.tagName?.toLowerCase() ||
    'target';
};

const topmostNativeModal = documentObject => {
  if (!documentObject?.querySelectorAll) return null;
  try {
    const modals = Array.from(documentObject.querySelectorAll('dialog:modal'));
    const focused = getDeepActiveElement(documentObject);
    const focusedModals = modals.filter(modal => isComposedWithin(modal, focused));
    if (focusedModals.length) {
      return focusedModals[focusedModals.length - 1];
    }
    return modals[modals.length - 1] || null;
  } catch (error) {
    return null;
  }
};

const resolveSelectorRoot = (value, documentObject) => {
  if (typeof value !== 'string') return value;
  return documentObject.querySelector(value);
};

const openShadowRootsWithin = root => {
  const roots = new Set();

  const visit = scope => {
    if (isShadowRoot(scope)) roots.add(scope);
    if (!scope?.querySelectorAll) return;
    scope.querySelectorAll('*').forEach(element => {
      if (element.shadowRoot) visit(element.shadowRoot);
    });
  };

  visit(root);
  return roots;
};

const mutationBelongsOnlyToGeneratedUI = mutation => {
  const changedNodes = [
    ...Array.from(mutation.addedNodes || []),
    ...Array.from(mutation.removedNodes || []),
  ];
  const candidates = changedNodes.length ? changedNodes : [mutation.target];
  return candidates.length > 0 && candidates.every(node => {
    const element = isElement(node)
      ? node
      : (node.parentElement || mutation.target);
    return element && isOpenKeyNavGeneratedUI(element);
  });
};

const elementClientRects = element => {
  if (!element?.getBoundingClientRect) return [];
  let rects = [];
  if (typeof element.getClientRects === 'function') {
    rects = Array.from(element.getClientRects());
  }
  if (!rects.length) rects = [element.getBoundingClientRect()];
  return rects.filter(rect => (
    [rect.left, rect.top, rect.right, rect.bottom].every(Number.isFinite) &&
    rect.right > rect.left &&
    rect.bottom > rect.top
  ));
};

const unionClientRects = rects => {
  if (!rects.length) return null;
  return rects.reduce((union, rect) => ({
    left: Math.min(union.left, rect.left),
    top: Math.min(union.top, rect.top),
    right: Math.max(union.right, rect.right),
    bottom: Math.max(union.bottom, rect.bottom),
  }), {
    left: rects[0].left,
    top: rects[0].top,
    right: rects[0].right,
    bottom: rects[0].bottom,
  });
};

export class StructuralNavigationController {
  constructor(openKeyNav) {
    this.openKeyNav = openKeyNav;
    this.document = typeof document === 'undefined' ? null : document;
    this.root = null;
    this.model = null;
    this.targets = [];
    this.targetSet = new Set();
    this.currentTarget = null;
    this.activeStructuralContext = null;
    this.activeTypedContext = null;
    this.statusDismissed = false;
    this.dirty = true;
    this.observer = null;
    this.observedShadowRoots = new Set();
    this.focusSyncToken = 0;
    this.contextIndicatorElement = null;
    this.contextIndicatorFrame = null;
    this.contextIndicatorResizeObserver = null;
    this.contextIndicatorObservedElements = new Set();

    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleMutations = this.handleMutations.bind(this);
    this.handleSlotChange = this.handleSlotChange.bind(this);
    this.invalidate = this.invalidate.bind(this);
    this.scheduleContextIndicatorUpdate =
      this.scheduleContextIndicatorUpdate.bind(this);
  }

  get config() {
    return this.openKeyNav.config.modesConfig.structuralNavigation;
  }

  get active() {
    return Boolean(this.openKeyNav.config.modes.structuralNavigation.value);
  }

  resolveActiveRoot() {
    const details = {
      document: this.document,
      openKeyNav: this.openKeyNav,
      activeElement: getDeepActiveElement(this.document),
    };
    const configured = resolveSelectorRoot(
      resolveValue(this.config.activeRoot, details),
      this.document
    );
    const customRoot = (
      isDocument(configured) ||
      (isShadowRoot(configured) && configured.host.isConnected) ||
      (isElement(configured) && configured.isConnected)
    ) ? configured : null;
    const modal = topmostNativeModal(this.document);

    if (!modal) return customRoot || this.document;
    if (
      customRoot &&
      customRoot !== this.document &&
      isComposedWithin(modal, customRoot)
    ) {
      return customRoot;
    }
    return modal;
  }

  resolveContributions(value) {
    const details = {
      root: this.root,
      targets: this.targets.slice(),
      openKeyNav: this.openKeyNav,
    };
    const resolved = resolveValue(value, details);
    return Array.from(resolved || []);
  }

  activate() {
    if (
      !this.document ||
      !this.openKeyNav.meta.enabled.value ||
      !this.config.enabled
    ) {
      return false;
    }
    if (this.active) {
      this.openKeyNav.clearStatus(STRUCTURAL_EXIT_STATUS_CHANNEL);
      this.document.addEventListener('focusin', this.handleFocusIn, true);
      this.document.addEventListener('change', this.invalidate, true);
      this.document.addEventListener('toggle', this.invalidate, true);
      this.document.addEventListener('beforetoggle', this.invalidate, true);
      this.document.defaultView?.addEventListener('popstate', this.invalidate);
      this.connectContextIndicatorListeners();
      this.refresh();
      this.updateStatus('Structural navigation active.');
      return true;
    }

    if (
      this.openKeyNav.config.modes.clicking.value ||
      this.openKeyNav.config.modes.moving.value ||
      this.openKeyNav.config.modes.menu.value
    ) {
      this.openKeyNav.removeOverlays(true);
    }

    this.openKeyNav.config.modes.structuralNavigation.value = true;
    this.statusDismissed = false;
    this.openKeyNav.clearStatus(STRUCTURAL_EXIT_STATUS_CHANNEL);
    this.dirty = true;
    this.document.addEventListener('focusin', this.handleFocusIn, true);
    this.document.addEventListener('change', this.invalidate, true);
    this.document.addEventListener('toggle', this.invalidate, true);
    this.document.addEventListener('beforetoggle', this.invalidate, true);
    this.document.defaultView?.addEventListener('popstate', this.invalidate);
    this.connectContextIndicatorListeners();
    this.refresh();
    this.synchronizeFocus({ preserveRoute: false, announce: false, refresh: false });
    this.updateStatus('Structural navigation active.');
    return true;
  }

  deactivate({ announce = true } = {}) {
    if (
      !this.active &&
      !this.model &&
      !this.observer &&
      !this.openKeyNav.getStatusElement(STRUCTURAL_STATUS_CHANNEL) &&
      !this.contextIndicatorElement
    ) {
      return false;
    }

    const statusConfig = this.config.status || {};
    const statusWasDismissed = this.statusDismissed;
    const configuredExitDuration = Number(
      this.openKeyNav.config.notifications.duration
    );
    const exitDuration = (
      Number.isFinite(configuredExitDuration) &&
      configuredExitDuration > 0
    ) ? configuredExitDuration : 3000;
    const announceExit = Boolean(
      announce &&
      statusConfig.enabled &&
      statusConfig.announcements !== false
    );
    const exitHost = this.root;

    this.openKeyNav.config.modes.structuralNavigation.value = false;
    this.document?.removeEventListener('focusin', this.handleFocusIn, true);
    this.document?.removeEventListener('change', this.invalidate, true);
    this.document?.removeEventListener('toggle', this.invalidate, true);
    this.document?.removeEventListener('beforetoggle', this.invalidate, true);
    this.document?.defaultView?.removeEventListener('popstate', this.invalidate);
    this.disconnectContextIndicatorListeners();
    this.disconnectObservers();
    this.openKeyNav.clearStatus(STRUCTURAL_STATUS_CHANNEL);
    this.openKeyNav.clearStatus(STRUCTURAL_EXIT_STATUS_CHANNEL);
    this.removeContextIndicator();
    this.root = null;
    this.model = null;
    this.targets = [];
    this.targetSet.clear();
    this.currentTarget = null;
    this.activeStructuralContext = null;
    this.activeTypedContext = null;
    this.statusDismissed = false;
    this.dirty = true;
    this.focusSyncToken += 1;

    if (announceExit) {
      this.openKeyNav.setStatus(
        STRUCTURAL_EXIT_STATUS_CHANNEL,
        'Structural navigation off.',
        {
          className: 'openKeyNav-structural-exit-status',
          ui: 'structural-status',
          politeness: 'polite',
          visible:
            statusConfig.visible !== false && !statusWasDismissed,
          duration: exitDuration,
          toolName: this.openKeyNav.config.notifications.displayToolName,
          host: exitHost,
        }
      );
    }
    return true;
  }

  handleKeyDown(event) {
    if (
      !this.document ||
      !this.openKeyNav.meta.enabled.value ||
      !this.config.enabled ||
      event.isComposing ||
      event.keyCode === 229
    ) {
      return false;
    }

    const ownership = classifyStructuralKeyOwnership(event, this.config);
    const activationShortcut = { key: this.openKeyNav.config.keys.structuralNavigation };

    if (!this.active) {
      if (
        this.openKeyNav.config.modes.clicking.value ||
        this.openKeyNav.config.modes.moving.value ||
        this.openKeyNav.config.modes.menu.value ||
        ownership.character ||
        !matchesStructuralShortcut(event, activationShortcut)
      ) {
        return false;
      }

      preventAcceptedCommand(event);
      this.activate();
      return true;
    }

    if (!this.model) this.activate();

    const defaultExit = {
      key: this.openKeyNav.config.keys.structuralNavigation,
      altKey: true,
    };
    const exitShortcut = normalizeShortcut(this.config.exitCommand) || defaultExit;
    const configuredExit = matchesStructuralShortcut(event, exitShortcut);
    const foregroundModeActive = Boolean(
      this.openKeyNav.config.modes.clicking.value ||
      this.openKeyNav.config.modes.moving.value ||
      this.openKeyNav.config.modes.menu.value
    );

    // Click, Move, and menu are temporary layers over structural navigation.
    // Their keystrokes take priority until they finish. The deliberately
    // configured structural exit remains available (Alt+R by default).
    if (foregroundModeActive) {
      if (configuredExit) {
        preventAcceptedCommand(event);
        this.deactivate();
        return true;
      }
      return false;
    }

    const plainToggle = matchesStructuralShortcut(event, activationShortcut);
    const openKeyNavExit = matchesStructuralShortcut(event, {
      key: this.openKeyNav.config.keys.escape,
    });
    const safeEscape = (
      this.config.escapeExits &&
      event.key === 'Escape' &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !ownership.escape
    );

    if (
      configuredExit ||
      safeEscape ||
      ((plainToggle || openKeyNavExit) && !ownership.character)
    ) {
      preventAcceptedCommand(event);
      this.deactivate();
      return true;
    }

    const statusConfig = this.config.status || {};
    const dismissShortcut = normalizeShortcut(statusConfig.dismissCommand);
    const dismissIsArrowKey = event.key.startsWith('Arrow');
    const dismissIsCharacterKey = event.key.length === 1;
    const pageOwnsDismissShortcut = Boolean(
      ownership.all ||
      (event.key === 'Escape' && ownership.escape) ||
      (dismissIsArrowKey && ownership.arrows) ||
      (dismissIsCharacterKey && ownership.character)
    );
    const dismissStatus = Boolean(
      dismissShortcut &&
      statusConfig.enabled !== false &&
      statusConfig.visible !== false &&
      !this.statusDismissed &&
      this.openKeyNav.getStatusElement(STRUCTURAL_STATUS_CHANNEL) &&
      !pageOwnsDismissShortcut &&
      matchesStructuralShortcut(event, dismissShortcut)
    );
    if (dismissStatus) {
      preventAcceptedCommand(event);
      this.statusDismissed = true;
      this.updateStatus('Status closed.');
      return true;
    }

    if (
      event.key === 'Tab' ||
      event.key === 'Enter' ||
      event.key === ' ' ||
      event.key === 'Spacebar' ||
      event.key === 'Escape'
    ) {
      return false;
    }

    const isArrowKey = event.key.startsWith('Arrow');
    const isCharacterKey = event.key.length === 1;
    const ownsArrow = isArrowKey && ownership.arrows;
    const configuredOverrideModifier = this.config.overrideModifier;
    const overrideModifier = MODIFIER_KEYS.includes(configuredOverrideModifier)
      ? configuredOverrideModifier
      : null;
    const overridePressed = Boolean(
      overrideModifier && event[overrideModifier]
    );
    const overridesArrowOwnership = ownsArrow && overridePressed;
    if (
      ownership.all ||
      (ownsArrow && !overridesArrowOwnership) ||
      (isCharacterKey && ownership.character)
    ) {
      return false;
    }

    const commandEntries = Object.entries(this.config.commands || {});
    const exactMatch = commandEntries.find(([, shortcut]) => (
      matchesStructuralShortcut(
        event,
        shortcut
      )
    ));
    // Option/Alt is an ownership override, not part of the structural arrow
    // chord. Once held, it may stay held as focus leaves a widget. Exact
    // bindings still win, and explicit modifier requirements remain exact.
    const matched = exactMatch || (
      isArrowKey && overridePressed
        ? commandEntries.find(([, shortcut]) => (
          matchesStructuralShortcut(event, shortcut, {
            allowedExtraModifiers: [overrideModifier],
          })
        ))
        : null
    );
    if (!matched) return false;

    preventAcceptedCommand(event);
    this.execute(matched[0]);
    return true;
  }

  execute(command) {
    if (!this.active || !Object.values(STRUCTURAL_NAVIGATION_COMMANDS).includes(command)) {
      return false;
    }

    // A newly accepted command supersedes any settled-focus callback queued by
    // an earlier command. The command synchronizes current focus immediately.
    this.focusSyncToken += 1;
    this.refresh();
    this.synchronizeFocus({ preserveRoute: true, announce: false, refresh: false });

    switch (command) {
      case STRUCTURAL_NAVIGATION_COMMANDS.previousTarget:
        this.moveTarget(-1);
        break;
      case STRUCTURAL_NAVIGATION_COMMANDS.nextTarget:
        this.moveTarget(1);
        break;
      case STRUCTURAL_NAVIGATION_COMMANDS.previousSiblingContext:
        this.moveSiblingContext(-1);
        break;
      case STRUCTURAL_NAVIGATION_COMMANDS.nextSiblingContext:
        this.moveSiblingContext(1);
        break;
      case STRUCTURAL_NAVIGATION_COMMANDS.broadenContext:
        this.broadenContext();
        break;
      case STRUCTURAL_NAVIGATION_COMMANDS.narrowContext:
        this.narrowContext();
        break;
      case STRUCTURAL_NAVIGATION_COMMANDS.previousPeerContext:
        this.cyclePeerContext(-1);
        break;
      case STRUCTURAL_NAVIGATION_COMMANDS.nextPeerContext:
        this.cyclePeerContext(1);
        break;
      default:
        return false;
    }
    return true;
  }

  refresh() {
    if (!this.active) return false;

    const resolvedRoot = this.resolveActiveRoot();
    if (resolvedRoot !== this.root) {
      this.root = resolvedRoot;
      this.dirty = true;
    }
    if (!this.dirty && this.model) return false;

    const previousModel = this.model;
    const previousStructuralId = contextId(this.activeStructuralContext);
    const previousTypedId = contextId(this.activeTypedContext);
    const previousTarget = this.currentTarget;

    const targetFilter = typeof this.config.targetFilter === 'function'
      ? target => this.config.targetFilter(target, {
        root: this.root,
        openKeyNav: this.openKeyNav,
      })
      : null;

    this.targets = discoverTabbableTargets(this.root, {
      displayCheck: this.config.displayCheck || 'full',
      getShadowRoot: true,
      includeProgrammatic: Boolean(this.config.includeProgrammatic),
      targetFilter,
    });
    this.targetSet = new Set(this.targets);

    this.model = buildStructuralModel({
      root: this.root,
      targets: this.targets,
      structuralContexts: this.resolveContributions(this.config.structuralContexts),
      typedContexts: this.resolveContributions(this.config.typedContexts),
      previousModel,
    });

    this.dirty = false;
    this.reconnectObservers();

    const focused = getDeepActiveElement(this.root);
    this.currentTarget = this.targetSet.has(focused)
      ? focused
      : (this.targetSet.has(previousTarget) ? previousTarget : null);

    const preservedStructural = modelContextById(this.model, previousStructuralId);
    const direct = directContextForTarget(this.model, this.currentTarget);
    this.activeStructuralContext = (
      preservedStructural &&
      (!this.currentTarget || contextTargets(preservedStructural).includes(this.currentTarget))
    ) ? preservedStructural : (direct || this.model.rootContext);

    const preservedTyped = modelTypedContextById(this.model, previousTypedId);
    this.activeTypedContext = (
      preservedTyped &&
      this.currentTarget &&
      contextTargets(preservedTyped).includes(this.currentTarget)
    ) ? preservedTyped : null;

    this.scheduleContextIndicatorUpdate();
    return true;
  }

  synchronizeFocus({
    preserveRoute = true,
    announce = true,
    refresh = true,
  } = {}) {
    if (!this.active) return;
    if (refresh) this.refresh();

    const focused = getDeepActiveElement(this.root);
    if (!this.targetSet.has(focused)) {
      this.currentTarget = null;
      this.activeTypedContext = null;
      const ambientDocumentFocus = Boolean(
        focused === this.document?.body ||
        focused === this.document?.documentElement
      );
      if (!ambientDocumentFocus) {
        this.activeStructuralContext = structuralContextForElement(
          this.model,
          focused
        ) || this.activeStructuralContext || this.model?.rootContext || null;
      } else if (!this.activeStructuralContext) {
        this.activeStructuralContext = this.model?.rootContext || null;
      }
      if (announce) this.updateStatus();
      return;
    }

    const hadCurrentTarget = Boolean(this.currentTarget);
    this.currentTarget = focused;
    const direct = directContextForTarget(this.model, focused) || this.model.rootContext;

    if (
      this.activeTypedContext &&
      !contextTargets(this.activeTypedContext).includes(focused)
    ) {
      this.activeTypedContext = null;
    }

    if (!this.activeTypedContext) {
      const routeStillContainsTarget = preserveRoute &&
        hadCurrentTarget &&
        this.activeStructuralContext &&
        contextTargets(this.activeStructuralContext).includes(focused);
      if (!routeStillContainsTarget) this.activeStructuralContext = direct;
    }

    if (announce) this.updateStatus();
  }

  handleFocusIn() {
    if (!this.active) return;
    const token = ++this.focusSyncToken;
    setTimeout(() => {
      if (this.active && token === this.focusSyncToken) {
        this.synchronizeFocus({ preserveRoute: true });
      }
    }, 0);
  }

  handleMutations(mutations) {
    if (!this.active) return;
    if (mutations.every(mutationBelongsOnlyToGeneratedUI)) return;
    this.dirty = true;
    this.scheduleContextIndicatorUpdate();
  }

  invalidate() {
    if (this.active) {
      this.dirty = true;
      this.scheduleContextIndicatorUpdate();
    }
  }

  handleSlotChange(event) {
    if (isOpenKeyNavGeneratedUI(event.target)) return;
    this.dirty = true;
    this.scheduleContextIndicatorUpdate();
  }

  reconnectObservers() {
    this.disconnectObservers();
    if (typeof MutationObserver === 'undefined') return;

    this.observer = new MutationObserver(this.handleMutations);
    const documentRoot = this.document.documentElement;
    if (documentRoot) {
      this.observer.observe(documentRoot, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [
          'aria-hidden',
          'aria-label',
          'aria-labelledby',
          'aria-level',
          'aria-modal',
          'checked',
          'class',
          'contenteditable',
          'controls',
          'disabled',
          'href',
          'hidden',
          'id',
          'inert',
          'name',
          'open',
          'popover',
          'role',
          'style',
          'tabindex',
          'type',
        ],
      });
    }

    this.observedShadowRoots = openShadowRootsWithin(this.root);
    this.observedShadowRoots.forEach(shadowRoot => {
      this.observer.observe(shadowRoot, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [
          'aria-hidden',
          'aria-label',
          'aria-labelledby',
          'aria-level',
          'aria-modal',
          'checked',
          'class',
          'contenteditable',
          'controls',
          'disabled',
          'href',
          'hidden',
          'id',
          'inert',
          'name',
          'open',
          'popover',
          'role',
          'style',
          'tabindex',
          'type',
        ],
      });
      shadowRoot.addEventListener('slotchange', this.handleSlotChange);
    });
  }

  disconnectObservers() {
    this.observer?.disconnect();
    this.observer = null;
    this.observedShadowRoots.forEach(shadowRoot => {
      shadowRoot.removeEventListener('slotchange', this.handleSlotChange);
    });
    this.observedShadowRoots.clear();
  }

  activeSequence() {
    return contextTargets(
      this.activeTypedContext || this.activeStructuralContext
    ).filter(target => this.targetSet.has(target) && target.isConnected);
  }

  moveTarget(direction) {
    const sequence = this.activeSequence();
    if (!sequence.length) {
      this.updateStatus('No targets are available in this context.');
      return;
    }

    const currentIndex = sequence.indexOf(this.currentTarget);
    const nextIndex = currentIndex < 0
      ? (direction > 0 ? 0 : sequence.length - 1)
      : currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= sequence.length) {
      this.updateStatus(direction > 0
        ? 'End of this context.'
        : 'Start of this context.');
      return;
    }

    this.focusTarget(sequence[nextIndex]);
  }

  focusTarget(target) {
    if (!target || !this.targetSet.has(target) || !target.isConnected) {
      this.dirty = true;
      this.updateStatus('That target is no longer available.');
      return;
    }

    this.currentTarget = target;
    this.openKeyNav.focus(target);
    this.updateStatus();

    const token = ++this.focusSyncToken;
    setTimeout(() => {
      if (this.active && token === this.focusSyncToken) {
        this.synchronizeFocus({ preserveRoute: true });
      }
    }, 0);
  }

  moveSiblingContext(direction) {
    this.useStructuralRoute();

    const {
      contexts: peers,
      headingLevel,
    } = horizontalContextPeers(
      this.model,
      this.activeStructuralContext
    );
    const currentIndex = peers.indexOf(this.activeStructuralContext);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= peers.length) {
      const relation = headingLevel === null
        ? 'sibling context'
        : `peer context at heading level ${headingLevel}`;
      this.updateStatus(
        direction > 0
          ? `No next ${relation}.`
          : `No previous ${relation}.`
      );
      return;
    }

    const peer = peers[nextIndex];
    const target = contextTargets(peer)[0];

    this.activeStructuralContext = peer;
    this.activeTypedContext = null;
    this.focusTarget(target);
  }

  broadenContext() {
    this.useStructuralRoute();

    const parent = parentContext(this.model, this.activeStructuralContext);
    if (!parent) {
      this.updateStatus('Already at the broadest context.');
      return;
    }
    this.activeStructuralContext = parent;
    this.updateStatus();
  }

  narrowContext() {
    this.useStructuralRoute();
    const activeContext = this.activeStructuralContext || this.model.rootContext;
    const child = this.currentTarget
      ? normalizeContextChildren(this.model, activeContext)
        .find(context => contextTargets(context).includes(this.currentTarget))
      : null;
    if (child) {
      this.activeStructuralContext = child;
      this.updateStatus();
      return;
    }

    const headingLevel = contextHeadingLevel(activeContext);
    if (headingLevel !== null && headingLevel >= 6) {
      this.updateStatus('Already at heading level 6.');
      return;
    }

    const fallback = nextNarrowFallbackContext(this.model, activeContext);
    if (!fallback) {
      this.updateStatus(headingLevel === null
        ? `No next context at hierarchy level ${contextHierarchyLevel(
          this.model,
          activeContext
        ) + 1}.`
        : `No next H${headingLevel + 1} context.`);
      return;
    }

    this.activeStructuralContext = fallback;
    this.activeTypedContext = null;
    this.focusTarget(contextTargets(fallback)[0]);
  }

  cyclePeerContext(direction) {
    if (!this.currentTarget) {
      this.updateStatus('No current target has an alternate typed context.');
      return;
    }

    const typed = typedContextsForTarget(this.model, this.currentTarget);
    if (!typed.length) {
      this.updateStatus('No alternate typed context is available.');
      return;
    }

    const ring = [null, ...typed];
    const currentIndex = this.activeTypedContext
      ? ring.findIndex(context => contextId(context) === contextId(this.activeTypedContext))
      : 0;
    const normalizedIndex = currentIndex < 0 ? 0 : currentIndex;
    const nextIndex = (normalizedIndex + direction + ring.length) % ring.length;
    this.activeTypedContext = ring[nextIndex];

    if (!this.activeTypedContext) {
      this.activeStructuralContext =
        directContextForTarget(this.model, this.currentTarget) ||
        this.model.rootContext;
    }
    this.updateStatus();
  }

  useStructuralRoute() {
    if (!this.activeTypedContext) return;
    this.activeTypedContext = null;
    this.activeStructuralContext =
      directContextForTarget(this.model, this.currentTarget) ||
      this.activeStructuralContext ||
      this.model.rootContext;
  }

  connectContextIndicatorListeners() {
    const view = this.document?.defaultView;
    view?.addEventListener('scroll', this.scheduleContextIndicatorUpdate, true);
    view?.addEventListener('resize', this.scheduleContextIndicatorUpdate);
  }

  disconnectContextIndicatorListeners() {
    const view = this.document?.defaultView;
    view?.removeEventListener('scroll', this.scheduleContextIndicatorUpdate, true);
    view?.removeEventListener('resize', this.scheduleContextIndicatorUpdate);
    if (
      this.contextIndicatorFrame !== null &&
      typeof view?.cancelAnimationFrame === 'function'
    ) {
      view.cancelAnimationFrame(this.contextIndicatorFrame);
    }
    this.contextIndicatorFrame = null;
    this.contextIndicatorResizeObserver?.disconnect();
    this.contextIndicatorResizeObserver = null;
    this.contextIndicatorObservedElements.clear();
  }

  scheduleContextIndicatorUpdate() {
    if (!this.active) return;
    const view = this.document?.defaultView;
    if (typeof view?.requestAnimationFrame !== 'function') {
      this.updateContextIndicator();
      return;
    }
    if (this.contextIndicatorFrame !== null) return;
    this.contextIndicatorFrame = view.requestAnimationFrame(() => {
      this.contextIndicatorFrame = null;
      this.updateContextIndicator();
    });
  }

  contextIndicatorHost() {
    const activeModal = topmostNativeModal(this.document);
    if (activeModal && this.root === activeModal) return activeModal;
    return this.document?.body || this.document?.documentElement || null;
  }

  ensureContextIndicator() {
    if (!this.active || this.config.contextIndicator?.enabled === false) return;
    if (!this.contextIndicatorElement) {
      const element = this.document.createElement('div');
      element.className = 'openKeyNav-structural-context-outline';
      element.setAttribute('data-openkeynav-ui', 'structural-context-outline');
      element.setAttribute('aria-hidden', 'true');
      this.contextIndicatorElement = element;
    }

    const host = this.contextIndicatorHost();
    if (host && this.contextIndicatorElement.parentNode !== host) {
      host.appendChild(this.contextIndicatorElement);
    }
  }

  removeContextIndicator() {
    this.contextIndicatorResizeObserver?.disconnect();
    this.contextIndicatorResizeObserver = null;
    this.contextIndicatorObservedElements.clear();
    this.contextIndicatorElement?.remove();
    this.contextIndicatorElement = null;
  }

  contextIndicatorElements(context) {
    if (!context) return [];
    if (this.activeTypedContext) return contextTargets(context);
    if (context.source === 'heading' && context.visualElements?.length) {
      return context.visualElements;
    }
    if (isShadowRoot(context.boundary)) return [context.boundary.host];
    if (isElement(context.boundary)) return [context.boundary];
    return contextTargets(context);
  }

  observeContextIndicatorElements(elements) {
    const ResizeObserverClass = this.document?.defaultView?.ResizeObserver;
    if (typeof ResizeObserverClass !== 'function') return;
    const nextElements = new Set(elements.filter(isElement));
    if (
      nextElements.size === this.contextIndicatorObservedElements.size &&
      Array.from(nextElements).every(element => (
        this.contextIndicatorObservedElements.has(element)
      ))
    ) {
      return;
    }
    if (!this.contextIndicatorResizeObserver) {
      this.contextIndicatorResizeObserver = new ResizeObserverClass(
        this.scheduleContextIndicatorUpdate
      );
    }
    this.contextIndicatorResizeObserver.disconnect();
    nextElements.forEach(element => {
      this.contextIndicatorResizeObserver.observe(element);
    });
    this.contextIndicatorObservedElements = nextElements;
  }

  updateContextIndicator() {
    if (!this.active || this.config.contextIndicator?.enabled === false) {
      if (this.contextIndicatorElement) {
        this.contextIndicatorElement.style.display = 'none';
      }
      this.contextIndicatorResizeObserver?.disconnect();
      this.contextIndicatorObservedElements.clear();
      return;
    }

    this.ensureContextIndicator();
    const indicator = this.contextIndicatorElement;
    const context = this.activeTypedContext || this.activeStructuralContext;
    if (!indicator || !context) return;

    const view = this.document.defaultView;
    const viewportWidth = view?.innerWidth || this.document.documentElement?.clientWidth || 0;
    const viewportHeight = view?.innerHeight || this.document.documentElement?.clientHeight || 0;
    let elements = this.contextIndicatorElements(context);
    let rect;

    if (isDocument(context.boundary)) {
      elements = [this.document.documentElement].filter(Boolean);
      rect = {
        left: 0,
        top: 0,
        right: viewportWidth,
        bottom: viewportHeight,
      };
    } else {
      let rects = elements.flatMap(elementClientRects);
      if (!rects.length && isElement(context.boundary)) {
        elements = contextTargets(context);
        rects = elements.flatMap(elementClientRects);
      }
      rect = unionClientRects(rects);
    }

    this.observeContextIndicatorElements(elements);
    if (!rect || !viewportWidth || !viewportHeight) {
      indicator.style.display = 'none';
      return;
    }

    const configuredOffset = Number(this.config.contextIndicator?.offset);
    const offset = Number.isFinite(configuredOffset)
      ? Math.max(0, configuredOffset)
      : 4;
    const left = Math.max(0, rect.left - offset);
    const top = Math.max(0, rect.top - offset);
    const right = Math.min(viewportWidth, rect.right + offset);
    const bottom = Math.min(viewportHeight, rect.bottom + offset);
    if (right <= left || bottom <= top) {
      indicator.style.display = 'none';
      return;
    }

    const configuredWidth = Number(this.config.contextIndicator?.width);
    const width = Number.isFinite(configuredWidth)
      ? Math.max(1, configuredWidth)
      : 3;
    const color = this.config.contextIndicator?.color ||
      this.openKeyNav.config.focus.outlineColor ||
      '#0088cc';
    indicator.style.display = 'block';
    indicator.style.left = `${left}px`;
    indicator.style.top = `${top}px`;
    indicator.style.width = `${right - left}px`;
    indicator.style.height = `${bottom - top}px`;
    indicator.style.border = `${width}px solid ${color}`;
    indicator.dataset.contextId = String(contextId(context) || '');
    indicator.dataset.contextName = context.name || 'Document';
    indicator.dataset.contextType = this.activeTypedContext
      ? (this.activeTypedContext.type || 'typed')
      : 'structural';
  }

  updateStatus(prefix = '', { force = false } = {}) {
    if (!this.active && !force) return;
    if (this.active) this.scheduleContextIndicatorUpdate();
    if (!this.config.status?.enabled) {
      this.openKeyNav.clearStatus(STRUCTURAL_STATUS_CHANNEL);
      return;
    }

    const route = this.activeTypedContext || this.activeStructuralContext;
    const sequence = this.activeSequence();
    const index = sequence.indexOf(this.currentTarget);
    const contextName = route?.name || 'Document';
    const targetDescription = this.currentTarget
      ? `${targetName(this.currentTarget)}, ${index >= 0 ? index + 1 : '?'} of ${sequence.length}`
      : `${sequence.length} available ${sequence.length === 1 ? 'target' : 'targets'}`;
    const hierarchyContext = this.activeTypedContext
      ? (
        directContextForTarget(this.model, this.currentTarget) ||
        this.activeStructuralContext ||
        this.model.rootContext
      )
      : (this.activeStructuralContext || this.model.rootContext);
    const headingLevel = contextHeadingLevel(hierarchyContext);
    const reportedLevel = headingLevel ?? contextHierarchyLevel(
      this.model,
      hierarchyContext
    );
    const hierarchyDescription = this.activeTypedContext
      ? (
        headingLevel === null
          ? `Underlying hierarchy level: ${reportedLevel}.`
          : `Underlying heading level: ${reportedLevel}.`
      )
      : (
        headingLevel === null
          ? `Hierarchy level: ${reportedLevel}.`
          : `Heading level: ${reportedLevel}.`
      );
    const typedContexts = typedContextsForTarget(this.model, this.currentTarget);
    const typedDescription = typedContexts.length
      ? `${typedContexts.length} alternate ${typedContexts.length === 1
        ? 'route'
        : 'routes'} available.`
      : '';
    const dismissLabel = shortcutLabel(this.config.status?.dismissCommand);
    const dismissDescription = (
      dismissLabel &&
      this.config.status?.visible !== false &&
      !this.statusDismissed
    ) ? `${dismissLabel} to close.` : '';
    const contextDescription = this.activeTypedContext
      ? `Typed context: ${contextName}.`
      : `Context: ${contextName}.`;
    const message = [
      prefix,
      contextDescription,
      hierarchyDescription,
      targetDescription ? `${targetDescription}.` : '',
      typedDescription,
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

    this.openKeyNav.setStatus(STRUCTURAL_STATUS_CHANNEL, message, {
      className: 'openKeyNav-structural-status',
      ui: 'structural-status',
      politeness:
        this.config.status.announcements === false ? 'off' : 'polite',
      visible:
        this.config.status.visible !== false && !this.statusDismissed,
      hint: dismissDescription,
      toolName: this.openKeyNav.config.notifications.displayToolName,
      host: this.root,
      data: {
        contextId: String(contextId(route) || ''),
        contextType: this.activeTypedContext
          ? (this.activeTypedContext.type || 'typed')
          : 'structural',
      },
    });
  }

  getState() {
    return {
      active: this.active,
      root: this.root,
      target: this.currentTarget,
      targets: this.targets.slice(),
      model: this.model,
      activeContext: this.activeTypedContext || this.activeStructuralContext,
      activeStructuralContext: this.activeStructuralContext,
      activeTypedContext: this.activeTypedContext,
      statusDismissed: this.statusDismissed,
      dirty: this.dirty,
    };
  }
}
