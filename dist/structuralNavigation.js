"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchesStructuralShortcut = exports.classifyStructuralKeyOwnership = exports.StructuralNavigationController = exports.STRUCTURAL_NAVIGATION_COMMANDS = void 0;
var _structuralModel = require("./structuralModel.js");
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
var MODIFIER_KEYS = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
var ARROW_OWNING_ROLES = new Set(['combobox', 'grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'scrollbar', 'slider', 'spinbutton', 'tablist', 'toolbar', 'tree', 'treegrid']);
var ESCAPE_OWNING_ROLES = new Set([].concat(_toConsumableArray(ARROW_OWNING_ROLES), ['dialog']));
var TEXT_INPUT_TYPES = new Set(['date', 'datetime-local', 'email', 'month', 'number', 'password', 'range', 'search', 'tel', 'text', 'time', 'url', 'week']);
var isElement = function isElement(node) {
  return Boolean(node && node.nodeType === 1);
};
var isDocument = function isDocument(node) {
  return Boolean(node && node.nodeType === 9);
};
var isShadowRoot = function isShadowRoot(node) {
  return Boolean(node && node.nodeType === 11 && node.host && isElement(node.host));
};
var composedParent = function composedParent(node) {
  if (!node) return null;
  if (node.assignedSlot) return node.assignedSlot;
  if (isShadowRoot(node)) return node.host;
  return node.parentNode || null;
};
var isWithinRoot = function isWithinRoot(root, node) {
  var current = node;
  while (current) {
    if (current === root) return true;
    current = composedParent(current);
  }
  return false;
};
var normalizeShortcut = function normalizeShortcut(shortcut) {
  if (!shortcut) return null;
  if (typeof shortcut === 'string') return {
    key: shortcut
  };
  if (_typeof(shortcut) === 'object' && typeof shortcut.key === 'string') {
    return shortcut;
  }
  return null;
};
var keysEqual = function keysEqual(left, right) {
  if (left.length === 1 && right.length === 1) {
    return left.toLowerCase() === right.toLowerCase();
  }
  return left === right;
};

/**
 * Matches one exact configured shortcut. Unspecified modifiers are false.
 * `ignoredModifier` is used only for the deliberate widget override modifier.
 */
var matchesStructuralShortcut = exports.matchesStructuralShortcut = function matchesStructuralShortcut(event, shortcut) {
  var ignoredModifier = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var normalized = normalizeShortcut(shortcut);
  if (!normalized || !keysEqual(event.key, normalized.key)) return false;
  return MODIFIER_KEYS.every(function (modifier) {
    if (modifier === ignoredModifier) return true;
    return Boolean(event[modifier]) === Boolean(normalized[modifier]);
  });
};
var getEventPath = function getEventPath(event) {
  if (typeof event.composedPath === 'function') {
    var _path = event.composedPath();
    if (_path.length) return _path;
  }
  var path = [];
  var current = event.target;
  while (current) {
    path.push(current);
    current = composedParent(current);
  }
  return path;
};
var hasEditableContent = function hasEditableContent(element) {
  if (!isElement(element)) return false;
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
  if (!isElement(element)) return ownership;
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
 * Heading-backed contexts move horizontally by authored heading rank, even
 * when those contexts have different structural parents. Contexts without a
 * heading rank retain ordinary same-parent sibling behavior.
 */
var horizontalContextPeers = function horizontalContextPeers(model, context) {
  var headingLevel = contextHeadingLevel(context);
  var contexts = headingLevel === null ? normalizeContextChildren(model, parentContext(model, context)) : modelStructuralContexts(model).filter(function (candidate) {
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
var targetName = function targetName(target) {
  var _target$getAttribute, _target$getAttribute2, _target$getAttribute3, _target$getAttribute4, _target$tagName;
  if (!target) return '';
  var current = target;
  while (current) {
    if (isElement(current) && current.getAttribute('aria-hidden') === 'true') {
      return target.tagName ? target.tagName.toLowerCase() : 'target';
    }
    current = composedParent(current);
  }
  var ariaLabel = (_target$getAttribute = target.getAttribute) === null || _target$getAttribute === void 0 || (_target$getAttribute = _target$getAttribute.call(target, 'aria-label')) === null || _target$getAttribute === void 0 ? void 0 : _target$getAttribute.trim();
  if (ariaLabel) return ariaLabel;
  var labelledBy = (_target$getAttribute2 = target.getAttribute) === null || _target$getAttribute2 === void 0 ? void 0 : _target$getAttribute2.call(target, 'aria-labelledby');
  if (labelledBy) {
    var root = target.getRootNode();
    var labels = labelledBy.split(/\s+/).map(function (id) {
      var _root$getElementById;
      return ((_root$getElementById = root.getElementById) === null || _root$getElementById === void 0 ? void 0 : _root$getElementById.call(root, id)) || target.ownerDocument.getElementById(id);
    }).filter(Boolean).map(function (element) {
      return element.textContent.trim();
    }).filter(Boolean);
    if (labels.length) return labels.join(' ');
  }
  var labelText = Array.from(target.labels || []).map(function (label) {
    return label.textContent.trim();
  }).filter(Boolean).join(' ');
  if (labelText) return labelText;
  var value = ((_target$getAttribute3 = target.getAttribute) === null || _target$getAttribute3 === void 0 ? void 0 : _target$getAttribute3.call(target, 'title')) || ((_target$getAttribute4 = target.getAttribute) === null || _target$getAttribute4 === void 0 ? void 0 : _target$getAttribute4.call(target, 'name')) || target.textContent;
  var normalized = String(value || '').replace(/\s+/g, ' ').trim();
  return normalized.slice(0, 80) || ((_target$tagName = target.tagName) === null || _target$tagName === void 0 ? void 0 : _target$tagName.toLowerCase()) || 'target';
};
var topmostNativeModal = function topmostNativeModal(documentObject) {
  if (!(documentObject !== null && documentObject !== void 0 && documentObject.querySelectorAll)) return null;
  try {
    var modals = Array.from(documentObject.querySelectorAll('dialog:modal'));
    var focused = (0, _tabbableTargets.getDeepActiveElement)(documentObject);
    var focusedModals = modals.filter(function (modal) {
      return isWithinRoot(modal, focused);
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
    if (isShadowRoot(scope)) roots.add(scope);
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
    var element = isElement(node) ? node : node.parentElement || mutation.target;
    return element && (0, _tabbableTargets.isOpenKeyNavGeneratedUI)(element);
  });
};
var preventAcceptedCommand = function preventAcceptedCommand(event) {
  event.preventDefault();
  event.stopPropagation();
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
    this.scheduleContextIndicatorUpdate = this.scheduleContextIndicatorUpdate.bind(this);
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
    key: "resolveActiveRoot",
    value: function resolveActiveRoot() {
      var details = {
        document: this.document,
        openKeyNav: this.openKeyNav,
        activeElement: (0, _tabbableTargets.getDeepActiveElement)(this.document)
      };
      var configured = resolveSelectorRoot(resolveValue(this.config.activeRoot, details), this.document);
      var customRoot = isDocument(configured) || isShadowRoot(configured) && configured.host.isConnected || isElement(configured) && configured.isConnected ? configured : null;
      var modal = topmostNativeModal(this.document);
      if (!modal) return customRoot || this.document;
      if (customRoot && customRoot !== this.document && isWithinRoot(modal, customRoot)) {
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
        this.document.addEventListener('focusin', this.handleFocusIn, true);
        this.document.addEventListener('change', this.invalidate, true);
        this.document.addEventListener('toggle', this.invalidate, true);
        this.document.addEventListener('beforetoggle', this.invalidate, true);
        (_this$document$defaul = this.document.defaultView) === null || _this$document$defaul === void 0 || _this$document$defaul.addEventListener('popstate', this.invalidate);
        this.connectContextIndicatorListeners();
        this.refresh();
        this.ensureStatus();
        this.updateStatus('Structural navigation active.');
        return true;
      }
      if (this.openKeyNav.config.modes.clicking.value || this.openKeyNav.config.modes.moving.value || this.openKeyNav.config.modes.menu.value) {
        this.openKeyNav.removeOverlays(true);
      }
      this.openKeyNav.config.modes.structuralNavigation.value = true;
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
      this.ensureStatus();
      this.updateStatus('Structural navigation active.');
      return true;
    }
  }, {
    key: "deactivate",
    value: function deactivate() {
      var _this$document, _this$document2, _this$document3, _this$document4, _this$document5, _this$statusElement;
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$announce = _ref.announce,
        announce = _ref$announce === void 0 ? true : _ref$announce;
      if (!this.active && !this.model && !this.observer && !this.statusElement && !this.contextIndicatorElement) {
        return false;
      }
      if (announce) {
        var _this$config$status, _this$config$status2;
        this.updateStatus('Structural navigation off.', {
          force: true
        });
        if ((_this$config$status = this.config.status) !== null && _this$config$status !== void 0 && _this$config$status.enabled && ((_this$config$status2 = this.config.status) === null || _this$config$status2 === void 0 ? void 0 : _this$config$status2.announcements) !== false && typeof this.openKeyNav.emitNotification === 'function') {
          this.openKeyNav.emitNotification('Structural navigation off.');
        }
      }
      this.openKeyNav.config.modes.structuralNavigation.value = false;
      (_this$document = this.document) === null || _this$document === void 0 || _this$document.removeEventListener('focusin', this.handleFocusIn, true);
      (_this$document2 = this.document) === null || _this$document2 === void 0 || _this$document2.removeEventListener('change', this.invalidate, true);
      (_this$document3 = this.document) === null || _this$document3 === void 0 || _this$document3.removeEventListener('toggle', this.invalidate, true);
      (_this$document4 = this.document) === null || _this$document4 === void 0 || _this$document4.removeEventListener('beforetoggle', this.invalidate, true);
      (_this$document5 = this.document) === null || _this$document5 === void 0 || (_this$document5 = _this$document5.defaultView) === null || _this$document5 === void 0 || _this$document5.removeEventListener('popstate', this.invalidate);
      this.disconnectContextIndicatorListeners();
      this.disconnectObservers();
      (_this$statusElement = this.statusElement) === null || _this$statusElement === void 0 || _this$statusElement.remove();
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
        preventAcceptedCommand(event);
        this.activate();
        return true;
      }
      if (!this.model) this.activate();
      var defaultExit = {
        key: this.openKeyNav.config.keys.structuralNavigation,
        altKey: true
      };
      var exitShortcut = normalizeShortcut(this.config.exitCommand) || defaultExit;
      var plainToggle = matchesStructuralShortcut(event, activationShortcut);
      var configuredExit = matchesStructuralShortcut(event, exitShortcut);
      var openKeyNavExit = matchesStructuralShortcut(event, {
        key: this.openKeyNav.config.keys.escape
      });
      var safeEscape = this.config.escapeExits && event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && !ownership.escape;
      if (configuredExit || safeEscape || (plainToggle || openKeyNavExit) && !ownership.character) {
        preventAcceptedCommand(event);
        this.deactivate();
        return true;
      }
      if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar' || event.key === 'Escape') {
        return false;
      }
      var isArrowKey = event.key.startsWith('Arrow');
      var isCharacterKey = event.key.length === 1;
      var ownsArrow = isArrowKey && ownership.arrows;
      var overrideModifier = this.config.overrideModifier;
      var override = ownsArrow && MODIFIER_KEYS.includes(overrideModifier) && Boolean(event[overrideModifier]);
      if (ownership.all || ownsArrow && !override || isCharacterKey && ownership.character) {
        return false;
      }
      var commandEntries = Object.entries(this.config.commands || {});
      var matched = commandEntries.find(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
          shortcut = _ref3[1];
        return matchesStructuralShortcut(event, shortcut, override ? overrideModifier : null);
      });
      if (!matched) return false;
      preventAcceptedCommand(event);
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
      var focused = (0, _tabbableTargets.getDeepActiveElement)(this.root);
      this.currentTarget = this.targetSet.has(focused) ? focused : this.targetSet.has(previousTarget) ? previousTarget : null;
      var preservedStructural = modelContextById(this.model, previousStructuralId);
      var direct = directContextForTarget(this.model, this.currentTarget);
      this.activeStructuralContext = preservedStructural && (!this.currentTarget || contextTargets(preservedStructural).includes(this.currentTarget)) ? preservedStructural : direct || this.model.rootContext;
      var preservedTyped = modelTypedContextById(this.model, previousTypedId);
      this.activeTypedContext = preservedTyped && this.currentTarget && contextTargets(preservedTyped).includes(this.currentTarget) ? preservedTyped : null;
      this.ensureStatus();
      this.scheduleContextIndicatorUpdate();
      return true;
    }
  }, {
    key: "synchronizeFocus",
    value: function synchronizeFocus() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref4$preserveRoute = _ref4.preserveRoute,
        preserveRoute = _ref4$preserveRoute === void 0 ? true : _ref4$preserveRoute,
        _ref4$announce = _ref4.announce,
        announce = _ref4$announce === void 0 ? true : _ref4$announce,
        _ref4$refresh = _ref4.refresh,
        refresh = _ref4$refresh === void 0 ? true : _ref4$refresh;
      if (!this.active) return;
      if (refresh) this.refresh();
      var focused = (0, _tabbableTargets.getDeepActiveElement)(this.root);
      if (!this.targetSet.has(focused)) {
        this.currentTarget = null;
        this.activeTypedContext = null;
        if (!this.activeStructuralContext) {
          var _this$model;
          this.activeStructuralContext = ((_this$model = this.model) === null || _this$model === void 0 ? void 0 : _this$model.rootContext) || null;
        }
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
    }
  }, {
    key: "invalidate",
    value: function invalidate() {
      if (this.active) {
        this.dirty = true;
        this.scheduleContextIndicatorUpdate();
      }
    }
  }, {
    key: "handleSlotChange",
    value: function handleSlotChange(event) {
      if ((0, _tabbableTargets.isOpenKeyNavGeneratedUI)(event.target)) return;
      this.dirty = true;
      this.scheduleContextIndicatorUpdate();
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
      target.focus();
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
        var relation = headingLevel === null ? 'sibling context' : "context at heading level ".concat(headingLevel);
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
      var parent = parentContext(this.model, this.activeStructuralContext);
      if (!parent) {
        this.updateStatus('Already at the broadest context.');
        return;
      }
      this.activeStructuralContext = parent;
      this.updateStatus('Broadened context.');
    }
  }, {
    key: "narrowContext",
    value: function narrowContext() {
      var _this7 = this;
      this.useStructuralRoute();
      if (!this.currentTarget) {
        this.updateStatus('No current target identifies a child context.');
        return;
      }
      var child = normalizeContextChildren(this.model, this.activeStructuralContext).find(function (context) {
        return contextTargets(context).includes(_this7.currentTarget);
      });
      if (!child) {
        this.updateStatus('No narrower context contains the current target.');
        return;
      }
      this.activeStructuralContext = child;
      this.updateStatus('Narrowed context.');
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
      this.updateStatus(this.activeTypedContext ? "Using ".concat(this.activeTypedContext.name, ".") : 'Using structural context.');
    }
  }, {
    key: "useStructuralRoute",
    value: function useStructuralRoute() {
      if (!this.activeTypedContext) return;
      this.activeTypedContext = null;
      this.activeStructuralContext = directContextForTarget(this.model, this.currentTarget) || this.activeStructuralContext || this.model.rootContext;
    }
  }, {
    key: "connectContextIndicatorListeners",
    value: function connectContextIndicatorListeners() {
      var _this$document6;
      var view = (_this$document6 = this.document) === null || _this$document6 === void 0 ? void 0 : _this$document6.defaultView;
      view === null || view === void 0 || view.addEventListener('scroll', this.scheduleContextIndicatorUpdate, true);
      view === null || view === void 0 || view.addEventListener('resize', this.scheduleContextIndicatorUpdate);
    }
  }, {
    key: "disconnectContextIndicatorListeners",
    value: function disconnectContextIndicatorListeners() {
      var _this$document7, _this$contextIndicato;
      var view = (_this$document7 = this.document) === null || _this$document7 === void 0 ? void 0 : _this$document7.defaultView;
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
      var _this$document8,
        _this9 = this;
      if (!this.active) return;
      var view = (_this$document8 = this.document) === null || _this$document8 === void 0 ? void 0 : _this$document8.defaultView;
      if (typeof (view === null || view === void 0 ? void 0 : view.requestAnimationFrame) !== 'function') {
        this.updateContextIndicator();
        return;
      }
      if (this.contextIndicatorFrame !== null) return;
      this.contextIndicatorFrame = view.requestAnimationFrame(function () {
        _this9.contextIndicatorFrame = null;
        _this9.updateContextIndicator();
      });
    }
  }, {
    key: "contextIndicatorHost",
    value: function contextIndicatorHost() {
      var _this$document9, _this$document0;
      var activeModal = topmostNativeModal(this.document);
      if (activeModal && this.root === activeModal) return activeModal;
      return ((_this$document9 = this.document) === null || _this$document9 === void 0 ? void 0 : _this$document9.body) || ((_this$document0 = this.document) === null || _this$document0 === void 0 ? void 0 : _this$document0.documentElement) || null;
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
        element.style.boxSizing = 'border-box';
        element.style.position = 'fixed';
        element.style.zIndex = '2147483646';
        element.style.pointerEvents = 'none';
        element.style.background = 'transparent';
        element.style.borderRadius = '4px';
        element.style.display = 'none';
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
      var _context$visualElemen;
      if (!context) return [];
      if (this.activeTypedContext) return contextTargets(context);
      if (context.source === 'heading' && (_context$visualElemen = context.visualElements) !== null && _context$visualElemen !== void 0 && _context$visualElemen.length) {
        return context.visualElements;
      }
      if (isShadowRoot(context.boundary)) return [context.boundary.host];
      if (isElement(context.boundary)) return [context.boundary];
      return contextTargets(context);
    }
  }, {
    key: "observeContextIndicatorElements",
    value: function observeContextIndicatorElements(elements) {
      var _this$document1,
        _this0 = this;
      var ResizeObserverClass = (_this$document1 = this.document) === null || _this$document1 === void 0 || (_this$document1 = _this$document1.defaultView) === null || _this$document1 === void 0 ? void 0 : _this$document1.ResizeObserver;
      if (typeof ResizeObserverClass !== 'function') return;
      var nextElements = new Set(elements.filter(isElement));
      if (nextElements.size === this.contextIndicatorObservedElements.size && Array.from(nextElements).every(function (element) {
        return _this0.contextIndicatorObservedElements.has(element);
      })) {
        return;
      }
      if (!this.contextIndicatorResizeObserver) {
        this.contextIndicatorResizeObserver = new ResizeObserverClass(this.scheduleContextIndicatorUpdate);
      }
      this.contextIndicatorResizeObserver.disconnect();
      nextElements.forEach(function (element) {
        _this0.contextIndicatorResizeObserver.observe(element);
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
      if (isDocument(context.boundary)) {
        elements = [this.document.documentElement].filter(Boolean);
        rect = {
          left: 0,
          top: 0,
          right: viewportWidth,
          bottom: viewportHeight
        };
      } else {
        var rects = elements.flatMap(elementClientRects);
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
      var color = ((_this$config$contextI5 = this.config.contextIndicator) === null || _this$config$contextI5 === void 0 ? void 0 : _this$config$contextI5.color) || '#0088cc';
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
    key: "statusHost",
    value: function statusHost() {
      if (isShadowRoot(this.root)) return this.root;
      if (isElement(this.root) && !['INPUT', 'SELECT', 'TEXTAREA'].includes(this.root.tagName)) {
        return this.root;
      }
      return this.document.body || this.document.documentElement;
    }
  }, {
    key: "ensureStatus",
    value: function ensureStatus() {
      var _this$config$status3;
      if (!this.active || !((_this$config$status3 = this.config.status) !== null && _this$config$status3 !== void 0 && _this$config$status3.enabled)) return;
      if (!this.statusElement) {
        var element = this.document.createElement('div');
        element.className = 'openKeyNav-structural-status';
        element.setAttribute('data-openkeynav-ui', 'structural-status');
        element.setAttribute('role', 'status');
        element.setAttribute('aria-live', this.config.status.announcements === false ? 'off' : 'polite');
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
      var host = this.statusHost();
      if (host && this.statusElement.parentNode !== host) {
        host.appendChild(this.statusElement);
      }
    }
  }, {
    key: "updateStatus",
    value: function updateStatus() {
      var _this1 = this;
      var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref5$force = _ref5.force,
        force = _ref5$force === void 0 ? false : _ref5$force;
      if (!this.active && !force) return;
      if (this.active) this.scheduleContextIndicatorUpdate();
      this.ensureStatus();
      if (!this.statusElement) return;
      var route = this.activeTypedContext || this.activeStructuralContext;
      var sequence = this.activeSequence();
      var index = sequence.indexOf(this.currentTarget);
      var contextName = (route === null || route === void 0 ? void 0 : route.name) || 'Document';
      var targetDescription = this.currentTarget ? "".concat(targetName(this.currentTarget), ", ").concat(index >= 0 ? index + 1 : '?', " of ").concat(sequence.length) : "".concat(sequence.length, " available ").concat(sequence.length === 1 ? 'target' : 'targets');
      var horizontalPeers = horizontalContextPeers(this.model, this.activeStructuralContext);
      var otherHorizontalContexts = horizontalPeers.contexts.filter(function (context) {
        return context !== _this1.activeStructuralContext;
      });
      var typedContexts = typedContextsForTarget(this.model, this.currentTarget);
      var siblingDescription = otherHorizontalContexts.length ? " ".concat(horizontalPeers.headingLevel === null ? 'Sibling contexts' : "Same-level contexts (heading level ".concat(horizontalPeers.headingLevel, ")"), ": ").concat(otherHorizontalContexts.map(function (context) {
        return context.name;
      }).join(', '), ".") : '';
      var typedDescription = typedContexts.length ? " Typed contexts: ".concat(typedContexts.map(function (context) {
        return context.name;
      }).join(', '), ".") : '';
      var message = [prefix, "Context: ".concat(contextName, "."), targetDescription ? "".concat(targetDescription, ".") : '', siblingDescription, typedDescription].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      if (message === this.lastStatus) return;
      this.lastStatus = message;
      this.statusElement.textContent = message;
      this.statusElement.dataset.contextId = String(contextId(route) || '');
      this.statusElement.dataset.contextType = this.activeTypedContext ? this.activeTypedContext.type || 'typed' : 'structural';
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
        dirty: this.dirty
      };
    }
  }]);
}();