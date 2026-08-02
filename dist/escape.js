"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleEscape = void 0;
var _dragAndDrop = require("./dragAndDrop");
var handleEscape = exports.handleEscape = function handleEscape(openKeyNav, e) {
  var returnFalse = false;
  if (openKeyNav.config.modes.clicking.value || openKeyNav.config.modes.moving.value || openKeyNav.config.modes.menu.value) {
    e.preventDefault();
    e.stopPropagation();
    if (openKeyNav.config.modes.moving.value && openKeyNav.config.modesConfig.move.selectedMoveable) {
      var selectedConfig = openKeyNav.config.modesConfig.move.config[openKeyNav.config.modesConfig.move.selectedConfig];

      // Callback-driven moves never start a synthetic drag, so cancellation
      // should not manufacture a dragend event for the host library either.
      if (typeof (selectedConfig === null || selectedConfig === void 0 ? void 0 : selectedConfig.callback) !== 'function') {
        (0, _dragAndDrop.cancelDrag)(openKeyNav);
      }
    }
    openKeyNav.removeOverlays();
    openKeyNav.clearMoveAttributes();
    returnFalse = true;
  }
  if (openKeyNav.isTextInputActive()) {
    document.activeElement.blur(); // Removes focus from the active text input
  }
  if (returnFalse) {
    return false;
  } else {
    if (document.activeElement != document.body) {
      document.activeElement.blur();
    }
  }
};