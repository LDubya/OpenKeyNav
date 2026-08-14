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
    const discoveredRouteIndex = new Map(
      model.headingRoutes.map((route, index) => [route, index])
    );
    const compareRoutesInDocumentOrder = (left, right) => {
      if (left.heading === right.heading) return 0;
      const position = left.heading.compareDocumentPosition(right.heading);
      if (!(position & Node.DOCUMENT_POSITION_DISCONNECTED)) {
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      }
      return discoveredRouteIndex.get(left) - discoveredRouteIndex.get(right);
    };
    const allRoutes = model.headingRoutes
      .filter(route => route.targets.length > 0)
      .sort(compareRoutesInDocumentOrder);
    const routes = allRoutes
      .filter(route => route.heading.matches(headings));
    openKeyNav.config.headings.list = routes.map(route => route.targets[0]);

    if (openKeyNav.config.headings.list.length == 0) {
      return true;
    }

    const headingState = openKeyNav.config.headings;
    const lastIndex = routes.length - 1;
    const activeElement = document.activeElement;
    const activeStructuralHeading = openKeyNav.structuralNavigation
      ?.activeAuthoredHeading?.();
    const rememberedHeading = headingState.currentHeading;
    const inferredHeading = model.headingRoutes
      .slice()
      .sort(compareRoutesInDocumentOrder)
      .reduce((nearestHeading, route) => {
        const heading = route.heading;
        if (heading === activeElement || heading.contains(activeElement)) {
          return heading;
        }
        const position = heading.compareDocumentPosition(activeElement);
        return position & Node.DOCUMENT_POSITION_FOLLOWING
          ? heading
          : nearestHeading;
      }, null);
    const currentHeading = activeStructuralHeading?.isConnected
      ? activeStructuralHeading
      : rememberedHeading?.isConnected
        ? rememberedHeading
        : inferredHeading;
    const currentDocumentRouteIndex = currentHeading
      ? -1
      : allRoutes.reduce((activeIndex, route, routeIndex) => (
          route.targets.includes(activeElement)
            ? routeIndex
            : activeIndex
        ), -1);
    const routeDocumentIndices = routes.map(route => allRoutes.indexOf(route));
    let nextRouteIndex = e.shiftKey ? lastIndex : 0;

    // Move from the current authored heading's document position, even when
    // it is a different level from the requested numbered heading command.
    // This makes 1–6 mean "next/previous valid heading of this level" rather
    // than "start this level's list from the beginning."
    if (currentHeading && e.shiftKey) {
      for (let index = lastIndex; index >= 0; index--) {
        const position = currentHeading.compareDocumentPosition(
          routes[index].heading
        );
        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          nextRouteIndex = index;
          break;
        }
      }
    } else if (currentHeading) {
      const followingRouteIndex = routes.findIndex(route => (
        currentHeading.compareDocumentPosition(route.heading) &
        Node.DOCUMENT_POSITION_FOLLOWING
      ));
      if (followingRouteIndex >= 0) {
        nextRouteIndex = followingRouteIndex;
      }
    } else if (e.shiftKey) {
      for (let index = lastIndex; index >= 0; index--) {
        if (routeDocumentIndices[index] < currentDocumentRouteIndex) {
          nextRouteIndex = index;
          break;
        }
      }
    } else if (currentDocumentRouteIndex >= 0) {
      const followingRouteIndex = routeDocumentIndices.findIndex(
        routeIndex => routeIndex > currentDocumentRouteIndex
      );
      if (followingRouteIndex >= 0) {
        nextRouteIndex = followingRouteIndex;
      }
    }

    headingState.currentHeadingIndex = nextRouteIndex;
    const nextRoute = routes[nextRouteIndex];
    const nextTarget = nextRoute.targets[0];
    headingState.currentHeading = nextRoute.heading;
    const settledTarget = openKeyNav.focus(nextTarget);
    openKeyNav.structuralNavigation?.selectAuthoredHeading?.(
      nextRoute.heading,
      settledTarget
    );
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
