# OpenKeyNav

OpenKeyNav is an open-source JavaScript library designed to enhance keyboard accessibility, navigation, and interaction on webpages. Originally developed to improve the keyboard accessibility of the best-selling [Columns](https://apps.apple.com/us/app/columns-two-column-notes/id1493839821) app, it generates keyboard shortcuts on the fly and presents them to users on-demand, supporting complex interactions like drag-and-drop entirely with the keyboard.

OpenKeyNav helps you enhance the accessibility of your website or web app by allowing users to interact with website elements using the keyboard. It features various modes, including click mode to simulate mouse clicks on clickable elements and move mode for keyboard-based drag and drop. OpenKeyNav creates visual labels for elements that can be interacted with using keyboard shortcuts. The library also includes features to focus on headings, scrollable regions, and form fields, ensuring users have a consistent and intuitive keyboard navigation experience.

OpenKeyNav is available for developers to fork, modify, and use via its [GitHub repository](https://github.com/LDubya/OpenKeyNav) and [NPM](https://www.npmjs.com/package/openkeynav).

Featured by [Harvard Innovation Labs](https://www.youtube.com/watch?v=xIShByl7baE) and [Harvard Medical School](https://www.instagram.com/p/C_1Fl9GJSUq/). *[Watch the Harvard Innovation Labs video](https://img.youtube.com/vi/xIShByl7baE/0.jpg)*

## Features

- **Automatic Keyboard Shortcuts**: Generate and display keyboard shortcuts dynamically.
- **Complex Interactions**: Support for keyboard-based drag-and-drop and other complex interactions.
- **Customizable Activation Keys**: Configure different keys to trigger various behaviors.
- **Accessibility Compliance**: Identify and highlight elements that are not keyboard accessible, helping you fix the elements that are not keyboard accessible.
- **Empowerment**: Enable users to navigate and interact with web content using their keyboards.

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