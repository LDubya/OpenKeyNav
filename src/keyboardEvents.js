export const MODIFIER_KEYS = Object.freeze([
  'altKey',
  'ctrlKey',
  'metaKey',
  'shiftKey',
]);

export const normalizeShortcut = shortcut => {
  if (!shortcut) return null;
  if (typeof shortcut === 'string') return { key: shortcut };
  if (typeof shortcut === 'object' && typeof shortcut.key === 'string') {
    return shortcut;
  }
  return null;
};

const keysEqual = (left, right) => {
  if (left.length === 1 && right.length === 1) {
    return left.toLowerCase() === right.toLowerCase();
  }
  return left === right;
};

/**
 * Match a configured shortcut exactly. Modifiers omitted by the configuration
 * are treated as false so browser and application chords do not collide.
 * A caller may permit specific extra modifiers without weakening an explicit
 * `true` or `false` requirement in the configured shortcut.
 */
export const matchesShortcut = (
  event,
  shortcut,
  options = {}
) => {
  const normalized = normalizeShortcut(shortcut);
  if (!normalized || !keysEqual(event.key, normalized.key)) return false;

  // Preserve the original string form for callers that deliberately need to
  // ignore a modifier entirely. New ownership overrides should use
  // `allowedExtraModifiers` so explicit shortcut requirements remain exact.
  const optionBag = typeof options === 'object' && options !== null
    ? options
    : {};
  const ignoredModifier = typeof options === 'string'
    ? options
    : optionBag.ignoredModifier || null;
  const allowedExtras = optionBag.allowedExtraModifiers || [];
  const allowedExtraModifiers = new Set(
    Array.isArray(allowedExtras)
      ? allowedExtras
      : [allowedExtras].filter(Boolean)
  );

  return MODIFIER_KEYS.every(modifier => {
    if (modifier === ignoredModifier) return true;
    const eventHasModifier = Boolean(event[modifier]);
    const shortcutDeclaresModifier = Object.prototype.hasOwnProperty.call(
      normalized,
      modifier
    );
    if (
      allowedExtraModifiers.has(modifier) &&
      !shortcutDeclaresModifier &&
      eventHasModifier
    ) {
      return true;
    }
    return eventHasModifier === Boolean(normalized[modifier]);
  });
};

/**
 * Cancel one keyboard command after OpenKeyNav has accepted ownership of it.
 */
export const preventAcceptedCommand = event => {
  event.preventDefault();
  event.stopPropagation();
  return true;
};
