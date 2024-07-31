# OpenKeyNav

OpenKeyNav is a JavaScript library designed to enhance keyboard accessibility on websites. It generates keyboard shortcuts on the fly and presents them to the user on-demand, reducing cognitive load and supporting complex interactions like drag-and-drop entirely with the keyboard.

## Features

- **Automatic Keyboard Shortcuts**: Generate and display keyboard shortcuts dynamically.
- **Complex Interactions**: Support for keyboard-based drag-and-drop and other complex interactions.
- **Customizable Activation Keys**: Configure different keys to trigger various behaviors.
- **Accessibility Compliance**: Identify and highlight elements that are not accessible via screen readers.
- **Empowerment Intervention**: Enable users to navigate and interact with web content using their keyboards despite existing accessibility barriers.

## Installation

To install OpenKeyNav, you can use npm:

```bash
npm install openkeynav
```

## Usage

### Basic usage

Here is a basic example of how to use OpenKeyNav in your project:

```javascript
import OpenKeyNav from 'openkeynav';

const openKeyNav = new OpenKeyNav();

// initialize with default settings
openKeyNav.init();

```

Then press `k`
to label clickable elements with keyboard shortcuts.
Press the key combinations on the labels to "click" their respective buttons.

You can press `h` to navigate through headers within the viewport.

You can also press `1`,`2`,`3`,`4`,`5`, or `6` to navigate through headers of the respective level

You can press `s` to cycle through different scrollable regions within the viewport.

### Disabling debug mode for production

By default, OpenKeyNav initiates in debug mode, which adds red labels to elements that are mouse-clickable but not tab-focusable. These elements are not WCAG-compliant, since they are not keyboard accessible. The elements with black labels are keyboard accessible. This enables you to identify the elements that need remediation. 

It is recommended to keep debug mode turned on while developing, and to remediate any keyboard access barriers that you can find in this mode.

However, you should not present debug mode to your end users. Therefore, when you are ready to go into production, make sure to disable the debug mode:

```javascript

openKeyNav.init({
    ...
    debug : {
            keyboardAccessible : false // set this to false when done debugging inaccessible keyboard elements.
    }
})
```

### To customize drag-and-drop:

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

## License

OpenKeyNav is licensed under the MIT License. See the LICENSE file for more details.