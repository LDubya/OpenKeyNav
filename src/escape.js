import { cancelDrag } from "./dragAndDrop";

export const handleEscape = (openKeyNav, e) => {

    let returnFalse = false;
    if (
        openKeyNav.config.modes.clicking.value 
        || openKeyNav.config.modes.moving.value
        || openKeyNav.config.modes.menu.value
      ) {
      e.preventDefault();
      e.stopPropagation();
      if (
        openKeyNav.config.modes.moving.value &&
        openKeyNav.config.modesConfig.move.selectedMoveable
      ) {
        const selectedConfig =
          openKeyNav.config.modesConfig.move.config[
            openKeyNav.config.modesConfig.move.selectedConfig
          ];

        // Callback-driven moves never start a synthetic drag, so cancellation
        // should not manufacture a dragend event for the host library either.
        if (typeof selectedConfig?.callback !== 'function') {
          cancelDrag(openKeyNav);
        }
      }
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
