import {
  isDocument,
  isElement,
  isShadowRoot,
} from './domUtilities.js';
import { statusStyles } from './styles.js';

const INVALID_STATUS_HOSTS = new Set([
  'AREA',
  'BASE',
  'BR',
  'BUTTON',
  'COL',
  'EMBED',
  'HR',
  'IMG',
  'INPUT',
  'LINK',
  'META',
  'OPTGROUP',
  'OPTION',
  'PARAM',
  'SOURCE',
  'SELECT',
  'TEXTAREA',
  'TRACK',
  'WBR',
]);

const canContainStatus = value => (
  isShadowRoot(value) ||
  (isElement(value) && !INVALID_STATUS_HOSTS.has(value.tagName))
);

const topmostModal = document => {
  if (!document?.querySelectorAll) return null;

  try {
    const nativeModals = Array.from(document.querySelectorAll('dialog:modal'));
    if (nativeModals.length) return nativeModals[nativeModals.length - 1];
  } catch (error) {
    // DOM implementations without :modal support fall through to ARIA dialogs.
  }

  const ariaModals = Array.from(
    document.querySelectorAll('[role="dialog"][aria-modal="true"]')
  ).filter(element => element.isConnected);
  return ariaModals[ariaModals.length - 1] || null;
};

export const resolveStatusHost = (document, requestedHost) => {
  const resolved = typeof requestedHost === 'function'
    ? requestedHost()
    : requestedHost;

  if (resolved === 'modal') {
    return topmostModal(document) ||
      document?.body ||
      document?.documentElement ||
      null;
  }
  if (resolved === 'body' || !resolved || isDocument(resolved)) {
    return document?.body || document?.documentElement || null;
  }
  if (canContainStatus(resolved)) return resolved;
  return document?.body || document?.documentElement || null;
};

const normalizeClassNames = value => (
  Array.isArray(value) ? value : String(value || '').split(/\s+/)
).filter(Boolean);

const applyVisibility = (element, visible) => {
  element.classList.toggle(
    'openKeyNav-status--visually-hidden',
    visible === false
  );
};

const applyDataset = (element, values = {}) => {
  Object.entries(values).forEach(([name, value]) => {
    if (value === null || value === undefined) {
      delete element.dataset[name];
      return;
    }
    element.dataset[name] = String(value);
  });
};

const setContent = (entry, message, options) => {
  const content = entry.content;
  const normalizedMessage = String(message ?? '');
  const trustedHtml = options.trustedHtml === true;
  const contentKey = `${trustedHtml ? 'html' : 'text'}:${normalizedMessage}`;

  if (options.dedupe !== false && entry.contentKey === contentKey) {
    return false;
  }

  if (trustedHtml) {
    content.innerHTML = normalizedMessage;
  } else {
    content.textContent = normalizedMessage;
  }
  entry.contentKey = contentKey;
  return true;
};

const addToolName = (document, element) => {
  const logo = document.createElement('div');
  logo.className = 'okn-logo-text tiny';
  logo.setAttribute('role', 'img');
  logo.setAttribute('aria-label', 'OpenKeyNav');
  logo.innerHTML = 'Open<span class="key">Key</span>Nav';
  element.prepend(logo);
  return logo;
};

/**
 * Owns OpenKeyNav's live status and notification surfaces for one instance.
 *
 * Text is escaped by default. Callers must opt in with `trustedHtml: true` for
 * markup that OpenKeyNav itself generated.
 */
export class StatusService {
  constructor({ document: ownerDocument } = {}) {
    this.document = ownerDocument || null;
    this.channels = new Map();
    this.containers = new Map();
    this.styles = new Map();
  }

  ownerDocument() {
    if (this.document) return this.document;
    return typeof document === 'undefined' ? null : document;
  }

  containerFor(host, options) {
    if (!options.containerClass) return host;

    const key = `${options.containerKey || options.containerClass}`;
    let hostContainers = this.containers.get(host);
    if (!hostContainers) {
      hostContainers = new Map();
      this.containers.set(host, hostContainers);
    }

    let container = hostContainers.get(key);
    if (container?.parentNode !== host) {
      const document = this.ownerDocument();
      container = document.createElement('div');
      container.className = normalizeClassNames(options.containerClass).join(' ');
      container.setAttribute('data-openkeynav-ui', 'status-container');
      container.dataset.openkeynavStatusContainer = key;
      host.appendChild(container);
      hostContainers.set(key, container);
    }
    if (
      options.containerId &&
      (
        !this.ownerDocument().getElementById(options.containerId) ||
        container.id === options.containerId
      )
    ) {
      container.id = options.containerId;
    }
    return container;
  }

  styleRootFor(host) {
    if (isShadowRoot(host)) return host;
    const root = host?.getRootNode?.();
    if (isShadowRoot(root)) return root;
    return this.ownerDocument();
  }

  ensureStyles(host) {
    const document = this.ownerDocument();
    const root = this.styleRootFor(host);
    if (!document || !root) return null;

    let style = this.styles.get(root);
    if (style?.parentNode) return root;

    style = document.createElement('style');
    style.className = 'openKeyNav-status-service-style';
    style.setAttribute('data-openkeynav-ui', 'status-style');
    style.textContent = statusStyles;

    if (isDocument(root)) {
      (root.head || root.documentElement).appendChild(style);
    } else {
      root.prepend(style);
    }
    this.styles.set(root, style);
    return root;
  }

  pruneStyles() {
    for (const [root, style] of this.styles) {
      const inUse = Array.from(this.channels.values()).some(entry => (
        entry.styleRoot === root
      ));
      if (!inUse) {
        style.remove();
        this.styles.delete(root);
      }
    }
  }

