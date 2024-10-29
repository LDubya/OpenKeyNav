import { effect } from './signals.js';
import { keyButton } from './keyButton.js';

export const handleToolBar = (openKeyNav) => {

    const toolBarElement = document.querySelector('.openKeyNav-toolBar'); 

    if (!toolBarElement) {
        return;
    }

    injectToolbarStyleSheet();

    // 5. Handle mode changes 
    let lastMessage;

    effect(() => {
      const modes = openKeyNav.config.modes;
      updateToolbar(toolBarElement, openKeyNav, lastMessage);
    });

    effect(() => {
        const typedLabel = openKeyNav.config.typedLabel.value;
        updateToolbar(toolBarElement, openKeyNav, lastMessage);
    });
    
}

const updateToolbar = (toolBarElement, openKeyNav, lastMessage) => {

    if (!toolBarElement) {
        return;
    }

    let message;
    const typedLabel = openKeyNav.config.typedLabel.value;
    
    if (openKeyNav.config.modes.clicking.value) {
      message = `Click Mode ${ keyButton("Esc")}`;
    } else if (openKeyNav.config.modes.moving.value) {
      message = `Drag Mode ${ keyButton("Esc")}`;
    }
    else{
        //  default message
        // press k for click mode ( Click [ k ] )
        // press m for drag mode ( Drag [ m ] )
      message = ` ${keyButton(openKeyNav.config.keys.click, "Click")} ${keyButton(openKeyNav.config.keys.move, "Drag")} `; // Default message
    }

    // Only emit the notification if the message has changed
    if (message === lastMessage) {
      return;
    }

    // Emit the notification with the current message
    console.log(message);
    // emitNotification(message);
    // Update the toolbar content
    toolBarElement.innerHTML = `<p> ${message} </p>`; 
    lastMessage = message;
}

const injectToolbarStyleSheet = () => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML += `
    .openKeyNav-toolBar {
        width: 200px;
        // background-color: #333;
        color: #333;
        padding: 3px 10px;
        z-index: 10000;
        background-color: hsl(210 10% 95% / 1);
        border: 1px solid hsl(210, 8%, 68%);
        border-radius: 4px;
        font-size:12px;
        display: flex;
        align-items: center;
    }
    .openKeyNav-toolBar p{
        font-size: 16px;
        margin-bottom: 0;
    }
    `;
    document.head.appendChild(style);
}