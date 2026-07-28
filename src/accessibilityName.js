import { hasAriaHiddenAncestor } from './domUtilities.js';

export const normalizeText = value => String(value || '')
  .replace(/\s+/g, ' ')
  .trim();

const queryReference = (element, id) => {
  const root = element.getRootNode?.();
  return root?.getElementById?.(id) || element.ownerDocument?.getElementById(id);
};

export const getLabelledByText = (element, { excludeHidden = true } = {}) => {
  if (!element?.getAttribute) return '';

  return (element.getAttribute('aria-labelledby') || '')
    .split(/\s+/)
    .filter(Boolean)
    .map(id => queryReference(element, id))
    .filter(label => (
      label &&
      (!excludeHidden || !hasAriaHiddenAncestor(label, element.getRootNode?.()))
    ))
    .map(label => normalizeText(label.textContent))
    .filter(Boolean)
    .join(' ');
};

/**
 * Resolves only author-provided ARIA names. It deliberately does not attempt
 * the full accessible-name computation used by assistive technologies.
 */
export const getExplicitAccessibleName = (element, options) => (
  getLabelledByText(element, options) ||
  (element?.getAttribute?.('aria-label') || '').trim()
);
