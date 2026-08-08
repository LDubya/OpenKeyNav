"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.statusStyles = exports.injectToolbarStyleSheet = exports.injectStylesheet = exports.getAccessibleFocusLabelBackground = exports.deleteStylesheets = void 0;
var openKeyNav;
var styleClassname = "openKeyNav-style";
var toolbarStyleClassname = "okn-toolbar-stylesheet";
var minimumWhiteTextContrast = 4.5;
var fallbackFocusLabelRgb = [0, 90, 133];
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
var getAccessibleFocusLabelBackground = exports.getAccessibleFocusLabelBackground = function getAccessibleFocusLabelBackground(focusColor) {
  var ownerDocument = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : typeof document === 'undefined' ? null : document;
  var focusRgb = resolveCssRgb(focusColor, ownerDocument) || fallbackFocusLabelRgb;
  return "rgb(".concat(darkenForWhiteText(focusRgb).join(', '), ")");
};
var keyButtonStyles = "\n  .keyButtonContainer {\n      margin: 0 .1em;\n      display: inline-grid;\n      grid-template-columns: min-content auto;\n      align-items: baseline;\n      column-gap: 4px;\n  }\n  .keyButtonContainer .keyButtonLabel{\n    white-space:nowrap;\n  }\n  .keyButton {\n    display: inline-block;\n    padding: 1px 4px;\n    min-width: 1.3em;\n    text-align: center;\n    line-height: 1;\n    color: hsl(210, 8%, 5%);\n    text-shadow: 0 1px 0 hsl(0, 0%, 100%);\n    background-color: hsl(210, 8%, 90%);\n    border: 1px solid hsl(210, 8%, 68%);\n    border-radius: 3px;\n    box-shadow: 0 1px 1px hsla(210, 8%, 5%, 0.15), inset 0 1px 0 0 hsl(0, 0%, 100%);\n    white-space: nowrap;\n    margin: 0 1px;\n  }\n";
var logoStyles = "\n  .okn-logo-text {\n      font-size: 36px;\n      font-weight: 600;\n      color: #ffffff;\n      background-color: #333;\n      padding: .1em .2em;\n      border-radius: 1em;\n      box-sizing: border-box;\n      line-height: 1;\n      text-align: center;\n      position: relative;\n      display: inline-block;\n      min-width: 1rem;\n      border: max(.1em, 2px) solid #ffffff;\n      white-space: nowrap;\n  }\n\n  .okn-logo-text.small {\n      font-size: 18px;\n  }\n  .okn-logo-text.tiny {\n      font-size: 10px;\n      border: none;\n  }\n  .okn-logo-text.tiny .key {\n      font-weight: 700;\n  }\n\n  .okn-logo-text.light {\n      color: #333;\n      background-color: #fff;\n      border-color: #333;\n  }\n\n  .okn-logo-text .key {\n      display: inline;\n      padding: .1em .2em;\n      margin: 0 .1em;\n      background-color: #ffffff;\n      color: #333;\n      line-height: 1;\n      position: relative;\n      top: -.3em;\n  }\n\n  .okn-logo-text.light .key {\n      background-color: #333;\n      color: #ffffff;\n  }\n\n  .okn-logo-text .key::before,\n  .okn-logo-text .key::after {\n      content: \"\";\n      position: absolute;\n      left: 50%;\n      transform: translateX(-50%);\n  }\n\n  .okn-logo-text .key::before {\n      --border-size: 0.5em;\n      --min-border-size: 5px;\n      border-top: max(var(--border-size), var(--min-border-size)) solid #333;\n      bottom: calc(-1 * max(var(--border-size), var(--min-border-size)));\n      border-left: max(var(--border-size), var(--min-border-size)) solid transparent;\n      border-right: max(var(--border-size), var(--min-border-size)) solid transparent;\n  }\n  .okn-logo-text.light .key::before {\n      border-top-color: #fff;\n  }\n\n  .okn-logo-text .key::after {\n      --border-size: .4em;\n      --min-border-size: 4px;\n      border-top: max(calc(var(--border-size) + 2px), var(--min-border-size)) solid #fff;\n      bottom: calc(-1 * max(var(--border-size), var(--min-border-size)));\n      border-left: max(var(--border-size), var(--min-border-size)) solid transparent;\n      border-right: max(var(--border-size), var(--min-border-size)) solid transparent;\n  }\n  .okn-logo-text.light .key::after {\n      border-top-color: #333;\n  }\n";

