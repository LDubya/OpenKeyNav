export const simulateDragAndDrop = (openKeyNav, sourceElement, targetElement) => {
  
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

      if(!openKeyNav.config.modesConfig.move.modifier){
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

      if(!document.contains(openKeyNav.config.modesConfig.move.selectedMoveable)){
        let matchingElement = findMatchingElementByHTML(openKeyNav.config.modesConfig.move.selectedMoveableHTML);

        const selectedConfig = openKeyNav.config.modesConfig.move.config[openKeyNav.config.modesConfig.move.selectedConfig];
        const passesInclusionCriteria = matchingElement && matchingElement.matches(selectedConfig.fromElements) || matchingElement.matches(selectedConfig.fromContainer + ' > *');
        const passesExclusionCriteria = matchingElement && !matchingElement.matches(selectedConfig.fromExclude);

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
    }

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

export const endDrag = (openKeyNav, targetElement) => {
  
    const dataTransfer = new DataTransfer(); // Create a DataTransfer object to carry the drag data.

    let clientX = 0;
    let clientY = 0;
    let sourceElement = openKeyNav.config.modesConfig.move.selectedMoveable;

    if (typeof TouchEvent === 'undefined') {
    openKeyNav.setupTouchEvent();
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

export const beginDrag = (openKeyNav) => {
    const sourceElement = openKeyNav.config.modesConfig.move.selectedMoveable;
    const rectSource = sourceElement.getBoundingClientRect();
    const dataTransfer = new DataTransfer(); // Create a DataTransfer object to carry the drag data.

    if (typeof TouchEvent === 'undefined') {
      openKeyNav.setupTouchEvent();
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