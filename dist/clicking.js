"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.placeCursorAndScrollToCursor = exports.handleTargetClickInteraction = void 0;
var handleTargetClickInteraction = exports.handleTargetClickInteraction = function handleTargetClickInteraction(openKeyNav, target, e) {
  var doc = target.ownerDocument;
  var win = doc.defaultView || doc.parentWindow;
  var target_tagName = target.tagName.toLowerCase();
  if (target_tagName === 'input' || target_tagName === 'textarea' || target.contentEditable === 'true' || target.contentEditable === 'plaintext-only' || target.hasAttribute('tabindex') && target.tabIndex > -1) {
    target.focus();
    placeCursorAndScrollToCursor(target);
  } else {
    if (e.shiftKey && target.tagName.toLowerCase() === 'a' && target.href) {
      win.open(target.href, '_blank');
    } else {
      target.focus(); // Ensure the target element is focused before dispatching the click event
      if (!openKeyNav.config.modesConfig.click.modifier) {
        var clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: win
        });
        target.dispatchEvent(clickEvent);
      }
    }
  }
  openKeyNav.removeOverlays();
  openKeyNav.clearMoveAttributes();
};
var placeCursorAndScrollToCursor = exports.placeCursorAndScrollToCursor = function placeCursorAndScrollToCursor(target) {
  var targetTagName = target.tagName.toLowerCase();
  setTimeout(function () {
    target.focus();
    if (targetTagName === 'input' || targetTagName === 'textarea') {
      // Move the cursor to the end for input and textarea elements
      var valueLength = target.value.length;
      target.selectionStart = valueLength;
      target.selectionEnd = valueLength;
      // Scroll the element itself into view if it's not fully visible
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    } else if (target.contentEditable === 'true' || target.contentEditable === 'plaintext-only') {
      // Move the caret to the end for contenteditable elements
      var range = document.createRange();
      var sel = window.getSelection();
      range.selectNodeContents(target);
      range.collapse(false); // false to move to the end
      sel.removeAllRanges();
      sel.addRange(range);
      // Attempt to ensure the caret is visible, considering the element might be larger than the viewport
      var rect = range.getBoundingClientRect();
      if (rect.bottom > window.innerHeight || rect.top < 0) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }

    // For elements with tabIndex > -1, focusing them should scroll them into view,
    // but additional logic might be needed based on specific requirements.
  }, 0);
};