/**
 * Creates and manages the accessibility audit panel UI
 */
export function showAuditPanel(inaccessibleElements) {
  // Remove existing panel if present
  const existingPanel = document.getElementById('okn-audit-panel');
  if (existingPanel) {
    existingPanel.remove();
  }

  // Create audit panel
  const panel = document.createElement('div');
  panel.id = 'okn-audit-panel';
  panel.style.position = 'fixed';
  panel.style.top = '20px';
  panel.style.right = '20px';
  panel.style.width = '350px';
  panel.style.maxHeight = '80vh';
  panel.style.backgroundColor = '#fff';
  panel.style.border = '2px solid #f00';
  panel.style.borderRadius = '8px';
  panel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  panel.style.zIndex = '10000';
  panel.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  panel.style.fontSize = '14px';
  panel.style.overflow = 'hidden';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';

  // Header
  const header = document.createElement('div');
  header.style.padding = '12px 16px';
  header.style.backgroundColor = '#f00';
  header.style.color = '#fff';
  header.style.fontWeight = 'bold';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.innerHTML = `<span>⚠️ Accessibility Issues (${inaccessibleElements.length})</span>`;

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = '#fff';
  closeBtn.style.fontSize = '24px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.padding = '0';
  closeBtn.style.marginLeft = '10px';
  closeBtn.setAttribute('aria-label', 'Close audit panel');
  closeBtn.addEventListener('click', () => panel.remove());
  header.appendChild(closeBtn);

  // Content area
  const content = document.createElement('div');
  content.style.padding = '16px';
  content.style.overflowY = 'auto';
  content.style.maxHeight = 'calc(80vh - 60px)';

  // List items
  inaccessibleElements.forEach((el, index) => {
    const item = document.createElement('div');
    item.style.padding = '8px';
    item.style.marginBottom = '8px';
    item.style.backgroundColor = '#fff0f0';
    item.style.border = '1px solid #fcc';
    item.style.borderRadius = '4px';
    item.style.cursor = 'pointer';
    
    const tagInfo = `<strong>${el.tagName.toLowerCase()}</strong>${el.id ? ` #${el.id}` : ''}${el.className ? ` .${el.className.split(' ')[0]}` : ''}`;
    
    item.innerHTML = `
      <div style="margin-bottom: 4px;">${index + 1}. ${tagInfo}</div>
      <div style="font-size: 12px; color: #666;">Click to scroll to element</div>
    `;
    
    // Click to scroll to element
    item.addEventListener('click', () => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight briefly
      const originalOutline = el.style.outline;
      el.style.outline = '4px solid #f00';
      el.style.outlineOffset = '4px';
      setTimeout(() => {
        el.style.outline = originalOutline;
        el.style.outlineOffset = '';
      }, 2000);
    });
    
    content.appendChild(item);
  });

  panel.appendChild(header);
  panel.appendChild(content);
  document.body.appendChild(panel);
}
