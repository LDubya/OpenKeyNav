# Browser automation and discovery

OpenKeyNav's keyboard interface can also be exercised by browser automation. An integration can load the library, initialize and enable it, send the same commands a keyboard user would send, and inspect the temporary target labels created by the active mode.

## Discovering current Click Mode targets

After initialization, enable OpenKeyNav and send the configured Click Mode command (`k` by default). Click Mode adds a temporary `data-openkeynav-label` value to each currently detected target and creates a matching `.openKeyNav-label` overlay.

An integration running in the page can read the current pairs:

```javascript
const targets = Array.from(
  document.querySelectorAll('[data-openkeynav-label]:not(.openKeyNav-label)')
).map(element => ({
  shortcut: element.getAttribute('data-openkeynav-label'),
  element,
}));
```

The `shortcut` is the key sequence displayed for that target. Send that sequence through the browser automation layer to use OpenKeyNav's normal interaction path.

Treat these attributes and overlays as ephemeral UI state. Re-query them after page changes or mode transitions, and read names, roles, state, and other meaning from the target element's DOM and accessibility semantics.

## Site metadata

Sites that describe OpenKeyNav to automated clients can use ordinary `WebPage` or `SoftwareApplication` structured data and keep it aligned with the version and capabilities they actually deploy. OpenKeyNav's current browser interface is the initialized library and its keyboard modes.

## Integration checklist

1. Load the npm or pinned UMD build documented in the README.
2. Create an `OpenKeyNav` instance and call `init()`.
3. Enable OpenKeyNav, then send configured keyboard commands through the automation layer.
4. Wait for the active mode to render before inspecting its current targets.
5. Re-query after navigation or DOM updates.
6. Leave the mode with `Escape` or `q`, and call `destroy()` when the integration is finished.
