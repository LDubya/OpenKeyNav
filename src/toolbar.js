// unified status bar and toolbar

import { effect } from './signals.js';
import { keyButton } from './keyButton.js';

let openKeyNav;

export const handleToolBar = (openKeyNav_obj) => {

    openKeyNav = openKeyNav_obj;

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

        const toolBarElement = document.querySelector('.openKeyNav-toolBar'); 

        if (!toolBarElement) {
            return;
        }

        toolBarElement.style.minWidth = "150px"

        let numButtons = 0;

        let clickButton = "";

        let dragButton = "";

        let menuButton = keyButton([openKeyNav.config.keys.menu, "shift"], "Shortcuts");
        if(openKeyNav.config.enabled.value){
            menuButton = keyButton([openKeyNav.config.keys.menu], "Shortcuts");
        }

        return `<p>
                    ${menuButton}
                    ${dragButton}
                    ${clickButton} 
                </p>
            `;
    },

    clickMode : (typedLabel) => {
        return `<p>${ keyButton(["Esc"], "Click Mode", true)}</p>`
    },

    dragMode : (typedLabel) => { 
        return `<p>${ keyButton(["Esc"], "Drag Mode", true)}</p>`
    },

    menu : (typedLabel) => {
        let dragButton = "";
        if(openKeyNav.config.modesConfig.move.config.length){ // if drag mode is configured
            dragButton = keyButton([openKeyNav.config.keys.move], "Drag")
        }
        return `
            <p>${ keyButton(["Esc"], "Shortcuts", true)}</p>
            <div class="openKeyNav-toolBar-expanded">
                ${keyButton([openKeyNav.config.keys.click], "Click")}
                ${dragButton}
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

    // console.log(message);
    // Update the toolbar content
    updateElement(toolBarElement, message);
    lastMessage = message;
}

const injectToolbarStyleSheet = () => {

    if(!!document.querySelector('.okn-toolbar-stylesheet')){
        return false;
    }

    const style = document.createElement('style');
    style.setAttribute("class","okn-toolbar-stylesheet")
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
        // width: 200px;    // needs to have a set width (or a min-width) since the content changes inside... 
                            // min-widh is set inside the init depending on number of keys
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