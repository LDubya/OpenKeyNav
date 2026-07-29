# Testing Guide for OpenKeyNav

This document covers the testing strategy for OpenKeyNav, including unit tests (Vitest + jsdom) and end-to-end tests (Playwright).

## Overview

OpenKeyNav has two layers of testing:

1. **Unit Tests** (jsdom) - Fast, logic-focused tests for pure functions, state management, and DOM utilities
2. **E2E Tests** (Playwright) - Visual verification in a real browser for overlay positioning, keyboard modes, and interactions

**Current Test Coverage: 68 tests total**
- 59 unit tests (Vitest + jsdom)
- 9 E2E tests (Playwright + Chromium)

## Prerequisites

- Node.js 18+ (use `nvm use` to switch to the version in `.nvmrc`)
- npm 9+

## Installation

```bash
# Install all dependencies including test tools
npm install

# Install Playwright browsers (only needed for E2E tests)
npx playwright install chromium
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run in watch mode (default for development)
npm run test

# Run once and exit (for CI/scripts)
npm run test:ci

# Run with coverage report
npm run test:coverage
```

**What's tested:**
- Signal reactivity (`src/signals.js`) - 1 test
- Keyboard shortcut button rendering (`src/keyButton.js`) - 2 tests
- Label generation and filtering (`src/keylabels.js`) - 2 tests
- **Element tabbability heuristics (`src/isTabbable.js`) - 48 tests**
  - Basic visibility checks (display, visibility, size)
  - Tabindex handling (positive, zero, negative)
  - Anchor validation (href requirement, ARIA roles)
  - Native interactive elements (button, input, select, textarea, summary)
  - ARIA roles and contenteditable
  - Details/summary handling (open/closed states)
  - Click event detection (onclick attribute, event listeners)
  - Viewport and overflow scrolling
  - Inert elements and containers
  - Disabled elements, hidden attributes, aria-hidden
  - SVG and shadow DOM compatibility
  - Edge cases (opacity:0, pointer-events:none)
- Overlay cleanup and mode resets (`removeOverlays`) - 2 tests
- Accessibility flagging (`flagAsInaccessible`) - 1 test
- Overlay positioning logic (`updateOverlayPosition`) - 3 tests

**Total Unit Tests: 59**

**Limitations of jsdom:**
- No real layout engine (getBoundingClientRect returns 0s unless mocked)
- No actual drag-and-drop
- No CSS rendering or z-index stacking
- Limited scrolling/viewport simulation

Tests stub layout-dependent methods to remain deterministic.

### E2E Tests (Playwright)

```bash
# Run headless (default)
npm run test:e2e

# Run with visible browser (watch mode)
npm run test:e2e:headed
```

**What's tested:**

- Real overlay positioning and keyboard commands in Chromium
- Click Mode labels, nested targets, cleanup, and the published diagnostic behavior
- The enable-time release guard for the dormant page-wide audit UI
- Heading, scrolling, Move Mode, menu, and lifecycle behavior
- Structural Navigation commands, focus routing, context changes, and interaction with other modes
- `debug.keyboardAccessible: false`, which keeps regular Click Mode labels while suppressing diagnostic warning styling and tooltips

Screenshots and other artifacts are saved to `artifacts/`. The Playwright specs are the source of truth for current artifact names and test coverage.

### Run All Tests

```bash
# Unit tests + E2E tests
npm run test:ci && npm run test:e2e
```

## Click Mode diagnostics

`config.debug.keyboardAccessible` controls the diagnostic treatment applied while Click Mode discovers targets.

### Diagnostics enabled (default)
**Configuration:** `debug.keyboardAccessible: true`
**Demo:** `demo/demo.html`

When Click Mode's heuristic identifies a likely mouse-clickable target that cannot receive focus, `flagAsInaccessible()` adds the `.openKeyNav-inaccessible` class, a reason attribute, warning outline styling, and hover details to the target and its regular label. These results are development guidance and still require manual accessibility testing.

### Diagnostics disabled
**Configuration:** `debug.keyboardAccessible: false`
**Demo:** `demo/productiondemo.html`

Click Mode uses the same candidate and label flow while suppressing the diagnostic classes, reason attributes, outlines, and tooltips.

### Switching Modes

```javascript
// Enable debug mode
const okn = new OpenKeyNav();
okn.init({
  debug: {
    keyboardAccessible: true  // Debug mode
  }
});

// Enable production mode
const okn = new OpenKeyNav();
okn.init({
  debug: {
    keyboardAccessible: false  // Production mode
  }
});
```

The default is `true`. Set it to `false` when the diagnostic presentation is not appropriate for the deployment.

## Test File Organization

```
tests/
├── e2e/                    # Playwright browser tests
│   └── openkeynav.spec.ts
├── signals.test.js         # Unit: reactivity
├── keyButton.test.js       # Unit: UI components
├── keylabels.test.js       # Unit: label generation
├── isTabbable.test.js      # Unit: element filtering
├── overlayPosition.test.js # Unit: positioning logic
├── removeOverlays.test.js  # Unit: cleanup
└── flagAsInaccessible.test.js # Unit: a11y warnings

demo/
├── demo.html              # Debug mode demo (debug.keyboardAccessible: true)
└── productiondemo.html    # Production mode demo (debug.keyboardAccessible: false)

artifacts/                 # Screenshots from E2E runs (gitignored)
```

