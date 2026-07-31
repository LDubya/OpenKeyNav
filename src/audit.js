import { isTabbable } from './isTabbable.js';
import { showAuditPanel } from './auditPanel.js';

/**
 * Runs a focused keyboard review on the page.
 * Uses heuristics to find likely pointer actions without a conventional focus stop.
 * @param {Object} openKeyNav - The OpenKeyNav instance
 */
export function runAccessibilityAudit(openKeyNav) {
  // Only run in debug mode
  if (!openKeyNav.config.debug.keyboardAccessible) {
    return;
  }
  // To make audit results consistent regardless of the user's current scroll
  // position, temporarily scroll to the top of the document, run the audit,
  // then restore the original scroll position. This helps avoid cases where
  // scrolling has revealed or hidden elements inside overflow containers and
  // leads to non-deterministic counts.
  const prevScrollX = typeof window !== 'undefined' ? window.scrollX : 0;
  const prevScrollY = typeof window !== 'undefined' ? window.scrollY : 0;

  try {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  } catch (e) {
    // ignore
  }

  // Defer the audit slightly to allow layout to stabilize after scrolling.
  setTimeout(() => {
    // Query all potentially interactive elements (same logic as click mode)
    const elements = document.querySelectorAll(
      'a, button, input, select, textarea, [role="button"], [role="link"], [tabindex], [onclick]'
    );

    const inaccessibleElements = [];

    // Temporarily allow isTabbable to include offscreen elements so the audit
    // can report issues throughout the document, not just those visible in the
    // current viewport. Also temporarily set screenReaderVisible so that
    // isAnyCornerVisible checks are bypassed during audit. Preserve previous
    // values and restore afterwards.
    const prevAuditFlag = !!openKeyNav._auditIncludeOffscreen;
    const prevScreenReaderVisible = !!openKeyNav.config.debug.screenReaderVisible;
    openKeyNav._auditIncludeOffscreen = true;
    openKeyNav.config.debug.screenReaderVisible = true;
    try {
      elements.forEach((el) => {
        // Call isTabbable, which records focused-review candidates as a side effect.
        isTabbable(el, openKeyNav);

        // After calling isTabbable, check if it was flagged as inaccessible
        if (el.hasAttribute('data-openkeynav-inaccessible-reason')) {
          inaccessibleElements.push(el);
        }
      });
    } catch (error) {
      console.error('[OpenKeyNav Keyboard Review] Error during element check:', error);
    } finally {
      openKeyNav._auditIncludeOffscreen = prevAuditFlag;
      openKeyNav.config.debug.screenReaderVisible = prevScreenReaderVisible;
    }

    // Update the count
    openKeyNav.config.debug.inaccessibleCount.value = inaccessibleElements.length;

    // Log to console
    if (inaccessibleElements.length > 0) {
      console.warn(
        `[OpenKeyNav Keyboard Review] Found ${inaccessibleElements.length} likely pointer actions without a conventional keyboard focus stop:`,
        inaccessibleElements
      );
    } else {
      console.log('[OpenKeyNav Keyboard Review] No likely pointer actions without a conventional keyboard focus stop were detected. Continue manual workflow testing.');
    }
    
    // Show audit panel if issues found
    if (inaccessibleElements.length > 0) {
      showAuditPanel(inaccessibleElements);
    }

    // Restore previous scroll
    try {
      if (typeof window !== 'undefined') {
        window.scrollTo(prevScrollX, prevScrollY);
      }
    } catch (e) {
      // ignore
    }
  }, 50);
}
