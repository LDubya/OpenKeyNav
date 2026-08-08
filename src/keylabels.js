import { handleEscape } from "./escape";
import { isTabbable } from "./isTabbable";
import { disableScrolling } from "./scrolling";

export const KEYLABEL_SYMBOLS = Object.freeze({
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
  space: '⎵',
});

const assignedTargetByOverlay = new WeakMap();
const assignedTargetsByOwner = new WeakMap();
const assignedModifierFeedbackByOpenKeyNav = new WeakMap();
const ASSIGNED_KEYLABEL_TARGET_ATTRIBUTE =
  'data-openkeynav-keylabel-target-active';
const ASSIGNED_MODIFIER_BY_SYMBOL = Object.freeze({
  [KEYLABEL_SYMBOLS.alt]: 'alt',
  [KEYLABEL_SYMBOLS.control]: 'control',
  [KEYLABEL_SYMBOLS.meta]: 'meta',
  [KEYLABEL_SYMBOLS.shift]: 'shift',
});
const ASSIGNED_MODIFIER_EVENT_PROPERTIES = Object.freeze({
  alt: 'altKey',
  control: 'ctrlKey',
  meta: 'metaKey',
  shift: 'shiftKey',
});
const ASSIGNED_MODIFIER_BY_EVENT_KEY = Object.freeze({
  Alt: 'alt',
  Control: 'control',
  Meta: 'meta',
  Shift: 'shift',
});

const ownerDocument = openKeyNav => (
  openKeyNav?.statusService?.document ||
  (typeof document === 'undefined' ? null : document)
);

const assignedModifierSymbols = (openKeyNav, modifier = null) => {
  const documentObject = ownerDocument(openKeyNav);
  if (!documentObject?.querySelectorAll) return [];
  const symbols = Array.from(documentObject.querySelectorAll(
    '.openKeyNav-label[data-openkeynav-keylabel-owner] ' +
    '[data-openkeynav-keylabel-modifier]'
  ));
  return modifier
    ? symbols.filter(symbol => (
      symbol.dataset.openkeynavKeylabelModifier === modifier
    ))
    : symbols;
};

const updateAssignedModifierFeedback = (openKeyNav, modifier, pressed) => {
  const feedback = assignedModifierFeedbackByOpenKeyNav.get(openKeyNav);
  if (!feedback) return;
  if (pressed) {
    feedback.pressedModifiers.add(modifier);
  } else {
    feedback.pressedModifiers.delete(modifier);
  }
  assignedModifierSymbols(openKeyNav, modifier).forEach(symbol => {
    if (pressed) {
      symbol.dataset.openkeynavKeylabelPressed = 'true';
    } else {
      delete symbol.dataset.openkeynavKeylabelPressed;
    }
  });
};

const ensureAssignedModifierFeedback = openKeyNav => {
  const existing = assignedModifierFeedbackByOpenKeyNav.get(openKeyNav);
  if (existing) return existing;

  const documentObject = ownerDocument(openKeyNav);
  if (!documentObject?.addEventListener) {
    return { pressedModifiers: new Set() };
  }
  const view = documentObject.defaultView;
  const feedback = { pressedModifiers: new Set() };
  const updateFromEvent = (event, isKeyDown) => {
    Object.entries(ASSIGNED_MODIFIER_EVENT_PROPERTIES)
      .forEach(([modifier, property]) => {
        const isEventModifier = ASSIGNED_MODIFIER_BY_EVENT_KEY[event.key] ===
          modifier;
        updateAssignedModifierFeedback(
          openKeyNav,
          modifier,
          isEventModifier ? isKeyDown : Boolean(event[property])
        );
      });
  };
  const handleKeyDown = event => {
    updateFromEvent(event, true);
  };
  const handleKeyUp = event => {
    updateFromEvent(event, false);
  };
  const reset = () => Object.keys(ASSIGNED_MODIFIER_EVENT_PROPERTIES)
    .forEach(modifier => (
      updateAssignedModifierFeedback(openKeyNav, modifier, false)
    ));
  const handleVisibilityChange = () => {
    if (documentObject.visibilityState === 'hidden') reset();
  };
  Object.assign(feedback, {
    documentObject,
    view,
    handleKeyDown,
    handleKeyUp,
    handleVisibilityChange,
    reset,
  });
  assignedModifierFeedbackByOpenKeyNav.set(openKeyNav, feedback);
  documentObject.addEventListener('keydown', handleKeyDown, true);
  documentObject.addEventListener('keyup', handleKeyUp, true);
  documentObject.addEventListener(
    'visibilitychange',
    handleVisibilityChange,
    true
  );
  view?.addEventListener('blur', reset);
  return feedback;
};

