// @ts-check
import { test, expect } from '@playwright/test';

test.describe('N-Trace App', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#app')).toBeAttached();
  });

  test('should have editor panel', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#panel-editor')).toBeAttached();
  });

  test('should have visualizer panel', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#panel-visualizer')).toBeAttached();
  });
});
