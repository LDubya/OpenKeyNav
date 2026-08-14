import { expect, test, type Page } from '@playwright/test';
import path from 'path';

const fixtureUrl = `file://${path.join(__dirname, '../../demo/structural-navigation.html')}`;

async function loadFixture(page: Page) {
  await page.goto(fixtureUrl);
  await page.waitForFunction(() => {
    const fixtureWindow = window as typeof window & {
      okn?: unknown;
      fixture?: { deepActiveId?: () => string | null };
    };
    return Boolean(fixtureWindow.okn && fixtureWindow.fixture?.deepActiveId);
  });
  // Most routing tests also exercise the optional context indicator.
  await page.evaluate(() => {
    const contextIndicator = (window as any).okn.config.modesConfig
      .structuralNavigation.contextIndicator;
    (window as any).defaultContextIndicatorEnabled = contextIndicator.enabled;
    contextIndicator.enabled = true;
  });
}

async function focusFixtureTarget(page: Page, id: string) {
  await page.evaluate(targetId => {
    (window as any).fixture.focus(targetId);
  }, id);
  await expectDeepFocus(page, id);
}

async function expectDeepFocus(page: Page, id: string) {
  await expect.poll(() => page.evaluate(() => (window as any).fixture.deepActiveId())).toBe(id);
}

async function enableOpenKeyNav(page: Page) {
  await page.keyboard.press('Shift+KeyO');
  await expect.poll(() => page.evaluate(() => (window as any).okn.meta.enabled.value)).toBe(true);
}

async function enterStructuralNavigation(page: Page) {
  await page.keyboard.press('KeyR');
  await expect.poll(() => page.evaluate(
    () => (window as any).okn.config.modes.structuralNavigation.value
  )).toBe(true);
  await expect(page.locator('.openKeyNav-structural-status')).toBeVisible();
}

async function enableAndEnter(page: Page) {
  await enableOpenKeyNav(page);
  await enterStructuralNavigation(page);
}

async function structuralNavigate(page: Page, command: string) {
  expect(await page.evaluate(navigationCommand => (
    (window as any).okn.structuralNavigate(navigationCommand)
  ), command)).toBe(true);
}

