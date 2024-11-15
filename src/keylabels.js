import { handleEscape } from "./escape";
import { isTabbable } from "./isTabbable";
import { disableScrolling } from "./scrolling";

export const generateLabels = (openKeyNav, count) => {
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    let labels = [];
    const chars = generateValidKeyChars(openKeyNav);

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

export const showClickableOverlays = (openKeyNav) => {
  
    disableScrolling(openKeyNav);
    setTimeout(() => {
      let clickables = getAllCandidateElements(openKeyNav, document).filter(el => {
        return isTabbable(el, openKeyNav);
      });

      // console.log(clickables);

      const labels = generateLabels(openKeyNav, clickables.length);

      clickables.forEach((element, index) => {
        element.setAttribute('data-openkeynav-label', labels[index]);
      });
      clickables.forEach((element, index) => {
        openKeyNav.createOverlay(element, labels[index]);
      });
    }, 0); // Use timeout to ensure the operation completes
};

export const showMoveableFromOverlays = (openKeyNav) => {
    // alert("showMoveableFromOverlays()");
    // return;

    // Combine all unique 'from' classes from moveConfig to query the document
    let moveables = [];

    // direct selectors of from elements
    const fromElementSelectors = [
      ...new Set(openKeyNav.config.modesConfig.move.config.filter(config => config.fromElements).map(config => config.fromElements))
    ];
    if (!!fromElementSelectors.length) {
      document.querySelectorAll(fromElementSelectors.join(', ')).forEach(element => {
        const config = openKeyNav.config.modesConfig.move.config.find(c => element.matches(c.fromElements));
        if (config) {
          const configKey = openKeyNav.config.modesConfig.move.config.indexOf(config);
          if (openKeyNav.isNonzeroSize(element) && (!config.fromExclude || !element.matches(config.fromExclude))) {
            element.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
            moveables.push(element);
          }
        }
      });
    }

    // containers of from elements
    const fromContainerSelectors = [
      ...new Set(openKeyNav.config.modesConfig.move.config.filter(config => config.fromContainer).map(config => config.fromContainer))
    ];
    if (!!fromContainerSelectors.length) {
      const fromContainers = document.querySelectorAll(fromContainerSelectors.join(', '));
      // Collect all direct children of each fromContainer as moveable elements
      fromContainers.forEach(container => {
        const config = openKeyNav.config.modesConfig.move.config.find(c => container.matches(c.fromContainer));
        if (config) {
          const configKey = openKeyNav.config.modesConfig.move.config.indexOf(config);
          const children = Array.from(container.children);
          children.forEach(child => {
            if (openKeyNav.isNonzeroSize(child) && (!config.fromExclude || !child.matches(config.fromExclude))) {
              child.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
              moveables.push(child);
            }
          });
        }
      });
    }

    // Resolve elements using provided callbacks if available
    openKeyNav.config.modesConfig.move.config.forEach(config => {
      if (config.resolveFromElements) {
        const resolvedElements = config.resolveFromElements();
        resolvedElements.forEach(element => {
          const configKey = openKeyNav.config.modesConfig.move.config.indexOf(config);
          if (openKeyNav.isNonzeroSize(element) && (!config.fromExclude || !element.matches(config.fromExclude))) {
            element.setAttribute('data-openkeynav-moveconfig', configKey); // Store the moveConfig key
            moveables.push(element);
          }
        });
      }
    });

    // filter out moveables that would not be clickable
    moveables = moveables.filter(el => {
      return isTabbable(el, openKeyNav);
    });


    const labels = generateLabels(openKeyNav, moveables.length);

    moveables.forEach((element, index) => {
        element.setAttribute('data-openkeynav-label', labels[index]);
    });
    moveables.forEach((element, index) => {
      openKeyNav.createOverlay(element, labels[index]);
      element.setAttribute('data-openkeynav-draggable', 'true');
    });
};

export const filterRemainingOverlays = (openKeyNav, e) => {
    // Filter overlays, removing non-matching ones
    document.querySelectorAll('.openKeyNav-label').forEach(overlay => {
      const label = overlay.textContent;

      // If the current typedLabel no longer matches the beginning of this element's label, remove both the overlay and clean up the target element
      if (!label.startsWith(openKeyNav.config.typedLabel.value)) {
        const targetElement = document.querySelector(`[data-openkeynav-label="${label}"]`);
        targetElement && targetElement.removeAttribute('data-openkeynav-label'); // Clean up the target element's attribute
        overlay.remove(); // Remove the overlay
      }
    });

    if (document.querySelectorAll('.openKeyNav-label').length == 0) {
      // there are no overlays left. clean up and unblock.
      handleEscape(openKeyNav, e);
      return true;
    }
};

export const generateValidKeyChars = (openKeyNav) => {
    let chars = 'abcdefghijklmnopqrstuvwxyz';
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

const getAllCandidateElements = (openKeyNav, doc) => {
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
        const iframeElements = getAllCandidateElements(openKeyNav, iframeDoc);
        allElements = allElements.concat(Array.from(iframeElements)); // Add elements from each iframe
      } catch (error) {
        console.log('Access denied to iframe content:', error);
      }
    });

    // Merge with clickEventElements
    const mergedSet = new Set([...allElements, ...openKeyNav.config.modesConfig.click.clickEventElements]);
    return Array.from(mergedSet);

    // return allElements;
};