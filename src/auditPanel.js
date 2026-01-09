/**
 * Creates and manages the accessibility audit panel UI with Figma-style design
 */
export function showAuditPanel(inaccessibleElements) {
  // Remove existing panel if present
  const existingPanel = document.getElementById('okn-audit-panel');
  if (existingPanel) {
    existingPanel.remove();
    // Restore body margin
    document.body.style.marginLeft = '';
    document.body.style.transition = '';
  }

  // Shift page content to the right to make room for sidebar
  const sidebarWidth = '320px';
  document.body.style.transition = 'margin-left 0.3s ease';
  document.body.style.marginLeft = sidebarWidth;

  // Create full-screen overlay
  const overlay = document.createElement('div');
  overlay.id = 'okn-audit-panel';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = sidebarWidth;
  overlay.style.bottom = '0';
  overlay.style.zIndex = '999999';
  overlay.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
  overlay.style.fontSize = '13px';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';

  // Left sidebar - Issue list (now the only element in overlay)
  const leftSidebar = document.createElement('div');
  leftSidebar.style.flex = '1';
  leftSidebar.style.backgroundColor = '#ffffff';
  leftSidebar.style.borderRight = '1px solid #e5e5e5';
  leftSidebar.style.display = 'flex';
  leftSidebar.style.flexDirection = 'column';
  leftSidebar.style.boxShadow = '2px 0 8px rgba(0,0,0,0.08)';
  leftSidebar.style.overflow = 'hidden';

  // Sidebar header
  const sidebarHeader = document.createElement('div');
  sidebarHeader.style.padding = '16px';
  sidebarHeader.style.borderBottom = '1px solid #e5e5e5';
  sidebarHeader.style.backgroundColor = '#f8f9fa';
  
  const headerTitle = document.createElement('div');
  headerTitle.style.fontSize = '12px';
  headerTitle.style.fontWeight = '600';
  headerTitle.style.color = '#6b7280';
  headerTitle.style.textTransform = 'uppercase';
  headerTitle.style.letterSpacing = '0.5px';
  headerTitle.style.marginBottom = '4px';
  headerTitle.textContent = 'Accessibility Audit';
  
  const issueCount = document.createElement('div');
  issueCount.style.fontSize = '18px';
  issueCount.style.fontWeight = '600';
  issueCount.style.color = '#ef4444';
  issueCount.style.marginBottom = '12px';
  issueCount.textContent = `${inaccessibleElements.length} ${inaccessibleElements.length === 1 ? 'Issue' : 'Issues'} Found`;
  
  // Development mode notice
  const devNotice = document.createElement('div');
    // Use existing OpenKeyNav logo markup (from toolbar/toast)
    const logo = document.createElement('div');
    logo.className = 'openkeynav-logo';
    logo.style.marginBottom = '8px';
    // Reuse the exact logo markup used by the toast notification for consistency
    // Use the light variant so it renders correctly on the panel's light header
    logo.innerHTML = '<div class="okn-logo-text tiny light" role="img" aria-label="OpenKeyNav">Open<span class="key">Key</span>Nav</div>';
    sidebarHeader.appendChild(logo);
  devNotice.style.fontSize = '11px';
  devNotice.style.color = '#6b7280';
  devNotice.style.padding = '8px';
  devNotice.style.backgroundColor = '#e0f2fe';
  devNotice.style.borderRadius = '4px';
  devNotice.style.marginTop = '8px';
  devNotice.style.lineHeight = '1.5';
  devNotice.innerHTML = '💡 <strong>Development Mode</strong><br>OpenKeyNav is running in debug mode with keyboard accessibility audit enabled.';
  
  // Close button in header
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '12px';
  closeBtn.style.right = '12px';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = '#6b7280';
  closeBtn.style.fontSize = '18px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.padding = '4px 8px';
  closeBtn.style.borderRadius = '4px';
  closeBtn.style.transition = 'background-color 0.2s';
  closeBtn.setAttribute('aria-label', 'Close audit panel');
  closeBtn.onmouseenter = () => closeBtn.style.backgroundColor = '#e5e7eb';
  closeBtn.onmouseleave = () => closeBtn.style.backgroundColor = 'transparent';
  closeBtn.addEventListener('click', () => {
    overlay.remove();
    // Restore body margin
    document.body.style.marginLeft = '';
    document.body.style.transition = '';
  });
  
  sidebarHeader.style.position = 'relative'; // For absolute positioned close button
  sidebarHeader.appendChild(headerTitle);
  sidebarHeader.appendChild(issueCount);
  sidebarHeader.appendChild(devNotice);
  sidebarHeader.appendChild(closeBtn);
  
  // Info section - collapsible panel about OpenKeyNav
  const infoSection = document.createElement('details');
  infoSection.style.padding = '12px 16px';
  infoSection.style.borderBottom = '1px solid #e5e5e5';
  infoSection.style.backgroundColor = '#fafafa';
  infoSection.style.cursor = 'pointer';
  
  const infoSummary = document.createElement('summary');
  infoSummary.style.fontSize = '12px';
  infoSummary.style.fontWeight = '600';
  infoSummary.style.color = '#374151';
  infoSummary.style.marginBottom = '8px';
  infoSummary.style.outline = 'none';
  infoSummary.textContent = 'ℹ️ About OpenKeyNav';
  
  const infoContent = document.createElement('div');
  infoContent.style.fontSize = '11px';
  infoContent.style.color = '#6b7280';
  infoContent.style.lineHeight = '1.6';
  infoContent.style.marginTop = '8px';
  infoContent.innerHTML = `
    <p style="margin: 0 0 8px 0;"><strong>OpenKeyNav</strong> adds keyboard shortcuts to navigate web pages efficiently.</p>
    <p style="margin: 0 0 8px 0;"><strong>Common shortcuts:</strong></p>
    <ul style="margin: 0; padding-left: 16px;">
      <li><kbd style="background: #fff; padding: 2px 4px; border-radius: 2px; font-family: monospace;">Shift+O</kbd> Enable/disable</li>
      <li><kbd style="background: #fff; padding: 2px 4px; border-radius: 2px; font-family: monospace;">K</kbd> Click mode</li>
      <li><kbd style="background: #fff; padding: 2px 4px; border-radius: 2px; font-family: monospace;">H</kbd> Heading navigation</li>
      <li><kbd style="background: #fff; padding: 2px 4px; border-radius: 2px; font-family: monospace;">Q</kbd> Escape</li>
    </ul>
    <p style="margin: 8px 0 0 0;"><a href="https://github.com/LDubya/OpenKeyNav" target="_blank" style="color: #3b82f6; text-decoration: none;">Learn more →</a></p>
  `;
  
  infoSection.appendChild(infoSummary);
  infoSection.appendChild(infoContent);

  // Sidebar content - issues list
  const issuesLabel = document.createElement('div');
  issuesLabel.style.padding = '12px 16px 8px';
  issuesLabel.style.fontSize = '11px';
  issuesLabel.style.fontWeight = '600';
  issuesLabel.style.color = '#9ca3af';
  issuesLabel.style.textTransform = 'uppercase';
  issuesLabel.style.letterSpacing = '0.5px';
  issuesLabel.textContent = 'Issues';
  
  const sidebarContent = document.createElement('div');
  sidebarContent.style.flex = '1';
  sidebarContent.style.overflowY = 'auto';
  sidebarContent.style.padding = '8px';

  // List items with Figma-style design
  let selectedItem = null;
  inaccessibleElements.forEach((el, index) => {
    const item = document.createElement('div');
    item.style.padding = '12px';
    item.style.marginBottom = '2px';
    item.style.backgroundColor = '#ffffff';
    item.style.border = '1px solid transparent';
    item.style.borderRadius = '6px';
    item.style.cursor = 'pointer';
    item.style.transition = 'all 0.15s ease';
    
    const tagInfo = `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className ? `.${el.className.split(' ')[0]}` : ''}`;
    
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.marginBottom = '6px';
    header.style.gap = '8px';
    
    const errorIcon = document.createElement('div');
    errorIcon.style.width = '20px';
    errorIcon.style.height = '20px';
    errorIcon.style.borderRadius = '4px';
    errorIcon.style.backgroundColor = '#fef2f2';
    errorIcon.style.border = '1px solid #fecaca';
    errorIcon.style.display = 'flex';
    errorIcon.style.alignItems = 'center';
    errorIcon.style.justifyContent = 'center';
    errorIcon.style.fontSize = '12px';
    errorIcon.textContent = '⚠️';
    
    const tagEl = document.createElement('code');
    tagEl.style.fontFamily = 'SF Mono, Monaco, monospace';
    tagEl.style.fontSize = '12px';
    tagEl.style.fontWeight = '500';
    tagEl.style.color = '#374151';
    tagEl.textContent = tagInfo;
    
    header.appendChild(errorIcon);
    header.appendChild(tagEl);
    
    const description = document.createElement('div');
    description.style.fontSize = '12px';
    description.style.color = '#6b7280';
    description.style.marginLeft = '28px';
    description.textContent = 'Not keyboard accessible';
    
    item.appendChild(header);
    item.appendChild(description);
    
    // Hover effect
    item.onmouseenter = () => {
      if (item !== selectedItem) {
        item.style.backgroundColor = '#f9fafb';
        item.style.borderColor = '#e5e7eb';
      }
    };
    item.onmouseleave = () => {
      if (item !== selectedItem) {
        item.style.backgroundColor = '#ffffff';
        item.style.borderColor = 'transparent';
      }
    };
    
    // Click to highlight element
    item.addEventListener('click', () => {
      // Update selection state
      if (selectedItem) {
        selectedItem.style.backgroundColor = '#ffffff';
        selectedItem.style.borderColor = 'transparent';
      }
      selectedItem = item;
      item.style.backgroundColor = '#eff6ff';
      item.style.borderColor = '#3b82f6';
      
      // Scroll to element
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight element
      const originalOutline = el.style.outline;
      const originalOutlineOffset = el.style.outlineOffset;
      el.style.outline = '3px solid #3b82f6';
      el.style.outlineOffset = '4px';
      setTimeout(() => {
        el.style.outline = originalOutline;
        el.style.outlineOffset = originalOutlineOffset;
      }, 2500);
    });
    
    sidebarContent.appendChild(item);
  });

  // Assemble the UI
  leftSidebar.appendChild(sidebarHeader);
  leftSidebar.appendChild(infoSection);
  leftSidebar.appendChild(issuesLabel);
  leftSidebar.appendChild(sidebarContent);
  
  overlay.appendChild(leftSidebar);
  
  document.body.appendChild(overlay);
}

// Hide and remove the audit panel if present
export function hideAuditPanel() {
  const panel = document.getElementById('okn-audit-panel');
  if (panel) {
    panel.remove();
    // Restore body margin
    document.body.style.marginLeft = '';
    document.body.style.transition = '';
  }
}
