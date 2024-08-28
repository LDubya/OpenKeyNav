"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initStatusBar = initStatusBar;
var _signals = require("./signals.js");
var _modes = require("./modes.js");
function initStatusBar() {
  // DOM element to update
  var statusBar = document.getElementById('status-bar');

  // Abort if no status bar is found
  if (!statusBar) {
    console.warn('Status bar element not found in the DOM.');
    return;
  }

  // Effect to update status bar based on the current mode
  (0, _signals.effect)(function () {
    switch (_modes.currentMode.value) {
      case _modes.MODES.CLICK:
        statusBar.textContent = "In click mode. Press Esc to exit.";
        break;
      case _modes.MODES.DRAG:
        statusBar.textContent = "In drag mode. Press Esc to exit.";
        break;
      default:
        statusBar.textContent = "No mode active.";
    }
  });
}