/**
 * @vitest-environment jsdom
 */
import {
  getExplicitAccessibleName,
  getLabelledByText,
  normalizeText,
} from '../src/accessibilityName.js';
import {
  collectComposedElements,
  getComposedParent,
  hasAriaHiddenAncestor,
  isComposedWithin,
  isOpenKeyNavGeneratedUI,
} from '../src/domUtilities.js';

describe('composed DOM utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('crosses open shadow boundaries for ancestry and containment', () => {
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const button = document.createElement('button');
    shadowRoot.appendChild(button);
    document.body.appendChild(host);

    expect(getComposedParent(button)).toBe(shadowRoot);
    expect(getComposedParent(shadowRoot)).toBe(host);
    expect(isComposedWithin(host, button)).toBe(true);
    expect(isComposedWithin(document, button)).toBe(true);
  });

  it('collects the rendered shadow subtree and can prune owned UI', () => {
    const host = document.createElement('div');
    host.id = 'host';
    const lightChild = document.createElement('button');
    lightChild.id = 'unrendered-light-child';
    host.appendChild(lightChild);
    const shadowRoot = host.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <button id="shadow-target">Target</button>
      <div data-openkeynav-ui><button id="owned-control">Owned</button></div>
    `;
    document.body.appendChild(host);

    const elements = collectComposedElements(document, {
      exclude: isOpenKeyNavGeneratedUI,
    });
    expect(elements.map(element => element.id).filter(Boolean)).toEqual([
      'host',
      'shadow-target',
    ]);
  });

  it('detects generated and aria-hidden state through composed ancestry', () => {
    const host = document.createElement('div');
    host.setAttribute('data-openkeynav-ui', '');
    host.setAttribute('aria-hidden', 'true');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const button = document.createElement('button');
    shadowRoot.appendChild(button);
    document.body.appendChild(host);

    expect(isOpenKeyNavGeneratedUI(button)).toBe(true);
    expect(hasAriaHiddenAncestor(button, document)).toBe(true);
  });
});

describe('explicit accessible-name utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('normalizes and joins visible aria-labelledby references in author order', () => {
    document.body.innerHTML = `
      <span id="first"> First   label </span>
      <div aria-hidden="true"><span id="hidden">Hidden label</span></div>
      <span id="second">Second label</span>
      <section id="region" aria-labelledby="first hidden second"></section>
    `;
    const region = document.getElementById('region');

    expect(getLabelledByText(region)).toBe('First label Second label');
    expect(getExplicitAccessibleName(region)).toBe('First label Second label');
    expect(normalizeText('\n Multiple\t spaces ')).toBe('Multiple spaces');
  });

  it('resolves references in a shadow root and falls back to aria-label', () => {
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <span id="label">Shadow label</span>
      <section id="labelled" aria-labelledby="label"></section>
      <section id="fallback" aria-labelledby="missing" aria-label="Fallback"></section>
    `;
    document.body.appendChild(host);

    expect(getExplicitAccessibleName(shadowRoot.getElementById('labelled')))
      .toBe('Shadow label');
    expect(getExplicitAccessibleName(shadowRoot.getElementById('fallback')))
      .toBe('Fallback');
  });
});
