"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.focusOnScrollables = exports.focusOnHeadings = void 0;
var _structuralModel = require("./structuralModel.js");
var _tabbableTargets = require("./tabbableTargets.js");
var focusOnHeadings = exports.focusOnHeadings = function focusOnHeadings(openKeyNav, headings, e) {
  var _openKeyNav$structura, _openKeyNav$structura2, _openKeyNav$structura3, _openKeyNav$structura4;
  var targets = (0, _tabbableTargets.discoverTabbableTargets)(document, {
    displayCheck: openKeyNav.config.debug.screenReaderVisible ? 'none' : 'full',
    getShadowRoot: true,
    includeProgrammatic: false
  });
  var model = (0, _structuralModel.buildStructuralModel)({
    root: document,
    targets: targets
  });
  var routes = model.headingRoutes.filter(function (route) {
    return route.heading.matches(headings);
  }).filter(function (route) {
    return route.targets.length > 0;
  });
  openKeyNav.config.headings.list = routes.map(function (route) {
    return route.targets[0];
  });
  if (openKeyNav.config.headings.list.length == 0) {
    return true;
  }
  var headingState = openKeyNav.config.headings;
  var lastIndex = headingState.list.length - 1;
  var activeStructuralHeading = (_openKeyNav$structura = openKeyNav.structuralNavigation) === null || _openKeyNav$structura === void 0 || (_openKeyNav$structura2 = _openKeyNav$structura.activeAuthoredHeading) === null || _openKeyNav$structura2 === void 0 ? void 0 : _openKeyNav$structura2.call(_openKeyNav$structura);
  var structuralRouteIndex = routes.findIndex(function (route) {
    return route.heading === activeStructuralHeading && route.targets.includes(document.activeElement);
  });
  var rememberedRouteIndex = routes.findIndex(function (route) {
    return route.heading === headingState.currentHeading && route.targets[0] === document.activeElement;
  });
  var focusedHeadingIndex = structuralRouteIndex >= 0 ? structuralRouteIndex : rememberedRouteIndex;
  if (focusedHeadingIndex < 0) {
    focusedHeadingIndex = routes.reduce(function (activeIndex, route, routeIndex) {
      return route.targets.includes(document.activeElement) ? routeIndex : activeIndex;
    }, -1);
  }
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
  var nextRoute = routes[headingState.currentHeadingIndex];
  var nextTarget = nextRoute.targets[0];
  headingState.currentHeading = nextRoute.heading;
  var settledTarget = openKeyNav.focus(nextTarget);
  (_openKeyNav$structura3 = openKeyNav.structuralNavigation) === null || _openKeyNav$structura3 === void 0 || (_openKeyNav$structura4 = _openKeyNav$structura3.selectAuthoredHeading) === null || _openKeyNav$structura4 === void 0 || _openKeyNav$structura4.call(_openKeyNav$structura3, nextRoute.heading, settledTarget);
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