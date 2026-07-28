/**
 * @vitest-environment jsdom
 */
import {
  discoverTabbableTargets,
  getDeepActiveElement,
  isOpenKeyNavGeneratedUI,
} from '../src/tabbableTargets.js';

const discover = (root = document, options = {}) => discoverTabbableTargets(root, {
  displayCheck: 'none',
  ...options,
});

describe('discoverTabbableTargets', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('uses tabbable order, including positive tabindex ordering', () => {
    document.body.innerHTML = `
      <button id="dom-first">DOM first</button>
      <button id="tabindex-two" tabindex="2">Second positive</button>
      <button id="tabindex-one" tabindex="1">First positive</button>
      <a id="dom-last" href="#last">DOM last</a>
    `;

    expect(discover().map(element => element.id)).toEqual([
      'tabindex-one',
      'tabindex-two',
      'dom-first',
      'dom-last',
    ]);
  });

  it('excludes negative tabindex by default', () => {
    document.body.innerHTML = `
      <button id="before">Before</button>
      <button id="programmatic" tabindex="-1">Programmatic</button>
      <button id="after">After</button>
    `;

    expect(discover().map(element => element.id)).toEqual(['before', 'after']);
  });

  it('can opt into programmatic-only targets in composed source order', () => {
    document.body.innerHTML = `
      <button id="before">Before</button>
      <button id="programmatic" tabindex="-1">Programmatic</button>
      <button id="after">After</button>
    `;

    expect(discover(document, { includeProgrammatic: true }).map(element => element.id))
      .toEqual(['before', 'programmatic', 'after']);
  });

  it('excludes OpenKeyNav-generated interfaces without excluding page targets', () => {
    document.body.innerHTML = `
      <button id="page-target">Page target</button>
      <button class="openKeyNav-label" id="overlay">Overlay</button>
      <div class="openKeyNav-toolBar"><button id="toolbar-control">Toolbar</button></div>
      <div id="okn-notification-container"><button id="notification-close">Close</button></div>
      <div id="okn-audit-panel"><button id="audit-control">Audit</button></div>
      <div data-openkeynav-ui><button id="marked-control">Generated</button></div>
    `;

    expect(discover().map(element => element.id)).toEqual(['page-target']);
  });

  it('applies an application target filter without mutating candidates', () => {
    document.body.innerHTML = `
      <button id="keep" data-structural-target>Keep</button>
      <button id="drop">Drop</button>
    `;
    const targetFilter = vi.fn(element => element.hasAttribute('data-structural-target'));

    expect(discover(document, { targetFilter }).map(element => element.id))
      .toEqual(['keep']);
    expect(targetFilter).toHaveBeenCalledTimes(2);
    expect(document.getElementById('drop')).not.toBeNull();
  });

  it('retains a native target inside aria-hidden content', () => {
    document.body.innerHTML = `
      <section aria-hidden="true">
        <button id="aria-hidden-target">Still in native focus order</button>
      </section>
    `;

    expect(discover().map(element => element.id)).toEqual(['aria-hidden-target']);
  });

  it('drops disconnected targets, including targets detached by a filter', () => {
    const detachedRoot = document.createElement('div');
    detachedRoot.innerHTML = '<button id="never-connected">Detached</button>';
    expect(discover(detachedRoot)).toEqual([]);

    document.body.innerHTML = '<button id="removed-by-filter">Remove me</button>';
    expect(discover(document, {
      targetFilter: element => {
        element.remove();
        return true;
      },
    })).toEqual([]);
  });

  it('discovers open Shadow DOM targets in composed order', () => {
    const before = document.createElement('button');
    before.id = 'before-shadow';
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = '<button id="inside-shadow">Inside shadow</button>';
    const after = document.createElement('button');
    after.id = 'after-shadow';
    document.body.append(before, host, after);

    expect(discover().map(element => element.id)).toEqual([
      'before-shadow',
      'inside-shadow',
      'after-shadow',
    ]);
    expect(discover(shadowRoot).map(element => element.id)).toEqual(['inside-shadow']);
  });

  it('treats an explicitly tabbable iframe as one atomic target', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'frame';
    iframe.tabIndex = 0;
    document.body.appendChild(iframe);

    const innerButton = iframe.contentDocument?.createElement('button');
    if (innerButton) {
      innerButton.id = 'inside-frame';
      iframe.contentDocument.body.appendChild(innerButton);
    }

    const targets = discover();
    expect(targets).toEqual([iframe]);
    expect(targets).not.toContain(innerButton);
  });

  it('accepts the documented jsdom displayCheck override', () => {
    document.body.innerHTML = '<button id="jsdom-target">Target</button>';

    expect(discoverTabbableTargets(document, { displayCheck: 'none' }))
      .toEqual([document.getElementById('jsdom-target')]);
  });
});

describe('discovery helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('detects generated UI through composed Shadow DOM ancestry', () => {
    const host = document.createElement('div');
    host.setAttribute('data-openkeynav-ui', '');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const button = document.createElement('button');
    shadowRoot.appendChild(button);
    document.body.appendChild(host);

    expect(isOpenKeyNavGeneratedUI(button)).toBe(true);
  });

  it('follows open Shadow DOM focus to the deep active element', () => {
    const scope = document.createElement('section');
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const button = document.createElement('button');
    shadowRoot.appendChild(button);
    scope.appendChild(host);
    document.body.appendChild(scope);

    button.focus();

    expect(document.activeElement).toBe(host);
    expect(shadowRoot.activeElement).toBe(button);
    expect(getDeepActiveElement(document)).toBe(button);
    expect(getDeepActiveElement(scope)).toBe(button);
  });

  it('does not descend into an iframe document', () => {
    const iframe = document.createElement('iframe');
    iframe.tabIndex = 0;
    document.body.appendChild(iframe);
    iframe.focus();

    expect(getDeepActiveElement(document)).toBe(iframe);
  });

  it('returns null when focus is outside an element root', () => {
    const scope = document.createElement('section');
    const outside = document.createElement('button');
    document.body.append(scope, outside);
    outside.focus();

    expect(getDeepActiveElement(scope)).toBeNull();
  });
});
