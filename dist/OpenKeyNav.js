"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _version = require("./version");
var _signals = require("./signals.js");
var _toolbar = require("./toolbar.js");
var _keyButton = require("./keyButton.js");
var _styles = require("./styles.js");
var _keypress = require("./keypress.js");
var _escape = require("./escape");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
        height: 32
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
        menu: 'o'
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
      }
    };
  }

  // utility functions
  return _createClass(OpenKeyNav, [{
    key: "setupTouchEvent",
    value: function setupTouchEvent() {
      window.TouchEvent = /*#__PURE__*/function (_Event) {
        function TouchEvent(type, initDict) {
          var _this;
          _classCallCheck(this, TouchEvent);
          _this = _callSuper(this, TouchEvent, [type, initDict]);
          _this.touches = initDict.touches || [];
          _this.targetTouches = initDict.targetTouches || [];
          _this.changedTouches = initDict.changedTouches || [];
          _this.altKey = initDict.altKey || false;
          _this.metaKey = initDict.metaKey || false;
          _this.ctrlKey = initDict.ctrlKey || false;
          _this.shiftKey = initDict.shiftKey || false;
          return _this;
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
      var _this2 = this;
      Object.keys(source).forEach(function (key) {
        if (source[key] && _typeof(source[key]) === 'object') {
          if (!target[key] || _typeof(target[key]) !== 'object') {
            target[key] = {};
          }
          _this2.deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      });
      return target;
    }
  }, {
    key: "injectStyles",
    value: function injectStyles() {
      (0, _styles.injectStylesheet)(this);
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
      var elementsToAvoid = document.querySelectorAll('[data-openkeynav-label], .openKeyNav-label-selected, .openKeyNav-toolBar');
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
      var _this3 = this;
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
          return _this3.updateOverlayPosition(element, overlay);
        });
      }
      if (element.classList.contains('openKeyNav-inaccessible')) {
        overlay.classList.add('openKeyNav-inaccessible');
      }
      ;
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
      var _this4 = this;
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

      // Determine if the overflow style allows for scrolling
      function isOverflowScrollable(overflow) {
        return overflow === 'scroll' || overflow === 'auto' || overflow === 'overlay';
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
        if (!_this4.config.debug.screenReaderVisible) {
          return _this4.isAnyCornerVisible(elem) && isPotentiallyScrollable(elem) && (isYScrollable(elem) || isXScrollable(elem));
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
      var _this5 = this;
      var resetModes = function resetModes() {
        for (var key in _this5.config.modes) {
          _this5.config.modes[key].value = false;
        }

        // reset move mode config
        _this5.config.modesConfig.move.selectedConfig = false;
        _this5.config.modesConfig.move.selectedMoveable = false;
        _this5.config.modesConfig.move.selectedMoveableHTML = false;
        _this5.config.modesConfig.move.selectedDropZone = false;
        _this5.config.modesConfig.move.modifier = false;

        // reset click mode config
        _this5.config.modesConfig.click.modifier = false;

        // reset menu mode config
        _this5.config.modesConfig.menu.modifier = false;
      };
      var clearInaccessibleWarnings = function clearInaccessibleWarnings() {
        document.querySelectorAll('.openKeyNav-inaccessible').forEach(function (el) {
          // remove inaccessible indicator styles
          el.classList.remove('openKeyNav-inaccessible');

          // Remove the event listeners if they exist in the map
          if (_this5.config.modesConfig.click.eventListenersMap.has(el)) {
            var _this5$config$modesCo = _this5.config.modesConfig.click.eventListenersMap.get(el),
              showTooltip = _this5$config$modesCo.showTooltip,
              hideTooltip = _this5$config$modesCo.hideTooltip;
            el.removeEventListener('mouseover', showTooltip);
            el.removeEventListener('mouseleave', hideTooltip);
            _this5.config.modesConfig.click.eventListenersMap.delete(el);
          }
        });
        document.querySelectorAll('.openKeyNav-mouseover-tooltip').forEach(function (el) {
          return el.remove();
        }); // remove the mouseover tooltips
      };
      var enableScrolling = function enableScrolling() {
        // Re-enable scrolling on the webpage

        var enableScrollingForEl = function enableScrollingForEl(el) {
          el.removeEventListener('scroll', _this5.preventScroll, {
            passive: false
          });
          el.removeEventListener('wheel', _this5.preventScroll, {
            passive: false
          });
          el.removeEventListener('touchmove', _this5.preventScroll, {
            passive: false
          });
        };
        var enableScrollingForScrollableElements = function enableScrollingForScrollableElements() {
          enableScrollingForEl(window);
          _this5.getScrollableElements().forEach(function (el) {
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
        default:
          break;
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
      var _this6 = this;
      // Detect this.config.keys.click to enter label mode
      // Using an arrow function to maintain 'this' context of class
      document.addEventListener('keydown', function (e) {
        (0, _keypress.handleKeyPress)(_this6, e);
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
            (0, _escape.handleEscape)(_this6, e);
          }

          // Dispatch it on the document or specific element that your existing handler is attached to
          document.dispatchEvent(newEvent);
        }
      });
    }
  }, {
    key: "initStatusBar",
    value: function initStatusBar() {
      var _this7 = this;
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

      // Function to emit a temporary notification
      var emitNotification = function emitNotification(message) {
        // Check if notifications are enabled
        if (!_this7.config.notifications.enabled) {
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
        if (_this7.config.notifications.displayToolName) {
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
        }, _this7.config.notifications.duration);
      };

      // Effect to emit a notification based on the current mode
      var lastMessage = "No mode active.";
      (0, _signals.effect)(function () {
        var modes = _this7.config.modes;
        var message;

        // Determine the message based on the current mode
        if (modes.clicking.value) {
          message = "In Click Mode. Press ".concat((0, _keyButton.keyButton)("Esc"), " to exit.");
        } else if (modes.moving.value) {
          message = "In Drag Mode. Press ".concat((0, _keyButton.keyButton)("Esc"), " to exit.");
        } else {
          message = "No mode active.";
        }

        // Only emit the notification if the message has changed
        if (message === lastMessage) {
          return;
        }

        // Emit the notification with the current message
        console.log(message);
        emitNotification(message);
        lastMessage = message;
      });

      // Effect to update the status bar based on the current mode
      (0, _signals.effect)(function () {
        var modes = _this7.config.modes;
        // DOM element to update
        var statusBar = document.getElementById('status-bar');

        // Abort if no status bar is found
        if (!statusBar) {
          console.warn('Status bar element not found in the DOM.');
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
      this.injectStyles();
      this.addKeydownEventListener();
      // this.setupGlobalClickListenerTracking();
      this.initStatusBar();
      this.initToolBar();
      this.applicationSupport();
      console.log('Library initialized with config:', this.config);
      // window["openKeyNav"] = this;
    }
  }]);
}(); // optionally attach a syncronous event listener here for tracking the elements tied to click events, (added and removed),
// since elements with click events are behaving like buttons
var _default = exports.default = OpenKeyNav;