const version = "0.1.8";
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
          click : {
            modifier: false,
            clickEventElements: new Set(),
            eventListenersMap : new Map()
          }
        },
        log: [],
        typedLabel: '',
        headings: {
          currentHeadingIndex: 0, // Keep track of the current heading
          list: []
        },
        scrollables: {
          currentScrollableIndex: 0, // Keep track of the current scrollable
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
        init: (options = {}) => {
          // Merge the options with the default settings
          deepMerge(OpenKeyNav, options);
          injectStylesheet();
          addKeydownEventListener();
        }
      };
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
  
    injectStylesheet() {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML =
        '' +
        '.openKeyNav-label {' +
          'font: inherit;' +
          'vertical-align: baseline;' +
          'box-sizing: border-box;' +
          'white-space: nowrap;' +
          `border: 1px solid ${this.config.spot.fontColor};` +
        //   `box-shadow: inset 0 -2.5px 0 ${this.config.spot.insetColor}, inset 0 -3px 0 #999, 0 0 4px #fff;` +
        //   `background: linear-gradient(to top, #999 5%, ${this.config.spot.backgroundColor} 20%);` +
          `background-color: ${this.config.spot.backgroundColor};` +
        //   'border-radius: calc( 4px );' +
          `color: ${this.config.spot.fontColor};` +
          'display: inline-block;' +
          `font-size: ${this.config.spot.fontSize};` +
          // `outline : 2px solid ${this.config.focus.outlineColor};` +
          'outline-offset: -2px !important;' +
          // +"font-weight: bold;"
          'font-weight: inherit;' +
        //   'line-height: 1.5;' +
          'line-height: 1;' +
          'margin: 0 .1em 0 1px;' +
          'overflow-wrap: break-word;' +
        //   'padding: .0 .15em .1em;' +
          'padding: 3px;' +
          `text-shadow: 0 1px 0 ${this.config.spot.insetColor};` +
          'min-width: 1rem;' +
          'text-align: center;' +
          'position: absolute;' +
          'z-index: 99999999;' +
          'font-family: monospace;' +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="left"]::after, ' +
        '.openKeyNav-label[data-openkeynav-position="right"]::before, ' +
        '.openKeyNav-label[data-openkeynav-position="top"]::after, ' +
        '.openKeyNav-label[data-openkeynav-position="bottom"]::before, ' +
        '.openKeyNav-label[data-openkeynav-position="left"]::before, ' +
        '.openKeyNav-label[data-openkeynav-position="right"]::after, ' +
        '.openKeyNav-label[data-openkeynav-position="top"]::before, ' +
        '.openKeyNav-label[data-openkeynav-position="bottom"]::after {' +
            'content: "";' +
            'position: absolute;' +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="left"]::after, ' +
        '.openKeyNav-label[data-openkeynav-position="right"]::before, ' +
        '.openKeyNav-label[data-openkeynav-position="left"]::before, ' +
        '.openKeyNav-label[data-openkeynav-position="right"]::after {' +
            'top: 50%;' +
            'transform: translateY(-50%);' +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="top"]::after, ' +
        '.openKeyNav-label[data-openkeynav-position="bottom"]::before, ' +
        '.openKeyNav-label[data-openkeynav-position="top"]::before, ' +
        '.openKeyNav-label[data-openkeynav-position="bottom"]::after {' +
            'left: 50%;' +
            'transform: translateX(-50%);' +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="left"]::before {' +
            `border-left: ${this.config.spot.arrowSize_px + 1}px solid #fff;` +
            `right: -${this.config.spot.arrowSize_px + 1}px;` +
            `border-top: ${this.config.spot.arrowSize_px + 1}px solid transparent;` +
            `border-bottom: ${this.config.spot.arrowSize_px + 1}px solid transparent;` +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="left"]::after {' +
            `border-left: ${this.config.spot.arrowSize_px}px solid ${this.config.spot.backgroundColor};` +
            `right: -${this.config.spot.arrowSize_px}px;` +
            `border-top: ${this.config.spot.arrowSize_px}px solid transparent;` +
            `border-bottom: ${this.config.spot.arrowSize_px}px solid transparent;` +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="right"]::before {' +
            `border-right: ${this.config.spot.arrowSize_px + 1}px solid #fff;` +
            `left: -${this.config.spot.arrowSize_px + 1}px;` +
            `border-top: ${this.config.spot.arrowSize_px + 1}px solid transparent;` +
            `border-bottom: ${this.config.spot.arrowSize_px + 1}px solid transparent;` +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="right"]::after {' +
            `border-right: ${this.config.spot.arrowSize_px}px solid ${this.config.spot.backgroundColor};` +
            `left: -${this.config.spot.arrowSize_px}px;` +
            `border-top: ${this.config.spot.arrowSize_px}px solid transparent;` +
            `border-bottom: ${this.config.spot.arrowSize_px}px solid transparent;` +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="top"]{' +
            'padding-bottom: 0;' +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="top"]::before {' +
            `border-top: ${this.config.spot.arrowSize_px + 1}px solid #fff;` +
            `bottom: -${this.config.spot.arrowSize_px + 1}px;` +
            `border-left: ${this.config.spot.arrowSize_px + 1}px solid transparent;` +
            `border-right: ${this.config.spot.arrowSize_px + 1}px solid transparent;` +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="top"]::after {' +
            `border-top: ${this.config.spot.arrowSize_px}px solid ${this.config.spot.backgroundColor};` +
            `bottom: -${this.config.spot.arrowSize_px}px;` +
            `border-left: ${this.config.spot.arrowSize_px}px solid transparent;` +
            `border-right: ${this.config.spot.arrowSize_px}px solid transparent;` +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="bottom"]{' +
            'padding-top: 0;' +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="bottom"]::before {' +
            `border-bottom: ${this.config.spot.arrowSize_px + 1}px solid #fff;` +
            `top: -${this.config.spot.arrowSize_px + 1}px;` +
            `border-left: ${this.config.spot.arrowSize_px + 1}px solid transparent;` +
            `border-right: ${this.config.spot.arrowSize_px + 1}px solid transparent;` +
        '}' +
        '.openKeyNav-label[data-openkeynav-position="bottom"]::after {' +
            `border-bottom: ${this.config.spot.arrowSize_px}px solid ${this.config.spot.backgroundColor};` +
            `top: -${this.config.spot.arrowSize_px}px;` +
            `border-left: ${this.config.spot.arrowSize_px}px solid transparent;` +
            `border-right: ${this.config.spot.arrowSize_px}px solid transparent;` +
        '}' +
        '.openKeyNav-label-selected{' +
          // 'padding : 0;' +
          // 'margin : 0;' +
          'display : grid;' +
          'align-content : center;' +
          `color : ${this.config.spot.fontColor};` +
          `background : ${this.config.spot.backgroundColor};` +
          // `outline : 4px solid ${this.config.focus.outlineColor};` +
          `outline: none;` +
          // `border-radius: 100%;` +
          // `width: 1rem;` +
          // `height: 1rem;` +
          // 'text-shadow : none;' +
          // 'padding : 0 !important;' +
          // 'margin: 0 !important;' +
        '}' +
        '[data-openkeynav-label]:not(.openKeyNav-label):not(button){' +
          // `outline: 2px double ${this.config.focus.outlineColor} !important;` +
          // 'outline-offset: 2px !important;' +
          `box-shadow:  inset 0 0 0 .5px #000,
                        0 0 0 .75px #000,
                        0 0 0 1.5px rgba(255,255,255,1);` +
          'outline:none !important;'+
          // 'border-radius: 3px;' +
          'border-color: #000;' +
          'border-radius: 3px;' +
        '}' +
        'button[data-openkeynav-label]{' +
          'outline:2px solid #000 !important;' +
        '}' +
        '.openKeyNav-inaccessible:not(.openKeyNav-label):not(button){' +
          `box-shadow:  inset 0 0 0 .5px #f00,
                        0 0 0 1px #f00,
                        0 0 0 1.5px rgba(255,255,255,1);` +
          'outline:none !important;'+
          'border-color: #f00;' +
          'border-radius: 3px;' +
        '}' +
        'button.openKeyNav-inaccessible{' +
          'outline:2px solid #f00 !important;' +
        '}' +
        '.openKeyNav-inaccessible.openKeyNav-label{' +
          `box-shadow:  inset 0 0 0 .5px #f00,
                        0 0 0 1px #f00,
                        0 0 0 1.5px rgba(255,255,255,1);` +
          'border-color: #f00;' +
          'border-radius: 3px;' +
        '}' +
          //   +"span[data-openkeynav-label]{"
          //       +"display: inherit;"
          //   +"}"
        '.openKeyNav-noCursor *{' +
          'cursor: none !important;' +
        '}' +
        '*:focus {' +
          `outline: 2px ${this.config.focus.outlineStyle} ${this.config.focus.outlineColor} !important;` +
          'outline-offset: -2px !important;' +
        '}' +
        '.openKeyNav-mouseover-tooltip{' +
          'position: absolute;' +
          'background-color: #333;' +
          'color: #fff;' +
          'padding: 5px;' +
          'border-radius: 5px;' +
          'display: none;' +
          'z-index: 1000;' +
          'font-size: 12px;' +
        '}' +
        '.openKeyNav-mouseover-tooltip::before{' +
          'content: "Debug mode"' +
        '}'
        //   '[data-openkeynav-draggable="true"] {' +
        //   `outline: 2px solid ${this.config.focus.outlineColor};` +
        //   'outline-offset: -1px !important;' +
        // '}'
        ;
      document.head.appendChild(style);
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
        const elementsToAvoid = document.querySelectorAll('[data-openkeynav-label], .openKeyNav-label-selected');
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
                    return avoidEl === elementAtPoint || avoidEl.contains(elementAtPoint);
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
  
    isTopLeftCornerVisible(element) {
      const isElementInIframe = element => {
        return element.ownerDocument !== window.document;
      };
  
      let doc = element.ownerDocument;
      let win = doc.defaultView || doc.parentWindow;
      const rect = element.getBoundingClientRect();
      let x = rect.left + 1; // Slightly inside to avoid borders
      let y = rect.top + 1; // Slightly inside to avoid borders
  
      if (isElementInIframe(element)) {
        let frameElement = win.frameElement;
        if (frameElement) {
          let frameRect = frameElement.getBoundingClientRect();
          x += frameRect.left;
          y += frameRect.top;
          // Adjust `doc` and `win` to the parent document/window that contains the iframe
          doc = frameElement.ownerDocument;
          win = doc.defaultView || doc.parentWindow;
        }
      }
  
      const elemAtPoint = doc.elementFromPoint(x, y);
      return elemAtPoint === element || element.contains(elemAtPoint);
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
        // debug mode: do isTopLeftCornerVisible check by default and disable the check if debug.screenReaderVisible is true
        if (!this.config.debug.screenReaderVisible) {
          return (
            this.isTopLeftCornerVisible(elem) &&
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
          this.config.modes[key] = false;
        }
  
        // reset move mode config
        this.config.modesConfig.move.selectedConfig = false;
        this.config.modesConfig.move.selectedMoveable = false;
        this.config.modesConfig.move.selectedMoveableHTML = false;
        this.config.modesConfig.move.selectedDropZone = false;
        this.config.modesConfig.move.modifier = false;
  
        // reset click mode config
        this.config.modesConfig.click.modifier = false;
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
      if (this.config.modes.clicking) {
        enableScrolling();
      }
  
      // Remove overlay divs
  
      clearInaccessibleWarnings();
      if(removeAll){
        removeAllOverlays();
      }
      else{
        if(!this.config.modes.moving){
          // the only special modifer case so far for removing overlays is in moving mode,
          // where we may want to keep the selected element's label as a selected indicator
          removeAllOverlays();
        }
        else{
          // in moving mode.
          // keep the selected element's label as a selected indicator
          let selectedLabel = document.querySelector(`.openKeyNav-label[data-openkeynav-label="${this.config.typedLabel}"]`);
          if(!selectedLabel){
            removeAllOverlays();
          }
          else{
            this.config.modesConfig.move.selectedLabel = selectedLabel;
            removeAllOverlaysExceptThis(selectedLabel, this.config.typedLabel);
          }
        }
      }
  
      document.querySelectorAll('[data-openkeynav-label]').forEach(el => {
        el.removeAttribute('data-openkeynav-label'); // Clean up data-openkeynav-label attributes
      });
  
      resetModes();
      this.config.typedLabel = '';
  
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
        this.config.modesConfig.click.eventListenersMap.set(el, { showTooltip, hideTooltip });
      }
  
      // createTooltip(el, reason);
  
      el.classList.add('openKeyNav-inaccessible');
      el.setAttribute('data-openkeynav-inaccessible-reason', reason);
  
      return true;
    }
  
    addKeydownEventListener() {
  
      const beginDrag = () => {
        const sourceElement = this.config.modesConfig.move.selectedMoveable;
        const rectSource = sourceElement.getBoundingClientRect();
        const dataTransfer = new DataTransfer(); // Create a DataTransfer object to carry the drag data.
  
        if (typeof TouchEvent === 'undefined') {
          this.setupTouchEvent();
        }
  
        // Create and dispatch mousedown event
        const mouseDownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: rectSource.left + rectSource.width / 2,
          clientY: rectSource.top + rectSource.height / 2
        });
        sourceElement.dispatchEvent(mouseDownEvent);
  
        // Create and dispatch touchstart event (if needed)
        const touchStartEvent = new TouchEvent('touchstart', {
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
        const mouseMoveEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: rectSource.left + rectSource.width / 2 + 10, // Move mouse 10 pixels to the right
          clientY: rectSource.top + rectSource.height / 2 + 10  // Move mouse 10 pixels down
        });
        document.dispatchEvent(mouseMoveEvent);
  
        // Create and dispatch dragstart event
        const dragStartEvent = new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          clientX: rectSource.left + rectSource.width / 2 + 10,
          clientY: rectSource.top + rectSource.height / 2 + 10,
          dataTransfer
        });
        // Use Object.defineProperty to attach the dataTransfer object to the event.
        Object.defineProperty(dragStartEvent, 'dataTransfer', { value: dataTransfer });
        sourceElement.dispatchEvent(dragStartEvent);
      };
  
  
      const endDrag = (targetElement) => {
  
          const dataTransfer = new DataTransfer(); // Create a DataTransfer object to carry the drag data.
  
          let clientX = 0;
          let clientY = 0;
          let sourceElement = this.config.modesConfig.move.selectedMoveable;
  
          if (typeof TouchEvent === 'undefined') {
          this.setupTouchEvent();
          }
  
          if(!sourceElement){
              sourceElement = document.body;
          }
  
          if(!targetElement){
          targetElement = document.body;
          }
          const rectTarget = targetElement.getBoundingClientRect();
  
          if( targetElement != document ){
          clientX = rectTarget.left + rectTarget.width / 2;
          clientY = rectTarget.top + rectTarget.height / 2;
          }
  
          // Create mousemove event to simulate dragging
          const mouseMoveEvent = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY
          });
  
          // Create touchmove event to simulate dragging
          const touchMoveEvent = new TouchEvent('touchmove', {
            bubbles: true,
            cancelable: true,
            touches: [new Touch({
              identifier: Date.now(),
              target: targetElement,
              clientX,
              clientY
            })]
          });
  
          // Create dragenter event
          const dragEnterEvent = new DragEvent('dragenter', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
            dataTransfer
          });
          Object.defineProperty(dragEnterEvent, 'dataTransfer', { value: dataTransfer });
  
          // Create dragover event
          const dragOverEvent = new DragEvent('dragover', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
            dataTransfer
          });
          Object.defineProperty(dragOverEvent, 'dataTransfer', { value: dataTransfer });
  
          // Create drop event
          const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
            dataTransfer
          });
          Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
  
          // Create dragend event
          const dragEndEvent = new DragEvent('dragend', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
            dataTransfer
          });
          Object.defineProperty(dragEndEvent, 'dataTransfer', { value: dataTransfer });
  
          // Create mouseup event to drop
          const mouseUpEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY
          });
  
          // Create touchend event to drop
          const touchEndEvent = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            changedTouches: [new Touch({
              identifier: Date.now(),
              target: targetElement,
              clientX,
              clientY
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
  
  
      const doEscape = e => {
        let returnFalse = false;
        if (this.config.modes.clicking || this.config.modes.moving) {
          e.preventDefault();
          e.stopPropagation();
          endDrag();
          this.removeOverlays();
          this.clearMoveAttributes();
          returnFalse = true;
        }
        if (this.isTextInputActive()) {
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
  
      const focusOnScrollables = e => {
        this.config.scrollables.list = this.getScrollableElements(); // Populate or refresh the list of scrollable elements
  
        if (this.config.scrollables.list.length == 0) {
          return; // If no scrollable elements, exit the function
        }
  
        // /*
        {
          // Navigate through scrollable elements
          if (e.shiftKey) {
            // Move backwards
            this.config.currentScrollableIndex =
              this.config.currentScrollableIndex > 0
                ? this.config.currentScrollableIndex - 1
                : this.config.scrollables.list.length - 1;
          } else {
            // Move forwards
            this.config.currentScrollableIndex =
              this.config.currentScrollableIndex < this.config.scrollables.list.length - 1
                ? this.config.currentScrollableIndex + 1
                : 0;
          }
        }
        //*/
  
        // Focus the current scrollable element
        const currentScrollable = this.config.scrollables.list[this.config.currentScrollableIndex];
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
  
      const focusOnHeadings = (headings, e) => {
        this.config.headings.list = Array.from(document.querySelectorAll(headings)) // Get all headings in the view
          .filter(el => {
            // Skip if the element is visually hidden
            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') return false;
  
            // debug mode: debug mode: do isTopLeftCornerVisible check by default and disable the check if debug.screenReaderVisible is true
            if (!this.config.debug.screenReaderVisible) {
              // Skip if the element's top left corner is covered by another element
              if (!this.isTopLeftCornerVisible(el)) {
                return false;
              }
            }
            return true;
          });
  
        if (this.config.headings.list.length == 0) {
          return true;
        }
  
        // handle moving to the next / previous heading
        if (e.shiftKey) {
          // shift key is pressed, so move backwards. If at the beginning, go to the end.
          if (this.config.headings.currentHeadingIndex > 0) {
            this.config.headings.currentHeadingIndex--;
          } else {
            this.config.headings.currentHeadingIndex = this.config.headings.list.length - 1;
          }
        } else {
          // Move to the next heading. If at the end, go to the beginning.
          if (this.config.headings.currentHeadingIndex < this.config.headings.list.length - 1) {
            this.config.headings.currentHeadingIndex++;
          } else {
            this.config.headings.currentHeadingIndex = 0;
          }
        }
        const nextHeading = this.config.headings.list[this.config.headings.currentHeadingIndex];
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
  
      const placeCursorAndScrollToCursor = target => {
        const targetTagName = target.tagName.toLowerCase();
  
        setTimeout(() => {
          target.focus();
  
          if (targetTagName === 'input' || targetTagName === 'textarea') {
            // Move the cursor to the end for input and textarea elements
            const valueLength = target.value.length;
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
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(target);
            range.collapse(false); // false to move to the end
            sel.removeAllRanges();
            sel.addRange(range);
            // Attempt to ensure the caret is visible, considering the element might be larger than the viewport
            const rect = range.getBoundingClientRect();
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
  
      const filterRemainingOverlays = (e) => {
        // Filter overlays, removing non-matching ones
        document.querySelectorAll('.openKeyNav-label').forEach(overlay => {
          const label = overlay.textContent;
  
          // If the current typedLabel no longer matches the beginning of this element's label, remove both the overlay and clean up the target element
          if (!label.startsWith(this.config.typedLabel)) {
            const targetElement = document.querySelector(`[data-openkeynav-label="${label}"]`);
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
  
      const disableScrolling = () => {
        // Prevent scrolling on the webpage
  
        const disableScrollingForEl = el => {
          el.addEventListener('scroll', this.preventScroll, {
            passive: false
          });
          el.addEventListener('wheel', this.preventScroll, {
            passive: false
          });
          el.addEventListener('touchmove', this.preventScroll, {
            passive: false
          });
        };
  
        const disableScrollingForScrollableElements = () => {
          disableScrollingForEl(window);
          this.getScrollableElements().forEach(el => {
            disableScrollingForEl(el);
          });
        };
  
        disableScrollingForScrollableElements();
      };
  
      const generateValidKeyChars = () => {
        let chars = 'abcdefghijklmnopqrstuvwxyz';
        // let chars = '1234567890';
        // let chars = 'abcdefghijklmnopqrstuvwxyz1234567890'; // not a good idea because 1 and l can be confused
  
        // Remove letters from chars that are present in this.config.keys
        // maybe this isn't necessary when in click mode (mode paradigm is common in screen readers)
        // Object.values(this.config.keys).forEach(key => {
        //   chars = chars.replace(key, '');
        // });
  
        // remove the secondary escape key code
        chars = chars.replace(this.config.keys.escape, '');
  
        return chars;
  
      };
  
      const generateLabels = count => {
        function shuffle(array) {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        }
  
        let labels = [];
        const chars = generateValidKeyChars();
  
        let maxLength = chars.length ** 2;
        let useThirdChar = count > maxLength;
  
        if (useThirdChar) {
          maxLength = chars.length ** 3;
        }
  
        for (let i = 0; i < count && labels.length < maxLength; i++) {
          let firstChar = chars[i % chars.length];
          let secondChar = chars[Math.floor(i / chars.length) % chars.length] || '';
          let thirdChar = useThirdChar ? chars[Math.floor(i / chars.length ** 2) % chars.length] : '';
          labels.push(firstChar + secondChar + thirdChar);
        }
  
        // Attempt to shorten labels that are uniquely identifiable by their first character
        let labelCounts = {};
        labels.forEach(label => {
          let firstChar = label[0];
          labelCounts[firstChar] = (labelCounts[firstChar] || 0) + 1;
        });
  
        labels = labels.map(label => {
          let firstChar = label[0];
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
  
      const isTabbable = (el) => {
  
        const clickableElements = ['a', 'button', 'textarea', 'select', 'input', 'iframe', 'summary', '[onclick]'];
        const interactiveRoles = ['button', 'link', 'menuitem', 'option', 'tab', 'treeitem', 'checkbox', 'radio'];
  
        const isTypicallyClickableElement = (el) => {
  
          // Check if the element is a known clickable element
          if ( el.matches(clickableElements.join()) ) {
            return true;
          }
  
          // Check if the element has an interactive ARIA role
          const role = el.getAttribute('role');
          if ( role && interactiveRoles.includes(role) ) {
            return true;
          }
  
          return false;
        }
  
        const isHiddenByOverflow = (element) => {
          let parent = element.parentNode;
          // Use the ownerDocument to get the correct document context
          const doc = element.ownerDocument;
          const body = doc.body;
  
          while (parent && parent !== body) {
            // Use the specific document body of the element
            // if (parent instanceof HTMLElement) {
            const parentStyle = getComputedStyle(parent);
            if (
              ['scroll', 'auto'].includes(parentStyle.overflow) ||
              ['scroll', 'auto'].includes(parentStyle.overflowX) ||
              ['scroll', 'auto'].includes(parentStyle.overflowY)
            ) {
              const parentRect = parent.getBoundingClientRect();
              const rect = element.getBoundingClientRect();
              if (
                rect.bottom < parentRect.top ||
                rect.top > parentRect.bottom ||
                rect.right < parentRect.left ||
                rect.left > parentRect.right
              ) {
                return true; // Element is hidden by parent's overflow
              }
            }
            // }
            parent = parent.parentNode;
          }
          return false; // No parent hides the element by overflow
        };
  
        const inViewport = (el) => {
          // check if the element's top left corner is within the window's viewport
          const rect = el.getBoundingClientRect();
          const isInViewport =
            rect.top < window.innerHeight && rect.left < window.innerWidth && rect.bottom > 0 && rect.right > 0;
          return isInViewport;
        };
  
        // Ensure el is an Element before accessing styles
        if (!(el instanceof Element)) {
          return false;
        }
  
        // Skip if the element is set to not display (not the same as having zero size)
        const style = getComputedStyle(el);
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
        const tabIndex = el.getAttribute('tabindex');
        if (tabIndex && parseInt(tabIndex, 10) > -1) {
          return true;
        }
  
        // Skip if the element is visually hidden (not the same as having zero size or set to not display)
        if (style.visibility === 'hidden') {
          return false;
        }
  
        // Skip if the element has no size (another way to visually hide something)
        if (!this.isNonzeroSize(el)) {
          return false;
        }
  
        // Skip if the element's top left corner is not within the window's viewport
        if (!inViewport(el)) {
          return false;
        }
  
        // do isTopLeftCornerVisible check by default and disable the check if debug.screenReaderVisible is true
        if (!this.config.debug.screenReaderVisible) {
          // Skip if the element's top left corner is covered by another element
          if (!this.isTopLeftCornerVisible(el)) {
            return false;
          }
        }
  
        // Skip if <summary> is not the first <summary> element of a <details>
        if (el.tagName.toLowerCase() === 'summary') {
          const details = el.parentElement;
          if (details.tagName.toLowerCase() === 'details' && details.querySelector('summary') !== el) {
            return false;
          }
        }
  
        // lastly, elements that are inaccessible due to not being tabbable
  
  
        if (tabIndex && parseInt(tabIndex, 10) == -1) {
  
          if (isTypicallyClickableElement(el)) {
            // if (this.config.modes.clicking) {
              this.flagAsInaccessible(
                el,
                `
                <h2>Inaccessible Element</h2>
                <h3>Problem: </h3>
                <p>This element is not keyboard-focusable.</p>
                <h3>Solution: </h3>
                <p>Since this element has a tabindex attribute set to -1, it cannot be keyboard focusable.</p>
                <p>It must have a tabindex set to a value &gt; -1, ideally 0.</p>
                <p>You can ignore this warning if this element is not meant to be clickable.</p>
                `,
                "keyboard"
              );
            // }
          }
  
          // return false; // let's keep it, since we are flagging it
        }
  
        // Skip if the element is an <a> without an href (unless it has an ARIA role that makes it tabbable)
  
        const role = el.getAttribute('role');
  
        // const clickableElements = ['a', 'button', 'textarea', 'select', 'input', 'iframe', 'summary', '[onclick]'];
        // const interactiveRoles = ['button', 'link', 'menuitem', 'option', 'tab', 'treeitem', 'checkbox', 'radio'];
  
        switch (el.tagName.toLowerCase()) {
          case 'a':
            if (!el.hasAttribute('href') || el.getAttribute('href') === ''){
              if (!interactiveRoles.includes(role)) {
                // if (this.config.modes.clicking) {
                  this.flagAsInaccessible(
                    el,
                    `
                    <h2>Inaccessible Button</h2>
                    <h3>Problem: </h3>
                    <p>This clickable button is not keyboard-focusable.</p>
                    <p>As a result, only mouse users can click on it.</p>
                    <p>This usability disparity can create an accessibility barrier.</p>
                    <h3>Solution: </h3>
                    <p>Since it is an anchor tag (&lt;a&gt;), it needs a non-empty <em>href</em> attribute.</p>
                    <p>Alternatively, it needs an ARIA <em>role</em> attribute set to something like 'button' or 'link' AND a tabindex attribute set to a value &gt; -1, ideally 0.</p>
                    `,
                    "keyboard"
                  );
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
  
              let fromClickEvents = "";
              if (this.config.modesConfig.click.clickEventElements.has(el)) {
                fromClickEvents = "fromClickEvents";
              }
              this.flagAsInaccessible(
                el,
                `
                <!--
                  !el(a,button,textarea,select,input,iframe,summary)
                  !el[role('button', 'link', 'menuitem', 'option', 'tab', 'treeitem', 'checkbox', 'radio')]
                  fromClickEvents
                -->
                <h2>Possibly Inaccessible Clickable Element</h2>
                <h3>Problem: </h3>
                <p>This element has a mouse click event handler attached to it, but it is not keyboard-focusable.</p>
                <p>As a result, only mouse users can click on it.</p>
                <p>This usability disparity can create an accessibility barrier.</p>
                <h3>Solution Options: </h3>
                <ol>
                  <li>
                    <p>If clicking this element takes the user to a different location, convert this element to an anchor link (&lt;a&gt;) with a non-empty <em>href</em> attribute.</p>
                  </li>
                  <li>
                    <p>Otherwise if clicking this element triggers an action on the page, convert this element to a &lt;button&gt; without a <em>disabled</em> attribute.</p>
                    <p>Alternatively, it needs an ARIA <em>role</em> attribute set to something like 'button' or 'link' AND a tabindex attribute set to a value &gt; -1, ideally 0.</p>
                  </li>
                  <li>
                    <p>Otherwise, if clicking this element does not do anything, then consider removing the click event handler attached to this element.</p>
                  </li>
                </ol>
                `,
                "keyboard"
              );
              // return false;
            // }
            }
            break;
        }
  
        // it must be a valid tabbable element
        return true;
      }
  
      const getAllCandidateElements = doc => {
        let allElements = Array.from(
          doc.querySelectorAll(
            "a," + // can be made non-tabbable by removing the href attribute or setting tabindex="-1".
            "button:not([disabled])," + // are not tabbable when disabled.
            "textarea:not([disabled])," + // are not tabbable when disabled.
            "select:not([disabled])," + // are not tabbable when disabled.
            "input:not([disabled])," + // are not tabbable when disabled.
            // "label," +  // are not normally tabbable unless they contain tabbable content.
            "iframe," + // are tabbable by default.
            "details > summary," + // The summary element inside a details element can be tabbable
            "[role=button]," + // can be made non-tabbable by adding tabindex="-1".
            "[role=link]," + // can be made non-tabbable by adding tabindex="-1".
            "[role=menuitem]," + // can be made non-tabbable by adding tabindex="-1".
            "[role=option]," + // can be made non-tabbable by adding tabindex="-1".
            "[role=tab]," + // can be made non-tabbable by adding tabindex="-1".
            "[role=treeitem]," + // can be made non-tabbable by adding tabindex="-1".
            "[role=checkbox]," + // can be made non-tabbable by adding tabindex="-1".
            "[role=radio]," + // can be made non-tabbable by adding tabindex="-1".
            "[aria-checked]," + // not inherently tabbable or non-tabbable.
            "[contenteditable=true]," + // elements with contenteditable="true" are tabbable.
            "[contenteditable=plaintext-only]," + // elements with contenteditable="plaintext-only" are tabbable.
            "[tabindex]," + // elements with a tabindex attribute can be made tabbable or non-tabbable depending on the value of tabindex.
            "[onclick]"  // elements with an onclick attribute are not inherently tabbable or non-tabbable.
          )
        );
        const iframes = doc.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const iframeElements = getAllCandidateElements(iframeDoc);
            allElements = allElements.concat(Array.from(iframeElements)); // Add elements from each iframe
          } catch (error) {
            console.log('Access denied to iframe content:', error);
          }
        });
  
        // Merge with clickEventElements
        const mergedSet = new Set([...allElements, ...this.config.modesConfig.click.clickEventElements]);
        return Array.from(mergedSet);
  
        // return allElements;
      };
  
      const showClickableOverlays = () => {
  
        disableScrolling();
        setTimeout(() => {
          let clickables = getAllCandidateElements(document).filter(el => {
            return isTabbable(el);
          });
  
          // console.log(clickables);
  
          const labels = generateLabels(clickables.length);
  
          clickables.forEach((element, index) => {
            element.setAttribute('data-openkeynav-label', labels[index]);
          });
          clickables.forEach((element, index) => {
            this.createOverlay(element, labels[index]);
          });
        }, 0); // Use timeout to ensure the operation completes
      };
  
      const addKeydownEventListenerToIframe = iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          const potentialTarget = iframeDoc.querySelector(`[data-openkeynav-label="${this.config.typedLabel}"]`);
          if (potentialTarget) {
            target = potentialTarget;
  
            // Check if the keypress listener has already been added
            if (!iframeDoc.keypressListenerAdded) {
              const script = iframeDoc.createElement('script');
              script.textContent =
                '' +
                "document.addEventListener('keydown', function(event) {" +
                'window.parent.postMessage({' +
                "type: 'keydown'," +
                'key: event.key,' +
                'keyCode: event.keyCode,' +
                'altKey: event.altKey,' +
                'ctrlKey: event.ctrlKey,' +
                'shiftKey: event.shiftKey,' +
                'metaKey: event.metaKey' +
                "}, '*');" +
                '});' +
                'document.keypressListenerAdded = true;'; // Set flag to true
              iframeDoc.body.appendChild(script);
            }
          }
        } catch (error) {
          console.log('Error accessing iframe content', error);
        }
      };
  
      const showMoveableFromOverlays = () => {
        // alert("showMoveableFromOverlays()");
        // return;
  
        // Combine all unique 'from' classes from moveConfig to query the document
        let moveables = [];
  
        // direct selectors of from elements
        const fromElementSelectors = [
          ...new Set(this.config.modesConfig.move.config.filter(config => config.fromElements).map(config => config.fromElements))
        ];
        if (!!fromElementSelectors.length) {
          document.querySelectorAll(fromElementSelectors.join(', ')).forEach(element => {
            const config = this.config.modesConfig.move.config.find(c => element.matches(c.fromElements));
            if (config) {
              const configKey = this.config.modesConfig.move.config.indexOf(config);
              if (this.isNonzeroSize(element) && (!config.fromExclude || !element.matches(config.fromExclude))) {
                element.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
                moveables.push(element);
              }
            }
          });
        }
  
        // containers of from elements
        const fromContainerSelectors = [
          ...new Set(this.config.modesConfig.move.config.filter(config => config.fromContainer).map(config => config.fromContainer))
        ];
        if (!!fromContainerSelectors.length) {
          const fromContainers = document.querySelectorAll(fromContainerSelectors.join(', '));
          // Collect all direct children of each fromContainer as moveable elements
          fromContainers.forEach(container => {
            const config = this.config.modesConfig.move.config.find(c => container.matches(c.fromContainer));
            if (config) {
              const configKey = this.config.modesConfig.move.config.indexOf(config);
              const children = Array.from(container.children);
              children.forEach(child => {
                if (this.isNonzeroSize(child) && (!config.fromExclude || !child.matches(config.fromExclude))) {
                  child.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
                  moveables.push(child);
                }
              });
            }
          });
        }
  
        // Resolve elements using provided callbacks if available
        this.config.modesConfig.move.config.forEach(config => {
          if (config.resolveFromElements) {
            const resolvedElements = config.resolveFromElements();
            resolvedElements.forEach(element => {
              const configKey = this.config.modesConfig.move.config.indexOf(config);
              if (this.isNonzeroSize(element) && (!config.fromExclude || !element.matches(config.fromExclude))) {
                element.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
                moveables.push(element);
              }
            });
          }
        });
  
        // filter out moveables that would not be clickable
        moveables = moveables.filter(el => {
          return isTabbable(el);
        });
  
  
        const labels = generateLabels(moveables.length);
  
        moveables.forEach((element, index) => {
            element.setAttribute('data-openkeynav-label', labels[index]);
        });
        moveables.forEach((element, index) => {
          this.createOverlay(element, labels[index]);
          element.setAttribute('data-openkeynav-draggable', 'true');
        });
      };
  
      const handleTargetClickInteraction = (target, e) => {
        let doc = target.ownerDocument;
        let win = doc.defaultView || doc.parentWindow;
  
        let target_tagName = target.tagName.toLowerCase();
        if (
          target_tagName === 'input' ||
          target_tagName === 'textarea' ||
          target.contentEditable === 'true' ||
          target.contentEditable === 'plaintext-only' ||
          (target.hasAttribute('tabindex') && target.tabIndex > -1)
        ) {
          target.focus();
          placeCursorAndScrollToCursor(target);
        } else {
          if (e.shiftKey && target.tagName.toLowerCase() === 'a' && target.href) {
            win.open(target.href, '_blank');
          } else {
            target.focus(); // Ensure the target element is focused before dispatching the click event
            if(!this.config.modesConfig.click.modifier){
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: win
              });
              target.dispatchEvent(clickEvent);
            }
          }
        }
        this.removeOverlays();
        this.clearMoveAttributes();
      };
  
      const moveSelectedMoveableToTarget = (selectedTarget) => {
  
        // const modifier = true; // for whether move is sticky or not (sticky mode?)
        console.log(`Selected move target:`, selectedTarget);
        this.config.modesConfig.move.selectedDropZone = selectedTarget;
        let callback = this.config.modesConfig.move.config[this.config.modesConfig.move.selectedConfig].callback;
        if (!callback) {
          //   console.error("No callback function has been set to execute this move operation");
          simulateDragAndDrop(this.config.modesConfig.move.selectedMoveable, this.config.modesConfig.move.selectedDropZone);
        } else {
          this.config.modesConfig.move.config[this.config.modesConfig.move.selectedConfig].callback(
            this.config.modesConfig.move.selectedMoveable,
            this.config.modesConfig.move.selectedDropZone
          );
        }
        if(!this.config.modesConfig.move.modifier){
          this.removeOverlays(true);
          this.clearMoveAttributes();
        }
        return true;
      }
  
      const handleClickMode = (e) => {
        e.preventDefault();
        this.config.typedLabel += e.key.toLowerCase();
  
        let target = document.querySelector(`[data-openkeynav-label="${this.config.typedLabel}"]`);
        if (!target) {
          document.querySelectorAll('iframe').forEach(iframe => {
            addKeydownEventListenerToIframe(iframe);
          });
        }
  
        if (target) {
          setTimeout(() => {
            handleTargetClickInteraction(target, e);
          }, 0);
        } else {
          filterRemainingOverlays(e);
          return false;
        }
        return true;
      }
  
      const handleMoveMode = (e) => {
  
        const showMoveableToOverlays = selectedMoveable => {
  
          // temporarily persist modifier
          const modifer = this.config.modesConfig.move.modifier;
  
          // Remove existing overlays or switch to target overlays
          this.removeOverlays();
  
          // Set moving mode and selected moveable element
          this.config.modes.moving = true;
          this.config.modesConfig.move.selectedMoveable = selectedMoveable;
          this.config.modesConfig.move.selectedMoveableHTML = selectedMoveable.innerHTML;
          this.config.modesConfig.move.modifier = modifer;
  
          // Get the configuration index from the selected moveable
          const configIndex = selectedMoveable.getAttribute('data-openkeynav-moveconfig');
          if (configIndex === null) return;
  
          // Convert the index to a number
          const configKeyForSelectedMoveable = parseInt(configIndex, 10);
  
          // Store the selected configuration index
          this.config.modesConfig.move.selectedConfig = configKeyForSelectedMoveable;
  
          // Find the corresponding move configuration
          const moveConfig = this.config.modesConfig.move.config[configKeyForSelectedMoveable];
          if (!moveConfig) return;
  
          // Get all target elements for the selectedMoveable
          // let targetElements = document.querySelectorAll(moveConfig.toElements);
  
          // targetElements = targetElements.filter(el => {
          //   return isTabbable(el);
          // });
  
          const targetElements = [].filter.call( document.querySelectorAll(moveConfig.toElements), isTabbable)
  
          // Generate labels for the target elements
          const labels = generateLabels(targetElements.length);
  
          targetElements.forEach((element, index) => {
            element.setAttribute('data-openkeynav-label', labels[index]);
          });
          targetElements.forEach((element, index) => {
            if (!this.isNonzeroSize(element)) return;
            this.createOverlay(element, labels[index]);
            element.setAttribute('data-openkeynav-dropzone', 'true');
          });
        };
  
        function findMatchingElements(queryString) {
          return Array.from(document.querySelectorAll(queryString));
        }
  
        function findElementWithQuery(startElement, queryString, direction = 'next') {
          let currentElement = startElement;
  
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
                      let descendants = currentElement.querySelectorAll(queryString);
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
  
                      let foundElement = currentElement.querySelector(queryString);
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
          let direction = 'next';
          if (event.shiftKey) {
            direction = 'previous';
          }
          // the moveable element should be stored as openKeyNav.config.modesConfig.move.selectedMoveable
          return findElementWithQuery(
            openKeyNav.config.modesConfig.move.selectedMoveable,
            '[data-openkeynav-label]:not(.openKeyNav-label)',
            direction
          );
        }
  
        // in moving mode
        // Handle typing in move mode, similar to how you handle clicking mode
        // Accumulate typed characters as in labeling mode
  
        // ensure the typed key is valid label candidate (aka not something like )
        // e.key/.
  
        const validLabelChars = generateValidKeyChars();
        let isValidLabelChar = Array.from(validLabelChars).some(validChar => {
          return validChar.toLowerCase() ==  e.key.toLowerCase();
        });
  
        let selectedTarget;
  
        if(isValidLabelChar){
          this.config.typedLabel += e.key.toLowerCase();
          selectedTarget = document.querySelector(`[data-openkeynav-label="${this.config.typedLabel}"]:not(.openKeyNav-label)`);
        }
        else{ // tab-based moving
          if(e.key === "Tab"){
            const queryString = '.openKeyNav-label:not(.openKeyNav-label-selected)';
  
            selectedTarget = cycleThroughMoveTargets(e);
          }
        }
  
        if (!selectedTarget) {
          // no selected target. filter remaining overlays and exit.
          filterRemainingOverlays(e);
          return false;
        }
  
        if (!this.config.modesConfig.move.selectedMoveable) {
          // new selected target.
          // setting selectedTarget as selectedMoveable
          console.log(`Selected element to move:`, selectedTarget);
          showMoveableToOverlays(selectedTarget);
          beginDrag();
          return true;
        }
  
        // moving selectedMoveable to target
        moveSelectedMoveableToTarget(selectedTarget)
  
        return true;
      }
  
      const simulateDragAndDrop = (sourceElement, targetElement) => {
  
        const handleStickyMove = () => {
  
          function findMatchingElementByHTML(htmlString) {
  
            function removeComments(htmlString) {
              return htmlString.replace(/<!--[\s\S]*?-->/g, '');
            }
  
              // Remove comments from the HTML string
              let cleanedHTMLString = removeComments(htmlString);
  
              // Get all elements in the document
              let allElements = document.querySelectorAll('*');
  
              for (let element of allElements) {
                  // Remove comments from the element's HTML
                  let cleanedElementHTML = removeComments(element.innerHTML);
  
                  // Compare the cleaned HTML of each element with the cleaned HTML string
                  if (cleanedElementHTML === cleanedHTMLString) {
                      return element;
                  }
              }
              return null;
          }
  
          if(!this.config.modesConfig.move.modifier){
            return false;
          }
  
          this.config.typedLabel = '';
          this.config.modesConfig.move.selectedDropZone = false;
  
          // if the selected element (this.config.modesConfig.move.selectedMoveable) is no longer in the DOM,
          // try to find an element in the DOM with matching HTML
          // that complies with the move inclusion criteria
          // and doesn't go against the exclusion criteria
          // set that element as the selected element
          // and then move the openKeyNav-label-selected label to it
  
          if(!document.contains(this.config.modesConfig.move.selectedMoveable)){
            let matchingElement = findMatchingElementByHTML(this.config.modesConfig.move.selectedMoveableHTML);
  
            const selectedConfig = this.config.modesConfig.move.config[this.config.modesConfig.move.selectedConfig];
            const passesInclusionCriteria = matchingElement && matchingElement.matches(selectedConfig.fromElements) || matchingElement.matches(selectedConfig.fromContainer + ' > *');
            const passesExclusionCriteria = matchingElement && !matchingElement.matches(selectedConfig.fromExclude);
  
            if (passesInclusionCriteria && passesExclusionCriteria) {
                console.log('Matching element found:', matchingElement);
                this.config.modesConfig.move.selectedMoveable = matchingElement;
                this.config.modesConfig.move.selectedMoveableHTML = matchingElement.innerHTML;
                this.updateOverlayPosition(matchingElement, this.config.modesConfig.move.selectedLabel);
  
                beginDrag();
  
  
            } else {
                console.log('No matching element found.');
                this.removeOverlays(true);
                this.clearMoveAttributes();
            }
          }
        }
  
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
      document.addEventListener(
        'keydown',
        e => {
          // first check for modifier keys and escape
          switch (e.key) {
            case 'Shift': // exit this event listener if it's the shift key press
            case 'Control': // exit this event listener if it's the control key press
            case 'Alt': // exit this event listener if it's the alt key press
            case 'Meta': // exit this event listener if it's the meta key (Command/Windows) press
            case ' ': // exit this event listener if it's the space bar key press
              // Prevent default action and stop the function
              // e.preventDefault();
              return true;
              break;
  
            // handle escape first
            case 'Escape': // escaping
              // alert("Escape");
              doEscape(e);
              break;
          }
  
          // check if currently in any openkeynav modes
          if (this.config.modes.clicking) {
            return handleClickMode(e);
          }
          if (this.config.modes.moving) {
            return handleMoveMode(e);
          }
  
          if (this.isTextInputActive()) {
            if (!e.ctrlKey) {
              return true;
            }
          }
  
          // escape and toggles
          switch (e.key) {
            case this.config.keys.escape: // escaping
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
            case this.config.keys.click: // possibly attempting to initiate click mode
            case this.config.keys.click.toUpperCase():
              e.preventDefault();
              this.config.modes.clicking = true;
              if(e.key == this.config.keys.click.toUpperCase()){
                this.config.modesConfig.click.modifier = true;
              }
              showClickableOverlays();
              return true;
              break;
  
            // possibly attempting to initiate moving mode
            case this.config.keys.move:
            case this.config.keys.move.toUpperCase():
              // Toggle move mode
              e.preventDefault();
              this.config.modes.moving = true; // Assuming you add a 'move' flag to your modes object
              if(e.key == this.config.keys.move.toUpperCase()){
                this.config.modesConfig.move.modifier = true;
              }
              showMoveableFromOverlays(); // This will be a new function similar to showClickableOverlays
              return true;
  
            default:
              break;
          }
  
          // focus / navigation (can be modified by shift, so always check for lowercase)
          switch (e.key.toLowerCase()) {
            // Check if the pressed key is for headings
            case this.config.keys.heading.toLowerCase():
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
  
            case this.config.keys.scroll.toLowerCase():
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
          const numberMap = {
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
            const numberPressed = numberMap[e.code];
  
            switch (numberPressed) {
              case this.config.keys.heading_1:
                e.preventDefault(); // Prevent default action to allow our custom behavior
                focusOnHeadings('h1', e);
                break;
              case this.config.keys.heading_2:
                e.preventDefault(); // Prevent default action to allow our custom behavior
                focusOnHeadings('h2', e);
                break;
              case this.config.keys.heading_3:
                e.preventDefault(); // Prevent default action to allow our custom behavior
                focusOnHeadings('h3', e);
                break;
              case this.config.keys.heading_4:
                e.preventDefault(); // Prevent default action to allow our custom behavior
                focusOnHeadings('h4', e);
                break;
              case this.config.keys.heading_5:
                e.preventDefault(); // Prevent default action to allow our custom behavior
                focusOnHeadings('h5', e);
                break;
              case this.config.keys.heading_6:
                e.preventDefault(); // Prevent default action to allow our custom behavior
                focusOnHeadings('h6', e);
                break;
              default:
                break;
            }
          }
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
            doEscape(e);
          }
  
          // Dispatch it on the document or specific element that your existing handler is attached to
          document.dispatchEvent(newEvent);
        }
      });
    }

    applicationSupport() {
      // Version Ping (POST https://applicationsupport.openkeynav.com/capture/)
      // This is anonymous and minimal, only sending the library version and the date. No PII.
      // Necessary to know which versions are being used in the wild in order to provide proper support and plan roadmaps
      try {
        fetch("https://applicationsupport.openkeynav.com/capture/", {
          "method": "POST",
          "headers": {
                "Content-Type": "application/json"
          },
          "body": JSON.stringify({
                "properties": {
                      "version": version,
                      "timestamp": new Date().toISOString()
                },
                "api_key": "phc_2NVfXaBIYnZxYzEQtMJCuwB4rDbmjKkeCxlVZMK7x12",
                "event": "openKeyNav.js version ping",
                "distinct_id": "openKeyNav.js"
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
      this.injectStylesheet();
      this.addKeydownEventListener();
      this.setupGlobalClickListenerTracking();
      this.applicationSupport();
      console.log('Library initialized with config:', this.config);
    }
}
  
// optionally attach a syncronous event listener here for tracking the elements tied to click events, (added and removed),
// since elements with click events are behaving like buttons

export default OpenKeyNav;
