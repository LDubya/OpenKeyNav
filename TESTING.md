# Testing Guide for OpenKeyNav

This document covers the testing strategy for OpenKeyNav, including unit tests (Vitest + jsdom) and end-to-end tests (Playwright).

## Overview

OpenKeyNav has two layers of testing:

1. **Unit Tests** (jsdom) - Fast, logic-focused tests for pure functions, state management, and DOM utilities
2. **E2E Tests** (Playwright) - Visual verification in a real browser for overlay positioning, keyboard modes, and interactions

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
- Signal reactivity (`src/signals.js`)
- Keyboard shortcut button rendering (`src/keyButton.js`)
- Label generation and filtering (`src/keylabels.js`)
- Element tabbability heuristics (`src/isTabbable.js`)
- Overlay cleanup and mode resets (`removeOverlays`)
- Accessibility flagging (`flagAsInaccessible`)
- Overlay positioning logic (`updateOverlayPosition`)

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
- Real overlay positioning in Chromium
- Click mode activation and label visibility
- Toolbar rendering and state updates
- Heading navigation focus behavior
- Keyboard event handling (Shift+o, k, h, Esc)

**Artifacts:**
Screenshots are saved to `artifacts/` after each run:
- `01-initial.png` - Page before enabling OpenKeyNav
- `02-enabled.png` - After Shift+o (toolbar visible)
- `03-click-mode.png` - Overlays shown in click mode
- `04-after-escape.png` - Clean state after pressing Esc
- `06-heading-focus.png` - Heading focused via h key

### Run All Tests

```bash
# Unit tests + E2E tests
npm run test:ci && npm run test:e2e
```

## Using Vision-Capable AI (Claude Sonnet 4.5)

Claude Sonnet 4.5 can view and analyze Playwright screenshots to verify visual correctness. This is useful for:
- Validating overlay positioning
- Checking for visual regressions
- Confirming accessible color contrast
- Verifying toolbar/notification appearance

### To use Claude Sonnet in GitHub Copilot Chat:

1. Open Copilot Chat in VS Code
2. Switch model to **Claude Sonnet 4.5** (supports vision)
3. Run E2E tests to generate screenshots:
   ```bash
   npm run test:e2e
   ```
4. Attach screenshots from `artifacts/` to your Copilot Chat
5. Ask Claude to analyze specific aspects:
   - "Are the overlays positioned correctly without overlapping elements?"
   - "Is the click mode notification visible and readable?"
   - "Do the keyboard shortcut labels have sufficient contrast?"

### Example Chat Workflow:

```
User: [Attaches artifacts/03-click-mode.png]
"Analyze this OpenKeyNav click mode screenshot. Are the overlays 
positioned well? Any visual issues?"

Claude Sonnet: "The overlays are positioned correctly to the left 
of interactive elements with directional arrows pointing to their 
targets. Labels are readable (black on light gray). No overlap 
detected. The bottom notification clearly shows 'In Click Mode' 
with escape instructions..."
```

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
└── demo.html               # E2E test fixture (uses dist/ build)

artifacts/                  # Screenshots from E2E runs (gitignored)
```

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

### Vision analysis not working
- Confirm you're using Claude Sonnet 4.5 (not GPT models)
- Attach images directly to chat (don't paste file paths)
- Supported models with vision: Claude Sonnet 4, Claude Opus 4.1, GPT-5 mini, Gemini 2.5 Pro

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
3. **Use Claude Sonnet for visual review** - Attach screenshots when unsure
4. **Keep tests focused** - One behavior per test
5. **Mock layout in jsdom** - Stub `isAnyCornerVisible`, `getBoundingClientRect`
6. **Screenshot key states** - Capture before/after for debugging

## Related Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Copilot Model Selection](https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide)
- Main README: `../README.md`
- AI Agent Instructions: `../.github/copilot-instructions.md`
