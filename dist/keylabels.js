"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showMoveableFromOverlays = exports.showClickableOverlays = exports.generateValidKeyChars = exports.generateLabels = exports.filterRemainingOverlays = void 0;
var _escape = require("./escape");
var _isTabbable = require("./isTabbable");
var _scrolling = require("./scrolling");
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var generateLabels = exports.generateLabels = function generateLabels(openKeyNav, count) {
  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var _ref = [array[j], array[i]];
      array[i] = _ref[0];
      array[j] = _ref[1];
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
    var clickables = _getAllCandidateElements(openKeyNav, document).filter(function (el) {
      return (0, _isTabbable.isTabbable)(el, openKeyNav);
    });

    // console.log(clickables);

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