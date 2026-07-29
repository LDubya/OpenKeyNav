"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveStatusHost = exports.StatusService = void 0;
var _domUtilities = require("./domUtilities.js");
var _styles = require("./styles.js");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var INVALID_STATUS_HOSTS = new Set(['AREA', 'BASE', 'BR', 'BUTTON', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'OPTGROUP', 'OPTION', 'PARAM', 'SOURCE', 'SELECT', 'TEXTAREA', 'TRACK', 'WBR']);
var canContainStatus = function canContainStatus(value) {
  return (0, _domUtilities.isShadowRoot)(value) || (0, _domUtilities.isElement)(value) && !INVALID_STATUS_HOSTS.has(value.tagName);
};
var topmostModal = function topmostModal(document) {
  if (!(document !== null && document !== void 0 && document.querySelectorAll)) return null;
  try {
    var nativeModals = Array.from(document.querySelectorAll('dialog:modal'));
    if (nativeModals.length) return nativeModals[nativeModals.length - 1];
  } catch (error) {
    // DOM implementations without :modal support fall through to ARIA dialogs.
  }
  var ariaModals = Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).filter(function (element) {
    return element.isConnected;
  });
  return ariaModals[ariaModals.length - 1] || null;
};
var resolveStatusHost = exports.resolveStatusHost = function resolveStatusHost(document, requestedHost) {
  var resolved = typeof requestedHost === 'function' ? requestedHost() : requestedHost;
  if (resolved === 'modal') {
    return topmostModal(document) || (document === null || document === void 0 ? void 0 : document.body) || (document === null || document === void 0 ? void 0 : document.documentElement) || null;
  }
  if (resolved === 'body' || !resolved || (0, _domUtilities.isDocument)(resolved)) {
    return (document === null || document === void 0 ? void 0 : document.body) || (document === null || document === void 0 ? void 0 : document.documentElement) || null;
  }
  if (canContainStatus(resolved)) return resolved;
  return (document === null || document === void 0 ? void 0 : document.body) || (document === null || document === void 0 ? void 0 : document.documentElement) || null;
};
var normalizeClassNames = function normalizeClassNames(value) {
  return (Array.isArray(value) ? value : String(value || '').split(/\s+/)).filter(Boolean);
};
var applyVisibility = function applyVisibility(element, visible) {
  element.classList.toggle('openKeyNav-status--visually-hidden', visible === false);
};
var applyDataset = function applyDataset(element) {
  var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  Object.entries(values).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      name = _ref2[0],
      value = _ref2[1];
    if (value === null || value === undefined) {
      delete element.dataset[name];
      return;
    }
    element.dataset[name] = String(value);
  });
};
var setContent = function setContent(entry, message, options) {
  var content = entry.content;
  var normalizedMessage = String(message !== null && message !== void 0 ? message : '');
  var trustedHtml = options.trustedHtml === true;
  var contentKey = "".concat(trustedHtml ? 'html' : 'text', ":").concat(normalizedMessage);
  if (options.dedupe !== false && entry.contentKey === contentKey) {
    return false;
  }
  if (trustedHtml) {
    content.innerHTML = normalizedMessage;
  } else {
    content.textContent = normalizedMessage;
  }
  entry.contentKey = contentKey;
  return true;
};
var addToolName = function addToolName(document, element) {
  var logo = document.createElement('div');
  logo.className = 'okn-logo-text tiny';
  logo.setAttribute('role', 'img');
  logo.setAttribute('aria-label', 'OpenKeyNav');
  logo.innerHTML = 'Open<span class="key">Key</span>Nav';
  element.prepend(logo);
  return logo;
};

/**
 * Owns OpenKeyNav's live status and notification surfaces for one instance.
 *
 * Text is escaped by default. Callers must opt in with `trustedHtml: true` for
 * markup that OpenKeyNav itself generated.
 */
