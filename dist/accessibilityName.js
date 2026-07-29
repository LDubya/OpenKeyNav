"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeText = exports.getLabelledByText = exports.getExplicitAccessibleName = void 0;
var _domUtilities = require("./domUtilities.js");
var normalizeText = exports.normalizeText = function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
};
var queryReference = function queryReference(element, id) {
  var _element$getRootNode, _root$getElementById, _element$ownerDocumen;
  var root = (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
  return (root === null || root === void 0 || (_root$getElementById = root.getElementById) === null || _root$getElementById === void 0 ? void 0 : _root$getElementById.call(root, id)) || ((_element$ownerDocumen = element.ownerDocument) === null || _element$ownerDocumen === void 0 ? void 0 : _element$ownerDocumen.getElementById(id));
};
var getLabelledByText = exports.getLabelledByText = function getLabelledByText(element) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref$excludeHidden = _ref.excludeHidden,
    excludeHidden = _ref$excludeHidden === void 0 ? true : _ref$excludeHidden;
  if (!(element !== null && element !== void 0 && element.getAttribute)) return '';
  return (element.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean).map(function (id) {
    return queryReference(element, id);
  }).filter(function (label) {
    var _element$getRootNode2;
    return label && (!excludeHidden || !(0, _domUtilities.hasAriaHiddenAncestor)(label, (_element$getRootNode2 = element.getRootNode) === null || _element$getRootNode2 === void 0 ? void 0 : _element$getRootNode2.call(element)));
  }).map(function (label) {
    return normalizeText(label.textContent);
  }).filter(Boolean).join(' ');
};

/**
 * Resolves only author-provided ARIA names. It deliberately does not attempt
 * the full accessible-name computation used by assistive technologies.
 */
var getExplicitAccessibleName = exports.getExplicitAccessibleName = function getExplicitAccessibleName(element, options) {
  var _element$getAttribute;
  return getLabelledByText(element, options) || ((element === null || element === void 0 || (_element$getAttribute = element.getAttribute) === null || _element$getAttribute === void 0 ? void 0 : _element$getAttribute.call(element, 'aria-label')) || '').trim();
};