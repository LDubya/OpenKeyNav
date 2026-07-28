import { focusable, getTabIndex, tabbable } from 'tabbable';
import {
  getDeepActiveElement,
  isComposedWithin,
  isDocument,
  isElement,
  isOpenKeyNavGeneratedUI,
  isShadowRoot,
  OPENKEYNAV_GENERATED_UI_SELECTOR,
} from './domUtilities.js';

export {
  getDeepActiveElement,
  isOpenKeyNavGeneratedUI,
  OPENKEYNAV_GENERATED_UI_SELECTOR,
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

    if (!candidate.isConnected || !isComposedWithin(root, candidate)) return false;
    if (
      excludeGeneratedUI
      && isOpenKeyNavGeneratedUI(candidate, generatedUISelector)
    ) {
      return false;
    }
    if (targetFilter && !targetFilter(candidate)) return false;

    // A filter is application code and may synchronously detach or relocate a
    // candidate. Recheck liveness before returning it.
    return candidate.isConnected && isComposedWithin(root, candidate);
  });
};
