"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showMoveableFromOverlays = exports.showClickableOverlays = exports.showAssignedKeylabels = exports.repositionAssignedKeylabels = exports.generateValidKeyChars = exports.generateLabels = exports.filterRemainingOverlays = exports.clearAssignedKeylabels = exports.KEYLABEL_SYMBOLS = void 0;
var _escape = require("./escape");
var _isTabbable = require("./isTabbable");
var _scrolling = require("./scrolling");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var KEYLABEL_SYMBOLS = exports.KEYLABEL_SYMBOLS = Object.freeze({
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
var ASSIGNED_MODIFIER_BY_SYMBOL = Object.freeze(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, KEYLABEL_SYMBOLS.alt, 'alt'), KEYLABEL_SYMBOLS.control, 'control'), KEYLABEL_SYMBOLS.meta, 'meta'), KEYLABEL_SYMBOLS.shift, 'shift'));
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
      var _ref2 = _slicedToArray(_ref, 2),
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
var clearAssignedKeylabels = exports.clearAssignedKeylabels = function clearAssignedKeylabels(openKeyNav, owner) {
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
var repositionAssignedKeylabels = exports.repositionAssignedKeylabels = function repositionAssignedKeylabels(openKeyNav, owner) {
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
var showAssignedKeylabels = exports.showAssignedKeylabels = function showAssignedKeylabels(openKeyNav, assignments) {
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
      overlay.replaceChildren.apply(overlay, _toConsumableArray(segmentElements));
      openKeyNav.updateOverlayPosition(target, overlay);
    } else if (Array.from(symbols).some(function (symbol) {
      return ASSIGNED_MODIFIER_BY_SYMBOL[symbol];
    })) {
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
var generateLabels = exports.generateLabels = function generateLabels(openKeyNav, count) {
  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var _ref6 = [array[j], array[i]];
      array[i] = _ref6[0];
      array[j] = _ref6[1];
    }
    return array;
  }
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
var showClickableOverlays = exports.showClickableOverlays = function showClickableOverlays(openKeyNav) {
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
var showMoveableFromOverlays = exports.showMoveableFromOverlays = function showMoveableFromOverlays(openKeyNav) {
  // alert("showMoveableFromOverlays()");
  // return;

  // Combine all unique 'from' classes from moveConfig to query the document
  var moveables = [];

  // direct selectors of from elements
  var fromElementSelectors = _toConsumableArray(new Set(openKeyNav.config.modesConfig.move.config.filter(function (config) {
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
  var fromContainerSelectors = _toConsumableArray(new Set(openKeyNav.config.modesConfig.move.config.filter(function (config) {
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
var filterRemainingOverlays = exports.filterRemainingOverlays = function filterRemainingOverlays(openKeyNav, e) {
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
var generateValidKeyChars = exports.generateValidKeyChars = function generateValidKeyChars(openKeyNav) {
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
  var mergedSet = new Set([].concat(_toConsumableArray(allElements), _toConsumableArray(openKeyNav.config.modesConfig.click.clickEventElements)));
  return Array.from(mergedSet);

  // return allElements;
};