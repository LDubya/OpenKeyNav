# OpenKeyNav

[![npm version](https://img.shields.io/npm/v/openkeynav.svg)](https://www.npmjs.com/package/openkeynav)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

OpenKeyNav is an MIT-licensed JavaScript library for adding direct keyboard operation to websites and web apps. Click Mode labels detected targets for direct selection, navigation commands create faster routes through a page, and Move Mode maps application-defined sources and destinations into keyboard drag-and-drop workflows.

## As seen in

<p align="center">
  <a href="https://www.youtube.com/watch?v=xIShByl7baE"><img src="https://raw.githubusercontent.com/LDubya/OpenKeyNav/main/media/as-seen-in/harvard-innovation-labs.png" alt="Harvard Innovation Labs" height="42"></a>
  <a href="https://ieeevis.org/year/2024/program/paper_w-accessible-1024.html"><img src="https://raw.githubusercontent.com/LDubya/OpenKeyNav/main/media/as-seen-in/ieee-vis-2024.png" alt="IEEE VIS 2024" height="36"></a>
  <a href="https://pubmed.ncbi.nlm.nih.gov/41196858/"><img src="https://raw.githubusercontent.com/LDubya/OpenKeyNav/main/media/as-seen-in/pubmed.svg" alt="PubMed" height="36"></a>
  <a href="https://doi.org/10.1371/journal.pcbi.1013657"><img src="https://raw.githubusercontent.com/LDubya/OpenKeyNav/main/media/as-seen-in/plos.svg" alt="PLOS" height="42"></a>
  <a href="https://doi.org/10.5753/ihc.2025.10922"><img src="https://raw.githubusercontent.com/LDubya/OpenKeyNav/main/media/as-seen-in/ihc-2025.png" alt="IHC 2025" height="36"></a>
  <a href="https://www.ihdconference.org/2025/sessions/moving-away-from-mouse-dependency-empowering-productive-web-experiences-with-keyboard-accessibility/"><img src="https://raw.githubusercontent.com/LDubya/OpenKeyNav/main/media/as-seen-in/ihd-evidence-for-success-2025.png" alt="IHD Evidence for Success Disability Conference 2025" height="38"></a>
</p>

[WCAG 2.1 Success Criterion 2.1.1](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html) requires content functionality to be operable through a keyboard interface. OpenKeyNav provides reusable keyboard paths for detected targets and application-configured workflows. Teams verify every required action, state change, and outcome across the complete task.

[![Three-step Click Mode demonstration: enable OpenKeyNav shortcuts with Shift+O, press K to enter Click Mode and show labels beside four detected targets, then type d to select Juniper.](https://raw.githubusercontent.com/LDubya/OpenKeyNav/main/media/openkeynav-click-mode-steps.jpg)](https://openkeynav.com/#demo)

[Live demo](https://openkeynav.com/#demo) · [Documentation](https://openkeynav.com/docs/getting_started/quick_start_guide) · [OpenKeyNav on npm](https://www.npmjs.com/package/openkeynav) · [GitHub](https://github.com/LDubya/OpenKeyNav)

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
<script src="https://cdn.jsdelivr.net/npm/openkeynav@0.1.234/dist/openkeynav.umd.min.js"></script>
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

## Keyboard operation modes and tools

- **Click Mode:** Displays typeable labels beside detected targets so a user can focus or activate one directly.
- **Heading navigation:** Moves focus among headings with `h` or a specific heading level from `1` through `6`.
- **Move Mode:** Provides a two-step keyboard path between application-configured sources and destinations.
- **Configurable shortcuts:** Lets applications remap the activation and mode keys to avoid conflicts.
- **Development diagnostics:** Uses a focused heuristic to identify actions for manual review of semantics, focus, activation, and task completion.
- **Structural Navigation:** Routes real focus through page structure while preserving native `Tab` behavior.

## Keyboard accessibility and WCAG

OpenKeyNav supports implementation work for several keyboard-related WCAG requirements:

- **[2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html):** Click Mode provides an on-demand keyboard path to detected targets. Move Mode provides a keyboard path for configured endpoint-based movement workflows.
- **[2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html):** `Escape` leaves temporary OpenKeyNav modes, and `Alt+r` reliably exits Structural Navigation.
- **[2.1.4 Character Key Shortcuts](https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html):** OpenKeyNav keeps its character commands behind a user-controlled on/off command, and applications can configure its keys.

### ADA Title II

Use OpenKeyNav to build keyboard paths for ADA Title II compliance. The federal web and mobile rule uses WCAG 2.1 Level AA as its technical standard for state and local governments, including content delivered through vendor arrangements. The current compliance dates are April 26, 2027 for entities with populations of 50,000 or more and April 26, 2028 for smaller entities and special district governments. See the [OpenKeyNav ADA Title II guide](https://openkeynav.com/docs/ada-title-ii-keyboard-accessibility) for implementation and verification guidance.

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

OpenKeyNav keeps its single-character commands behind a user-controlled toggle, and applications configure the final command map. Make the on/off control discoverable and test its shortcuts with speech input, assistive technologies, browser commands, and application commands.

## Development diagnostics

`debug.keyboardAccessible` is currently `true` by default. In Click Mode, OpenKeyNav adds a diagnostic outline and hover details to actions the heuristic identifies for manual review. Click Mode includes each outlined target in its direct-selection labels.

```javascript
const openKeyNav = new OpenKeyNav();

openKeyNav.init({
  debug: {
    keyboardAccessible: true,
  },
});
```

The focused heuristic can produce false positives and false negatives. Use its results to guide manual verification of action coverage, semantics, accessible names, focus order, keyboard behavior, state communication, and visible focus. Set `keyboardAccessible` to `false` for the production experience after completing that review.

OpenKeyNav's operation layer works with the page's semantic HTML, accessible names, roles, states, and focus behavior. Test each complete application workflow with a keyboard, accessibility inspection tools, supported assistive technologies, and disabled users.

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

Structural Navigation moves real focus among existing keyboard targets through page contexts such as landmarks, sections, headings, forms, fieldsets, and lists, and preserves native `Tab`/`Shift+Tab` for sequential focus.

After enabling OpenKeyNav with `Shift+o`, press `r` to enter Structural Navigation.

| Action | Default command |
| --- | --- |
| Enter Structural Navigation | `r` |
| Move to the previous or next lateral structural context | `Shift+Left` / `Shift+Right` |
| Broaden or narrow the active context | `Shift+Up` / `Shift+Down` |
| Hide the visible status without leaving the mode | `Shift+Escape` |
| Exit Structural Navigation | `Alt+r` |

Previous/next target and typed-route commands begin with empty key bindings so applications can assign shortcuts that fit the host interface; each command is also available programmatically. Read the [Structural Navigation documentation](https://openkeynav.com/docs/usage/structural_navigation) for configuration, APIs, focus-scope behavior, and keyboard ownership.

Structural Navigation remains active until the user exits it. Its configured commands get first refusal; heading, heading-level, and scroll-region navigation run normally without ending the mode. Click Mode, Move Mode, and the shortcut menu temporarily take keyboard priority, then Structural Navigation resumes when that temporary mode finishes or is dismissed.

## Version support telemetry

By default, on non-localhost pages, init() attempts to send a version-support event to applicationsupport.openkeynav.com. The JSON body’s only changing value is the OpenKeyNav version; it also contains a fixed event name. To prevent that request, disable telemetry during initialization:

```javascript
const openKeyNav = new OpenKeyNav();

openKeyNav.init({
  telemetry: {
    enabled: false,
  },
});
```

## Research and recognition

- Harvard Innovation Labs featured the project in an [OpenKeyNav video profile](https://www.youtube.com/watch?v=xIShByl7baE) and an [OpenKeyNav creator profile](https://www.instagram.com/p/C_1Fl9GJSUq/).
- OpenKeyNav was presented at the [Evidence for Success Disability Conference](https://www.ihdconference.org/2025/sessions/moving-away-from-mouse-dependency-empowering-productive-web-experiences-with-keyboard-accessibility/), hosted by Northern Arizona University's Institute for Human Development.
- The preprint [*Using OpenKeyNav to Enhance the Keyboard-Accessibility of Web-based Data Visualization Tools*](https://osf.io/preprints/osf/3wjsa) was presented at the AccessViz workshop at IEEE VIS 2024. The paper was funded by the National Institutes of Health through Harvard University's HIDIVE Lab. [Watch the AccessViz presentation](https://www.youtube.com/watch?v=qWbKjQ_Behk).
- [*Ten simple rules for making biomedical data resources accessible*](https://doi.org/10.1371/journal.pcbi.1013657), published in PLOS Computational Biology and [indexed by PubMed](https://pubmed.ncbi.nlm.nih.gov/41196858/), includes OpenKeyNav in its guidance for keyboard access and multiple input devices.
- [*Challenges in the Accessibility of Data Visualization: Lessons from an Evaluation of a Dam Safety System*](https://doi.org/10.5753/ihc.2025.10922) evaluates OpenKeyNav as a keyboard route for reproducing pointer-driven interactions.

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
