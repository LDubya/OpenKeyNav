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
import {
  clearAssignedKeylabels,
  KEYLABEL_SYMBOLS,
  repositionAssignedKeylabels,
  showAssignedKeylabels,
} from './keylabels.js';
import { effect } from './signals.js';
import { discoverTabbableTargets } from './tabbableTargets.js';

export const STRUCTURAL_NAVIGATION_COMMANDS = Object.freeze({
  previousTarget: 'previousTarget',
  nextTarget: 'nextTarget',
  previousContextStart: 'previousContextStart',
  nextContextStart: 'nextContextStart',
  previousSiblingContext: 'previousSiblingContext',
  nextSiblingContext: 'nextSiblingContext',
  broadenContext: 'broadenContext',
  narrowContext: 'narrowContext',
  previousPeerContext: 'previousPeerContext',
  nextPeerContext: 'nextPeerContext',
});

const STRUCTURAL_STATUS_CHANNEL = 'structural-navigation';
const STRUCTURAL_EXIT_STATUS_CHANNEL = 'structural-navigation-exit';
const STRUCTURAL_KEYLABEL_OWNER = 'structural-navigation';
const STRUCTURAL_KEYLABEL_CLASS = 'openKeyNav-structural-keylabel';
const CONTEXT_INDICATOR_OFFSET = 10;
const CONTEXT_INDICATOR_WIDTH = 2;
const CONTEXT_INDICATOR_CONTRAST_WIDTH = 2;
const HEADING_CONTEXT_ARROW_COMMANDS = new Set([
  STRUCTURAL_NAVIGATION_COMMANDS.previousSiblingContext,
  STRUCTURAL_NAVIGATION_COMMANDS.nextSiblingContext,
  STRUCTURAL_NAVIGATION_COMMANDS.broadenContext,
  STRUCTURAL_NAVIGATION_COMMANDS.narrowContext,
]);
const MODIFIER_KEY_EVENTS = new Set(['Alt', 'Control', 'Meta', 'Shift']);
const NATIVE_SCROLL_KEYS = new Set([
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',
]);
const SPACE_ACTIVATION_ROLES = new Set([
  'button',
  'checkbox',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'switch',
]);
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

