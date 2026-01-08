import { isTabbable } from '../src/isTabbable.js';

// jsdom lacks layout; stub openKeyNav helpers to bypass layout checks
const openKeyNav = {
  isNonzeroSize: () => true,
  isAnyCornerVisible: () => true,
  config: {
    debug: { screenReaderVisible: false },
  },
  flagAsInaccessible: () => {},
  config: {
    debug: { screenReaderVisible: false, keyboardAccessible: true },
    modes: { clicking: { value: false } },
    modesConfig: { click: { clickEventElements: new Set(), eventListenersMap: new Map() } },
  },
};

describe('isTabbable', () => {
  it('returns true for element with tabindex >= 0', () => {
    const el = document.createElement('div');
    el.setAttribute('tabindex', '0');
    document.body.appendChild(el);
    expect(isTabbable(el, openKeyNav)).toBe(true);
  });

  it('returns false for display:none', () => {
    const el = document.createElement('button');
    el.style.display = 'none';
    document.body.appendChild(el);
    expect(isTabbable(el, openKeyNav)).toBe(false);
  });

  it('returns false for visibility:hidden', () => {
    const el = document.createElement('a');
    el.setAttribute('href', '#');
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    expect(isTabbable(el, openKeyNav)).toBe(false);
  });
});