var StatusService = exports.StatusService = /*#__PURE__*/function () {
  function StatusService() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      ownerDocument = _ref3.document;
    _classCallCheck(this, StatusService);
    this.document = ownerDocument || null;
    this.channels = new Map();
    this.containers = new Map();
    this.styles = new Map();
  }
  return _createClass(StatusService, [{
    key: "ownerDocument",
    value: function ownerDocument() {
      if (this.document) return this.document;
      return typeof document === 'undefined' ? null : document;
    }
  }, {
    key: "containerFor",
    value: function containerFor(host, options) {
      var _container;
      if (!options.containerClass) return host;
      var key = "".concat(options.containerKey || options.containerClass);
      var hostContainers = this.containers.get(host);
      if (!hostContainers) {
        hostContainers = new Map();
        this.containers.set(host, hostContainers);
      }
      var container = hostContainers.get(key);
      if (((_container = container) === null || _container === void 0 ? void 0 : _container.parentNode) !== host) {
        var _document = this.ownerDocument();
        container = _document.createElement('div');
        container.className = normalizeClassNames(options.containerClass).join(' ');
        container.setAttribute('data-openkeynav-ui', 'status-container');
        container.dataset.openkeynavStatusContainer = key;
        host.appendChild(container);
        hostContainers.set(key, container);
      }
      if (options.containerId && (!this.ownerDocument().getElementById(options.containerId) || container.id === options.containerId)) {
        container.id = options.containerId;
      }
      return container;
    }
  }, {
    key: "styleRootFor",
    value: function styleRootFor(host) {
      var _host$getRootNode;
      if ((0, _domUtilities.isShadowRoot)(host)) return host;
      var root = host === null || host === void 0 || (_host$getRootNode = host.getRootNode) === null || _host$getRootNode === void 0 ? void 0 : _host$getRootNode.call(host);
      if ((0, _domUtilities.isShadowRoot)(root)) return root;
      return this.ownerDocument();
    }
  }, {
    key: "ensureStyles",
    value: function ensureStyles(host) {
      var _style;
      var document = this.ownerDocument();
      var root = this.styleRootFor(host);
      if (!document || !root) return null;
      var style = this.styles.get(root);
      if ((_style = style) !== null && _style !== void 0 && _style.parentNode) return root;
      style = document.createElement('style');
      style.className = 'openKeyNav-status-service-style';
      style.setAttribute('data-openkeynav-ui', 'status-style');
      style.textContent = _styles.statusStyles;
      if ((0, _domUtilities.isDocument)(root)) {
        (root.head || root.documentElement).appendChild(style);
      } else {
        root.prepend(style);
      }
      this.styles.set(root, style);
      return root;
    }
  }, {
    key: "pruneStyles",
    value: function pruneStyles() {
      var _this = this;
      var _iterator = _createForOfIteratorHelper(this.styles),
        _step;
      try {
        var _loop = function _loop() {
          var _step$value = _slicedToArray(_step.value, 2),
            root = _step$value[0],
            style = _step$value[1];
          var inUse = Array.from(_this.channels.values()).some(function (entry) {
            return entry.styleRoot === root;
          });
          if (!inUse) {
            style.remove();
            _this.styles.delete(root);
          }
        };
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "removeEmptyContainer",
    value: function removeEmptyContainer(container) {
      var _container$hasAttribu;
      if (!(container !== null && container !== void 0 && (_container$hasAttribu = container.hasAttribute) !== null && _container$hasAttribu !== void 0 && _container$hasAttribu.call(container, 'data-openkeynav-status-container')) || container.childElementCount) {
        return;
      }
      container.remove();
      var _iterator2 = _createForOfIteratorHelper(this.containers),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            host = _step2$value[0],
            hostContainers = _step2$value[1];
          var _iterator3 = _createForOfIteratorHelper(hostContainers),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var _step3$value = _slicedToArray(_step3.value, 2),
                key = _step3$value[0],
                candidate = _step3$value[1];
              if (candidate === container) hostContainers.delete(key);
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
          if (!hostContainers.size) this.containers.delete(host);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "createEntry",
    value: function createEntry(channel, options) {
      var document = this.ownerDocument();
      if (!document) return null;
      var element = document.createElement('div');
      element.classList.add('openKeyNav-status');
      element.setAttribute('data-openkeynav-ui', options.ui || 'status');
      element.dataset.openkeynavStatusChannel = channel;
      element.setAttribute('aria-atomic', 'true');
      var content = document.createElement('div');
      content.className = 'openKeyNav-status__content';
      element.appendChild(content);
      var entry = {
        channel: channel,
        element: element,
        content: content,
        contentKey: null,
        timer: null,
        duration: null,
        container: null,
        styleRoot: null,
        optionClassNames: new Set(),
        toolName: null,
        hint: null,
        dismiss: null
      };
      this.channels.set(channel, entry);
      return entry;
    }
  }, {
    key: "set",
    value: function set(channel, message) {
      var _this2 = this,
        _options$hint;
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var document = this.ownerDocument();
      if (!document) return null;
      var normalizedChannel = String(channel || '').trim();
      if (!normalizedChannel) {
        throw new TypeError('A non-empty status channel is required.');
      }
      var host = resolveStatusHost(document, options.host);
      if (!host) return null;
      var styleRoot = this.ensureStyles(host);
      var entry = this.channels.get(normalizedChannel);
      if (!entry) {
        entry = this.createEntry(normalizedChannel, options);
      }
      if (!entry) return null;
      entry.optionClassNames.forEach(function (className) {
        entry.element.classList.remove(className);
      });
      entry.optionClassNames = new Set(normalizeClassNames(options.className));
      entry.optionClassNames.forEach(function (className) {
        entry.element.classList.add(className);
      });
      if (options.toolName && !entry.toolName) {
        entry.toolName = addToolName(document, entry.element);
      } else if (!options.toolName && entry.toolName) {
        entry.toolName.remove();
        entry.toolName = null;
      }
      var politeness = ['assertive', 'off'].includes(options.politeness) ? options.politeness : 'polite';
      var role = options.role || (politeness === 'assertive' ? 'alert' : 'status');
      entry.element.setAttribute('role', role);
      entry.element.setAttribute('aria-live', politeness);
      entry.element.classList.toggle('openKeyNav-status--assertive', politeness === 'assertive');
      applyVisibility(entry.element, options.visible);
      applyDataset(entry.element, options.data);
      var previousContainer = entry.container;
      var container = this.containerFor(host, options);
      if (entry.element.parentNode !== container) {
        container.appendChild(entry.element);
      }
      entry.container = container;
      entry.styleRoot = styleRoot;
      if (previousContainer !== container) {
        this.removeEmptyContainer(previousContainer);
        this.pruneStyles();
      }
      var contentChanged = setContent(entry, message, options);
      var duration = Number.isFinite(options.duration) && options.duration > 0 ? options.duration : null;
      var durationChanged = duration !== entry.duration;
      if (entry.timer && (contentChanged || durationChanged)) {
        clearTimeout(entry.timer);
        entry.timer = null;
      }
      if ((contentChanged || durationChanged) && duration !== null) {
        entry.timer = setTimeout(function () {
          _this2.clear(normalizedChannel);
        }, duration);
      }
      entry.duration = duration;
      var hintMessage = String((_options$hint = options.hint) !== null && _options$hint !== void 0 ? _options$hint : '').trim();
      if (hintMessage) {
        if (!entry.hint) {
          var hint = document.createElement('div');
          hint.className = 'openKeyNav-status__hint';
          hint.setAttribute('aria-hidden', 'true');
          entry.element.appendChild(hint);
          entry.hint = hint;
        }
        entry.hint.textContent = hintMessage;
      } else if (entry.hint) {
        entry.hint.remove();
        entry.hint = null;
      }
      if (options.dismissible === true && !entry.dismiss) {
        var dismiss = document.createElement('button');
        dismiss.className = 'openKeyNav-status__dismiss';
        dismiss.type = 'button';
        dismiss.setAttribute('aria-label', 'Close notification');
        dismiss.textContent = '×';
        dismiss.addEventListener('click', function () {
          _this2.clear(normalizedChannel);
        });
        entry.element.appendChild(dismiss);
        entry.dismiss = dismiss;
      } else if (options.dismissible !== true && entry.dismiss) {
        entry.dismiss.remove();
        entry.dismiss = null;
      }
      entry.element.classList.toggle('openKeyNav-status--dismissible', options.dismissible === true);
      return entry.element;
    }
  }, {
    key: "get",
    value: function get(channel) {
      var _this$channels$get;
      return ((_this$channels$get = this.channels.get(String(channel))) === null || _this$channels$get === void 0 ? void 0 : _this$channels$get.element) || null;
    }
  }, {
    key: "has",
    value: function has(channel) {
      return this.channels.has(String(channel));
    }
  }, {
    key: "clear",
    value: function clear(channel) {
      var normalizedChannel = String(channel);
      var entry = this.channels.get(normalizedChannel);
      if (!entry) return false;
      if (entry.timer) clearTimeout(entry.timer);
      var container = entry.container;
      entry.element.remove();
      this.channels.delete(normalizedChannel);
      this.removeEmptyContainer(container);
      this.pruneStyles();
      return true;
    }
  }, {
    key: "clearAll",
    value: function clearAll() {
      var _this3 = this;
      Array.from(this.channels.keys()).forEach(function (channel) {
        _this3.clear(channel);
      });
      this.containers.clear();
      this.styles.forEach(function (style) {
        return style.remove();
      });
      this.styles.clear();
    }
  }]);
}();