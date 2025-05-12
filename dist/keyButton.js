"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyButton = void 0;
var keyButton = exports.keyButton = function keyButton(keyCodes, text, reverseOrder) {
  // let styledKeyCode = `<span class="keyButton">${keyCode}</span>`;
  var styledKeyCodes = keyCodes.map(function (keyCode) {
    return "<span class=\"keyButton\">".concat(keyCode, "</span>");
  }).join("");
  if (!text) {
    return "".concat(styledKeyCodes);
  }
  if (reverseOrder) {
    return "\n            <span class=\"keyButtonContainer\"> \n                <span>\n                    ".concat(styledKeyCodes, "\n                </span>\n                <span class=\"keyButtonLabel\">").concat(text, "</span> \n            </span>\n        ");
  }
  return "\n        <span class=\"keyButtonContainer\"> \n            <span class=\"keyButtonLabel\">".concat(text, "</span> \n            <span>\n                ").concat(styledKeyCodes, "\n            </span>\n        </span>\n    ");
};