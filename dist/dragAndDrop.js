"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simulateDragAndDrop = exports.endDrag = exports.beginDrag = void 0;
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var simulateDragAndDrop = exports.simulateDragAndDrop = function simulateDragAndDrop(openKeyNav, sourceElement, targetElement) {
  var handleStickyMove = function handleStickyMove() {
    function findMatchingElementByHTML(htmlString) {
      function removeComments(htmlString) {
        return htmlString.replace(/<!--[\s\S]*?-->/g, '');
      }

      // Remove comments from the HTML string
      var cleanedHTMLString = removeComments(htmlString);

      // Get all elements in the document
      var allElements = document.querySelectorAll('*');
      var _iterator = _createForOfIteratorHelper(allElements),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var element = _step.value;
          // Remove comments from the element's HTML
          var cleanedElementHTML = removeComments(element.innerHTML);

          // Compare the cleaned HTML of each element with the cleaned HTML string
          if (cleanedElementHTML === cleanedHTMLString) {
            return element;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return null;
    }
    if (!openKeyNav.config.modesConfig.move.modifier) {
      return false;
    }
    openKeyNav.config.typedLabel.value = '';
    openKeyNav.config.modesConfig.move.selectedDropZone = false;

    // if the selected element (openKeyNav.config.modesConfig.move.selectedMoveable) is no longer in the DOM,
    // try to find an element in the DOM with matching HTML
    // that complies with the move inclusion criteria
    // and doesn't go against the exclusion criteria
    // set that element as the selected element
    // and then move the openKeyNav-label-selected label to it

    if (!document.contains(openKeyNav.config.modesConfig.move.selectedMoveable)) {
      var matchingElement = findMatchingElementByHTML(openKeyNav.config.modesConfig.move.selectedMoveableHTML);
      var selectedConfig = openKeyNav.config.modesConfig.move.config[openKeyNav.config.modesConfig.move.selectedConfig];
      var passesInclusionCriteria = matchingElement && matchingElement.matches(selectedConfig.fromElements) || matchingElement.matches(selectedConfig.fromContainer + ' > *');
      var passesExclusionCriteria = matchingElement && !matchingElement.matches(selectedConfig.fromExclude);
      if (passesInclusionCriteria && passesExclusionCriteria) {
        console.log('Matching element found:', matchingElement);
        openKeyNav.config.modesConfig.move.selectedMoveable = matchingElement;
        openKeyNav.config.modesConfig.move.selectedMoveableHTML = matchingElement.innerHTML;
        openKeyNav.updateOverlayPosition(matchingElement, openKeyNav.config.modesConfig.move.selectedLabel);
        beginDrag(openKeyNav);
      } else {
        console.log('No matching element found.');
        openKeyNav.removeOverlays(true);
        openKeyNav.clearMoveAttributes();
      }
    }
  };
  endDrag(openKeyNav, targetElement);
  handleStickyMove();

  //   // Sequence the event dispatches with delays
  //     (() => { return new Promise((resolve) => {resolve()})})()
  //     .then(() => dispatchEvent(sourceElement, mouseDownEvent, 1))
  //     .then(() => dispatchEvent(sourceElement, dragStartEvent, 1))
  //     .then(() => dispatchEvent(targetElement, dragEnterEvent, 1))
  //     .then(() => dispatchEvent(targetElement, dragOverEvent, 1))
  //     .then(() => dispatchEvent(targetElement, dropEvent, 1))
  //     .then(() => dispatchEvent(sourceElement, dragEndEvent, 1))
  //     .then(() => dispatchEvent(targetElement, mouseUpEvent, 1))
  //     .then(() => handleStickyMove());
};
var endDrag = exports.endDrag = function endDrag(openKeyNav, targetElement) {
  var dataTransfer = new DataTransfer(); // Create a DataTransfer object to carry the drag data.

  var clientX = 0;
  var clientY = 0;
  var sourceElement = openKeyNav.config.modesConfig.move.selectedMoveable;
  if (typeof TouchEvent === 'undefined') {
    openKeyNav.setupTouchEvent();
  }
  if (!sourceElement) {
    sourceElement = document.body;
  }
  if (!targetElement) {
    targetElement = document.body;
  }
  var rectTarget = targetElement.getBoundingClientRect();
  if (targetElement != document) {
    clientX = rectTarget.left + rectTarget.width / 2;
    clientY = rectTarget.top + rectTarget.height / 2;
  }

  // Create mousemove event to simulate dragging
  var mouseMoveEvent = new MouseEvent('mousemove', {
    bubbles: true,
    cancelable: true,
    clientX: clientX,
    clientY: clientY
  });

  // Create touchmove event to simulate dragging
  var touchMoveEvent = new TouchEvent('touchmove', {
    bubbles: true,
    cancelable: true,
    touches: [new Touch({
      identifier: Date.now(),
      target: targetElement,
      clientX: clientX,
      clientY: clientY
    })]
  });

  // Create dragenter event
  var dragEnterEvent = new DragEvent('dragenter', {
    bubbles: true,
    cancelable: true,
    clientX: clientX,
    clientY: clientY,
    dataTransfer: dataTransfer
  });
  Object.defineProperty(dragEnterEvent, 'dataTransfer', {
    value: dataTransfer
  });

  // Create dragover event
  var dragOverEvent = new DragEvent('dragover', {
    bubbles: true,
    cancelable: true,
    clientX: clientX,
    clientY: clientY,
    dataTransfer: dataTransfer
  });
  Object.defineProperty(dragOverEvent, 'dataTransfer', {
    value: dataTransfer
  });

  // Create drop event
  var dropEvent = new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
    clientX: clientX,
    clientY: clientY,
    dataTransfer: dataTransfer
  });
  Object.defineProperty(dropEvent, 'dataTransfer', {
    value: dataTransfer
  });

  // Create dragend event
  var dragEndEvent = new DragEvent('dragend', {
    bubbles: true,
    cancelable: true,
    clientX: clientX,
    clientY: clientY,
    dataTransfer: dataTransfer
  });
  Object.defineProperty(dragEndEvent, 'dataTransfer', {
    value: dataTransfer
  });

  // Create mouseup event to drop
  var mouseUpEvent = new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    clientX: clientX,
    clientY: clientY
  });

  // Create touchend event to drop
  var touchEndEvent = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    changedTouches: [new Touch({
      identifier: Date.now(),
      target: targetElement,
      clientX: clientX,
      clientY: clientY
    })]
  });

  // Dispatch the events
  try {
    document.dispatchEvent(mouseMoveEvent);
  } catch (error) {
    console.log(error);
  }
  try {
    document.dispatchEvent(touchMoveEvent);
  } catch (error) {
    console.log(error);
  }
  try {
    targetElement.dispatchEvent(dragEnterEvent);
  } catch (error) {
    console.log(error);
  }
  try {
    targetElement.dispatchEvent(dragOverEvent);
  } catch (error) {
    console.log(error);
  }
  try {
    if (targetElement != document) {
      targetElement.dispatchEvent(dropEvent);
    }
  } catch (error) {
    console.log(error);
  }
  try {
    sourceElement.dispatchEvent(dragEndEvent);
  } catch (error) {
    console.log(error);
  }
  targetElement.dispatchEvent(mouseUpEvent);
  targetElement.dispatchEvent(touchEndEvent);
};
var beginDrag = exports.beginDrag = function beginDrag(openKeyNav) {
  var sourceElement = openKeyNav.config.modesConfig.move.selectedMoveable;
  var rectSource = sourceElement.getBoundingClientRect();
  var dataTransfer = new DataTransfer(); // Create a DataTransfer object to carry the drag data.

  if (typeof TouchEvent === 'undefined') {
    openKeyNav.setupTouchEvent();
  }

  // Create and dispatch mousedown event
  var mouseDownEvent = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    clientX: rectSource.left + rectSource.width / 2,
    clientY: rectSource.top + rectSource.height / 2
  });
  sourceElement.dispatchEvent(mouseDownEvent);

  // Create and dispatch touchstart event (if needed)
  var touchStartEvent = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [new Touch({
      identifier: Date.now(),
      target: sourceElement,
      clientX: rectSource.left + rectSource.width / 2,
      clientY: rectSource.top + rectSource.height / 2
    })]
  });
  sourceElement.dispatchEvent(touchStartEvent);

  // Simulate mouse movement to trigger Dragula's drag start logic
  var mouseMoveEvent = new MouseEvent('mousemove', {
    bubbles: true,
    cancelable: true,
    clientX: rectSource.left + rectSource.width / 2 + 10,
    // Move mouse 10 pixels to the right
    clientY: rectSource.top + rectSource.height / 2 + 10 // Move mouse 10 pixels down
  });
  document.dispatchEvent(mouseMoveEvent);

  // Create and dispatch dragstart event
  var dragStartEvent = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
    clientX: rectSource.left + rectSource.width / 2 + 10,
    clientY: rectSource.top + rectSource.height / 2 + 10,
    dataTransfer: dataTransfer
  });
  // Use Object.defineProperty to attach the dataTransfer object to the event.
  Object.defineProperty(dragStartEvent, 'dataTransfer', {
    value: dataTransfer
  });
  sourceElement.dispatchEvent(dragStartEvent);
};