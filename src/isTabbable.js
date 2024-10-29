const isTypicallyClickableElement = (el) => {

    // Check if the element is a known clickable element
    if (el.matches(clickableElements.join())) {
        return true;
    }

    // Check if the element has an interactive ARIA role
    const role = el.getAttribute('role');
    if (role && interactiveRoles.includes(role)) {
        return true;
    }

    return false;
}

const isHiddenByOverflow = (element) => {
    let parent = element.parentNode;
    // Use the ownerDocument to get the correct document context
    const doc = element.ownerDocument;
    const body = doc.body;

    while (parent && parent !== body) {
        // Use the specific document body of the element
        // if (parent instanceof HTMLElement) {
        const parentStyle = getComputedStyle(parent);
        if (
            ['scroll', 'auto'].includes(parentStyle.overflow) || ['scroll', 'auto'].includes(parentStyle.overflowX) || ['scroll', 'auto'].includes(parentStyle.overflowY)
        ) {
            const parentRect = parent.getBoundingClientRect();
            const rect = element.getBoundingClientRect();
            if (
                rect.bottom < parentRect.top ||
                rect.top > parentRect.bottom ||
                rect.right < parentRect.left ||
                rect.left > parentRect.right
            ) {
                return true; // Element is hidden by parent's overflow
            }
        }
        // }
        parent = parent.parentNode;
    }
    return false; // No parent hides the element by overflow
};

const inViewport = (el) => {
    // check if the element's top left corner is within the window's viewport
    const rect = el.getBoundingClientRect();
    const isInViewport =
        rect.top < window.innerHeight && rect.left < window.innerWidth && rect.bottom > 0 && rect.right > 0;
    return isInViewport;
};

