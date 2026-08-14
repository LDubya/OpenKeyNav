"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchesStructuralShortcut = exports.classifyStructuralKeyOwnership = exports.StructuralNavigationController = exports.STRUCTURAL_NAVIGATION_COMMANDS = void 0;
var _structuralModel = require("./structuralModel.js");
var _accessibilityName = require("./accessibilityName.js");
var _domUtilities = require("./domUtilities.js");
var _keyboardEvents = require("./keyboardEvents.js");
var _keylabels = require("./keylabels.js");
var _signals = require("./signals.js");
var _tabbableTargets = require("./tabbableTargets.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var STRUCTURAL_NAVIGATION_COMMANDS = exports.STRUCTURAL_NAVIGATION_COMMANDS = Object.freeze({
  previousTarget: 'previousTarget',
  nextTarget: 'nextTarget',
  previousContextStart: 'previousContextStart',
  nextContextStart: 'nextContextStart',
  previousSiblingContext: 'previousSiblingContext',
  nextSiblingContext: 'nextSiblingContext',
  broadenContext: 'broadenContext',
  narrowContext: 'narrowContext',
  previousPeerContext: 'previousPeerContext',
  nextPeerContext: 'nextPeerContext'
});
var STRUCTURAL_STATUS_CHANNEL = 'structural-navigation';
var STRUCTURAL_EXIT_STATUS_CHANNEL = 'structural-navigation-exit';
var STRUCTURAL_KEYLABEL_OWNER = 'structural-navigation';
var STRUCTURAL_KEYLABEL_CLASS = 'openKeyNav-structural-keylabel';
var CONTEXT_INDICATOR_OFFSET = 10;
var CONTEXT_INDICATOR_WIDTH = 2;
var CONTEXT_INDICATOR_CONTRAST_WIDTH = 2;
var CONTEXT_ARROW_COMMANDS = new Set([STRUCTURAL_NAVIGATION_COMMANDS.previousSiblingContext, STRUCTURAL_NAVIGATION_COMMANDS.nextSiblingContext, STRUCTURAL_NAVIGATION_COMMANDS.broadenContext, STRUCTURAL_NAVIGATION_COMMANDS.narrowContext]);
var MODIFIER_KEY_EVENTS = new Set(['Alt', 'Control', 'Meta', 'Shift']);
var NATIVE_SCROLL_KEYS = new Set(['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp']);
var SPACE_ACTIVATION_ROLES = new Set(['button', 'checkbox', 'menuitemcheckbox', 'menuitemradio', 'option', 'radio', 'switch']);
var ARROW_OWNING_ROLES = new Set(['combobox', 'grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'scrollbar', 'slider', 'spinbutton', 'tablist', 'toolbar', 'tree', 'treegrid']);
var ESCAPE_OWNING_ROLES = new Set([].concat(_toConsumableArray(ARROW_OWNING_ROLES), ['dialog']));
var TEXT_INPUT_TYPES = new Set(['date', 'datetime-local', 'email', 'month', 'number', 'password', 'range', 'search', 'tel', 'text', 'time', 'url', 'week']);
var SHORTCUT_MODIFIER_LABELS = Object.freeze({
  ctrlKey: 'Ctrl',
  altKey: 'Alt',
  shiftKey: 'Shift',
  metaKey: 'Meta'
});
var KEYLABEL_MODIFIER_SYMBOLS = Object.freeze({
  altKey: _keylabels.KEYLABEL_SYMBOLS.alt,
  ctrlKey: _keylabels.KEYLABEL_SYMBOLS.control,
  metaKey: _keylabels.KEYLABEL_SYMBOLS.meta,
  shiftKey: _keylabels.KEYLABEL_SYMBOLS.shift
});
var shortcutLabel = function shortcutLabel(shortcut) {
  var normalized = (0, _keyboardEvents.normalizeShortcut)(shortcut);
  if (!normalized) return '';
  var modifiers = _keyboardEvents.MODIFIER_KEYS.filter(function (modifier) {
    return normalized[modifier];
  }).map(function (modifier) {
    return SHORTCUT_MODIFIER_LABELS[modifier];
  });
  var key = normalized.key === 'Escape' ? 'Esc' : normalized.key === ' ' ? 'Space' : normalized.key;
  return [].concat(_toConsumableArray(modifiers), [key]).join('+');
};
var shortcutSymbols = function shortcutSymbols(shortcut) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref$extraModifiers = _ref.extraModifiers,
    extraModifiers = _ref$extraModifiers === void 0 ? [] : _ref$extraModifiers;
  var normalized = (0, _keyboardEvents.normalizeShortcut)(shortcut);
  if (!normalized) return '';
  var keySymbol = {
    Tab: _keylabels.KEYLABEL_SYMBOLS.tab,
    ArrowLeft: _keylabels.KEYLABEL_SYMBOLS.left,
    ArrowRight: _keylabels.KEYLABEL_SYMBOLS.right,
    ArrowUp: _keylabels.KEYLABEL_SYMBOLS.up,
    ArrowDown: _keylabels.KEYLABEL_SYMBOLS.down,
    Enter: _keylabels.KEYLABEL_SYMBOLS.enter,
    ' ': _keylabels.KEYLABEL_SYMBOLS.space,
    Spacebar: _keylabels.KEYLABEL_SYMBOLS.space
  }[normalized.key];
  if (!keySymbol) return '';
  var modifierSymbols = [].concat(_toConsumableArray(extraModifiers), _toConsumableArray(_keyboardEvents.MODIFIER_KEYS.filter(function (modifier) {
    return normalized[modifier];
  }))).filter(function (modifier, index, modifiers) {
    return _keyboardEvents.MODIFIER_KEYS.includes(modifier) && modifiers.indexOf(modifier) === index;
  }).map(function (modifier) {
    return KEYLABEL_MODIFIER_SYMBOLS[modifier];
  });
  return "".concat(modifierSymbols.join('')).concat(keySymbol);
};

/**
 * Matches one exact configured shortcut. Unspecified modifiers are false.
 * Callers may explicitly permit an extra ownership-override modifier.
 */
var matchesStructuralShortcut = exports.matchesStructuralShortcut = _keyboardEvents.matchesShortcut;
var getEventPath = function getEventPath(event) {
  if (typeof event.composedPath === 'function') {
    var _path = event.composedPath();
    if (_path.length) return _path;
  }
  var path = [];
  var current = event.target;
  while (current) {
    path.push(current);
    current = (0, _domUtilities.getComposedParent)(current);
  }
  return path;
};
var hasEditableContent = function hasEditableContent(element) {
  if (!(0, _domUtilities.isElement)(element)) return false;
  var value = element.getAttribute('contenteditable');
  return element.isContentEditable || value === '' || value === 'true' || value === 'plaintext-only';
};
var elementKeyOwnership = function elementKeyOwnership(element) {
  var ownership = {
    all: false,
    arrows: false,
    escape: false,
    character: false
  };
  if (!(0, _domUtilities.isElement)(element)) return ownership;
  var declared = [element.getAttribute('data-openkeynav-key-owner'), element.getAttribute('data-openkeynav-owns-keys')].filter(Boolean).join(' ').toLowerCase();
  if (declared.includes('all')) {
    return {
      all: true,
      arrows: true,
      escape: true,
      character: true
    };
  }
  if (declared.includes('arrow')) ownership.arrows = true;
  if (declared.includes('escape')) ownership.escape = true;
  if (declared.includes('character')) ownership.character = true;
  if (hasEditableContent(element)) {
    ownership.arrows = true;
    ownership.escape = true;
    ownership.character = true;
  }
  var tagName = element.tagName.toLowerCase();
  if (tagName === 'textarea' || tagName === 'select') {
    ownership.arrows = true;
    ownership.escape = true;
    ownership.character = true;
  } else if (tagName === 'input') {
    var type = (element.getAttribute('type') || 'text').toLowerCase();
    if (TEXT_INPUT_TYPES.has(type) || type === 'radio') {
      ownership.arrows = true;
      ownership.escape = true;
      ownership.character = true;
    }
  }
  var role = (element.getAttribute('role') || '').toLowerCase();
  if (ARROW_OWNING_ROLES.has(role)) {
    ownership.arrows = true;
    ownership.character = true;
  }
  if (ESCAPE_OWNING_ROLES.has(role)) ownership.escape = true;
  var openPopover = false;
  try {
    openPopover = element.matches('[popover]:popover-open');
  } catch (error) {
    openPopover = false;
  }
  if (tagName === 'dialog' && element.hasAttribute('open') || openPopover) {
    ownership.escape = true;
  }
  return ownership;
};

/**
 * Classifies page/widget ownership before OpenKeyNav prevents any key.
 */
var classifyStructuralKeyOwnership = exports.classifyStructuralKeyOwnership = function classifyStructuralKeyOwnership(event) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var path = getEventPath(event);
  var result = {
    all: false,
    arrows: false,
    escape: false,
    character: false
  };
  path.forEach(function (node) {
    var ownership = elementKeyOwnership(node);
    result.all = result.all || ownership.all;
    result.arrows = result.arrows || ownership.arrows;
    result.escape = result.escape || ownership.escape;
    result.character = result.character || ownership.character;
  });
  if (typeof config.ownsKey === 'function') {
    var declared = config.ownsKey(event, path);
    if (declared === true) {
      return {
        all: true,
        arrows: true,
        escape: true,
        character: true
      };
    }
    if (declared && _typeof(declared) === 'object') {
      result.all = result.all || Boolean(declared.all);
      result.arrows = result.arrows || Boolean(declared.arrows);
      result.escape = result.escape || Boolean(declared.escape);
      result.character = result.character || Boolean(declared.character);
    }
  }
  return result;
};
var shortcutEventForTarget = function shortcutEventForTarget(target, shortcut) {
  var normalized = (0, _keyboardEvents.normalizeShortcut)(shortcut);
  if (!target || !normalized) return null;
  var path = [];
  var current = target;
  while (current) {
    path.push(current);
    current = (0, _domUtilities.getComposedParent)(current);
  }
  return {
    target: target,
    key: normalized.key,
    altKey: normalized.altKey,
    ctrlKey: normalized.ctrlKey,
    metaKey: normalized.metaKey,
    shiftKey: normalized.shiftKey,
    composedPath: function composedPath() {
      return path;
    }
  };
};
var structuralArrowSymbols = function structuralArrowSymbols(target, shortcut, config) {
  var event = shortcutEventForTarget(target, shortcut);
  if (!event || !event.key.startsWith('Arrow')) return '';
  var ownership = classifyStructuralKeyOwnership(event, config);
  if (ownership.all) return '';
  if (!ownership.arrows) return shortcutSymbols(shortcut);
  var overrideModifier = _keyboardEvents.MODIFIER_KEYS.includes(config.overrideModifier) ? config.overrideModifier : null;
  if (!overrideModifier) return '';
  var normalized = (0, _keyboardEvents.normalizeShortcut)(shortcut);
  if (Object.prototype.hasOwnProperty.call(normalized, overrideModifier) && !normalized[overrideModifier]) {
    return '';
  }
  var extraModifiers = normalized[overrideModifier] ? [] : [overrideModifier];
  var overriddenEvent = _objectSpread(_objectSpread({}, event), {}, _defineProperty({}, overrideModifier, true));
  var overriddenOwnership = classifyStructuralKeyOwnership(overriddenEvent, config);
  if (overriddenOwnership.all) return '';
  if (!matchesStructuralShortcut(overriddenEvent, shortcut, {
    allowedExtraModifiers: extraModifiers
  })) {
    return '';
  }
  return shortcutSymbols(shortcut, {
    extraModifiers: extraModifiers
  });
};
var activationSymbols = function activationSymbols(target) {
  if (!(0, _domUtilities.isElement)(target) || target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') {
    return [];
  }
  var tagName = target.tagName.toLowerCase();
  var both = [_keylabels.KEYLABEL_SYMBOLS.enter, _keylabels.KEYLABEL_SYMBOLS.space];
  if (tagName === 'button' || tagName === 'summary') return both;
  if ((tagName === 'a' || tagName === 'area') && target.hasAttribute('href')) {
    return [_keylabels.KEYLABEL_SYMBOLS.enter];
  }
  if (tagName !== 'input') {
    var role = (target.getAttribute('role') || '').toLowerCase();
    if (role === 'button') return both;
    if (role === 'link') return [_keylabels.KEYLABEL_SYMBOLS.enter];
    if (SPACE_ACTIVATION_ROLES.has(role)) return [_keylabels.KEYLABEL_SYMBOLS.space];
    return [];
  }
  var inputType = (target.getAttribute('type') || 'text').toLowerCase();
  if (['button', 'submit', 'reset', 'image'].includes(inputType)) return both;
  if (['checkbox', 'radio'].includes(inputType)) {
    return [_keylabels.KEYLABEL_SYMBOLS.space];
  }
  return [];
};
var preferredActivationSymbols = function preferredActivationSymbols(target) {
  var symbols = activationSymbols(target);
  return symbols.includes(_keylabels.KEYLABEL_SYMBOLS.enter) ? [_keylabels.KEYLABEL_SYMBOLS.enter] : symbols;
};
var targetUsesSpaceForActivation = function targetUsesSpaceForActivation(target) {
  return activationSymbols(target).includes(_keylabels.KEYLABEL_SYMBOLS.space);
};
var isNativeKeyboardScroll = function isNativeKeyboardScroll(event, ownership, target) {
  if (ownership.all || ownership.arrows || ownership.character || event.altKey || event.ctrlKey || event.metaKey) {
    return false;
  }
  if (event.key === ' ' || event.key === 'Spacebar') {
    return !targetUsesSpaceForActivation(target);
  }
  return !event.shiftKey && NATIVE_SCROLL_KEYS.has(event.key);
};
var radioIsAvailable = function radioIsAvailable(radio, root, displayCheck, targetFilter) {
  var _radio$closest, _radio$ownerDocument, _radio$ownerDocument$;
  if (!(radio !== null && radio !== void 0 && radio.isConnected) || radio.type !== 'radio' || !(0, _domUtilities.isComposedWithin)(root, radio) || (_radio$closest = radio.closest) !== null && _radio$closest !== void 0 && _radio$closest.call(radio, '[inert], [hidden]') || targetFilter && !targetFilter(radio)) {
    return false;
  }
  try {
    if (radio.matches(':disabled')) return false;
  } catch (error) {
    if (radio.disabled) return false;
  }
  if (displayCheck === 'none') return true;
  var style = (_radio$ownerDocument = radio.ownerDocument) === null || _radio$ownerDocument === void 0 || (_radio$ownerDocument = _radio$ownerDocument.defaultView) === null || _radio$ownerDocument === void 0 || (_radio$ownerDocument$ = _radio$ownerDocument.getComputedStyle) === null || _radio$ownerDocument$ === void 0 ? void 0 : _radio$ownerDocument$.call(_radio$ownerDocument, radio);
  if ((style === null || style === void 0 ? void 0 : style.display) === 'none' || ['hidden', 'collapse'].includes(style === null || style === void 0 ? void 0 : style.visibility)) {
    return false;
  }
  return elementClientRects(radio).length > 0;
};

