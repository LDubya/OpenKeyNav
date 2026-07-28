/**
 * @vitest-environment jsdom
 */
import OpenKeyNav from '../src/OpenKeyNav.js';
import {
  classifyStructuralKeyOwnership,
  matchesStructuralShortcut,
} from '../src/structuralNavigation.js';

const nextTask = () => new Promise(resolve => setTimeout(resolve, 0));

const createOpenKeyNav = (options = {}) => {
  const openKeyNav = new OpenKeyNav();
  openKeyNav.config.debug.keyboardAccessible = false;
  openKeyNav.config.modesConfig.structuralNavigation.displayCheck = 'none';
  openKeyNav.deepMerge(openKeyNav.config, options);
  openKeyNav.meta.enabled.value = true;
  return openKeyNav;
};

const dispatchKey = (target, key, modifiers = {}) => {
  const event = new KeyboardEvent('keydown', {
    key,
    code: modifiers.code,
    bubbles: true,
    composed: true,
    cancelable: true,
    ...modifiers,
  });
  target.dispatchEvent(event);
  return event;
};

describe('structural navigation key policy', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('matches exact shortcuts and rejects unconfigured modifiers', () => {
    expect(matchesStructuralShortcut(
      { key: 'ArrowRight', altKey: false, ctrlKey: false, metaKey: false, shiftKey: true },
      { key: 'ArrowRight', shiftKey: true }
    )).toBe(true);
    expect(matchesStructuralShortcut(
      { key: 'ArrowRight', altKey: true, ctrlKey: false, metaKey: false, shiftKey: true },
      { key: 'ArrowRight', shiftKey: true }
    )).toBe(false);
  });

  it('classifies editing and composite widgets without claiming checkboxes', () => {
    document.body.innerHTML = `
      <input id="text">
      <input id="checkbox" type="checkbox">
      <div id="tabs" role="tablist"><button id="tab" role="tab">Tab</button></div>
    `;

    const ownershipFor = target => classifyStructuralKeyOwnership({
      target,
      composedPath: () => {
        const path = [];
        let current = target;
        while (current) {
          path.push(current);
          current = current.parentNode;
        }
        return path;
      },
    });

    expect(ownershipFor(document.getElementById('text')).arrows).toBe(true);
    expect(ownershipFor(document.getElementById('checkbox')).arrows).toBe(false);
    expect(ownershipFor(document.getElementById('tab')).arrows).toBe(true);
  });

  it('supports application-declared ownership', () => {
    const target = document.createElement('div');
    const event = {
      target,
      composedPath: () => [target],
    };
    expect(classifyStructuralKeyOwnership(event, {
      ownsKey: () => ({ arrows: true, escape: true }),
    })).toMatchObject({ arrows: true, escape: true });
    expect(classifyStructuralKeyOwnership(event, {
      ownsKey: () => true,
    })).toMatchObject({ all: true });
  });
});

