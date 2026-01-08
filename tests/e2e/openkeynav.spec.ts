import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const artifactsDir = path.join(__dirname, '../../artifacts');

test.beforeAll(() => {
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
});

test.describe('OpenKeyNav E2E', () => {
  test('initial state and enable', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    
    // Wait for OpenKeyNav to initialize
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Initial screenshot
    await page.screenshot({ path: path.join(artifactsDir, '01-initial.png'), fullPage: true });
    
    // Enable OpenKeyNav (Shift+o)
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: path.join(artifactsDir, '02-enabled.png'), fullPage: true });
  });

  test('click mode shows overlays', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Enable OpenKeyNav
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(300);
    
    // Enter click mode (k)
    await page.keyboard.press('KeyK');
    await page.waitForTimeout(500);
    
    // Should see overlays
    const overlays = await page.locator('.openKeyNav-label').count();
    expect(overlays).toBeGreaterThan(0);
    
    await page.screenshot({ path: path.join(artifactsDir, '03-click-mode.png'), fullPage: true });
    
    // Press Escape to exit
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    const overlaysAfter = await page.locator('.openKeyNav-label').count();
    expect(overlaysAfter).toBe(0);
    
    await page.screenshot({ path: path.join(artifactsDir, '04-after-escape.png'), fullPage: true });
  });

  test('toolbar appears when enabled', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Enable OpenKeyNav
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(500);
    
    const toolbar = await page.locator('.openKeyNav-toolBar');
    await expect(toolbar).toBeVisible();
    
    await page.screenshot({ path: path.join(artifactsDir, '05-toolbar.png'), fullPage: true });
  });

  test('heading navigation', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(300);
    
    // Press h to focus first heading
    await page.keyboard.press('KeyH');
    await page.waitForTimeout(300);
    
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['H1', 'H2', 'H3', 'H4']).toContain(focused);
    
    await page.screenshot({ path: path.join(artifactsDir, '06-heading-focus.png'), fullPage: true });
  });

  test('debug mode in click mode shows inaccessible elements with red labels', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Enable OpenKeyNav
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(300);
    
    // Enter click mode (k) - in debug mode this shows all elements
    await page.keyboard.press('KeyK');
    await page.waitForTimeout(1000);
    
    // Check that overlays exist
    const overlays = await page.locator('.openKeyNav-label').count();
    expect(overlays).toBeGreaterThan(0);
    
    await page.screenshot({ path: path.join(artifactsDir, '07-debug-mode.png'), fullPage: true });
    
    // Check for red (inaccessible) overlays
    const inaccessibleOverlays = await page.locator('.openKeyNav-label.debug-inaccessible').count();
    expect(inaccessibleOverlays).toBeGreaterThan(0);
    
    // Check toolbar shows debug info
    const toolbar = await page.locator('.openKeyNav-toolBar').textContent();
    expect(toolbar).toContain('Click Mode');
    expect(toolbar).toMatch(/Debug: \d+ inaccessible/);
    
    await page.screenshot({ path: path.join(artifactsDir, '08-debug-toolbar.png'), fullPage: true });
    
    // Press Escape to exit
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    const overlaysAfter = await page.locator('.openKeyNav-label').count();
    expect(overlaysAfter).toBe(0);
  });

  test('debug mode shows persistent red outlines and audit panel on page load', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Enable OpenKeyNav (this triggers the audit in debug mode)
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(500); // Wait for audit to complete
    
    await page.screenshot({ path: path.join(artifactsDir, '09-audit-initial.png'), fullPage: true });
    
    // Check for audit panel
    const panel = await page.locator('#okn-audit-panel');
    await expect(panel).toBeVisible();
    
    const headerText = await panel.locator('div').first().textContent();
    expect(headerText).toContain('Accessibility Issues');
    expect(headerText).toMatch(/\(\d+\)/); // Should show count in parentheses
    
    // Check for close button in panel
    const closeButton = await panel.locator('button[aria-label="Close audit panel"]');
    await expect(closeButton).toBeVisible();
    
    await page.screenshot({ path: path.join(artifactsDir, '10-audit-panel.png'), fullPage: true });
    
    // Check that inaccessible elements have red outlines (not in click mode)
    const inaccessibleElements = await page.locator('.openKeyNav-inaccessible').count();
    expect(inaccessibleElements).toBeGreaterThan(0);
    
    // Verify elements have red styling (check computed styles)
    const firstInaccessible = page.locator('.openKeyNav-inaccessible').first();
    const boxShadow = await firstInaccessible.evaluate(el => window.getComputedStyle(el).boxShadow);
    expect(boxShadow).toContain('rgb(255, 0, 0)'); // Red color in box-shadow
    
    await page.screenshot({ path: path.join(artifactsDir, '11-audit-red-outlines.png'), fullPage: true });
    
    // Now enter click mode - should still work normally (already enabled from line 134)
    await page.keyboard.press('KeyK');
    await page.waitForTimeout(500);
    
    // Should see overlays
    const overlays = await page.locator('.openKeyNav-label').count();
    expect(overlays).toBeGreaterThan(0);
    
    await page.screenshot({ path: path.join(artifactsDir, '12-audit-click-mode.png'), fullPage: true });
    
    // Press Escape to exit
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('production mode - no audit panel or red outlines on enable', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/productiondemo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Enable OpenKeyNav
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(500);
    
    // Audit panel should NOT appear
    const panel = page.locator('#okn-audit-panel');
    await expect(panel).not.toBeVisible();
    
    // Red outlines should NOT appear
    const inaccessibleElements = await page.locator('.openKeyNav-inaccessible').count();
    expect(inaccessibleElements).toBe(0);
    
    await page.screenshot({ path: path.join(artifactsDir, '13-production-no-audit.png'), fullPage: true });
  });

  test('production mode - click mode shows only accessible elements', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/productiondemo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Enable and enter click mode
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(300);
    await page.keyboard.press('KeyK');
    await page.waitForTimeout(500);
    
    // Should see overlays (accessible elements only)
    const overlays = await page.locator('.openKeyNav-label').count();
    expect(overlays).toBeGreaterThan(0);
    
    // Should NOT see red debug overlays
    const redOverlays = await page.locator('.openKeyNav-label.debug-inaccessible').count();
    expect(redOverlays).toBe(0);
    
    // Toolbar should NOT show debug count
    const toolbar = await page.locator('.openKeyNav-toolBar').textContent();
    expect(toolbar).not.toMatch(/Debug: \d+ inaccessible/);
    
    await page.screenshot({ path: path.join(artifactsDir, '14-production-click-mode.png'), fullPage: true });
    
    await page.keyboard.press('Escape');
  });

  test('production mode - inaccessible elements are not flagged', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/productiondemo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Enable OpenKeyNav
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(500);
    
    // Check that known inaccessible elements (bad-link, bad-button) are NOT flagged
    const badLink = page.locator('#bad-link');
    const hasInaccessibleClass = await badLink.evaluate(el => 
      el.classList.contains('openKeyNav-inaccessible')
    );
    expect(hasInaccessibleClass).toBe(false);
    
    const hasInaccessibleAttr = await badLink.evaluate(el => 
      el.hasAttribute('data-openkeynav-inaccessible-reason')
    );
    expect(hasInaccessibleAttr).toBe(false);
    
    await page.screenshot({ path: path.join(artifactsDir, '15-production-no-flagging.png'), fullPage: true });
  });
});