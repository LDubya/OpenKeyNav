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
  var headingState = openKeyNav.config.headings;
  var lastIndex = headingState.list.length - 1;
  var focusedHeadingIndex = headingState.list.indexOf(document.activeElement);
  if (focusedHeadingIndex >= 0) {
    headingState.currentHeadingIndex = focusedHeadingIndex;
  } else {
    // The current focus is outside this particular heading route. Start at
    // its boundary instead of reusing an index from another heading level.
    headingState.currentHeadingIndex = -1;
  }

  // handle moving to the next / previous heading
  if (e.shiftKey) {
    // shift key is pressed, so move backwards. If at the beginning, go to the end.
    if (headingState.currentHeadingIndex > 0) {
      headingState.currentHeadingIndex--;
    } else {
      headingState.currentHeadingIndex = lastIndex;
    }
  } else {
    // Move to the next heading. If at the end, go to the beginning.
    if (headingState.currentHeadingIndex < lastIndex) {
      headingState.currentHeadingIndex++;
    } else {
      headingState.currentHeadingIndex = 0;
    }
  }
  var nextHeading = headingState.list[headingState.currentHeadingIndex];
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
  var scrollables = openKeyNav.config.scrollables;
  var lastIndex = scrollables.list.length - 1;
  var focusedScrollableIndex = scrollables.list.indexOf(document.activeElement);

  // Re-enter the route from its boundary when focus is elsewhere instead of
  // reusing an index from a different or stale scrollable list.
  if (focusedScrollableIndex >= 0) {
    scrollables.currentScrollableIndex = focusedScrollableIndex;
  } else {
    scrollables.currentScrollableIndex = -1;
  }
  if (e.shiftKey) {
    scrollables.currentScrollableIndex = scrollables.currentScrollableIndex > 0 ? scrollables.currentScrollableIndex - 1 : lastIndex;
  } else {
    scrollables.currentScrollableIndex = scrollables.currentScrollableIndex < lastIndex ? scrollables.currentScrollableIndex + 1 : 0;
  }

  // Focus the current scrollable element
  var currentScrollable = scrollables.list[scrollables.currentScrollableIndex];
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