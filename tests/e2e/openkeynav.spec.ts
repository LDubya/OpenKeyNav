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

  test('debug mode shows inaccessible elements with red labels', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Enable OpenKeyNav
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(300);
    
    // Enter click mode to trigger accessibility checks
    await page.keyboard.press('KeyK');
    await page.waitForTimeout(500);
    
    // Check for inaccessible elements
    const inaccessibleElements = await page.locator('.openKeyNav-inaccessible').count();
    expect(inaccessibleElements).toBeGreaterThan(0);
    
    // Verify the bad link has inaccessible styling
    const badLink = page.locator('#bad-link');
    await expect(badLink).toHaveClass(/openKeyNav-inaccessible/);
    
    // Verify tooltip exists
    const tooltips = await page.locator('.openKeyNav-mouseover-tooltip').count();
    expect(tooltips).toBeGreaterThan(0);
    
    await page.screenshot({ path: path.join(artifactsDir, '07-debug-inaccessible.png'), fullPage: true });
    
    // Hover over inaccessible element to show tooltip
    await badLink.hover();
    await page.waitForTimeout(300);
    
    const visibleTooltip = page.locator('.openKeyNav-mouseover-tooltip').first();
    await expect(visibleTooltip).toBeVisible();
    
    await page.screenshot({ path: path.join(artifactsDir, '08-debug-tooltip.png'), fullPage: true });
  });
});
