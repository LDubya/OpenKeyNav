"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleToolBar = void 0;
var _signals = require("./signals.js");
var _keyButton = require("./keyButton.js");
var handleToolBar = exports.handleToolBar = function handleToolBar(openKeyNav) {
  var toolBarElement = document.querySelector('.openKeyNav-toolBar');
  if (!toolBarElement) {
    return;
  }
  injectToolbarStyleSheet();

  // 5. Handle mode changes 
  var lastMessage;
  (0, _signals.effect)(function () {
    var modes = openKeyNav.config.modes;
    updateToolbar(toolBarElement, openKeyNav, lastMessage);
  });
  (0, _signals.effect)(function () {
    var typedLabel = openKeyNav.config.typedLabel.value;
    updateToolbar(toolBarElement, openKeyNav, lastMessage);
  });
};
var updateToolbar = function updateToolbar(toolBarElement, openKeyNav, lastMessage) {
  if (!toolBarElement) {
    return;
  }
  var message;
  var typedLabel = openKeyNav.config.typedLabel.value;
  if (openKeyNav.config.modes.clicking.value) {
    message = "Click Mode ".concat((0, _keyButton.keyButton)("Esc"));
  } else if (openKeyNav.config.modes.moving.value) {
    message = "Drag Mode ".concat((0, _keyButton.keyButton)("Esc"));
  } else {
    //  default message
    // press k for click mode ( Click [ k ] )
    // press m for drag mode ( Drag [ m ] )
    message = " ".concat((0, _keyButton.keyButton)(openKeyNav.config.keys.click, "Click"), " ").concat((0, _keyButton.keyButton)(openKeyNav.config.keys.move, "Drag"), " "); // Default message
  }

  // Only emit the notification if the message has changed
  if (message === lastMessage) {
    return;
  }

  // Emit the notification with the current message
  console.log(message);
  // emitNotification(message);
  // Update the toolbar content
  toolBarElement.innerHTML = "<p> ".concat(message, " </p>");
  lastMessage = message;
};
var injectToolbarStyleSheet = function injectToolbarStyleSheet() {
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML += "\n    .openKeyNav-toolBar {\n        width: 200px;\n        // background-color: #333;\n        color: #333;\n        padding: 3px 10px;\n        z-index: 10000;\n        background-color: hsl(210 10% 95% / 1);\n        border: 1px solid hsl(210, 8%, 68%);\n        border-radius: 4px;\n        font-size:12px;\n        display: flex;\n        align-items: center;\n    }\n    .openKeyNav-toolBar p{\n        font-size: 16px;\n        margin-bottom: 0;\n    }\n    ";
  document.head.appendChild(style);
};