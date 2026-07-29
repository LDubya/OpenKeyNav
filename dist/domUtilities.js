"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isShadowRoot = exports.isOpenKeyNavGeneratedUI = exports.isElement = exports.isDocument = exports.isComposedWithin = exports.hasAriaHiddenAncestor = exports.getDeepActiveElement = exports.getComposedParent = exports.getComposedChildren = exports.getComposedAncestors = exports.collectComposedElements = exports.OPENKEYNAV_GENERATED_UI_SELECTOR = void 0;
var ELEMENT_NODE = 1;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;
var OPENKEYNAV_GENERATED_UI_SELECTOR = exports.OPENKEYNAV_GENERATED_UI_SELECTOR = ['[data-openkeynav-ui]', '.openKeyNav-label', '.openKeyNav-toolBar', '.openKeyNav-mouseover-tooltip', '.openKeyNav-structural-status', '#okn-notification-container', '#okn-audit-panel'].join(',');
var isElement = exports.isElement = function isElement(node) {
  return Boolean(node && node.nodeType === ELEMENT_NODE);
};
var isDocument = exports.isDocument = function isDocument(node) {
  return Boolean(node && node.nodeType === DOCUMENT_NODE);
};
var isShadowRoot = exports.isShadowRoot = function isShadowRoot(node) {
  return Boolean(node && node.nodeType === DOCUMENT_FRAGMENT_NODE && node.host && isElement(node.host));
};

/**
 * Returns the parent exposed by the composed tree rather than the light DOM.
 */
var getComposedParent = exports.getComposedParent = function getComposedParent(node) {
  if (!node) return null;
  if (node.assignedSlot) return node.assignedSlot;
  if (isShadowRoot(node)) return node.host;
  return node.parentNode || null;
};

/**
 * Includes `node` itself and stops after `boundary` when one is supplied.
 */
var getComposedAncestors = exports.getComposedAncestors = function getComposedAncestors(node) {
  var boundary = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var ancestors = [];
  var current = node;
  while (current) {
    ancestors.push(current);
    if (current === boundary) break;
    current = getComposedParent(current);
  }
  return ancestors;
};
var isComposedWithin = exports.isComposedWithin = function isComposedWithin(boundary, node) {
  return Boolean(boundary && node) && getComposedAncestors(node, boundary).includes(boundary);
};

/**
 * Returns children in the rendered composed tree, following open shadow roots
 * and replacing slots with their assigned nodes when present.
 */
var getComposedChildren = exports.getComposedChildren = function getComposedChildren(node) {
  if (isDocument(node)) {
    return node.documentElement ? [node.documentElement] : [];
  }
  if (isElement(node) && node.shadowRoot) {
    return Array.from(node.shadowRoot.childNodes);
  }
  if (isElement(node) && node.tagName.toLowerCase() === 'slot' && typeof node.assignedNodes === 'function') {
    var assigned = node.assignedNodes({
      flatten: true
    });
    if (assigned.length) return assigned;
  }
  return Array.from((node === null || node === void 0 ? void 0 : node.childNodes) || []);
};
var collectComposedElements = exports.collectComposedElements = function collectComposedElements(root) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref$exclude = _ref.exclude,
    exclude = _ref$exclude === void 0 ? null : _ref$exclude;
  var elements = [];
  var seen = new Set();
  var _visit = function visit(node) {
    if (!node || seen.has(node)) return;
    seen.add(node);
    if (isElement(node)) {
      if (exclude !== null && exclude !== void 0 && exclude(node)) return;
      elements.push(node);
    }
    getComposedChildren(node).forEach(_visit);
  };
  _visit(root);
  return elements;
};

/**
 * Returns true when an element is, or is composed beneath, OpenKeyNav-owned UI.
 */
var isOpenKeyNavGeneratedUI = exports.isOpenKeyNavGeneratedUI = function isOpenKeyNavGeneratedUI(element) {
  var selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : OPENKEYNAV_GENERATED_UI_SELECTOR;
  return getComposedAncestors(element).some(function (current) {
    return isElement(current) && current.matches(selector);
  });
};
var hasAriaHiddenAncestor = exports.hasAriaHiddenAncestor = function hasAriaHiddenAncestor(element) {
  var boundary = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  return getComposedAncestors(element, boundary).some(function (current) {
    return isElement(current) && current.getAttribute('aria-hidden') === 'true';
  });
};

/**
 * Reads the actual focused element exposed by a document or open shadow root.
 * Iframes remain atomic focus targets.
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
  if (!activeElement || !isComposedWithin(root, activeElement)) return null;
  return activeElement;
};