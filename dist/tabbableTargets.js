"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isOpenKeyNavGeneratedUI = exports.getDeepActiveElement = exports.discoverTabbableTargets = exports.OPENKEYNAV_GENERATED_UI_SELECTOR = void 0;
var _tabbable = require("tabbable");
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var OPENKEYNAV_GENERATED_UI_SELECTOR = exports.OPENKEYNAV_GENERATED_UI_SELECTOR = ['[data-openkeynav-ui]', '.openKeyNav-label', '.openKeyNav-toolBar', '.openKeyNav-mouseover-tooltip', '.openKeyNav-structural-status', '#okn-notification-container', '#okn-audit-panel'].join(',');
var ELEMENT_NODE = 1;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;
var isElement = function isElement(node) {
  return Boolean(node && node.nodeType === ELEMENT_NODE);
};
var isDocument = function isDocument(node) {
  return Boolean(node && node.nodeType === DOCUMENT_NODE);
};
var isShadowRoot = function isShadowRoot(node) {
  return Boolean(node && node.nodeType === DOCUMENT_FRAGMENT_NODE && node.host && isElement(node.host));
};
var getComposedParent = function getComposedParent(node) {
  if (!node) return null;
  if (node.assignedSlot) return node.assignedSlot;
  if (isShadowRoot(node)) return node.host;
  return node.parentNode || null;
};
var isWithinRoot = function isWithinRoot(root, node) {
  var current = node;
  while (current) {
    if (current === root) return true;
    current = getComposedParent(current);
  }
  return false;
};

/**
 * Returns true when an element is, or is composed beneath, OpenKeyNav-owned UI.
 * Composed ancestry is intentional so generated UI inside an open shadow root is
 * excluded when its host carries the marker.
 */
var isOpenKeyNavGeneratedUI = exports.isOpenKeyNavGeneratedUI = function isOpenKeyNavGeneratedUI(element) {
  var selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : OPENKEYNAV_GENERATED_UI_SELECTOR;
  var current = element;
  while (current) {
    if (isElement(current) && current.matches(selector)) return true;
    current = getComposedParent(current);
  }
  return false;
};

/**
 * Reads the actual focused element exposed by the active document or shadow root.
 * It follows open Shadow DOM focus, but deliberately treats iframes as atomic.
 */
var getDeepActiveElement = exports.getDeepActiveElement = function getDeepActiveElement() {
  var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : typeof document === 'undefined' ? null : document;
  if (!root) return null;
  var activeRoot = isDocument(root) || isShadowRoot(root) ? root : root.ownerDocument;
  var activeElement = activeRoot && activeRoot.activeElement;
  while (activeElement && (_activeElement$shadow = activeElement.shadowRoot) !== null && _activeElement$shadow !== void 0 && _activeElement$shadow.activeElement) {
    var _activeElement$shadow;
    activeElement = activeElement.shadowRoot.activeElement;
  }
  if (!activeElement || !isWithinRoot(root, activeElement)) return null;
  return activeElement;
};
var normalizeDiscoveryRoot = function normalizeDiscoveryRoot(root) {
  if (isDocument(root)) {
    if (!root.documentElement) {
      throw new TypeError('The discovery document must have a document element.');
    }
    return root.documentElement;
  }
  if (isShadowRoot(root)) return root.host;
  if (isElement(root)) return root;
  throw new TypeError('discoverTabbableTargets requires an Element, Document, or ShadowRoot.');
};
var getTabbableOptions = function getTabbableOptions(root, options) {
  var _options$displayCheck = options.displayCheck,
    displayCheck = _options$displayCheck === void 0 ? 'full' : _options$displayCheck,
    _options$getShadowRoo = options.getShadowRoot,
    getShadowRoot = _options$getShadowRoo === void 0 ? true : _options$getShadowRoo,
    _options$includeConta = options.includeContainer,
    includeContainer = _options$includeConta === void 0 ? isElement(root) : _options$includeConta;

  // Tabbable traverses a ShadowRoot through its host. Supplying the exact root
  // also keeps this boundary usable if a caller was deliberately given a root
  // that is not available through host.shadowRoot.
  var shadowRootResolver = isShadowRoot(root) ? function (node) {
    if (node === root.host) return root;
    if (typeof getShadowRoot === 'function') return getShadowRoot(node);
    return false;
  } : getShadowRoot;
  return {
    displayCheck: displayCheck,
    getShadowRoot: shadowRootResolver,
    includeContainer: includeContainer
  };
};
var includeProgrammaticCandidates = function includeProgrammaticCandidates(discoveryRoot, candidates, tabbableOptions) {
  var focusableCandidates = (0, _tabbable.focusable)(discoveryRoot, tabbableOptions);
  var positiveTabbables = candidates.filter(function (candidate) {
    return (0, _tabbable.getTabIndex)(candidate) > 0;
  });
  var positiveSet = new Set(positiveTabbables);

  // Preserve the browser-like positive-tabindex prefix, then use composed source
  // order for the zero- and negative-tabindex focusable elements. Opting in to
  // programmatic targets necessarily differs from native Tab order.
  return [].concat(_toConsumableArray(positiveTabbables), _toConsumableArray(focusableCandidates.filter(function (candidate) {
    return !positiveSet.has(candidate);
  })));
};

/**
 * Discovers live focus destinations in the active navigation root.
 *
 * `displayCheck` defaults to Tabbable's browser-accurate `full` strategy. Tests
 * running in jsdom should opt into `displayCheck: 'none'` explicitly.
 */
var discoverTabbableTargets = exports.discoverTabbableTargets = function discoverTabbableTargets(root) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$excludeGener = options.excludeGeneratedUI,
    excludeGeneratedUI = _options$excludeGener === void 0 ? true : _options$excludeGener,
    _options$generatedUIS = options.generatedUISelector,
    generatedUISelector = _options$generatedUIS === void 0 ? OPENKEYNAV_GENERATED_UI_SELECTOR : _options$generatedUIS,
    _options$includeProgr = options.includeProgrammatic,
    includeProgrammatic = _options$includeProgr === void 0 ? false : _options$includeProgr,
    _options$targetFilter = options.targetFilter,
    targetFilter = _options$targetFilter === void 0 ? null : _options$targetFilter;
  if (targetFilter !== null && typeof targetFilter !== 'function') {
    throw new TypeError('targetFilter must be a function when provided.');
  }
  var discoveryRoot = normalizeDiscoveryRoot(root);
  var tabbableOptions = getTabbableOptions(root, options);
  var candidates = (0, _tabbable.tabbable)(discoveryRoot, tabbableOptions);
  if (includeProgrammatic) {
    candidates = includeProgrammaticCandidates(discoveryRoot, candidates, tabbableOptions);
  }
  var seen = new Set();
  return candidates.filter(function (candidate) {
    if (seen.has(candidate)) return false;
    seen.add(candidate);
    if (!candidate.isConnected || !isWithinRoot(root, candidate)) return false;
    if (excludeGeneratedUI && isOpenKeyNavGeneratedUI(candidate, generatedUISelector)) {
      return false;
    }
    if (targetFilter && !targetFilter(candidate)) return false;

    // A filter is application code and may synchronously detach or relocate a
    // candidate. Recheck liveness before returning it.
    return candidate.isConnected && isWithinRoot(root, candidate);
  });
};