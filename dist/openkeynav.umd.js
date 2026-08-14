(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.OpenKeyNav = factory());
})(this, (function () { 'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function getAugmentedNamespace(n) {
	  if (n.__esModule) return n;
	  var f = n.default;
		if (typeof f == "function") {
			var a = function a () {
				if (this instanceof a) {
	        return Reflect.construct(f, arguments, this.constructor);
				}
				return f.apply(this, arguments);
			};
			a.prototype = f.prototype;
	  } else a = {};
	  Object.defineProperty(a, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var OpenKeyNav$1 = {};

	var version = {};

	Object.defineProperty(version, "__esModule", {
	  value: true
	});
	version.version = void 0;
	version.version = "0.1.268";

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
	  }).join(" ");
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

	var hasRequiredClicking;
	function requireClicking() {
	  if (hasRequiredClicking) return clicking;
	  hasRequiredClicking = 1;
	  Object.defineProperty(clicking, "__esModule", {
	    value: true
	  });
	  clicking.placeCursorAndScrollToCursor = clicking.handleTargetClickInteraction = void 0;
	  _interopRequireDefault(requireOpenKeyNav());
	  function _interopRequireDefault(e) {
	    return e && e.__esModule ? e : {
	      default: e
	    };
	  }
	  clicking.handleTargetClickInteraction = function handleTargetClickInteraction(openKeyNav, target, e) {
	    var doc = target.ownerDocument;
	    var win = doc.defaultView || doc.parentWindow;
	    var target_tagName = target.tagName.toLowerCase();
	    if (target_tagName === 'input' || target_tagName === 'textarea' || target.contentEditable === 'true' || target.contentEditable === 'plaintext-only' || target.hasAttribute('tabindex') && target.tabIndex > -1) {
	      placeCursorAndScrollToCursor(openKeyNav, target);
	    } else {
	      if (e.shiftKey && target.tagName.toLowerCase() === 'a' && target.href) {
	        win.open(target.href, '_blank');
	      } else {
	        openKeyNav.focus(target); // Ensure the target element is focused before dispatching the click event
	        if (!openKeyNav.config.modesConfig.click.modifier) {
	          var clickEvent = new win.MouseEvent('click', {
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
	  var placeCursorAndScrollToCursor = clicking.placeCursorAndScrollToCursor = function placeCursorAndScrollToCursor(openKeyNav, target) {
	    var targetTagName = target.tagName.toLowerCase();
	    setTimeout(function () {
	      openKeyNav.focus(target);
	      if (targetTagName === 'input' && ['text', 'search', 'url', 'tel', 'email', 'password'].indexOf(target.type) > -1 || targetTagName === 'textarea') {
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
	  return clicking;
	}

	var dragAndDrop = {};

	function _typeof$4(o) {
	  "@babel/helpers - typeof";

	  return _typeof$4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, _typeof$4(o);
	}
	Object.defineProperty(dragAndDrop, "__esModule", {
	  value: true
	});
	dragAndDrop.simulateDragAndDrop = dragAndDrop.endDrag = dragAndDrop.cancelDrag = dragAndDrop.beginDrag = void 0;
	function ownKeys$1(e, r) {
	  var t = Object.keys(e);
	  if (Object.getOwnPropertySymbols) {
	    var o = Object.getOwnPropertySymbols(e);
	    r && (o = o.filter(function (r) {
	      return Object.getOwnPropertyDescriptor(e, r).enumerable;
	    })), t.push.apply(t, o);
	  }
	  return t;
	}
	function _objectSpread$1(e) {
	  for (var r = 1; r < arguments.length; r++) {
	    var t = null != arguments[r] ? arguments[r] : {};
	    r % 2 ? ownKeys$1(Object(t), true).forEach(function (r) {
	      _defineProperty$2(e, r, t[r]);
	    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) {
	      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
	    });
	  }
	  return e;
	}
	function _defineProperty$2(e, r, t) {
	  return (r = _toPropertyKey$3(r)) in e ? Object.defineProperty(e, r, {
	    value: t,
	    enumerable: true,
	    configurable: true,
	    writable: true
	  }) : e[r] = t, e;
	}
	function _toPropertyKey$3(t) {
	  var i = _toPrimitive$3(t, "string");
	  return "symbol" == _typeof$4(i) ? i : i + "";
	}
	function _toPrimitive$3(t, r) {
	  if ("object" != _typeof$4(t) || !t) return t;
	  var e = t[Symbol.toPrimitive];
	  if (void 0 !== e) {
	    var i = e.call(t, r);
	    if ("object" != _typeof$4(i)) return i;
	    throw new TypeError("@@toPrimitive must return a primitive value.");
	  }
	  return ("string" === r ? String : Number)(t);
	}
	function _createForOfIteratorHelper$2(r, e) {
	  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	  if (!t) {
	    if (Array.isArray(r) || (t = _unsupportedIterableToArray$4(r)) || e) {
	      t && (r = t);
	      var _n = 0,
	        F = function F() {};
	      return {
	        s: F,
	        n: function n() {
	          return _n >= r.length ? {
	            done: true
	          } : {
	            done: false,
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
	    a = true,
	    u = false;
	  return {
	    s: function s() {
	      t = t.call(r);
	    },
	    n: function n() {
	      var r = t.next();
	      return a = r.done, r;
	    },
	    e: function e(r) {
	      u = true, o = r;
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
	function _unsupportedIterableToArray$4(r, a) {
	  if (r) {
	    if ("string" == typeof r) return _arrayLikeToArray$4(r, a);
	    var t = {}.toString.call(r).slice(8, -1);
	    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$4(r, a) : void 0;
	  }
	}
	function _arrayLikeToArray$4(r, a) {
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

	/**
	 * End an in-progress simulated drag without choosing a destination.
	 *
	 * Escape must not reuse endDrag(): its default destination is document.body,
	 * which dispatches a drop and can turn a cancellation command into a move.
	 * A dragend event gives integrations a cleanup signal while preserving the
	 * user's decision not to complete the operation.
	 */
	dragAndDrop.cancelDrag = function cancelDrag(openKeyNav) {
	  var sourceElement = openKeyNav.config.modesConfig.move.selectedMoveable;
	  if (!sourceElement) return false;
	  var dataTransfer = typeof DataTransfer === 'undefined' ? null : new DataTransfer();
	  var eventOptions = {
	    bubbles: true,
	    cancelable: false
	  };
	  var dragEndEvent;
	  if (typeof DragEvent === 'undefined') {
	    dragEndEvent = new Event('dragend', eventOptions);
	  } else {
	    dragEndEvent = new DragEvent('dragend', _objectSpread$1(_objectSpread$1({}, eventOptions), {}, {
	      dataTransfer: dataTransfer
	    }));
	  }
	  if (dataTransfer) {
	    Object.defineProperty(dragEndEvent, 'dataTransfer', {
	      value: dataTransfer
	    });
	  }
	  sourceElement.dispatchEvent(dragEndEvent);
	  return true;
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

	var _escape$1 = {};

	Object.defineProperty(_escape$1, "__esModule", {
	  value: true
	});
	_escape$1.handleEscape = void 0;
	var _dragAndDrop = dragAndDrop;
	_escape$1.handleEscape = function handleEscape(openKeyNav, e) {
	  var returnFalse = false;
	  if (openKeyNav.config.modes.clicking.value || openKeyNav.config.modes.moving.value || openKeyNav.config.modes.menu.value) {
	    e.preventDefault();
	    e.stopPropagation();
	    if (openKeyNav.config.modes.moving.value && openKeyNav.config.modesConfig.move.selectedMoveable) {
	      var selectedConfig = openKeyNav.config.modesConfig.move.config[openKeyNav.config.modesConfig.move.selectedConfig];

	      // Callback-driven moves never start a synthetic drag, so cancellation
	      // should not manufacture a dragend event for the host library either.
	      if (typeof (selectedConfig === null || selectedConfig === void 0 ? void 0 : selectedConfig.callback) !== 'function') {
	        (0, _dragAndDrop.cancelDrag)(openKeyNav);
	      }
	    }
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

	var structuralModel = {};

	var accessibilityName = {};

	var domUtilities = {};

	Object.defineProperty(domUtilities, "__esModule", {
	  value: true
	});
	domUtilities.isShadowRoot = domUtilities.isOpenKeyNavGeneratedUI = domUtilities.isElement = domUtilities.isDocument = domUtilities.isComposedWithin = domUtilities.hasAriaHiddenAncestor = domUtilities.getDeepActiveElement = domUtilities.getComposedParent = domUtilities.getComposedChildren = domUtilities.getComposedAncestors = domUtilities.collectComposedElements = domUtilities.OPENKEYNAV_GENERATED_UI_SELECTOR = void 0;
	var ELEMENT_NODE = 1;
	var DOCUMENT_NODE = 9;
	var DOCUMENT_FRAGMENT_NODE = 11;
	var OPENKEYNAV_GENERATED_UI_SELECTOR = domUtilities.OPENKEYNAV_GENERATED_UI_SELECTOR = ['[data-openkeynav-ui]', '.openKeyNav-label', '.openKeyNav-toolBar', '.openKeyNav-mouseover-tooltip', '.openKeyNav-structural-status', '#okn-notification-container', '#okn-audit-panel'].join(',');
	var isElement = domUtilities.isElement = function isElement(node) {
	  return Boolean(node && node.nodeType === ELEMENT_NODE);
	};
	var isDocument = domUtilities.isDocument = function isDocument(node) {
	  return Boolean(node && node.nodeType === DOCUMENT_NODE);
	};
	var isShadowRoot = domUtilities.isShadowRoot = function isShadowRoot(node) {
	  return Boolean(node && node.nodeType === DOCUMENT_FRAGMENT_NODE && node.host && isElement(node.host));
	};

	/**
	 * Returns the parent exposed by the composed tree rather than the light DOM.
	 */
	var getComposedParent = domUtilities.getComposedParent = function getComposedParent(node) {
	  if (!node) return null;
	  if (node.assignedSlot) return node.assignedSlot;
	  if (isShadowRoot(node)) return node.host;
	  return node.parentNode || null;
	};

	/**
	 * Includes `node` itself and stops after `boundary` when one is supplied.
	 */
	var getComposedAncestors = domUtilities.getComposedAncestors = function getComposedAncestors(node) {
	  var boundary = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	  var ancestors = [];
	  var current = node;
	  while (current) {
	    ancestors.push(current);
	    if (current === boundary) break;
	    current = getComposedParent(current);
	  }
	  return ancestors;
	};
	var isComposedWithin = domUtilities.isComposedWithin = function isComposedWithin(boundary, node) {
	  return Boolean(boundary && node) && getComposedAncestors(node, boundary).includes(boundary);
	};

	/**
	 * Returns children in the rendered composed tree, following open shadow roots
	 * and replacing slots with their assigned nodes when present.
	 */
	var getComposedChildren = domUtilities.getComposedChildren = function getComposedChildren(node) {
	  if (isDocument(node)) {
	    return node.documentElement ? [node.documentElement] : [];
	  }
	  if (isElement(node) && node.shadowRoot) {
	    return Array.from(node.shadowRoot.childNodes);
	  }
	  if (isElement(node) && node.tagName.toLowerCase() === 'slot' && typeof node.assignedNodes === 'function') {
	    var assigned = node.assignedNodes({
	      flatten: true
	    });
	    if (assigned.length) return assigned;
	  }
	  return Array.from((node === null || node === void 0 ? void 0 : node.childNodes) || []);
	};
	domUtilities.collectComposedElements = function collectComposedElements(root) {
	  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$exclude = _ref.exclude,
	    exclude = _ref$exclude === void 0 ? null : _ref$exclude;
	  var elements = [];
	  var seen = new Set();
	  var _visit = function visit(node) {
	    if (!node || seen.has(node)) return;
	    seen.add(node);
	    if (isElement(node)) {
	      if (exclude !== null && exclude !== void 0 && exclude(node)) return;
	      elements.push(node);
	    }
	    getComposedChildren(node).forEach(_visit);
	  };
	  _visit(root);
	  return elements;
	};

	/**
	 * Returns true when an element is, or is composed beneath, OpenKeyNav-owned UI.
	 */
	domUtilities.isOpenKeyNavGeneratedUI = function isOpenKeyNavGeneratedUI(element) {
	  var selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : OPENKEYNAV_GENERATED_UI_SELECTOR;
	  return getComposedAncestors(element).some(function (current) {
	    return isElement(current) && current.matches(selector);
	  });
	};
	domUtilities.hasAriaHiddenAncestor = function hasAriaHiddenAncestor(element) {
	  var boundary = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	  return getComposedAncestors(element, boundary).some(function (current) {
	    return isElement(current) && current.getAttribute('aria-hidden') === 'true';
	  });
	};

	/**
	 * Reads the actual focused element exposed by a document or open shadow root.
	 * Iframes remain atomic focus targets.
	 */
	domUtilities.getDeepActiveElement = function getDeepActiveElement() {
	  var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : typeof document === 'undefined' ? null : document;
	  if (!root) return null;
	  var activeRoot = isDocument(root) || isShadowRoot(root) ? root : root.ownerDocument;
	  var activeElement = activeRoot && activeRoot.activeElement;
	  while (activeElement && (_activeElement$shadow = activeElement.shadowRoot) !== null && _activeElement$shadow !== void 0 && _activeElement$shadow.activeElement) {
	    var _activeElement$shadow;
	    activeElement = activeElement.shadowRoot.activeElement;
	  }
	  if (!activeElement || !isComposedWithin(root, activeElement)) return null;
	  return activeElement;
	};

	Object.defineProperty(accessibilityName, "__esModule", {
	  value: true
	});
	accessibilityName.normalizeText = accessibilityName.getLabelledByText = accessibilityName.getExplicitAccessibleName = void 0;
	var _domUtilities$3 = domUtilities;
	var normalizeText = accessibilityName.normalizeText = function normalizeText(value) {
	  return String(value || '').replace(/\s+/g, ' ').trim();
	};
	var queryReference = function queryReference(element, id) {
	  var _element$getRootNode, _root$getElementById, _element$ownerDocumen;
	  var root = (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
	  return (root === null || root === void 0 || (_root$getElementById = root.getElementById) === null || _root$getElementById === void 0 ? void 0 : _root$getElementById.call(root, id)) || ((_element$ownerDocumen = element.ownerDocument) === null || _element$ownerDocumen === void 0 ? void 0 : _element$ownerDocumen.getElementById(id));
	};
	var getLabelledByText = accessibilityName.getLabelledByText = function getLabelledByText(element) {
	  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$excludeHidden = _ref.excludeHidden,
	    excludeHidden = _ref$excludeHidden === void 0 ? true : _ref$excludeHidden;
	  if (!(element !== null && element !== void 0 && element.getAttribute)) return '';
	  return (element.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean).map(function (id) {
	    return queryReference(element, id);
	  }).filter(function (label) {
	    var _element$getRootNode2;
	    return label && (!excludeHidden || !(0, _domUtilities$3.hasAriaHiddenAncestor)(label, (_element$getRootNode2 = element.getRootNode) === null || _element$getRootNode2 === void 0 ? void 0 : _element$getRootNode2.call(element)));
	  }).map(function (label) {
	    return normalizeText(label.textContent);
	  }).filter(Boolean).join(' ');
	};

	/**
	 * Resolves only author-provided ARIA names. It deliberately does not attempt
	 * the full accessible-name computation used by assistive technologies.
	 */
	accessibilityName.getExplicitAccessibleName = function getExplicitAccessibleName(element, options) {
	  var _element$getAttribute;
	  return getLabelledByText(element, options) || ((element === null || element === void 0 || (_element$getAttribute = element.getAttribute) === null || _element$getAttribute === void 0 ? void 0 : _element$getAttribute.call(element, 'aria-label')) || '').trim();
	};

	Object.defineProperty(structuralModel, "__esModule", {
	  value: true
	});
	structuralModel.buildStructuralModel = void 0;
	var _accessibilityName$1 = accessibilityName;
	var _domUtilities$2 = domUtilities;
	function _toConsumableArray$2(r) {
	  return _arrayWithoutHoles$2(r) || _iterableToArray$2(r) || _unsupportedIterableToArray$3(r) || _nonIterableSpread$2();
	}
	function _nonIterableSpread$2() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _iterableToArray$2(r) {
	  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
	}
	function _arrayWithoutHoles$2(r) {
	  if (Array.isArray(r)) return _arrayLikeToArray$3(r);
	}
	function _createForOfIteratorHelper$1(r, e) {
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
	            done: true
	          } : {
	            done: false,
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
	    a = true,
	    u = false;
	  return {
	    s: function s() {
	      t = t.call(r);
	    },
	    n: function n() {
	      var r = t.next();
	      return a = r.done, r;
	    },
	    e: function e(r) {
	      u = true, o = r;
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
	var LANDMARK_ROLES = new Set(['banner', 'complementary', 'contentinfo', 'form', 'main', 'navigation', 'region', 'search']);
	var COMPOSITE_ROLES = new Set(['combobox', 'grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'toolbar', 'tree', 'treegrid']);
	var SUPPRESSED_ROLES = new Set(['none', 'presentation']);
	var boundaryIdentity = new WeakMap();
	var nextBoundaryIdentity = 1;
	var isSemanticallyHidden = function isSemanticallyHidden(element, root) {
	  return (0, _domUtilities$2.hasAriaHiddenAncestor)(element, root);
	};
	var isOperativeSemanticElement = function isOperativeSemanticElement(element, root) {
	  var current = element;
	  while (current) {
	    if ((0, _domUtilities$2.isElement)(current)) {
	      var _current$ownerDocumen, _view$getComputedStyl;
	      if (current.hidden || current.hasAttribute('inert') || current.tagName.toLowerCase() === 'dialog' && !current.hasAttribute('open')) {
	        return false;
	      }
	      if (current.tagName.toLowerCase() === 'details' && !current.hasAttribute('open')) {
	        var summary = Array.from(current.children).find(function (child) {
	          return child.tagName.toLowerCase() === 'summary';
	        });
	        if (!summary || !(0, _domUtilities$2.isComposedWithin)(summary, element)) return false;
	      }
	      if (current.hasAttribute('popover')) {
	        try {
	          if (!current.matches(':popover-open')) return false;
	        } catch (error) {
	          // Browsers without the popover pseudo-class expose no reliable
	          // automatic state here; target discovery remains authoritative.
	        }
	      }
	      var view = (_current$ownerDocumen = current.ownerDocument) === null || _current$ownerDocumen === void 0 ? void 0 : _current$ownerDocumen.defaultView;
	      var style = view === null || view === void 0 || (_view$getComputedStyl = view.getComputedStyle) === null || _view$getComputedStyl === void 0 ? void 0 : _view$getComputedStyl.call(view, current);
	      if ((style === null || style === void 0 ? void 0 : style.display) === 'none' || (style === null || style === void 0 ? void 0 : style.visibility) === 'hidden' || (style === null || style === void 0 ? void 0 : style.visibility) === 'collapse') {
	        return false;
	      }
	    }
	    if (current === root) break;
	    current = (0, _domUtilities$2.getComposedParent)(current);
	  }
	  return true;
	};
	var stableBoundaryId = function stableBoundaryId(boundary) {
	  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'context';
	  if (!boundaryIdentity.has(boundary)) {
	    boundaryIdentity.set(boundary, nextBoundaryIdentity++);
	  }
	  return "".concat(prefix, "-").concat(boundaryIdentity.get(boundary));
	};
	var headingRank = function headingRank(element) {
	  if (!(0, _domUtilities$2.isElement)(element)) return null;
	  var role = (element.getAttribute('role') || '').trim().toLowerCase();
	  if (SUPPRESSED_ROLES.has(role)) return null;
	  var match = /^h([1-6])$/i.exec(element.tagName);
	  if (match) return !role || role === 'heading' ? Number(match[1]) : null;
	  if (role !== 'heading') {
	    return null;
	  }
	  var level = Number(element.getAttribute('aria-level'));
	  return Number.isInteger(level) && level > 0 ? level : null;
	};
	var contextTypeForElement = function contextTypeForElement(element) {
	  var role = (element.getAttribute('role') || '').trim().toLowerCase();
	  if (SUPPRESSED_ROLES.has(role)) return null;
	  if (role) {
	    if (LANDMARK_ROLES.has(role)) {
	      if (role === 'region' && !(0, _accessibilityName$1.getExplicitAccessibleName)(element)) return null;
	      return role;
	    }
	    if (role === 'list') return 'list';
	    if (COMPOSITE_ROLES.has(role)) return 'widget';
	  }
	  var tagName = element.tagName.toLowerCase();
	  switch (tagName) {
	    case 'main':
	      return 'main';
	    case 'nav':
	      return 'navigation';
	    case 'aside':
	      return 'complementary';
	    case 'header':
	      {
	        var ancestor = (0, _domUtilities$2.getComposedParent)(element);
	        while (ancestor && (0, _domUtilities$2.isElement)(ancestor)) {
	          if (['article', 'aside', 'main', 'nav', 'section'].includes(ancestor.tagName.toLowerCase())) {
	            return null;
	          }
	          ancestor = (0, _domUtilities$2.getComposedParent)(ancestor);
	        }
	        return 'banner';
	      }
	    case 'footer':
	      {
	        var _ancestor = (0, _domUtilities$2.getComposedParent)(element);
	        while (_ancestor && (0, _domUtilities$2.isElement)(_ancestor)) {
	          if (['article', 'aside', 'main', 'nav', 'section'].includes(_ancestor.tagName.toLowerCase())) {
	            return null;
	          }
	          _ancestor = (0, _domUtilities$2.getComposedParent)(_ancestor);
	        }
	        return 'contentinfo';
	      }
	    case 'section':
	      return 'section';
	    case 'article':
	      return 'article';
	    case 'form':
	      return role === 'search' ? 'search' : 'form';
	    case 'search':
	      return 'search';
	    case 'fieldset':
	      return 'fieldset';
	    case 'ol':
	    case 'ul':
	      return 'list';
	    default:
	      return null;
	  }
	};
	var titleCase = function titleCase(value) {
	  return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, function (character) {
	    return character.toUpperCase();
	  });
	};
	var firstLegendText = function firstLegendText(element) {
	  if (element.tagName.toLowerCase() !== 'fieldset') return '';
	  var legend = Array.from(element.children).find(function (child) {
	    return child.tagName.toLowerCase() === 'legend';
	  });
	  return (0, _accessibilityName$1.normalizeText)(legend === null || legend === void 0 ? void 0 : legend.textContent);
	};
	var contextFallbackName = function contextFallbackName(type) {
	  var names = {
	    banner: 'Header',
	    complementary: 'Complementary',
	    contentinfo: 'Footer',
	    fieldset: 'Fieldset',
	    form: 'Form',
	    list: 'List',
	    main: 'Main',
	    navigation: 'Navigation',
	    region: 'Region',
	    search: 'Search',
	    section: 'Section',
	    article: 'Article',
	    widget: 'Widget'
	  };
	  return names[type] || titleCase(type || 'Context');
	};
	var contextNameForElement = function contextNameForElement(element, type) {
	  var associatedHeading = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	  return firstLegendText(element) || (0, _accessibilityName$1.getExplicitAccessibleName)(element) || (0, _accessibilityName$1.normalizeText)(associatedHeading === null || associatedHeading === void 0 ? void 0 : associatedHeading.textContent) || contextFallbackName(type);
	};
	var makeContext = function makeContext(_ref) {
	  var id = _ref.id,
	    name = _ref.name,
	    type = _ref.type,
	    source = _ref.source,
	    _ref$boundary = _ref.boundary,
	    boundary = _ref$boundary === void 0 ? null : _ref$boundary,
	    _ref$order = _ref.order,
	    order = _ref$order === void 0 ? 0 : _ref$order,
	    _ref$memberTargets = _ref.memberTargets,
	    memberTargets = _ref$memberTargets === void 0 ? [] : _ref$memberTargets,
	    _ref$parentHint = _ref.parentHint,
	    parentHint = _ref$parentHint === void 0 ? null : _ref$parentHint,
	    _ref$required = _ref.required,
	    required = _ref$required === void 0 ? false : _ref$required,
	    _ref$rangeStart = _ref.rangeStart,
	    rangeStart = _ref$rangeStart === void 0 ? null : _ref$rangeStart,
	    _ref$rangeEnd = _ref.rangeEnd,
	    rangeEnd = _ref$rangeEnd === void 0 ? null : _ref$rangeEnd,
	    _ref$rangeBoundary = _ref.rangeBoundary,
	    rangeBoundary = _ref$rangeBoundary === void 0 ? null : _ref$rangeBoundary,
	    _ref$containerContext = _ref.containerContext,
	    containerContext = _ref$containerContext === void 0 ? null : _ref$containerContext,
	    _ref$visualElements = _ref.visualElements,
	    visualElements = _ref$visualElements === void 0 ? [] : _ref$visualElements,
	    _ref$explicitParentId = _ref.explicitParentId,
	    explicitParentId = _ref$explicitParentId === void 0 ? null : _ref$explicitParentId,
	    _ref$headingLevel = _ref.headingLevel,
	    headingLevel = _ref$headingLevel === void 0 ? null : _ref$headingLevel;
	  return {
	    id: id,
	    name: name,
	    type: type,
	    source: source,
	    boundary: boundary,
	    order: order,
	    memberTargets: Array.from(memberTargets),
	    memberSet: new Set(memberTargets),
	    parent: parentHint,
	    children: [],
	    directTargets: [],
	    targets: [],
	    required: required,
	    rangeStart: rangeStart,
	    rangeEnd: rangeEnd,
	    rangeBoundary: rangeBoundary,
	    containerContext: containerContext,
	    visualElements: Array.from(visualElements),
	    explicitParentId: explicitParentId,
	    headingLevel: headingLevel
	  };
	};
	var nearestContextBoundary = function nearestContextBoundary(element, boundaryContexts, stopRoot) {
	  var current = element;
	  while (current) {
	    if (boundaryContexts.has(current)) return boundaryContexts.get(current);
	    if (current === stopRoot) break;
	    current = (0, _domUtilities$2.getComposedParent)(current);
	  }
	  return null;
	};
	var nearestAncestorContext = function nearestAncestorContext(boundary, boundaryContexts, rootContext) {
	  var current = (0, _domUtilities$2.getComposedParent)(boundary);
	  while (current) {
	    if (boundaryContexts.has(current)) return boundaryContexts.get(current);
	    current = (0, _domUtilities$2.getComposedParent)(current);
	  }
	  return rootContext;
	};
	var resolveContributionValue = function resolveContributionValue(value, details) {
	  return typeof value === 'function' ? value(details) : value;
	};
	var resolveBoundary = function resolveBoundary(descriptor, root, details) {
	  var _descriptor$boundary, _root$querySelector;
	  var candidate = resolveContributionValue((_descriptor$boundary = descriptor.boundary) !== null && _descriptor$boundary !== void 0 ? _descriptor$boundary : descriptor.element, details);
	  if (typeof candidate === 'string') return ((_root$querySelector = root.querySelector) === null || _root$querySelector === void 0 ? void 0 : _root$querySelector.call(root, candidate)) || null;
	  return (0, _domUtilities$2.isElement)(candidate) || (0, _domUtilities$2.isShadowRoot)(candidate) || (0, _domUtilities$2.isDocument)(candidate) ? candidate : null;
	};
	var resolveMembers = function resolveMembers(descriptor, boundary, root, targets, details) {
	  var _descriptor$targets;
	  var configured = resolveContributionValue((_descriptor$targets = descriptor.targets) !== null && _descriptor$targets !== void 0 ? _descriptor$targets : descriptor.members, details);
	  if (typeof configured === 'string') {
	    var _root$querySelectorAl;
	    configured = Array.from(((_root$querySelectorAl = root.querySelectorAll) === null || _root$querySelectorAl === void 0 ? void 0 : _root$querySelectorAl.call(root, configured)) || []);
	  }
	  if (configured) {
	    var allowed = new Set(targets);
	    return Array.from(configured).filter(function (target) {
	      return allowed.has(target);
	    }).filter(function (target, index, values) {
	      return values.indexOf(target) === index;
	    });
	  }
	  if (boundary) {
	    return targets.filter(function (target) {
	      return (0, _domUtilities$2.isComposedWithin)(boundary, target);
	    });
	  }
	  return [];
	};
	var setsOverlap = function setsOverlap(left, right) {
	  var _iterator = _createForOfIteratorHelper$1(left),
	    _step;
	  try {
	    for (_iterator.s(); !(_step = _iterator.n()).done;) {
	      var value = _step.value;
	      if (right.has(value)) return true;
	    }
	  } catch (err) {
	    _iterator.e(err);
	  } finally {
	    _iterator.f();
	  }
	  return false;
	};
	var setsEqual = function setsEqual(left, right) {
	  return left.size === right.size && isSubset(left, right);
	};
	var isSubset = function isSubset(candidate, container) {
	  var _iterator2 = _createForOfIteratorHelper$1(candidate),
	    _step2;
	  try {
	    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	      var value = _step2.value;
	      if (!container.has(value)) return false;
	    }
	  } catch (err) {
	    _iterator2.e(err);
	  } finally {
	    _iterator2.f();
	  }
	  return true;
	};
	var isContextAncestor = function isContextAncestor(ancestor, context) {
	  var current = context;
	  var seen = new Set();
	  while (current && !seen.has(current)) {
	    if (current === ancestor) return true;
	    seen.add(current);
	    current = current.parent;
	  }
	  return false;
	};
	var normalizeTypedContexts = function normalizeTypedContexts(descriptors, details, targets) {
	  var targetSet = new Set(targets);
	  var contexts = [];
	  Array.from(descriptors || []).forEach(function (descriptor, registrationOrder) {
	    var _descriptor$targets2;
	    if (!descriptor || descriptor.id === null || typeof descriptor.id === 'undefined') {
	      return;
	    }
	    if (typeof descriptor.isValid === 'function' && !descriptor.isValid(details)) {
	      return;
	    }
	    var resolvedTargets = resolveContributionValue((_descriptor$targets2 = descriptor.targets) !== null && _descriptor$targets2 !== void 0 ? _descriptor$targets2 : descriptor.resolveTargets, details);
	    var seen = new Set();
	    var liveTargets = Array.from(resolvedTargets || []).filter(function (target) {
	      if (seen.has(target) || !targetSet.has(target) || !target.isConnected) {
	        return false;
	      }
	      seen.add(target);
	      return true;
	    });
	    if (!liveTargets.length) return;
	    contexts.push({
	      id: String(descriptor.id),
	      name: descriptor.name || descriptor.type || 'Peer context',
	      type: descriptor.type || 'application',
	      provenance: descriptor.provenance || 'application configuration',
	      priority: Number.isFinite(Number(descriptor.priority)) ? Number(descriptor.priority) : registrationOrder,
	      registrationOrder: registrationOrder,
	      targets: liveTargets
	    });
	  });
	  contexts.sort(function (left, right) {
	    return left.priority - right.priority || left.registrationOrder - right.registrationOrder;
	  });
	  return contexts;
	};

	/**
	 * Builds a deterministic structural tree over one ordered target inventory.
	 * Contexts are routing metadata; targets are always the original Element
	 * identities supplied by the discovery boundary.
	 */
	structuralModel.buildStructuralModel = function buildStructuralModel() {
	  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	    root = _ref2.root,
	    _ref2$targets = _ref2.targets,
	    targets = _ref2$targets === void 0 ? [] : _ref2$targets,
	    _ref2$structuralConte = _ref2.structuralContexts,
	    structuralContexts = _ref2$structuralConte === void 0 ? [] : _ref2$structuralConte,
	    _ref2$typedContexts = _ref2.typedContexts,
	    typedContexts = _ref2$typedContexts === void 0 ? [] : _ref2$typedContexts,
	    _ref2$previousModel = _ref2.previousModel,
	    previousModel = _ref2$previousModel === void 0 ? null : _ref2$previousModel;
	  if (!root || !(0, _domUtilities$2.isDocument)(root) && !(0, _domUtilities$2.isElement)(root) && !(0, _domUtilities$2.isShadowRoot)(root)) {
	    throw new TypeError('buildStructuralModel requires an Element, Document, or ShadowRoot root.');
	  }
	  var liveTargets = Array.from(targets).filter(function (target) {
	    return (target === null || target === void 0 ? void 0 : target.isConnected) && (0, _domUtilities$2.isComposedWithin)(root, target);
	  }).filter(function (target, index, values) {
	    return values.indexOf(target) === index;
	  });
	  var elements = (0, _domUtilities$2.collectComposedElements)(root, {
	    exclude: _domUtilities$2.isOpenKeyNavGeneratedUI
	  });
	  var orderByElement = new Map(elements.map(function (element, index) {
	    return [element, index];
	  }));
	  var targetOrder = function targetOrder(target) {
	    return orderByElement.has(target) ? orderByElement.get(target) : Number.MAX_SAFE_INTEGER;
	  };
	  var rootName = (0, _domUtilities$2.isDocument)(root) ? 'Document' : (0, _domUtilities$2.isElement)(root) ? contextNameForElement(root, contextTypeForElement(root) || 'region') : 'Shadow root';
	  var rootContext = makeContext({
	    id: stableBoundaryId(root, 'root'),
	    name: rootName,
	    type: 'root',
	    source: 'root',
	    boundary: root,
	    memberTargets: liveTargets,
	    order: -1,
	    required: true
	  });
	  var boundaryContexts = new Map();
	  var automaticContexts = [];

	  // Identify explicit semantic boundaries first so associated headings and
	  // structural parents can be resolved deterministically.
	  elements.forEach(function (element) {
	    // An Element supplied as the active root is already represented by the
	    // root context. Re-inferring it would create two contexts for one boundary.
	    if (element === root) return;
	    if (isSemanticallyHidden(element, root)) return;
	    var type = contextTypeForElement(element);
	    if (!type) return;
	    var memberTargets = liveTargets.filter(function (target) {
	      return (0, _domUtilities$2.isComposedWithin)(element, target);
	    });
	    if (!memberTargets.length) return;
	    var context = makeContext({
	      id: stableBoundaryId(element, 'context'),
	      name: '',
	      type: type,
	      source: 'semantic',
	      boundary: element,
	      memberTargets: memberTargets,
	      order: orderByElement.get(element)
	    });
	    boundaryContexts.set(element, context);
	    automaticContexts.push(context);
	  });
	  var headings = elements.filter(function (element) {
	    return headingRank(element) !== null && !isSemanticallyHidden(element, root) && isOperativeSemanticElement(element, root);
	  });
	  var ownedHeadingByTarget = new Map();
	  var ownedHeadingsByTarget = new Map();
	  liveTargets.forEach(function (target) {
	    var containedHeadings = headings.filter(function (heading) {
	      return (0, _domUtilities$2.isComposedWithin)(target, heading);
	    });
	    var firstContainedHeading = containedHeadings[0];
	    if (firstContainedHeading) {
	      var _target$getAttribute;
	      ownedHeadingByTarget.set(target, firstContainedHeading);
	      var contentEditableValue = (_target$getAttribute = target.getAttribute) === null || _target$getAttribute === void 0 ? void 0 : _target$getAttribute.call(target, 'contenteditable');
	      var contentEditable = target.isContentEditable || contentEditableValue === '' || (contentEditableValue === null || contentEditableValue === void 0 ? void 0 : contentEditableValue.toLowerCase()) === 'true';
	      ownedHeadingsByTarget.set(target, new Set(contentEditable ? containedHeadings : [firstContainedHeading]));
	    }
	  });
	  automaticContexts.forEach(function (context) {
	    var directHeadings = headings.filter(function (heading) {
	      return (0, _domUtilities$2.isComposedWithin)(context.boundary, heading) && nearestContextBoundary((0, _domUtilities$2.getComposedParent)(heading), boundaryContexts, root) === context;
	    });
	    var labelledHeadingIds = new Set((context.boundary.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean));
	    var explicitlyAssociated = headings.find(function (heading) {
	      return heading.id && labelledHeadingIds.has(heading.id);
	    });
	    var leadingHeading = directHeadings.find(function (heading) {
	      var headingOrder = orderByElement.get(heading);
	      return !context.memberTargets.some(function (target) {
	        return targetOrder(target) < headingOrder;
	      });
	    });
	    var ownHeading = explicitlyAssociated || leadingHeading || null;
	    context.associatedHeading = ownHeading || null;
	    context.headingLevel = ownHeading ? headingRank(ownHeading) : null;
	    context.name = contextNameForElement(context.boundary, context.type, context.associatedHeading);
	  });
	  var allContexts = [rootContext].concat(automaticContexts);
	  var details = {
	    root: root,
	    targets: liveTargets.slice(),
	    previousModel: previousModel
	  };

	  // Application contexts merge with the same DOM boundary where possible;
	  // otherwise they contribute an explicit ordered membership boundary.
	  Array.from(structuralContexts || []).forEach(function (descriptor, index) {
	    if (!descriptor || descriptor.id === null || typeof descriptor.id === 'undefined') {
	      return;
	    }
	    if (typeof descriptor.isValid === 'function' && !descriptor.isValid(details)) {
	      return;
	    }
	    var boundary = resolveBoundary(descriptor, root, details);
	    var memberTargets = resolveMembers(descriptor, boundary, root, liveTargets, details);
	    if (!memberTargets.length) return;
	    var existing = boundary && boundaryContexts.get(boundary);
	    var order = Number.isFinite(Number(descriptor.order)) ? Number(descriptor.order) : boundary && orderByElement.has(boundary) ? orderByElement.get(boundary) : Math.min.apply(Math, _toConsumableArray$2(memberTargets.map(targetOrder)));
	    if (!Number.isFinite(order)) {
	      throw new TypeError("Structural context \"".concat(descriptor.id, "\" requires a deterministic order."));
	    }
	    if (existing) {
	      existing.id = String(descriptor.id);
	      existing.name = descriptor.name || existing.name;
	      existing.type = descriptor.type || existing.type;
	      existing.source = 'application';
	      existing.required = Boolean(descriptor.required || descriptor.preserve || descriptor.selectable);
	      existing.memberTargets = memberTargets;
	      existing.memberSet = new Set(memberTargets);
	      existing.explicitParentId = descriptor.parentId || null;
	      existing.order = order;
	      var _configuredHeadingLevel = Number(descriptor.headingLevel);
	      if (Number.isInteger(_configuredHeadingLevel) && _configuredHeadingLevel > 0) {
	        existing.headingLevel = _configuredHeadingLevel;
	      }
	      return;
	    }
	    var configuredHeadingLevel = Number(descriptor.headingLevel);
	    var applicationHeadingLevel = Number.isInteger(configuredHeadingLevel) && configuredHeadingLevel > 0 ? configuredHeadingLevel : headingRank(boundary);
	    var context = makeContext({
	      id: String(descriptor.id),
	      name: descriptor.name || descriptor.type || 'Application context',
	      type: descriptor.type || 'application',
	      source: 'application',
	      boundary: boundary,
	      memberTargets: memberTargets,
	      order: order + index / 100000,
	      required: Boolean(descriptor.required || descriptor.preserve || descriptor.selectable),
	      explicitParentId: descriptor.parentId || null,
	      headingLevel: applicationHeadingLevel
	    });
	    if (boundary) boundaryContexts.set(boundary, context);
	    allContexts.push(context);
	  });
	  var contextByIdBeforeRanges = new Map(allContexts.map(function (context) {
	    return [context.id, context];
	  }));

	  // Establish the ordinary explicit-container ancestry.
	  allContexts.slice(1).forEach(function (context) {
	    if (context.explicitParentId) {
	      context.parent = contextByIdBeforeRanges.get(String(context.explicitParentId)) || rootContext;
	    } else if (context.boundary) {
	      context.parent = nearestAncestorContext(context.boundary, boundaryContexts, rootContext);
	    } else {
	      var containers = allContexts.filter(function (candidate) {
	        return candidate !== context;
	      }).filter(function (candidate) {
	        return isSubset(context.memberSet, candidate.memberSet);
	      }).sort(function (left, right) {
	        return left.memberSet.size - right.memberSet.size || right.order - left.order;
	      });
	      context.parent = containers[0] || rootContext;
	    }
	    if (context.parent === context) context.parent = rootContext;
	  });

	  // Heading contexts are ordered ranges within the nearest explicit semantic
	  // container. Native section headings associated with that same boundary are
	  // deliberately merged into the explicit context and skipped here.
	  var containerContexts = [rootContext].concat(_toConsumableArray$2(allContexts.slice(1).filter(function (context) {
	    return context.boundary;
	  })));
	  var headingContexts = [];
	  containerContexts.forEach(function (container) {
	    var boundary = container.boundary;
	    var containerHeadings = headings.filter(function (heading) {
	      if (heading === container.associatedHeading) return false;
	      if (!(0, _domUtilities$2.isComposedWithin)(boundary, heading)) return false;
	      var nearest = nearestContextBoundary((0, _domUtilities$2.getComposedParent)(heading), boundaryContexts, root);
	      return (nearest || rootContext) === container;
	    });
	    if (!containerHeadings.length) return;
	    var scopeOrders = elements.filter(function (element) {
	      return (0, _domUtilities$2.isComposedWithin)(boundary, element);
	    }).map(function (element) {
	      return orderByElement.get(element);
	    });
	    var scopeEnd = scopeOrders.length ? Math.max.apply(Math, _toConsumableArray$2(scopeOrders)) + 1 : elements.length + 1;
	    var stack = [];

	    // A generic authored wrapper does not become a structural context, but it
	    // can still provide a credible end for the headings and targets grouped
	    // inside it. Use the nearest ancestor below the semantic container that
	    // contains a following target outside the heading itself. This prevents a
	    // final heading range from absorbing later sibling content merely because
	    // no same-or-higher heading follows it.
	    var hasFollowingContextBranchBeforeTarget = function hasFollowingContextBranchBeforeTarget(element) {
	      var parent = (0, _domUtilities$2.getComposedParent)(element);
	      var siblings = (0, _domUtilities$2.getComposedChildren)(parent).filter(_domUtilities$2.isElement);
	      var index = siblings.indexOf(element);
	      if (index < 0) return false;
	      var _iterator3 = _createForOfIteratorHelper$1(siblings.slice(index + 1)),
	        _step3;
	      try {
	        var _loop = function _loop() {
	            var sibling = _step3.value;
	            if ((0, _domUtilities$2.isOpenKeyNavGeneratedUI)(sibling) || isSemanticallyHidden(sibling, root)) {
	              return 0; // continue
	            }
	            if (beginsContextBranch(sibling)) return {
	              v: true
	            };
	            if (liveTargets.some(function (target) {
	              return (0, _domUtilities$2.isComposedWithin)(sibling, target);
	            })) {
	              return {
	                v: false
	              };
	            }
	          },
	          _ret;
	        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	          _ret = _loop();
	          if (_ret === 0) continue;
	          if (_ret) return _ret.v;
	        }
	      } catch (err) {
	        _iterator3.e(err);
	      } finally {
	        _iterator3.f();
	      }
	      return false;
	    };
	    var beginsContextBranch = function beginsContextBranch(element) {
	      return headings.some(function (heading) {
	        return (0, _domUtilities$2.isComposedWithin)(element, heading);
	      }) || Array.from(boundaryContexts.keys()).some(function (contextBoundary) {
	        return (0, _domUtilities$2.isComposedWithin)(element, contextBoundary);
	      });
	    };
	    var rangeBoundaryForHeading = function rangeBoundaryForHeading(heading) {
	      var headingOrder = orderByElement.get(heading);
	      var candidate = (0, _domUtilities$2.getComposedParent)(heading);
	      while (candidate && candidate !== boundary) {
	        if (hasFollowingContextBranchBeforeTarget(candidate)) {
	          return candidate;
	        }
	        if ((0, _domUtilities$2.isElement)(candidate) && liveTargets.some(function (target) {
	          return container.memberSet.has(target) && !isSemanticallyHidden(target, root) && !(0, _domUtilities$2.isComposedWithin)(heading, target) && (0, _domUtilities$2.isComposedWithin)(candidate, target) && targetOrder(target) > headingOrder;
	        })) {
	          return candidate;
	        }
	        candidate = (0, _domUtilities$2.getComposedParent)(candidate);
	      }
	      return boundary;
	    };
	    var rangeEndForBoundary = function rangeEndForBoundary(rangeBoundary) {
	      var rangeOrders = elements.filter(function (element) {
	        return (0, _domUtilities$2.isComposedWithin)(rangeBoundary, element);
	      }).map(function (element) {
	        return orderByElement.get(element);
	      });
	      return rangeOrders.length ? Math.max.apply(Math, _toConsumableArray$2(rangeOrders)) + 1 : scopeEnd;
	    };
	    var closeHeadingContext = function closeHeadingContext(closing, requestedEnd) {
	      var context = closing.context;
	      context.rangeEnd = Math.min(closing.scopeEnd, requestedEnd);
	      context.memberTargets = liveTargets.filter(function (target) {
	        var ownedHeadings = ownedHeadingsByTarget.get(target);
	        return (ownedHeadings ? ownedHeadings.has(context.boundary) : targetOrder(target) >= context.rangeStart && targetOrder(target) < context.rangeEnd) && container.memberSet.has(target) && !isSemanticallyHidden(target, root) && (0, _domUtilities$2.isComposedWithin)(context.rangeBoundary, target);
	      });
	      context.memberSet = new Set(context.memberTargets);
	    };
	    var rangeEndBeforeHeading = function rangeEndBeforeHeading(closing, heading, headingOrder) {
	      var rangeBoundary = closing.context.rangeBoundary;
	      var branch = heading;
	      var parent = (0, _domUtilities$2.getComposedParent)(branch);
	      while (parent && parent !== rangeBoundary) {
	        branch = parent;
	        parent = (0, _domUtilities$2.getComposedParent)(branch);
	      }
	      if (parent !== rangeBoundary) return headingOrder;
	      var branchOrder = orderByElement.get(branch);
	      return Number.isFinite(branchOrder) && branchOrder > closing.context.rangeStart ? branchOrder : headingOrder;
	    };
	    containerHeadings.forEach(function (heading) {
	      var level = headingRank(heading);
	      var start = orderByElement.get(heading);
	      while (stack.length && stack[stack.length - 1].scopeEnd <= start) {
	        var closing = stack.pop();
	        closeHeadingContext(closing, closing.scopeEnd);
	      }
	      while (stack.length && stack[stack.length - 1].level >= level) {
	        var _closing = stack.pop();
	        closeHeadingContext(_closing, rangeEndBeforeHeading(_closing, heading, start));
	      }
	      var rangeBoundary = rangeBoundaryForHeading(heading);
	      var headingScopeEnd = rangeEndForBoundary(rangeBoundary);
	      var context = makeContext({
	        id: stableBoundaryId(heading, 'heading'),
	        name: heading.textContent.replace(/\s+/g, ' ').trim() || "Heading level ".concat(level),
	        type: 'heading',
	        source: 'heading',
	        boundary: heading,
	        order: start,
	        memberTargets: [],
	        parentHint: stack.length ? stack[stack.length - 1].context : container,
	        rangeStart: start,
	        rangeEnd: headingScopeEnd,
	        rangeBoundary: rangeBoundary,
	        containerContext: container,
	        headingLevel: level
	      });
	      headingContexts.push(context);
	      stack.push({
	        level: level,
	        context: context,
	        scopeEnd: headingScopeEnd
	      });
	    });
	    while (stack.length) {
	      var closing = stack.pop();
	      closeHeadingContext(closing, closing.scopeEnd);
	    }
	  });

	  // Preserve the authored visual range for heading-only contexts. The
	  // controller uses this to draw one context indicator around the heading and
	  // all of its content without turning any of those elements into focus stops.
	  headingContexts.forEach(function (context) {
	    var rangeElements = elements.filter(function (element) {
	      var order = orderByElement.get(element);
	      return order >= context.rangeStart && order < context.rangeEnd && !isSemanticallyHidden(element, root) && (0, _domUtilities$2.isComposedWithin)(context.rangeBoundary, element);
	    });
	    var singleHeadingOwners = context.memberTargets.filter(function (target) {
	      var ownedHeadings = ownedHeadingsByTarget.get(target);
	      return (ownedHeadings === null || ownedHeadings === void 0 ? void 0 : ownedHeadings.size) === 1 && ownedHeadings.has(context.boundary);
	    });
	    context.visualElements = Array.from(new Set([].concat(_toConsumableArray$2(rangeElements), _toConsumableArray$2(singleHeadingOwners))));
	  });
	  headingContexts.filter(function (context) {
	    return context.memberTargets.length;
	  }).forEach(function (context) {
	    return allContexts.push(context);
	  });

	  // Lists remain a single context when every nonempty item has exactly one
	  // target. Richer lists receive item child contexts.
	  var listItemContexts = [];
	  automaticContexts.filter(function (context) {
	    return context.type === 'list';
	  }).forEach(function (listContext) {
	    var listItems = elements.filter(function (element) {
	      var tagName = element.tagName.toLowerCase();
	      var role = (element.getAttribute('role') || '').toLowerCase();
	      if (SUPPRESSED_ROLES.has(role)) return false;
	      if (role !== 'listitem' && (tagName !== 'li' || Boolean(role))) {
	        return false;
	      }
	      var current = (0, _domUtilities$2.getComposedParent)(element);
	      while (current) {
	        var currentContext = boundaryContexts.get(current);
	        if ((currentContext === null || currentContext === void 0 ? void 0 : currentContext.type) === 'list') return currentContext === listContext;
	        current = (0, _domUtilities$2.getComposedParent)(current);
	      }
	      return false;
	    });
	    var items = listItems.map(function (element, index) {
	      return {
	        element: element,
	        index: index,
	        targets: liveTargets.filter(function (target) {
	          return (0, _domUtilities$2.isComposedWithin)(element, target);
	        })
	      };
	    }).filter(function (item) {
	      return item.targets.length;
	    });
	    var hasRichItem = items.some(function (item) {
	      if (item.targets.length > 1) return true;
	      return allContexts.some(function (context) {
	        return context !== listContext && context.boundary && (0, _domUtilities$2.isComposedWithin)(item.element, context.boundary) && context.memberTargets.length;
	      });
	    });
	    if (items.length < 2 || !hasRichItem) return;
	    items.forEach(function (item) {
	      var text = item.element.textContent.replace(/\s+/g, ' ').trim();
	      listItemContexts.push(makeContext({
	        id: stableBoundaryId(item.element, 'list-item'),
	        name: text.slice(0, 60) || "Item ".concat(item.index + 1),
	        type: 'listitem',
	        source: 'list-item',
	        boundary: item.element,
	        order: orderByElement.get(item.element),
	        memberTargets: item.targets,
	        parentHint: listContext
	      }));
	    });
	  });
	  listItemContexts.forEach(function (context) {
	    return allContexts.push(context);
	  });

	  // Put explicit child boundaries into the applicable heading range and rich
	  // list-item context. These are range/containment parents, not focus stops.
	  var rangeParents = [].concat(_toConsumableArray$2(headingContexts.filter(function (context) {
	    return context.memberTargets.length;
	  })), listItemContexts);
	  allContexts.slice(1).forEach(function (context) {
	    if (rangeParents.includes(context)) return;
	    var candidates = rangeParents.filter(function (parent) {
	      return parent !== context;
	    }).filter(function (parent) {
	      if (parent.source === 'heading') {
	        var boundaryOrder = context.boundary ? orderByElement.get(context.boundary) : context.order;
	        return boundaryOrder >= parent.rangeStart && boundaryOrder < parent.rangeEnd && isSubset(context.memberSet, parent.memberSet);
	      }
	      return context.boundary && (0, _domUtilities$2.isComposedWithin)(parent.boundary, context.boundary) && isSubset(context.memberSet, parent.memberSet);
	    }).sort(function (left, right) {
	      return left.memberSet.size - right.memberSet.size || left.rangeEnd - left.rangeStart - (right.rangeEnd - right.rangeStart);
	    });
	    var selected = candidates[0];
	    if (selected && selected !== context.parent && !isContextAncestor(context, selected)) {
	      context.parent = selected;
	    }
	  });
	  var usableContexts = [rootContext];
	  var rejectedContexts = [];
	  var orderedCandidates = allContexts.slice(1).filter(function (context) {
	    return context.memberTargets.length;
	  }).sort(function (left, right) {
	    return Number(right.required) - Number(left.required) || Number(Boolean(right.boundary)) - Number(Boolean(left.boundary)) || left.order - right.order;
	  });

	  // Reject partial sibling overlap instead of forcing it into the structural
	  // tree. Typed contexts are the supported representation for such relations.
	  orderedCandidates.forEach(function (context) {
	    if (!context.parent || context.parent === context) context.parent = rootContext;
	    var siblings = usableContexts.filter(function (candidate) {
	      return candidate.parent === context.parent;
	    });
	    var invalidOverlap = siblings.some(function (sibling) {
	      return setsOverlap(context.memberSet, sibling.memberSet) && !isSubset(context.memberSet, sibling.memberSet) && !isSubset(sibling.memberSet, context.memberSet);
	    });
	    if (invalidOverlap) {
	      rejectedContexts.push(context);
	      return;
	    }
	    usableContexts.push(context);
	  });
	  usableContexts.forEach(function (context) {
	    context.children = [];
	    context.directTargets = [];
	    context.targets = [];
	  });
	  usableContexts.slice(1).forEach(function (context) {
	    if (!usableContexts.includes(context.parent)) context.parent = rootContext;
	    context.parent.children.push(context);
	  });
	  usableContexts.forEach(function (context) {
	    context.children.sort(function (left, right) {
	      return left.order - right.order;
	    });
	  });

	  // Collapse a redundant unary child when it represents exactly the same
	  // target sequence as its parent. Required application contexts are retained.
	  // Repeat bottom-up because collapsing one layer can expose another.
	  var collapsedContext = true;
	  while (collapsedContext) {
	    collapsedContext = false;
	    var bottomUp = usableContexts.slice(1).sort(function (left, right) {
	      if (isContextAncestor(left, right)) return 1;
	      if (isContextAncestor(right, left)) return -1;
	      return right.order - left.order;
	    });
	    var _iterator4 = _createForOfIteratorHelper$1(bottomUp),
	      _step4;
	    try {
	      var _loop2 = function _loop2() {
	          var _parent$children;
	          var context = _step4.value;
	          var parent = context.parent;
	          if (context.required || context.headingLevel !== null || !parent || parent.children.length !== 1 || !setsEqual(context.memberSet, parent.memberSet)) {
	            return 0; // continue
	          }
	          var childIndex = parent.children.indexOf(context);
	          context.children.forEach(function (child) {
	            child.parent = parent;
	          });
	          (_parent$children = parent.children).splice.apply(_parent$children, [childIndex, 1].concat(_toConsumableArray$2(context.children)));
	          parent.children.sort(function (left, right) {
	            return left.order - right.order;
	          });
	          usableContexts.splice(usableContexts.indexOf(context), 1);
	          collapsedContext = true;
	          return 1; // break
	        },
	        _ret2;
	      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
	        _ret2 = _loop2();
	        if (_ret2 === 0) continue;
	        if (_ret2 === 1) break;
	      }
	    } catch (err) {
	      _iterator4.e(err);
	    } finally {
	      _iterator4.f();
	    }
	  }
	  var _deepestContextForTarget = function deepestContextForTarget(context, target) {
	    var children = context.children.filter(function (child) {
	      return child.memberSet.has(target);
	    });
	    if (!children.length) return context;
	    children.sort(function (left, right) {
	      return left.memberSet.size - right.memberSet.size || left.order - right.order;
	    });
	    return _deepestContextForTarget(children[0], target);
	  };
	  var directContextByTarget = new Map();
	  liveTargets.forEach(function (target) {
	    var _ownedHeadingsByTarge;
	    var primaryOwnedHeading = ownedHeadingByTarget.get(target);
	    var ownsMultipleHeadings = ((_ownedHeadingsByTarge = ownedHeadingsByTarget.get(target)) === null || _ownedHeadingsByTarge === void 0 ? void 0 : _ownedHeadingsByTarge.size) > 1;
	    var primaryOwnedHeadingContext = ownsMultipleHeadings && primaryOwnedHeading ? usableContexts.find(function (context) {
	      return context.boundary === primaryOwnedHeading;
	    }) : null;
	    var direct = primaryOwnedHeadingContext || _deepestContextForTarget(rootContext, target);
	    directContextByTarget.set(target, direct);
	    direct.directTargets.push(target);
	  });
	  usableContexts.forEach(function (context) {
	    context.targets = liveTargets.filter(function (target) {
	      var _ownedHeadingsByTarge2;
	      return isContextAncestor(context, directContextByTarget.get(target)) || context.source === 'heading' && ((_ownedHeadingsByTarge2 = ownedHeadingsByTarget.get(target)) === null || _ownedHeadingsByTarge2 === void 0 ? void 0 : _ownedHeadingsByTarge2.size) > 1 && ownedHeadingsByTarget.get(target).has(context.boundary);
	    });
	  });
	  var contexts = new Map(usableContexts.map(function (context) {
	    return [context.id, context];
	  }));
	  var normalizedTyped = normalizeTypedContexts(typedContexts, details, liveTargets);
	  var typedContextMap = new Map(normalizedTyped.map(function (context) {
	    return [context.id, context];
	  }));
	  var typedContextsByTarget = new Map();
	  liveTargets.forEach(function (target) {
	    typedContextsByTarget.set(target, normalizedTyped.filter(function (context) {
	      return context.targets.includes(target);
	    }));
	  });

	  // Keep heading commands grounded in the same authored ranges as Structural
	  // Navigation. The routes include empty headings so callers can deliberately
	  // skip them without ever turning a heading into a synthetic focus target.
	  var headingRoutes = headings.map(function (heading) {
	    var headingContext = headingContexts.find(function (context) {
	      return context.boundary === heading;
	    });
	    var associatedContext = allContexts.find(function (context) {
	      return context.associatedHeading === heading;
	    });
	    var context = headingContext || associatedContext || null;
	    var memberSet = (context === null || context === void 0 ? void 0 : context.memberSet) || new Set();
	    return {
	      heading: heading,
	      level: headingRank(heading),
	      targets: liveTargets.filter(function (target) {
	        return memberSet.has(target);
	      })
	    };
	  });
	  return {
	    root: root,
	    targets: liveTargets,
	    rootContext: rootContext,
	    contexts: contexts,
	    directContextByTarget: directContextByTarget,
	    typedContexts: typedContextMap,
	    typedContextsByTarget: typedContextsByTarget,
	    headingRoutes: headingRoutes,
	    rejectedContexts: rejectedContexts,
	    getDirectContext: function getDirectContext(target) {
	      return directContextByTarget.get(target) || null;
	    },
	    getTypedContexts: function getTypedContexts(target) {
	      return typedContextsByTarget.get(target) || [];
	    }
	  };
	};

	var tabbableTargets = {};

	/*!
	* tabbable 6.5.0
	* @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
	*/
	// NOTE: separate `:not()` selectors has broader browser support than the newer
	//  `:not([inert], [inert] *)` (Feb 2023)
	var candidateSelectors = ['input:not([inert]):not([inert] *)', 'select:not([inert]):not([inert] *)', 'textarea:not([inert]):not([inert] *)', 'a[href]:not([inert]):not([inert] *)', 'area[href]:not([inert]):not([inert] *)', 'button:not([inert]):not([inert] *)', '[tabindex]:not(slot):not([inert]):not([inert] *)', 'audio[controls]:not([inert]):not([inert] *)', 'video[controls]:not([inert]):not([inert] *)', '[contenteditable]:not([contenteditable="false"]):not([inert]):not([inert] *)', 'details>summary:first-of-type:not([inert]):not([inert] *)', 'details:not([inert]):not([inert] *)'];
	var candidateSelector = /* #__PURE__ */candidateSelectors.join(',');
	var NoElement = typeof Element === 'undefined';
	var matches = NoElement ? function () {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
	var getRootNode = !NoElement && Element.prototype.getRootNode ? function (element) {
	  var _element$getRootNode;
	  return element === null || element === void 0 ? void 0 : (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
	} : function (element) {
	  return element === null || element === void 0 ? void 0 : element.ownerDocument;
	};

	/**
	 * Determines if a node is inert or in an inert ancestor.
	 * @param {Node} [node]
	 * @param {boolean} [lookUp] If true and `node` is not inert, looks up at ancestors to
	 *  see if any of them are inert. If false, only `node` itself is considered.
	 * @returns {boolean} True if inert itself or by way of being in an inert ancestor.
	 *  False if `node` is falsy.
	 */
	var _isInert = function isInert(node, lookUp) {
	  var _node$getAttribute;
	  if (lookUp === void 0) {
	    lookUp = true;
	  }
	  // CAREFUL: JSDom does not support inert at all, so we can't use the `HTMLElement.inert`
	  //  JS API property; we have to check the attribute, which can either be empty or 'true';
	  //  if it's `null` (not specified) or 'false', it's an active element
	  var inertAtt = node === null || node === void 0 ? void 0 : (_node$getAttribute = node.getAttribute) === null || _node$getAttribute === void 0 ? void 0 : _node$getAttribute.call(node, 'inert');
	  var inert = inertAtt === '' || inertAtt === 'true';

	  // NOTE: this could also be handled with `node.matches('[inert], :is([inert] *)')`
	  //  if it weren't for `matches()` not being a function on shadow roots; the following
	  //  code works for any kind of node
	  var result = inert || lookUp && node && (
	  // closest does not exist on shadow roots, so we fall back to a manual
	  // lookup upward, in case it is not defined.
	  typeof node.closest === 'function' ? node.closest('[inert]') : _isInert(node.parentNode));
	  return result;
	};

	/**
	 * Determines if a node's content is editable.
	 * @param {Element} [node]
	 * @returns True if it's content-editable; false if it's not or `node` is falsy.
	 */
	var isContentEditable = function isContentEditable(node) {
	  var _node$getAttribute2;
	  // CAREFUL: JSDom does not support the `HTMLElement.isContentEditable` API so we have
	  //  to use the attribute directly to check for this, which can either be empty or 'true';
	  //  if it's `null` (not specified) or 'false', it's a non-editable element
	  var attValue = node === null || node === void 0 ? void 0 : (_node$getAttribute2 = node.getAttribute) === null || _node$getAttribute2 === void 0 ? void 0 : _node$getAttribute2.call(node, 'contenteditable');
	  return attValue === '' || attValue === 'true';
	};

	/**
	 * @param {Element} el container to check in
	 * @param {boolean} includeContainer add container to check
	 * @param {(node: Element) => boolean} filter filter candidates
	 * @returns {Element[]}
	 */
	var getCandidates = function getCandidates(el, includeContainer, filter) {
	  // even if `includeContainer=false`, we still have to check it for inertness because
	  //  if it's inert (either by itself or via its parent), then all its children are inert
	  if (_isInert(el)) {
	    return [];
	  }
	  var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
	  if (includeContainer && matches.call(el, candidateSelector)) {
	    candidates.unshift(el);
	  }
	  candidates = candidates.filter(filter);
	  return candidates;
	};

	/**
	 * @callback GetShadowRoot
	 * @param {Element} element to check for shadow root
	 * @returns {ShadowRoot|boolean} ShadowRoot if available or boolean indicating if a shadowRoot is attached but not available.
	 */

	/**
	 * @callback ShadowRootFilter
	 * @param {Element} shadowHostNode the element which contains shadow content
	 * @returns {boolean} true if a shadow root could potentially contain valid candidates.
	 */

	/**
	 * @typedef {Object} CandidateScope
	 * @property {Element} scopeParent contains inner candidates
	 * @property {Element[]} candidates list of candidates found in the scope parent
	 */

	/**
	 * @typedef {Object} IterativeOptions
	 * @property {GetShadowRoot|boolean} getShadowRoot true if shadow support is enabled; falsy if not;
	 *  if a function, implies shadow support is enabled and either returns the shadow root of an element
	 *  or a boolean stating if it has an undisclosed shadow root
	 * @property {(node: Element) => boolean} filter filter candidates
	 * @property {boolean} flatten if true then result will flatten any CandidateScope into the returned list
	 * @property {ShadowRootFilter} shadowRootFilter filter shadow roots;
	 */

	/**
	 * @param {Element[]} elements list of element containers to match candidates from
	 * @param {boolean} includeContainer add container list to check
	 * @param {IterativeOptions} options
	 * @returns {Array.<Element|CandidateScope>}
	 */
	var _getCandidatesIteratively = function getCandidatesIteratively(elements, includeContainer, options) {
	  var candidates = [];
	  var elementsToCheck = Array.from(elements);
	  while (elementsToCheck.length) {
	    var element = elementsToCheck.shift();
	    if (_isInert(element, false)) {
	      // no need to look up since we're drilling down
	      // anything inside this container will also be inert
	      continue;
	    }
	    if (element.tagName === 'SLOT') {
	      // add shadow dom slot scope (slot itself cannot be focusable)
	      var assigned = element.assignedElements();
	      var content = assigned.length ? assigned : element.children;
	      var nestedCandidates = _getCandidatesIteratively(content, true, options);
	      if (options.flatten) {
	        candidates.push.apply(candidates, nestedCandidates);
	      } else {
	        candidates.push({
	          scopeParent: element,
	          candidates: nestedCandidates
	        });
	      }
	    } else {
	      // check candidate element
	      var validCandidate = matches.call(element, candidateSelector);
	      if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
	        candidates.push(element);
	      }

	      // iterate over shadow content if possible
	      var shadowRoot = element.shadowRoot ||
	      // check for an undisclosed shadow
	      typeof options.getShadowRoot === 'function' && options.getShadowRoot(element);

	      // no inert look up because we're already drilling down and checking for inertness
	      //  on the way down, so all containers to this root node should have already been
	      //  vetted as non-inert
	      var validShadowRoot = !_isInert(shadowRoot, false) && (!options.shadowRootFilter || options.shadowRootFilter(element));
	      if (shadowRoot && validShadowRoot) {
	        // add shadow dom scope IIF a shadow root node was given; otherwise, an undisclosed
	        //  shadow exists, so look at light dom children as fallback BUT create a scope for any
	        //  child candidates found because they're likely slotted elements (elements that are
	        //  children of the web component element (which has the shadow), in the light dom, but
	        //  slotted somewhere _inside_ the undisclosed shadow) -- the scope is created below,
	        //  _after_ we return from this recursive call
	        var _nestedCandidates = _getCandidatesIteratively(shadowRoot === true ? element.children : shadowRoot.children, true, options);
	        if (options.flatten) {
	          candidates.push.apply(candidates, _nestedCandidates);
	        } else {
	          candidates.push({
	            scopeParent: element,
	            candidates: _nestedCandidates
	          });
	        }
	      } else {
	        // there's not shadow so just dig into the element's (light dom) children
	        //  __without__ giving the element special scope treatment
	        elementsToCheck.unshift.apply(elementsToCheck, element.children);
	      }
	    }
	  }
	  return candidates;
	};

	/**
	 * @private
	 * Determines if the node has an explicitly specified `tabindex` attribute.
	 * @param {HTMLElement} node
	 * @returns {boolean} True if so; false if not.
	 */
	var hasTabIndex = function hasTabIndex(node) {
	  return !isNaN(parseInt(node.getAttribute('tabindex'), 10));
	};

	/**
	 * Determine the tab index of a given node.
	 * @param {HTMLElement} node
	 * @returns {number} Tab order (negative, 0, or positive number).
	 * @throws {Error} If `node` is falsy.
	 */
	var getTabIndex = function getTabIndex(node) {
	  if (!node) {
	    throw new Error('No node provided');
	  }
	  if (node.tabIndex < 0) {
	    // in Chrome, <details/>, <audio controls/> and <video controls/> elements get a default
	    // `tabIndex` of -1 when the 'tabindex' attribute isn't specified in the DOM,
	    // yet they are still part of the regular tab order; in FF, they get a default
	    // `tabIndex` of 0; since Chrome still puts those elements in the regular tab
	    // order, consider their tab index to be 0.
	    // Also browsers do not return `tabIndex` correctly for contentEditable nodes;
	    // so if they don't have a tabindex attribute specifically set, assume it's 0.
	    if ((/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || isContentEditable(node)) && !hasTabIndex(node)) {
	      return 0;
	    }
	  }
	  return node.tabIndex;
	};

	/**
	 * Determine the tab index of a given node __for sort order purposes__.
	 * @param {HTMLElement} node
	 * @param {boolean} [isScope] True for a custom element with shadow root or slot that, by default,
	 *  has tabIndex -1, but needs to be sorted by document order in order for its content to be
	 *  inserted into the correct sort position.
	 * @returns {number} Tab order (negative, 0, or positive number).
	 */
	var getSortOrderTabIndex = function getSortOrderTabIndex(node, isScope) {
	  var tabIndex = getTabIndex(node);
	  if (tabIndex < 0 && isScope && !hasTabIndex(node)) {
	    return 0;
	  }
	  return tabIndex;
	};
	var sortOrderedTabbables = function sortOrderedTabbables(a, b) {
	  return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
	};
	var isInput = function isInput(node) {
	  return node.tagName === 'INPUT';
	};
	var isHiddenInput = function isHiddenInput(node) {
	  return isInput(node) && node.type === 'hidden';
	};
	var isDetailsWithSummary = function isDetailsWithSummary(node) {
	  var r = node.tagName === 'DETAILS' && Array.prototype.slice.apply(node.children).some(function (child) {
	    return child.tagName === 'SUMMARY';
	  });
	  return r;
	};
	var getCheckedRadio = function getCheckedRadio(nodes, form) {
	  for (var i = 0; i < nodes.length; i++) {
	    if (nodes[i].checked && nodes[i].form === form) {
	      return nodes[i];
	    }
	  }
	};
	var isTabbableRadio = function isTabbableRadio(node) {
	  if (!node.name) {
	    return true;
	  }
	  var radioScope = node.form || getRootNode(node);
	  var queryRadios = function queryRadios(name) {
	    return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
	  };
	  var radioSet;
	  if (typeof window !== 'undefined' && typeof window.CSS !== 'undefined' && typeof window.CSS.escape === 'function') {
	    radioSet = queryRadios(window.CSS.escape(node.name));
	  } else {
	    try {
	      radioSet = queryRadios(node.name);
	    } catch (err) {
	      // eslint-disable-next-line no-console
	      console.error('Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s', err.message);
	      return false;
	    }
	  }
	  var checked = getCheckedRadio(radioSet, node.form);
	  return !checked || checked === node;
	};
	var isRadio = function isRadio(node) {
	  return isInput(node) && node.type === 'radio';
	};
	var isNonTabbableRadio = function isNonTabbableRadio(node) {
	  return isRadio(node) && !isTabbableRadio(node);
	};

	// determines if a node is ultimately attached to the window's document
	var isNodeAttached = function isNodeAttached(node) {
	  var _nodeRoot;
	  // The root node is the shadow root if the node is in a shadow DOM; some document otherwise
	  //  (but NOT _the_ document; see second 'If' comment below for more).
	  // If rootNode is shadow root, it'll have a host, which is the element to which the shadow
	  //  is attached, and the one we need to check if it's in the document or not (because the
	  //  shadow, and all nodes it contains, is never considered in the document since shadows
	  //  behave like self-contained DOMs; but if the shadow's HOST, which is part of the document,
	  //  is hidden, or is not in the document itself but is detached, it will affect the shadow's
	  //  visibility, including all the nodes it contains). The host could be any normal node,
	  //  or a custom element (i.e. web component). Either way, that's the one that is considered
	  //  part of the document, not the shadow root, nor any of its children (i.e. the node being
	  //  tested).
	  // To further complicate things, we have to look all the way up until we find a shadow HOST
	  //  that is attached (or find none) because the node might be in nested shadows...
	  // If rootNode is not a shadow root, it won't have a host, and so rootNode should be the
	  //  document (per the docs) and while it's a Document-type object, that document does not
	  //  appear to be the same as the node's `ownerDocument` for some reason, so it's safer
	  //  to ignore the rootNode at this point, and use `node.ownerDocument`. Otherwise,
	  //  using `rootNode.contains(node)` will _always_ be true we'll get false-positives when
	  //  node is actually detached.
	  // NOTE: If `nodeRootHost` or `node` happens to be the `document` itself (which is possible
	  //  if a tabbable/focusable node was quickly added to the DOM, focused, and then removed
	  //  from the DOM as in https://github.com/focus-trap/focus-trap-react/issues/905), then
	  //  `ownerDocument` will be `null`, hence the optional chaining on it.
	  var nodeRoot = node && getRootNode(node);
	  var nodeRootHost = (_nodeRoot = nodeRoot) === null || _nodeRoot === void 0 ? void 0 : _nodeRoot.host;

	  // in some cases, a detached node will return itself as the root instead of a document or
	  //  shadow root object, in which case, we shouldn't try to look further up the host chain
	  var attached = false;
	  if (nodeRoot && nodeRoot !== node) {
	    var _nodeRootHost, _nodeRootHost$ownerDo, _node$ownerDocument;
	    attached = !!((_nodeRootHost = nodeRootHost) !== null && _nodeRootHost !== void 0 && (_nodeRootHost$ownerDo = _nodeRootHost.ownerDocument) !== null && _nodeRootHost$ownerDo !== void 0 && _nodeRootHost$ownerDo.contains(nodeRootHost) || node !== null && node !== void 0 && (_node$ownerDocument = node.ownerDocument) !== null && _node$ownerDocument !== void 0 && _node$ownerDocument.contains(node));
	    while (!attached && nodeRootHost) {
	      var _nodeRoot2, _nodeRootHost2, _nodeRootHost2$ownerD;
	      // since it's not attached and we have a root host, the node MUST be in a nested shadow DOM,
	      //  which means we need to get the host's host and check if that parent host is contained
	      //  in (i.e. attached to) the document
	      nodeRoot = getRootNode(nodeRootHost);
	      nodeRootHost = (_nodeRoot2 = nodeRoot) === null || _nodeRoot2 === void 0 ? void 0 : _nodeRoot2.host;
	      attached = !!((_nodeRootHost2 = nodeRootHost) !== null && _nodeRootHost2 !== void 0 && (_nodeRootHost2$ownerD = _nodeRootHost2.ownerDocument) !== null && _nodeRootHost2$ownerD !== void 0 && _nodeRootHost2$ownerD.contains(nodeRootHost));
	    }
	  }
	  return attached;
	};
	var isZeroArea = function isZeroArea(node) {
	  var _node$getBoundingClie = node.getBoundingClientRect(),
	    width = _node$getBoundingClie.width,
	    height = _node$getBoundingClie.height;
	  return width === 0 && height === 0;
	};
	var isHidden = function isHidden(node, _ref) {
	  var displayCheck = _ref.displayCheck,
	    getShadowRoot = _ref.getShadowRoot;
	  if (displayCheck === 'full-native') {
	    if ('checkVisibility' in node) {
	      // Chrome >= 105, Edge >= 105, Firefox >= 106, Safari >= 17.4
	      // @see https://developer.mozilla.org/en-US/docs/Web/API/Element/checkVisibility#browser_compatibility
	      var visible = node.checkVisibility({
	        // Checking opacity might be desirable for some use cases, but natively,
	        // opacity zero elements _are_ focusable and tabbable.
	        checkOpacity: false,
	        opacityProperty: false,
	        contentVisibilityAuto: true,
	        visibilityProperty: true,
	        // This is an alias for `visibilityProperty`. Contemporary browsers
	        // support both. However, this alias has wider browser support (Chrome
	        // >= 105 and Firefox >= 106, vs. Chrome >= 121 and Firefox >= 122), so
	        // we include it anyway.
	        checkVisibilityCSS: true
	      });
	      return !visible;
	    }
	    // Fall through to manual visibility checks
	  }

	  // NOTE: visibility will be `undefined` if node is detached from the document
	  //  (see notes about this further down), which means we will consider it visible
	  //  (this is legacy behavior from a very long way back)
	  // NOTE: we check this regardless of `displayCheck="none"` because this is a
	  //  _visibility_ check, not a _display_ check
	  var _getComputedStyle = getComputedStyle(node),
	    visibility = _getComputedStyle.visibility;
	  if (visibility === 'hidden' || visibility === 'collapse') {
	    return true;
	  }
	  var isDirectSummary = matches.call(node, 'details>summary:first-of-type');
	  var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
	  if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
	    return true;
	  }
	  if (!displayCheck || displayCheck === 'full' ||
	  // full-native can run this branch when it falls through in case
	  // Element#checkVisibility is unsupported
	  displayCheck === 'full-native' || displayCheck === 'legacy-full') {
	    if (typeof getShadowRoot === 'function') {
	      // figure out if we should consider the node to be in an undisclosed shadow and use the
	      //  'non-zero-area' fallback
	      var originalNode = node;
	      while (node) {
	        var parentElement = node.parentElement;
	        var rootNode = getRootNode(node);
	        if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true // check if there's an undisclosed shadow
	        ) {
	          // node has an undisclosed shadow which means we can only treat it as a black box, so we
	          //  fall back to a non-zero-area test
	          return isZeroArea(node);
	        } else if (node.assignedSlot) {
	          // iterate up slot
	          node = node.assignedSlot;
	        } else if (!parentElement && rootNode !== node.ownerDocument) {
	          // cross shadow boundary
	          node = rootNode.host;
	        } else {
	          // iterate up normal dom
	          node = parentElement;
	        }
	      }
	      node = originalNode;
	    }
	    // else, `getShadowRoot` might be true, but all that does is enable shadow DOM support
	    //  (i.e. it does not also presume that all nodes might have undisclosed shadows); or
	    //  it might be a falsy value, which means shadow DOM support is disabled

	    // Since we didn't find it sitting in an undisclosed shadow (or shadows are disabled)
	    //  now we can just test to see if it would normally be visible or not, provided it's
	    //  attached to the main document.
	    // NOTE: We must consider case where node is inside a shadow DOM and given directly to
	    //  `isTabbable()` or `isFocusable()` -- regardless of `getShadowRoot` option setting.

	    if (isNodeAttached(node)) {
	      // this works wherever the node is: if there's at least one client rect, it's
	      //  somehow displayed; it also covers the CSS 'display: contents' case where the
	      //  node itself is hidden in place of its contents; and there's no need to search
	      //  up the hierarchy either
	      return !node.getClientRects().length;
	    }

	    // Else, the node isn't attached to the document, which means the `getClientRects()`
	    //  API will __always__ return zero rects (this can happen, for example, if React
	    //  is used to render nodes onto a detached tree, as confirmed in this thread:
	    //  https://github.com/facebook/react/issues/9117#issuecomment-284228870)
	    //
	    // It also means that even window.getComputedStyle(node).display will return `undefined`
	    //  because styles are only computed for nodes that are in the document.
	    //
	    // NOTE: THIS HAS BEEN THE CASE FOR YEARS. It is not new, nor is it caused by tabbable
	    //  somehow. Though it was never stated officially, anyone who has ever used tabbable
	    //  APIs on nodes in detached containers has actually implicitly used tabbable in what
	    //  was later (as of v5.2.0 on Apr 9, 2021) called `displayCheck="none"` mode -- essentially
	    //  considering __everything__ to be visible because of the innability to determine styles.
	    //
	    // v6.0.0: As of this major release, the default 'full' option __no longer treats detached
	    //  nodes as visible with the 'none' fallback.__
	    if (displayCheck !== 'legacy-full') {
	      return true; // hidden
	    }
	    // else, fallback to 'none' mode and consider the node visible
	  } else if (displayCheck === 'non-zero-area') {
	    // NOTE: Even though this tests that the node's client rect is non-zero to determine
	    //  whether it's displayed, and that a detached node will __always__ have a zero-area
	    //  client rect, we don't special-case for whether the node is attached or not. In
	    //  this mode, we do want to consider nodes that have a zero area to be hidden at all
	    //  times, and that includes attached or not.
	    return isZeroArea(node);
	  }

	  // visible, as far as we can tell, or per current `displayCheck=none` mode, we assume
	  //  it's visible
	  return false;
	};

	// form fields (nested) inside a disabled fieldset are not focusable/tabbable
	//  unless they are in the _first_ <legend> element of the top-most disabled
	//  fieldset
	var isDisabledFromFieldset = function isDisabledFromFieldset(node) {
	  if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
	    var parentNode = node.parentElement;
	    // check if `node` is contained in a disabled <fieldset>
	    while (parentNode) {
	      if (parentNode.tagName === 'FIELDSET' && parentNode.disabled) {
	        // look for the first <legend> among the children of the disabled <fieldset>
	        for (var i = 0; i < parentNode.children.length; i++) {
	          var child = parentNode.children.item(i);
	          // when the first <legend> (in document order) is found
	          if (child.tagName === 'LEGEND') {
	            // if its parent <fieldset> is not nested in another disabled <fieldset>,
	            // return whether `node` is a descendant of its first <legend>
	            return matches.call(parentNode, 'fieldset[disabled] *') ? true : !child.contains(node);
	          }
	        }
	        // the disabled <fieldset> containing `node` has no <legend>
	        return true;
	      }
	      parentNode = parentNode.parentElement;
	    }
	  }

	  // else, node's tabbable/focusable state should not be affected by a fieldset's
	  //  enabled/disabled state
	  return false;
	};
	var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable(options, node) {
	  if (node.disabled || isHiddenInput(node) || isHidden(node, options) ||
	  // For a details element with a summary, the summary element gets the focus
	  isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
	    return false;
	  }
	  return true;
	};
	var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable(options, node) {
	  if (isNonTabbableRadio(node) || getTabIndex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
	    return false;
	  }
	  return true;
	};
	var isShadowRootTabbable = function isShadowRootTabbable(shadowHostNode) {
	  var tabIndex = parseInt(shadowHostNode.getAttribute('tabindex'), 10);
	  if (isNaN(tabIndex) || tabIndex >= 0) {
	    return true;
	  }
	  // If a custom element has an explicit negative tabindex,
	  // browsers will not allow tab targeting said element's children.
	  return false;
	};

	/**
	 * @param {Array.<Element|CandidateScope>} candidates
	 * @returns Element[]
	 */
	var _sortByOrder = function sortByOrder(candidates) {
	  var regularTabbables = [];
	  var orderedTabbables = [];
	  candidates.forEach(function (item, i) {
	    var isScope = !!item.scopeParent;
	    var element = isScope ? item.scopeParent : item;
	    var candidateTabindex = getSortOrderTabIndex(element, isScope);
	    var elements = isScope ? _sortByOrder(item.candidates) : element;
	    if (candidateTabindex === 0) {
	      isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
	    } else {
	      orderedTabbables.push({
	        documentOrder: i,
	        tabIndex: candidateTabindex,
	        item: item,
	        isScope: isScope,
	        content: elements
	      });
	    }
	  });
	  return orderedTabbables.sort(sortOrderedTabbables).reduce(function (acc, sortable) {
	    sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
	    return acc;
	  }, []).concat(regularTabbables);
	};
	var tabbable = function tabbable(container, options) {
	  options = options || {};
	  var candidates;
	  if (options.getShadowRoot) {
	    candidates = _getCandidatesIteratively([container], options.includeContainer, {
	      filter: isNodeMatchingSelectorTabbable.bind(null, options),
	      flatten: false,
	      getShadowRoot: options.getShadowRoot,
	      shadowRootFilter: isShadowRootTabbable
	    });
	  } else {
	    candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
	  }
	  return _sortByOrder(candidates);
	};
	var focusable = function focusable(container, options) {
	  options = options || {};
	  var candidates;
	  if (options.getShadowRoot) {
	    candidates = _getCandidatesIteratively([container], options.includeContainer, {
	      filter: isNodeMatchingSelectorFocusable.bind(null, options),
	      flatten: true,
	      getShadowRoot: options.getShadowRoot
	    });
	  } else {
	    candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
	  }
	  return candidates;
	};
	var isTabbable$1 = function isTabbable(node, options) {
	  options = options || {};
	  if (!node) {
	    throw new Error('No node provided');
	  }
	  if (matches.call(node, candidateSelector) === false) {
	    return false;
	  }
	  return isNodeMatchingSelectorTabbable(options, node);
	};
	var focusableCandidateSelector = /* #__PURE__ */candidateSelectors.concat('iframe:not([inert]):not([inert] *)').join(',');
	var isFocusable = function isFocusable(node, options) {
	  options = options || {};
	  if (!node) {
	    throw new Error('No node provided');
	  }
	  if (matches.call(node, focusableCandidateSelector) === false) {
	    return false;
	  }
	  return isNodeMatchingSelectorFocusable(options, node);
	};

	var index_esm = /*#__PURE__*/Object.freeze({
		__proto__: null,
		focusable: focusable,
		getTabIndex: getTabIndex,
		isFocusable: isFocusable,
		isTabbable: isTabbable$1,
		tabbable: tabbable
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(index_esm);

	(function (exports$1) {

	  Object.defineProperty(exports$1, "__esModule", {
	    value: true
	  });
	  Object.defineProperty(exports$1, "OPENKEYNAV_GENERATED_UI_SELECTOR", {
	    enumerable: true,
	    get: function get() {
	      return _domUtilities.OPENKEYNAV_GENERATED_UI_SELECTOR;
	    }
	  });
	  exports$1.discoverTabbableTargets = void 0;
	  Object.defineProperty(exports$1, "getDeepActiveElement", {
	    enumerable: true,
	    get: function get() {
	      return _domUtilities.getDeepActiveElement;
	    }
	  });
	  Object.defineProperty(exports$1, "isOpenKeyNavGeneratedUI", {
	    enumerable: true,
	    get: function get() {
	      return _domUtilities.isOpenKeyNavGeneratedUI;
	    }
	  });
	  var _tabbable = require$$0;
	  var _domUtilities = domUtilities;
	  function _toConsumableArray(r) {
	    return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
	  }
	  function _nonIterableSpread() {
	    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	  }
	  function _unsupportedIterableToArray(r, a) {
	    if (r) {
	      if ("string" == typeof r) return _arrayLikeToArray(r, a);
	      var t = {}.toString.call(r).slice(8, -1);
	      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
	    }
	  }
	  function _iterableToArray(r) {
	    if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
	  }
	  function _arrayWithoutHoles(r) {
	    if (Array.isArray(r)) return _arrayLikeToArray(r);
	  }
	  function _arrayLikeToArray(r, a) {
	    (null == a || a > r.length) && (a = r.length);
	    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	    return n;
	  }
	  var normalizeDiscoveryRoot = function normalizeDiscoveryRoot(root) {
	    if ((0, _domUtilities.isDocument)(root)) {
	      if (!root.documentElement) {
	        throw new TypeError('The discovery document must have a document element.');
	      }
	      return root.documentElement;
	    }
	    if ((0, _domUtilities.isShadowRoot)(root)) return root.host;
	    if ((0, _domUtilities.isElement)(root)) return root;
	    throw new TypeError('discoverTabbableTargets requires an Element, Document, or ShadowRoot.');
	  };
	  var getTabbableOptions = function getTabbableOptions(root, options) {
	    var _options$displayCheck = options.displayCheck,
	      displayCheck = _options$displayCheck === void 0 ? 'full' : _options$displayCheck,
	      _options$getShadowRoo = options.getShadowRoot,
	      getShadowRoot = _options$getShadowRoo === void 0 ? true : _options$getShadowRoo,
	      _options$includeConta = options.includeContainer,
	      includeContainer = _options$includeConta === void 0 ? (0, _domUtilities.isElement)(root) : _options$includeConta;

	    // Tabbable traverses a ShadowRoot through its host. Supplying the exact root
	    // also keeps this boundary usable if a caller was deliberately given a root
	    // that is not available through host.shadowRoot.
	    var shadowRootResolver = (0, _domUtilities.isShadowRoot)(root) ? function (node) {
	      if (node === root.host) return root;
	      if (typeof getShadowRoot === 'function') return getShadowRoot(node);
	      return false;
	    } : getShadowRoot;
	    return {
	      displayCheck: displayCheck,
	      getShadowRoot: shadowRootResolver,
	      includeContainer: includeContainer
	    };
	  };
	  var includeProgrammaticCandidates = function includeProgrammaticCandidates(discoveryRoot, candidates, tabbableOptions) {
	    var focusableCandidates = (0, _tabbable.focusable)(discoveryRoot, tabbableOptions);
	    var positiveTabbables = candidates.filter(function (candidate) {
	      return (0, _tabbable.getTabIndex)(candidate) > 0;
	    });
	    var positiveSet = new Set(positiveTabbables);

	    // Preserve the browser-like positive-tabindex prefix, then use composed source
	    // order for the zero- and negative-tabindex focusable elements. Opting in to
	    // programmatic targets necessarily differs from native Tab order.
	    return [].concat(_toConsumableArray(positiveTabbables), _toConsumableArray(focusableCandidates.filter(function (candidate) {
	      return !positiveSet.has(candidate);
	    })));
	  };

	  /**
	   * Discovers live focus destinations in the active navigation root.
	   *
	   * `displayCheck` defaults to Tabbable's browser-accurate `full` strategy. Tests
	   * running in jsdom should opt into `displayCheck: 'none'` explicitly.
	   */
	  exports$1.discoverTabbableTargets = function discoverTabbableTargets(root) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	    var _options$excludeGener = options.excludeGeneratedUI,
	      excludeGeneratedUI = _options$excludeGener === void 0 ? true : _options$excludeGener,
	      _options$generatedUIS = options.generatedUISelector,
	      generatedUISelector = _options$generatedUIS === void 0 ? _domUtilities.OPENKEYNAV_GENERATED_UI_SELECTOR : _options$generatedUIS,
	      _options$includeProgr = options.includeProgrammatic,
	      includeProgrammatic = _options$includeProgr === void 0 ? false : _options$includeProgr,
	      _options$targetFilter = options.targetFilter,
	      targetFilter = _options$targetFilter === void 0 ? null : _options$targetFilter;
	    if (targetFilter !== null && typeof targetFilter !== 'function') {
	      throw new TypeError('targetFilter must be a function when provided.');
	    }
	    var discoveryRoot = normalizeDiscoveryRoot(root);
	    var tabbableOptions = getTabbableOptions(root, options);
	    var candidates = (0, _tabbable.tabbable)(discoveryRoot, tabbableOptions);
	    if (includeProgrammatic) {
	      candidates = includeProgrammaticCandidates(discoveryRoot, candidates, tabbableOptions);
	    }
	    var seen = new Set();
	    return candidates.filter(function (candidate) {
	      if (seen.has(candidate)) return false;
	      seen.add(candidate);
	      if (!candidate.isConnected || !(0, _domUtilities.isComposedWithin)(root, candidate)) return false;
	      if (excludeGeneratedUI && (0, _domUtilities.isOpenKeyNavGeneratedUI)(candidate, generatedUISelector)) {
	        return false;
	      }
	      if (targetFilter && !targetFilter(candidate)) return false;

	      // A filter is application code and may synchronously detach or relocate a
	      // candidate. Recheck liveness before returning it.
	      return candidate.isConnected && (0, _domUtilities.isComposedWithin)(root, candidate);
	    });
	  };
	})(tabbableTargets);

	Object.defineProperty(focus, "__esModule", {
	  value: true
	});
	focus.focusOnScrollables = focus.focusOnHeadings = void 0;
	var _structuralModel$1 = structuralModel;
	var _tabbableTargets$1 = tabbableTargets;
	focus.focusOnHeadings = function focusOnHeadings(openKeyNav, headings, e) {
	  var _openKeyNav$structura, _openKeyNav$structura2, _openKeyNav$structura3, _openKeyNav$structura4;
	  var targets = (0, _tabbableTargets$1.discoverTabbableTargets)(document, {
	    displayCheck: openKeyNav.config.debug.screenReaderVisible ? 'none' : 'full',
	    getShadowRoot: true,
	    includeProgrammatic: false
	  });
	  var model = (0, _structuralModel$1.buildStructuralModel)({
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
	focus.focusOnScrollables = function focusOnScrollables(openKeyNav, e) {
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

	  // Check for inert attribute (on element or ancestors)
	  if (el.inert) {
	    return false;
	  }

	  // Check if any ancestor has inert attribute
	  var parent = el.parentElement;
	  while (parent) {
	    if (parent.inert) {
	      return false;
	    }
	    parent = parent.parentElement;
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
	  // During a full-page audit we may want to include offscreen elements. The audit
	  // runner can set `openKeyNav._auditIncludeOffscreen = true` to bypass this check.
	  if (!openKeyNav._auditIncludeOffscreen && !inViewport(el)) {
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

	  // Lastly, flag likely pointer actions that do not have a conventional Tab stop.
	  // Keep them in Click Mode so OpenKeyNav can still provide direct keyboard operation.

	  if (tabIndex && parseInt(tabIndex, 10) == -1) {
	    if (isTypicallyClickableElement(el)) {
	      // if (openKeyNav.config.modes.clicking.value) {
	      openKeyNav.flagAsInaccessible(el, "\n            <h2>Keyboard Focus Review</h2>\n            <h3>Detected</h3>\n            <p>This action uses <code>tabindex=\"-1\"</code>, so sequential keyboard navigation does not reach it.</p>\n            <p>OpenKeyNav Click Mode can still label and activate this target directly.</p>\n            <h3>Review</h3>\n            <p>Confirm the target's semantics, accessible name, focus behavior, and every keyboard path through the complete workflow.</p>\n            <p>When this action should participate in sequential focus navigation, use the appropriate native control or a <code>tabindex</code> value of <code>0</code>.</p>\n            ", "keyboard");
	      // }
	    }

	    // return false; // let's keep it, since we are flagging it
	  }

	  // Skip if the element is an <a> without an href (unless it has an ARIA role that makes it tabbable)

	  var role = el.getAttribute('role');
	  switch (el.tagName.toLowerCase()) {
	    case 'a':
	      if (!el.hasAttribute('href') || el.getAttribute('href') === '') {
	        if (!interactiveRoles.includes(role)) {
	          // if (openKeyNav.config.modes.clicking.value) {
	          openKeyNav.flagAsInaccessible(el, "\n                <h2>Anchor Interaction Review</h2>\n                <h3>Detected</h3>\n                <p>This anchor has no link destination or interactive role, so browsers do not expose it as a conventional keyboard control.</p>\n                <p>OpenKeyNav Click Mode can still label and activate this target directly.</p>\n                <h3>Review</h3>\n                <p>Use an anchor with a non-empty <code>href</code> for navigation. Use a native <code>&lt;button&gt;</code> for an action, or implement the complete semantics and keyboard behavior of the intended control.</p>\n                ", "keyboard");
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
	          openKeyNav.flagAsInaccessible(el, "\n              <!--\n                !el(a,button,textarea,select,input,iframe,summary)\n                !el[role('button', 'link', 'menuitem', 'option', 'tab', 'treeitem', 'checkbox', 'radio')]\n                fromClickEvents\n              -->\n              <h2>Pointer Action Review</h2>\n              <h3>Detected</h3>\n              <p>This element has a click handler without a conventional keyboard focus stop.</p>\n              <p>OpenKeyNav Click Mode can provide direct keyboard selection when it detects the target.</p>\n              <h3>Review options</h3>\n              <ol>\n                <li>\n                  <p>For navigation, use an anchor link (&lt;a&gt;) with a non-empty <em>href</em> attribute.</p>\n                </li>\n                <li>\n                  <p>For an action, use a native &lt;button&gt; or implement the complete semantics, focus behavior, and keyboard commands of the intended control.</p>\n                </li>\n                <li>\n                  <p>Remove click handlers that do not provide user-facing functionality.</p>\n                </li>\n              </ol>\n              ", "keyboard");
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
	keylabels.showMoveableFromOverlays = keylabels.showClickableOverlays = keylabels.showAssignedKeylabels = keylabels.repositionAssignedKeylabels = keylabels.generateValidKeyChars = keylabels.generateLabels = keylabels.filterRemainingOverlays = keylabels.clearAssignedKeylabels = keylabels.KEYLABEL_SYMBOLS = void 0;
	var _escape = _escape$1;
	var _isTabbable = isTabbable;
	var _scrolling = scrolling;
	function _typeof$3(o) {
	  "@babel/helpers - typeof";

	  return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, _typeof$3(o);
	}
	function _toConsumableArray$1(r) {
	  return _arrayWithoutHoles$1(r) || _iterableToArray$1(r) || _unsupportedIterableToArray$2(r) || _nonIterableSpread$1();
	}
	function _nonIterableSpread$1() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _iterableToArray$1(r) {
	  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
	}
	function _arrayWithoutHoles$1(r) {
	  if (Array.isArray(r)) return _arrayLikeToArray$2(r);
	}
	function _slicedToArray$2(r, e) {
	  return _arrayWithHoles$2(r) || _iterableToArrayLimit$2(r, e) || _unsupportedIterableToArray$2(r, e) || _nonIterableRest$2();
	}
	function _nonIterableRest$2() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _unsupportedIterableToArray$2(r, a) {
	  if (r) {
	    if ("string" == typeof r) return _arrayLikeToArray$2(r, a);
	    var t = {}.toString.call(r).slice(8, -1);
	    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$2(r, a) : void 0;
	  }
	}
	function _arrayLikeToArray$2(r, a) {
	  (null == a || a > r.length) && (a = r.length);
	  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	  return n;
	}
	function _iterableToArrayLimit$2(r, l) {
	  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	  if (null != t) {
	    var e,
	      n,
	      i,
	      u,
	      a = [],
	      f = true,
	      o = false;
	    try {
	      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
	    } catch (r) {
	      o = true, n = r;
	    } finally {
	      try {
	        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
	      } finally {
	        if (o) throw n;
	      }
	    }
	    return a;
	  }
	}
	function _arrayWithHoles$2(r) {
	  if (Array.isArray(r)) return r;
	}
	function _defineProperty$1(e, r, t) {
	  return (r = _toPropertyKey$2(r)) in e ? Object.defineProperty(e, r, {
	    value: t,
	    enumerable: true,
	    configurable: true,
	    writable: true
	  }) : e[r] = t, e;
	}
	function _toPropertyKey$2(t) {
	  var i = _toPrimitive$2(t, "string");
	  return "symbol" == _typeof$3(i) ? i : i + "";
	}
	function _toPrimitive$2(t, r) {
	  if ("object" != _typeof$3(t) || !t) return t;
	  var e = t[Symbol.toPrimitive];
	  if (void 0 !== e) {
	    var i = e.call(t, r);
	    if ("object" != _typeof$3(i)) return i;
	    throw new TypeError("@@toPrimitive must return a primitive value.");
	  }
	  return ("string" === r ? String : Number)(t);
	}
	var KEYLABEL_SYMBOLS = keylabels.KEYLABEL_SYMBOLS = Object.freeze({
	  alt: '⌥',
	  control: '⌃',
	  meta: '⌘',
	  shift: '⇧',
	  tab: '⇥',
	  left: '←',
	  right: '→',
	  up: '↑',
	  down: '↓',
	  horizontalAxis: '↔',
	  verticalAxis: '↕',
	  enter: '↵',
	  space: '⎵'
	});
	var assignedTargetByOverlay = new WeakMap();
	var assignedTargetsByOwner = new WeakMap();
	var assignedModifierFeedbackByOpenKeyNav = new WeakMap();
	var ASSIGNED_KEYLABEL_TARGET_ATTRIBUTE = 'data-openkeynav-keylabel-target-active';
	var ASSIGNED_MODIFIER_BY_SYMBOL = Object.freeze(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1({}, KEYLABEL_SYMBOLS.alt, 'alt'), KEYLABEL_SYMBOLS.control, 'control'), KEYLABEL_SYMBOLS.meta, 'meta'), KEYLABEL_SYMBOLS.shift, 'shift'));
	var ASSIGNED_MODIFIER_EVENT_PROPERTIES = Object.freeze({
	  alt: 'altKey',
	  control: 'ctrlKey',
	  meta: 'metaKey',
	  shift: 'shiftKey'
	});
	var ASSIGNED_MODIFIER_BY_EVENT_KEY = Object.freeze({
	  Alt: 'alt',
	  Control: 'control',
	  Meta: 'meta',
	  Shift: 'shift'
	});
	var ownerDocument = function ownerDocument(openKeyNav) {
	  var _openKeyNav$statusSer;
	  return (openKeyNav === null || openKeyNav === void 0 || (_openKeyNav$statusSer = openKeyNav.statusService) === null || _openKeyNav$statusSer === void 0 ? void 0 : _openKeyNav$statusSer.document) || (typeof document === 'undefined' ? null : document);
	};
	var assignedModifierSymbols = function assignedModifierSymbols(openKeyNav) {
	  var modifier = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	  var documentObject = ownerDocument(openKeyNav);
	  if (!(documentObject !== null && documentObject !== void 0 && documentObject.querySelectorAll)) return [];
	  var symbols = Array.from(documentObject.querySelectorAll('.openKeyNav-label[data-openkeynav-keylabel-owner] ' + '[data-openkeynav-keylabel-modifier]'));
	  return modifier ? symbols.filter(function (symbol) {
	    return symbol.dataset.openkeynavKeylabelModifier === modifier;
	  }) : symbols;
	};
	var updateAssignedModifierFeedback = function updateAssignedModifierFeedback(openKeyNav, modifier, pressed) {
	  var feedback = assignedModifierFeedbackByOpenKeyNav.get(openKeyNav);
	  if (!feedback) return;
	  if (pressed) {
	    feedback.pressedModifiers.add(modifier);
	  } else {
	    feedback.pressedModifiers.delete(modifier);
	  }
	  assignedModifierSymbols(openKeyNav, modifier).forEach(function (symbol) {
	    if (pressed) {
	      symbol.dataset.openkeynavKeylabelPressed = 'true';
	    } else {
	      delete symbol.dataset.openkeynavKeylabelPressed;
	    }
	  });
	};
	var ensureAssignedModifierFeedback = function ensureAssignedModifierFeedback(openKeyNav) {
	  var existing = assignedModifierFeedbackByOpenKeyNav.get(openKeyNav);
	  if (existing) return existing;
	  var documentObject = ownerDocument(openKeyNav);
	  if (!(documentObject !== null && documentObject !== void 0 && documentObject.addEventListener)) {
	    return {
	      pressedModifiers: new Set()
	    };
	  }
	  var view = documentObject.defaultView;
	  var feedback = {
	    pressedModifiers: new Set()
	  };
	  var updateFromEvent = function updateFromEvent(event, isKeyDown) {
	    Object.entries(ASSIGNED_MODIFIER_EVENT_PROPERTIES).forEach(function (_ref) {
	      var _ref2 = _slicedToArray$2(_ref, 2),
	        modifier = _ref2[0],
	        property = _ref2[1];
	      var isEventModifier = ASSIGNED_MODIFIER_BY_EVENT_KEY[event.key] === modifier;
	      updateAssignedModifierFeedback(openKeyNav, modifier, isEventModifier ? isKeyDown : Boolean(event[property]));
	    });
	  };
	  var handleKeyDown = function handleKeyDown(event) {
	    updateFromEvent(event, true);
	  };
	  var handleKeyUp = function handleKeyUp(event) {
	    updateFromEvent(event, false);
	  };
	  var reset = function reset() {
	    return Object.keys(ASSIGNED_MODIFIER_EVENT_PROPERTIES).forEach(function (modifier) {
	      return updateAssignedModifierFeedback(openKeyNav, modifier, false);
	    });
	  };
	  var handleVisibilityChange = function handleVisibilityChange() {
	    if (documentObject.visibilityState === 'hidden') reset();
	  };
	  Object.assign(feedback, {
	    documentObject: documentObject,
	    view: view,
	    handleKeyDown: handleKeyDown,
	    handleKeyUp: handleKeyUp,
	    handleVisibilityChange: handleVisibilityChange,
	    reset: reset
	  });
	  assignedModifierFeedbackByOpenKeyNav.set(openKeyNav, feedback);
	  documentObject.addEventListener('keydown', handleKeyDown, true);
	  documentObject.addEventListener('keyup', handleKeyUp, true);
	  documentObject.addEventListener('visibilitychange', handleVisibilityChange, true);
	  view === null || view === void 0 || view.addEventListener('blur', reset);
	  return feedback;
	};
	var releaseAssignedModifierFeedback = function releaseAssignedModifierFeedback(openKeyNav) {
	  var _feedback$view;
	  if (assignedModifierSymbols(openKeyNav).length) return;
	  var feedback = assignedModifierFeedbackByOpenKeyNav.get(openKeyNav);
	  if (!feedback) return;
	  feedback.documentObject.removeEventListener('keydown', feedback.handleKeyDown, true);
	  feedback.documentObject.removeEventListener('keyup', feedback.handleKeyUp, true);
	  feedback.documentObject.removeEventListener('visibilitychange', feedback.handleVisibilityChange, true);
	  (_feedback$view = feedback.view) === null || _feedback$view === void 0 || _feedback$view.removeEventListener('blur', feedback.reset);
	  assignedModifierFeedbackByOpenKeyNav.delete(openKeyNav);
	};
	var appendAssignedKeylabelSymbols = function appendAssignedKeylabelSymbols(element, symbols, feedback) {
	  Array.from(symbols).forEach(function (symbol) {
	    var modifierName = ASSIGNED_MODIFIER_BY_SYMBOL[symbol];
	    if (!modifierName) {
	      element.append(symbol);
	      return;
	    }
	    var modifier = element.ownerDocument.createElement('span');
	    modifier.className = 'openKeyNav-keylabel-modifier';
	    modifier.dataset.openkeynavKeylabelModifier = modifierName;
	    if (feedback !== null && feedback !== void 0 && feedback.pressedModifiers.has(modifierName)) {
	      modifier.dataset.openkeynavKeylabelPressed = 'true';
	    }
	    modifier.textContent = symbol;
	    element.appendChild(modifier);
	  });
	};
	var ownedAssignedKeylabels = function ownedAssignedKeylabels(openKeyNav, owner) {
	  var documentObject = ownerDocument(openKeyNav);
	  if (!(documentObject !== null && documentObject !== void 0 && documentObject.querySelectorAll)) return [];
	  return Array.from(documentObject.querySelectorAll('.openKeyNav-label[data-openkeynav-keylabel-owner]')).filter(function (overlay) {
	    return overlay.dataset.openkeynavKeylabelOwner === owner;
	  });
	};
	var releaseAssignedTargets = function releaseAssignedTargets(openKeyNav, owner) {
	  var targetsByOwner = assignedTargetsByOwner.get(openKeyNav);
	  var targets = targetsByOwner === null || targetsByOwner === void 0 ? void 0 : targetsByOwner.get(owner);
	  if (!targets) return;
	  targetsByOwner.delete(owner);
	  targets.forEach(function (target) {
	    var remainsAssigned = Array.from(targetsByOwner.values()).some(function (ownedTargets) {
	      return ownedTargets.has(target);
	    });
	    if (!remainsAssigned) {
	      var _target$removeAttribu;
	      (_target$removeAttribu = target.removeAttribute) === null || _target$removeAttribu === void 0 || _target$removeAttribu.call(target, ASSIGNED_KEYLABEL_TARGET_ATTRIBUTE);
	    }
	  });
	  if (targetsByOwner.size === 0) assignedTargetsByOwner.delete(openKeyNav);
	};
	var markAssignedTarget = function markAssignedTarget(openKeyNav, owner, target) {
	  var _target$setAttribute;
	  var targetsByOwner = assignedTargetsByOwner.get(openKeyNav);
	  if (!targetsByOwner) {
	    targetsByOwner = new Map();
	    assignedTargetsByOwner.set(openKeyNav, targetsByOwner);
	  }
	  var targets = targetsByOwner.get(owner);
	  if (!targets) {
	    targets = new Set();
	    targetsByOwner.set(owner, targets);
	  }
	  targets.add(target);
	  (_target$setAttribute = target.setAttribute) === null || _target$setAttribute === void 0 || _target$setAttribute.call(target, ASSIGNED_KEYLABEL_TARGET_ATTRIBUTE, '');
	};

	/**
	 * Removes one caller's descriptive keylabels without disturbing Click or Move
	 * Mode labels. Callers own only the assignment data; this module owns the
	 * overlay lifecycle.
	 */
	var clearAssignedKeylabels = keylabels.clearAssignedKeylabels = function clearAssignedKeylabels(openKeyNav, owner) {
	  var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
	    _ref3$preserveModifie = _ref3.preserveModifierFeedback,
	    preserveModifierFeedback = _ref3$preserveModifie === void 0 ? false : _ref3$preserveModifie;
	  ownedAssignedKeylabels(openKeyNav, owner).forEach(function (overlay) {
	    return overlay.remove();
	  });
	  releaseAssignedTargets(openKeyNav, owner);
	  if (!preserveModifierFeedback) releaseAssignedModifierFeedback(openKeyNav);
	};

	/**
	 * Repositions an existing caller-owned set through OpenKeyNav's established
	 * overlay placement routine.
	 */
	keylabels.repositionAssignedKeylabels = function repositionAssignedKeylabels(openKeyNav, owner) {
	  ownedAssignedKeylabels(openKeyNav, owner).forEach(function (overlay) {
	    var target = assignedTargetByOverlay.get(overlay);
	    if (!(target !== null && target !== void 0 && target.isConnected)) {
	      overlay.remove();
	      return;
	    }
	    openKeyNav.updateOverlayPosition(target, overlay);
	  });
	};

	/**
	 * Renders caller-supplied descriptive labels with the existing keylabel
	 * creation and positioning system. These labels are hints, not type-to-select
	 * labels, so the page targets are deliberately left without
	 * data-openkeynav-label attributes. The renderer applies the shared keylabel
	 * target treatment through a non-selectable, owner-managed attribute instead.
	 */
	keylabels.showAssignedKeylabels = function showAssignedKeylabels(openKeyNav, assignments) {
	  var _ref4 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
	    owner = _ref4.owner,
	    _ref4$cssClass = _ref4.cssClass,
	    cssClass = _ref4$cssClass === void 0 ? null : _ref4$cssClass,
	    _ref4$focusedTarget = _ref4.focusedTarget,
	    focusedTarget = _ref4$focusedTarget === void 0 ? null : _ref4$focusedTarget;
	  if (!owner) {
	    throw new TypeError('Assigned keylabels require an owner.');
	  }
	  clearAssignedKeylabels(openKeyNav, owner, {
	    preserveModifierFeedback: true
	  });
	  var overlays = [];
	  var assignmentsByTarget = new Map();
	  Array.from(assignments || []).forEach(function (assignment) {
	    var target = assignment === null || assignment === void 0 ? void 0 : assignment.target;
	    var maxSymbols = Number.isInteger(assignment === null || assignment === void 0 ? void 0 : assignment.maxSymbols) && assignment.maxSymbols > 0 ? assignment.maxSymbols : 2;
	    var symbols = Array.from(String((assignment === null || assignment === void 0 ? void 0 : assignment.symbols) || '')).slice(0, maxSymbols).join('');
	    if (!(target !== null && target !== void 0 && target.isConnected) || !symbols) return;
	    var existing = assignmentsByTarget.get(target);
	    if (!existing) {
	      assignmentsByTarget.set(target, {
	        target: target,
	        symbols: symbols,
	        maxSymbols: maxSymbols,
	        segments: [symbols],
	        commands: assignment.command ? [String(assignment.command)] : []
	      });
	      // Make every target visible to the shared collision check before the
	      // first overlay is positioned. This keeps placement single-pass while
	      // preventing an early keylabel from obscuring a later target.
	      markAssignedTarget(openKeyNav, owner, target);
	      return;
	    }
	    var availableSymbols = existing.maxSymbols - Array.from(existing.symbols).length;
	    if (Array.from(symbols).length > availableSymbols) return;
	    existing.symbols += symbols;
	    existing.segments.push(symbols);
	    if (assignment.command) existing.commands.push(String(assignment.command));
	  });
	  var hasModifierSymbols = Array.from(assignmentsByTarget.values()).some(function (assignment) {
	    return Array.from(assignment.symbols).some(function (symbol) {
	      return ASSIGNED_MODIFIER_BY_SYMBOL[symbol];
	    });
	  });
	  var modifierFeedback = hasModifierSymbols ? ensureAssignedModifierFeedback(openKeyNav) : null;
	  assignmentsByTarget.forEach(function (_ref5) {
	    var target = _ref5.target,
	      symbols = _ref5.symbols,
	      segments = _ref5.segments,
	      commands = _ref5.commands;
	    var overlay = openKeyNav.createOverlay(target, symbols, cssClass);
	    overlay.dataset.openkeynavKeylabelOwner = owner;
	    overlay.dataset.openkeynavKeylabelCommand = commands.join(' ');
	    if (target.id) overlay.dataset.openkeynavKeylabelTarget = target.id;
	    overlay.setAttribute('data-openkeynav-ui', "".concat(owner, "-keylabel"));
	    overlay.setAttribute('aria-hidden', 'true');
	    if (target === focusedTarget) {
	      overlay.classList.add('openKeyNav-keylabel-focused');
	      overlay.dataset.openkeynavKeylabelFocused = 'true';
	    }
	    if (segments.length > 1) {
	      overlay.classList.add('openKeyNav-keylabel-alternatives');
	      overlay.dataset.openkeynavKeylabelAlternatives = String(segments.length);
	      var segmentElements = segments.map(function (segment) {
	        var element = overlay.ownerDocument.createElement('span');
	        element.className = 'openKeyNav-keylabel-alternative';
	        appendAssignedKeylabelSymbols(element, segment, modifierFeedback);
	        return element;
	      });
	      overlay.replaceChildren.apply(overlay, _toConsumableArray$1(segmentElements));
	      openKeyNav.updateOverlayPosition(target, overlay);
	    } else if (Array.from(symbols).some(function (symbol) {
	      return ASSIGNED_MODIFIER_BY_SYMBOL[symbol];
	    })) {
	      overlay.replaceChildren();
	      appendAssignedKeylabelSymbols(overlay, symbols, modifierFeedback);
	      openKeyNav.updateOverlayPosition(target, overlay);
	    }
	    assignedTargetByOverlay.set(overlay, target);
	    overlays.push(overlay);
	  });
	  if (!hasModifierSymbols) releaseAssignedModifierFeedback(openKeyNav);
	  return overlays;
	};
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
	    // The user may dismiss Click Mode before this deferred discovery runs.
	    if (!openKeyNav.config.modes.clicking.value) return;
	    var allCandidates = _getAllCandidateElements(openKeyNav, document);
	    var clickables = allCandidates.filter(function (el) {
	      return (0, _isTabbable.isTabbable)(el, openKeyNav);
	    });

	    // Prefer the innermost target when nested candidates occupy the same area.
	    clickables = clickables.filter(function (element) {
	      var hasClickableDescendant = clickables.some(function (other) {
	        if (other === element || !element.contains(other)) return false;
	        var parentRect = element.getBoundingClientRect();
	        var childRect = other.getBoundingClientRect();
	        return Math.abs(parentRect.top - childRect.top) < 2 && Math.abs(parentRect.left - childRect.left) < 2 && Math.abs(parentRect.right - childRect.right) < 2 && Math.abs(parentRect.bottom - childRect.bottom) < 2;
	      });
	      return !hasClickableDescendant;
	    });
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
	  var fromElementSelectors = _toConsumableArray$1(new Set(openKeyNav.config.modesConfig.move.config.filter(function (config) {
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
	  var fromContainerSelectors = _toConsumableArray$1(new Set(openKeyNav.config.modesConfig.move.config.filter(function (config) {
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
	    return (0, _isTabbable.isTabbable)(el, openKeyNav);
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
	    (0, _escape.handleEscape)(openKeyNav, e);
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
	  var mergedSet = new Set([].concat(_toConsumableArray$1(allElements), _toConsumableArray$1(openKeyNav.config.modesConfig.click.clickEventElements)));
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

	var structuralNavigation = {};

	var keyboardEvents = {};

	Object.defineProperty(keyboardEvents, "__esModule", {
	  value: true
	});
	keyboardEvents.preventAcceptedCommand = keyboardEvents.normalizeShortcut = keyboardEvents.matchesShortcut = keyboardEvents.MODIFIER_KEYS = void 0;
	function _typeof$2(o) {
	  "@babel/helpers - typeof";

	  return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, _typeof$2(o);
	}
	var MODIFIER_KEYS = keyboardEvents.MODIFIER_KEYS = Object.freeze(['altKey', 'ctrlKey', 'metaKey', 'shiftKey']);
	var normalizeShortcut = keyboardEvents.normalizeShortcut = function normalizeShortcut(shortcut) {
	  if (!shortcut) return null;
	  if (typeof shortcut === 'string') return {
	    key: shortcut
	  };
	  if (_typeof$2(shortcut) === 'object' && typeof shortcut.key === 'string') {
	    return shortcut;
	  }
	  return null;
	};
	var keysEqual = function keysEqual(left, right) {
	  if (left.length === 1 && right.length === 1) {
	    return left.toLowerCase() === right.toLowerCase();
	  }
	  return left === right;
	};

	/**
	 * Match a configured shortcut exactly. Modifiers omitted by the configuration
	 * are treated as false so browser and application chords do not collide.
	 * A caller may permit specific extra modifiers without weakening an explicit
	 * `true` or `false` requirement in the configured shortcut.
	 */
	keyboardEvents.matchesShortcut = function matchesShortcut(event, shortcut) {
	  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	  var normalized = normalizeShortcut(shortcut);
	  if (!normalized || !keysEqual(event.key, normalized.key)) return false;

	  // Preserve the original string form for callers that deliberately need to
	  // ignore a modifier entirely. New ownership overrides should use
	  // `allowedExtraModifiers` so explicit shortcut requirements remain exact.
	  var optionBag = _typeof$2(options) === 'object' && options !== null ? options : {};
	  var ignoredModifier = typeof options === 'string' ? options : optionBag.ignoredModifier || null;
	  var allowedExtras = optionBag.allowedExtraModifiers || [];
	  var allowedExtraModifiers = new Set(Array.isArray(allowedExtras) ? allowedExtras : [allowedExtras].filter(Boolean));
	  return MODIFIER_KEYS.every(function (modifier) {
	    if (modifier === ignoredModifier) return true;
	    var eventHasModifier = Boolean(event[modifier]);
	    var shortcutDeclaresModifier = Object.prototype.hasOwnProperty.call(normalized, modifier);
	    if (allowedExtraModifiers.has(modifier) && !shortcutDeclaresModifier && eventHasModifier) {
	      return true;
	    }
	    return eventHasModifier === Boolean(normalized[modifier]);
	  });
	};

	/**
	 * Cancel one keyboard command after OpenKeyNav has accepted ownership of it.
	 */
	keyboardEvents.preventAcceptedCommand = function preventAcceptedCommand(event) {
	  event.preventDefault();
	  event.stopPropagation();
	  return true;
	};

	Object.defineProperty(structuralNavigation, "__esModule", {
	  value: true
	});
	structuralNavigation.matchesStructuralShortcut = structuralNavigation.classifyStructuralKeyOwnership = structuralNavigation.StructuralNavigationController = structuralNavigation.STRUCTURAL_NAVIGATION_COMMANDS = void 0;
	var _structuralModel = structuralModel;
	var _accessibilityName = accessibilityName;
	var _domUtilities$1 = domUtilities;
	var _keyboardEvents = keyboardEvents;
	var _keylabels = keylabels;
	var _signals = signals;
	var _tabbableTargets = tabbableTargets;
	function _slicedToArray$1(r, e) {
	  return _arrayWithHoles$1(r) || _iterableToArrayLimit$1(r, e) || _unsupportedIterableToArray$1(r, e) || _nonIterableRest$1();
	}
	function _nonIterableRest$1() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _iterableToArrayLimit$1(r, l) {
	  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	  if (null != t) {
	    var e,
	      n,
	      i,
	      u,
	      a = [],
	      f = true,
	      o = false;
	    try {
	      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
	    } catch (r) {
	      o = true, n = r;
	    } finally {
	      try {
	        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
	      } finally {
	        if (o) throw n;
	      }
	    }
	    return a;
	  }
	}
	function _arrayWithHoles$1(r) {
	  if (Array.isArray(r)) return r;
	}
	function _classCallCheck$1(a, n) {
	  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
	}
	function _defineProperties$1(e, r) {
	  for (var t = 0; t < r.length; t++) {
	    var o = r[t];
	    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey$1(o.key), o);
	  }
	}
	function _createClass$1(e, r, t) {
	  return r && _defineProperties$1(e.prototype, r), Object.defineProperty(e, "prototype", {
	    writable: false
	  }), e;
	}
	function ownKeys(e, r) {
	  var t = Object.keys(e);
	  if (Object.getOwnPropertySymbols) {
	    var o = Object.getOwnPropertySymbols(e);
	    r && (o = o.filter(function (r) {
	      return Object.getOwnPropertyDescriptor(e, r).enumerable;
	    })), t.push.apply(t, o);
	  }
	  return t;
	}
	function _objectSpread(e) {
	  for (var r = 1; r < arguments.length; r++) {
	    var t = null != arguments[r] ? arguments[r] : {};
	    r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
	      _defineProperty(e, r, t[r]);
	    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
	      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
	    });
	  }
	  return e;
	}
	function _defineProperty(e, r, t) {
	  return (r = _toPropertyKey$1(r)) in e ? Object.defineProperty(e, r, {
	    value: t,
	    enumerable: true,
	    configurable: true,
	    writable: true
	  }) : e[r] = t, e;
	}
	function _toPropertyKey$1(t) {
	  var i = _toPrimitive$1(t, "string");
	  return "symbol" == _typeof$1(i) ? i : i + "";
	}
	function _toPrimitive$1(t, r) {
	  if ("object" != _typeof$1(t) || !t) return t;
	  var e = t[Symbol.toPrimitive];
	  if (void 0 !== e) {
	    var i = e.call(t, r);
	    if ("object" != _typeof$1(i)) return i;
	    throw new TypeError("@@toPrimitive must return a primitive value.");
	  }
	  return (String )(t);
	}
	function _typeof$1(o) {
	  "@babel/helpers - typeof";

	  return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, _typeof$1(o);
	}
	function _toConsumableArray(r) {
	  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray$1(r) || _nonIterableSpread();
	}
	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _unsupportedIterableToArray$1(r, a) {
	  if (r) {
	    if ("string" == typeof r) return _arrayLikeToArray$1(r, a);
	    var t = {}.toString.call(r).slice(8, -1);
	    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0;
	  }
	}
	function _iterableToArray(r) {
	  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
	}
	function _arrayWithoutHoles(r) {
	  if (Array.isArray(r)) return _arrayLikeToArray$1(r);
	}
	function _arrayLikeToArray$1(r, a) {
	  (null == a || a > r.length) && (a = r.length);
	  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	  return n;
	}
	var STRUCTURAL_NAVIGATION_COMMANDS = structuralNavigation.STRUCTURAL_NAVIGATION_COMMANDS = Object.freeze({
	  previousTarget: 'previousTarget',
	  nextTarget: 'nextTarget',
	  previousContextStart: 'previousContextStart',
	  nextContextStart: 'nextContextStart',
	  previousSiblingContext: 'previousSiblingContext',
	  nextSiblingContext: 'nextSiblingContext',
	  broadenContext: 'broadenContext',
	  narrowContext: 'narrowContext',
	  previousPeerContext: 'previousPeerContext',
	  nextPeerContext: 'nextPeerContext'
	});
	var STRUCTURAL_STATUS_CHANNEL = 'structural-navigation';
	var STRUCTURAL_EXIT_STATUS_CHANNEL = 'structural-navigation-exit';
	var STRUCTURAL_KEYLABEL_OWNER = 'structural-navigation';
	var STRUCTURAL_KEYLABEL_CLASS = 'openKeyNav-structural-keylabel';
	var CONTEXT_INDICATOR_OFFSET = 10;
	var CONTEXT_INDICATOR_WIDTH = 2;
	var CONTEXT_INDICATOR_CONTRAST_WIDTH = 2;
	var HEADING_CONTEXT_ARROW_COMMANDS = new Set([STRUCTURAL_NAVIGATION_COMMANDS.previousSiblingContext, STRUCTURAL_NAVIGATION_COMMANDS.nextSiblingContext, STRUCTURAL_NAVIGATION_COMMANDS.broadenContext, STRUCTURAL_NAVIGATION_COMMANDS.narrowContext]);
	var MODIFIER_KEY_EVENTS = new Set(['Alt', 'Control', 'Meta', 'Shift']);
	var NATIVE_SCROLL_KEYS = new Set(['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp']);
	var SPACE_ACTIVATION_ROLES = new Set(['button', 'checkbox', 'menuitemcheckbox', 'menuitemradio', 'option', 'radio', 'switch']);
	var ARROW_OWNING_ROLES = new Set(['combobox', 'grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'scrollbar', 'slider', 'spinbutton', 'tablist', 'toolbar', 'tree', 'treegrid']);
	var ESCAPE_OWNING_ROLES = new Set([].concat(_toConsumableArray(ARROW_OWNING_ROLES), ['dialog']));
	var TEXT_INPUT_TYPES = new Set(['date', 'datetime-local', 'email', 'month', 'number', 'password', 'range', 'search', 'tel', 'text', 'time', 'url', 'week']);
	var SHORTCUT_MODIFIER_LABELS = Object.freeze({
	  ctrlKey: 'Ctrl',
	  altKey: 'Alt',
	  shiftKey: 'Shift',
	  metaKey: 'Meta'
	});
	var KEYLABEL_MODIFIER_SYMBOLS = Object.freeze({
	  altKey: _keylabels.KEYLABEL_SYMBOLS.alt,
	  ctrlKey: _keylabels.KEYLABEL_SYMBOLS.control,
	  metaKey: _keylabels.KEYLABEL_SYMBOLS.meta,
	  shiftKey: _keylabels.KEYLABEL_SYMBOLS.shift
	});
	var shortcutLabel = function shortcutLabel(shortcut) {
	  var normalized = (0, _keyboardEvents.normalizeShortcut)(shortcut);
	  if (!normalized) return '';
	  var modifiers = _keyboardEvents.MODIFIER_KEYS.filter(function (modifier) {
	    return normalized[modifier];
	  }).map(function (modifier) {
	    return SHORTCUT_MODIFIER_LABELS[modifier];
	  });
	  var key = normalized.key === 'Escape' ? 'Esc' : normalized.key === ' ' ? 'Space' : normalized.key;
	  return [].concat(_toConsumableArray(modifiers), [key]).join('+');
	};
	var shortcutSymbols = function shortcutSymbols(shortcut) {
	  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$extraModifiers = _ref.extraModifiers,
	    extraModifiers = _ref$extraModifiers === void 0 ? [] : _ref$extraModifiers;
	  var normalized = (0, _keyboardEvents.normalizeShortcut)(shortcut);
	  if (!normalized) return '';
	  var keySymbol = {
	    Tab: _keylabels.KEYLABEL_SYMBOLS.tab,
	    ArrowLeft: _keylabels.KEYLABEL_SYMBOLS.left,
	    ArrowRight: _keylabels.KEYLABEL_SYMBOLS.right,
	    ArrowUp: _keylabels.KEYLABEL_SYMBOLS.up,
	    ArrowDown: _keylabels.KEYLABEL_SYMBOLS.down,
	    Enter: _keylabels.KEYLABEL_SYMBOLS.enter,
	    ' ': _keylabels.KEYLABEL_SYMBOLS.space,
	    Spacebar: _keylabels.KEYLABEL_SYMBOLS.space
	  }[normalized.key];
	  if (!keySymbol) return '';
	  var modifierSymbols = [].concat(_toConsumableArray(extraModifiers), _toConsumableArray(_keyboardEvents.MODIFIER_KEYS.filter(function (modifier) {
	    return normalized[modifier];
	  }))).filter(function (modifier, index, modifiers) {
	    return _keyboardEvents.MODIFIER_KEYS.includes(modifier) && modifiers.indexOf(modifier) === index;
	  }).map(function (modifier) {
	    return KEYLABEL_MODIFIER_SYMBOLS[modifier];
	  });
	  return "".concat(modifierSymbols.join('')).concat(keySymbol);
	};

	/**
	 * Matches one exact configured shortcut. Unspecified modifiers are false.
	 * Callers may explicitly permit an extra ownership-override modifier.
	 */
	var matchesStructuralShortcut = structuralNavigation.matchesStructuralShortcut = _keyboardEvents.matchesShortcut;
	var getEventPath = function getEventPath(event) {
	  if (typeof event.composedPath === 'function') {
	    var _path = event.composedPath();
	    if (_path.length) return _path;
	  }
	  var path = [];
	  var current = event.target;
	  while (current) {
	    path.push(current);
	    current = (0, _domUtilities$1.getComposedParent)(current);
	  }
	  return path;
	};
	var hasEditableContent = function hasEditableContent(element) {
	  if (!(0, _domUtilities$1.isElement)(element)) return false;
	  var value = element.getAttribute('contenteditable');
	  return element.isContentEditable || value === '' || value === 'true' || value === 'plaintext-only';
	};
	var elementKeyOwnership = function elementKeyOwnership(element) {
	  var ownership = {
	    all: false,
	    arrows: false,
	    escape: false,
	    character: false
	  };
	  if (!(0, _domUtilities$1.isElement)(element)) return ownership;
	  var declared = [element.getAttribute('data-openkeynav-key-owner'), element.getAttribute('data-openkeynav-owns-keys')].filter(Boolean).join(' ').toLowerCase();
	  if (declared.includes('all')) {
	    return {
	      all: true,
	      arrows: true,
	      escape: true,
	      character: true
	    };
	  }
	  if (declared.includes('arrow')) ownership.arrows = true;
	  if (declared.includes('escape')) ownership.escape = true;
	  if (declared.includes('character')) ownership.character = true;
	  if (hasEditableContent(element)) {
	    ownership.arrows = true;
	    ownership.escape = true;
	    ownership.character = true;
	  }
	  var tagName = element.tagName.toLowerCase();
	  if (tagName === 'textarea' || tagName === 'select') {
	    ownership.arrows = true;
	    ownership.escape = true;
	    ownership.character = true;
	  } else if (tagName === 'input') {
	    var type = (element.getAttribute('type') || 'text').toLowerCase();
	    if (TEXT_INPUT_TYPES.has(type) || type === 'radio') {
	      ownership.arrows = true;
	      ownership.escape = true;
	      ownership.character = true;
	    }
	  }
	  var role = (element.getAttribute('role') || '').toLowerCase();
	  if (ARROW_OWNING_ROLES.has(role)) {
	    ownership.arrows = true;
	    ownership.character = true;
	  }
	  if (ESCAPE_OWNING_ROLES.has(role)) ownership.escape = true;
	  var openPopover = false;
	  try {
	    openPopover = element.matches('[popover]:popover-open');
	  } catch (error) {
	    openPopover = false;
	  }
	  if (tagName === 'dialog' && element.hasAttribute('open') || openPopover) {
	    ownership.escape = true;
	  }
	  return ownership;
	};

	/**
	 * Classifies page/widget ownership before OpenKeyNav prevents any key.
	 */
	var classifyStructuralKeyOwnership = structuralNavigation.classifyStructuralKeyOwnership = function classifyStructuralKeyOwnership(event) {
	  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  var path = getEventPath(event);
	  var result = {
	    all: false,
	    arrows: false,
	    escape: false,
	    character: false
	  };
	  path.forEach(function (node) {
	    var ownership = elementKeyOwnership(node);
	    result.all = result.all || ownership.all;
	    result.arrows = result.arrows || ownership.arrows;
	    result.escape = result.escape || ownership.escape;
	    result.character = result.character || ownership.character;
	  });
	  if (typeof config.ownsKey === 'function') {
	    var declared = config.ownsKey(event, path);
	    if (declared === true) {
	      return {
	        all: true,
	        arrows: true,
	        escape: true,
	        character: true
	      };
	    }
	    if (declared && _typeof$1(declared) === 'object') {
	      result.all = result.all || Boolean(declared.all);
	      result.arrows = result.arrows || Boolean(declared.arrows);
	      result.escape = result.escape || Boolean(declared.escape);
	      result.character = result.character || Boolean(declared.character);
	    }
	  }
	  return result;
	};
	var shortcutEventForTarget = function shortcutEventForTarget(target, shortcut) {
	  var normalized = (0, _keyboardEvents.normalizeShortcut)(shortcut);
	  if (!target || !normalized) return null;
	  var path = [];
	  var current = target;
	  while (current) {
	    path.push(current);
	    current = (0, _domUtilities$1.getComposedParent)(current);
	  }
	  return {
	    target: target,
	    key: normalized.key,
	    altKey: normalized.altKey,
	    ctrlKey: normalized.ctrlKey,
	    metaKey: normalized.metaKey,
	    shiftKey: normalized.shiftKey,
	    composedPath: function composedPath() {
	      return path;
	    }
	  };
	};
	var structuralArrowSymbols = function structuralArrowSymbols(target, shortcut, config) {
	  var event = shortcutEventForTarget(target, shortcut);
	  if (!event || !event.key.startsWith('Arrow')) return '';
	  var ownership = classifyStructuralKeyOwnership(event, config);
	  if (ownership.all) return '';
	  if (!ownership.arrows) return shortcutSymbols(shortcut);
	  var overrideModifier = _keyboardEvents.MODIFIER_KEYS.includes(config.overrideModifier) ? config.overrideModifier : null;
	  if (!overrideModifier) return '';
	  var normalized = (0, _keyboardEvents.normalizeShortcut)(shortcut);
	  if (Object.prototype.hasOwnProperty.call(normalized, overrideModifier) && !normalized[overrideModifier]) {
	    return '';
	  }
	  var extraModifiers = normalized[overrideModifier] ? [] : [overrideModifier];
	  var overriddenEvent = _objectSpread(_objectSpread({}, event), {}, _defineProperty({}, overrideModifier, true));
	  var overriddenOwnership = classifyStructuralKeyOwnership(overriddenEvent, config);
	  if (overriddenOwnership.all) return '';
	  if (!matchesStructuralShortcut(overriddenEvent, shortcut, {
	    allowedExtraModifiers: extraModifiers
	  })) {
	    return '';
	  }
	  return shortcutSymbols(shortcut, {
	    extraModifiers: extraModifiers
	  });
	};
	var activationSymbols = function activationSymbols(target) {
	  if (!(0, _domUtilities$1.isElement)(target) || target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') {
	    return [];
	  }
	  var tagName = target.tagName.toLowerCase();
	  var both = [_keylabels.KEYLABEL_SYMBOLS.enter, _keylabels.KEYLABEL_SYMBOLS.space];
	  if (tagName === 'button' || tagName === 'summary') return both;
	  if ((tagName === 'a' || tagName === 'area') && target.hasAttribute('href')) {
	    return [_keylabels.KEYLABEL_SYMBOLS.enter];
	  }
	  if (tagName !== 'input') {
	    var role = (target.getAttribute('role') || '').toLowerCase();
	    if (role === 'button') return both;
	    if (role === 'link') return [_keylabels.KEYLABEL_SYMBOLS.enter];
	    if (SPACE_ACTIVATION_ROLES.has(role)) return [_keylabels.KEYLABEL_SYMBOLS.space];
	    return [];
	  }
	  var inputType = (target.getAttribute('type') || 'text').toLowerCase();
	  if (['button', 'submit', 'reset', 'image'].includes(inputType)) return both;
	  if (['checkbox', 'radio'].includes(inputType)) {
	    return [_keylabels.KEYLABEL_SYMBOLS.space];
	  }
	  return [];
	};
	var preferredActivationSymbols = function preferredActivationSymbols(target) {
	  var symbols = activationSymbols(target);
	  return symbols.includes(_keylabels.KEYLABEL_SYMBOLS.enter) ? [_keylabels.KEYLABEL_SYMBOLS.enter] : symbols;
	};
	var targetUsesSpaceForActivation = function targetUsesSpaceForActivation(target) {
	  return activationSymbols(target).includes(_keylabels.KEYLABEL_SYMBOLS.space);
	};
	var isNativeKeyboardScroll = function isNativeKeyboardScroll(event, ownership, target) {
	  if (ownership.all || ownership.arrows || ownership.character || event.altKey || event.ctrlKey || event.metaKey) {
	    return false;
	  }
	  if (event.key === ' ' || event.key === 'Spacebar') {
	    return !targetUsesSpaceForActivation(target);
	  }
	  return !event.shiftKey && NATIVE_SCROLL_KEYS.has(event.key);
	};
	var radioIsAvailable = function radioIsAvailable(radio, root, displayCheck, targetFilter) {
	  var _radio$closest, _radio$ownerDocument, _radio$ownerDocument$;
	  if (!(radio !== null && radio !== void 0 && radio.isConnected) || radio.type !== 'radio' || !(0, _domUtilities$1.isComposedWithin)(root, radio) || (_radio$closest = radio.closest) !== null && _radio$closest !== void 0 && _radio$closest.call(radio, '[inert], [hidden]') || targetFilter && !targetFilter(radio)) {
	    return false;
	  }
	  try {
	    if (radio.matches(':disabled')) return false;
	  } catch (error) {
	    if (radio.disabled) return false;
	  }
	  if (displayCheck === 'none') return true;
	  var style = (_radio$ownerDocument = radio.ownerDocument) === null || _radio$ownerDocument === void 0 || (_radio$ownerDocument = _radio$ownerDocument.defaultView) === null || _radio$ownerDocument === void 0 || (_radio$ownerDocument$ = _radio$ownerDocument.getComputedStyle) === null || _radio$ownerDocument$ === void 0 ? void 0 : _radio$ownerDocument$.call(_radio$ownerDocument, radio);
	  if ((style === null || style === void 0 ? void 0 : style.display) === 'none' || ['hidden', 'collapse'].includes(style === null || style === void 0 ? void 0 : style.visibility)) {
	    return false;
	  }
	  return elementClientRects(radio).length > 0;
	};

	/**
	 * Predicts the browser's native focus movement inside one HTML radio group.
	 * These are descriptive hints only; bare arrow events remain browser-owned.
	 */
	var nativeRadioArrowAssignments = function nativeRadioArrowAssignments(target, root, displayCheck, targetFilter) {
	  var _target$getRootNode;
	  if (!(0, _domUtilities$1.isElement)(target) || target.tagName.toLowerCase() !== 'input' || target.type !== 'radio' || !target.name) {
	    return [];
	  }
	  var treeRoot = ((_target$getRootNode = target.getRootNode) === null || _target$getRootNode === void 0 ? void 0 : _target$getRootNode.call(target)) || target.ownerDocument;
	  if (!(treeRoot !== null && treeRoot !== void 0 && treeRoot.querySelectorAll)) return [];
	  var radios = Array.from(treeRoot.querySelectorAll('input')).filter(function (radio) {
	    return radio !== target && radio.type === 'radio' && radio.name === target.name && radio.form === target.form && radioIsAvailable(radio, root, displayCheck, targetFilter);
	  });
	  var group = [target].concat(_toConsumableArray(radios)).sort(function (left, right) {
	    if (left === right) return 0;
	    var position = left.compareDocumentPosition(right);
	    return position & 2 ? 1 : -1;
	  });
	  if (group.length < 2) return [];
	  var currentIndex = group.indexOf(target);
	  var previous = group[(currentIndex - 1 + group.length) % group.length];
	  var next = group[(currentIndex + 1) % group.length];
	  if (previous === next) {
	    return [{
	      target: previous,
	      symbols: _keylabels.KEYLABEL_SYMBOLS.horizontalAxis,
	      command: 'nativeArrowLeft nativeArrowRight'
	    }, {
	      target: previous,
	      symbols: _keylabels.KEYLABEL_SYMBOLS.verticalAxis,
	      command: 'nativeArrowUp nativeArrowDown'
	    }];
	  }
	  return [{
	    target: previous,
	    symbols: _keylabels.KEYLABEL_SYMBOLS.left,
	    command: 'nativeArrowLeft'
	  }, {
	    target: previous,
	    symbols: _keylabels.KEYLABEL_SYMBOLS.up,
	    command: 'nativeArrowUp'
	  }, {
	    target: next,
	    symbols: _keylabels.KEYLABEL_SYMBOLS.right,
	    command: 'nativeArrowRight'
	  }, {
	    target: next,
	    symbols: _keylabels.KEYLABEL_SYMBOLS.down,
	    command: 'nativeArrowDown'
	  }];
	};
	var resolveValue = function resolveValue(value, details) {
	  return typeof value === 'function' ? value(details) : value;
	};
	var contextTargets = function contextTargets(context) {
	  if (!context) return [];
	  return context.targets || context.flattenedTargets || [];
	};
	var contextId = function contextId(context) {
	  return context && context.id;
	};
	var modelContextById = function modelContextById(model, id) {
	  var _model$contexts;
	  if (!model || id === null || typeof id === 'undefined') return null;
	  if (model.contexts instanceof Map) return model.contexts.get(id) || null;
	  if (Array.isArray(model.contexts)) {
	    return model.contexts.find(function (context) {
	      return context.id === id;
	    }) || null;
	  }
	  return ((_model$contexts = model.contexts) === null || _model$contexts === void 0 ? void 0 : _model$contexts[id]) || null;
	};
	var modelTypedContextById = function modelTypedContextById(model, id) {
	  var _model$typedContexts;
	  if (!model || id === null || typeof id === 'undefined') return null;
	  if (model.typedContexts instanceof Map) return model.typedContexts.get(id) || null;
	  if (Array.isArray(model.typedContexts)) {
	    return model.typedContexts.find(function (context) {
	      return context.id === id;
	    }) || null;
	  }
	  return ((_model$typedContexts = model.typedContexts) === null || _model$typedContexts === void 0 ? void 0 : _model$typedContexts[id]) || null;
	};
	var directContextForTarget = function directContextForTarget(model, target) {
	  if (!model || !target) return null;
	  var map = model.directContextByTarget || model.targetContexts || model.directContexts;
	  if (map instanceof Map) {
	    var value = map.get(target);
	    return _typeof$1(value) === 'object' ? value : modelContextById(model, value);
	  }
	  if (typeof model.getDirectContext === 'function') {
	    return model.getDirectContext(target);
	  }
	  return null;
	};
	var structuralContextForElement = function structuralContextForElement(model, element) {
	  if (!model || !element) return null;
	  var direct = directContextForTarget(model, element);
	  if (direct) return direct;
	  var contexts = modelStructuralContexts(model);
	  var exact = contexts.filter(function (context) {
	    return context.boundary === element || context.associatedHeading === element;
	  });
	  var containing = exact.length ? exact : contexts.filter(function (context) {
	    var _context$visualElemen;
	    if ((_context$visualElemen = context.visualElements) !== null && _context$visualElemen !== void 0 && _context$visualElemen.includes(element)) return true;
	    var boundary = context.boundary;
	    return ((0, _domUtilities$1.isDocument)(boundary) || (0, _domUtilities$1.isShadowRoot)(boundary) || (0, _domUtilities$1.isElement)(boundary)) && (0, _domUtilities$1.isComposedWithin)(boundary, element);
	  });
	  return containing.sort(function (left, right) {
	    return compareContextSpecificity(model, left, right) || contextTargets(left).length - contextTargets(right).length || contextOrder(left) - contextOrder(right);
	  })[0] || model.rootContext || null;
	};
	var typedContextsForTarget = function typedContextsForTarget(model, target) {
	  if (!model || !target) return [];
	  var map = model.typedContextsByTarget || model.targetTypedContexts;
	  var values = map instanceof Map ? map.get(target) : null;
	  if (!values && typeof model.getTypedContexts === 'function') {
	    values = model.getTypedContexts(target);
	  }
	  return Array.from(values || []).map(function (value) {
	    return _typeof$1(value) === 'object' ? value : modelTypedContextById(model, value);
	  }).filter(Boolean);
	};
	var parentContext = function parentContext(model, context) {
	  if (!context || !context.parent) return null;
	  return _typeof$1(context.parent) === 'object' ? context.parent : modelContextById(model, context.parent);
	};
	var contextDescendsFrom = function contextDescendsFrom(model, context, possibleAncestor) {
	  var current = parentContext(model, context);
	  var seen = new Set();
	  while (current && !seen.has(current)) {
	    if (current === possibleAncestor) return true;
	    seen.add(current);
	    current = parentContext(model, current);
	  }
	  return false;
	};
	var compareContextSpecificity = function compareContextSpecificity(model, left, right) {
	  if (contextDescendsFrom(model, left, right)) return -1;
	  if (contextDescendsFrom(model, right, left)) return 1;
	  return 0;
	};
	var modelStructuralContexts = function modelStructuralContexts(model) {
	  if (!(model !== null && model !== void 0 && model.contexts)) return [];
	  if (model.contexts instanceof Map) return Array.from(model.contexts.values());
	  if (Array.isArray(model.contexts)) return model.contexts.slice();
	  return Object.values(model.contexts);
	};
	var contextHeadingLevel = function contextHeadingLevel(context) {
	  var level = Number(context === null || context === void 0 ? void 0 : context.headingLevel);
	  return Number.isInteger(level) && level > 0 ? level : null;
	};
	var authoredHeadingForContext = function authoredHeadingForContext(context) {
	  if (!context) return null;
	  if ((0, _domUtilities$1.isElement)(context.associatedHeading)) return context.associatedHeading;
	  if (context.source === 'heading' && (0, _domUtilities$1.isElement)(context.boundary)) {
	    return context.boundary;
	  }
	  return null;
	};
	var contextOrder = function contextOrder(context) {
	  var order = Number(context === null || context === void 0 ? void 0 : context.order);
	  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER;
	};

	/**
	 * Heading-backed contexts use the authored heading level as their horizontal
	 * lane, regardless of inferred container ancestry. Semantic nesting does not
	 * create additional levels.
	 */
	var horizontalContextPeers = function horizontalContextPeers(model, context) {
	  var headingLevel = contextHeadingLevel(context);
	  var contexts = headingLevel === null ? [] : modelStructuralContexts(model).filter(function (candidate) {
	    return contextHeadingLevel(candidate) === headingLevel;
	  });
	  return {
	    headingLevel: headingLevel,
	    contexts: contexts.filter(function (candidate) {
	      return contextTargets(candidate).length > 0;
	    }).sort(function (left, right) {
	      return contextOrder(left) - contextOrder(right) || String(contextId(left)).localeCompare(String(contextId(right)));
	    })
	  };
	};
	var headingContextForTarget = function headingContextForTarget(model, target) {
	  var headingLevel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	  if (!model || !target) return null;
	  return modelStructuralContexts(model).filter(function (context) {
	    return contextHeadingLevel(context) !== null && (headingLevel === null || contextHeadingLevel(context) === headingLevel) && contextTargets(context).includes(target);
	  }).sort(function (left, right) {
	    return contextHeadingLevel(right) - contextHeadingLevel(left) || compareContextSpecificity(model, left, right) || contextTargets(left).length - contextTargets(right).length || contextOrder(right) - contextOrder(left);
	  })[0] || null;
	};
	var nextDeeperHeadingContextForTarget = function nextDeeperHeadingContextForTarget(model, target, context) {
	  var headingLevel = contextHeadingLevel(context);
	  if (!model || !target || headingLevel === null || headingLevel >= 6) {
	    return null;
	  }
	  var deeperContexts = modelStructuralContexts(model).filter(function (candidate) {
	    return contextHeadingLevel(candidate) > headingLevel && contextOrder(candidate) > contextOrder(context) && contextTargets(candidate).includes(target);
	  });
	  var nextHeadingLevel = Math.min.apply(Math, _toConsumableArray(deeperContexts.map(contextHeadingLevel)));
	  if (!Number.isFinite(nextHeadingLevel)) return null;
	  return deeperContexts.filter(function (candidate) {
	    return contextHeadingLevel(candidate) === nextHeadingLevel;
	  }).sort(function (left, right) {
	    return contextOrder(left) - contextOrder(right) || String(contextId(left)).localeCompare(String(contextId(right)));
	  })[0] || null;
	};
	var headingContextForRoute = function headingContextForRoute(model, context, target) {
	  if (!model || !context) return null;
	  if (context === model.rootContext) {
	    return headingContextForTarget(model, target);
	  }
	  if (contextHeadingLevel(context) !== null) return context;
	  var ancestor = parentContext(model, context);
	  var seen = new Set();
	  while (ancestor && !seen.has(ancestor)) {
	    if (contextHeadingLevel(ancestor) !== null) return ancestor;
	    seen.add(ancestor);
	    ancestor = parentContext(model, ancestor);
	  }
	  return headingContextForTarget(model, target);
	};

	/**
	 * Finds the authored outline parent for a heading-backed context. Walking
	 * backward to the nearest lower-level heading prevents inferred DOM container
	 * ancestry from skipping the heading level that visually and semantically
	 * introduces the current context.
	 */
	var previousBroaderHeadingContext = function previousBroaderHeadingContext(model, context) {
	  var headingLevel = contextHeadingLevel(context);
	  if (headingLevel === null || headingLevel <= 1) return null;
	  var orderedContexts = modelStructuralContexts(model).sort(function (left, right) {
	    return contextOrder(left) - contextOrder(right) || String(contextId(left)).localeCompare(String(contextId(right)));
	  });
	  var currentIndex = orderedContexts.indexOf(context);
	  if (currentIndex <= 0) return null;
	  for (var index = currentIndex - 1; index >= 0; index -= 1) {
	    var candidate = orderedContexts[index];
	    var candidateHeadingLevel = contextHeadingLevel(candidate);
	    if (candidateHeadingLevel !== null && candidateHeadingLevel < headingLevel) {
	      return contextTargets(candidate).length > 0 ? candidate : null;
	    }
	  }
	  return null;
	};

	/**
	 * Finds the next page-forward context at the closest available deeper
	 * authored heading level. Semantic nesting is deliberately excluded from the
	 * level model, and skipped heading ranks do not create a dead end.
	 */
	var nextNarrowFallbackContext = function nextNarrowFallbackContext(model, context) {
	  var headingLevel = contextHeadingLevel(context);
	  if (headingLevel === null || headingLevel >= 6) return null;
	  var orderedContexts = modelStructuralContexts(model).filter(function (candidate) {
	    return contextTargets(candidate).length > 0;
	  }).sort(function (left, right) {
	    return contextOrder(left) - contextOrder(right) || String(contextId(left)).localeCompare(String(contextId(right)));
	  });
	  var currentIndex = orderedContexts.indexOf(context);
	  var followingContexts = currentIndex >= 0 ? orderedContexts.slice(currentIndex + 1) : orderedContexts;
	  var deeperContexts = followingContexts.filter(function (candidate) {
	    return contextHeadingLevel(candidate) > headingLevel;
	  });
	  var nextHeadingLevel = Math.min.apply(Math, _toConsumableArray(deeperContexts.map(contextHeadingLevel)));
	  if (!Number.isFinite(nextHeadingLevel)) return null;
	  return deeperContexts.find(function (candidate) {
	    return contextHeadingLevel(candidate) === nextHeadingLevel;
	  }) || null;
	};

	/**
	 * An unassociated region has no heading rank. A vertical command enters the
	 * authored heading-level ladder from the requested edge; DOM containment
	 * never supplies an implicit starting rank.
	 */
	var headingEdgeEntryContext = function headingEdgeEntryContext(model, direction) {
	  if (direction === 0) return null;
	  var headingContexts = modelStructuralContexts(model).filter(function (candidate) {
	    return contextTargets(candidate).length > 0 && contextHeadingLevel(candidate) !== null;
	  }).sort(function (left, right) {
	    return contextOrder(left) - contextOrder(right) || String(contextId(left)).localeCompare(String(contextId(right)));
	  });
	  var headingLevels = headingContexts.map(contextHeadingLevel);
	  var destinationLevel = direction < 0 ? Math.max.apply(Math, _toConsumableArray(headingLevels)) : Math.min.apply(Math, _toConsumableArray(headingLevels));
	  if (!Number.isFinite(destinationLevel)) return null;
	  var destinations = headingContexts.filter(function (candidate) {
	    return contextHeadingLevel(candidate) === destinationLevel;
	  });
	  return direction < 0 ? destinations[destinations.length - 1] || null : destinations[0] || null;
	};
	var targetName = function targetName(target) {
	  var _target$getAttribute, _target$getAttribute2, _target$tagName;
	  if (!target) return '';
	  if ((0, _domUtilities$1.hasAriaHiddenAncestor)(target)) {
	    return target.tagName ? target.tagName.toLowerCase() : 'target';
	  }
	  var explicitName = (0, _accessibilityName.getExplicitAccessibleName)(target);
	  if (explicitName) return explicitName;
	  var labelText = Array.from(target.labels || []).map(function (label) {
	    return (0, _accessibilityName.normalizeText)(label.textContent);
	  }).filter(Boolean).join(' ');
	  if (labelText) return labelText;
	  var value = ((_target$getAttribute = target.getAttribute) === null || _target$getAttribute === void 0 ? void 0 : _target$getAttribute.call(target, 'title')) || ((_target$getAttribute2 = target.getAttribute) === null || _target$getAttribute2 === void 0 ? void 0 : _target$getAttribute2.call(target, 'name')) || target.textContent;
	  var normalized = (0, _accessibilityName.normalizeText)(value);
	  return normalized.slice(0, 80) || ((_target$tagName = target.tagName) === null || _target$tagName === void 0 ? void 0 : _target$tagName.toLowerCase()) || 'target';
	};
	var topmostNativeModal = function topmostNativeModal(documentObject) {
	  if (!(documentObject !== null && documentObject !== void 0 && documentObject.querySelectorAll)) return null;
	  try {
	    var modals = Array.from(documentObject.querySelectorAll('dialog:modal'));
	    var focused = (0, _domUtilities$1.getDeepActiveElement)(documentObject);
	    var focusedModals = modals.filter(function (modal) {
	      return (0, _domUtilities$1.isComposedWithin)(modal, focused);
	    });
	    if (focusedModals.length) {
	      return focusedModals[focusedModals.length - 1];
	    }
	    return modals[modals.length - 1] || null;
	  } catch (error) {
	    return null;
	  }
	};
	var resolveSelectorRoot = function resolveSelectorRoot(value, documentObject) {
	  if (typeof value !== 'string') return value;
	  return documentObject.querySelector(value);
	};
	var openShadowRootsWithin = function openShadowRootsWithin(root) {
	  var roots = new Set();
	  var _visit = function visit(scope) {
	    if ((0, _domUtilities$1.isShadowRoot)(scope)) roots.add(scope);
	    if (!(scope !== null && scope !== void 0 && scope.querySelectorAll)) return;
	    scope.querySelectorAll('*').forEach(function (element) {
	      if (element.shadowRoot) _visit(element.shadowRoot);
	    });
	  };
	  _visit(root);
	  return roots;
	};
	var mutationBelongsOnlyToGeneratedUI = function mutationBelongsOnlyToGeneratedUI(mutation) {
	  var changedNodes = [].concat(_toConsumableArray(Array.from(mutation.addedNodes || [])), _toConsumableArray(Array.from(mutation.removedNodes || [])));
	  var candidates = changedNodes.length ? changedNodes : [mutation.target];
	  return candidates.length > 0 && candidates.every(function (node) {
	    var element = (0, _domUtilities$1.isElement)(node) ? node : node.parentElement || mutation.target;
	    return element && (0, _domUtilities$1.isOpenKeyNavGeneratedUI)(element);
	  });
	};
	var elementClientRects = function elementClientRects(element) {
	  if (!(element !== null && element !== void 0 && element.getBoundingClientRect)) return [];
	  var rects = [];
	  if (typeof element.getClientRects === 'function') {
	    rects = Array.from(element.getClientRects());
	  }
	  if (!rects.length) rects = [element.getBoundingClientRect()];
	  return rects.filter(function (rect) {
	    return [rect.left, rect.top, rect.right, rect.bottom].every(Number.isFinite) && rect.right > rect.left && rect.bottom > rect.top;
	  });
	};
	var unionClientRects = function unionClientRects(rects) {
	  if (!rects.length) return null;
	  return rects.reduce(function (union, rect) {
	    return {
	      left: Math.min(union.left, rect.left),
	      top: Math.min(union.top, rect.top),
	      right: Math.max(union.right, rect.right),
	      bottom: Math.max(union.bottom, rect.bottom)
	    };
	  }, {
	    left: rects[0].left,
	    top: rects[0].top,
	    right: rects[0].right,
	    bottom: rects[0].bottom
	  });
	};
	structuralNavigation.StructuralNavigationController = /*#__PURE__*/function () {
	  function StructuralNavigationController(openKeyNav) {
	    _classCallCheck$1(this, StructuralNavigationController);
	    this.openKeyNav = openKeyNav;
	    this.document = typeof document === 'undefined' ? null : document;
	    this.root = null;
	    this.model = null;
	    this.targets = [];
	    this.targetSet = new Set();
	    this.currentTarget = null;
	    this.activeStructuralContext = null;
	    this.activeTypedContext = null;
	    this.statusDismissed = false;
	    this.dirty = true;
	    this.observer = null;
	    this.observedShadowRoots = new Set();
	    this.focusSyncToken = 0;
	    this.contextIndicatorElement = null;
	    this.contextIndicatorHeadingLevelElement = null;
	    this.contextIndicatorFrame = null;
	    this.contextIndicatorResizeObserver = null;
	    this.contextIndicatorObservedElements = new Set();
	    this.transientContextIndicatorVisible = false;
	    this.keylabelUpdateFrame = null;
	    this.keylabelUpdateTimer = null;
	    this.updatingKeylabels = false;
	    this.foregroundModeWasActive = false;
	    this.handleFocusIn = this.handleFocusIn.bind(this);
	    this.handleMutations = this.handleMutations.bind(this);
	    this.handleSlotChange = this.handleSlotChange.bind(this);
	    this.invalidate = this.invalidate.bind(this);
	    this.handleModeLayerChange = this.handleModeLayerChange.bind(this);
	    this.scheduleContextIndicatorUpdate = this.scheduleContextIndicatorUpdate.bind(this);
	    this.scheduleKeylabelUpdate = this.scheduleKeylabelUpdate.bind(this);

	    // Structural navigation consumes the keylabel renderer as a one-way
	    // dependency. Signal changes pause hints under foreground modes and restore
	    // them when the structural layer becomes visible again.
	    (0, _signals.effect)(this.handleModeLayerChange);
	  }
	  return _createClass$1(StructuralNavigationController, [{
	    key: "config",
	    get: function get() {
	      return this.openKeyNav.config.modesConfig.structuralNavigation;
	    }
	  }, {
	    key: "active",
	    get: function get() {
	      return Boolean(this.openKeyNav.config.modes.structuralNavigation.value);
	    }
	  }, {
	    key: "foregroundModeActive",
	    get: function get() {
	      return Boolean(this.openKeyNav.config.modes.clicking.value || this.openKeyNav.config.modes.moving.value || this.openKeyNav.config.modes.menu.value);
	    }
	  }, {
	    key: "handleModeLayerChange",
	    value: function handleModeLayerChange() {
	      var active = this.active;
	      var foregroundModeActive = this.foregroundModeActive;
	      var resumedFromForeground = this.foregroundModeWasActive && !foregroundModeActive;
	      this.foregroundModeWasActive = foregroundModeActive;
	      if (!active || foregroundModeActive) {
	        if (foregroundModeActive) this.clearTransientContextIndicator();
	        this.cancelKeylabelUpdate();
	        this.clearKeylabels();
	        return;
	      }
	      if (resumedFromForeground && this.dirty) this.refresh();
	      if (!this.updatingKeylabels) this.scheduleKeylabelUpdate();
	    }
	  }, {
	    key: "resolveActiveRoot",
	    value: function resolveActiveRoot() {
	      var details = {
	        document: this.document,
	        openKeyNav: this.openKeyNav,
	        activeElement: (0, _domUtilities$1.getDeepActiveElement)(this.document)
	      };
	      var configured = resolveSelectorRoot(resolveValue(this.config.activeRoot, details), this.document);
	      var customRoot = (0, _domUtilities$1.isDocument)(configured) || (0, _domUtilities$1.isShadowRoot)(configured) && configured.host.isConnected || (0, _domUtilities$1.isElement)(configured) && configured.isConnected ? configured : null;
	      var modal = topmostNativeModal(this.document);
	      if (!modal) return customRoot || this.document;
	      if (customRoot && customRoot !== this.document && (0, _domUtilities$1.isComposedWithin)(modal, customRoot)) {
	        return customRoot;
	      }
	      return modal;
	    }
	  }, {
	    key: "resolveContributions",
	    value: function resolveContributions(value) {
	      var details = {
	        root: this.root,
	        targets: this.targets.slice(),
	        openKeyNav: this.openKeyNav
	      };
	      var resolved = resolveValue(value, details);
	      return Array.from(resolved || []);
	    }
	  }, {
	    key: "activate",
	    value: function activate() {
	      var _this$document$defaul2;
	      if (!this.document || !this.openKeyNav.meta.enabled.value || !this.config.enabled) {
	        return false;
	      }
	      if (this.active) {
	        var _this$document$defaul;
	        this.openKeyNav.clearStatus(STRUCTURAL_EXIT_STATUS_CHANNEL);
	        this.document.addEventListener('focusin', this.handleFocusIn, true);
	        this.document.addEventListener('change', this.invalidate, true);
	        this.document.addEventListener('toggle', this.invalidate, true);
	        this.document.addEventListener('beforetoggle', this.invalidate, true);
	        (_this$document$defaul = this.document.defaultView) === null || _this$document$defaul === void 0 || _this$document$defaul.addEventListener('popstate', this.invalidate);
	        this.connectContextIndicatorListeners();
	        this.refresh();
	        this.updateStatus('Structural navigation active.');
	        return true;
	      }
	      if (this.openKeyNav.config.modes.clicking.value || this.openKeyNav.config.modes.moving.value || this.openKeyNav.config.modes.menu.value) {
	        this.openKeyNav.removeOverlays(true);
	      }
	      this.openKeyNav.config.modes.structuralNavigation.value = true;
	      this.statusDismissed = false;
	      this.openKeyNav.clearStatus(STRUCTURAL_EXIT_STATUS_CHANNEL);
	      this.dirty = true;
	      this.document.addEventListener('focusin', this.handleFocusIn, true);
	      this.document.addEventListener('change', this.invalidate, true);
	      this.document.addEventListener('toggle', this.invalidate, true);
	      this.document.addEventListener('beforetoggle', this.invalidate, true);
	      (_this$document$defaul2 = this.document.defaultView) === null || _this$document$defaul2 === void 0 || _this$document$defaul2.addEventListener('popstate', this.invalidate);
	      this.connectContextIndicatorListeners();
	      this.refresh();
	      this.synchronizeFocus({
	        preserveRoute: false,
	        announce: false,
	        refresh: false
	      });
	      this.updateStatus('Structural navigation active.');
	      return true;
	    }
	  }, {
	    key: "deactivate",
	    value: function deactivate() {
	      var _this$document, _this$document2, _this$document3, _this$document4, _this$document5;
	      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        _ref2$announce = _ref2.announce,
	        announce = _ref2$announce === void 0 ? true : _ref2$announce;
	      if (!this.active && !this.model && !this.observer && !this.openKeyNav.getStatusElement(STRUCTURAL_STATUS_CHANNEL) && !this.contextIndicatorElement) {
	        return false;
	      }
	      var statusConfig = this.config.status || {};
	      var statusWasDismissed = this.statusDismissed;
	      var configuredExitDuration = Number(this.openKeyNav.config.notifications.duration);
	      var exitDuration = Number.isFinite(configuredExitDuration) && configuredExitDuration > 0 ? configuredExitDuration : 3000;
	      var announceExit = Boolean(announce && statusConfig.enabled && statusConfig.announcements !== false);
	      var exitHost = this.root;
	      this.openKeyNav.config.modes.structuralNavigation.value = false;
	      (_this$document = this.document) === null || _this$document === void 0 || _this$document.removeEventListener('focusin', this.handleFocusIn, true);
	      (_this$document2 = this.document) === null || _this$document2 === void 0 || _this$document2.removeEventListener('change', this.invalidate, true);
	      (_this$document3 = this.document) === null || _this$document3 === void 0 || _this$document3.removeEventListener('toggle', this.invalidate, true);
	      (_this$document4 = this.document) === null || _this$document4 === void 0 || _this$document4.removeEventListener('beforetoggle', this.invalidate, true);
	      (_this$document5 = this.document) === null || _this$document5 === void 0 || (_this$document5 = _this$document5.defaultView) === null || _this$document5 === void 0 || _this$document5.removeEventListener('popstate', this.invalidate);
	      this.disconnectContextIndicatorListeners();
	      this.disconnectObservers();
	      this.cancelKeylabelUpdate();
	      this.clearKeylabels();
	      this.openKeyNav.clearStatus(STRUCTURAL_STATUS_CHANNEL);
	      this.openKeyNav.clearStatus(STRUCTURAL_EXIT_STATUS_CHANNEL);
	      this.removeContextIndicator();
	      this.root = null;
	      this.model = null;
	      this.targets = [];
	      this.targetSet.clear();
	      this.currentTarget = null;
	      this.activeStructuralContext = null;
	      this.activeTypedContext = null;
	      this.statusDismissed = false;
	      this.transientContextIndicatorVisible = false;
	      this.dirty = true;
	      this.focusSyncToken += 1;
	      if (announceExit) {
	        this.openKeyNav.setStatus(STRUCTURAL_EXIT_STATUS_CHANNEL, 'Structural navigation off.', {
	          className: 'openKeyNav-structural-exit-status',
	          ui: 'structural-status',
	          politeness: 'polite',
	          visible: this.config.debug === true && statusConfig.visible !== false && !statusWasDismissed,
	          duration: exitDuration,
	          toolName: this.openKeyNav.config.notifications.displayToolName,
	          host: exitHost
	        });
	      }
	      return true;
	    }
	  }, {
	    key: "handleKeyDown",
	    value: function handleKeyDown(event) {
	      var _this = this;
	      if (!this.document || !this.openKeyNav.meta.enabled.value || !this.config.enabled || event.isComposing || event.keyCode === 229) {
	        return false;
	      }
	      var ownership = classifyStructuralKeyOwnership(event, this.config);
	      var activationShortcut = {
	        key: this.openKeyNav.config.keys.structuralNavigation
	      };
	      if (!this.active) {
	        if (this.openKeyNav.config.modes.clicking.value || this.openKeyNav.config.modes.moving.value || this.openKeyNav.config.modes.menu.value || ownership.character || !matchesStructuralShortcut(event, activationShortcut)) {
	          return false;
	        }
	        (0, _keyboardEvents.preventAcceptedCommand)(event);
	        this.activate();
	        return true;
	      }
	      if (!this.model) this.activate();
	      var defaultExit = {
	        key: this.openKeyNav.config.keys.structuralNavigation,
	        altKey: true
	      };
	      var exitShortcut = (0, _keyboardEvents.normalizeShortcut)(this.config.exitCommand) || defaultExit;
	      var configuredExit = matchesStructuralShortcut(event, exitShortcut);
	      var foregroundModeActive = this.foregroundModeActive;

	      // Click, Move, and menu are temporary layers over structural navigation.
	      // Their keystrokes take priority until they finish. The deliberately
	      // configured structural exit remains available (Alt+R by default).
	      if (foregroundModeActive) {
	        if (configuredExit) {
	          (0, _keyboardEvents.preventAcceptedCommand)(event);
	          this.deactivate();
	          return true;
	        }
	        return false;
	      }
	      var plainToggle = matchesStructuralShortcut(event, activationShortcut);
	      var openKeyNavExit = matchesStructuralShortcut(event, {
	        key: this.openKeyNav.config.keys.escape
	      });
	      var safeEscape = this.config.escapeExits && event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && !ownership.escape;
	      if (configuredExit || safeEscape || (plainToggle || openKeyNavExit) && !ownership.character) {
	        (0, _keyboardEvents.preventAcceptedCommand)(event);
	        this.deactivate();
	        return true;
	      }
	      var statusConfig = this.config.status || {};
	      var dismissShortcut = (0, _keyboardEvents.normalizeShortcut)(statusConfig.dismissCommand);
	      var dismissIsArrowKey = event.key.startsWith('Arrow');
	      var dismissIsCharacterKey = event.key.length === 1;
	      var pageOwnsDismissShortcut = Boolean(ownership.all || event.key === 'Escape' && ownership.escape || dismissIsArrowKey && ownership.arrows || dismissIsCharacterKey && ownership.character);
	      var dismissStatus = Boolean(dismissShortcut && this.config.debug === true && statusConfig.enabled !== false && statusConfig.visible !== false && !this.statusDismissed && this.openKeyNav.getStatusElement(STRUCTURAL_STATUS_CHANNEL) && !pageOwnsDismissShortcut && matchesStructuralShortcut(event, dismissShortcut));
	      if (dismissStatus) {
	        (0, _keyboardEvents.preventAcceptedCommand)(event);
	        this.clearTransientContextIndicator();
	        this.statusDismissed = true;
	        this.updateStatus('Status closed.');
	        return true;
	      }
	      var contextStartCommand = [STRUCTURAL_NAVIGATION_COMMANDS.previousContextStart, STRUCTURAL_NAVIGATION_COMMANDS.nextContextStart].find(function (command) {
	        return matchesStructuralShortcut(event, _this.contextStartShortcut(command === STRUCTURAL_NAVIGATION_COMMANDS.previousContextStart ? -1 : 1));
	      });
	      if (contextStartCommand && !ownership.all) {
	        (0, _keyboardEvents.preventAcceptedCommand)(event);
	        this.execute(contextStartCommand);
	        return true;
	      }
	      var focusedTarget = (0, _domUtilities$1.getDeepActiveElement)(this.root) || event.target;
	      var nativeKeyboardScroll = isNativeKeyboardScroll(event, ownership, focusedTarget);
	      var configuredScrollCommand = Boolean(!ownership.all && !ownership.character && matchesStructuralShortcut(event, {
	        key: this.openKeyNav.config.keys.scroll
	      }, {
	        allowedExtraModifiers: ['shiftKey']
	      }));
	      var preservesContextIndicator = Boolean(nativeKeyboardScroll || configuredScrollCommand);
	      if (event.key === 'Tab' || event.key === 'Enter' || (event.key === ' ' || event.key === 'Spacebar') && !nativeKeyboardScroll || event.key === 'Escape') {
	        this.clearTransientContextIndicator();
	        return false;
	      }
	      var isArrowKey = event.key.startsWith('Arrow');
	      var isCharacterKey = event.key.length === 1;
	      var ownsArrow = isArrowKey && ownership.arrows;
	      var configuredOverrideModifier = this.config.overrideModifier;
	      var overrideModifier = _keyboardEvents.MODIFIER_KEYS.includes(configuredOverrideModifier) ? configuredOverrideModifier : null;
	      var overridePressed = Boolean(overrideModifier && event[overrideModifier]);
	      var overridesArrowOwnership = ownsArrow && overridePressed;
	      if (ownership.all || ownsArrow && !overridesArrowOwnership || isCharacterKey && ownership.character) {
	        this.clearTransientContextIndicator();
	        return false;
	      }
	      var commandEntries = Object.entries(this.config.commands || {});
	      var exactMatch = commandEntries.find(function (_ref3) {
	        var _ref4 = _slicedToArray$1(_ref3, 2),
	          shortcut = _ref4[1];
	        return matchesStructuralShortcut(event, shortcut);
	      });
	      // Option/Alt is an ownership override, not part of the structural arrow
	      // chord. Once held, it may stay held as focus leaves a widget. Exact
	      // bindings still win, and explicit modifier requirements remain exact.
	      var matched = exactMatch || (isArrowKey && overridePressed ? commandEntries.find(function (_ref5) {
	        var _ref6 = _slicedToArray$1(_ref5, 2),
	          shortcut = _ref6[1];
	        return matchesStructuralShortcut(event, shortcut, {
	          allowedExtraModifiers: [overrideModifier]
	        });
	      }) : null);
	      if (!matched) {
	        if (!preservesContextIndicator && !MODIFIER_KEY_EVENTS.has(event.key)) {
	          this.clearTransientContextIndicator();
	        }
	        return false;
	      }
	      (0, _keyboardEvents.preventAcceptedCommand)(event);
	      this.execute(matched[0]);
	      return true;
	    }
	  }, {
	    key: "execute",
	    value: function execute(command) {
	      if (!this.active || !Object.values(STRUCTURAL_NAVIGATION_COMMANDS).includes(command)) {
	        return false;
	      }

	      // A newly accepted command supersedes any settled-focus callback queued by
	      // an earlier command. The command synchronizes current focus immediately.
	      this.focusSyncToken += 1;
	      this.refresh();
	      this.synchronizeFocus({
	        preserveRoute: true,
	        announce: false,
	        refresh: false
	      });
	      if (!HEADING_CONTEXT_ARROW_COMMANDS.has(command)) {
	        this.clearTransientContextIndicator();
	      }
	      switch (command) {
	        case STRUCTURAL_NAVIGATION_COMMANDS.previousTarget:
	          this.moveTarget(-1);
	          break;
	        case STRUCTURAL_NAVIGATION_COMMANDS.nextTarget:
	          this.moveTarget(1);
	          break;
	        case STRUCTURAL_NAVIGATION_COMMANDS.previousContextStart:
	          this.moveContextStart(-1);
	          break;
	        case STRUCTURAL_NAVIGATION_COMMANDS.nextContextStart:
	          this.moveContextStart(1);
	          break;
	        case STRUCTURAL_NAVIGATION_COMMANDS.previousSiblingContext:
	          this.moveSiblingContext(-1);
	          break;
	        case STRUCTURAL_NAVIGATION_COMMANDS.nextSiblingContext:
	          this.moveSiblingContext(1);
	          break;
	        case STRUCTURAL_NAVIGATION_COMMANDS.broadenContext:
	          this.broadenContext();
	          break;
	        case STRUCTURAL_NAVIGATION_COMMANDS.narrowContext:
	          this.narrowContext();
	          break;
	        case STRUCTURAL_NAVIGATION_COMMANDS.previousPeerContext:
	          this.cyclePeerContext(-1);
	          break;
	        case STRUCTURAL_NAVIGATION_COMMANDS.nextPeerContext:
	          this.cyclePeerContext(1);
	          break;
	        default:
	          return false;
	      }
	      return true;
	    }
	  }, {
	    key: "refresh",
	    value: function refresh() {
	      var _this2 = this;
	      if (!this.active) return false;
	      var resolvedRoot = this.resolveActiveRoot();
	      if (resolvedRoot !== this.root) {
	        this.root = resolvedRoot;
	        this.dirty = true;
	      }
	      if (!this.dirty && this.model) return false;
	      var previousModel = this.model;
	      var previousStructuralId = contextId(this.activeStructuralContext);
	      var previousTypedId = contextId(this.activeTypedContext);
	      var previousActiveContextId = previousTypedId || previousStructuralId;
	      var previousTarget = this.currentTarget;
	      var targetFilter = typeof this.config.targetFilter === 'function' ? function (target) {
	        return _this2.config.targetFilter(target, {
	          root: _this2.root,
	          openKeyNav: _this2.openKeyNav
	        });
	      } : null;
	      this.targets = (0, _tabbableTargets.discoverTabbableTargets)(this.root, {
	        displayCheck: this.config.displayCheck || 'full',
	        getShadowRoot: true,
	        includeProgrammatic: Boolean(this.config.includeProgrammatic),
	        targetFilter: targetFilter
	      });
	      this.targetSet = new Set(this.targets);
	      this.model = (0, _structuralModel.buildStructuralModel)({
	        root: this.root,
	        targets: this.targets,
	        structuralContexts: this.resolveContributions(this.config.structuralContexts),
	        typedContexts: this.resolveContributions(this.config.typedContexts),
	        previousModel: previousModel
	      });
	      this.dirty = false;
	      this.reconnectObservers();
	      var focused = (0, _domUtilities$1.getDeepActiveElement)(this.root);
	      this.currentTarget = this.targetSet.has(focused) ? focused : this.targetSet.has(previousTarget) ? previousTarget : null;
	      var preservedStructural = modelContextById(this.model, previousStructuralId);
	      var direct = directContextForTarget(this.model, this.currentTarget);
	      this.activeStructuralContext = preservedStructural && (!this.currentTarget || contextTargets(preservedStructural).includes(this.currentTarget)) ? preservedStructural : direct || this.model.rootContext;
	      var preservedTyped = modelTypedContextById(this.model, previousTypedId);
	      this.activeTypedContext = preservedTyped && this.currentTarget && contextTargets(preservedTyped).includes(this.currentTarget) ? preservedTyped : null;
	      this.showContextChange(previousActiveContextId);
	      this.scheduleContextIndicatorUpdate();
	      if (!this.updatingKeylabels) this.scheduleKeylabelUpdate();
	      return true;
	    }
	  }, {
	    key: "synchronizeFocus",
	    value: function synchronizeFocus() {
	      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        _ref7$preserveRoute = _ref7.preserveRoute,
	        preserveRoute = _ref7$preserveRoute === void 0 ? true : _ref7$preserveRoute,
	        _ref7$announce = _ref7.announce,
	        announce = _ref7$announce === void 0 ? true : _ref7$announce,
	        _ref7$refresh = _ref7.refresh,
	        refresh = _ref7$refresh === void 0 ? true : _ref7$refresh;
	      if (!this.active) return;
	      var previousActiveContextId = contextId(this.activeTypedContext || this.activeStructuralContext);
	      if (refresh) this.refresh();
	      var focused = (0, _domUtilities$1.getDeepActiveElement)(this.root);
	      if (!this.targetSet.has(focused)) {
	        var _this$document6, _this$document7;
	        this.currentTarget = null;
	        this.activeTypedContext = null;
	        var ambientDocumentFocus = Boolean(focused === ((_this$document6 = this.document) === null || _this$document6 === void 0 ? void 0 : _this$document6.body) || focused === ((_this$document7 = this.document) === null || _this$document7 === void 0 ? void 0 : _this$document7.documentElement));
	        if (!ambientDocumentFocus) {
	          var _this$model;
	          this.activeStructuralContext = structuralContextForElement(this.model, focused) || this.activeStructuralContext || ((_this$model = this.model) === null || _this$model === void 0 ? void 0 : _this$model.rootContext) || null;
	        } else if (!this.activeStructuralContext) {
	          var _this$model2;
	          this.activeStructuralContext = ((_this$model2 = this.model) === null || _this$model2 === void 0 ? void 0 : _this$model2.rootContext) || null;
	        }
	        this.showContextChange(previousActiveContextId);
	        this.scheduleKeylabelUpdate();
	        if (announce) this.updateStatus();
	        return;
	      }
	      var hadCurrentTarget = Boolean(this.currentTarget);
	      this.currentTarget = focused;
	      var direct = directContextForTarget(this.model, focused) || this.model.rootContext;
	      if (this.activeTypedContext && !contextTargets(this.activeTypedContext).includes(focused)) {
	        this.activeTypedContext = null;
	      }
	      if (!this.activeTypedContext) {
	        var routeStillContainsTarget = preserveRoute && hadCurrentTarget && this.activeStructuralContext && contextTargets(this.activeStructuralContext).includes(focused);
	        if (!routeStillContainsTarget) this.activeStructuralContext = direct;
	      }
	      this.showContextChange(previousActiveContextId);
	      this.scheduleKeylabelUpdate();
	      if (announce) this.updateStatus();
	    }
	  }, {
	    key: "handleFocusIn",
	    value: function handleFocusIn() {
	      var _this3 = this;
	      if (!this.active) return;
	      var token = ++this.focusSyncToken;
	      setTimeout(function () {
	        if (_this3.active && token === _this3.focusSyncToken) {
	          _this3.synchronizeFocus({
	            preserveRoute: true
	          });
	        }
	      }, 0);
	    }
	  }, {
	    key: "handleMutations",
	    value: function handleMutations(mutations) {
	      if (!this.active) return;
	      if (mutations.every(mutationBelongsOnlyToGeneratedUI)) return;
	      this.dirty = true;
	      this.scheduleContextIndicatorUpdate();
	      this.clearKeylabels();
	      this.scheduleKeylabelUpdate();
	    }
	  }, {
	    key: "invalidate",
	    value: function invalidate() {
	      if (this.active) {
	        this.dirty = true;
	        this.scheduleContextIndicatorUpdate();
	        this.clearKeylabels();
	        this.scheduleKeylabelUpdate();
	      }
	    }
	  }, {
	    key: "handleSlotChange",
	    value: function handleSlotChange(event) {
	      if ((0, _domUtilities$1.isOpenKeyNavGeneratedUI)(event.target)) return;
	      this.dirty = true;
	      this.scheduleContextIndicatorUpdate();
	      this.clearKeylabels();
	      this.scheduleKeylabelUpdate();
	    }
	  }, {
	    key: "reconnectObservers",
	    value: function reconnectObservers() {
	      var _this4 = this;
	      this.disconnectObservers();
	      if (typeof MutationObserver === 'undefined') return;
	      this.observer = new MutationObserver(this.handleMutations);
	      var documentRoot = this.document.documentElement;
	      if (documentRoot) {
	        this.observer.observe(documentRoot, {
	          subtree: true,
	          childList: true,
	          characterData: true,
	          attributes: true,
	          attributeFilter: ['aria-hidden', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-modal', 'checked', 'class', 'contenteditable', 'controls', 'disabled', 'href', 'hidden', 'id', 'inert', 'name', 'open', 'popover', 'role', 'style', 'tabindex', 'type']
	        });
	      }
	      this.observedShadowRoots = openShadowRootsWithin(this.root);
	      this.observedShadowRoots.forEach(function (shadowRoot) {
	        _this4.observer.observe(shadowRoot, {
	          subtree: true,
	          childList: true,
	          characterData: true,
	          attributes: true,
	          attributeFilter: ['aria-hidden', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-modal', 'checked', 'class', 'contenteditable', 'controls', 'disabled', 'href', 'hidden', 'id', 'inert', 'name', 'open', 'popover', 'role', 'style', 'tabindex', 'type']
	        });
	        shadowRoot.addEventListener('slotchange', _this4.handleSlotChange);
	      });
	    }
	  }, {
	    key: "disconnectObservers",
	    value: function disconnectObservers() {
	      var _this$observer,
	        _this5 = this;
	      (_this$observer = this.observer) === null || _this$observer === void 0 || _this$observer.disconnect();
	      this.observer = null;
	      this.observedShadowRoots.forEach(function (shadowRoot) {
	        shadowRoot.removeEventListener('slotchange', _this5.handleSlotChange);
	      });
	      this.observedShadowRoots.clear();
	    }
	  }, {
	    key: "activeSequence",
	    value: function activeSequence() {
	      var _this6 = this;
	      return contextTargets(this.activeTypedContext || this.activeStructuralContext).filter(function (target) {
	        return _this6.targetSet.has(target) && target.isConnected;
	      });
	    }
	  }, {
	    key: "activeHeadingContext",
	    value: function activeHeadingContext() {
	      var structuralRoute = this.activeTypedContext && this.currentTarget ? directContextForTarget(this.model, this.currentTarget) : this.activeStructuralContext;
	      return headingContextForRoute(this.model, structuralRoute, this.currentTarget);
	    }
	  }, {
	    key: "activeAuthoredHeading",
	    value: function activeAuthoredHeading() {
	      if (!this.active) return null;
	      return authoredHeadingForContext(this.activeHeadingContext());
	    }
	  }, {
	    key: "moveTarget",
	    value: function moveTarget(direction) {
	      var sequence = this.activeSequence();
	      if (!sequence.length) {
	        this.updateStatus('No targets are available in this context.');
	        return;
	      }
	      var currentIndex = sequence.indexOf(this.currentTarget);
	      var nextIndex = currentIndex < 0 ? direction > 0 ? 0 : sequence.length - 1 : currentIndex + direction;
	      if (nextIndex < 0 || nextIndex >= sequence.length) {
	        this.updateStatus(direction > 0 ? 'End of this context.' : 'Start of this context.');
	        return;
	      }
	      this.focusTarget(sequence[nextIndex]);
	    }
	  }, {
	    key: "contextStartShortcut",
	    value: function contextStartShortcut(direction) {
	      var modifier = this.config.overrideModifier;
	      if (!_keyboardEvents.MODIFIER_KEYS.includes(modifier) || modifier === 'shiftKey') {
	        return null;
	      }
	      return _objectSpread(_defineProperty({
	        key: 'Tab'
	      }, modifier, true), direction < 0 ? {
	        shiftKey: true
	      } : {});
	    }
	  }, {
	    key: "contextStartRoute",
	    value: function contextStartRoute() {
	      var _this7 = this;
	      var route = [];
	      var previousContext = null;
	      this.targets.filter(function (target) {
	        return target.tabIndex >= 0;
	      }).forEach(function (target, index) {
	        var _this7$model;
	        var context = directContextForTarget(_this7.model, target) || ((_this7$model = _this7.model) === null || _this7$model === void 0 ? void 0 : _this7$model.rootContext) || null;
	        if (context === previousContext) return;
	        route.push({
	          context: context,
	          target: target,
	          index: index
	        });
	        previousContext = context;
	      });
	      return route;
	    }
	  }, {
	    key: "contextStartDestination",
	    value: function contextStartDestination(direction) {
	      var tabTargets = this.targets.filter(function (target) {
	        return target.tabIndex >= 0;
	      });
	      var route = this.contextStartRoute();
	      if (!route.length) return null;
	      var currentIndex = tabTargets.indexOf(this.currentTarget);
	      if (currentIndex < 0) {
	        return direction > 0 ? route[0] : route[route.length - 1];
	      }
	      var currentRouteIndex = -1;
	      for (var index = 0; index < route.length; index += 1) {
	        if (route[index].index > currentIndex) break;
	        currentRouteIndex = index;
	      }
	      return route[currentRouteIndex + direction] || null;
	    }
	  }, {
	    key: "moveContextStart",
	    value: function moveContextStart(direction) {
	      this.useStructuralRoute();
	      var destination = this.contextStartDestination(direction);
	      if (!destination) {
	        this.updateStatus(direction > 0 ? 'No next context start.' : 'No previous context start.');
	        return;
	      }
	      var previousActiveContextId = contextId(this.activeTypedContext || this.activeStructuralContext);
	      this.activeStructuralContext = destination.context;
	      this.activeTypedContext = null;
	      this.showContextChange(previousActiveContextId);
	      this.focusTarget(destination.target);
	    }
	  }, {
	    key: "focusTarget",
	    value: function focusTarget(target) {
	      var _this8 = this;
	      if (!target || !this.targetSet.has(target) || !target.isConnected) {
	        this.dirty = true;
	        this.updateStatus('That target is no longer available.');
	        return;
	      }
	      this.currentTarget = target;
	      this.openKeyNav.focus(target, {
	        decorate: false
	      });
	      this.updateStatus();
	      var token = ++this.focusSyncToken;
	      setTimeout(function () {
	        if (_this8.active && token === _this8.focusSyncToken) {
	          _this8.synchronizeFocus({
	            preserveRoute: true
	          });
	        }
	      }, 0);
	    }
	  }, {
	    key: "selectAuthoredHeading",
	    value: function selectAuthoredHeading(heading, target) {
	      if (!this.active || !heading || !target) return false;
	      if (this.dirty || !this.model) this.refresh();
	      var context = structuralContextForElement(this.model, heading);
	      if (contextHeadingLevel(context) === null || !this.targetSet.has(target) || !contextTargets(context).includes(target)) {
	        return false;
	      }
	      this.currentTarget = target;
	      this.activeStructuralContext = context;
	      this.activeTypedContext = null;
	      this.showTransientContextIndicator();
	      this.updateStatus();
	      this.scheduleKeylabelUpdate();
	      return true;
	    }
	  }, {
	    key: "moveSiblingContext",
	    value: function moveSiblingContext(direction) {
	      this.useStructuralRoute();
	      var activeContext = this.activeHeadingContext();
	      if (!activeContext) {
	        this.updateStatus('No authored heading context is active.');
	        return;
	      }
	      var _horizontalContextPee = horizontalContextPeers(this.model, activeContext),
	        peers = _horizontalContextPee.contexts,
	        headingLevel = _horizontalContextPee.headingLevel;
	      var currentIndex = peers.indexOf(activeContext);
	      var nextIndex = currentIndex + direction;
	      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= peers.length) {
	        this.updateStatus(direction > 0 ? "No next peer context at heading level ".concat(headingLevel, ".") : "No previous peer context at heading level ".concat(headingLevel, "."));
	        return;
	      }
	      var peer = peers[nextIndex];
	      var target = contextTargets(peer)[0];
	      this.showTransientContextIndicator();
	      this.activeStructuralContext = peer;
	      this.activeTypedContext = null;
	      this.focusTarget(target);
	    }
	  }, {
	    key: "broadenContext",
	    value: function broadenContext() {
	      this.useStructuralRoute();
	      var activeContext = this.activeHeadingContext();
	      if (!activeContext) {
	        var previousHeadingLevel = headingEdgeEntryContext(this.model, -1);
	        if (!previousHeadingLevel) {
	          this.updateStatus('No authored heading level is available.');
	          return;
	        }
	        this.showTransientContextIndicator();
	        this.activeStructuralContext = previousHeadingLevel;
	        this.activeTypedContext = null;
	        this.focusTarget(contextTargets(previousHeadingLevel)[0]);
	        return;
	      }
	      var headingParent = previousBroaderHeadingContext(this.model, activeContext);
	      if (!headingParent) {
	        this.updateStatus('Already at the broadest heading level.');
	        return;
	      }
	      this.showTransientContextIndicator();
	      this.activeStructuralContext = headingParent;
	      this.focusTarget(contextTargets(headingParent)[0]);
	    }
	  }, {
	    key: "narrowContext",
	    value: function narrowContext() {
	      this.useStructuralRoute();
	      var activeContext = this.activeHeadingContext();
	      if (!activeContext) {
	        var nextHeadingLevel = headingEdgeEntryContext(this.model, 1);
	        if (!nextHeadingLevel) {
	          this.updateStatus('No authored heading level is available.');
	          return;
	        }
	        this.showTransientContextIndicator();
	        this.activeStructuralContext = nextHeadingLevel;
	        this.activeTypedContext = null;
	        this.focusTarget(contextTargets(nextHeadingLevel)[0]);
	        return;
	      }
	      var headingLevel = contextHeadingLevel(activeContext);
	      var child = this.currentTarget && headingLevel < 6 ? nextDeeperHeadingContextForTarget(this.model, this.currentTarget, activeContext) : null;
	      if (child) {
	        this.showTransientContextIndicator();
	        this.activeStructuralContext = child;
	        this.updateStatus();
	        return;
	      }
	      if (headingLevel >= 6) {
	        this.updateStatus('Already at heading level 6.');
	        return;
	      }
	      var fallback = nextNarrowFallbackContext(this.model, activeContext);
	      if (!fallback) {
	        this.updateStatus("No next H".concat(headingLevel + 1, " context."));
	        return;
	      }
	      this.showTransientContextIndicator();
	      this.activeStructuralContext = fallback;
	      this.activeTypedContext = null;
	      this.focusTarget(contextTargets(fallback)[0]);
	    }
	  }, {
	    key: "cyclePeerContext",
	    value: function cyclePeerContext(direction) {
	      var _this9 = this;
	      if (!this.currentTarget) {
	        this.updateStatus('No current target has an alternate typed context.');
	        return;
	      }
	      var typed = typedContextsForTarget(this.model, this.currentTarget);
	      if (!typed.length) {
	        this.updateStatus('No alternate typed context is available.');
	        return;
	      }
	      var ring = [null].concat(_toConsumableArray(typed));
	      var previousActiveContextId = contextId(this.activeTypedContext || this.activeStructuralContext);
	      var currentIndex = this.activeTypedContext ? ring.findIndex(function (context) {
	        return contextId(context) === contextId(_this9.activeTypedContext);
	      }) : 0;
	      var normalizedIndex = currentIndex < 0 ? 0 : currentIndex;
	      var nextIndex = (normalizedIndex + direction + ring.length) % ring.length;
	      this.activeTypedContext = ring[nextIndex];
	      if (!this.activeTypedContext) {
	        this.activeStructuralContext = directContextForTarget(this.model, this.currentTarget) || this.model.rootContext;
	      }
	      this.showContextChange(previousActiveContextId);
	      this.updateStatus();
	    }
	  }, {
	    key: "useStructuralRoute",
	    value: function useStructuralRoute() {
	      if (!this.activeTypedContext) return;
	      var previousActiveContextId = contextId(this.activeTypedContext);
	      this.activeTypedContext = null;
	      this.activeStructuralContext = directContextForTarget(this.model, this.currentTarget) || this.activeStructuralContext || this.model.rootContext;
	      this.showContextChange(previousActiveContextId);
	    }
	  }, {
	    key: "clearKeylabels",
	    value: function clearKeylabels() {
	      (0, _keylabels.clearAssignedKeylabels)(this.openKeyNav, STRUCTURAL_KEYLABEL_OWNER);
	    }
	  }, {
	    key: "cancelKeylabelUpdate",
	    value: function cancelKeylabelUpdate() {
	      var _this$document8;
	      var view = (_this$document8 = this.document) === null || _this$document8 === void 0 ? void 0 : _this$document8.defaultView;
	      if (this.keylabelUpdateFrame !== null && typeof (view === null || view === void 0 ? void 0 : view.cancelAnimationFrame) === 'function') {
	        view.cancelAnimationFrame(this.keylabelUpdateFrame);
	      }
	      if (this.keylabelUpdateTimer !== null) {
	        clearTimeout(this.keylabelUpdateTimer);
	      }
	      this.keylabelUpdateFrame = null;
	      this.keylabelUpdateTimer = null;
	    }
	  }, {
	    key: "scheduleKeylabelUpdate",
	    value: function scheduleKeylabelUpdate() {
	      var _this$config$keylabel,
	        _this0 = this,
	        _this$document9;
	      if (!this.active || this.foregroundModeActive || ((_this$config$keylabel = this.config.keylabels) === null || _this$config$keylabel === void 0 ? void 0 : _this$config$keylabel.enabled) === false || this.keylabelUpdateFrame !== null || this.keylabelUpdateTimer !== null) {
	        var _this$config$keylabel2;
	        if (((_this$config$keylabel2 = this.config.keylabels) === null || _this$config$keylabel2 === void 0 ? void 0 : _this$config$keylabel2.enabled) === false) this.clearKeylabels();
	        return;
	      }
	      var update = function update() {
	        _this0.keylabelUpdateFrame = null;
	        _this0.keylabelUpdateTimer = null;
	        _this0.updateKeylabels();
	      };
	      var view = (_this$document9 = this.document) === null || _this$document9 === void 0 ? void 0 : _this$document9.defaultView;
	      if (typeof (view === null || view === void 0 ? void 0 : view.requestAnimationFrame) === 'function') {
	        this.keylabelUpdateFrame = view.requestAnimationFrame(update);
	      } else {
	        this.keylabelUpdateTimer = setTimeout(update, 0);
	      }
	    }
	  }, {
	    key: "keylabelAssignments",
	    value: function keylabelAssignments() {
	      var _this$document0,
	        _this$document1,
	        _this1 = this,
	        _this$model3;
	      var assignments = [];
	      var keylabelConfig = this.config.keylabels || {};
	      var tabTargets = this.targets.filter(function (target) {
	        return target.tabIndex >= 0;
	      });
	      var currentTabIndex = tabTargets.indexOf(this.currentTarget);
	      var focused = (0, _domUtilities$1.getDeepActiveElement)(this.root);
	      var hasInitialDocumentFocus = (0, _domUtilities$1.isDocument)(this.root) && (focused === ((_this$document0 = this.document) === null || _this$document0 === void 0 ? void 0 : _this$document0.body) || focused === ((_this$document1 = this.document) === null || _this$document1 === void 0 ? void 0 : _this$document1.documentElement));
	      var nativeTabAssignments = currentTabIndex < 0 ? hasInitialDocumentFocus && tabTargets[0] ? [{
	        target: tabTargets[0],
	        symbols: _keylabels.KEYLABEL_SYMBOLS.tab,
	        command: 'nextTabTarget'
	      }] : [] : [{
	        target: tabTargets[currentTabIndex - 1],
	        symbols: "".concat(_keylabels.KEYLABEL_SYMBOLS.shift).concat(_keylabels.KEYLABEL_SYMBOLS.tab),
	        command: 'previousTabTarget'
	      }, {
	        target: tabTargets[currentTabIndex + 1],
	        symbols: _keylabels.KEYLABEL_SYMBOLS.tab,
	        command: 'nextTabTarget'
	      }].filter(function (assignment) {
	        return assignment.target;
	      });
	      var nativeTabDestinations = new Set(nativeTabAssignments.map(function (assignment) {
	        return assignment.target;
	      }));
	      var contextStartAssignments = keylabelConfig.contextJump === false ? [] : [[-1, 'previousContextStart'], [1, 'nextContextStart']].map(function (_ref8) {
	        var _ref9 = _slicedToArray$1(_ref8, 2),
	          direction = _ref9[0],
	          command = _ref9[1];
	        var destination = _this1.contextStartDestination(direction);
	        var symbols = shortcutSymbols(_this1.contextStartShortcut(direction));
	        return {
	          target: destination === null || destination === void 0 ? void 0 : destination.target,
	          symbols: symbols,
	          command: command
	        };
	      }).filter(function (assignment) {
	        return assignment.target && assignment.symbols && !nativeTabDestinations.has(assignment.target);
	      });
	      var contextStartDestinations = new Set(contextStartAssignments.map(function (assignment) {
	        return assignment.target;
	      }));
	      var selectedStructuralRoute = (this.activeTypedContext && this.currentTarget ? directContextForTarget(this.model, this.currentTarget) : this.activeStructuralContext) || ((_this$model3 = this.model) === null || _this$model3 === void 0 ? void 0 : _this$model3.rootContext);
	      var headingRoute = headingContextForRoute(this.model, selectedStructuralRoute, this.currentTarget);
	      var add = function add(target, symbols, command) {
	        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
	        if (!target || !symbols || !_this1.targetSet.has(target) || nativeTabDestinations.has(target)) {
	          return;
	        }
	        assignments.push(_objectSpread({
	          target: target,
	          symbols: symbols,
	          command: command
	        }, options));
	      };
	      var addNativeFocusRoute = function addNativeFocusRoute(assignment) {
	        var target = assignment === null || assignment === void 0 ? void 0 : assignment.target;
	        if (!(target !== null && target !== void 0 && target.isConnected) || !(0, _domUtilities$1.isComposedWithin)(_this1.root, target) || nativeTabDestinations.has(target)) {
	          return;
	        }
	        assignments.push(assignment);
	      };

	      // Ordinary sequential focus is always the simplest useful route.
	      if (keylabelConfig.tab !== false) {
	        nativeTabAssignments.forEach(function (assignment) {
	          return assignments.push(_objectSpread(_objectSpread({}, assignment), {}, {
	            maxSymbols: Array.from(assignment.symbols).length
	          }));
	        });
	      }
	      if (keylabelConfig.nativeArrows !== false) {
	        nativeRadioArrowAssignments((0, _domUtilities$1.getDeepActiveElement)(this.root), this.root, this.config.displayCheck || 'full', this.config.targetFilter).forEach(addNativeFocusRoute);
	      }
	      if (keylabelConfig.horizontal !== false && this.currentTarget && headingRoute) {
	        var _horizontalContextPee2 = horizontalContextPeers(this.model, headingRoute),
	          peers = _horizontalContextPee2.contexts;
	        var currentIndex = peers.indexOf(headingRoute);
	        [[-1, 'previousSiblingContext'], [1, 'nextSiblingContext']].forEach(function (_ref0) {
	          var _this1$config$command;
	          var _ref1 = _slicedToArray$1(_ref0, 2),
	            direction = _ref1[0],
	            command = _ref1[1];
	          var shortcut = (_this1$config$command = _this1.config.commands) === null || _this1$config$command === void 0 ? void 0 : _this1$config$command[command];
	          var symbols = structuralArrowSymbols(_this1.currentTarget, shortcut, _this1.config);
	          if (currentIndex < 0 || !symbols) {
	            return;
	          }
	          var peer = peers[currentIndex + direction];
	          var target = contextTargets(peer)[0];
	          if (contextStartDestinations.has(target)) return;
	          add(target, symbols, command, {
	            maxSymbols: Array.from(symbols).length
	          });
	        });
	      }
	      if (keylabelConfig.vertical !== false) {
	        var commandSource = (0, _domUtilities$1.getDeepActiveElement)(this.root);
	        var addVertical = function addVertical(command, target) {
	          var _this1$config$command2;
	          var shortcut = (_this1$config$command2 = _this1.config.commands) === null || _this1$config$command2 === void 0 ? void 0 : _this1$config$command2[command];
	          var symbols = structuralArrowSymbols(commandSource, shortcut, _this1.config);
	          if (target === _this1.currentTarget || !symbols || contextStartDestinations.has(target)) {
	            return;
	          }
	          add(target, symbols, command, {
	            maxSymbols: Array.from(symbols).length
	          });
	        };
	        if (!headingRoute) {
	          var previousHeadingLevel = headingEdgeEntryContext(this.model, -1);
	          var nextHeadingLevel = headingEdgeEntryContext(this.model, 1);
	          addVertical('broadenContext', contextTargets(previousHeadingLevel)[0]);
	          addVertical('narrowContext', contextTargets(nextHeadingLevel)[0]);
	        } else {
	          var headingParent = previousBroaderHeadingContext(this.model, headingRoute);
	          if (headingParent) {
	            addVertical('broadenContext', contextTargets(headingParent)[0]);
	          }
	          var headingLevel = contextHeadingLevel(headingRoute);
	          var child = this.currentTarget && headingLevel < 6 ? nextDeeperHeadingContextForTarget(this.model, this.currentTarget, headingRoute) : null;
	          if (!child) {
	            var fallback = headingLevel < 6 ? nextNarrowFallbackContext(this.model, headingRoute) : null;
	            if (fallback) {
	              addVertical('narrowContext', contextTargets(fallback)[0]);
	            }
	          }
	        }
	      }

	      // A context-start Tab chord that skips sequential stops is more useful
	      // than a structural arrow chord when both reach the same target.
	      contextStartAssignments.forEach(function (assignment) {
	        return assignments.push(_objectSpread(_objectSpread({}, assignment), {}, {
	          maxSymbols: Array.from(assignment.symbols).length
	        }));
	      });
	      if (keylabelConfig.activation !== false && this.currentTarget) {
	        preferredActivationSymbols(this.currentTarget).forEach(function (symbols) {
	          add(_this1.currentTarget, symbols, symbols === _keylabels.KEYLABEL_SYMBOLS.enter ? 'activateEnter' : 'activateSpace');
	        });
	      }
	      return assignments;
	    }
	  }, {
	    key: "updateKeylabels",
	    value: function updateKeylabels() {
	      var _this$config$keylabel3;
	      if (!this.active || this.foregroundModeActive || ((_this$config$keylabel3 = this.config.keylabels) === null || _this$config$keylabel3 === void 0 ? void 0 : _this$config$keylabel3.enabled) === false) {
	        this.clearKeylabels();
	        return;
	      }
	      this.updatingKeylabels = true;
	      try {
	        if (this.dirty || !this.model) this.refresh();
	        if (this.dirty || !this.model) {
	          this.clearKeylabels();
	          return;
	        }
	        (0, _keylabels.showAssignedKeylabels)(this.openKeyNav, this.keylabelAssignments(), {
	          owner: STRUCTURAL_KEYLABEL_OWNER,
	          cssClass: STRUCTURAL_KEYLABEL_CLASS,
	          focusedTarget: (0, _domUtilities$1.getDeepActiveElement)(this.root)
	        });
	      } finally {
	        this.updatingKeylabels = false;
	      }
	    }
	  }, {
	    key: "connectContextIndicatorListeners",
	    value: function connectContextIndicatorListeners() {
	      var _this$document10;
	      var view = (_this$document10 = this.document) === null || _this$document10 === void 0 ? void 0 : _this$document10.defaultView;
	      view === null || view === void 0 || view.addEventListener('scroll', this.scheduleContextIndicatorUpdate, true);
	      view === null || view === void 0 || view.addEventListener('resize', this.scheduleContextIndicatorUpdate);
	    }
	  }, {
	    key: "disconnectContextIndicatorListeners",
	    value: function disconnectContextIndicatorListeners() {
	      var _this$document11, _this$contextIndicato;
	      var view = (_this$document11 = this.document) === null || _this$document11 === void 0 ? void 0 : _this$document11.defaultView;
	      view === null || view === void 0 || view.removeEventListener('scroll', this.scheduleContextIndicatorUpdate, true);
	      view === null || view === void 0 || view.removeEventListener('resize', this.scheduleContextIndicatorUpdate);
	      if (this.contextIndicatorFrame !== null && typeof (view === null || view === void 0 ? void 0 : view.cancelAnimationFrame) === 'function') {
	        view.cancelAnimationFrame(this.contextIndicatorFrame);
	      }
	      this.contextIndicatorFrame = null;
	      (_this$contextIndicato = this.contextIndicatorResizeObserver) === null || _this$contextIndicato === void 0 || _this$contextIndicato.disconnect();
	      this.contextIndicatorResizeObserver = null;
	      this.contextIndicatorObservedElements.clear();
	    }
	  }, {
	    key: "scheduleContextIndicatorUpdate",
	    value: function scheduleContextIndicatorUpdate() {
	      var _this$document12,
	        _this10 = this;
	      if (!this.active) return;
	      var view = (_this$document12 = this.document) === null || _this$document12 === void 0 ? void 0 : _this$document12.defaultView;
	      if (typeof (view === null || view === void 0 ? void 0 : view.requestAnimationFrame) !== 'function') {
	        this.updateContextIndicator();
	        (0, _keylabels.repositionAssignedKeylabels)(this.openKeyNav, STRUCTURAL_KEYLABEL_OWNER);
	        return;
	      }
	      if (this.contextIndicatorFrame !== null) return;
	      this.contextIndicatorFrame = view.requestAnimationFrame(function () {
	        _this10.contextIndicatorFrame = null;
	        _this10.updateContextIndicator();
	        (0, _keylabels.repositionAssignedKeylabels)(_this10.openKeyNav, STRUCTURAL_KEYLABEL_OWNER);
	      });
	    }
	  }, {
	    key: "contextIndicatorHost",
	    value: function contextIndicatorHost() {
	      var _this$document13, _this$document14;
	      var activeModal = topmostNativeModal(this.document);
	      if (activeModal && this.root === activeModal) return activeModal;
	      return ((_this$document13 = this.document) === null || _this$document13 === void 0 ? void 0 : _this$document13.body) || ((_this$document14 = this.document) === null || _this$document14 === void 0 ? void 0 : _this$document14.documentElement) || null;
	    }
	  }, {
	    key: "contextIndicatorShouldDisplay",
	    value: function contextIndicatorShouldDisplay() {
	      var _this$config$contextI;
	      return Boolean(((_this$config$contextI = this.config.contextIndicator) === null || _this$config$contextI === void 0 ? void 0 : _this$config$contextI.enabled) !== false || this.transientContextIndicatorVisible);
	    }
	  }, {
	    key: "showTransientContextIndicator",
	    value: function showTransientContextIndicator() {
	      this.transientContextIndicatorVisible = true;
	      this.scheduleContextIndicatorUpdate();
	    }
	  }, {
	    key: "showContextChange",
	    value: function showContextChange(previousContextId) {
	      var nextContextId = contextId(this.activeTypedContext || this.activeStructuralContext);
	      if (previousContextId && nextContextId && previousContextId !== nextContextId) {
	        this.showTransientContextIndicator();
	      }
	    }
	  }, {
	    key: "clearTransientContextIndicator",
	    value: function clearTransientContextIndicator() {
	      if (!this.transientContextIndicatorVisible) return;
	      this.transientContextIndicatorVisible = false;
	      this.scheduleContextIndicatorUpdate();
	    }
	  }, {
	    key: "ensureContextIndicator",
	    value: function ensureContextIndicator() {
	      if (!this.active || !this.contextIndicatorShouldDisplay()) return;
	      if (!this.contextIndicatorElement) {
	        var element = this.document.createElement('div');
	        element.className = 'openKeyNav-structural-context-outline';
	        element.setAttribute('data-openkeynav-ui', 'structural-context-outline');
	        element.setAttribute('aria-hidden', 'true');
	        var _headingLevel = this.document.createElement('span');
	        _headingLevel.className = 'openKeyNav-structural-context-heading-level';
	        _headingLevel.setAttribute('data-openkeynav-ui', 'structural-context-heading-level');
	        _headingLevel.setAttribute('aria-hidden', 'true');
	        _headingLevel.hidden = true;
	        this.contextIndicatorElement = element;
	        this.contextIndicatorHeadingLevelElement = _headingLevel;
	      }
	      var host = this.contextIndicatorHost();
	      if (host && this.contextIndicatorElement.parentNode !== host) {
	        host.appendChild(this.contextIndicatorElement);
	      }
	      var headingLevel = this.contextIndicatorHeadingLevelElement;
	      if (host && headingLevel && headingLevel.parentNode !== host) {
	        host.appendChild(headingLevel);
	      }
	    }
	  }, {
	    key: "removeContextIndicator",
	    value: function removeContextIndicator() {
	      var _this$contextIndicato2, _this$contextIndicato3, _this$contextIndicato4;
	      (_this$contextIndicato2 = this.contextIndicatorResizeObserver) === null || _this$contextIndicato2 === void 0 || _this$contextIndicato2.disconnect();
	      this.contextIndicatorResizeObserver = null;
	      this.contextIndicatorObservedElements.clear();
	      (_this$contextIndicato3 = this.contextIndicatorElement) === null || _this$contextIndicato3 === void 0 || _this$contextIndicato3.remove();
	      (_this$contextIndicato4 = this.contextIndicatorHeadingLevelElement) === null || _this$contextIndicato4 === void 0 || _this$contextIndicato4.remove();
	      this.contextIndicatorElement = null;
	      this.contextIndicatorHeadingLevelElement = null;
	    }
	  }, {
	    key: "hideContextIndicator",
	    value: function hideContextIndicator() {
	      if (this.contextIndicatorElement) {
	        this.contextIndicatorElement.style.display = 'none';
	      }
	      if (this.contextIndicatorHeadingLevelElement) {
	        this.contextIndicatorHeadingLevelElement.hidden = true;
	      }
	    }
	  }, {
	    key: "updateContextIndicatorHeadingLevel",
	    value: function updateContextIndicatorHeadingLevel(_ref10) {
	      var _this$openKeyNav$conf;
	      var context = _ref10.context,
	        left = _ref10.left,
	        top = _ref10.top,
	        right = _ref10.right,
	        bottom = _ref10.bottom,
	        viewportWidth = _ref10.viewportWidth,
	        viewportHeight = _ref10.viewportHeight,
	        width = _ref10.width,
	        color = _ref10.color;
	      var tab = this.contextIndicatorHeadingLevelElement;
	      var indicator = this.contextIndicatorElement;
	      if (!tab || !indicator) return;
	      var headingLevel = contextHeadingLevel(context);
	      if (headingLevel === null) {
	        tab.hidden = true;
	        tab.textContent = '';
	        delete indicator.dataset.headingLevel;
	        delete indicator.dataset.headingTabPosition;
	        delete tab.dataset.headingTabPosition;
	        return;
	      }
	      tab.hidden = false;
	      tab.textContent = "h".concat(headingLevel);
	      indicator.dataset.headingLevel = String(headingLevel);
	      tab.style.setProperty('--openkeynav-context-indicator-color', color);
	      tab.style.setProperty('--openkeynav-context-indicator-text-color', ((_this$openKeyNav$conf = this.openKeyNav.config.spot) === null || _this$openKeyNav$conf === void 0 ? void 0 : _this$openKeyNav$conf.fontColor) || 'currentColor');
	      tab.style.setProperty('--openkeynav-context-indicator-width', "".concat(width, "px"));
	      var setPosition = function setPosition(position, tabLeft, tabTop) {
	        indicator.dataset.headingTabPosition = position;
	        tab.dataset.headingTabPosition = position;
	        tab.style.left = "".concat(tabLeft, "px");
	        tab.style.top = "".concat(tabTop, "px");
	      };
	      setPosition('inside', left, top);
	      var tabRect = tab.getBoundingClientRect();
	      var tabWidth = tabRect.width || tab.scrollWidth || 24;
	      var tabHeight = tabRect.height || tab.scrollHeight || 24;
	      if (top >= tabHeight) {
	        setPosition('top', left, top - tabHeight + width);
	        return;
	      }
	      if (viewportWidth - right >= tabWidth) {
	        setPosition('right', right - width, top);
	      } else if (viewportHeight - bottom >= tabHeight) {
	        setPosition('bottom', left, bottom - width);
	      } else if (left >= tabWidth) {
	        setPosition('left', left - tabWidth + width, top);
	      }
	    }
	  }, {
	    key: "contextIndicatorElements",
	    value: function contextIndicatorElements(context) {
	      var _context$visualElemen2;
	      if (!context) return [];
	      if (this.activeTypedContext) return contextTargets(context);
	      if (context.source === 'heading' && (_context$visualElemen2 = context.visualElements) !== null && _context$visualElemen2 !== void 0 && _context$visualElemen2.length) {
	        return context.visualElements;
	      }
	      if ((0, _domUtilities$1.isShadowRoot)(context.boundary)) return [context.boundary.host];
	      if ((0, _domUtilities$1.isElement)(context.boundary)) return [context.boundary];
	      return contextTargets(context);
	    }
	  }, {
	    key: "observeContextIndicatorElements",
	    value: function observeContextIndicatorElements(elements) {
	      var _this$document15,
	        _this11 = this;
	      var ResizeObserverClass = (_this$document15 = this.document) === null || _this$document15 === void 0 || (_this$document15 = _this$document15.defaultView) === null || _this$document15 === void 0 ? void 0 : _this$document15.ResizeObserver;
	      if (typeof ResizeObserverClass !== 'function') return;
	      var nextElements = new Set(elements.filter(_domUtilities$1.isElement));
	      if (nextElements.size === this.contextIndicatorObservedElements.size && Array.from(nextElements).every(function (element) {
	        return _this11.contextIndicatorObservedElements.has(element);
	      })) {
	        return;
	      }
	      if (!this.contextIndicatorResizeObserver) {
	        this.contextIndicatorResizeObserver = new ResizeObserverClass(this.scheduleContextIndicatorUpdate);
	      }
	      this.contextIndicatorResizeObserver.disconnect();
	      nextElements.forEach(function (element) {
	        _this11.contextIndicatorResizeObserver.observe(element);
	      });
	      this.contextIndicatorObservedElements = nextElements;
	    }
	  }, {
	    key: "updateContextIndicator",
	    value: function updateContextIndicator() {
	      var _this$document$docume, _this$document$docume2, _this$openKeyNav$conf2, _this$openKeyNav$conf3;
	      if (!this.active || !this.contextIndicatorShouldDisplay()) {
	        var _this$contextIndicato5;
	        this.hideContextIndicator();
	        (_this$contextIndicato5 = this.contextIndicatorResizeObserver) === null || _this$contextIndicato5 === void 0 || _this$contextIndicato5.disconnect();
	        this.contextIndicatorObservedElements.clear();
	        return;
	      }
	      this.ensureContextIndicator();
	      var indicator = this.contextIndicatorElement;
	      var context = this.activeTypedContext || this.activeStructuralContext;
	      if (!indicator || !context) {
	        this.hideContextIndicator();
	        return;
	      }
	      var view = this.document.defaultView;
	      var viewportWidth = (view === null || view === void 0 ? void 0 : view.innerWidth) || ((_this$document$docume = this.document.documentElement) === null || _this$document$docume === void 0 ? void 0 : _this$document$docume.clientWidth) || 0;
	      var viewportHeight = (view === null || view === void 0 ? void 0 : view.innerHeight) || ((_this$document$docume2 = this.document.documentElement) === null || _this$document$docume2 === void 0 ? void 0 : _this$document$docume2.clientHeight) || 0;
	      var elements = this.contextIndicatorElements(context);
	      var rect;
	      if ((0, _domUtilities$1.isDocument)(context.boundary)) {
	        elements = [this.document.documentElement].filter(Boolean);
	        rect = {
	          left: 0,
	          top: 0,
	          right: viewportWidth,
	          bottom: viewportHeight
	        };
	      } else {
	        var rects = elements.flatMap(elementClientRects);
	        if (!rects.length && (0, _domUtilities$1.isElement)(context.boundary)) {
	          elements = contextTargets(context);
	          rects = elements.flatMap(elementClientRects);
	        }
	        rect = unionClientRects(rects);
	      }
	      this.observeContextIndicatorElements(elements);
	      if (!rect || !viewportWidth || !viewportHeight) {
	        this.hideContextIndicator();
	        return;
	      }
	      var offset = CONTEXT_INDICATOR_OFFSET;
	      var left = Math.max(0, rect.left - offset);
	      var top = Math.max(0, rect.top - offset);
	      var right = Math.min(viewportWidth, rect.right + offset);
	      var bottom = Math.min(viewportHeight, rect.bottom + offset);
	      if (right <= left || bottom <= top) {
	        this.hideContextIndicator();
	        return;
	      }
	      var width = CONTEXT_INDICATOR_WIDTH;
	      var color = ((_this$openKeyNav$conf2 = this.openKeyNav.config.spot) === null || _this$openKeyNav$conf2 === void 0 ? void 0 : _this$openKeyNav$conf2.backgroundColor) || 'currentColor';
	      var contrastColor = ((_this$openKeyNav$conf3 = this.openKeyNav.config.spot) === null || _this$openKeyNav$conf3 === void 0 ? void 0 : _this$openKeyNav$conf3.fontColor) || 'currentColor';
	      indicator.style.display = 'block';
	      indicator.style.left = "".concat(left, "px");
	      indicator.style.top = "".concat(top, "px");
	      indicator.style.width = "".concat(right - left, "px");
	      indicator.style.height = "".concat(bottom - top, "px");
	      indicator.style.border = "".concat(width, "px dashed ").concat(color);
	      indicator.style.boxShadow = "0 0 0 ".concat(CONTEXT_INDICATOR_CONTRAST_WIDTH, "px ").concat(contrastColor);
	      this.updateContextIndicatorHeadingLevel({
	        context: context,
	        left: left,
	        top: top,
	        right: right,
	        bottom: bottom,
	        viewportWidth: viewportWidth,
	        viewportHeight: viewportHeight,
	        width: width,
	        color: color
	      });
	      indicator.dataset.contextId = String(contextId(context) || '');
	      indicator.dataset.contextName = context.name || 'Document';
	      indicator.dataset.contextType = this.activeTypedContext ? this.activeTypedContext.type || 'typed' : 'structural';
	    }
	  }, {
	    key: "updateStatus",
	    value: function updateStatus() {
	      var _this$config$status, _this$config$status2, _this$config$status3;
	      var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	      var _ref11 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	        _ref11$force = _ref11.force,
	        force = _ref11$force === void 0 ? false : _ref11$force;
	      if (!this.active && !force) return;
	      if (this.active) {
	        this.scheduleContextIndicatorUpdate();
	        this.scheduleKeylabelUpdate();
	      }
	      if (!((_this$config$status = this.config.status) !== null && _this$config$status !== void 0 && _this$config$status.enabled)) {
	        this.openKeyNav.clearStatus(STRUCTURAL_STATUS_CHANNEL);
	        return;
	      }
	      var route = this.activeTypedContext || this.activeStructuralContext;
	      var sequence = this.activeSequence();
	      var index = sequence.indexOf(this.currentTarget);
	      var contextName = (route === null || route === void 0 ? void 0 : route.name) || 'Document';
	      var targetDescription = this.currentTarget ? "".concat(targetName(this.currentTarget), ", ").concat(index >= 0 ? index + 1 : '?', " of ").concat(sequence.length) : "".concat(sequence.length, " available ").concat(sequence.length === 1 ? 'target' : 'targets');
	      var structuralContext = this.activeTypedContext ? directContextForTarget(this.model, this.currentTarget) || this.activeStructuralContext || this.model.rootContext : this.activeStructuralContext || this.model.rootContext;
	      var headingContext = headingContextForRoute(this.model, structuralContext, this.currentTarget);
	      var headingLevel = contextHeadingLevel(headingContext);
	      var headingDescription = headingLevel === null ? '' : this.activeTypedContext ? "Underlying heading level: ".concat(headingLevel, ".") : "Heading level: ".concat(headingLevel, ".");
	      var typedContexts = typedContextsForTarget(this.model, this.currentTarget);
	      var typedDescription = typedContexts.length ? "".concat(typedContexts.length, " alternate ").concat(typedContexts.length === 1 ? 'route' : 'routes', " available.") : '';
	      var dismissLabel = shortcutLabel((_this$config$status2 = this.config.status) === null || _this$config$status2 === void 0 ? void 0 : _this$config$status2.dismissCommand);
	      var dismissDescription = dismissLabel && this.config.debug === true && ((_this$config$status3 = this.config.status) === null || _this$config$status3 === void 0 ? void 0 : _this$config$status3.visible) !== false && !this.statusDismissed ? "".concat(dismissLabel, " to close.") : '';
	      var contextDescription = this.activeTypedContext ? "Typed context: ".concat(contextName, ".") : "Context: ".concat(contextName, ".");
	      var message = [prefix, contextDescription, headingDescription, targetDescription ? "".concat(targetDescription, ".") : '', typedDescription].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
	      this.openKeyNav.setStatus(STRUCTURAL_STATUS_CHANNEL, message, {
	        className: 'openKeyNav-structural-status',
	        ui: 'structural-status',
	        politeness: this.config.status.announcements === false ? 'off' : 'polite',
	        visible: this.config.debug === true && this.config.status.visible !== false && !this.statusDismissed,
	        hint: dismissDescription,
	        toolName: this.openKeyNav.config.notifications.displayToolName,
	        host: this.root,
	        data: {
	          contextId: String(contextId(route) || ''),
	          contextType: this.activeTypedContext ? this.activeTypedContext.type || 'typed' : 'structural'
	        }
	      });
	    }
	  }, {
	    key: "getState",
	    value: function getState() {
	      return {
	        active: this.active,
	        root: this.root,
	        target: this.currentTarget,
	        targets: this.targets.slice(),
	        model: this.model,
	        activeContext: this.activeTypedContext || this.activeStructuralContext,
	        activeStructuralContext: this.activeStructuralContext,
	        activeTypedContext: this.activeTypedContext,
	        statusDismissed: this.statusDismissed,
	        dirty: this.dirty
	      };
	    }
	  }]);
	}();

	var hasRequiredKeypress;
	function requireKeypress() {
	  if (hasRequiredKeypress) return keypress;
	  hasRequiredKeypress = 1;
	  Object.defineProperty(keypress, "__esModule", {
	    value: true
	  });
	  keypress.modiferKeyString = keypress.handleKeyPress = void 0;
	  var _clicking = requireClicking();
	  var _dragAndDrop = dragAndDrop;
	  var _escape = _escape$1;
	  var _focus = focus;
	  var _isTabbable = isTabbable;
	  var _keylabels = keylabels;
	  var _keyButton = keyButton;
	  var _structuralNavigation = structuralNavigation;
	  var _keyboardEvents = keyboardEvents;
	  var NUMBER_KEY_BY_CODE = Object.freeze({
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
	  });
	  var configuredHeadingLevel = function configuredHeadingLevel(openKeyNav, event) {
	    var numberPressed = NUMBER_KEY_BY_CODE[event.code];
	    if (!numberPressed) return null;
	    for (var level = 1; level <= 6; level += 1) {
	      if (numberPressed === openKeyNav.config.keys["heading_".concat(level)]) {
	        return level;
	      }
	    }
	    return null;
	  };
	  var pageOwnsCharacterCommand = function pageOwnsCharacterCommand(openKeyNav, event) {
	    var config = openKeyNav.config.modesConfig.structuralNavigation;
	    var ownership = (0, _structuralNavigation.classifyStructuralKeyOwnership)(event, config);
	    return ownership.all || ownership.character;
	  };
	  var hasSystemShortcutModifier = function hasSystemShortcutModifier(event) {
	    return Boolean(event.altKey) || Boolean(event.ctrlKey) || Boolean(event.metaKey);
	  };
	  var hasForegroundMode = function hasForegroundMode(openKeyNav) {
	    return openKeyNav.config.modes.clicking.value || openKeyNav.config.modes.moving.value || openKeyNav.config.modes.menu.value;
	  };
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
	    if (e.isComposing || e.keyCode === 229) {
	      return true;
	    }
	    if (e.openKeyNavIframeBridge && !openKeyNav.config.modes.clicking.value) {
	      return true;
	    }
	    var isTextInputActive = openKeyNav.isTextInputActive();

	    // enable / disable openKeyNav
	    if (e[openKeyNav.config.keys.modifierKey] && openKeyNav.config.keys.menu.toLowerCase() == e.key.toLowerCase()) {
	      if (isTextInputActive) {
	        if (!e[openKeyNav.config.keys.inputEscape]) {
	          return true;
	        }
	      }
	      (0, _keyboardEvents.preventAcceptedCommand)(e);
	      if (!openKeyNav.meta.enabled.value) {
	        // if openKeyNav disabled
	        openKeyNav.enable();
	        var message = "openKeyNav enabled. Press ".concat((0, _keyButton.keyButton)([modiferKeyString(openKeyNav), openKeyNav.config.keys.menu]), " to disable.");
	        openKeyNav.emitNotification(message, null, {
	          trustedHtml: true
	        });
	        return true;
	      } else {
	        if (openKeyNav.config.modes.clicking.value || openKeyNav.config.modes.moving.value || openKeyNav.config.modes.menu.value) {
	          (0, _escape.handleEscape)(openKeyNav, e);
	        }
	        openKeyNav.disable();
	        var _message = "openKeyNav disabled. Press ".concat((0, _keyButton.keyButton)([modiferKeyString(openKeyNav), openKeyNav.config.keys.menu]), " to enable.");
	        openKeyNav.emitNotification(_message, null, {
	          trustedHtml: true
	        });
	        return true;
	      }
	    }

	    // Structural navigation owns only its configured commands while active.
	    // It makes widget ownership decisions before preventing any page key.
	    if (openKeyNav.structuralNavigation && openKeyNav.structuralNavigation.handleKeyDown(e)) {
	      return true;
	    }

	    // Structural navigation gets first refusal only on its own configured
	    // commands. Outside a temporary Click, Move, or menu mode, page-owned
	    // characters and system shortcuts pass through. Other OpenKeyNav commands
	    // continue through the ordinary router without ending structural mode.
	    if (openKeyNav.config.modes.structuralNavigation.value && !hasForegroundMode(openKeyNav)) {
	      var inputEscapeModifier = openKeyNav.config.keys.inputEscape;
	      var usesInputEscape = Boolean(isTextInputActive && inputEscapeModifier && e[inputEscapeModifier]);
	      if (!usesInputEscape && (pageOwnsCharacterCommand(openKeyNav, e) || hasSystemShortcutModifier(e))) {
	        return true;
	      }
	    }

	    // The configured alternate escape closes only the temporary foreground
	    // mode. Structural navigation remains active underneath and resumes once
	    // overlay cleanup finishes.
	    if (hasForegroundMode(openKeyNav) && e.key === openKeyNav.config.keys.escape) {
	      (0, _escape.handleEscape)(openKeyNav, e);
	      return true;
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
	        if (openKeyNav.config.modes.clicking.value || openKeyNav.config.modes.moving.value || openKeyNav.config.modes.menu.value) {
	          (0, _escape.handleEscape)(openKeyNav, e);
	        }
	        return true;
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

	        (0, _escape.handleEscape)(openKeyNav, e);
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
	        openKeyNav.preventpropagation(e);
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
	        openKeyNav.preventpropagation(e);
	        return true;
	      case openKeyNav.config.keys.menu:
	      case openKeyNav.config.keys.menu.toUpperCase():
	        openKeyNav.config.modes.menu.value = true;
	        if (e.key == openKeyNav.config.keys.menu.toUpperCase()) {
	          openKeyNav.config.modesConfig.menu.modifier = true;
	        }
	        openKeyNav.preventpropagation(e);
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

	        (0, _keyboardEvents.preventAcceptedCommand)(e);
	        (0, _focus.focusOnHeadings)(openKeyNav, 'h1, h2, h3, h4, h5, h6, [role="heading"][aria-level]', e);
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

	        (0, _keyboardEvents.preventAcceptedCommand)(e);
	        (0, _focus.focusOnScrollables)(openKeyNav, e);
	        return true;
	    }

	    // handle keycodes, aka for specific headings
	    var headingLevel = configuredHeadingLevel(openKeyNav, e);
	    if (headingLevel !== null) {
	      (0, _keyboardEvents.preventAcceptedCommand)(e);
	      (0, _focus.focusOnHeadings)(openKeyNav, "h".concat(headingLevel, ", [role=\"heading\"][aria-level=\"").concat(headingLevel, "\"]"), e);
	      return true;
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
	      if (!moveConfig) return null;

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
	      return moveConfig;
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
	      var moveConfig = showMoveableToOverlays(selectedTarget);

	      // A callback is an application-level move path. Do not also emit the
	      // synthetic pointer and native drag events used by event-based integrations,
	      // because those events can wake the host drag-and-drop library's sensors.
	      if (typeof (moveConfig === null || moveConfig === void 0 ? void 0 : moveConfig.callback) !== 'function') {
	        (0, _dragAndDrop.beginDrag)(openKeyNav);
	      }
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
	    var moveConfig = openKeyNav.config.modesConfig.move.config[openKeyNav.config.modesConfig.move.selectedConfig];
	    var callback = moveConfig === null || moveConfig === void 0 ? void 0 : moveConfig.callback;
	    if (typeof callback !== 'function') {
	      //   console.error("No callback function has been set to execute this move operation");
	      (0, _dragAndDrop.simulateDragAndDrop)(openKeyNav, openKeyNav.config.modesConfig.move.selectedMoveable, openKeyNav.config.modesConfig.move.selectedDropZone);
	    } else {
	      callback(openKeyNav.config.modesConfig.move.selectedMoveable, openKeyNav.config.modesConfig.move.selectedDropZone);
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
	  return keypress;
	}

	var styles = {};

	Object.defineProperty(styles, "__esModule", {
	  value: true
	});
	styles.statusStyles = styles.injectToolbarStyleSheet = styles.injectStylesheet = styles.getKeylabelFontSize = styles.getAccessibleFocusLabelBackground = styles.deleteStylesheets = void 0;
	var openKeyNav;
	var styleClassname = "openKeyNav-style";
	var toolbarStyleClassname = "okn-toolbar-stylesheet";
	var minimumWhiteTextContrast = 4.5;
	var fallbackFocusLabelRgb = [0, 90, 133];
	var getKeylabelFontSize = styles.getKeylabelFontSize = function getKeylabelFontSize() {
	  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	    _ref$fontSize = _ref.fontSize,
	    fontSize = _ref$fontSize === void 0 ? 'inherit' : _ref$fontSize,
	    _ref$minimumFontSize = _ref.minimumFontSize,
	    minimumFontSize = _ref$minimumFontSize === void 0 ? '16px' : _ref$minimumFontSize;
	  if (fontSize !== 'inherit' || minimumFontSize === false) return fontSize;
	  var normalizedMinimum = typeof minimumFontSize === 'number' ? "".concat(minimumFontSize, "px") : String(minimumFontSize || '').trim();
	  return normalizedMinimum ? "max(".concat(normalizedMinimum, ", 1em)") : fontSize;
	};
	var parseCssRgb = function parseCssRgb(color) {
	  if (typeof color !== 'string') return null;
	  var value = color.trim();
	  var hexMatch = value.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
	  if (hexMatch) {
	    var hex = hexMatch[1];
	    var componentSize = hex.length <= 4 ? 1 : 2;
	    var _components = [];
	    for (var index = 0; index < componentSize * 3; index += componentSize) {
	      var component = hex.slice(index, index + componentSize);
	      _components.push(parseInt(componentSize === 1 ? component.repeat(2) : component, 16));
	    }
	    return _components;
	  }
	  var rgbMatch = value.match(/^rgba?\((.*)\)$/i);
	  if (!rgbMatch) return null;
	  var colorComponents = rgbMatch[1].split('/')[0].trim();
	  var components = colorComponents.includes(',') ? colorComponents.split(',') : colorComponents.split(/\s+/);
	  if (components.length < 3) return null;
	  var rgb = components.slice(0, 3).map(function (component) {
	    var normalized = component.trim();
	    var numericValue = Number.parseFloat(normalized);
	    if (!Number.isFinite(numericValue)) return NaN;
	    var value255 = normalized.endsWith('%') ? numericValue * 2.55 : numericValue;
	    return Math.min(255, Math.max(0, value255));
	  });
	  return rgb.every(Number.isFinite) ? rgb : null;
	};
	var resolveCssRgb = function resolveCssRgb(color, ownerDocument) {
	  var parsedColor = parseCssRgb(color);
	  if (parsedColor) return parsedColor;
	  if (!(ownerDocument !== null && ownerDocument !== void 0 && ownerDocument.createElement) || !ownerDocument.defaultView) return null;
	  var probe = ownerDocument.createElement('span');
	  probe.style.color = color;
	  probe.style.position = 'absolute';
	  probe.style.visibility = 'hidden';
	  probe.style.pointerEvents = 'none';
	  if (!probe.style.color) return null;
	  var container = ownerDocument.body || ownerDocument.documentElement;
	  if (!container) return null;
	  container.appendChild(probe);
	  var resolvedColor = ownerDocument.defaultView.getComputedStyle(probe).color;
	  probe.remove();
	  return parseCssRgb(resolvedColor);
	};
	var relativeLuminance = function relativeLuminance(rgb) {
	  return rgb.reduce(function (luminance, component, index) {
	    var channel = component / 255;
	    var linearChannel = channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
	    return luminance + linearChannel * [0.2126, 0.7152, 0.0722][index];
	  }, 0);
	};
	var whiteTextContrast = function whiteTextContrast(rgb) {
	  return 1.05 / (relativeLuminance(rgb) + 0.05);
	};
	var darkenForWhiteText = function darkenForWhiteText(rgb) {
	  if (whiteTextContrast(rgb) >= minimumWhiteTextContrast) {
	    return rgb.map(function (component) {
	      return Math.floor(component);
	    });
	  }
	  var accessibleScale = 0;
	  var inaccessibleScale = 1;
	  var _loop = function _loop() {
	    var candidateScale = (accessibleScale + inaccessibleScale) / 2;
	    var candidate = rgb.map(function (component) {
	      return component * candidateScale;
	    });
	    if (whiteTextContrast(candidate) >= minimumWhiteTextContrast) {
	      accessibleScale = candidateScale;
	    } else {
	      inaccessibleScale = candidateScale;
	    }
	  };
	  for (var index = 0; index < 24; index += 1) {
	    _loop();
	  }
	  return rgb.map(function (component) {
	    return Math.floor(component * accessibleScale);
	  });
	};
	var getAccessibleFocusLabelBackground = styles.getAccessibleFocusLabelBackground = function getAccessibleFocusLabelBackground(focusColor) {
	  var ownerDocument = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : typeof document === 'undefined' ? null : document;
	  var focusRgb = resolveCssRgb(focusColor, ownerDocument) || fallbackFocusLabelRgb;
	  return "rgb(".concat(darkenForWhiteText(focusRgb).join(', '), ")");
	};
	var keyButtonStyles = "\n  .keyButtonContainer {\n      margin: 0 .1em;\n      display: inline-grid;\n      grid-template-columns: min-content auto;\n      align-items: baseline;\n      column-gap: 4px;\n  }\n  .keyButtonContainer .keyButtonLabel{\n    white-space:nowrap;\n  }\n  .keyButton {\n    display: inline-block;\n    padding: 1px 4px;\n    min-width: 1.3em;\n    text-align: center;\n    line-height: 1;\n    color: hsl(210, 8%, 5%);\n    text-shadow: 0 1px 0 hsl(0, 0%, 100%);\n    background-color: hsl(210, 8%, 90%);\n    border: 1px solid hsl(210, 8%, 68%);\n    border-radius: 3px;\n    box-shadow: 0 1px 1px hsla(210, 8%, 5%, 0.15), inset 0 1px 0 0 hsl(0, 0%, 100%);\n    white-space: nowrap;\n    margin: 0 1px;\n  }\n";
	var logoStyles = "\n  .okn-logo-text {\n      font-size: 36px;\n      font-weight: 600;\n      color: #ffffff;\n      background-color: #333;\n      padding: .1em .2em;\n      border-radius: 1em;\n      box-sizing: border-box;\n      line-height: 1;\n      text-align: center;\n      position: relative;\n      display: inline-block;\n      min-width: 1rem;\n      border: max(.1em, 2px) solid #ffffff;\n      white-space: nowrap;\n  }\n\n  .okn-logo-text.small {\n      font-size: 18px;\n  }\n  .okn-logo-text.tiny {\n      font-size: 10px;\n      border: none;\n  }\n  .okn-logo-text.tiny .key {\n      font-weight: 700;\n  }\n\n  .okn-logo-text.light {\n      color: #333;\n      background-color: #fff;\n      border-color: #333;\n  }\n\n  .okn-logo-text .key {\n      display: inline;\n      padding: .1em .2em;\n      margin: 0 .1em;\n      background-color: #ffffff;\n      color: #333;\n      line-height: 1;\n      position: relative;\n      top: -.3em;\n  }\n\n  .okn-logo-text.light .key {\n      background-color: #333;\n      color: #ffffff;\n  }\n\n  .okn-logo-text .key::before,\n  .okn-logo-text .key::after {\n      content: \"\";\n      position: absolute;\n      left: 50%;\n      transform: translateX(-50%);\n  }\n\n  .okn-logo-text .key::before {\n      --border-size: 0.5em;\n      --min-border-size: 5px;\n      border-top: max(var(--border-size), var(--min-border-size)) solid #333;\n      bottom: calc(-1 * max(var(--border-size), var(--min-border-size)));\n      border-left: max(var(--border-size), var(--min-border-size)) solid transparent;\n      border-right: max(var(--border-size), var(--min-border-size)) solid transparent;\n  }\n  .okn-logo-text.light .key::before {\n      border-top-color: #fff;\n  }\n\n  .okn-logo-text .key::after {\n      --border-size: .4em;\n      --min-border-size: 4px;\n      border-top: max(calc(var(--border-size) + 2px), var(--min-border-size)) solid #fff;\n      bottom: calc(-1 * max(var(--border-size), var(--min-border-size)));\n      border-left: max(var(--border-size), var(--min-border-size)) solid transparent;\n      border-right: max(var(--border-size), var(--min-border-size)) solid transparent;\n  }\n  .okn-logo-text.light .key::after {\n      border-top-color: #333;\n  }\n";

	// Shared by the document stylesheet and StatusService-owned ShadowRoot/document
	// styles. Keeping this as one source ensures notifications remain styled after
	// OpenKeyNav is disabled and inside supported Shadow DOM roots.
	var statusStyles = styles.statusStyles = "\n  ".concat(logoStyles, "\n\n  .openKeyNav-status {\n      box-sizing: border-box;\n      position: fixed;\n      left: 12px;\n      bottom: 12px;\n      z-index: 2147483647;\n      max-width: min(34rem, calc(100vw - 24px));\n      padding: 8px 12px;\n      border: 1px solid #666;\n      border-radius: 4px;\n      color: #fff;\n      background: rgba(20, 24, 28, .94);\n      box-shadow: 0 4px 6px rgba(0, 0, 0, .16);\n      font: 14px/1.35 sans-serif;\n      text-align: left;\n      pointer-events: none;\n  }\n\n  .openKeyNav-status--visually-hidden {\n      width: 1px !important;\n      height: 1px !important;\n      padding: 0 !important;\n      margin: -1px !important;\n      border: 0 !important;\n      overflow: hidden !important;\n      clip: rect(0 0 0 0) !important;\n      clip-path: inset(50%) !important;\n      white-space: nowrap !important;\n  }\n\n  .openKeyNav-notification-container {\n      position: fixed;\n      left: 50%;\n      bottom: 10px;\n      z-index: 2147483647;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 10px;\n      width: min(34rem, calc(100vw - 24px));\n      transform: translateX(-50%);\n      pointer-events: none;\n  }\n\n  .openKeyNav-notification-container .openKeyNav-notification {\n      position: relative;\n      left: auto;\n      bottom: auto;\n      display: inline-block;\n      max-width: 100%;\n      padding: 10px 20px;\n      text-align: center;\n      pointer-events: auto;\n  }\n\n  .openKeyNav-status__dismiss {\n      position: absolute;\n      top: 5px;\n      right: 8px;\n      border: 0;\n      padding: 0 2px;\n      color: inherit;\n      background: transparent;\n      font: 20px/1 sans-serif;\n      cursor: pointer;\n  }\n\n  .openKeyNav-status__hint {\n      margin-top: 4px;\n      font-size: .85em;\n      opacity: .8;\n  }\n\n  .openKeyNav-status--dismissible {\n      padding-right: 30px;\n  }\n");
	styles.injectStylesheet = function injectStylesheet(parent, replace) {
	  openKeyNav = parent;
	  var focusLabelBackground = getAccessibleFocusLabelBackground(openKeyNav.config.focus.outlineColor, document);
	  var keylabelFontSize = getKeylabelFontSize(openKeyNav.config.spot);
	  if (document.querySelectorAll('.' + styleClassname).length > 0) {
	    if (!replace) {
	      return;
	    }
	    deleteStylesheets();
	  }
	  var style = document.createElement('style');
	  style.className = styleClassname;
	  style.type = 'text/css';
	  style.textContent = ".openKeyNav-label {\n        font: inherit;\n        vertical-align: baseline;\n        box-sizing: border-box;\n        white-space: nowrap;\n        border: 1px solid ".concat(openKeyNav.config.spot.fontColor, "; \n        // box-shadow: inset 0 -2.5px 0 ").concat(openKeyNav.config.spot.insetColor, ", inset 0 -3px 0 #999, 0 0 4px #fff; \n        // background: linear-gradient(to top, #999 5%, ").concat(openKeyNav.config.spot.backgroundColor, " 20%); \n        background-color: ").concat(openKeyNav.config.spot.backgroundColor, "; \n        // border-radius: calc( 4px );\n        color: ").concat(openKeyNav.config.spot.fontColor, "; \n        display: inline-block;\n        font-size: ").concat(keylabelFontSize, ";\n        // outline : 2px solid ").concat(openKeyNav.config.focus.outlineColor, "; \n        outline-offset: -2px !important;\n        // +\"font-weight: bold;\"\n        font-weight: inherit;\n        // line-height: 1.5;\n        line-height: 1;\n        margin: 0 .1em 0 1px;\n        overflow-wrap: break-word;\n        // padding: .0 .15em .1em;\n        padding: 3px;\n        text-shadow: 0 1px 0 ").concat(openKeyNav.config.spot.insetColor, "; \n        min-width: 1rem;\n        text-align: center;\n        position: absolute;\n        z-index: 2147483646;\n        font-family: monospace;\n      }\n      .openKeyNav-keylabel-alternatives {\n        display: inline-flex;\n        align-items: center;\n      }\n      .openKeyNav-keylabel-alternative + .openKeyNav-keylabel-alternative {\n        border-left: 1px solid currentColor;\n        margin-left: .3em;\n        padding-left: .3em;\n      }\n      .openKeyNav-keylabel-modifier {\n        border-radius: 2px;\n        display: inline-block;\n        margin: -1px 0;\n        padding: 1px;\n      }\n      .openKeyNav-keylabel-modifier[data-openkeynav-keylabel-pressed=\"true\"] {\n        background-color: #fff;\n        box-shadow: inset 0 0 0 1px #111;\n        color: #111;\n        text-shadow: none;\n      }\n      .openKeyNav-keylabel-focused {\n        background-color: ").concat(focusLabelBackground, ";\n        color: #fff;\n        text-shadow: none;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::after {\n        content: \"\";\n        position: absolute;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::after {\n        top: 50%;\n        transform: translateY(-50%);\n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::after {\n        left: 50%;\n        transform: translateX(-50%);\n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::before {\n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid #fff; \n        right: -").concat(openKeyNav.config.spot.arrowSize_px + 1, "px; \n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::after {\n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid ").concat(openKeyNav.config.spot.backgroundColor, "; \n        right: -").concat(openKeyNav.config.spot.arrowSize_px, "px; \n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::before {\n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid #fff; \n        left: -").concat(openKeyNav.config.spot.arrowSize_px + 1, "px; \n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::after {\n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid ").concat(openKeyNav.config.spot.backgroundColor, "; \n        left: -").concat(openKeyNav.config.spot.arrowSize_px, "px; \n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]{\n        padding-bottom: 0;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::before {\n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid #fff; \n        bottom: -").concat(openKeyNav.config.spot.arrowSize_px + 1, "px; \n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::after {\n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid ").concat(openKeyNav.config.spot.backgroundColor, "; \n        bottom: -").concat(openKeyNav.config.spot.arrowSize_px, "px; \n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]{\n        padding-top: 0;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::before {\n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid #fff; \n        top: -").concat(openKeyNav.config.spot.arrowSize_px + 1, "px; \n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::after {\n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid ").concat(openKeyNav.config.spot.backgroundColor, "; \n        top: -").concat(openKeyNav.config.spot.arrowSize_px, "px; \n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-keylabel-focused[data-openkeynav-position=\"left\"]::after {\n        border-left-color: ").concat(focusLabelBackground, ";\n      }\n      .openKeyNav-keylabel-focused[data-openkeynav-position=\"right\"]::after {\n        border-right-color: ").concat(focusLabelBackground, ";\n      }\n      .openKeyNav-keylabel-focused[data-openkeynav-position=\"top\"]::after {\n        border-top-color: ").concat(focusLabelBackground, ";\n      }\n      .openKeyNav-keylabel-focused[data-openkeynav-position=\"bottom\"]::after {\n        border-bottom-color: ").concat(focusLabelBackground, ";\n      }\n      .openKeyNav-label-selected{\n        // padding : 0;\n        // margin : 0;\n        display : grid;\n        align-content : center;\n        color : ").concat(openKeyNav.config.spot.fontColor, "; \n        background : ").concat(openKeyNav.config.spot.backgroundColor, "; \n        // outline : 4px solid ").concat(openKeyNav.config.focus.outlineColor, "; \n        outline: none; \n        // border-radius: 100%; \n        // width: 1rem; \n        // height: 1rem; \n        // text-shadow : none;\n        // padding : 0 !important;\n        // margin: 0 !important;\n      }\n      [data-openkeynav-label]:not(.openKeyNav-label):not(button):not(:focus),\n      [data-openkeynav-keylabel-target-active]:not(button):not(:focus){\n        box-shadow:  inset 0 0 0 .5px #000,\n                      0 0 0 .75px #000,\n                      0 0 0 1.5px rgba(255,255,255,1); \n        // border-radius: 3px;\n        border-color: #000;\n        border-radius: 3px;\n      }\n      [data-openkeynav-label]:not(.openKeyNav-label):not(button):not(:focus),\n      [data-openkeynav-keylabel-target-active]:not(button):not(:focus){\n        outline:none !important;\n      }\n      button[data-openkeynav-label]:not(:focus),\n      button[data-openkeynav-keylabel-target-active]:not(:focus){\n        outline:2px solid #000 !important;\n      }\n      .openKeyNav-inaccessible:not(.openKeyNav-label):not(button){\n        box-shadow:  inset 0 0 0 .5px #f00,\n                      0 0 0 1px #f00,\n                      0 0 0 1.5px rgba(255,255,255,1); \n        outline:none !important;\n        border-color: #f00;\n        border-radius: 3px;\n      }\n      button.openKeyNav-inaccessible{\n        outline:2px solid #f00 !important;\n      }\n      .openKeyNav-inaccessible.openKeyNav-label{\n        box-shadow:  inset 0 0 0 .5px #f00,\n                      0 0 0 1px #f00,\n                      0 0 0 1.5px rgba(255,255,255,1); \n        border-color: #f00;\n        border-radius: 3px;\n      }\n      .openKeyNav-label.debug-inaccessible{\n        background-color: #ff4444 !important;\n        border-color: #cc0000 !important;\n        color: #ffffff !important;\n        text-shadow: 0 1px 0 rgba(0,0,0,0.5) !important;\n      }\n        //   +\"span[data-openkeynav-label]{\"\n        //       +\"display: inherit;\"\n        //   +\"}\"\n      .openKeyNav-noCursor *{\n        cursor: none !important;\n      }\n      .openKeyNav-mouseover-tooltip{\n        position: absolute;\n        background-color: #333;\n        color: #fff;\n        padding: 5px;\n        border-radius: 5px;\n        display: none;\n        z-index: 1000;\n        font-size: 12px;\n      }\n      .openKeyNav-mouseover-tooltip::before{\n        content: \"Debug mode\"\n      }\n      //   [data-openkeynav-draggable=\"true\"] {\n      //   outline: 2px solid ").concat(openKeyNav.config.focus.outlineColor, "; \n      //   outline-offset: -1px !important;\n      // }\n      ;\n      ");
	  style.textContent += statusStyles;
	  style.textContent += keyButtonStyles;
	  // *:focus { // could be problematic to edit focus states throughout a website
	  //   outline: 2px ${openKeyNav.config.focus.outlineStyle} ${openKeyNav.config.focus.outlineColor} !important;
	  //   outline-offset: -2px !important;
	  // }
	  // `;
	  // ensuring hidden labeled elements are made visible
	  style.textContent += "\n        [data-openkeynav-label]:not(.openKeyNav-label):not(:focus),\n        [data-openkeynav-keylabel-target-active]:not(:focus){\n          opacity:1 !important;\n          visibility:visible !important;\n        }\n      ";
	  style.textContent += "\n        [data-openkeynav-focused]{\n          outline: 2px ".concat(openKeyNav.config.focus.outlineStyle, " ").concat(openKeyNav.config.focus.outlineColor, " !important; \n          outline-offset: -2px !important;\n        }\n\n        .openKeyNav-structural-context-outline {\n          box-sizing: border-box;\n          position: fixed;\n          z-index: 2147483645;\n          display: none;\n          border-radius: 4px;\n          pointer-events: none;\n        }\n\n        .openKeyNav-structural-context-heading-level {\n          box-sizing: border-box;\n          position: fixed;\n          z-index: 2147483645;\n          display: flex;\n          align-items: center;\n          block-size: calc(").concat(keylabelFontSize, " + 8px);\n          padding: 0 .35em;\n          border: var(--openkeynav-context-indicator-width) solid\n            var(--openkeynav-context-indicator-color);\n          border-block-end: 0;\n          border-radius: 4px 4px 0 0;\n          white-space: nowrap;\n          color: var(--openkeynav-context-indicator-text-color);\n          background-color: var(--openkeynav-context-indicator-color);\n          pointer-events: none;\n          user-select: none;\n        }\n\n        .openKeyNav-structural-context-heading-level[hidden] {\n          display: none;\n        }\n\n        .openKeyNav-structural-context-heading-level[data-heading-tab-position=\"right\"] {\n          border-inline-start: 0;\n          border-block-end: var(--openkeynav-context-indicator-width) solid\n            var(--openkeynav-context-indicator-color);\n          border-radius: 0 4px 4px 0;\n        }\n\n        .openKeyNav-structural-context-heading-level[data-heading-tab-position=\"bottom\"] {\n          border-block-start: 0;\n          border-block-end: var(--openkeynav-context-indicator-width) solid\n            var(--openkeynav-context-indicator-color);\n          border-radius: 0 0 4px 4px;\n        }\n\n        .openKeyNav-structural-context-heading-level[data-heading-tab-position=\"left\"] {\n          border-inline-end: 0;\n          border-block-end: var(--openkeynav-context-indicator-width) solid\n            var(--openkeynav-context-indicator-color);\n          border-radius: 4px 0 0 4px;\n        }\n\n        .openKeyNav-structural-context-heading-level[data-heading-tab-position=\"inside\"] {\n          border-inline-start: 0;\n          border-block-start: 0;\n          border-block-end: var(--openkeynav-context-indicator-width) solid\n            var(--openkeynav-context-indicator-color);\n          border-radius: 0 0 4px 0;\n        }\n      ");
	  document.head.appendChild(style);
	};
	var deleteStylesheets = styles.deleteStylesheets = function deleteStylesheets() {
	  document.querySelectorAll('.' + styleClassname).forEach(function (el) {
	    el.parentNode && el.parentNode.removeChild(el);
	  });
	};
	styles.injectToolbarStyleSheet = function injectToolbarStyleSheet(parent) {
	  openKeyNav = parent;
	  if (!!document.querySelector(toolbarStyleClassname)) {
	    return false;
	  }
	  var style = document.createElement('style');
	  style.setAttribute("class", toolbarStyleClassname);
	  var toolBarHeight = openKeyNav.config.toolBar.height;
	  var toolBarVerticalPadding = 6;
	  var toolbarBackground = "\n      background-color: ".concat(openKeyNav.config.toolBar.backgroundColor.value, ";\n      color: ").concat(openKeyNav.config.toolBar.contentColor.value, ";\n      border: 1px solid hsl(210, 8%, 68%);\n      border-radius: 4px;\n      padding: 3px ").concat(toolBarVerticalPadding, "px;\n  ");
	  style.type = 'text/css';
	  style.textContent = "\n  .openKeyNav-toolBar {\n      // width: 200px;    // needs to have a set width (or a min-width) since the content changes inside... \n                          // min-widh is set inside the init depending on number of keys\n      // max-width: 200px;\n      // background-color: #333;\n      color: #333;\n      // z-index: 10000;\n      ".concat(toolbarBackground, "\n      font-size:12px;\n      display: flex;\n      align-items: center;\n      // align-items: end;\n      flex-direction: column;\n      // direction: rtl;\n      max-height: ").concat(toolBarHeight, "px;\n      position:relative;\n  }\n  .openKeyNav-toolBar > p{\n      overflow: hidden;\n  }\n  .openKeyNav-toolBar p{\n      font-size: 16px;\n      margin-bottom: 0;\n      line-height: ").concat(toolBarHeight - toolBarVerticalPadding, "px;\n      text-align: left;\n  }\n  .openKeyNav-toolBar-expanded {\n      position: absolute;\n      top: 0;\n      margin-top: 40px;\n      width: 100%;\n      ").concat(toolbarBackground, "\n      display: grid;\n      justify-content: left;\n  }\n  // .openKeyNav-toolBar span.stacked {\n  //     display: inline-grid;\n  //     grid-template-rows: auto auto;\n  // }\n  ");
	  style.textContent += keyButtonStyles;
	  document.head.appendChild(style);
	};

	var hasRequiredToolbar;
	function requireToolbar() {
	  if (hasRequiredToolbar) return toolbar;
	  hasRequiredToolbar = 1;
	  Object.defineProperty(toolbar, "__esModule", {
	    value: true
	  });
	  toolbar.handleToolBar = void 0;
	  var _signals = signals;
	  var _keyButton = keyButton;
	  var _keypress = requireKeypress();
	  var _styles = styles;
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
	              done: true
	            } : {
	              done: false,
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
	      a = true,
	      u = false;
	    return {
	      s: function s() {
	        t = t.call(r);
	      },
	      n: function n() {
	        var r = t.next();
	        return a = r.done, r;
	      },
	      e: function e(r) {
	        u = true, o = r;
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
	  } // unified status bar and toolbar
	  var openKeyNav;
	  toolbar.handleToolBar = function handleToolBar(openKeyNav_obj) {
	    openKeyNav = openKeyNav_obj;
	    function initToolbarLogic(toolBarElement) {
	      // Check if we've already initialized this toolbar
	      if (toolBarElement.dataset.initialized === "true") return;

	      // Mark as initialized
	      toolBarElement.dataset.initialized = "true";
	      (0, _styles.injectToolbarStyleSheet)(openKeyNav);
	      var lastMessage;
	      (0, _signals.effect)(function () {
	        openKeyNav.config.modes;
	        openKeyNav.config.typedLabel.value;
	        updateToolbar(toolBarElement, lastMessage);
	      });
	      (0, _signals.effect)(function () {
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
	      var _iterator = _createForOfIteratorHelper(mutationsList),
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
	      var menuButton = (0, _keyButton.keyButton)([(0, _keypress.modiferKeyString)(openKeyNav), openKeyNav.config.keys.menu], "openKeyNav");
	      if (openKeyNav.meta.enabled.value) {
	        menuButton = (0, _keyButton.keyButton)([openKeyNav.config.keys.menu], "Shortcuts");
	      }
	      return "<p>\n                    ".concat(menuButton, "\n                    ").concat(dragButton, "\n                    ").concat(clickButton, " \n                </p>\n            ");
	    },
	    clickMode: function clickMode() {
	      return "<p>".concat((0, _keyButton.keyButton)(["Esc"], "Click Mode"), "</p>");
	    },
	    dragMode: function dragMode() {
	      return "<p>".concat((0, _keyButton.keyButton)(["Esc"], "Drag Mode"), "</p>");
	    },
	    structuralNavigation: function structuralNavigation() {
	      return "<p>".concat((0, _keyButton.keyButton)(['Alt', openKeyNav.config.keys.structuralNavigation], 'Structural Navigation'), "</p>");
	    },
	    menu: function menu() {
	      var dragButton = "";
	      if (openKeyNav.config.modesConfig.move.config.length) {
	        // if drag mode is configured
	        dragButton = (0, _keyButton.keyButton)([openKeyNav.config.keys.move], "Drag");
	      }
	      var structuralNavigationButton = "";
	      var structuralNavigationConfig = openKeyNav.config.modesConfig.structuralNavigation;
	      var structuralNavigationKey = openKeyNav.config.keys.structuralNavigation;
	      if ((structuralNavigationConfig === null || structuralNavigationConfig === void 0 ? void 0 : structuralNavigationConfig.enabled) === true && typeof structuralNavigationKey === 'string' && structuralNavigationKey.length) {
	        structuralNavigationButton = (0, _keyButton.keyButton)([structuralNavigationKey], "Structural Navigation");
	      }
	      return "\n            <p>".concat((0, _keyButton.keyButton)(["Esc"], "Shortcuts"), "</p>\n            <div class=\"openKeyNav-toolBar-expanded\">\n                ").concat((0, _keyButton.keyButton)([openKeyNav.config.keys.click], "Click"), "\n                ").concat(dragButton, "\n                ").concat(structuralNavigationButton, "\n            </div>\n        ");
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
	    } else if (openKeyNav.config.modes.structuralNavigation.value) {
	      message = toolbarTemplates.structuralNavigation();
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
	  return toolbar;
	}

	var status = {};

	function _typeof(o) {
	  "@babel/helpers - typeof";

	  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, _typeof(o);
	}
	Object.defineProperty(status, "__esModule", {
	  value: true
	});
	status.resolveStatusHost = status.StatusService = void 0;
	var _domUtilities = domUtilities;
	var _styles = styles;
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
	            done: true
	          } : {
	            done: false,
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
	    a = true,
	    u = false;
	  return {
	    s: function s() {
	      t = t.call(r);
	    },
	    n: function n() {
	      var r = t.next();
	      return a = r.done, r;
	    },
	    e: function e(r) {
	      u = true, o = r;
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
	function _classCallCheck(a, n) {
	  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
	}
	function _defineProperties(e, r) {
	  for (var t = 0; t < r.length; t++) {
	    var o = r[t];
	    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
	  }
	}
	function _createClass(e, r, t) {
	  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
	    writable: false
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
	function _slicedToArray(r, e) {
	  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
	}
	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
	function _iterableToArrayLimit(r, l) {
	  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	  if (null != t) {
	    var e,
	      n,
	      i,
	      u,
	      a = [],
	      f = true,
	      o = false;
	    try {
	      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
	    } catch (r) {
	      o = true, n = r;
	    } finally {
	      try {
	        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
	      } finally {
	        if (o) throw n;
	      }
	    }
	    return a;
	  }
	}
	function _arrayWithHoles(r) {
	  if (Array.isArray(r)) return r;
	}
	var INVALID_STATUS_HOSTS = new Set(['AREA', 'BASE', 'BR', 'BUTTON', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'OPTGROUP', 'OPTION', 'PARAM', 'SOURCE', 'SELECT', 'TEXTAREA', 'TRACK', 'WBR']);
	var canContainStatus = function canContainStatus(value) {
	  return (0, _domUtilities.isShadowRoot)(value) || (0, _domUtilities.isElement)(value) && !INVALID_STATUS_HOSTS.has(value.tagName);
	};
	var topmostModal = function topmostModal(document) {
	  if (!(document !== null && document !== void 0 && document.querySelectorAll)) return null;
	  try {
	    var nativeModals = Array.from(document.querySelectorAll('dialog:modal'));
	    if (nativeModals.length) return nativeModals[nativeModals.length - 1];
	  } catch (error) {
	    // DOM implementations without :modal support fall through to ARIA dialogs.
	  }
	  var ariaModals = Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).filter(function (element) {
	    return element.isConnected;
	  });
	  return ariaModals[ariaModals.length - 1] || null;
	};
	var resolveStatusHost = status.resolveStatusHost = function resolveStatusHost(document, requestedHost) {
	  var resolved = typeof requestedHost === 'function' ? requestedHost() : requestedHost;
	  if (resolved === 'modal') {
	    return topmostModal(document) || (document === null || document === void 0 ? void 0 : document.body) || (document === null || document === void 0 ? void 0 : document.documentElement) || null;
	  }
	  if (resolved === 'body' || !resolved || (0, _domUtilities.isDocument)(resolved)) {
	    return (document === null || document === void 0 ? void 0 : document.body) || (document === null || document === void 0 ? void 0 : document.documentElement) || null;
	  }
	  if (canContainStatus(resolved)) return resolved;
	  return (document === null || document === void 0 ? void 0 : document.body) || (document === null || document === void 0 ? void 0 : document.documentElement) || null;
	};
	var normalizeClassNames = function normalizeClassNames(value) {
	  return (Array.isArray(value) ? value : String(value || '').split(/\s+/)).filter(Boolean);
	};
	var applyVisibility = function applyVisibility(element, visible) {
	  element.classList.toggle('openKeyNav-status--visually-hidden', visible === false);
	};
	var applyDataset = function applyDataset(element) {
	  var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  Object.entries(values).forEach(function (_ref) {
	    var _ref2 = _slicedToArray(_ref, 2),
	      name = _ref2[0],
	      value = _ref2[1];
	    if (value === null || value === undefined) {
	      delete element.dataset[name];
	      return;
	    }
	    element.dataset[name] = String(value);
	  });
	};
	var setContent = function setContent(entry, message, options) {
	  var content = entry.content;
	  var normalizedMessage = String(message !== null && message !== void 0 ? message : '');
	  var trustedHtml = options.trustedHtml === true;
	  var contentKey = "".concat(trustedHtml ? 'html' : 'text', ":").concat(normalizedMessage);
	  if (options.dedupe !== false && entry.contentKey === contentKey) {
	    return false;
	  }
	  if (trustedHtml) {
	    content.innerHTML = normalizedMessage;
	  } else {
	    content.textContent = normalizedMessage;
	  }
	  entry.contentKey = contentKey;
	  return true;
	};
	var addToolName = function addToolName(document, element) {
	  var logo = document.createElement('div');
	  logo.className = 'okn-logo-text tiny';
	  logo.setAttribute('role', 'img');
	  logo.setAttribute('aria-label', 'OpenKeyNav');
	  logo.innerHTML = 'Open<span class="key">Key</span>Nav';
	  element.prepend(logo);
	  return logo;
	};

	/**
	 * Owns OpenKeyNav's live status and notification surfaces for one instance.
	 *
	 * Text is escaped by default. Callers must opt in with `trustedHtml: true` for
	 * markup that OpenKeyNav itself generated.
	 */
	status.StatusService = /*#__PURE__*/function () {
	  function StatusService() {
	    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	      ownerDocument = _ref3.document;
	    _classCallCheck(this, StatusService);
	    this.document = ownerDocument || null;
	    this.channels = new Map();
	    this.containers = new Map();
	    this.styles = new Map();
	  }
	  return _createClass(StatusService, [{
	    key: "ownerDocument",
	    value: function ownerDocument() {
	      if (this.document) return this.document;
	      return typeof document === 'undefined' ? null : document;
	    }
	  }, {
	    key: "containerFor",
	    value: function containerFor(host, options) {
	      var _container;
	      if (!options.containerClass) return host;
	      var key = "".concat(options.containerKey || options.containerClass);
	      var hostContainers = this.containers.get(host);
	      if (!hostContainers) {
	        hostContainers = new Map();
	        this.containers.set(host, hostContainers);
	      }
	      var container = hostContainers.get(key);
	      if (((_container = container) === null || _container === void 0 ? void 0 : _container.parentNode) !== host) {
	        var _document = this.ownerDocument();
	        container = _document.createElement('div');
	        container.className = normalizeClassNames(options.containerClass).join(' ');
	        container.setAttribute('data-openkeynav-ui', 'status-container');
	        container.dataset.openkeynavStatusContainer = key;
	        host.appendChild(container);
	        hostContainers.set(key, container);
	      }
	      if (options.containerId && (!this.ownerDocument().getElementById(options.containerId) || container.id === options.containerId)) {
	        container.id = options.containerId;
	      }
	      return container;
	    }
	  }, {
	    key: "styleRootFor",
	    value: function styleRootFor(host) {
	      var _host$getRootNode;
	      if ((0, _domUtilities.isShadowRoot)(host)) return host;
	      var root = host === null || host === void 0 || (_host$getRootNode = host.getRootNode) === null || _host$getRootNode === void 0 ? void 0 : _host$getRootNode.call(host);
	      if ((0, _domUtilities.isShadowRoot)(root)) return root;
	      return this.ownerDocument();
	    }
	  }, {
	    key: "ensureStyles",
	    value: function ensureStyles(host) {
	      var _style;
	      var document = this.ownerDocument();
	      var root = this.styleRootFor(host);
	      if (!document || !root) return null;
	      var style = this.styles.get(root);
	      if ((_style = style) !== null && _style !== void 0 && _style.parentNode) return root;
	      style = document.createElement('style');
	      style.className = 'openKeyNav-status-service-style';
	      style.setAttribute('data-openkeynav-ui', 'status-style');
	      style.textContent = _styles.statusStyles;
	      if ((0, _domUtilities.isDocument)(root)) {
	        (root.head || root.documentElement).appendChild(style);
	      } else {
	        root.prepend(style);
	      }
	      this.styles.set(root, style);
	      return root;
	    }
	  }, {
	    key: "pruneStyles",
	    value: function pruneStyles() {
	      var _this = this;
	      var _iterator = _createForOfIteratorHelper(this.styles),
	        _step;
	      try {
	        var _loop = function _loop() {
	          var _step$value = _slicedToArray(_step.value, 2),
	            root = _step$value[0],
	            style = _step$value[1];
	          var inUse = Array.from(_this.channels.values()).some(function (entry) {
	            return entry.styleRoot === root;
	          });
	          if (!inUse) {
	            style.remove();
	            _this.styles.delete(root);
	          }
	        };
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          _loop();
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }, {
	    key: "removeEmptyContainer",
	    value: function removeEmptyContainer(container) {
	      var _container$hasAttribu;
	      if (!(container !== null && container !== void 0 && (_container$hasAttribu = container.hasAttribute) !== null && _container$hasAttribu !== void 0 && _container$hasAttribu.call(container, 'data-openkeynav-status-container')) || container.childElementCount) {
	        return;
	      }
	      container.remove();
	      var _iterator2 = _createForOfIteratorHelper(this.containers),
	        _step2;
	      try {
	        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	          var _step2$value = _slicedToArray(_step2.value, 2),
	            host = _step2$value[0],
	            hostContainers = _step2$value[1];
	          var _iterator3 = _createForOfIteratorHelper(hostContainers),
	            _step3;
	          try {
	            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	              var _step3$value = _slicedToArray(_step3.value, 2),
	                key = _step3$value[0],
	                candidate = _step3$value[1];
	              if (candidate === container) hostContainers.delete(key);
	            }
	          } catch (err) {
	            _iterator3.e(err);
	          } finally {
	            _iterator3.f();
	          }
	          if (!hostContainers.size) this.containers.delete(host);
	        }
	      } catch (err) {
	        _iterator2.e(err);
	      } finally {
	        _iterator2.f();
	      }
	    }
	  }, {
	    key: "createEntry",
	    value: function createEntry(channel, options) {
	      var document = this.ownerDocument();
	      if (!document) return null;
	      var element = document.createElement('div');
	      element.classList.add('openKeyNav-status');
	      element.setAttribute('data-openkeynav-ui', options.ui || 'status');
	      element.dataset.openkeynavStatusChannel = channel;
	      element.setAttribute('aria-atomic', 'true');
	      var content = document.createElement('div');
	      content.className = 'openKeyNav-status__content';
	      element.appendChild(content);
	      var entry = {
	        channel: channel,
	        element: element,
	        content: content,
	        contentKey: null,
	        timer: null,
	        duration: null,
	        container: null,
	        styleRoot: null,
	        optionClassNames: new Set(),
	        toolName: null,
	        hint: null,
	        dismiss: null
	      };
	      this.channels.set(channel, entry);
	      return entry;
	    }
	  }, {
	    key: "set",
	    value: function set(channel, message) {
	      var _this2 = this,
	        _options$hint;
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      var document = this.ownerDocument();
	      if (!document) return null;
	      var normalizedChannel = String(channel || '').trim();
	      if (!normalizedChannel) {
	        throw new TypeError('A non-empty status channel is required.');
	      }
	      var host = resolveStatusHost(document, options.host);
	      if (!host) return null;
	      var styleRoot = this.ensureStyles(host);
	      var entry = this.channels.get(normalizedChannel);
	      if (!entry) {
	        entry = this.createEntry(normalizedChannel, options);
	      }
	      if (!entry) return null;
	      entry.optionClassNames.forEach(function (className) {
	        entry.element.classList.remove(className);
	      });
	      entry.optionClassNames = new Set(normalizeClassNames(options.className));
	      entry.optionClassNames.forEach(function (className) {
	        entry.element.classList.add(className);
	      });
	      if (options.toolName && !entry.toolName) {
	        entry.toolName = addToolName(document, entry.element);
	      } else if (!options.toolName && entry.toolName) {
	        entry.toolName.remove();
	        entry.toolName = null;
	      }
	      var politeness = ['assertive', 'off'].includes(options.politeness) ? options.politeness : 'polite';
	      var role = options.role || (politeness === 'assertive' ? 'alert' : 'status');
	      entry.element.setAttribute('role', role);
	      entry.element.setAttribute('aria-live', politeness);
	      entry.element.classList.toggle('openKeyNav-status--assertive', politeness === 'assertive');
	      applyVisibility(entry.element, options.visible);
	      applyDataset(entry.element, options.data);
	      var previousContainer = entry.container;
	      var container = this.containerFor(host, options);
	      if (entry.element.parentNode !== container) {
	        container.appendChild(entry.element);
	      }
	      entry.container = container;
	      entry.styleRoot = styleRoot;
	      if (previousContainer !== container) {
	        this.removeEmptyContainer(previousContainer);
	        this.pruneStyles();
	      }
	      var contentChanged = setContent(entry, message, options);
	      var duration = Number.isFinite(options.duration) && options.duration > 0 ? options.duration : null;
	      var durationChanged = duration !== entry.duration;
	      if (entry.timer && (contentChanged || durationChanged)) {
	        clearTimeout(entry.timer);
	        entry.timer = null;
	      }
	      if ((contentChanged || durationChanged) && duration !== null) {
	        entry.timer = setTimeout(function () {
	          _this2.clear(normalizedChannel);
	        }, duration);
	      }
	      entry.duration = duration;
	      var hintMessage = String((_options$hint = options.hint) !== null && _options$hint !== void 0 ? _options$hint : '').trim();
	      if (hintMessage) {
	        if (!entry.hint) {
	          var hint = document.createElement('div');
	          hint.className = 'openKeyNav-status__hint';
	          hint.setAttribute('aria-hidden', 'true');
	          entry.element.appendChild(hint);
	          entry.hint = hint;
	        }
	        entry.hint.textContent = hintMessage;
	      } else if (entry.hint) {
	        entry.hint.remove();
	        entry.hint = null;
	      }
	      if (options.dismissible === true && !entry.dismiss) {
	        var dismiss = document.createElement('button');
	        dismiss.className = 'openKeyNav-status__dismiss';
	        dismiss.type = 'button';
	        dismiss.setAttribute('aria-label', 'Close notification');
	        dismiss.textContent = '×';
	        dismiss.addEventListener('click', function () {
	          _this2.clear(normalizedChannel);
	        });
	        entry.element.appendChild(dismiss);
	        entry.dismiss = dismiss;
	      } else if (options.dismissible !== true && entry.dismiss) {
	        entry.dismiss.remove();
	        entry.dismiss = null;
	      }
	      entry.element.classList.toggle('openKeyNav-status--dismissible', options.dismissible === true);
	      return entry.element;
	    }
	  }, {
	    key: "get",
	    value: function get(channel) {
	      var _this$channels$get;
	      return ((_this$channels$get = this.channels.get(String(channel))) === null || _this$channels$get === void 0 ? void 0 : _this$channels$get.element) || null;
	    }
	  }, {
	    key: "has",
	    value: function has(channel) {
	      return this.channels.has(String(channel));
	    }
	  }, {
	    key: "clear",
	    value: function clear(channel) {
	      var normalizedChannel = String(channel);
	      var entry = this.channels.get(normalizedChannel);
	      if (!entry) return false;
	      if (entry.timer) clearTimeout(entry.timer);
	      var container = entry.container;
	      entry.element.remove();
	      this.channels.delete(normalizedChannel);
	      this.removeEmptyContainer(container);
	      this.pruneStyles();
	      return true;
	    }
	  }, {
	    key: "clearAll",
	    value: function clearAll() {
	      var _this3 = this;
	      Array.from(this.channels.keys()).forEach(function (channel) {
	        _this3.clear(channel);
	      });
	      this.containers.clear();
	      this.styles.forEach(function (style) {
	        return style.remove();
	      });
	      this.styles.clear();
	    }
	  }]);
	}();

	var hasRequiredOpenKeyNav;
	function requireOpenKeyNav() {
	  if (hasRequiredOpenKeyNav) return OpenKeyNav$1;
	  hasRequiredOpenKeyNav = 1;
	  Object.defineProperty(OpenKeyNav$1, "__esModule", {
	    value: true
	  });
	  OpenKeyNav$1.default = void 0;
	  var _version = version;
	  var _signals = signals;
	  var _toolbar = requireToolbar();
	  var _keyButton = keyButton;
	  var _styles = styles;
	  var _keypress = requireKeypress();
	  var _escape = _escape$1;
	  var _structuralNavigation = structuralNavigation;
	  var _status = status;
	  var _domUtilities = domUtilities;
	  var _keyboardEvents = keyboardEvents;
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
	              done: true
	            } : {
	              done: false,
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
	      a = true,
	      u = false;
	    return {
	      s: function s() {
	        t = t.call(r);
	      },
	      n: function n() {
	        var r = t.next();
	        return a = r.done, r;
	      },
	      e: function e(r) {
	        u = true, o = r;
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
	        writable: true,
	        configurable: true
	      }
	    }), Object.defineProperty(t, "prototype", {
	      writable: false
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
	          enumerable: false,
	          writable: true,
	          configurable: true
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
	      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
	    }
	  }
	  function _createClass(e, r, t) {
	    return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
	      writable: false
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
	  	# then press k when you are not in a text input mode
	  # to label detected targets for direct keyboard selection.
	  # Press the key combinations on the labels to focus or activate their targets.
	  	# you can press h to navigate through headings within the viewport
	  # You can also press 1,2,3,4,5,6 to navigate through headings of the respective level
	  
	  OpenKeyNav.init({
	  	    spot : {
	          backgroundColor : 'rgba(236, 255, 128, 1)',
	          fontColor: 'black',
	          outlineColor : 'rgb(134 148 53)',
	          fontSize : 'inherit',
	          minimumFontSize: '16px',
	      },
	      focus : {
	          outlineColor : '#0088cc',
	          outlineStyle : 'solid'
	      },
	      keys : {
	          escape : 'q', // alternative escape key, for when escape key is too far or not available. // q works great because top left of letters, plus removes confusion with g, p
	          click : 'k', // enter click mode, to click on clickable elements
	          mouseOver : 'v', // toggle a mouseover event for an applicable element. In many cases this should trigger opening mouseover menus, etc // not yet wired
	          move : 'm', // enter move mode for configured keyboard movement and drag-and-drop workflows
	          scroll : 's', // focus on the next scrollable region
	          heading : 'h', // focus on the next heading // as seen in JAWS, NVDA
	          textBlock : 'n', // focus on the next block of text // as seen in JAWS, NVDA // not yet fully wired
	          landmarkRegion : 'd', // focus on the next landmark region // as seen in NVDA // not yet fully wired
	          formField : 'f', // move to the next form field // as seen in NVDA // not yet fully wired
	      },
	      move: { // configuration for keyboard movement and drag-and-drop workflows
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
	          minimumFontSize: '16px',
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
	        telemetry: {
	          enabled: true
	        },
	        keys: {
	          escape: 'q',
	          // alternative escape key, for when escape key is too far or not available. // q works great because top left of letters, plus removes confusion with g, p
	          click: 'k',
	          // enter click mode, to click on clickable elements, such as links. Was g, now k, for kanga. Plus NVDA uses k to focus on link elements, which prevents conflicting modes as it's either openkeynav or NVDA.
	          scroll: 's',
	          // focus on the next scrollable region
	          move: 'm',
	          // enter move mode for configured keyboard movement and drag-and-drop workflows
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
	          structuralNavigation: 'r',
	          // enter/exit structural focus navigation ("route" mode)
	          menu: 'o',
	          audit: 'a',
	          // run the focused keyboard review heuristic
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
	          },
	          structuralNavigation: {
	            enabled: true,
	            debug: false,
	            escapeExits: false,
	            exitCommand: null,
	            overrideModifier: 'altKey',
	            activeRoot: null,
	            includeProgrammatic: false,
	            targetFilter: null,
	            structuralContexts: [],
	            typedContexts: [],
	            ownsKey: null,
	            displayCheck: 'full',
	            status: {
	              enabled: true,
	              visible: true,
	              announcements: true,
	              dismissCommand: {
	                key: 'Escape',
	                shiftKey: true
	              }
	            },
	            contextIndicator: {
	              enabled: false
	            },
	            keylabels: {
	              enabled: true,
	              tab: true,
	              contextJump: true,
	              horizontal: true,
	              vertical: true,
	              nativeArrows: true,
	              activation: true
	            },
	            commands: {
	              previousTarget: null,
	              nextTarget: null,
	              previousSiblingContext: {
	                key: 'ArrowLeft',
	                shiftKey: true
	              },
	              nextSiblingContext: {
	                key: 'ArrowRight',
	                shiftKey: true
	              },
	              broadenContext: {
	                key: 'ArrowUp',
	                shiftKey: true
	              },
	              narrowContext: {
	                key: 'ArrowDown',
	                shiftKey: true
	              },
	              previousPeerContext: null,
	              nextPeerContext: null
	            }
	          }
	        },
	        log: [],
	        typedLabel: (0, _signals.signal)(''),
	        headings: {
	          currentHeadingIndex: -1,
	          // Start before the first heading
	          currentHeading: null,
	          list: []
	        },
	        scrollables: {
	          currentScrollableIndex: -1,
	          // Start before the first scrollable
	          list: []
	        },
	        modes: {
	          clicking: (0, _signals.signal)(false),
	          moving: (0, _signals.signal)(false),
	          menu: (0, _signals.signal)(false),
	          structuralNavigation: (0, _signals.signal)(false)
	        },
	        debug: {
	          screenReaderVisible: false,
	          keyboardAccessible: true,
	          inaccessibleCount: (0, _signals.signal)(0)
	        },
	        enabledCookie: 'openKeyNav_enabled'
	      };
	      this.meta = {
	        enabled: (0, _signals.signal)(false)
	      };
	      this.statusService = new _status.StatusService({
	        document: typeof document === 'undefined' ? null : document
	      });
	      this._notificationSequence = 0;
	      this.structuralNavigation = new _structuralNavigation.StructuralNavigationController(this);
	      this.enable = function () {
	        _this.meta.enabled.value = true;
	        _this.injectStyles();
	        _this.getSetCookie(_this.config.enabledCookie, true);
	        return _this;
	      };
	      this.disable = function () {
	        _this.exitStructuralNavigation({
	          announce: false
	        });
	        _this.meta.enabled.value = false;
	        _this.getSetCookie(_this.config.enabledCookie, false);
	        // Clear Click Mode diagnostic flags, tooltips, and listeners.
	        try {
	          _this.clearAuditFlags();
	        } catch (e) {
	          // ignore
	        }
	        _this.removeOverlays(true);
	        _this.clearMoveAttributes();
	        _this.statusService.clearAll();
	        _this.removeStyles(); // maybe this should go in the destroy();, main concern is the toolbar.
	        return _this;
	      };
	    }
	    return _createClass(OpenKeyNav, [{
	      key: "focus",
	      value: function focus(target) {
	        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	        if (!target || typeof target.focus !== 'function') return null;
	        var decorate = options.decorate !== false;
	        var receivedFocus = false;
	        var handleFocus = function handleFocus() {
	          receivedFocus = true;
	        };
	        target.addEventListener('focus', handleFocus, {
	          once: true
	        });
	        try {
	          target.focus(options.focusOptions);
	        } finally {
	          target.removeEventListener('focus', handleFocus);
	        }
	        var ownerDocument = target.ownerDocument || (typeof document === 'undefined' ? null : document);
	        var settledTarget = (0, _domUtilities.getDeepActiveElement)(ownerDocument);
	        if (!decorate || !settledTarget || !receivedFocus && settledTarget !== target) {
	          return settledTarget;
	        }
	        settledTarget.setAttribute('data-openkeynav-focused', 'true');
	        settledTarget.addEventListener('blur', function () {
	          settledTarget.removeAttribute('data-openkeynav-focused');
	        }, {
	          once: true
	        });
	        return settledTarget;
	      }
	    }, {
	      key: "setStatus",
	      value: function setStatus(channel, message) {
	        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	        return this.statusService.set(channel, message, options);
	      }
	    }, {
	      key: "getStatusElement",
	      value: function getStatusElement(channel) {
	        return this.statusService.get(channel);
	      }
	    }, {
	      key: "clearStatus",
	      value: function clearStatus(channel) {
	        return this.statusService.clear(channel);
	      }
	    }, {
	      key: "clearAllStatuses",
	      value: function clearAllStatuses() {
	        this.statusService.clearAll();
	        return this;
	      }
	    }, {
	      key: "enterStructuralNavigation",
	      value: function enterStructuralNavigation() {
	        if (!this.meta.enabled.value) {
	          return false;
	        }
	        return this.structuralNavigation.activate();
	      }
	    }, {
	      key: "exitStructuralNavigation",
	      value: function exitStructuralNavigation() {
	        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        return this.structuralNavigation.deactivate(options);
	      }
	    }, {
	      key: "structuralNavigate",
	      value: function structuralNavigate(command) {
	        if (!this.meta.enabled.value || !this.config.modes.structuralNavigation.value) {
	          return false;
	        }
	        return this.structuralNavigation.execute(command);
	      }
	    }, {
	      key: "getStructuralNavigationState",
	      value: function getStructuralNavigationState() {
	        return this.structuralNavigation.getState();
	      }
	    }, {
	      key: "invalidateStructuralNavigation",
	      value: function invalidateStructuralNavigation() {
	        this.structuralNavigation.invalidate();
	        return this;
	      }
	    }, {
	      key: "preventpropagation",
	      value: function preventpropagation(e) {
	        (0, _keyboardEvents.preventAcceptedCommand)(e);
	        return false;
	      }

	      // utility functions
	    }, {
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
	        }(/*#__PURE__*/_wrapNativeSuper(Event));
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
	          var sourceValue = source[key];
	          var sourcePrototype = sourceValue && _typeof(sourceValue) === 'object' ? Object.getPrototypeOf(sourceValue) : null;
	          var isPlainObject = sourceValue !== null && _typeof(sourceValue) === 'object' && (sourcePrototype === Object.prototype || sourcePrototype === null);
	          if (sourceValue && isPlainObject && !Array.isArray(sourceValue)) {
	            var targetValue = target[key];
	            var targetPrototype = targetValue && _typeof(targetValue) === 'object' ? Object.getPrototypeOf(targetValue) : null;
	            var targetIsPlainObject = targetValue !== null && _typeof(targetValue) === 'object' && (targetPrototype === Object.prototype || targetPrototype === null);
	            if (!targetIsPlainObject || Array.isArray(targetValue)) {
	              target[key] = {};
	            }
	            _this3.deepMerge(target[key], sourceValue);
	          } else {
	            target[key] = sourceValue;
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
	        var activeElement = (0, _domUtilities.getDeepActiveElement)(document);
	        if (!activeElement || !activeElement.tagName) {
	          return false;
	        }
	        var tagName = activeElement.tagName.toLowerCase();
	        var editable = activeElement.getAttribute('contenteditable');
	        var inputTypes = ['input', 'textarea'];
	        var isEditable = editable === 'true' || editable === 'plaintext-only' || editable === '';
	        return inputTypes.includes(tagName) || isEditable;
	      }

	      // avoids overlaps
	    }, {
	      key: "updateOverlayPosition",
	      value: function updateOverlayPosition(element, overlay) {
	        var elementsToAvoid = Array.from(document.querySelectorAll('[data-openkeynav-label], ' + '[data-openkeynav-keylabel-target-active], ' + '.openKeyNav-label-selected, .openKeyNav-toolBar'));
	        var rectAvoid = element.getBoundingClientRect();
	        var overlayWidth = overlay.getBoundingClientRect().width;
	        var overlayHeight = overlay.getBoundingClientRect().height;
	        var arrowWidth = this.config.spot.arrowSize_px;
	        var isOpenKeyNavOverlay = function isOpenKeyNavOverlay(avoidEl) {
	          var _avoidEl$classList, _avoidEl$classList2, _avoidEl$classList3;
	          return ((_avoidEl$classList = avoidEl.classList) === null || _avoidEl$classList === void 0 ? void 0 : _avoidEl$classList.contains('openKeyNav-label')) || ((_avoidEl$classList2 = avoidEl.classList) === null || _avoidEl$classList2 === void 0 ? void 0 : _avoidEl$classList2.contains('openKeyNav-label-selected')) || ((_avoidEl$classList3 = avoidEl.classList) === null || _avoidEl$classList3 === void 0 ? void 0 : _avoidEl$classList3.contains('openKeyNav-toolBar'));
	        };
	        function isBoundingBoxIntersecting(rectOverlay, rectAvoid) {
	          return !(rectOverlay.right <= rectAvoid.left || rectOverlay.left >= rectAvoid.right || rectOverlay.bottom <= rectAvoid.top || rectOverlay.top >= rectAvoid.bottom);
	        }
	        var isOverlapping = function isOverlapping(overlay, avoidEl) {
	          var rectOverlay = overlay.getBoundingClientRect();
	          var rectAvoid = avoidEl.getBoundingClientRect();

	          // OpenKeyNav overlays share the same visual plane. Their bounding
	          // boxes must never intersect, even when one overlay also crosses the
	          // target that the other overlay describes.
	          if (isOpenKeyNavOverlay(avoidEl)) {
	            return isBoundingBoxIntersecting(rectOverlay, rectAvoid);
	          }
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
	          return isCutOff(overlay) || elementsToAvoid.some(function (avoidEl) {
	            if (avoidEl === overlay || avoidEl === element) {
	              return false;
	            }

	            // Check if the element is directly on top of the avoidEl
	            var rectAvoidEl = avoidEl.getBoundingClientRect();
	            var isElementOnTop = isBoundingBoxIntersecting(rectAvoid, rectAvoidEl);
	            if (isElementOnTop && !isOpenKeyNavOverlay(avoidEl)) {
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
	        var cssClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
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
	        if (cssClass) {
	          overlay.classList.add(cssClass);
	        }
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
	            // Structural navigation is a persistent base mode. Overlay cleanup
	            // ends temporary foreground modes but leaves it active until an
	            // explicit structural exit, global disable, or teardown.
	            if (key === 'structuralNavigation') continue;
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

	      // Remove audit flags, tooltips, and event listeners added during audit
	    }, {
	      key: "clearAuditFlags",
	      value: function clearAuditFlags() {
	        try {
	          // Remove classes and attributes
	          document.querySelectorAll('.openKeyNav-inaccessible').forEach(function (el) {
	            el.classList.remove('openKeyNav-inaccessible');
	            el.removeAttribute('data-openkeynav-inaccessible-reason');
	          });

	          // Remove tooltip elements
	          document.querySelectorAll('.openKeyNav-mouseover-tooltip').forEach(function (t) {
	            t.remove();
	          });

	          // Remove event listeners stored in the map
	          try {
	            if (this.config && this.config.modesConfig && this.config.modesConfig.click && this.config.modesConfig.click.eventListenersMap) {
	              this.config.modesConfig.click.eventListenersMap.forEach(function (listeners, el) {
	                try {
	                  if (listeners && listeners.showTooltip) el.removeEventListener('mouseover', listeners.showTooltip);
	                  if (listeners && listeners.hideTooltip) el.removeEventListener('mouseleave', listeners.hideTooltip);
	                } catch (e) {
	                  // ignore
	                }
	              });
	              this.config.modesConfig.click.eventListenersMap.clear();
	            }
	          } catch (e) {
	            // ignore
	          }
	        } catch (e) {
	          // ignore
	        }
	      }
	    }, {
	      key: "addKeydownEventListener",
	      value: function addKeydownEventListener() {
	        var _this7 = this;
	        if (this._keydownHandler) {
	          return;
	        }
	        this._keydownHandler = function (e) {
	          (0, _keypress.handleKeyPress)(_this7, e);
	        };
	        document.addEventListener('keydown', this._keydownHandler, true);

	        // Existing click-label iframe support. Structural navigation deliberately
	        // treats each iframe as one atomic target and never uses this bridge.
	        this._messageHandler = function (e) {
	          if (e.data && e.data.type === 'keydown') {
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
	            Object.defineProperty(newEvent, 'openKeyNavIframeBridge', {
	              value: true
	            });
	            if (newEvent.key === 'Escape') {
	              // Execute escape logic
	              (0, _escape.handleEscape)(_this7, e);
	            }

	            // Dispatch it on the document or specific element that your existing handler is attached to
	            document.dispatchEvent(newEvent);
	          }
	        };
	        window.addEventListener('message', this._messageHandler);
	      }
	    }, {
	      key: "removeKeydownEventListener",
	      value: function removeKeydownEventListener() {
	        if (this._keydownHandler) {
	          document.removeEventListener('keydown', this._keydownHandler, true);
	          this._keydownHandler = null;
	        }
	        if (this._messageHandler) {
	          window.removeEventListener('message', this._messageHandler);
	          this._messageHandler = null;
	        }
	      }

	      // Emit an assertive notification through the shared status renderer.
	      // Messages are text by default; trusted OpenKeyNav markup must opt in.
	    }, {
	      key: "emitNotification",
	      value: function emitNotification(message) {
	        var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	        if (duration && _typeof(duration) === 'object') {
	          options = duration;
	          duration = null;
	        }
	        if (!this.config.notifications.enabled) return null;
	        var requestedDuration = duration !== null ? duration : this.config.notifications.duration;
	        var parsedDuration = Number(requestedDuration);
	        var notificationDuration = Number.isFinite(parsedDuration) ? parsedDuration : 3000;
	        var persistent = notificationDuration === 0;
	        var channel = persistent ? "notification-".concat(++this._notificationSequence) : 'notification';
	        if (persistent) this.clearStatus('notification');
	        return this.setStatus(channel, message, {
	          className: 'openKeyNav-notification',
	          containerClass: 'openKeyNav-notification-container openKeyNav-ignore-overlap',
	          containerKey: 'notifications',
	          containerId: 'okn-notification-container',
	          ui: 'notification',
	          role: 'alert',
	          politeness: 'assertive',
	          visible: true,
	          duration: notificationDuration,
	          dismissible: persistent,
	          toolName: this.config.notifications.displayToolName,
	          trustedHtml: options.trustedHtml === true,
	          host: options.host || 'modal'
	        });
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
	          } else if (modes.structuralNavigation.value) {
	            // Structural navigation owns a persistent polite status channel.
	            // Avoid announcing "No mode active" when a temporary mode closes.
	            lastMessage = "No mode active.";
	            return;
	          } else {
	            message = "No mode active.";
	          }

	          // Only emit the notification if the message has changed
	          if (message === lastMessage) {
	            return;
	          }

	          // Emit the notification with the current message
	          // console.log(message);
	          _this8.emitNotification(message, null, {
	            trustedHtml: true
	          });
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
	          } else if (modes.structuralNavigation.value) {
	            statusBar.textContent = "Structural navigation active. Press Alt+R to exit.";
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
	        // The JSON body is minimal and contains the library version. The receiving
	        // infrastructure can still observe ordinary network-request metadata.

	        if (!this.config.telemetry.enabled) {
	          return;
	        }

	        // No need to run application support telemetry during local development.
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
	        if (!this._statusBarInitialized) {
	          this.initStatusBar();
	          this._statusBarInitialized = true;
	        }
	        if (!this._toolBarInitialized) {
	          this.initToolBar();
	          this._toolBarInitialized = true;
	        }
	        this.applicationSupport();
	        this.checkEnabled();
	        console.log('Library initialized with config:', this.config);
	        return this;
	      }
	    }, {
	      key: "destroy",
	      value: function destroy() {
	        this.exitStructuralNavigation({
	          announce: false
	        });
	        this.statusService.clearAll();
	        this.removeKeydownEventListener();
	        this.removeOverlays(true);
	        this.clearMoveAttributes();
	        this.clearAuditFlags();
	        this.removeStyles();
	        this.meta.enabled.value = false;
	        return this;
	      }
	    }]);
	  }(); // optionally attach a syncronous event listener here for tracking the elements tied to click events, (added and removed),
	  // since elements with click events are behaving like buttons
	  OpenKeyNav$1.default = OpenKeyNav;
	  return OpenKeyNav$1;
	}

	var OpenKeyNavExports = requireOpenKeyNav();
	var OpenKeyNav = /*@__PURE__*/getDefaultExportFromCjs(OpenKeyNavExports);

	return OpenKeyNav;

}));
