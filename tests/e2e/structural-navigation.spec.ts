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

  test('routes real focus through hierarchy, boundaries, broaden/narrow, and horizontal contexts', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'in-stock');
    await page.evaluate(() => (window as any).fixture.resetLogs());

    await enterStructuralNavigation(page);

    // Activation and context-only changes retain the meaningful page focus.
    await expectDeepFocus(page, 'in-stock');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Availability');
    expect(await page.evaluate(() => (window as any).fixture.focusEvents)).toEqual([]);

    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'preorder');

    // Native Tab crosses the context boundary; Shift+Tab reverses it.
    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'product-a');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Results');
    await page.keyboard.press('Shift+Tab');
    await expectDeepFocus(page, 'preorder');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Availability');

    await page.keyboard.press('Shift+ArrowUp');
    await expectDeepFocus(page, 'preorder');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Filters');

    await page.keyboard.press('Shift+ArrowDown');
    await expectDeepFocus(page, 'preorder');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Availability');

    // Shift+Left/Right traverses the active heading level and always enters the
    // destination context's first focus stop.
    await page.keyboard.press('Shift+ArrowUp');
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
    await page.keyboard.press('Shift+ArrowUp');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Catalog');
    await page.keyboard.press('Tab');
    await expectDeepFocus(page, 'product-a');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Catalog');

    const focusEvents = await page.evaluate(() => (window as any).fixture.focusEvents);
    const blurEvents = await page.evaluate(() => (window as any).fixture.blurEvents);
    expect(focusEvents).toContain('preorder');
    expect(focusEvents).toContain('product-a');
    expect(blurEvents).toContain('in-stock');
  });

  test('moves between same-rank headings across different parent headings', async ({ page }) => {
    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'same-level-current-last');
    await enterStructuralNavigation(page);

    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('Context: Current level-three context');
    await expect(page.locator('.openKeyNav-structural-context-outline'))
      .toHaveAttribute('data-context-name', 'Current level-three context');

    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'same-level-next-first');
    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('Context: Next level-three context');
    await expect(page.locator('.openKeyNav-structural-context-outline'))
      .toHaveAttribute('data-context-name', 'Next level-three context');

    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'same-level-current-first');
    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('Context: Current level-three context');

    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'same-level-current-first');
    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('No previous context at heading level 3');
  });

  test('outlines the active context and follows the screenshot horizontal route', async ({ page }) => {
    await expect(page.locator('#structural-navigation-guide')).toContainText(
      'moves to the previous / next context at the same heading level'
    );
    await expect(page.locator('#structural-navigation-guide')).toContainText(
      'moves sequentially using native browser focus'
    );
    expect(await page.evaluate(() => {
      const commands = (window as any).okn.config.modesConfig.structuralNavigation.commands;
      return {
        previousTarget: commands.previousTarget,
        nextTarget: commands.nextTarget,
        previousSibling: commands.previousSiblingContext,
        nextSibling: commands.nextSiblingContext,
        parent: commands.broadenContext,
        child: commands.narrowContext
      };
    })).toEqual({
      previousTarget: null,
      nextTarget: null,
      previousSibling: { key: 'ArrowLeft', shiftKey: true },
      nextSibling: { key: 'ArrowRight', shiftKey: true },
      parent: { key: 'ArrowUp', shiftKey: true },
      child: { key: 'ArrowDown', shiftKey: true }
    });

    await enableOpenKeyNav(page);
    await focusFixtureTarget(page, 'in-stock');
    await enterStructuralNavigation(page);

    await page.keyboard.press('Shift+ArrowUp');
    await expectDeepFocus(page, 'in-stock');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Context: Filters');
    await expect(page.locator('.openKeyNav-structural-status'))
      .toContainText('Same-level contexts (heading level 2)');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Results');

    const indicator = page.locator('.openKeyNav-structural-context-outline');
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute('aria-hidden', 'true');
    await expect(indicator).not.toHaveAttribute('tabindex', /.+/);
    await expect(indicator).toHaveAttribute('data-context-name', 'Filters');
    const filtersBox = await page.locator('#filters').boundingBox();
    const filtersIndicatorBox = await indicator.boundingBox();
    expect(filtersBox).not.toBeNull();
    expect(filtersIndicatorBox).not.toBeNull();
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
    await expect(indicator).toHaveAttribute('data-context-name', 'Results');

    await page.keyboard.press('Alt+KeyR');
    await expect(indicator).toHaveCount(0);
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
    await expect(page.locator('.openKeyNav-structural-status')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expectDeepFocus(page, 'widget-text');
    expect(await page.locator('#widget-text').evaluate(
      (input: HTMLInputElement) => input.selectionStart
    )).toBe(2);

    // Shift+Right remains owned by the editor. Alt deliberately overrides that
    // ownership and invokes the bound next-horizontal context command.
    await page.keyboard.press('Shift+ArrowRight');
    await expectDeepFocus(page, 'widget-text');
    await page.keyboard.press('Alt+Shift+ArrowRight');
    await expectDeepFocus(page, 'modal-opener');

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
      return {
        targetIds: structuralState.targets.map((target: HTMLElement) => target.id),
        contextBoundaryIds: Array.from(structuralState.model.contexts.values())
          .map((context: any) => context.boundary?.id)
          .filter(Boolean)
      };
    });

    expect(state.targetIds).toContain('aria-hidden-target');
    expect(state.contextBoundaryIds).not.toContain('invalid-semantics');
    expect(state.targetIds).not.toContain('closed-shadow-button');
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
      await page.keyboard.press('F8');
    };
    await page.evaluate(() => {
      (window as any).typedTargetIdentity = document.getElementById('typed-current');
    });

    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Typed workspace');
    await nextTypedContext();
    await expectDeepFocus(page, 'typed-current');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Action row');

    await structuralNavigate(page, 'previousTarget');
    await expectDeepFocus(page, 'row-before');
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'typed-current');

    await nextTypedContext();
    await expectDeepFocus(page, 'typed-current');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Review column');
    await structuralNavigate(page, 'nextTarget');
    await expectDeepFocus(page, 'column-after');
    await structuralNavigate(page, 'previousTarget');
    await expectDeepFocus(page, 'typed-current');

    // The ring wraps from the final supplied context back to structural routing.
    await nextTypedContext();
    await expectDeepFocus(page, 'typed-current');
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Typed workspace');
    expect(await page.evaluate(() => (
      (window as any).typedTargetIdentity === document.getElementById('typed-current')
    ))).toBe(true);
    await expect(page.locator('#typed-current')).toHaveCount(1);

    // Removing a live membership invalidates the typed route without moving
    // focus; the remaining applicable peer becomes the next ring entry.
    await nextTypedContext();
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Action row');
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
    await expect(page.locator('.openKeyNav-structural-status')).toContainText('Review column');

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

    // Disabling all of OpenKeyNav tears the structural mode down and preserves focus.
    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'product-a');
    await page.keyboard.press('Shift+ArrowLeft');
    await expectDeepFocus(page, 'clear-filters');
    await page.keyboard.press('Shift+KeyO');
    await expect.poll(() => page.evaluate(() => (window as any).okn.meta.enabled.value)).toBe(false);
    await expect.poll(() => page.evaluate(
      () => (window as any).okn.config.modes.structuralNavigation.value
    )).toBe(false);
    await expectDeepFocus(page, 'clear-filters');
    await expect(page.locator('.openKeyNav-structural-status')).toHaveCount(0);

    await page.evaluate(() => (window as any).fixture.insertDynamicTarget());
    await page.keyboard.press('ArrowRight');
    await expectDeepFocus(page, 'clear-filters');
  });
});
