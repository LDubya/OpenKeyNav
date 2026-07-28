import { buildStructuralModel } from './structuralModel.js';
import {
  discoverTabbableTargets,
  getDeepActiveElement,
  isOpenKeyNavGeneratedUI,
} from './tabbableTargets.js';

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

const MODIFIER_KEYS = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
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

const isElement = node => Boolean(node && node.nodeType === 1);
const isDocument = node => Boolean(node && node.nodeType === 9);
const isShadowRoot = node => Boolean(
  node && node.nodeType === 11 && node.host && isElement(node.host)
);

const composedParent = node => {
  if (!node) return null;
  if (node.assignedSlot) return node.assignedSlot;
  if (isShadowRoot(node)) return node.host;
  return node.parentNode || null;
};

const isWithinRoot = (root, node) => {
  let current = node;
  while (current) {
    if (current === root) return true;
    current = composedParent(current);
  }
  return false;
};

const normalizeShortcut = shortcut => {
  if (!shortcut) return null;
  if (typeof shortcut === 'string') return { key: shortcut };
  if (typeof shortcut === 'object' && typeof shortcut.key === 'string') {
    return shortcut;
  }
  return null;
};

const keysEqual = (left, right) => {
  if (left.length === 1 && right.length === 1) {
    return left.toLowerCase() === right.toLowerCase();
  }
  return left === right;
};

/**
 * Matches one exact configured shortcut. Unspecified modifiers are false.
 * `ignoredModifier` is used only for the deliberate widget override modifier.
 */
export const matchesStructuralShortcut = (
  event,
  shortcut,
  ignoredModifier = null
) => {
  const normalized = normalizeShortcut(shortcut);
  if (!normalized || !keysEqual(event.key, normalized.key)) return false;

  return MODIFIER_KEYS.every(modifier => {
    if (modifier === ignoredModifier) return true;
    return Boolean(event[modifier]) === Boolean(normalized[modifier]);
  });
};

