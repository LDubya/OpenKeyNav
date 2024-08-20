"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
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
        heading_6: '6' // focus on the next heading of level 6 // as seen in JAWS, NVDA // do not modify
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
        }
      },
      log: [],
      typedLabel: '',
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
        clicking: false,
        moving: false
      },
      debug: {
        screenReaderVisible: false,
        keyboardAccessible: true
      },
      init: function init() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        // Merge the options with the default settings
        deepMerge(OpenKeyNav, options);
        injectStylesheet();
        addKeydownEventListener();
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
    key: "injectStylesheet",
    value: function injectStylesheet() {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '' + '.openKeyNav-label {' + 'font: inherit;' + 'vertical-align: baseline;' + 'box-sizing: border-box;' + 'white-space: nowrap;' + "border: 1px solid ".concat(this.config.spot.fontColor, ";") + //   `box-shadow: inset 0 -2.5px 0 ${this.config.spot.insetColor}, inset 0 -3px 0 #999, 0 0 4px #fff;` +
      //   `background: linear-gradient(to top, #999 5%, ${this.config.spot.backgroundColor} 20%);` +
      "background-color: ".concat(this.config.spot.backgroundColor, ";") + //   'border-radius: calc( 4px );' +
      "color: ".concat(this.config.spot.fontColor, ";") + 'display: inline-block;' + "font-size: ".concat(this.config.spot.fontSize, ";") +
      // `outline : 2px solid ${this.config.focus.outlineColor};` +
      'outline-offset: -2px !important;' +
      // +"font-weight: bold;"
      'font-weight: inherit;' +
      //   'line-height: 1.5;' +
      'line-height: 1;' + 'margin: 0 .1em 0 1px;' + 'overflow-wrap: break-word;' +
      //   'padding: .0 .15em .1em;' +
      'padding: 3px;' + "text-shadow: 0 1px 0 ".concat(this.config.spot.insetColor, ";") + 'min-width: 1rem;' + 'text-align: center;' + 'position: absolute;' + 'z-index: 99999999;' + 'font-family: monospace;' + '}' + '.openKeyNav-label[data-openkeynav-position="left"]::after, ' + '.openKeyNav-label[data-openkeynav-position="right"]::before, ' + '.openKeyNav-label[data-openkeynav-position="top"]::after, ' + '.openKeyNav-label[data-openkeynav-position="bottom"]::before, ' + '.openKeyNav-label[data-openkeynav-position="left"]::before, ' + '.openKeyNav-label[data-openkeynav-position="right"]::after, ' + '.openKeyNav-label[data-openkeynav-position="top"]::before, ' + '.openKeyNav-label[data-openkeynav-position="bottom"]::after {' + 'content: "";' + 'position: absolute;' + '}' + '.openKeyNav-label[data-openkeynav-position="left"]::after, ' + '.openKeyNav-label[data-openkeynav-position="right"]::before, ' + '.openKeyNav-label[data-openkeynav-position="left"]::before, ' + '.openKeyNav-label[data-openkeynav-position="right"]::after {' + 'top: 50%;' + 'transform: translateY(-50%);' + '}' + '.openKeyNav-label[data-openkeynav-position="top"]::after, ' + '.openKeyNav-label[data-openkeynav-position="bottom"]::before, ' + '.openKeyNav-label[data-openkeynav-position="top"]::before, ' + '.openKeyNav-label[data-openkeynav-position="bottom"]::after {' + 'left: 50%;' + 'transform: translateX(-50%);' + '}' + '.openKeyNav-label[data-openkeynav-position="left"]::before {' + "border-left: ".concat(this.config.spot.arrowSize_px + 1, "px solid #fff;") + "right: -".concat(this.config.spot.arrowSize_px + 1, "px;") + "border-top: ".concat(this.config.spot.arrowSize_px + 1, "px solid transparent;") + "border-bottom: ".concat(this.config.spot.arrowSize_px + 1, "px solid transparent;") + '}' + '.openKeyNav-label[data-openkeynav-position="left"]::after {' + "border-left: ".concat(this.config.spot.arrowSize_px, "px solid ").concat(this.config.spot.backgroundColor, ";") + "right: -".concat(this.config.spot.arrowSize_px, "px;") + "border-top: ".concat(this.config.spot.arrowSize_px, "px solid transparent;") + "border-bottom: ".concat(this.config.spot.arrowSize_px, "px solid transparent;") + '}' + '.openKeyNav-label[data-openkeynav-position="right"]::before {' + "border-right: ".concat(this.config.spot.arrowSize_px + 1, "px solid #fff;") + "left: -".concat(this.config.spot.arrowSize_px + 1, "px;") + "border-top: ".concat(this.config.spot.arrowSize_px + 1, "px solid transparent;") + "border-bottom: ".concat(this.config.spot.arrowSize_px + 1, "px solid transparent;") + '}' + '.openKeyNav-label[data-openkeynav-position="right"]::after {' + "border-right: ".concat(this.config.spot.arrowSize_px, "px solid ").concat(this.config.spot.backgroundColor, ";") + "left: -".concat(this.config.spot.arrowSize_px, "px;") + "border-top: ".concat(this.config.spot.arrowSize_px, "px solid transparent;") + "border-bottom: ".concat(this.config.spot.arrowSize_px, "px solid transparent;") + '}' + '.openKeyNav-label[data-openkeynav-position="top"]{' + 'padding-bottom: 0;' + '}' + '.openKeyNav-label[data-openkeynav-position="top"]::before {' + "border-top: ".concat(this.config.spot.arrowSize_px + 1, "px solid #fff;") + "bottom: -".concat(this.config.spot.arrowSize_px + 1, "px;") + "border-left: ".concat(this.config.spot.arrowSize_px + 1, "px solid transparent;") + "border-right: ".concat(this.config.spot.arrowSize_px + 1, "px solid transparent;") + '}' + '.openKeyNav-label[data-openkeynav-position="top"]::after {' + "border-top: ".concat(this.config.spot.arrowSize_px, "px solid ").concat(this.config.spot.backgroundColor, ";") + "bottom: -".concat(this.config.spot.arrowSize_px, "px;") + "border-left: ".concat(this.config.spot.arrowSize_px, "px solid transparent;") + "border-right: ".concat(this.config.spot.arrowSize_px, "px solid transparent;") + '}' + '.openKeyNav-label[data-openkeynav-position="bottom"]{' + 'padding-top: 0;' + '}' + '.openKeyNav-label[data-openkeynav-position="bottom"]::before {' + "border-bottom: ".concat(this.config.spot.arrowSize_px + 1, "px solid #fff;") + "top: -".concat(this.config.spot.arrowSize_px + 1, "px;") + "border-left: ".concat(this.config.spot.arrowSize_px + 1, "px solid transparent;") + "border-right: ".concat(this.config.spot.arrowSize_px + 1, "px solid transparent;") + '}' + '.openKeyNav-label[data-openkeynav-position="bottom"]::after {' + "border-bottom: ".concat(this.config.spot.arrowSize_px, "px solid ").concat(this.config.spot.backgroundColor, ";") + "top: -".concat(this.config.spot.arrowSize_px, "px;") + "border-left: ".concat(this.config.spot.arrowSize_px, "px solid transparent;") + "border-right: ".concat(this.config.spot.arrowSize_px, "px solid transparent;") + '}' + '.openKeyNav-label-selected{' +
      // 'padding : 0;' +
      // 'margin : 0;' +
      'display : grid;' + 'align-content : center;' + "color : ".concat(this.config.spot.fontColor, ";") + "background : ".concat(this.config.spot.backgroundColor, ";") + // `outline : 4px solid ${this.config.focus.outlineColor};` +
      "outline: none;" +
      // `border-radius: 100%;` +
      // `width: 1rem;` +
      // `height: 1rem;` +
      // 'text-shadow : none;' +
      // 'padding : 0 !important;' +
      // 'margin: 0 !important;' +
      '}' + '[data-openkeynav-label]:not(.openKeyNav-label):not(button){' + // `outline: 2px double ${this.config.focus.outlineColor} !important;` +
      // 'outline-offset: 2px !important;' +
      "box-shadow:  inset 0 0 0 .5px #000,\n                        0 0 0 .75px #000,\n                        0 0 0 1.5px rgba(255,255,255,1);" + 'outline:none !important;' +
      // 'border-radius: 3px;' +
      'border-color: #000;' + 'border-radius: 3px;' + '}' + 'button[data-openkeynav-label]{' + 'outline:2px solid #000 !important;' + '}' + '.openKeyNav-inaccessible:not(.openKeyNav-label):not(button){' + "box-shadow:  inset 0 0 0 .5px #f00,\n                        0 0 0 1px #f00,\n                        0 0 0 1.5px rgba(255,255,255,1);" + 'outline:none !important;' + 'border-color: #f00;' + 'border-radius: 3px;' + '}' + 'button.openKeyNav-inaccessible{' + 'outline:2px solid #f00 !important;' + '}' + '.openKeyNav-inaccessible.openKeyNav-label{' + "box-shadow:  inset 0 0 0 .5px #f00,\n                        0 0 0 1px #f00,\n                        0 0 0 1.5px rgba(255,255,255,1);" + 'border-color: #f00;' + 'border-radius: 3px;' + '}' +
      //   +"span[data-openkeynav-label]{"
      //       +"display: inherit;"
      //   +"}"
      '.openKeyNav-noCursor *{' + 'cursor: none !important;' + '}' + '*:focus {' + "outline: 2px ".concat(this.config.focus.outlineStyle, " ").concat(this.config.focus.outlineColor, " !important;") + 'outline-offset: -2px !important;' + '}' + '.openKeyNav-mouseover-tooltip{' + 'position: absolute;' + 'background-color: #333;' + 'color: #fff;' + 'padding: 5px;' + 'border-radius: 5px;' + 'display: none;' + 'z-index: 1000;' + 'font-size: 12px;' + '}' + '.openKeyNav-mouseover-tooltip::before{' + 'content: "Debug mode"' + '}'
      //   '[data-openkeynav-draggable="true"] {' +
      //   `outline: 2px solid ${this.config.focus.outlineColor};` +
      //   'outline-offset: -1px !important;' +
      // '}'
      ;
      document.head.appendChild(style);
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
      var elementsToAvoid = document.querySelectorAll('[data-openkeynav-label], .openKeyNav-label-selected');
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
              return avoidEl === elementAtPoint || avoidEl.contains(elementAtPoint);
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
    key: "isTopLeftCornerVisible",
    value: function isTopLeftCornerVisible(element) {
      var isElementInIframe = function isElementInIframe(element) {
        return element.ownerDocument !== window.document;
      };
      var doc = element.ownerDocument;
      var win = doc.defaultView || doc.parentWindow;
      var rect = element.getBoundingClientRect();
      var x = rect.left + 1; // Slightly inside to avoid borders
      var y = rect.top + 1; // Slightly inside to avoid borders

      if (isElementInIframe(element)) {
        var frameElement = win.frameElement;
        if (frameElement) {
          var frameRect = frameElement.getBoundingClientRect();
          x += frameRect.left;
          y += frameRect.top;
          // Adjust `doc` and `win` to the parent document/window that contains the iframe
          doc = frameElement.ownerDocument;
          win = doc.defaultView || doc.parentWindow;
        }
      }
      var elemAtPoint = doc.elementFromPoint(x, y);
      return elemAtPoint === element || element.contains(elemAtPoint);
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
        // debug mode: do isTopLeftCornerVisible check by default and disable the check if debug.screenReaderVisible is true
        if (!_this4.config.debug.screenReaderVisible) {
          return _this4.isTopLeftCornerVisible(elem) && isPotentiallyScrollable(elem) && (isYScrollable(elem) || isXScrollable(elem));
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
          _this5.config.modes[key] = false;
        }

        // reset move mode config
        _this5.config.modesConfig.move.selectedConfig = false;
        _this5.config.modesConfig.move.selectedMoveable = false;
        _this5.config.modesConfig.move.selectedMoveableHTML = false;
        _this5.config.modesConfig.move.selectedDropZone = false;
        _this5.config.modesConfig.move.modifier = false;

        // reset click mode config
        _this5.config.modesConfig.click.modifier = false;
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
            _this5.config.modesConfig.click.eventListenersMap["delete"](el);
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
      if (this.config.modes.clicking) {
        enableScrolling();
      }

      // Remove overlay divs

      clearInaccessibleWarnings();
      if (removeAll) {
        removeAllOverlays();
      } else {
        if (!this.config.modes.moving) {
          // the only special modifer case so far for removing overlays is in moving mode,
          // where we may want to keep the selected element's label as a selected indicator
          removeAllOverlays();
        } else {
          // in moving mode.
          // keep the selected element's label as a selected indicator
          var selectedLabel = document.querySelector(".openKeyNav-label[data-openkeynav-label=\"".concat(this.config.typedLabel, "\"]"));
          if (!selectedLabel) {
            removeAllOverlays();
          } else {
            this.config.modesConfig.move.selectedLabel = selectedLabel;
            removeAllOverlaysExceptThis(selectedLabel, this.config.typedLabel);
          }
        }
      }
      document.querySelectorAll('[data-openkeynav-label]').forEach(function (el) {
        el.removeAttribute('data-openkeynav-label'); // Clean up data-openkeynav-label attributes
      });
      resetModes();
      this.config.typedLabel = '';
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
        this.config.modesConfig.click.eventListenersMap.set(el, {
          showTooltip: showTooltip,
          hideTooltip: hideTooltip
        });
      }

      // createTooltip(el, reason);

      el.classList.add('openKeyNav-inaccessible');
      el.setAttribute('data-openkeynav-inaccessible-reason', reason);
      return true;
    }
  }, {
    key: "addKeydownEventListener",
    value: function addKeydownEventListener() {
      var _this6 = this;
      var beginDrag = function beginDrag() {
        var sourceElement = _this6.config.modesConfig.move.selectedMoveable;
        var rectSource = sourceElement.getBoundingClientRect();
        var dataTransfer = new DataTransfer(); // Create a DataTransfer object to carry the drag data.

        if (typeof TouchEvent === 'undefined') {
          _this6.setupTouchEvent();
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
      var endDrag = function endDrag(targetElement) {
        var dataTransfer = new DataTransfer(); // Create a DataTransfer object to carry the drag data.

        var clientX = 0;
        var clientY = 0;
        var sourceElement = _this6.config.modesConfig.move.selectedMoveable;
        if (typeof TouchEvent === 'undefined') {
          _this6.setupTouchEvent();
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
      var doEscape = function doEscape(e) {
        var returnFalse = false;
        if (_this6.config.modes.clicking || _this6.config.modes.moving) {
          e.preventDefault();
          e.stopPropagation();
          endDrag();
          _this6.removeOverlays();
          _this6.clearMoveAttributes();
          returnFalse = true;
        }
        if (_this6.isTextInputActive()) {
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
      var focusOnScrollables = function focusOnScrollables(e) {
        _this6.config.scrollables.list = _this6.getScrollableElements(); // Populate or refresh the list of scrollable elements

        if (_this6.config.scrollables.list.length == 0) {
          return; // If no scrollable elements, exit the function
        }

        // /*
        {
          // Navigate through scrollable elements
          if (e.shiftKey) {
            // Move backwards
            _this6.config.currentScrollableIndex = _this6.config.currentScrollableIndex > 0 ? _this6.config.currentScrollableIndex - 1 : _this6.config.scrollables.list.length - 1;
          } else {
            // Move forwards
            _this6.config.currentScrollableIndex = _this6.config.currentScrollableIndex < _this6.config.scrollables.list.length - 1 ? _this6.config.currentScrollableIndex + 1 : 0;
          }
        }
        //*/

        // Focus the current scrollable element
        var currentScrollable = _this6.config.scrollables.list[_this6.config.currentScrollableIndex];
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
      var focusOnHeadings = function focusOnHeadings(headings, e) {
        _this6.config.headings.list = Array.from(document.querySelectorAll(headings)) // Get all headings in the view
        .filter(function (el) {
          // Skip if the element is visually hidden
          var style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return false;

          // debug mode: debug mode: do isTopLeftCornerVisible check by default and disable the check if debug.screenReaderVisible is true
          if (!_this6.config.debug.screenReaderVisible) {
            // Skip if the element's top left corner is covered by another element
            if (!_this6.isTopLeftCornerVisible(el)) {
              return false;
            }
          }
          return true;
        });
        if (_this6.config.headings.list.length == 0) {
          return true;
        }

        // handle moving to the next / previous heading
        if (e.shiftKey) {
          // shift key is pressed, so move backwards. If at the beginning, go to the end.
          if (_this6.config.headings.currentHeadingIndex > 0) {
            _this6.config.headings.currentHeadingIndex--;
          } else {
            _this6.config.headings.currentHeadingIndex = _this6.config.headings.list.length - 1;
          }
        } else {
          // Move to the next heading. If at the end, go to the beginning.
          if (_this6.config.headings.currentHeadingIndex < _this6.config.headings.list.length - 1) {
            _this6.config.headings.currentHeadingIndex++;
          } else {
            _this6.config.headings.currentHeadingIndex = 0;
          }
        }
        var nextHeading = _this6.config.headings.list[_this6.config.headings.currentHeadingIndex];
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
      var placeCursorAndScrollToCursor = function placeCursorAndScrollToCursor(target) {
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
      var filterRemainingOverlays = function filterRemainingOverlays(e) {
        // Filter overlays, removing non-matching ones
        document.querySelectorAll('.openKeyNav-label').forEach(function (overlay) {
          var label = overlay.textContent;

          // If the current typedLabel no longer matches the beginning of this element's label, remove both the overlay and clean up the target element
          if (!label.startsWith(_this6.config.typedLabel)) {
            var targetElement = document.querySelector("[data-openkeynav-label=\"".concat(label, "\"]"));
            targetElement && targetElement.removeAttribute('data-openkeynav-label'); // Clean up the target element's attribute
            overlay.remove(); // Remove the overlay
          }
        });
        if (document.querySelectorAll('.openKeyNav-label').length == 0) {
          // there are no overlays left. clean up and unblock.
          doEscape(e);
          return true;
        }
      };
      var disableScrolling = function disableScrolling() {
        // Prevent scrolling on the webpage

        var disableScrollingForEl = function disableScrollingForEl(el) {
          el.addEventListener('scroll', _this6.preventScroll, {
            passive: false
          });
          el.addEventListener('wheel', _this6.preventScroll, {
            passive: false
          });
          el.addEventListener('touchmove', _this6.preventScroll, {
            passive: false
          });
        };
        var disableScrollingForScrollableElements = function disableScrollingForScrollableElements() {
          disableScrollingForEl(window);
          _this6.getScrollableElements().forEach(function (el) {
            disableScrollingForEl(el);
          });
        };
        disableScrollingForScrollableElements();
      };
      var generateValidKeyChars = function generateValidKeyChars() {
        var chars = 'abcdefghijklmnopqrstuvwxyz';
        // let chars = '1234567890';
        // let chars = 'abcdefghijklmnopqrstuvwxyz1234567890'; // not a good idea because 1 and l can be confused

        // Remove letters from chars that are present in this.config.keys
        // maybe this isn't necessary when in click mode (mode paradigm is common in screen readers)
        // Object.values(this.config.keys).forEach(key => {
        //   chars = chars.replace(key, '');
        // });

        // remove the secondary escape key code
        chars = chars.replace(_this6.config.keys.escape, '');
        return chars;
      };
      var generateLabels = function generateLabels(count) {
        function shuffle(array) {
          for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var _ref2 = [array[j], array[i]];
            array[i] = _ref2[0];
            array[j] = _ref2[1];
          }
          return array;
        }
        var labels = [];
        var chars = generateValidKeyChars();
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
      var isTabbable = function isTabbable(el) {
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

        // Ensure el is an Element before accessing styles
        if (!(el instanceof Element)) {
          return false;
        }

        // Skip if the element is set to not display (not the same as having zero size)
        var style = getComputedStyle(el);
        if (style.display === 'none') {
          return false;
        }

        // Skip if the element is hidden by a parent's overflow
        if (isHiddenByOverflow(el)) {
          return false;
        }

        // Skip if the element is within a <details> that is not open, but allow if it's a <summary> or a clickable element inside a <summary>
        // aka it's hidden by the collapsed detail
        if (el.matches('details:not([open]) *') && !el.matches('details:not([open]) > summary, details:not([open]) > summary *')) {
          return false;
        }

        // always include if tabindex > -1
        // include this after checking if the element is hidden by a parent's overflow, which most screen readers respect
        // (elements should not be tabbable by keyboard if they are visibly hidden,
        // so include visibly hidden items that are explicitly tabbable to help with accessibility bug discovery)
        // do not move this earlier in the heuristic
        var tabIndex = el.getAttribute('tabindex');
        if (tabIndex && parseInt(tabIndex, 10) > -1) {
          return true;
        }

        // Skip if the element is visually hidden (not the same as having zero size or set to not display)
        if (style.visibility === 'hidden') {
          return false;
        }

        // Skip if the element has no size (another way to visually hide something)
        if (!_this6.isNonzeroSize(el)) {
          return false;
        }

        // Skip if the element's top left corner is not within the window's viewport
        if (!inViewport(el)) {
          return false;
        }

        // do isTopLeftCornerVisible check by default and disable the check if debug.screenReaderVisible is true
        if (!_this6.config.debug.screenReaderVisible) {
          // Skip if the element's top left corner is covered by another element
          if (!_this6.isTopLeftCornerVisible(el)) {
            return false;
          }
        }

        // Skip if <summary> is not the first <summary> element of a <details>
        if (el.tagName.toLowerCase() === 'summary') {
          var details = el.parentElement;
          if (details.tagName.toLowerCase() === 'details' && details.querySelector('summary') !== el) {
            return false;
          }
        }

        // lastly, elements that are inaccessible due to not being tabbable

        if (tabIndex && parseInt(tabIndex, 10) == -1) {
          if (isTypicallyClickableElement(el)) {
            // if (this.config.modes.clicking) {
            _this6.flagAsInaccessible(el, "\n                <h2>Inaccessible Element</h2>\n                <h3>Problem: </h3>\n                <p>This element is not keyboard-focusable.</p>\n                <h3>Solution: </h3>\n                <p>Since this element has a tabindex attribute set to -1, it cannot be keyboard focusable.</p>\n                <p>It must have a tabindex set to a value &gt; -1, ideally 0.</p>\n                <p>You can ignore this warning if this element is not meant to be clickable.</p>\n                ", "keyboard");
            // }
          }

          // return false; // let's keep it, since we are flagging it
        }

        // Skip if the element is an <a> without an href (unless it has an ARIA role that makes it tabbable)

        var role = el.getAttribute('role');

        // const clickableElements = ['a', 'button', 'textarea', 'select', 'input', 'iframe', 'summary', '[onclick]'];
        // const interactiveRoles = ['button', 'link', 'menuitem', 'option', 'tab', 'treeitem', 'checkbox', 'radio'];

        switch (el.tagName.toLowerCase()) {
          case 'a':
            if (!el.hasAttribute('href') || el.getAttribute('href') === '') {
              if (!interactiveRoles.includes(role)) {
                // if (this.config.modes.clicking) {
                _this6.flagAsInaccessible(el, "\n                    <h2>Inaccessible Button</h2>\n                    <h3>Problem: </h3>\n                    <p>This clickable button is not keyboard-focusable.</p>\n                    <p>As a result, only mouse users can click on it.</p>\n                    <p>This usability disparity can create an accessibility barrier.</p>\n                    <h3>Solution: </h3>\n                    <p>Since it is an anchor tag (&lt;a&gt;), it needs a non-empty <em>href</em> attribute.</p>\n                    <p>Alternatively, it needs an ARIA <em>role</em> attribute set to something like 'button' or 'link' AND a tabindex attribute set to a value &gt; -1, ideally 0.</p>\n                    ", "keyboard");
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
            if (!interactiveRoles.includes(role)) {
              // possible inaccessible button
              // if (this.config.modes.clicking) {

              var fromClickEvents = "";
              if (_this6.config.modesConfig.click.clickEventElements.has(el)) {
                fromClickEvents = "fromClickEvents";
              }
              _this6.flagAsInaccessible(el, "\n                <!--\n                  !el(a,button,textarea,select,input,iframe,summary)\n                  !el[role('button', 'link', 'menuitem', 'option', 'tab', 'treeitem', 'checkbox', 'radio')]\n                  fromClickEvents\n                -->\n                <h2>Possibly Inaccessible Clickable Element</h2>\n                <h3>Problem: </h3>\n                <p>This element has a mouse click event handler attached to it, but it is not keyboard-focusable.</p>\n                <p>As a result, only mouse users can click on it.</p>\n                <p>This usability disparity can create an accessibility barrier.</p>\n                <h3>Solution Options: </h3>\n                <ol>\n                  <li>\n                    <p>If clicking this element takes the user to a different location, convert this element to an anchor link (&lt;a&gt;) with a non-empty <em>href</em> attribute.</p>\n                  </li>\n                  <li>\n                    <p>Otherwise if clicking this element triggers an action on the page, convert this element to a &lt;button&gt; without a <em>disabled</em> attribute.</p>\n                    <p>Alternatively, it needs an ARIA <em>role</em> attribute set to something like 'button' or 'link' AND a tabindex attribute set to a value &gt; -1, ideally 0.</p>\n                  </li>\n                  <li>\n                    <p>Otherwise, if clicking this element does not do anything, then consider removing the click event handler attached to this element.</p>\n                  </li>\n                </ol>\n                ", "keyboard");
              // return false;
              // }
            }
            break;
        }

        // it must be a valid tabbable element
        return true;
      };
      var _getAllCandidateElements = function getAllCandidateElements(doc) {
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
            var iframeElements = _getAllCandidateElements(iframeDoc);
            allElements = allElements.concat(Array.from(iframeElements)); // Add elements from each iframe
          } catch (error) {
            console.log('Access denied to iframe content:', error);
          }
        });

        // Merge with clickEventElements
        var mergedSet = new Set([].concat(_toConsumableArray(allElements), _toConsumableArray(_this6.config.modesConfig.click.clickEventElements)));
        return Array.from(mergedSet);

        // return allElements;
      };
      var showClickableOverlays = function showClickableOverlays() {
        disableScrolling();
        setTimeout(function () {
          var clickables = _getAllCandidateElements(document).filter(function (el) {
            return isTabbable(el);
          });

          // console.log(clickables);

          var labels = generateLabels(clickables.length);
          clickables.forEach(function (element, index) {
            element.setAttribute('data-openkeynav-label', labels[index]);
          });
          clickables.forEach(function (element, index) {
            _this6.createOverlay(element, labels[index]);
          });
        }, 0); // Use timeout to ensure the operation completes
      };
      var addKeydownEventListenerToIframe = function addKeydownEventListenerToIframe(iframe) {
        try {
          var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          var potentialTarget = iframeDoc.querySelector("[data-openkeynav-label=\"".concat(_this6.config.typedLabel, "\"]"));
          if (potentialTarget) {
            target = potentialTarget;

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
      var showMoveableFromOverlays = function showMoveableFromOverlays() {
        // alert("showMoveableFromOverlays()");
        // return;

        // Combine all unique 'from' classes from moveConfig to query the document
        var moveables = [];

        // direct selectors of from elements
        var fromElementSelectors = _toConsumableArray(new Set(_this6.config.modesConfig.move.config.filter(function (config) {
          return config.fromElements;
        }).map(function (config) {
          return config.fromElements;
        })));
        if (!!fromElementSelectors.length) {
          document.querySelectorAll(fromElementSelectors.join(', ')).forEach(function (element) {
            var config = _this6.config.modesConfig.move.config.find(function (c) {
              return element.matches(c.fromElements);
            });
            if (config) {
              var configKey = _this6.config.modesConfig.move.config.indexOf(config);
              if (_this6.isNonzeroSize(element) && (!config.fromExclude || !element.matches(config.fromExclude))) {
                element.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
                moveables.push(element);
              }
            }
          });
        }

        // containers of from elements
        var fromContainerSelectors = _toConsumableArray(new Set(_this6.config.modesConfig.move.config.filter(function (config) {
          return config.fromContainer;
        }).map(function (config) {
          return config.fromContainer;
        })));
        if (!!fromContainerSelectors.length) {
          var fromContainers = document.querySelectorAll(fromContainerSelectors.join(', '));
          // Collect all direct children of each fromContainer as moveable elements
          fromContainers.forEach(function (container) {
            var config = _this6.config.modesConfig.move.config.find(function (c) {
              return container.matches(c.fromContainer);
            });
            if (config) {
              var configKey = _this6.config.modesConfig.move.config.indexOf(config);
              var children = Array.from(container.children);
              children.forEach(function (child) {
                if (_this6.isNonzeroSize(child) && (!config.fromExclude || !child.matches(config.fromExclude))) {
                  child.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
                  moveables.push(child);
                }
              });
            }
          });
        }

        // Resolve elements using provided callbacks if available
        _this6.config.modesConfig.move.config.forEach(function (config) {
          if (config.resolveFromElements) {
            var resolvedElements = config.resolveFromElements();
            resolvedElements.forEach(function (element) {
              var configKey = _this6.config.modesConfig.move.config.indexOf(config);
              if (_this6.isNonzeroSize(element) && (!config.fromExclude || !element.matches(config.fromExclude))) {
                element.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
                moveables.push(element);
              }
            });
          }
        });

        // filter out moveables that would not be clickable
        moveables = moveables.filter(function (el) {
          return isTabbable(el);
        });
        var labels = generateLabels(moveables.length);
        moveables.forEach(function (element, index) {
          element.setAttribute('data-openkeynav-label', labels[index]);
        });
        moveables.forEach(function (element, index) {
          _this6.createOverlay(element, labels[index]);
          element.setAttribute('data-openkeynav-draggable', 'true');
        });
      };
      var handleTargetClickInteraction = function handleTargetClickInteraction(target, e) {
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
            if (!_this6.config.modesConfig.click.modifier) {
              var clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: win
              });
              target.dispatchEvent(clickEvent);
            }
          }
        }
        _this6.removeOverlays();
        _this6.clearMoveAttributes();
      };
      var moveSelectedMoveableToTarget = function moveSelectedMoveableToTarget(selectedTarget) {
        // const modifier = true; // for whether move is sticky or not (sticky mode?)
        console.log("Selected move target:", selectedTarget);
        _this6.config.modesConfig.move.selectedDropZone = selectedTarget;
        var callback = _this6.config.modesConfig.move.config[_this6.config.modesConfig.move.selectedConfig].callback;
        if (!callback) {
          //   console.error("No callback function has been set to execute this move operation");
          simulateDragAndDrop(_this6.config.modesConfig.move.selectedMoveable, _this6.config.modesConfig.move.selectedDropZone);
        } else {
          _this6.config.modesConfig.move.config[_this6.config.modesConfig.move.selectedConfig].callback(_this6.config.modesConfig.move.selectedMoveable, _this6.config.modesConfig.move.selectedDropZone);
        }
        if (!_this6.config.modesConfig.move.modifier) {
          _this6.removeOverlays(true);
          _this6.clearMoveAttributes();
        }
        return true;
      };
      var handleClickMode = function handleClickMode(e) {
        e.preventDefault();
        _this6.config.typedLabel += e.key.toLowerCase();
        var target = document.querySelector("[data-openkeynav-label=\"".concat(_this6.config.typedLabel, "\"]"));
        if (!target) {
          document.querySelectorAll('iframe').forEach(function (iframe) {
            addKeydownEventListenerToIframe(iframe);
          });
        }
        if (target) {
          setTimeout(function () {
            handleTargetClickInteraction(target, e);
          }, 0);
        } else {
          filterRemainingOverlays(e);
          return false;
        }
        return true;
      };
      var handleMoveMode = function handleMoveMode(e) {
        var showMoveableToOverlays = function showMoveableToOverlays(selectedMoveable) {
          // temporarily persist modifier
          var modifer = _this6.config.modesConfig.move.modifier;

          // Remove existing overlays or switch to target overlays
          _this6.removeOverlays();

          // Set moving mode and selected moveable element
          _this6.config.modes.moving = true;
          _this6.config.modesConfig.move.selectedMoveable = selectedMoveable;
          _this6.config.modesConfig.move.selectedMoveableHTML = selectedMoveable.innerHTML;
          _this6.config.modesConfig.move.modifier = modifer;

          // Get the configuration index from the selected moveable
          var configIndex = selectedMoveable.getAttribute('data-openkeynav-moveconfig');
          if (configIndex === null) return;

          // Convert the index to a number
          var configKeyForSelectedMoveable = parseInt(configIndex, 10);

          // Store the selected configuration index
          _this6.config.modesConfig.move.selectedConfig = configKeyForSelectedMoveable;

          // Find the corresponding move configuration
          var moveConfig = _this6.config.modesConfig.move.config[configKeyForSelectedMoveable];
          if (!moveConfig) return;

          // Get all target elements for the selectedMoveable
          // let targetElements = document.querySelectorAll(moveConfig.toElements);

          // targetElements = targetElements.filter(el => {
          //   return isTabbable(el);
          // });

          var targetElements = [].filter.call(document.querySelectorAll(moveConfig.toElements), isTabbable);

          // Generate labels for the target elements
          var labels = generateLabels(targetElements.length);
          targetElements.forEach(function (element, index) {
            element.setAttribute('data-openkeynav-label', labels[index]);
          });
          targetElements.forEach(function (element, index) {
            if (!_this6.isNonzeroSize(element)) return;
            _this6.createOverlay(element, labels[index]);
            element.setAttribute('data-openkeynav-dropzone', 'true');
          });
        };
        function findMatchingElements(queryString) {
          return Array.from(document.querySelectorAll(queryString));
        }
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

        var validLabelChars = generateValidKeyChars();
        var isValidLabelChar = Array.from(validLabelChars).some(function (validChar) {
          return validChar.toLowerCase() == e.key.toLowerCase();
        });
        var selectedTarget;
        if (isValidLabelChar) {
          _this6.config.typedLabel += e.key.toLowerCase();
          selectedTarget = document.querySelector("[data-openkeynav-label=\"".concat(_this6.config.typedLabel, "\"]:not(.openKeyNav-label)"));
        } else {
          // tab-based moving
          if (e.key === "Tab") {
            var queryString = '.openKeyNav-label:not(.openKeyNav-label-selected)';
            selectedTarget = cycleThroughMoveTargets(e);
          }
        }
        if (!selectedTarget) {
          // no selected target. filter remaining overlays and exit.
          filterRemainingOverlays(e);
          return false;
        }
        if (!_this6.config.modesConfig.move.selectedMoveable) {
          // new selected target.
          // setting selectedTarget as selectedMoveable
          console.log("Selected element to move:", selectedTarget);
          showMoveableToOverlays(selectedTarget);
          beginDrag();
          return true;
        }

        // moving selectedMoveable to target
        moveSelectedMoveableToTarget(selectedTarget);
        return true;
      };
      var simulateDragAndDrop = function simulateDragAndDrop(sourceElement, targetElement) {
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
          if (!_this6.config.modesConfig.move.modifier) {
            return false;
          }
          _this6.config.typedLabel = '';
          _this6.config.modesConfig.move.selectedDropZone = false;

          // if the selected element (this.config.modesConfig.move.selectedMoveable) is no longer in the DOM,
          // try to find an element in the DOM with matching HTML
          // that complies with the move inclusion criteria
          // and doesn't go against the exclusion criteria
          // set that element as the selected element
          // and then move the openKeyNav-label-selected label to it

          if (!document.contains(_this6.config.modesConfig.move.selectedMoveable)) {
            var matchingElement = findMatchingElementByHTML(_this6.config.modesConfig.move.selectedMoveableHTML);
            var selectedConfig = _this6.config.modesConfig.move.config[_this6.config.modesConfig.move.selectedConfig];
            var passesInclusionCriteria = matchingElement && matchingElement.matches(selectedConfig.fromElements) || matchingElement.matches(selectedConfig.fromContainer + ' > *');
            var passesExclusionCriteria = matchingElement && !matchingElement.matches(selectedConfig.fromExclude);
            if (passesInclusionCriteria && passesExclusionCriteria) {
              console.log('Matching element found:', matchingElement);
              _this6.config.modesConfig.move.selectedMoveable = matchingElement;
              _this6.config.modesConfig.move.selectedMoveableHTML = matchingElement.innerHTML;
              _this6.updateOverlayPosition(matchingElement, _this6.config.modesConfig.move.selectedLabel);
              beginDrag();
            } else {
              console.log('No matching element found.');
              _this6.removeOverlays(true);
              _this6.clearMoveAttributes();
            }
          }
        };
        endDrag(targetElement);
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

      // Detect this.config.keys.click to enter label mode
      // Using an arrow function to maintain 'this' context of class
      document.addEventListener('keydown', function (e) {
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
            break;

          // handle escape first
          case 'Escape':
            // escaping
            // alert("Escape");
            doEscape(e);
            break;
        }

        // check if currently in any openkeynav modes
        if (_this6.config.modes.clicking) {
          return handleClickMode(e);
        }
        if (_this6.config.modes.moving) {
          return handleMoveMode(e);
        }
        if (_this6.isTextInputActive()) {
          if (!e.ctrlKey) {
            return true;
          }
        }

        // escape and toggles
        switch (e.key) {
          case _this6.config.keys.escape:
            // escaping
            // alert("Escape");
            doEscape(e);
            return true;
            break;

          // case this.config.keys.toggleCursor: // toggle Cursor
          //     // toggle class openKeyNav-noCursor for body
          //     document.body.classList.toggle('openKeyNav-noCursor');
          //     return true;
          //     break;
        }

        // modes
        switch (e.key) {
          case _this6.config.keys.click: // possibly attempting to initiate click mode
          case _this6.config.keys.click.toUpperCase():
            e.preventDefault();
            _this6.config.modes.clicking = true;
            if (e.key == _this6.config.keys.click.toUpperCase()) {
              _this6.config.modesConfig.click.modifier = true;
            }
            showClickableOverlays();
            return true;
            break;

          // possibly attempting to initiate moving mode
          case _this6.config.keys.move:
          case _this6.config.keys.move.toUpperCase():
            // Toggle move mode
            e.preventDefault();
            _this6.config.modes.moving = true; // Assuming you add a 'move' flag to your modes object
            if (e.key == _this6.config.keys.move.toUpperCase()) {
              _this6.config.modesConfig.move.modifier = true;
            }
            showMoveableFromOverlays(); // This will be a new function similar to showClickableOverlays
            return true;
          default:
            break;
        }

        // focus / navigation (can be modified by shift, so always check for lowercase)
        switch (e.key.toLowerCase()) {
          // Check if the pressed key is for headings
          case _this6.config.keys.heading.toLowerCase():
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

            focusOnHeadings('h1, h2, h3, h4, h5, h6', e);
            return true;
            break;
          case _this6.config.keys.scroll.toLowerCase():
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
            focusOnScrollables(e);
            return true;
            break;
          default:
            break;
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
            case _this6.config.keys.heading_1:
              e.preventDefault(); // Prevent default action to allow our custom behavior
              focusOnHeadings('h1', e);
              break;
            case _this6.config.keys.heading_2:
              e.preventDefault(); // Prevent default action to allow our custom behavior
              focusOnHeadings('h2', e);
              break;
            case _this6.config.keys.heading_3:
              e.preventDefault(); // Prevent default action to allow our custom behavior
              focusOnHeadings('h3', e);
              break;
            case _this6.config.keys.heading_4:
              e.preventDefault(); // Prevent default action to allow our custom behavior
              focusOnHeadings('h4', e);
              break;
            case _this6.config.keys.heading_5:
              e.preventDefault(); // Prevent default action to allow our custom behavior
              focusOnHeadings('h5', e);
              break;
            case _this6.config.keys.heading_6:
              e.preventDefault(); // Prevent default action to allow our custom behavior
              focusOnHeadings('h6', e);
              break;
            default:
              break;
          }
        }
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
            doEscape(e);
          }

          // Dispatch it on the document or specific element that your existing handler is attached to
          document.dispatchEvent(newEvent);
        }
      });
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
            clickEventElements["delete"](this);
          }
        }
        return originalRemoveEventListener.call(this, type, listener, options);
      };
      var observer = new MutationObserver(function (mutationsList) {
        var _iterator2 = _createForOfIteratorHelper(mutationsList),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var mutation = _step2.value;
            if (mutation.removedNodes.length > 0) {
              mutation.removedNodes.forEach(function (node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  removeDescendantsFromSet(node);
                }
              });
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      function removeDescendantsFromSet(element) {
        if (clickEventElements.has(element)) {
          clickEventElements["delete"](element);
        }
        element.querySelectorAll('*').forEach(function (child) {
          if (clickEventElements.has(child)) {
            clickEventElements["delete"](child);
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
      this.injectStylesheet();
      this.addKeydownEventListener();
      this.setupGlobalClickListenerTracking();
      console.log('Library initialized with config:', this.config);
    }
  }]);
}(); // optionally attach a syncronous event listener here for tracking the elements tied to click events, (added and removed),
// since elements with click events are behaving like buttons
var _default = exports["default"] = OpenKeyNav;