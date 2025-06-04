// unified status bar and toolbar

import { effect } from './signals.js';
import { keyButton } from './keyButton.js';
import { modiferKeyString } from "./keypress.js";

let openKeyNav;

export const handleToolBar = (openKeyNav_obj) => {
    openKeyNav = openKeyNav_obj;

    function initToolbarLogic(toolBarElement) {
        // Check if we've already initialized this toolbar
        if (toolBarElement.dataset.initialized === "true") return;

        // Mark as initialized
        toolBarElement.dataset.initialized = "true";

        injectToolbarStyleSheet();

        let lastMessage;

        effect(() => {
            const modes = openKeyNav.config.modes;
            const typedLabel = openKeyNav.config.typedLabel.value;
            updateToolbar(toolBarElement, lastMessage);
        });

        effect(() => {
            const backgroundColor = openKeyNav.config.toolBar.backgroundColor.value;
            const contentColor = openKeyNav.config.toolBar.contentColor.value;
            updateToolbarColors({backgroundColor, contentColor});
        });
    }

    let toolBarElements = document.querySelectorAll('.openKeyNav-toolBar');
    toolBarElements.forEach((toolBarElement)=>{
        if (toolBarElement) {
            initToolbarLogic(toolBarElement);
            // return;
        }
    })

    const observer = new MutationObserver((mutationsList, observerInstance) => {
        for (const mutation of mutationsList) {
            for (const node of Array.from(mutation.addedNodes)) {
                if (node.nodeType === 1 && node.matches && node.matches('.openKeyNav-toolBar')) {
                    initToolbarLogic(node);
                    // observerInstance.disconnect();
                    return;
                }
                if (node.nodeType === 1) {
                    const descendants = node.querySelectorAll?.('.openKeyNav-toolBar');
                    descendants.forEach((descendant)=>{
                        if (descendant) {
                            initToolbarLogic(descendant);
                            // observerInstance.disconnect();
                            return;
                        }
                    });
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
};

const toolbarTemplates = {
    default : () => { 

        const toolBarElement = document.querySelector('.openKeyNav-toolBar'); 

        if (!toolBarElement) {
            return;
        }

        toolBarElement.style.minWidth = "150px";
        // toolBarElement.style.maxWidth = "300px"; // let the developer define containers and max width

        let numButtons = 0;

        let clickButton = "";

        let dragButton = "";

        let menuButton = keyButton([openKeyNav.config.keys.menu, modiferKeyString(openKeyNav)], "openKeyNav");
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
        background-color: ${openKeyNav.config.toolBar.backgroundColor.value};
        color: ${openKeyNav.config.toolBar.contentColor.value};
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
        // z-index: 10000;
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

const updateToolbarColors = ({backgroundColor, contentColor}) => {
    const toolbar = document.querySelector('.openKeyNav-toolBar');
    if(!toolbar){
        return false;
    }
    if(backgroundColor){
        toolbar.style.backgroundColor = backgroundColor;
    }
    if(contentColor){
        toolbar.style.color = contentColor;
    }
}