export const isTabbable = (el, openKeyNav) => {
  
    const clickableElements = ['a', 'button', 'textarea', 'select', 'input', 'iframe', 'summary', '[onclick]'];
    const interactiveRoles = ['button', 'link', 'menuitem', 'option', 'tab', 'treeitem', 'checkbox', 'radio'];

    // Ensure el is an Element before accessing styles
    if (!(el instanceof Element)) {
      // console.log(`!(el instanceof Element)`, el); //debug
      return false;
    }

    // Skip if the element is set to not display (not the same as having zero size)
    const style = getComputedStyle(el);
    if (style.display === 'none') {
      // console.log(`style.display === 'none'`, el); //debug
      return false;
    }

    // Skip if the element is hidden by a parent's overflow
    if (isHiddenByOverflow(el)) {
      // console.log(`isHiddenByOverflow(el)`, el); //debug
      return false;
    }

    // Skip if the element is within a <details> that is not open, but allow if it's a <summary> or a clickable element inside a <summary>
    // aka it's hidden by the collapsed detail
    if (el.matches('details:not([open]) *') && !el.matches('details:not([open]) > summary, details:not([open]) > summary *')) {
        // console.log(`hidden details element`, el); //debug
        return false;
    }

    // always include if tabindex > -1
    // include this after checking if the element is hidden by a parent's overflow, which most screen readers respect
    // (elements should not be tabbable by keyboard if they are visibly hidden,
    // so include visibly hidden items that are explicitly tabbable to help with accessibility bug discovery)
    // do not move this earlier in the heuristic
    const tabIndex = el.getAttribute('tabindex');
    if (tabIndex && parseInt(tabIndex, 10) > -1) {
      // console.log(`tabindex > -1`, el); //debug
      return true;
    }

    // Skip if the element is visually hidden (not the same as having zero size or set to not display)
    if (style.visibility === 'hidden') {
      // console.log(`style.visibility === 'hidden'`, el); //debug
      return false;
    }

    // Skip if the element has no size (another way to visually hide something)
    if (!openKeyNav.isNonzeroSize(el)) {
      // console.log(`!openKeyNav.isNonzeroSize(el)`, el); //debug
      return false;
    }

    // Skip if the element's top left corner is not within the window's viewport
    if (!inViewport(el)) {
      // console.log(`!inViewport(el)`, el); //debug
      return false;
    }

    // do isAnyCornerVisible check by default and disable the check if debug.screenReaderVisible is true
    if (!openKeyNav.config.debug.screenReaderVisible) {
      // Skip if the element's top left corner is covered by another element
      if (!openKeyNav.isAnyCornerVisible(el)) {
        // console.log(`!openKeyNav.isAnyCornerVisible(el)`, el); //debug
        return false;
      }
    }

    // Skip if <summary> is not the first <summary> element of a <details>
    if (el.tagName.toLowerCase() === 'summary') {
      const details = el.parentElement;
      if (details.tagName.toLowerCase() === 'details' && details.querySelector('summary') !== el) {
        // console.log(`<summary> is not the first <summary> element of a <details>`, el); //debug
        return false;
      }
    }

    // lastly, elements that are inaccessible due to not being tabbable


    if (tabIndex && parseInt(tabIndex, 10) == -1) {

      if (isTypicallyClickableElement(el)) {
        // if (openKeyNav.config.modes.clicking.value) {
          openKeyNav.flagAsInaccessible(
            el,
            `
            <h2>Inaccessible Element</h2>
            <h3>Problem: </h3>
            <p>This element is not keyboard-focusable.</p>
            <h3>Solution: </h3>
            <p>Since this element has a tabindex attribute set to -1, it cannot be keyboard focusable.</p>
            <p>It must have a tabindex set to a value &gt; -1, ideally 0.</p>
            <p>You can ignore this warning if this element is not meant to be clickable.</p>
            `,
            "keyboard"
          );
        // }
      }

      // return false; // let's keep it, since we are flagging it
    }

    // Skip if the element is an <a> without an href (unless it has an ARIA role that makes it tabbable)

    const role = el.getAttribute('role');

    switch (el.tagName.toLowerCase()) {
      case 'a':
        // console.log(el); //debug
        if (!el.hasAttribute('href') || el.getAttribute('href') === ''){
          if (!interactiveRoles.includes(role)) {
            // if (openKeyNav.config.modes.clicking.value) {
              openKeyNav.flagAsInaccessible(
                el,
                `
                <h2>Inaccessible Button</h2>
                <h3>Problem: </h3>
                <p>This clickable button is not keyboard-focusable.</p>
                <p>As a result, only mouse users can click on it.</p>
                <p>This usability disparity can create an accessibility barrier.</p>
                <h3>Solution: </h3>
                <p>Since it is an anchor tag (&lt;a&gt;), it needs a non-empty <em>href</em> attribute.</p>
                <p>Alternatively, it needs an ARIA <em>role</em> attribute set to something like 'button' or 'link' AND a tabindex attribute set to a value &gt; -1, ideally 0.</p>
                `,
                "keyboard"
              );
              // return false;
            // }
          }
        }
        break;

      case 'button':
      case 'textarea':
      case 'select':
      case 'input':
      case 'iframe':
      case 'summary':
        break;

      default:
        if (!interactiveRoles.includes(role)) {
          // possible inaccessible button
          // if (openKeyNav.config.modes.clicking.value) {

          let fromClickEvents = "";
          if (openKeyNav.config.modesConfig.click.clickEventElements.has(el)) {
            fromClickEvents = "fromClickEvents";
          }
          openKeyNav.flagAsInaccessible(
            el,
            `
            <!--
              !el(a,button,textarea,select,input,iframe,summary)
              !el[role('button', 'link', 'menuitem', 'option', 'tab', 'treeitem', 'checkbox', 'radio')]
              fromClickEvents
            -->
            <h2>Possibly Inaccessible Clickable Element</h2>
            <h3>Problem: </h3>
            <p>This element has a mouse click event handler attached to it, but it is not keyboard-focusable.</p>
            <p>As a result, only mouse users can click on it.</p>
            <p>This usability disparity can create an accessibility barrier.</p>
            <h3>Solution Options: </h3>
            <ol>
              <li>
                <p>If clicking this element takes the user to a different location, convert this element to an anchor link (&lt;a&gt;) with a non-empty <em>href</em> attribute.</p>
              </li>
              <li>
                <p>Otherwise if clicking this element triggers an action on the page, convert this element to a &lt;button&gt; without a <em>disabled</em> attribute.</p>
                <p>Alternatively, it needs an ARIA <em>role</em> attribute set to something like 'button' or 'link' AND a tabindex attribute set to a value &gt; -1, ideally 0.</p>
              </li>
              <li>
                <p>Otherwise, if clicking this element does not do anything, then consider removing the click event handler attached to this element.</p>
              </li>
            </ol>
            `,
            "keyboard"
          );
          // return false;
        // }
        }
        break;
    }

    // it must be a valid tabbable element
    return true;
}