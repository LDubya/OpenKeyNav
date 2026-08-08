/**
 * @vitest-environment jsdom
 */
import OpenKeyNav from '../src/OpenKeyNav.js';

const toolbarCommands = () => Array.from(document.querySelectorAll(
  '.openKeyNav-toolBar-expanded .keyButtonContainer'
)).map(container => ({
  key: container.querySelector('.keyButton')?.textContent.trim(),
  label: container.querySelector('.keyButtonLabel')?.textContent.trim(),
}));

describe('toolbar mode discovery', () => {
  let openKeyNav;

  afterEach(() => {
    openKeyNav?.destroy();
    document.body.innerHTML = '';
  });

  it('lists only modes available under the current configuration', () => {
    document.body.innerHTML = '<div class="openKeyNav-toolBar"></div>';
    openKeyNav = new OpenKeyNav();
    openKeyNav.meta.enabled.value = true;
    openKeyNav.initToolBar();

    openKeyNav.config.modes.menu.value = true;
    expect(toolbarCommands()).toEqual([
      { key: 'k', label: 'Click' },
      { key: 'r', label: 'Structural Navigation' },
    ]);

    openKeyNav.config.modes.menu.value = false;
    openKeyNav.config.modesConfig.move.config.push({
      fromElements: '.source',
      toElements: '.destination',
    });
    openKeyNav.config.keys.structuralNavigation = 'z';
    openKeyNav.config.modes.menu.value = true;
    expect(toolbarCommands()).toEqual([
      { key: 'k', label: 'Click' },
      { key: 'm', label: 'Drag' },
      { key: 'z', label: 'Structural Navigation' },
    ]);

    openKeyNav.config.modes.menu.value = false;
    openKeyNav.config.modesConfig.structuralNavigation.enabled = false;
    openKeyNav.config.modes.menu.value = true;
    expect(toolbarCommands()).toEqual([
      { key: 'k', label: 'Click' },
      { key: 'm', label: 'Drag' },
    ]);
  });
});
