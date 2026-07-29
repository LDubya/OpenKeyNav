import { signal, effect } from '../src/signals.js';

describe('signals', () => {
  it('effect runs and re-runs on signal updates', () => {
    const s = signal(0);
    let runs = 0;

    effect(() => {
      // subscribe to s
      // eslint-disable-next-line no-unused-expressions
      s.value;
      runs += 1;
    });

    expect(runs).toBe(1);
    s.value = 1;
    expect(runs).toBe(2);
    s.value = 2;
    expect(runs).toBe(3);
  });
});
