
import { version } from "./version";
import { signal, effect } from './signals.js';
import { handleToolBar } from './toolbar.js'
import { keyButton } from './keyButton.js';
import { injectStylesheet, deleteStylesheets } from './styles.js';
import { handleKeyPress } from "./keypress.js";
import { handleEscape } from "./escape";

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

class OpenKeyNav {
    constructor() {
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
          backgroundColor: signal('hsl(210 10% 95% / 1)'),
          contentColor: signal('#000')
        },
        notifications : {
          enabled: true,
          displayToolName: true,
          duration: 3000
        },
        keys: {
          escape: 'q', // alternative escape key, for when escape key is too far or not available. // q works great because top left of letters, plus removes confusion with g, p
          click: 'k', // enter click mode, to click on clickable elements, such as links. Was g, now k, for kanga. Plus NVDA uses k to focus on link elements, which prevents conflicting modes as it's either openkeynav or NVDA.
          scroll: 's', // focus on the next scrollable region
          move: 'm', // enter move mode, to move elements from and to, aka keyboard drag and drop // not yet fully wired
          heading: 'h', // focus on the next heading // as seen in JAWS, NVDA
          textBlock: 'n', // focus on the next block of text // as seen in JAWS, NVDA // not yet fully wired
          landmarkRegion: 'd', // focus on the next landmark region // as seen in NVDA // not yet fully wired
          formField: 'f', // move to the next form field // as seen in NVDA // not yet fully wired
          mouseOver: 'v', // toggle a mouseover event for an applicable element. In many cases this should trigger opening mouseover menus, etc // not yet wired
          heading_1: '1', // focus on the next heading of level 1 // as seen in JAWS, NVDA // do not modify
          heading_2: '2', // focus on the next heading of level 2 // as seen in JAWS, NVDA // do not modify
          heading_3: '3', // focus on the next heading of level 3 // as seen in JAWS, NVDA // do not modify
          heading_4: '4', // focus on the next heading of level 4 // as seen in JAWS, NVDA // do not modify
          heading_5: '5', // focus on the next heading of level 5 // as seen in JAWS, NVDA // do not modify
          heading_6: '6', // focus on the next heading of level 6 // as seen in JAWS, NVDA // do not modify
          menu: 'o',
          inputEscape: 'ctrlKey', // for escaping input to trigger a command
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
          click : {
            modifier: false,
            clickEventElements: new Set(),
            eventListenersMap : new Map()
          },
          menu : {
            modifier: false,
          }
        },
        log: [],
        typedLabel: signal(''),
        headings: {
          currentHeadingIndex: 0, // Keep track of the current heading
          list: []
        },
        scrollables: {
          currentScrollableIndex: 0, // Keep track of the current scrollable
          list: []
        },
        modes: {
          clicking: signal(false),
          moving: signal(false),
          menu: signal(false),
        },
        debug: {
          screenReaderVisible: false,
          keyboardAccessible: true
        },
        enabledCookie: 'openKeyNav_enabled'
      };
      this.meta = {
        enabled : signal(false),
      }
      this.enable = () => {
        this.meta.enabled.value = true;
        this.injectStyles();
        this.getSetCookie(this.config.enabledCookie, true);
        return this;
      };
      this.disable = () => {
        this.meta.enabled.value = false;
        this.getSetCookie(this.config.enabledCookie, false)
        this.removeStyles(); // maybe this should go in the destroy();, main concern is the toolbar.
        return this;
      }
    }
  
    // utility functions
  
    setupTouchEvent() {
      window.TouchEvent = class TouchEvent extends Event {
        constructor(type, initDict) {
          super(type, initDict);
          this.touches = initDict.touches || [];
          this.targetTouches = initDict.targetTouches || [];
          this.changedTouches = initDict.changedTouches || [];
          this.altKey = initDict.altKey || false;
          this.metaKey = initDict.metaKey || false;
          this.ctrlKey = initDict.ctrlKey || false;
          this.shiftKey = initDict.shiftKey || false;
        }
      };
      window.Touch = class {
        constructor({ identifier, target, clientX, clientY }) {
          this.identifier = identifier;
          this.target = target;
          this.clientX = clientX;
          this.clientY = clientY;
          this.screenX = clientX;
          this.screenY = clientY;
          this.pageX = clientX;
          this.pageY = clientY;
        }
      };
    }
  
    deepMerge(target, source) {
      Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object') {
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
          }
          this.deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      });
      return target;
    }
  
    injectStyles(replace) {
      injectStylesheet(this, replace);
    }

    removeStyles(){
      deleteStylesheets();
    }

    initToolBar() {
      handleToolBar(this);
    }
  
    isNonzeroSize(element) {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
  
    isTextInputActive() {
      const tagName = document.activeElement.tagName.toLowerCase();
      const editable = document.activeElement.getAttribute('contenteditable');
      const inputTypes = ['input', 'textarea'];
      const isEditable = editable === 'true' || editable === 'plaintext-only' || editable === '';
  
      return inputTypes.includes(tagName) || isEditable;
    }
  
    // avoids overlaps
    updateOverlayPosition(element, overlay) {
        const elementsToAvoid = document.querySelectorAll('[data-openkeynav-label], .openKeyNav-label-selected, .openKeyNav-toolBar'); // maybe also add labeled elements to this list dynamically
        const rectAvoid = element.getBoundingClientRect();
        const overlayWidth = overlay.getBoundingClientRect().width;
        const overlayHeight = overlay.getBoundingClientRect().height;
        const arrowWidth = this.config.spot.arrowSize_px;
  
        function isBoundingBoxIntersecting(rectOverlay, rectAvoid) {
  
          return !(rectOverlay.right <= rectAvoid.left ||
                  rectOverlay.left >= rectAvoid.right ||
                  rectOverlay.bottom <= rectAvoid.top ||
                  rectOverlay.top >= rectAvoid.bottom);
        }
  
        const isOverlapping = (overlay, avoidEl) => {
          const rectOverlay = overlay.getBoundingClientRect();
          const rectAvoid = avoidEl.getBoundingClientRect();
  
          const isOverlapping_OnTop = () => {
  
            // et's check if they are right above each other in the view.
            // this ensures elements inside modals or other containers visually hiding avoidEls can still have adjacent labels.
            const padding = 0; //this.config.spot.arrowSize_px;
  
            const corners = [
              { x: rectOverlay.left - padding, y: rectOverlay.top - padding }, // top left
              { x: rectOverlay.right + padding, y: rectOverlay.top - padding }, // top right
              { x: rectOverlay.left - padding, y: rectOverlay.bottom + padding }, // bottom left
              { x: rectOverlay.right + padding, y: rectOverlay.bottom + padding } // bottom right
          ];
  
            // Hide the overlay element temporarily
            overlay.style.visibility = 'hidden';
  
            const isOverlapping = corners.some(corner => {
                if (
                    corner.x >= 0 &&
                    corner.x <= window.innerWidth &&
                    corner.y >= 0 &&
                    corner.y <= window.innerHeight
                ) {
                    const elementAtPoint = document.elementFromPoint(corner.x, corner.y);
                    return avoidEl === elementAtPoint || avoidEl.contains(elementAtPoint) || elementAtPoint && (elementAtPoint.contains(element) || elementAtPoint.classList.contains("openKeyNav-ignore-overlap"));
                }
                return false;
            });
  
            // Show the overlay element again
            overlay.style.visibility = 'visible';
  
            return isOverlapping;
          }
  
          return isBoundingBoxIntersecting(rectOverlay, rectAvoid) && isOverlapping_OnTop();
  
          // return isBoundingBoxIntersecting(rectOverlay, rectAvoid);
  
          // return false
      }
  
        function isCutOff(el) {
            const rect = el.getBoundingClientRect();
            return rect.left < 0 ||
                   rect.right > window.innerWidth ||
                   rect.top < 0 ||
                   rect.bottom > window.innerHeight;
        }
  
        function checkOverlap(overlay) {
            return isCutOff(overlay) || Array.from(elementsToAvoid).some(avoidEl => {
              if (avoidEl === overlay || avoidEl === element) {
                return false;
              }
  
              // Check if the element is directly on top of the avoidEl
              const rectElement = element.getBoundingClientRect();
              const rectAvoidEl = avoidEl.getBoundingClientRect();
  
              const isElementOnTop = isBoundingBoxIntersecting(rectElement, rectAvoidEl)
  
              if (isElementOnTop) {
                  return false;
              }
  
              return isOverlapping(overlay, avoidEl);
            });
        }
  
        overlay.removeAttribute('data-openkeynav-position');
  
        // Try placing overlay to the left of the element
        overlay.style.position = 'absolute';
        overlay.style.left = `${rectAvoid.left - (overlayWidth + arrowWidth) + window.scrollX}px`; // Added scrollX adjustment
        overlay.style.top = `${rectAvoid.top + window.scrollY}px`; // Added scrollY adjustment
        let position = "left";
        if (!checkOverlap(overlay)) {
          overlay.setAttribute('data-openkeynav-position', position);
          return;
        }
  
        // Try placing overlay to the right of the element
        overlay.style.left = `${rectAvoid.right + arrowWidth - 2 + window.scrollX}px`; // Added scrollX adjustment
        // overlay.style.top = `${rectAvoid.top + window.scrollY}px`; // same as above
        position = "right";
        if (!checkOverlap(overlay)) {
          overlay.setAttribute('data-openkeynav-position', position);
          return;
        }
  
        // Try placing overlay above the element
        overlay.style.left = `${rectAvoid.left + window.scrollX}px`; // Added scrollX adjustment
        overlay.style.top = `${rectAvoid.top - (overlayHeight + arrowWidth) + window.scrollY}px`; // Added scrollY adjustment
        position = "top";
        if (!checkOverlap(overlay)) {
          overlay.setAttribute('data-openkeynav-position', position);
          return;
        }
  
        // Try placing overlay below the element
        overlay.style.left = `${rectAvoid.left + window.scrollX}px`; // Added scrollX adjustment
        overlay.style.top = `${rectAvoid.bottom + arrowWidth + window.scrollY}px`; // Added scrollY adjustment
        position = "bottom";
        if (!checkOverlap(overlay)) {
          overlay.setAttribute('data-openkeynav-position', position);
          return;
        }
  
        // If all placements result in overlaps or being cut off, place overlay on the element's top left position
        overlay.removeAttribute('data-openkeynav-position');
        overlay.style.left = `${rectAvoid.left + window.scrollX}px`; // Added scrollX adjustment
        overlay.style.top = `${rectAvoid.top + window.scrollY}px`; // Added scrollY adjustment
    }
  
  
    updateOverlayPosition_bak(element, overlay) { // this one just places the overlay over the element on top left position
      const rect = element.getBoundingClientRect();
      let adjustedLeft = rect.left;
      let adjustedTop = rect.top;
  
      // Check if the element is inside an iframe and adjust the position
      let parent = element.ownerDocument.defaultView.frameElement;
      while (parent) {
        const parentRect = parent.getBoundingClientRect();
        adjustedLeft += parentRect.left;
        adjustedTop += parentRect.top;
        parent = parent.ownerDocument.defaultView.frameElement;
      }
  
      overlay.style.left = `${adjustedLeft + window.scrollX}px`;
      overlay.style.top = `${adjustedTop + window.scrollY}px`;
    }
  
    createOverlay(element, label) {
      function getScrollParent(element, includeHidden = false) {
        let style = getComputedStyle(element);
        let excludeStaticParent = style.position === 'absolute';
        let overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;
  
        if (style.position === 'fixed') return document.body;
        for (let parent = element; (parent = parent.parentElement); ) {
          style = getComputedStyle(parent);
          if (excludeStaticParent && style.position === 'static') {
            continue;
          }
          if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
        }
  
        return document.body;
      }
  
      const overlay = document.createElement('div');
      overlay.textContent = label;
      overlay.classList.add('openKeyNav-label');
      overlay.setAttribute('data-openkeynav-label', label);
  
      // Add event listener to open the element in developer tools
      overlay.addEventListener('click', () => {
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
      let scrollParent = getScrollParent(element);
      if (scrollParent) {
        scrollParent.addEventListener('scroll', () => this.updateOverlayPosition(element, overlay));
      }
  
      if( element.classList.contains('openKeyNav-inaccessible') ){
        overlay.classList.add('openKeyNav-inaccessible');
      };
  
      return overlay;
    }
  
    isAnyCornerVisible(element) {
      const isElementInIframe = element => {
        return element.ownerDocument !== window.document;
      };
  
      let doc = element.ownerDocument;
      let win = doc.defaultView || doc.parentWindow;
      const rect = element.getBoundingClientRect();
      // Coordinates for the four corners of the element
      const corners = [
        { x: rect.left + 1, y: rect.top + 1 }, // top-left
        { x: rect.right - 1, y: rect.top + 1 }, // top-right
        { x: rect.left + 1, y: rect.bottom - 1 }, // bottom-left
        { x: rect.right - 1, y: rect.bottom - 1 } // bottom-right
      ];
  
      if (isElementInIframe(element)) {
        let frameElement = win.frameElement;
        if (frameElement) {
          let frameRect = frameElement.getBoundingClientRect();
          corners.forEach(corner => {
            corner.x += frameRect.left;
            corner.y += frameRect.top;
          });
          // Adjust `doc` and `win` to the parent document/window that contains the iframe
          doc = frameElement.ownerDocument;
          win = doc.defaultView || doc.parentWindow;
        }
      }
  
      // Check if any of the corners are visible
      for (let corner of corners) {
        const elemAtPoint = doc.elementFromPoint(corner.x, corner.y);
        if (elemAtPoint === element || element.contains(elemAtPoint) || elemAtPoint && (elemAtPoint.contains(element) || elemAtPoint.classList.contains("openKeyNav-ignore-overlap")) ) {
          return true; // At least one corner is visible
        }
      }

      return false; // None of the corners are visible
    }
  
    getScrollableElements() {
      // Cross-browser way to get computed style
      var getComputedStyle =
        document.body && document.body.currentStyle
          ? function (elem) {
              return elem.currentStyle;
            }
          : function (elem) {
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
        return (
          elem.offsetWidth < elem.scrollWidth &&
          (overflowX === 'scroll' || overflowX === 'auto' || overflowX === 'overlay')
        );
      }
  
      // Check vertical scrollability
      function isYScrollable(elem) {
        var overflowY = getActualCss(elem, 'overflow-y');
        // Directly return true if overflowY is 'scroll', assuming you want to capture all elements with this setting
        if (overflowY === 'scroll') return true;
        return (
          elem.offsetHeight < elem.scrollHeight &&
          (overflowY === 'scroll' || overflowY === 'auto' || overflowY === 'overlay')
        );
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
      const hasScroller = elem => {
        // debug mode: do isAnyCornerVisible check by default and disable the check if debug.screenReaderVisible is true
        if (!this.config.debug.screenReaderVisible) {
          return (
            this.isAnyCornerVisible(elem) &&
            isPotentiallyScrollable(elem) &&
            (isYScrollable(elem) || isXScrollable(elem))
          );
        }
        return isPotentiallyScrollable(elem) && (isYScrollable(elem) || isXScrollable(elem));
      };
  
      return [].filter.call(document.querySelectorAll('*'), hasScroller);
    }
  
    preventScroll(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  
    clearMoveAttributes() {
      document.querySelectorAll('[data-openkeynav-moveconfig]').forEach(el => {
        el.removeAttribute('data-openkeynav-moveconfig');
        el.removeAttribute('data-openkeynav-draggable');
      });
    }
  
    removeOverlays(removeAll) {
  
      const resetModes = () => {
        for (let key in this.config.modes) {
          this.config.modes[key].value = false;
        }
  
        // reset move mode config
        this.config.modesConfig.move.selectedConfig = false;
        this.config.modesConfig.move.selectedMoveable = false;
        this.config.modesConfig.move.selectedMoveableHTML = false;
        this.config.modesConfig.move.selectedDropZone = false;
        this.config.modesConfig.move.modifier = false;
  
        // reset click mode config
        this.config.modesConfig.click.modifier = false;

        // reset menu mode config
        this.config.modesConfig.menu.modifier = false;
      }
  
      const clearInaccessibleWarnings = () => {
        document.querySelectorAll('.openKeyNav-inaccessible').forEach(el => { // remove inaccessible indicator styles
          el.classList.remove('openKeyNav-inaccessible');
  
          // Remove the event listeners if they exist in the map
          if (this.config.modesConfig.click.eventListenersMap.has(el)) {
            const { showTooltip, hideTooltip } = this.config.modesConfig.click.eventListenersMap.get(el);
            el.removeEventListener('mouseover', showTooltip);
            el.removeEventListener('mouseleave', hideTooltip);
            this.config.modesConfig.click.eventListenersMap.delete(el);
          }
  
        });
        document.querySelectorAll('.openKeyNav-mouseover-tooltip').forEach(el => el.remove()); // remove the mouseover tooltips
      }
  
      const enableScrolling = () => {
        // Re-enable scrolling on the webpage
  
        const enableScrollingForEl = el => {
          el.removeEventListener('scroll', this.preventScroll, {
            passive: false
          });
          el.removeEventListener('wheel', this.preventScroll, {
            passive: false
          });
          el.removeEventListener('touchmove', this.preventScroll, {
            passive: false
          });
        };
  
        const enableScrollingForScrollableElements = () => {
          enableScrollingForEl(window);
          this.getScrollableElements().forEach(el => {
            enableScrollingForEl(el);
          });
        };
  
        enableScrollingForScrollableElements();
      };
  
      const removeAllOverlays = () => {
        document.querySelectorAll('.openKeyNav-label').forEach(el => el.remove());
      }
  
      const removeAllOverlaysExceptThis = (selectedLabel, typedLabel) => {
        selectedLabel.innerHTML="&bull;";
        // selectedLabel.innerHTML="&middot;";
        // selectedLabel.innerHTML="&nbsp;";
        // selectedLabel.innerHTML="✔";
  
        selectedLabel.classList.add('openKeyNav-label-selected');
        document.querySelectorAll(`.openKeyNav-label:not([data-openkeynav-label="${typedLabel}"])`).forEach(el => el.remove());
  
  
      }
  
      // alert("removeOverlays()");
      if (this.config.modes.clicking.value) {
        enableScrolling();
      }
  
      // Remove overlay divs
  
      clearInaccessibleWarnings();
      if(removeAll){
        removeAllOverlays();
      }
      else{
        if(!this.config.modes.moving.value){
          // the only special modifer case so far for removing overlays is in moving mode,
          // where we may want to keep the selected element's label as a selected indicator
          removeAllOverlays();
        }
        else{
          // in moving mode.
          // keep the selected element's label as a selected indicator
          let selectedLabel = document.querySelector(`.openKeyNav-label[data-openkeynav-label="${this.config.typedLabel.value}"]`);
          if(!selectedLabel){
            removeAllOverlays();
          }
          else{
            this.config.modesConfig.move.selectedLabel = selectedLabel;
            removeAllOverlaysExceptThis(selectedLabel, this.config.typedLabel.value);
          }
        }
      }
  
      document.querySelectorAll('[data-openkeynav-label]').forEach(el => {
        el.removeAttribute('data-openkeynav-label'); // Clean up data-openkeynav-label attributes
      });
  
      resetModes();
      this.config.typedLabel.value = '';
  
    }
  
    flagAsInaccessible(el, reason, modality) {
  
      switch (modality) {
        case "keyboard":
          if (!this.config.debug.keyboardAccessible) {
            return false;
          }
        default:
          break;
      }
  
      let openKeyNav = this;
      function createTooltip(el, innerHTML){
        // Create the tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'openKeyNav-mouseover-tooltip';
        tooltip.innerHTML = innerHTML;
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);
        // Function to show the tooltip
        function showTooltip() {
          const rect = el.getBoundingClientRect();
          tooltip.style.left = `${rect.left + window.scrollX}px`;
          tooltip.style.top = `${rect.bottom + window.scrollY - 2}px`;
          tooltip.style.display = 'block';
        }
        // Function to hide the tooltip
        function hideTooltip() {
          // Get the mouse coordinates from the event
          const mouseX = event.clientX;
          const mouseY = event.clientY;
  
          // Get the bounding rectangle of the tooltip
          const tooltipRect = tooltip.getBoundingClientRect();
  
          // Check if the mouse is currently over the tooltip
          const isMouseOverTooltip =
            mouseX >= tooltipRect.left &&
            mouseX <= tooltipRect.right &&
            mouseY >= tooltipRect.top &&
            mouseY <= tooltipRect.bottom;
  
          // Only hide the tooltip if the mouse is not over it
          if (!isMouseOverTooltip) {
            tooltip.style.display = 'none';
          }
        }
        el.addEventListener('mouseover', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
        tooltip.addEventListener('mouseleave', hideTooltip);
        // Store the event listeners for el in the map
        openKeyNav.config.modesConfig.click.eventListenersMap.set(el, { showTooltip, hideTooltip });
      }
  
      createTooltip(el, reason);
  
      el.classList.add('openKeyNav-inaccessible');
      el.setAttribute('data-openkeynav-inaccessible-reason', reason);
  
      return true;
    }
  
    addKeydownEventListener() {
  
      
  
      
  
      // Detect this.config.keys.click to enter label mode
      // Using an arrow function to maintain 'this' context of class
      document.addEventListener(
        'keydown',
        e => {
          handleKeyPress(this, e);
        },
        true
      );
  
      // Also for the iframes
      window.addEventListener('message', e => {
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
            bubbles: true, // This ensures the event bubbles up through the DOM
            cancelable: true // This lets it be cancelable
          });
  
          if (newEvent.key === 'Escape') {
            // Execute escape logic
            handleEscape(this, e);
          }
  
          // Dispatch it on the document or specific element that your existing handler is attached to
          document.dispatchEvent(newEvent);
        }
      });
    }

    // Function to emit a temporary notification
    emitNotification (message) {

      // Function to create or select the notification container
      const getSetNotificationContainer = () => {
        // Create or select the notification container
        let notificationContainer = document.getElementById('okn-notification-container');
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
      const notificationContainer = getSetNotificationContainer();

      // Remove any existing notification before creating a new one
      while (notificationContainer.firstChild) {
          notificationContainer.firstChild.remove();
      }

      // Create the notification element
      const notification = document.createElement('div');
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
          const logo = document.createElement('div');
          logo.className = 'okn-logo-text tiny';
          logo.setAttribute('role', 'img'); // Assigning an image role
          logo.setAttribute('aria-label', 'OpenKeyNav');
          logo.innerHTML = 'Open<span class="key">Key</span>Nav';
          notification.appendChild(logo);
      }

      // Create the message element
      const messageDiv = document.createElement('div');
      messageDiv.innerHTML = message;
      // Append the message to the notification
      notification.appendChild(messageDiv);

      // Append the notification to the notification container
      notificationContainer.appendChild(notification);

      // Automatically remove the notification after the specified duration
      setTimeout(() => {
          notification.remove();
      }, this.config.notifications.duration);
    }

    initStatusBar() {

    
      // Effect to emit a notification based on the current mode
      let lastMessage = "No mode active.";
      
      effect(() => {
        const modes = this.config.modes;
        let message;
    
        // Determine the message based on the current mode
        if (modes.clicking.value) {
          message = `In Click Mode. Press ${ keyButton(["Esc"])} to exit.`;
        } else if (modes.moving.value) {
          message = `In Drag Mode. Press ${ keyButton(["Esc"])} to exit.`;
        } 
        else {
          message = "No mode active.";
        }
    
        // Only emit the notification if the message has changed
        if (message === lastMessage) {
          return;
        }
    
        // Emit the notification with the current message
        // console.log(message);
        this.emitNotification(message);
        lastMessage = message;
      });
    
      // Effect to update the status bar based on the current mode
      effect(() => {
        const modes = this.config.modes;
        // DOM element to update
        const statusBar = document.getElementById('status-bar');
    
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
    
    checkEnabled(){
      if(this.getSetCookie(this.config.enabledCookie)){
        this.enable();
      }
    }

    getSetCookie(cookieName, value) {
      
      // Helper: set cookie for domain, expires in 1 year
      function setCookie(cookieName, v) {
        const expires = new Date(Date.now() + 365*24*60*60*1000).toUTCString();
        document.cookie = `${cookieName}=${v}; expires=${expires}; path=/; domain=${location.hostname}`;
      }
      
      // Helper: get cookie value
      function getCookie(cookieName) {
        const match = document.cookie.match(new RegExp('(^|; )' + cookieName + '=([^;]*)'));
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

    applicationSupport() {
      // Version Ping (POST https://applicationsupport.openkeynav.com/capture/)
      // This is anonymous and minimal, only sending the library version. No PII.
      // Necessary to know which versions are being used in the wild in order to provide proper support and plan roadmaps

      // no need to run app support on local develompent
      if (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '::1') {
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
                      "version": version,
                },
                "event": "openKeyNav.js version ping",
          })
        })
        // .then((res) => res.text())
        // .then(console.log.bind(console))
        // .catch(console.error.bind(console));
      } catch (error) {
        // fetch failed 
      }
    }
  
    setupGlobalClickListenerTracking() {
      const clickEventElements = this.config.modesConfig.click.clickEventElements;
  
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
  
      EventTarget.prototype.addEventListener = function(type, listener, options) {
          if (type === 'click') {
  
            // Add if the listener is not an empty function
            const isEmptyFunction = listener && /^\s*function\s*\(\)\s*\{\s*\}\s*$/.test(listener.toString());
            if (!isEmptyFunction) {
                clickEventElements.add(this);
            }
          }
  
          return originalAddEventListener.call(this, type, listener, options);
      };
  
      EventTarget.prototype.removeEventListener = function(type, listener, options) {
          if (type === 'click') {
              const remainingListeners = getEventListeners(this, 'click').filter(l => l.listener !== listener);
              if (remainingListeners.length === 0) {
                  clickEventElements.delete(this);
              }
          }
  
          return originalRemoveEventListener.call(this, type, listener, options);
      };
  
      const observer = new MutationObserver(mutationsList => {
          for (const mutation of mutationsList) {
              if (mutation.removedNodes.length > 0) {
                  mutation.removedNodes.forEach(node => {
                      if (node.nodeType === Node.ELEMENT_NODE) {
                          removeDescendantsFromSet(node);
                      }
                  });
              }
          }
      });
  
      observer.observe(document.body, { childList: true, subtree: true });
  
      function removeDescendantsFromSet(element) {
          if (clickEventElements.has(element)) {
              clickEventElements.delete(element);
          }
  
          element.querySelectorAll('*').forEach(child => {
              if (clickEventElements.has(child)) {
                  clickEventElements.delete(child);
              }
          });
      }
  
      function getEventListeners(el, eventType) {
          const listeners = [];
          const eventKey = `__eventListener__${eventType}`;
  
          if (el[eventKey]) {
              listeners.push({ listener: el[eventKey] });
          }
  
          return listeners;
      }
    }
  
    // Public API
    init(options = {}) {
      this.deepMerge(this.config, options);
      this.addKeydownEventListener();
      this.initStatusBar();
      this.initToolBar();
      this.applicationSupport();
      this.checkEnabled();
      console.log('Library initialized with config:', this.config);
      return this;
    }
}
  
// optionally attach a syncronous event listener here for tracking the elements tied to click events, (added and removed),
// since elements with click events are behaving like buttons

export default OpenKeyNav;