const releaseAssignedModifierFeedback = openKeyNav => {
  if (assignedModifierSymbols(openKeyNav).length) return;
  const feedback = assignedModifierFeedbackByOpenKeyNav.get(openKeyNav);
  if (!feedback) return;
  feedback.documentObject.removeEventListener(
    'keydown',
    feedback.handleKeyDown,
    true
  );
  feedback.documentObject.removeEventListener(
    'keyup',
    feedback.handleKeyUp,
    true
  );
  feedback.documentObject.removeEventListener(
    'visibilitychange',
    feedback.handleVisibilityChange,
    true
  );
  feedback.view?.removeEventListener('blur', feedback.reset);
  assignedModifierFeedbackByOpenKeyNav.delete(openKeyNav);
};

const appendAssignedKeylabelSymbols = (element, symbols, feedback) => {
  Array.from(symbols).forEach(symbol => {
    const modifierName = ASSIGNED_MODIFIER_BY_SYMBOL[symbol];
    if (!modifierName) {
      element.append(symbol);
      return;
    }
    const modifier = element.ownerDocument.createElement('span');
    modifier.className = 'openKeyNav-keylabel-modifier';
    modifier.dataset.openkeynavKeylabelModifier = modifierName;
    if (feedback?.pressedModifiers.has(modifierName)) {
      modifier.dataset.openkeynavKeylabelPressed = 'true';
    }
    modifier.textContent = symbol;
    element.appendChild(modifier);
  });
};

const ownedAssignedKeylabels = (openKeyNav, owner) => {
  const documentObject = ownerDocument(openKeyNav);
  if (!documentObject?.querySelectorAll) return [];
  return Array.from(documentObject.querySelectorAll(
    '.openKeyNav-label[data-openkeynav-keylabel-owner]'
  )).filter(overlay => overlay.dataset.openkeynavKeylabelOwner === owner);
};

const releaseAssignedTargets = (openKeyNav, owner) => {
  const targetsByOwner = assignedTargetsByOwner.get(openKeyNav);
  const targets = targetsByOwner?.get(owner);
  if (!targets) return;

  targetsByOwner.delete(owner);
  targets.forEach(target => {
    const remainsAssigned = Array.from(targetsByOwner.values())
      .some(ownedTargets => ownedTargets.has(target));
    if (!remainsAssigned) {
      target.removeAttribute?.(ASSIGNED_KEYLABEL_TARGET_ATTRIBUTE);
    }
  });
  if (targetsByOwner.size === 0) assignedTargetsByOwner.delete(openKeyNav);
};

const markAssignedTarget = (openKeyNav, owner, target) => {
  let targetsByOwner = assignedTargetsByOwner.get(openKeyNav);
  if (!targetsByOwner) {
    targetsByOwner = new Map();
    assignedTargetsByOwner.set(openKeyNav, targetsByOwner);
  }
  let targets = targetsByOwner.get(owner);
  if (!targets) {
    targets = new Set();
    targetsByOwner.set(owner, targets);
  }
  targets.add(target);
  target.setAttribute?.(ASSIGNED_KEYLABEL_TARGET_ATTRIBUTE, '');
};

/**
 * Removes one caller's descriptive keylabels without disturbing Click or Move
 * Mode labels. Callers own only the assignment data; this module owns the
 * overlay lifecycle.
 */
export const clearAssignedKeylabels = (
  openKeyNav,
  owner,
  { preserveModifierFeedback = false } = {}
) => {
  ownedAssignedKeylabels(openKeyNav, owner).forEach(overlay => overlay.remove());
  releaseAssignedTargets(openKeyNav, owner);
  if (!preserveModifierFeedback) releaseAssignedModifierFeedback(openKeyNav);
};

/**
 * Repositions an existing caller-owned set through OpenKeyNav's established
 * overlay placement routine.
 */
