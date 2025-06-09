"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleToolBar = void 0;
var _signals = require("./signals.js");
var _keyButton = require("./keyButton.js");
var _keypress = require("./keypress.js");
var _styles = require("./styles.js");
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
    (0, _styles.injectToolbarStyleSheet)(openKeyNav);
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
    var menuButton = (0, _keyButton.keyButton)([(0, _keypress.modiferKeyString)(openKeyNav), openKeyNav.config.keys.menu], "openKeyNav");
    if (openKeyNav.meta.enabled.value) {
      menuButton = (0, _keyButton.keyButton)([openKeyNav.config.keys.menu], "Shortcuts");
    }
    return "<p>\n                    ".concat(menuButton, "\n                    ").concat(dragButton, "\n                    ").concat(clickButton, " \n                </p>\n            ");
  },
  clickMode: function clickMode() {
    return "<p>".concat((0, _keyButton.keyButton)(["Esc"], "Click Mode"), "</p>");
  },
  dragMode: function dragMode() {
    return "<p>".concat((0, _keyButton.keyButton)(["Esc"], "Drag Mode"), "</p>");
  },
  menu: function menu() {
    var dragButton = "";
    if (openKeyNav.config.modesConfig.move.config.length) {
      // if drag mode is configured
      dragButton = (0, _keyButton.keyButton)([openKeyNav.config.keys.move], "Drag");
    }
    return "\n            <p>".concat((0, _keyButton.keyButton)(["Esc"], "Shortcuts"), "</p>\n            <div class=\"openKeyNav-toolBar-expanded\">\n                ").concat((0, _keyButton.keyButton)([openKeyNav.config.keys.click], "Click"), "\n                ").concat(dragButton, "\n            </div>\n        ");
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