"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.currentMode = exports.MODES = void 0;
var _signals = require("./signals.js");
// src/modes.js

// Define modes
var MODES = exports.MODES = {
  NONE: 'none',
  CLICK: 'click',
  DRAG: 'drag'
  // Add more modes as needed
};

// Signal for the current mode
var currentMode = exports.currentMode = (0, _signals.signal)(MODES.NONE);