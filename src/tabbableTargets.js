import { focusable, getTabIndex, tabbable } from 'tabbable';

export const OPENKEYNAV_GENERATED_UI_SELECTOR = [
  '[data-openkeynav-ui]',
  '.openKeyNav-label',
  '.openKeyNav-toolBar',
  '.openKeyNav-mouseover-tooltip',
  '.openKeyNav-structural-status',
  '#okn-notification-container',
  '#okn-audit-panel',
].join(',');

const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;

const isElement = node => Boolean(node && node.nodeType === ELEMENT_NODE);
const isDocument = node => Boolean(node && node.nodeType === DOCUMENT_NODE);
const isShadowRoot = node => Boolean(
  node
  && node.nodeType === DOCUMENT_FRAGMENT_NODE
  && node.host
  && isElement(node.host)
);

const getComposedParent = node => {
  if (!node) return null;
  if (node.assignedSlot) return node.assignedSlot;
  if (isShadowRoot(node)) return node.host;
  return node.parentNode || null;
};

const isWithinRoot = (root, node) => {
  let current = node;

  while (current) {
    if (current === root) return true;
    current = getComposedParent(current);
  }

  return false;
};

/**
 * Returns true when an element is, or is composed beneath, OpenKeyNav-owned UI.
 * Composed ancestry is intentional so generated UI inside an open shadow root is
 * excluded when its host carries the marker.
 */
export const isOpenKeyNavGeneratedUI = (
  element,
  selector = OPENKEYNAV_GENERATED_UI_SELECTOR
) => {
  let current = element;

  while (current) {
    if (isElement(current) && current.matches(selector)) return true;
    current = getComposedParent(current);
  }

  return false;
};

/**
 * Reads the actual focused element exposed by the active document or shadow root.
 * It follows open Shadow DOM focus, but deliberately treats iframes as atomic.
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

  if (!activeElement || !isWithinRoot(root, activeElement)) return null;
  return activeElement;
};

const normalizeDiscoveryRoot = root => {
  if (isDocument(root)) {
    if (!root.documentElement) {
      throw new TypeError('The discovery document must have a document element.');
    }
    return root.documentElement;
  }

  if (isShadowRoot(root)) return root.host;
  if (isElement(root)) return root;

  throw new TypeError(
    'discoverTabbableTargets requires an Element, Document, or ShadowRoot.'
  );
};

const getTabbableOptions = (root, options) => {
  const {
    displayCheck = 'full',
    getShadowRoot = true,
    includeContainer = isElement(root),
  } = options;

  // Tabbable traverses a ShadowRoot through its host. Supplying the exact root
  // also keeps this boundary usable if a caller was deliberately given a root
  // that is not available through host.shadowRoot.
  const shadowRootResolver = isShadowRoot(root)
    ? node => {
      if (node === root.host) return root;
      if (typeof getShadowRoot === 'function') return getShadowRoot(node);
      return false;
    }
    : getShadowRoot;

  return {
    displayCheck,
    getShadowRoot: shadowRootResolver,
    includeContainer,
  };
};

const includeProgrammaticCandidates = (discoveryRoot, candidates, tabbableOptions) => {
  const focusableCandidates = focusable(discoveryRoot, tabbableOptions);
  const positiveTabbables = candidates.filter(candidate => getTabIndex(candidate) > 0);
  const positiveSet = new Set(positiveTabbables);

  // Preserve the browser-like positive-tabindex prefix, then use composed source
  // order for the zero- and negative-tabindex focusable elements. Opting in to
  // programmatic targets necessarily differs from native Tab order.
  return [
    ...positiveTabbables,
    ...focusableCandidates.filter(candidate => !positiveSet.has(candidate)),
  ];
};

/**
 * Discovers live focus destinations in the active navigation root.
 *
 * `displayCheck` defaults to Tabbable's browser-accurate `full` strategy. Tests
 * running in jsdom should opt into `displayCheck: 'none'` explicitly.
 */
export const discoverTabbableTargets = (root, options = {}) => {
  const {
    excludeGeneratedUI = true,
    generatedUISelector = OPENKEYNAV_GENERATED_UI_SELECTOR,
    includeProgrammatic = false,
    targetFilter = null,
  } = options;

  if (targetFilter !== null && typeof targetFilter !== 'function') {
    throw new TypeError('targetFilter must be a function when provided.');
  }

  const discoveryRoot = normalizeDiscoveryRoot(root);
  const tabbableOptions = getTabbableOptions(root, options);
  let candidates = tabbable(discoveryRoot, tabbableOptions);

  if (includeProgrammatic) {
    candidates = includeProgrammaticCandidates(
      discoveryRoot,
      candidates,
      tabbableOptions
    );
  }

  const seen = new Set();

  return candidates.filter(candidate => {
    if (seen.has(candidate)) return false;
    seen.add(candidate);

    if (!candidate.isConnected || !isWithinRoot(root, candidate)) return false;
    if (
      excludeGeneratedUI
      && isOpenKeyNavGeneratedUI(candidate, generatedUISelector)
    ) {
      return false;
    }
    if (targetFilter && !targetFilter(candidate)) return false;

    // A filter is application code and may synchronously detach or relocate a
    // candidate. Recheck liveness before returning it.
    return candidate.isConnected && isWithinRoot(root, candidate);
  });
};
