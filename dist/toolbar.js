"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleToolBar = void 0;
var _signals = require("./signals.js");
var _keyButton = require("./keyButton.js");
var _keypress = require("./keypress.js");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; } // unified status bar and toolbar
var openKeyNav;
var handleToolBar = exports.handleToolBar = function handleToolBar(openKeyNav_obj) {
  openKeyNav = openKeyNav_obj;
  function initToolbarLogic(toolBarElement) {
    // Check if we've already initialized this toolbar
    if (toolBarElement.dataset.initialized === "true") return;

    // Mark as initialized
    toolBarElement.dataset.initialized = "true";
    injectToolbarStyleSheet();
    var lastMessage;
    (0, _signals.effect)(function () {
      var modes = openKeyNav.config.modes;
      var typedLabel = openKeyNav.config.typedLabel.value;
      updateToolbar(toolBarElement, lastMessage);
    });
    (0, _signals.effect)(function () {
      var backgroundColor = openKeyNav.config.toolBar.backgroundColor.value;
      var contentColor = openKeyNav.config.toolBar.contentColor.value;
      updateToolbarColors({
        backgroundColor: backgroundColor,
        contentColor: contentColor
      });
    });
  }
  var toolBarElements = document.querySelectorAll('.openKeyNav-toolBar');
  toolBarElements.forEach(function (toolBarElement) {
    if (toolBarElement) {
      initToolbarLogic(toolBarElement);
      // return;
    }
  });
  var observer = new MutationObserver(function (mutationsList, observerInstance) {
    var _iterator = _createForOfIteratorHelper(mutationsList),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var mutation = _step.value;
        for (var _i = 0, _Array$from = Array.from(mutation.addedNodes); _i < _Array$from.length; _i++) {
          var node = _Array$from[_i];
          if (node.nodeType === 1 && node.matches && node.matches('.openKeyNav-toolBar')) {
            initToolbarLogic(node);
            // observerInstance.disconnect();
            return;
          }
          if (node.nodeType === 1) {
            var _node$querySelectorAl;
            var descendants = (_node$querySelectorAl = node.querySelectorAll) === null || _node$querySelectorAl === void 0 ? void 0 : _node$querySelectorAl.call(node, '.openKeyNav-toolBar');
            descendants.forEach(function (descendant) {
              if (descendant) {
                initToolbarLogic(descendant);
                // observerInstance.disconnect();
                return;
              }
            });
          }
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};
var toolbarTemplates = {
  default: function _default() {
    var toolBarElement = document.querySelector('.openKeyNav-toolBar');
    if (!toolBarElement) {
      return;
    }
    toolBarElement.style.minWidth = "150px";
    // toolBarElement.style.maxWidth = "300px"; // let the developer define containers and max width

    var numButtons = 0;
    var clickButton = "";
    var dragButton = "";
    var menuButton = (0, _keyButton.keyButton)([openKeyNav.config.keys.menu, (0, _keypress.modiferKeyString)(openKeyNav)], "openKeyNav");
    if (openKeyNav.config.enabled.value) {
      menuButton = (0, _keyButton.keyButton)([openKeyNav.config.keys.menu], "Shortcuts");
    }
    return "<p>\n                    ".concat(menuButton, "\n                    ").concat(dragButton, "\n                    ").concat(clickButton, " \n                </p>\n            ");
  },
  clickMode: function clickMode(typedLabel) {
    return "<p>".concat((0, _keyButton.keyButton)(["Esc"], "Click Mode", true), "</p>");
  },
  dragMode: function dragMode(typedLabel) {
    return "<p>".concat((0, _keyButton.keyButton)(["Esc"], "Drag Mode", true), "</p>");
  },
  menu: function menu(typedLabel) {
    var dragButton = "";
    if (openKeyNav.config.modesConfig.move.config.length) {
      // if drag mode is configured
      dragButton = (0, _keyButton.keyButton)([openKeyNav.config.keys.move], "Drag");
    }
    return "\n            <p>".concat((0, _keyButton.keyButton)(["Esc"], "Shortcuts", true), "</p>\n            <div class=\"openKeyNav-toolBar-expanded\">\n                ").concat((0, _keyButton.keyButton)([openKeyNav.config.keys.click], "Click"), "\n                ").concat(dragButton, "\n            </div>\n        ");
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
  var toolbarBackground = "\n        background-color: ".concat(openKeyNav.config.toolBar.backgroundColor.value, ";\n        color: ").concat(openKeyNav.config.toolBar.contentColor.value, ";\n        border: 1px solid hsl(210, 8%, 68%);\n        border-radius: 4px;\n        padding: 3px ").concat(toolBarVerticalPadding, "px;\n    ");
  style.type = 'text/css';
  style.innerHTML += "\n    .openKeyNav-toolBar {\n        // width: 200px;    // needs to have a set width (or a min-width) since the content changes inside... \n                            // min-widh is set inside the init depending on number of keys\n        // max-width: 200px;\n        // background-color: #333;\n        color: #333;\n        // z-index: 10000;\n        ".concat(toolbarBackground, "\n        font-size:12px;\n        display: flex;\n        align-items: center;\n        // align-items: end;\n        flex-direction: column;\n        direction: rtl;\n        max-height: ").concat(toolBarHeight, "px;\n        position:relative;\n    }\n    .openKeyNav-toolBar > p{\n        overflow: hidden;\n    }\n    .openKeyNav-toolBar p{\n        font-size: 16px;\n        margin-bottom: 0;\n        line-height: ").concat(toolBarHeight - toolBarVerticalPadding, "px;\n        text-align: left;\n    }\n    .openKeyNav-toolBar-expanded {\n        position: absolute;\n        top: 0;\n        margin-top: 40px;\n        width: 100%;\n        ").concat(toolbarBackground, "\n        display: grid;\n        justify-content: left;\n    }\n    // .openKeyNav-toolBar span.stacked {\n    //     display: inline-grid;\n    //     grid-template-rows: auto auto;\n    // }\n    ");
  document.head.appendChild(style);
};
var updateToolbarColors = function updateToolbarColors(_ref) {
  var backgroundColor = _ref.backgroundColor,
    contentColor = _ref.contentColor;
  var toolbar = document.querySelector('.openKeyNav-toolBar');
  if (!toolbar) {
    return false;
  }
  if (backgroundColor) {
    toolbar.style.backgroundColor = backgroundColor;
  }
  if (contentColor) {
    toolbar.style.color = contentColor;
  }
};