test.describe('structural navigation mode', () => {
  test.beforeEach(async ({ page }) => {
    await loadFixture(page);
  });

  test('keeps branded enable and disable notifications visible', async ({ page }) => {
    const notification = page.locator('.openKeyNav-notification');
    const logo = notification.locator('.okn-logo-text.tiny');
    const content = notification.locator('.openKeyNav-status__content');

    await page.keyboard.press('Shift+KeyO');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.meta.enabled.value
    )).toBe(true);
    await expect(notification).toBeVisible();
    await expect(content).toContainText('openKeyNav enabled.');
    await expect(logo).toHaveCount(1);
    await expect(logo).toHaveAttribute('role', 'img');
    await expect(logo).toHaveAttribute('aria-label', 'OpenKeyNav');
    expect(await logo.evaluate(element => element.outerHTML)).toBe(
      '<div class="okn-logo-text tiny" role="img" aria-label="OpenKeyNav">Open<span class="key">Key</span>Nav</div>'
    );
    await page.waitForTimeout(500);
    await expect(notification).toBeVisible();

    await page.keyboard.press('Shift+KeyO');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.meta.enabled.value
    )).toBe(false);
    await expect(notification).toBeVisible();
    await expect(content).toContainText('openKeyNav disabled.');
    await expect(logo).toHaveCount(1);
    await expect(logo).toHaveAttribute('role', 'img');
    await expect(logo).toHaveAttribute('aria-label', 'OpenKeyNav');
    await page.waitForTimeout(500);
    await expect(notification).toBeVisible();
  });

  test('keeps the large context outline off by default', async ({ page }) => {
    expect(await page.evaluate(() => (
      (window as any).defaultContextIndicatorEnabled
    ))).toBe(false);
    await page.evaluate(() => {
      (window as any).okn.config.modesConfig.structuralNavigation
        .contextIndicator.enabled = false;
    });
    await enableAndEnter(page);

    await expect(page.locator('.openKeyNav-structural-context-outline'))
      .toHaveCount(0);
    expect(await page.evaluate(() => (
      (window as any).okn.config.modesConfig.structuralNavigation
        .contextIndicator.enabled
    ))).toBe(false);
  });

  test('keeps the context outline through keyboard scrolling and shows context changes', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).okn.config.modesConfig.structuralNavigation
        .contextIndicator.enabled = false;
    });
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'in-stock');
    await enterStructuralNavigation(page);

    const indicator = page.locator('.openKeyNav-structural-context-outline');
    await expect(indicator).toHaveCount(0);

    await page.keyboard.press('Shift+ArrowUp');
    await expectDeepFocus(page, 'clear-filters');
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute('data-context-name', 'Catalog');
    const headingLevelTab = page.locator(
      '.openKeyNav-structural-context-heading-level'
    );
    await expect(headingLevelTab).toBeVisible();
    await expect(headingLevelTab).toHaveText('h1');
    await expect(indicator).toHaveAttribute('data-heading-level', '1');
    expect(await indicator.evaluate(element => {
      const style = getComputedStyle(element);
      return {
        borderColor: style.borderColor,
        borderStyle: style.borderStyle,
        boxShadow: style.boxShadow,
      };
    })).toEqual({
      borderColor: 'rgb(51, 51, 51)',
      borderStyle: 'dashed',
      boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 2px',
    });
    expect(await headingLevelTab.evaluate(element => {
      const tabStyle = getComputedStyle(element);
      const pageStyle = getComputedStyle(document.body);
      return {
        tab: {
          fontFamily: tabStyle.fontFamily,
          fontSize: tabStyle.fontSize,
          fontWeight: tabStyle.fontWeight,
          lineHeight: tabStyle.lineHeight,
        },
        page: {
          fontFamily: pageStyle.fontFamily,
          fontSize: pageStyle.fontSize,
          fontWeight: pageStyle.fontWeight,
          lineHeight: pageStyle.lineHeight,
        },
        color: tabStyle.color,
        backgroundColor: tabStyle.backgroundColor,
      };
    })).toMatchObject({
      tab: await page.locator('body').evaluate(element => {
        const style = getComputedStyle(element);
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
        };
      }),
      color: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(51, 51, 51)',
    });
    expect(await page.locator('.openKeyNav-structural-keylabel').evaluateAll(
      (labels, contextIndicator) => labels.every(label => (
        Number(getComputedStyle(label).zIndex) >
        Number(getComputedStyle(contextIndicator as Element).zIndex)
      )),
      await indicator.elementHandle()
    )).toBe(true);

    await page.keyboard.press('Shift+ArrowDown');
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute('data-context-name', 'Filters');
    await expect(headingLevelTab).toHaveText('h2');
    await expect(indicator).toHaveAttribute('data-heading-level', '2');

    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'product-a');
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute('data-context-name', 'Results');
    await expect(headingLevelTab).toHaveText('h2');

    const scrollTopBefore = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(scrollTopBefore);
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute('data-context-name', 'Results');

    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'product-b');
    await expect(indicator).toBeHidden();

    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'clear-filters');
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute('data-context-name', 'Filters');

    await page.keyboard.press('Enter');
    await expect(indicator).toBeHidden();

    await page.locator('#product-a').focus();
    await expectDeepFocus(page, 'product-a');
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute('data-context-name', 'Results');
  });

  test('ends a heading outline where its sibling focusable wrapper begins', async ({ page }) => {
    await page.evaluate(() => {
      const row = document.createElement('div');
      row.id = 'heading-card-siblings';
      row.style.display = 'flex';
      row.style.gap = '32px';
      row.innerHTML = `
        <div id="heading-card-one" role="button" tabindex="0">
          <header><h2>Heading card one</h2></header>
          <p>First card content</p>
        </div>
        <div id="heading-card-two" role="button" tabindex="0">
          <header><h2>Heading card two</h2></header>
          <p>Second card content</p>
        </div>
      `;
      Array.from(row.children).forEach((child: HTMLElement) => {
        child.style.border = '1px solid';
        child.style.flex = '1';
        child.style.padding = '16px';
      });
      document.body.prepend(row);
    });
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'heading-card-one');
    await enterStructuralNavigation(page);

    const indicator = page.locator('.openKeyNav-structural-context-outline');
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute(
      'data-context-name',
      'Heading card one'
    );
    await expect(page.locator(
      '.openKeyNav-structural-context-heading-level'
    )).toHaveText('h2');

    const indicatorBox = await indicator.boundingBox();
    const firstBox = await page.locator('#heading-card-one').boundingBox();
    const secondBox = await page.locator('#heading-card-two').boundingBox();
    expect(indicatorBox).not.toBeNull();
    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();
    expect(indicatorBox!.x).toBeLessThan(firstBox!.x);
    expect(indicatorBox!.x + indicatorBox!.width)
      .toBeLessThan(secondBox!.x);

    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'heading-card-two');
    await expect(indicator).toHaveAttribute(
      'data-context-name',
      'Heading card two'
    );
    const secondIndicatorBox = await indicator.boundingBox();
    const followingHeaderBox = await page.locator(
      'body > header[aria-labelledby="site-title"]'
    ).boundingBox();
    expect(secondIndicatorBox).not.toBeNull();
    expect(followingHeaderBox).not.toBeNull();
    expect(secondIndicatorBox!.y + secondIndicatorBox!.height)
      .toBeLessThan(followingHeaderBox!.y);
  });

  test('labels the first tabbable target with native Tab on initial page entry', async ({ page }) => {
    expect(await page.evaluate(() => (window as any).fixture.deepActiveId()))
      .toBe('');
    await enableAndEnter(page);

    const firstTargetLabel = page.locator(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-target="search-input"]'
    );
    await expect(firstTargetLabel).toHaveText('⇥');
    await expect(firstTargetLabel).toHaveAttribute(
      'data-openkeynav-keylabel-command',
      'nextTabTarget'
    );

    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'search-input');
  });

  test('preserves all page-authored focus styling on the active structural target', async ({ page }) => {
    await page.addStyleTag({
      content: `
        #product-a:focus,
        #recommendation-a:focus {
          outline: 5px dashed rgb(12, 34, 56);
          outline-offset: 7px;
          border: 4px dotted rgb(45, 67, 89);
          border-radius: 17px;
          box-shadow: 0 0 0 6px rgb(78, 90, 123);
          opacity: 0.43;
        }
      `,
    });
    const focusStyle = (id: string) => page.locator(`#${id}`).evaluate(element => {
      const style = getComputedStyle(element);
      return {
        borderColor: style.borderColor,
        borderRadius: style.borderRadius,
        borderStyle: style.borderStyle,
        borderWidth: style.borderWidth,
        boxShadow: style.boxShadow,
        opacity: style.opacity,
        color: style.outlineColor,
        offset: style.outlineOffset,
        style: style.outlineStyle,
        width: style.outlineWidth,
      };
    });

    await focusFixtureTarget(page, 'recommendation-a');
    const expectedRecommendationStyle = await focusStyle('recommendation-a');
    await focusFixtureTarget(page, 'product-a');
    const expectedProductStyle = await focusStyle('product-a');
    await enableOpenKeyNav(page);
    await enterStructuralNavigation(page);

    await expect(page.locator('#product-a'))
      .toHaveAttribute('data-openkeynav-keylabel-target-active', '');
    expect(await focusStyle('product-a')).toEqual(expectedProductStyle);
    expect(await page.locator('#product-a').evaluate(element => {
      (element as HTMLElement).style.visibility = 'hidden';
      return getComputedStyle(element).visibility;
    })).toBe('hidden');
    await page.locator('#product-a').evaluate(element => {
      (element as HTMLElement).style.visibility = '';
    });

    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'recommendation-a');
    expect(await focusStyle('recommendation-a')).toEqual(expectedRecommendationStyle);
  });

  test('routes real focus through headings, boundaries, broaden/narrow, and horizontal contexts', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'in-stock');
    await page.evaluate(() => (window as any).fixture.resetLogs());

    await enterStructuralNavigation(page);
    const structuralStatusContent = page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    );
    const activeIndicator = page.locator(
      '.openKeyNav-structural-context-outline'
    );

    // Activation and context-only changes retain the meaningful page focus.
    await expectDeepFocus(page, 'in-stock');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Availability');
    await expect(structuralStatusContent).toContainText('Heading level: 2.');
    await expect(activeIndicator).toHaveAttribute('data-context-name', 'Availability');
    expect(await page.evaluate(() => (window as any).fixture.focusEvents)).toEqual([]);
    const initialProductLabel = page.locator(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-target="product-a"]'
    );
    await expect(initialProductLabel).toHaveText('⌥⇥');
    await expect(initialProductLabel).toHaveAttribute(
      'data-openkeynav-keylabel-command',
      'nextContextStart'
    );

    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'preorder');

    // Native Tab crosses the context boundary; Shift+Tab reverses it.
    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'product-a');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Results');
    await page.keyboard.press('Shift+Tab');
    await expectDeepFocus(page, 'preorder');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Availability');
    const immediateProductLabel = page.locator(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-target="product-a"]'
    );
    await expect(immediateProductLabel).toHaveText('⇥');
    await expect(immediateProductLabel).toHaveAttribute(
      'data-openkeynav-keylabel-command',
      'nextTabTarget'
    );

    await page.keyboard.press('Shift+ArrowUp');
    await expectDeepFocus(page, 'clear-filters');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Catalog');
    await expect(structuralStatusContent).toContainText('Heading level: 1.');
    await expect(activeIndicator).toHaveAttribute('data-context-name', 'Catalog');

    await page.keyboard.press('Shift+ArrowDown');
    await expectDeepFocus(page, 'clear-filters');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Filters');
    await expect(structuralStatusContent).toContainText('Heading level: 2.');
    await expect(activeIndicator).toHaveAttribute('data-context-name', 'Filters');

    // Shift+Left/Right traverses the authored H2 lane, always entering the
    // destination's first stop.
    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'product-a');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Results');

    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'recommendation-a');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Recommendations');
    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'product-a');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Results');

    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'product-b');
    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'clear-filters');
    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'product-a');

    // Native Tab inside a broadened context may cross descendants without
    // narrowing it.
    await focusFixtureTarget(page, 'preorder');
    await page.keyboard.press('Shift+ArrowUp');
    await expectDeepFocus(page, 'clear-filters');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Catalog');
    await expect(structuralStatusContent).toContainText('Heading level: 1.');
    await expect(activeIndicator).toHaveAttribute('data-context-name', 'Catalog');
    const catalogBox = await page.locator('main').boundingBox();
    const catalogIndicatorBox = await activeIndicator.boundingBox();
    expect(catalogBox).not.toBeNull();
    expect(catalogIndicatorBox).not.toBeNull();
    expect(catalogIndicatorBox!.x).toBeLessThan(catalogBox!.x);
    expect(catalogIndicatorBox!.y).toBeLessThan(catalogBox!.y);
    expect(catalogIndicatorBox!.width).toBeGreaterThan(catalogBox!.width);
    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'in-stock');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Catalog');
    await expect(structuralStatusContent).toContainText('Heading level: 1.');
    await expect(activeIndicator).toHaveAttribute('data-context-name', 'Catalog');

    const nextContextStartLabel = page.locator(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-command="nextContextStart"]' +
      '[data-openkeynav-keylabel-target="product-a"]'
    );
    await expect(nextContextStartLabel).toHaveText('⌥⇥');
    await page.keyboard.press('Alt+Tab');
    await expectDeepFocus(page, 'product-a');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Results');

    await page.keyboard.press('Alt+Shift+Tab');
    await expectDeepFocus(page, 'in-stock');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Availability');

    const focusEvents = await page.evaluate(() => (window as any).fixture.focusEvents);
    const blurEvents = await page.evaluate(() => (window as any).fixture.blurEvents);
    expect(focusEvents).toContain('preorder');
    expect(focusEvents).toContain('product-a');
    expect(blurEvents).toContain('in-stock');
  });

  test('shows compact keylabels for real focus routes and native activation', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'product-a');
    await enterStructuralNavigation(page);

    const structuralLabel = (command: string, target: string) => page.locator(
      `.openKeyNav-structural-keylabel` +
      `[data-openkeynav-keylabel-command~="${command}"]` +
      `[data-openkeynav-keylabel-target="${target}"]`
    );

    await expect(structuralLabel('previousTabTarget', 'preorder'))
      .toHaveText('⇧⇥');
    await expect(structuralLabel('nextTabTarget', 'product-b'))
      .toHaveText('⇥');
    await expect(structuralLabel('previousSiblingContext', 'clear-filters'))
      .toHaveText('⇧←');
    await expect(structuralLabel('previousSiblingContext', 'clear-filters'))
      .not.toHaveAttribute('data-openkeynav-keylabel-alternatives');
    await expect(structuralLabel('nextContextStart', 'recommendation-a'))
      .toHaveText('⌥⇥');
    await expect(structuralLabel('broadenContext', 'clear-filters'))
      .toHaveCount(0);
    await expect(structuralLabel('narrowContext', 'same-level-current-first'))
      .toHaveText('⇧↓');
    const shiftSymbols = page.locator(
      '.openKeyNav-structural-keylabel ' +
      '[data-openkeynav-keylabel-modifier="shift"]'
    );
    expect(await shiftSymbols.count()).toBeGreaterThan(0);
    expect(await shiftSymbols.evaluateAll(symbols => symbols.every(symbol => (
      !symbol.hasAttribute('data-openkeynav-keylabel-pressed')
    )))).toBe(true);
    await page.keyboard.down('Shift');
    await expect.poll(() => shiftSymbols.evaluateAll(symbols => symbols.every(
      symbol => symbol.getAttribute('data-openkeynav-keylabel-pressed') === 'true'
    ))).toBe(true);
    expect(await shiftSymbols.first().evaluate(element => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, color: style.color };
    })).toEqual({
      background: 'rgb(255, 255, 255)',
      color: 'rgb(17, 17, 17)',
    });
    await page.keyboard.up('Shift');
    await expect.poll(() => shiftSymbols.evaluateAll(symbols => symbols.every(
      symbol => !symbol.hasAttribute('data-openkeynav-keylabel-pressed')
    ))).toBe(true);
    await expect(structuralLabel('activateEnter', 'product-a'))
      .toHaveText('↵');
    await expect(structuralLabel('activateEnter', 'product-a'))
      .toHaveClass(/openKeyNav-keylabel-focused/);
    await expect(structuralLabel('activateSpace', 'product-a')).toHaveCount(0);
    const focusedLabelColors = await structuralLabel(
      'activateEnter',
      'product-a'
    ).evaluate(element => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        border: style.borderColor,
        color: style.color,
      };
    });
    const destinationLabelColors = await structuralLabel(
      'previousSiblingContext',
      'clear-filters'
    ).evaluate(element => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, color: style.color };
    });
    expect(focusedLabelColors.color).toBe('rgb(255, 255, 255)');
    expect(focusedLabelColors.border).toBe('rgb(255, 255, 255)');
    expect(focusedLabelColors.background).not.toBe(destinationLabelColors.background);
    const focusedBackgroundRgb = focusedLabelColors.background
      .match(/[\d.]+/g)?.slice(0, 3).map(Number) || [];
    const relativeLuminance = focusedBackgroundRgb.reduce((sum, component, index) => {
      const channel = component / 255;
      const linearChannel = channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
      return sum + linearChannel * [0.2126, 0.7152, 0.0722][index];
    }, 0);
    expect(1.05 / (relativeLuminance + 0.05)).toBeGreaterThanOrEqual(4.5);
    await expect(page.locator('#product-a'))
      .toHaveAttribute('data-openkeynav-keylabel-target-active', '');
    await expect(page.locator('#clear-filters'))
      .toHaveAttribute('data-openkeynav-keylabel-target-active', '');
    expect(await page.locator('#product-a').evaluate(element => (
      getComputedStyle(element).boxShadow
    ))).toBe('none');
    expect(await page.locator('#product-b').evaluate(element => (
      getComputedStyle(element).boxShadow
    ))).not.toBe('none');
    expect(await page.locator('#clear-filters').evaluate(element => (
      getComputedStyle(element).outlineStyle
    ))).toBe('solid');
    expect(await page.locator('.openKeyNav-structural-keylabel').evaluateAll(
      labels => labels.every(label => Array.from(label.textContent || '').length <= 3)
    )).toBe(true);
    expect(await page.locator('.openKeyNav-structural-keylabel').evaluateAll(
      labels => new Set(labels.map(label => (
        (label as HTMLElement).dataset.openkeynavKeylabelTarget
      ))).size === labels.length
    )).toBe(true);

    await focusFixtureTarget(page, 'native-checkbox');
    await expect(structuralLabel('activateSpace', 'native-checkbox'))
      .toHaveText('⎵');
    await expect(structuralLabel('activateEnter', 'native-checkbox'))
      .toHaveCount(0);

    await focusFixtureTarget(page, 'native-button');
    await expect(structuralLabel('activateEnter', 'native-button'))
      .toHaveText('↵');
    await expect(structuralLabel('activateSpace', 'native-button'))
      .toHaveCount(0);

    await page.evaluate(() => {
      const roleButton = document.createElement('div');
      roleButton.id = 'role-button';
      roleButton.setAttribute('role', 'button');
      roleButton.tabIndex = 0;
      roleButton.textContent = 'Run authored action';
      document.getElementById('native-behavior')!.appendChild(roleButton);
    });
    await focusFixtureTarget(page, 'role-button');
    await expect(structuralLabel('activateEnter', 'role-button'))
      .toHaveText('↵');
    await expect(structuralLabel('activateSpace', 'role-button'))
      .toHaveCount(0);

    await focusFixtureTarget(page, 'radio-one');
    await expect(structuralLabel('nativeArrowRight', 'radio-two'))
      .toHaveText('↔↕');
    await expect(structuralLabel('nativeArrowDown', 'radio-two'))
      .toHaveText('↔↕');
    await expect(structuralLabel('nativeArrowRight', 'radio-two'))
      .toHaveAttribute('data-openkeynav-keylabel-alternatives', '2');
    await expect(structuralLabel('activateSpace', 'radio-one'))
      .toHaveClass(/openKeyNav-keylabel-focused/);
    await page.keyboard.press('ArrowRight');
    await expectDeepFocus(page, 'radio-two');
    await expect(structuralLabel('nativeArrowLeft', 'radio-one'))
      .toHaveText('↔↕');
    await expect(structuralLabel('nativeArrowLeft', 'radio-one'))
      .not.toHaveClass(/openKeyNav-keylabel-focused/);
    await expect(structuralLabel('activateSpace', 'radio-two'))
      .toHaveClass(/openKeyNav-keylabel-focused/);

    await focusFixtureTarget(page, 'native-button');
    await page.keyboard.press('KeyK');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.clicking.value
    )).toBe(true);
    await expect(page.locator('.openKeyNav-structural-keylabel')).toHaveCount(0);
    await expect(page.locator('[data-openkeynav-keylabel-target-active]'))
      .toHaveCount(0);
    await expect.poll(() => page.locator(
      '.openKeyNav-label:not(.openKeyNav-structural-keylabel)'
    ).count()).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect.poll(() => page.locator(
      '.openKeyNav-structural-keylabel'
    ).count()).toBeGreaterThan(0);
    await expect.poll(() => page.locator(
      '[data-openkeynav-keylabel-target-active]'
    ).count()).toBeGreaterThan(0);

    await page.keyboard.press('Alt+KeyR');
    await expect(page.locator('.openKeyNav-structural-keylabel')).toHaveCount(0);
    await expect(page.locator('[data-openkeynav-keylabel-target-active]'))
      .toHaveCount(0);
  });

  test('enters the authored heading-level ladder without using DOM nesting', async ({ page }) => {
    await page.evaluate(() => {
      const fixture = document.createElement('div');
      fixture.id = 'unheaded-heading-fallback-fixture';
      fixture.innerHTML = `
        <nav aria-label="Primary actions">
          <div><div><div>
            <button id="fallback-home">Home</button>
            <button id="fallback-browse">Browse sheets</button>
            <button id="fallback-sticky">Sticky note</button>
          </div></div></div>
        </nav>
        <section aria-labelledby="fallback-folders-heading">
          <h2 id="fallback-folders-heading">Folders</h2>
          <a id="fallback-inbox" href="#inbox">Inbox</a>
        </section>
        <section aria-labelledby="fallback-custom-folders-heading">
          <h3 id="fallback-custom-folders-heading">Custom Folders</h3>
          <button id="fallback-new-folder">Create a new folder</button>
        </section>
      `;
      document.body.prepend(fixture);
      const structural = (window as any).okn.config.modesConfig
        .structuralNavigation;
      structural.keylabels.contextJump = false;
      structural.activeRoot = fixture;
    });
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'fallback-home');
    await enterStructuralNavigation(page);

    const status = page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    );
    await expect(status).toContainText('Context: Primary actions.');
    await expect(status).not.toContainText('Heading level:');
    await expect(page.locator(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-command="broadenContext"]' +
      '[data-openkeynav-keylabel-target="fallback-new-folder"]'
    )).toHaveText('⇧↑');
    await expect(page.locator(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-command="narrowContext"]' +
      '[data-openkeynav-keylabel-target="fallback-inbox"]'
    )).toHaveText('⇧↓');

    await page.keyboard.press('Shift+ArrowUp');
    await expectDeepFocus(page, 'fallback-new-folder');
    await expect(status).toContainText('Context: Custom Folders.');
    await expect(status).toContainText('Heading level: 3.');

    await focusFixtureTarget(page, 'fallback-home');
    await expect(status).toContainText('Context: Primary actions.');
    await page.keyboard.press('Shift+ArrowDown');
    await expectDeepFocus(page, 'fallback-inbox');
    await expect(status).toContainText('Context: Folders.');
    await expect(status).toContainText('Heading level: 2.');
  });

  test('changes authored levels inside one contenteditable target', async ({ page }) => {
    await page.evaluate(() => {
      const editor = document.createElement('div');
      editor.id = 'rich-document-editor';
      editor.setAttribute('role', 'region');
      editor.setAttribute('aria-label', 'Rich document detail');
      editor.contentEditable = 'true';
      editor.innerHTML = `
        <h2>Rich document title</h2>
        <p>Introduction</p>
        <h4>Rich skipped-rank section</h4>
        <p>Section detail</p>
      `;
      document.body.prepend(editor);
    });
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'rich-document-editor');
    await page.evaluate(() => {
      (window as any).okn.enterStructuralNavigation();
    });
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.structuralNavigation.value
    )).toBe(true);
    await expect(page.locator('.openKeyNav-structural-status')).toBeVisible();

    const status = page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    );
    await expect(status).toContainText('Context: Rich document title.');
    await expect(status).toContainText('Heading level: 2.');

    await page.keyboard.press('Alt+Shift+ArrowDown');
    await expectDeepFocus(page, 'rich-document-editor');
    await expect(status).toContainText('Context: Rich skipped-rank section.');
    await expect(status).toContainText('Heading level: 4.');

    await page.keyboard.press('Alt+Shift+ArrowUp');
    await expectDeepFocus(page, 'rich-document-editor');
    await expect(status).toContainText('Context: Rich document title.');
    await expect(status).toContainText('Heading level: 2.');
  });

  test('applies a configurable minimum keylabel font size', async ({ page }) => {
    await page.evaluate(() => {
      document.body.style.fontSize = '10px';
    });
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'product-a');
    await enterStructuralNavigation(page);

    const label = page.locator('.openKeyNav-structural-keylabel').first();
    const fontSize = () => label.evaluate(element => (
      getComputedStyle(element).fontSize
    ));

    await expect.poll(fontSize).toBe('16px');

    await page.evaluate(() => {
      const openKeyNav = (window as any).okn;
      openKeyNav.config.spot.minimumFontSize = false;
      openKeyNav.injectStyles(true);
    });
    await expect.poll(fontSize).toBe('10px');

    await page.evaluate(() => {
      const openKeyNav = (window as any).okn;
      openKeyNav.config.spot.minimumFontSize = '24px';
      openKeyNav.config.spot.fontSize = '20px';
      openKeyNav.injectStyles(true);
    });
    await expect.poll(fontSize).toBe('20px');
  });

  test('keeps Structural Navigation active around heading and scroll commands without stealing editable characters', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'clear-filters');
    await enterStructuralNavigation(page);
    const structuralStatus = page.locator('.openKeyNav-structural-status');
    const indicator = page.locator('.openKeyNav-structural-context-outline');

    await page.keyboard.press('KeyH');
    await expectDeepFocus(page, 'site-title');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.structuralNavigation.value
    )).toBe(true);
    await expect(page.locator('#site-title')).toHaveAttribute('tabindex', '-1');
    await expect(structuralStatus).toContainText('Context: OpenKeyNav test shop');
    await expect(indicator).toHaveAttribute('data-context-name', 'OpenKeyNav test shop');
    await expect(page.locator('.openKeyNav-structural-exit-status')).toHaveCount(0);

    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'search-input');
    expect(await page.evaluate(() => {
      const state = (window as any).okn.getStructuralNavigationState();
      return state.activeContext.targets.includes(state.target);
    })).toBe(true);

    await focusFixtureTarget(page, 'clear-filters');
    await page.keyboard.press('Digit2');
    await expectDeepFocus(page, 'search-title');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.structuralNavigation.value
    )).toBe(true);
    await expect(structuralStatus).toContainText('Context: Search');
    await expect(indicator).toHaveAttribute('data-context-name', 'Search');

    await page.evaluate(() => {
      (window as any).okn.getScrollableElements = () => [
        document.getElementById('scroll-region-a'),
        document.getElementById('scroll-region-b'),
      ];
    });
    await page.keyboard.press('KeyS');
    await expectDeepFocus(page, 'scroll-region-a');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.structuralNavigation.value
    )).toBe(true);
    await expect(structuralStatus).toContainText(
      'Context: Native activation and sequential focus'
    );
    await expect(indicator).toHaveAttribute(
      'data-context-name',
      'Native activation and sequential focus'
    );
    expect(await page.evaluate(() => ({
      nestedIndex: (window as any).okn.config.scrollables.currentScrollableIndex,
      hasTopLevelIndex: Object.hasOwn(
        (window as any).okn.config,
        'currentScrollableIndex'
      ),
    }))).toEqual({ nestedIndex: 0, hasTopLevelIndex: false });

    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'native-button');

    await page.locator('#search-input').focus();
    await page.keyboard.type('h');
    await expect(page.locator('#search-input')).toHaveValue('h');
    await expectDeepFocus(page, 'search-input');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.structuralNavigation.value
    )).toBe(true);
  });

  test('treats Click Mode as a temporary layer and restores Structural Navigation', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'clear-filters');
    await enterStructuralNavigation(page);
    const structuralStatus = page.locator('.openKeyNav-structural-status');

    await page.keyboard.press('KeyK');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.clicking.value
    )).toBe(true);
    await expect.poll(() => page.locator(
      '.openKeyNav-label:not(.openKeyNav-structural-keylabel)'
    ).count())
      .toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect.poll(() => page.evaluate(() => ({
      clicking: (window as any).okn.config.modes.clicking.value,
      structural: (window as any).okn.config.modes.structuralNavigation.value,
    }))).toEqual({ clicking: false, structural: true });
    await expect(page.locator(
      '.openKeyNav-label:not(.openKeyNav-structural-keylabel)'
    )).toHaveCount(0);
    await expect.poll(() => page.locator(
      '.openKeyNav-structural-keylabel'
    ).count()).toBeGreaterThan(0);
    await expect(structuralStatus).toBeVisible();
    await expectDeepFocus(page, 'clear-filters');

    await page.keyboard.press('KeyK');
    await expect.poll(() => page.evaluate(() => {
      const target = document.querySelector(
        '[data-openkeynav-label]:not(.openKeyNav-label)'
      ) as HTMLElement | null;
      return target ? {
        id: target.id,
        label: target.getAttribute('data-openkeynav-label'),
      } : null;
    })).not.toBeNull();
    const selectedTarget = await page.evaluate(() => {
      const target = document.querySelector(
        '[data-openkeynav-label]:not(.openKeyNav-label)'
      ) as HTMLElement;
      return {
        id: target.id,
        label: target.getAttribute('data-openkeynav-label')!,
      };
    });
    await page.keyboard.type(selectedTarget.label);
    await expect.poll(() => page.evaluate(() => ({
      clicking: (window as any).okn.config.modes.clicking.value,
      structural: (window as any).okn.config.modes.structuralNavigation.value,
    }))).toEqual({ clicking: false, structural: true });
    await expectDeepFocus(page, selectedTarget.id);
    expect(await page.evaluate(() => {
      const state = (window as any).okn.getStructuralNavigationState();
      return state.activeContext.targets.includes(state.target);
    })).toBe(true);

    await focusFixtureTarget(page, 'clear-filters');
    await page.keyboard.press('KeyK');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.clicking.value
    )).toBe(true);
    await page.keyboard.press('KeyQ');
    await expect.poll(() => page.evaluate(() => ({
      clicking: (window as any).okn.config.modes.clicking.value,
      structural: (window as any).okn.config.modes.structuralNavigation.value,
    }))).toEqual({ clicking: false, structural: true });
    await expect(page.locator(
      '.openKeyNav-label:not(.openKeyNav-structural-keylabel)'
    )).toHaveCount(0);
    await expect.poll(() => page.locator(
      '.openKeyNav-structural-keylabel'
    ).count()).toBeGreaterThan(0);
    await expectDeepFocus(page, 'clear-filters');
  });

  test('moves between same-rank headings across different parent headings', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'same-level-current-last');
    await enterStructuralNavigation(page);

    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('Context: Current level-three context');
    await expect(page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    )).toContainText('Heading level: 3.');
    await expect(page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    )).not.toContainText('Previous context:');
    await expect(page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    )).not.toContainText('Next context:');
    await expect(page.locator('.openKeyNav-structural-context-outline'))
      .toHaveAttribute('data-context-name', 'Current level-three context');

    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'same-level-next-first');
    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('Context: Next level-three context');
    await expect(page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    )).toContainText('Heading level: 3.');
    await expect(page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    )).not.toContainText('Previous context:');
    await expect(page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    )).not.toContainText('Next context:');
    await expect(page.locator('.openKeyNav-structural-context-outline'))
      .toHaveAttribute('data-context-name', 'Next level-three context');

    // Broaden to the containing H2 family without letting its final heading
    // range absorb the visible sibling section that follows the authored
    // wrapper.
    await page.keyboard.press('Shift+ArrowUp');
    await expectDeepFocus(page, 'same-level-next-first');
    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('Context: Second heading family');
    await expect(page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    )).toContainText('Heading level: 2.');
    const familyIndicator = page.locator(
      '.openKeyNav-structural-context-outline'
    );
    await expect(familyIndicator)
      .toHaveAttribute('data-context-name', 'Second heading family');
    const familyIndicatorBox = await familyIndicator.boundingBox();
    const familyLastTargetBox = await page.locator(
      '#same-level-next-last'
    ).boundingBox();
    const followingSectionBox = await page.locator(
      '#invalid-semantics'
    ).boundingBox();
    expect(familyIndicatorBox).not.toBeNull();
    expect(familyLastTargetBox).not.toBeNull();
    expect(followingSectionBox).not.toBeNull();
    expect(familyIndicatorBox!.y + familyIndicatorBox!.height)
      .toBeGreaterThan(familyLastTargetBox!.y + familyLastTargetBox!.height);
    expect(familyIndicatorBox!.y + familyIndicatorBox!.height)
      .toBeLessThan(followingSectionBox!.y);

    await page.keyboard.press('Shift+ArrowDown');
    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('Context: Next level-three context');

    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'same-level-current-first');
    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('Context: Current level-three context');

    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'same-level-current-first');
    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('No previous peer context at heading level 3');
  });

  test('keeps Recommendations in the authored H2 horizontal lane', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'product-a');
    await enterStructuralNavigation(page);

    const status = page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    );
    const indicator = page.locator('.openKeyNav-structural-context-outline');

    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'recommendation-a');
    await expect(status).toContainText('Context: Recommendations.');
    await expect(status).toContainText('Heading level: 2.');
    await expect(indicator).toHaveAttribute('data-context-name', 'Recommendations');

    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'native-button');
    await expect(status).toContainText(
      'Context: Native activation and sequential focus.'
    );
    await expect(status).toContainText('Heading level: 2.');
    await expect(indicator).toHaveAttribute(
      'data-context-name',
      'Native activation and sequential focus'
    );

    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'recommendation-a');
    await expect(status).toContainText('Context: Recommendations.');
    await expect(indicator).toHaveAttribute('data-context-name', 'Recommendations');
  });

  test('crosses DOM containers when headings share an authored level', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'native-button');
    await enterStructuralNavigation(page);

    const status = page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    );
    const indicator = page.locator('.openKeyNav-structural-context-outline');
    await expect(status).toContainText(
      'Context: Native activation and sequential focus.'
    );
    await expect(status).toContainText('Heading level: 2.');

    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'recommendation-a');
    await expect(status).toContainText('Context: Recommendations.');
    await expect(status).toContainText('Heading level: 2.');
    await expect(indicator).toHaveAttribute('data-context-name', 'Recommendations');

    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'native-button');
    await expect(status).toContainText(
      'Context: Native activation and sequential focus.'
    );
    await expect(indicator).toHaveAttribute(
      'data-context-name',
      'Native activation and sequential focus'
    );
  });

  test('narrows to the next H3 when the active H2 has no child on the focus path', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'native-button');
    await enterStructuralNavigation(page);

    const status = page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    );
    const indicator = page.locator('.openKeyNav-structural-context-outline');
    await expect(status).toContainText(
      'Context: Native activation and sequential focus.'
    );
    await expect(status).toContainText('Heading level: 2.');

    await page.keyboard.press('Shift+ArrowDown');

    await expectDeepFocus(page, 'same-level-current-first');
    await expect(status).toContainText('Context: Current level-three context.');
    await expect(status).toContainText('Heading level: 3.');
    await expect(indicator).toHaveAttribute(
      'data-context-name',
      'Current level-three context'
    );
  });

  test('narrows from H1 to H2 and then to the next H3', async ({ page }) => {
    await page.evaluate(() => {
      const fixture = document.createElement('div');
      fixture.id = 'heading-level-fixture';
      fixture.innerHTML = `
        <a id="document-intro" href="#intro"><h1>Hi, we're the MIT Visualization Group!</h1></a>
        <div class="research-card">
          <div class="theme-summary">
            <a id="fixture-tools-theme" href="#tools-theme"><h2>Visualization Authoring Tools</h2></a>
            <p>
              <a id="fixture-languages" href="#languages">languages</a>
              <a id="fixture-systems" href="#systems">systems</a>
            </p>
            <a id="fixture-lyra" href="#lyra">Lyra</a>
          </div>
          <div class="latest-publications">
            <h3>Latest &amp; Greatest</h3>
            <a id="fixture-gofish" href="#gofish">GoFish</a>
          </div>
        </div>
      `;
      document.body.prepend(fixture);
    });
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'document-intro');
    await enterStructuralNavigation(page);

    const status = page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    );
    await expect(status).toContainText("Context: Hi, we're the MIT Visualization Group!.");
    await expect(status).toContainText('Heading level: 1.');

    await page.keyboard.press('Shift+ArrowDown');
    await expectDeepFocus(page, 'fixture-tools-theme');
    await expect(status).toContainText('Context: Visualization Authoring Tools.');
    await expect(status).toContainText('Heading level: 2.');
    await expect(status).toContainText(
      'Visualization Authoring Tools, 1 of 4.'
    );

    await page.keyboard.press('Shift+ArrowDown');
    await expectDeepFocus(page, 'fixture-gofish');
    await expect(status).toContainText('Context: Latest & Greatest.');
    await expect(status).toContainText('Heading level: 3.');
  });

  test('prefers context-start Tab over vertical heading chords for the same target', async ({ page }) => {
    await page.evaluate(() => {
      const fixture = document.createElement('div');
      fixture.id = 'context-down-keylabel-fixture';
      fixture.innerHTML = `
        <section aria-labelledby="collision-current-title">
          <h2 id="collision-current-title">Current context</h2>
          <button id="collision-current">Current target</button>
          <button id="collision-intervening">Intervening target</button>
        </section>
        <section aria-labelledby="collision-child-title">
          <h3 id="collision-child-title">Child context</h3>
          <button id="collision-child">Child target</button>
        </section>
      `;
      document.body.prepend(fixture);
    });
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'collision-current');
    await enterStructuralNavigation(page);

    const childLabel = page.locator(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-target="collision-child"]'
    );
    await expect(childLabel).toHaveText('⌥⇥');
    await expect(childLabel).toHaveAttribute(
      'data-openkeynav-keylabel-command',
      'nextContextStart'
    );

    await focusFixtureTarget(page, 'collision-child');
    const parentLabel = page.locator(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-target="collision-current"]'
    );
    await expect(parentLabel).toHaveText('⌥⇧⇥');
    await expect(parentLabel).toHaveAttribute(
      'data-openkeynav-keylabel-command',
      'previousContextStart'
    );
  });

  test('supports an opt-in context outline and follows the screenshot horizontal route', async ({ page }) => {
    await expect(page.locator('#structural-navigation-guide')).toContainText(
      'moves to the previous / next context at the same authored heading level'
    );
    await expect(page.locator('#structural-navigation-guide')).toContainText(
      'moves sequentially using native browser focus'
    );
    await expect(page.locator('#structural-navigation-guide')).toContainText(
      'Down enters the closest available deeper rank'
    );
    await expect(page.locator('#structural-navigation-guide')).toContainText(
      'DOM nesting never supplies a heading rank'
    );
    await expect(page.locator('#structural-navigation-guide')).toContainText(
      'even across different structural parents'
    );
    expect(await page.evaluate(() => {
      const structural = (window as any).okn.config.modesConfig.structuralNavigation;
      const commands = structural.commands;
      return {
        previousTarget: commands.previousTarget,
        nextTarget: commands.nextTarget,
        previousPeer: commands.previousPeerContext,
        nextPeer: commands.nextPeerContext,
        previousSibling: commands.previousSiblingContext,
        nextSibling: commands.nextSiblingContext,
        parent: commands.broadenContext,
        child: commands.narrowContext,
        dismissStatus: structural.status.dismissCommand
      };
    })).toEqual({
      previousTarget: null,
      nextTarget: null,
      previousPeer: null,
      nextPeer: null,
      previousSibling: { key: 'ArrowLeft', shiftKey: true },
      nextSibling: { key: 'ArrowRight', shiftKey: true },
      parent: { key: 'ArrowUp', shiftKey: true },
      child: { key: 'ArrowDown', shiftKey: true },
      dismissStatus: { key: 'Escape', shiftKey: true }
    });
    await expect(page.locator('#structural-navigation-guide')).not.toContainText('F7');
    await expect(page.locator('#structural-navigation-guide')).not.toContainText('F8');

    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'in-stock');
    await enterStructuralNavigation(page);

    await page.keyboard.press('Shift+ArrowUp');
    await expectDeepFocus(page, 'clear-filters');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Context: Catalog');
    const filtersStatusContent = page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    );
    await expect(filtersStatusContent).toContainText('Heading level: 1.');

    await page.keyboard.press('Shift+ArrowDown');
    await expectDeepFocus(page, 'clear-filters');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Context: Filters');
    await expect(filtersStatusContent).toContainText('Heading level: 2.');
    await expect(filtersStatusContent).not.toContainText('Previous context:');
    await expect(filtersStatusContent).not.toContainText('Next context:');
    await expect(filtersStatusContent).not.toContainText('Recommendations');
    await expect(filtersStatusContent).not.toContainText('Same-level contexts');

    const indicator = page.locator('.openKeyNav-structural-context-outline');
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute('aria-hidden', 'true');
    await expect(indicator).not.toHaveAttribute('tabindex', /.+/);
    await expect(indicator).toHaveAttribute('data-context-name', 'Filters');
    const headingLevelTab = page.locator(
      '.openKeyNav-structural-context-heading-level'
    );
    await expect(headingLevelTab).toBeVisible();
    await expect(headingLevelTab).toHaveText('h2');
    await expect(indicator).toHaveAttribute('data-heading-level', '2');
    await expect(indicator).toHaveAttribute('data-heading-tab-position', 'top');
    const filtersBox = await page.locator('#filters').boundingBox();
    const filtersIndicatorBox = await indicator.boundingBox();
    const headingLevelTabBox = await headingLevelTab.boundingBox();
    expect(filtersBox).not.toBeNull();
    expect(filtersIndicatorBox).not.toBeNull();
    expect(headingLevelTabBox).not.toBeNull();
    expect(headingLevelTabBox!.y).toBeLessThan(filtersIndicatorBox!.y);
    expect(filtersIndicatorBox!.x).toBeLessThan(filtersBox!.x);
    expect(filtersIndicatorBox!.y).toBeLessThan(filtersBox!.y);
    expect(filtersIndicatorBox!.width).toBeGreaterThan(filtersBox!.width);
    expect(filtersIndicatorBox!.y + filtersIndicatorBox!.height)
      .toBeGreaterThanOrEqual(Math.min(
        filtersBox!.y + filtersBox!.height,
        page.viewportSize()!.height
      ) - 1);

    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'product-a');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Results');
    await expect(filtersStatusContent).toContainText('Heading level: 2.');
    await expect(filtersStatusContent).not.toContainText('Previous context:');
    await expect(filtersStatusContent).not.toContainText('Next context:');
    await expect(indicator).toHaveAttribute('data-context-name', 'Results');
    await expect(headingLevelTab).toHaveText('h2');

    await page.keyboard.press('Alt+KeyR');
    await expect(indicator).toHaveCount(0);
  });

  test('keeps status concise and visually dismisses it until mode re-entry', async ({ page }) => {
    await enableAndEnter(page);
    await focusFixtureTarget(page, 'native-button');

    const status = page.locator('.openKeyNav-structural-status');
    const content = status.locator('.openKeyNav-status__content');
    const hint = status.locator('.openKeyNav-status__hint');
    const indicator = page.locator('.openKeyNav-structural-context-outline');

    await expect(content).toHaveText(
      'Context: Native activation and sequential focus. ' +
      'Heading level: 2. Run native action, 1 of 3.'
    );
    await expect(content).not.toContainText('Previous context:');
    await expect(content).not.toContainText('Next context:');
    await expect(content).not.toContainText('Search');
    await expect(content).not.toContainText('Filters');
    await expect(content).not.toContainText('Modal scope');
    await expect(content).not.toContainText('Same-level contexts');
    await expect(hint).toHaveText('Shift+Esc to close.');
    await expect(hint).toHaveAttribute('aria-hidden', 'true');
    await expect(indicator).toHaveAttribute(
      'data-context-name',
      'Native activation and sequential focus'
    );

    await page.evaluate(() => {
      (window as any).fixture.resetLogs();
      (window as any).dismissDefaultPrevented = null;
      const observeDismiss = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        (window as any).dismissDefaultPrevented = event.defaultPrevented;
        document.removeEventListener('keydown', observeDismiss, true);
      };
      document.addEventListener('keydown', observeDismiss, true);
      (window as any).dismissStatusIdentity = document.querySelector(
        '.openKeyNav-structural-status'
      );
      (window as any).dismissContextId = (window as any).okn
        .getStructuralNavigationState().activeContext?.id;
      (window as any).dismissIndicatorIdentity = document.querySelector(
        '.openKeyNav-structural-context-outline'
      );
    });
    await page.keyboard.press('Shift+Escape');

    await expectDeepFocus(page, 'native-button');
    await expect(status).toHaveCount(1);
    await expect(status).toHaveClass(/openKeyNav-status--visually-hidden/);
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(content).toHaveText(/^Status closed\./);
    await expect(hint).toHaveCount(0);
    await expect(indicator).toHaveAttribute(
      'data-context-name',
      'Native activation and sequential focus'
    );
    expect(await page.evaluate(() => ({
      active: (window as any).okn.config.modes.structuralNavigation.value,
      dismissed: (window as any).okn.getStructuralNavigationState().statusDismissed,
      sameStatus: (window as any).dismissStatusIdentity === document.querySelector(
        '.openKeyNav-structural-status'
      ),
      sameContextId: (window as any).dismissContextId === (window as any).okn
        .getStructuralNavigationState().activeContext?.id,
      sameIndicator: (window as any).dismissIndicatorIdentity === document.querySelector(
        '.openKeyNav-structural-context-outline'
      )
    }))).toEqual({
      active: true,
      dismissed: true,
      sameStatus: true,
      sameContextId: true,
      sameIndicator: true
    });
    await expect.poll(() => page.evaluate(() => (
      (window as any).dismissDefaultPrevented
    ))).toBe(true);

    // The polite content remains live for assistive technology while the
    // persistent visual surface stays closed.
    await focusFixtureTarget(page, 'product-a');
    await expect(status).toHaveClass(/openKeyNav-status--visually-hidden/);
    await expect(content).toContainText('Context: Results.');
    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'recommendation-a');
    await expect(status).toHaveClass(/openKeyNav-status--visually-hidden/);
    await expect(content).toContainText('Context: Recommendations.');
    await expect(hint).toHaveCount(0);

    expect(await page.evaluate(() => (
      (window as any).okn.enterStructuralNavigation()
    ))).toBe(true);
    await expect(status).toHaveClass(/openKeyNav-status--visually-hidden/);
    expect(await page.evaluate(() => (
      (window as any).okn.getStructuralNavigationState().statusDismissed
    ))).toBe(true);

    await page.evaluate(() => {
      (window as any).fixture.resetLogs();
      (window as any).dismissDefaultPrevented = null;
      const observeDismiss = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        (window as any).dismissDefaultPrevented = event.defaultPrevented;
        document.removeEventListener('keydown', observeDismiss, true);
      };
      document.addEventListener('keydown', observeDismiss, true);
    });
    await page.keyboard.press('Shift+Escape');
    await expectDeepFocus(page, 'recommendation-a');
    await expect.poll(() => page.evaluate(() => (
      (window as any).dismissDefaultPrevented
    ))).toBe(false);
    await expect(status).toHaveClass(/openKeyNav-status--visually-hidden/);

    await page.keyboard.press('Alt+KeyR');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.structuralNavigation.value
    )).toBe(false);
    await expect(status).toHaveCount(0);
    await enterStructuralNavigation(page);
    await expectDeepFocus(page, 'recommendation-a');
    await expect(status).not.toHaveClass(/openKeyNav-status--visually-hidden/);
    await expect(hint).toHaveText('Shift+Esc to close.');
    expect(await page.evaluate(() => (
      (window as any).okn.getStructuralNavigationState().statusDismissed
    ))).toBe(false);

    await page.keyboard.press('Shift+Escape');
    await expect(status).toHaveClass(/openKeyNav-status--visually-hidden/);
    expect(await page.evaluate(() => (
      (window as any).okn.getStructuralNavigationState().statusDismissed
    ))).toBe(true);
  });

  test('leaves bare arrows, Tab, Shift+Tab, Enter, and Space native', async ({ page }) => {
    await enableAndEnter(page);
    await focusFixtureTarget(page, 'native-button');
    await page.evaluate(() => (window as any).fixture.resetLogs());

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await expectDeepFocus(page, 'native-button');
    const bareArrowEvents = await page.evaluate(() => (
      (window as any).fixture.keyEvents.filter((event: any) => (
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowUp'
      ))
    ));
    expect(bareArrowEvents).toHaveLength(3);
    expect(bareArrowEvents.every(
      (event: any) => event.defaultPrevented === false
    )).toBe(true);

    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(
      () => (window as any).fixture.counters.buttonActivations
    )).toBe(1);
    await expectDeepFocus(page, 'native-button');

    // Reach the checkbox through native sequential focus, then use Space.
    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'native-checkbox');
    await page.keyboard.press('Space');
    await expect(page.locator('#native-checkbox')).toBeChecked();
    await expect.poll(() => page.evaluate(
      () => (window as any).fixture.counters.checkboxChanges
    )).toBe(1);

    // Native Tab continues from the mode-reached checkbox and Shift+Tab reverses it.
    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'native-link');

    await page.keyboard.press('Shift+Tab');
    await expectDeepFocus(page, 'native-checkbox');

    // Link activation remains native as well. Test it after the sequential
    // navigation assertion because fragment navigation changes the browser's
    // sequential-focus starting point.
    await focusFixtureTarget(page, 'native-link');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(
      () => (window as any).fixture.counters.linkActivations
    )).toBe(1);
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#native-link-destination');

    const tabEvents = await page.evaluate(() => (
      (window as any).fixture.keyEvents.filter((event: any) => event.key === 'Tab')
    ));
    expect(tabEvents).toHaveLength(3);
    expect(tabEvents.every((event: any) => event.defaultPrevented === false)).toBe(true);
  });

  test('discovers and focuses a rendered offscreen target without a scroll loop', async ({ page }) => {
    await enableAndEnter(page);
    await focusFixtureTarget(page, 'offscreen-start');
    await page.evaluate(() => (window as any).fixture.resetLogs());

    const before = await page.evaluate(() => ({
      scrollY,
      targetTop: document.getElementById('offscreen-target')!.getBoundingClientRect().top,
      viewportHeight: innerHeight
    }));
    expect(before.targetTop).toBeGreaterThan(before.viewportHeight);

    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'offscreen-target');
    await expect(page.locator('#offscreen-target')).toBeInViewport();
    expect(await page.locator('#offscreen-target').evaluate(element => element.matches(':focus-visible'))).toBe(true);

    const after = await page.evaluate(() => ({
      scrollY,
      explicitScrollCalls: (window as any).fixture.counters.scrollIntoViewCalls
    }));
    expect(after.scrollY).toBeGreaterThan(before.scrollY);
    expect(after.explicitScrollCalls).toBeLessThanOrEqual(1);
  });

  test('respects widget-owned keys, supports Alt override, and keeps a reliable exit', async ({ page }) => {
    await enableOpenKeyNav(page);
    await page.locator('#widget-text').focus();
    await page.locator('#widget-text').evaluate((input: HTMLInputElement) => input.setSelectionRange(1, 1));
    expect(await page.evaluate(() => (
      (window as any).okn.enterStructuralNavigation()
    ))).toBe(true);
    const structuralStatus = page.locator('.openKeyNav-structural-status');
    const structuralHint = structuralStatus.locator('.openKeyNav-status__hint');
    await expect(structuralStatus).toBeVisible();
    await expect(page.locator(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-command="previousContextStart"]'
    )).toHaveText('⌥⇧⇥');
    await expect(page.locator(
      '.openKeyNav-structural-keylabel' +
      '[data-openkeynav-keylabel-command="nextContextStart"]'
    )).toHaveText('⌥⇥');
    const overrideSymbols = page.locator(
      '.openKeyNav-structural-keylabel ' +
      '[data-openkeynav-keylabel-modifier="alt"]'
    );
    await expect.poll(() => overrideSymbols.count()).toBeGreaterThan(0);
    expect(await overrideSymbols.evaluateAll(symbols => symbols.every(
      symbol => !symbol.hasAttribute('data-openkeynav-keylabel-pressed')
    ))).toBe(true);
    await page.keyboard.down('Alt');
    await expect.poll(() => overrideSymbols.evaluateAll(symbols => (
      symbols.length > 0 && symbols.every(symbol => (
        symbol.getAttribute('data-openkeynav-keylabel-pressed') === 'true'
      ))
    ))).toBe(true);
    await page.keyboard.up('Alt');
    await expect.poll(() => overrideSymbols.evaluateAll(symbols => (
      symbols.length > 0 && symbols.every(symbol => (
        !symbol.hasAttribute('data-openkeynav-keylabel-pressed')
      ))
    ))).toBe(true);
    await page.evaluate(() => (window as any).fixture.resetLogs());
    const inputStatusText = await structuralStatus.locator(
      '.openKeyNav-status__content'
    ).textContent();
    await page.keyboard.press('Shift+Escape');
    await expectDeepFocus(page, 'widget-text');
    await expect(structuralStatus).not.toHaveClass(
      /openKeyNav-status--visually-hidden/
    );
    await expect(structuralHint).toHaveText('Shift+Esc to close.');
    expect(await structuralStatus.locator(
      '.openKeyNav-status__content'
    ).textContent()).toBe(inputStatusText);
    expect(await page.evaluate(() => (
      (window as any).okn.getStructuralNavigationState().statusDismissed
    ))).toBe(false);
    await expect.poll(() => page.evaluate(() => (
      (window as any).fixture.keyEvents.at(-1)?.defaultPrevented
    ))).toBe(false);
    await page.keyboard.press('ArrowRight');
    await expectDeepFocus(page, 'widget-text');
    expect(await page.locator('#widget-text').evaluate(
      (input: HTMLInputElement) => input.selectionStart
    )).toBe(2);

    // Shift+Right remains owned by the editor. Alt deliberately overrides that
    // ownership and invokes the bound next-horizontal context command. Keep Alt
    // physically held for the next command: once focus leaves the editor, the
    // same chord must continue through an ordinary sibling context.
    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'widget-text');
    await page.keyboard.down('Alt');
    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'modal-opener');
    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'shadow-first');
    await page.keyboard.up('Alt');

    await page.locator('#widget-range').focus();
    await page.keyboard.press('ArrowRight');
    await expectDeepFocus(page, 'widget-range');
    await expect(page.locator('#widget-range')).toHaveValue('6');

    await page.locator('#tab-one').focus();
    await page.keyboard.press('ArrowRight');
    await expectDeepFocus(page, 'tab-two');
    await expect(page.locator('#tab-two')).toHaveAttribute('aria-selected', 'true');

    await page.locator('#fixture-combobox').focus();
    await page.keyboard.press('Escape');
    await expect.poll(() => page.evaluate(
      () => (window as any).fixture.counters.comboboxEscapes
    )).toBe(1);
    await expect(page.locator('#fixture-combobox')).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(
      () => (window as any).okn.config.modes.structuralNavigation.value
    )).toBe(true);
    await expect(structuralStatus).not.toHaveClass(
      /openKeyNav-status--visually-hidden/
    );

    await page.locator('#fixture-combobox').evaluate(element => {
      element.setAttribute('aria-expanded', 'true');
    });
    await page.evaluate(() => (window as any).fixture.resetLogs());
    await page.keyboard.press('Shift+Escape');
    await expect.poll(() => page.evaluate(
      () => (window as any).fixture.counters.comboboxEscapes
    )).toBe(2);
    await expectDeepFocus(page, 'fixture-combobox');
    await expect(page.locator('#fixture-combobox')).toHaveAttribute('aria-expanded', 'false');
    await expect(structuralStatus).not.toHaveClass(
      /openKeyNav-status--visually-hidden/
    );
    await expect(structuralHint).toHaveText('Shift+Esc to close.');
    expect(await page.evaluate(() => ({
      active: (window as any).okn.config.modes.structuralNavigation.value,
      dismissed: (window as any).okn.getStructuralNavigationState().statusDismissed
    }))).toEqual({ active: true, dismissed: false });
    await expect.poll(() => page.evaluate(() => (
      (window as any).fixture.keyEvents.at(-1)?.defaultPrevented
    ))).toBe(false);

    await page.keyboard.press('Alt+KeyR');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.structuralNavigation.value
    )).toBe(false);
    await expectDeepFocus(page, 'fixture-combobox');
    await expect(page.locator('.openKeyNav-structural-status')).toHaveCount(0);

    await page.keyboard.press('ArrowRight');
    await expectDeepFocus(page, 'fixture-combobox');
  });

  test('confines navigation to the topmost native modal and restores document scope', async ({ page }) => {
    await enableAndEnter(page);
    await focusFixtureTarget(page, 'modal-opener');

    await page.evaluate(() => (window as any).fixture.openModal());
    await expect(page.locator('#fixture-dialog')).toHaveJSProperty('open', true);
    await expectDeepFocus(page, 'modal-first');
    const indicator = page.locator('.openKeyNav-structural-context-outline');
    await expect(indicator).toBeVisible();
    await expect.poll(() => indicator.evaluate(
      element => element.parentElement?.id
    )).toBe('fixture-dialog');
    const modalBox = await page.locator('#fixture-dialog').boundingBox();
    const modalIndicatorBox = await indicator.boundingBox();
    expect(modalBox).not.toBeNull();
    expect(modalIndicatorBox).not.toBeNull();
    expect(Math.min(
      modalBox!.x + modalBox!.width,
      modalIndicatorBox!.x + modalIndicatorBox!.width
    ) - Math.max(modalBox!.x, modalIndicatorBox!.x)).toBeGreaterThan(0);
    expect(Math.min(
      modalBox!.y + modalBox!.height,
      modalIndicatorBox!.y + modalIndicatorBox!.height
    ) - Math.max(modalBox!.y, modalIndicatorBox!.y)).toBeGreaterThan(0);

    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'modal-last');
    await page.keyboard.press('Shift+Tab');
    await expectDeepFocus(page, 'modal-first');

    // The active/focused modal wins even when top-layer order differs from DOM
    // order (the newly opened dialog is inserted before the existing one).
    await page.evaluate(() => {
      const stacked = document.createElement('dialog');
      stacked.id = 'stacked-dialog';
      stacked.innerHTML = `
        <button id="stacked-first" type="button">Stacked first</button>
        <button id="stacked-last" type="button">Stacked last</button>
      `;
      document.getElementById('fixture-dialog')!.before(stacked);
      stacked.showModal();
      document.getElementById('stacked-first')!.focus();
    });
    await expectDeepFocus(page, 'stacked-first');
    await expect.poll(() => indicator.evaluate(
      element => element.parentElement?.id
    )).toBe('stacked-dialog');
    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'stacked-last');
    await page.evaluate(() => {
      (document.getElementById('stacked-dialog') as HTMLDialogElement).close();
      document.getElementById('stacked-dialog')!.remove();
      document.getElementById('modal-last')!.focus();
    });
    await expectDeepFocus(page, 'modal-last');

    await page.evaluate(() => (window as any).fixture.closeModal());
    await expect(page.locator('#fixture-dialog')).toHaveJSProperty('open', false);
    await expectDeepFocus(page, 'modal-opener');
    await expect.poll(() => indicator.evaluate(
      element => element.parentElement?.tagName
    )).toBe('BODY');
    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'modal-background');
  });

  test('honors an application-supplied active focus root', async ({ page }) => {
    await enableOpenKeyNav(page);
    await page.evaluate(() => {
      (window as any).okn.config.modesConfig.structuralNavigation.activeRoot =
        () => document.getElementById('dynamic-scope');
    });
    await focusFixtureTarget(page, 'dynamic-a');
    await enterStructuralNavigation(page);

    expect(await page.evaluate(() => (
      (window as any).okn.getStructuralNavigationState().targets
        .map((target: HTMLElement) => target.id)
    ))).toEqual(['dynamic-a', 'dynamic-c']);

    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'dynamic-c');
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'dynamic-c');

    // A page script may place focus outside the supplied scope. Structural
    // navigation leaves that focus alone, then deterministically re-enters.
    await focusFixtureTarget(page, 'modal-background');
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'dynamic-a');
  });

  test('follows deep open-shadow focus and treats an iframe as one atomic target', async ({ page }) => {
    await enableAndEnter(page);

    await page.evaluate(() => (window as any).fixture.focusOpenShadow('shadow-first'));
    await expectDeepFocus(page, 'shadow-first');
    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'shadow-last');
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('open-shadow-host');
    expect(await page.evaluate(() => (
      document.getElementById('open-shadow-host') as HTMLElement
    ).shadowRoot?.activeElement?.id)).toBe('shadow-last');

    await focusFixtureTarget(page, 'before-frame');
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'atomic-frame');
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('atomic-frame');
    expect(await page.evaluate(() => {
      const frame = document.getElementById('atomic-frame') as HTMLIFrameElement;
      return frame.contentDocument?.activeElement?.id || frame.contentDocument?.activeElement?.tagName;
    })).not.toBe('frame-inner');
    expect(await page.locator('#opaque-frame').evaluate(frame => (frame as HTMLIFrameElement).contentDocument)).toBeNull();
  });

  test('refreshes lazily for dynamic targets without autonomous focus movement', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'dynamic-a');
    await enterStructuralNavigation(page);
    await page.evaluate(() => (window as any).fixture.resetLogs());

    await page.evaluate(() => (window as any).fixture.insertDynamicTarget());
    await expectDeepFocus(page, 'dynamic-a');
    expect(await page.evaluate(() => (window as any).fixture.focusEvents)).toEqual([]);

    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'dynamic-b');

    await page.evaluate(() => (window as any).fixture.removeFocusedTarget());
    await expect.poll(() => page.evaluate(() => document.activeElement === document.body)).toBe(true);

    // With no known target focused, next re-enters at the first live target.
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'dynamic-a');

    await page.evaluate(() => (window as any).fixture.setDynamicADisabled(true));
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'dynamic-c');

    // Re-enabling and reordering are reflected on the next command.
    await page.evaluate(() => {
      const scope = document.getElementById('dynamic-scope')!;
      const first = document.getElementById('dynamic-a') as HTMLButtonElement;
      first.disabled = false;
      scope.appendChild(first);
    });
    await expectDeepFocus(page, 'dynamic-c');
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'dynamic-a');

    // Hidden content drops out, then returns in the new composed order.
    await page.evaluate(() => {
      document.getElementById('dynamic-c')!.hidden = true;
    });
    await structuralNavigate(page, 'previousTarget');
    await expectDeepFocus(page, 'dynamic-a');
    await page.evaluate(() => {
      document.getElementById('dynamic-c')!.hidden = false;
    });
    await structuralNavigate(page, 'previousTarget');
    await expectDeepFocus(page, 'dynamic-c');

    // Label and heading changes rebuild the context without moving focus.
    await page.evaluate(() => {
      document.getElementById('dynamic-title')!.textContent = 'Dynamic targets updated';
    });
    await expectDeepFocus(page, 'dynamic-c');
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'dynamic-a');
    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('Dynamic targets updated');

    // A closed details element exposes only its summary; opening and closing it
    // updates the live target inventory without an autonomous traversal.
    await page.evaluate(() => {
      const details = document.createElement('details');
      details.id = 'dynamic-details';
      details.innerHTML = `
        <summary id="dynamic-summary">Dynamic details</summary>
        <button id="dynamic-details-target" type="button">Details target</button>
      `;
      document.getElementById('dynamic-scope')!.appendChild(details);
    });
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'dynamic-summary');
    await page.evaluate(() => {
      (document.getElementById('dynamic-details') as HTMLDetailsElement).open = true;
    });
    await expectDeepFocus(page, 'dynamic-summary');
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'dynamic-details-target');
    await page.locator('#dynamic-summary').focus();
    await page.evaluate(() => {
      (document.getElementById('dynamic-details') as HTMLDetailsElement).open = false;
    });
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'dynamic-summary');
    expect(await page.evaluate(() => (
      (window as any).okn.getStructuralNavigationState().targets
        .map((target: HTMLElement) => target.id)
    ))).not.toContain('dynamic-details-target');
  });

  test('keeps native targets inside invalid hidden semantics without using those semantics', async ({ page }) => {
    await enableAndEnter(page);

    const state = await page.evaluate(() => {
      const structuralState = (window as any).okn.getStructuralNavigationState();
      const hiddenTarget = document.getElementById('aria-hidden-target');
      const nextHeadingContext = Array.from(structuralState.model.contexts.values())
        .find((context: any) => context.name === 'Next level-three context') as any;
      return {
        targetIds: structuralState.targets.map((target: HTMLElement) => target.id),
        contextBoundaryIds: Array.from(structuralState.model.contexts.values())
          .map((context: any) => context.boundary?.id)
          .filter(Boolean),
        hiddenDirectIsRoot:
          structuralState.model.directContextByTarget.get(hiddenTarget) ===
          structuralState.model.rootContext,
        nextHeadingTargetIds: nextHeadingContext.targets
          .map((target: HTMLElement) => target.id),
        nextHeadingVisualIds: nextHeadingContext.visualElements
          .map((element: HTMLElement) => element.id)
          .filter(Boolean)
      };
    });

    expect(state.targetIds).toContain('aria-hidden-target');
    expect(state.contextBoundaryIds).not.toContain('invalid-semantics');
    expect(state.targetIds).not.toContain('closed-shadow-button');
    expect(state.hiddenDirectIsRoot).toBe(true);
    expect(state.nextHeadingTargetIds).not.toContain('aria-hidden-target');
    expect(state.nextHeadingVisualIds).not.toContain('invalid-semantics');
    expect(state.nextHeadingVisualIds).not.toContain('aria-hidden-target');

    await focusFixtureTarget(page, 'aria-hidden-target');
    const content = page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    );
    const indicator = page.locator('.openKeyNav-structural-context-outline');
    await expect(content).toContainText('Context: Document.');
    await expect(content).not.toContainText('Heading level:');
    await expect(content).not.toContainText('Context depth:');
    await expect(indicator).toHaveAttribute('data-context-name', 'Document');
    const indicatorBox = await indicator.boundingBox();
    expect(indicatorBox).not.toBeNull();
    expect(indicatorBox!.x).toBe(0);
    expect(indicatorBox!.y).toBe(0);
    expect(indicatorBox!.width).toBe(page.viewportSize()!.width);
    expect(indicatorBox!.height).toBe(page.viewportSize()!.height);
  });

  test('accepts redirected final focus as authoritative', async ({ page }) => {
    await enableAndEnter(page);
    await focusFixtureTarget(page, 'redirect-source');
    await page.evaluate(() => (window as any).fixture.resetLogs());

    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'redirect-final');

    const focusEvents = await page.evaluate(() => (window as any).fixture.focusEvents);
    expect(focusEvents).toContain('redirect-requested');
    expect(focusEvents).toContain('redirect-final');
    expect(focusEvents.indexOf('redirect-requested')).toBeLessThan(focusEvents.indexOf('redirect-final'));
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Redirect final');
  });

  test('cycles supplied typed contexts without duplicating or moving the target', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'typed-current');
    await enterStructuralNavigation(page);
    const nextTypedContext = async () => {
      await structuralNavigate(page, 'nextPeerContext');
    };
    await page.evaluate(() => {
      (window as any).typedTargetIdentity = document.getElementById('typed-current');
    });

    const typedStatusContent = page.locator(
      '.openKeyNav-structural-status .openKeyNav-status__content'
    );
    await expect(typedStatusContent).toContainText('Context: Typed workspace.');
    await expect(typedStatusContent).toContainText('Heading level: 2.');
    await expect(typedStatusContent).not.toContainText('Underlying heading level:');
    await expect(typedStatusContent).toContainText('2 alternate routes available.');
    await expect(typedStatusContent).not.toContainText('Typed contexts:');
    await nextTypedContext();
    await expectDeepFocus(page, 'typed-current');
    await expect(typedStatusContent).toContainText('Typed context: Action row.');
    await expect(typedStatusContent).toContainText('Underlying heading level: 2.');

    await structuralNavigate(page, 'previousTarget');
    await expectDeepFocus(page, 'row-before');
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'typed-current');

    await nextTypedContext();
    await expectDeepFocus(page, 'typed-current');
    await expect(typedStatusContent).toContainText('Typed context: Review column.');
    await expect(typedStatusContent).toContainText('Underlying heading level: 2.');
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'column-after');
    await structuralNavigate(page, 'previousTarget');
    await expectDeepFocus(page, 'typed-current');

    // The ring wraps from the final supplied context back to structural routing.
    await nextTypedContext();
    await expectDeepFocus(page, 'typed-current');
    await expect(typedStatusContent).toContainText('Context: Typed workspace.');
    await expect(typedStatusContent).toContainText('Heading level: 2.');
    await expect(typedStatusContent).not.toContainText('Underlying heading level:');
    expect(await page.evaluate(() => (
      (window as any).typedTargetIdentity === document.getElementById('typed-current')
    ))).toBe(true);
    await expect(page.locator('#typed-current')).toHaveCount(1);

    // Removing a live membership invalidates the typed route without moving
    // focus; the remaining applicable peer becomes the next ring entry.
    await nextTypedContext();
    await expect(typedStatusContent).toContainText('Typed context: Action row.');
    await expect(typedStatusContent).toContainText('Underlying heading level: 2.');
    await page.evaluate(() => {
      const structural = (window as any).okn.config.modesConfig.structuralNavigation;
      structural.typedContexts[0].targets = () => [
        document.getElementById('row-before'),
        document.getElementById('row-after')
      ];
      (window as any).okn.invalidateStructuralNavigation();
    });
    await expectDeepFocus(page, 'typed-current');
    await nextTypedContext();
    await expectDeepFocus(page, 'typed-current');
    await expect(typedStatusContent).toContainText('Typed context: Review column.');
    await expect(typedStatusContent).toContainText('Underlying heading level: 2.');
    await expect(typedStatusContent).toContainText('1 alternate route available.');

    // The default Shift+Right command always traverses the structural tree,
    // even while an explicit typed route is active.
    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'offscreen-start');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Offscreen targets');
  });

  test('status is polite and teardown removes mode state without moving focus', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'native-button');
    await enterStructuralNavigation(page);

    const status = page.locator('.openKeyNav-structural-status');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveAttribute('aria-live', 'polite');

    await page.keyboard.press('Alt+KeyR');
    await expectDeepFocus(page, 'native-button');
    await expect(status).toHaveCount(0);

    // Re-entry creates one active handler. A repeated keydown is processed once
    // per browser event, with no duplicate listener moves.
    await enterStructuralNavigation(page);
    await focusFixtureTarget(page, 'clear-filters');
    await page.evaluate(() => (window as any).fixture.resetLogs());
    await page.keyboard.down('Shift');
    await page.keyboard.down('ArrowRight');
    await expectDeepFocus(page, 'product-a');
    await page.keyboard.down('ArrowRight');
    await expectDeepFocus(page, 'recommendation-a');
    await page.keyboard.up('ArrowRight');
    await page.keyboard.up('Shift');
    const productFocusCount = await page.evaluate(() => (
      (window as any).fixture.focusEvents.filter((id: string) => id === 'product-a').length
    ));
    const recommendationFocusCount = await page.evaluate(() => (
      (window as any).fixture.focusEvents.filter((id: string) => id === 'recommendation-a').length
    ));
    expect(productFocusCount).toBe(1);
    expect(recommendationFocusCount).toBe(1);

    // Disabling all of OpenKeyNav tears down both the persistent structural
    // layer and a temporary foreground mode while preserving focus.
    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'product-a');
    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'clear-filters');
    await page.keyboard.press('KeyK');
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.clicking.value
    )).toBe(true);
    await expect.poll(() => page.locator('.openKeyNav-label').count())
      .toBeGreaterThan(0);
    await page.keyboard.press('Shift+KeyO');
    await expect.poll(() => page.evaluate(() => (window as any).okn.meta.enabled.value)).toBe(false);
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.structuralNavigation.value
    )).toBe(false);
    expect(await page.evaluate(() => ({
      clicking: (window as any).okn.config.modes.clicking.value,
      moving: (window as any).okn.config.modes.moving.value,
      menu: (window as any).okn.config.modes.menu.value,
    }))).toEqual({ clicking: false, moving: false, menu: false });
    await expectDeepFocus(page, 'clear-filters');
    await expect(page.locator('.openKeyNav-structural-status')).toHaveCount(0);
    await expect(page.locator('.openKeyNav-label')).toHaveCount(0);

    await page.evaluate(() => (window as any).fixture.insertDynamicTarget());
    await page.keyboard.press('ArrowRight');
    await expectDeepFocus(page, 'clear-filters');
  });
});