const getEventPath = event => {
  if (typeof event.composedPath === 'function') {
    const path = event.composedPath();
    if (path.length) return path;
  }

  const path = [];
  let current = event.target;
  while (current) {
    path.push(current);
    current = composedParent(current);
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
 * Heading-backed contexts move horizontally by authored heading rank, even
 * when those contexts have different structural parents. Contexts without a
 * heading rank retain ordinary same-parent sibling behavior.
 */
const horizontalContextPeers = (model, context) => {
  const headingLevel = contextHeadingLevel(context);
  const contexts = headingLevel === null
    ? normalizeContextChildren(model, parentContext(model, context))
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

const targetName = target => {
  if (!target) return '';

  let current = target;
  while (current) {
    if (isElement(current) && current.getAttribute('aria-hidden') === 'true') {
      return target.tagName ? target.tagName.toLowerCase() : 'target';
    }
    current = composedParent(current);
  }

  const ariaLabel = target.getAttribute?.('aria-label')?.trim();
  if (ariaLabel) return ariaLabel;

  const labelledBy = target.getAttribute?.('aria-labelledby');
  if (labelledBy) {
    const root = target.getRootNode();
    const labels = labelledBy.split(/\s+/)
      .map(id => root.getElementById?.(id) || target.ownerDocument.getElementById(id))
      .filter(Boolean)
      .map(element => element.textContent.trim())
      .filter(Boolean);
    if (labels.length) return labels.join(' ');
  }

  const labelText = Array.from(target.labels || [])
    .map(label => label.textContent.trim())
    .filter(Boolean)
    .join(' ');
  if (labelText) return labelText;

  const value = target.getAttribute?.('title') ||
    target.getAttribute?.('name') ||
    target.textContent;
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  return normalized.slice(0, 80) ||
    target.tagName?.toLowerCase() ||
    'target';
};

const topmostNativeModal = documentObject => {
  if (!documentObject?.querySelectorAll) return null;
  try {
    const modals = Array.from(documentObject.querySelectorAll('dialog:modal'));
    const focused = getDeepActiveElement(documentObject);
    const focusedModals = modals.filter(modal => isWithinRoot(modal, focused));
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

const preventAcceptedCommand = event => {
  event.preventDefault();
  event.stopPropagation();
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
    this.dirty = true;
    this.observer = null;
    this.observedShadowRoots = new Set();
    this.statusElement = null;
    this.lastStatus = '';
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
      isWithinRoot(modal, customRoot)
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
      this.document.addEventListener('focusin', this.handleFocusIn, true);
      this.document.addEventListener('change', this.invalidate, true);
      this.document.addEventListener('toggle', this.invalidate, true);
      this.document.addEventListener('beforetoggle', this.invalidate, true);
      this.document.defaultView?.addEventListener('popstate', this.invalidate);
      this.connectContextIndicatorListeners();
      this.refresh();
      this.ensureStatus();
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
    this.dirty = true;
    this.document.addEventListener('focusin', this.handleFocusIn, true);
    this.document.addEventListener('change', this.invalidate, true);
    this.document.addEventListener('toggle', this.invalidate, true);
    this.document.addEventListener('beforetoggle', this.invalidate, true);
    this.document.defaultView?.addEventListener('popstate', this.invalidate);
    this.connectContextIndicatorListeners();
    this.refresh();
    this.synchronizeFocus({ preserveRoute: false, announce: false, refresh: false });
    this.ensureStatus();
    this.updateStatus('Structural navigation active.');
    return true;
  }

  deactivate({ announce = true } = {}) {
    if (
      !this.active &&
      !this.model &&
      !this.observer &&
      !this.statusElement &&
      !this.contextIndicatorElement
    ) {
      return false;
    }

    if (announce) {
      this.updateStatus('Structural navigation off.', { force: true });
      if (
        this.config.status?.enabled &&
        this.config.status?.announcements !== false &&
        typeof this.openKeyNav.emitNotification === 'function'
      ) {
        this.openKeyNav.emitNotification('Structural navigation off.');
      }
    }

    this.openKeyNav.config.modes.structuralNavigation.value = false;
    this.document?.removeEventListener('focusin', this.handleFocusIn, true);
    this.document?.removeEventListener('change', this.invalidate, true);
    this.document?.removeEventListener('toggle', this.invalidate, true);
    this.document?.removeEventListener('beforetoggle', this.invalidate, true);
    this.document?.defaultView?.removeEventListener('popstate', this.invalidate);
    this.disconnectContextIndicatorListeners();
    this.disconnectObservers();
    this.statusElement?.remove();
    this.statusElement = null;
    this.removeContextIndicator();
    this.lastStatus = '';
    this.root = null;
    this.model = null;
    this.targets = [];
    this.targetSet.clear();
    this.currentTarget = null;
    this.activeStructuralContext = null;
    this.activeTypedContext = null;
    this.dirty = true;
    this.focusSyncToken += 1;
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
    const plainToggle = matchesStructuralShortcut(event, activationShortcut);
    const configuredExit = matchesStructuralShortcut(event, exitShortcut);
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
    const overrideModifier = this.config.overrideModifier;
    const override = ownsArrow &&
      MODIFIER_KEYS.includes(overrideModifier) &&
      Boolean(event[overrideModifier]);
    if (
      ownership.all ||
      (ownsArrow && !override) ||
      (isCharacterKey && ownership.character)
    ) {
      return false;
    }

    const commandEntries = Object.entries(this.config.commands || {});
    const matched = commandEntries.find(([, shortcut]) => (
      matchesStructuralShortcut(
        event,
        shortcut,
        override ? overrideModifier : null
      )
    ));
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

    this.ensureStatus();
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
      if (!this.activeStructuralContext) {
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
    target.focus();
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

    const { contexts: peers, headingLevel } = horizontalContextPeers(
      this.model,
      this.activeStructuralContext
    );
    const currentIndex = peers.indexOf(this.activeStructuralContext);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= peers.length) {
      const relation = headingLevel === null
        ? 'sibling context'
        : `context at heading level ${headingLevel}`;
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
    this.updateStatus('Broadened context.');
  }

  narrowContext() {
    this.useStructuralRoute();
    if (!this.currentTarget) {
      this.updateStatus('No current target identifies a child context.');
      return;
    }

    const child = normalizeContextChildren(this.model, this.activeStructuralContext)
      .find(context => contextTargets(context).includes(this.currentTarget));
    if (!child) {
      this.updateStatus('No narrower context contains the current target.');
      return;
    }

    this.activeStructuralContext = child;
    this.updateStatus('Narrowed context.');
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
    this.updateStatus(this.activeTypedContext
      ? `Using ${this.activeTypedContext.name}.`
      : 'Using structural context.');
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
      element.style.boxSizing = 'border-box';
      element.style.position = 'fixed';
      element.style.zIndex = '2147483646';
      element.style.pointerEvents = 'none';
      element.style.background = 'transparent';
      element.style.borderRadius = '4px';
      element.style.display = 'none';
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
    const color = this.config.contextIndicator?.color || '#0088cc';
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

  statusHost() {
    if (isShadowRoot(this.root)) return this.root;
    if (
      isElement(this.root) &&
      !['INPUT', 'SELECT', 'TEXTAREA'].includes(this.root.tagName)
    ) {
      return this.root;
    }
    return this.document.body || this.document.documentElement;
  }

  ensureStatus() {
    if (!this.active || !this.config.status?.enabled) return;
    if (!this.statusElement) {
      const element = this.document.createElement('div');
      element.className = 'openKeyNav-structural-status';
      element.setAttribute('data-openkeynav-ui', 'structural-status');
      element.setAttribute('role', 'status');
      element.setAttribute(
        'aria-live',
        this.config.status.announcements === false ? 'off' : 'polite'
      );
      element.setAttribute('aria-atomic', 'true');
      element.style.boxSizing = 'border-box';
      element.style.position = 'fixed';
      element.style.left = '12px';
      element.style.bottom = '12px';
      element.style.zIndex = '2147483647';
      element.style.maxWidth = 'min(34rem, calc(100vw - 24px))';
      element.style.padding = '8px 12px';
      element.style.border = '1px solid #666';
      element.style.borderRadius = '4px';
      element.style.color = '#fff';
      element.style.background = 'rgba(20, 24, 28, .94)';
      element.style.font = '14px/1.35 sans-serif';
      element.style.pointerEvents = 'none';
      if (this.config.status.visible === false) {
        element.style.width = '1px';
        element.style.height = '1px';
        element.style.padding = '0';
        element.style.margin = '-1px';
        element.style.overflow = 'hidden';
        element.style.clip = 'rect(0 0 0 0)';
        element.style.whiteSpace = 'nowrap';
      }
      this.statusElement = element;
    }

    const host = this.statusHost();
    if (host && this.statusElement.parentNode !== host) {
      host.appendChild(this.statusElement);
    }
  }

  updateStatus(prefix = '', { force = false } = {}) {
    if (!this.active && !force) return;
    if (this.active) this.scheduleContextIndicatorUpdate();
    this.ensureStatus();
    if (!this.statusElement) return;

    const route = this.activeTypedContext || this.activeStructuralContext;
    const sequence = this.activeSequence();
    const index = sequence.indexOf(this.currentTarget);
    const contextName = route?.name || 'Document';
    const targetDescription = this.currentTarget
      ? `${targetName(this.currentTarget)}, ${index >= 0 ? index + 1 : '?'} of ${sequence.length}`
      : `${sequence.length} available ${sequence.length === 1 ? 'target' : 'targets'}`;
    const horizontalPeers = horizontalContextPeers(
      this.model,
      this.activeStructuralContext
    );
    const otherHorizontalContexts = horizontalPeers.contexts.filter(context => (
      context !== this.activeStructuralContext
    ));
    const typedContexts = typedContextsForTarget(this.model, this.currentTarget);
    const siblingDescription = otherHorizontalContexts.length
      ? ` ${horizontalPeers.headingLevel === null
        ? 'Sibling contexts'
        : `Same-level contexts (heading level ${horizontalPeers.headingLevel})`}: ${otherHorizontalContexts.map(context => context.name).join(', ')}.`
      : '';
    const typedDescription = typedContexts.length
      ? ` Typed contexts: ${typedContexts.map(context => context.name).join(', ')}.`
      : '';
    const message = [
      prefix,
      `Context: ${contextName}.`,
      targetDescription ? `${targetDescription}.` : '',
      siblingDescription,
      typedDescription,
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

    if (message === this.lastStatus) return;
    this.lastStatus = message;
    this.statusElement.textContent = message;
    this.statusElement.dataset.contextId = String(contextId(route) || '');
    this.statusElement.dataset.contextType = this.activeTypedContext
      ? (this.activeTypedContext.type || 'typed')
      : 'structural';
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
      dirty: this.dirty,
    };
  }
}
