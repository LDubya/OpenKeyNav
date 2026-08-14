import OpenKeyNav from '../src/OpenKeyNav.js';
import {
  getAccessibleFocusLabelBackground,
  getKeylabelFontSize,
} from '../src/styles.js';

const parseRgb = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);

const contrastWithWhite = color => {
  const luminance = parseRgb(color).reduce((sum, component, index) => {
    const channel = component / 255;
    const linearChannel = channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
    return sum + linearChannel * [0.2126, 0.7152, 0.0722][index];
  }, 0);
  return 1.05 / (luminance + 0.05);
};

describe('focused keylabel color', () => {
  it('minimally darkens the default focus blue for white text contrast', () => {
    const background = getAccessibleFocusLabelBackground('#0088cc', null);

    expect(background).not.toBe('rgb(0, 136, 204)');
    expect(contrastWithWhite(background)).toBeGreaterThanOrEqual(4.5);
  });

  it('retains a focus color that already contrasts with white', () => {
    expect(getAccessibleFocusLabelBackground('#005a85', null))
      .toBe('rgb(0, 90, 133)');
  });

  it('uses an accessible focus-blue fallback for an unresolvable color', () => {
    const background = getAccessibleFocusLabelBackground('not-a-color', null);

    expect(background).toBe('rgb(0, 90, 133)');
    expect(contrastWithWhite(background)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('keylabel font sizing', () => {
  it('uses a 16px floor while preserving larger inherited text by default', () => {
    const openKeyNav = new OpenKeyNav();

    expect(getKeylabelFontSize(openKeyNav.config.spot))
      .toBe('max(16px, 1em)');
  });

  it('allows the minimum to be disabled', () => {
    expect(getKeylabelFontSize({
      fontSize: 'inherit',
      minimumFontSize: false,
    })).toBe('inherit');
  });

  it('allows either the minimum or the complete font size to be overridden', () => {
    expect(getKeylabelFontSize({
      fontSize: 'inherit',
      minimumFontSize: '18px',
    })).toBe('max(18px, 1em)');
    expect(getKeylabelFontSize({
      fontSize: '1.25rem',
      minimumFontSize: '18px',
    })).toBe('1.25rem');
  });
});
