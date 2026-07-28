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

    openKeyNav.destroy();
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

  it('keeps the configured Alt override active after leaving an arrow-owning input', () => {
    document.body.innerHTML = `
      <section aria-label="Widgets">
        <input id="editor" value="abc">
      </section>
      <section aria-label="Next context">
        <button id="next">Next</button>
      </section>
      <section aria-label="Final context">
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
      <main aria-label="Workspace">
        <section aria-label="Current context">
          <input id="editor" value="abc">
        </section>
        <section aria-label="Next context">
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
    expect(typedStatus).toContain('Underlying hierarchy level: 2.');
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
    expect(columnStatus).toContain('Underlying hierarchy level: 2.');
    openKeyNav.structuralNavigate('nextPeerContext');
    expect(document.activeElement).toBe(current);
    expect(openKeyNav.getStructuralNavigationState().activeTypedContext).toBeNull();
    const structuralStatus = document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent;
    expect(structuralStatus).toContain('Context: Workspace.');
    expect(structuralStatus).toContain('Hierarchy level: 2.');
    expect(structuralStatus).not.toContain('Underlying hierarchy level:');

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
    const resultsStatus = document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent;
    expect(resultsStatus).toContain('Context: Results.');
    expect(resultsStatus).toContain('Hierarchy level: 2.');
    expect(resultsStatus).not.toContain('Previous context:');
    expect(resultsStatus).not.toContain('Next context:');
    expect(resultsStatus).not.toContain('Sibling contexts:');

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
      'Hierarchy level: 3. Current last, 2 of 2.'
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
      'Context: Next level-three context. Hierarchy level: 3. ' +
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
      .toContain('No previous peer context at hierarchy level 3');

    openKeyNav.structuralNavigate('broadenContext');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('First family');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Hierarchy level: 2.');
    openKeyNav.structuralNavigate('broadenContext');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Document');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Hierarchy level: 1.');
  });

  it('treats differently ranked contexts as peers when they share a parent', () => {
    document.body.innerHTML = `
      <h1>Parent context</h1>
      <button id="parent-target">Parent target</button>
      <h3>Malformed level-three sibling</h3>
      <button id="level-three-target">Level three target</button>
      <h2>Level-two sibling</h2>
      <button id="level-two-target">Level two target</button>
    `;
    openKeyNav = createOpenKeyNav();
    openKeyNav.addKeydownEventListener();
    document.getElementById('level-three-target').focus();
    openKeyNav.enterStructuralNavigation();

    const levelThree = openKeyNav.getStructuralNavigationState().activeContext;
    expect(levelThree.name).toBe('Malformed level-three sibling');
    expect(levelThree.headingLevel).toBe(3);
    expect(levelThree.parent.name).toBe('Parent context');

    const nextSibling = dispatchKey(
      document.getElementById('level-three-target'),
      'ArrowRight',
      { shiftKey: true }
    );
    const levelTwo = openKeyNav.getStructuralNavigationState().activeContext;

    expect(nextSibling.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('level-two-target');
    expect(levelTwo.name).toBe('Level-two sibling');
    expect(levelTwo.headingLevel).toBe(2);
    expect(levelTwo.parent).toBe(levelThree.parent);
  });

  it('bridges different authored heading ranks at the same hierarchy level', () => {
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
    ).textContent).toContain('Hierarchy level: 3.');

    const nextPeer = dispatchKey(
      document.getElementById('recommendation-a'),
      'ArrowRight',
      { shiftKey: true }
    );
    const currentLevelThree = openKeyNav.getStructuralNavigationState()
      .activeContext;

    expect(nextPeer.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('current-first');
    expect(currentLevelThree.name).toBe('Current level-three context');
    expect(currentLevelThree.headingLevel).toBe(3);
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Hierarchy level: 3.');

    const previousPeer = dispatchKey(
      document.getElementById('current-first'),
      'ArrowLeft',
      { shiftKey: true }
    );
    expect(previousPeer.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('recommendation-a');
    expect(openKeyNav.getStructuralNavigationState().activeContext)
      .toBe(recommendations);
  });

  it('narrows from an H2 to the next nonempty H3 at the next hierarchy level', () => {
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
    ).textContent).toContain('Hierarchy level: 3.');
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
      <section id="filters" aria-label="Filters">
        <button id="clear">Clear filters</button>
      </section>
      <section id="results" aria-label="Results">
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

    openKeyNav = createOpenKeyNav();
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

  it('draws the indicator around the true active context as focus crosses descendants', async () => {
    document.body.innerHTML = `
      <main id="catalog" aria-labelledby="catalog-title">
        <h1 id="catalog-title">Catalog</h1>
        <section id="filters" aria-label="Filters">
          <button id="clear">Clear filters</button>
        </section>
        <section id="results" aria-label="Results">
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

    openKeyNav.structuralNavigate('broadenContext');
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(document.activeElement.id).toBe('clear');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Catalog');
    expect(indicator.dataset.contextName).toBe('Catalog');
    expect(indicator.style.left).toBe('6px');
    expect(indicator.style.top).toBe('6px');
    expect(indicator.style.width).toBe('498px');
    expect(indicator.style.height).toBe('398px');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Hierarchy level: 2.');

    document.getElementById('result').focus();
    await nextTask();
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(document.activeElement.id).toBe('result');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Catalog');
    expect(indicator.dataset.contextName).toBe('Catalog');
    expect(indicator.style.left).toBe('6px');
    expect(indicator.style.top).toBe('6px');

    openKeyNav.structuralNavigate('narrowContext');
    openKeyNav.structuralNavigation.updateContextIndicator();
    expect(document.activeElement.id).toBe('result');
    expect(openKeyNav.getStructuralNavigationState().activeContext.name)
      .toBe('Results');
    expect(indicator.dataset.contextName).toBe('Results');
    expect(indicator.style.left).toBe('246px');
    expect(indicator.style.top).toBe('26px');
    expect(indicator.style.width).toBe('238px');
    expect(indicator.style.height).toBe('128px');
    expect(document.querySelector(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    ).textContent).toContain('Hierarchy level: 3.');

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
