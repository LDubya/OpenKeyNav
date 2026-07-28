/**
 * @vitest-environment jsdom
 */
import OpenKeyNav from '../src/OpenKeyNav.js';

const LEGACY_FOCUS_COMMANDS = [
  { label: 'all headings', key: 'h', code: 'KeyH' },
  { label: 'level-one headings', key: '1', code: 'Digit1' },
  { label: 'level-two headings', key: '2', code: 'Digit2' },
  { label: 'level-three headings', key: '3', code: 'Digit3' },
  { label: 'level-four headings', key: '4', code: 'Digit4' },
  { label: 'level-five headings', key: '5', code: 'Digit5' },
  { label: 'level-six headings', key: '6', code: 'Digit6' },
  { label: 'scroll containers', key: 's', code: 'KeyS' },
];

const dispatchKey = (target, key, code, modifiers = {}) => {
  const event = new KeyboardEvent('keydown', {
    key,
    code,
    bubbles: true,
    composed: true,
    cancelable: true,
    ...modifiers,
  });
  target.dispatchEvent(event);
  return event;
};

const createOpenKeyNav = (options = {}) => {
  const openKeyNav = new OpenKeyNav();
  openKeyNav.config.debug.keyboardAccessible = false;
  openKeyNav.config.debug.screenReaderVisible = true;
  openKeyNav.config.modesConfig.structuralNavigation.displayCheck = 'none';
  openKeyNav.config.modesConfig.structuralNavigation.status.enabled = false;
  openKeyNav.config.modesConfig.structuralNavigation.contextIndicator.enabled = false;
  openKeyNav.deepMerge(openKeyNav.config, options);
  openKeyNav.meta.enabled.value = true;
  openKeyNav.addKeydownEventListener();
  return openKeyNav;
};

describe('keypress structural-mode arbitration', () => {
  let openKeyNav;

  beforeEach(() => {
    document.body.innerHTML = `
      <main aria-label="Workspace">
        <h1>Level one</h1>
        <h2>Level two</h2>
        <h3>Level three</h3>
        <h4>Level four</h4>
        <h5>Level five</h5>
        <h6>Level six</h6>
        <button id="current">Current target</button>
        <div id="scroll-container">Scrollable content</div>
      </main>
    `;
  });

  afterEach(() => {
    openKeyNav?.destroy();
    document.body.innerHTML = '';
  });

  it.each(LEGACY_FOCUS_COMMANDS)(
    'consumes the legacy $label command without moving focus or changing context',
    ({ key, code }) => {
      openKeyNav = createOpenKeyNav();
      const current = document.getElementById('current');
      const scrollContainer = document.getElementById('scroll-container');
      openKeyNav.getScrollableElements = () => [scrollContainer];
      current.focus();
      openKeyNav.enterStructuralNavigation();

      const contextBefore = openKeyNav.getStructuralNavigationState().activeContext.id;
      const focusSpy = vi.spyOn(openKeyNav, 'focus');
      let reachedPage = false;
      current.addEventListener('keydown', () => {
        reachedPage = true;
      });

      const event = dispatchKey(current, key, code);

      expect(event.defaultPrevented).toBe(true);
      expect(reachedPage).toBe(false);
      expect(document.activeElement).toBe(current);
      expect(openKeyNav.getStructuralNavigationState().activeContext.id)
        .toBe(contextBefore);
      expect(focusSpy).not.toHaveBeenCalled();
      expect(document.querySelector('[data-openkeynav-tabIndexed]')).toBeNull();
      expect(document.querySelector('h1[tabindex], h2[tabindex], h3[tabindex], h4[tabindex], h5[tabindex], h6[tabindex]'))
        .toBeNull();
      expect(scrollContainer.hasAttribute('tabindex')).toBe(false);
    }
  );

  it('passes an explicitly delegated character command through to the page', () => {
    openKeyNav = createOpenKeyNav({
      modesConfig: {
        structuralNavigation: {
          ownsKey: event => ({ character: event.key.toLowerCase() === 'h' }),
        },
      },
    });
    const current = document.getElementById('current');
    current.focus();
    openKeyNav.enterStructuralNavigation();
    const contextBefore = openKeyNav.getStructuralNavigationState().activeContext.id;
    const focusSpy = vi.spyOn(openKeyNav, 'focus');
    let reachedPage = false;
    current.addEventListener('keydown', () => {
      reachedPage = true;
    });

    const event = dispatchKey(current, 'h', 'KeyH');

    expect(event.defaultPrevented).toBe(false);
    expect(reachedPage).toBe(true);
    expect(document.activeElement).toBe(current);
    expect(openKeyNav.getStructuralNavigationState().activeContext.id)
      .toBe(contextBefore);
    expect(focusSpy).not.toHaveBeenCalled();
    expect(document.querySelector('[data-openkeynav-tabIndexed]')).toBeNull();
  });

  it.each([
    { label: 'Control+H', key: 'h', code: 'KeyH', modifiers: { ctrlKey: true } },
    { label: 'Alt+S', key: 's', code: 'KeyS', modifiers: { altKey: true } },
    { label: 'Meta+1', key: '1', code: 'Digit1', modifiers: { metaKey: true } },
  ])('passes the system shortcut $label through without invoking legacy navigation', ({ key, code, modifiers }) => {
    openKeyNav = createOpenKeyNav();
    const current = document.getElementById('current');
    current.focus();
    openKeyNav.enterStructuralNavigation();
    const focusSpy = vi.spyOn(openKeyNav, 'focus');
    let reachedPage = false;
    current.addEventListener('keydown', () => {
      reachedPage = true;
    });

    const event = dispatchKey(current, key, code, modifiers);

    expect(event.defaultPrevented).toBe(false);
    expect(reachedPage).toBe(true);
    expect(document.activeElement).toBe(current);
    expect(focusSpy).not.toHaveBeenCalled();
    expect(document.querySelector('[data-openkeynav-tabIndexed]')).toBeNull();
  });

  it.each([
    {
      label: 'text input',
      markup: '<input id="owner" aria-label="Editor">',
      key: 'H',
      code: 'KeyH',
      modifiers: { shiftKey: true },
    },
    {
      label: 'editable content',
      markup: '<div id="owner" contenteditable="true" tabindex="0">Editor</div>',
      key: 'S',
      code: 'KeyS',
      modifiers: { shiftKey: true },
    },
    {
      label: 'ARIA composite widget',
      markup: '<div role="tablist"><button id="owner" role="tab">Tab</button></div>',
      key: '3',
      code: 'Digit3',
      modifiers: {},
    },
  ])('preserves the $label character-key ownership', ({ markup, key, code, modifiers }) => {
    document.getElementById('current').insertAdjacentHTML('afterend', markup);
    openKeyNav = createOpenKeyNav();
    const owner = document.getElementById('owner');
    owner.focus();
    openKeyNav.enterStructuralNavigation();
    const contextBefore = openKeyNav.getStructuralNavigationState().activeContext.id;
    const focusSpy = vi.spyOn(openKeyNav, 'focus');
    let reachedPage = false;
    owner.addEventListener('keydown', () => {
      reachedPage = true;
    });

    const event = dispatchKey(owner, key, code, modifiers);

    expect(event.defaultPrevented).toBe(false);
    expect(reachedPage).toBe(true);
    expect(document.activeElement).toBe(owner);
    expect(openKeyNav.getStructuralNavigationState().activeContext.id)
      .toBe(contextBefore);
    expect(focusSpy).not.toHaveBeenCalled();
    expect(document.querySelector('[data-openkeynav-tabIndexed]')).toBeNull();
  });
});