  removeEmptyContainer(container) {
    if (
      !container?.hasAttribute?.('data-openkeynav-status-container') ||
      container.childElementCount
    ) {
      return;
    }

    container.remove();
    for (const [host, hostContainers] of this.containers) {
      for (const [key, candidate] of hostContainers) {
        if (candidate === container) hostContainers.delete(key);
      }
      if (!hostContainers.size) this.containers.delete(host);
    }
  }

  createEntry(channel, options) {
    const document = this.ownerDocument();
    if (!document) return null;

    const element = document.createElement('div');
    element.classList.add('openKeyNav-status');
    element.setAttribute(
      'data-openkeynav-ui',
      options.ui || 'status'
    );
    element.dataset.openkeynavStatusChannel = channel;
    element.setAttribute('aria-atomic', 'true');

    const content = document.createElement('div');
    content.className = 'openKeyNav-status__content';
    element.appendChild(content);

    const entry = {
      channel,
      element,
      content,
      contentKey: null,
      timer: null,
      duration: null,
      container: null,
      styleRoot: null,
      optionClassNames: new Set(),
      toolName: null,
      hint: null,
      dismiss: null,
    };
    this.channels.set(channel, entry);
    return entry;
  }

  set(channel, message, options = {}) {
    const document = this.ownerDocument();
    if (!document) return null;

    const normalizedChannel = String(channel || '').trim();
    if (!normalizedChannel) {
      throw new TypeError('A non-empty status channel is required.');
    }

    const host = resolveStatusHost(document, options.host);
    if (!host) return null;
    const styleRoot = this.ensureStyles(host);

    let entry = this.channels.get(normalizedChannel);
    if (!entry) {
      entry = this.createEntry(normalizedChannel, options);
    }
    if (!entry) return null;

    entry.optionClassNames.forEach(className => {
      entry.element.classList.remove(className);
    });
    entry.optionClassNames = new Set(normalizeClassNames(options.className));
    entry.optionClassNames.forEach(className => {
      entry.element.classList.add(className);
    });

    if (options.toolName && !entry.toolName) {
      entry.toolName = addToolName(document, entry.element);
    } else if (!options.toolName && entry.toolName) {
      entry.toolName.remove();
      entry.toolName = null;
    }

    const politeness = ['assertive', 'off'].includes(options.politeness)
      ? options.politeness
      : 'polite';
    const role = options.role || (
      politeness === 'assertive' ? 'alert' : 'status'
    );

    entry.element.setAttribute('role', role);
    entry.element.setAttribute('aria-live', politeness);
    entry.element.classList.toggle(
      'openKeyNav-status--assertive',
      politeness === 'assertive'
    );
    applyVisibility(entry.element, options.visible);
    applyDataset(entry.element, options.data);

    const previousContainer = entry.container;
    const container = this.containerFor(host, options);
    if (entry.element.parentNode !== container) {
      container.appendChild(entry.element);
    }
    entry.container = container;
    entry.styleRoot = styleRoot;
    if (previousContainer !== container) {
      this.removeEmptyContainer(previousContainer);
      this.pruneStyles();
    }

    const contentChanged = setContent(entry, message, options);
    const duration = (
      Number.isFinite(options.duration) &&
      options.duration > 0
    ) ? options.duration : null;
    const durationChanged = duration !== entry.duration;

    if (entry.timer && (contentChanged || durationChanged)) {
      clearTimeout(entry.timer);
      entry.timer = null;
    }
    if (
      (contentChanged || durationChanged) &&
      duration !== null
    ) {
      entry.timer = setTimeout(() => {
        this.clear(normalizedChannel);
      }, duration);
    }
    entry.duration = duration;

    const hintMessage = String(options.hint ?? '').trim();
    if (hintMessage) {
      if (!entry.hint) {
        const hint = document.createElement('div');
        hint.className = 'openKeyNav-status__hint';
        hint.setAttribute('aria-hidden', 'true');
        entry.element.appendChild(hint);
        entry.hint = hint;
      }
      entry.hint.textContent = hintMessage;
    } else if (entry.hint) {
      entry.hint.remove();
      entry.hint = null;
    }

    if (options.dismissible === true && !entry.dismiss) {
      const dismiss = document.createElement('button');
      dismiss.className = 'openKeyNav-status__dismiss';
      dismiss.type = 'button';
      dismiss.setAttribute('aria-label', 'Close notification');
      dismiss.textContent = '×';
      dismiss.addEventListener('click', () => {
        this.clear(normalizedChannel);
      });
      entry.element.appendChild(dismiss);
      entry.dismiss = dismiss;
    } else if (options.dismissible !== true && entry.dismiss) {
      entry.dismiss.remove();
      entry.dismiss = null;
    }
    entry.element.classList.toggle(
      'openKeyNav-status--dismissible',
      options.dismissible === true
    );

    return entry.element;
  }

  get(channel) {
    return this.channels.get(String(channel))?.element || null;
  }

  has(channel) {
    return this.channels.has(String(channel));
  }

  clear(channel) {
    const normalizedChannel = String(channel);
    const entry = this.channels.get(normalizedChannel);
    if (!entry) return false;

    if (entry.timer) clearTimeout(entry.timer);
    const container = entry.container;
    entry.element.remove();
    this.channels.delete(normalizedChannel);

    this.removeEmptyContainer(container);
    this.pruneStyles();
    return true;
  }

  clearAll() {
    Array.from(this.channels.keys()).forEach(channel => {
      this.clear(channel);
    });
    this.containers.clear();
    this.styles.forEach(style => style.remove());
    this.styles.clear();
  }
}
