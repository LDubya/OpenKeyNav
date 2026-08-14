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

  it('does not place a keylabel over another assigned keylabel target', () => {
    const okn = new OpenKeyNav();
    okn.config.spot.arrowSize_px = 4;

    const target = document.createElement('div');
    document.body.appendChild(target);
    target.getBoundingClientRect = () => mockRect({
      left: 100,
      top: 100,
      width: 20,
      height: 20,
    });

    const otherTarget = document.createElement('button');
    otherTarget.setAttribute('data-openkeynav-keylabel-target-active', '');
    document.body.appendChild(otherTarget);
    const otherTargetRect = mockRect({
      left: 65,
      top: 100,
      width: 32,
      height: 20,
    });
    otherTarget.getBoundingClientRect = () => otherTargetRect;
    document.elementFromPoint = (x, y) => (
      x >= otherTargetRect.left && x <= otherTargetRect.right &&
      y >= otherTargetRect.top && y <= otherTargetRect.bottom
        ? otherTarget
        : null
    );

    const overlay = document.createElement('div');
    document.body.appendChild(overlay);
    overlay.getBoundingClientRect = rectFromStyle(overlay, 30, 10);

    okn.updateOverlayPosition(target, overlay);

    expect(overlay.getAttribute('data-openkeynav-position')).toBe('right');
  });

  it('does not overlap an existing keylabel that intersects its target', () => {
    const okn = new OpenKeyNav();
    okn.config.spot.arrowSize_px = 4;

    const target = document.createElement('button');
    document.body.appendChild(target);
    target.getBoundingClientRect = () => mockRect({
      left: 100,
      top: 100,
      width: 20,
      height: 20,
    });

    const existingLabel = document.createElement('div');
    existingLabel.className = 'openKeyNav-label';
    existingLabel.setAttribute('data-openkeynav-label', 'Existing');
    document.body.appendChild(existingLabel);
    existingLabel.getBoundingClientRect = () => mockRect({
      left: 70,
      top: 90,
      width: 40,
      height: 20,
    });

    const overlay = document.createElement('div');
    overlay.className = 'openKeyNav-label';
    document.body.appendChild(overlay);
    overlay.getBoundingClientRect = rectFromStyle(overlay, 30, 10);

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
