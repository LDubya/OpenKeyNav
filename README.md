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

Production integrations should not require users to discover these commands by chance. Add the [built-in keyboard-command strip](#make-keyboard-commands-discoverable) or provide an equally discoverable, accessibly presented explanation of the commands the application enables.

### Keylabel text size

WCAG does not prescribe a universal minimum font size, but it does require text
to remain usable when resized to 200%. OpenKeyNav keylabels therefore inherit
larger host-page text while using a 16 CSS-pixel legibility floor by default.
Applications can change the floor, disable it, or supply an exact font size:

```javascript
openKeyNav.init({
  spot: {
    minimumFontSize: '18px', // Use false to disable the minimum.
    fontSize: 'inherit',     // Any other CSS size directly overrides the floor.
  },
});
```

The floor and explicit CSS-pixel sizes still scale with browser zoom. Verify the
finished integration at 200% without clipped, obscured, or missing labels, as
required by [WCAG 2.2 Success Criterion 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html).

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
| Open the shortcut guide | `o` |
| Enter Click Mode | `k` |
| Move through headings | `h` |
| Move through headings of a specific level | `1`–`6` |
| Move through scrollable regions | `s` |
| Move backward through headings or scrollable regions | Hold `Shift` with `h`, `1`–`6`, or `s` |
| Enter configured Move Mode | `m` |
| Enter or toggle Structural Navigation | `r` |
| Exit Structural Navigation reliably | `Alt+r` |
| Leave Click Mode, Move Mode, or the shortcut guide | `Escape` or `q` |

When shortcuts are on and no OpenKeyNav mode is active, hold `Ctrl` with an ordinary character command to route it intentionally from an editable field; for example, use `Ctrl+k` for Click Mode. The default global toggle becomes `Ctrl+Shift+o` in an editable field. OpenKeyNav keeps its single-character commands behind a user-controlled toggle, and applications can configure its principal activation and mode keys. Make the on/off control discoverable and test the final shortcuts with speech input, assistive technologies, browser commands, and application commands.

### Make keyboard commands discoverable

Tell users that the optional OpenKeyNav command layer is available, how to turn it on and off, which commands the application has enabled, and how to leave each mode. Advertise only the modes and commands that the application has configured and tested. Keep the instructions available without requiring a user to know an undisclosed shortcut first.

OpenKeyNav includes a compact, persistent keyboard-command strip so applications do not have to recreate its state-aware hints. Place one empty strip element in a stable part of the application, such as its page or application navigation, and initialize OpenKeyNav normally:

```html
<aside aria-label="OpenKeyNav keyboard commands">
  <div class="openKeyNav-toolBar"></div>
</aside>
```

The strip can be present before `init()` or added later by a client-side framework. With the default configuration, it shows `Shift+o` while shortcuts are off. Once they are on, it shows `o` as the command for opening its shortcut guide; the expanded guide lists `k` for Click Mode, the configured Structural Navigation key (`r` by default) when that mode is enabled, and `m` only when Move Mode is configured. While a mode is active, the strip changes to the relevant exit hint. This is persistent, contextual guidance rather than a complete command catalog or live announcement, so pair it with the command table above or an application-specific help page for heading, scroll-region, structural movement, and custom commands.

The current release provides the compact strip layout. Sidebar and settings-page block variants are candidates for a later release. Enable, disable, Click Mode, and Move Mode notification alerts are a separate OpenKeyNav surface and do not replace persistent command discovery. They are transient by default; a zero duration makes them persistent and dismissible. Structural Navigation uses its own persistent status.

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
            // Call the same application operation used by your pointer library.
            destination.append(source);
          },
        },
      ],
    },
  },
});
```

When a move configuration provides a `callback`, OpenKeyNav calls it directly and does not emit synthetic pointer or native drag events. This lets the callback invoke the same application operation as an existing drag-and-drop library without activating that library's sensors. When `callback` is omitted, OpenKeyNav uses its native drag-event simulation path instead.

See the [Move Mode documentation](https://openkeynav.com/docs/usage/drag_mode) for source selectors, exclusions, dynamic source resolvers, and both integration paths.

## Structural Navigation

Structural Navigation moves real focus among existing keyboard targets through page contexts such as landmarks, sections, headings, forms, fieldsets, and lists, and preserves native `Tab`/`Shift+Tab` for sequential focus.

After enabling OpenKeyNav with `Shift+o`, press `r` to enter Structural Navigation.

| Action | Default command |
| --- | --- |
| Enter Structural Navigation | `r` |
| Move to the previous or next structural context start | `Alt+Shift+Tab` / `Alt+Tab` |
| Move to the previous or next lateral structural context | `Shift+Left` / `Shift+Right` |
| Broaden or narrow the active context | `Shift+Up` / `Shift+Down` |
| Hide the visible status without leaving the mode | `Shift+Escape` |
| Exit Structural Navigation | `Alt+r` |

For a heading-backed context, `Shift+Left` and `Shift+Right` follow the authored
heading level (H1 through H6) across the page and enter the first target in the
previous or next matching context. Semantic nesting does not create another
level: when focus is inside a landmark, section, form, fieldset, or list,
Shift+Arrow routing resolves through its enclosing authored heading context.
If no authored heading contains the route, no numeric level is reported and
horizontal heading-lane movement has no destination. Vertical movement can
still enter the authored heading-level ladder without inventing a starting
rank: `Shift+Down` enters the first context at the shallowest level present,
and `Shift+Up` enters the last context at the deepest level present. DOM
containment never supplies a heading level. Same-rank headings remain
horizontal destinations rather than vertical ones.
When a native Tab stop wraps a heading, the wrapper remains the focus target and
the first exposed heading it contains supplies that target's authored heading
level.

`Alt+Tab` and `Alt+Shift+Tab` use the configured ownership-override modifier
to enter the first native Tab stop in the next or previous innermost structural
context. This route follows focus rather than the selected context, so it stays
available after native Tab moves into deeper content without narrowing the
active route. Plain `Tab` and `Shift+Tab` remain browser-owned. If
`overrideModifier` is changed to `ctrlKey` or `metaKey`, the context-start chord
uses that modifier instead; `shiftKey` disables the chord so native
`Shift+Tab` is never intercepted. Platforms may reserve modifier-plus-Tab
chords before a page receives them, so applications should also expose the
`previousContextStart` and `nextContextStart` programmatic commands where their
supported environments require another binding.

`Shift+Up` follows the authored heading outline to the nearest preceding heading
with a lower rank number and enters its first target. `Shift+Down` reverses that
progression by entering the closest available deeper authored rank, including
across skipped ranks. From a region not associated with a heading,
`Shift+Down` enters from the shallowest authored level present and `Shift+Up`
enters from the deepest. Neither command derives a rank from DOM or landmark
nesting.

While the mode is active, its keylabels show the structural destinations
available from the current focus: `⇧←` / `⇧→` for lateral movement and
`⇧↑` / `⇧↓` for broaden/narrow, `⌥⇧⇥` / `⌥⇥` for context starts, plus
`⇧⇥` / `⇥` for the previous and next native Tab destinations. The focused
native control or focusable ARIA widget shows `↵` when Enter is its preferred
activation key. This includes correctly authored custom buttons; the application
remains responsible for implementing their Enter and Space behavior. OpenKeyNav
shows `⎵` only for controls, such as checkboxes and radio buttons, where Space is
the sole standard activation key. These
visual hints use the existing keylabel creation and positioning system; they do
not intercept native Tab or activation behavior. When ordinary Tab or
Shift+Tab already reaches a structural destination, that target shows only the
simpler native Tab chord. Otherwise, when a context-start chord and a heading
arrow reach the same target, the context-start chord takes precedence. Labeled
targets also receive
the existing keylabel target outline without becoming type-to-select targets.
The actively focused target retains the page's normal focus outline; OpenKeyNav's
destination treatment applies without suppressing that authored focus style.
Set
`modesConfig.structuralNavigation.keylabels.enabled` to `false` to hide them,
or independently disable its `tab`, `contextJump`, `horizontal`, `vertical`,
or `activation` groups. Set `keylabels.contextJump` to `false` to hide
context-start hints, or set `keylabels.tab` to `false` to hide native Tab and
Shift+Tab hints.
While Shift is held, the `⇧` symbol in every Shift-based label highlights as a
pressed key and returns to its normal treatment on release.
When the focused control owns its arrow keys, structural destinations remain
visible and prepend the configured ownership override to the chord—for example,
`⌥⇧→` with the default Alt override. Ownership-override arrows and the reverse
context-start chord can use three-symbol labels; other labels remain limited to
two symbols. Holding the override also
highlights its modifier glyph until the key is released.
Native radio groups additionally label the browser's bare-arrow focus routes:
`←↑` for the previous radio and `→↓` for the next. In a two-radio group, the
single peer uses `↔↕`. OpenKeyNav describes these routes without handling the
arrow events. A divider separates symbols that mean “or”; chord symbols such as
`⇧←` remain joined.
The label attached to the actively focused element uses the configured focus-ring
color with white text so it stands apart from destinations. When necessary, its
background is darkened just enough to maintain at least 4.5:1 text contrast while
the existing thin keylabel outline remains white.
The large active-context outline is not persistent by default. It appears while
Shift+Up, Shift+Down, Shift+Left, or Shift+Right changes the heading context,
follows consecutive heading-context moves, and clears on the next different
action such as Tab. Its dashed black outline sits 10px outside the context and
uses a white contrast layer, keeping it visually distinct from the page's focus
indicator. When the active context is backed by an authored heading, a small,
non-interactive tab protrudes from an available outline edge and shows only its
level (`h1` through `h6`). Unheaded contexts do not receive an invented level
tab. Applications can keep the outline
visible throughout Structural Navigation with
`modesConfig.structuralNavigation.contextIndicator.enabled: true`.
The persistent status says `Heading level` only when the current route resolves
to an authored H1–H6 context. It never presents semantic nesting as a numbered
level.

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
