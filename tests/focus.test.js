/**
 * @vitest-environment jsdom
 */
import OpenKeyNav from '../src/OpenKeyNav.js';

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
});
