import { endDrag } from "./dragAndDrop";

export const handleEscape = (openKeyNav, e) => {

    let returnFalse = false;
    if (
        openKeyNav.config.modes.clicking.value 
        || openKeyNav.config.modes.moving.value
        || openKeyNav.config.modes.menu.value
      ) {
      e.preventDefault();
      e.stopPropagation();
      endDrag(openKeyNav);
      openKeyNav.removeOverlays();
      openKeyNav.clearMoveAttributes();
      returnFalse = true;
    }
    if (openKeyNav.isTextInputActive()) {
      document.activeElement.blur(); // Removes focus from the active text input
    }
    if (returnFalse) {
      return false;
    } else {
      if (document.activeElement != document.body) {
        document.activeElement.blur();
      }
    }
};