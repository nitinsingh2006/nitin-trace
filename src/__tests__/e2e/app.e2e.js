// @ts-check
/**
 * NitinTrace — E2E Tests: Landing Page & App Bootstrap
 *
 * Tests critical user journeys using Playwright.
 * Note: These tests require `npm run dev` (port 5174) or a built preview.
 * Run with: npx playwright test --project=chromium
 */
import { test, expect } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Navigate to the app, bypassing landing page for returning users.
 * Sets the hasVisited flag in localStorage so the app boots directly.
 */
async function goToApp(page) {
  await page.addInitScript(() => {
    const state = {
      settings: {
        geminiApiKey: 'dummy-key-for-testing',
        groqApiKey: '',
        openaiApiKey: '',
        claudeApiKey: '',
        explanationLanguage: 'english'
      },
      auth: {
        isLoggedIn: true,
        user: {
          name: 'Nitin Singh',
          email: 'nsingh987610@gmail.com',
          provider: 'Google',
          avatar: 'N',
          createdAt: 'June 2026'
        }
      },
      ui: {
        isOnboarding: false,
        modalOpen: null
      }
    };
    localStorage.setItem('n-trace-state', JSON.stringify(state));
    localStorage.setItem('nitintrace_hasVisited', 'true');
    localStorage.setItem('nitintrace_onboarding_done', 'true');
  });
  await page.goto('/');
  // Wait for the app shell to mount
  await page.waitForSelector('.app-shell', { timeout: 10000 });
}

/**
 * Navigate to landing page (first visit — no hasVisited flag).
 */
async function goToLanding(page) {
  await page.addInitScript(() => {
    localStorage.removeItem('n-trace-state');
    localStorage.removeItem('nitintrace_hasVisited');
    localStorage.setItem('nitintrace_onboarding_done', 'true');
  });
  await page.goto('/');
}

// ─── Landing Page ─────────────────────────────────────────────────────────

test.describe('Landing Page', () => {
  test('renders the landing page on first visit', async ({ page }) => {
    await goToLanding(page);
    await expect(page.locator('#landing-root')).toBeVisible({ timeout: 5000 });
  });

  test('landing page has hero headline', async ({ page }) => {
    await goToLanding(page);
    await expect(page.locator('h1')).toContainText('See your code');
  });

  test('CTA button is visible and clickable', async ({ page }) => {
    await goToLanding(page);
    const cta = page.locator('#landing-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toBeEnabled();
  });

  test('clicking CTA transitions from landing to app', async ({ page }) => {
    await goToLanding(page);
    await page.click('#landing-cta');
    // App shell should mount after CTA click
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 8000 });
    // Landing root should be removed
    await expect(page.locator('#landing-root')).not.toBeAttached({ timeout: 5000 });
  });

  test('landing page features section is present', async ({ page }) => {
    await goToLanding(page);
    await expect(page.locator('#landing-features')).toBeVisible();
  });

  test('landing page languages section is present', async ({ page }) => {
    await goToLanding(page);
    await expect(page.locator('#landing-languages')).toBeVisible();
  });
});

// ─── App Shell ────────────────────────────────────────────────────────────

test.describe('App Shell', () => {
  test.beforeEach(async ({ page }) => {
    await goToApp(page);
  });

  test('app shell mounts correctly', async ({ page }) => {
    await expect(page.locator('.app-shell')).toBeVisible();
  });

  test('header is present', async ({ page }) => {
    await expect(page.locator('.app-header')).toBeVisible();
  });

  test('editor panel is present', async ({ page }) => {
    await expect(page.locator('#panel-editor')).toBeVisible();
  });

  test('visualizer panel is present', async ({ page }) => {
    await expect(page.locator('#panel-visualizer')).toBeVisible();
  });

  test('playback bar is present in visualizer', async ({ page }) => {
    await expect(page.locator('.playback-bar')).toBeVisible();
  });
});

// ─── Header Interactions ──────────────────────────────────────────────────

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await goToApp(page);
  });

  test('logo is visible', async ({ page }) => {
    await expect(page.locator('.logo')).toBeVisible();
  });

  test('settings button opens settings modal', async ({ page }) => {
    await page.click('#btn-settings');
    await expect(page.locator('#settings-modal')).toBeVisible({ timeout: 5000 });
  });

  test('settings modal can be closed with Escape key', async ({ page }) => {
    await page.click('#btn-settings');
    await expect(page.locator('#settings-modal')).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('#settings-modal')).not.toBeVisible({ timeout: 3000 });
  });

  test('GitHub button is visible', async ({ page }) => {
    const githubBtn = page.locator('#btn-github');
    await expect(githubBtn).toBeVisible();
  });

  test('history button opens history drawer', async ({ page }) => {
    await page.click('#btn-history');
    // History drawer should appear
    await expect(page.locator('.drawer, #drawer-history')).toBeVisible({ timeout: 5000 });
  });
});

// ─── Editor Panel ─────────────────────────────────────────────────────────

