import { test, expect } from '@playwright/test';
import { openTool017, uploadImages, TOOL017_TESTIDS } from './helpers/tool-017';

test.describe('017 mobile environment core', () => {
  test('mobile upload reaches preview without horizontal viewport overflow', async ({ page }) => {
    await uploadImages(page, 1);
    await expect(page.getByTestId(TOOL017_TESTIDS.canvas)).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('mobile auxiliary panels follow repeat, position, output vertical flow', async ({ page }) => {
    await uploadImages(page, 1);
    const repeat = page.locator('.tool017-repeat-secondary-card');
    const position = page.locator('.tool017-position-card');
    const output = page.locator('.tool017-export-card');
    await expect(repeat).toBeVisible();
    await expect(position).toBeVisible();
    await expect(output).toBeVisible();
    const [r, p, o] = await Promise.all([repeat.boundingBox(), position.boundingBox(), output.boundingBox()]);
    expect(r && p && o).toBeTruthy();
    if (r && p && o) {
      expect(p.y).toBeGreaterThan(r.y);
      expect(o.y).toBeGreaterThan(p.y);
    }
  });

  test('mobile repeat, second watermark and output controls remain operable', async ({ page }) => {
    await uploadImages(page, 1);
    const state = page.getByTestId(TOOL017_TESTIDS.state);
    await page.getByTestId(TOOL017_TESTIDS.repeatGrid).click();
    await expect(state).toHaveAttribute('data-repeat', 'grid');
    await page.getByTestId(TOOL017_TESTIDS.secondary).check();
    await expect(state).toHaveAttribute('data-secondary', '1');
    await page.getByTestId(TOOL017_TESTIDS.output).selectOption('png');
    await expect(state).toHaveAttribute('data-output', 'png');
  });

  test('mobile locale routes expose the actual workbench', async ({ page }) => {
    for (const locale of ['ko', 'en', 'ja'] as const) {
      await openTool017(page, locale);
      await expect(page.getByTestId(TOOL017_TESTIDS.root)).toBeVisible();
    }
  });
});
