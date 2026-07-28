"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildStructuralModel = void 0;
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var ELEMENT_NODE = 1;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;
var LANDMARK_ROLES = new Set(['banner', 'complementary', 'contentinfo', 'form', 'main', 'navigation', 'region', 'search']);
var COMPOSITE_ROLES = new Set(['combobox', 'grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'toolbar', 'tree', 'treegrid']);
var SUPPRESSED_ROLES = new Set(['none', 'presentation']);
var GENERATED_SELECTOR = ['[data-openkeynav-ui]', '.openKeyNav-label', '.openKeyNav-toolBar', '.openKeyNav-mouseover-tooltip', '.openKeyNav-structural-status', '#okn-notification-container', '#okn-audit-panel'].join(',');
var boundaryIdentity = new WeakMap();
var nextBoundaryIdentity = 1;
var isElement = function isElement(node) {
  return Boolean(node && node.nodeType === ELEMENT_NODE);
};
var isDocument = function isDocument(node) {
  return Boolean(node && node.nodeType === DOCUMENT_NODE);
};
var isShadowRoot = function isShadowRoot(node) {
  return Boolean(node && node.nodeType === DOCUMENT_FRAGMENT_NODE && node.host && isElement(node.host));
};
var composedParent = function composedParent(node) {
  if (!node) return null;
  if (node.assignedSlot) return node.assignedSlot;
  if (isShadowRoot(node)) return node.host;
  return node.parentNode || null;
};
var isComposedWithin = function isComposedWithin(boundary, node) {
  var current = node;
  while (current) {
    if (current === boundary) return true;
    current = composedParent(current);
  }
  return false;
};
var isGeneratedUI = function isGeneratedUI(element) {
  var current = element;
  while (current) {
    if (isElement(current) && current.matches(GENERATED_SELECTOR)) return true;
    current = composedParent(current);
  }
  return false;
};
var isSemanticallyHidden = function isSemanticallyHidden(element, root) {
  var current = element;
  while (current) {
    if (isElement(current) && current.getAttribute('aria-hidden') === 'true') {
      return true;
    }
    if (current === root) break;
    current = composedParent(current);
  }
  return false;
};
var isOperativeSemanticElement = function isOperativeSemanticElement(element, root) {
  var current = element;
  while (current) {
    if (isElement(current)) {
      var _current$ownerDocumen, _view$getComputedStyl;
      if (current.hidden || current.hasAttribute('inert') || current.tagName.toLowerCase() === 'dialog' && !current.hasAttribute('open')) {
        return false;
      }
      if (current.tagName.toLowerCase() === 'details' && !current.hasAttribute('open')) {
        var summary = Array.from(current.children).find(function (child) {
          return child.tagName.toLowerCase() === 'summary';
        });
        if (!summary || !isComposedWithin(summary, element)) return false;
      }
      if (current.hasAttribute('popover')) {
        try {
          if (!current.matches(':popover-open')) return false;
        } catch (error) {
          // Browsers without the popover pseudo-class expose no reliable
          // automatic state here; target discovery remains authoritative.
        }
      }
      var view = (_current$ownerDocumen = current.ownerDocument) === null || _current$ownerDocumen === void 0 ? void 0 : _current$ownerDocumen.defaultView;
      var style = view === null || view === void 0 || (_view$getComputedStyl = view.getComputedStyle) === null || _view$getComputedStyl === void 0 ? void 0 : _view$getComputedStyl.call(view, current);
      if ((style === null || style === void 0 ? void 0 : style.display) === 'none' || (style === null || style === void 0 ? void 0 : style.visibility) === 'hidden' || (style === null || style === void 0 ? void 0 : style.visibility) === 'collapse') {
        return false;
      }
    }
    if (current === root) break;
    current = composedParent(current);
  }
  return true;
};
var stableBoundaryId = function stableBoundaryId(boundary) {
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'context';
  if (!boundaryIdentity.has(boundary)) {
    boundaryIdentity.set(boundary, nextBoundaryIdentity++);
  }
  return "".concat(prefix, "-").concat(boundaryIdentity.get(boundary));
};
var composedChildren = function composedChildren(node) {
  if (isDocument(node)) {
    return node.documentElement ? [node.documentElement] : [];
  }
  if (isElement(node) && node.shadowRoot) {
    return Array.from(node.shadowRoot.childNodes);
  }
  if (isElement(node) && node.tagName.toLowerCase() === 'slot' && typeof node.assignedNodes === 'function') {
    var assigned = node.assignedNodes({
      flatten: true
    });
    if (assigned.length) return assigned;
  }
  return Array.from((node === null || node === void 0 ? void 0 : node.childNodes) || []);
};
var composedElements = function composedElements(root) {
  var elements = [];
  var seen = new Set();
  var _visit = function visit(node) {
    if (!node || seen.has(node)) return;
    seen.add(node);
    if (isElement(node)) {
      if (isGeneratedUI(node)) return;
      elements.push(node);
    }
    composedChildren(node).forEach(_visit);
  };
  _visit(root);
  return elements;
};
var queryRootById = function queryRootById(element, id) {
  var _element$getRootNode, _root$getElementById, _element$ownerDocumen;
  var root = (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
  return (root === null || root === void 0 || (_root$getElementById = root.getElementById) === null || _root$getElementById === void 0 ? void 0 : _root$getElementById.call(root, id)) || ((_element$ownerDocumen = element.ownerDocument) === null || _element$ownerDocumen === void 0 ? void 0 : _element$ownerDocumen.getElementById(id));
};
var labelledByText = function labelledByText(element) {
  var ids = (element.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
  return ids.map(function (id) {
    return queryRootById(element, id);
  }).filter(function (label) {
    return label && !isSemanticallyHidden(label, element.getRootNode());
  }).map(function (label) {
    return label.textContent.replace(/\s+/g, ' ').trim();
  }).filter(Boolean).join(' ');
};
var explicitAccessibleName = function explicitAccessibleName(element) {
  return labelledByText(element) || (element.getAttribute('aria-label') || '').trim();
};
var headingRank = function headingRank(element) {
  if (!isElement(element)) return null;
  var role = (element.getAttribute('role') || '').trim().toLowerCase();
  if (SUPPRESSED_ROLES.has(role)) return null;
  var match = /^h([1-6])$/i.exec(element.tagName);
  if (match) return !role || role === 'heading' ? Number(match[1]) : null;
  if (role !== 'heading') {
    return null;
  }
  var level = Number(element.getAttribute('aria-level'));
  return Number.isInteger(level) && level > 0 ? level : null;
};
var contextTypeForElement = function contextTypeForElement(element) {
  var role = (element.getAttribute('role') || '').trim().toLowerCase();
  if (SUPPRESSED_ROLES.has(role)) return null;
  if (role) {
    if (LANDMARK_ROLES.has(role)) {
      if (role === 'region' && !explicitAccessibleName(element)) return null;
      return role;
    }
    if (role === 'list') return 'list';
    if (COMPOSITE_ROLES.has(role)) return 'widget';
  }
  var tagName = element.tagName.toLowerCase();
  switch (tagName) {
    case 'main':
      return 'main';
    case 'nav':
      return 'navigation';
    case 'aside':
      return 'complementary';
    case 'header':
      {
        var ancestor = composedParent(element);
        while (ancestor && isElement(ancestor)) {
          if (['article', 'aside', 'main', 'nav', 'section'].includes(ancestor.tagName.toLowerCase())) {
            return null;
          }
          ancestor = composedParent(ancestor);
        }
        return 'banner';
      }
    case 'footer':
      {
        var _ancestor = composedParent(element);
        while (_ancestor && isElement(_ancestor)) {
          if (['article', 'aside', 'main', 'nav', 'section'].includes(_ancestor.tagName.toLowerCase())) {
            return null;
          }
          _ancestor = composedParent(_ancestor);
        }
        return 'contentinfo';
      }
    case 'section':
      return 'section';
    case 'article':
      return 'article';
    case 'form':
      return role === 'search' ? 'search' : 'form';
    case 'search':
      return 'search';
    case 'fieldset':
      return 'fieldset';
    case 'ol':
    case 'ul':
      return 'list';
    default:
      return null;
  }
};
var titleCase = function titleCase(value) {
  return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, function (character) {
    return character.toUpperCase();
  });
};
var firstLegendText = function firstLegendText(element) {
  if (element.tagName.toLowerCase() !== 'fieldset') return '';
  var legend = Array.from(element.children).find(function (child) {
    return child.tagName.toLowerCase() === 'legend';
  });
  return (legend === null || legend === void 0 ? void 0 : legend.textContent.replace(/\s+/g, ' ').trim()) || '';
};
var contextFallbackName = function contextFallbackName(type) {
  var names = {
    banner: 'Header',
    complementary: 'Complementary',
    contentinfo: 'Footer',
    fieldset: 'Fieldset',
    form: 'Form',
    list: 'List',
    main: 'Main',
    navigation: 'Navigation',
    region: 'Region',
    search: 'Search',
    section: 'Section',
    article: 'Article',
    widget: 'Widget'
  };
  return names[type] || titleCase(type || 'Context');
};
var contextNameForElement = function contextNameForElement(element, type) {
  var associatedHeading = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  return firstLegendText(element) || explicitAccessibleName(element) || (associatedHeading === null || associatedHeading === void 0 ? void 0 : associatedHeading.textContent.replace(/\s+/g, ' ').trim()) || contextFallbackName(type);
};
var makeContext = function makeContext(_ref) {
  var id = _ref.id,
    name = _ref.name,
    type = _ref.type,
    source = _ref.source,
    _ref$boundary = _ref.boundary,
    boundary = _ref$boundary === void 0 ? null : _ref$boundary,
    _ref$order = _ref.order,
    order = _ref$order === void 0 ? 0 : _ref$order,
    _ref$memberTargets = _ref.memberTargets,
    memberTargets = _ref$memberTargets === void 0 ? [] : _ref$memberTargets,
    _ref$parentHint = _ref.parentHint,
    parentHint = _ref$parentHint === void 0 ? null : _ref$parentHint,
    _ref$required = _ref.required,
    required = _ref$required === void 0 ? false : _ref$required,
    _ref$rangeStart = _ref.rangeStart,
    rangeStart = _ref$rangeStart === void 0 ? null : _ref$rangeStart,
    _ref$rangeEnd = _ref.rangeEnd,
    rangeEnd = _ref$rangeEnd === void 0 ? null : _ref$rangeEnd,
    _ref$containerContext = _ref.containerContext,
    containerContext = _ref$containerContext === void 0 ? null : _ref$containerContext,
    _ref$visualElements = _ref.visualElements,
    visualElements = _ref$visualElements === void 0 ? [] : _ref$visualElements,
    _ref$explicitParentId = _ref.explicitParentId,
    explicitParentId = _ref$explicitParentId === void 0 ? null : _ref$explicitParentId,
    _ref$headingLevel = _ref.headingLevel,
    headingLevel = _ref$headingLevel === void 0 ? null : _ref$headingLevel;
  return {
    id: id,
    name: name,
    type: type,
    source: source,
    boundary: boundary,
    order: order,
    memberTargets: Array.from(memberTargets),
    memberSet: new Set(memberTargets),
    parent: parentHint,
    children: [],
    directTargets: [],
    targets: [],
    required: required,
    rangeStart: rangeStart,
    rangeEnd: rangeEnd,
    containerContext: containerContext,
    visualElements: Array.from(visualElements),
    explicitParentId: explicitParentId,
    headingLevel: headingLevel
  };
};
var nearestContextBoundary = function nearestContextBoundary(element, boundaryContexts, stopRoot) {
  var current = element;
  while (current) {
    if (boundaryContexts.has(current)) return boundaryContexts.get(current);
    if (current === stopRoot) break;
    current = composedParent(current);
  }
  return null;
};
var nearestAncestorContext = function nearestAncestorContext(boundary, boundaryContexts, rootContext) {
  var current = composedParent(boundary);
  while (current) {
    if (boundaryContexts.has(current)) return boundaryContexts.get(current);
    current = composedParent(current);
  }
  return rootContext;
};
var resolveContributionValue = function resolveContributionValue(value, details) {
  return typeof value === 'function' ? value(details) : value;
};
var resolveBoundary = function resolveBoundary(descriptor, root, details) {
  var _descriptor$boundary, _root$querySelector;
  var candidate = resolveContributionValue((_descriptor$boundary = descriptor.boundary) !== null && _descriptor$boundary !== void 0 ? _descriptor$boundary : descriptor.element, details);
  if (typeof candidate === 'string') return ((_root$querySelector = root.querySelector) === null || _root$querySelector === void 0 ? void 0 : _root$querySelector.call(root, candidate)) || null;
  return isElement(candidate) || isShadowRoot(candidate) || isDocument(candidate) ? candidate : null;
};
var resolveMembers = function resolveMembers(descriptor, boundary, root, targets, details) {
  var _descriptor$targets;
  var configured = resolveContributionValue((_descriptor$targets = descriptor.targets) !== null && _descriptor$targets !== void 0 ? _descriptor$targets : descriptor.members, details);
  if (typeof configured === 'string') {
    var _root$querySelectorAl;
    configured = Array.from(((_root$querySelectorAl = root.querySelectorAll) === null || _root$querySelectorAl === void 0 ? void 0 : _root$querySelectorAl.call(root, configured)) || []);
  }
  if (configured) {
    var allowed = new Set(targets);
    return Array.from(configured).filter(function (target) {
      return allowed.has(target);
    }).filter(function (target, index, values) {
      return values.indexOf(target) === index;
    });
  }
  if (boundary) {
    return targets.filter(function (target) {
      return isComposedWithin(boundary, target);
    });
  }
  return [];
};
var setsOverlap = function setsOverlap(left, right) {
  var _iterator = _createForOfIteratorHelper(left),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var value = _step.value;
      if (right.has(value)) return true;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return false;
};
var setsEqual = function setsEqual(left, right) {
  return left.size === right.size && isSubset(left, right);
};
var isSubset = function isSubset(candidate, container) {
  var _iterator2 = _createForOfIteratorHelper(candidate),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var value = _step2.value;
      if (!container.has(value)) return false;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return true;
};
var contextDepth = function contextDepth(context) {
  var depth = 0;
  var current = context;
  var seen = new Set();
  while ((_current = current) !== null && _current !== void 0 && _current.parent && !seen.has(current)) {
    var _current;
    seen.add(current);
    depth += 1;
    current = current.parent;
  }
  return depth;
};
var isContextAncestor = function isContextAncestor(ancestor, context) {
  var current = context;
  var seen = new Set();
  while (current && !seen.has(current)) {
    if (current === ancestor) return true;
    seen.add(current);
    current = current.parent;
  }
  return false;
};
var normalizeTypedContexts = function normalizeTypedContexts(descriptors, details, targets) {
  var targetSet = new Set(targets);
  var contexts = [];
  Array.from(descriptors || []).forEach(function (descriptor, registrationOrder) {
    var _descriptor$targets2;
    if (!descriptor || descriptor.id === null || typeof descriptor.id === 'undefined') {
      return;
    }
    if (typeof descriptor.isValid === 'function' && !descriptor.isValid(details)) {
      return;
    }
    var resolvedTargets = resolveContributionValue((_descriptor$targets2 = descriptor.targets) !== null && _descriptor$targets2 !== void 0 ? _descriptor$targets2 : descriptor.resolveTargets, details);
    var seen = new Set();
    var liveTargets = Array.from(resolvedTargets || []).filter(function (target) {
      if (seen.has(target) || !targetSet.has(target) || !target.isConnected) {
        return false;
      }
      seen.add(target);
      return true;
    });
    if (!liveTargets.length) return;
    contexts.push({
      id: String(descriptor.id),
      name: descriptor.name || descriptor.type || 'Peer context',
      type: descriptor.type || 'application',
      provenance: descriptor.provenance || 'application configuration',
      priority: Number.isFinite(Number(descriptor.priority)) ? Number(descriptor.priority) : registrationOrder,
      registrationOrder: registrationOrder,
      targets: liveTargets
    });
  });
  contexts.sort(function (left, right) {
    return left.priority - right.priority || left.registrationOrder - right.registrationOrder;
  });
  return contexts;
};

/**
 * Builds a deterministic structural tree over one ordered target inventory.
 * Contexts are routing metadata; targets are always the original Element
 * identities supplied by the discovery boundary.
 */
var buildStructuralModel = exports.buildStructuralModel = function buildStructuralModel() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    root = _ref2.root,
    _ref2$targets = _ref2.targets,
    targets = _ref2$targets === void 0 ? [] : _ref2$targets,
    _ref2$structuralConte = _ref2.structuralContexts,
    structuralContexts = _ref2$structuralConte === void 0 ? [] : _ref2$structuralConte,
    _ref2$typedContexts = _ref2.typedContexts,
    typedContexts = _ref2$typedContexts === void 0 ? [] : _ref2$typedContexts,
    _ref2$previousModel = _ref2.previousModel,
    previousModel = _ref2$previousModel === void 0 ? null : _ref2$previousModel;
  if (!root || !isDocument(root) && !isElement(root) && !isShadowRoot(root)) {
    throw new TypeError('buildStructuralModel requires an Element, Document, or ShadowRoot root.');
  }
  var liveTargets = Array.from(targets).filter(function (target) {
    return (target === null || target === void 0 ? void 0 : target.isConnected) && isComposedWithin(root, target);
  }).filter(function (target, index, values) {
    return values.indexOf(target) === index;
  });
  var elements = composedElements(root);
  var orderByElement = new Map(elements.map(function (element, index) {
    return [element, index];
  }));
  var targetOrder = function targetOrder(target) {
    return orderByElement.has(target) ? orderByElement.get(target) : Number.MAX_SAFE_INTEGER;
  };
  var rootName = isDocument(root) ? 'Document' : isElement(root) ? contextNameForElement(root, contextTypeForElement(root) || 'region') : 'Shadow root';
  var rootContext = makeContext({
    id: stableBoundaryId(root, 'root'),
    name: rootName,
    type: 'root',
    source: 'root',
    boundary: root,
    memberTargets: liveTargets,
    order: -1,
    required: true
  });
  var boundaryContexts = new Map();
  var automaticContexts = [];

  // Identify explicit semantic boundaries first so associated headings and
  // structural parents can be resolved deterministically.
  elements.forEach(function (element) {
    // An Element supplied as the active root is already represented by the
    // root context. Re-inferring it would create two contexts for one boundary.
    if (element === root) return;
    if (isSemanticallyHidden(element, root)) return;
    var type = contextTypeForElement(element);
    if (!type) return;
    var memberTargets = liveTargets.filter(function (target) {
      return isComposedWithin(element, target);
    });
    if (!memberTargets.length) return;
    var context = makeContext({
      id: stableBoundaryId(element, 'context'),
      name: '',
      type: type,
      source: 'semantic',
      boundary: element,
      memberTargets: memberTargets,
      order: orderByElement.get(element)
    });
    boundaryContexts.set(element, context);
    automaticContexts.push(context);
  });
  var headings = elements.filter(function (element) {
    return headingRank(element) !== null && !isSemanticallyHidden(element, root) && isOperativeSemanticElement(element, root);
  });
  automaticContexts.forEach(function (context) {
    var directHeadings = headings.filter(function (heading) {
      return isComposedWithin(context.boundary, heading) && nearestContextBoundary(composedParent(heading), boundaryContexts, root) === context;
    });
    var labelledHeadingIds = new Set((context.boundary.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean));
    var explicitlyAssociated = directHeadings.find(function (heading) {
      return heading.id && labelledHeadingIds.has(heading.id);
    });
    var leadingHeading = directHeadings.find(function (heading) {
      var headingOrder = orderByElement.get(heading);
      return !context.memberTargets.some(function (target) {
        return targetOrder(target) < headingOrder;
      });
    });
    var ownHeading = explicitlyAssociated || leadingHeading || null;
    context.associatedHeading = ownHeading || null;
    context.headingLevel = ownHeading ? headingRank(ownHeading) : null;
    context.name = contextNameForElement(context.boundary, context.type, context.associatedHeading);
  });
  var allContexts = [rootContext].concat(automaticContexts);
  var details = {
    root: root,
    targets: liveTargets.slice(),
    previousModel: previousModel
  };

  // Application contexts merge with the same DOM boundary where possible;
  // otherwise they contribute an explicit ordered membership boundary.
  Array.from(structuralContexts || []).forEach(function (descriptor, index) {
    if (!descriptor || descriptor.id === null || typeof descriptor.id === 'undefined') {
      return;
    }
    if (typeof descriptor.isValid === 'function' && !descriptor.isValid(details)) {
      return;
    }
    var boundary = resolveBoundary(descriptor, root, details);
    var memberTargets = resolveMembers(descriptor, boundary, root, liveTargets, details);
    if (!memberTargets.length) return;
    var existing = boundary && boundaryContexts.get(boundary);
    var order = Number.isFinite(Number(descriptor.order)) ? Number(descriptor.order) : boundary && orderByElement.has(boundary) ? orderByElement.get(boundary) : Math.min.apply(Math, _toConsumableArray(memberTargets.map(targetOrder)));
    if (!Number.isFinite(order)) {
      throw new TypeError("Structural context \"".concat(descriptor.id, "\" requires a deterministic order."));
    }
    if (existing) {
      existing.id = String(descriptor.id);
      existing.name = descriptor.name || existing.name;
      existing.type = descriptor.type || existing.type;
      existing.source = 'application';
      existing.required = Boolean(descriptor.required || descriptor.preserve || descriptor.selectable);
      existing.memberTargets = memberTargets;
      existing.memberSet = new Set(memberTargets);
      existing.explicitParentId = descriptor.parentId || null;
      existing.order = order;
      var _configuredHeadingLevel = Number(descriptor.headingLevel);
      if (Number.isInteger(_configuredHeadingLevel) && _configuredHeadingLevel > 0) {
        existing.headingLevel = _configuredHeadingLevel;
      }
      return;
    }
    var configuredHeadingLevel = Number(descriptor.headingLevel);
    var applicationHeadingLevel = Number.isInteger(configuredHeadingLevel) && configuredHeadingLevel > 0 ? configuredHeadingLevel : headingRank(boundary);
    var context = makeContext({
      id: String(descriptor.id),
      name: descriptor.name || descriptor.type || 'Application context',
      type: descriptor.type || 'application',
      source: 'application',
      boundary: boundary,
      memberTargets: memberTargets,
      order: order + index / 100000,
      required: Boolean(descriptor.required || descriptor.preserve || descriptor.selectable),
      explicitParentId: descriptor.parentId || null,
      headingLevel: applicationHeadingLevel
    });
    if (boundary) boundaryContexts.set(boundary, context);
    allContexts.push(context);
  });
  var contextByIdBeforeRanges = new Map(allContexts.map(function (context) {
    return [context.id, context];
  }));

  // Establish the ordinary explicit-container ancestry.
  allContexts.slice(1).forEach(function (context) {
    if (context.explicitParentId) {
      context.parent = contextByIdBeforeRanges.get(String(context.explicitParentId)) || rootContext;
    } else if (context.boundary) {
      context.parent = nearestAncestorContext(context.boundary, boundaryContexts, rootContext);
    } else {
      var containers = allContexts.filter(function (candidate) {
        return candidate !== context;
      }).filter(function (candidate) {
        return isSubset(context.memberSet, candidate.memberSet);
      }).sort(function (left, right) {
        return left.memberSet.size - right.memberSet.size || right.order - left.order;
      });
      context.parent = containers[0] || rootContext;
    }
    if (context.parent === context) context.parent = rootContext;
  });

  // Heading contexts are ordered ranges within the nearest explicit semantic
  // container. Native section headings associated with that same boundary are
  // deliberately merged into the explicit context and skipped here.
  var containerContexts = [rootContext].concat(_toConsumableArray(allContexts.slice(1).filter(function (context) {
    return context.boundary;
  })));
  var headingContexts = [];
  containerContexts.forEach(function (container) {
    var boundary = container.boundary;
    var containerHeadings = headings.filter(function (heading) {
      if (heading === container.associatedHeading) return false;
      if (!isComposedWithin(boundary, heading)) return false;
      var nearest = nearestContextBoundary(composedParent(heading), boundaryContexts, root);
      return (nearest || rootContext) === container;
    });
    if (!containerHeadings.length) return;
    var scopeOrders = elements.filter(function (element) {
      return isComposedWithin(boundary, element);
    }).map(function (element) {
      return orderByElement.get(element);
    });
    var scopeEnd = scopeOrders.length ? Math.max.apply(Math, _toConsumableArray(scopeOrders)) + 1 : elements.length + 1;
    var stack = [];
    containerHeadings.forEach(function (heading) {
      var level = headingRank(heading);
      var start = orderByElement.get(heading);
      var _loop = function _loop() {
        var closing = stack.pop();
        closing.context.rangeEnd = start;
        closing.context.memberTargets = liveTargets.filter(function (target) {
          return targetOrder(target) >= closing.context.rangeStart && targetOrder(target) < closing.context.rangeEnd && container.memberSet.has(target);
        });
        closing.context.memberSet = new Set(closing.context.memberTargets);
      };
      while (stack.length && stack[stack.length - 1].level >= level) {
        _loop();
      }
      var context = makeContext({
        id: stableBoundaryId(heading, 'heading'),
        name: heading.textContent.replace(/\s+/g, ' ').trim() || "Heading level ".concat(level),
        type: 'heading',
        source: 'heading',
        boundary: heading,
        order: start,
        memberTargets: [],
        parentHint: stack.length ? stack[stack.length - 1].context : container,
        rangeStart: start,
        rangeEnd: scopeEnd,
        containerContext: container,
        headingLevel: level
      });
      headingContexts.push(context);
      stack.push({
        level: level,
        context: context
      });
    });
    var _loop2 = function _loop2() {
      var closing = stack.pop();
      closing.context.rangeEnd = scopeEnd;
      closing.context.memberTargets = liveTargets.filter(function (target) {
        return targetOrder(target) >= closing.context.rangeStart && targetOrder(target) < closing.context.rangeEnd && container.memberSet.has(target);
      });
      closing.context.memberSet = new Set(closing.context.memberTargets);
    };
    while (stack.length) {
      _loop2();
    }
  });

  // Preserve the authored visual range for heading-only contexts. The
  // controller uses this to draw one context indicator around the heading and
  // all of its content without turning any of those elements into focus stops.
  headingContexts.forEach(function (context) {
    context.visualElements = elements.filter(function (element) {
      var order = orderByElement.get(element);
      return order >= context.rangeStart && order < context.rangeEnd && isComposedWithin(context.containerContext.boundary, element);
    });
  });
  headingContexts.filter(function (context) {
    return context.memberTargets.length;
  }).forEach(function (context) {
    return allContexts.push(context);
  });

  // Lists remain a single context when every nonempty item has exactly one
  // target. Richer lists receive item child contexts.
  var listItemContexts = [];
  automaticContexts.filter(function (context) {
    return context.type === 'list';
  }).forEach(function (listContext) {
    var listItems = elements.filter(function (element) {
      var tagName = element.tagName.toLowerCase();
      var role = (element.getAttribute('role') || '').toLowerCase();
      if (SUPPRESSED_ROLES.has(role)) return false;
      if (role !== 'listitem' && (tagName !== 'li' || Boolean(role))) {
        return false;
      }
      var current = composedParent(element);
      while (current) {
        var currentContext = boundaryContexts.get(current);
        if ((currentContext === null || currentContext === void 0 ? void 0 : currentContext.type) === 'list') return currentContext === listContext;
        current = composedParent(current);
      }
      return false;
    });
    var items = listItems.map(function (element, index) {
      return {
        element: element,
        index: index,
        targets: liveTargets.filter(function (target) {
          return isComposedWithin(element, target);
        })
      };
    }).filter(function (item) {
      return item.targets.length;
    });
    var hasRichItem = items.some(function (item) {
      if (item.targets.length > 1) return true;
      return allContexts.some(function (context) {
        return context !== listContext && context.boundary && isComposedWithin(item.element, context.boundary) && context.memberTargets.length;
      });
    });
    if (items.length < 2 || !hasRichItem) return;
    items.forEach(function (item) {
      var text = item.element.textContent.replace(/\s+/g, ' ').trim();
      listItemContexts.push(makeContext({
        id: stableBoundaryId(item.element, 'list-item'),
        name: text.slice(0, 60) || "Item ".concat(item.index + 1),
        type: 'listitem',
        source: 'list-item',
        boundary: item.element,
        order: orderByElement.get(item.element),
        memberTargets: item.targets,
        parentHint: listContext
      }));
    });
  });
  listItemContexts.forEach(function (context) {
    return allContexts.push(context);
  });

  // Put explicit child boundaries into the applicable heading range and rich
  // list-item context. These are range/containment parents, not focus stops.
  var rangeParents = [].concat(_toConsumableArray(headingContexts.filter(function (context) {
    return context.memberTargets.length;
  })), listItemContexts);
  allContexts.slice(1).forEach(function (context) {
    if (rangeParents.includes(context)) return;
    var candidates = rangeParents.filter(function (parent) {
      return parent !== context;
    }).filter(function (parent) {
      if (parent.source === 'heading') {
        var boundaryOrder = context.boundary ? orderByElement.get(context.boundary) : context.order;
        return boundaryOrder >= parent.rangeStart && boundaryOrder < parent.rangeEnd && isSubset(context.memberSet, parent.memberSet);
      }
      return context.boundary && isComposedWithin(parent.boundary, context.boundary) && isSubset(context.memberSet, parent.memberSet);
    }).sort(function (left, right) {
      return left.memberSet.size - right.memberSet.size || left.rangeEnd - left.rangeStart - (right.rangeEnd - right.rangeStart);
    });
    var selected = candidates[0];
    if (selected && selected !== context.parent && !isContextAncestor(context, selected)) {
      context.parent = selected;
    }
  });
  var usableContexts = [rootContext];
  var rejectedContexts = [];
  var orderedCandidates = allContexts.slice(1).filter(function (context) {
    return context.memberTargets.length;
  }).sort(function (left, right) {
    return Number(right.required) - Number(left.required) || Number(Boolean(right.boundary)) - Number(Boolean(left.boundary)) || left.order - right.order;
  });

  // Reject partial sibling overlap instead of forcing it into the structural
  // tree. Typed contexts are the supported representation for such relations.
  orderedCandidates.forEach(function (context) {
    if (!context.parent || context.parent === context) context.parent = rootContext;
    var siblings = usableContexts.filter(function (candidate) {
      return candidate.parent === context.parent;
    });
    var invalidOverlap = siblings.some(function (sibling) {
      return setsOverlap(context.memberSet, sibling.memberSet) && !isSubset(context.memberSet, sibling.memberSet) && !isSubset(sibling.memberSet, context.memberSet);
    });
    if (invalidOverlap) {
      rejectedContexts.push(context);
      return;
    }
    usableContexts.push(context);
  });
  usableContexts.forEach(function (context) {
    context.children = [];
    context.directTargets = [];
    context.targets = [];
  });
  usableContexts.slice(1).forEach(function (context) {
    if (!usableContexts.includes(context.parent)) context.parent = rootContext;
    context.parent.children.push(context);
  });
  usableContexts.forEach(function (context) {
    context.children.sort(function (left, right) {
      return left.order - right.order;
    });
  });

  // Collapse a redundant unary child when it represents exactly the same
  // target sequence as its parent. Required application contexts are retained.
  // Repeat bottom-up because collapsing one layer can expose another.
  var collapsedContext = true;
  while (collapsedContext) {
    collapsedContext = false;
    var bottomUp = usableContexts.slice(1).sort(function (left, right) {
      return contextDepth(right) - contextDepth(left);
    });
    var _iterator3 = _createForOfIteratorHelper(bottomUp),
      _step3;
    try {
      var _loop3 = function _loop3() {
          var _parent$children;
          var context = _step3.value;
          var parent = context.parent;
          if (context.required || context.headingLevel !== null || !parent || parent.children.length !== 1 || !setsEqual(context.memberSet, parent.memberSet)) {
            return 0; // continue
          }
          var childIndex = parent.children.indexOf(context);
          context.children.forEach(function (child) {
            child.parent = parent;
          });
          (_parent$children = parent.children).splice.apply(_parent$children, [childIndex, 1].concat(_toConsumableArray(context.children)));
          parent.children.sort(function (left, right) {
            return left.order - right.order;
          });
          usableContexts.splice(usableContexts.indexOf(context), 1);
          collapsedContext = true;
          return 1; // break
        },
        _ret;
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        _ret = _loop3();
        if (_ret === 0) continue;
        if (_ret === 1) break;
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }
  var _deepestContextForTarget = function deepestContextForTarget(context, target) {
    var children = context.children.filter(function (child) {
      return child.memberSet.has(target);
    });
    if (!children.length) return context;
    children.sort(function (left, right) {
      return contextDepth(right) - contextDepth(left) || left.memberSet.size - right.memberSet.size || left.order - right.order;
    });
    return _deepestContextForTarget(children[0], target);
  };
  var directContextByTarget = new Map();
  liveTargets.forEach(function (target) {
    var direct = _deepestContextForTarget(rootContext, target);
    directContextByTarget.set(target, direct);
    direct.directTargets.push(target);
  });
  usableContexts.forEach(function (context) {
    context.targets = liveTargets.filter(function (target) {
      return isContextAncestor(context, directContextByTarget.get(target));
    });
  });
  var contexts = new Map(usableContexts.map(function (context) {
    return [context.id, context];
  }));
  var normalizedTyped = normalizeTypedContexts(typedContexts, details, liveTargets);
  var typedContextMap = new Map(normalizedTyped.map(function (context) {
    return [context.id, context];
  }));
  var typedContextsByTarget = new Map();
  liveTargets.forEach(function (target) {
    typedContextsByTarget.set(target, normalizedTyped.filter(function (context) {
      return context.targets.includes(target);
    }));
  });
  return {
    root: root,
    targets: liveTargets,
    rootContext: rootContext,
    contexts: contexts,
    directContextByTarget: directContextByTarget,
    typedContexts: typedContextMap,
    typedContextsByTarget: typedContextsByTarget,
    rejectedContexts: rejectedContexts,
    getDirectContext: function getDirectContext(target) {
      return directContextByTarget.get(target) || null;
    },
    getTypedContexts: function getTypedContexts(target) {
      return typedContextsByTarget.get(target) || [];
    }
  };
};