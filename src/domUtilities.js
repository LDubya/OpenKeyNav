const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;

export const OPENKEYNAV_GENERATED_UI_SELECTOR = [
  '[data-openkeynav-ui]',
  '.openKeyNav-label',
  '.openKeyNav-toolBar',
  '.openKeyNav-mouseover-tooltip',
  '.openKeyNav-structural-status',
  '#okn-notification-container',
  '#okn-audit-panel',
].join(',');

export const isElement = node => Boolean(
  node && node.nodeType === ELEMENT_NODE
);

export const isDocument = node => Boolean(
  node && node.nodeType === DOCUMENT_NODE
);

export const isShadowRoot = node => Boolean(
  node &&
  node.nodeType === DOCUMENT_FRAGMENT_NODE &&
  node.host &&
  isElement(node.host)
);

/**
 * Returns the parent exposed by the composed tree rather than the light DOM.
 */
export const getComposedParent = node => {
  if (!node) return null;
  if (node.assignedSlot) return node.assignedSlot;
  if (isShadowRoot(node)) return node.host;
  return node.parentNode || null;
};

/**
 * Includes `node` itself and stops after `boundary` when one is supplied.
 */
export const getComposedAncestors = (node, boundary = null) => {
  const ancestors = [];
  let current = node;

  while (current) {
    ancestors.push(current);
    if (current === boundary) break;
    current = getComposedParent(current);
  }

  return ancestors;
};

export const isComposedWithin = (boundary, node) => (
  Boolean(boundary && node) &&
  getComposedAncestors(node, boundary).includes(boundary)
);

/**
 * Returns children in the rendered composed tree, following open shadow roots
 * and replacing slots with their assigned nodes when present.
 */
export const getComposedChildren = node => {
  if (isDocument(node)) {
    return node.documentElement ? [node.documentElement] : [];
  }
  if (isElement(node) && node.shadowRoot) {
    return Array.from(node.shadowRoot.childNodes);
  }
  if (
    isElement(node) &&
    node.tagName.toLowerCase() === 'slot' &&
    typeof node.assignedNodes === 'function'
  ) {
    const assigned = node.assignedNodes({ flatten: true });
    if (assigned.length) return assigned;
  }
  return Array.from(node?.childNodes || []);
};

export const collectComposedElements = (root, { exclude = null } = {}) => {
  const elements = [];
  const seen = new Set();

  const visit = node => {
    if (!node || seen.has(node)) return;
    seen.add(node);

    if (isElement(node)) {
      if (exclude?.(node)) return;
      elements.push(node);
    }
    getComposedChildren(node).forEach(visit);
  };

  visit(root);
  return elements;
};

/**
 * Returns true when an element is, or is composed beneath, OpenKeyNav-owned UI.
 */
export const isOpenKeyNavGeneratedUI = (
  element,
  selector = OPENKEYNAV_GENERATED_UI_SELECTOR
) => getComposedAncestors(element).some(current => (
  isElement(current) && current.matches(selector)
));

export const hasAriaHiddenAncestor = (element, boundary = null) => (
  getComposedAncestors(element, boundary).some(current => (
    isElement(current) && current.getAttribute('aria-hidden') === 'true'
  ))
);

/**
 * Reads the actual focused element exposed by a document or open shadow root.
 * Iframes remain atomic focus targets.
 */
export const getDeepActiveElement = (
  root = typeof document === 'undefined' ? null : document
) => {
  if (!root) return null;

  const activeRoot = isDocument(root) || isShadowRoot(root)
    ? root
    : root.ownerDocument;
  let activeElement = activeRoot && activeRoot.activeElement;

  while (activeElement && activeElement.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  if (!activeElement || !isComposedWithin(root, activeElement)) return null;
  return activeElement;
};
