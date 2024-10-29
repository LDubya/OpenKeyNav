// unified status bar and toolbar

import { effect } from './signals.js';
import { keyButton } from './keyButton.js';

let openKeyNav;

export const handleToolBar = (parent) => {

    openKeyNav = parent;

    const toolBarElement = document.querySelector('.openKeyNav-toolBar'); 

    if (!toolBarElement) {
        return;
    }

    injectToolbarStyleSheet();

    // 5. Handle mode changes 
    let lastMessage;

    effect(() => {
      const modes = openKeyNav.config.modes;
      const typedLabel = openKeyNav.config.typedLabel.value;
      updateToolbar(toolBarElement, lastMessage);
    });
    
}

const toolbarTemplates = {
    default : () => { 
        //  default message
        // press k for click mode ( Click [ k ] )
        // press m for drag mode ( Drag [ m ] )
        let dragButton;
        if(!!openKeyNav.config.modesConfig.move.config){ // if drag mode is configured
            dragButton = keyButton(openKeyNav.config.keys.move, "Drag")
        }
        return `<p>
                    ${keyButton(openKeyNav.config.keys.menu, "...")}
                    ${dragButton}
                    ${keyButton(openKeyNav.config.keys.click, "Click")} 
                </p>
            `;
    },

    clickMode : (typedLabel) => {
        return `<p>${ keyButton("Esc", "Click Mode", true)}</p>`
    },

    dragMode : (typedLabel) => { 
        return `<p>${ keyButton("Esc", "Drag Mode", true)}</p>`
    },

    menu : (typedLabel) => {
        let html = "";
        return `
            <p>${ keyButton("Esc", "Shortcuts", true)}</p>
            <div class="openKeyNav-toolBar-expanded">
                ${keyButton(openKeyNav.config.keys.click, "Click")}
                ${keyButton(openKeyNav.config.keys.move, "Drag")}
            </div>
        `;
    }
}

const updateElement = (element, html) => {
    element.innerHTML = html; 
}

const updateToolbar = (toolBarElement, lastMessage) => {

    if (!toolBarElement) {
        return;
    }

    let message;
    const typedLabel = openKeyNav.config.typedLabel.value;
    
    if (openKeyNav.config.modes.clicking.value) {
        message = toolbarTemplates.clickMode(typedLabel);
    } 
    else if (openKeyNav.config.modes.moving.value) {
        message = toolbarTemplates.dragMode(typedLabel);
        // message = toolbarTemplates.menu(typedLabel);
    } 
    else if (openKeyNav.config.modes.menu.value) {
        message = toolbarTemplates.menu(typedLabel);
    }
    else{
      message = toolbarTemplates.default(); // Default message
    }

    // Only emit the notification if the message has changed
    if (message === lastMessage) {
      return;
    }

    // Emit the notification with the current message
    console.log(message);
    // emitNotification(message);
    // Update the toolbar content
    updateElement(toolBarElement, message);
    lastMessage = message;
}

const injectToolbarStyleSheet = () => {
    const style = document.createElement('style');
    const toolBarHeight = openKeyNav.config.toolBar.height;
    const toolBarVerticalPadding = 6;
    const toolbarBackground = `
        background-color: hsl(210 10% 95% / 1);
        border: 1px solid hsl(210, 8%, 68%);
        border-radius: 4px;
        padding: 3px ${toolBarVerticalPadding}px;
    `;
    style.type = 'text/css';
    style.innerHTML += `
    .openKeyNav-toolBar {
        width: 200px; // needs to have a set width since the content changes inside...
        // max-width: 200px;
        // background-color: #333;
        color: #333;
        z-index: 10000;
        ${toolbarBackground}
        font-size:12px;
        display: flex;
        align-items: center;
        // align-items: end;
        flex-direction: column;
        direction: rtl;
        max-height: ${toolBarHeight}px;
        position:relative;
    }
    .openKeyNav-toolBar > p{
        overflow: hidden;
    }
    .openKeyNav-toolBar p{
        font-size: 16px;
        margin-bottom: 0;
        line-height: ${toolBarHeight - toolBarVerticalPadding}px;
        text-align: left;
    }
    .openKeyNav-toolBar-expanded {
        position: absolute;
        top: 0;
        margin-top: 40px;
        width: 100%;
        ${toolbarBackground}
        display: grid;
        justify-content: left;
    }
    // .openKeyNav-toolBar span.stacked {
    //     display: inline-grid;
    //     grid-template-rows: auto auto;
    // }
    `;
    document.head.appendChild(style);
}