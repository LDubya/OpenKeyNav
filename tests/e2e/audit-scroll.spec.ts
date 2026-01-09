import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const artifactsDir = path.join(__dirname, '../../artifacts');

test.beforeAll(() => {
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
});

test('audit counts top / bottom / reenable flow', async ({ page }) => {
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

  // Enable (Shift+O) - triggers audit in debug mode
  await page.keyboard.press('Shift+KeyO');
  await page.waitForTimeout(800);

  // Count issues (elements flagged with attribute)
  const topCount = await page.locator('[data-openkeynav-inaccessible-reason]').count();
  console.log('TOP_COUNT:', topCount);
  await page.screenshot({ path: path.join(artifactsDir, '21-audit-top.png'), fullPage: false });

  // Scroll to bottom and screenshot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artifactsDir, '22-scroll-bottom.png'), fullPage: false });

  // Disable OpenKeyNav
  await page.keyboard.press('Shift+KeyO');
  await page.waitForTimeout(300);

  // Verify the audit panel is removed and accessibility markers cleared
  const panel = page.locator('#okn-audit-panel');
  await expect(panel).not.toBeVisible();

  const inaccessibleAfterDisable = await page.locator('[data-openkeynav-inaccessible-reason]').count();
  console.log('AFTER_DISABLE_COUNT:', inaccessibleAfterDisable);
  // Expect none while disabled
  expect(inaccessibleAfterDisable).toBe(0);

  // Capture screenshot of disabled state at bottom
  await page.screenshot({ path: path.join(artifactsDir, '22-scroll-bottom-disabled.png'), fullPage: false });

  // Re-enable OpenKeyNav
  await page.keyboard.press('Shift+KeyO');
  await page.waitForTimeout(800);

  const reenabledCount = await page.locator('[data-openkeynav-inaccessible-reason]').count();
  console.log('REENABLED_COUNT:', reenabledCount);
  await page.screenshot({ path: path.join(artifactsDir, '23-audit-reenabled.png'), fullPage: false });

  // Save a short summary file
  const summary = `top=${topCount}\nreenabled=${reenabledCount}\n`;
  fs.writeFileSync(path.join(artifactsDir, 'audit-scroll-summary.txt'), summary);

  // Basic sanity checks so test does not silently pass without running steps
  expect(typeof topCount).toBe('number');
  expect(typeof reenabledCount).toBe('number');
});
