# OpenKeyNav

[![npm version](https://img.shields.io/npm/v/openkeynav.svg)](https://www.npmjs.com/package/openkeynav)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

OpenKeyNav is an MIT-licensed JavaScript library for adding on-demand target labels, direct keyboard navigation, and application-configured keyboard drag-and-drop to websites and web apps.

[![Three-step Click Mode demonstration: enable OpenKeyNav shortcuts with Shift+O, press K to enter Click Mode and show labels beside four detected targets, then type d to select Juniper.](https://raw.githubusercontent.com/LDubya/OpenKeyNav/main/media/openkeynav-click-mode-steps.jpg)](https://openkeynav.com/#demo)

[Live demo](https://openkeynav.com/#demo) · [Documentation](https://openkeynav.com/docs/getting_started/quick_start_guide) · [OpenKeyNav on npm](https://www.npmjs.com/package/openkeynav) · [GitHub](https://github.com/LDubya/OpenKeyNav)

Harvard Innovation Labs featured OpenKeyNav in a [video profile](https://www.youtube.com/watch?v=xIShByl7baE). OpenKeyNav is also the subject of [research presented at the AccessViz workshop at IEEE VIS 2024](https://osf.io/preprints/osf/3wjsa).

## Install and try OpenKeyNav

### npm

```bash
npm install openkeynav
```

Import the package with a build tool, initialize it, and turn off development diagnostics for production:

```javascript
import OpenKeyNav from 'openkeynav';

const openKeyNav = new OpenKeyNav();

openKeyNav.init({
  debug: {
    keyboardAccessible: false,
  },
});
```

CommonJS consumers can load the same package entry with:

```javascript
const OpenKeyNav = require('openkeynav');
```

### CDN

Load the pinned UMD browser build before the closing `</body>` tag:

```html
<script src="https://cdn.jsdelivr.net/npm/openkeynav@0.1.233/dist/openkeynav.umd.min.js"></script>
<script>
  const openKeyNav = new OpenKeyNav();

  openKeyNav.init({
    debug: {
      keyboardAccessible: false,
    },
  });
</script>
```

The UMD build exposes `OpenKeyNav` as a browser global. Update the version pin deliberately when adopting a newer release.

### First interaction

With focus outside an editable field:

1. If OpenKeyNav shortcuts are off, press `Shift+o` to turn them on.
2. Press `k` to enter Click Mode.
3. Type the label shown beside a target. OpenKeyNav focuses or activates the selected target as appropriate.
4. Press `Escape` to leave the current mode.

OpenKeyNav remembers the user's enabled or disabled choice in a cookie.

## What OpenKeyNav does

- **Click Mode:** Displays typeable labels beside detected interactive targets so a user can choose one directly.
- **Heading navigation:** Moves focus among headings with `h` or a specific heading level from `1` through `6`.
- **Move Mode:** Provides a two-step keyboard path for application-configured draggable elements and destinations.
- **Configurable shortcuts:** Lets applications remap the activation and mode keys to avoid conflicts.
- **Development diagnostics:** Uses heuristics to flag likely mouse-clickable, unfocusable elements for manual review.
- **Structural Navigation:** Routes real focus through page structure while preserving native `Tab` behavior.

## Core commands in the current release

Letter commands are unmodified keys unless the table says otherwise.

| Action | Default command |
| --- | --- |
| Turn OpenKeyNav on or off | `Shift+o` |
| Enter Click Mode | `k` |
| Move through headings | `h` |
| Move through headings of a specific level | `1`–`6` |
| Move through scrollable regions | `s` |
| Enter configured Move Mode | `m` |
| Enter or toggle Structural Navigation | `r` |
| Exit Structural Navigation reliably | `Alt+r` |
| Leave an active mode | `Escape` or `q` |

OpenKeyNav keeps its single-character commands behind a user-controlled toggle. Applications can also remap them. These mechanisms can help an application address [WCAG 2.2 Success Criterion 2.1.4, Character Key Shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html); conformance still requires evaluation of the complete application.

## Development diagnostics

`debug.keyboardAccessible` is currently `true` by default. In Click Mode, OpenKeyNav outlines likely mouse-clickable targets that cannot receive focus and provides diagnostic details on hover for manual review.

```javascript
const openKeyNav = new OpenKeyNav();

openKeyNav.init({
  debug: {
    keyboardAccessible: true,
  },
});
```

Treat the results as development guidance. The heuristic can produce false positives and false negatives; verify semantics, accessible names, focus order, keyboard behavior, state communication, and visible focus manually. Set `keyboardAccessible` to `false` for the production experience after completing that review.

OpenKeyNav adds optional keyboard interaction paths. Continue to use semantic HTML and native controls, and test the complete application with keyboard-only workflows, accessibility inspection tools, supported assistive technologies, and disabled users.

## Configure keyboard drag-and-drop

Move Mode needs an application-supplied mapping between sources and destinations. Source and destination elements must also be visible, eligible keyboard targets.

```javascript
const openKeyNav = new OpenKeyNav();

openKeyNav.init({
  debug: {
    keyboardAccessible: false,
  },
  modesConfig: {
    move: {
      config: [
        {
          fromContainer: '.moveable-items',
          toElements: '.drop-zone',
          callback: (source, destination) => {
            destination.append(source);
          },
        },
      ],
    },
  },
});
```

See the [Move Mode documentation](https://openkeynav.com/docs/usage/drag_mode) for source selectors, exclusions, dynamic source resolvers, and native drag-event behavior.

## Structural Navigation

Structural Navigation moves real focus among existing keyboard targets through page contexts such as landmarks, sections, headings, forms, fieldsets, and lists, while leaving native `Tab` behavior intact.

After enabling OpenKeyNav with `Shift+o`, press `r` to enter Structural Navigation.

| Action | Default command |
| --- | --- |
| Enter Structural Navigation | `r` |
| Move to the previous or next lateral structural context | `Shift+Left` / `Shift+Right` |
| Broaden or narrow the active context | `Shift+Up` / `Shift+Down` |
| Hide the visible status without leaving the mode | `Shift+Escape` |
| Exit Structural Navigation | `Alt+r` |

Previous and next target commands and application-supplied typed-route commands are configurable but unbound by default. Read the [Structural Navigation documentation](https://openkeynav.com/docs/usage/structural_navigation) for configuration, APIs, focus-scope behavior, keyboard ownership, and current limitations.

Structural Navigation remains active until the user exits it. Its configured commands get first refusal; heading, heading-level, and scroll-region navigation run normally without ending the mode. Click Mode, Move Mode, and the shortcut menu temporarily take keyboard priority, then Structural Navigation resumes when that temporary mode finishes or is dismissed.

## Version support ping

On non-localhost pages, `init()` sends a support event to `applicationsupport.openkeynav.com`. Its JSON body contains only the OpenKeyNav version and event name. The current API does not provide an opt-out.

## Research and recognition

- Harvard Innovation Labs featured the project in an [OpenKeyNav video profile](https://www.youtube.com/watch?v=xIShByl7baE) and an [OpenKeyNav creator profile](https://www.instagram.com/p/C_1Fl9GJSUq/).
- The preprint [*Using OpenKeyNav to Enhance the Keyboard-Accessibility of Web-based Data Visualization Tools*](https://osf.io/preprints/osf/3wjsa) was presented at the AccessViz workshop at IEEE VIS 2024. [Watch the AccessViz presentation](https://www.youtube.com/watch?v=qWbKjQ_Behk).
- The preprint describes research funded by the National Institutes of Health through Harvard University's HIDIVE Lab.

## Development

```bash
npm install
npm test
npm run build
```

The build produces the browser UMD bundle in `dist/openkeynav.umd.js` and its minified counterpart in `dist/openkeynav.umd.min.js`.

## License

OpenKeyNav is available under the [MIT License](./LICENSE).

© 2014 Lawrence Weru, Aster Enterprises LLC.