describe('StructuralNavigationController', () => {
  let openKeyNav;

  afterEach(() => {
    openKeyNav?.destroy();
    document.body.innerHTML = '';
  });

  it('moves real focus, broadens/narrows without moving, and navigates horizontally', async () => {
    document.body.innerHTML = `
      <main aria-labelledby="main-title">
        <h1 id="main-title">Catalog</h1>
        <section id="filters" aria-labelledby="filters-title">
          <h2 id="filters-title">Filters</h2>
          <button id="clear-filters">Clear filters</button>
          <fieldset id="availability">
            <legend>Availability</legend>
            <input id="stock" type="checkbox">
            <input id="preorder" type="checkbox">
          </fieldset>
        </section>
        <section id="results" aria-labelledby="results-title">
          <h2 id="results-title">Results</h2>
          <a id="result-a" href="#a">A</a>
          <a id="result-b" href="#b">B</a>
        </section>
      </main>
    `;
    openKeyNav = createOpenKeyNav();
    document.getElementById('stock').focus();

    expect(openKeyNav.enterStructuralNavigation()).toBe(true);
    expect(document.activeElement.id).toBe('stock');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Availability');

    openKeyNav.structuralNavigate('nextTarget');
    expect(document.activeElement.id).toBe('preorder');

    openKeyNav.structuralNavigate('nextTarget');
    expect(document.querySelector('.openKeyNav-structural-status').textContent)
      .toContain('End of this context');
    await nextTask();
    expect(document.querySelector('.openKeyNav-structural-status').textContent)
      .toContain('End of this context');

    openKeyNav.structuralNavigate('broadenContext');
    expect(document.activeElement.id).toBe('preorder');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Filters');

    openKeyNav.structuralNavigate('narrowContext');
    expect(document.activeElement.id).toBe('preorder');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Availability');

    openKeyNav.structuralNavigate('broadenContext');
    openKeyNav.structuralNavigate('nextSiblingContext');
    expect(document.activeElement.id).toBe('result-a');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Results');

    expect(openKeyNav.exitStructuralNavigation()).toBe(true);
    expect(document.activeElement.id).toBe('result-a');
    expect(document.querySelector('.openKeyNav-structural-status')).toBeNull();
  });

  it('passes widget arrows through and accepts the configured Alt override', () => {
    document.body.innerHTML = `
      <section aria-label="Widgets">
        <input id="editor" value="abc">
      </section>
      <section aria-label="Next widgets">
        <textarea id="next">next</textarea>
        <button id="after">After</button>
      </section>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    document.getElementById('editor').focus();
    openKeyNav.enterStructuralNavigation();

    const nativeArrow = dispatchKey(
      document.getElementById('editor'),
      'ArrowRight'
    );
    expect(nativeArrow.defaultPrevented).toBe(false);
    expect(document.activeElement.id).toBe('editor');

    const ownedStructuralArrow = dispatchKey(
      document.getElementById('editor'),
      'ArrowRight',
      { shiftKey: true }
    );
    expect(ownedStructuralArrow.defaultPrevented).toBe(false);
    expect(document.activeElement.id).toBe('editor');

    const overrideArrow = dispatchKey(
      document.getElementById('editor'),
      'ArrowRight',
      { altKey: true, shiftKey: true }
    );
    expect(overrideArrow.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('next');

    const exit = dispatchKey(
      document.getElementById('next'),
      'r',
      { altKey: true, code: 'KeyR' }
    );
    expect(exit.defaultPrevented).toBe(true);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(false);
    expect(document.activeElement.id).toBe('next');
  });

  it('cycles explicit typed contexts while preserving one target identity', () => {
    document.body.innerHTML = `
      <section aria-label="Workspace">
        <button id="row-before">Row before</button>
        <button id="column-before">Column before</button>
        <input id="typed-input" aria-label="Typed input">
        <button id="current">Current</button>
        <button id="row-after">Row after</button>
        <button id="column-after">Column after</button>
      </section>
      <section aria-label="Next workspace">
        <button id="structural-next">Structural next</button>
      </section>
    `;
    const current = document.getElementById('current');
    const typedInput = document.getElementById('typed-input');
    openKeyNav = createOpenKeyNav({
      modesConfig: {
        structuralNavigation: {
          commands: {
            nextPeerContext: { key: 'F8' },
          },
          typedContexts: [
            {
              id: 'row',
              name: 'Row',
              type: 'row',
              priority: 1,
              provenance: 'test',
              targets: () => [
                document.getElementById('row-before'),
                typedInput,
                current,
                document.getElementById('row-after'),
              ],
            },
            {
              id: 'column',
              name: 'Column',
              type: 'column',
              priority: 2,
              provenance: 'test',
              targets: () => [
                document.getElementById('column-before'),
                current,
                document.getElementById('column-after'),
              ],
            },
          ],
        },
      },
    });
    openKeyNav.addKeydownEventListener();
    typedInput.focus();
    openKeyNav.enterStructuralNavigation();

    // A text field owns editing arrows and character input, not a configured
    // function-key command.
    const typedShortcut = dispatchKey(typedInput, 'F8');
    expect(typedShortcut.defaultPrevented).toBe(true);
    expect(openKeyNav.getStructuralNavigationState().activeContext.name).toBe('Row');
    openKeyNav.structuralNavigate('nextPeerContext');
    expect(openKeyNav.getStructuralNavigationState().activeTypedContext).toBeNull();

    current.focus();
    openKeyNav.structuralNavigate('nextPeerContext');
    expect(document.activeElement).toBe(current);
    expect(openKeyNav.getStructuralNavigationState().activeContext.name).toBe('Row');

    openKeyNav.structuralNavigate('nextTarget');
    expect(document.activeElement.id).toBe('row-after');
    openKeyNav.structuralNavigate('previousTarget');
    expect(document.activeElement).toBe(current);

    openKeyNav.structuralNavigate('nextPeerContext');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name).toBe('Column');
    openKeyNav.structuralNavigate('nextPeerContext');
    expect(document.activeElement).toBe(current);
    expect(openKeyNav.getStructuralNavigationState().activeTypedContext).toBeNull();

    // Typed routes remain explicitly available, but never intercept the
    // default structural horizontal shortcut.
    openKeyNav.structuralNavigate('nextPeerContext');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name).toBe('Row');
    const structuralSibling = dispatchKey(current, 'ArrowRight', { shiftKey: true });
    expect(structuralSibling.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('structural-next');
    expect(openKeyNav.getStructuralNavigationState().activeTypedContext).toBeNull();
  });

  it('uses structural siblings when contexts have no heading level', () => {
    document.body.innerHTML = `
      <main aria-label="Catalog">
        <section aria-label="Filters">
          <button id="clear">Clear filters</button>
        </section>
        <section aria-label="Results">
          <a id="result-a" href="#a">Result A</a>
          <a id="result-b" href="#b">Result B</a>
        </section>
      </main>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    document.getElementById('result-b').focus();
    openKeyNav.enterStructuralNavigation();

    expect(openKeyNav.config.modesConfig.structuralNavigation.commands)
      .toMatchObject({ previousTarget: null, nextTarget: null });
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Results');
    expect(document.querySelector('.openKeyNav-structural-status').textContent)
      .toContain('Sibling contexts: Filters');

    const previousSibling = dispatchKey(
      document.getElementById('result-b'),
      'ArrowLeft',
      { shiftKey: true }
    );
    expect(previousSibling.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('clear');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Filters');

    const bareArrows = ['ArrowLeft', 'ArrowRight', 'ArrowDown'].map(key => (
      dispatchKey(document.getElementById('clear'), key)
    ));
    expect(bareArrows.every(event => event.defaultPrevented === false)).toBe(true);
    expect(document.activeElement.id).toBe('clear');

    const nextSibling = dispatchKey(
      document.getElementById('clear'),
      'ArrowRight',
      { shiftKey: true }
    );
    expect(nextSibling.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('result-a');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Results');
  });

  it('moves between same-rank headings across parents and enters the first target', () => {
    document.body.innerHTML = `
      <h2>First family</h2>
      <h3>Current level-three context</h3>
      <button id="current-first">Current first</button>
      <button id="current-last">Current last</button>
      <h2>Second family</h2>
      <h3>Next level-three context</h3>
      <button id="next-first">Next first</button>
      <button id="next-last">Next last</button>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    document.getElementById('current-last').focus();
    openKeyNav.enterStructuralNavigation();

    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Current level-three context');
    expect(openKeyNav.getStructuralNavigationState().activeContext.headingLevel)
      .toBe(3);

    const nextLevel = dispatchKey(
      document.getElementById('current-last'),
      'ArrowRight',
      { shiftKey: true }
    );
    expect(nextLevel.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('next-first');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Next level-three context');

    const previousLevel = dispatchKey(
      document.getElementById('next-first'),
      'ArrowLeft',
      { shiftKey: true }
    );
    expect(previousLevel.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('current-first');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Current level-three context');

    const boundary = dispatchKey(
      document.getElementById('current-first'),
      'ArrowLeft',
      { shiftKey: true }
    );
    expect(boundary.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('current-first');
    expect(document.querySelector('.openKeyNav-structural-status').textContent)
      .toContain('No previous context at heading level 3');
  });

  it('draws a non-focusable indicator around the active structural context', () => {
    document.body.innerHTML = `
      <main aria-label="Catalog">
        <section id="filters" aria-label="Filters">
          <button id="clear">Clear filters</button>
        </section>
        <section id="results" aria-label="Results">
          <a id="result" href="#result">Result</a>
        </section>
      </main>
    `;
    const filters = document.getElementById('filters');
    const results = document.getElementById('results');
    filters.getBoundingClientRect = () => ({
      left: 20, top: 30, right: 220, bottom: 130, width: 200, height: 100,
    });
    results.getBoundingClientRect = () => ({
      left: 20, top: 150, right: 320, bottom: 270, width: 300, height: 120,
    });

    openKeyNav = createOpenKeyNav();
    document.getElementById('clear').focus();
    openKeyNav.enterStructuralNavigation();
    openKeyNav.structuralNavigation.updateContextIndicator();

    const indicator = document.querySelector(
      '.openKeyNav-structural-context-outline'
    );
    expect(indicator).not.toBeNull();
    expect(indicator.getAttribute('aria-hidden')).toBe('true');
    expect(indicator.hasAttribute('tabindex')).toBe(false);
    expect(indicator.dataset.contextName).toBe('Filters');
    expect(indicator.style.left).toBe('16px');
    expect(indicator.style.top).toBe('26px');

    openKeyNav.structuralNavigate('nextSiblingContext');
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(indicator.dataset.contextName).toBe('Results');
    expect(indicator.style.top).toBe('146px');

    openKeyNav.exitStructuralNavigation();
    expect(document.querySelector('.openKeyNav-structural-context-outline'))
      .toBeNull();
  });

  it('invalidates lazily and re-enters at the first live target after removal', async () => {
    document.body.innerHTML = `
      <section aria-label="Dynamic">
        <button id="a">A</button>
        <span id="slot"></span>
        <button id="c">C</button>
      </section>
    `;
    openKeyNav = createOpenKeyNav();
    document.getElementById('a').focus();
    openKeyNav.enterStructuralNavigation();

    const inserted = document.createElement('button');
    inserted.id = 'b';
    inserted.textContent = 'B';
    document.getElementById('slot').appendChild(inserted);
    await nextTask();
    expect(document.activeElement.id).toBe('a');

    openKeyNav.structuralNavigate('nextTarget');
    expect(document.activeElement.id).toBe('b');
    inserted.remove();
    await nextTask();
    expect(document.activeElement).toBe(document.body);

    openKeyNav.structuralNavigate('nextTarget');
    expect(document.activeElement.id).toBe('a');
  });

  it('supports explicit invalidation for non-DOM application state', () => {
    document.body.innerHTML = `
      <section aria-label="Filtered">
        <button id="a">A</button>
        <button id="b">B</button>
        <button id="c">C</button>
      </section>
    `;
    let includeMiddle = true;
    openKeyNav = createOpenKeyNav({
      modesConfig: {
        structuralNavigation: {
          targetFilter: target => includeMiddle || target.id !== 'b',
        },
      },
    });
    document.getElementById('a').focus();
    openKeyNav.enterStructuralNavigation();

    includeMiddle = false;
    expect(openKeyNav.invalidateStructuralNavigation()).toBe(openKeyNav);
    expect(document.activeElement.id).toBe('a');

    openKeyNav.structuralNavigate('nextTarget');
    expect(document.activeElement.id).toBe('c');
  });

  it('does not duplicate capture listeners across repeated init', () => {
    document.body.innerHTML = `
      <section aria-label="One context">
        <button id="one">One</button>
      </section>
      <section aria-label="Two context">
        <button id="two">Two</button>
      </section>
      <section aria-label="Three context">
        <button id="three">Three</button>
      </section>
    `;
    openKeyNav = new OpenKeyNav();
    openKeyNav.init({
      debug: { keyboardAccessible: false },
      modesConfig: {
        structuralNavigation: { displayCheck: 'none' },
      },
    });
    openKeyNav.init();
    openKeyNav.enable();
    document.getElementById('one').focus();
    openKeyNav.enterStructuralNavigation();

    dispatchKey(document.getElementById('one'), 'ArrowRight', { shiftKey: true });
    expect(document.activeElement.id).toBe('two');
  });
});
