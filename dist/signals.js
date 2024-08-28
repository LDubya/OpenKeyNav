"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.derived = derived;
exports.effect = effect;
exports.signal = signal;
var subscriber = null;
function signal(value) {
  var subscriptions = new Set();
  return {
    get value() {
      if (subscriber) {
        subscriptions.add(subscriber);
      }
      return value;
    },
    set value(updated) {
      value = updated;
      subscriptions.forEach(function (fn) {
        return fn();
      });
    }
  };
}
function effect(fn) {
  subscriber = fn;
  fn();
  subscriber = null;
}
function derived(fn) {
  var derived = signal();
  effect(function () {
    derived.value = fn();
  });
  return derived;
}