"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyButton = void 0;
var keyButton = exports.keyButton = function keyButton(keyCode, text) {
  var styledKeyCode = "<span class=\"keyButton\">".concat(keyCode, "</span>");
  if (!text) {
    return "".concat(styledKeyCode);
  }
  return "".concat(text, " ").concat(styledKeyCode);
};