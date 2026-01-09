/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import OpenKeyNav from '../src/OpenKeyNav.js';
import { showClickableOverlays } from '../src/keylabels.js';

// Stub elementFromPoint for jsdom
if (typeof document !== 'undefined' && !document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

describe('Nested Interactive Elements', () => {
  let openKeyNav;
  let container;

  beforeEach(() => {
    document.body.innerHTML = '';
    
    // Mock window dimensions for viewport checks
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    
    // Mock getBoundingClientRect for all elements to have non-zero size
    Element.prototype.getBoundingClientRect = vi.fn(function() {
      return {
        width: 100,
        height: 30,
        top: 0,
        left: 0,
        right: 100,
        bottom: 30,
        x: 0,
        y: 0
      };
    });
    
    // Mock getComputedStyle to return visible styles
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn((element) => {
      const styles = originalGetComputedStyle(element);
      return {
        ...styles,
        display: element.style.display || 'inline',
        visibility: element.style.visibility || 'visible',
        opacity: element.style.opacity || '1',
        overflow: 'visible',
        overflowX: 'visible',
        overflowY: 'visible'
      };
    });
    
    openKeyNav = new OpenKeyNav();
    openKeyNav.init({ debug: { keyboardAccessible: false } });
    
    // Mock layout-dependent methods that jsdom doesn't support
    openKeyNav.isNonzeroSize = vi.fn(() => true);
    openKeyNav.isAnyCornerVisible = vi.fn(() => true);
    
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  it('should show only innermost element when nested buttons occupy same space', async () => {
    // Create outer button wrapping inner button
    const outerButton = document.createElement('button');
    outerButton.id = 'outer-button';
    outerButton.textContent = 'Outer';
    
    const innerButton = document.createElement('button');
    innerButton.id = 'inner-button';
    innerButton.textContent = 'Inner';
    
    outerButton.appendChild(innerButton);
    container.appendChild(outerButton);

    // Enable click mode
    openKeyNav.config.modes.clicking.value = true;
    showClickableOverlays(openKeyNav);
    
    // Wait for setTimeout in showClickableOverlays
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should have exactly one overlay
    const overlays = document.querySelectorAll('.openKeyNav-label');
    expect(overlays.length).toBe(1);

    // The overlay should be associated with the inner button
    const overlay = overlays[0];
    const targetId = overlay.getAttribute('data-openkeynav-label');
    const targetElement = document.querySelector(`[data-openkeynav-label="${targetId}"]`);
    
    expect(targetElement.id).toBe('inner-button');
  });

  it('should show only innermost clickable element when div wraps button', async () => {
    // Create clickable div wrapping button
    const clickableDiv = document.createElement('div');
    clickableDiv.id = 'clickable-div';
    clickableDiv.setAttribute('onclick', 'console.log("div")');
    clickableDiv.style.padding = '20px';
    
    const button = document.createElement('button');
    button.id = 'nested-button';
    button.textContent = 'Click me';
    
    clickableDiv.appendChild(button);
    container.appendChild(clickableDiv);

    // Enable click mode
    openKeyNav.config.modes.clicking.value = true;
    showClickableOverlays(openKeyNav);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should have exactly one overlay (for the button, not the div)
    const overlays = document.querySelectorAll('.openKeyNav-label');
    expect(overlays.length).toBe(1);

    // The overlay should be associated with the button
    const overlay = overlays[0];
    const targetId = overlay.getAttribute('data-openkeynav-label');
    const targetElement = document.querySelector(`[data-openkeynav-label="${targetId}"]`);
    
    expect(targetElement.id).toBe('nested-button');
  });

  it('should show only innermost element when anchor wraps button', async () => {
    // Create anchor wrapping button
    const anchor = document.createElement('a');
    anchor.id = 'outer-link';
    anchor.href = '#test';
    
    const button = document.createElement('button');
    button.id = 'inner-button';
    button.textContent = 'Button in Link';
    
    anchor.appendChild(button);
    container.appendChild(anchor);

    // Enable click mode
    openKeyNav.config.modes.clicking.value = true;
    showClickableOverlays(openKeyNav);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should have exactly one overlay
    const overlays = document.querySelectorAll('.openKeyNav-label');
    expect(overlays.length).toBe(1);

    // The overlay should be associated with the inner button
    const overlay = overlays[0];
    const targetId = overlay.getAttribute('data-openkeynav-label');
    const targetElement = document.querySelector(`[data-openkeynav-label="${targetId}"]`);
    
    expect(targetElement.id).toBe('inner-button');
  });

  it('should handle deeply nested interactive elements', async () => {
    // Create deeply nested structure: div > a > span > button
    const clickableDiv = document.createElement('div');
    clickableDiv.id = 'level-1';
    clickableDiv.setAttribute('onclick', 'console.log("div")');
    
    const anchor = document.createElement('a');
    anchor.id = 'level-2';
    anchor.href = '#test';
    
    const span = document.createElement('span');
    span.id = 'level-3';
    span.setAttribute('onclick', 'console.log("span")');
    
    const button = document.createElement('button');
    button.id = 'level-4';
    button.textContent = 'Deep Button';
    
    span.appendChild(button);
    anchor.appendChild(span);
    clickableDiv.appendChild(anchor);
    container.appendChild(clickableDiv);

    // Enable click mode
    openKeyNav.config.modes.clicking.value = true;
    showClickableOverlays(openKeyNav);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should have exactly one overlay for the innermost interactive element
    const overlays = document.querySelectorAll('.openKeyNav-label');
    expect(overlays.length).toBe(1);

    // The overlay should be associated with the button
    const overlay = overlays[0];
    const targetId = overlay.getAttribute('data-openkeynav-label');
    const targetElement = document.querySelector(`[data-openkeynav-label="${targetId}"]`);
    
    expect(targetElement.id).toBe('level-4');
  });

  it('should show separate labels for siblings that are not nested', async () => {
    // Create two sibling buttons (not nested)
    const button1 = document.createElement('button');
    button1.id = 'button-1';
    button1.textContent = 'Button 1';
    
    const button2 = document.createElement('button');
    button2.id = 'button-2';
    button2.textContent = 'Button 2';
    
    container.appendChild(button1);
    container.appendChild(button2);

    // Enable click mode
    openKeyNav.config.modes.clicking.value = true;
    showClickableOverlays(openKeyNav);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should have two overlays
    const overlays = document.querySelectorAll('.openKeyNav-label');
    expect(overlays.length).toBe(2);
  });

  it('should click innermost element and event should bubble', async () => {
    // Create nested structure with click handlers
    const outerClicks = [];
    const innerClicks = [];
    
    const outerButton = document.createElement('button');
    outerButton.id = 'outer-button';
    outerButton.textContent = 'Outer';
    outerButton.addEventListener('click', () => outerClicks.push('outer'));
    
    const innerButton = document.createElement('button');
    innerButton.id = 'inner-button';
    innerButton.textContent = 'Inner';
    innerButton.addEventListener('click', () => innerClicks.push('inner'));
    
    outerButton.appendChild(innerButton);
    container.appendChild(outerButton);

    // Enable click mode
    openKeyNav.config.modes.clicking.value = true;
    showClickableOverlays(openKeyNav);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Find the overlay and simulate clicking it
    const overlays = document.querySelectorAll('.openKeyNav-label');
    expect(overlays.length).toBe(1);
    
    const overlay = overlays[0];
    const targetId = overlay.getAttribute('data-openkeynav-label');
    const targetElement = document.querySelector(`[data-openkeynav-label="${targetId}"]`);
    
    // Simulate the click
    targetElement.click();

    // Inner button should have been clicked
    expect(innerClicks).toEqual(['inner']);
    
    // Event should have bubbled to outer button
    expect(outerClicks).toEqual(['outer']);
  });

  it('should show both labels when parent is larger than child', async () => {
    // Create large clickable div with small button inside
    const clickableDiv = document.createElement('div');
    clickableDiv.id = 'large-div';
    clickableDiv.setAttribute('onclick', 'console.log("div")');
    clickableDiv.style.padding = '50px';
    clickableDiv.style.background = '#eee';
    
    const button = document.createElement('button');
    button.id = 'small-button';
    button.textContent = 'Click me';
    
    clickableDiv.appendChild(button);
    container.appendChild(clickableDiv);
    
    // Mock getBoundingClientRect to show different sizes
    clickableDiv.getBoundingClientRect = vi.fn(() => ({
      width: 200,
      height: 150,
      top: 0,
      left: 0,
      right: 200,
      bottom: 150,
      x: 0,
      y: 0
    }));
    
    button.getBoundingClientRect = vi.fn(() => ({
      width: 80,
      height: 30,
      top: 50,
      left: 50,
      right: 130,
      bottom: 80,
      x: 50,
      y: 50
    }));

    // Enable click mode
    openKeyNav.config.modes.clicking.value = true;
    showClickableOverlays(openKeyNav);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should have two overlays - one for div, one for button
    const overlays = document.querySelectorAll('.openKeyNav-label');
    expect(overlays.length).toBe(2);
    
    // Both elements should have labels
    const divLabel = clickableDiv.getAttribute('data-openkeynav-label');
    const buttonLabel = button.getAttribute('data-openkeynav-label');
    
    expect(divLabel).toBeTruthy();
    expect(buttonLabel).toBeTruthy();
    expect(divLabel).not.toBe(buttonLabel);
  });

  it('should show both labels when anchor is larger than nested button', async () => {
    // Create large anchor with small button inside
    const anchor = document.createElement('a');
    anchor.id = 'large-link';
    anchor.href = '#test';
    anchor.style.display = 'block';
    anchor.style.padding = '30px';
    anchor.style.background = '#f0f0f0';
    
    const button = document.createElement('button');
    button.id = 'small-button-in-link';
    button.textContent = 'Button';
    
    anchor.appendChild(button);
    container.appendChild(anchor);
    
    // Mock different sizes
    anchor.getBoundingClientRect = vi.fn(() => ({
      width: 150,
      height: 100,
      top: 0,
      left: 0,
      right: 150,
      bottom: 100,
      x: 0,
      y: 0
    }));
    
    button.getBoundingClientRect = vi.fn(() => ({
      width: 60,
      height: 25,
      top: 30,
      left: 30,
      right: 90,
      bottom: 55,
      x: 30,
      y: 30
    }));

    // Enable click mode
    openKeyNav.config.modes.clicking.value = true;
    showClickableOverlays(openKeyNav);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should have two overlays
    const overlays = document.querySelectorAll('.openKeyNav-label');
    expect(overlays.length).toBe(2);
    
    const anchorLabel = anchor.getAttribute('data-openkeynav-label');
    const buttonLabel = button.getAttribute('data-openkeynav-label');
    
    expect(anchorLabel).toBeTruthy();
    expect(buttonLabel).toBeTruthy();
  });
});