// Shared by the document stylesheet and StatusService-owned ShadowRoot/document
// styles. Keeping this as one source ensures notifications remain styled after
// OpenKeyNav is disabled and inside supported Shadow DOM roots.
var statusStyles = exports.statusStyles = "\n  ".concat(logoStyles, "\n\n  .openKeyNav-status {\n      box-sizing: border-box;\n      position: fixed;\n      left: 12px;\n      bottom: 12px;\n      z-index: 2147483647;\n      max-width: min(34rem, calc(100vw - 24px));\n      padding: 8px 12px;\n      border: 1px solid #666;\n      border-radius: 4px;\n      color: #fff;\n      background: rgba(20, 24, 28, .94);\n      box-shadow: 0 4px 6px rgba(0, 0, 0, .16);\n      font: 14px/1.35 sans-serif;\n      text-align: left;\n      pointer-events: none;\n  }\n\n  .openKeyNav-status--visually-hidden {\n      width: 1px !important;\n      height: 1px !important;\n      padding: 0 !important;\n      margin: -1px !important;\n      border: 0 !important;\n      overflow: hidden !important;\n      clip: rect(0 0 0 0) !important;\n      clip-path: inset(50%) !important;\n      white-space: nowrap !important;\n  }\n\n  .openKeyNav-notification-container {\n      position: fixed;\n      left: 50%;\n      bottom: 10px;\n      z-index: 2147483647;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 10px;\n      width: min(34rem, calc(100vw - 24px));\n      transform: translateX(-50%);\n      pointer-events: none;\n  }\n\n  .openKeyNav-notification-container .openKeyNav-notification {\n      position: relative;\n      left: auto;\n      bottom: auto;\n      display: inline-block;\n      max-width: 100%;\n      padding: 10px 20px;\n      text-align: center;\n      pointer-events: auto;\n  }\n\n  .openKeyNav-status__dismiss {\n      position: absolute;\n      top: 5px;\n      right: 8px;\n      border: 0;\n      padding: 0 2px;\n      color: inherit;\n      background: transparent;\n      font: 20px/1 sans-serif;\n      cursor: pointer;\n  }\n\n  .openKeyNav-status__hint {\n      margin-top: 4px;\n      font-size: .85em;\n      opacity: .8;\n  }\n\n  .openKeyNav-status--dismissible {\n      padding-right: 30px;\n  }\n");
var injectStylesheet = exports.injectStylesheet = function injectStylesheet(parent, replace) {
  openKeyNav = parent;
  var focusLabelBackground = getAccessibleFocusLabelBackground(openKeyNav.config.focus.outlineColor, document);
  if (document.querySelectorAll('.' + styleClassname).length > 0) {
    if (!replace) {
      return;
    }
    deleteStylesheets();
  }
  var style = document.createElement('style');
  style.className = styleClassname;
  style.type = 'text/css';
  style.textContent = ".openKeyNav-label {\n        font: inherit;\n        vertical-align: baseline;\n        box-sizing: border-box;\n        white-space: nowrap;\n        border: 1px solid ".concat(openKeyNav.config.spot.fontColor, "; \n        // box-shadow: inset 0 -2.5px 0 ").concat(openKeyNav.config.spot.insetColor, ", inset 0 -3px 0 #999, 0 0 4px #fff; \n        // background: linear-gradient(to top, #999 5%, ").concat(openKeyNav.config.spot.backgroundColor, " 20%); \n        background-color: ").concat(openKeyNav.config.spot.backgroundColor, "; \n        // border-radius: calc( 4px );\n        color: ").concat(openKeyNav.config.spot.fontColor, "; \n        display: inline-block;\n        font-size: ").concat(openKeyNav.config.spot.fontSize, "; \n        // outline : 2px solid ").concat(openKeyNav.config.focus.outlineColor, "; \n        outline-offset: -2px !important;\n        // +\"font-weight: bold;\"\n        font-weight: inherit;\n        // line-height: 1.5;\n        line-height: 1;\n        margin: 0 .1em 0 1px;\n        overflow-wrap: break-word;\n        // padding: .0 .15em .1em;\n        padding: 3px;\n        text-shadow: 0 1px 0 ").concat(openKeyNav.config.spot.insetColor, "; \n        min-width: 1rem;\n        text-align: center;\n        position: absolute;\n        z-index: 2147483646;\n        font-family: monospace;\n      }\n      .openKeyNav-keylabel-alternatives {\n        display: inline-flex;\n        align-items: center;\n      }\n      .openKeyNav-keylabel-alternative + .openKeyNav-keylabel-alternative {\n        border-left: 1px solid currentColor;\n        margin-left: .3em;\n        padding-left: .3em;\n      }\n      .openKeyNav-keylabel-modifier {\n        border-radius: 2px;\n        display: inline-block;\n        margin: -1px 0;\n        padding: 1px;\n      }\n      .openKeyNav-keylabel-modifier[data-openkeynav-keylabel-pressed=\"true\"] {\n        background-color: #fff;\n        box-shadow: inset 0 0 0 1px #111;\n        color: #111;\n        text-shadow: none;\n      }\n      .openKeyNav-keylabel-focused {\n        background-color: ").concat(focusLabelBackground, ";\n        color: #fff;\n        text-shadow: none;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::after {\n        content: \"\";\n        position: absolute;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::after {\n        top: 50%;\n        transform: translateY(-50%);\n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::after,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::before,\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::after {\n        left: 50%;\n        transform: translateX(-50%);\n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::before {\n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid #fff; \n        right: -").concat(openKeyNav.config.spot.arrowSize_px + 1, "px; \n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"left\"]::after {\n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid ").concat(openKeyNav.config.spot.backgroundColor, "; \n        right: -").concat(openKeyNav.config.spot.arrowSize_px, "px; \n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::before {\n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid #fff; \n        left: -").concat(openKeyNav.config.spot.arrowSize_px + 1, "px; \n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"right\"]::after {\n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid ").concat(openKeyNav.config.spot.backgroundColor, "; \n        left: -").concat(openKeyNav.config.spot.arrowSize_px, "px; \n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]{\n        padding-bottom: 0;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::before {\n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid #fff; \n        bottom: -").concat(openKeyNav.config.spot.arrowSize_px + 1, "px; \n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"top\"]::after {\n        border-top: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid ").concat(openKeyNav.config.spot.backgroundColor, "; \n        bottom: -").concat(openKeyNav.config.spot.arrowSize_px, "px; \n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]{\n        padding-top: 0;\n      }\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::before {\n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid #fff; \n        top: -").concat(openKeyNav.config.spot.arrowSize_px + 1, "px; \n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px + 1, "px solid transparent; \n      }\n      .openKeyNav-label[data-openkeynav-position=\"bottom\"]::after {\n        border-bottom: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid ").concat(openKeyNav.config.spot.backgroundColor, "; \n        top: -").concat(openKeyNav.config.spot.arrowSize_px, "px; \n        border-left: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n        border-right: ").concat(openKeyNav.config.spot.arrowSize_px, "px solid transparent; \n      }\n      .openKeyNav-keylabel-focused[data-openkeynav-position=\"left\"]::after {\n        border-left-color: ").concat(focusLabelBackground, ";\n      }\n      .openKeyNav-keylabel-focused[data-openkeynav-position=\"right\"]::after {\n        border-right-color: ").concat(focusLabelBackground, ";\n      }\n      .openKeyNav-keylabel-focused[data-openkeynav-position=\"top\"]::after {\n        border-top-color: ").concat(focusLabelBackground, ";\n      }\n      .openKeyNav-keylabel-focused[data-openkeynav-position=\"bottom\"]::after {\n        border-bottom-color: ").concat(focusLabelBackground, ";\n      }\n      .openKeyNav-label-selected{\n        // padding : 0;\n        // margin : 0;\n        display : grid;\n        align-content : center;\n        color : ").concat(openKeyNav.config.spot.fontColor, "; \n        background : ").concat(openKeyNav.config.spot.backgroundColor, "; \n        // outline : 4px solid ").concat(openKeyNav.config.focus.outlineColor, "; \n        outline: none; \n        // border-radius: 100%; \n        // width: 1rem; \n        // height: 1rem; \n        // text-shadow : none;\n        // padding : 0 !important;\n        // margin: 0 !important;\n      }\n      [data-openkeynav-label]:not(.openKeyNav-label):not(button):not(:focus),\n      [data-openkeynav-keylabel-target-active]:not(button):not(:focus){\n        box-shadow:  inset 0 0 0 .5px #000,\n                      0 0 0 .75px #000,\n                      0 0 0 1.5px rgba(255,255,255,1); \n        // border-radius: 3px;\n        border-color: #000;\n        border-radius: 3px;\n      }\n      [data-openkeynav-label]:not(.openKeyNav-label):not(button):not(:focus),\n      [data-openkeynav-keylabel-target-active]:not(button):not(:focus){\n        outline:none !important;\n      }\n      button[data-openkeynav-label]:not(:focus),\n      button[data-openkeynav-keylabel-target-active]:not(:focus){\n        outline:2px solid #000 !important;\n      }\n      .openKeyNav-inaccessible:not(.openKeyNav-label):not(button){\n        box-shadow:  inset 0 0 0 .5px #f00,\n                      0 0 0 1px #f00,\n                      0 0 0 1.5px rgba(255,255,255,1); \n        outline:none !important;\n        border-color: #f00;\n        border-radius: 3px;\n      }\n      button.openKeyNav-inaccessible{\n        outline:2px solid #f00 !important;\n      }\n      .openKeyNav-inaccessible.openKeyNav-label{\n        box-shadow:  inset 0 0 0 .5px #f00,\n                      0 0 0 1px #f00,\n                      0 0 0 1.5px rgba(255,255,255,1); \n        border-color: #f00;\n        border-radius: 3px;\n      }\n      .openKeyNav-label.debug-inaccessible{\n        background-color: #ff4444 !important;\n        border-color: #cc0000 !important;\n        color: #ffffff !important;\n        text-shadow: 0 1px 0 rgba(0,0,0,0.5) !important;\n      }\n        //   +\"span[data-openkeynav-label]{\"\n        //       +\"display: inherit;\"\n        //   +\"}\"\n      .openKeyNav-noCursor *{\n        cursor: none !important;\n      }\n      .openKeyNav-mouseover-tooltip{\n        position: absolute;\n        background-color: #333;\n        color: #fff;\n        padding: 5px;\n        border-radius: 5px;\n        display: none;\n        z-index: 1000;\n        font-size: 12px;\n      }\n      .openKeyNav-mouseover-tooltip::before{\n        content: \"Debug mode\"\n      }\n      //   [data-openkeynav-draggable=\"true\"] {\n      //   outline: 2px solid ").concat(openKeyNav.config.focus.outlineColor, "; \n      //   outline-offset: -1px !important;\n      // }\n      ;\n      ");
  style.textContent += statusStyles;
  style.textContent += keyButtonStyles;
  // *:focus { // could be problematic to edit focus states throughout a website
  //   outline: 2px ${openKeyNav.config.focus.outlineStyle} ${openKeyNav.config.focus.outlineColor} !important;
  //   outline-offset: -2px !important;
  // }
  // `;
  // ensuring hidden labeled elements are made visible
  style.textContent += "\n        [data-openkeynav-label]:not(.openKeyNav-label):not(:focus),\n        [data-openkeynav-keylabel-target-active]:not(:focus){\n          opacity:1 !important;\n          visibility:visible !important;\n        }\n      ";
  style.textContent += "\n        [data-openkeynav-focused]{\n          outline: 2px ".concat(openKeyNav.config.focus.outlineStyle, " ").concat(openKeyNav.config.focus.outlineColor, " !important; \n          outline-offset: -2px !important;\n        }\n\n        .openKeyNav-structural-context-outline {\n          box-sizing: border-box;\n          position: fixed;\n          z-index: 2147483645;\n          display: none;\n          border-radius: 4px;\n          background: transparent;\n          pointer-events: none;\n        }\n      ");
  document.head.appendChild(style);
};
var deleteStylesheets = exports.deleteStylesheets = function deleteStylesheets() {
  document.querySelectorAll('.' + styleClassname).forEach(function (el) {
    el.parentNode && el.parentNode.removeChild(el);
  });
};
var injectToolbarStyleSheet = exports.injectToolbarStyleSheet = function injectToolbarStyleSheet(parent) {
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