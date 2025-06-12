export const handleTargetClickInteraction = (openKeyNav, target, e) => {
    let doc = target.ownerDocument;
    let win = doc.defaultView || doc.parentWindow;

    let target_tagName = target.tagName.toLowerCase();
    if (
      target_tagName === 'input' ||
      target_tagName === 'textarea' ||
      target.contentEditable === 'true' ||
      target.contentEditable === 'plaintext-only' ||
      (target.hasAttribute('tabindex') && target.tabIndex > -1)
    ) {
      target.focus();
      placeCursorAndScrollToCursor(target);
    } else {
      if (e.shiftKey && target.tagName.toLowerCase() === 'a' && target.href) {
        win.open(target.href, '_blank');
      } else {
        target.focus(); // Ensure the target element is focused before dispatching the click event
        if(!openKeyNav.config.modesConfig.click.modifier){
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: win
          });
          target.dispatchEvent(clickEvent);
        }
      }
    }
    openKeyNav.removeOverlays();
    openKeyNav.clearMoveAttributes();
};

export const placeCursorAndScrollToCursor = (target) => {
    const targetTagName = target.tagName.toLowerCase();

    setTimeout(() => {
      target.focus();

      if ( 
        (targetTagName === 'input' && ['text', 'search', 'url', 'tel', 'email', 'password'].indexOf(target.type) > -1)
        || 
        targetTagName === 'textarea'
      ) {
        // Move the cursor to the end for input and textarea elements
        const valueLength = target.value.length;
        target.selectionStart = valueLength;
        target.selectionEnd = valueLength;
        // Scroll the element itself into view if it's not fully visible
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      } else if (target.contentEditable === 'true' || target.contentEditable === 'plaintext-only') {
        // Move the caret to the end for contenteditable elements
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(target);
        range.collapse(false); // false to move to the end
        sel.removeAllRanges();
        sel.addRange(range);
        // Attempt to ensure the caret is visible, considering the element might be larger than the viewport
        const rect = range.getBoundingClientRect();
        if (rect.bottom > window.innerHeight || rect.top < 0) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }

      // For elements with tabIndex > -1, focusing them should scroll them into view,
      // but additional logic might be needed based on specific requirements.
    }, 0);
};