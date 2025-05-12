export const keyButton = (keyCodes, text, reverseOrder) => {
    // let styledKeyCode = `<span class="keyButton">${keyCode}</span>`;
    let styledKeyCodes = keyCodes.map((keyCode)=>{
            return `<span class="keyButton">${keyCode}</span>`
        }).join("")
    if(!text){
        return `${styledKeyCodes}`;
    }

    if(reverseOrder){
        return `
            <span class="keyButtonContainer"> 
                <span>
                    ${styledKeyCodes}
                </span>
                <span class="keyButtonLabel">${text}</span> 
            </span>
        `;
    }

    return `
        <span class="keyButtonContainer"> 
            <span class="keyButtonLabel">${text}</span> 
            <span>
                ${styledKeyCodes}
            </span>
        </span>
    `;
}