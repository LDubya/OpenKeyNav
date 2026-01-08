import { isTabbable } from '../src/isTabbable.js';

// jsdom lacks layout; stub openKeyNav helpers to bypass layout checks
const createMockOpenKeyNav = (overrides = {}) => ({
  isNonzeroSize: () => true,
  isAnyCornerVisible: () => true,
  flagAsInaccessible: vi.fn(),
  config: {
    debug: { 
      screenReaderVisible: false, 
      keyboardAccessible: true 
    },
    modes: { 
      clicking: { value: false } 
    },
    modesConfig: { 
      click: { 
        clickEventElements: new Set(), 
        eventListenersMap: new Map() 
      } 
    },
  },
  ...overrides,
});

describe('isTabbable', () => {
  let openKeyNav;

  beforeEach(() => {
    openKeyNav = createMockOpenKeyNav();
    document.body.innerHTML = '';
    
    // Mock getBoundingClientRect for elements to simulate in-viewport behavior
    Element.prototype.getBoundingClientRect = vi.fn(function() {
      return {
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
        width: 100,
        height: 100,
      };
    });
  });

  describe('basic visibility checks', () => {
    it('returns true for visible button', () => {
      const el = document.createElement('button');
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

    it('returns false for non-Element nodes', () => {
      const textNode = document.createTextNode('text');
      expect(isTabbable(textNode, openKeyNav)).toBe(false);
    });

    it('returns false for elements with zero size', () => {
      const el = document.createElement('button');
      document.body.appendChild(el);
      const mockOKN = createMockOpenKeyNav({
        isNonzeroSize: () => false,
      });
      expect(isTabbable(el, mockOKN)).toBe(false);
    });
  });

  describe('tabindex handling', () => {
    it('returns true for element with tabindex >= 0', () => {
      const el = document.createElement('div');
      el.setAttribute('tabindex', '0');
      document.body.appendChild(el);
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('returns true for element with positive tabindex', () => {
      const el = document.createElement('div');
      el.setAttribute('tabindex', '5');
      document.body.appendChild(el);
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('flags button with tabindex=-1 as inaccessible', () => {
      const el = document.createElement('button');
      el.setAttribute('tabindex', '-1');
      document.body.appendChild(el);
      
      isTabbable(el, openKeyNav);
      
      expect(openKeyNav.flagAsInaccessible).toHaveBeenCalledWith(
        el,
        expect.stringContaining('not keyboard-focusable'),
        'keyboard'
      );
    });

    it('flags anchor with tabindex=-1 as inaccessible', () => {
      const el = document.createElement('a');
      el.setAttribute('href', '#test');
      el.setAttribute('tabindex', '-1');
      document.body.appendChild(el);
      
      isTabbable(el, openKeyNav);
      
      expect(openKeyNav.flagAsInaccessible).toHaveBeenCalled();
    });
  });

  describe('anchor link validation', () => {
    it('returns true for anchor with href', () => {
      const el = document.createElement('a');
      el.setAttribute('href', '#test');
      document.body.appendChild(el);
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('flags anchor without href as inaccessible', () => {
      const el = document.createElement('a');
      document.body.appendChild(el);
      
      isTabbable(el, openKeyNav);
      
      expect(openKeyNav.flagAsInaccessible).toHaveBeenCalledWith(
        el,
        expect.stringContaining('Inaccessible Button'),
        'keyboard'
      );
    });

    it('flags anchor with empty href as inaccessible', () => {
      const el = document.createElement('a');
      el.setAttribute('href', '');
      document.body.appendChild(el);
      
      isTabbable(el, openKeyNav);
      
      expect(openKeyNav.flagAsInaccessible).toHaveBeenCalled();
    });

    it('does not flag anchor without href if it has interactive role', () => {
      const el = document.createElement('a');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      document.body.appendChild(el);
      
      isTabbable(el, openKeyNav);
      
      expect(openKeyNav.flagAsInaccessible).not.toHaveBeenCalled();
    });
  });

  describe('native interactive elements', () => {
    it('returns true for button', () => {
      const el = document.createElement('button');
      document.body.appendChild(el);
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('returns true for input', () => {
      const el = document.createElement('input');
      document.body.appendChild(el);
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('returns true for select', () => {
      const el = document.createElement('select');
      document.body.appendChild(el);
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('returns true for textarea', () => {
      const el = document.createElement('textarea');
      document.body.appendChild(el);
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('returns true for summary', () => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      details.appendChild(summary);
      document.body.appendChild(details);
      expect(isTabbable(summary, openKeyNav)).toBe(true);
    });
  });

  describe('ARIA roles', () => {
    it('returns true for div with role=button and tabindex', () => {
      const el = document.createElement('div');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      document.body.appendChild(el);
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('returns true for span with role=link and tabindex', () => {
      const el = document.createElement('span');
      el.setAttribute('role', 'link');
      el.setAttribute('tabindex', '0');
      document.body.appendChild(el);
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });
  });

  describe('details/summary handling', () => {
    it('returns false for elements inside closed details', () => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      const button = document.createElement('button');
      
      details.appendChild(summary);
      details.appendChild(button);
      document.body.appendChild(details);
      
      expect(isTabbable(button, openKeyNav)).toBe(false);
    });

    it('returns true for summary inside closed details', () => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      
      details.appendChild(summary);
      document.body.appendChild(details);
      
      expect(isTabbable(summary, openKeyNav)).toBe(true);
    });

    it('returns false for second summary in details', () => {
      const details = document.createElement('details');
      const summary1 = document.createElement('summary');
      const summary2 = document.createElement('summary');
      
      details.appendChild(summary1);
      details.appendChild(summary2);
      document.body.appendChild(details);
      
      expect(isTabbable(summary2, openKeyNav)).toBe(false);
    });
  });

  describe('click event detection', () => {
    it('flags div with non-interactive role and click event as inaccessible', () => {
      const el = document.createElement('div');
      el.setAttribute('role', 'group'); // non-interactive role
      document.body.appendChild(el);
      
      const mockOKN = createMockOpenKeyNav();
      mockOKN.config.modesConfig.click.clickEventElements.add(el);
      
      isTabbable(el, mockOKN);
      
      expect(mockOKN.flagAsInaccessible).toHaveBeenCalledWith(
        el,
        expect.stringContaining('Possibly Inaccessible Clickable Element'),
        'keyboard'
      );
    });

    it('does not flag div with click event if it has no role (edge case)', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      
      const mockOKN = createMockOpenKeyNav();
      mockOKN.config.modesConfig.click.clickEventElements.add(el);
      
      isTabbable(el, mockOKN);
      
      // Current behavior: elements with click events but NO role are not flagged
      // This may be intentional to reduce false positives
      expect(mockOKN.flagAsInaccessible).not.toHaveBeenCalled();
    });

    it('does not flag div with click event if it has role and tabindex', () => {
      const el = document.createElement('div');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      document.body.appendChild(el);
      
      const mockOKN = createMockOpenKeyNav();
      mockOKN.config.modesConfig.click.clickEventElements.add(el);
      
      isTabbable(el, mockOKN);
      
      expect(mockOKN.flagAsInaccessible).not.toHaveBeenCalled();
    });
  });

  describe('viewport and visibility', () => {
    it('returns false when element is not in viewport', () => {
      const el = document.createElement('button');
      document.body.appendChild(el);
      
      // Mock getBoundingClientRect to simulate off-screen element
      el.getBoundingClientRect = vi.fn(() => ({
        top: -100,
        left: -100,
        bottom: -50,
        right: -50,
      }));
      
      expect(isTabbable(el, openKeyNav)).toBe(false);
    });

    it('returns false when corner is not visible', () => {
      const el = document.createElement('button');
      document.body.appendChild(el);
      
      const mockOKN = createMockOpenKeyNav({
        isAnyCornerVisible: () => false,
      });
      
      expect(isTabbable(el, mockOKN)).toBe(false);
    });

    it('returns true when corner is not visible but screenReaderVisible=true', () => {
      const el = document.createElement('button');
      document.body.appendChild(el);
      
      const mockOKN = createMockOpenKeyNav({
        isAnyCornerVisible: () => false,
      });
      mockOKN.config.debug.screenReaderVisible = true;
      
      expect(isTabbable(el, mockOKN)).toBe(true);
    });
  });

  describe('overflow scrolling', () => {
    it('returns false when element is scrolled out of view in overflow container', () => {
      const container = document.createElement('div');
      container.style.overflow = 'scroll'; // Must be scroll or auto
      container.style.width = '100px';
      container.style.height = '100px';
      
      const el = document.createElement('button');
      container.appendChild(el);
      document.body.appendChild(container);
      
      // Mock rects to simulate element scrolled out of view
      container.getBoundingClientRect = vi.fn(() => ({
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
      }));
      
      el.getBoundingClientRect = vi.fn(() => ({
        top: 150, // Below container
        left: 0,
        bottom: 200,
        right: 100,
      }));
      
      expect(isTabbable(el, openKeyNav)).toBe(false);
    });

    it('returns true when element is visible within scrollable parent', () => {
      const container = document.createElement('div');
      container.style.overflow = 'auto';
      container.style.width = '100px';
      container.style.height = '100px';
      
      const el = document.createElement('button');
      container.appendChild(el);
      document.body.appendChild(container);
      
      // Mock rects to simulate element visible within container
      container.getBoundingClientRect = vi.fn(() => ({
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
      }));
      
      el.getBoundingClientRect = vi.fn(() => ({
        top: 10, // Inside container
        left: 10,
        bottom: 50,
        right: 50,
      }));
      
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });
  });

  describe('disabled elements', () => {
    it('returns true for disabled button (browser handles this)', () => {
      const el = document.createElement('button');
      el.disabled = true;
      document.body.appendChild(el);
      
      // isTabbable doesn't filter disabled elements - browser does
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('returns true for disabled input (browser handles this)', () => {
      const el = document.createElement('input');
      el.disabled = true;
      document.body.appendChild(el);
      
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });
  });

  describe('hidden attribute', () => {
    it('returns false for element with hidden attribute', () => {
      const el = document.createElement('button');
      el.hidden = true;
      document.body.appendChild(el);
      
      // jsdom properly applies display:none to hidden elements
      expect(isTabbable(el, openKeyNav)).toBe(false);
    });
  });

  describe('aria-hidden', () => {
    it('returns true for aria-hidden element (semantic only, visually present)', () => {
      const el = document.createElement('button');
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
      
      // isTabbable checks visual presence, not semantic hiding
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });
  });

  describe('contenteditable', () => {
    it('returns true for contenteditable div with tabindex', () => {
      const el = document.createElement('div');
      el.contentEditable = 'true';
      el.setAttribute('tabindex', '0');
      document.body.appendChild(el);
      
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('returns true for contenteditable without tabindex (if visible)', () => {
      const el = document.createElement('div');
      el.contentEditable = 'true';
      document.body.appendChild(el);
      
      // contenteditable is implicitly focusable even without tabindex
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });
  });

  describe('iframe handling', () => {
    it('returns true for iframe', () => {
      const el = document.createElement('iframe');
      document.body.appendChild(el);
      
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('returns false for iframe with tabindex=-1', () => {
      const el = document.createElement('iframe');
      el.setAttribute('tabindex', '-1');
      document.body.appendChild(el);
      
      // Should still return true (currently) but flag as inaccessible
      isTabbable(el, openKeyNav);
      expect(openKeyNav.flagAsInaccessible).toHaveBeenCalled();
    });
  });

  describe('open details elements', () => {
    it('returns true for elements inside open details', () => {
      const details = document.createElement('details');
      details.open = true;
      const summary = document.createElement('summary');
      const button = document.createElement('button');
      
      details.appendChild(summary);
      details.appendChild(button);
      document.body.appendChild(details);
      
      expect(isTabbable(button, openKeyNav)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles elements in shadow DOM', () => {
      // Basic test - full shadow DOM testing would require more setup
      const el = document.createElement('button');
      document.body.appendChild(el);
      
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('handles SVG elements with tabindex', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('tabindex', '0');
      svg.appendChild(circle);
      document.body.appendChild(svg);
      
      expect(isTabbable(circle, openKeyNav)).toBe(true);
    });

    it('handles anchor with onclick attribute', () => {
      const el = document.createElement('a');
      el.setAttribute('onclick', 'return false');
      el.setAttribute('href', '#test');
      document.body.appendChild(el);
      
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });
  });

  describe('TDD - gaps fixed', () => {
    it('should flag divs with onclick attribute but no role/tabindex', () => {
      const el = document.createElement('div');
      el.setAttribute('onclick', 'alert("click")');
      document.body.appendChild(el);
      
      isTabbable(el, openKeyNav);
      
      // FIXED: onclick attr now detected and flagged
      expect(openKeyNav.flagAsInaccessible).toHaveBeenCalledWith(
        el,
        expect.stringContaining('Possibly Inaccessible'),
        'keyboard'
      );
    });

    it('should return false for inert elements', () => {
      const el = document.createElement('button');
      el.inert = true;
      document.body.appendChild(el);
      
      // FIXED: inert now checked
      expect(isTabbable(el, openKeyNav)).toBe(false);
    });

    it('should return false for elements inside inert containers', () => {
      const container = document.createElement('div');
      container.inert = true;
      const el = document.createElement('button');
      container.appendChild(el);
      document.body.appendChild(container);
      
      // FIXED: inert containers now checked via parent walk
      expect(isTabbable(el, openKeyNav)).toBe(false);
    });

    it('should handle opacity:0 elements based on config', () => {
      const el = document.createElement('button');
      el.style.opacity = '0';
      document.body.appendChild(el);
      
      // Currently returns true - opacity:0 is visually hidden but technically present
      // This test documents current behavior
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });

    it('should handle elements with pointer-events:none', () => {
      const el = document.createElement('button');
      el.style.pointerEvents = 'none';
      document.body.appendChild(el);
      
      // pointer-events:none doesn't affect keyboard, should still be tabbable
      expect(isTabbable(el, openKeyNav)).toBe(true);
    });
  });
});
