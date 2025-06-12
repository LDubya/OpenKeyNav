"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.focusOnScrollables = exports.focusOnHeadings = void 0;
var focusOnHeadings = exports.focusOnHeadings = function focusOnHeadings(openKeyNav, headings, e) {
  openKeyNav.config.headings.list = Array.from(document.querySelectorAll(headings)) // Get all headings in the view
  .filter(function (el) {
    // Skip if the element is visually hidden
    var style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;

    // debug mode: debug mode: do isAnyCornerVisible check by default and disable the check if debug.screenReaderVisible is true
    if (!openKeyNav.config.debug.screenReaderVisible) {
      // Skip if the element's top left corner is covered by another element
      if (!openKeyNav.isAnyCornerVisible(el)) {
        return false;
      }
    }
    return true;
  });
  if (openKeyNav.config.headings.list.length == 0) {
    return true;
  }

  // handle moving to the next / previous heading
  if (e.shiftKey) {
    // shift key is pressed, so move backwards. If at the beginning, go to the end.
    if (openKeyNav.config.headings.currentHeadingIndex > 0) {
      openKeyNav.config.headings.currentHeadingIndex--;
    } else {
      openKeyNav.config.headings.currentHeadingIndex = openKeyNav.config.headings.list.length - 1;
    }
  } else {
    // Move to the next heading. If at the end, go to the beginning.
    if (openKeyNav.config.headings.currentHeadingIndex < openKeyNav.config.headings.list.length - 1) {
      openKeyNav.config.headings.currentHeadingIndex++;
    } else {
      openKeyNav.config.headings.currentHeadingIndex = 0;
    }
  }
  var nextHeading = openKeyNav.config.headings.list[openKeyNav.config.headings.currentHeadingIndex];
  if (!nextHeading.hasAttribute('tabindex')) {
    nextHeading.setAttribute('tabindex', '-1'); // Make the heading focusable
    nextHeading.setAttribute('data-openkeynav-tabIndexed', true);
  }
  openKeyNav.focus(nextHeading); // Set focus on the next heading
  // Listen for the blur event to remove the tabindex attribute
  nextHeading.addEventListener('blur', function handler() {
    if (nextHeading.hasAttribute('data-openkeynav-tabIndexed')) {
      nextHeading.removeAttribute('tabindex'); // Remove the tabindex attribute
      nextHeading.removeAttribute('data-openkeynav-tabIndexed');
    }
    nextHeading.removeEventListener('blur', handler); // Clean up the event listener
  });
};
var focusOnScrollables = exports.focusOnScrollables = function focusOnScrollables(openKeyNav, e) {
  openKeyNav.config.scrollables.list = openKeyNav.getScrollableElements(); // Populate or refresh the list of scrollable elements

  if (openKeyNav.config.scrollables.list.length == 0) {
    return; // If no scrollable elements, exit the function
  }

  // /*
  {
    // Navigate through scrollable elements
    if (e.shiftKey) {
      // Move backwards
      openKeyNav.config.currentScrollableIndex = openKeyNav.config.currentScrollableIndex > 0 ? openKeyNav.config.currentScrollableIndex - 1 : openKeyNav.config.scrollables.list.length - 1;
    } else {
      // Move forwards
      openKeyNav.config.currentScrollableIndex = openKeyNav.config.currentScrollableIndex < openKeyNav.config.scrollables.list.length - 1 ? openKeyNav.config.currentScrollableIndex + 1 : 0;
    }
  }
  //*/

  // Focus the current scrollable element
  var currentScrollable = openKeyNav.config.scrollables.list[openKeyNav.config.currentScrollableIndex];
  if (!currentScrollable.hasAttribute('tabindex')) {
    currentScrollable.setAttribute('tabindex', '-1'); // Make the element focusable
    currentScrollable.setAttribute('data-openkeynav-tabIndexed', true);
  }
  openKeyNav.focus(currentScrollable); // Set focus on the element

  // Clean up: remove tabindex and blur listener when focus is lost
  currentScrollable.addEventListener('blur', function handler() {
    if (currentScrollable.hasAttribute('data-openkeynav-tabIndexed')) {
      currentScrollable.removeAttribute('tabindex'); // Remove the tabindex attribute
      currentScrollable.removeAttribute('data-openkeynav-tabIndexed');
    }
    currentScrollable.removeEventListener('blur', handler);
  });
};