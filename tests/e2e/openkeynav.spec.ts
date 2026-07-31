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

  test('keyboard error corpus covers major failure categories', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);

    const fixtures = page.locator('[data-keyboard-error]');
    expect(await fixtures.count()).toBeGreaterThanOrEqual(31);

    const categories = await fixtures.evaluateAll(elements =>
      Array.from(new Set(elements.map(element => element.getAttribute('data-keyboard-error')))).sort()
    );

    expect(categories).toEqual(expect.arrayContaining([
      'activation',
      'character-shortcut',
      'custom-widget',
      'focus-management',
      'focus-order',
      'focus-visibility',
      'focusability',
      'hover-only',
      'keyboard-event',
      'keyboard-trap',
      'pointer-only',
      'scrolling',
      'semantics'
    ]));
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

  test('debug mode preserves the published Click Mode diagnostics', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Enable OpenKeyNav
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(300);
    
    // Enter click mode (k).
    await page.keyboard.press('KeyK');
    await page.waitForTimeout(1000);
    
    // Check that overlays exist
    const overlays = await page.locator('.openKeyNav-label').count();
    expect(overlays).toBeGreaterThan(0);
    
    await page.screenshot({ path: path.join(artifactsDir, '07-debug-mode.png'), fullPage: true });
    
    // The published debug behavior adds warning outlines and hover details to
    // focusability-review candidates while retaining the regular Click Mode labels.
    const inaccessibleCandidates = await page.locator('.openKeyNav-inaccessible').count();
    expect(inaccessibleCandidates).toBeGreaterThan(0);

    const outlinedLabels = await page.locator('.openKeyNav-label.openKeyNav-inaccessible').count();
    expect(outlinedLabels).toBeGreaterThan(0);

    const inaccessibleOverlays = await page.locator('.openKeyNav-label.debug-inaccessible').count();
    expect(inaccessibleOverlays).toBe(0);

    const toolbar = await page.locator('.openKeyNav-toolBar').textContent();
    expect(toolbar).toContain('Click Mode');
    expect(toolbar).not.toMatch(/Debug: \d+ inaccessible/);

    await page.screenshot({ path: path.join(artifactsDir, '08-debug-candidates.png'), fullPage: true });
    
    // Press Escape to exit
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    const overlaysAfter = await page.locator('.openKeyNav-label').count();
    expect(overlaysAfter).toBe(0);
  });

  test('debug configuration keeps page-wide audit UI inactive on enable', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);

    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(500);

    await expect(page.locator('#okn-audit-panel')).toHaveCount(0);
    await expect(page.locator('.openKeyNav-inaccessible')).toHaveCount(0);
    await expect(page.locator('[data-openkeynav-inaccessible-reason]')).toHaveCount(0);

    const bodyMarginLeft = await page.locator('body').evaluate(
      element => window.getComputedStyle(element).marginLeft
    );
    expect(bodyMarginLeft).not.toBe('320px');

    await page.screenshot({ path: path.join(artifactsDir, '09-debug-enable.png'), fullPage: true });
  });

  test('keyboard diagnostics disabled - click mode uses standard labels', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/productiondemo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Enable and enter click mode
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(300);
    await page.keyboard.press('KeyK');
    await page.waitForTimeout(500);
    
    // The same Click Mode candidates receive regular labels.
    const overlays = await page.locator('.openKeyNav-label').count();
    expect(overlays).toBeGreaterThan(0);
    
    await expect(page.locator('.openKeyNav-label.openKeyNav-inaccessible')).toHaveCount(0);
    await expect(page.locator('.openKeyNav-mouseover-tooltip')).toHaveCount(0);

    const redOverlays = await page.locator('.openKeyNav-label.debug-inaccessible').count();
    expect(redOverlays).toBe(0);
    
    // Toolbar should NOT show debug count
    const toolbar = await page.locator('.openKeyNav-toolBar').textContent();
    expect(toolbar).not.toMatch(/Debug: \d+ inaccessible/);
    
    await page.screenshot({ path: path.join(artifactsDir, '14-production-click-mode.png'), fullPage: true });
    
    await page.keyboard.press('Escape');
  });

  test('nested interactive elements - same dimensions show only innermost', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);

    await page.locator('#nested-button-outer').scrollIntoViewIfNeeded();

    // Enable OpenKeyNav
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(300);
    
    // Enter click mode
    await page.keyboard.press('KeyK');
    await page.waitForTimeout(1000);
    
    // Check same-dimension nested button - only inner should have label
    const outerButton = page.locator('#nested-button-outer');
    const innerButton = page.locator('#nested-button-inner');
    
    // Log bounding rects for debugging
    const outerRect = await outerButton.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
    });
    const innerRect = await innerButton.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
    });
    console.log('Outer rect:', outerRect);
    console.log('Inner rect:', innerRect);
    
    const outerHasLabel = await outerButton.evaluate(el => el.hasAttribute('data-openkeynav-label'));
    const innerHasLabel = await innerButton.evaluate(el => el.hasAttribute('data-openkeynav-label'));
    
    console.log('Outer has label:', outerHasLabel);
    console.log('Inner has label:', innerHasLabel);
    
    expect(outerHasLabel).toBe(false); // Parent filtered out
    expect(innerHasLabel).toBe(true); // Child has label
    
    // Check div wrapping button (same size) - only button should have label
    const div = page.locator('#nested-div-same');
    const divButton = page.locator('#nested-div-button-same');
    
    const divHasLabel = await div.evaluate(el => el.hasAttribute('data-openkeynav-label'));
    const divButtonHasLabel = await divButton.evaluate(el => el.hasAttribute('data-openkeynav-label'));
    
    expect(divHasLabel).toBe(false); // Parent filtered out
    expect(divButtonHasLabel).toBe(true); // Child has label
    
    // Check anchor wrapping button (same size) - only button should have label
    const anchor = page.locator('#nested-anchor-same');
    const anchorButton = page.locator('#nested-anchor-button-same');
    
    const anchorHasLabel = await anchor.evaluate(el => el.hasAttribute('data-openkeynav-label'));
    const anchorButtonHasLabel = await anchorButton.evaluate(el => el.hasAttribute('data-openkeynav-label'));
    
    expect(anchorHasLabel).toBe(false); // Parent filtered out
    expect(anchorButtonHasLabel).toBe(true); // Child has label
    
    await page.screenshot({ path: path.join(artifactsDir, '16-nested-same-size.png'), fullPage: true });
  });

  test('nested interactive elements - different dimensions show both', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/demo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);

    await page.locator('#nested-div-large').scrollIntoViewIfNeeded();

    // Enable OpenKeyNav
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(300);
    
    // Enter click mode
    await page.keyboard.press('KeyK');
    await page.waitForTimeout(1000);
    
    // Check large div with small button - both should have labels
    const largeDiv = page.locator('#nested-div-large');
    const smallButton = page.locator('#nested-button-small');
    
    const largeDivHasLabel = await largeDiv.evaluate(el => el.hasAttribute('data-openkeynav-label'));
    const smallButtonHasLabel = await smallButton.evaluate(el => el.hasAttribute('data-openkeynav-label'));
    
    expect(largeDivHasLabel).toBe(true); // Parent has label
    expect(smallButtonHasLabel).toBe(true); // Child has label
    
    // Check large anchor with small button - both should have labels
    const largeAnchor = page.locator('#nested-anchor-large');
    const smallAnchorButton = page.locator('#nested-anchor-button-small');
    
    const largeAnchorHasLabel = await largeAnchor.evaluate(el => el.hasAttribute('data-openkeynav-label'));
    const smallAnchorButtonHasLabel = await smallAnchorButton.evaluate(el => el.hasAttribute('data-openkeynav-label'));
    
    expect(largeAnchorHasLabel).toBe(true); // Parent has label
    expect(smallAnchorButtonHasLabel).toBe(true); // Child has label
    
    await page.screenshot({ path: path.join(artifactsDir, '17-nested-different-size.png'), fullPage: true });
  });

  test('keyboard diagnostics disabled - candidates are not flagged', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, '../../demo/productiondemo.html')}`);
    await page.waitForFunction(() => window.OpenKeyNav !== undefined);
    
    // Enable OpenKeyNav and enter Click Mode so candidate discovery runs.
    await page.keyboard.press('Shift+KeyO');
    await page.waitForTimeout(300);
    await page.keyboard.press('KeyK');
    await page.waitForTimeout(500);
    
    // Check that known diagnostic candidates receive labels without warning markers.
    const badLink = page.locator('#bad-link');
    const hasInaccessibleClass = await badLink.evaluate(el => 
      el.classList.contains('openKeyNav-inaccessible')
    );
    expect(hasInaccessibleClass).toBe(false);
    
    const hasInaccessibleAttr = await badLink.evaluate(el => 
      el.hasAttribute('data-openkeynav-inaccessible-reason')
    );
    expect(hasInaccessibleAttr).toBe(false);

    const hasClickModeLabel = await badLink.evaluate(el =>
      el.hasAttribute('data-openkeynav-label')
    );
    expect(hasClickModeLabel).toBe(true);
    
    await page.screenshot({ path: path.join(artifactsDir, '15-production-no-flagging.png'), fullPage: true });
  });
});
