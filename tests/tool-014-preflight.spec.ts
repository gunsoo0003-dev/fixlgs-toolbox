import { test, expect } from '@playwright/test';
import { openTool014, TOOL014_TESTIDS, uploadTool014 } from './helpers/tool-014';

test.describe('014 harness connection preflight', () => {
  for (const locale of ['ko','en','ja'] as const) {
    test(`${locale} route and initial DOM selectors connect`, async ({ page }) => {
      await openTool014(page, locale);
    });
  }
  test('ready-state DOM connects after two valid images', async ({ page }) => {
    await openTool014(page, 'ko');
    await uploadTool014(page);
    await expect(page.getByTestId(TOOL014_TESTIDS.previewCanvas)).toBeVisible();
    await expect(page.getByTestId(TOOL014_TESTIDS.download)).toBeEnabled();
  });
});
