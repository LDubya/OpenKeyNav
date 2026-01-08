import { generateLabels, generateValidKeyChars } from '../src/keylabels.js';

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
});
