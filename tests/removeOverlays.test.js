import OpenKeyNav from '../src/OpenKeyNav.js';

// jsdom lacks layout APIs; stub elementFromPoint if absent
if (typeof document !== 'undefined' && !document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

const stubLayout = okn => {
  okn.isAnyCornerVisible = () => true;
  okn.getScrollableElements = () => [];
  okn.preventScroll = () => {};
};

describe('removeOverlays', () => {
  it('clears foreground modes without ending persistent Structural Navigation', () => {
    document.body.innerHTML = `
      <main aria-label="Workspace">
        <button id="current">Current</button>
        <button id="labeled" data-openkeynav-label="a">Labeled</button>
        <div class="openKeyNav-label" data-openkeynav-label="a">a</div>
      </main>
    `;
    const okn = new OpenKeyNav();
    stubLayout(okn);
    okn.config.modesConfig.structuralNavigation.displayCheck = 'none';
    okn.config.modesConfig.structuralNavigation.status.enabled = false;
    okn.config.modesConfig.structuralNavigation.contextIndicator.enabled = false;
    okn.meta.enabled.value = true;
    document.getElementById('current').focus();
    okn.enterStructuralNavigation();
    okn.config.modes.clicking.value = true;
    okn.config.modes.moving.value = true;
    okn.config.modes.menu.value = true;
    okn.config.typedLabel.value = 'a';

    okn.removeOverlays(true);

    expect(document.querySelector('.openKeyNav-label')).toBeNull();
    expect(document.getElementById('labeled').hasAttribute('data-openkeynav-label'))
      .toBe(false);
    expect(okn.config.typedLabel.value).toBe('');
    expect(okn.config.modes.clicking.value).toBe(false);
    expect(okn.config.modes.moving.value).toBe(false);
    expect(okn.config.modes.menu.value).toBe(false);
    expect(okn.config.modes.structuralNavigation.value).toBe(true);
    expect(okn.getStructuralNavigationState().active).toBe(true);

    okn.destroy();
    expect(okn.config.modes.structuralNavigation.value).toBe(false);
    document.body.innerHTML = '';
  });

  it('resets modes, typedLabel, and removes overlays when removeAll=true', () => {
    const okn = new OpenKeyNav();
    stubLayout(okn);

    // create some overlays
    const o1 = document.createElement('div');
    o1.className = 'openKeyNav-label';
    o1.setAttribute('data-openkeynav-label', 'x');
    document.body.appendChild(o1);

    const o2 = document.createElement('div');
    o2.className = 'openKeyNav-label';
    o2.setAttribute('data-openkeynav-label', 'y');
    document.body.appendChild(o2);

    // set modes and typed label
    okn.config.modes.clicking.value = true;
    okn.config.modes.moving.value = true;
    okn.config.modes.menu.value = true;
    okn.config.typedLabel.value = 'xy';

    okn.removeOverlays(true);

    expect(document.querySelectorAll('.openKeyNav-label').length).toBe(0);
    expect(okn.config.typedLabel.value).toBe('');
    expect(okn.config.modes.clicking.value).toBe(false);
    expect(okn.config.modes.moving.value).toBe(false);
    expect(okn.config.modes.menu.value).toBe(false);
  });

  it('keeps selected label as indicator during moving mode when removeAll=false', () => {
    const okn = new OpenKeyNav();
    stubLayout(okn);

    // create overlays
    const selected = document.createElement('div');
    selected.className = 'openKeyNav-label';
    selected.setAttribute('data-openkeynav-label', 'ab');
    document.body.appendChild(selected);

    const other = document.createElement('div');
    other.className = 'openKeyNav-label';
    other.setAttribute('data-openkeynav-label', 'cd');
    document.body.appendChild(other);

    okn.config.modes.moving.value = true;
    okn.config.typedLabel.value = 'ab';

    okn.removeOverlays(false);

    // selected should remain and be marked as selected
    const remaining = document.querySelectorAll('.openKeyNav-label');
    expect(remaining.length).toBe(1);
    const el = remaining[0];
    expect(el.classList.contains('openKeyNav-label-selected')).toBe(true);
    // innerHTML is set to the bullet character
    expect(el.innerHTML === '&bull;' || el.innerHTML === '•').toBe(true);

    // modes should be reset after cleanup
    expect(okn.config.modes.moving.value).toBe(false);
    expect(okn.config.typedLabel.value).toBe('');
  });
});
