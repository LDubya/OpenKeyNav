export const keyButton = (keyCode, text, reverseOrder) => {
    let styledKeyCode = `<span class="keyButton">${keyCode}</span>`
    if(!text){
        return `${styledKeyCode}`;
    }

    if(reverseOrder){
    return `
        <span class="keyButtonContainer"> 
            ${styledKeyCode}
            <span class="keyButtonLabel">${text}</span> 
        </span>
    `;
    }

    return `
        <span class="keyButtonContainer"> 
            <span class="keyButtonLabel">${text}</span> 
            ${styledKeyCode}
        </span>
    `;
}