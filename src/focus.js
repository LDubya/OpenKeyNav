export const focusOnHeadings = (openKeyNav, headings, e) => {
    openKeyNav.config.headings.list = Array.from(document.querySelectorAll(headings)) // Get all headings in the view
      .filter(el => {
        // Skip if the element is visually hidden
        const style = getComputedStyle(el);
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
    const nextHeading = openKeyNav.config.headings.list[openKeyNav.config.headings.currentHeadingIndex];
    if (!nextHeading.getAttribute('tabindex')) {
      nextHeading.setAttribute('tabindex', '-1'); // Make the heading focusable
    }
    nextHeading.focus(); // Set focus on the next heading
    // Listen for the blur event to remove the tabindex attribute
    nextHeading.addEventListener('blur', function handler() {
      nextHeading.removeAttribute('tabindex'); // Remove the tabindex attribute
      nextHeading.removeEventListener('blur', handler); // Clean up the event listener
    });
};

export const focusOnScrollables = (openKeyNav, e) => {
    openKeyNav.config.scrollables.list = openKeyNav.getScrollableElements(); // Populate or refresh the list of scrollable elements

    if (openKeyNav.config.scrollables.list.length == 0) {
      return; // If no scrollable elements, exit the function
    }

    // /*
    {
      // Navigate through scrollable elements
      if (e.shiftKey) {
        // Move backwards
        openKeyNav.config.currentScrollableIndex =
          openKeyNav.config.currentScrollableIndex > 0
            ? openKeyNav.config.currentScrollableIndex - 1
            : openKeyNav.config.scrollables.list.length - 1;
      } else {
        // Move forwards
        openKeyNav.config.currentScrollableIndex =
          openKeyNav.config.currentScrollableIndex < openKeyNav.config.scrollables.list.length - 1
            ? openKeyNav.config.currentScrollableIndex + 1
            : 0;
      }
    }
    //*/

    // Focus the current scrollable element
    const currentScrollable = openKeyNav.config.scrollables.list[openKeyNav.config.currentScrollableIndex];
    if (!currentScrollable.getAttribute('tabindex')) {
      currentScrollable.setAttribute('tabindex', '-1'); // Make the element focusable
    }
    currentScrollable.focus(); // Set focus on the element

    // Clean up: remove tabindex and blur listener when focus is lost
    currentScrollable.addEventListener('blur', function handler() {
      currentScrollable.removeAttribute('tabindex');
      currentScrollable.removeEventListener('blur', handler);
    });
};