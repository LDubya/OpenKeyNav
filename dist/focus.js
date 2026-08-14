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
  var discoveredRouteIndex = new Map(model.headingRoutes.map(function (route, index) {
    return [route, index];
  }));
  var compareRoutesInDocumentOrder = function compareRoutesInDocumentOrder(left, right) {
    if (left.heading === right.heading) return 0;
    var position = left.heading.compareDocumentPosition(right.heading);
    if (!(position & Node.DOCUMENT_POSITION_DISCONNECTED)) {
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    }
    return discoveredRouteIndex.get(left) - discoveredRouteIndex.get(right);
  };
  var allRoutes = model.headingRoutes.filter(function (route) {
    return route.targets.length > 0;
  }).sort(compareRoutesInDocumentOrder);
  var routes = allRoutes.filter(function (route) {
    return route.heading.matches(headings);
  });
  openKeyNav.config.headings.list = routes.map(function (route) {
    return route.targets[0];
  });
  if (openKeyNav.config.headings.list.length == 0) {
    return true;
  }
  var headingState = openKeyNav.config.headings;
  var lastIndex = routes.length - 1;
  var activeElement = document.activeElement;
  var activeStructuralHeading = (_openKeyNav$structura = openKeyNav.structuralNavigation) === null || _openKeyNav$structura === void 0 || (_openKeyNav$structura2 = _openKeyNav$structura.activeAuthoredHeading) === null || _openKeyNav$structura2 === void 0 ? void 0 : _openKeyNav$structura2.call(_openKeyNav$structura);
  var rememberedHeading = headingState.currentHeading;
  var inferredHeading = model.headingRoutes.slice().sort(compareRoutesInDocumentOrder).reduce(function (nearestHeading, route) {
    var heading = route.heading;
    if (heading === activeElement || heading.contains(activeElement)) {
      return heading;
    }
    var position = heading.compareDocumentPosition(activeElement);
    return position & Node.DOCUMENT_POSITION_FOLLOWING ? heading : nearestHeading;
  }, null);
  var currentHeading = activeStructuralHeading !== null && activeStructuralHeading !== void 0 && activeStructuralHeading.isConnected ? activeStructuralHeading : rememberedHeading !== null && rememberedHeading !== void 0 && rememberedHeading.isConnected ? rememberedHeading : inferredHeading;
  var currentDocumentRouteIndex = currentHeading ? -1 : allRoutes.reduce(function (activeIndex, route, routeIndex) {
    return route.targets.includes(activeElement) ? routeIndex : activeIndex;
  }, -1);
  var routeDocumentIndices = routes.map(function (route) {
    return allRoutes.indexOf(route);
  });
  var nextRouteIndex = e.shiftKey ? lastIndex : 0;

  // Move from the current authored heading's document position, even when
  // it is a different level from the requested numbered heading command.
  // This makes 1–6 mean "next/previous valid heading of this level" rather
  // than "start this level's list from the beginning."
  if (currentHeading && e.shiftKey) {
    for (var index = lastIndex; index >= 0; index--) {
      var position = currentHeading.compareDocumentPosition(routes[index].heading);
      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        nextRouteIndex = index;
        break;
      }
    }
  } else if (currentHeading) {
    var followingRouteIndex = routes.findIndex(function (route) {
      return currentHeading.compareDocumentPosition(route.heading) & Node.DOCUMENT_POSITION_FOLLOWING;
    });
    if (followingRouteIndex >= 0) {
      nextRouteIndex = followingRouteIndex;
    }
  } else if (e.shiftKey) {
    for (var _index = lastIndex; _index >= 0; _index--) {
      if (routeDocumentIndices[_index] < currentDocumentRouteIndex) {
        nextRouteIndex = _index;
        break;
      }
    }
  } else if (currentDocumentRouteIndex >= 0) {
    var _followingRouteIndex = routeDocumentIndices.findIndex(function (routeIndex) {
      return routeIndex > currentDocumentRouteIndex;
    });
    if (_followingRouteIndex >= 0) {
      nextRouteIndex = _followingRouteIndex;
    }
  }
  headingState.currentHeadingIndex = nextRouteIndex;
  var nextRoute = routes[nextRouteIndex];
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