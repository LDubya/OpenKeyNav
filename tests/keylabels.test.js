import {
  clearAssignedKeylabels,
  generateLabels,
  generateValidKeyChars,
  KEYLABEL_SYMBOLS,
  repositionAssignedKeylabels,
  showAssignedKeylabels,
} from '../src/keylabels.js';

describe('keylabels', () => {
  const openKeyNav = {
    config: {
      keys: { escape: 'q' }
    }
  };

  it('generateValidKeyChars excludes escape key', () => {
    const chars = generateValidKeyChars(openKeyNav);
    expect(chars).not.toContain('q');
    expect(chars).toContain('a');
    expect(chars).toContain('z');
  });

  it('generateLabels returns requested number of unique labels', () => {
    const count = 50;
    const labels = generateLabels(openKeyNav, count);
    expect(labels.length).toBe(count);
    const unique = new Set(labels);
    expect(unique.size).toBe(count);
  });

  it('renders caller-owned two-symbol hints through the existing overlay API', () => {
    document.body.innerHTML = `
      <button id="previous">Previous</button>
      <button id="next">Next</button>
      <button id="activate">Activate</button>
    `;
    const createOverlay = vi.fn((target, label, cssClass) => {
      const overlay = document.createElement('div');
      overlay.className = `openKeyNav-label ${cssClass}`;
      overlay.textContent = label;
      overlay.dataset.openkeynavLabel = label;
      document.body.appendChild(overlay);
      return overlay;
    });
    const updateOverlayPosition = vi.fn();
    const assignedOpenKeyNav = {
      createOverlay,
      updateOverlayPosition,
      statusService: { document },
    };
    const owner = 'structural-navigation';

    const overlays = showAssignedKeylabels(assignedOpenKeyNav, [
      {
        target: document.getElementById('previous'),
        symbols: `${KEYLABEL_SYMBOLS.shift}${KEYLABEL_SYMBOLS.left}`,
        command: 'previousSiblingContext',
      },
      {
        target: document.getElementById('next'),
        symbols: `${KEYLABEL_SYMBOLS.shift}${KEYLABEL_SYMBOLS.right}ignored`,
        command: 'nextSiblingContext',
      },
      {
        target: document.getElementById('activate'),
        symbols: KEYLABEL_SYMBOLS.enter,
        command: 'activateEnter',
      },
      {
        target: document.getElementById('activate'),
        symbols: KEYLABEL_SYMBOLS.space,
        command: 'activateSpace',
      },
    ], {
      owner,
      cssClass: 'openKeyNav-structural-keylabel',
      focusedTarget: document.getElementById('activate'),
    });

    expect(createOverlay).toHaveBeenCalledTimes(3);
    expect(overlays.map(overlay => overlay.textContent)).toEqual([
      '⇧←',
      '⇧→',
      '↵⎵',
    ]);
    expect(overlays.every(overlay => (
      Array.from(overlay.textContent).length <= 2 &&
      overlay.getAttribute('aria-hidden') === 'true'
    ))).toBe(true);
    expect(overlays[1].dataset.openkeynavKeylabelTarget).toBe('next');
    expect(overlays[2].dataset.openkeynavKeylabelCommand)
      .toBe('activateEnter activateSpace');
    expect(overlays[2].classList)
      .toContain('openKeyNav-keylabel-alternatives');
    expect(overlays[2].classList)
      .toContain('openKeyNav-keylabel-focused');
    expect(overlays[2].dataset.openkeynavKeylabelFocused).toBe('true');
    expect(Array.from(overlays[2].querySelectorAll(
      '.openKeyNav-keylabel-alternative'
    )).map(segment => segment.textContent)).toEqual(['↵', '⎵']);
    expect(overlays[0].classList)
      .not.toContain('openKeyNav-keylabel-alternatives');
    expect(overlays[0].classList)
      .not.toContain('openKeyNav-keylabel-focused');
    expect(document.getElementById('previous')
      .hasAttribute('data-openkeynav-keylabel-target-active')).toBe(true);
    expect(document.getElementById('next')
      .hasAttribute('data-openkeynav-keylabel-target-active')).toBe(true);
    expect(document.getElementById('next').hasAttribute('data-openkeynav-label'))
      .toBe(false);

    repositionAssignedKeylabels(assignedOpenKeyNav, owner);
    expect(updateOverlayPosition).toHaveBeenCalledTimes(4);

    clearAssignedKeylabels(assignedOpenKeyNav, owner);
    expect(document.querySelectorAll('.openKeyNav-structural-keylabel'))
      .toHaveLength(0);
    expect(document.querySelectorAll('[data-openkeynav-keylabel-target-active]'))
      .toHaveLength(0);
  });
});