const KEYLABEL_MODIFIER_SYMBOLS = Object.freeze({
  altKey: KEYLABEL_SYMBOLS.alt,
  ctrlKey: KEYLABEL_SYMBOLS.control,
  metaKey: KEYLABEL_SYMBOLS.meta,
  shiftKey: KEYLABEL_SYMBOLS.shift,
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

const shortcutSymbols = (shortcut, { extraModifiers = [] } = {}) => {
  const normalized = normalizeShortcut(shortcut);
  if (!normalized) return '';

  const keySymbol = {
    Tab: KEYLABEL_SYMBOLS.tab,
    ArrowLeft: KEYLABEL_SYMBOLS.left,
    ArrowRight: KEYLABEL_SYMBOLS.right,
    ArrowUp: KEYLABEL_SYMBOLS.up,
    ArrowDown: KEYLABEL_SYMBOLS.down,
    Enter: KEYLABEL_SYMBOLS.enter,
    ' ': KEYLABEL_SYMBOLS.space,
    Spacebar: KEYLABEL_SYMBOLS.space,
  }[normalized.key];
  if (!keySymbol) return '';
  const modifierSymbols = [
    ...extraModifiers,
    ...MODIFIER_KEYS.filter(modifier => normalized[modifier]),
  ].filter((modifier, index, modifiers) => (
    MODIFIER_KEYS.includes(modifier) && modifiers.indexOf(modifier) === index
  )).map(modifier => KEYLABEL_MODIFIER_SYMBOLS[modifier]);
  return `${modifierSymbols.join('')}${keySymbol}`;
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

const shortcutEventForTarget = (target, shortcut) => {
  const normalized = normalizeShortcut(shortcut);
  if (!target || !normalized) return null;
  const path = [];
  let current = target;
  while (current) {
    path.push(current);
    current = getComposedParent(current);
  }
  return {
    target,
    key: normalized.key,
    altKey: normalized.altKey,
    ctrlKey: normalized.ctrlKey,
    metaKey: normalized.metaKey,
    shiftKey: normalized.shiftKey,
    composedPath: () => path,
  };
};

const structuralArrowSymbols = (target, shortcut, config) => {
  const event = shortcutEventForTarget(target, shortcut);
  if (!event || !event.key.startsWith('Arrow')) return '';
  const ownership = classifyStructuralKeyOwnership(event, config);
  if (ownership.all) return '';
  if (!ownership.arrows) return shortcutSymbols(shortcut);

  const overrideModifier = MODIFIER_KEYS.includes(config.overrideModifier)
    ? config.overrideModifier
    : null;
  if (!overrideModifier) return '';

  const normalized = normalizeShortcut(shortcut);
  if (
    Object.prototype.hasOwnProperty.call(normalized, overrideModifier) &&
    !normalized[overrideModifier]
  ) {
    return '';
  }

  const extraModifiers = normalized[overrideModifier]
    ? []
    : [overrideModifier];
  const overriddenEvent = {
    ...event,
    [overrideModifier]: true,
  };
  const overriddenOwnership = classifyStructuralKeyOwnership(
    overriddenEvent,
    config
  );
  if (overriddenOwnership.all) return '';
  if (!matchesStructuralShortcut(overriddenEvent, shortcut, {
    allowedExtraModifiers: extraModifiers,
  })) {
    return '';
  }
  return shortcutSymbols(shortcut, { extraModifiers });
};

const activationSymbols = target => {
  if (
    !isElement(target) ||
    target.hasAttribute('disabled') ||
    target.getAttribute('aria-disabled') === 'true'
  ) {
    return [];
  }
  const tagName = target.tagName.toLowerCase();
  const both = [KEYLABEL_SYMBOLS.enter, KEYLABEL_SYMBOLS.space];

  if (tagName === 'button' || tagName === 'summary') return both;
  if (
    (tagName === 'a' || tagName === 'area') &&
    target.hasAttribute('href')
  ) {
    return [KEYLABEL_SYMBOLS.enter];
  }
  if (tagName !== 'input') {
    const role = (target.getAttribute('role') || '').toLowerCase();
    if (role === 'button') return both;
    if (role === 'link') return [KEYLABEL_SYMBOLS.enter];
    if (SPACE_ACTIVATION_ROLES.has(role)) return [KEYLABEL_SYMBOLS.space];
    return [];
  }

  const inputType = (target.getAttribute('type') || 'text').toLowerCase();
  if (['button', 'submit', 'reset', 'image'].includes(inputType)) return both;
  if (['checkbox', 'radio'].includes(inputType)) {
    return [KEYLABEL_SYMBOLS.space];
  }
  return [];
};

const preferredActivationSymbols = target => {
  const symbols = activationSymbols(target);
  return symbols.includes(KEYLABEL_SYMBOLS.enter)
    ? [KEYLABEL_SYMBOLS.enter]
    : symbols;
};

const targetUsesSpaceForActivation = target => {
  return activationSymbols(target).includes(KEYLABEL_SYMBOLS.space);
};

const isNativeKeyboardScroll = (event, ownership, target) => {
  if (
    ownership.all ||
    ownership.arrows ||
    ownership.character ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return false;
  }

  if (event.key === ' ' || event.key === 'Spacebar') {
    return !targetUsesSpaceForActivation(target);
  }

  return !event.shiftKey && NATIVE_SCROLL_KEYS.has(event.key);
};

const radioIsAvailable = (radio, root, displayCheck, targetFilter) => {
  if (
    !radio?.isConnected ||
    radio.type !== 'radio' ||
    !isComposedWithin(root, radio) ||
    radio.closest?.('[inert], [hidden]') ||
    (targetFilter && !targetFilter(radio))
  ) {
    return false;
  }

  try {
    if (radio.matches(':disabled')) return false;
  } catch (error) {
    if (radio.disabled) return false;
  }

  if (displayCheck === 'none') return true;
  const style = radio.ownerDocument?.defaultView?.getComputedStyle?.(radio);
  if (style?.display === 'none' || ['hidden', 'collapse'].includes(style?.visibility)) {
    return false;
  }
  return elementClientRects(radio).length > 0;
};

/**
 * Predicts the browser's native focus movement inside one HTML radio group.
 * These are descriptive hints only; bare arrow events remain browser-owned.
 */
const nativeRadioArrowAssignments = (
  target,
  root,
  displayCheck,
  targetFilter
) => {
  if (
    !isElement(target) ||
    target.tagName.toLowerCase() !== 'input' ||
    target.type !== 'radio' ||
    !target.name
  ) {
    return [];
  }

  const treeRoot = target.getRootNode?.() || target.ownerDocument;
  if (!treeRoot?.querySelectorAll) return [];
  const radios = Array.from(treeRoot.querySelectorAll('input')).filter(radio => (
    radio !== target &&
    radio.type === 'radio' &&
    radio.name === target.name &&
    radio.form === target.form &&
    radioIsAvailable(radio, root, displayCheck, targetFilter)
  ));
  const group = [target, ...radios].sort((left, right) => {
    if (left === right) return 0;
    const position = left.compareDocumentPosition(right);
    return position & 2 ? 1 : -1;
  });
  if (group.length < 2) return [];

  const currentIndex = group.indexOf(target);
  const previous = group[(currentIndex - 1 + group.length) % group.length];
  const next = group[(currentIndex + 1) % group.length];
  if (previous === next) {
    return [
      {
        target: previous,
        symbols: KEYLABEL_SYMBOLS.horizontalAxis,
        command: 'nativeArrowLeft nativeArrowRight',
      },
      {
        target: previous,
        symbols: KEYLABEL_SYMBOLS.verticalAxis,
        command: 'nativeArrowUp nativeArrowDown',
      },
    ];
  }

  return [
    {
      target: previous,
      symbols: KEYLABEL_SYMBOLS.left,
      command: 'nativeArrowLeft',
    },
    {
      target: previous,
      symbols: KEYLABEL_SYMBOLS.up,
      command: 'nativeArrowUp',
    },
    {
      target: next,
      symbols: KEYLABEL_SYMBOLS.right,
      command: 'nativeArrowRight',
    },
    {
      target: next,
      symbols: KEYLABEL_SYMBOLS.down,
      command: 'nativeArrowDown',
    },
  ];
};

const resolveValue = (value, details) => (
  typeof value === 'function' ? value(details) : value
);

const contextTargets = context => {
  if (!context) return [];
  return context.targets || context.flattenedTargets || [];
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
    compareContextSpecificity(model, left, right) ||
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

const contextDescendsFrom = (model, context, possibleAncestor) => {
  let current = parentContext(model, context);
  const seen = new Set();

  while (current && !seen.has(current)) {
    if (current === possibleAncestor) return true;
    seen.add(current);
    current = parentContext(model, current);
  }

  return false;
};

const compareContextSpecificity = (model, left, right) => {
  if (contextDescendsFrom(model, left, right)) return -1;
  if (contextDescendsFrom(model, right, left)) return 1;
  return 0;
};

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

const authoredHeadingForContext = context => {
  if (!context) return null;
  if (isElement(context.associatedHeading)) return context.associatedHeading;
  if (context.source === 'heading' && isElement(context.boundary)) {
    return context.boundary;
  }
  return null;
};

const contextOrder = context => {
  const order = Number(context?.order);
  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER;
};

/**
 * Heading-backed contexts use the authored heading level as their horizontal
 * lane, regardless of inferred container ancestry. Semantic nesting does not
 * create additional levels.
 */
const horizontalContextPeers = (model, context) => {
  const headingLevel = contextHeadingLevel(context);
  const contexts = headingLevel === null
    ? []
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

const headingContextForTarget = (model, target, headingLevel = null) => {
  if (!model || !target) return null;
  return modelStructuralContexts(model)
    .filter(context => (
      contextHeadingLevel(context) !== null &&
      (headingLevel === null || contextHeadingLevel(context) === headingLevel) &&
      contextTargets(context).includes(target)
    ))
    .sort((left, right) => (
      contextHeadingLevel(right) - contextHeadingLevel(left) ||
      compareContextSpecificity(model, left, right) ||
      contextTargets(left).length - contextTargets(right).length ||
      contextOrder(right) - contextOrder(left)
    ))[0] || null;
};

const nextDeeperHeadingContextForTarget = (model, target, context) => {
  const headingLevel = contextHeadingLevel(context);
  if (!model || !target || headingLevel === null || headingLevel >= 6) {
    return null;
  }
  const deeperContexts = modelStructuralContexts(model)
    .filter(candidate => (
      contextHeadingLevel(candidate) > headingLevel &&
      contextOrder(candidate) > contextOrder(context) &&
      contextTargets(candidate).includes(target)
    ));
  const nextHeadingLevel = Math.min(
    ...deeperContexts.map(contextHeadingLevel)
  );
  if (!Number.isFinite(nextHeadingLevel)) return null;

  return deeperContexts
    .filter(candidate => contextHeadingLevel(candidate) === nextHeadingLevel)
    .sort((left, right) => (
      contextOrder(left) - contextOrder(right) ||
      String(contextId(left)).localeCompare(String(contextId(right)))
    ))[0] || null;
};

const headingContextForRoute = (model, context, target) => {
  if (!model || !context) return null;
  if (context === model.rootContext) {
    return headingContextForTarget(model, target);
  }
  if (contextHeadingLevel(context) !== null) return context;

  let ancestor = parentContext(model, context);
  const seen = new Set();
  while (ancestor && !seen.has(ancestor)) {
    if (contextHeadingLevel(ancestor) !== null) return ancestor;
    seen.add(ancestor);
    ancestor = parentContext(model, ancestor);
  }

  return headingContextForTarget(model, target);
};

/**
 * Finds the authored outline parent for a heading-backed context. Walking
 * backward to the nearest lower-level heading prevents inferred DOM container
 * ancestry from skipping the heading level that visually and semantically
 * introduces the current context.
 */
const previousBroaderHeadingContext = (model, context) => {
  const headingLevel = contextHeadingLevel(context);
  if (headingLevel === null || headingLevel <= 1) return null;

  const orderedContexts = modelStructuralContexts(model)
    .sort((left, right) => (
      contextOrder(left) - contextOrder(right) ||
      String(contextId(left)).localeCompare(String(contextId(right)))
    ));
  const currentIndex = orderedContexts.indexOf(context);
  if (currentIndex <= 0) return null;

  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const candidate = orderedContexts[index];
    const candidateHeadingLevel = contextHeadingLevel(candidate);
    if (
      candidateHeadingLevel !== null &&
      candidateHeadingLevel < headingLevel
    ) {
      return contextTargets(candidate).length > 0 ? candidate : null;
    }
  }

  return null;
};

/**
 * Finds the next page-forward context at the closest available deeper
 * authored heading level. Semantic nesting is deliberately excluded from the
 * level model, and skipped heading ranks do not create a dead end.
 */
const nextNarrowFallbackContext = (model, context) => {
  const headingLevel = contextHeadingLevel(context);
  if (headingLevel === null || headingLevel >= 6) return null;

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

  const deeperContexts = followingContexts.filter(candidate => (
    contextHeadingLevel(candidate) > headingLevel
  ));
  const nextHeadingLevel = Math.min(
    ...deeperContexts.map(contextHeadingLevel)
  );
  if (!Number.isFinite(nextHeadingLevel)) return null;

  return deeperContexts.find(candidate => (
    contextHeadingLevel(candidate) === nextHeadingLevel
  )) || null;
};

/**
 * An unassociated region has no heading rank. A vertical command enters the
 * authored heading-level ladder from the requested edge; DOM containment
 * never supplies an implicit starting rank.
 */
const headingEdgeEntryContext = (model, direction) => {
  if (direction === 0) return null;
  const headingContexts = modelStructuralContexts(model)
    .filter(candidate => (
      contextTargets(candidate).length > 0 &&
      contextHeadingLevel(candidate) !== null
    ))
    .sort((left, right) => (
      contextOrder(left) - contextOrder(right) ||
      String(contextId(left)).localeCompare(String(contextId(right)))
    ));
  const headingLevels = headingContexts.map(contextHeadingLevel);
  const destinationLevel = direction < 0
    ? Math.max(...headingLevels)
    : Math.min(...headingLevels);
  if (!Number.isFinite(destinationLevel)) return null;
  const destinations = headingContexts.filter(candidate => (
    contextHeadingLevel(candidate) === destinationLevel
  ));
  return direction < 0
    ? destinations[destinations.length - 1] || null
    : destinations[0] || null;
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
    this.contextIndicatorHeadingLevelElement = null;
    this.contextIndicatorFrame = null;
    this.contextIndicatorResizeObserver = null;
    this.contextIndicatorObservedElements = new Set();
    this.transientContextIndicatorVisible = false;
    this.keylabelUpdateFrame = null;
    this.keylabelUpdateTimer = null;
    this.updatingKeylabels = false;
    this.foregroundModeWasActive = false;

    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleMutations = this.handleMutations.bind(this);
    this.handleSlotChange = this.handleSlotChange.bind(this);
    this.invalidate = this.invalidate.bind(this);
    this.handleModeLayerChange = this.handleModeLayerChange.bind(this);
    this.scheduleContextIndicatorUpdate =
      this.scheduleContextIndicatorUpdate.bind(this);
    this.scheduleKeylabelUpdate = this.scheduleKeylabelUpdate.bind(this);

    // Structural navigation consumes the keylabel renderer as a one-way
    // dependency. Signal changes pause hints under foreground modes and restore
    // them when the structural layer becomes visible again.
    effect(this.handleModeLayerChange);
  }

  get config() {
    return this.openKeyNav.config.modesConfig.structuralNavigation;
  }

  get active() {
    return Boolean(this.openKeyNav.config.modes.structuralNavigation.value);
  }

  get foregroundModeActive() {
    return Boolean(
      this.openKeyNav.config.modes.clicking.value ||
      this.openKeyNav.config.modes.moving.value ||
      this.openKeyNav.config.modes.menu.value
    );
  }

  handleModeLayerChange() {
    const active = this.active;
    const foregroundModeActive = this.foregroundModeActive;
    const resumedFromForeground = (
      this.foregroundModeWasActive && !foregroundModeActive
    );
    this.foregroundModeWasActive = foregroundModeActive;
    if (!active || foregroundModeActive) {
      if (foregroundModeActive) this.clearTransientContextIndicator();
      this.cancelKeylabelUpdate();
      this.clearKeylabels();
      return;
    }
    if (resumedFromForeground && this.dirty) this.refresh();
    if (!this.updatingKeylabels) this.scheduleKeylabelUpdate();
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
    this.cancelKeylabelUpdate();
    this.clearKeylabels();
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
    this.transientContextIndicatorVisible = false;
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
            this.config.debug === true &&
            statusConfig.visible !== false &&
            !statusWasDismissed,
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
    const foregroundModeActive = this.foregroundModeActive;

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
      this.config.debug === true &&
      statusConfig.enabled !== false &&
      statusConfig.visible !== false &&
      !this.statusDismissed &&
      this.openKeyNav.getStatusElement(STRUCTURAL_STATUS_CHANNEL) &&
      !pageOwnsDismissShortcut &&
      matchesStructuralShortcut(event, dismissShortcut)
    );
    if (dismissStatus) {
      preventAcceptedCommand(event);
      this.clearTransientContextIndicator();
      this.statusDismissed = true;
      this.updateStatus('Status closed.');
      return true;
    }

    const contextStartCommand = [
      STRUCTURAL_NAVIGATION_COMMANDS.previousContextStart,
      STRUCTURAL_NAVIGATION_COMMANDS.nextContextStart,
    ].find(command => matchesStructuralShortcut(
      event,
      this.contextStartShortcut(
        command === STRUCTURAL_NAVIGATION_COMMANDS.previousContextStart
          ? -1
          : 1
      )
    ));
    if (contextStartCommand && !ownership.all) {
      preventAcceptedCommand(event);
      this.execute(contextStartCommand);
      return true;
    }

    const focusedTarget = getDeepActiveElement(this.root) || event.target;
    const nativeKeyboardScroll = isNativeKeyboardScroll(
      event,
      ownership,
      focusedTarget
    );
    const configuredScrollCommand = Boolean(
      !ownership.all &&
      !ownership.character &&
      matchesStructuralShortcut(
        event,
        { key: this.openKeyNav.config.keys.scroll },
        { allowedExtraModifiers: ['shiftKey'] }
      )
    );
    const preservesContextIndicator = Boolean(
      nativeKeyboardScroll || configuredScrollCommand
    );

    if (
      event.key === 'Tab' ||
      event.key === 'Enter' ||
      ((event.key === ' ' || event.key === 'Spacebar') &&
        !nativeKeyboardScroll) ||
      event.key === 'Escape'
    ) {
      this.clearTransientContextIndicator();
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
      this.clearTransientContextIndicator();
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
    if (!matched) {
      if (
        !preservesContextIndicator &&
        !MODIFIER_KEY_EVENTS.has(event.key)
      ) {
        this.clearTransientContextIndicator();
      }
      return false;
    }

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
    if (!HEADING_CONTEXT_ARROW_COMMANDS.has(command)) {
      this.clearTransientContextIndicator();
    }

    switch (command) {
      case STRUCTURAL_NAVIGATION_COMMANDS.previousTarget:
        this.moveTarget(-1);
        break;
      case STRUCTURAL_NAVIGATION_COMMANDS.nextTarget:
        this.moveTarget(1);
        break;
      case STRUCTURAL_NAVIGATION_COMMANDS.previousContextStart:
        this.moveContextStart(-1);
        break;
      case STRUCTURAL_NAVIGATION_COMMANDS.nextContextStart:
        this.moveContextStart(1);
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
    const previousActiveContextId = previousTypedId || previousStructuralId;
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

    this.showContextChange(previousActiveContextId);
    this.scheduleContextIndicatorUpdate();
    if (!this.updatingKeylabels) this.scheduleKeylabelUpdate();
    return true;
  }

  synchronizeFocus({
    preserveRoute = true,
    announce = true,
    refresh = true,
  } = {}) {
    if (!this.active) return;
    const previousActiveContextId = contextId(
      this.activeTypedContext || this.activeStructuralContext
    );
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
      this.showContextChange(previousActiveContextId);
      this.scheduleKeylabelUpdate();
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

    this.showContextChange(previousActiveContextId);
    this.scheduleKeylabelUpdate();
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
    this.clearKeylabels();
    this.scheduleKeylabelUpdate();
  }

  invalidate() {
    if (this.active) {
      this.dirty = true;
      this.scheduleContextIndicatorUpdate();
      this.clearKeylabels();
      this.scheduleKeylabelUpdate();
    }
  }

  handleSlotChange(event) {
    if (isOpenKeyNavGeneratedUI(event.target)) return;
    this.dirty = true;
    this.scheduleContextIndicatorUpdate();
    this.clearKeylabels();
    this.scheduleKeylabelUpdate();
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

  activeHeadingContext() {
    const structuralRoute = this.activeTypedContext && this.currentTarget
      ? directContextForTarget(this.model, this.currentTarget)
      : this.activeStructuralContext;
    return headingContextForRoute(
      this.model,
      structuralRoute,
      this.currentTarget
    );
  }

  activeAuthoredHeading() {
    if (!this.active) return null;
    return authoredHeadingForContext(this.activeHeadingContext());
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

  contextStartShortcut(direction) {
    const modifier = this.config.overrideModifier;
    if (!MODIFIER_KEYS.includes(modifier) || modifier === 'shiftKey') {
      return null;
    }

    return {
      key: 'Tab',
      [modifier]: true,
      ...(direction < 0 ? { shiftKey: true } : {}),
    };
  }

  contextStartRoute() {
    const route = [];
    let previousContext = null;

    this.targets
      .filter(target => target.tabIndex >= 0)
      .forEach((target, index) => {
        const context = directContextForTarget(this.model, target) ||
          this.model?.rootContext || null;
        if (context === previousContext) return;
        route.push({ context, target, index });
        previousContext = context;
      });

    return route;
  }

  contextStartDestination(direction) {
    const tabTargets = this.targets.filter(target => target.tabIndex >= 0);
    const route = this.contextStartRoute();
    if (!route.length) return null;

    const currentIndex = tabTargets.indexOf(this.currentTarget);
    if (currentIndex < 0) {
      return direction > 0 ? route[0] : route[route.length - 1];
    }

    let currentRouteIndex = -1;
    for (let index = 0; index < route.length; index += 1) {
      if (route[index].index > currentIndex) break;
      currentRouteIndex = index;
    }
    return route[currentRouteIndex + direction] || null;
  }

  moveContextStart(direction) {
    this.useStructuralRoute();
    const destination = this.contextStartDestination(direction);
    if (!destination) {
      this.updateStatus(direction > 0
        ? 'No next context start.'
        : 'No previous context start.');
      return;
    }

    const previousActiveContextId = contextId(
      this.activeTypedContext || this.activeStructuralContext
    );
    this.activeStructuralContext = destination.context;
    this.activeTypedContext = null;
    this.showContextChange(previousActiveContextId);
    this.focusTarget(destination.target);
  }

  focusTarget(target) {
    if (!target || !this.targetSet.has(target) || !target.isConnected) {
      this.dirty = true;
      this.updateStatus('That target is no longer available.');
      return;
    }

    this.currentTarget = target;
    this.openKeyNav.focus(target, { decorate: false });
    this.updateStatus();

    const token = ++this.focusSyncToken;
    setTimeout(() => {
      if (this.active && token === this.focusSyncToken) {
        this.synchronizeFocus({ preserveRoute: true });
      }
    }, 0);
  }

  selectAuthoredHeading(heading, target) {
    if (!this.active || !heading || !target) return false;
    if (this.dirty || !this.model) this.refresh();

    const context = structuralContextForElement(this.model, heading);
    if (
      contextHeadingLevel(context) === null ||
      !this.targetSet.has(target) ||
      !contextTargets(context).includes(target)
    ) {
      return false;
    }

    this.currentTarget = target;
    this.activeStructuralContext = context;
    this.activeTypedContext = null;
    this.showTransientContextIndicator();
    this.updateStatus();
    this.scheduleKeylabelUpdate();
    return true;
  }

  moveSiblingContext(direction) {
    this.useStructuralRoute();

    const activeContext = this.activeHeadingContext();
    if (!activeContext) {
      this.updateStatus('No authored heading context is active.');
      return;
    }

    const {
      contexts: peers,
      headingLevel,
    } = horizontalContextPeers(
      this.model,
      activeContext
    );
    const currentIndex = peers.indexOf(activeContext);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= peers.length) {
      this.updateStatus(
        direction > 0
          ? `No next peer context at heading level ${headingLevel}.`
          : `No previous peer context at heading level ${headingLevel}.`
      );
      return;
    }

    const peer = peers[nextIndex];
    const target = contextTargets(peer)[0];

    this.showTransientContextIndicator();
    this.activeStructuralContext = peer;
    this.activeTypedContext = null;
    this.focusTarget(target);
  }

  broadenContext() {
    this.useStructuralRoute();

    const activeContext = this.activeHeadingContext();
    if (!activeContext) {
      const previousHeadingLevel = headingEdgeEntryContext(this.model, -1);
      if (!previousHeadingLevel) {
        this.updateStatus('No authored heading level is available.');
        return;
      }
      this.showTransientContextIndicator();
      this.activeStructuralContext = previousHeadingLevel;
      this.activeTypedContext = null;
      this.focusTarget(contextTargets(previousHeadingLevel)[0]);
      return;
    }
    const headingParent = previousBroaderHeadingContext(
      this.model,
      activeContext
    );
    if (!headingParent) {
      this.updateStatus('Already at the broadest heading level.');
      return;
    }
    this.showTransientContextIndicator();
    this.activeStructuralContext = headingParent;
    this.focusTarget(contextTargets(headingParent)[0]);
  }

  narrowContext() {
    this.useStructuralRoute();
    const activeContext = this.activeHeadingContext();
    if (!activeContext) {
      const nextHeadingLevel = headingEdgeEntryContext(this.model, 1);
      if (!nextHeadingLevel) {
        this.updateStatus('No authored heading level is available.');
        return;
      }
      this.showTransientContextIndicator();
      this.activeStructuralContext = nextHeadingLevel;
      this.activeTypedContext = null;
      this.focusTarget(contextTargets(nextHeadingLevel)[0]);
      return;
    }

    const headingLevel = contextHeadingLevel(activeContext);
    const child = this.currentTarget && headingLevel < 6
      ? nextDeeperHeadingContextForTarget(
        this.model,
        this.currentTarget,
        activeContext
      )
      : null;
    if (child) {
      this.showTransientContextIndicator();
      this.activeStructuralContext = child;
      this.updateStatus();
      return;
    }

    if (headingLevel >= 6) {
      this.updateStatus('Already at heading level 6.');
      return;
    }

    const fallback = nextNarrowFallbackContext(this.model, activeContext);
    if (!fallback) {
      this.updateStatus(`No next H${headingLevel + 1} context.`);
      return;
    }

    this.showTransientContextIndicator();
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
    const previousActiveContextId = contextId(
      this.activeTypedContext || this.activeStructuralContext
    );
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
    this.showContextChange(previousActiveContextId);
    this.updateStatus();
  }

  useStructuralRoute() {
    if (!this.activeTypedContext) return;
    const previousActiveContextId = contextId(this.activeTypedContext);
    this.activeTypedContext = null;
    this.activeStructuralContext =
      directContextForTarget(this.model, this.currentTarget) ||
      this.activeStructuralContext ||
      this.model.rootContext;
    this.showContextChange(previousActiveContextId);
  }

  clearKeylabels() {
    clearAssignedKeylabels(this.openKeyNav, STRUCTURAL_KEYLABEL_OWNER);
  }

  cancelKeylabelUpdate() {
    const view = this.document?.defaultView;
    if (
      this.keylabelUpdateFrame !== null &&
      typeof view?.cancelAnimationFrame === 'function'
    ) {
      view.cancelAnimationFrame(this.keylabelUpdateFrame);
    }
    if (this.keylabelUpdateTimer !== null) {
      clearTimeout(this.keylabelUpdateTimer);
    }
    this.keylabelUpdateFrame = null;
    this.keylabelUpdateTimer = null;
  }

  scheduleKeylabelUpdate() {
    if (
      !this.active ||
      this.foregroundModeActive ||
      this.config.keylabels?.enabled === false ||
      this.keylabelUpdateFrame !== null ||
      this.keylabelUpdateTimer !== null
    ) {
      if (this.config.keylabels?.enabled === false) this.clearKeylabels();
      return;
    }

    const update = () => {
      this.keylabelUpdateFrame = null;
      this.keylabelUpdateTimer = null;
      this.updateKeylabels();
    };
    const view = this.document?.defaultView;
    if (typeof view?.requestAnimationFrame === 'function') {
      this.keylabelUpdateFrame = view.requestAnimationFrame(update);
    } else {
      this.keylabelUpdateTimer = setTimeout(update, 0);
    }
  }

  keylabelAssignments() {
    const assignments = [];
    const keylabelConfig = this.config.keylabels || {};
    const tabTargets = this.targets.filter(target => target.tabIndex >= 0);
    const currentTabIndex = tabTargets.indexOf(this.currentTarget);
    const focused = getDeepActiveElement(this.root);
    const hasInitialDocumentFocus = isDocument(this.root) && (
      focused === this.document?.body ||
      focused === this.document?.documentElement
    );
    const nativeTabAssignments = currentTabIndex < 0
      ? (hasInitialDocumentFocus && tabTargets[0]
        ? [{
          target: tabTargets[0],
          symbols: KEYLABEL_SYMBOLS.tab,
          command: 'nextTabTarget',
        }]
        : [])
      : [
        {
          target: tabTargets[currentTabIndex - 1],
          symbols: `${KEYLABEL_SYMBOLS.shift}${KEYLABEL_SYMBOLS.tab}`,
          command: 'previousTabTarget',
        },
        {
          target: tabTargets[currentTabIndex + 1],
          symbols: KEYLABEL_SYMBOLS.tab,
          command: 'nextTabTarget',
        },
      ].filter(assignment => assignment.target);
    const nativeTabDestinations = new Set(
      nativeTabAssignments.map(assignment => assignment.target)
    );
    const contextStartAssignments = keylabelConfig.contextJump === false
      ? []
      : [
        [-1, 'previousContextStart'],
        [1, 'nextContextStart'],
      ].map(([direction, command]) => {
        const destination = this.contextStartDestination(direction);
        const symbols = shortcutSymbols(this.contextStartShortcut(direction));
        return {
          target: destination?.target,
          symbols,
          command,
        };
      }).filter(assignment => (
        assignment.target &&
        assignment.symbols &&
        !nativeTabDestinations.has(assignment.target)
      ));
    const contextStartDestinations = new Set(
      contextStartAssignments.map(assignment => assignment.target)
    );
    const selectedStructuralRoute = (
      this.activeTypedContext && this.currentTarget
        ? directContextForTarget(this.model, this.currentTarget)
        : this.activeStructuralContext
    ) || this.model?.rootContext;
    const headingRoute = headingContextForRoute(
      this.model,
      selectedStructuralRoute,
      this.currentTarget
    );
    const add = (target, symbols, command, options = {}) => {
      if (
        !target ||
        !symbols ||
        !this.targetSet.has(target) ||
        nativeTabDestinations.has(target)
      ) {
        return;
      }
      assignments.push({ target, symbols, command, ...options });
    };
    const addNativeFocusRoute = assignment => {
      const target = assignment?.target;
      if (
        !target?.isConnected ||
        !isComposedWithin(this.root, target) ||
        nativeTabDestinations.has(target)
      ) {
        return;
      }
      assignments.push(assignment);
    };

    // Ordinary sequential focus is always the simplest useful route.
    if (keylabelConfig.tab !== false) {
      nativeTabAssignments.forEach(assignment => assignments.push({
        ...assignment,
        maxSymbols: Array.from(assignment.symbols).length,
      }));
    }

    if (keylabelConfig.nativeArrows !== false) {
      nativeRadioArrowAssignments(
        getDeepActiveElement(this.root),
        this.root,
        this.config.displayCheck || 'full',
        this.config.targetFilter
      ).forEach(addNativeFocusRoute);
    }

    if (
      keylabelConfig.horizontal !== false &&
      this.currentTarget &&
      headingRoute
    ) {
      const { contexts: peers } = horizontalContextPeers(
        this.model,
        headingRoute
      );
      const currentIndex = peers.indexOf(headingRoute);
      [
        [-1, 'previousSiblingContext'],
        [1, 'nextSiblingContext'],
      ].forEach(([direction, command]) => {
        const shortcut = this.config.commands?.[command];
        const symbols = structuralArrowSymbols(
          this.currentTarget,
          shortcut,
          this.config
        );
        if (
          currentIndex < 0 ||
          !symbols
        ) {
          return;
        }
        const peer = peers[currentIndex + direction];
        const target = contextTargets(peer)[0];
        if (contextStartDestinations.has(target)) return;
        add(target, symbols, command, {
          maxSymbols: Array.from(symbols).length,
        });
      });
    }

    if (keylabelConfig.vertical !== false) {
      const commandSource = getDeepActiveElement(this.root);
      const addVertical = (command, target) => {
        const shortcut = this.config.commands?.[command];
        const symbols = structuralArrowSymbols(
          commandSource,
          shortcut,
          this.config
        );
        if (
          target === this.currentTarget ||
          !symbols ||
          contextStartDestinations.has(target)
        ) {
          return;
        }
        add(target, symbols, command, {
          maxSymbols: Array.from(symbols).length,
        });
      };

      if (!headingRoute) {
        const previousHeadingLevel = headingEdgeEntryContext(this.model, -1);
        const nextHeadingLevel = headingEdgeEntryContext(this.model, 1);
        addVertical(
          'broadenContext',
          contextTargets(previousHeadingLevel)[0]
        );
        addVertical(
          'narrowContext',
          contextTargets(nextHeadingLevel)[0]
        );
      } else {
        const headingParent = previousBroaderHeadingContext(
          this.model,
          headingRoute
        );
        if (headingParent) {
          addVertical(
            'broadenContext',
            contextTargets(headingParent)[0]
          );
        }

        const headingLevel = contextHeadingLevel(headingRoute);
        const child = this.currentTarget && headingLevel < 6
          ? nextDeeperHeadingContextForTarget(
            this.model,
            this.currentTarget,
            headingRoute
          )
          : null;
        if (!child) {
          const fallback = headingLevel < 6
            ? nextNarrowFallbackContext(this.model, headingRoute)
            : null;
          if (fallback) {
            addVertical('narrowContext', contextTargets(fallback)[0]);
          }
        }
      }
    }

    // A context-start Tab chord that skips sequential stops is more useful
    // than a structural arrow chord when both reach the same target.
    contextStartAssignments.forEach(assignment => assignments.push({
      ...assignment,
      maxSymbols: Array.from(assignment.symbols).length,
    }));

    if (keylabelConfig.activation !== false && this.currentTarget) {
      preferredActivationSymbols(this.currentTarget).forEach(symbols => {
        add(
          this.currentTarget,
          symbols,
          symbols === KEYLABEL_SYMBOLS.enter
            ? 'activateEnter'
            : 'activateSpace'
        );
      });
    }

    return assignments;
  }

  updateKeylabels() {
    if (
      !this.active ||
      this.foregroundModeActive ||
      this.config.keylabels?.enabled === false
    ) {
      this.clearKeylabels();
      return;
    }

    this.updatingKeylabels = true;
    try {
      if (this.dirty || !this.model) this.refresh();
      if (this.dirty || !this.model) {
        this.clearKeylabels();
        return;
      }
      showAssignedKeylabels(
        this.openKeyNav,
        this.keylabelAssignments(),
        {
          owner: STRUCTURAL_KEYLABEL_OWNER,
          cssClass: STRUCTURAL_KEYLABEL_CLASS,
          focusedTarget: getDeepActiveElement(this.root),
        }
      );
    } finally {
      this.updatingKeylabels = false;
    }
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
      repositionAssignedKeylabels(
        this.openKeyNav,
        STRUCTURAL_KEYLABEL_OWNER
      );
      return;
    }
    if (this.contextIndicatorFrame !== null) return;
    this.contextIndicatorFrame = view.requestAnimationFrame(() => {
      this.contextIndicatorFrame = null;
      this.updateContextIndicator();
      repositionAssignedKeylabels(
        this.openKeyNav,
        STRUCTURAL_KEYLABEL_OWNER
      );
    });
  }

  contextIndicatorHost() {
    const activeModal = topmostNativeModal(this.document);
    if (activeModal && this.root === activeModal) return activeModal;
    return this.document?.body || this.document?.documentElement || null;
  }

  contextIndicatorShouldDisplay() {
    return Boolean(
      this.config.contextIndicator?.enabled !== false ||
      this.transientContextIndicatorVisible
    );
  }

  showTransientContextIndicator() {
    this.transientContextIndicatorVisible = true;
    this.scheduleContextIndicatorUpdate();
  }

  showContextChange(previousContextId) {
    const nextContextId = contextId(
      this.activeTypedContext || this.activeStructuralContext
    );
    if (
      previousContextId &&
      nextContextId &&
      previousContextId !== nextContextId
    ) {
      this.showTransientContextIndicator();
    }
  }

  clearTransientContextIndicator() {
    if (!this.transientContextIndicatorVisible) return;
    this.transientContextIndicatorVisible = false;
    this.scheduleContextIndicatorUpdate();
  }

  ensureContextIndicator() {
    if (!this.active || !this.contextIndicatorShouldDisplay()) return;
    if (!this.contextIndicatorElement) {
      const element = this.document.createElement('div');
      element.className = 'openKeyNav-structural-context-outline';
      element.setAttribute('data-openkeynav-ui', 'structural-context-outline');
      element.setAttribute('aria-hidden', 'true');
      const headingLevel = this.document.createElement('span');
      headingLevel.className =
        'openKeyNav-structural-context-heading-level';
      headingLevel.setAttribute(
        'data-openkeynav-ui',
        'structural-context-heading-level'
      );
      headingLevel.setAttribute('aria-hidden', 'true');
      headingLevel.hidden = true;
      this.contextIndicatorElement = element;
      this.contextIndicatorHeadingLevelElement = headingLevel;
    }

    const host = this.contextIndicatorHost();
    if (host && this.contextIndicatorElement.parentNode !== host) {
      host.appendChild(this.contextIndicatorElement);
    }
    const headingLevel = this.contextIndicatorHeadingLevelElement;
    if (host && headingLevel && headingLevel.parentNode !== host) {
      host.appendChild(headingLevel);
    }
  }

  removeContextIndicator() {
    this.contextIndicatorResizeObserver?.disconnect();
    this.contextIndicatorResizeObserver = null;
    this.contextIndicatorObservedElements.clear();
    this.contextIndicatorElement?.remove();
    this.contextIndicatorHeadingLevelElement?.remove();
    this.contextIndicatorElement = null;
    this.contextIndicatorHeadingLevelElement = null;
  }

  hideContextIndicator() {
    if (this.contextIndicatorElement) {
      this.contextIndicatorElement.style.display = 'none';
    }
    if (this.contextIndicatorHeadingLevelElement) {
      this.contextIndicatorHeadingLevelElement.hidden = true;
    }
  }

  updateContextIndicatorHeadingLevel({
    context,
    left,
    top,
    right,
    bottom,
    viewportWidth,
    viewportHeight,
    width,
    color,
  }) {
    const tab = this.contextIndicatorHeadingLevelElement;
    const indicator = this.contextIndicatorElement;
    if (!tab || !indicator) return;

    const headingLevel = contextHeadingLevel(context);
    if (headingLevel === null) {
      tab.hidden = true;
      tab.textContent = '';
      delete indicator.dataset.headingLevel;
      delete indicator.dataset.headingTabPosition;
      delete tab.dataset.headingTabPosition;
      return;
    }

    tab.hidden = false;
    tab.textContent = `h${headingLevel}`;
    indicator.dataset.headingLevel = String(headingLevel);
    tab.style.setProperty(
      '--openkeynav-context-indicator-color',
      color
    );
    tab.style.setProperty(
      '--openkeynav-context-indicator-text-color',
      this.openKeyNav.config.spot?.fontColor || 'currentColor'
    );
    tab.style.setProperty(
      '--openkeynav-context-indicator-width',
      `${width}px`
    );

    const setPosition = (position, tabLeft, tabTop) => {
      indicator.dataset.headingTabPosition = position;
      tab.dataset.headingTabPosition = position;
      tab.style.left = `${tabLeft}px`;
      tab.style.top = `${tabTop}px`;
    };
    setPosition('inside', left, top);
    const tabRect = tab.getBoundingClientRect();
    const tabWidth = tabRect.width || tab.scrollWidth || 24;
    const tabHeight = tabRect.height || tab.scrollHeight || 24;
    if (top >= tabHeight) {
      setPosition('top', left, top - tabHeight + width);
      return;
    }
    if (viewportWidth - right >= tabWidth) {
      setPosition('right', right - width, top);
    } else if (viewportHeight - bottom >= tabHeight) {
      setPosition('bottom', left, bottom - width);
    } else if (left >= tabWidth) {
      setPosition('left', left - tabWidth + width, top);
    }
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
    if (!this.active || !this.contextIndicatorShouldDisplay()) {
      this.hideContextIndicator();
      this.contextIndicatorResizeObserver?.disconnect();
      this.contextIndicatorObservedElements.clear();
      return;
    }

    this.ensureContextIndicator();
    const indicator = this.contextIndicatorElement;
    const context = this.activeTypedContext || this.activeStructuralContext;
    if (!indicator || !context) {
      this.hideContextIndicator();
      return;
    }

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
      this.hideContextIndicator();
      return;
    }

    const offset = CONTEXT_INDICATOR_OFFSET;
    const left = Math.max(0, rect.left - offset);
    const top = Math.max(0, rect.top - offset);
    const right = Math.min(viewportWidth, rect.right + offset);
    const bottom = Math.min(viewportHeight, rect.bottom + offset);
    if (right <= left || bottom <= top) {
      this.hideContextIndicator();
      return;
    }

    const width = CONTEXT_INDICATOR_WIDTH;
    const color = this.openKeyNav.config.spot?.backgroundColor || 'currentColor';
    const contrastColor = this.openKeyNav.config.spot?.fontColor || 'currentColor';
    indicator.style.display = 'block';
    indicator.style.left = `${left}px`;
    indicator.style.top = `${top}px`;
    indicator.style.width = `${right - left}px`;
    indicator.style.height = `${bottom - top}px`;
    indicator.style.border = `${width}px dashed ${color}`;
    indicator.style.boxShadow =
      `0 0 0 ${CONTEXT_INDICATOR_CONTRAST_WIDTH}px ${contrastColor}`;
    this.updateContextIndicatorHeadingLevel({
      context,
      left,
      top,
      right,
      bottom,
      viewportWidth,
      viewportHeight,
      width,
      color,
    });
    indicator.dataset.contextId = String(contextId(context) || '');
    indicator.dataset.contextName = context.name || 'Document';
    indicator.dataset.contextType = this.activeTypedContext
      ? (this.activeTypedContext.type || 'typed')
      : 'structural';
  }

  updateStatus(prefix = '', { force = false } = {}) {
    if (!this.active && !force) return;
    if (this.active) {
      this.scheduleContextIndicatorUpdate();
      this.scheduleKeylabelUpdate();
    }
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
    const structuralContext = this.activeTypedContext
      ? (
        directContextForTarget(this.model, this.currentTarget) ||
        this.activeStructuralContext ||
        this.model.rootContext
      )
      : (this.activeStructuralContext || this.model.rootContext);
    const headingContext = headingContextForRoute(
      this.model,
      structuralContext,
      this.currentTarget
    );
    const headingLevel = contextHeadingLevel(headingContext);
    const headingDescription = headingLevel === null
      ? ''
      : (
        this.activeTypedContext
          ? `Underlying heading level: ${headingLevel}.`
          : `Heading level: ${headingLevel}.`
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
      this.config.debug === true &&
      this.config.status?.visible !== false &&
      !this.statusDismissed
    ) ? `${dismissLabel} to close.` : '';
    const contextDescription = this.activeTypedContext
      ? `Typed context: ${contextName}.`
      : `Context: ${contextName}.`;
    const message = [
      prefix,
      contextDescription,
      headingDescription,
      targetDescription ? `${targetDescription}.` : '',
      typedDescription,
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

    this.openKeyNav.setStatus(STRUCTURAL_STATUS_CHANNEL, message, {
      className: 'openKeyNav-structural-status',
      ui: 'structural-status',
      politeness:
        this.config.status.announcements === false ? 'off' : 'polite',
      visible:
        this.config.debug === true &&
        this.config.status.visible !== false &&
        !this.statusDismissed,
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
