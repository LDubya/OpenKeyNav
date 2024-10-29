export const keyButton = (keyCode, text) => {
    let styledKeyCode = `<span class="keyButton">${keyCode}</span>`
    if(!text){
        return `${styledKeyCode}`;
    }
    return `${text} ${styledKeyCode}`;
}