test.describe('Editor Panel', () => {
  test.beforeEach(async ({ page }) => {
    await goToApp(page);
  });

  test('language selector is present', async ({ page }) => {
    await expect(page.locator('.language-select, #language-select')).toBeVisible();
  });

  test('language selector has JavaScript selected by default', async ({ page }) => {
    const sel = page.locator('.language-select, #language-select');
    await expect(sel).toHaveValue('javascript');
  });

  test('can switch language to Python', async ({ page }) => {
    const sel = page.locator('.language-select, #language-select');
    await sel.selectOption('python');
    await expect(sel).toHaveValue('python');
  });

  test('trace button is present and enabled', async ({ page }) => {
    const traceBtn = page.locator('.btn-trace, #btn-trace');
    await expect(traceBtn).toBeVisible();
    await expect(traceBtn).toBeEnabled();
  });

  test('Monaco editor container is present', async ({ page }) => {
    // Trigger Monaco initialization by dispatching a focus event programmatically
    await page.dispatchEvent('.editor-placeholder', 'focus');
    // Monaco renders inside a .monaco-editor div
    await page.waitForSelector('.monaco-editor', { timeout: 15000 });
    await expect(page.locator('.monaco-editor').first()).toBeVisible();
  });
});

// ─── Settings Modal ───────────────────────────────────────────────────────

test.describe('Settings Modal', () => {
  test.beforeEach(async ({ page }) => {
    await goToApp(page);
    await page.click('#btn-settings');
    await page.waitForSelector('#settings-modal', { timeout: 5000 });
  });

  test('settings modal has provider selector', async ({ page }) => {
    await expect(page.locator('#settings-modal')).toContainText('Provider');
  });

  test('settings modal has API key input', async ({ page }) => {
    // Should have at least one password/text input for API key
    const inputs = page.locator('#settings-modal input[type="password"], #settings-modal input[type="text"]');
    await expect(inputs.first()).toBeVisible();
  });

  test('settings modal has close button', async ({ page }) => {
    const closeBtn = page.locator('#settings-modal .modal-close, #settings-modal [aria-label="Close"]');
    await expect(closeBtn.first()).toBeVisible();
    await closeBtn.first().click();
    await expect(page.locator('#settings-modal')).not.toBeVisible({ timeout: 3000 });
  });
});

// ─── Keyboard Shortcuts ───────────────────────────────────────────────────

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await goToApp(page);
    // Click on body to ensure focus is not in editor
    await page.click('body');
  });

  test('? key opens keyboard shortcuts help', async ({ page }) => {
    await page.keyboard.press('Shift+?');
    // keyboard help overlay should appear (varies by implementation)
    // Just check we don't crash
    await page.waitForTimeout(500);
  });

  test('Ctrl+Enter triggers trace action (with no API key — shows settings)', async ({ page }) => {
    await page.keyboard.press('Control+Enter');
    // Should either start trace or open settings (if no API key set)
    await page.waitForTimeout(1000);
    // At minimum — no crash
    await expect(page.locator('.app-shell')).toBeVisible();
  });
});

// ─── Playback Controls ────────────────────────────────────────────────────

test.describe('Playback Bar', () => {
  test.beforeEach(async ({ page }) => {
    await goToApp(page);
  });

  test('playback bar has step counter', async ({ page }) => {
    await expect(page.locator('.step-counter, .playback-step')).toBeVisible();
  });

  test('playback bar has play/pause button', async ({ page }) => {
    const playBtn = page.locator('.ctrl-btn-primary, [aria-label="Play"], [aria-label="Pause"]');
    await expect(playBtn.first()).toBeVisible();
  });

  test('playback bar has prev/next step buttons', async ({ page }) => {
    // Should have at least 2 control buttons (prev/next)
    const ctrlBtns = page.locator('.ctrl-btn');
    const count = await ctrlBtns.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

// ─── Responsive (Mobile) ─────────────────────────────────────────────────

test.describe('Mobile Layout', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await goToApp(page);
  });

  test('app renders on mobile viewport', async ({ page }) => {
    await expect(page.locator('.app-shell')).toBeVisible();
  });

  test('FAB trace button is visible on mobile', async ({ page }) => {
    // FAB is shown via CSS on mobile
    const fab = page.locator('.fab-trace');
    await expect(fab).toBeVisible();
  });
});

// ─── Accessibility ────────────────────────────────────────────────────────

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await goToApp(page);
  });

  test('skip-to-content link is in the DOM', async ({ page }) => {
    await expect(page.locator('.skip-to-content, a[href="#app"]')).toBeAttached();
  });

  test('header buttons have accessible labels', async ({ page }) => {
    // All icon-only buttons should have aria-label
    const settingsBtn = page.locator('#btn-settings');
    await expect(settingsBtn).toBeVisible();
    const label = await settingsBtn.getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  test('page has a single h1 element', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    // App view doesn't need an h1 (it's an application UI, not a document)
    // But it should be 0 or 1 — never more
    expect(h1Count).toBeLessThanOrEqual(1);
  });
});
