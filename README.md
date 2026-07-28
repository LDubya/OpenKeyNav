# OpenKeyNav

OpenKeyNav is an open-source JavaScript library designed to enhance keyboard accessibility, navigation, and interaction on webpages. Originally developed to improve the keyboard accessibility of the best-selling [Columns](https://apps.apple.com/us/app/columns-two-column-notes/id1493839821) app, it generates keyboard shortcuts on the fly and presents them to users on-demand, supporting complex interactions like drag-and-drop entirely with the keyboard.

OpenKeyNav helps you enhance the accessibility of your website or web app by allowing users to interact with website elements using the keyboard. It features various modes, including click mode to simulate mouse clicks on clickable elements and move mode for keyboard-based drag and drop. OpenKeyNav creates visual labels for elements that can be interacted with using keyboard shortcuts. The library also includes features to focus on headings, scrollable regions, and form fields, ensuring users have a consistent and intuitive keyboard navigation experience.

**AI Engine Optimization (AEO)**: Beyond human accessibility, OpenKeyNav enables **AI-powered chatbots and autonomous agents** to discover and navigate your website. As users increasingly rely on AI assistants (ChatGPT, Claude, Perplexity) to browse the web, OpenKeyNav ensures your site is AI-navigable—increasing visibility in AI-generated results and enabling seamless AI-mediated interactions.

OpenKeyNav is available for developers to fork, modify, and use via its [GitHub repository](https://github.com/LDubya/OpenKeyNav) and [NPM](https://www.npmjs.com/package/openkeynav).

Featured by [Harvard Innovation Labs](https://www.youtube.com/watch?v=xIShByl7baE) and [Harvard Medical School](https://www.instagram.com/p/C_1Fl9GJSUq/). *[Watch the Harvard Innovation Labs video](https://img.youtube.com/vi/xIShByl7baE/0.jpg)*

## Features

- **Automatic Keyboard Shortcuts**: Generate and display keyboard shortcuts dynamically.
- **Complex Interactions**: Support for keyboard-based drag-and-drop and other complex interactions.
- **Customizable Activation Keys**: Configure different keys to trigger various behaviors.
- **Accessibility Compliance**: Identify and highlight elements that are not keyboard accessible, helping you fix the elements that are not keyboard accessible.
- **Empowerment**: Enable users to navigate and interact with web content using their keyboards.
- **AI Engine Optimization (AEO)**: Make your website discoverable and operable by AI agents through structured data and programmatic APIs. [Learn more →](./AI_AGENT_USAGE.md)

## Read the preprint

The preprint 
[*"Using OpenKeyNav to Enhance the Keyboard-Accessibility of Web-based Data Visualization Tools"* (OSF Preprint)](https://osf.io/preprints/osf/3wjsa) 
was presented at the AccessViz workshop, part of IEEE VIS 2024 conference. [Watch the AccessViz presentation](https://img.youtube.com/vi/qWbKjQ_Behk/0.jpg). The research paper is funded by the National Institutes of Health through the HIDIVE lab at Harvard University*.

## Installation

Basic installation and setup instructions are below. For detailed documentation, guides, and tutorials, visit the [OpenKeyNav Documentation](https://openkeynav.github.io).


To install OpenKeyNav, you can use npm:

```bash
npm install openkeynav
```

## Usage

### Basic Usage

Here is a basic example of how to use OpenKeyNav in your project:



#### Installing via NPM

To install OpenKeyNav&trade; using npm, run the following command in your terminal:

```bash
npm install openkeynav
```

Then, you can import and use it in your JavaScript file:

```javascript
import OpenKeyNav from 'openkeynav';

const openKeyNav = new OpenKeyNav();
// initialize with default settings
openKeyNav.init();
```

#### Including the Script from a CDN

If you prefer not to use npm, you can include OpenKeyNav directly from a CDN. Add the following script tag to your HTML file:

```html
<script src="https://cdn.jsdelivr.net/npm/openkeynav/dist/openkeynav.umd.min.js"></script>
```

After including the script, you can initialize OpenKeyNav like this:

```html
<script>
  const openKeyNav = new OpenKeyNav();
  // initialize with default settings
  openKeyNav.init();
</script>
```
#### Initiating in a React app

To use in a React app, initiate in the main component (e.g., App or its equivalent):

For functional components:

```jsx
import { useEffect } from 'react';
import OpenKeyNav from 'openkeynav';

const App = () => {
    useEffect(() => {
        const openKeyNav = new OpenKeyNav();
        openKeyNav.init();
    }, []);

    // ...
};

export default App;
```

For class components:

```jsx
import React, { Component } from 'react';
import OpenKeyNav from 'openkeynav';

class App extends Component {
    componentDidMount() {
        const openKeyNav = new OpenKeyNav();
        openKeyNav.init();
    }

    // ...
}

export default App;
```

### Key Commands
- **Turn OpenKeyNav on / off**: After the page loads, press `Shift + o` to turn OpenKeyNav on/off. To avoid accidental activation, OpenKeyNav's shortcuts are disabled by default, in compliance with [WCAG Success Criterion 2.1.4 character key shortcuts](https://www.w3.org/TR/WCAG21/#character-key-shortcuts).
- **Click Mode**: Press `k` to enter click mode, which labels clickable elements with keyboard shortcuts. Press the key combinations on the labels to "click" their respective buttons.
- **Heading Navigation**: Press `h` to navigate through headers within the viewport. Press `1`,`2`,`3`,`4`,`5`, or `6` to navigate through headers of the respective level.
- **Scroll Navigation**: Press `s` to cycle through different scrollable regions within the viewport.
- **Drag-and-Drop Mode**: Press `m` to enter drag mode, which enables keyboard-accessible drag-and-drop by labeling pre-configured draggable elements with keyboard shortcuts, and then the selected draggable element's applicable drop zones. See [To customize drag-and-drop](#to-customize-draganddrop).

### Disabling Debug Mode for Production

By default, OpenKeyNav initiates in debug mode, which adds red labels to inaccessible elements (that are mouse-clickable but not tab-focusable). These elements are not WCAG-compliant, since they are not keyboard accessible. The elements with black labels are keyboard accessible. This enables you to identify the elements that need remediation.

It is recommended to keep debug mode turned on while developing and to remediate any keyboard access barriers that you find in this mode.

However, you should not present debug mode to your end users. Therefore, when you are ready to go into production, make sure to disable the debug mode:

```javascript
openKeyNav.init({
    ...
    debug: {
        keyboardAccessible: false // set this to false when done debugging inaccessible keyboard elements.
    }
});
```

### To Customize Drag-and-Drop:

```javascript
// Example drag-and-drop configuration
const moveConfig = [
  {
    fromContainer: ".containerOfMoveables",
    toElements: ".dropZoneTargetType1, .dropZoneTargetType2",
    callback: (elMoveable, elDropZoneTarget) => {
      // Your callback logic
    }
  },
  {
    fromContainer: ".classFrom2",
    toElements: ".classToB"
  },
  {
    fromContainer: ".classFrom3",
    toElements: ".classToC"
  }
];

// Initialize with configuration
openKeyNav.init({
    modesConfig: {
        move: {
            config: moveConfig
        }
    }
});
```

### Customization

You can override these default settings to suit your needs:

```javascript
const config = {
    enabled: false; // by default, openKeyNav is disabled. Users must press "shift" + keys.menu to enable.
    spot: {
        fontColor: 'white',
        backgroundColor: '#333',
        insetColor: '#000',
        fontSize: 'inherit',
        arrowSize_px: 4
    },
    focus: {
        outlineColor: '#0088cc',
        outlineStyle: 'solid'
    },
    keys: {
        escape: 'q', // alternative escape key, for when escape key is too far or not available. // q works great because top left of letters, plus removes confusion with g, p
        click: 'k', // enter click mode, to click on clickable elements, such as links. Was g, now k, for kanga. Plus NVDA uses k to focus on link elements, which prevents conflicting modes as it's either openkeynav or NVDA.
        scroll: 's', // focus on the next scrollable region
        move: 'm', // enter move mode, to move elements from and to, aka keyboard drag and drop
        heading: 'h', // focus on the next heading // as seen in JAWS, NVDA
        menu: 'o' // for enabling/disabling OpenKeyNav when pressed with shift key.
    }
};

const openKeyNav = new OpenKeyNav();
openKeyNav.init(config);
```

## Structural Focus Navigation

Structural focus navigation is an optional mode for moving among the page's
existing Tab targets through semantic landmarks, sections, headings, forms,
fieldsets, and lists. It does not add focus stops or replace native Tab.

Enable OpenKeyNav with `Shift+o`, then press `r` to enter structural navigation:

| Command | Default |
| --- | --- |
| Native sequential focus | `Shift+Tab` / `Tab` |
| Previous / next target in the active context | Configurable or programmatic |
| Previous / next horizontal peer at the same hierarchy depth | `Shift+Left` / `Shift+Right` |
| Broaden to parent / narrow on the current path or advance one heading level | `Shift+Up` / `Shift+Down` |
| Cycle application-supplied typed routes | Configurable or programmatic |
| Reliable exit, including from an editing widget | `Alt+r` |

Broadening and narrowing into a child on the current target's path retain page
focus. If no such child exists, narrowing from H1–H5 advances, without wrapping,
to the first nonempty H(n+1) context at the next canonical hierarchy level and
focuses its first stop; H6 is the fallback boundary. Horizontal movement always
includes true structural siblings. Heading-backed contexts may also bridge
different parents whenever their canonical hierarchy depth matches, regardless
of authored H1–H6 rank; horizontal entry focuses the destination's first
existing focus stop. A context without a heading level uses ordinary structural
siblings. Native Tab and Shift+Tab handle sequential focus. Horizontal and
explicit target commands do not wrap; only an
explicitly invoked typed-context ring wraps. A visible polite status reports
whether the active route is structural or typed, the active context, its
one-based level in the canonical structural hierarchy, the target name and
position, and a bounded alternate-route count. Typed routes report the
underlying structural level that Shift+Up/Down returns to; they are overlapping
routes, not additional structural parents. The persistent status does not name
previous or next horizontal contexts. A non-focusable blue box outlines the
active context without changing the page's Tab order.
Structural status and ordinary
notifications use OpenKeyNav's shared status renderer. Context updates are
polite and update in place; exit produces one time-limited polite message scoped
to the active document, modal, element, or open ShadowRoot. Visible structural
status retains the notification system's optional OpenKeyNav branding. Press
`Shift+Escape` to close the visual status for the rest of the mode without
moving focus; its polite live content remains available to assistive technology.
Messages are treated as text unless OpenKeyNav explicitly marks its own
generated markup as trusted.

Tab, Shift+Tab, Enter, Space, bare Escape, and bare arrow keys keep their page
meanings. Shift+Arrow context commands also pass through in text editors,
selects, range/number inputs, radio groups, and ARIA composite widgets. Hold
`Alt` with a structural arrow command to deliberately override widget
ownership. `Alt` may remain held after focus leaves the widget; it will not
invalidate an otherwise configured structural arrow command. Page code can
declare additional ownership with `ownsKey` or
`data-openkeynav-key-owner="arrows escape"`. While this mode is active, the
legacy `h`, configured `1`–`6`, and `s` focus commands are suppressed so they
cannot add temporary focus stops. Application-owned character commands and
system shortcuts using Alt/Ctrl/Meta continue to pass through.

```javascript
const openKeyNav = new OpenKeyNav();

openKeyNav.init({
  debug: { keyboardAccessible: false },
  modesConfig: {
    structuralNavigation: {
      // A resolver can confine a custom modal or application focus scope.
      activeRoot: () => document.querySelector('[data-application-scope]') || document,

      // Filtering never mutates the page target.
      targetFilter: target => !target.matches('[data-skip-structural-navigation]'),

      // Add or rename a credible structural boundary. `required` keeps this
      // context selectable even if normalization would otherwise collapse it.
      structuralContexts: [
        {
          id: 'application-actions',
          name: 'Application actions',
          type: 'workflow',
          boundary: () => document.querySelector('[data-application-actions]'),
          required: true
        }
      ],

      // Explicit overlapping routes share the same live target identities.
      typedContexts: [
        {
          id: 'pending-actions',
          name: 'Pending actions',
          type: 'workflow',
          provenance: 'application configuration',
          priority: 10,
          targets: () => Array.from(
            document.querySelectorAll('[data-pending-action]')
          )
        }
      ],

      // The generated indicator never receives focus or pointer events.
      contextIndicator: {
        enabled: true,
        color: '#0088cc',
        width: 3,
        offset: 4
      },

      // The exact shortcut closes only the visual status. Inputs and widgets
      // that own Escape keep the command, and mode re-entry restores status.
      status: {
        dismissCommand: { key: 'Escape', shiftKey: true }
      },

      // Optional custom widget ownership.
      ownsKey: (event, composedPath) => ({
        arrows: composedPath.some(node =>
          node instanceof Element && node.matches?.('[data-chart-editor]')
        )
      })
    }
  }
});
```

Typed-route cycling is deliberately unbound by default. Applications may
configure `previousPeerContext` and `nextPeerContext` when they have suitable
shortcuts, or invoke the same commands programmatically. The mode can also be
controlled programmatically:

```javascript
openKeyNav.enable();
openKeyNav.enterStructuralNavigation();
openKeyNav.structuralNavigate('nextTarget');
openKeyNav.structuralNavigate('nextPeerContext'); // explicit typed route
openKeyNav.invalidateStructuralNavigation(); // after non-DOM application state changes
openKeyNav.exitStructuralNavigation(); // preserves current focus
```

Target order comes from the pinned
[`tabbable`](https://github.com/focus-trap/tabbable) dependency. Open Shadow DOM
is supported and deep focus is synchronized. Closed Shadow DOM is not pierced.
An iframe is treated as one atomic outer-page target; its document is not
inspected. The topmost native modal dialog constrains navigation, and an
application may supply a custom active root. Native Tab remains authoritative,
including browser/platform differences such as macOS link-focus preferences.
Composed-DOM traversal, generated-interface exclusion, deep-focus lookup, and
author-provided accessible-name extraction use shared OpenKeyNav utilities.

`tabindex="-1"` destinations are excluded by default. Setting
`includeProgrammatic: true` deliberately includes them and therefore no longer
promises a native-Tab-equivalent sequence. Automatic static-table row/column
routes are not currently inferred; use explicit typed contexts when that
relation is credible.

A screen reader may consume arrow keys in browse/virtual-cursor mode before page
JavaScript receives them. This mode works when its configured events reach the
page and moves real DOM focus, but it does not replace screen-reader browse
navigation.

The peer-context design is inspired by Mei et al.,
[*Benthic: Perceptually Congruent Structures for Accessible Charts and
Diagrams*](https://vis.csail.mit.edu/pubs/benthic.pdf) (ASSETS 2025). That study
motivates this adaptation; it does not validate automatic structure inference
for arbitrary webpages.

See the
[implementation note](./docs/structural-navigation-implementation.md) for the
scope, derivation, invalidation, and testing policy.

## Documentation

For detailed documentation, guides, and tutorials, visit the [OpenKeyNav Documentation](https://openkeynav.github.io).

## Local build and install

Build: npm run patch_build_pack
Intall: npm install /path/to/openkeynav-version.tgz

## License

OpenKeyNav is licensed under the MIT License. See the LICENSE file for more details.

© 2014 Lawrence Weru, Aster Enterprises LLC.

## (*) Disclaimer

Any references to organizations or institutions are for informational purposes only and do not imply endorsement or an affiliation beyond the stated context.