/**
 * Predicts the browser's native focus movement inside one HTML radio group.
 * These are descriptive hints only; bare arrow events remain browser-owned.
 */
var nativeRadioArrowAssignments = function nativeRadioArrowAssignments(target, root, displayCheck, targetFilter) {
  var _target$getRootNode;
  if (!(0, _domUtilities.isElement)(target) || target.tagName.toLowerCase() !== 'input' || target.type !== 'radio' || !target.name) {
    return [];
  }
  var treeRoot = ((_target$getRootNode = target.getRootNode) === null || _target$getRootNode === void 0 ? void 0 : _target$getRootNode.call(target)) || target.ownerDocument;
  if (!(treeRoot !== null && treeRoot !== void 0 && treeRoot.querySelectorAll)) return [];
  var radios = Array.from(treeRoot.querySelectorAll('input')).filter(function (radio) {
    return radio !== target && radio.type === 'radio' && radio.name === target.name && radio.form === target.form && radioIsAvailable(radio, root, displayCheck, targetFilter);
  });
  var group = [target].concat(_toConsumableArray(radios)).sort(function (left, right) {
    if (left === right) return 0;
    var position = left.compareDocumentPosition(right);
    return position & 2 ? 1 : -1;
  });
  if (group.length < 2) return [];
  var currentIndex = group.indexOf(target);
  var previous = group[(currentIndex - 1 + group.length) % group.length];
  var next = group[(currentIndex + 1) % group.length];
  if (previous === next) {
    return [{
      target: previous,
      symbols: _keylabels.KEYLABEL_SYMBOLS.horizontalAxis,
      command: 'nativeArrowLeft nativeArrowRight'
    }, {
      target: previous,
      symbols: _keylabels.KEYLABEL_SYMBOLS.verticalAxis,
      command: 'nativeArrowUp nativeArrowDown'
    }];
  }
  return [{
    target: previous,
    symbols: _keylabels.KEYLABEL_SYMBOLS.left,
    command: 'nativeArrowLeft'
  }, {
    target: previous,
    symbols: _keylabels.KEYLABEL_SYMBOLS.up,
    command: 'nativeArrowUp'
  }, {
    target: next,
    symbols: _keylabels.KEYLABEL_SYMBOLS.right,
    command: 'nativeArrowRight'
  }, {
    target: next,
    symbols: _keylabels.KEYLABEL_SYMBOLS.down,
    command: 'nativeArrowDown'
  }];
};
var resolveValue = function resolveValue(value, details) {
  return typeof value === 'function' ? value(details) : value;
};
var contextTargets = function contextTargets(context) {
  if (!context) return [];
  return context.targets || context.flattenedTargets || [];
};
var contextId = function contextId(context) {
  return context && context.id;
};
var modelContextById = function modelContextById(model, id) {
  var _model$contexts;
  if (!model || id === null || typeof id === 'undefined') return null;
  if (model.contexts instanceof Map) return model.contexts.get(id) || null;
  if (Array.isArray(model.contexts)) {
    return model.contexts.find(function (context) {
      return context.id === id;
    }) || null;
  }
  return ((_model$contexts = model.contexts) === null || _model$contexts === void 0 ? void 0 : _model$contexts[id]) || null;
};
var modelTypedContextById = function modelTypedContextById(model, id) {
  var _model$typedContexts;
  if (!model || id === null || typeof id === 'undefined') return null;
  if (model.typedContexts instanceof Map) return model.typedContexts.get(id) || null;
  if (Array.isArray(model.typedContexts)) {
    return model.typedContexts.find(function (context) {
      return context.id === id;
    }) || null;
  }
  return ((_model$typedContexts = model.typedContexts) === null || _model$typedContexts === void 0 ? void 0 : _model$typedContexts[id]) || null;
};
var directContextForTarget = function directContextForTarget(model, target) {
  if (!model || !target) return null;
  var map = model.directContextByTarget || model.targetContexts || model.directContexts;
  if (map instanceof Map) {
    var value = map.get(target);
    return _typeof(value) === 'object' ? value : modelContextById(model, value);
  }
  if (typeof model.getDirectContext === 'function') {
    return model.getDirectContext(target);
  }
  return null;
};
var structuralContextForElement = function structuralContextForElement(model, element) {
  if (!model || !element) return null;
  var direct = directContextForTarget(model, element);
  if (direct) return direct;
  var contexts = modelStructuralContexts(model);
  var exact = contexts.filter(function (context) {
    return context.boundary === element || context.associatedHeading === element;
  });
  var containing = exact.length ? exact : contexts.filter(function (context) {
    var _context$visualElemen;
    if ((_context$visualElemen = context.visualElements) !== null && _context$visualElemen !== void 0 && _context$visualElemen.includes(element)) return true;
    var boundary = context.boundary;
    return ((0, _domUtilities.isDocument)(boundary) || (0, _domUtilities.isShadowRoot)(boundary) || (0, _domUtilities.isElement)(boundary)) && (0, _domUtilities.isComposedWithin)(boundary, element);
  });
  return containing.sort(function (left, right) {
    return compareContextSpecificity(model, left, right) || contextTargets(left).length - contextTargets(right).length || contextOrder(left) - contextOrder(right);
  })[0] || model.rootContext || null;
};
var typedContextsForTarget = function typedContextsForTarget(model, target) {
  if (!model || !target) return [];
  var map = model.typedContextsByTarget || model.targetTypedContexts;
  var values = map instanceof Map ? map.get(target) : null;
  if (!values && typeof model.getTypedContexts === 'function') {
    values = model.getTypedContexts(target);
  }
  return Array.from(values || []).map(function (value) {
    return _typeof(value) === 'object' ? value : modelTypedContextById(model, value);
  }).filter(Boolean);
};
var parentContext = function parentContext(model, context) {
  if (!context || !context.parent) return null;
  return _typeof(context.parent) === 'object' ? context.parent : modelContextById(model, context.parent);
};
var contextDescendsFrom = function contextDescendsFrom(model, context, possibleAncestor) {
  var current = parentContext(model, context);
  var seen = new Set();
  while (current && !seen.has(current)) {
    if (current === possibleAncestor) return true;
    seen.add(current);
    current = parentContext(model, current);
  }
  return false;
};
var compareContextSpecificity = function compareContextSpecificity(model, left, right) {
  if (contextDescendsFrom(model, left, right)) return -1;
  if (contextDescendsFrom(model, right, left)) return 1;
  return 0;
};
var modelStructuralContexts = function modelStructuralContexts(model) {
  if (!(model !== null && model !== void 0 && model.contexts)) return [];
  if (model.contexts instanceof Map) return Array.from(model.contexts.values());
  if (Array.isArray(model.contexts)) return model.contexts.slice();
  return Object.values(model.contexts);
};
var contextHeadingLevel = function contextHeadingLevel(context) {
  var level = Number(context === null || context === void 0 ? void 0 : context.headingLevel);
  return Number.isInteger(level) && level > 0 ? level : null;
};
var authoredHeadingForContext = function authoredHeadingForContext(context) {
  if (!context) return null;
  if ((0, _domUtilities.isElement)(context.associatedHeading)) return context.associatedHeading;
  if (context.source === 'heading' && (0, _domUtilities.isElement)(context.boundary)) {
    return context.boundary;
  }
  return null;
};
var contextOrder = function contextOrder(context) {
  var order = Number(context === null || context === void 0 ? void 0 : context.order);
  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER;
};
var headingContextForTarget = function headingContextForTarget(model, target) {
  var headingLevel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  if (!model || !target) return null;
  return modelStructuralContexts(model).filter(function (context) {
    return contextHeadingLevel(context) !== null && (headingLevel === null || contextHeadingLevel(context) === headingLevel) && contextTargets(context).includes(target);
  }).sort(function (left, right) {
    return contextHeadingLevel(right) - contextHeadingLevel(left) || compareContextSpecificity(model, left, right) || contextTargets(left).length - contextTargets(right).length || contextOrder(right) - contextOrder(left);
  })[0] || null;
};
var nextDeeperHeadingContextForTarget = function nextDeeperHeadingContextForTarget(model, target, context) {
  var headingLevel = contextHeadingLevel(context);
  if (!model || !target || headingLevel === null || headingLevel >= 6) {
    return null;
  }
  var deeperContexts = modelStructuralContexts(model).filter(function (candidate) {
    return contextHeadingLevel(candidate) > headingLevel && contextOrder(candidate) > contextOrder(context) && contextTargets(candidate).includes(target);
  });
  var nextHeadingLevel = Math.min.apply(Math, _toConsumableArray(deeperContexts.map(contextHeadingLevel)));
  if (!Number.isFinite(nextHeadingLevel)) return null;
  return deeperContexts.filter(function (candidate) {
    return contextHeadingLevel(candidate) === nextHeadingLevel;
  }).sort(function (left, right) {
    return contextOrder(left) - contextOrder(right) || String(contextId(left)).localeCompare(String(contextId(right)));
  })[0] || null;
};
var headingContextForRoute = function headingContextForRoute(model, context, target) {
  if (!model || !context) return null;
  if (context === model.rootContext) {
    return headingContextForTarget(model, target);
  }
  if (contextHeadingLevel(context) !== null) return context;
  var ancestor = parentContext(model, context);
  var seen = new Set();
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
var previousBroaderHeadingContext = function previousBroaderHeadingContext(model, context) {
  var headingLevel = contextHeadingLevel(context);
  if (headingLevel === null || headingLevel <= 1) return null;
  var orderedContexts = modelStructuralContexts(model).sort(function (left, right) {
    return contextOrder(left) - contextOrder(right) || String(contextId(left)).localeCompare(String(contextId(right)));
  });
  var currentIndex = orderedContexts.indexOf(context);
  if (currentIndex <= 0) return null;
  for (var index = currentIndex - 1; index >= 0; index -= 1) {
    var candidate = orderedContexts[index];
    var candidateHeadingLevel = contextHeadingLevel(candidate);
    if (candidateHeadingLevel !== null && candidateHeadingLevel < headingLevel) {
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
var nextNarrowFallbackContext = function nextNarrowFallbackContext(model, context) {
  var headingLevel = contextHeadingLevel(context);
  if (headingLevel === null || headingLevel >= 6) return null;
  var orderedContexts = modelStructuralContexts(model).filter(function (candidate) {
    return contextTargets(candidate).length > 0;
  }).sort(function (left, right) {
    return contextOrder(left) - contextOrder(right) || String(contextId(left)).localeCompare(String(contextId(right)));
  });
  var currentIndex = orderedContexts.indexOf(context);
  var followingContexts = currentIndex >= 0 ? orderedContexts.slice(currentIndex + 1) : orderedContexts;
  var deeperContexts = followingContexts.filter(function (candidate) {
    return contextHeadingLevel(candidate) > headingLevel;
  });
  var nextHeadingLevel = Math.min.apply(Math, _toConsumableArray(deeperContexts.map(contextHeadingLevel)));
  if (!Number.isFinite(nextHeadingLevel)) return null;
  return deeperContexts.find(function (candidate) {
    return contextHeadingLevel(candidate) === nextHeadingLevel;
  }) || null;
};

/**
 * An unassociated region has no heading rank. A vertical command enters the
 * authored heading-level ladder from the requested edge; DOM containment
 * never supplies an implicit starting rank.
 */
var headingEdgeEntryContext = function headingEdgeEntryContext(model, direction) {
  if (direction === 0) return null;
  var headingContexts = modelStructuralContexts(model).filter(function (candidate) {
    return contextTargets(candidate).length > 0 && contextHeadingLevel(candidate) !== null;
  }).sort(function (left, right) {
    return contextOrder(left) - contextOrder(right) || String(contextId(left)).localeCompare(String(contextId(right)));
  });
  var headingLevels = headingContexts.map(contextHeadingLevel);
  var destinationLevel = direction < 0 ? Math.max.apply(Math, _toConsumableArray(headingLevels)) : Math.min.apply(Math, _toConsumableArray(headingLevels));
  if (!Number.isFinite(destinationLevel)) return null;
  var destinations = headingContexts.filter(function (candidate) {
    return contextHeadingLevel(candidate) === destinationLevel;
  });
  return direction < 0 ? destinations[destinations.length - 1] || null : destinations[0] || null;
};
var targetName = function targetName(target) {
  var _target$getAttribute, _target$getAttribute2, _target$tagName;
  if (!target) return '';
  if ((0, _domUtilities.hasAriaHiddenAncestor)(target)) {
    return target.tagName ? target.tagName.toLowerCase() : 'target';
  }
  var explicitName = (0, _accessibilityName.getExplicitAccessibleName)(target);
  if (explicitName) return explicitName;
  var labelText = Array.from(target.labels || []).map(function (label) {
    return (0, _accessibilityName.normalizeText)(label.textContent);
  }).filter(Boolean).join(' ');
  if (labelText) return labelText;
  var value = ((_target$getAttribute = target.getAttribute) === null || _target$getAttribute === void 0 ? void 0 : _target$getAttribute.call(target, 'title')) || ((_target$getAttribute2 = target.getAttribute) === null || _target$getAttribute2 === void 0 ? void 0 : _target$getAttribute2.call(target, 'name')) || target.textContent;
  var normalized = (0, _accessibilityName.normalizeText)(value);
  return normalized.slice(0, 80) || ((_target$tagName = target.tagName) === null || _target$tagName === void 0 ? void 0 : _target$tagName.toLowerCase()) || 'target';
};
var topmostNativeModal = function topmostNativeModal(documentObject) {
  if (!(documentObject !== null && documentObject !== void 0 && documentObject.querySelectorAll)) return null;
  try {
    var modals = Array.from(documentObject.querySelectorAll('dialog:modal'));
    var focused = (0, _domUtilities.getDeepActiveElement)(documentObject);
    var focusedModals = modals.filter(function (modal) {
      return (0, _domUtilities.isComposedWithin)(modal, focused);
    });
    if (focusedModals.length) {
      return focusedModals[focusedModals.length - 1];
    }
    return modals[modals.length - 1] || null;
  } catch (error) {
    return null;
  }
};
var resolveSelectorRoot = function resolveSelectorRoot(value, documentObject) {
  if (typeof value !== 'string') return value;
  return documentObject.querySelector(value);
};
var openShadowRootsWithin = function openShadowRootsWithin(root) {
  var roots = new Set();
  var _visit = function visit(scope) {
    if ((0, _domUtilities.isShadowRoot)(scope)) roots.add(scope);
    if (!(scope !== null && scope !== void 0 && scope.querySelectorAll)) return;
    scope.querySelectorAll('*').forEach(function (element) {
      if (element.shadowRoot) _visit(element.shadowRoot);
    });
  };
  _visit(root);
  return roots;
};
var mutationBelongsOnlyToGeneratedUI = function mutationBelongsOnlyToGeneratedUI(mutation) {
  var changedNodes = [].concat(_toConsumableArray(Array.from(mutation.addedNodes || [])), _toConsumableArray(Array.from(mutation.removedNodes || [])));
  var candidates = changedNodes.length ? changedNodes : [mutation.target];
  return candidates.length > 0 && candidates.every(function (node) {
    var element = (0, _domUtilities.isElement)(node) ? node : node.parentElement || mutation.target;
    return element && (0, _domUtilities.isOpenKeyNavGeneratedUI)(element);
  });
};
var elementClientRects = function elementClientRects(element) {
  if (!(element !== null && element !== void 0 && element.getBoundingClientRect)) return [];
  var rects = [];
  if (typeof element.getClientRects === 'function') {
    rects = Array.from(element.getClientRects());
  }
  if (!rects.length) rects = [element.getBoundingClientRect()];
  return rects.filter(function (rect) {
    return [rect.left, rect.top, rect.right, rect.bottom].every(Number.isFinite) && rect.right > rect.left && rect.bottom > rect.top;
  });
};
var unionClientRects = function unionClientRects(rects) {
  if (!rects.length) return null;
  return rects.reduce(function (union, rect) {
    return {
      left: Math.min(union.left, rect.left),
      top: Math.min(union.top, rect.top),
      right: Math.max(union.right, rect.right),
      bottom: Math.max(union.bottom, rect.bottom)
    };
  }, {
    left: rects[0].left,
    top: rects[0].top,
    right: rects[0].right,
    bottom: rects[0].bottom
  });
};
var StructuralNavigationController = exports.StructuralNavigationController = /*#__PURE__*/function () {
  function StructuralNavigationController(openKeyNav) {
    _classCallCheck(this, StructuralNavigationController);
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
    this.scheduleContextIndicatorUpdate = this.scheduleContextIndicatorUpdate.bind(this);
    this.scheduleKeylabelUpdate = this.scheduleKeylabelUpdate.bind(this);

    // Structural navigation consumes the keylabel renderer as a one-way
    // dependency. Signal changes pause hints under foreground modes and restore
    // them when the structural layer becomes visible again.
    (0, _signals.effect)(this.handleModeLayerChange);
  }
  return _createClass(StructuralNavigationController, [{
    key: "config",
    get: function get() {
      return this.openKeyNav.config.modesConfig.structuralNavigation;
    }
  }, {
    key: "active",
    get: function get() {
      return Boolean(this.openKeyNav.config.modes.structuralNavigation.value);
    }
  }, {
    key: "foregroundModeActive",
    get: function get() {
      return Boolean(this.openKeyNav.config.modes.clicking.value || this.openKeyNav.config.modes.moving.value || this.openKeyNav.config.modes.menu.value);
    }
  }, {
    key: "handleModeLayerChange",
    value: function handleModeLayerChange() {
      var active = this.active;
      var foregroundModeActive = this.foregroundModeActive;
      var resumedFromForeground = this.foregroundModeWasActive && !foregroundModeActive;
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
  }, {
    key: "resolveActiveRoot",
    value: function resolveActiveRoot() {
      var details = {
        document: this.document,
        openKeyNav: this.openKeyNav,
        activeElement: (0, _domUtilities.getDeepActiveElement)(this.document)
      };
      var configured = resolveSelectorRoot(resolveValue(this.config.activeRoot, details), this.document);
      var customRoot = (0, _domUtilities.isDocument)(configured) || (0, _domUtilities.isShadowRoot)(configured) && configured.host.isConnected || (0, _domUtilities.isElement)(configured) && configured.isConnected ? configured : null;
      var modal = topmostNativeModal(this.document);
      if (!modal) return customRoot || this.document;
      if (customRoot && customRoot !== this.document && (0, _domUtilities.isComposedWithin)(modal, customRoot)) {
        return customRoot;
      }
      return modal;
    }
  }, {
    key: "resolveContributions",
    value: function resolveContributions(value) {
      var details = {
        root: this.root,
        targets: this.targets.slice(),
        openKeyNav: this.openKeyNav
      };
      var resolved = resolveValue(value, details);
      return Array.from(resolved || []);
    }
  }, {
    key: "activate",
    value: function activate() {
      var _this$document$defaul2;
      if (!this.document || !this.openKeyNav.meta.enabled.value || !this.config.enabled) {
        return false;
      }
      if (this.active) {
        var _this$document$defaul;
        this.openKeyNav.clearStatus(STRUCTURAL_EXIT_STATUS_CHANNEL);
        this.document.addEventListener('focusin', this.handleFocusIn, true);
        this.document.addEventListener('change', this.invalidate, true);
        this.document.addEventListener('toggle', this.invalidate, true);
        this.document.addEventListener('beforetoggle', this.invalidate, true);
        (_this$document$defaul = this.document.defaultView) === null || _this$document$defaul === void 0 || _this$document$defaul.addEventListener('popstate', this.invalidate);
        this.connectContextIndicatorListeners();
        this.refresh();
        this.updateStatus('Structural navigation active.');
        return true;
      }
      if (this.openKeyNav.config.modes.clicking.value || this.openKeyNav.config.modes.moving.value || this.openKeyNav.config.modes.menu.value) {
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
      (_this$document$defaul2 = this.document.defaultView) === null || _this$document$defaul2 === void 0 || _this$document$defaul2.addEventListener('popstate', this.invalidate);
      this.connectContextIndicatorListeners();
      this.refresh();
      this.synchronizeFocus({
        preserveRoute: false,
        announce: false,
        refresh: false
      });
      this.updateStatus('Structural navigation active.');
      return true;
    }
  }, {
    key: "deactivate",
    value: function deactivate() {
      var _this$document, _this$document2, _this$document3, _this$document4, _this$document5;
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$announce = _ref2.announce,
        announce = _ref2$announce === void 0 ? true : _ref2$announce;
      if (!this.active && !this.model && !this.observer && !this.openKeyNav.getStatusElement(STRUCTURAL_STATUS_CHANNEL) && !this.contextIndicatorElement) {
        return false;
      }
      var statusConfig = this.config.status || {};
      var statusWasDismissed = this.statusDismissed;
      var configuredExitDuration = Number(this.openKeyNav.config.notifications.duration);
      var exitDuration = Number.isFinite(configuredExitDuration) && configuredExitDuration > 0 ? configuredExitDuration : 3000;
      var announceExit = Boolean(announce && statusConfig.enabled && statusConfig.announcements !== false);
      var exitHost = this.root;
      this.openKeyNav.config.modes.structuralNavigation.value = false;
      (_this$document = this.document) === null || _this$document === void 0 || _this$document.removeEventListener('focusin', this.handleFocusIn, true);
      (_this$document2 = this.document) === null || _this$document2 === void 0 || _this$document2.removeEventListener('change', this.invalidate, true);
      (_this$document3 = this.document) === null || _this$document3 === void 0 || _this$document3.removeEventListener('toggle', this.invalidate, true);
      (_this$document4 = this.document) === null || _this$document4 === void 0 || _this$document4.removeEventListener('beforetoggle', this.invalidate, true);
      (_this$document5 = this.document) === null || _this$document5 === void 0 || (_this$document5 = _this$document5.defaultView) === null || _this$document5 === void 0 || _this$document5.removeEventListener('popstate', this.invalidate);
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
        this.openKeyNav.setStatus(STRUCTURAL_EXIT_STATUS_CHANNEL, 'Structural navigation off.', {
          className: 'openKeyNav-structural-exit-status',
          ui: 'structural-status',
          politeness: 'polite',
          visible: this.config.debug === true && statusConfig.visible !== false && !statusWasDismissed,
          duration: exitDuration,
          toolName: this.openKeyNav.config.notifications.displayToolName,
          host: exitHost
        });
      }
      return true;
    }
  }, {
    key: "handleKeyDown",
    value: function handleKeyDown(event) {
      var _this = this;
      if (!this.document || !this.openKeyNav.meta.enabled.value || !this.config.enabled || event.isComposing || event.keyCode === 229) {
        return false;
      }
      var ownership = classifyStructuralKeyOwnership(event, this.config);
      var activationShortcut = {
        key: this.openKeyNav.config.keys.structuralNavigation
      };
      if (!this.active) {
        if (this.openKeyNav.config.modes.clicking.value || this.openKeyNav.config.modes.moving.value || this.openKeyNav.config.modes.menu.value || ownership.character || !matchesStructuralShortcut(event, activationShortcut)) {
          return false;
        }
        (0, _keyboardEvents.preventAcceptedCommand)(event);
        this.activate();
        return true;
      }
      if (!this.model) this.activate();
      var defaultExit = {
        key: this.openKeyNav.config.keys.structuralNavigation,
        altKey: true
      };
      var exitShortcut = (0, _keyboardEvents.normalizeShortcut)(this.config.exitCommand) || defaultExit;
      var configuredExit = matchesStructuralShortcut(event, exitShortcut);
      var foregroundModeActive = this.foregroundModeActive;

      // Click, Move, and menu are temporary layers over structural navigation.
      // Their keystrokes take priority until they finish. The deliberately
      // configured structural exit remains available (Alt+R by default).
      if (foregroundModeActive) {
        if (configuredExit) {
          (0, _keyboardEvents.preventAcceptedCommand)(event);
          this.deactivate();
          return true;
        }
        return false;
      }
      var plainToggle = matchesStructuralShortcut(event, activationShortcut);
      var openKeyNavExit = matchesStructuralShortcut(event, {
        key: this.openKeyNav.config.keys.escape
      });
      var safeEscape = this.config.escapeExits && event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && !ownership.escape;
      if (configuredExit || safeEscape || (plainToggle || openKeyNavExit) && !ownership.character) {
        (0, _keyboardEvents.preventAcceptedCommand)(event);
        this.deactivate();
        return true;
      }
      var statusConfig = this.config.status || {};
      var dismissShortcut = (0, _keyboardEvents.normalizeShortcut)(statusConfig.dismissCommand);
      var dismissIsArrowKey = event.key.startsWith('Arrow');
      var dismissIsCharacterKey = event.key.length === 1;
      var pageOwnsDismissShortcut = Boolean(ownership.all || event.key === 'Escape' && ownership.escape || dismissIsArrowKey && ownership.arrows || dismissIsCharacterKey && ownership.character);
      var dismissStatus = Boolean(dismissShortcut && this.config.debug === true && statusConfig.enabled !== false && statusConfig.visible !== false && !this.statusDismissed && this.openKeyNav.getStatusElement(STRUCTURAL_STATUS_CHANNEL) && !pageOwnsDismissShortcut && matchesStructuralShortcut(event, dismissShortcut));
      if (dismissStatus) {
        (0, _keyboardEvents.preventAcceptedCommand)(event);
        this.clearTransientContextIndicator();
        this.statusDismissed = true;
        this.updateStatus('Status closed.');
        return true;
      }
      var contextStartCommand = [STRUCTURAL_NAVIGATION_COMMANDS.previousContextStart, STRUCTURAL_NAVIGATION_COMMANDS.nextContextStart].find(function (command) {
        return matchesStructuralShortcut(event, _this.contextStartShortcut(command === STRUCTURAL_NAVIGATION_COMMANDS.previousContextStart ? -1 : 1));
      });
      if (contextStartCommand && !ownership.all) {
        (0, _keyboardEvents.preventAcceptedCommand)(event);
        this.execute(contextStartCommand);
        return true;
      }
      var focusedTarget = (0, _domUtilities.getDeepActiveElement)(this.root) || event.target;
      var nativeKeyboardScroll = isNativeKeyboardScroll(event, ownership, focusedTarget);
      var configuredScrollCommand = Boolean(!ownership.all && !ownership.character && matchesStructuralShortcut(event, {
        key: this.openKeyNav.config.keys.scroll
      }, {
        allowedExtraModifiers: ['shiftKey']
      }));
      var preservesContextIndicator = Boolean(nativeKeyboardScroll || configuredScrollCommand);
      if (event.key === 'Tab' || event.key === 'Enter' || (event.key === ' ' || event.key === 'Spacebar') && !nativeKeyboardScroll || event.key === 'Escape') {
        this.clearTransientContextIndicator();
        return false;
      }
      var isArrowKey = event.key.startsWith('Arrow');
      var isCharacterKey = event.key.length === 1;
      var ownsArrow = isArrowKey && ownership.arrows;
      var configuredOverrideModifier = this.config.overrideModifier;
      var overrideModifier = _keyboardEvents.MODIFIER_KEYS.includes(configuredOverrideModifier) ? configuredOverrideModifier : null;
      var overridePressed = Boolean(overrideModifier && event[overrideModifier]);
      var overridesArrowOwnership = ownsArrow && overridePressed;
      if (ownership.all || ownsArrow && !overridesArrowOwnership || isCharacterKey && ownership.character) {
        this.clearTransientContextIndicator();
        return false;
      }
      var commandEntries = Object.entries(this.config.commands || {});
      var exactMatch = commandEntries.find(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
          shortcut = _ref4[1];
        return matchesStructuralShortcut(event, shortcut);
      });
      // Option/Alt is an ownership override, not part of the structural arrow
      // chord. Once held, it may stay held as focus leaves a widget. Exact
      // bindings still win, and explicit modifier requirements remain exact.
      var matched = exactMatch || (isArrowKey && overridePressed ? commandEntries.find(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
          shortcut = _ref6[1];
        return matchesStructuralShortcut(event, shortcut, {
          allowedExtraModifiers: [overrideModifier]
        });
      }) : null);
      if (!matched) {
        if (!preservesContextIndicator && !MODIFIER_KEY_EVENTS.has(event.key)) {
          this.clearTransientContextIndicator();
        }
        return false;
      }
      (0, _keyboardEvents.preventAcceptedCommand)(event);
      this.execute(matched[0]);
      return true;
    }
  }, {
    key: "execute",
    value: function execute(command) {
      if (!this.active || !Object.values(STRUCTURAL_NAVIGATION_COMMANDS).includes(command)) {
        return false;
      }

      // A newly accepted command supersedes any settled-focus callback queued by
      // an earlier command. The command synchronizes current focus immediately.
      this.focusSyncToken += 1;
      this.refresh();
      this.synchronizeFocus({
        preserveRoute: true,
        announce: false,
        refresh: false
      });
      if (!CONTEXT_ARROW_COMMANDS.has(command)) {
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
  }, {
    key: "refresh",
    value: function refresh() {
      var _this2 = this;
      if (!this.active) return false;
      var resolvedRoot = this.resolveActiveRoot();
      if (resolvedRoot !== this.root) {
        this.root = resolvedRoot;
        this.dirty = true;
      }
      if (!this.dirty && this.model) return false;
      var previousModel = this.model;
      var previousStructuralId = contextId(this.activeStructuralContext);
      var previousTypedId = contextId(this.activeTypedContext);
      var previousActiveContextId = previousTypedId || previousStructuralId;
      var previousTarget = this.currentTarget;
      var targetFilter = typeof this.config.targetFilter === 'function' ? function (target) {
        return _this2.config.targetFilter(target, {
          root: _this2.root,
          openKeyNav: _this2.openKeyNav
        });
      } : null;
      this.targets = (0, _tabbableTargets.discoverTabbableTargets)(this.root, {
        displayCheck: this.config.displayCheck || 'full',
        getShadowRoot: true,
        includeProgrammatic: Boolean(this.config.includeProgrammatic),
        targetFilter: targetFilter
      });
      this.targetSet = new Set(this.targets);
      this.model = (0, _structuralModel.buildStructuralModel)({
        root: this.root,
        targets: this.targets,
        structuralContexts: this.resolveContributions(this.config.structuralContexts),
        typedContexts: this.resolveContributions(this.config.typedContexts),
        previousModel: previousModel
      });
      this.dirty = false;
      this.reconnectObservers();
      var focused = (0, _domUtilities.getDeepActiveElement)(this.root);
      this.currentTarget = this.targetSet.has(focused) ? focused : this.targetSet.has(previousTarget) ? previousTarget : null;
      var preservedStructural = modelContextById(this.model, previousStructuralId);
      var direct = directContextForTarget(this.model, this.currentTarget);
      this.activeStructuralContext = preservedStructural && (!this.currentTarget || contextTargets(preservedStructural).includes(this.currentTarget)) ? preservedStructural : direct || this.model.rootContext;
      var preservedTyped = modelTypedContextById(this.model, previousTypedId);
      this.activeTypedContext = preservedTyped && this.currentTarget && contextTargets(preservedTyped).includes(this.currentTarget) ? preservedTyped : null;
      this.showContextChange(previousActiveContextId);
      this.scheduleContextIndicatorUpdate();
      if (!this.updatingKeylabels) this.scheduleKeylabelUpdate();
      return true;
    }
  }, {
    key: "synchronizeFocus",
    value: function synchronizeFocus() {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref7$preserveRoute = _ref7.preserveRoute,
        preserveRoute = _ref7$preserveRoute === void 0 ? true : _ref7$preserveRoute,
        _ref7$announce = _ref7.announce,
        announce = _ref7$announce === void 0 ? true : _ref7$announce,
        _ref7$refresh = _ref7.refresh,
        refresh = _ref7$refresh === void 0 ? true : _ref7$refresh;
      if (!this.active) return;
      var previousActiveContextId = contextId(this.activeTypedContext || this.activeStructuralContext);
      if (refresh) this.refresh();
      var focused = (0, _domUtilities.getDeepActiveElement)(this.root);
      if (!this.targetSet.has(focused)) {
        var _this$document6, _this$document7;
        this.currentTarget = null;
        this.activeTypedContext = null;
        var ambientDocumentFocus = Boolean(focused === ((_this$document6 = this.document) === null || _this$document6 === void 0 ? void 0 : _this$document6.body) || focused === ((_this$document7 = this.document) === null || _this$document7 === void 0 ? void 0 : _this$document7.documentElement));
        if (!ambientDocumentFocus) {
          var _this$model;
          this.activeStructuralContext = structuralContextForElement(this.model, focused) || this.activeStructuralContext || ((_this$model = this.model) === null || _this$model === void 0 ? void 0 : _this$model.rootContext) || null;
        } else if (!this.activeStructuralContext) {
          var _this$model2;
          this.activeStructuralContext = ((_this$model2 = this.model) === null || _this$model2 === void 0 ? void 0 : _this$model2.rootContext) || null;
        }
        this.showContextChange(previousActiveContextId);
        this.scheduleKeylabelUpdate();
        if (announce) this.updateStatus();
        return;
      }
      var hadCurrentTarget = Boolean(this.currentTarget);
      this.currentTarget = focused;
      var direct = directContextForTarget(this.model, focused) || this.model.rootContext;
      if (this.activeTypedContext && !contextTargets(this.activeTypedContext).includes(focused)) {
        this.activeTypedContext = null;
      }
      if (!this.activeTypedContext) {
        var routeStillContainsTarget = preserveRoute && hadCurrentTarget && this.activeStructuralContext && contextTargets(this.activeStructuralContext).includes(focused);
        if (!routeStillContainsTarget) this.activeStructuralContext = direct;
      }
      this.showContextChange(previousActiveContextId);
      this.scheduleKeylabelUpdate();
      if (announce) this.updateStatus();
    }
  }, {
    key: "handleFocusIn",
    value: function handleFocusIn() {
      var _this3 = this;
      if (!this.active) return;
      var token = ++this.focusSyncToken;
      setTimeout(function () {
        if (_this3.active && token === _this3.focusSyncToken) {
          _this3.synchronizeFocus({
            preserveRoute: true
          });
        }
      }, 0);
    }
  }, {
    key: "handleMutations",
    value: function handleMutations(mutations) {
      if (!this.active) return;
      if (mutations.every(mutationBelongsOnlyToGeneratedUI)) return;
      this.dirty = true;
      this.scheduleContextIndicatorUpdate();
      this.clearKeylabels();
      this.scheduleKeylabelUpdate();
    }
  }, {
    key: "invalidate",
    value: function invalidate() {
      if (this.active) {
        this.dirty = true;
        this.scheduleContextIndicatorUpdate();
        this.clearKeylabels();
        this.scheduleKeylabelUpdate();
      }
    }
  }, {
    key: "handleSlotChange",
    value: function handleSlotChange(event) {
      if ((0, _domUtilities.isOpenKeyNavGeneratedUI)(event.target)) return;
      this.dirty = true;
      this.scheduleContextIndicatorUpdate();
      this.clearKeylabels();
      this.scheduleKeylabelUpdate();
    }
  }, {
    key: "reconnectObservers",
    value: function reconnectObservers() {
      var _this4 = this;
      this.disconnectObservers();
      if (typeof MutationObserver === 'undefined') return;
      this.observer = new MutationObserver(this.handleMutations);
      var documentRoot = this.document.documentElement;
      if (documentRoot) {
        this.observer.observe(documentRoot, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['aria-hidden', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-modal', 'checked', 'class', 'contenteditable', 'controls', 'disabled', 'href', 'hidden', 'id', 'inert', 'name', 'open', 'popover', 'role', 'style', 'tabindex', 'type']
        });
      }
      this.observedShadowRoots = openShadowRootsWithin(this.root);
      this.observedShadowRoots.forEach(function (shadowRoot) {
        _this4.observer.observe(shadowRoot, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['aria-hidden', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-modal', 'checked', 'class', 'contenteditable', 'controls', 'disabled', 'href', 'hidden', 'id', 'inert', 'name', 'open', 'popover', 'role', 'style', 'tabindex', 'type']
        });
        shadowRoot.addEventListener('slotchange', _this4.handleSlotChange);
      });
    }
  }, {
    key: "disconnectObservers",
    value: function disconnectObservers() {
      var _this$observer,
        _this5 = this;
      (_this$observer = this.observer) === null || _this$observer === void 0 || _this$observer.disconnect();
      this.observer = null;
      this.observedShadowRoots.forEach(function (shadowRoot) {
        shadowRoot.removeEventListener('slotchange', _this5.handleSlotChange);
      });
      this.observedShadowRoots.clear();
    }
  }, {
    key: "activeSequence",
    value: function activeSequence() {
      var _this6 = this;
      return contextTargets(this.activeTypedContext || this.activeStructuralContext).filter(function (target) {
        return _this6.targetSet.has(target) && target.isConnected;
      });
    }
  }, {
    key: "activeHeadingContext",
    value: function activeHeadingContext() {
      var structuralRoute = this.activeTypedContext && this.currentTarget ? directContextForTarget(this.model, this.currentTarget) : this.activeStructuralContext;
      return headingContextForRoute(this.model, structuralRoute, this.currentTarget);
    }
  }, {
    key: "activeAuthoredHeading",
    value: function activeAuthoredHeading() {
      if (!this.active) return null;
      return authoredHeadingForContext(this.activeHeadingContext());
    }
  }, {
    key: "moveTarget",
    value: function moveTarget(direction) {
      var sequence = this.activeSequence();
      if (!sequence.length) {
        this.updateStatus('No targets are available in this context.');
        return;
      }
      var currentIndex = sequence.indexOf(this.currentTarget);
      var nextIndex = currentIndex < 0 ? direction > 0 ? 0 : sequence.length - 1 : currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= sequence.length) {
        this.updateStatus(direction > 0 ? 'End of this context.' : 'Start of this context.');
        return;
      }
      this.focusTarget(sequence[nextIndex]);
    }
  }, {
    key: "contextStartShortcut",
    value: function contextStartShortcut(direction) {
      var _this$config$commands;
      var command = direction < 0 ? STRUCTURAL_NAVIGATION_COMMANDS.previousContextStart : STRUCTURAL_NAVIGATION_COMMANDS.nextContextStart;
      return (0, _keyboardEvents.normalizeShortcut)((_this$config$commands = this.config.commands) === null || _this$config$commands === void 0 ? void 0 : _this$config$commands[command]);
    }
  }, {
    key: "contextStartRoute",
    value: function contextStartRoute() {
      var _this7 = this;
      var route = [];
      var previousContext = null;
      this.targets.filter(function (target) {
        return target.tabIndex >= 0;
      }).forEach(function (target, index) {
        var _this7$model;
        var context = directContextForTarget(_this7.model, target) || ((_this7$model = _this7.model) === null || _this7$model === void 0 ? void 0 : _this7$model.rootContext) || null;
        if (context === previousContext) return;
        route.push({
          context: context,
          target: target,
          index: index
        });
        previousContext = context;
      });
      return route;
    }
  }, {
    key: "contextStartDestination",
    value: function contextStartDestination(direction) {
      var tabTargets = this.targets.filter(function (target) {
        return target.tabIndex >= 0;
      });
      var route = this.contextStartRoute();
      if (!route.length) return null;
      var currentIndex = tabTargets.indexOf(this.currentTarget);
      if (currentIndex < 0) {
        return direction > 0 ? route[0] : route[route.length - 1];
      }
      var currentRouteIndex = -1;
      for (var index = 0; index < route.length; index += 1) {
        if (route[index].index > currentIndex) break;
        currentRouteIndex = index;
      }
      return route[currentRouteIndex + direction] || null;
    }
  }, {
    key: "moveContextStart",
    value: function moveContextStart(direction) {
      this.useStructuralRoute();
      var destination = this.contextStartDestination(direction);
      if (!destination) {
        this.updateStatus(direction > 0 ? 'No next context start.' : 'No previous context start.');
        return;
      }
      var previousActiveContextId = contextId(this.activeTypedContext || this.activeStructuralContext);
      this.activeStructuralContext = destination.context;
      this.activeTypedContext = null;
      this.showContextChange(previousActiveContextId);
      this.focusTarget(destination.target);
    }
  }, {
    key: "focusTarget",
    value: function focusTarget(target) {
      var _this8 = this;
      if (!target || !this.targetSet.has(target) || !target.isConnected) {
        this.dirty = true;
        this.updateStatus('That target is no longer available.');
        return;
      }
      this.currentTarget = target;
      this.openKeyNav.focus(target, {
        decorate: false
      });
      this.updateStatus();
      var token = ++this.focusSyncToken;
      setTimeout(function () {
        if (_this8.active && token === _this8.focusSyncToken) {
          _this8.synchronizeFocus({
            preserveRoute: true
          });
        }
      }, 0);
    }
  }, {
    key: "selectAuthoredHeading",
    value: function selectAuthoredHeading(heading, target) {
      if (!this.active || !heading || !target) return false;
      if (this.dirty || !this.model) this.refresh();
      var context = structuralContextForElement(this.model, heading);
      if (contextHeadingLevel(context) === null || !this.targetSet.has(target) || !contextTargets(context).includes(target)) {
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
  }, {
    key: "moveSiblingContext",
    value: function moveSiblingContext(direction) {
      this.useStructuralRoute();
      var destination = this.contextStartDestination(direction);
      if (!destination) {
        this.updateStatus(direction > 0 ? 'No next semantic region.' : 'No previous semantic region.');
        return;
      }
      var previousActiveContextId = contextId(this.activeTypedContext || this.activeStructuralContext);
      this.activeStructuralContext = destination.context;
      this.activeTypedContext = null;
      this.showContextChange(previousActiveContextId);
      this.focusTarget(destination.target);
    }
  }, {
    key: "broadenContext",
    value: function broadenContext() {
      this.useStructuralRoute();
      var activeContext = this.activeHeadingContext();
      if (!activeContext) {
        var previousHeadingLevel = headingEdgeEntryContext(this.model, -1);
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
      var headingParent = previousBroaderHeadingContext(this.model, activeContext);
      if (!headingParent) {
        this.updateStatus('Already at the broadest heading level.');
        return;
      }
      this.showTransientContextIndicator();
      this.activeStructuralContext = headingParent;
      this.focusTarget(contextTargets(headingParent)[0]);
    }
  }, {
    key: "narrowContext",
    value: function narrowContext() {
      this.useStructuralRoute();
      var activeContext = this.activeHeadingContext();
      if (!activeContext) {
        var nextHeadingLevel = headingEdgeEntryContext(this.model, 1);
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
      var headingLevel = contextHeadingLevel(activeContext);
      var child = this.currentTarget && headingLevel < 6 ? nextDeeperHeadingContextForTarget(this.model, this.currentTarget, activeContext) : null;
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
      var fallback = nextNarrowFallbackContext(this.model, activeContext);
      if (!fallback) {
        this.updateStatus("No next H".concat(headingLevel + 1, " context."));
        return;
      }
      this.showTransientContextIndicator();
      this.activeStructuralContext = fallback;
      this.activeTypedContext = null;
      this.focusTarget(contextTargets(fallback)[0]);
    }
  }, {
    key: "cyclePeerContext",
    value: function cyclePeerContext(direction) {
      var _this9 = this;
      if (!this.currentTarget) {
        this.updateStatus('No current target has an alternate typed context.');
        return;
      }
      var typed = typedContextsForTarget(this.model, this.currentTarget);
      if (!typed.length) {
        this.updateStatus('No alternate typed context is available.');
        return;
      }
      var ring = [null].concat(_toConsumableArray(typed));
      var previousActiveContextId = contextId(this.activeTypedContext || this.activeStructuralContext);
      var currentIndex = this.activeTypedContext ? ring.findIndex(function (context) {
        return contextId(context) === contextId(_this9.activeTypedContext);
      }) : 0;
      var normalizedIndex = currentIndex < 0 ? 0 : currentIndex;
      var nextIndex = (normalizedIndex + direction + ring.length) % ring.length;
      this.activeTypedContext = ring[nextIndex];
      if (!this.activeTypedContext) {
        this.activeStructuralContext = directContextForTarget(this.model, this.currentTarget) || this.model.rootContext;
      }
      this.showContextChange(previousActiveContextId);
      this.updateStatus();
    }
  }, {
    key: "useStructuralRoute",
    value: function useStructuralRoute() {
      if (!this.activeTypedContext) return;
      var previousActiveContextId = contextId(this.activeTypedContext);
      this.activeTypedContext = null;
      this.activeStructuralContext = directContextForTarget(this.model, this.currentTarget) || this.activeStructuralContext || this.model.rootContext;
      this.showContextChange(previousActiveContextId);
    }
  }, {
    key: "clearKeylabels",
    value: function clearKeylabels() {
      (0, _keylabels.clearAssignedKeylabels)(this.openKeyNav, STRUCTURAL_KEYLABEL_OWNER);
    }
  }, {
    key: "cancelKeylabelUpdate",
    value: function cancelKeylabelUpdate() {
      var _this$document8;
      var view = (_this$document8 = this.document) === null || _this$document8 === void 0 ? void 0 : _this$document8.defaultView;
      if (this.keylabelUpdateFrame !== null && typeof (view === null || view === void 0 ? void 0 : view.cancelAnimationFrame) === 'function') {
        view.cancelAnimationFrame(this.keylabelUpdateFrame);
      }
      if (this.keylabelUpdateTimer !== null) {
        clearTimeout(this.keylabelUpdateTimer);
      }
      this.keylabelUpdateFrame = null;
      this.keylabelUpdateTimer = null;
    }
  }, {
    key: "scheduleKeylabelUpdate",
    value: function scheduleKeylabelUpdate() {
      var _this$config$keylabel,
        _this0 = this,
        _this$document9;
      if (!this.active || this.foregroundModeActive || ((_this$config$keylabel = this.config.keylabels) === null || _this$config$keylabel === void 0 ? void 0 : _this$config$keylabel.enabled) === false || this.keylabelUpdateFrame !== null || this.keylabelUpdateTimer !== null) {
        var _this$config$keylabel2;
        if (((_this$config$keylabel2 = this.config.keylabels) === null || _this$config$keylabel2 === void 0 ? void 0 : _this$config$keylabel2.enabled) === false) this.clearKeylabels();
        return;
      }
      var update = function update() {
        _this0.keylabelUpdateFrame = null;
        _this0.keylabelUpdateTimer = null;
        _this0.updateKeylabels();
      };
      var view = (_this$document9 = this.document) === null || _this$document9 === void 0 ? void 0 : _this$document9.defaultView;
      if (typeof (view === null || view === void 0 ? void 0 : view.requestAnimationFrame) === 'function') {
        this.keylabelUpdateFrame = view.requestAnimationFrame(update);
      } else {
        this.keylabelUpdateTimer = setTimeout(update, 0);
      }
    }
  }, {
    key: "keylabelAssignments",
    value: function keylabelAssignments() {
      var _this$document0,
        _this$document1,
        _this$model3,
        _this$model4,
        _this1 = this,
        _this$model5;
      var assignments = [];
      var keylabelConfig = this.config.keylabels || {};
      var tabTargets = this.targets.filter(function (target) {
        return target.tabIndex >= 0;
      });
      var currentTabIndex = tabTargets.indexOf(this.currentTarget);
      var focused = (0, _domUtilities.getDeepActiveElement)(this.root);
      var hasInitialDocumentFocus = (0, _domUtilities.isDocument)(this.root) && (focused === ((_this$document0 = this.document) === null || _this$document0 === void 0 ? void 0 : _this$document0.body) || focused === ((_this$document1 = this.document) === null || _this$document1 === void 0 ? void 0 : _this$document1.documentElement));
      var sequentialTabAssignments = currentTabIndex < 0 ? hasInitialDocumentFocus && tabTargets[0] ? [{
        target: tabTargets[0],
        symbols: _keylabels.KEYLABEL_SYMBOLS.tab,
        command: 'nextTabTarget'
      }] : [] : [{
        target: tabTargets[currentTabIndex - 1],
        symbols: "".concat(_keylabels.KEYLABEL_SYMBOLS.shift).concat(_keylabels.KEYLABEL_SYMBOLS.tab),
        command: 'previousTabTarget'
      }, {
        target: tabTargets[currentTabIndex + 1],
        symbols: _keylabels.KEYLABEL_SYMBOLS.tab,
        command: 'nextTabTarget'
      }].filter(function (assignment) {
        return assignment.target;
      });
      var currentTabContext = this.currentTarget ? directContextForTarget(this.model, this.currentTarget) || ((_this$model3 = this.model) === null || _this$model3 === void 0 ? void 0 : _this$model3.rootContext) || null : structuralContextForElement(this.model, focused) || this.activeStructuralContext || ((_this$model4 = this.model) === null || _this$model4 === void 0 ? void 0 : _this$model4.rootContext) || null;
      var nativeTabAssignments = sequentialTabAssignments.filter(function (assignment) {
        var _this1$model;
        var destinationContext = directContextForTarget(_this1.model, assignment.target) || ((_this1$model = _this1.model) === null || _this1$model === void 0 ? void 0 : _this1$model.rootContext) || null;
        return contextId(destinationContext) !== contextId(currentTabContext);
      });
      var nativeTabDestinations = new Set(nativeTabAssignments.map(function (assignment) {
        return assignment.target;
      }));
      var contextStartAssignments = keylabelConfig.contextJump === false ? [] : [[-1, 'previousContextStart'], [1, 'nextContextStart']].map(function (_ref8) {
        var _ref9 = _slicedToArray(_ref8, 2),
          direction = _ref9[0],
          command = _ref9[1];
        var destination = _this1.contextStartDestination(direction);
        var symbols = shortcutSymbols(_this1.contextStartShortcut(direction));
        return {
          target: destination === null || destination === void 0 ? void 0 : destination.target,
          symbols: symbols,
          command: command
        };
      }).filter(function (assignment) {
        return assignment.target && assignment.symbols && !nativeTabDestinations.has(assignment.target);
      });
      var contextStartDestinations = new Set(contextStartAssignments.map(function (assignment) {
        return assignment.target;
      }));
      var selectedStructuralRoute = (this.activeTypedContext && this.currentTarget ? directContextForTarget(this.model, this.currentTarget) : this.activeStructuralContext) || ((_this$model5 = this.model) === null || _this$model5 === void 0 ? void 0 : _this$model5.rootContext);
      var headingRoute = headingContextForRoute(this.model, selectedStructuralRoute, this.currentTarget);
      var add = function add(target, symbols, command) {
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        if (!target || !symbols || !_this1.targetSet.has(target) || nativeTabDestinations.has(target)) {
          return;
        }
        assignments.push(_objectSpread({
          target: target,
          symbols: symbols,
          command: command
        }, options));
      };
      var addNativeFocusRoute = function addNativeFocusRoute(assignment) {
        var target = assignment === null || assignment === void 0 ? void 0 : assignment.target;
        if (!(target !== null && target !== void 0 && target.isConnected) || !(0, _domUtilities.isComposedWithin)(_this1.root, target) || nativeTabDestinations.has(target)) {
          return;
        }
        assignments.push(assignment);
      };

      // Native Tab is familiar without a persistent hint. Label it only where
      // the next or previous sequential stop crosses the same direct semantic
      // context boundary used by horizontal structural navigation.
      if (keylabelConfig.tab !== false) {
        nativeTabAssignments.forEach(function (assignment) {
          return assignments.push(_objectSpread(_objectSpread({}, assignment), {}, {
            maxSymbols: Array.from(assignment.symbols).length
          }));
        });
      }
      if (keylabelConfig.nativeArrows !== false) {
        nativeRadioArrowAssignments((0, _domUtilities.getDeepActiveElement)(this.root), this.root, this.config.displayCheck || 'full', this.config.targetFilter).forEach(addNativeFocusRoute);
      }
      if (keylabelConfig.horizontal !== false && this.currentTarget) {
        [[-1, 'previousSiblingContext'], [1, 'nextSiblingContext']].forEach(function (_ref0) {
          var _this1$config$command, _this1$contextStartDe;
          var _ref1 = _slicedToArray(_ref0, 2),
            direction = _ref1[0],
            command = _ref1[1];
          var shortcut = (_this1$config$command = _this1.config.commands) === null || _this1$config$command === void 0 ? void 0 : _this1$config$command[command];
          var symbols = structuralArrowSymbols(_this1.currentTarget, shortcut, _this1.config);
          if (!symbols) return;
          var target = (_this1$contextStartDe = _this1.contextStartDestination(direction)) === null || _this1$contextStartDe === void 0 ? void 0 : _this1$contextStartDe.target;
          if (contextStartDestinations.has(target)) return;
          add(target, symbols, command, {
            maxSymbols: Array.from(symbols).length
          });
        });
      }
      if (keylabelConfig.vertical !== false) {
        var commandSource = (0, _domUtilities.getDeepActiveElement)(this.root);
        var addVertical = function addVertical(command, target) {
          var _this1$config$command2;
          var shortcut = (_this1$config$command2 = _this1.config.commands) === null || _this1$config$command2 === void 0 ? void 0 : _this1$config$command2[command];
          var symbols = structuralArrowSymbols(commandSource, shortcut, _this1.config);
          if (target === _this1.currentTarget || !symbols || contextStartDestinations.has(target)) {
            return;
          }
          add(target, symbols, command, {
            maxSymbols: Array.from(symbols).length
          });
        };
        if (!headingRoute) {
          var previousHeadingLevel = headingEdgeEntryContext(this.model, -1);
          var nextHeadingLevel = headingEdgeEntryContext(this.model, 1);
          addVertical('broadenContext', contextTargets(previousHeadingLevel)[0]);
          addVertical('narrowContext', contextTargets(nextHeadingLevel)[0]);
        } else {
          var headingParent = previousBroaderHeadingContext(this.model, headingRoute);
          if (headingParent) {
            addVertical('broadenContext', contextTargets(headingParent)[0]);
          }
          var headingLevel = contextHeadingLevel(headingRoute);
          var child = this.currentTarget && headingLevel < 6 ? nextDeeperHeadingContextForTarget(this.model, this.currentTarget, headingRoute) : null;
          if (!child) {
            var fallback = headingLevel < 6 ? nextNarrowFallbackContext(this.model, headingRoute) : null;
            if (fallback) {
              addVertical('narrowContext', contextTargets(fallback)[0]);
            }
          }
        }
      }

      // An explicitly configured context-start chord takes priority over a
      // structural arrow chord when both reach the same target.
      contextStartAssignments.forEach(function (assignment) {
        return assignments.push(_objectSpread(_objectSpread({}, assignment), {}, {
          maxSymbols: Array.from(assignment.symbols).length
        }));
      });
      if (keylabelConfig.activation !== false && this.currentTarget) {
        preferredActivationSymbols(this.currentTarget).forEach(function (symbols) {
          add(_this1.currentTarget, symbols, symbols === _keylabels.KEYLABEL_SYMBOLS.enter ? 'activateEnter' : 'activateSpace');
        });
      }
      return assignments;
    }
  }, {
    key: "updateKeylabels",
    value: function updateKeylabels() {
      var _this$config$keylabel3;
      if (!this.active || this.foregroundModeActive || ((_this$config$keylabel3 = this.config.keylabels) === null || _this$config$keylabel3 === void 0 ? void 0 : _this$config$keylabel3.enabled) === false) {
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
        (0, _keylabels.showAssignedKeylabels)(this.openKeyNav, this.keylabelAssignments(), {
          owner: STRUCTURAL_KEYLABEL_OWNER,
          cssClass: STRUCTURAL_KEYLABEL_CLASS,
          focusedTarget: (0, _domUtilities.getDeepActiveElement)(this.root)
        });
      } finally {
        this.updatingKeylabels = false;
      }
    }
  }, {
    key: "connectContextIndicatorListeners",
    value: function connectContextIndicatorListeners() {
      var _this$document10;
      var view = (_this$document10 = this.document) === null || _this$document10 === void 0 ? void 0 : _this$document10.defaultView;
      view === null || view === void 0 || view.addEventListener('scroll', this.scheduleContextIndicatorUpdate, true);
      view === null || view === void 0 || view.addEventListener('resize', this.scheduleContextIndicatorUpdate);
    }
  }, {
    key: "disconnectContextIndicatorListeners",
    value: function disconnectContextIndicatorListeners() {
      var _this$document11, _this$contextIndicato;
      var view = (_this$document11 = this.document) === null || _this$document11 === void 0 ? void 0 : _this$document11.defaultView;
      view === null || view === void 0 || view.removeEventListener('scroll', this.scheduleContextIndicatorUpdate, true);
      view === null || view === void 0 || view.removeEventListener('resize', this.scheduleContextIndicatorUpdate);
      if (this.contextIndicatorFrame !== null && typeof (view === null || view === void 0 ? void 0 : view.cancelAnimationFrame) === 'function') {
        view.cancelAnimationFrame(this.contextIndicatorFrame);
      }
      this.contextIndicatorFrame = null;
      (_this$contextIndicato = this.contextIndicatorResizeObserver) === null || _this$contextIndicato === void 0 || _this$contextIndicato.disconnect();
      this.contextIndicatorResizeObserver = null;
      this.contextIndicatorObservedElements.clear();
    }
  }, {
    key: "scheduleContextIndicatorUpdate",
    value: function scheduleContextIndicatorUpdate() {
      var _this$document12,
        _this10 = this;
      if (!this.active) return;
      var view = (_this$document12 = this.document) === null || _this$document12 === void 0 ? void 0 : _this$document12.defaultView;
      if (typeof (view === null || view === void 0 ? void 0 : view.requestAnimationFrame) !== 'function') {
        this.updateContextIndicator();
        (0, _keylabels.repositionAssignedKeylabels)(this.openKeyNav, STRUCTURAL_KEYLABEL_OWNER);
        return;
      }
      if (this.contextIndicatorFrame !== null) return;
      this.contextIndicatorFrame = view.requestAnimationFrame(function () {
        _this10.contextIndicatorFrame = null;
        _this10.updateContextIndicator();
        (0, _keylabels.repositionAssignedKeylabels)(_this10.openKeyNav, STRUCTURAL_KEYLABEL_OWNER);
      });
    }
  }, {
    key: "contextIndicatorHost",
    value: function contextIndicatorHost() {
      var _this$document13, _this$document14;
      var activeModal = topmostNativeModal(this.document);
      if (activeModal && this.root === activeModal) return activeModal;
      return ((_this$document13 = this.document) === null || _this$document13 === void 0 ? void 0 : _this$document13.body) || ((_this$document14 = this.document) === null || _this$document14 === void 0 ? void 0 : _this$document14.documentElement) || null;
    }
  }, {
    key: "contextIndicatorShouldDisplay",
    value: function contextIndicatorShouldDisplay() {
      var _this$config$contextI;
      return Boolean(((_this$config$contextI = this.config.contextIndicator) === null || _this$config$contextI === void 0 ? void 0 : _this$config$contextI.enabled) !== false || this.transientContextIndicatorVisible);
    }
  }, {
    key: "showTransientContextIndicator",
    value: function showTransientContextIndicator() {
      this.transientContextIndicatorVisible = true;
      this.scheduleContextIndicatorUpdate();
    }
  }, {
    key: "showContextChange",
    value: function showContextChange(previousContextId) {
      var nextContextId = contextId(this.activeTypedContext || this.activeStructuralContext);
      if (previousContextId && nextContextId && previousContextId !== nextContextId) {
        this.showTransientContextIndicator();
      }
    }
  }, {
    key: "clearTransientContextIndicator",
    value: function clearTransientContextIndicator() {
      if (!this.transientContextIndicatorVisible) return;
      this.transientContextIndicatorVisible = false;
      this.scheduleContextIndicatorUpdate();
    }
  }, {
    key: "ensureContextIndicator",
    value: function ensureContextIndicator() {
      if (!this.active || !this.contextIndicatorShouldDisplay()) return;
      if (!this.contextIndicatorElement) {
        var element = this.document.createElement('div');
        element.className = 'openKeyNav-structural-context-outline';
        element.setAttribute('data-openkeynav-ui', 'structural-context-outline');
        element.setAttribute('aria-hidden', 'true');
        var _headingLevel = this.document.createElement('span');
        _headingLevel.className = 'openKeyNav-structural-context-heading-level';
        _headingLevel.setAttribute('data-openkeynav-ui', 'structural-context-heading-level');
        _headingLevel.setAttribute('aria-hidden', 'true');
        _headingLevel.hidden = true;
        this.contextIndicatorElement = element;
        this.contextIndicatorHeadingLevelElement = _headingLevel;
      }
      var host = this.contextIndicatorHost();
      if (host && this.contextIndicatorElement.parentNode !== host) {
        host.appendChild(this.contextIndicatorElement);
      }
      var headingLevel = this.contextIndicatorHeadingLevelElement;
      if (host && headingLevel && headingLevel.parentNode !== host) {
        host.appendChild(headingLevel);
      }
    }
  }, {
    key: "removeContextIndicator",
    value: function removeContextIndicator() {
      var _this$contextIndicato2, _this$contextIndicato3, _this$contextIndicato4;
      (_this$contextIndicato2 = this.contextIndicatorResizeObserver) === null || _this$contextIndicato2 === void 0 || _this$contextIndicato2.disconnect();
      this.contextIndicatorResizeObserver = null;
      this.contextIndicatorObservedElements.clear();
      (_this$contextIndicato3 = this.contextIndicatorElement) === null || _this$contextIndicato3 === void 0 || _this$contextIndicato3.remove();
      (_this$contextIndicato4 = this.contextIndicatorHeadingLevelElement) === null || _this$contextIndicato4 === void 0 || _this$contextIndicato4.remove();
      this.contextIndicatorElement = null;
      this.contextIndicatorHeadingLevelElement = null;
    }
  }, {
    key: "hideContextIndicator",
    value: function hideContextIndicator() {
      if (this.contextIndicatorElement) {
        this.contextIndicatorElement.style.display = 'none';
      }
      if (this.contextIndicatorHeadingLevelElement) {
        this.contextIndicatorHeadingLevelElement.hidden = true;
      }
    }
  }, {
    key: "updateContextIndicatorHeadingLevel",
    value: function updateContextIndicatorHeadingLevel(_ref10) {
      var _this$openKeyNav$conf;
      var context = _ref10.context,
        left = _ref10.left,
        top = _ref10.top,
        right = _ref10.right,
        bottom = _ref10.bottom,
        viewportWidth = _ref10.viewportWidth,
        viewportHeight = _ref10.viewportHeight,
        width = _ref10.width,
        color = _ref10.color;
      var tab = this.contextIndicatorHeadingLevelElement;
      var indicator = this.contextIndicatorElement;
      if (!tab || !indicator) return;
      var headingLevel = contextHeadingLevel(context);
      if (headingLevel === null) {
        tab.hidden = true;
        tab.textContent = '';
        delete indicator.dataset.headingLevel;
        delete indicator.dataset.headingTabPosition;
        delete tab.dataset.headingTabPosition;
        return;
      }
      tab.hidden = false;
      tab.textContent = "h".concat(headingLevel);
      indicator.dataset.headingLevel = String(headingLevel);
      tab.style.setProperty('--openkeynav-context-indicator-color', color);
      tab.style.setProperty('--openkeynav-context-indicator-text-color', ((_this$openKeyNav$conf = this.openKeyNav.config.spot) === null || _this$openKeyNav$conf === void 0 ? void 0 : _this$openKeyNav$conf.fontColor) || 'currentColor');
      tab.style.setProperty('--openkeynav-context-indicator-width', "".concat(width, "px"));
      var setPosition = function setPosition(position, tabLeft, tabTop) {
        indicator.dataset.headingTabPosition = position;
        tab.dataset.headingTabPosition = position;
        tab.style.left = "".concat(tabLeft, "px");
        tab.style.top = "".concat(tabTop, "px");
      };
      setPosition('inside', left, top);
      var tabRect = tab.getBoundingClientRect();
      var tabWidth = tabRect.width || tab.scrollWidth || 24;
      var tabHeight = tabRect.height || tab.scrollHeight || 24;
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
  }, {
    key: "contextIndicatorElements",
    value: function contextIndicatorElements(context) {
      var _context$visualElemen2;
      if (!context) return [];
      if (this.activeTypedContext) return contextTargets(context);
      if (context.source === 'heading' && (_context$visualElemen2 = context.visualElements) !== null && _context$visualElemen2 !== void 0 && _context$visualElemen2.length) {
        return context.visualElements;
      }
      if ((0, _domUtilities.isShadowRoot)(context.boundary)) return [context.boundary.host];
      if ((0, _domUtilities.isElement)(context.boundary)) return [context.boundary];
      return contextTargets(context);
    }
  }, {
    key: "observeContextIndicatorElements",
    value: function observeContextIndicatorElements(elements) {
      var _this$document15,
        _this11 = this;
      var ResizeObserverClass = (_this$document15 = this.document) === null || _this$document15 === void 0 || (_this$document15 = _this$document15.defaultView) === null || _this$document15 === void 0 ? void 0 : _this$document15.ResizeObserver;
      if (typeof ResizeObserverClass !== 'function') return;
      var nextElements = new Set(elements.filter(_domUtilities.isElement));
      if (nextElements.size === this.contextIndicatorObservedElements.size && Array.from(nextElements).every(function (element) {
        return _this11.contextIndicatorObservedElements.has(element);
      })) {
        return;
      }
      if (!this.contextIndicatorResizeObserver) {
        this.contextIndicatorResizeObserver = new ResizeObserverClass(this.scheduleContextIndicatorUpdate);
      }
      this.contextIndicatorResizeObserver.disconnect();
      nextElements.forEach(function (element) {
        _this11.contextIndicatorResizeObserver.observe(element);
      });
      this.contextIndicatorObservedElements = nextElements;
    }
  }, {
    key: "updateContextIndicator",
    value: function updateContextIndicator() {
      var _this$document$docume, _this$document$docume2, _this$openKeyNav$conf2, _this$openKeyNav$conf3;
      if (!this.active || !this.contextIndicatorShouldDisplay()) {
        var _this$contextIndicato5;
        this.hideContextIndicator();
        (_this$contextIndicato5 = this.contextIndicatorResizeObserver) === null || _this$contextIndicato5 === void 0 || _this$contextIndicato5.disconnect();
        this.contextIndicatorObservedElements.clear();
        return;
      }
      this.ensureContextIndicator();
      var indicator = this.contextIndicatorElement;
      var context = this.activeTypedContext || this.activeStructuralContext;
      if (!indicator || !context) {
        this.hideContextIndicator();
        return;
      }
      var view = this.document.defaultView;
      var viewportWidth = (view === null || view === void 0 ? void 0 : view.innerWidth) || ((_this$document$docume = this.document.documentElement) === null || _this$document$docume === void 0 ? void 0 : _this$document$docume.clientWidth) || 0;
      var viewportHeight = (view === null || view === void 0 ? void 0 : view.innerHeight) || ((_this$document$docume2 = this.document.documentElement) === null || _this$document$docume2 === void 0 ? void 0 : _this$document$docume2.clientHeight) || 0;
      var elements = this.contextIndicatorElements(context);
      var rect;
      if ((0, _domUtilities.isDocument)(context.boundary)) {
        elements = [this.document.documentElement].filter(Boolean);
        rect = {
          left: 0,
          top: 0,
          right: viewportWidth,
          bottom: viewportHeight
        };
      } else {
        var rects = elements.flatMap(elementClientRects);
        if (!rects.length && (0, _domUtilities.isElement)(context.boundary)) {
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
      var offset = CONTEXT_INDICATOR_OFFSET;
      var left = Math.max(0, rect.left - offset);
      var top = Math.max(0, rect.top - offset);
      var right = Math.min(viewportWidth, rect.right + offset);
      var bottom = Math.min(viewportHeight, rect.bottom + offset);
      if (right <= left || bottom <= top) {
        this.hideContextIndicator();
        return;
      }
      var width = CONTEXT_INDICATOR_WIDTH;
      var color = ((_this$openKeyNav$conf2 = this.openKeyNav.config.spot) === null || _this$openKeyNav$conf2 === void 0 ? void 0 : _this$openKeyNav$conf2.backgroundColor) || 'currentColor';
      var contrastColor = ((_this$openKeyNav$conf3 = this.openKeyNav.config.spot) === null || _this$openKeyNav$conf3 === void 0 ? void 0 : _this$openKeyNav$conf3.fontColor) || 'currentColor';
      indicator.style.display = 'block';
      indicator.style.left = "".concat(left, "px");
      indicator.style.top = "".concat(top, "px");
      indicator.style.width = "".concat(right - left, "px");
      indicator.style.height = "".concat(bottom - top, "px");
      indicator.style.border = "".concat(width, "px dashed ").concat(color);
      indicator.style.boxShadow = "0 0 0 ".concat(CONTEXT_INDICATOR_CONTRAST_WIDTH, "px ").concat(contrastColor);
      this.updateContextIndicatorHeadingLevel({
        context: context,
        left: left,
        top: top,
        right: right,
        bottom: bottom,
        viewportWidth: viewportWidth,
        viewportHeight: viewportHeight,
        width: width,
        color: color
      });
      indicator.dataset.contextId = String(contextId(context) || '');
      indicator.dataset.contextName = context.name || 'Document';
      indicator.dataset.contextType = this.activeTypedContext ? this.activeTypedContext.type || 'typed' : 'structural';
    }
  }, {
    key: "updateStatus",
    value: function updateStatus() {
      var _this$config$status, _this$config$status2, _this$config$status3;
      var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var _ref11 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref11$force = _ref11.force,
        force = _ref11$force === void 0 ? false : _ref11$force;
      if (!this.active && !force) return;
      if (this.active) {
        this.scheduleContextIndicatorUpdate();
        this.scheduleKeylabelUpdate();
      }
      if (!((_this$config$status = this.config.status) !== null && _this$config$status !== void 0 && _this$config$status.enabled)) {
        this.openKeyNav.clearStatus(STRUCTURAL_STATUS_CHANNEL);
        return;
      }
      var route = this.activeTypedContext || this.activeStructuralContext;
      var sequence = this.activeSequence();
      var index = sequence.indexOf(this.currentTarget);
      var contextName = (route === null || route === void 0 ? void 0 : route.name) || 'Document';
      var targetDescription = this.currentTarget ? "".concat(targetName(this.currentTarget), ", ").concat(index >= 0 ? index + 1 : '?', " of ").concat(sequence.length) : "".concat(sequence.length, " available ").concat(sequence.length === 1 ? 'target' : 'targets');
      var structuralContext = this.activeTypedContext ? directContextForTarget(this.model, this.currentTarget) || this.activeStructuralContext || this.model.rootContext : this.activeStructuralContext || this.model.rootContext;
      var headingContext = headingContextForRoute(this.model, structuralContext, this.currentTarget);
      var headingLevel = contextHeadingLevel(headingContext);
      var headingDescription = headingLevel === null ? '' : this.activeTypedContext ? "Underlying heading level: ".concat(headingLevel, ".") : "Heading level: ".concat(headingLevel, ".");
      var typedContexts = typedContextsForTarget(this.model, this.currentTarget);
      var typedDescription = typedContexts.length ? "".concat(typedContexts.length, " alternate ").concat(typedContexts.length === 1 ? 'route' : 'routes', " available.") : '';
      var dismissLabel = shortcutLabel((_this$config$status2 = this.config.status) === null || _this$config$status2 === void 0 ? void 0 : _this$config$status2.dismissCommand);
      var dismissDescription = dismissLabel && this.config.debug === true && ((_this$config$status3 = this.config.status) === null || _this$config$status3 === void 0 ? void 0 : _this$config$status3.visible) !== false && !this.statusDismissed ? "".concat(dismissLabel, " to close.") : '';
      var contextDescription = this.activeTypedContext ? "Typed context: ".concat(contextName, ".") : "Context: ".concat(contextName, ".");
      var message = [prefix, contextDescription, headingDescription, targetDescription ? "".concat(targetDescription, ".") : '', typedDescription].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      this.openKeyNav.setStatus(STRUCTURAL_STATUS_CHANNEL, message, {
        className: 'openKeyNav-structural-status',
        ui: 'structural-status',
        politeness: this.config.status.announcements === false ? 'off' : 'polite',
        visible: this.config.debug === true && this.config.status.visible !== false && !this.statusDismissed,
        hint: dismissDescription,
        toolName: this.openKeyNav.config.notifications.displayToolName,
        host: this.root,
        data: {
          contextId: String(contextId(route) || ''),
          contextType: this.activeTypedContext ? this.activeTypedContext.type || 'typed' : 'structural'
        }
      });
    }
  }, {
    key: "getState",
    value: function getState() {
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
        dirty: this.dirty
      };
    }
  }]);
}();