import {
  getExplicitAccessibleName,
  normalizeText,
} from './accessibilityName.js';
import {
  collectComposedElements,
  getComposedParent,
  hasAriaHiddenAncestor,
  isComposedWithin,
  isDocument,
  isElement,
  isOpenKeyNavGeneratedUI,
  isShadowRoot,
} from './domUtilities.js';

const LANDMARK_ROLES = new Set([
  'banner',
  'complementary',
  'contentinfo',
  'form',
  'main',
  'navigation',
  'region',
  'search',
]);
const COMPOSITE_ROLES = new Set([
  'combobox',
  'grid',
  'listbox',
  'menu',
  'menubar',
  'radiogroup',
  'tablist',
  'toolbar',
  'tree',
  'treegrid',
]);
const SUPPRESSED_ROLES = new Set(['none', 'presentation']);
const boundaryIdentity = new WeakMap();
let nextBoundaryIdentity = 1;

const isSemanticallyHidden = (element, root) => (
  hasAriaHiddenAncestor(element, root)
);

const isOperativeSemanticElement = (element, root) => {
  let current = element;
  while (current) {
    if (isElement(current)) {
      if (
        current.hidden ||
        current.hasAttribute('inert') ||
        (
          current.tagName.toLowerCase() === 'dialog' &&
          !current.hasAttribute('open')
        )
      ) {
        return false;
      }

      if (
        current.tagName.toLowerCase() === 'details' &&
        !current.hasAttribute('open')
      ) {
        const summary = Array.from(current.children)
          .find(child => child.tagName.toLowerCase() === 'summary');
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

      const view = current.ownerDocument?.defaultView;
      const style = view?.getComputedStyle?.(current);
      if (
        style?.display === 'none' ||
        style?.visibility === 'hidden' ||
        style?.visibility === 'collapse'
      ) {
        return false;
      }
    }
    if (current === root) break;
    current = getComposedParent(current);
  }
  return true;
};

const stableBoundaryId = (boundary, prefix = 'context') => {
  if (!boundaryIdentity.has(boundary)) {
    boundaryIdentity.set(boundary, nextBoundaryIdentity++);
  }
  return `${prefix}-${boundaryIdentity.get(boundary)}`;
};

const headingRank = element => {
  if (!isElement(element)) return null;
  const role = (element.getAttribute('role') || '').trim().toLowerCase();
  if (SUPPRESSED_ROLES.has(role)) return null;
  const match = /^h([1-6])$/i.exec(element.tagName);
  if (match) return !role || role === 'heading' ? Number(match[1]) : null;
  if (role !== 'heading') {
    return null;
  }
  const level = Number(element.getAttribute('aria-level'));
  return Number.isInteger(level) && level > 0 ? level : null;
};

const contextTypeForElement = element => {
  const role = (element.getAttribute('role') || '').trim().toLowerCase();
  if (SUPPRESSED_ROLES.has(role)) return null;

  if (role) {
    if (LANDMARK_ROLES.has(role)) {
      if (role === 'region' && !getExplicitAccessibleName(element)) return null;
      return role;
    }
    if (role === 'list') return 'list';
    if (COMPOSITE_ROLES.has(role)) return 'widget';
  }

  const tagName = element.tagName.toLowerCase();
  switch (tagName) {
    case 'main':
      return 'main';
    case 'nav':
      return 'navigation';
    case 'aside':
      return 'complementary';
    case 'header': {
      let ancestor = getComposedParent(element);
      while (ancestor && isElement(ancestor)) {
        if (['article', 'aside', 'main', 'nav', 'section'].includes(
          ancestor.tagName.toLowerCase()
        )) {
          return null;
        }
        ancestor = getComposedParent(ancestor);
      }
      return 'banner';
    }
    case 'footer': {
      let ancestor = getComposedParent(element);
      while (ancestor && isElement(ancestor)) {
        if (['article', 'aside', 'main', 'nav', 'section'].includes(
          ancestor.tagName.toLowerCase()
        )) {
          return null;
        }
        ancestor = getComposedParent(ancestor);
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

const titleCase = value => value
  .replace(/[-_]+/g, ' ')
  .replace(/\b\w/g, character => character.toUpperCase());

const firstLegendText = element => {
  if (element.tagName.toLowerCase() !== 'fieldset') return '';
  const legend = Array.from(element.children)
    .find(child => child.tagName.toLowerCase() === 'legend');
  return normalizeText(legend?.textContent);
};

const contextFallbackName = type => {
  const names = {
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
    widget: 'Widget',
  };
  return names[type] || titleCase(type || 'Context');
};

const contextNameForElement = (element, type, associatedHeading = null) => (
  firstLegendText(element) ||
  getExplicitAccessibleName(element) ||
  normalizeText(associatedHeading?.textContent) ||
  contextFallbackName(type)
);

const makeContext = ({
  id,
  name,
  type,
  source,
  boundary = null,
  order = 0,
  memberTargets = [],
  parentHint = null,
  required = false,
  rangeStart = null,
  rangeEnd = null,
  rangeBoundary = null,
  containerContext = null,
  visualElements = [],
  explicitParentId = null,
  headingLevel = null,
}) => ({
  id,
  name,
  type,
  source,
  boundary,
  order,
  memberTargets: Array.from(memberTargets),
  memberSet: new Set(memberTargets),
  parent: parentHint,
  children: [],
  directTargets: [],
  targets: [],
  required,
  rangeStart,
  rangeEnd,
  rangeBoundary,
  containerContext,
  visualElements: Array.from(visualElements),
  explicitParentId,
  headingLevel,
});

const nearestContextBoundary = (element, boundaryContexts, stopRoot) => {
  let current = element;
  while (current) {
    if (boundaryContexts.has(current)) return boundaryContexts.get(current);
    if (current === stopRoot) break;
    current = getComposedParent(current);
  }
  return null;
};

const nearestAncestorContext = (boundary, boundaryContexts, rootContext) => {
  let current = getComposedParent(boundary);
  while (current) {
    if (boundaryContexts.has(current)) return boundaryContexts.get(current);
    current = getComposedParent(current);
  }
  return rootContext;
};

const resolveContributionValue = (value, details) => (
  typeof value === 'function' ? value(details) : value
);

const resolveBoundary = (descriptor, root, details) => {
  const candidate = resolveContributionValue(
    descriptor.boundary ?? descriptor.element,
    details
  );
  if (typeof candidate === 'string') return root.querySelector?.(candidate) || null;
  return isElement(candidate) || isShadowRoot(candidate) || isDocument(candidate)
    ? candidate
    : null;
};

const resolveMembers = (descriptor, boundary, root, targets, details) => {
  let configured = resolveContributionValue(
    descriptor.targets ?? descriptor.members,
    details
  );
  if (typeof configured === 'string') {
    configured = Array.from(root.querySelectorAll?.(configured) || []);
  }
  if (configured) {
    const allowed = new Set(targets);
    return Array.from(configured)
      .filter(target => allowed.has(target))
      .filter((target, index, values) => values.indexOf(target) === index);
  }
  if (boundary) {
    return targets.filter(target => isComposedWithin(boundary, target));
  }
  return [];
};

const setsOverlap = (left, right) => {
  for (const value of left) {
    if (right.has(value)) return true;
  }
  return false;
};

const setsEqual = (left, right) => (
  left.size === right.size && isSubset(left, right)
);

const isSubset = (candidate, container) => {
  for (const value of candidate) {
    if (!container.has(value)) return false;
  }
  return true;
};

const contextDepth = context => {
  let depth = 0;
  let current = context;
  const seen = new Set();
  while (current?.parent && !seen.has(current)) {
    seen.add(current);
    depth += 1;
    current = current.parent;
  }
  return depth;
};

const isContextAncestor = (ancestor, context) => {
  let current = context;
  const seen = new Set();
  while (current && !seen.has(current)) {
    if (current === ancestor) return true;
    seen.add(current);
    current = current.parent;
  }
  return false;
};

const normalizeTypedContexts = (descriptors, details, targets) => {
  const targetSet = new Set(targets);
  const contexts = [];

  Array.from(descriptors || []).forEach((descriptor, registrationOrder) => {
    if (!descriptor || descriptor.id === null || typeof descriptor.id === 'undefined') {
      return;
    }
    if (
      typeof descriptor.isValid === 'function' &&
      !descriptor.isValid(details)
    ) {
      return;
    }

    const resolvedTargets = resolveContributionValue(
      descriptor.targets ?? descriptor.resolveTargets,
      details
    );
    const seen = new Set();
    const liveTargets = Array.from(resolvedTargets || []).filter(target => {
      if (
        seen.has(target) ||
        !targetSet.has(target) ||
        !target.isConnected
      ) {
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
      priority: Number.isFinite(Number(descriptor.priority))
        ? Number(descriptor.priority)
        : registrationOrder,
      registrationOrder,
      targets: liveTargets,
    });
  });

  contexts.sort((left, right) => (
    left.priority - right.priority ||
    left.registrationOrder - right.registrationOrder
  ));
  return contexts;
};

/**
 * Builds a deterministic structural tree over one ordered target inventory.
 * Contexts are routing metadata; targets are always the original Element
 * identities supplied by the discovery boundary.
 */
export const buildStructuralModel = ({
  root,
  targets = [],
  structuralContexts = [],
  typedContexts = [],
  previousModel = null,
} = {}) => {
  if (!root || (!isDocument(root) && !isElement(root) && !isShadowRoot(root))) {
    throw new TypeError(
      'buildStructuralModel requires an Element, Document, or ShadowRoot root.'
    );
  }

  const liveTargets = Array.from(targets)
    .filter(target => target?.isConnected && isComposedWithin(root, target))
    .filter((target, index, values) => values.indexOf(target) === index);
  const elements = collectComposedElements(root, {
    exclude: isOpenKeyNavGeneratedUI,
  });
  const orderByElement = new Map(
    elements.map((element, index) => [element, index])
  );
  const targetOrder = target => (
    orderByElement.has(target)
      ? orderByElement.get(target)
      : Number.MAX_SAFE_INTEGER
  );

  const rootName = isDocument(root)
    ? 'Document'
    : (
      isElement(root)
        ? contextNameForElement(
          root,
          contextTypeForElement(root) || 'region'
        )
        : 'Shadow root'
    );
  const rootContext = makeContext({
    id: stableBoundaryId(root, 'root'),
    name: rootName,
    type: 'root',
    source: 'root',
    boundary: root,
    memberTargets: liveTargets,
    order: -1,
    required: true,
  });

  const boundaryContexts = new Map();
  const automaticContexts = [];

  // Identify explicit semantic boundaries first so associated headings and
  // structural parents can be resolved deterministically.
  elements.forEach(element => {
    // An Element supplied as the active root is already represented by the
    // root context. Re-inferring it would create two contexts for one boundary.
    if (element === root) return;
    if (isSemanticallyHidden(element, root)) return;
    const type = contextTypeForElement(element);
    if (!type) return;

    const memberTargets = liveTargets.filter(target =>
      isComposedWithin(element, target)
    );
    if (!memberTargets.length) return;

    const context = makeContext({
      id: stableBoundaryId(element, 'context'),
      name: '',
      type,
      source: 'semantic',
      boundary: element,
      memberTargets,
      order: orderByElement.get(element),
    });
    boundaryContexts.set(element, context);
    automaticContexts.push(context);
  });

  const headings = elements.filter(element =>
    headingRank(element) !== null &&
    !isSemanticallyHidden(element, root) &&
    isOperativeSemanticElement(element, root)
  );
  const ownedHeadingByTarget = new Map();
  liveTargets.forEach(target => {
    const firstContainedHeading = headings.find(heading => (
      isComposedWithin(target, heading)
    ));
    if (firstContainedHeading) {
      ownedHeadingByTarget.set(target, firstContainedHeading);
    }
  });

  automaticContexts.forEach(context => {
    const directHeadings = headings.filter(heading => (
      isComposedWithin(context.boundary, heading) &&
      nearestContextBoundary(
        getComposedParent(heading),
        boundaryContexts,
        root
      ) === context
    ));
    const labelledHeadingIds = new Set(
      (context.boundary.getAttribute('aria-labelledby') || '')
        .split(/\s+/)
        .filter(Boolean)
    );
    const explicitlyAssociated = headings.find(heading => (
      heading.id && labelledHeadingIds.has(heading.id)
    ));
    const leadingHeading = directHeadings.find(heading => {
      const headingOrder = orderByElement.get(heading);
      return !context.memberTargets.some(target => (
        targetOrder(target) < headingOrder
      ));
    });
    const ownHeading = explicitlyAssociated || leadingHeading || null;
    context.associatedHeading = ownHeading || null;
    context.headingLevel = ownHeading ? headingRank(ownHeading) : null;
    context.name = contextNameForElement(
      context.boundary,
      context.type,
      context.associatedHeading
    );
  });

  const allContexts = [rootContext, ...automaticContexts];
  const details = {
    root,
    targets: liveTargets.slice(),
    previousModel,
  };

  // Application contexts merge with the same DOM boundary where possible;
  // otherwise they contribute an explicit ordered membership boundary.
  Array.from(structuralContexts || []).forEach((descriptor, index) => {
    if (!descriptor || descriptor.id === null || typeof descriptor.id === 'undefined') {
      return;
    }
    if (
      typeof descriptor.isValid === 'function' &&
      !descriptor.isValid(details)
    ) {
      return;
    }

    const boundary = resolveBoundary(descriptor, root, details);
    const memberTargets = resolveMembers(
      descriptor,
      boundary,
      root,
      liveTargets,
      details
    );
    if (!memberTargets.length) return;

    const existing = boundary && boundaryContexts.get(boundary);
    const order = Number.isFinite(Number(descriptor.order))
      ? Number(descriptor.order)
      : (
        boundary && orderByElement.has(boundary)
          ? orderByElement.get(boundary)
          : Math.min(...memberTargets.map(targetOrder))
      );
    if (!Number.isFinite(order)) {
      throw new TypeError(
        `Structural context "${descriptor.id}" requires a deterministic order.`
      );
    }

    if (existing) {
      existing.id = String(descriptor.id);
      existing.name = descriptor.name || existing.name;
      existing.type = descriptor.type || existing.type;
      existing.source = 'application';
      existing.required = Boolean(
        descriptor.required || descriptor.preserve || descriptor.selectable
      );
      existing.memberTargets = memberTargets;
      existing.memberSet = new Set(memberTargets);
      existing.explicitParentId = descriptor.parentId || null;
      existing.order = order;
      const configuredHeadingLevel = Number(descriptor.headingLevel);
      if (Number.isInteger(configuredHeadingLevel) && configuredHeadingLevel > 0) {
        existing.headingLevel = configuredHeadingLevel;
      }
      return;
    }

    const configuredHeadingLevel = Number(descriptor.headingLevel);
    const applicationHeadingLevel =
      Number.isInteger(configuredHeadingLevel) && configuredHeadingLevel > 0
        ? configuredHeadingLevel
        : headingRank(boundary);

    const context = makeContext({
      id: String(descriptor.id),
      name: descriptor.name || descriptor.type || 'Application context',
      type: descriptor.type || 'application',
      source: 'application',
      boundary,
      memberTargets,
      order: order + index / 100000,
      required: Boolean(
        descriptor.required || descriptor.preserve || descriptor.selectable
      ),
      explicitParentId: descriptor.parentId || null,
      headingLevel: applicationHeadingLevel,
    });
    if (boundary) boundaryContexts.set(boundary, context);
    allContexts.push(context);
  });

  const contextByIdBeforeRanges = new Map(
    allContexts.map(context => [context.id, context])
  );

  // Establish the ordinary explicit-container ancestry.
  allContexts.slice(1).forEach(context => {
    if (context.explicitParentId) {
      context.parent =
        contextByIdBeforeRanges.get(String(context.explicitParentId)) ||
        rootContext;
    } else if (context.boundary) {
      context.parent = nearestAncestorContext(
        context.boundary,
        boundaryContexts,
        rootContext
      );
    } else {
      const containers = allContexts
        .filter(candidate => candidate !== context)
        .filter(candidate => isSubset(context.memberSet, candidate.memberSet))
        .sort((left, right) => (
          left.memberSet.size - right.memberSet.size ||
          right.order - left.order
        ));
      context.parent = containers[0] || rootContext;
    }
    if (context.parent === context) context.parent = rootContext;
  });

  // Heading contexts are ordered ranges within the nearest explicit semantic
  // container. Native section headings associated with that same boundary are
  // deliberately merged into the explicit context and skipped here.
  const containerContexts = [rootContext, ...allContexts.slice(1)
    .filter(context => context.boundary)];
  const headingContexts = [];

  containerContexts.forEach(container => {
    const boundary = container.boundary;
    const containerHeadings = headings.filter(heading => {
      if (heading === container.associatedHeading) return false;
      if (!isComposedWithin(boundary, heading)) return false;
      const nearest = nearestContextBoundary(
        getComposedParent(heading),
        boundaryContexts,
        root
      );
      return (nearest || rootContext) === container;
    });
    if (!containerHeadings.length) return;

    const scopeOrders = elements
      .filter(element => isComposedWithin(boundary, element))
      .map(element => orderByElement.get(element));
    const scopeEnd = scopeOrders.length
      ? Math.max(...scopeOrders) + 1
      : elements.length + 1;
    const stack = [];

    // A generic authored wrapper does not become a structural context, but it
    // can still provide a credible end for the headings and targets grouped
    // inside it. Use the nearest ancestor below the semantic container that
    // contains a following target outside the heading itself. This prevents a
    // final heading range from absorbing later sibling content merely because
    // no same-or-higher heading follows it.
    const rangeBoundaryForHeading = heading => {
      const headingOrder = orderByElement.get(heading);
      let candidate = getComposedParent(heading);

      while (candidate && candidate !== boundary) {
        if (
          isElement(candidate) &&
          liveTargets.some(target => (
            container.memberSet.has(target) &&
            !isSemanticallyHidden(target, root) &&
            !isComposedWithin(heading, target) &&
            isComposedWithin(candidate, target) &&
            targetOrder(target) > headingOrder
          ))
        ) {
          return candidate;
        }
        candidate = getComposedParent(candidate);
      }

      return boundary;
    };
    const rangeEndForBoundary = rangeBoundary => {
      const rangeOrders = elements
        .filter(element => isComposedWithin(rangeBoundary, element))
        .map(element => orderByElement.get(element));
      return rangeOrders.length
        ? Math.max(...rangeOrders) + 1
        : scopeEnd;
    };
    const closeHeadingContext = (closing, requestedEnd) => {
      const context = closing.context;
      context.rangeEnd = Math.min(closing.scopeEnd, requestedEnd);
      context.memberTargets = liveTargets.filter(target => {
        const ownedHeading = ownedHeadingByTarget.get(target);
        return (
          (
            ownedHeading
              ? ownedHeading === context.boundary
              : (
                targetOrder(target) >= context.rangeStart &&
                targetOrder(target) < context.rangeEnd
              )
          ) &&
          container.memberSet.has(target) &&
          !isSemanticallyHidden(target, root) &&
          isComposedWithin(context.rangeBoundary, target)
        );
      });
      context.memberSet = new Set(context.memberTargets);
    };

    containerHeadings.forEach(heading => {
      const level = headingRank(heading);
      const start = orderByElement.get(heading);

      while (stack.length && stack[stack.length - 1].scopeEnd <= start) {
        const closing = stack.pop();
        closeHeadingContext(closing, closing.scopeEnd);
      }
      while (stack.length && stack[stack.length - 1].level >= level) {
        const closing = stack.pop();
        closeHeadingContext(closing, start);
      }

      const rangeBoundary = rangeBoundaryForHeading(heading);
      const headingScopeEnd = rangeEndForBoundary(rangeBoundary);

      const context = makeContext({
        id: stableBoundaryId(heading, 'heading'),
        name: heading.textContent.replace(/\s+/g, ' ').trim() ||
          `Heading level ${level}`,
        type: 'heading',
        source: 'heading',
        boundary: heading,
        order: start,
        memberTargets: [],
        parentHint: stack.length
          ? stack[stack.length - 1].context
          : container,
        rangeStart: start,
        rangeEnd: headingScopeEnd,
        rangeBoundary,
        containerContext: container,
        headingLevel: level,
      });
      headingContexts.push(context);
      stack.push({ level, context, scopeEnd: headingScopeEnd });
    });

    while (stack.length) {
      const closing = stack.pop();
      closeHeadingContext(closing, closing.scopeEnd);
    }
  });

  // Preserve the authored visual range for heading-only contexts. The
  // controller uses this to draw one context indicator around the heading and
  // all of its content without turning any of those elements into focus stops.
  headingContexts.forEach(context => {
    context.visualElements = elements.filter(element => {
      const order = orderByElement.get(element);
      return (
        order >= context.rangeStart &&
        order < context.rangeEnd &&
        !isSemanticallyHidden(element, root) &&
        isComposedWithin(context.rangeBoundary, element)
      );
    });
  });

  headingContexts
    .filter(context => context.memberTargets.length)
    .forEach(context => allContexts.push(context));

  // Lists remain a single context when every nonempty item has exactly one
  // target. Richer lists receive item child contexts.
  const listItemContexts = [];
  automaticContexts
    .filter(context => context.type === 'list')
    .forEach(listContext => {
      const listItems = elements.filter(element => {
        const tagName = element.tagName.toLowerCase();
        const role = (element.getAttribute('role') || '').toLowerCase();
        if (SUPPRESSED_ROLES.has(role)) return false;
        if (
          role !== 'listitem' &&
          (tagName !== 'li' || Boolean(role))
        ) {
          return false;
        }

        let current = getComposedParent(element);
        while (current) {
          const currentContext = boundaryContexts.get(current);
          if (currentContext?.type === 'list') return currentContext === listContext;
          current = getComposedParent(current);
        }
        return false;
      });
      const items = listItems
        .map((element, index) => ({
          element,
          index,
          targets: liveTargets.filter(target => isComposedWithin(element, target)),
        }))
        .filter(item => item.targets.length);

      const hasRichItem = items.some(item => {
        if (item.targets.length > 1) return true;
        return allContexts.some(context => (
          context !== listContext &&
          context.boundary &&
          isComposedWithin(item.element, context.boundary) &&
          context.memberTargets.length
        ));
      });
      if (items.length < 2 || !hasRichItem) return;

      items.forEach(item => {
        const text = item.element.textContent.replace(/\s+/g, ' ').trim();
        listItemContexts.push(makeContext({
          id: stableBoundaryId(item.element, 'list-item'),
          name: text.slice(0, 60) || `Item ${item.index + 1}`,
          type: 'listitem',
          source: 'list-item',
          boundary: item.element,
          order: orderByElement.get(item.element),
          memberTargets: item.targets,
          parentHint: listContext,
        }));
      });
    });
  listItemContexts.forEach(context => allContexts.push(context));

  // Put explicit child boundaries into the applicable heading range and rich
  // list-item context. These are range/containment parents, not focus stops.
  const rangeParents = [
    ...headingContexts.filter(context => context.memberTargets.length),
    ...listItemContexts,
  ];
  allContexts.slice(1).forEach(context => {
    if (rangeParents.includes(context)) return;
    const candidates = rangeParents
      .filter(parent => parent !== context)
      .filter(parent => {
        if (parent.source === 'heading') {
          const boundaryOrder = context.boundary
            ? orderByElement.get(context.boundary)
            : context.order;
          return (
            boundaryOrder >= parent.rangeStart &&
            boundaryOrder < parent.rangeEnd &&
            isSubset(context.memberSet, parent.memberSet)
          );
        }
        return (
          context.boundary &&
          isComposedWithin(parent.boundary, context.boundary) &&
          isSubset(context.memberSet, parent.memberSet)
        );
      })
      .sort((left, right) => (
        left.memberSet.size - right.memberSet.size ||
        (left.rangeEnd - left.rangeStart) - (right.rangeEnd - right.rangeStart)
      ));

    const selected = candidates[0];
    if (
      selected &&
      selected !== context.parent &&
      !isContextAncestor(context, selected)
    ) {
      context.parent = selected;
    }
  });

  const usableContexts = [rootContext];
  const rejectedContexts = [];
  const orderedCandidates = allContexts.slice(1)
    .filter(context => context.memberTargets.length)
    .sort((left, right) => (
      Number(right.required) - Number(left.required) ||
      Number(Boolean(right.boundary)) - Number(Boolean(left.boundary)) ||
      left.order - right.order
    ));

  // Reject partial sibling overlap instead of forcing it into the structural
  // tree. Typed contexts are the supported representation for such relations.
  orderedCandidates.forEach(context => {
    if (!context.parent || context.parent === context) context.parent = rootContext;
    const siblings = usableContexts.filter(candidate => candidate.parent === context.parent);
    const invalidOverlap = siblings.some(sibling => (
      setsOverlap(context.memberSet, sibling.memberSet) &&
      !isSubset(context.memberSet, sibling.memberSet) &&
      !isSubset(sibling.memberSet, context.memberSet)
    ));
    if (invalidOverlap) {
      rejectedContexts.push(context);
      return;
    }
    usableContexts.push(context);
  });

  usableContexts.forEach(context => {
    context.children = [];
    context.directTargets = [];
    context.targets = [];
  });
  usableContexts.slice(1).forEach(context => {
    if (!usableContexts.includes(context.parent)) context.parent = rootContext;
    context.parent.children.push(context);
  });
  usableContexts.forEach(context => {
    context.children.sort((left, right) => left.order - right.order);
  });

  // Collapse a redundant unary child when it represents exactly the same
  // target sequence as its parent. Required application contexts are retained.
  // Repeat bottom-up because collapsing one layer can expose another.
  let collapsedContext = true;
  while (collapsedContext) {
    collapsedContext = false;
    const bottomUp = usableContexts.slice(1)
      .sort((left, right) => contextDepth(right) - contextDepth(left));

    for (const context of bottomUp) {
      const parent = context.parent;
      if (
        context.required ||
        context.headingLevel !== null ||
        !parent ||
        parent.children.length !== 1 ||
        !setsEqual(context.memberSet, parent.memberSet)
      ) {
        continue;
      }

      const childIndex = parent.children.indexOf(context);
      context.children.forEach(child => {
        child.parent = parent;
      });
      parent.children.splice(childIndex, 1, ...context.children);
      parent.children.sort((left, right) => left.order - right.order);
      usableContexts.splice(usableContexts.indexOf(context), 1);
      collapsedContext = true;
      break;
    }
  }

  const deepestContextForTarget = (context, target) => {
    const children = context.children.filter(child => child.memberSet.has(target));
    if (!children.length) return context;
    children.sort((left, right) => (
      contextDepth(right) - contextDepth(left) ||
      left.memberSet.size - right.memberSet.size ||
      left.order - right.order
    ));
    return deepestContextForTarget(children[0], target);
  };

  const directContextByTarget = new Map();
  liveTargets.forEach(target => {
    const direct = deepestContextForTarget(rootContext, target);
    directContextByTarget.set(target, direct);
    direct.directTargets.push(target);
  });
  usableContexts.forEach(context => {
    context.targets = liveTargets.filter(target =>
      isContextAncestor(context, directContextByTarget.get(target))
    );
  });

  const contexts = new Map(
    usableContexts.map(context => [context.id, context])
  );
  const normalizedTyped = normalizeTypedContexts(
    typedContexts,
    details,
    liveTargets
  );
  const typedContextMap = new Map(
    normalizedTyped.map(context => [context.id, context])
  );
  const typedContextsByTarget = new Map();
  liveTargets.forEach(target => {
    typedContextsByTarget.set(
      target,
      normalizedTyped.filter(context => context.targets.includes(target))
    );
  });

  return {
    root,
    targets: liveTargets,
    rootContext,
    contexts,
    directContextByTarget,
    typedContexts: typedContextMap,
    typedContextsByTarget,
    rejectedContexts,
    getDirectContext(target) {
      return directContextByTarget.get(target) || null;
    },
    getTypedContexts(target) {
      return typedContextsByTarget.get(target) || [];
    },
  };
};
