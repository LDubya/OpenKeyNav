import { isTabbable } from './isTabbable.js';
import { showAuditPanel } from './auditPanel.js';

/**
 * Runs accessibility audit on the page
 * Checks all interactive elements for keyboard accessibility
 * @param {Object} openKeyNav - The OpenKeyNav instance
 */
export function runAccessibilityAudit(openKeyNav) {
  // Only run in debug mode
  if (!openKeyNav.config.debug.keyboardAccessible) {
    return;
  }

  // Query all potentially interactive elements (same logic as click mode)
  const elements = document.querySelectorAll(
    'a, button, input, select, textarea, [role="button"], [role="link"], [tabindex], [onclick]'
  );

  const inaccessibleElements = [];

  // Check each element for keyboard accessibility
  try {
    elements.forEach((el) => {
      // Call isTabbable which will flag inaccessible elements as a side effect
      isTabbable(el, openKeyNav);
      
      // After calling isTabbable, check if it was flagged as inaccessible
      if (el.hasAttribute('data-openkeynav-inaccessible-reason')) {
        inaccessibleElements.push(el);
      }
    });
  } catch (error) {
    console.error('[OpenKeyNav Audit] Error during element check:', error);
  }

  // Update the count
  openKeyNav.config.debug.inaccessibleCount.value = inaccessibleElements.length;

  // Log to console
  if (inaccessibleElements.length > 0) {
    console.warn(
      `[OpenKeyNav Audit] Found ${inaccessibleElements.length} inaccessible interactive elements:`,
      inaccessibleElements
    );
  } else {
    console.log('[OpenKeyNav Audit] All interactive elements are keyboard accessible!');
  }
  
  // Show audit panel if issues found
  if (inaccessibleElements.length > 0) {
    showAuditPanel(inaccessibleElements);
  }
}
