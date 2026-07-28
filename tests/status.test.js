/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OpenKeyNav from '../src/OpenKeyNav.js';
import { StatusService } from '../src/status.js';

describe('StatusService', () => {
  const services = [];

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    services.forEach(service => service.clearAll());
    services.length = 0;
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  const createService = () => {
    const service = new StatusService({ document });
    services.push(service);
    return service;
  };

  it('renders safe text by default and deduplicates unchanged content', () => {
    const service = createService();
    const element = service.set('route', '<strong>Results</strong>', {
      data: { contextId: 'results' },
    });
    const originalTextNode = element.querySelector(
      '.openKeyNav-status__content'
    ).firstChild;

    expect(element.textContent).toBe('<strong>Results</strong>');
    expect(element.querySelector('strong')).toBeNull();
    expect(element.getAttribute('role')).toBe('status');
    expect(element.getAttribute('aria-live')).toBe('polite');

    const repeated = service.set('route', '<strong>Results</strong>', {
      data: { contextId: 'updated-results' },
    });

    expect(repeated).toBe(element);
    expect(repeated.querySelector(
      '.openKeyNav-status__content'
    ).firstChild).toBe(originalTextNode);
    expect(repeated.dataset.contextId).toBe('updated-results');
  });

  it('renders a safe visual-only hint separately from live status content', () => {
    const service = createService();
    const element = service.set('hinted', 'Context: Results.', {
      hint: '<kbd>Shift+Esc</kbd> to close.',
    });
    const content = element.querySelector('.openKeyNav-status__content');
    const hint = element.querySelector('.openKeyNav-status__hint');

    expect(content.textContent).toBe('Context: Results.');
    expect(hint?.textContent).toBe('<kbd>Shift+Esc</kbd> to close.');
    expect(hint?.getAttribute('aria-hidden')).toBe('true');
    expect(hint?.querySelector('kbd')).toBeNull();

    service.set('hinted', 'Context: Filters.');

    expect(element.querySelector('.openKeyNav-status__hint')).toBeNull();
    expect(content.textContent).toBe('Context: Filters.');
  });

  it('scopes status to shadow, modal, and custom hosts', () => {
    const service = createService();
    const customHost = document.createElement('section');
    const shadowHost = document.createElement('div');
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.append(customHost, shadowHost, modal);

    const element = service.set('scope', 'Shadow status', {
      host: shadowRoot,
      visible: false,
    });
    expect(element.getRootNode()).toBe(shadowRoot);
    expect(shadowRoot.querySelector(
      '.openKeyNav-status-service-style'
    )).not.toBeNull();
    expect(element.classList.contains(
      'openKeyNav-status--visually-hidden'
    )).toBe(true);

    service.set('scope', 'Modal status', {
      host: 'modal',
      politeness: 'assertive',
    });
    expect(element.parentNode).toBe(modal);
    expect(shadowRoot.querySelector(
      '.openKeyNav-status-service-style'
    )).toBeNull();
    expect(element.getAttribute('role')).toBe('alert');
    expect(element.getAttribute('aria-live')).toBe('assertive');

    service.set('scope', 'Custom status', { host: customHost });
    expect(element.parentNode).toBe(customHost);
  });

  it('updates channel options and cancels an old timer for persistence', () => {
    vi.useFakeTimers();
    const service = createService();
    const element = service.set('changing', 'Temporary', {
      className: 'temporary-status',
      duration: 20,
      dismissible: true,
      toolName: true,
    });

    service.set('changing', 'Persistent', {
      className: 'persistent-status',
      duration: 0,
      dismissible: false,
      toolName: false,
    });
    vi.advanceTimersByTime(25);

    expect(service.get('changing')).toBe(element);
    expect(element.classList.contains('temporary-status')).toBe(false);
    expect(element.classList.contains('persistent-status')).toBe(true);
    expect(element.querySelector('.okn-logo-text')).toBeNull();
    expect(element.querySelector('button')).toBeNull();
  });

  it('keeps equal channel names isolated between OpenKeyNav instances', () => {
    const first = createService();
    const second = createService();
    const firstElement = first.set('shared-name', 'First');
    const secondElement = second.set('shared-name', 'Second');

    expect(firstElement).not.toBe(secondElement);
    expect(document.querySelectorAll(
      '[data-openkeynav-status-channel="shared-name"]'
    )).toHaveLength(2);

    first.clear('shared-name');
    expect(first.get('shared-name')).toBeNull();
    expect(second.get('shared-name')).toBe(secondElement);
    expect(secondElement.isConnected).toBe(true);
  });
});

