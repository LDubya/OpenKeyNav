"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preventAcceptedCommand = exports.normalizeShortcut = exports.matchesShortcut = exports.MODIFIER_KEYS = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var MODIFIER_KEYS = exports.MODIFIER_KEYS = Object.freeze(['altKey', 'ctrlKey', 'metaKey', 'shiftKey']);
var normalizeShortcut = exports.normalizeShortcut = function normalizeShortcut(shortcut) {
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
 * Match a configured shortcut exactly. Modifiers omitted by the configuration
 * are treated as false so browser and application chords do not collide.
 * A caller may permit specific extra modifiers without weakening an explicit
 * `true` or `false` requirement in the configured shortcut.
 */
var matchesShortcut = exports.matchesShortcut = function matchesShortcut(event, shortcut) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var normalized = normalizeShortcut(shortcut);
  if (!normalized || !keysEqual(event.key, normalized.key)) return false;

  // Preserve the original string form for callers that deliberately need to
  // ignore a modifier entirely. New ownership overrides should use
  // `allowedExtraModifiers` so explicit shortcut requirements remain exact.
  var optionBag = _typeof(options) === 'object' && options !== null ? options : {};
  var ignoredModifier = typeof options === 'string' ? options : optionBag.ignoredModifier || null;
  var allowedExtras = optionBag.allowedExtraModifiers || [];
  var allowedExtraModifiers = new Set(Array.isArray(allowedExtras) ? allowedExtras : [allowedExtras].filter(Boolean));
  return MODIFIER_KEYS.every(function (modifier) {
    if (modifier === ignoredModifier) return true;
    var eventHasModifier = Boolean(event[modifier]);
    var shortcutDeclaresModifier = Object.prototype.hasOwnProperty.call(normalized, modifier);
    if (allowedExtraModifiers.has(modifier) && !shortcutDeclaresModifier && eventHasModifier) {
      return true;
    }
    return eventHasModifier === Boolean(normalized[modifier]);
  });
};

/**
 * Cancel one keyboard command after OpenKeyNav has accepted ownership of it.
 */
var preventAcceptedCommand = exports.preventAcceptedCommand = function preventAcceptedCommand(event) {
  event.preventDefault();
  event.stopPropagation();
  return true;
};