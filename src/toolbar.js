// unified status bar and toolbar

import { effect } from './signals.js';
import { keyButton } from './keyButton.js';
import { modiferKeyString } from "./keypress.js";
import { injectToolbarStyleSheet } from './styles.js';

let openKeyNav;

export const handleToolBar = (openKeyNav_obj) => {
    openKeyNav = openKeyNav_obj;

    function initToolbarLogic(toolBarElement) {
        // Check if we've already initialized this toolbar
        if (toolBarElement.dataset.initialized === "true") return;

        // Mark as initialized
        toolBarElement.dataset.initialized = "true";

        injectToolbarStyleSheet(openKeyNav);

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

        let menuButton = keyButton(
            [
                modiferKeyString(openKeyNav),
                openKeyNav.config.keys.menu
            ], "openKeyNav");
        if(openKeyNav.meta.enabled.value){
            menuButton = keyButton(
                [
                    openKeyNav.config.keys.menu
                ], "Shortcuts");
        }

        return `<p>
                    ${menuButton}
                    ${dragButton}
                    ${clickButton} 
                </p>
            `;
    },

    clickMode : () => {
        return `<p>${ keyButton(["Esc"], "Click Mode")}</p>`
    },

    dragMode : () => { 
        return `<p>${ keyButton(["Esc"], "Drag Mode")}</p>`
    },

    menu : () => {
        let dragButton = "";
        if(openKeyNav.config.modesConfig.move.config.length){ // if drag mode is configured
            dragButton = keyButton([openKeyNav.config.keys.move], "Drag")
        }
        return `
            <p>${ keyButton(["Esc"], "Shortcuts")}</p>
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