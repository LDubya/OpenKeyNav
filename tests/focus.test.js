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

  it('cycles through headings with tabbable content and focuses their first target', () => {
    document.body.innerHTML = `
      <h2 id="empty-heading">Empty</h2>
      <p>No keyboard target here.</p>
      <h2 id="heading-two">Two</h2>
      <button id="two-first">First target in two</button>
      <button id="two-second">Second target in two</button>
      <h2 id="heading-three">Three</h2>
      <a id="three-first" href="#three">First target in three</a>
    `;
    openKeyNav.config.debug.screenReaderVisible = true;

    focusOnHeadings(openKeyNav, 'h2', { shiftKey: false });
    expect(document.activeElement.id).toBe('two-first');
    expect(openKeyNav.config.headings.currentHeadingIndex).toBe(0);
    expect(openKeyNav.config.headings.currentHeading.id).toBe('heading-two');

    focusOnHeadings(openKeyNav, 'h2', { shiftKey: false });
    expect(document.activeElement.id).toBe('three-first');
    expect(openKeyNav.config.headings.currentHeadingIndex).toBe(1);

    focusOnHeadings(openKeyNav, 'h2', { shiftKey: true });
    expect(document.activeElement.id).toBe('two-first');
    expect(openKeyNav.config.headings.currentHeadingIndex).toBe(0);

    expect(document.getElementById('empty-heading').hasAttribute('tabindex')).toBe(false);
    expect(document.getElementById('heading-two').hasAttribute('tabindex')).toBe(false);
    expect(document.getElementById('heading-three').hasAttribute('tabindex')).toBe(false);
  });

  it('cycles all authored heading levels in document order, including ARIA headings', () => {
    document.body.innerHTML = `
      <h1 id="heading-one">One</h1>
      <button id="one-first">First target in one</button>
      <h2 id="empty-heading">Empty</h2>
      <div role="heading" aria-level="2" id="aria-heading">ARIA two</div>
      <a id="aria-first" href="#aria">First target in ARIA two</a>
      <h3 id="heading-three">Three</h3>
      <input id="three-first">
    `;
    openKeyNav.config.debug.screenReaderVisible = true;
    const selector = 'h1, h2, h3, h4, h5, h6, [role="heading"][aria-level]';

    focusOnHeadings(openKeyNav, selector, { shiftKey: false });
    expect(document.activeElement.id).toBe('one-first');

    focusOnHeadings(openKeyNav, selector, { shiftKey: false });
    expect(document.activeElement.id).toBe('aria-first');

    focusOnHeadings(openKeyNav, selector, { shiftKey: false });
    expect(document.activeElement.id).toBe('three-first');
  });

  it('continues after the active authored heading context', () => {
    document.body.innerHTML = `
      <h1>Page</h1>
      <h2 id="heading-two">Two</h2>
      <button id="two-first">First target in two</button>
      <button id="two-second">Second target in two</button>
      <h2 id="heading-three">Three</h2>
      <a id="three-first" href="#three">First target in three</a>
    `;
    openKeyNav.config.debug.screenReaderVisible = true;
    document.getElementById('two-second').focus();

    focusOnHeadings(
      openKeyNav,
      'h1, h2, h3, h4, h5, h6',
      { shiftKey: false }
    );

    expect(document.activeElement.id).toBe('three-first');
    expect(openKeyNav.config.headings.currentHeading.id).toBe('heading-three');
  });

  it('synchronizes a shared tabbable target with the active structural heading', () => {
    document.body.innerHTML = `
      <div id="editor" contenteditable="true">
        <h2 id="heading-two">Two</h2>
        <p>Introduction</p>
        <h3 id="heading-three">Three</h3>
        <p>Detail</p>
      </div>
    `;
    openKeyNav.config.debug.screenReaderVisible = true;
    const editor = document.getElementById('editor');
    const headingTwo = document.getElementById('heading-two');
    const headingThree = document.getElementById('heading-three');
    editor.focus();
    vi.spyOn(openKeyNav.structuralNavigation, 'activeAuthoredHeading')
      .mockReturnValue(headingTwo);
    const selectHeading = vi.spyOn(
      openKeyNav.structuralNavigation,
      'selectAuthoredHeading'
    ).mockReturnValue(true);

    focusOnHeadings(
      openKeyNav,
      'h1, h2, h3, h4, h5, h6',
      { shiftKey: false }
    );

    expect(document.activeElement).toBe(editor);
    expect(openKeyNav.config.headings.currentHeading).toBe(headingThree);
    expect(selectHeading).toHaveBeenCalledWith(headingThree, editor);
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
