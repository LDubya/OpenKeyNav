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

**Debug Mode Tests (6 tests)** - Uses `demo/demo.html` with `debug.keyboardAccessible: true` (default):
- Real overlay positioning in Chromium
- Click mode activation and label visibility
- Debug mode showing ALL interactive elements with red overlays for inaccessible ones
- Toolbar rendering and state updates with debug count
- Heading navigation focus behavior
- Accessibility audit panel on enable showing flagged elements
- Keyboard event handling (Shift+o, k, h, Esc)

**Production Mode Tests (3 tests)** - Uses `demo/productiondemo.html` with `debug.keyboardAccessible: false`:
- No audit panel on enable
- No red outlines on inaccessible elements
- Click mode shows only accessible elements (no red overlays)
- Toolbar does not show debug count
- Inaccessible elements are not flagged with data attributes or classes

**Total E2E Tests: 9**

**Artifacts:**
Screenshots are saved to `artifacts/` after each run:

**Debug Mode Artifacts (`demo/demo.html`):**
- `01-initial.png` - Page before enabling OpenKeyNav
- `02-enabled.png` - After Shift+o (toolbar visible)
- `03-click-mode.png` - Overlays shown in click mode
- `04-after-escape.png` - Clean state after pressing Esc
- `05-toolbar.png` - Toolbar appearance
- `06-heading-focus.png` - Heading focused via h key
- `07-debug-mode.png` - Click mode in debug mode with red overlays for inaccessible elements
- `08-debug-toolbar.png` - Toolbar showing debug info with inaccessible count
- `09-audit-initial.png` - Page after enabling with audit panel
- `10-audit-panel.png` - Audit panel showing accessibility issues
- `11-audit-red-outlines.png` - Red outlines on inaccessible elements
- `12-audit-click-mode.png` - Click mode working alongside audit

**Production Mode Artifacts (`demo/productiondemo.html`):**
- `13-production-no-audit.png` - No audit panel on enable
- `14-production-click-mode.png` - Click mode with only accessible elements
- `15-production-no-flagging.png` - Inaccessible elements not flagged

### Run All Tests

```bash
# Unit tests + E2E tests
npm run test:ci && npm run test:e2e
```

## Debug Mode vs Production Mode

OpenKeyNav has two operational modes controlled by `config.debug.keyboardAccessible`:

### Debug Mode (Default for Development)
**Configuration:** `debug.keyboardAccessible: true`
**Demo:** `demo/demo.html`

**Features:**
- Automatic accessibility audit on enable
- Audit panel shows all inaccessible elements with click-to-scroll
- Red outlines (`box-shadow`) on inaccessible elements (always visible)
- Click mode shows ALL interactive elements (accessible + inaccessible)
- Red labels for inaccessible elements with tooltips
- Toolbar shows debug count: "Debug: X inaccessible"
- Console warnings with element details
- `flagAsInaccessible()` adds classes and data attributes

**Use Cases:**
- Development and debugging
- Accessibility auditing
- Finding keyboard navigation issues
- QA testing

### Production Mode (Recommended for End Users)
**Configuration:** `debug.keyboardAccessible: false`
**Demo:** `demo/productiondemo.html`

**Features:**
- NO audit panel
- NO red outlines or flagging
- Click mode shows ONLY accessible elements
- Clean toolbar without debug info
- NO console warnings about accessibility
- `flagAsInaccessible()` is not called

**Use Cases:**
- Production websites
- End-user deployment
- Clean, distraction-free UX
- Performance optimization (fewer checks)

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

**Important:** The default is `true` (debug mode) for development convenience. Set to `false` for production deployments.

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
├── demo.html              # Debug mode demo (debug.keyboardAccessible: true)
└── productiondemo.html    # Production mode demo (debug.keyboardAccessible: false)

artifacts/                 # Screenshots from E2E runs (gitignored)
```

## Modular Architecture

OpenKeyNav's audit functionality is modular:

- **`src/audit.js`** - Core audit logic (queries elements, runs checks, manages console output)
- **`src/auditPanel.js`** - UI presentation layer (creates panel, renders issues, handles interactions)
- **`src/isTabbable.js`** - Accessibility detection (visibility, tabindex, ARIA, inert, etc.)
- **`src/OpenKeyNav.js`** - Orchestrator (imports `runAccessibilityAudit`, calls it on enable)

This separation allows:
- Easy testing of each component
- Independent enhancement (e.g., add panel themes, export reports)
- Clear separation of concerns (logic vs UI vs detection)

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
7. **Use TDD for critical modules** - Write failing tests first, then implement
8. **Test both debug and production modes** - Ensure features don't leak between modes
9. **Document test count changes** - Update TESTING.md when adding new test suites

## Test Coverage Summary

| Module | Unit Tests | E2E Tests | Notes |
|--------|-----------|-----------|-------|
| `isTabbable.js` | 48 | 3 | Comprehensive coverage of visibility, tabindex, ARIA, inert |
| Audit system | 0 | 3 | Tested via E2E (audit.js, auditPanel.js) |
| Click mode | 2 | 3 | Label generation + E2E positioning |
| Toolbar | 2 | 2 | KeyButton rendering + E2E visibility |
| Signals | 1 | 0 | Reactivity logic |
| Overlays | 5 | 2 | Positioning + cleanup |
| **Total** | **59** | **9** | **68 tests** |

## Related Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Copilot Model Selection](https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide)
- Main README: `../README.md`
- AI Agent Instructions: `../.github/copilot-instructions.md`