export const repositionAssignedKeylabels = (openKeyNav, owner) => {
  ownedAssignedKeylabels(openKeyNav, owner).forEach(overlay => {
    const target = assignedTargetByOverlay.get(overlay);
    if (!target?.isConnected) {
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
export const showAssignedKeylabels = (
  openKeyNav,
  assignments,
  {
    owner,
    cssClass = null,
    focusedTarget = null,
  } = {}
) => {
  if (!owner) {
    throw new TypeError('Assigned keylabels require an owner.');
  }

  clearAssignedKeylabels(openKeyNav, owner, {
    preserveModifierFeedback: true,
  });
  const overlays = [];
  const assignmentsByTarget = new Map();
  Array.from(assignments || []).forEach(assignment => {
    const target = assignment?.target;
    const maxSymbols = Number.isInteger(assignment?.maxSymbols) &&
      assignment.maxSymbols > 0
      ? assignment.maxSymbols
      : 2;
    const symbols = Array.from(String(assignment?.symbols || ''))
      .slice(0, maxSymbols)
      .join('');
    if (!target?.isConnected || !symbols) return;

    const existing = assignmentsByTarget.get(target);
    if (!existing) {
      assignmentsByTarget.set(target, {
        target,
        symbols,
        maxSymbols,
        segments: [symbols],
        commands: assignment.command ? [String(assignment.command)] : [],
      });
      return;
    }

    const availableSymbols = existing.maxSymbols -
      Array.from(existing.symbols).length;
    if (Array.from(symbols).length > availableSymbols) return;
    existing.symbols += symbols;
    existing.segments.push(symbols);
    if (assignment.command) existing.commands.push(String(assignment.command));
  });

  const hasModifierSymbols = Array.from(assignmentsByTarget.values())
    .some(assignment => Array.from(assignment.symbols)
      .some(symbol => ASSIGNED_MODIFIER_BY_SYMBOL[symbol]));
  const modifierFeedback = hasModifierSymbols
    ? ensureAssignedModifierFeedback(openKeyNav)
    : null;

  assignmentsByTarget.forEach(({ target, symbols, segments, commands }) => {
    const overlay = openKeyNav.createOverlay(target, symbols, cssClass);
    overlay.dataset.openkeynavKeylabelOwner = owner;
    overlay.dataset.openkeynavKeylabelCommand = commands.join(' ');
    if (target.id) overlay.dataset.openkeynavKeylabelTarget = target.id;
    overlay.setAttribute('data-openkeynav-ui', `${owner}-keylabel`);
    overlay.setAttribute('aria-hidden', 'true');
    if (target === focusedTarget) {
      overlay.classList.add('openKeyNav-keylabel-focused');
      overlay.dataset.openkeynavKeylabelFocused = 'true';
    }
    if (segments.length > 1) {
      overlay.classList.add('openKeyNav-keylabel-alternatives');
      overlay.dataset.openkeynavKeylabelAlternatives = String(segments.length);
      const segmentElements = segments.map(segment => {
        const element = overlay.ownerDocument.createElement('span');
        element.className = 'openKeyNav-keylabel-alternative';
        appendAssignedKeylabelSymbols(element, segment, modifierFeedback);
        return element;
      });
      overlay.replaceChildren(...segmentElements);
      openKeyNav.updateOverlayPosition(target, overlay);
    } else if (Array.from(symbols)
      .some(symbol => ASSIGNED_MODIFIER_BY_SYMBOL[symbol])) {
      overlay.replaceChildren();
      appendAssignedKeylabelSymbols(overlay, symbols, modifierFeedback);
      openKeyNav.updateOverlayPosition(target, overlay);
    }
    assignedTargetByOverlay.set(overlay, target);
    markAssignedTarget(openKeyNav, owner, target);
    overlays.push(overlay);
  });
  if (!hasModifierSymbols) releaseAssignedModifierFeedback(openKeyNav);
  return overlays;
};

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
      // The user may dismiss Click Mode before this deferred discovery runs.
      if (!openKeyNav.config.modes.clicking.value) return;

      const allCandidates = getAllCandidateElements(openKeyNav, document);

      let clickables = allCandidates.filter(el => {
        return isTabbable(el, openKeyNav);
      });

      // Prefer the innermost target when nested candidates occupy the same area.
      clickables = clickables.filter(element => {
        const hasClickableDescendant = clickables.some(other => {
          if (other === element || !element.contains(other)) return false;

          const parentRect = element.getBoundingClientRect();
          const childRect = other.getBoundingClientRect();
          return (
            Math.abs(parentRect.top - childRect.top) < 2 &&
            Math.abs(parentRect.left - childRect.left) < 2 &&
            Math.abs(parentRect.right - childRect.right) < 2 &&
            Math.abs(parentRect.bottom - childRect.bottom) < 2
          );
        });
        return !hasClickableDescendant;
      });

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
