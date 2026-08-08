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
var ARROW_OWNING_ROLES = new Set(['combobox', 'grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'scrollbar', 'slider', 'spinbutton', 'tablist', 'toolbar', 'tree', 'treegrid']);
var ESCAPE_OWNING_ROLES = new Set([].concat(_toConsumableArray(ARROW_OWNING_ROLES), ['dialog']));
var TEXT_INPUT_TYPES = new Set(['date', 'datetime-local', 'email', 'month', 'number', 'password', 'range', 'search', 'tel', 'text', 'time', 'url', 'week']);
var SHORTCUT_MODIFIER_LABELS = Object.freeze({
  ctrlKey: 'Ctrl',
  altKey: 'Alt',
  shiftKey: 'Shift',
  metaKey: 'Meta'
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
  var normalized = (0, _keyboardEvents.normalizeShortcut)(shortcut);
  if (!normalized || normalized.altKey || normalized.ctrlKey || normalized.metaKey) {
    return '';
  }
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
  return "".concat(normalized.shiftKey ? _keylabels.KEYLABEL_SYMBOLS.shift : '').concat(keySymbol);
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
var targetAcceptsStructuralArrow = function targetAcceptsStructuralArrow(target, shortcut, config) {
  var event = shortcutEventForTarget(target, shortcut);
  if (!event || !event.key.startsWith('Arrow')) return false;
  var ownership = classifyStructuralKeyOwnership(event, config);
  if (ownership.all) return false;
  if (!ownership.arrows) return true;
  var overrideModifier = _keyboardEvents.MODIFIER_KEYS.includes(config.overrideModifier) ? config.overrideModifier : null;
  return Boolean(overrideModifier && event[overrideModifier]);
};
var nativeActivationSymbols = function nativeActivationSymbols(target) {
  if (!(0, _domUtilities.isElement)(target) || target.hasAttribute('disabled')) return [];
  var tagName = target.tagName.toLowerCase();
  var both = [_keylabels.KEYLABEL_SYMBOLS.enter, _keylabels.KEYLABEL_SYMBOLS.space];
  if (tagName === 'button' || tagName === 'summary') return both;
  if ((tagName === 'a' || tagName === 'area') && target.hasAttribute('href')) {
    return [_keylabels.KEYLABEL_SYMBOLS.enter];
  }
  if (tagName !== 'input') return [];
  var inputType = (target.getAttribute('type') || 'text').toLowerCase();
  if (['button', 'submit', 'reset', 'image'].includes(inputType)) return both;
  if (['checkbox', 'radio'].includes(inputType)) {
    return [_keylabels.KEYLABEL_SYMBOLS.space];
  }
  return [];
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
var contextChildren = function contextChildren(context) {
  if (!context) return [];
  return context.children || [];
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
    return contextHierarchyLevel(model, right) - contextHierarchyLevel(model, left) || contextTargets(left).length - contextTargets(right).length || contextOrder(left) - contextOrder(right);
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
var contextHierarchyLevel = function contextHierarchyLevel(model, context) {
  var level = 0;
  var current = context;
  var seen = new Set();
  while (current && !seen.has(current)) {
    seen.add(current);
    level += 1;
    current = parentContext(model, current);
  }
  return Math.max(1, level);
};
var normalizeContextChildren = function normalizeContextChildren(model, context) {
  return contextChildren(context).map(function (child) {
    return _typeof(child) === 'object' ? child : modelContextById(model, child);
  }).filter(Boolean);
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
var contextOrder = function contextOrder(context) {
  var order = Number(context === null || context === void 0 ? void 0 : context.order);
  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER;
};

/**
 * Heading-backed contexts use the authored heading level as their horizontal
 * lane, regardless of inferred container ancestry. Contexts without a heading
 * level use ordinary structural siblings.
 */
var horizontalContextPeers = function horizontalContextPeers(model, context) {
  var headingLevel = contextHeadingLevel(context);
  var structuralParent = parentContext(model, context);
  var contexts = headingLevel === null ? normalizeContextChildren(model, structuralParent) : modelStructuralContexts(model).filter(function (candidate) {
    return contextHeadingLevel(candidate) === headingLevel;
  });
  return {
    headingLevel: headingLevel,
    contexts: contexts.filter(function (candidate) {
      return contextTargets(candidate).length > 0;
    }).sort(function (left, right) {
      return contextOrder(left) - contextOrder(right) || String(contextId(left)).localeCompare(String(contextId(right)));
    })
  };
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
 * Finds the next page-forward context. A heading-backed context advances by
 * authored heading level. An unheaded context first enters an authored heading
 * at the next reported level, then falls back to inferred structural depth.
 */
var nextNarrowFallbackContext = function nextNarrowFallbackContext(model, context) {
  var headingLevel = contextHeadingLevel(context);
  if (headingLevel !== null && headingLevel >= 6) return null;
  var orderedContexts = modelStructuralContexts(model).filter(function (candidate) {
    return contextTargets(candidate).length > 0;
  }).sort(function (left, right) {
    return contextOrder(left) - contextOrder(right) || String(contextId(left)).localeCompare(String(contextId(right)));
  });
  var currentIndex = orderedContexts.indexOf(context);
  var followingContexts = currentIndex >= 0 ? orderedContexts.slice(currentIndex + 1) : orderedContexts;
  if (headingLevel !== null) {
    return followingContexts.find(function (candidate) {
      return contextHeadingLevel(candidate) === headingLevel + 1;
    }) || null;
  }
  var hierarchyLevel = contextHierarchyLevel(model, context);
  var nextHeadingContext = followingContexts.find(function (candidate) {
    return contextHeadingLevel(candidate) === hierarchyLevel + 1;
  });
  if (nextHeadingContext) return nextHeadingContext;
  return followingContexts.find(function (candidate) {
    return contextHeadingLevel(candidate) === null && contextHierarchyLevel(model, candidate) === hierarchyLevel + 1;
  }) || null;
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
    this.contextIndicatorFrame = null;
    this.contextIndicatorResizeObserver = null;
    this.contextIndicatorObservedElements = new Set();
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
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$announce = _ref.announce,
        announce = _ref$announce === void 0 ? true : _ref$announce;
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
      this.dirty = true;
      this.focusSyncToken += 1;
      if (announceExit) {
        this.openKeyNav.setStatus(STRUCTURAL_EXIT_STATUS_CHANNEL, 'Structural navigation off.', {
          className: 'openKeyNav-structural-exit-status',
          ui: 'structural-status',
          politeness: 'polite',
          visible: statusConfig.visible !== false && !statusWasDismissed,
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
      var dismissStatus = Boolean(dismissShortcut && statusConfig.enabled !== false && statusConfig.visible !== false && !this.statusDismissed && this.openKeyNav.getStatusElement(STRUCTURAL_STATUS_CHANNEL) && !pageOwnsDismissShortcut && matchesStructuralShortcut(event, dismissShortcut));
      if (dismissStatus) {
        (0, _keyboardEvents.preventAcceptedCommand)(event);
        this.statusDismissed = true;
        this.updateStatus('Status closed.');
        return true;
      }
      if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar' || event.key === 'Escape') {
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
        return false;
      }
      var commandEntries = Object.entries(this.config.commands || {});
      var exactMatch = commandEntries.find(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
          shortcut = _ref3[1];
        return matchesStructuralShortcut(event, shortcut);
      });
      // Option/Alt is an ownership override, not part of the structural arrow
      // chord. Once held, it may stay held as focus leaves a widget. Exact
      // bindings still win, and explicit modifier requirements remain exact.
      var matched = exactMatch || (isArrowKey && overridePressed ? commandEntries.find(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
          shortcut = _ref5[1];
        return matchesStructuralShortcut(event, shortcut, {
          allowedExtraModifiers: [overrideModifier]
        });
      }) : null);
      if (!matched) return false;
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
  }, {
    key: "refresh",
    value: function refresh() {
      var _this = this;
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
      var previousTarget = this.currentTarget;
      var targetFilter = typeof this.config.targetFilter === 'function' ? function (target) {
        return _this.config.targetFilter(target, {
          root: _this.root,
          openKeyNav: _this.openKeyNav
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
      this.scheduleContextIndicatorUpdate();
      if (!this.updatingKeylabels) this.scheduleKeylabelUpdate();
      return true;
    }
  }, {
    key: "synchronizeFocus",
    value: function synchronizeFocus() {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref6$preserveRoute = _ref6.preserveRoute,
        preserveRoute = _ref6$preserveRoute === void 0 ? true : _ref6$preserveRoute,
        _ref6$announce = _ref6.announce,
        announce = _ref6$announce === void 0 ? true : _ref6$announce,
        _ref6$refresh = _ref6.refresh,
        refresh = _ref6$refresh === void 0 ? true : _ref6$refresh;
      if (!this.active) return;
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
      this.scheduleKeylabelUpdate();
      if (announce) this.updateStatus();
    }
  }, {
    key: "handleFocusIn",
    value: function handleFocusIn() {
      var _this2 = this;
      if (!this.active) return;
      var token = ++this.focusSyncToken;
      setTimeout(function () {
        if (_this2.active && token === _this2.focusSyncToken) {
          _this2.synchronizeFocus({
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
    }
  }, {
    key: "invalidate",
    value: function invalidate() {
      if (this.active) {
        this.dirty = true;
        this.scheduleContextIndicatorUpdate();
        this.clearKeylabels();
      }
    }
  }, {
    key: "handleSlotChange",
    value: function handleSlotChange(event) {
      if ((0, _domUtilities.isOpenKeyNavGeneratedUI)(event.target)) return;
      this.dirty = true;
      this.scheduleContextIndicatorUpdate();
      this.clearKeylabels();
    }
  }, {
    key: "reconnectObservers",
    value: function reconnectObservers() {
      var _this3 = this;
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
        _this3.observer.observe(shadowRoot, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['aria-hidden', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-modal', 'checked', 'class', 'contenteditable', 'controls', 'disabled', 'href', 'hidden', 'id', 'inert', 'name', 'open', 'popover', 'role', 'style', 'tabindex', 'type']
        });
        shadowRoot.addEventListener('slotchange', _this3.handleSlotChange);
      });
    }
  }, {
    key: "disconnectObservers",
    value: function disconnectObservers() {
      var _this$observer,
        _this4 = this;
      (_this$observer = this.observer) === null || _this$observer === void 0 || _this$observer.disconnect();
      this.observer = null;
      this.observedShadowRoots.forEach(function (shadowRoot) {
        shadowRoot.removeEventListener('slotchange', _this4.handleSlotChange);
      });
      this.observedShadowRoots.clear();
    }
  }, {
    key: "activeSequence",
    value: function activeSequence() {
      var _this5 = this;
      return contextTargets(this.activeTypedContext || this.activeStructuralContext).filter(function (target) {
        return _this5.targetSet.has(target) && target.isConnected;
      });
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
    key: "focusTarget",
    value: function focusTarget(target) {
      var _this6 = this;
      if (!target || !this.targetSet.has(target) || !target.isConnected) {
        this.dirty = true;
        this.updateStatus('That target is no longer available.');
        return;
      }
      this.currentTarget = target;
      this.openKeyNav.focus(target);
      this.updateStatus();
      var token = ++this.focusSyncToken;
      setTimeout(function () {
        if (_this6.active && token === _this6.focusSyncToken) {
          _this6.synchronizeFocus({
            preserveRoute: true
          });
        }
      }, 0);
    }
  }, {
    key: "moveSiblingContext",
    value: function moveSiblingContext(direction) {
      this.useStructuralRoute();
      var _horizontalContextPee = horizontalContextPeers(this.model, this.activeStructuralContext),
        peers = _horizontalContextPee.contexts,
        headingLevel = _horizontalContextPee.headingLevel;
      var currentIndex = peers.indexOf(this.activeStructuralContext);
      var nextIndex = currentIndex + direction;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= peers.length) {
        var relation = headingLevel === null ? 'sibling context' : "peer context at heading level ".concat(headingLevel);
        this.updateStatus(direction > 0 ? "No next ".concat(relation, ".") : "No previous ".concat(relation, "."));
        return;
      }
      var peer = peers[nextIndex];
      var target = contextTargets(peer)[0];
      this.activeStructuralContext = peer;
      this.activeTypedContext = null;
      this.focusTarget(target);
    }
  }, {
    key: "broadenContext",
    value: function broadenContext() {
      this.useStructuralRoute();
      var headingParent = previousBroaderHeadingContext(this.model, this.activeStructuralContext);
      var parent = headingParent || parentContext(this.model, this.activeStructuralContext);
      if (!parent) {
        this.updateStatus('Already at the broadest context.');
        return;
      }
      this.activeStructuralContext = parent;
      if (headingParent) {
        this.focusTarget(contextTargets(parent)[0]);
      } else {
        this.updateStatus();
      }
    }
  }, {
    key: "narrowContext",
    value: function narrowContext() {
      var _this7 = this;
      this.useStructuralRoute();
      var activeContext = this.activeStructuralContext || this.model.rootContext;
      var child = this.currentTarget ? normalizeContextChildren(this.model, activeContext).find(function (context) {
        return contextTargets(context).includes(_this7.currentTarget);
      }) : null;
      if (child) {
        this.activeStructuralContext = child;
        this.updateStatus();
        return;
      }
      var headingLevel = contextHeadingLevel(activeContext);
      if (headingLevel !== null && headingLevel >= 6) {
        this.updateStatus('Already at heading level 6.');
        return;
      }
      var fallback = nextNarrowFallbackContext(this.model, activeContext);
      if (!fallback) {
        this.updateStatus(headingLevel === null ? "No next context at hierarchy level ".concat(contextHierarchyLevel(this.model, activeContext) + 1, ".") : "No next H".concat(headingLevel + 1, " context."));
        return;
      }
      this.activeStructuralContext = fallback;
      this.activeTypedContext = null;
      this.focusTarget(contextTargets(fallback)[0]);
    }
  }, {
    key: "cyclePeerContext",
    value: function cyclePeerContext(direction) {
      var _this8 = this;
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
      var currentIndex = this.activeTypedContext ? ring.findIndex(function (context) {
        return contextId(context) === contextId(_this8.activeTypedContext);
      }) : 0;
      var normalizedIndex = currentIndex < 0 ? 0 : currentIndex;
      var nextIndex = (normalizedIndex + direction + ring.length) % ring.length;
      this.activeTypedContext = ring[nextIndex];
      if (!this.activeTypedContext) {
        this.activeStructuralContext = directContextForTarget(this.model, this.currentTarget) || this.model.rootContext;
      }
      this.updateStatus();
    }
  }, {
    key: "useStructuralRoute",
    value: function useStructuralRoute() {
      if (!this.activeTypedContext) return;
      this.activeTypedContext = null;
      this.activeStructuralContext = directContextForTarget(this.model, this.currentTarget) || this.activeStructuralContext || this.model.rootContext;
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
        _this9 = this,
        _this$document9;
      if (!this.active || this.foregroundModeActive || ((_this$config$keylabel = this.config.keylabels) === null || _this$config$keylabel === void 0 ? void 0 : _this$config$keylabel.enabled) === false || this.keylabelUpdateFrame !== null || this.keylabelUpdateTimer !== null) {
        var _this$config$keylabel2;
        if (((_this$config$keylabel2 = this.config.keylabels) === null || _this$config$keylabel2 === void 0 ? void 0 : _this$config$keylabel2.enabled) === false) this.clearKeylabels();
        return;
      }
      var update = function update() {
        _this9.keylabelUpdateFrame = null;
        _this9.keylabelUpdateTimer = null;
        _this9.updateKeylabels();
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
      var _this$model3,
        _this0 = this;
      var assignments = [];
      var keylabelConfig = this.config.keylabels || {};
      var structuralRoute = (this.activeTypedContext && this.currentTarget ? directContextForTarget(this.model, this.currentTarget) : this.activeStructuralContext) || ((_this$model3 = this.model) === null || _this$model3 === void 0 ? void 0 : _this$model3.rootContext);
      var add = function add(target, symbols, command) {
        if (!target || !symbols || !_this0.targetSet.has(target)) return;
        assignments.push({
          target: target,
          symbols: symbols,
          command: command
        });
      };
      var addNativeFocusRoute = function addNativeFocusRoute(assignment) {
        var target = assignment === null || assignment === void 0 ? void 0 : assignment.target;
        if (!(target !== null && target !== void 0 && target.isConnected) || !(0, _domUtilities.isComposedWithin)(_this0.root, target)) return;
        assignments.push(assignment);
      };
      if (keylabelConfig.nativeArrows !== false) {
        nativeRadioArrowAssignments((0, _domUtilities.getDeepActiveElement)(this.root), this.root, this.config.displayCheck || 'full', this.config.targetFilter).forEach(addNativeFocusRoute);
      }
      if (keylabelConfig.horizontal !== false && this.currentTarget) {
        var _horizontalContextPee2 = horizontalContextPeers(this.model, structuralRoute),
          peers = _horizontalContextPee2.contexts;
        var currentIndex = peers.indexOf(structuralRoute);
        [[-1, 'previousSiblingContext'], [1, 'nextSiblingContext']].forEach(function (_ref7) {
          var _this0$config$command;
          var _ref8 = _slicedToArray(_ref7, 2),
            direction = _ref8[0],
            command = _ref8[1];
          var shortcut = (_this0$config$command = _this0.config.commands) === null || _this0$config$command === void 0 ? void 0 : _this0$config$command[command];
          var symbols = shortcutSymbols(shortcut);
          if (currentIndex < 0 || !symbols || !targetAcceptsStructuralArrow(_this0.currentTarget, shortcut, _this0.config)) {
            return;
          }
          var peer = peers[currentIndex + direction];
          add(contextTargets(peer)[0], symbols, command);
        });
      }
      if (keylabelConfig.vertical !== false && structuralRoute) {
        var commandSource = (0, _domUtilities.getDeepActiveElement)(this.root);
        var addVertical = function addVertical(command, target) {
          var _this0$config$command2;
          var shortcut = (_this0$config$command2 = _this0.config.commands) === null || _this0$config$command2 === void 0 ? void 0 : _this0$config$command2[command];
          var symbols = shortcutSymbols(shortcut);
          if (target === _this0.currentTarget || !symbols || !targetAcceptsStructuralArrow(commandSource, shortcut, _this0.config)) {
            return;
          }
          add(target, symbols, command);
        };
        var headingParent = previousBroaderHeadingContext(this.model, structuralRoute);
        if (headingParent) {
          addVertical('broadenContext', contextTargets(headingParent)[0]);
        }
        var child = this.currentTarget ? normalizeContextChildren(this.model, structuralRoute).find(function (context) {
          return contextTargets(context).includes(_this0.currentTarget);
        }) : null;
        if (!child) {
          var headingLevel = contextHeadingLevel(structuralRoute);
          var canNarrow = headingLevel === null || headingLevel < 6;
          var fallback = canNarrow ? nextNarrowFallbackContext(this.model, structuralRoute) : null;
          if (fallback) {
            addVertical('narrowContext', contextTargets(fallback)[0]);
          }
        }
      }
      if (keylabelConfig.activation !== false && this.currentTarget) {
        nativeActivationSymbols(this.currentTarget).forEach(function (symbols) {
          add(_this0.currentTarget, symbols, symbols === _keylabels.KEYLABEL_SYMBOLS.enter ? 'activateEnter' : 'activateSpace');
        });
      }

      // Familiar sequential-navigation hints are lowest priority when a Tab
      // route and a structural route reach the same target.
      if (keylabelConfig.tab !== false) {
        var tabTargets = this.targets.filter(function (target) {
          return target.tabIndex >= 0;
        });
        var _currentIndex = tabTargets.indexOf(this.currentTarget);
        if (_currentIndex >= 0) {
          add(tabTargets[_currentIndex - 1], "".concat(_keylabels.KEYLABEL_SYMBOLS.shift).concat(_keylabels.KEYLABEL_SYMBOLS.tab), 'previousTabTarget');
          add(tabTargets[_currentIndex + 1], _keylabels.KEYLABEL_SYMBOLS.tab, 'nextTabTarget');
        }
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
      var _this$document0;
      var view = (_this$document0 = this.document) === null || _this$document0 === void 0 ? void 0 : _this$document0.defaultView;
      view === null || view === void 0 || view.addEventListener('scroll', this.scheduleContextIndicatorUpdate, true);
      view === null || view === void 0 || view.addEventListener('resize', this.scheduleContextIndicatorUpdate);
    }
  }, {
    key: "disconnectContextIndicatorListeners",
    value: function disconnectContextIndicatorListeners() {
      var _this$document1, _this$contextIndicato;
      var view = (_this$document1 = this.document) === null || _this$document1 === void 0 ? void 0 : _this$document1.defaultView;
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
      var _this$document10,
        _this1 = this;
      if (!this.active) return;
      var view = (_this$document10 = this.document) === null || _this$document10 === void 0 ? void 0 : _this$document10.defaultView;
      if (typeof (view === null || view === void 0 ? void 0 : view.requestAnimationFrame) !== 'function') {
        this.updateContextIndicator();
        (0, _keylabels.repositionAssignedKeylabels)(this.openKeyNav, STRUCTURAL_KEYLABEL_OWNER);
        return;
      }
      if (this.contextIndicatorFrame !== null) return;
      this.contextIndicatorFrame = view.requestAnimationFrame(function () {
        _this1.contextIndicatorFrame = null;
        _this1.updateContextIndicator();
        (0, _keylabels.repositionAssignedKeylabels)(_this1.openKeyNav, STRUCTURAL_KEYLABEL_OWNER);
      });
    }
  }, {
    key: "contextIndicatorHost",
    value: function contextIndicatorHost() {
      var _this$document11, _this$document12;
      var activeModal = topmostNativeModal(this.document);
      if (activeModal && this.root === activeModal) return activeModal;
      return ((_this$document11 = this.document) === null || _this$document11 === void 0 ? void 0 : _this$document11.body) || ((_this$document12 = this.document) === null || _this$document12 === void 0 ? void 0 : _this$document12.documentElement) || null;
    }
  }, {
    key: "ensureContextIndicator",
    value: function ensureContextIndicator() {
      var _this$config$contextI;
      if (!this.active || ((_this$config$contextI = this.config.contextIndicator) === null || _this$config$contextI === void 0 ? void 0 : _this$config$contextI.enabled) === false) return;
      if (!this.contextIndicatorElement) {
        var element = this.document.createElement('div');
        element.className = 'openKeyNav-structural-context-outline';
        element.setAttribute('data-openkeynav-ui', 'structural-context-outline');
        element.setAttribute('aria-hidden', 'true');
        this.contextIndicatorElement = element;
      }
      var host = this.contextIndicatorHost();
      if (host && this.contextIndicatorElement.parentNode !== host) {
        host.appendChild(this.contextIndicatorElement);
      }
    }
  }, {
    key: "removeContextIndicator",
    value: function removeContextIndicator() {
      var _this$contextIndicato2, _this$contextIndicato3;
      (_this$contextIndicato2 = this.contextIndicatorResizeObserver) === null || _this$contextIndicato2 === void 0 || _this$contextIndicato2.disconnect();
      this.contextIndicatorResizeObserver = null;
      this.contextIndicatorObservedElements.clear();
      (_this$contextIndicato3 = this.contextIndicatorElement) === null || _this$contextIndicato3 === void 0 || _this$contextIndicato3.remove();
      this.contextIndicatorElement = null;
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
      var _this$document13,
        _this10 = this;
      var ResizeObserverClass = (_this$document13 = this.document) === null || _this$document13 === void 0 || (_this$document13 = _this$document13.defaultView) === null || _this$document13 === void 0 ? void 0 : _this$document13.ResizeObserver;
      if (typeof ResizeObserverClass !== 'function') return;
      var nextElements = new Set(elements.filter(_domUtilities.isElement));
      if (nextElements.size === this.contextIndicatorObservedElements.size && Array.from(nextElements).every(function (element) {
        return _this10.contextIndicatorObservedElements.has(element);
      })) {
        return;
      }
      if (!this.contextIndicatorResizeObserver) {
        this.contextIndicatorResizeObserver = new ResizeObserverClass(this.scheduleContextIndicatorUpdate);
      }
      this.contextIndicatorResizeObserver.disconnect();
      nextElements.forEach(function (element) {
        _this10.contextIndicatorResizeObserver.observe(element);
      });
      this.contextIndicatorObservedElements = nextElements;
    }
  }, {
    key: "updateContextIndicator",
    value: function updateContextIndicator() {
      var _this$config$contextI2, _this$document$docume, _this$document$docume2, _this$config$contextI3, _this$config$contextI4, _this$config$contextI5;
      if (!this.active || ((_this$config$contextI2 = this.config.contextIndicator) === null || _this$config$contextI2 === void 0 ? void 0 : _this$config$contextI2.enabled) === false) {
        var _this$contextIndicato4;
        if (this.contextIndicatorElement) {
          this.contextIndicatorElement.style.display = 'none';
        }
        (_this$contextIndicato4 = this.contextIndicatorResizeObserver) === null || _this$contextIndicato4 === void 0 || _this$contextIndicato4.disconnect();
        this.contextIndicatorObservedElements.clear();
        return;
      }
      this.ensureContextIndicator();
      var indicator = this.contextIndicatorElement;
      var context = this.activeTypedContext || this.activeStructuralContext;
      if (!indicator || !context) return;
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
        indicator.style.display = 'none';
        return;
      }
      var configuredOffset = Number((_this$config$contextI3 = this.config.contextIndicator) === null || _this$config$contextI3 === void 0 ? void 0 : _this$config$contextI3.offset);
      var offset = Number.isFinite(configuredOffset) ? Math.max(0, configuredOffset) : 4;
      var left = Math.max(0, rect.left - offset);
      var top = Math.max(0, rect.top - offset);
      var right = Math.min(viewportWidth, rect.right + offset);
      var bottom = Math.min(viewportHeight, rect.bottom + offset);
      if (right <= left || bottom <= top) {
        indicator.style.display = 'none';
        return;
      }
      var configuredWidth = Number((_this$config$contextI4 = this.config.contextIndicator) === null || _this$config$contextI4 === void 0 ? void 0 : _this$config$contextI4.width);
      var width = Number.isFinite(configuredWidth) ? Math.max(1, configuredWidth) : 3;
      var color = ((_this$config$contextI5 = this.config.contextIndicator) === null || _this$config$contextI5 === void 0 ? void 0 : _this$config$contextI5.color) || this.openKeyNav.config.focus.outlineColor || '#0088cc';
      indicator.style.display = 'block';
      indicator.style.left = "".concat(left, "px");
      indicator.style.top = "".concat(top, "px");
      indicator.style.width = "".concat(right - left, "px");
      indicator.style.height = "".concat(bottom - top, "px");
      indicator.style.border = "".concat(width, "px solid ").concat(color);
      indicator.dataset.contextId = String(contextId(context) || '');
      indicator.dataset.contextName = context.name || 'Document';
      indicator.dataset.contextType = this.activeTypedContext ? this.activeTypedContext.type || 'typed' : 'structural';
    }
  }, {
    key: "updateStatus",
    value: function updateStatus() {
      var _this$config$status, _this$config$status2, _this$config$status3;
      var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var _ref9 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref9$force = _ref9.force,
        force = _ref9$force === void 0 ? false : _ref9$force;
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
      var hierarchyContext = this.activeTypedContext ? directContextForTarget(this.model, this.currentTarget) || this.activeStructuralContext || this.model.rootContext : this.activeStructuralContext || this.model.rootContext;
      var headingLevel = contextHeadingLevel(hierarchyContext);
      var reportedLevel = headingLevel !== null && headingLevel !== void 0 ? headingLevel : contextHierarchyLevel(this.model, hierarchyContext);
      var hierarchyDescription = this.activeTypedContext ? headingLevel === null ? "Underlying hierarchy level: ".concat(reportedLevel, ".") : "Underlying heading level: ".concat(reportedLevel, ".") : headingLevel === null ? "Hierarchy level: ".concat(reportedLevel, ".") : "Heading level: ".concat(reportedLevel, ".");
      var typedContexts = typedContextsForTarget(this.model, this.currentTarget);
      var typedDescription = typedContexts.length ? "".concat(typedContexts.length, " alternate ").concat(typedContexts.length === 1 ? 'route' : 'routes', " available.") : '';
      var dismissLabel = shortcutLabel((_this$config$status2 = this.config.status) === null || _this$config$status2 === void 0 ? void 0 : _this$config$status2.dismissCommand);
      var dismissDescription = dismissLabel && ((_this$config$status3 = this.config.status) === null || _this$config$status3 === void 0 ? void 0 : _this$config$status3.visible) !== false && !this.statusDismissed ? "".concat(dismissLabel, " to close.") : '';
      var contextDescription = this.activeTypedContext ? "Typed context: ".concat(contextName, ".") : "Context: ".concat(contextName, ".");
      var message = [prefix, contextDescription, hierarchyDescription, targetDescription ? "".concat(targetDescription, ".") : '', typedDescription].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      this.openKeyNav.setStatus(STRUCTURAL_STATUS_CHANNEL, message, {
        className: 'openKeyNav-structural-status',
        ui: 'structural-status',
        politeness: this.config.status.announcements === false ? 'off' : 'polite',
        visible: this.config.status.visible !== false && !this.statusDismissed,
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