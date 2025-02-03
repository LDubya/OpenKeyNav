"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleToolBar = void 0;
var _signals = require("./signals.js");
var _keyButton = require("./keyButton.js");
// unified status bar and toolbar

var openKeyNav;
var handleToolBar = exports.handleToolBar = function handleToolBar(openKeyNav_obj) {
  openKeyNav = openKeyNav_obj;
  var toolBarElement = document.querySelector('.openKeyNav-toolBar');
  if (!toolBarElement) {
    return;
  }
  injectToolbarStyleSheet();

  // 5. Handle mode changes 
  var lastMessage;
  (0, _signals.effect)(function () {
    var modes = openKeyNav.config.modes;
    var typedLabel = openKeyNav.config.typedLabel.value;
    updateToolbar(toolBarElement, lastMessage);
  });
};
var toolbarTemplates = {
  default: function _default() {
    var toolBarElement = document.querySelector('.openKeyNav-toolBar');
    if (!toolBarElement) {
      return;
    }
    toolBarElement.style.minWidth = "150px";
    var numButtons = 0;
    //  default message
    // press k for click mode ( Click [ k ] )
    // press m for drag mode ( Drag [ m ] )

    var clickButton = "";
    // clickButton = keyButton(openKeyNav.config.keys.click, "Click");
    // numButtons += 1;

    var dragButton = "";
    // if(openKeyNav.config.modesConfig.move.config.length){ // if drag mode is configured
    //     dragButton = keyButton(openKeyNav.config.keys.move, "Drag");
    //     numButtons += 1;
    // }

    var menuButton = (0, _keyButton.keyButton)(openKeyNav.config.keys.menu, "Shortcuts");
    // if(numButtons > 1){
    //     toolBarElement.style.minWidth = "200px"
    //     menuButton = keyButton(openKeyNav.config.keys.menu, "Shortcuts");
    // }

    return "<p>\n                    ".concat(menuButton, "\n                    ").concat(dragButton, "\n                    ").concat(clickButton, " \n                </p>\n            ");
  },
  clickMode: function clickMode(typedLabel) {
    return "<p>".concat((0, _keyButton.keyButton)("Esc", "Click Mode", true), "</p>");
  },
  dragMode: function dragMode(typedLabel) {
    return "<p>".concat((0, _keyButton.keyButton)("Esc", "Drag Mode", true), "</p>");
  },
  menu: function menu(typedLabel) {
    var dragButton = "";
    if (openKeyNav.config.modesConfig.move.config.length) {
      // if drag mode is configured
      dragButton = (0, _keyButton.keyButton)(openKeyNav.config.keys.move, "Drag");
    }
    return "\n            <p>".concat((0, _keyButton.keyButton)("Esc", "Shortcuts", true), "</p>\n            <div class=\"openKeyNav-toolBar-expanded\">\n                ").concat((0, _keyButton.keyButton)(openKeyNav.config.keys.click, "Click"), "\n                ").concat(dragButton, "\n            </div>\n        ");
  }
};
var updateElement = function updateElement(element, html) {
  element.innerHTML = html;
};
var updateToolbar = function updateToolbar(toolBarElement, lastMessage) {
  if (!toolBarElement) {
    return;
  }
  var message;
  var typedLabel = openKeyNav.config.typedLabel.value;
  if (openKeyNav.config.modes.clicking.value) {
    message = toolbarTemplates.clickMode(typedLabel);
  } else if (openKeyNav.config.modes.moving.value) {
    message = toolbarTemplates.dragMode(typedLabel);
    // message = toolbarTemplates.menu(typedLabel);
  } else if (openKeyNav.config.modes.menu.value) {
    message = toolbarTemplates.menu(typedLabel);
  } else {
    message = toolbarTemplates.default(); // Default message
  }

  // Only emit the notification if the message has changed
  if (message === lastMessage) {
    return;
  }

  // console.log(message);
  // Update the toolbar content
  updateElement(toolBarElement, message);
  lastMessage = message;
};
var injectToolbarStyleSheet = function injectToolbarStyleSheet() {
  if (!!document.querySelector('.okn-toolbar-stylesheet')) {
    return false;
  }
  var style = document.createElement('style');
  style.setAttribute("class", "okn-toolbar-stylesheet");
  var toolBarHeight = openKeyNav.config.toolBar.height;
  var toolBarVerticalPadding = 6;
  var toolbarBackground = "\n        background-color: hsl(210 10% 95% / 1);\n        border: 1px solid hsl(210, 8%, 68%);\n        border-radius: 4px;\n        padding: 3px ".concat(toolBarVerticalPadding, "px;\n    ");
  style.type = 'text/css';
  style.innerHTML += "\n    .openKeyNav-toolBar {\n        // width: 200px;    // needs to have a set width (or a min-width) since the content changes inside... \n                            // min-widh is set inside the init depending on number of keys\n        // max-width: 200px;\n        // background-color: #333;\n        color: #333;\n        z-index: 10000;\n        ".concat(toolbarBackground, "\n        font-size:12px;\n        display: flex;\n        align-items: center;\n        // align-items: end;\n        flex-direction: column;\n        direction: rtl;\n        max-height: ").concat(toolBarHeight, "px;\n        position:relative;\n    }\n    .openKeyNav-toolBar > p{\n        overflow: hidden;\n    }\n    .openKeyNav-toolBar p{\n        font-size: 16px;\n        margin-bottom: 0;\n        line-height: ").concat(toolBarHeight - toolBarVerticalPadding, "px;\n        text-align: left;\n    }\n    .openKeyNav-toolBar-expanded {\n        position: absolute;\n        top: 0;\n        margin-top: 40px;\n        width: 100%;\n        ").concat(toolbarBackground, "\n        display: grid;\n        justify-content: left;\n    }\n    // .openKeyNav-toolBar span.stacked {\n    //     display: inline-grid;\n    //     grid-template-rows: auto auto;\n    // }\n    ");
  document.head.appendChild(style);
};