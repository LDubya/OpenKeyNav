/**
 * @vitest-environment jsdom
 */
import OpenKeyNav from '../src/OpenKeyNav.js';

const nextTask = () => new Promise(resolve => setTimeout(resolve, 0));

const LEGACY_FOCUS_COMMANDS = [
  { label: 'all headings', key: 'h', code: 'KeyH', selector: 'h1' },
  { label: 'level-one headings', key: '1', code: 'Digit1', selector: 'h1' },
  { label: 'level-two headings', key: '2', code: 'Digit2', selector: 'h2' },
  { label: 'level-three headings', key: '3', code: 'Digit3', selector: 'h3' },
  { label: 'level-four headings', key: '4', code: 'Digit4', selector: 'h4' },
  { label: 'level-five headings', key: '5', code: 'Digit5', selector: 'h5' },
  { label: 'level-six headings', key: '6', code: 'Digit6', selector: 'h6' },
  { label: 'scroll containers', key: 's', code: 'KeyS', selector: '#scroll-container' },
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
        <button id="next">Next target</button>
        <div id="scroll-container">Scrollable content</div>
      </main>
    `;
  });

  afterEach(() => {
    openKeyNav?.destroy();
    document.body.innerHTML = '';
  });

  it.each(LEGACY_FOCUS_COMMANDS)(
    'runs the $label command without leaving Structural Navigation',
    ({ key, code, selector }) => {
      openKeyNav = createOpenKeyNav();
      const current = document.getElementById('current');
      const scrollContainer = document.getElementById('scroll-container');
      openKeyNav.getScrollableElements = () => [scrollContainer];
      current.focus();
      openKeyNav.enterStructuralNavigation();

      const focusSpy = vi.spyOn(openKeyNav, 'focus');
      let reachedPage = false;
      current.addEventListener('keydown', () => {
        reachedPage = true;
      });

      const event = dispatchKey(current, key, code);

      expect(event.defaultPrevented).toBe(true);
      expect(reachedPage).toBe(false);
      expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
      expect(document.activeElement.matches(selector)).toBe(true);
      expect(focusSpy).toHaveBeenCalledTimes(1);
      expect(document.activeElement.getAttribute('tabindex')).toBe('-1');
      expect(document.activeElement.getAttribute('data-openkeynav-tabIndexed')).toBe('true');

      if (key === 's') {
        expect(openKeyNav.config.scrollables.currentScrollableIndex).toBe(0);
        expect(Object.hasOwn(openKeyNav.config, 'currentScrollableIndex')).toBe(false);
      }
    }
  );

  it.each([
    { label: 'Click Mode', key: 'k', code: 'KeyK', mode: 'clicking' },
    { label: 'Move Mode', key: 'm', code: 'KeyM', mode: 'moving' },
    { label: 'shortcut menu', key: 'o', code: 'KeyO', mode: 'menu' },
  ])('opens $label over Structural Navigation', ({ key, code, mode }) => {
    openKeyNav = createOpenKeyNav();
    const current = document.getElementById('current');
    current.focus();
    openKeyNav.enterStructuralNavigation();

    const event = dispatchKey(current, key, code);

    expect(event.defaultPrevented).toBe(true);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
    expect(openKeyNav.config.modes[mode].value).toBe(true);
    expect(document.activeElement).toBe(current);
  });

  it.each([
    {
      label: 'k',
      key: 'k',
      modifiers: {},
      expectedModifier: false,
    },
    {
      label: 'Shift+K',
      key: 'K',
      modifiers: { shiftKey: true },
      expectedModifier: true,
    },
  ])('opens Click Mode with $label', ({ key, modifiers, expectedModifier }) => {
    openKeyNav = createOpenKeyNav();
    const current = document.getElementById('current');
    current.focus();

    const event = dispatchKey(current, key, 'KeyK', modifiers);

    expect(event.defaultPrevented).toBe(true);
    expect(openKeyNav.config.modes.clicking.value).toBe(true);
    expect(openKeyNav.config.modesConfig.click.modifier).toBe(expectedModifier);
  });

  it.each([
    { mode: 'clicking', activationKey: 'k', activationCode: 'KeyK' },
    { mode: 'moving', activationKey: 'm', activationCode: 'KeyM' },
    { mode: 'menu', activationKey: 'o', activationCode: 'KeyO' },
  ])('lets Escape dismiss $mode while Structural Navigation stays active', ({
    mode,
    activationKey,
    activationCode,
  }) => {
    openKeyNav = createOpenKeyNav();
    const current = document.getElementById('current');
    current.focus();
    openKeyNav.enterStructuralNavigation();
    dispatchKey(current, activationKey, activationCode);

    const event = dispatchKey(current, 'Escape', 'Escape');

    expect(event.defaultPrevented).toBe(true);
    expect(openKeyNav.config.modes[mode].value).toBe(false);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
    expect(document.activeElement).toBe(current);
  });

  it('cancels a selected Move Mode source without dispatching a drop', () => {
    openKeyNav = createOpenKeyNav();
    const current = document.getElementById('current');
    const selectedMoveable = document.getElementById('next');
    current.focus();

    openKeyNav.config.modes.moving.value = true;
    openKeyNav.config.modesConfig.move.selectedMoveable = selectedMoveable;
    selectedMoveable.setAttribute('data-openkeynav-moveconfig', '0');
    selectedMoveable.setAttribute('data-openkeynav-draggable', 'true');

    const dragEndListener = vi.fn();
    const dropListener = vi.fn();
    selectedMoveable.addEventListener('dragend', dragEndListener);
    document.body.addEventListener('drop', dropListener);

    const event = dispatchKey(current, 'Escape', 'Escape');

    expect(event.defaultPrevented).toBe(true);
    expect(dragEndListener).toHaveBeenCalledTimes(1);
    expect(dropListener).not.toHaveBeenCalled();
    expect(openKeyNav.config.modes.moving.value).toBe(false);
    expect(openKeyNav.config.modesConfig.move.selectedMoveable).toBe(false);
    expect(selectedMoveable.hasAttribute('data-openkeynav-moveconfig')).toBe(false);
    expect(selectedMoveable.hasAttribute('data-openkeynav-draggable')).toBe(false);
  });

  it('keeps callback-driven Move Mode separate from synthetic drag events', () => {
    const callback = vi.fn();
    openKeyNav = createOpenKeyNav({
      modesConfig: {
        move: {
          config: [
            {
              fromElements: '#current',
              toElements: '#next',
              callback,
            },
          ],
        },
      },
    });
    openKeyNav.isNonzeroSize = () => true;
    openKeyNav.isAnyCornerVisible = () => true;

    const source = document.getElementById('current');
    const destination = document.getElementById('next');
    const syntheticEventListener = vi.fn();
    const visibleRect = {
      top: 10,
      right: 110,
      bottom: 50,
      left: 10,
      width: 100,
      height: 40,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    };

    source.getBoundingClientRect = () => visibleRect;
    destination.getBoundingClientRect = () => visibleRect;

    ['mousedown', 'touchstart', 'dragstart', 'dragend'].forEach((eventName) => {
      source.addEventListener(eventName, syntheticEventListener);
    });

    source.setAttribute('data-openkeynav-label', 'a');
    source.setAttribute('data-openkeynav-moveconfig', '0');
    openKeyNav.config.modes.moving.value = true;

    dispatchKey(source, 'a', 'KeyA');

    expect(openKeyNav.config.modesConfig.move.selectedMoveable).toBe(source);
    expect(destination.getAttribute('data-openkeynav-label')).toBe('a');
    expect(syntheticEventListener).not.toHaveBeenCalled();

    dispatchKey(source, 'a', 'KeyA');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(source, destination);
    expect(syntheticEventListener).not.toHaveBeenCalled();
  });

  it('cancels callback-driven Move Mode without manufacturing dragend', () => {
    openKeyNav = createOpenKeyNav({
      modesConfig: {
        move: {
          config: [
            {
              fromElements: '#next',
              toElements: '#current',
              callback: vi.fn(),
            },
          ],
        },
      },
    });
    const current = document.getElementById('current');
    const selectedMoveable = document.getElementById('next');
    const dragEndListener = vi.fn();

    openKeyNav.config.modes.moving.value = true;
    openKeyNav.config.modesConfig.move.selectedConfig = 0;
    openKeyNav.config.modesConfig.move.selectedMoveable = selectedMoveable;
    selectedMoveable.addEventListener('dragend', dragEndListener);

    const event = dispatchKey(current, 'Escape', 'Escape');

    expect(event.defaultPrevented).toBe(true);
    expect(dragEndListener).not.toHaveBeenCalled();
    expect(openKeyNav.config.modesConfig.move.selectedMoveable).toBe(false);
  });

  it.each([
    { mode: 'clicking', activationKey: 'k', activationCode: 'KeyK' },
    { mode: 'moving', activationKey: 'm', activationCode: 'KeyM' },
    { mode: 'menu', activationKey: 'o', activationCode: 'KeyO' },
  ])('lets the configured q escape dismiss $mode while Structural Navigation stays active', ({
    mode,
    activationKey,
    activationCode,
  }) => {
    openKeyNav = createOpenKeyNav();
    const current = document.getElementById('current');
    current.focus();
    openKeyNav.enterStructuralNavigation();
    dispatchKey(current, activationKey, activationCode);

    const event = dispatchKey(current, 'q', 'KeyQ');

    expect(event.defaultPrevented).toBe(true);
    expect(openKeyNav.config.modes[mode].value).toBe(false);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
    expect(document.activeElement).toBe(current);
  });

  it.each([
    { label: 'activation key', key: 'r', code: 'KeyR', options: {} },
    {
      label: 'configured Structural command key',
      key: 'h',
      code: 'KeyH',
      options: {
        modesConfig: {
          structuralNavigation: {
            commands: { nextTarget: { key: 'h' } },
          },
        },
      },
    },
  ])('gives a Click Mode label its $label while preserving Structural Navigation', async ({
    key,
    code,
    options,
  }) => {
    openKeyNav = createOpenKeyNav(options);
    const current = document.getElementById('current');
    const clicked = document.getElementById('next');
    clicked.setAttribute('data-openkeynav-label', key);
    current.focus();
    openKeyNav.enterStructuralNavigation();
    openKeyNav.config.modes.clicking.value = true;
    // The modifier variant focuses the selected target without synthesizing a
    // MouseEvent, which jsdom cannot construct with its document view here.
    openKeyNav.config.modesConfig.click.modifier = true;

    const event = dispatchKey(current, key, code);

    expect(event.defaultPrevented).toBe(true);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
    expect(openKeyNav.config.modes.clicking.value).toBe(true);

    await nextTask();

    expect(document.activeElement).toBe(clicked);
    expect(openKeyNav.config.modes.clicking.value).toBe(false);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
  });

  it('gives an explicitly configured Structural command precedence over a heading command', () => {
    openKeyNav = createOpenKeyNav({
      modesConfig: {
        structuralNavigation: {
          commands: {
            nextTarget: { key: 'h' },
          },
        },
      },
    });
    const current = document.getElementById('current');
    current.focus();
    openKeyNav.enterStructuralNavigation();

    const event = dispatchKey(current, 'h', 'KeyH');

    expect(event.defaultPrevented).toBe(true);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
    expect(document.activeElement).toBe(document.getElementById('next'));
    expect(document.querySelector('h1[tabindex], h2[tabindex], h3[tabindex], h4[tabindex], h5[tabindex], h6[tabindex]'))
      .toBeNull();
  });

  it.each([
    { key: 'a', code: 'KeyA' },
    { key: 'n', code: 'KeyN' },
    { key: 'd', code: 'KeyD' },
    { key: 'f', code: 'KeyF' },
    { key: 'v', code: 'KeyV' },
    { key: 'x', code: 'KeyX' },
  ])('leaves the unrelated $key key available to the page', ({ key, code }) => {
    openKeyNav = createOpenKeyNav();
    const current = document.getElementById('current');
    current.focus();
    openKeyNav.enterStructuralNavigation();
    let reachedPage = false;
    current.addEventListener('keydown', () => {
      reachedPage = true;
    });

    const event = dispatchKey(current, key, code);

    expect(event.defaultPrevented).toBe(false);
    expect(reachedPage).toBe(true);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
    expect(document.activeElement).toBe(current);
  });

  it('uses the global toggle to disable Structural Navigation and every foreground mode', () => {
    openKeyNav = createOpenKeyNav();
    const current = document.getElementById('current');
    const next = document.getElementById('next');
    current.focus();
    openKeyNav.enterStructuralNavigation();
    openKeyNav.config.modes.clicking.value = true;
    openKeyNav.config.modes.moving.value = true;
    openKeyNav.config.modes.menu.value = true;
    next.setAttribute('data-openkeynav-label', 'a');
    const overlay = document.createElement('div');
    overlay.className = 'openKeyNav-label';
    overlay.setAttribute('data-openkeynav-label', 'a');
    document.body.appendChild(overlay);

    const event = dispatchKey(current, 'O', 'KeyO', { shiftKey: true });

    expect(event.defaultPrevented).toBe(true);
    expect(openKeyNav.meta.enabled.value).toBe(false);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(false);
    expect(openKeyNav.config.modes.clicking.value).toBe(false);
    expect(openKeyNav.config.modes.moving.value).toBe(false);
    expect(openKeyNav.config.modes.menu.value).toBe(false);
    expect(document.querySelector('.openKeyNav-label')).toBeNull();
    expect(next.hasAttribute('data-openkeynav-label')).toBe(false);
    expect(document.activeElement).toBe(current);
  });

  it.each([
    { label: 'plain activation key', key: 'r', code: 'KeyR', modifiers: {} },
    { label: 'configured Alt exit', key: 'r', code: 'KeyR', modifiers: { altKey: true } },
    { label: 'configured alternate escape', key: 'q', code: 'KeyQ', modifiers: {} },
  ])('lets the $label explicitly exit Structural Navigation', ({
    key,
    code,
    modifiers,
  }) => {
    openKeyNav = createOpenKeyNav();
    const current = document.getElementById('current');
    current.focus();
    openKeyNav.enterStructuralNavigation();

    const event = dispatchKey(current, key, code, modifiers);

    expect(event.defaultPrevented).toBe(true);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(false);
    expect(openKeyNav.getStructuralNavigationState().active).toBe(false);
    expect(openKeyNav.getStructuralNavigationState().activeContext).toBeNull();
    expect(document.activeElement).toBe(current);
  });

  it('keeps the configured Alt+R exit available over a foreground mode', () => {
    openKeyNav = createOpenKeyNav();
    const current = document.getElementById('current');
    current.focus();
    openKeyNav.enterStructuralNavigation();
    dispatchKey(current, 'k', 'KeyK');

    const event = dispatchKey(current, 'r', 'KeyR', { altKey: true });

    expect(event.defaultPrevented).toBe(true);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(false);
    expect(openKeyNav.config.modes.clicking.value).toBe(true);
    expect(document.activeElement).toBe(current);
  });

  it.each([
    { key: 'h', code: 'KeyH', mode: null },
    { key: 'k', code: 'KeyK', mode: 'clicking' },
    { key: 'm', code: 'KeyM', mode: 'moving' },
    { key: 'o', code: 'KeyO', mode: 'menu' },
  ])('passes the explicitly delegated $key command through to the page', ({ key, code, mode }) => {
    openKeyNav = createOpenKeyNav({
      modesConfig: {
        structuralNavigation: {
          ownsKey: event => ({ character: event.key.toLowerCase() === key }),
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

    const event = dispatchKey(current, key, code);

    expect(event.defaultPrevented).toBe(false);
    expect(reachedPage).toBe(true);
    expect(document.activeElement).toBe(current);
    expect(openKeyNav.getStructuralNavigationState().activeContext.id)
      .toBe(contextBefore);
    expect(focusSpy).not.toHaveBeenCalled();
    expect(document.querySelector('[data-openkeynav-tabIndexed]')).toBeNull();
    if (mode) expect(openKeyNav.config.modes[mode].value).toBe(false);
  });

  it.each([
    { label: 'Control+H', key: 'h', code: 'KeyH', modifiers: { ctrlKey: true } },
    { label: 'Alt+S', key: 's', code: 'KeyS', modifiers: { altKey: true } },
    { label: 'Meta+1', key: '1', code: 'Digit1', modifiers: { metaKey: true } },
    { label: 'Control+K', key: 'k', code: 'KeyK', modifiers: { ctrlKey: true } },
    { label: 'Alt+M', key: 'm', code: 'KeyM', modifiers: { altKey: true } },
    { label: 'Meta+O', key: 'o', code: 'KeyO', modifiers: { metaKey: true } },
    { label: 'Control+Q', key: 'q', code: 'KeyQ', modifiers: { ctrlKey: true } },
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
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
    expect(openKeyNav.config.modes.clicking.value).toBe(false);
    expect(openKeyNav.config.modes.moving.value).toBe(false);
    expect(openKeyNav.config.modes.menu.value).toBe(false);
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