describe('OpenKeyNav shared status lifecycle', () => {
  let openKeyNav;

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
    openKeyNav = new OpenKeyNav();
    openKeyNav.config.debug.keyboardAccessible = false;
  });

  afterEach(() => {
    openKeyNav?.destroy();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('routes notifications through the shared safe renderer', () => {
    openKeyNav.config.notifications.displayToolName = false;
    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);

    const notification = openKeyNav.emitNotification(
      '<strong>Untrusted</strong>',
      100
    );

    expect(notification.classList.contains('openKeyNav-status')).toBe(true);
    expect(notification.classList.contains(
      'openKeyNav-notification'
    )).toBe(true);
    expect(notification.getAttribute('role')).toBe('alert');
    expect(notification.getAttribute('aria-live')).toBe('assertive');
    expect(notification.textContent).toBe('<strong>Untrusted</strong>');
    expect(notification.querySelector('strong')).toBeNull();
    expect(notification.parentElement.id).toBe('okn-notification-container');
    expect(notification.parentElement.parentElement).toBe(modal);

    const updated = openKeyNav.emitNotification(
      '<kbd>Trusted key</kbd>',
      100,
      { trustedHtml: true }
    );
    expect(updated).toBe(notification);
    expect(updated.querySelector('kbd')?.textContent).toBe('Trusted key');

    const persistent = openKeyNav.emitNotification('Persistent', 0);
    expect(notification.isConnected).toBe(false);
    expect(persistent.isConnected).toBe(true);
    expect(persistent.querySelector(
      '[aria-label="Close notification"]'
    )).not.toBeNull();
  });

  it('preserves the default legacy notification branding across updates', () => {
    expect(openKeyNav.config.notifications.displayToolName).toBe(true);

    const notification = openKeyNav.emitNotification('First message');
    const logo = notification.querySelector('.okn-logo-text.tiny');

    expect(notification.querySelectorAll('.okn-logo-text')).toHaveLength(1);
    expect(logo?.outerHTML).toBe(
      '<div class="okn-logo-text tiny" role="img" aria-label="OpenKeyNav">Open<span class="key">Key</span>Nav</div>'
    );
    expect(logo?.getAttribute('role')).toBe('img');
    expect(logo?.getAttribute('aria-label')).toBe('OpenKeyNav');
    expect(logo?.textContent).toBe('OpenKeyNav');
    expect(logo?.querySelector('.key')?.textContent).toBe('Key');

    const updated = openKeyNav.emitNotification('Updated message');

    expect(updated).toBe(notification);
    expect(updated.querySelectorAll('.okn-logo-text')).toHaveLength(1);
    expect(updated.querySelector('.okn-logo-text')).toBe(logo);
    expect(updated.querySelector('.openKeyNav-status__content')?.textContent)
      .toBe('Updated message');
  });

  it('keeps branded keyboard enable and disable notifications for the configured duration', () => {
    openKeyNav.addKeydownEventListener();

    const toggle = () => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'O',
        code: 'KeyO',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }));
    };
    const expectBrandedNotification = message => {
      const notification = document.querySelector('.openKeyNav-notification');
      expect(notification?.querySelector(
        '.openKeyNav-status__content'
      )?.textContent).toContain(message);
      expect(notification?.querySelectorAll('.okn-logo-text.tiny'))
        .toHaveLength(1);
      expect(notification?.querySelector('.okn-logo-text')?.outerHTML).toBe(
        '<div class="okn-logo-text tiny" role="img" aria-label="OpenKeyNav">Open<span class="key">Key</span>Nav</div>'
      );
      return notification;
    };

    toggle();
    expect(openKeyNav.meta.enabled.value).toBe(true);
    const enabledNotification = expectBrandedNotification(
      'openKeyNav enabled.'
    );
    vi.advanceTimersByTime(2999);
    expect(enabledNotification?.isConnected).toBe(true);
    vi.advanceTimersByTime(1);
    expect(enabledNotification?.isConnected).toBe(false);

    toggle();
    expect(openKeyNav.meta.enabled.value).toBe(false);
    const disabledNotification = expectBrandedNotification(
      'openKeyNav disabled.'
    );
    expect(document.querySelector(
      '.openKeyNav-status-service-style'
    )).not.toBeNull();
    vi.advanceTimersByTime(2999);
    expect(disabledNotification?.isConnected).toBe(true);
    vi.advanceTimersByTime(1);
    expect(disabledNotification?.isConnected).toBe(false);
  });

  it('clears every owned status surface on disable and destroy', () => {
    openKeyNav.meta.enabled.value = true;
    openKeyNav.setStatus('mode', 'Mode active');
    openKeyNav.emitNotification('Notification', 0);
    expect(document.querySelectorAll('.openKeyNav-status')).toHaveLength(2);

    openKeyNav.disable();
    expect(document.querySelector('.openKeyNav-status')).toBeNull();
    expect(document.querySelector(
      '.openKeyNav-notification-container'
    )).toBeNull();
    expect(document.querySelector(
      '.openKeyNav-status-service-style'
    )).toBeNull();

    openKeyNav.setStatus('after-disable', 'Temporary');
    openKeyNav.destroy();
    expect(document.querySelector('.openKeyNav-status')).toBeNull();
  });

  it('uses one polite structural channel and one non-duplicated exit status', () => {
    document.body.innerHTML = `
      <main aria-label="Catalog">
        <button id="target">Target</button>
      </main>
    `;
    openKeyNav.config.modesConfig.structuralNavigation.displayCheck = 'none';
    openKeyNav.meta.enabled.value = true;
    document.getElementById('target').focus();

    openKeyNav.enterStructuralNavigation();
    const activeStatus = document.querySelector(
      '.openKeyNav-structural-status'
    );
    expect(activeStatus.classList.contains('openKeyNav-status')).toBe(true);
    expect(activeStatus.getAttribute('aria-live')).toBe('polite');
    expect(activeStatus.querySelector(
      '.okn-logo-text[role="img"][aria-label="OpenKeyNav"]'
    )).not.toBeNull();
    expect(activeStatus.querySelector('button, [tabindex]')).toBeNull();

    openKeyNav.config.notifications.duration = 0;
    openKeyNav.exitStructuralNavigation();
    const exitStatus = document.querySelector(
      '.openKeyNav-structural-exit-status'
    );
    expect(document.querySelector(
      '.openKeyNav-structural-status'
    )).toBeNull();
    expect(document.querySelector('.openKeyNav-notification')).toBeNull();
    expect(exitStatus?.querySelector(
      '.openKeyNav-status__content'
    )?.textContent).toBe('Structural navigation off.');
    expect(exitStatus?.querySelector(
      '.okn-logo-text[role="img"][aria-label="OpenKeyNav"]'
    )).not.toBeNull();
    expect(exitStatus?.getAttribute('aria-live')).toBe('polite');
    vi.advanceTimersByTime(2999);
    expect(exitStatus?.isConnected).toBe(true);
    vi.advanceTimersByTime(1);
    expect(exitStatus?.isConnected).toBe(false);
  });
});
