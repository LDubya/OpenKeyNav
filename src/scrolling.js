export const disableScrolling = (openKeyNav) => {
    // Prevent scrolling on the webpage

    const disableScrollingForEl = el => {
      el.addEventListener('scroll', openKeyNav.preventScroll, {
        passive: false
      });
      el.addEventListener('wheel', openKeyNav.preventScroll, {
        passive: false
      });
      el.addEventListener('touchmove', openKeyNav.preventScroll, {
        passive: false
      });
    };

    const disableScrollingForScrollableElements = () => {
      disableScrollingForEl(window);
      openKeyNav.getScrollableElements().forEach(el => {
        disableScrollingForEl(el);
      });
    };

    disableScrollingForScrollableElements();
}; 