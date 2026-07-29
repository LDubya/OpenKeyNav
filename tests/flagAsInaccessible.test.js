import OpenKeyNav from '../src/OpenKeyNav.js';

describe('flagAsInaccessible', () => {
  it('adds class, sets reason attribute, and creates tooltip; cleaned up by removeOverlays', () => {
    const okn = new OpenKeyNav();

    const el = document.createElement('div');
    document.body.appendChild(el);

    okn.flagAsInaccessible(el, '<p>Reason</p>', 'keyboard');

    expect(el.classList.contains('openKeyNav-inaccessible')).toBe(true);
    expect(el.getAttribute('data-openkeynav-inaccessible-reason')).toContain('Reason');

    const tooltip = document.querySelector('.openKeyNav-mouseover-tooltip');
    expect(tooltip).toBeTruthy();

    // event listeners are tracked in the click eventListenersMap
    const map = okn.config.modesConfig.click.eventListenersMap;
    expect(map.has(el)).toBe(true);

    okn.removeOverlays(true);

    // tooltip removed, class removed, map cleared
    expect(document.querySelector('.openKeyNav-mouseover-tooltip')).toBeNull();
    expect(el.classList.contains('openKeyNav-inaccessible')).toBe(false);
    expect(map.has(el)).toBe(false);
  });
});
