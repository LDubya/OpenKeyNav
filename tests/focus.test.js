/**
 * @vitest-environment jsdom
 */
import OpenKeyNav from '../src/OpenKeyNav.js';
import { focusOnHeadings, focusOnScrollables } from '../src/focus.js';

describe('OpenKeyNav focus', () => {
  let openKeyNav;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="current">Current</button>
      <button id="requested">Requested</button>
      <button id="redirected">Redirected</button>
      <button id="disabled" disabled>Disabled</button>
    `;
    openKeyNav = new OpenKeyNav();
  });

  afterEach(() => {
    openKeyNav.destroy();
    document.body.innerHTML = '';
  });

  it('returns and decorates the settled target, then removes its marker on blur', () => {
    const requested = document.getElementById('requested');
    const settled = openKeyNav.focus(requested);

    expect(settled).toBe(requested);
    expect(document.activeElement).toBe(requested);
    expect(requested.getAttribute('data-openkeynav-focused')).toBe('true');

    document.getElementById('current').focus();
    expect(requested.hasAttribute('data-openkeynav-focused')).toBe(false);
  });

  it('decorates a synchronous focus redirect instead of leaving a stale marker', () => {
    const requested = document.getElementById('requested');
    const redirected = document.getElementById('redirected');
    requested.addEventListener('focus', () => redirected.focus());

    const settled = openKeyNav.focus(requested);

    expect(settled).toBe(redirected);
    expect(document.activeElement).toBe(redirected);
    expect(requested.hasAttribute('data-openkeynav-focused')).toBe(false);
    expect(redirected.getAttribute('data-openkeynav-focused')).toBe('true');
  });

  it('does not decorate the previous target when the requested focus fails', () => {
    const current = document.getElementById('current');
    current.focus();

    const settled = openKeyNav.focus(document.getElementById('disabled'));

    expect(settled).toBe(current);
    expect(current.hasAttribute('data-openkeynav-focused')).toBe(false);
  });

  it('starts heading navigation at the first heading and cycles in both directions', () => {
    document.body.innerHTML = `
      <h1 id="heading-one">One</h1>
      <h2 id="heading-two">Two</h2>
    `;
    openKeyNav.config.debug.screenReaderVisible = true;

    focusOnHeadings(openKeyNav, 'h1, h2', { shiftKey: false });
    expect(document.activeElement.id).toBe('heading-one');
    expect(openKeyNav.config.headings.currentHeadingIndex).toBe(0);

    focusOnHeadings(openKeyNav, 'h1, h2', { shiftKey: false });
    expect(document.activeElement.id).toBe('heading-two');
    expect(openKeyNav.config.headings.currentHeadingIndex).toBe(1);

    focusOnHeadings(openKeyNav, 'h1, h2', { shiftKey: true });
    expect(document.activeElement.id).toBe('heading-one');
    expect(openKeyNav.config.headings.currentHeadingIndex).toBe(0);
  });

  it('cycles scroll regions through the declared scrollable state', () => {
    document.body.innerHTML = `
      <div id="scroll-one">One</div>
      <div id="scroll-two">Two</div>
    `;
    const scrollOne = document.getElementById('scroll-one');
    const scrollTwo = document.getElementById('scroll-two');
    openKeyNav.getScrollableElements = () => [scrollOne, scrollTwo];

    focusOnScrollables(openKeyNav, { shiftKey: false });
    expect(document.activeElement).toBe(scrollOne);
    expect(openKeyNav.config.scrollables.currentScrollableIndex).toBe(0);

    focusOnScrollables(openKeyNav, { shiftKey: false });
    expect(document.activeElement).toBe(scrollTwo);
    expect(openKeyNav.config.scrollables.currentScrollableIndex).toBe(1);

    focusOnScrollables(openKeyNav, { shiftKey: true });
    expect(document.activeElement).toBe(scrollOne);
    expect(openKeyNav.config.scrollables.currentScrollableIndex).toBe(0);
    expect(Object.hasOwn(openKeyNav.config, 'currentScrollableIndex')).toBe(false);
  });
});
