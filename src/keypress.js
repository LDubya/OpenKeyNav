import { handleTargetClickInteraction } from "./clicking";
import { beginDrag, simulateDragAndDrop } from "./dragAndDrop";
import { handleEscape } from "./escape";
import { focusOnHeadings, focusOnScrollables } from "./focus";
import { isTabbable } from "./isTabbable";
import { filterRemainingOverlays, generateLabels, generateValidKeyChars, showClickableOverlays, showMoveableFromOverlays } from "./keylabels";
import { enable, disable } from "./lifecycle";
import { keyButton } from './keyButton.js';

function getMetaKeyName() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('mac') >= 0) return 'Cmd';
  if (userAgent.indexOf('win') >= 0) return 'Win';
  if (userAgent.indexOf('linux') >= 0) return 'Super';
  // fallback
  return 'Meta';
}

export const modiferKeyString = (openKeyNav) => {
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
}

export const handleKeyPress = (openKeyNav, e) => {

  

    const isTextInputActive = openKeyNav.isTextInputActive();

    // enable / disable openKeyNav
    if (e[openKeyNav.config.keys.modifierKey] && openKeyNav.config.keys.menu.toLowerCase() == e.key.toLowerCase()) {
      if (isTextInputActive) {
        if (!e[openKeyNav.config.keys.inputEscape]) {
          return true;
        }
      }
      
      if(!openKeyNav.meta.enabled.value){ // if openKeyNav disabled
        openKeyNav.enable();
        let message = `openKeyNav enabled. Press ${ keyButton(
          [
            modiferKeyString(openKeyNav), 
            openKeyNav.config.keys.menu
          ])} to disable.`;
        openKeyNav.emitNotification(message);
        return true;
      }
      else{
        handleEscape(openKeyNav, e);
        openKeyNav.disable();
        let message = `openKeyNav disabled. Press ${ keyButton(
          [
            modiferKeyString(openKeyNav), 
            openKeyNav.config.keys.menu]
        )} to enable.`;
        openKeyNav.emitNotification(message);
        return true;
      }
    }

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
          handleEscape(openKeyNav, e);
          break;
      }
  
      // check if currently in any openkeynav modes
      if (openKeyNav.config.modes.clicking.value) {
        return handleClickMode(openKeyNav, e);
      }
      if (openKeyNav.config.modes.moving.value) {
        return handleMoveMode(openKeyNav, e);
      }
      if (openKeyNav.config.modes.menu.value){
        handleMenuMode(e);
      }
  
      if (isTextInputActive) {
        if (!e[openKeyNav.config.keys.inputEscape]) {
          return true;
        }
      }
  
      if(!openKeyNav.meta.enabled.value){
        return true;
      }
      // escape and toggles
      switch (e.key) {
        case openKeyNav.config.keys.escape: // escaping
          // alert("Escape");

          handleEscape(openKeyNav, e)
          return true;
          break;
  
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
          if(e.key == openKeyNav.config.keys.click.toUpperCase()){
            openKeyNav.config.modesConfig.click.modifier = true;
          }
          showClickableOverlays(openKeyNav);
          openKeyNav.preventpropagation(e);
          return true;
          break;
  
        // possibly attempting to initiate moving mode
        case openKeyNav.config.keys.move:
        case openKeyNav.config.keys.move.toUpperCase():
          // Toggle move mode
          e.preventDefault();
          openKeyNav.config.modes.moving.value = true; // Assuming you add a 'move' flag to your modes object
          if(e.key == openKeyNav.config.keys.move.toUpperCase()){
            openKeyNav.config.modesConfig.move.modifier = true;
          }
          showMoveableFromOverlays(openKeyNav); // This will be a new function similar to showClickableOverlays
          openKeyNav.preventpropagation(e);
          return true;
  
        case openKeyNav.config.keys.menu:
        case openKeyNav.config.keys.menu.toUpperCase():
          openKeyNav.config.modes.menu.value = true;
          if(e.key == openKeyNav.config.keys.menu.toUpperCase()){
            openKeyNav.config.modesConfig.menu.modifier = true;
          }
          openKeyNav.preventpropagation(e);
          return true;
          break;
  
        default:
          break;
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
  
          focusOnHeadings(openKeyNav, 'h1, h2, h3, h4, h5, h6', e);
          openKeyNav.preventpropagation(e);
          return true;
          break;
  
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
  
          focusOnScrollables(openKeyNav, e);
          openKeyNav.preventpropagation(e);
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
          case openKeyNav.config.keys.heading_1:
            e.preventDefault(); // Prevent default action to allow our custom behavior
            focusOnHeadings(openKeyNav, 'h1', e);
            break;
          case openKeyNav.config.keys.heading_2:
            e.preventDefault(); // Prevent default action to allow our custom behavior
            focusOnHeadings( openKeyNav, 'h2', e);
            break;
          case openKeyNav.config.keys.heading_3:
            e.preventDefault(); // Prevent default action to allow our custom behavior
            focusOnHeadings( openKeyNav, 'h3', e);
            break;
          case openKeyNav.config.keys.heading_4:
            e.preventDefault(); // Prevent default action to allow our custom behavior
            focusOnHeadings( openKeyNav, 'h4', e);
            break;
          case openKeyNav.config.keys.heading_5:
            e.preventDefault(); // Prevent default action to allow our custom behavior
            focusOnHeadings( openKeyNav, 'h5', e);
            break;
          case openKeyNav.config.keys.heading_6:
            e.preventDefault(); // Prevent default action to allow our custom behavior
            focusOnHeadings( openKeyNav, 'h6', e);
            break;
          default:
            break;
        }
    }
}

