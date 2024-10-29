"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyButton = void 0;
var keyButton = exports.keyButton = function keyButton(keyCode, text, reverseOrder) {
  var styledKeyCode = "<span class=\"keyButton\">".concat(keyCode, "</span>");
  if (!text) {
    return "".concat(styledKeyCode);
  }
  if (reverseOrder) {
    return "\n        <span class=\"keyButtonContainer\"> \n            ".concat(styledKeyCode, "\n            <span class=\"keyButtonLabel\">").concat(text, "</span> \n        </span>\n    ");
  }
  return "\n        <span class=\"keyButtonContainer\"> \n            <span class=\"keyButtonLabel\">".concat(text, "</span> \n            ").concat(styledKeyCode, "\n        </span>\n    ");
};