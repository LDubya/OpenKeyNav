(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.OpenKeyNav = factory());
})(this, (function () { 'use strict';

  var OpenKeyNav$1 = {};

  var version = {};

  Object.defineProperty(version, "__esModule", {
    value: true
  });
  version.version = void 0;
  version.version = "0.1.217";

  var signals = {};

  Object.defineProperty(signals, "__esModule", {
    value: true
  });
  signals.derived = derived;
  signals.effect = effect;
  signals.signal = signal;
  var subscriber = null;
  function signal(value) {
    var subscriptions = new Set();
    return {
      get value() {
        if (subscriber) {
          subscriptions.add(subscriber);
        }
        return value;
      },
      set value(updated) {
        value = updated;
        subscriptions.forEach(function (fn) {
          return fn();
        });
      }
    };
  }
  function effect(fn) {
    subscriber = fn;
    fn();
    subscriber = null;
  }
  function derived(fn) {
    var derived = signal();
    effect(function () {
      derived.value = fn();
    });
    return derived;
  }

  var toolbar = {};

  var keyButton = {};

  Object.defineProperty(keyButton, "__esModule", {
    value: true
  });
  keyButton.keyButton = void 0;
  keyButton.keyButton = function keyButton(keyCodes, text, reverseOrder) {
    // let styledKeyCode = `<span class="keyButton">${keyCode}</span>`;
    var styledKeyCodes = keyCodes.map(function (keyCode) {
      return "<span class=\"keyButton\">".concat(keyCode, "</span>");
    }).join("");
    if (!text) {
      return "".concat(styledKeyCodes);
    }
    if (reverseOrder) {
      return "\n            <span class=\"keyButtonContainer\"> \n                <span>\n                    ".concat(styledKeyCodes, "\n                </span>\n                <span class=\"keyButtonLabel\">").concat(text, "</span> \n            </span>\n        ");
    }
    return "\n        <span class=\"keyButtonContainer\"> \n            <span class=\"keyButtonLabel\">".concat(text, "</span> \n            <span>\n                ").concat(styledKeyCodes, "\n            </span>\n        </span>\n    ");
  };

  var keypress = {};

  var clicking = {};

  Object.defineProperty(clicking, "__esModule", {
    value: true
  });
  clicking.placeCursorAndScrollToCursor = clicking.handleTargetClickInteraction = void 0;
  clicking.handleTargetClickInteraction = function handleTargetClickInteraction(openKeyNav, target, e) {
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
  var placeCursorAndScrollToCursor = clicking.placeCursorAndScrollToCursor = function placeCursorAndScrollToCursor(target) {
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

  var dragAndDrop = {};

  Object.defineProperty(dragAndDrop, "__esModule", {
    value: true
  });
  dragAndDrop.simulateDragAndDrop = dragAndDrop.endDrag = dragAndDrop.beginDrag = void 0;
  function _createForOfIteratorHelper$2(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (!t) {
      if (Array.isArray(r) || (t = _unsupportedIterableToArray$3(r)) || e) {
        t && (r = t);
        var _n = 0,
          F = function F() {};
        return {
          s: F,
          n: function n() {
            return _n >= r.length ? {
              done: !0
            } : {
              done: !1,
              value: r[_n++]
            };
          },
          e: function e(r) {
            throw r;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function s() {
        t = t.call(r);
      },
      n: function n() {
        var r = t.next();
        return a = r.done, r;
      },
      e: function e(r) {
        u = !0, o = r;
      },
      f: function f() {
        try {
          a || null == t.return || t.return();
        } finally {
          if (u) throw o;
        }
      }
    };
  }
  function _unsupportedIterableToArray$3(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$3(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$3(r, a) : void 0;
    }
  }
  function _arrayLikeToArray$3(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  dragAndDrop.simulateDragAndDrop = function simulateDragAndDrop(openKeyNav, sourceElement, targetElement) {
    var handleStickyMove = function handleStickyMove() {
      function findMatchingElementByHTML(htmlString) {
        function removeComments(htmlString) {
          return htmlString.replace(/<!--[\s\S]*?-->/g, '');
        }

        // Remove comments from the HTML string
        var cleanedHTMLString = removeComments(htmlString);

        // Get all elements in the document
        var allElements = document.querySelectorAll('*');
        var _iterator = _createForOfIteratorHelper$2(allElements),
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
  var endDrag = dragAndDrop.endDrag = function endDrag(openKeyNav, targetElement) {
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
  var beginDrag = dragAndDrop.beginDrag = function beginDrag(openKeyNav) {
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

  var _escape$3 = {};

  Object.defineProperty(_escape$3, "__esModule", {
    value: true
  });
  _escape$3.handleEscape = void 0;
  var _dragAndDrop$1 = dragAndDrop;
  _escape$3.handleEscape = function handleEscape(openKeyNav, e) {
    var returnFalse = false;
    if (openKeyNav.config.modes.clicking.value || openKeyNav.config.modes.moving.value || openKeyNav.config.modes.menu.value) {
      e.preventDefault();
      e.stopPropagation();
      (0, _dragAndDrop$1.endDrag)(openKeyNav);
      openKeyNav.removeOverlays();
      openKeyNav.clearMoveAttributes();
      returnFalse = true;
    }
    if (openKeyNav.isTextInputActive()) {
      document.activeElement.blur(); // Removes focus from the active text input
    }
    if (returnFalse) {
      return false;
    } else {
      if (document.activeElement != document.body) {
        document.activeElement.blur();
      }
    }
  };

  var focus = {};

  Object.defineProperty(focus, "__esModule", {
    value: true
  });
  focus.focusOnScrollables = focus.focusOnHeadings = void 0;
  focus.focusOnHeadings = function focusOnHeadings(openKeyNav, headings, e) {
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
  focus.focusOnScrollables = function focusOnScrollables(openKeyNav, e) {
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

  var isTabbable = {};

  Object.defineProperty(isTabbable, "__esModule", {
    value: true
  });
  isTabbable.isTabbable = void 0;
  var isHiddenByOverflow = function isHiddenByOverflow(element) {
    var parent = element.parentNode;
    // Use the ownerDocument to get the correct document context
    var doc = element.ownerDocument;
    var body = doc.body;
    while (parent && parent !== body) {
      // Use the specific document body of the element
      // if (parent instanceof HTMLElement) {
      var parentStyle = getComputedStyle(parent);
      if (['scroll', 'auto'].includes(parentStyle.overflow) || ['scroll', 'auto'].includes(parentStyle.overflowX) || ['scroll', 'auto'].includes(parentStyle.overflowY)) {
        var parentRect = parent.getBoundingClientRect();
        var rect = element.getBoundingClientRect();
        if (rect.bottom < parentRect.top || rect.top > parentRect.bottom || rect.right < parentRect.left || rect.left > parentRect.right) {
          return true; // Element is hidden by parent's overflow
        }
      }
      // }
      parent = parent.parentNode;
    }
    return false; // No parent hides the element by overflow
  };
  var inViewport = function inViewport(el) {
    // check if the element's top left corner is within the window's viewport
    var rect = el.getBoundingClientRect();
    var isInViewport = rect.top < window.innerHeight && rect.left < window.innerWidth && rect.bottom > 0 && rect.right > 0;
    return isInViewport;
  };
  isTabbable.isTabbable = function isTabbable(el, openKeyNav) {
    var clickableElements = ['a', 'button', 'textarea', 'select', 'input', 'iframe', 'summary', '[onclick]'];
    var interactiveRoles = ['button', 'link', 'menuitem', 'option', 'tab', 'treeitem', 'checkbox', 'radio'];
    var isTypicallyClickableElement = function isTypicallyClickableElement(el) {
      // Check if the element is a known clickable element
      if (el.matches(clickableElements.join())) {
        return true;
      }

      // Check if the element has an interactive ARIA role
      var role = el.getAttribute('role');
      if (role && interactiveRoles.includes(role)) {
        return true;
      }
      return false;
    };

    // Ensure el is an Element before accessing styles
    if (!(el instanceof Element)) {
      // console.log(`!(el instanceof Element)`, el); //debug
      return false;
    }

    // Skip if the element is set to not display (not the same as having zero size)
    var style = getComputedStyle(el);
    if (style.display === 'none') {
      // console.log(`style.display === 'none'`, el); //debug
      return false;
    }

    // Skip if the element is hidden by a parent's overflow
    if (isHiddenByOverflow(el)) {
      // console.log(`isHiddenByOverflow(el)`, el); //debug
      return false;
    }

    // Skip if the element is within a <details> that is not open, but allow if it's a <summary> or a clickable element inside a <summary>
    // aka it's hidden by the collapsed detail
    if (el.matches('details:not([open]) *') && !el.matches('details:not([open]) > summary, details:not([open]) > summary *')) {
      // console.log(`hidden details element`, el); //debug
      return false;
    }

    // always include if tabindex > -1
    // include this after checking if the element is hidden by a parent's overflow, which most screen readers respect
    // (elements should not be tabbable by keyboard if they are visibly hidden,
    // so include visibly hidden items that are explicitly tabbable to help with accessibility bug discovery)
    // do not move this earlier in the heuristic
    var tabIndex = el.getAttribute('tabindex');
    if (tabIndex && parseInt(tabIndex, 10) > -1) {
      // console.log(`tabindex > -1`, el); //debug
      return true;
    }

    // Skip if the element is visually hidden (not the same as having zero size or set to not display)
    if (style.visibility === 'hidden') {
      // console.log(`style.visibility === 'hidden'`, el); //debug
      return false;
    }

    // console.log("isTabbable() -> openKeyNav", openKeyNav);

    // Skip if the element has no size (another way to visually hide something)
    if (!openKeyNav.isNonzeroSize(el)) {
      // console.log(`!openKeyNav.isNonzeroSize(el)`, el); //debug
      return false;
    }

    // Skip if the element's top left corner is not within the window's viewport
    if (!inViewport(el)) {
      // console.log(`!inViewport(el)`, el); //debug
      return false;
    }

    // do isAnyCornerVisible check by default and disable the check if debug.screenReaderVisible is true
    if (!openKeyNav.config.debug.screenReaderVisible) {
      // Skip if the element's top left corner is covered by another element
      if (!openKeyNav.isAnyCornerVisible(el)) {
        // console.log(`!openKeyNav.isAnyCornerVisible(el)`, el); //debug
        return false;
      }
    }

    // Skip if <summary> is not the first <summary> element of a <details>
    if (el.tagName.toLowerCase() === 'summary') {
      var details = el.parentElement;
      if (details && details.tagName.toLowerCase() === 'details' && details.querySelector('summary') !== el) {
        // console.log(`<summary> is not the first <summary> element of a <details>`, el); //debug
        return false;
      }
    }

    // lastly, elements that are inaccessible due to not being tabbable

    if (tabIndex && parseInt(tabIndex, 10) == -1) {
      if (isTypicallyClickableElement(el)) {
        // if (openKeyNav.config.modes.clicking.value) {
        openKeyNav.flagAsInaccessible(el, "\n            <h2>Inaccessible Element</h2>\n            <h3>Problem: </h3>\n            <p>This element is not keyboard-focusable.</p>\n            <h3>Solution: </h3>\n            <p>Since this element has a tabindex attribute set to -1, it cannot be keyboard focusable.</p>\n            <p>It must have a tabindex set to a value &gt; -1, ideally 0.</p>\n            <p>You can ignore this warning if this element is not meant to be clickable.</p>\n            ", "keyboard");
        // }
      }

      // return false; // let's keep it, since we are flagging it
    }

    // Skip if the element is an <a> without an href (unless it has an ARIA role that makes it tabbable)

    var role = el.getAttribute('role');
    switch (el.tagName.toLowerCase()) {
      case 'a':
        // console.log(el); //debug
        if (!el.hasAttribute('href') || el.getAttribute('href') === '') {
          if (!interactiveRoles.includes(role)) {
            // if (openKeyNav.config.modes.clicking.value) {
            openKeyNav.flagAsInaccessible(el, "\n                <h2>Inaccessible Button</h2>\n                <h3>Problem: </h3>\n                <p>This clickable button is not keyboard-focusable.</p>\n                <p>As a result, only mouse users can click on it.</p>\n                <p>This usability disparity can create an accessibility barrier.</p>\n                <h3>Solution: </h3>\n                <p>Since it is an anchor tag (&lt;a&gt;), it needs a non-empty <em>href</em> attribute.</p>\n                <p>Alternatively, it needs an ARIA <em>role</em> attribute set to something like 'button' or 'link' AND a tabindex attribute set to a value &gt; -1, ideally 0.</p>\n                ", "keyboard");
            // return false;
            // }
          }
        }
        break;
      case 'button':
      case 'textarea':
      case 'select':
      case 'input':
      case 'iframe':
      case 'summary':
        break;
      default:
        if (!!role && !interactiveRoles.includes(role)) {
          if (openKeyNav.config.modesConfig.click.clickEventElements.has(el)) {
            openKeyNav.flagAsInaccessible(el, "\n              <!--\n                !el(a,button,textarea,select,input,iframe,summary)\n                !el[role('button', 'link', 'menuitem', 'option', 'tab', 'treeitem', 'checkbox', 'radio')]\n                fromClickEvents\n              -->\n              <h2>Possibly Inaccessible Clickable Element</h2>\n              <h3>Problem: </h3>\n              <p>This element has a mouse click event handler attached to it, but it is not keyboard-focusable.</p>\n              <p>As a result, only mouse users can click on it.</p>\n              <p>This usability disparity can create an accessibility barrier.</p>\n              <h3>Solution Options: </h3>\n              <ol>\n                <li>\n                  <p>If clicking this element takes the user to a different location, convert this element to an anchor link (&lt;a&gt;) with a non-empty <em>href</em> attribute.</p>\n                </li>\n                <li>\n                  <p>Otherwise if clicking this element triggers an action on the page, convert this element to a &lt;button&gt; without a <em>disabled</em> attribute.</p>\n                  <p>Alternatively, it needs an ARIA <em>role</em> attribute set to something like 'button' or 'link' AND a tabindex attribute set to a value &gt; -1, ideally 0.</p>\n                </li>\n                <li>\n                  <p>Otherwise, if clicking this element does not do anything, then consider removing the click event handler attached to this element.</p>\n                </li>\n              </ol>\n              ", "keyboard");
          }
          // return false;
          // }
        }
        break;
    }

    // it must be a valid tabbable element
    return true;
  };

  var keylabels = {};

  var scrolling = {};

  Object.defineProperty(scrolling, "__esModule", {
    value: true
  });
  scrolling.disableScrolling = void 0;
  scrolling.disableScrolling = function disableScrolling(openKeyNav) {
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

  Object.defineProperty(keylabels, "__esModule", {
    value: true
  });
  keylabels.showMoveableFromOverlays = keylabels.showClickableOverlays = keylabels.generateValidKeyChars = keylabels.generateLabels = keylabels.filterRemainingOverlays = void 0;
  var _escape$2 = _escape$3;
  var _isTabbable$1 = isTabbable;
  var _scrolling = scrolling;
  function _toConsumableArray(r) {
    return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray$2(r) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$2(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$2(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$2(r, a) : void 0;
    }
  }
  function _iterableToArray(r) {
    if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
  }
  function _arrayWithoutHoles(r) {
    if (Array.isArray(r)) return _arrayLikeToArray$2(r);
  }
  function _arrayLikeToArray$2(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  var generateLabels = keylabels.generateLabels = function generateLabels(openKeyNav, count) {
    var labels = [];
    var chars = generateValidKeyChars(openKeyNav);
    var maxLength = Math.pow(chars.length, 2);
    var useThirdChar = count > maxLength;
    if (useThirdChar) {
      maxLength = Math.pow(chars.length, 3);
    }
    for (var i = 0; i < count && labels.length < maxLength; i++) {
      var firstChar = chars[i % chars.length];
      var secondChar = chars[Math.floor(i / chars.length) % chars.length] || '';
      var thirdChar = useThirdChar ? chars[Math.floor(i / Math.pow(chars.length, 2)) % chars.length] : '';
      labels.push(firstChar + secondChar + thirdChar);
    }

    // Attempt to shorten labels that are uniquely identifiable by their first character
    var labelCounts = {};
    labels.forEach(function (label) {
      var firstChar = label[0];
      labelCounts[firstChar] = (labelCounts[firstChar] || 0) + 1;
    });
    labels = labels.map(function (label) {
      var firstChar = label[0];
      if (labelCounts[firstChar] === 1 && !label.includes('.')) {
        // Check for uniqueness and ensure not shortened if it's a prefix
        return firstChar;
      }
      return label;
    });

    // alert(labels)

    // now we have all the labels we will use.
    // Shuffle them for variable rewards. ++addiction
    // return shuffle(labels);

    return labels; // unshuffled
  };
  keylabels.showClickableOverlays = function showClickableOverlays(openKeyNav) {
    (0, _scrolling.disableScrolling)(openKeyNav);
    setTimeout(function () {
      var clickables = _getAllCandidateElements(openKeyNav, document).filter(function (el) {
        return (0, _isTabbable$1.isTabbable)(el, openKeyNav);
      });

      // console.log(clickables);

      var labels = generateLabels(openKeyNav, clickables.length);
      clickables.forEach(function (element, index) {
        element.setAttribute('data-openkeynav-label', labels[index]);
      });
      clickables.forEach(function (element, index) {
        openKeyNav.createOverlay(element, labels[index]);
      });
    }, 0); // Use timeout to ensure the operation completes
  };
  keylabels.showMoveableFromOverlays = function showMoveableFromOverlays(openKeyNav) {
    // alert("showMoveableFromOverlays()");
    // return;

    // Combine all unique 'from' classes from moveConfig to query the document
    var moveables = [];

    // direct selectors of from elements
    var fromElementSelectors = _toConsumableArray(new Set(openKeyNav.config.modesConfig.move.config.filter(function (config) {
      return config.fromElements;
    }).map(function (config) {
      return config.fromElements;
    })));
    if (!!fromElementSelectors.length) {
      document.querySelectorAll(fromElementSelectors.join(', ')).forEach(function (element) {
        var config = openKeyNav.config.modesConfig.move.config.find(function (c) {
          return element.matches(c.fromElements);
        });
        if (config) {
          var configKey = openKeyNav.config.modesConfig.move.config.indexOf(config);
          if (openKeyNav.isNonzeroSize(element) && (!config.fromExclude || !element.matches(config.fromExclude))) {
            element.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
            moveables.push(element);
          }
        }
      });
    }

    // containers of from elements
    var fromContainerSelectors = _toConsumableArray(new Set(openKeyNav.config.modesConfig.move.config.filter(function (config) {
      return config.fromContainer;
    }).map(function (config) {
      return config.fromContainer;
    })));
    if (!!fromContainerSelectors.length) {
      var fromContainers = document.querySelectorAll(fromContainerSelectors.join(', '));
      // Collect all direct children of each fromContainer as moveable elements
      fromContainers.forEach(function (container) {
        var config = openKeyNav.config.modesConfig.move.config.find(function (c) {
          return container.matches(c.fromContainer);
        });
        if (config) {
          var configKey = openKeyNav.config.modesConfig.move.config.indexOf(config);
          var children = Array.from(container.children);
          children.forEach(function (child) {
            if (openKeyNav.isNonzeroSize(child) && (!config.fromExclude || !child.matches(config.fromExclude))) {
              child.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
              moveables.push(child);
            }
          });
        }
      });
    }

    // Resolve elements using provided callbacks if available
    openKeyNav.config.modesConfig.move.config.forEach(function (config) {
      if (config.resolveFromElements) {
        var resolvedElements = config.resolveFromElements();
        resolvedElements.forEach(function (element) {
          var configKey = openKeyNav.config.modesConfig.move.config.indexOf(config);
          if (openKeyNav.isNonzeroSize(element) && (!config.fromExclude || !element.matches(config.fromExclude))) {
            element.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
            moveables.push(element);
          }
        });
      }
    });

    // filter out moveables that would not be clickable
    moveables = moveables.filter(function (el) {
      return (0, _isTabbable$1.isTabbable)(el, openKeyNav);
    });
    var labels = generateLabels(openKeyNav, moveables.length);
    moveables.forEach(function (element, index) {
      element.setAttribute('data-openkeynav-label', labels[index]);
    });
    moveables.forEach(function (element, index) {
      openKeyNav.createOverlay(element, labels[index]);
      element.setAttribute('data-openkeynav-draggable', 'true');
    });
  };
  keylabels.filterRemainingOverlays = function filterRemainingOverlays(openKeyNav, e) {
    // Filter overlays, removing non-matching ones
    document.querySelectorAll('.openKeyNav-label').forEach(function (overlay) {
      var label = overlay.textContent;

      // If the current typedLabel no longer matches the beginning of this element's label, remove both the overlay and clean up the target element
      if (!label.startsWith(openKeyNav.config.typedLabel.value)) {
        var targetElement = document.querySelector("[data-openkeynav-label=\"".concat(label, "\"]"));
        targetElement && targetElement.removeAttribute('data-openkeynav-label'); // Clean up the target element's attribute
        overlay.remove(); // Remove the overlay
      }
    });
    if (document.querySelectorAll('.openKeyNav-label').length == 0) {
      // there are no overlays left. clean up and unblock.
      (0, _escape$2.handleEscape)(openKeyNav, e);
      return true;
    }
  };
  var generateValidKeyChars = keylabels.generateValidKeyChars = function generateValidKeyChars(openKeyNav) {
    var chars = 'abcdefghijklmnopqrstuvwxyz';
    // let chars = '1234567890';
    // let chars = 'abcdefghijklmnopqrstuvwxyz1234567890'; // not a good idea because 1 and l can be confused

    // Remove letters from chars that are present in openKeyNav.config.keys
    // maybe this isn't necessary when in click mode (mode paradigm is common in screen readers)
    // Object.values(openKeyNav.config.keys).forEach(key => {
    //   chars = chars.replace(key, '');
    // });

    // remove the secondary escape key code
    chars = chars.replace(openKeyNav.config.keys.escape, '');
    return chars;
  };
  var _getAllCandidateElements = function getAllCandidateElements(openKeyNav, doc) {
    var allElements = Array.from(doc.querySelectorAll("a," +
    // can be made non-tabbable by removing the href attribute or setting tabindex="-1".
    "button:not([disabled])," +
    // are not tabbable when disabled.
    "textarea:not([disabled])," +
    // are not tabbable when disabled.
    "select:not([disabled])," +
    // are not tabbable when disabled.
    "input:not([disabled])," +
    // are not tabbable when disabled.
    // "label," +  // are not normally tabbable unless they contain tabbable content.
    "iframe," +
    // are tabbable by default.
    "details > summary," +
    // The summary element inside a details element can be tabbable
    "[role=button]," +
    // can be made non-tabbable by adding tabindex="-1".
    "[role=link]," +
    // can be made non-tabbable by adding tabindex="-1".
    "[role=menuitem]," +
    // can be made non-tabbable by adding tabindex="-1".
    "[role=option]," +
    // can be made non-tabbable by adding tabindex="-1".
    "[role=tab]," +
    // can be made non-tabbable by adding tabindex="-1".
    "[role=treeitem]," +
    // can be made non-tabbable by adding tabindex="-1".
    "[role=checkbox]," +
    // can be made non-tabbable by adding tabindex="-1".
    "[role=radio]," +
    // can be made non-tabbable by adding tabindex="-1".
    "[aria-checked]," +
    // not inherently tabbable or non-tabbable.
    "[contenteditable=true]," +
    // elements with contenteditable="true" are tabbable.
    "[contenteditable=plaintext-only]," +
    // elements with contenteditable="plaintext-only" are tabbable.
    "[tabindex]," +
    // elements with a tabindex attribute can be made tabbable or non-tabbable depending on the value of tabindex.
    "[onclick]" // elements with an onclick attribute are not inherently tabbable or non-tabbable.
    ));
    var iframes = doc.querySelectorAll('iframe');
    iframes.forEach(function (iframe) {
      try {
        var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        var iframeElements = _getAllCandidateElements(openKeyNav, iframeDoc);
        allElements = allElements.concat(Array.from(iframeElements)); // Add elements from each iframe
      } catch (error) {
        console.log('Access denied to iframe content:', error);
      }
    });

    // Merge with clickEventElements
    var mergedSet = new Set([].concat(_toConsumableArray(allElements), _toConsumableArray(openKeyNav.config.modesConfig.click.clickEventElements)));
    return Array.from(mergedSet);

    // return allElements;
  };

  var lifecycle = {};

  Object.defineProperty(lifecycle, "__esModule", {
    value: true
  });
  lifecycle.enable = lifecycle.disable = void 0;
  lifecycle.enable = function enable() {};
  lifecycle.disable = function disable() {};

  Object.defineProperty(keypress, "__esModule", {
    value: true
  });
  keypress.modiferKeyString = keypress.handleKeyPress = void 0;
  var _clicking = clicking;
  var _dragAndDrop = dragAndDrop;
  var _escape$1 = _escape$3;
  var _focus = focus;
  var _isTabbable = isTabbable;
  var _keylabels = keylabels;
  var _keyButton$2 = keyButton;
  function getMetaKeyName() {
    var userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('mac') >= 0) return 'Cmd';
    if (userAgent.indexOf('win') >= 0) return 'Win';
    if (userAgent.indexOf('linux') >= 0) return 'Super';
    // fallback
    return 'Meta';
  }
  var modiferKeyString = keypress.modiferKeyString = function modiferKeyString(openKeyNav) {
    switch (openKeyNav.config.keys.modifierKey) {
      case 'shiftKey':
        return 'Shift';
      case 'altKey':
        return 'Alt';
      case 'metaKey':
        return getMetaKeyName();
      default:
        return openKeyNav.config.keys.modifierKey;
    }
  };
  keypress.handleKeyPress = function handleKeyPress(openKeyNav, e) {
    var isTextInputActive = openKeyNav.isTextInputActive();

    // enable / disable openKeyNav
    if (e[openKeyNav.config.keys.modifierKey] && openKeyNav.config.keys.menu.toLowerCase() == e.key.toLowerCase()) {
      if (isTextInputActive) {
        if (!e[openKeyNav.config.keys.inputEscape]) {
          return true;
        }
      }
      if (!openKeyNav.meta.enabled.value) {
        // if openKeyNav disabled
        openKeyNav.enable();
        var message = "openKeyNav enabled. Press ".concat((0, _keyButton$2.keyButton)([modiferKeyString(openKeyNav), openKeyNav.config.keys.menu]), " to disable.");
        openKeyNav.emitNotification(message);
        return true;
      } else {
        (0, _escape$1.handleEscape)(openKeyNav, e);
        openKeyNav.disable();
        var _message = "openKeyNav disabled. Press ".concat((0, _keyButton$2.keyButton)([modiferKeyString(openKeyNav), openKeyNav.config.keys.menu]), " to enable.");
        openKeyNav.emitNotification(_message);
        return true;
      }
    }

    // first check for modifier keys and escape
    switch (e.key) {
      case 'Shift': // exit this event listener if it's the shift key press
      case 'Control': // exit this event listener if it's the control key press
      case 'Alt': // exit this event listener if it's the alt key press
      case 'Meta': // exit this event listener if it's the meta key (Command/Windows) press
      case ' ':
        // exit this event listener if it's the space bar key press
        // Prevent default action and stop the function
        // e.preventDefault();
        return true;

      // handle escape first
      case 'Escape':
        // escaping
        // alert("Escape");
        (0, _escape$1.handleEscape)(openKeyNav, e);
        break;
    }

    // check if currently in any openkeynav modes
    if (openKeyNav.config.modes.clicking.value) {
      return handleClickMode(openKeyNav, e);
    }
    if (openKeyNav.config.modes.moving.value) {
      return handleMoveMode(openKeyNav, e);
    }
    if (openKeyNav.config.modes.menu.value) {
      handleMenuMode();
    }
    if (isTextInputActive) {
      if (!e[openKeyNav.config.keys.inputEscape]) {
        return true;
      }
    }
    if (!openKeyNav.meta.enabled.value) {
      return true;
    }
    // escape and toggles
    switch (e.key) {
      case openKeyNav.config.keys.escape:
        // escaping
        // alert("Escape");

        (0, _escape$1.handleEscape)(openKeyNav, e);
        return true;

      // case openKeyNav.config.keys.toggleCursor: // toggle Cursor
      //     // toggle class openKeyNav-noCursor for body
      //     document.body.classList.toggle('openKeyNav-noCursor');
      //     return true;
      //     break;
    }

    // modes
    switch (e.key) {
      case openKeyNav.config.keys.click: // possibly attempting to initiate click mode
      case openKeyNav.config.keys.click.toUpperCase():
        e.preventDefault();
        openKeyNav.config.modes.clicking.value = true;
        if (e.key == openKeyNav.config.keys.click.toUpperCase()) {
          openKeyNav.config.modesConfig.click.modifier = true;
        }
        (0, _keylabels.showClickableOverlays)(openKeyNav);
        return true;

      // possibly attempting to initiate moving mode
      case openKeyNav.config.keys.move:
      case openKeyNav.config.keys.move.toUpperCase():
        // Toggle move mode
        e.preventDefault();
        openKeyNav.config.modes.moving.value = true; // Assuming you add a 'move' flag to your modes object
        if (e.key == openKeyNav.config.keys.move.toUpperCase()) {
          openKeyNav.config.modesConfig.move.modifier = true;
        }
        (0, _keylabels.showMoveableFromOverlays)(openKeyNav); // This will be a new function similar to showClickableOverlays
        return true;
      case openKeyNav.config.keys.menu:
      case openKeyNav.config.keys.menu.toUpperCase():
        openKeyNav.config.modes.menu.value = true;
        if (e.key == openKeyNav.config.keys.menu.toUpperCase()) {
          openKeyNav.config.modesConfig.menu.modifier = true;
        }
        return true;
    }

    // focus / navigation (can be modified by shift, so always check for lowercase)
    switch (e.key.toLowerCase()) {
      // Check if the pressed key is for headings
      case openKeyNav.config.keys.heading.toLowerCase():
        /*
        const OpenKeyNav = {
          currentHeadingIndex: 0,
          keys: {
              heading: 'h',
          },
          headings: [],
        };
        */

        e.preventDefault(); // Prevent default action to allow our custom behavior

        (0, _focus.focusOnHeadings)(openKeyNav, 'h1, h2, h3, h4, h5, h6', e);
        return true;
      case openKeyNav.config.keys.scroll.toLowerCase():
        /*
        const OpenKeyNav = {
          currentScrollableIndex: 0,
          keys: {
              scroll: 's',
          },
          scrollables: [],
        };
        */

        e.preventDefault();
        (0, _focus.focusOnScrollables)(openKeyNav, e);
        return true;
    }

    // handle keycodes, aka for specific headings
    var numberMap = {
      Digit1: '1',
      Digit2: '2',
      Digit3: '3',
      Digit4: '4',
      Digit5: '5',
      Digit6: '6',
      Digit7: '7',
      Digit8: '8',
      Digit9: '9',
      Digit0: '0'
    };
    if (e.code) {
      // a number was pressed
      var numberPressed = numberMap[e.code];
      switch (numberPressed) {
        case openKeyNav.config.keys.heading_1:
          e.preventDefault(); // Prevent default action to allow our custom behavior
          (0, _focus.focusOnHeadings)(openKeyNav, 'h1', e);
          break;
        case openKeyNav.config.keys.heading_2:
          e.preventDefault(); // Prevent default action to allow our custom behavior
          (0, _focus.focusOnHeadings)(openKeyNav, 'h2', e);
          break;
        case openKeyNav.config.keys.heading_3:
          e.preventDefault(); // Prevent default action to allow our custom behavior
          (0, _focus.focusOnHeadings)(openKeyNav, 'h3', e);
          break;
        case openKeyNav.config.keys.heading_4:
          e.preventDefault(); // Prevent default action to allow our custom behavior
          (0, _focus.focusOnHeadings)(openKeyNav, 'h4', e);
          break;
        case openKeyNav.config.keys.heading_5:
          e.preventDefault(); // Prevent default action to allow our custom behavior
          (0, _focus.focusOnHeadings)(openKeyNav, 'h5', e);
          break;
        case openKeyNav.config.keys.heading_6:
          e.preventDefault(); // Prevent default action to allow our custom behavior
          (0, _focus.focusOnHeadings)(openKeyNav, 'h6', e);
          break;
      }
    }
  };
  var handleClickMode = function handleClickMode(openKeyNav, e) {
    e.preventDefault();
    openKeyNav.config.typedLabel.value += e.key.toLowerCase();
    var target = document.querySelector("[data-openkeynav-label=\"".concat(openKeyNav.config.typedLabel.value, "\"]"));
    if (!target) {
      document.querySelectorAll('iframe').forEach(function (iframe) {
        addKeydownEventListenerToIframe(openKeyNav, iframe);
      });
    }
    if (target) {
      setTimeout(function () {
        (0, _clicking.handleTargetClickInteraction)(openKeyNav, target, e);
      }, 0);
    } else {
      (0, _keylabels.filterRemainingOverlays)(openKeyNav, e);
      return false;
    }
    return true;
  };
  var handleMoveMode = function handleMoveMode(openKeyNav, e) {
    var showMoveableToOverlays = function showMoveableToOverlays(selectedMoveable) {
      // temporarily persist modifier
      var modifer = openKeyNav.config.modesConfig.move.modifier;

      // Remove existing overlays or switch to target overlays
      openKeyNav.removeOverlays();

      // Set moving mode and selected moveable element
      openKeyNav.config.modes.moving.value = true;
      openKeyNav.config.modesConfig.move.selectedMoveable = selectedMoveable;
      openKeyNav.config.modesConfig.move.selectedMoveableHTML = selectedMoveable.innerHTML;
      openKeyNav.config.modesConfig.move.modifier = modifer;

      // Get the configuration index from the selected moveable
      var configIndex = selectedMoveable.getAttribute('data-openkeynav-moveconfig');
      if (configIndex === null) return;

      // Convert the index to a number
      var configKeyForSelectedMoveable = parseInt(configIndex, 10);

      // Store the selected configuration index
      openKeyNav.config.modesConfig.move.selectedConfig = configKeyForSelectedMoveable;

      // Find the corresponding move configuration
      var moveConfig = openKeyNav.config.modesConfig.move.config[configKeyForSelectedMoveable];
      if (!moveConfig) return;

      // Get all target elements for the selectedMoveable
      // let targetElements = document.querySelectorAll(moveConfig.toElements);

      // targetElements = targetElements.filter(el => {
      //   return isTabbable(el, openKeyNav);
      // });

      function tabbableFilter(openKeyNav) {
        return function (el) {
          return (0, _isTabbable.isTabbable)(el, openKeyNav);
        };
      }
      var targetElements = [].filter.call(document.querySelectorAll(moveConfig.toElements), tabbableFilter(openKeyNav));

      // Generate labels for the target elements
      var labels = (0, _keylabels.generateLabels)(openKeyNav, targetElements.length);
      targetElements.forEach(function (element, index) {
        element.setAttribute('data-openkeynav-label', labels[index]);
      });
      targetElements.forEach(function (element, index) {
        if (!openKeyNav.isNonzeroSize(element)) return;
        openKeyNav.createOverlay(element, labels[index]);
        element.setAttribute('data-openkeynav-dropzone', 'true');
      });
    };
    function findElementWithQuery(startElement, queryString) {
      var direction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'next';
      var currentElement = startElement;
      while (currentElement) {
        if (direction === 'previous') {
          // Traverse previous siblings and their descendants
          currentElement = currentElement.previousElementSibling;
          while (!currentElement && startElement.parentElement) {
            currentElement = startElement.parentElement.previousElementSibling;
            startElement = startElement.parentElement;
          }
          if (currentElement) {
            // Look for the last matching descendant
            var descendants = currentElement.querySelectorAll(queryString);
            if (descendants.length > 0) {
              return descendants[descendants.length - 1];
            }
            if (currentElement.matches(queryString)) {
              return currentElement;
            }
          }
        } else if (direction === 'next') {
          // Traverse next siblings and their descendants
          currentElement = currentElement.nextElementSibling;
          while (!currentElement && startElement.parentElement) {
            currentElement = startElement.parentElement.nextElementSibling;
            startElement = startElement.parentElement;
          }
          if (currentElement) {
            if (currentElement.matches(queryString)) {
              return currentElement;
            }
            var foundElement = currentElement.querySelector(queryString);
            if (foundElement) {
              return foundElement;
            }
          }
        } else {
          throw new Error("Invalid direction. Use 'previous' or 'next'.");
        }
      }
      return null;
    }
    function cycleThroughMoveTargets(event) {
      event.preventDefault();
      var direction = 'next';
      if (event.shiftKey) {
        direction = 'previous';
      }
      // the moveable element should be stored as openKeyNav.config.modesConfig.move.selectedMoveable
      return findElementWithQuery(openKeyNav.config.modesConfig.move.selectedMoveable, '[data-openkeynav-label]:not(.openKeyNav-label)', direction);
    }

    // in moving mode
    // Handle typing in move mode, similar to how you handle clicking mode
    // Accumulate typed characters as in labeling mode

    // ensure the typed key is valid label candidate (aka not something like )
    // e.key/.

    var validLabelChars = (0, _keylabels.generateValidKeyChars)(openKeyNav);
    var isValidLabelChar = Array.from(validLabelChars).some(function (validChar) {
      return validChar.toLowerCase() == e.key.toLowerCase();
    });
    var selectedTarget;
    if (isValidLabelChar) {
      openKeyNav.config.typedLabel.value += e.key.toLowerCase();
      selectedTarget = document.querySelector("[data-openkeynav-label=\"".concat(openKeyNav.config.typedLabel.value, "\"]:not(.openKeyNav-label)"));
    } else {
      // tab-based moving
      if (e.key === "Tab") {
        selectedTarget = cycleThroughMoveTargets(e);
      }
    }
    if (!selectedTarget) {
      // no selected target. filter remaining overlays and exit.
      (0, _keylabels.filterRemainingOverlays)(openKeyNav, e);
      return false;
    }
    if (!openKeyNav.config.modesConfig.move.selectedMoveable) {
      // new selected target.
      // setting selectedTarget as selectedMoveable
      console.log("Selected element to move:", selectedTarget);
      showMoveableToOverlays(selectedTarget);
      (0, _dragAndDrop.beginDrag)(openKeyNav);
      return true;
    }

    // moving selectedMoveable to target
    moveSelectedMoveableToTarget(openKeyNav, selectedTarget);
    return true;
  };
  var handleMenuMode = function handleMenuMode(e) {
    return true;
  };
  var moveSelectedMoveableToTarget = function moveSelectedMoveableToTarget(openKeyNav, selectedTarget) {
    // const modifier = true; // for whether move is sticky or not (sticky mode?)
    console.log("Selected move target:", selectedTarget);
    openKeyNav.config.modesConfig.move.selectedDropZone = selectedTarget;
    var callback = openKeyNav.config.modesConfig.move.config[openKeyNav.config.modesConfig.move.selectedConfig].callback;
    if (!callback) {
      //   console.error("No callback function has been set to execute this move operation");
      (0, _dragAndDrop.simulateDragAndDrop)(openKeyNav, openKeyNav.config.modesConfig.move.selectedMoveable, openKeyNav.config.modesConfig.move.selectedDropZone);
    } else {
      openKeyNav.config.modesConfig.move.config[openKeyNav.config.modesConfig.move.selectedConfig].callback(openKeyNav.config.modesConfig.move.selectedMoveable, openKeyNav.config.modesConfig.move.selectedDropZone);
    }
    if (!openKeyNav.config.modesConfig.move.modifier) {
      openKeyNav.removeOverlays(true);
      openKeyNav.clearMoveAttributes();
    }
    return true;
  };
  var addKeydownEventListenerToIframe = function addKeydownEventListenerToIframe(openKeyNav, iframe) {
    try {
      var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      var potentialTarget = iframeDoc.querySelector("[data-openkeynav-label=\"".concat(openKeyNav.config.typedLabel.value, "\"]"));
      if (potentialTarget) {
        // target = potentialTarget; TODO: check if this was important. Target is undefined so commenting out.

        // Check if the keypress listener has already been added
        if (!iframeDoc.keypressListenerAdded) {
          var script = iframeDoc.createElement('script');
          script.textContent = '' + "document.addEventListener('keydown', function(event) {" + 'window.parent.postMessage({' + "type: 'keydown'," + 'key: event.key,' + 'keyCode: event.keyCode,' + 'altKey: event.altKey,' + 'ctrlKey: event.ctrlKey,' + 'shiftKey: event.shiftKey,' + 'metaKey: event.metaKey' + "}, '*');" + '});' + 'document.keypressListenerAdded = true;'; // Set flag to true
          iframeDoc.body.appendChild(script);
        }
      }
    } catch (error) {
      console.log('Error accessing iframe content', error);
    }
  };

  var styles = {};

  Object.defineProperty(styles, "__esModule", {
    value: true
  });
  styles.injectToolbarStyleSheet = styles.injectStylesheet = styles.deleteStylesheets = void 0;
  var openKeyNav$1;
  var styleClassname = "openKeyNav-style";
  var toolbarStyleClassname = "okn-toolbar-stylesheet";
  var keyButtonStyles = "\n  .keyButtonContainer {\n      margin: 0 .1em;\n      display: inline-grid;\n      grid-template-columns: min-content auto;\n      align-items: baseline;\n      column-gap: 4px;\n  }\n  .keyButtonContainer .keyButtonLabel{\n    white-space:nowrap;\n  }\n  .keyButton {\n    display: inline-block;\n    padding: 1px 4px;\n    min-width: 1.3em;\n    text-align: center;\n    line-height: 1;\n    color: hsl(210, 8%, 5%);\n    text-shadow: 0 1px 0 hsl(0, 0%, 100%);\n    background-color: hsl(210, 8%, 90%);\n    border: 1px solid hsl(210, 8%, 68%);\n    border-radius: 3px;\n    box-shadow: 0 1px 1px hsla(210, 8%, 5%, 0.15), inset 0 1px 0 0 hsl(0, 0%, 100%);\n    white-space: nowrap;\n    margin: 0 1px;\n  }\n";
  styles.injectStylesheet = function injectStylesheet(parent, replace) {
    openKeyNav$1 = parent;
    if (document.querySelectorAll('.' + styleClassname).length > 0) {
      if (!replace) {
        return;
      }
      deleteStylesheets();
    }
    var style = document.createElement('style');
    style.className = styleClassname;
    style.type = 'text/css';
    style.textContent = ".openKeyNav-label {\n        font: inherit;\n        vertical-align: baseline;\n        box-sizing: border-box;\n        white-space: nowrap;\n        border: 1px solid ".concat(openKeyNav$1.config.spot.fontColor, "; \n        // box-shadow: inset 0 -2.5px 0 ").concat(openKeyNav$1.config.spot.insetColor, ", inset 0 -3px 0 #999, 0 0 4px #fff; \n        // background: linear-gradient(to top, #999 5%, ").concat(openKeyNav$1.config.spot.backgroundColor, " 20%); \n        background-color: ").concat(openKeyNav$1.config.spot.backgroundColor, "; \n        // border-radius: calc( 4px );\n        color: ").concat(openKeyNav$1.config.spot.fontColor, "; \n        display: inline-block;\n        font-size: ").concat(openKeyNav$1.config.spot.fontSize, "; \n        // outline : 2px solid ").concat(openKeyNav$1.config.focus.outlineColor, "; \n        outline-offset: -2px !important;\n        // +\"font-weight: bold;\"\n        font-weight: inherit;\n        // line-height: 1.5;\n        line-height: 1;\n        margin: 0 .1em 0 1px;\n        overflow-wrap: break-word;\n        // padding: .0 .15em .1em;\n        padding: 3px;\n        text-shadow: 0 1px 0 ").concat(openKeyNav$1.config.spot.insetColor, "; \n        min-width: 1rem;\n        text-align: center;\n        position: absolute;\n        z-index: 99999999;\n        font-family: monospace;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::after {\n        content: \"\";\n        position: absolute;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::after {\n        top: 50%;\n        transform: translateY(-50%);\n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::after {\n        left: 50%;\n        transform: translateX(-50%);\n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::before {\n        border-left: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid #fff; \n        right: -").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px; \n        border-top: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-bottom: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::after {\n        border-left: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid ").concat(openKeyNav$1.config.spot.backgroundColor, "; \n        right: -").concat(openKeyNav$1.config.spot.arrowSize_px, "px; \n        border-top: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid transparent; \n        border-bottom: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::before {\n        border-right: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid #fff; \n        left: -").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px; \n        border-top: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-bottom: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::after {\n        border-right: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid ").concat(openKeyNav$1.config.spot.backgroundColor, "; \n        left: -").concat(openKeyNav$1.config.spot.arrowSize_px, "px; \n        border-top: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid transparent; \n        border-bottom: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]{\n        padding-bottom: 0;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::before {\n        border-top: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid #fff; \n        bottom: -").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px; \n        border-left: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-right: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::after {\n        border-top: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid ").concat(openKeyNav$1.config.spot.backgroundColor, "; \n        bottom: -").concat(openKeyNav$1.config.spot.arrowSize_px, "px; \n        border-left: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid transparent; \n        border-right: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]{\n        padding-top: 0;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::before {\n        border-bottom: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid #fff; \n        top: -").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px; \n        border-left: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-right: ").concat(openKeyNav$1.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::after {\n        border-bottom: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid ").concat(openKeyNav$1.config.spot.backgroundColor, "; \n        top: -").concat(openKeyNav$1.config.spot.arrowSize_px, "px; \n        border-left: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid transparent; \n        border-right: ").concat(openKeyNav$1.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-label-selected{\n        // padding : 0;\n        // margin : 0;\n        display : grid;\n        align-content : center;\n        color : ").concat(openKeyNav$1.config.spot.fontColor, "; \n        background : ").concat(openKeyNav$1.config.spot.backgroundColor, "; \n        // outline : 4px solid ").concat(openKeyNav$1.config.focus.outlineColor, "; \n        outline: none; \n        // border-radius: 100%; \n        // width: 1rem; \n        // height: 1rem; \n        // text-shadow : none;\n        // padding : 0 !important;\n        // margin: 0 !important;\n      }\n      [data-openkeynav-label]:not(.openKeyNav-label):not(button){\n        // outline: 2px double ").concat(openKeyNav$1.config.focus.outlineColor, " !important; \n        // outline-offset: 2px !important;\n        box-shadow:  inset 0 0 0 .5px #000,\n                      0 0 0 .75px #000,\n                      0 0 0 1.5px rgba(255,255,255,1); \n        outline:none !important;\n        // border-radius: 3px;\n        border-color: #000;\n        border-radius: 3px;\n      }\n      button[data-openkeynav-label]{\n        outline:2px solid #000 !important;\n      }\n      .openKeyNav-inaccessible:not(.openKeyNav-label):not(button){\n        box-shadow:  inset 0 0 0 .5px #f00,\n                      0 0 0 1px #f00,\n                      0 0 0 1.5px rgba(255,255,255,1); \n        outline:none !important;\n        border-color: #f00;\n        border-radius: 3px;\n      }\n      button.openKeyNav-inaccessible{\n        outline:2px solid #f00 !important;\n      }\n      .openKeyNav-inaccessible.openKeyNav-label{\n        box-shadow:  inset 0 0 0 .5px #f00,\n                      0 0 0 1px #f00,\n                      0 0 0 1.5px rgba(255,255,255,1); \n        border-color: #f00;\n        border-radius: 3px;\n      }\n        //   +\"span[data-openkeynav-label]{\"\n        //       +\"display: inherit;\"\n        //   +\"}\"\n      .openKeyNav-noCursor *{\n        cursor: none !important;\n      }\n      .openKeyNav-mouseover-tooltip{\n        position: absolute;\n        background-color: #333;\n        color: #fff;\n        padding: 5px;\n        border-radius: 5px;\n        display: none;\n        z-index: 1000;\n        font-size: 12px;\n      }\n      .openKeyNav-mouseover-tooltip::before{\n        content: \"Debug mode\"\n      }\n      //   [data-openkeynav-draggable=\"true\"] {\n      //   outline: 2px solid ").concat(openKeyNav$1.config.focus.outlineColor, "; \n      //   outline-offset: -1px !important;\n      // }\n      ;\n      ");
    style.textContent += "\n      .okn-logo-text {\n          font-size: 36px;\n          font-weight: 600;\n          color: #ffffff;\n          background-color: #333;\n          padding: .1em .2em;\n          border-radius: 1em;\n          box-sizing: border-box;\n          line-height: 1;\n          text-align: center;\n          position: relative;\n          display: inline-block;\n          min-width: 1rem;\n          border: max(.1em, 2px) solid #ffffff;\n          white-space: nowrap;\n      }\n\n      .okn-logo-text.small {\n          font-size: 18px;\n      }\n      .okn-logo-text.tiny {\n          font-size: 10px;\n          /* border-width: 1px; */\n          border: none;\n      }\n      .okn-logo-text.tiny .key {\n          font-weight: 700;\n      }\n\n      .okn-logo-text.light {\n          color: #333; /* Dark text color */\n          background-color: #fff; /* Light background */\n          border-color: #333; /* Dark border */\n      }\n\n      .okn-logo-text .key {\n          display: inline;\n          padding: .1em .2em;\n          margin: 0 .1em;\n          background-color: #ffffff; /* Light background */\n          color: #333; /* Dark text */\n          line-height: 1;\n          /* font-size: 0.6em; */\n          position: relative;\n          top: -.3em;\n      }\n\n      .okn-logo-text.light .key {\n          background-color: #333; /* Dark background */\n          color: #ffffff; /* Light text */\n      }\n\n      .okn-logo-text .key::before,\n      .okn-logo-text .key::after {\n          content: \"\";\n          position: absolute;\n          left: 50%;\n          transform: translateX(-50%);\n      }\n\n      .okn-logo-text .key::before {\n          --border-size: 0.5em; /* Base border size */\n          --min-border-size: 5px; /* Minimum pixel size */\n\n          border-top: max(var(--border-size), var(--min-border-size)) solid #333;\n          bottom: calc(-1 * max(var(--border-size), var(--min-border-size)));\n          border-left: max(var(--border-size), var(--min-border-size)) solid transparent;\n          border-right: max(var(--border-size), var(--min-border-size)) solid transparent;\n      }\n      .okn-logo-text.light .key::before {\n          border-top-color: #fff; /* Dark top triangle */\n      }\n\n      .okn-logo-text .key::after {\n          --border-size: .4em; /* Base border size */\n          --min-border-size: 4px; /* Minimum pixel size */\n\n          border-top: max( calc( var(--border-size) + 2px) , var(--min-border-size)) solid #fff;\n          bottom: calc(-1 * max(var(--border-size), var(--min-border-size)));\n          border-left: max(var(--border-size), var(--min-border-size)) solid transparent;\n          border-right: max(var(--border-size), var(--min-border-size)) solid transparent;\n      }\n\n      .okn-logo-text.light .key::after {\n          border-top-color: #333; /* Light bottom triangle */\n      }\n      ";
    style.textContent += keyButtonStyles;

    // style.textContent+=`
    // *:focus { // could be problematic to edit focus states throughout a website
    //   outline: 2px ${openKeyNav.config.focus.outlineStyle} ${openKeyNav.config.focus.outlineColor} !important; 
    //   outline-offset: -2px !important;
    // }
    // `;
    document.head.appendChild(style);
  };
  var deleteStylesheets = styles.deleteStylesheets = function deleteStylesheets() {
    document.querySelectorAll('.' + styleClassname).forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });
  };
  styles.injectToolbarStyleSheet = function injectToolbarStyleSheet(parent) {
    openKeyNav$1 = parent;
    if (!!document.querySelector(toolbarStyleClassname)) {
      return false;
    }
    var style = document.createElement('style');
    style.setAttribute("class", toolbarStyleClassname);
    var toolBarHeight = openKeyNav$1.config.toolBar.height;
    var toolBarVerticalPadding = 6;
    var toolbarBackground = "\n      background-color: ".concat(openKeyNav$1.config.toolBar.backgroundColor.value, ";\n      color: ").concat(openKeyNav$1.config.toolBar.contentColor.value, ";\n      border: 1px solid hsl(210, 8%, 68%);\n      border-radius: 4px;\n      padding: 3px ").concat(toolBarVerticalPadding, "px;\n  ");
    style.type = 'text/css';
    style.textContent = "\n  .openKeyNav-toolBar {\n      // width: 200px;    // needs to have a set width (or a min-width) since the content changes inside... \n                          // min-widh is set inside the init depending on number of keys\n      // max-width: 200px;\n      // background-color: #333;\n      color: #333;\n      // z-index: 10000;\n      ".concat(toolbarBackground, "\n      font-size:12px;\n      display: flex;\n      align-items: center;\n      // align-items: end;\n      flex-direction: column;\n      // direction: rtl;\n      max-height: ").concat(toolBarHeight, "px;\n      position:relative;\n  }\n  .openKeyNav-toolBar > p{\n      overflow: hidden;\n  }\n  .openKeyNav-toolBar p{\n      font-size: 16px;\n      margin-bottom: 0;\n      line-height: ").concat(toolBarHeight - toolBarVerticalPadding, "px;\n      text-align: left;\n  }\n  .openKeyNav-toolBar-expanded {\n      position: absolute;\n      top: 0;\n      margin-top: 40px;\n      width: 100%;\n      ").concat(toolbarBackground, "\n      display: grid;\n      justify-content: left;\n  }\n  // .openKeyNav-toolBar span.stacked {\n  //     display: inline-grid;\n  //     grid-template-rows: auto auto;\n  // }\n  ");
    style.textContent += keyButtonStyles;
    document.head.appendChild(style);
  };

  Object.defineProperty(toolbar, "__esModule", {
    value: true
  });
  toolbar.handleToolBar = void 0;
  var _signals$1 = signals;
  var _keyButton$1 = keyButton;
  var _keypress$1 = keypress;
  var _styles$1 = styles;
  function _createForOfIteratorHelper$1(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (!t) {
      if (Array.isArray(r) || (t = _unsupportedIterableToArray$1(r)) || e) {
        t && (r = t);
        var _n = 0,
          F = function F() {};
        return {
          s: F,
          n: function n() {
            return _n >= r.length ? {
              done: !0
            } : {
              done: !1,
              value: r[_n++]
            };
          },
          e: function e(r) {
            throw r;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function s() {
        t = t.call(r);
      },
      n: function n() {
        var r = t.next();
        return a = r.done, r;
      },
      e: function e(r) {
        u = !0, o = r;
      },
      f: function f() {
        try {
          a || null == t.return || t.return();
        } finally {
          if (u) throw o;
        }
      }
    };
  }
  function _unsupportedIterableToArray$1(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$1(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0;
    }
  }
  function _arrayLikeToArray$1(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  } // unified status bar and toolbar
  var openKeyNav;
  toolbar.handleToolBar = function handleToolBar(openKeyNav_obj) {
    openKeyNav = openKeyNav_obj;
    function initToolbarLogic(toolBarElement) {
      // Check if we've already initialized this toolbar
      if (toolBarElement.dataset.initialized === "true") return;

      // Mark as initialized
      toolBarElement.dataset.initialized = "true";
      (0, _styles$1.injectToolbarStyleSheet)(openKeyNav);
      var lastMessage;
      (0, _signals$1.effect)(function () {
        openKeyNav.config.modes;
        openKeyNav.config.typedLabel.value;
        updateToolbar(toolBarElement, lastMessage);
      });
      (0, _signals$1.effect)(function () {
        var backgroundColor = openKeyNav.config.toolBar.backgroundColor.value;
        var contentColor = openKeyNav.config.toolBar.contentColor.value;
        updateToolbarColors({
          backgroundColor: backgroundColor,
          contentColor: contentColor
        });
      });
    }
    var toolBarElements = document.querySelectorAll('.openKeyNav-toolBar');
    toolBarElements.forEach(function (toolBarElement) {
      if (toolBarElement) {
        initToolbarLogic(toolBarElement);
        // return;
      }
    });
    var observer = new MutationObserver(function (mutationsList, observerInstance) {
      var _iterator = _createForOfIteratorHelper$1(mutationsList),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var mutation = _step.value;
          for (var _i = 0, _Array$from = Array.from(mutation.addedNodes); _i < _Array$from.length; _i++) {
            var node = _Array$from[_i];
            if (node.nodeType === 1 && node.matches && node.matches('.openKeyNav-toolBar')) {
              initToolbarLogic(node);
              // observerInstance.disconnect();
              return;
            }
            if (node.nodeType === 1) {
              var _node$querySelectorAl;
              var descendants = (_node$querySelectorAl = node.querySelectorAll) === null || _node$querySelectorAl === void 0 ? void 0 : _node$querySelectorAl.call(node, '.openKeyNav-toolBar');
              descendants.forEach(function (descendant) {
                if (descendant) {
                  initToolbarLogic(descendant);
                  // observerInstance.disconnect();
                  return;
                }
              });
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };
  var toolbarTemplates = {
    default: function _default() {
      var toolBarElement = document.querySelector('.openKeyNav-toolBar');
      if (!toolBarElement) {
        return;
      }
      toolBarElement.style.minWidth = "150px";
      var clickButton = "";
      var dragButton = "";
      var menuButton = (0, _keyButton$1.keyButton)([(0, _keypress$1.modiferKeyString)(openKeyNav), openKeyNav.config.keys.menu], "openKeyNav");
      if (openKeyNav.meta.enabled.value) {
        menuButton = (0, _keyButton$1.keyButton)([openKeyNav.config.keys.menu], "Shortcuts");
      }
      return "<p>\n                    ".concat(menuButton, "\n                    ").concat(dragButton, "\n                    ").concat(clickButton, " \n                </p>\n            ");
    },
    clickMode: function clickMode() {
      return "<p>".concat((0, _keyButton$1.keyButton)(["Esc"], "Click Mode"), "</p>");
    },
    dragMode: function dragMode() {
      return "<p>".concat((0, _keyButton$1.keyButton)(["Esc"], "Drag Mode"), "</p>");
    },
    menu: function menu() {
      var dragButton = "";
      if (openKeyNav.config.modesConfig.move.config.length) {
        // if drag mode is configured
        dragButton = (0, _keyButton$1.keyButton)([openKeyNav.config.keys.move], "Drag");
      }
      return "\n            <p>".concat((0, _keyButton$1.keyButton)(["Esc"], "Shortcuts"), "</p>\n            <div class=\"openKeyNav-toolBar-expanded\">\n                ").concat((0, _keyButton$1.keyButton)([openKeyNav.config.keys.click], "Click"), "\n                ").concat(dragButton, "\n            </div>\n        ");
    }
  };
  var updateElement = function updateElement(element, html) {
    element.innerHTML = html;
  };
  var updateToolbar = function updateToolbar(toolBarElement, lastMessage) {
    if (!toolBarElement) {
      return;
    }
    var message;
    var typedLabel = openKeyNav.config.typedLabel.value;
    if (openKeyNav.config.modes.clicking.value) {
      message = toolbarTemplates.clickMode(typedLabel);
    } else if (openKeyNav.config.modes.moving.value) {
      message = toolbarTemplates.dragMode(typedLabel);
      // message = toolbarTemplates.menu(typedLabel);
    } else if (openKeyNav.config.modes.menu.value) {
      message = toolbarTemplates.menu(typedLabel);
    } else {
      message = toolbarTemplates.default(); // Default message
    }

    // Only emit the notification if the message has changed
    if (message === lastMessage) {
      return;
    }

    // console.log(message);
    // Update the toolbar content
    updateElement(toolBarElement, message);
    lastMessage = message;
  };
  var updateToolbarColors = function updateToolbarColors(_ref) {
    var backgroundColor = _ref.backgroundColor,
      contentColor = _ref.contentColor;
    var toolbar = document.querySelector('.openKeyNav-toolBar');
    if (!toolbar) {
      return false;
    }
    if (backgroundColor) {
      toolbar.style.backgroundColor = backgroundColor;
    }
    if (contentColor) {
      toolbar.style.color = contentColor;
    }
  };

  Object.defineProperty(OpenKeyNav$1, "__esModule", {
    value: true
  });
  exports.default = OpenKeyNav$1.default = void 0;
  var _version = version;
  var _signals = signals;
  var _toolbar = toolbar;
  var _keyButton = keyButton;
  var _styles = styles;
  var _keypress = keypress;
  var _escape = _escape$3;
  function _createForOfIteratorHelper(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (!t) {
      if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
        t && (r = t);
        var _n = 0,
          F = function F() {};
        return {
          s: F,
          n: function n() {
            return _n >= r.length ? {
              done: !0
            } : {
              done: !1,
              value: r[_n++]
            };
          },
          e: function e(r) {
            throw r;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function s() {
        t = t.call(r);
      },
      n: function n() {
        var r = t.next();
        return a = r.done, r;
      },
      e: function e(r) {
        u = !0, o = r;
      },
      f: function f() {
        try {
          a || null == t.return || t.return();
        } finally {
          if (u) throw o;
        }
      }
    };
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }
  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _callSuper(t, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
  }
  function _possibleConstructorReturn(t, e) {
    if (e && ("object" == _typeof(e) || "function" == typeof e)) return e;
    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
    return _assertThisInitialized(t);
  }
  function _assertThisInitialized(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e;
  }
  function _inherits(t, e) {
    if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
    t.prototype = Object.create(e && e.prototype, {
      constructor: {
        value: t,
        writable: !0,
        configurable: !0
      }
    }), Object.defineProperty(t, "prototype", {
      writable: !1
    }), e && _setPrototypeOf(t, e);
  }
  function _wrapNativeSuper(t) {
    var r = "function" == typeof Map ? new Map() : void 0;
    return _wrapNativeSuper = function _wrapNativeSuper(t) {
      if (null === t || !_isNativeFunction(t)) return t;
      if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function");
      if (void 0 !== r) {
        if (r.has(t)) return r.get(t);
        r.set(t, Wrapper);
      }
      function Wrapper() {
        return _construct(t, arguments, _getPrototypeOf(this).constructor);
      }
      return Wrapper.prototype = Object.create(t.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), _setPrototypeOf(Wrapper, t);
    }, _wrapNativeSuper(t);
  }
  function _construct(t, e, r) {
    if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
    var o = [null];
    o.push.apply(o, e);
    var p = new (t.bind.apply(t, o))();
    return r && _setPrototypeOf(p, r.prototype), p;
  }
  function _isNativeReflectConstruct() {
    try {
      var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    } catch (t) {}
    return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
      return !!t;
    })();
  }
  function _isNativeFunction(t) {
    try {
      return -1 !== Function.toString.call(t).indexOf("[native code]");
    } catch (n) {
      return "function" == typeof t;
    }
  }
  function _setPrototypeOf(t, e) {
    return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
      return t.__proto__ = e, t;
    }, _setPrototypeOf(t, e);
  }
  function _getPrototypeOf(t) {
    return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
      return t.__proto__ || Object.getPrototypeOf(t);
    }, _getPrototypeOf(t);
  }
  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
      writable: !1
    }), e;
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }
  function _toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  /*
  OpenKeyNav.js

  Copyright Lawrence Weru / Aster Enterprises LLC 2014 - 2024. All rights reserved.

  */
  /*
  Usage:

  NPM:

  // Import the unminified version (for development)
  import OpenKeyNav from 'openkeynav';

  // Or import the minified version (for production)
  import OpenKeyNav from 'openkeynav/dist/openkeynav.min.js';

  Importing from souce:
  import OpenKeyNav from '/path/to/openKeyNav';

  # init:

  OpenKeyNav.init();

  # then press g when you are not in a text input mode
  # to label the tab-accessible elements that have indicated they are buttons.
  # Press the key combinations on the labels to "click" their respective buttons

  # you can press h to navigate through headers within the viewport
  # You can also press or 1,2,3,4,5,6 to navigate through headers of the respective level


  OpenKeyNav.init({

      spot : {
          backgroundColor : 'rgba(236, 255, 128, 1)',
          fontColor: 'black',
          outlineColor : 'rgb(134 148 53)',
          fontSize : '14px',
      },
      focus : {
          outlineColor : '#0088cc',
          outlineStyle : 'solid'
      },
      keys : {
          escape : 'q', // alternative escape key, for when escape key is too far or not available. // q works great because top left of letters, plus removes confusion with g, p
          click : 'k', // enter click mode, to click on clickable elements
          mouseOver : 'v', // toggle a mouseover event for an applicable element. In many cases this should trigger opening mouseover menus, etc // not yet wired
          move : 'm', // enter move mode, to move elements from and to, aka keyboard drag and drop // not yet fully wired
          scroll : 's', // focus on the next scrollable region
          heading : 'h', // focus on the next heading // as seen in JAWS, NVDA
          textBlock : 'n', // focus on the next block of text // as seen in JAWS, NVDA // not yet fully wired
          landmarkRegion : 'd', // focus on the next landmark region // as seen in NVDA // not yet fully wired
          formField : 'f', // move to the next form field // as seen in NVDA // not yet fully wired
      },
      move: { // not yet fully wired, but would facilitate drag and drop
          config : [
              {
                  fromContainer: ".classContainerFrom1",
                  fromElements: ".classElementFrom1",
                  resolveFromElements: function(){ return NodeList }, // Optional callback to resolve fromElements
                  // resolveToElements: function(){ return NodeList }, // Optional callback to resolve toElements // not yet wired
                  fromExlude : ".excludeThisElement",
                  toElements: '.classToA, .classToD, .classToE', callback : () => {}
              },
              { fromContainer: ".classFrom2", toElements: ".classToB" },
              { fromContainer: ".classFrom3", toElements: ".classToC" }
          ],
          selectedMoveable : false,
          selectedDropZone: false
      }
  });

  */
  var OpenKeyNav = /*#__PURE__*/function () {
    function OpenKeyNav() {
      var _this = this;
      _classCallCheck(this, OpenKeyNav);
      this.config = {
        spot: {
          fontColor: 'white',
          backgroundColor: '#333',
          insetColor: '#000',
          fontSize: 'inherit',
          arrowSize_px: 4
        },
        focus: {
          outlineColor: '#0088cc',
          outlineStyle: 'solid'
        },
        toolBar: {
          height: 32,
          backgroundColor: (0, _signals.signal)('hsl(210 10% 95% / 1)'),
          contentColor: (0, _signals.signal)('#000')
        },
        notifications: {
          enabled: true,
          displayToolName: true,
          duration: 3000
        },
        keys: {
          escape: 'q',
          // alternative escape key, for when escape key is too far or not available. // q works great because top left of letters, plus removes confusion with g, p
          click: 'k',
          // enter click mode, to click on clickable elements, such as links. Was g, now k, for kanga. Plus NVDA uses k to focus on link elements, which prevents conflicting modes as it's either openkeynav or NVDA.
          scroll: 's',
          // focus on the next scrollable region
          move: 'm',
          // enter move mode, to move elements from and to, aka keyboard drag and drop // not yet fully wired
          heading: 'h',
          // focus on the next heading // as seen in JAWS, NVDA
          textBlock: 'n',
          // focus on the next block of text // as seen in JAWS, NVDA // not yet fully wired
          landmarkRegion: 'd',
          // focus on the next landmark region // as seen in NVDA // not yet fully wired
          formField: 'f',
          // move to the next form field // as seen in NVDA // not yet fully wired
          mouseOver: 'v',
          // toggle a mouseover event for an applicable element. In many cases this should trigger opening mouseover menus, etc // not yet wired
          heading_1: '1',
          // focus on the next heading of level 1 // as seen in JAWS, NVDA // do not modify
          heading_2: '2',
          // focus on the next heading of level 2 // as seen in JAWS, NVDA // do not modify
          heading_3: '3',
          // focus on the next heading of level 3 // as seen in JAWS, NVDA // do not modify
          heading_4: '4',
          // focus on the next heading of level 4 // as seen in JAWS, NVDA // do not modify
          heading_5: '5',
          // focus on the next heading of level 5 // as seen in JAWS, NVDA // do not modify
          heading_6: '6',
          // focus on the next heading of level 6 // as seen in JAWS, NVDA // do not modify
          menu: 'o',
          inputEscape: 'ctrlKey',
          // for escaping input to trigger a command
          modifierKey: 'shiftKey' // one of: [altKey, shiftKey, metaKey] // useful for on/off switch. Avoid ctrlKey, which is used to escape input.
        },
        modesConfig: {
          move: {
            // facilitates keyboard accessible drag and drop
            config: [
              // {
              //     fromContainer: ".classContainerFrom1",
              //     fromElements: ".classElementFrom1",
              //     resolveFromElements: function(){ return NodeList }, // Optional callback to resolve fromElements
              //     // resolveToElements: function(){ return NodeList }, // Optional callback to resolve toElements // not yet wired
              //     fromExlude : ".excludeThisElement",
              //     toElements: '.classToA, .classToD, .classToE', callback : () => {}
              // },
              // { fromContainer: ".classFrom2", toElements: ".classToB" },
              // { fromContainer: ".classFrom3", toElements: ".classToC" }
            ],
            selectedConfig: false,
            selectedMoveable: false,
            selectedMoveableHTML: false,
            selectedDropZone: false,
            modifier: false
          },
          click: {
            modifier: false,
            clickEventElements: new Set(),
            eventListenersMap: new Map()
          },
          menu: {
            modifier: false
          }
        },
        log: [],
        typedLabel: (0, _signals.signal)(''),
        headings: {
          currentHeadingIndex: 0,
          // Keep track of the current heading
          list: []
        },
        scrollables: {
          currentScrollableIndex: 0,
          // Keep track of the current scrollable
          list: []
        },
        modes: {
          clicking: (0, _signals.signal)(false),
          moving: (0, _signals.signal)(false),
          menu: (0, _signals.signal)(false)
        },
        debug: {
          screenReaderVisible: false,
          keyboardAccessible: true
        },
        enabledCookie: 'openKeyNav_enabled'
      };
      this.meta = {
        enabled: (0, _signals.signal)(false)
      };
      this.enable = function () {
        _this.meta.enabled.value = true;
        _this.injectStyles();
        _this.getSetCookie(_this.config.enabledCookie, true);
        return _this;
      };
      this.disable = function () {
        _this.meta.enabled.value = false;
        _this.getSetCookie(_this.config.enabledCookie, false);
        _this.removeStyles(); // maybe this should go in the destroy();, main concern is the toolbar.
        return _this;
      };
    }

    // utility functions
    return _createClass(OpenKeyNav, [{
      key: "setupTouchEvent",
      value: function setupTouchEvent() {
        window.TouchEvent = /*#__PURE__*/function (_Event) {
          function TouchEvent(type, initDict) {
            var _this2;
            _classCallCheck(this, TouchEvent);
            _this2 = _callSuper(this, TouchEvent, [type, initDict]);
            _this2.touches = initDict.touches || [];
            _this2.targetTouches = initDict.targetTouches || [];
            _this2.changedTouches = initDict.changedTouches || [];
            _this2.altKey = initDict.altKey || false;
            _this2.metaKey = initDict.metaKey || false;
            _this2.ctrlKey = initDict.ctrlKey || false;
            _this2.shiftKey = initDict.shiftKey || false;
            return _this2;
          }
          _inherits(TouchEvent, _Event);
          return _createClass(TouchEvent);
        }( /*#__PURE__*/_wrapNativeSuper(Event));
        window.Touch = /*#__PURE__*/_createClass(function _class(_ref) {
          var identifier = _ref.identifier,
            target = _ref.target,
            clientX = _ref.clientX,
            clientY = _ref.clientY;
          _classCallCheck(this, _class);
          this.identifier = identifier;
          this.target = target;
          this.clientX = clientX;
          this.clientY = clientY;
          this.screenX = clientX;
          this.screenY = clientY;
          this.pageX = clientX;
          this.pageY = clientY;
        });
      }
    }, {
      key: "deepMerge",
      value: function deepMerge(target, source) {
        var _this3 = this;
        Object.keys(source).forEach(function (key) {
          if (source[key] && _typeof(source[key]) === 'object') {
            if (!target[key] || _typeof(target[key]) !== 'object') {
              target[key] = {};
            }
            _this3.deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        });
        return target;
      }
    }, {
      key: "injectStyles",
      value: function injectStyles(replace) {
        (0, _styles.injectStylesheet)(this, replace);
      }
    }, {
      key: "removeStyles",
      value: function removeStyles() {
        (0, _styles.deleteStylesheets)();
      }
    }, {
      key: "initToolBar",
      value: function initToolBar() {
        (0, _toolbar.handleToolBar)(this);
      }
    }, {
      key: "isNonzeroSize",
      value: function isNonzeroSize(element) {
        var rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }
    }, {
      key: "isTextInputActive",
      value: function isTextInputActive() {
        var tagName = document.activeElement.tagName.toLowerCase();
        var editable = document.activeElement.getAttribute('contenteditable');
        var inputTypes = ['input', 'textarea'];
        var isEditable = editable === 'true' || editable === 'plaintext-only' || editable === '';
        return inputTypes.includes(tagName) || isEditable;
      }

      // avoids overlaps
    }, {
      key: "updateOverlayPosition",
      value: function updateOverlayPosition(element, overlay) {
        var elementsToAvoid = document.querySelectorAll('[data-openkeynav-label], .openKeyNav-label-selected, .openKeyNav-toolBar'); // maybe also add labeled elements to this list dynamically
        var rectAvoid = element.getBoundingClientRect();
        var overlayWidth = overlay.getBoundingClientRect().width;
        var overlayHeight = overlay.getBoundingClientRect().height;
        var arrowWidth = this.config.spot.arrowSize_px;
        function isBoundingBoxIntersecting(rectOverlay, rectAvoid) {
          return !(rectOverlay.right <= rectAvoid.left || rectOverlay.left >= rectAvoid.right || rectOverlay.bottom <= rectAvoid.top || rectOverlay.top >= rectAvoid.bottom);
        }
        var isOverlapping = function isOverlapping(overlay, avoidEl) {
          var rectOverlay = overlay.getBoundingClientRect();
          var rectAvoid = avoidEl.getBoundingClientRect();
          var isOverlapping_OnTop = function isOverlapping_OnTop() {
            // et's check if they are right above each other in the view.
            // this ensures elements inside modals or other containers visually hiding avoidEls can still have adjacent labels.
            var padding = 0; //this.config.spot.arrowSize_px;

            var corners = [{
              x: rectOverlay.left - padding,
              y: rectOverlay.top - padding
            },
            // top left
            {
              x: rectOverlay.right + padding,
              y: rectOverlay.top - padding
            },
            // top right
            {
              x: rectOverlay.left - padding,
              y: rectOverlay.bottom + padding
            },
            // bottom left
            {
              x: rectOverlay.right + padding,
              y: rectOverlay.bottom + padding
            } // bottom right
            ];

            // Hide the overlay element temporarily
            overlay.style.visibility = 'hidden';
            var isOverlapping = corners.some(function (corner) {
              if (corner.x >= 0 && corner.x <= window.innerWidth && corner.y >= 0 && corner.y <= window.innerHeight) {
                var elementAtPoint = document.elementFromPoint(corner.x, corner.y);
                return avoidEl === elementAtPoint || avoidEl.contains(elementAtPoint) || elementAtPoint && (elementAtPoint.contains(element) || elementAtPoint.classList.contains("openKeyNav-ignore-overlap"));
              }
              return false;
            });

            // Show the overlay element again
            overlay.style.visibility = 'visible';
            return isOverlapping;
          };
          return isBoundingBoxIntersecting(rectOverlay, rectAvoid) && isOverlapping_OnTop();

          // return isBoundingBoxIntersecting(rectOverlay, rectAvoid);

          // return false
        };
        function isCutOff(el) {
          var rect = el.getBoundingClientRect();
          return rect.left < 0 || rect.right > window.innerWidth || rect.top < 0 || rect.bottom > window.innerHeight;
        }
        function checkOverlap(overlay) {
          return isCutOff(overlay) || Array.from(elementsToAvoid).some(function (avoidEl) {
            if (avoidEl === overlay || avoidEl === element) {
              return false;
            }

            // Check if the element is directly on top of the avoidEl
            var rectElement = element.getBoundingClientRect();
            var rectAvoidEl = avoidEl.getBoundingClientRect();
            var isElementOnTop = isBoundingBoxIntersecting(rectElement, rectAvoidEl);
            if (isElementOnTop) {
              return false;
            }
            return isOverlapping(overlay, avoidEl);
          });
        }
        overlay.removeAttribute('data-openkeynav-position');

        // Try placing overlay to the left of the element
        overlay.style.position = 'absolute';
        overlay.style.left = "".concat(rectAvoid.left - (overlayWidth + arrowWidth) + window.scrollX, "px"); // Added scrollX adjustment
        overlay.style.top = "".concat(rectAvoid.top + window.scrollY, "px"); // Added scrollY adjustment
        var position = "left";
        if (!checkOverlap(overlay)) {
          overlay.setAttribute('data-openkeynav-position', position);
          return;
        }

        // Try placing overlay to the right of the element
        overlay.style.left = "".concat(rectAvoid.right + arrowWidth - 2 + window.scrollX, "px"); // Added scrollX adjustment
        // overlay.style.top = `${rectAvoid.top + window.scrollY}px`; // same as above
        position = "right";
        if (!checkOverlap(overlay)) {
          overlay.setAttribute('data-openkeynav-position', position);
          return;
        }

        // Try placing overlay above the element
        overlay.style.left = "".concat(rectAvoid.left + window.scrollX, "px"); // Added scrollX adjustment
        overlay.style.top = "".concat(rectAvoid.top - (overlayHeight + arrowWidth) + window.scrollY, "px"); // Added scrollY adjustment
        position = "top";
        if (!checkOverlap(overlay)) {
          overlay.setAttribute('data-openkeynav-position', position);
          return;
        }

        // Try placing overlay below the element
        overlay.style.left = "".concat(rectAvoid.left + window.scrollX, "px"); // Added scrollX adjustment
        overlay.style.top = "".concat(rectAvoid.bottom + arrowWidth + window.scrollY, "px"); // Added scrollY adjustment
        position = "bottom";
        if (!checkOverlap(overlay)) {
          overlay.setAttribute('data-openkeynav-position', position);
          return;
        }

        // If all placements result in overlaps or being cut off, place overlay on the element's top left position
        overlay.removeAttribute('data-openkeynav-position');
        overlay.style.left = "".concat(rectAvoid.left + window.scrollX, "px"); // Added scrollX adjustment
        overlay.style.top = "".concat(rectAvoid.top + window.scrollY, "px"); // Added scrollY adjustment
      }
    }, {
      key: "updateOverlayPosition_bak",
      value: function updateOverlayPosition_bak(element, overlay) {
        // this one just places the overlay over the element on top left position
        var rect = element.getBoundingClientRect();
        var adjustedLeft = rect.left;
        var adjustedTop = rect.top;

        // Check if the element is inside an iframe and adjust the position
        var parent = element.ownerDocument.defaultView.frameElement;
        while (parent) {
          var parentRect = parent.getBoundingClientRect();
          adjustedLeft += parentRect.left;
          adjustedTop += parentRect.top;
          parent = parent.ownerDocument.defaultView.frameElement;
        }
        overlay.style.left = "".concat(adjustedLeft + window.scrollX, "px");
        overlay.style.top = "".concat(adjustedTop + window.scrollY, "px");
      }
    }, {
      key: "createOverlay",
      value: function createOverlay(element, label) {
        var _this4 = this;
        function getScrollParent(element) {
          var includeHidden = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
          var style = getComputedStyle(element);
          var excludeStaticParent = style.position === 'absolute';
          var overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;
          if (style.position === 'fixed') return document.body;
          for (var parent = element; parent = parent.parentElement;) {
            style = getComputedStyle(parent);
            if (excludeStaticParent && style.position === 'static') {
              continue;
            }
            if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
          }
          return document.body;
        }
        var overlay = document.createElement('div');
        overlay.textContent = label;
        overlay.classList.add('openKeyNav-label');
        overlay.setAttribute('data-openkeynav-label', label);

        // Add event listener to open the element in developer tools
        overlay.addEventListener('click', function () {
          try {
            // Attempt to use inspect
            inspect(element);
          } catch (error) {
            // Fallback if inspect is not available or fails
            console.log(element);
            // alert('Element logged to console. Manually inspect it using the developer tools.');
          }
        });
        document.body.appendChild(overlay);
        //   element.setAttribute('data-openkeynav-label', label);

        // Initial position update
        this.updateOverlayPosition(element, overlay);

        // Find scrollable parent
        var scrollParent = getScrollParent(element);
        if (scrollParent) {
          scrollParent.addEventListener('scroll', function () {
            return _this4.updateOverlayPosition(element, overlay);
          });
        }
        if (element.classList.contains('openKeyNav-inaccessible')) {
          overlay.classList.add('openKeyNav-inaccessible');
        }
        return overlay;
      }
    }, {
      key: "isAnyCornerVisible",
      value: function isAnyCornerVisible(element) {
        var isElementInIframe = function isElementInIframe(element) {
          return element.ownerDocument !== window.document;
        };
        var doc = element.ownerDocument;
        var win = doc.defaultView || doc.parentWindow;
        var rect = element.getBoundingClientRect();
        // Coordinates for the four corners of the element
        var corners = [{
          x: rect.left + 1,
          y: rect.top + 1
        },
        // top-left
        {
          x: rect.right - 1,
          y: rect.top + 1
        },
        // top-right
        {
          x: rect.left + 1,
          y: rect.bottom - 1
        },
        // bottom-left
        {
          x: rect.right - 1,
          y: rect.bottom - 1
        } // bottom-right
        ];
        if (isElementInIframe(element)) {
          var frameElement = win.frameElement;
          if (frameElement) {
            var frameRect = frameElement.getBoundingClientRect();
            corners.forEach(function (corner) {
              corner.x += frameRect.left;
              corner.y += frameRect.top;
            });
            // Adjust `doc` and `win` to the parent document/window that contains the iframe
            doc = frameElement.ownerDocument;
            win = doc.defaultView || doc.parentWindow;
          }
        }

        // Check if any of the corners are visible
        for (var _i = 0, _corners = corners; _i < _corners.length; _i++) {
          var corner = _corners[_i];
          var elemAtPoint = doc.elementFromPoint(corner.x, corner.y);
          if (elemAtPoint === element || element.contains(elemAtPoint) || elemAtPoint && (elemAtPoint.contains(element) || elemAtPoint.classList.contains("openKeyNav-ignore-overlap"))) {
            return true; // At least one corner is visible
          }
        }
        return false; // None of the corners are visible
      }
    }, {
      key: "getScrollableElements",
      value: function getScrollableElements() {
        var _this5 = this;
        // Cross-browser way to get computed style
        var getComputedStyle = document.body && document.body.currentStyle ? function (elem) {
          return elem.currentStyle;
        } : function (elem) {
          return document.defaultView.getComputedStyle(elem, null);
        };

        // Retrieve the actual value of a CSS property
        function getActualCss(elem, style) {
          return getComputedStyle(elem)[style];
        }

        // Check horizontal scrollability
        function isXScrollable(elem) {
          var overflowX = getActualCss(elem, 'overflow-x');
          // Directly return true if overflowX is 'scroll', assuming you want to capture all elements with this setting
          if (overflowX === 'scroll') return true;
          return elem.offsetWidth < elem.scrollWidth && (overflowX === 'scroll' || overflowX === 'auto' || overflowX === 'overlay');
        }

        // Check vertical scrollability
        function isYScrollable(elem) {
          var overflowY = getActualCss(elem, 'overflow-y');
          // Directly return true if overflowY is 'scroll', assuming you want to capture all elements with this setting
          if (overflowY === 'scroll') return true;
          return elem.offsetHeight < elem.scrollHeight && (overflowY === 'scroll' || overflowY === 'auto' || overflowY === 'overlay');
        }

        // Check for other CSS properties that might affect scrollability
        function isPotentiallyScrollable(elem) {
          var position = getActualCss(elem, 'position');
          var display = getActualCss(elem, 'display');
          var visibility = getActualCss(elem, 'visibility');

          // Exclude elements that are not positioned in a way that could be scrollable
          if (position === 'static' && display === 'inline' && visibility !== 'hidden') {
            return false;
          }

          // Further checks can be added here as needed
          return true;
        }

        // Main function to check for scrollability
        var hasScroller = function hasScroller(elem) {
          // debug mode: do isAnyCornerVisible check by default and disable the check if debug.screenReaderVisible is true
          if (!_this5.config.debug.screenReaderVisible) {
            return _this5.isAnyCornerVisible(elem) && isPotentiallyScrollable(elem) && (isYScrollable(elem) || isXScrollable(elem));
          }
          return isPotentiallyScrollable(elem) && (isYScrollable(elem) || isXScrollable(elem));
        };
        return [].filter.call(document.querySelectorAll('*'), hasScroller);
      }
    }, {
      key: "preventScroll",
      value: function preventScroll(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, {
      key: "clearMoveAttributes",
      value: function clearMoveAttributes() {
        document.querySelectorAll('[data-openkeynav-moveconfig]').forEach(function (el) {
          el.removeAttribute('data-openkeynav-moveconfig');
          el.removeAttribute('data-openkeynav-draggable');
        });
      }
    }, {
      key: "removeOverlays",
      value: function removeOverlays(removeAll) {
        var _this6 = this;
        var resetModes = function resetModes() {
          for (var key in _this6.config.modes) {
            _this6.config.modes[key].value = false;
          }

          // reset move mode config
          _this6.config.modesConfig.move.selectedConfig = false;
          _this6.config.modesConfig.move.selectedMoveable = false;
          _this6.config.modesConfig.move.selectedMoveableHTML = false;
          _this6.config.modesConfig.move.selectedDropZone = false;
          _this6.config.modesConfig.move.modifier = false;

          // reset click mode config
          _this6.config.modesConfig.click.modifier = false;

          // reset menu mode config
          _this6.config.modesConfig.menu.modifier = false;
        };
        var clearInaccessibleWarnings = function clearInaccessibleWarnings() {
          document.querySelectorAll('.openKeyNav-inaccessible').forEach(function (el) {
            // remove inaccessible indicator styles
            el.classList.remove('openKeyNav-inaccessible');

            // Remove the event listeners if they exist in the map
            if (_this6.config.modesConfig.click.eventListenersMap.has(el)) {
              var _this6$config$modesCo = _this6.config.modesConfig.click.eventListenersMap.get(el),
                showTooltip = _this6$config$modesCo.showTooltip,
                hideTooltip = _this6$config$modesCo.hideTooltip;
              el.removeEventListener('mouseover', showTooltip);
              el.removeEventListener('mouseleave', hideTooltip);
              _this6.config.modesConfig.click.eventListenersMap.delete(el);
            }
          });
          document.querySelectorAll('.openKeyNav-mouseover-tooltip').forEach(function (el) {
            return el.remove();
          }); // remove the mouseover tooltips
        };
        var enableScrolling = function enableScrolling() {
          // Re-enable scrolling on the webpage

          var enableScrollingForEl = function enableScrollingForEl(el) {
            el.removeEventListener('scroll', _this6.preventScroll, {
              passive: false
            });
            el.removeEventListener('wheel', _this6.preventScroll, {
              passive: false
            });
            el.removeEventListener('touchmove', _this6.preventScroll, {
              passive: false
            });
          };
          var enableScrollingForScrollableElements = function enableScrollingForScrollableElements() {
            enableScrollingForEl(window);
            _this6.getScrollableElements().forEach(function (el) {
              enableScrollingForEl(el);
            });
          };
          enableScrollingForScrollableElements();
        };
        var removeAllOverlays = function removeAllOverlays() {
          document.querySelectorAll('.openKeyNav-label').forEach(function (el) {
            return el.remove();
          });
        };
        var removeAllOverlaysExceptThis = function removeAllOverlaysExceptThis(selectedLabel, typedLabel) {
          selectedLabel.innerHTML = "&bull;";
          // selectedLabel.innerHTML="&middot;";
          // selectedLabel.innerHTML="&nbsp;";
          // selectedLabel.innerHTML="✔";

          selectedLabel.classList.add('openKeyNav-label-selected');
          document.querySelectorAll(".openKeyNav-label:not([data-openkeynav-label=\"".concat(typedLabel, "\"])")).forEach(function (el) {
            return el.remove();
          });
        };

        // alert("removeOverlays()");
        if (this.config.modes.clicking.value) {
          enableScrolling();
        }

        // Remove overlay divs

        clearInaccessibleWarnings();
        if (removeAll) {
          removeAllOverlays();
        } else {
          if (!this.config.modes.moving.value) {
            // the only special modifer case so far for removing overlays is in moving mode,
            // where we may want to keep the selected element's label as a selected indicator
            removeAllOverlays();
          } else {
            // in moving mode.
            // keep the selected element's label as a selected indicator
            var selectedLabel = document.querySelector(".openKeyNav-label[data-openkeynav-label=\"".concat(this.config.typedLabel.value, "\"]"));
            if (!selectedLabel) {
              removeAllOverlays();
            } else {
              this.config.modesConfig.move.selectedLabel = selectedLabel;
              removeAllOverlaysExceptThis(selectedLabel, this.config.typedLabel.value);
            }
          }
        }
        document.querySelectorAll('[data-openkeynav-label]').forEach(function (el) {
          el.removeAttribute('data-openkeynav-label'); // Clean up data-openkeynav-label attributes
        });
        resetModes();
        this.config.typedLabel.value = '';
      }
    }, {
      key: "flagAsInaccessible",
      value: function flagAsInaccessible(el, reason, modality) {
        switch (modality) {
          case "keyboard":
            if (!this.config.debug.keyboardAccessible) {
              return false;
            }
        }
        var openKeyNav = this;
        function createTooltip(el, innerHTML) {
          // Create the tooltip element
          var tooltip = document.createElement('div');
          tooltip.className = 'openKeyNav-mouseover-tooltip';
          tooltip.innerHTML = innerHTML;
          tooltip.style.display = 'none';
          document.body.appendChild(tooltip);
          // Function to show the tooltip
          function showTooltip() {
            var rect = el.getBoundingClientRect();
            tooltip.style.left = "".concat(rect.left + window.scrollX, "px");
            tooltip.style.top = "".concat(rect.bottom + window.scrollY - 2, "px");
            tooltip.style.display = 'block';
          }
          // Function to hide the tooltip
          function hideTooltip() {
            // Get the mouse coordinates from the event
            var mouseX = event.clientX;
            var mouseY = event.clientY;

            // Get the bounding rectangle of the tooltip
            var tooltipRect = tooltip.getBoundingClientRect();

            // Check if the mouse is currently over the tooltip
            var isMouseOverTooltip = mouseX >= tooltipRect.left && mouseX <= tooltipRect.right && mouseY >= tooltipRect.top && mouseY <= tooltipRect.bottom;

            // Only hide the tooltip if the mouse is not over it
            if (!isMouseOverTooltip) {
              tooltip.style.display = 'none';
            }
          }
          el.addEventListener('mouseover', showTooltip);
          el.addEventListener('mouseleave', hideTooltip);
          tooltip.addEventListener('mouseleave', hideTooltip);
          // Store the event listeners for el in the map
          openKeyNav.config.modesConfig.click.eventListenersMap.set(el, {
            showTooltip: showTooltip,
            hideTooltip: hideTooltip
          });
        }
        createTooltip(el, reason);
        el.classList.add('openKeyNav-inaccessible');
        el.setAttribute('data-openkeynav-inaccessible-reason', reason);
        return true;
      }
    }, {
      key: "addKeydownEventListener",
      value: function addKeydownEventListener() {
        var _this7 = this;
        // Detect this.config.keys.click to enter label mode
        // Using an arrow function to maintain 'this' context of class
        document.addEventListener('keydown', function (e) {
          (0, _keypress.handleKeyPress)(_this7, e);
        }, true);

        // Also for the iframes
        window.addEventListener('message', function (e) {
          if (e.data.type === 'keydown') {
            console.log('Key pressed in iframe:', e.data.key);

            // Create a new event
            var newEvent = new KeyboardEvent('keydown', {
              key: e.data.key,
              keyCode: e.data.keyCode,
              altKey: e.data.altKey,
              ctrlKey: e.data.ctrlKey,
              shiftKey: e.data.shiftKey,
              metaKey: e.data.metaKey,
              bubbles: true,
              // This ensures the event bubbles up through the DOM
              cancelable: true // This lets it be cancelable
            });
            if (newEvent.key === 'Escape') {
              // Execute escape logic
              (0, _escape.handleEscape)(_this7, e);
            }

            // Dispatch it on the document or specific element that your existing handler is attached to
            document.dispatchEvent(newEvent);
          }
        });
      }

      // Function to emit a temporary notification
    }, {
      key: "emitNotification",
      value: function emitNotification(message) {
        // Function to create or select the notification container
        var getSetNotificationContainer = function getSetNotificationContainer() {
          // Create or select the notification container
          var notificationContainer = document.getElementById('okn-notification-container');
          if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'okn-notification-container';
            notificationContainer.className = 'openKeyNav-ignore-overlap';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.bottom = '10px';
            notificationContainer.style.left = '50%';
            notificationContainer.style.transform = 'translateX(-50%)';
            notificationContainer.style.display = 'flex';
            notificationContainer.style.flexDirection = 'column';
            notificationContainer.style.alignItems = 'center';
            notificationContainer.style.gap = '10px';
            notificationContainer.style.zIndex = '1000';
            document.body.appendChild(notificationContainer);
          }
          return notificationContainer;
        };

        // Check if notifications are enabled
        if (!this.config.notifications.enabled) {
          return;
        }

        // Get the notification container
        var notificationContainer = getSetNotificationContainer();

        // Remove any existing notification before creating a new one
        while (notificationContainer.firstChild) {
          notificationContainer.firstChild.remove();
        }

        // Create the notification element
        var notification = document.createElement('div');
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        notification.style.color = '#fff';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        notification.style.maxWidth = '400px';
        notification.style.textAlign = 'center';
        notification.style.position = 'relative';
        notification.style.display = 'inline-block';

        // Add ARIA role for accessibility
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        notification.setAttribute('aria-atomic', 'true');

        // Optionally display the tool name in the notification
        if (this.config.notifications.displayToolName) {
          var logo = document.createElement('div');
          logo.className = 'okn-logo-text tiny';
          logo.setAttribute('role', 'img'); // Assigning an image role
          logo.setAttribute('aria-label', 'OpenKeyNav');
          logo.innerHTML = 'Open<span class="key">Key</span>Nav';
          notification.appendChild(logo);
        }

        // Create the message element
        var messageDiv = document.createElement('div');
        messageDiv.innerHTML = message;
        // Append the message to the notification
        notification.appendChild(messageDiv);

        // Append the notification to the notification container
        notificationContainer.appendChild(notification);

        // Automatically remove the notification after the specified duration
        setTimeout(function () {
          notification.remove();
        }, this.config.notifications.duration);
      }
    }, {
      key: "initStatusBar",
      value: function initStatusBar() {
        var _this8 = this;
        // Effect to emit a notification based on the current mode
        var lastMessage = "No mode active.";
        (0, _signals.effect)(function () {
          var modes = _this8.config.modes;
          var message;

          // Determine the message based on the current mode
          if (modes.clicking.value) {
            message = "In Click Mode. Press ".concat((0, _keyButton.keyButton)(["Esc"]), " to exit.");
          } else if (modes.moving.value) {
            message = "In Drag Mode. Press ".concat((0, _keyButton.keyButton)(["Esc"]), " to exit.");
          } else {
            message = "No mode active.";
          }

          // Only emit the notification if the message has changed
          if (message === lastMessage) {
            return;
          }

          // Emit the notification with the current message
          console.log(message);
          _this8.emitNotification(message);
          lastMessage = message;
        });

        // Effect to update the status bar based on the current mode
        (0, _signals.effect)(function () {
          var modes = _this8.config.modes;
          // DOM element to update
          var statusBar = document.getElementById('status-bar');

          // Abort if no status bar is found
          if (!statusBar) {
            console.warn('Status bar element not found in the DOM.'); // TODO: is this depreciated?
            return;
          }

          // Update the status bar content based on the current mode
          if (modes.clicking.value) {
            statusBar.textContent = "In click mode. Press Esc to exit.";
          } else if (modes.moving.value) {
            statusBar.textContent = "In drag mode. Press Esc to exit.";
          } else {
            statusBar.textContent = "No mode active.";
          }
        });
      }
    }, {
      key: "checkEnabled",
      value: function checkEnabled() {
        if (this.getSetCookie(this.config.enabledCookie)) {
          this.enable();
        }
      }
    }, {
      key: "getSetCookie",
      value: function getSetCookie(cookieName, value) {
        // Helper: set cookie for domain, expires in 1 year
        function setCookie(cookieName, v) {
          var expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = "".concat(cookieName, "=").concat(v, "; expires=").concat(expires, "; path=/; domain=").concat(location.hostname);
        }

        // Helper: get cookie value
        function getCookie(cookieName) {
          var match = document.cookie.match(new RegExp('(^|; )' + cookieName + '=([^;]*)'));
          if (match) {
            return match[2] === 'true';
          }
          return null; // not set
        }
        if (typeof value !== 'undefined') {
          setCookie(cookieName, value === true || value === 'true' ? 'true' : 'false');
          return;
        }
        return getCookie(cookieName);
      }
    }, {
      key: "applicationSupport",
      value: function applicationSupport() {
        // Version Ping (POST https://applicationsupport.openkeynav.com/capture/)
        // This is anonymous and minimal, only sending the library version. No PII.
        // Necessary to know which versions are being used in the wild in order to provide proper support and plan roadmaps

        // no need to run app support on local develompent
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '::1') {
          return;
        }
        try {
          fetch("https://applicationsupport.openkeynav.com/capture/", {
            "method": "POST",
            "headers": {
              "Content-Type": "application/json"
            },
            "body": JSON.stringify({
              "properties": {
                "version": _version.version
              },
              "event": "openKeyNav.js version ping"
            })
          });
          // .then((res) => res.text())
          // .then(console.log.bind(console))
          // .catch(console.error.bind(console));
        } catch (error) {
          // fetch failed 
        }
      }
    }, {
      key: "setupGlobalClickListenerTracking",
      value: function setupGlobalClickListenerTracking() {
        var clickEventElements = this.config.modesConfig.click.clickEventElements;
        var originalAddEventListener = EventTarget.prototype.addEventListener;
        var originalRemoveEventListener = EventTarget.prototype.removeEventListener;
        EventTarget.prototype.addEventListener = function (type, listener, options) {
          if (type === 'click') {
            // Add if the listener is not an empty function
            var isEmptyFunction = listener && /^\s*function\s*\(\)\s*\{\s*\}\s*$/.test(listener.toString());
            if (!isEmptyFunction) {
              clickEventElements.add(this);
            }
          }
          return originalAddEventListener.call(this, type, listener, options);
        };
        EventTarget.prototype.removeEventListener = function (type, listener, options) {
          if (type === 'click') {
            var remainingListeners = getEventListeners(this, 'click').filter(function (l) {
              return l.listener !== listener;
            });
            if (remainingListeners.length === 0) {
              clickEventElements.delete(this);
            }
          }
          return originalRemoveEventListener.call(this, type, listener, options);
        };
        var observer = new MutationObserver(function (mutationsList) {
          var _iterator = _createForOfIteratorHelper(mutationsList),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var mutation = _step.value;
              if (mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach(function (node) {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    removeDescendantsFromSet(node);
                  }
                });
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        function removeDescendantsFromSet(element) {
          if (clickEventElements.has(element)) {
            clickEventElements.delete(element);
          }
          element.querySelectorAll('*').forEach(function (child) {
            if (clickEventElements.has(child)) {
              clickEventElements.delete(child);
            }
          });
        }
        function getEventListeners(el, eventType) {
          var listeners = [];
          var eventKey = "__eventListener__".concat(eventType);
          if (el[eventKey]) {
            listeners.push({
              listener: el[eventKey]
            });
          }
          return listeners;
        }
      }

      // Public API
    }, {
      key: "init",
      value: function init() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.deepMerge(this.config, options);
        this.addKeydownEventListener();
        this.initStatusBar();
        this.initToolBar();
        this.applicationSupport();
        this.checkEnabled();
        console.log('Library initialized with config:', this.config);
        return this;
      }
    }]);
  }(); // optionally attach a syncronous event listener here for tracking the elements tied to click events, (added and removed),
  // since elements with click events are behaving like buttons
  exports.default = OpenKeyNav$1.default = OpenKeyNav;

  return exports.default;

}));