## Diagnostic architecture

- **`src/isTabbable.js`** evaluates Click Mode candidates and applies the current diagnostic heuristic.
- **`src/OpenKeyNav.js`** owns diagnostic flagging and cleanup.
- **`src/keylabels.js`** discovers candidates and creates the regular Click Mode labels.
- **`src/audit.js`** and **`src/auditPanel.js`** contain future page-wide audit work. The current runtime entry does not import or activate them; Babel still emits their standalone `dist/` modules for continued development.

## Build Process Isolation

**Tests and artifacts are excluded from the build:**

1. **Babel transpilation** (`babel src -d dist`):
   - Only processes `src/` directory
   - Tests in `tests/` are ignored

2. **Rollup bundling** (`rollup -c`):
   - Input: `dist/OpenKeyNav.js` (from Babel output)
   - Does not traverse `tests/` or `demo/`

3. **npm package** (`package.json` "files" field):
   ```json
   "files": [
     "dist/",
     "README.md",
     "package.json"
   ]
   ```
   - Tests, demo, and artifacts are not published

4. **.gitignore** patterns:
   - `artifacts/` - E2E screenshots
   - `test-results/` - Playwright test output
   - `playwright-report/` - HTML reports
   - `dist/` - Built files (regenerated)

## Configuration Files

### `vitest.config.mjs`
```javascript
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],  // Only unit tests
    globals: true,
  }
});
```

### `playwright.config.ts`
```javascript
export default defineConfig({
  testDir: './tests/e2e',  // Only E2E tests
  use: {
    screenshot: 'only-on-failure',
  },
});
```

## Adding New Tests

### TDD Approach (Test-Driven Development)

When adding new functionality to `isTabbable` or other critical modules:

1. **Write failing tests first** that describe the expected behavior
2. **Run tests** to confirm they fail for the right reason
3. **Implement the feature** to make tests pass
4. **Verify** all tests pass

**Example TDD workflow:**

```javascript
// Step 1: Write failing test in tests/isTabbable.test.js
describe('TDD - new feature', () => {
  it('should handle inert elements', () => {
    const el = document.createElement('button');
    el.inert = true;
    document.body.appendChild(el);
    
    // This will fail initially
    expect(isTabbable(el, openKeyNav)).toBe(false);
  });
});

// Step 2: Run tests - verify it fails
// npm run test:ci

// Step 3: Implement in src/isTabbable.js
if (el.inert) {
  return false;
}

// Step 4: Run tests - verify it passes
// npm run test:ci
```

### Unit Test (jsdom)

Create `tests/yourFeature.test.js`:

```javascript
import { yourFunction } from '../src/yourModule.js';

describe('yourFeature', () => {
  it('does something', () => {
    expect(yourFunction()).toBe(expectedValue);
  });
});
```

### E2E Test (Playwright)

Add to `tests/e2e/openkeynav.spec.ts`:

```typescript
test('new interaction', async ({ page }) => {
  await page.goto(`file://${demoPath}`);
  await page.keyboard.press('Shift+KeyO'); // Enable
  await page.keyboard.press('KeyK');       // Click mode
  
  await page.screenshot({ 
    path: path.join(artifactsDir, 'new-test.png') 
  });
  
  const overlays = await page.locator('.openKeyNav-label').count();
  expect(overlays).toBeGreaterThan(0);
});
```

## Troubleshooting

### "Error: No tests found"
- Check that test files end with `.test.js` (unit) or `.spec.ts` (E2E)
- Verify `vitest.config.mjs` and `playwright.config.ts` paths

### "Module not found" in unit tests
- Ensure imports use relative paths from `tests/` to `src/`
- Check for circular dependencies

### Playwright browser download fails
- Run `npx playwright install chromium` manually
- Check network/firewall settings

### Screenshot shows incorrect state
- Add `await page.waitForTimeout(500)` after keyboard events
- Verify the UMD build is up to date: `npm run build`

## CI/CD Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm ci

- name: Run unit tests
  run: npm run test:ci

- name: Build
  run: npm run build

- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload screenshots
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-screenshots
    path: artifacts/
```

## Best Practices

1. **Run unit tests during development** - Fast feedback loop
2. **Run E2E tests before commits** - Catch visual regressions
3. **Keep tests focused** - One behavior per test
4. **Mock layout in jsdom** - Stub `isAnyCornerVisible`, `getBoundingClientRect`
5. **Screenshot key states** - Capture before/after for debugging
6. **Use TDD for critical modules** - Write failing tests first, then implement
7. **Test both diagnostics settings** - Ensure diagnostic presentation does not leak when disabled
8. **Document test count changes** - Update TESTING.md when adding new test suites

## Test Coverage Summary

Run `npm run test:ci` and `npm run test:e2e` for the authoritative test totals. The release gate covers unit-level DOM, focus, label, event, status, and Structural Navigation behavior plus browser-level interaction and lifecycle scenarios.

## Related Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- Main README: `../README.md`
