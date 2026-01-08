import OpenKeyNav from '../src/OpenKeyNav.js';

function mockRect({ left, top, width, height }) {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

function rectFromStyle(el, width, height) {
  return () => {
    const left = parseFloat(el.style.left || '0');
    const top = parseFloat(el.style.top || '0');
    return mockRect({ left, top, width, height });
  };
}

describe('updateOverlayPosition', () => {
  it('sets a directional position attribute when space permits', () => {
    const okn = new OpenKeyNav();
    okn.config.spot.arrowSize_px = 4;

    // target element with a known rect
    const target = document.createElement('div');
    document.body.appendChild(target);
    target.getBoundingClientRect = () => mockRect({ left: 100, top: 100, width: 50, height: 20 });

    // overlay element with known rect
    const overlay = document.createElement('div');
    document.body.appendChild(overlay);
    overlay.getBoundingClientRect = rectFromStyle(overlay, 30, 10);

    okn.updateOverlayPosition(target, overlay);

    // Should pick one of left/right/top/bottom
    const pos = overlay.getAttribute('data-openkeynav-position');
    expect(['left', 'right', 'top', 'bottom'].includes(pos)).toBe(true);
  });

  it('chooses right when left would be cut off', () => {
    const okn = new OpenKeyNav();
    okn.config.spot.arrowSize_px = 4;

    // Keep elementFromPoint simple for overlap check
    document.elementFromPoint = () => null;

    // target near the left edge; left placement would go negative
    const target = document.createElement('div');
    document.body.appendChild(target);
    target.getBoundingClientRect = () => mockRect({ left: 2, top: 50, width: 20, height: 20 });

    const overlay = document.createElement('div');
    document.body.appendChild(overlay);
    overlay.getBoundingClientRect = rectFromStyle(overlay, 40, 10);

    okn.updateOverlayPosition(target, overlay);

    expect(overlay.getAttribute('data-openkeynav-position')).toBe('right');
  });

  it('falls back to no position when all placements are invalid', () => {
    const okn = new OpenKeyNav();
    okn.config.spot.arrowSize_px = 4;

    document.elementFromPoint = () => null;

    // Tiny viewport to force cut-off in every direction
    Object.defineProperty(window, 'innerWidth', { value: 50, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 40, configurable: true });

    const target = document.createElement('div');
    document.body.appendChild(target);
    target.getBoundingClientRect = () => mockRect({ left: 10, top: 10, width: 30, height: 20 });

    const overlay = document.createElement('div');
    document.body.appendChild(overlay);
    overlay.getBoundingClientRect = rectFromStyle(overlay, 60, 30);

    okn.updateOverlayPosition(target, overlay);

    expect(overlay.getAttribute('data-openkeynav-position')).toBeNull();
  });
});