const handleClickMode = (openKeyNav, e) => {
    e.preventDefault();
    openKeyNav.config.typedLabel.value += e.key.toLowerCase();

    let target = document.querySelector(`[data-openkeynav-label="${openKeyNav.config.typedLabel.value}"]`);
    
    if (!target) {
      document.querySelectorAll('iframe').forEach(iframe => {
        addKeydownEventListenerToIframe(openKeyNav, iframe);
      });
    }

    if (target) {
      setTimeout(() => {
        handleTargetClickInteraction(openKeyNav, target, e);
      }, 0);
    } else {
      filterRemainingOverlays(openKeyNav, e);
      return false;
    }
    return true;
}

const handleMoveMode = (openKeyNav, e) => {
  
    const showMoveableToOverlays = selectedMoveable => {

      // temporarily persist modifier
      const modifer = openKeyNav.config.modesConfig.move.modifier;

      // Remove existing overlays or switch to target overlays
      openKeyNav.removeOverlays();

      // Set moving mode and selected moveable element
      openKeyNav.config.modes.moving.value = true;
      openKeyNav.config.modesConfig.move.selectedMoveable = selectedMoveable;
      openKeyNav.config.modesConfig.move.selectedMoveableHTML = selectedMoveable.innerHTML;
      openKeyNav.config.modesConfig.move.modifier = modifer;

      // Get the configuration index from the selected moveable
      const configIndex = selectedMoveable.getAttribute('data-openkeynav-moveconfig');
      if (configIndex === null) return;

      // Convert the index to a number
      const configKeyForSelectedMoveable = parseInt(configIndex, 10);

      // Store the selected configuration index
      openKeyNav.config.modesConfig.move.selectedConfig = configKeyForSelectedMoveable;

      // Find the corresponding move configuration
      const moveConfig = openKeyNav.config.modesConfig.move.config[configKeyForSelectedMoveable];
      if (!moveConfig) return;

      // Get all target elements for the selectedMoveable
      // let targetElements = document.querySelectorAll(moveConfig.toElements);

      // targetElements = targetElements.filter(el => {
      //   return isTabbable(el, openKeyNav);
      // });


      function tabbableFilter(openKeyNav) {
        return function(el) {
            return isTabbable(el, openKeyNav);
        };
      }
    
      const targetElements = [].filter.call(
          document.querySelectorAll(moveConfig.toElements),
          tabbableFilter(openKeyNav)
      );

      // Generate labels for the target elements
      const labels = generateLabels(openKeyNav, targetElements.length);

      targetElements.forEach((element, index) => {
        element.setAttribute('data-openkeynav-label', labels[index]);
      });
      targetElements.forEach((element, index) => {
        if (!openKeyNav.isNonzeroSize(element)) return;
        openKeyNav.createOverlay(element, labels[index]);
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

    const validLabelChars = generateValidKeyChars(openKeyNav);
    let isValidLabelChar = Array.from(validLabelChars).some(validChar => {
      return validChar.toLowerCase() ==  e.key.toLowerCase();
    });

    let selectedTarget;

    if(isValidLabelChar){
      openKeyNav.config.typedLabel.value += e.key.toLowerCase();
      selectedTarget = document.querySelector(`[data-openkeynav-label="${openKeyNav.config.typedLabel.value}"]:not(.openKeyNav-label)`);
    }
    else{ // tab-based moving
      if(e.key === "Tab"){
        const queryString = '.openKeyNav-label:not(.openKeyNav-label-selected)';

        selectedTarget = cycleThroughMoveTargets(e);
      }
    }

    if (!selectedTarget) {
      // no selected target. filter remaining overlays and exit.
      filterRemainingOverlays(openKeyNav, e);
      return false;
    }

    if (!openKeyNav.config.modesConfig.move.selectedMoveable) {
      // new selected target.
      // setting selectedTarget as selectedMoveable
      console.log(`Selected element to move:`, selectedTarget);
      showMoveableToOverlays(selectedTarget);
      beginDrag(openKeyNav);
      return true;
    }

    // moving selectedMoveable to target
    moveSelectedMoveableToTarget(openKeyNav, selectedTarget)

    return true;
}

const handleMenuMode = (e) => {
    return true;
}

const moveSelectedMoveableToTarget = (openKeyNav, selectedTarget) => {
  
    // const modifier = true; // for whether move is sticky or not (sticky mode?)
    console.log(`Selected move target:`, selectedTarget);
    openKeyNav.config.modesConfig.move.selectedDropZone = selectedTarget;
    let callback = openKeyNav.config.modesConfig.move.config[openKeyNav.config.modesConfig.move.selectedConfig].callback;
    if (!callback) {
      //   console.error("No callback function has been set to execute this move operation");
      simulateDragAndDrop(openKeyNav, openKeyNav.config.modesConfig.move.selectedMoveable, openKeyNav.config.modesConfig.move.selectedDropZone);      
    } else {
      openKeyNav.config.modesConfig.move.config[openKeyNav.config.modesConfig.move.selectedConfig].callback(
        openKeyNav.config.modesConfig.move.selectedMoveable,
        openKeyNav.config.modesConfig.move.selectedDropZone
      );
    }
    if(!openKeyNav.config.modesConfig.move.modifier){
      openKeyNav.removeOverlays(true);
      openKeyNav.clearMoveAttributes();
    }
    return true;
}

const addKeydownEventListenerToIframe = (openKeyNav, iframe) => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const potentialTarget = iframeDoc.querySelector(`[data-openkeynav-label="${openKeyNav.config.typedLabel.value}"]`);
      if (potentialTarget) {
        // target = potentialTarget; TODO: check if this was important. Target is undefined so commenting out.

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

  