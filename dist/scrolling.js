"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disableScrolling = void 0;
var disableScrolling = exports.disableScrolling = function disableScrolling(openKeyNav) {
  // Prevent scrolling on the webpage

  var disableScrollingForEl = function disableScrollingForEl(el) {
    el.addEventListener('scroll', openKeyNav.preventScroll, {
      passive: false
    });
    el.addEventListener('wheel', openKeyNav.preventScroll, {
      passive: false
    });
    el.addEventListener('touchmove', openKeyNav.preventScroll, {
      passive: false
    });
  };
  var disableScrollingForScrollableElements = function disableScrollingForScrollableElements() {
    disableScrollingForEl(window);
    openKeyNav.getScrollableElements().forEach(function (el) {
      disableScrollingForEl(el);
    });
  };
  disableScrollingForScrollableElements();
};