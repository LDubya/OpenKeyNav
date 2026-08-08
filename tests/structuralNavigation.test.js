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

  it('matches exactly before allowing only the configured override modifier', () => {
    const shortcut = { key: 'ArrowRight', shiftKey: true };
    const exactEvent = {
      key: 'ArrowRight',
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: true,
    };
    const altEvent = { ...exactEvent, altKey: true };
    const allowAlt = { allowedExtraModifiers: ['altKey'] };

    expect(matchesStructuralShortcut(exactEvent, shortcut)).toBe(true);
    expect(matchesStructuralShortcut(altEvent, shortcut)).toBe(false);
    expect(matchesStructuralShortcut(altEvent, shortcut, allowAlt)).toBe(true);
    expect(matchesStructuralShortcut(
      altEvent,
      { ...shortcut, altKey: false },
      allowAlt
    )).toBe(false);
    expect(matchesStructuralShortcut(
      { ...altEvent, ctrlKey: true },
      shortcut,
      allowAlt
    )).toBe(false);
    expect(matchesStructuralShortcut(
      { ...altEvent, metaKey: true },
      shortcut,
      allowAlt
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

  it('uses an exact Shift+Escape status dismissal command by default', () => {
    const openKeyNav = new OpenKeyNav();

    expect(openKeyNav.config.modesConfig.structuralNavigation.status.dismissCommand)
      .toEqual({ key: 'Escape', shiftKey: true });
    expect(openKeyNav.config.modesConfig.structuralNavigation.keylabels.tab)
      .toBe(true);
    expect(openKeyNav.config.modesConfig.structuralNavigation.keylabels.contextJump)
      .toBe(true);
    expect(openKeyNav.config.modesConfig.structuralNavigation.keylabels.nativeArrows)
      .toBe(true);
    expect(openKeyNav.config.modesConfig.structuralNavigation.contextIndicator)
      .toMatchObject({
        enabled: false,
        color: '#000000',
        contrastColor: '#ffffff',
        contrastWidth: 2,
        style: 'dashed',
        offset: 10,
      });

    openKeyNav.destroy();
  });
});

describe('StructuralNavigationController', () => {
  let openKeyNav;

  afterEach(() => {
    openKeyNav?.destroy();
    document.body.innerHTML = '';
  });

  it('labels the first tabbable target with native Tab from initial page focus', async () => {
    document.body.innerHTML = `
      <section aria-labelledby="first-title">
        <h1 id="first-title">First context</h1>
        <a id="first-target" href="#first">First target</a>
      </section>
      <section aria-labelledby="second-title">
        <h2 id="second-title">Second context</h2>
        <button id="second-target">Second target</button>
      </section>
    `;
    expect(document.activeElement).toBe(document.body);
    openKeyNav = createOpenKeyNav();

    openKeyNav.enterStructuralNavigation();
    await new Promise(resolve => setTimeout(resolve, 25));

    const firstLabel = document.querySelector(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-target="first-target"]'
    );
    expect(firstLabel?.dataset.openkeynavKeylabelCommand)
      .toBe('nextTabTarget');
    expect(firstLabel?.textContent).toBe('⇥');
  });

  it('imports keylabels for native Tab routes, horizontal routes, and activation', async () => {
    document.body.innerHTML = `
      <section aria-labelledby="previous-title">
        <h2 id="previous-title">Previous</h2>
        <a id="previous-target" href="#previous">Previous target</a>
      </section>
      <section aria-labelledby="current-title">
        <h2 id="current-title">Current</h2>
        <a id="previous-tab-target" href="#previous-tab">Previous Tab target</a>
        <button id="current-target">Current target</button>
        <a id="next-tab-target" href="#next-tab">Next Tab target</a>
      </section>
      <section aria-labelledby="next-title">
        <h2 id="next-title">Next</h2>
        <a id="next-context-target" href="#next-context">Next context target</a>
      </section>
    `;
    openKeyNav = createOpenKeyNav();
    document.getElementById('current-target').focus();

    openKeyNav.enterStructuralNavigation();
    await new Promise(resolve => setTimeout(resolve, 25));

    const labelsFor = targetId => Array.from(document.querySelectorAll(
      `.openKeyNav-structural-keylabel[data-openkeynav-keylabel-target="${targetId}"]`
    )).map(label => ({
      command: label.dataset.openkeynavKeylabelCommand,
      symbols: label.textContent,
    }));

    expect(labelsFor('previous-target')).toEqual([
      { command: 'previousContextStart', symbols: '⌥⇧⇥' },
    ]);
    expect(labelsFor('previous-tab-target')).toEqual([
      { command: 'previousTabTarget', symbols: '⇧⇥' },
    ]);
    expect(labelsFor('next-tab-target')).toEqual([
      { command: 'nextTabTarget', symbols: '⇥' },
    ]);
    expect(labelsFor('next-context-target')).toEqual([
      { command: 'nextContextStart', symbols: '⌥⇥' },
    ]);
    expect(labelsFor('current-target')).toEqual([
      { command: 'activateEnter activateSpace', symbols: '↵⎵' },
    ]);
    expect(document.querySelector(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-target="current-target"]'
    )?.classList).toContain('openKeyNav-keylabel-focused');
    expect(Array.from(document.querySelectorAll(
      '.openKeyNav-structural-keylabel'
    )).every(label => Array.from(label.textContent).length <= 3)).toBe(true);
    expect(new Set(Array.from(document.querySelectorAll(
      '.openKeyNav-structural-keylabel'
    )).map(label => label.dataset.openkeynavKeylabelTarget)).size)
      .toBe(document.querySelectorAll('.openKeyNav-structural-keylabel').length);
    expect(document.getElementById('current-target')
      .hasAttribute('data-openkeynav-keylabel-target-active')).toBe(true);
    expect(document.getElementById('current-target')
      .hasAttribute('data-openkeynav-label')).toBe(false);

    openKeyNav.config.modes.clicking.value = true;
    expect(document.querySelectorAll('.openKeyNav-structural-keylabel'))
      .toHaveLength(0);
    expect(document.querySelectorAll('[data-openkeynav-keylabel-target-active]'))
      .toHaveLength(0);
    openKeyNav.config.modes.clicking.value = false;
    await new Promise(resolve => setTimeout(resolve, 25));
    expect(document.querySelectorAll('.openKeyNav-structural-keylabel'))
      .toHaveLength(5);
    expect(document.getElementById('current-target')
      .hasAttribute('data-openkeynav-keylabel-target-active')).toBe(true);
  });

  it('prefers a context-start keylabel over Shift+Down for the same target', async () => {
    document.body.innerHTML = `
      <section aria-labelledby="current-title">
        <h2 id="current-title">Current context</h2>
        <button id="current-target">Current target</button>
        <button id="intervening-target">Intervening target</button>
      </section>
      <section aria-labelledby="child-title">
        <h3 id="child-title">Child context</h3>
        <button id="child-target">Child target</button>
      </section>
    `;
    openKeyNav = createOpenKeyNav();
    document.getElementById('current-target').focus();

    openKeyNav.enterStructuralNavigation();
    await new Promise(resolve => setTimeout(resolve, 25));

    const childLabel = document.querySelector(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-target="child-target"]'
    );
    expect(childLabel?.textContent).toBe('⌥⇥');
    expect(childLabel?.dataset.openkeynavKeylabelCommand)
      .toBe('nextContextStart');
  });

  it('restores keylabels after live page mutations and native scroll keys', async () => {
    document.body.innerHTML = `
      <section aria-label="Previous">
        <button id="previous-target">Previous target</button>
      </section>
      <section aria-label="Current">
        <button id="current-target">Current target</button>
        <span id="live-copy">0 commands</span>
      </section>
      <section aria-label="Next">
        <button id="next-target">Next target</button>
      </section>
    `;
    openKeyNav = createOpenKeyNav();
    const currentTarget = document.getElementById('current-target');
    currentTarget.focus();

    openKeyNav.enterStructuralNavigation();
    await new Promise(resolve => setTimeout(resolve, 25));

    const initialLabelCount = document.querySelectorAll(
      '.openKeyNav-structural-keylabel'
    ).length;
    expect(initialLabelCount).toBeGreaterThan(0);

    document.getElementById('live-copy').textContent = '1 command';
    const scrollEvent = dispatchKey(currentTarget, 'ArrowDown');
    expect(scrollEvent.defaultPrevented).toBe(false);
    await new Promise(resolve => setTimeout(resolve, 25));

    expect(document.querySelectorAll('.openKeyNav-structural-keylabel'))
      .toHaveLength(initialLabelCount);
    expect(openKeyNav.structuralNavigation.dirty).toBe(false);
  });

  it('jumps between context starts without changing native Tab behavior', async () => {
    document.body.innerHTML = `
      <section aria-labelledby="root-title">
        <h1 id="root-title">Root Hollow</h1>
        <button id="root-lantern">Root lantern</button>
        <input id="fern-latch" aria-label="Fern latch">
      </section>
      <section aria-labelledby="dewdrop-title">
        <h6 id="dewdrop-title">Dewdrop Perch</h6>
        <button id="dewdrop-blossom">Dewdrop blossom</button>
        <button id="snail-mail-bell">Snail-mail bell</button>
      </section>
      <section aria-labelledby="mothwing-title">
        <h3 id="mothwing-title">Mothwing Lookout</h3>
        <button id="mothwing-lantern">Mothwing lantern</button>
      </section>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    const rootLantern = document.getElementById('root-lantern');
    const fernLatch = document.getElementById('fern-latch');
    rootLantern.focus();
    openKeyNav.enterStructuralNavigation();

    await new Promise(resolve => setTimeout(resolve, 25));

    const contextLabel = command => document.querySelector(
      `.openKeyNav-structural-keylabel` +
      `[data-openkeynav-keylabel-command="${command}"]`
    );
    expect(contextLabel('nextContextStart')?.dataset.openkeynavKeylabelTarget)
      .toBe('dewdrop-blossom');
    expect(contextLabel('nextContextStart')?.textContent).toBe('⌥⇥');
    expect(contextLabel('nextTabTarget')?.dataset.openkeynavKeylabelTarget)
      .toBe('fern-latch');
    expect(contextLabel('nextTabTarget')?.textContent).toBe('⇥');

    const nativeTab = dispatchKey(rootLantern, 'Tab');
    expect(nativeTab.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(rootLantern);

    fernLatch.focus();
    await new Promise(resolve => setTimeout(resolve, 25));
    expect(contextLabel('nextContextStart')).toBeNull();
    expect(contextLabel('nextTabTarget')?.dataset.openkeynavKeylabelTarget)
      .toBe('dewdrop-blossom');
    expect(contextLabel('nextTabTarget')?.textContent).toBe('⇥');

    const nextContext = dispatchKey(fernLatch, 'Tab', { altKey: true });
    expect(nextContext.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('dewdrop-blossom');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Dewdrop Perch');

    await new Promise(resolve => setTimeout(resolve, 25));

    const previousContext = dispatchKey(
      document.getElementById('dewdrop-blossom'),
      'Tab',
      { altKey: true, shiftKey: true }
    );
    expect(previousContext.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('root-lantern');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Root Hollow');

    const nativeShiftTab = dispatchKey(
      document.getElementById('root-lantern'),
      'Tab',
      { shiftKey: true }
    );
    expect(nativeShiftTab.defaultPrevented).toBe(false);
  });

  it('uses the configured override modifier for context-start chords', async () => {
    document.body.innerHTML = `
      <section aria-label="Alpha">
        <input id="alpha-editor" aria-label="Alpha editor">
        <button id="alpha-tail">Alpha tail</button>
      </section>
      <section aria-label="Beta">
        <button id="beta-start">Beta start</button>
      </section>
    `;
    openKeyNav = createOpenKeyNav({
      modesConfig: {
        structuralNavigation: {
          overrideModifier: 'ctrlKey',
        },
      },
    });
    openKeyNav.addKeydownEventListener();
    const editor = document.getElementById('alpha-editor');
    editor.focus();
    openKeyNav.enterStructuralNavigation();
    openKeyNav.structuralNavigate('broadenContext');
    await new Promise(resolve => setTimeout(resolve, 25));

    const label = document.querySelector(
      `.openKeyNav-structural-keylabel` +
      `[data-openkeynav-keylabel-command="nextContextStart"]`
    );
    expect(label?.dataset.openkeynavKeylabelTarget).toBe('beta-start');
    expect(label?.textContent).toBe('⌃⇥');

    const oldOverride = dispatchKey(editor, 'Tab', { altKey: true });
    expect(oldOverride.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(editor);

    const configuredOverride = dispatchKey(editor, 'Tab', { ctrlKey: true });
    expect(configuredOverride.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('beta-start');

    openKeyNav.config.modesConfig.structuralNavigation.overrideModifier =
      'shiftKey';
    const nativeShiftTab = dispatchKey(
      document.getElementById('beta-start'),
      'Tab',
      { shiftKey: true }
    );
    expect(nativeShiftTab.defaultPrevented).toBe(false);
  });

  it('reports and navigates only authored heading levels', async () => {
    document.body.innerHTML = `
      <h1>Moonvine guide</h1>
      <button id="guide-start">Guide start</button>
      <h2 id="relay-title">Structural Navigation</h2>
      <div role="region" aria-labelledby="relay-title">
        <section aria-label="Root Hollow">
          <button id="root-lantern">Root lantern</button>
          <button id="fern-latch">Fern latch</button>
        </section>
        <section aria-label="Dewdrop Perch">
          <button id="dewdrop-blossom">Dewdrop blossom</button>
        </section>
      </div>
      <section aria-labelledby="next-h2-title">
        <h2 id="next-h2-title">Next H2 context</h2>
        <button id="next-h2-start">Next H2 start</button>
      </section>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    const rootLantern = document.getElementById('root-lantern');
    rootLantern.focus();
    openKeyNav.enterStructuralNavigation();
    await new Promise(resolve => setTimeout(resolve, 25));

    const statusContent = document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent;
    expect(statusContent).toContain('Heading level: 2.');
    expect(statusContent).not.toContain('Hierarchy level:');
    expect(statusContent).not.toContain('Context depth:');

    const contextJumpLabel = document.querySelector(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-command="nextContextStart"]' +
      '[data-openkeynav-keylabel-target="dewdrop-blossom"]'
    );
    expect(contextJumpLabel?.textContent).toBe('⌥⇥');

    const nextHeading = dispatchKey(
      rootLantern,
      'ArrowRight',
      { shiftKey: true }
    );
    expect(nextHeading.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('next-h2-start');
    expect(openKeyNav.getStructuralNavigationState().activeContext.headingLevel)
      .toBe(2);

    rootLantern.focus();
    await nextTask();
    const nextSemanticContext = dispatchKey(
      rootLantern,
      'Tab',
      { altKey: true }
    );
    expect(nextSemanticContext.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('dewdrop-blossom');
  });

  it('includes the configured ownership override in input-owned arrow routes', async () => {
    document.body.innerHTML = `
      <a id="parent-heading-target" href="#parent"><h2>Parent</h2></a>
      <a id="parent-detail" href="#detail">Parent detail</a>
      <h3>Current</h3>
      <input id="editor" value="abc">
      <h4>Child</h4>
      <button id="child-target">Child target</button>
      <h3>Peer</h3>
      <button id="peer-target">Peer target</button>
    `;
    openKeyNav = createOpenKeyNav();
    document.getElementById('editor').focus();

    openKeyNav.enterStructuralNavigation();
    await new Promise(resolve => setTimeout(resolve, 25));

    const labelFor = command => document.querySelector(
      `.openKeyNav-structural-keylabel` +
      `[data-openkeynav-keylabel-command="${command}"]`
    )?.textContent;

    expect(labelFor('nextSiblingContext')).toBe('⌥⇧→');
    expect(labelFor('broadenContext')).toBeUndefined();
    expect(labelFor('previousContextStart')).toBe('⌥⇧⇥');
    expect(labelFor('narrowContext')).toBeUndefined();
    expect(labelFor('nextTabTarget')).toBe('⇥');
    expect(Array.from(document.querySelectorAll(
      '.openKeyNav-structural-keylabel'
    )).filter(label => label.textContent.startsWith('⌥')).every(label => (
      Array.from(label.textContent).length === 3
    ))).toBe(true);
  });

  it('prefers context-start chords over vertical heading labels for the same targets', async () => {
    document.body.innerHTML = `
      <a id="parent-heading-target" href="#parent">
        <h2>Visualization Authoring Tools</h2>
      </a>
      <a id="parent-detail" href="#detail">languages</a>
      <h3>Latest and Greatest</h3>
      <a id="child-heading-target" href="#child">GoFish</a>
    `;
    openKeyNav = createOpenKeyNav();
    const parentTarget = document.getElementById('parent-heading-target');
    const childTarget = document.getElementById('child-heading-target');
    childTarget.focus();
    openKeyNav.enterStructuralNavigation();
    await new Promise(resolve => setTimeout(resolve, 25));

    const verticalLabel = (command, targetId) => document.querySelector(
      `.openKeyNav-structural-keylabel` +
      `[data-openkeynav-keylabel-command="${command}"]` +
      `[data-openkeynav-keylabel-target="${targetId}"]`
    );

    expect(verticalLabel('broadenContext', parentTarget.id)).toBeNull();
    expect(verticalLabel('previousContextStart', parentTarget.id)?.textContent)
      .toBe('⌥⇧⇥');

    parentTarget.focus();
    await new Promise(resolve => setTimeout(resolve, 25));
    expect(verticalLabel('narrowContext', childTarget.id)).toBeNull();
    expect(verticalLabel('nextContextStart', childTarget.id)?.textContent)
      .toBe('⌥⇥');
    // Broadening this H2 changes only the context. Because focus stays on the
    // current target, there is no destination to label.
    expect(verticalLabel('broadenContext', parentTarget.id)).toBeNull();
  });

  it('labels native radio-group arrow focus destinations without handling them', async () => {
    document.body.innerHTML = `
      <fieldset>
        <legend>Choice</legend>
        <input id="radio-one" type="radio" name="choice" checked>
        <input id="radio-two" type="radio" name="choice">
        <input id="radio-three" type="radio" name="choice">
      </fieldset>
    `;
    openKeyNav = createOpenKeyNav();
    const current = document.getElementById('radio-one');
    current.focus();
    openKeyNav.enterStructuralNavigation();
    await new Promise(resolve => setTimeout(resolve, 25));

    const nativeArrowLabel = (command, targetId) => document.querySelector(
      `.openKeyNav-structural-keylabel` +
      `[data-openkeynav-keylabel-command~="${command}"]` +
      `[data-openkeynav-keylabel-target="${targetId}"]`
    );
    expect(nativeArrowLabel('nativeArrowLeft', 'radio-three')?.textContent)
      .toBe('←↑');
    expect(nativeArrowLabel('nativeArrowUp', 'radio-three')?.textContent)
      .toBe('←↑');
    expect(nativeArrowLabel('nativeArrowRight', 'radio-two')?.textContent)
      .toBe('→↓');
    expect(nativeArrowLabel('nativeArrowDown', 'radio-two')?.textContent)
      .toBe('→↓');
    expect(document.querySelectorAll(
      '.openKeyNav-structural-keylabel[data-openkeynav-keylabel-target="radio-two"]'
    )).toHaveLength(1);
    expect(document.querySelectorAll(
      '.openKeyNav-structural-keylabel[data-openkeynav-keylabel-target="radio-three"]'
    )).toHaveLength(1);

    const nativeArrow = dispatchKey(current, 'ArrowRight');
    expect(nativeArrow.defaultPrevented).toBe(false);
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
    expect(document.activeElement.id).toBe('clear-filters');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Catalog');

    openKeyNav.structuralNavigate('narrowContext');
    expect(document.activeElement.id).toBe('clear-filters');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Filters');

    openKeyNav.structuralNavigate('nextSiblingContext');
    expect(document.activeElement.id).toBe('result-a');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Results');

    expect(openKeyNav.exitStructuralNavigation()).toBe(true);
    expect(document.activeElement.id).toBe('result-a');
    expect(document.querySelector('.openKeyNav-structural-status')).toBeNull();
  });

  it.each([
    { label: 'programmatically focused heading', focusId: 'alpha-title' },
    { label: 'programmatically focused scroll region', focusId: 'alpha-scroll' },
  ])('resynchronizes its context around a $label without promoting it to a target', async ({
    focusId,
  }) => {
    document.body.innerHTML = `
      <main aria-label="Workspace">
        <section id="alpha" aria-labelledby="alpha-title">
          <h2 id="alpha-title">Alpha</h2>
          <button id="alpha-action">Alpha action</button>
          <div id="alpha-scroll">Alpha scroll region</div>
        </section>
        <section id="beta" aria-labelledby="beta-title">
          <h2 id="beta-title">Beta</h2>
          <button id="beta-action">Beta action</button>
        </section>
      </main>
    `;
    openKeyNav = createOpenKeyNav();
    const betaAction = document.getElementById('beta-action');
    const programmaticTarget = document.getElementById(focusId);
    betaAction.focus();
    openKeyNav.enterStructuralNavigation();
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Beta');

    programmaticTarget.setAttribute('tabindex', '-1');
    programmaticTarget.focus();
    await nextTask();

    const synchronized = openKeyNav.getStructuralNavigationState();
    expect(document.activeElement).toBe(programmaticTarget);
    expect(synchronized.active).toBe(true);
    expect(synchronized.target).toBeNull();
    expect(synchronized.targets).not.toContain(programmaticTarget);
    expect(synchronized.activeTypedContext).toBeNull();
    expect(synchronized.activeContext.name).toBe('Alpha');

    expect(openKeyNav.structuralNavigate('nextTarget')).toBe(true);
    expect(document.activeElement).toBe(document.getElementById('alpha-action'));
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Alpha');
  });

  it('keeps the configured Alt override active after leaving an arrow-owning input', () => {
    document.body.innerHTML = `
      <section aria-labelledby="widgets-title">
        <h2 id="widgets-title">Widgets</h2>
        <input id="editor" value="abc">
      </section>
      <section aria-labelledby="next-context-title">
        <h2 id="next-context-title">Next context</h2>
        <button id="next">Next</button>
      </section>
      <section aria-labelledby="final-context-title">
        <h2 id="final-context-title">Final context</h2>
        <button id="final">Final</button>
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

    // These events model Option remaining physically held after focus leaves
    // the input. The override modifier must stay transparent to the same
    // structural command on an ordinary target.
    const continuedOverride = dispatchKey(
      document.getElementById('next'),
      'ArrowRight',
      { altKey: true, shiftKey: true }
    );
    expect(continuedOverride.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('final');

    const ctrlChord = dispatchKey(
      document.getElementById('final'),
      'ArrowLeft',
      { ctrlKey: true, shiftKey: true }
    );
    expect(ctrlChord.defaultPrevented).toBe(false);
    expect(document.activeElement.id).toBe('final');

    const metaChord = dispatchKey(
      document.getElementById('final'),
      'ArrowLeft',
      { metaKey: true, shiftKey: true }
    );
    expect(metaChord.defaultPrevented).toBe(false);
    expect(document.activeElement.id).toBe('final');

    const exit = dispatchKey(
      document.getElementById('final'),
      'r',
      { altKey: true, code: 'KeyR' }
    );
    expect(exit.defaultPrevented).toBe(true);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(false);
    expect(document.activeElement.id).toBe('final');
  });

  it('prefers an exact Alt command before treating Alt as a transparent override', () => {
    document.body.innerHTML = `
      <main aria-labelledby="workspace-title">
        <h1 id="workspace-title">Workspace</h1>
        <section aria-labelledby="current-context-title">
          <h2 id="current-context-title">Current context</h2>
          <input id="editor" value="abc">
        </section>
        <section aria-labelledby="next-context-title">
          <h2 id="next-context-title">Next context</h2>
          <button id="next">Next</button>
        </section>
      </main>
      <button id="outside">Outside workspace</button>
    `;
    openKeyNav = createOpenKeyNav({
      modesConfig: {
        structuralNavigation: {
          commands: {
            broadenContext: {
              key: 'ArrowRight',
              altKey: true,
              shiftKey: true,
            },
          },
        },
      },
    });
    openKeyNav.addKeydownEventListener();
    document.getElementById('editor').focus();
    openKeyNav.enterStructuralNavigation();

    const exactAltCommand = dispatchKey(
      document.getElementById('editor'),
      'ArrowRight',
      { altKey: true, shiftKey: true }
    );

    expect(exactAltCommand.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('editor');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Workspace');
  });

  it('cycles explicit typed contexts while preserving one target identity', () => {
    document.body.innerHTML = `
      <section aria-labelledby="typed-workspace-title">
        <h2 id="typed-workspace-title">Workspace</h2>
        <button id="row-before">Row before</button>
        <button id="column-before">Column before</button>
        <input id="typed-input" aria-label="Typed input">
        <button id="current">Current</button>
        <button id="row-after">Row after</button>
        <button id="column-after">Column after</button>
      </section>
      <section aria-labelledby="next-workspace-title">
        <h2 id="next-workspace-title">Next workspace</h2>
        <button id="structural-next">Structural next</button>
      </section>
    `;
    const current = document.getElementById('current');
    const typedInput = document.getElementById('typed-input');
    openKeyNav = createOpenKeyNav({
      modesConfig: {
        structuralNavigation: {
          commands: {
            nextPeerContext: { key: 'PageDown', altKey: true },
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

    // A text field owns editing arrows and character input, not an explicitly
    // configured non-editing command.
    const typedShortcut = dispatchKey(typedInput, 'PageDown', { altKey: true });
    expect(typedShortcut.defaultPrevented).toBe(true);
    expect(openKeyNav.getStructuralNavigationState().activeContext.name).toBe('Row');
    openKeyNav.structuralNavigate('nextPeerContext');
    expect(openKeyNav.getStructuralNavigationState().activeTypedContext).toBeNull();

    current.focus();
    openKeyNav.structuralNavigate('nextPeerContext');
    expect(document.activeElement).toBe(current);
    expect(openKeyNav.getStructuralNavigationState().activeContext.name).toBe('Row');
    const typedStatus = document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent;
    expect(typedStatus).toContain('Typed context: Row.');
    expect(typedStatus).toContain('Underlying heading level: 2.');
    expect(typedStatus).toContain('2 alternate routes available.');
    expect(typedStatus).not.toContain('Typed contexts:');
    expect(typedStatus).not.toContain('Column');

    openKeyNav.structuralNavigate('nextTarget');
    expect(document.activeElement.id).toBe('row-after');
    openKeyNav.structuralNavigate('previousTarget');
    expect(document.activeElement).toBe(current);

    openKeyNav.structuralNavigate('nextPeerContext');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name).toBe('Column');
    const columnStatus = document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent;
    expect(columnStatus).toContain('Typed context: Column.');
    expect(columnStatus).toContain('Underlying heading level: 2.');
    openKeyNav.structuralNavigate('nextPeerContext');
    expect(document.activeElement).toBe(current);
    expect(openKeyNav.getStructuralNavigationState().activeTypedContext).toBeNull();
    const structuralStatus = document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent;
    expect(structuralStatus).toContain('Context: Workspace.');
    expect(structuralStatus).toContain('Heading level: 2.');
    expect(structuralStatus).not.toContain('Underlying heading level:');

    // Typed routes remain explicitly available, but never intercept the
    // default structural horizontal shortcut.
    openKeyNav.structuralNavigate('nextPeerContext');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name).toBe('Row');
    const structuralSibling = dispatchKey(current, 'ArrowRight', { shiftKey: true });
    expect(structuralSibling.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('structural-next');
    expect(openKeyNav.getStructuralNavigationState().activeTypedContext).toBeNull();
  });

  it('does not turn unheaded structural siblings into heading levels', () => {
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
    const resultsStatus = document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent;
    expect(resultsStatus).toContain('Context: Results.');
    expect(resultsStatus).not.toContain('Heading level:');
    expect(resultsStatus).not.toContain('Context depth:');
    expect(resultsStatus).not.toContain('Previous context:');
    expect(resultsStatus).not.toContain('Next context:');
    expect(resultsStatus).not.toContain('Sibling contexts:');

    const previousSibling = dispatchKey(
      document.getElementById('result-b'),
      'ArrowLeft',
      { shiftKey: true }
    );
    expect(previousSibling.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('result-b');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Results');
    expect(document.querySelector('.openKeyNav-structural-status').textContent)
      .toContain('No authored heading context is active');

    const previousContextStart = dispatchKey(
      document.getElementById('result-b'),
      'Tab',
      { altKey: true, shiftKey: true }
    );
    expect(previousContextStart.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('clear');

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
    expect(document.activeElement.id).toBe('clear');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Filters');

    const nextContextStart = dispatchKey(
      document.getElementById('clear'),
      'Tab',
      { altKey: true }
    );
    expect(nextContextStart.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('result-a');
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
      <h2>Third family</h2>
      <h3>Final level-three context</h3>
      <button id="final-first">Final first</button>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    document.getElementById('current-last').focus();
    openKeyNav.enterStructuralNavigation();

    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Current level-three context');
    expect(openKeyNav.getStructuralNavigationState().activeContext.headingLevel)
      .toBe(3);
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toBe(
      'Structural navigation active. Context: Current level-three context. ' +
      'Heading level: 3. Current last, 2 of 2.'
    );
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__hint'
    )?.textContent).toBe('Shift+Esc to close.');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__hint'
    )?.getAttribute('aria-hidden')).toBe('true');

    const nextLevel = dispatchKey(
      document.getElementById('current-last'),
      'ArrowRight',
      { shiftKey: true }
    );
    expect(nextLevel.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('next-first');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Next level-three context');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toBe(
      'Context: Next level-three context. Heading level: 3. ' +
      'Next first, 1 of 2.'
    );

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
      .toContain('No previous peer context at heading level 3');

    openKeyNav.structuralNavigate('broadenContext');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('First family');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Heading level: 2.');
    openKeyNav.structuralNavigate('broadenContext');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('First family');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Heading level: 2.');
    expect(document.querySelector('.openKeyNav-structural-status').textContent)
      .toContain('Already at the broadest heading level');
  });

  it('keeps differently ranked headings in separate horizontal lanes', () => {
    document.body.innerHTML = `
      <h1>Parent context</h1>
      <button id="parent-target">Parent target</button>
      <h3>Current level-three context</h3>
      <button id="current-level-three-target">Current level three target</button>
      <h2>Level-two sibling</h2>
      <button id="level-two-target">Level two target</button>
      <h3>Next level-three context</h3>
      <button id="next-level-three-target">Next level three target</button>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    document.getElementById('current-level-three-target').focus();
    openKeyNav.enterStructuralNavigation();

    const currentLevelThree = openKeyNav.getStructuralNavigationState()
      .activeContext;
    expect(currentLevelThree.name).toBe('Current level-three context');
    expect(currentLevelThree.headingLevel).toBe(3);

    const nextPeer = dispatchKey(
      document.getElementById('current-level-three-target'),
      'ArrowRight',
      { shiftKey: true }
    );
    const nextLevelThree = openKeyNav.getStructuralNavigationState()
      .activeContext;

    expect(nextPeer.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('next-level-three-target');
    expect(nextLevelThree.name).toBe('Next level-three context');
    expect(nextLevelThree.headingLevel).toBe(3);
    expect(nextLevelThree.parent).not.toBe(currentLevelThree.parent);
  });

  it('bridges the same authored heading rank across hierarchy depths', () => {
    document.body.innerHTML = `
      <main aria-labelledby="catalog-title">
        <h1 id="catalog-title">Catalog</h1>
        <section aria-labelledby="recommendations-title">
          <h2 id="recommendations-title">Recommendations</h2>
          <button id="recommendation-a">Recommendation A</button>
        </section>
      </main>
      <section aria-labelledby="intervening-title">
        <h2 id="intervening-title">Intervening family</h2>
        <fieldset>
          <legend>Unheaded level-three context</legend>
          <button id="unheaded-target">Unheaded target</button>
        </fieldset>
      </section>
      <section aria-labelledby="first-family-title">
        <h2 id="first-family-title">First heading family</h2>
        <h3>Current level-three context</h3>
        <button id="current-first">Current first</button>
        <button id="current-last">Current last</button>
      </section>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    document.getElementById('recommendation-a').focus();
    openKeyNav.enterStructuralNavigation();

    const recommendations = openKeyNav.getStructuralNavigationState()
      .activeContext;
    expect(recommendations.name).toBe('Recommendations');
    expect(recommendations.headingLevel).toBe(2);
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Heading level: 2.');

    const nextPeer = dispatchKey(
      document.getElementById('recommendation-a'),
      'ArrowRight',
      { shiftKey: true }
    );
    const intervening = openKeyNav.getStructuralNavigationState()
      .activeContext;

    expect(nextPeer.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('unheaded-target');
    expect(intervening.name).toBe('Intervening family');
    expect(intervening.headingLevel).toBe(2);
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Heading level: 2.');

    const nextSameRank = dispatchKey(
      document.getElementById('unheaded-target'),
      'ArrowRight',
      { shiftKey: true }
    );
    expect(nextSameRank.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('current-first');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('First heading family');

    const previousPeer = dispatchKey(
      document.getElementById('current-first'),
      'ArrowLeft',
      { shiftKey: true }
    );
    expect(previousPeer.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('unheaded-target');
    expect(openKeyNav.getStructuralNavigationState().activeContext)
      .toBe(intervening);
  });

  it('uses authored H3 lanes across the card and people structures from vis.mit.edu', () => {
    document.body.innerHTML = `
      <div class="research-card">
        <div class="theme-summary">
          <h2>Visualization Authoring Tools</h2>
          <a id="tools-theme" href="#tools-theme">Visualization Authoring Tools</a>
          <p>
            We develop <a id="languages" href="#languages">languages</a> and
            <a id="systems" href="#systems">systems</a> for visualization.
          </p>
          <a id="lyra" href="#lyra">Lyra</a>
        </div>
        <div class="latest-publications">
          <h3>Latest &amp; Greatest</h3>
          <a id="gofish" href="#gofish">GoFish</a>
          <a id="pluto" href="#pluto">Pluto</a>
          <a id="bluefish" href="#bluefish">Bluefish</a>
          <a id="umwelt" href="#umwelt">Umwelt</a>
          <a id="deimos" href="#deimos">Deimos</a>
        </div>
      </div>
      <div class="research-card">
        <div>
          <a id="cognition-theme" href="#cognition-theme">
            <h2>Cognition and Visualization</h2>
          </a>
        </div>
        <div>
          <h3>Recent Publications</h3>
          <a id="cognition-paper" href="#cognition-paper">Cognition paper</a>
        </div>
      </div>
      <section aria-labelledby="people-title">
        <h2 id="people-title">People</h2>
        <div>
          <h3>Alumni</h3>
          <a id="zoe" href="#zoe">Zoe De Simone</a>
        </div>
      </section>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    document.getElementById('gofish').focus();
    openKeyNav.enterStructuralNavigation();

    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Latest & Greatest');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Heading level: 3.');

    const broadenToH2 = dispatchKey(
      document.getElementById('gofish'),
      'ArrowUp',
      { shiftKey: true }
    );
    expect(broadenToH2.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('tools-theme');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Visualization Authoring Tools');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain(
      'Heading level: 2. Visualization Authoring Tools, 1 of 4.'
    );

    const narrowBackToH3 = dispatchKey(
      document.getElementById('tools-theme'),
      'ArrowDown',
      { shiftKey: true }
    );
    expect(narrowBackToH3.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('gofish');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Latest & Greatest');

    const nextH3 = dispatchKey(
      document.getElementById('gofish'),
      'ArrowRight',
      { shiftKey: true }
    );
    expect(nextH3.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('cognition-paper');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Recent Publications');

    openKeyNav.exitStructuralNavigation({ announce: false });
    document.getElementById('zoe').focus();
    openKeyNav.enterStructuralNavigation();
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Alumni');

    const previousH3 = dispatchKey(
      document.getElementById('zoe'),
      'ArrowLeft',
      { shiftKey: true }
    );
    expect(previousH3.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('cognition-paper');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Recent Publications');
  });

  it('narrows from an H2 to the next nonempty H3 by authored level', () => {
    document.body.innerHTML = `
      <section aria-labelledby="source-title">
        <h2 id="source-title">Source level two</h2>
        <button id="source-target">Source target</button>
      </section>
      <section aria-label="Intervening branch">
        <h4>Wrong-rank context</h4>
        <button id="wrong-rank-target">Wrong-rank target</button>
      </section>
      <h2>Later level two</h2>
      <button id="later-level-two-target">Later level-two target</button>
      <h3>Destination level three</h3>
      <button id="destination-first">Destination first</button>
      <button id="destination-last">Destination last</button>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    document.getElementById('source-target').focus();
    openKeyNav.enterStructuralNavigation();

    const source = openKeyNav.getStructuralNavigationState().activeContext;
    expect(source.name).toBe('Source level two');
    expect(source.headingLevel).toBe(2);

    const narrow = dispatchKey(
      document.getElementById('source-target'),
      'ArrowDown',
      { shiftKey: true }
    );
    const destination = openKeyNav.getStructuralNavigationState().activeContext;

    expect(narrow.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('destination-first');
    expect(destination.name).toBe('Destination level three');
    expect(destination.headingLevel).toBe(3);
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Heading level: 3.');
  });

  it('narrows from H1 through the next H2 and then H3', () => {
    document.body.innerHTML = `
      <a id="intro" href="#intro">
        <h1>Hi, we're the MIT Visualization Group!</h1>
      </a>
      <div class="research-card">
        <div class="theme-summary">
          <a id="tools-theme" href="#tools-theme">
            <h2>Visualization Authoring Tools</h2>
          </a>
          <p>
            <a id="languages" href="#languages">languages</a>
            <a id="systems" href="#systems">systems</a>
          </p>
          <a id="lyra" href="#lyra">Lyra</a>
        </div>
        <div class="latest-publications">
          <h3>Latest &amp; Greatest</h3>
          <a id="gofish" href="#gofish">GoFish</a>
        </div>
      </div>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    document.getElementById('intro').focus();
    openKeyNav.enterStructuralNavigation();

    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe("Hi, we're the MIT Visualization Group!");
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Heading level: 1.');

    const narrowToH2 = dispatchKey(
      document.getElementById('intro'),
      'ArrowDown',
      { shiftKey: true }
    );
    expect(narrowToH2.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('languages');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Visualization Authoring Tools');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain(
      'Heading level: 2. languages, 1 of 3.'
    );

    const narrowToH3 = dispatchKey(
      document.getElementById('languages'),
      'ArrowDown',
      { shiftKey: true }
    );
    expect(narrowToH3.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('gofish');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Latest & Greatest');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Heading level: 3.');
  });

  it('treats H6 as the boundary for page-forward narrow fallback', () => {
    document.body.innerHTML = `
      <h6>Terminal level six</h6>
      <button id="terminal-target">Terminal target</button>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    document.getElementById('terminal-target').focus();
    openKeyNav.enterStructuralNavigation();

    const terminalContext = openKeyNav.getStructuralNavigationState()
      .activeContext;
    const narrow = dispatchKey(
      document.getElementById('terminal-target'),
      'ArrowDown',
      { shiftKey: true }
    );

    expect(narrow.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('terminal-target');
    expect(openKeyNav.getStructuralNavigationState().activeContext)
      .toBe(terminalContext);
    expect(document.querySelector('.openKeyNav-structural-status').textContent)
      .toContain('Already at heading level 6.');
  });

  it('visually dismisses status until a true mode re-entry without changing navigation', () => {
    document.body.innerHTML = `
      <section id="filters" aria-labelledby="dismiss-filters-title">
        <h2 id="dismiss-filters-title">Filters</h2>
        <button id="clear">Clear filters</button>
      </section>
      <section id="results" aria-labelledby="dismiss-results-title">
        <h2 id="dismiss-results-title">Results</h2>
        <a id="result" href="#result">Result</a>
      </section>
    `;
    const filters = document.getElementById('filters');
    const results = document.getElementById('results');
    filters.getBoundingClientRect = () => ({
      left: 20, top: 30, right: 220, bottom: 130, width: 200, height: 100,
    });
    results.getBoundingClientRect = () => ({
      left: 20, top: 150, right: 320, bottom: 270, width: 300, height: 120,
    });

    openKeyNav = createOpenKeyNav({
      modesConfig: {
        structuralNavigation: {
          contextIndicator: { enabled: true },
        },
      },
    });
    openKeyNav.addKeydownEventListener();
    const clear = document.getElementById('clear');
    clear.focus();
    openKeyNav.enterStructuralNavigation();
    openKeyNav.structuralNavigation.updateContextIndicator();

    const status = document.querySelector('.openKeyNav-structural-status');
    const content = status.querySelector('.openKeyNav-status__content');
    const hint = status.querySelector('.openKeyNav-status__hint');
    const indicator = document.querySelector(
      '.openKeyNav-structural-context-outline'
    );
    const context = openKeyNav.getStructuralNavigationState().activeContext;

    expect(status.classList.contains(
      'openKeyNav-status--visually-hidden'
    )).toBe(false);
    expect(content.textContent).not.toContain('Shift+Esc to close.');
    expect(hint?.textContent).toBe('Shift+Esc to close.');
    expect(hint?.getAttribute('aria-hidden')).toBe('true');

    const dismiss = dispatchKey(clear, 'Escape', { shiftKey: true });

    expect(dismiss.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(clear);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
    expect(openKeyNav.getStructuralNavigationState().activeContext).toBe(context);
    expect(openKeyNav.getStructuralNavigationState().statusDismissed).toBe(true);
    expect(document.querySelector('.openKeyNav-structural-status')).toBe(status);
    expect(status.classList.contains(
      'openKeyNav-status--visually-hidden'
    )).toBe(true);
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(content.textContent).toMatch(/^Status closed\./);
    expect(status.querySelector('.openKeyNav-status__hint')).toBeNull();
    expect(document.querySelector(
      '.openKeyNav-structural-context-outline'
    )).toBe(indicator);
    expect(indicator.dataset.contextName).toBe('Filters');

    const dismissedAgain = dispatchKey(clear, 'Escape', { shiftKey: true });
    expect(dismissedAgain.defaultPrevented).toBe(false);
    expect(openKeyNav.getStructuralNavigationState().statusDismissed).toBe(true);

    const navigate = dispatchKey(clear, 'ArrowRight', { shiftKey: true });
    expect(navigate.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('result');
    expect(document.querySelector('.openKeyNav-structural-status')).toBe(status);
    expect(status.classList.contains(
      'openKeyNav-status--visually-hidden'
    )).toBe(true);
    expect(content.textContent).toContain('Context: Results.');
    expect(status.querySelector('.openKeyNav-status__hint')).toBeNull();
    expect(openKeyNav.getStructuralNavigationState().statusDismissed).toBe(true);

    expect(openKeyNav.enterStructuralNavigation()).toBe(true);
    expect(status.classList.contains(
      'openKeyNav-status--visually-hidden'
    )).toBe(true);
    expect(openKeyNav.getStructuralNavigationState().statusDismissed).toBe(true);

    expect(openKeyNav.exitStructuralNavigation({ announce: false })).toBe(true);
    expect(status.isConnected).toBe(false);
    expect(openKeyNav.enterStructuralNavigation()).toBe(true);

    const reenteredStatus = document.querySelector(
      '.openKeyNav-structural-status'
    );
    expect(reenteredStatus).not.toBe(status);
    expect(reenteredStatus.classList.contains(
      'openKeyNav-status--visually-hidden'
    )).toBe(false);
    expect(reenteredStatus.querySelector(
      '.openKeyNav-status__hint'
    ).textContent).toContain('Shift+Esc to close.');
    expect(reenteredStatus.querySelector(
      '.openKeyNav-status__hint'
    ).getAttribute('aria-hidden')).toBe('true');
    expect(openKeyNav.getStructuralNavigationState().statusDismissed).toBe(false);

    const dismissAfterReentry = dispatchKey(
      document.getElementById('result'),
      'Escape',
      { shiftKey: true }
    );
    expect(dismissAfterReentry.defaultPrevented).toBe(true);
    expect(reenteredStatus.classList.contains(
      'openKeyNav-status--visually-hidden'
    )).toBe(true);
  });

  it('passes the dismissal chord through Escape-owning inputs and composites', () => {
    document.body.innerHTML = `
      <section aria-label="Widgets">
        <input id="editor" value="abc">
        <div id="combobox" role="combobox" tabindex="0">Combobox</div>
      </section>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    const editor = document.getElementById('editor');
    const combobox = document.getElementById('combobox');
    let comboboxEscapes = 0;
    combobox.addEventListener('keydown', event => {
      if (event.key === 'Escape') comboboxEscapes += 1;
    });

    editor.focus();
    openKeyNav.enterStructuralNavigation();
    const status = document.querySelector('.openKeyNav-structural-status');

    const editorEscape = dispatchKey(editor, 'Escape', { shiftKey: true });
    expect(editorEscape.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(editor);
    expect(openKeyNav.getStructuralNavigationState().statusDismissed).toBe(false);
    expect(status.classList.contains(
      'openKeyNav-status--visually-hidden'
    )).toBe(false);

    combobox.focus();
    const comboboxEscape = dispatchKey(
      combobox,
      'Escape',
      { shiftKey: true }
    );
    expect(comboboxEscape.defaultPrevented).toBe(false);
    expect(comboboxEscapes).toBe(1);
    expect(document.activeElement).toBe(combobox);
    expect(openKeyNav.config.modes.structuralNavigation.value).toBe(true);
    expect(openKeyNav.getStructuralNavigationState().statusDismissed).toBe(false);
    expect(status.classList.contains(
      'openKeyNav-status--visually-hidden'
    )).toBe(false);
  });

  it('keeps a transient context outline through keyboard scrolling and shows context changes', async () => {
    document.body.innerHTML = `
      <main id="transient-catalog" aria-labelledby="transient-catalog-title">
        <h1 id="transient-catalog-title">Catalog</h1>
        <section id="transient-filters" aria-labelledby="transient-filters-title">
          <h2 id="transient-filters-title">Filters</h2>
          <button id="transient-clear">Clear filters</button>
        </section>
        <section id="transient-results" aria-labelledby="transient-results-title">
          <h2 id="transient-results-title">Results</h2>
          <a id="transient-result" href="#result">Result</a>
        </section>
      </main>
    `;
    document.getElementById('transient-catalog').getBoundingClientRect = () => ({
      left: 10, top: 10, right: 500, bottom: 400, width: 490, height: 390,
    });
    document.getElementById('transient-filters').getBoundingClientRect = () => ({
      left: 20, top: 30, right: 220, bottom: 130, width: 200, height: 100,
    });
    document.getElementById('transient-results').getBoundingClientRect = () => ({
      left: 250, top: 30, right: 480, bottom: 150, width: 230, height: 120,
    });

    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    const clear = document.getElementById('transient-clear');
    clear.focus();
    openKeyNav.enterStructuralNavigation();
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(document.querySelector('.openKeyNav-structural-context-outline'))
      .toBeNull();

    expect(dispatchKey(clear, 'ArrowUp', { shiftKey: true }).defaultPrevented)
      .toBe(true);
    openKeyNav.structuralNavigation.updateContextIndicator();
    const indicator = document.querySelector(
      '.openKeyNav-structural-context-outline'
    );
    expect(indicator?.dataset.contextName).toBe('Catalog');
    expect(indicator?.style.display).toBe('block');

    expect(dispatchKey(clear, 'ArrowDown', { shiftKey: true }).defaultPrevented)
      .toBe(true);
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(indicator.dataset.contextName).toBe('Filters');
    expect(indicator.style.display).toBe('block');

    expect(dispatchKey(clear, 'ArrowRight', { shiftKey: true }).defaultPrevented)
      .toBe(true);
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(document.activeElement.id).toBe('transient-result');
    expect(indicator.dataset.contextName).toBe('Results');
    expect(indicator.style.display).toBe('block');

    for (const key of ['ArrowDown', 'PageDown', ' ']) {
      expect(dispatchKey(document.activeElement, key).defaultPrevented)
        .toBe(false);
      openKeyNav.structuralNavigation.updateContextIndicator();
      expect(indicator.dataset.contextName).toBe('Results');
      expect(indicator.style.display).toBe('block');
    }

    openKeyNav.getScrollableElements = () => [];
    expect(dispatchKey(document.activeElement, 's', { code: 'KeyS' })
      .defaultPrevented).toBe(true);
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(indicator.style.display).toBe('block');

    expect(dispatchKey(document.activeElement, 'Tab').defaultPrevented)
      .toBe(false);
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(indicator.style.display).toBe('none');

    clear.focus();
    await nextTask();
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(indicator.dataset.contextName).toBe('Filters');
    expect(indicator.style.display).toBe('block');

    expect(dispatchKey(clear, ' ').defaultPrevented).toBe(false);
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(indicator.style.display).toBe('none');
  });

  it('draws the indicator around the true active context as focus crosses descendants', async () => {
    document.body.innerHTML = `
      <main id="catalog" aria-labelledby="catalog-title">
        <h1 id="catalog-title">Catalog</h1>
        <section id="filters" aria-labelledby="indicator-filters-title">
          <h2 id="indicator-filters-title">Filters</h2>
          <button id="clear">Clear filters</button>
        </section>
        <section id="results" aria-labelledby="indicator-results-title">
          <h2 id="indicator-results-title">Results</h2>
          <a id="result" href="#result">Result</a>
        </section>
      </main>
    `;
    const catalog = document.getElementById('catalog');
    const filters = document.getElementById('filters');
    const results = document.getElementById('results');
    catalog.getBoundingClientRect = () => ({
      left: 10, top: 10, right: 500, bottom: 400, width: 490, height: 390,
    });
    filters.getBoundingClientRect = () => ({
      left: 20, top: 30, right: 220, bottom: 130, width: 200, height: 100,
    });
    results.getBoundingClientRect = () => ({
      left: 250, top: 30, right: 480, bottom: 150, width: 230, height: 120,
    });

    openKeyNav = createOpenKeyNav({
      modesConfig: {
        structuralNavigation: {
          contextIndicator: { enabled: true },
        },
      },
    });
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
    expect(indicator.style.left).toBe('10px');
    expect(indicator.style.top).toBe('20px');

    openKeyNav.structuralNavigate('broadenContext');
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(document.activeElement.id).toBe('clear');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Catalog');
    expect(indicator.dataset.contextName).toBe('Catalog');
    expect(indicator.style.left).toBe('0px');
    expect(indicator.style.top).toBe('0px');
    expect(indicator.style.width).toBe('510px');
    expect(indicator.style.height).toBe('410px');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Heading level: 1.');

    document.getElementById('result').focus();
    await nextTask();
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(document.activeElement.id).toBe('result');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Catalog');
    expect(indicator.dataset.contextName).toBe('Catalog');
    expect(indicator.style.left).toBe('0px');
    expect(indicator.style.top).toBe('0px');

    openKeyNav.structuralNavigate('narrowContext');
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(document.activeElement.id).toBe('result');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Results');
    expect(indicator.dataset.contextName).toBe('Results');
    expect(indicator.style.left).toBe('240px');
    expect(indicator.style.top).toBe('20px');
    expect(indicator.style.width).toBe('250px');
    expect(indicator.style.height).toBe('140px');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Heading level: 2.');

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
      <section aria-labelledby="one-context-title">
        <h2 id="one-context-title">One context</h2>
        <button id="one">One</button>
      </section>
      <section aria-labelledby="two-context-title">
        <h2 id="two-context-title">Two context</h2>
        <button id="two">Two</button>
      </section>
      <section aria-labelledby="three-context-title">
        <h2 id="three-context-title">Three context</h2>
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
