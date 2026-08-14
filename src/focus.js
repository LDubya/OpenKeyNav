import { buildStructuralModel } from './structuralModel.js';
import { discoverTabbableTargets } from './tabbableTargets.js';

export const focusOnHeadings = (openKeyNav, headings, e) => {
    const targets = discoverTabbableTargets(document, {
      displayCheck: openKeyNav.config.debug.screenReaderVisible
        ? 'none'
        : 'full',
      getShadowRoot: true,
      includeProgrammatic: false,
    });
    const model = buildStructuralModel({ root: document, targets });
    const routes = model.headingRoutes
      .filter(route => route.heading.matches(headings))
      .filter(route => route.targets.length > 0);
    openKeyNav.config.headings.list = routes.map(route => route.targets[0]);

    if (openKeyNav.config.headings.list.length == 0) {
      return true;
    }

    const headingState = openKeyNav.config.headings;
    const lastIndex = headingState.list.length - 1;
    const currentRouteIndex = routes.findIndex(route => (
      route.heading === headingState.currentHeading &&
      route.targets[0] === document.activeElement
    ));
    const focusedHeadingIndex = currentRouteIndex >= 0
      ? currentRouteIndex
      : routes.reduce((activeIndex, route, routeIndex) => (
        route.targets.includes(document.activeElement)
          ? routeIndex
          : activeIndex
      ), -1);
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
    const nextRoute = routes[headingState.currentHeadingIndex];
    const nextTarget = nextRoute.targets[0];
    headingState.currentHeading = nextRoute.heading;
    openKeyNav.focus(nextTarget);
};

export const focusOnScrollables = (openKeyNav, e) => {
    openKeyNav.config.scrollables.list = openKeyNav.getScrollableElements(); // Populate or refresh the list of scrollable elements

    if (openKeyNav.config.scrollables.list.length == 0) {
      return; // If no scrollable elements, exit the function
    }

    const scrollables = openKeyNav.config.scrollables;
    const lastIndex = scrollables.list.length - 1;
    const focusedScrollableIndex = scrollables.list.indexOf(document.activeElement);

    // Re-enter the route from its boundary when focus is elsewhere instead of
    // reusing an index from a different or stale scrollable list.
    if (focusedScrollableIndex >= 0) {
      scrollables.currentScrollableIndex = focusedScrollableIndex;
    } else {
      scrollables.currentScrollableIndex = -1;
    }

    if (e.shiftKey) {
      scrollables.currentScrollableIndex = scrollables.currentScrollableIndex > 0
        ? scrollables.currentScrollableIndex - 1
        : lastIndex;
    } else {
      scrollables.currentScrollableIndex = scrollables.currentScrollableIndex < lastIndex
        ? scrollables.currentScrollableIndex + 1
        : 0;
    }

    // Focus the current scrollable element
    const currentScrollable = scrollables.list[scrollables.currentScrollableIndex];
    if (!currentScrollable.hasAttribute('tabindex')) {
      currentScrollable.setAttribute('tabindex', '-1'); // Make the element focusable
      currentScrollable.setAttribute('data-openkeynav-tabIndexed', true); 
    }
    openKeyNav.focus(currentScrollable); // Set focus on the element

    // Clean up: remove tabindex and blur listener when focus is lost
    currentScrollable.addEventListener('blur', function handler() {
      if (currentScrollable.hasAttribute('data-openkeynav-tabIndexed')) {
        currentScrollable.removeAttribute('tabindex') // Remove the tabindex attribute
        currentScrollable.removeAttribute('data-openkeynav-tabIndexed'); 
      }
      currentScrollable.removeEventListener('blur', handler);
    });
};
