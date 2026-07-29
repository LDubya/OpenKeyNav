import { keyButton } from '../src/keyButton.js';

describe('keyButton', () => {
  it('renders label and keys in order', () => {
    const html = keyButton(['Shift', 'o'], 'Shortcuts');
    expect(html).toContain('keyButtonLabel');
    expect(html).toContain('Shortcuts');
    expect(html).toContain('Shift');
    expect(html).toContain('o');
  });

  it('renders keys-only when no text', () => {
    const html = keyButton(['Esc']);
    expect(html).not.toContain('keyButtonLabel');
    expect(html).toContain('Esc');
  });
});
