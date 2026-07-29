import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const artifactsDir = path.join(__dirname, '../../artifacts');

test.beforeAll(() => {
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
});

test('page-wide audit stays inactive across scroll and re-enable', async ({ page }) => {
  // Use a typical laptop viewport so scroll behavior and screenshots match
  // common developer machines instead of an extremely tall headless viewport.
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
  await page.waitForFunction(() => window.OpenKeyNav !== undefined);

  // Ensure at top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  // Capture viewport only for scroll-focused screenshots
  await page.screenshot({ path: path.join(artifactsDir, '20-scroll-top.png'), fullPage: false });

  // Enable with the default debug configuration.
  await page.keyboard.press('Shift+KeyO');
  await page.waitForTimeout(800);

  await expect(page.locator('#okn-audit-panel')).toHaveCount(0);
  await expect(page.locator('[data-openkeynav-inaccessible-reason]')).toHaveCount(0);
  await page.screenshot({ path: path.join(artifactsDir, '21-debug-enabled-top.png'), fullPage: false });

  // Scroll to bottom and screenshot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await expect(page.locator('#okn-audit-panel')).toHaveCount(0);
  await expect(page.locator('[data-openkeynav-inaccessible-reason]')).toHaveCount(0);
  await page.screenshot({ path: path.join(artifactsDir, '22-scroll-bottom.png'), fullPage: false });

  // Disable OpenKeyNav
  await page.keyboard.press('Shift+KeyO');
  await page.waitForTimeout(300);

  await expect(page.locator('#okn-audit-panel')).toHaveCount(0);
  await expect(page.locator('[data-openkeynav-inaccessible-reason]')).toHaveCount(0);

  // Capture screenshot of disabled state at bottom
  await page.screenshot({ path: path.join(artifactsDir, '22-scroll-bottom-disabled.png'), fullPage: false });

  // Re-enable OpenKeyNav
  await page.keyboard.press('Shift+KeyO');
  await page.waitForTimeout(800);

  await expect(page.locator('#okn-audit-panel')).toHaveCount(0);
  await expect(page.locator('[data-openkeynav-inaccessible-reason]')).toHaveCount(0);
  await page.screenshot({ path: path.join(artifactsDir, '23-debug-reenabled.png'), fullPage: false });
});
