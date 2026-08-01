/**
 * @vitest-environment jsdom
 * @vitest-environment-options {"url":"https://example.org/"}
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OpenKeyNav from '../src/OpenKeyNav.js';

describe('OpenKeyNav telemetry configuration', () => {
  let fetchMock;
  let openKeyNav;

  beforeEach(() => {
    document.body.innerHTML = '';
    fetchMock = vi.fn(() => Promise.resolve({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    openKeyNav?.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('does not send the version support event when telemetry is disabled', () => {
    openKeyNav = new OpenKeyNav();

    openKeyNav.init({
      telemetry: {
        enabled: false,
      },
      debug: {
        keyboardAccessible: false,
      },
    });

    expect(openKeyNav.config.telemetry.enabled).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the existing default-enabled behavior', () => {
    openKeyNav = new OpenKeyNav();

    openKeyNav.init({
      debug: {
        keyboardAccessible: false,
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://applicationsupport.openkeynav.com/capture/',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });
});
