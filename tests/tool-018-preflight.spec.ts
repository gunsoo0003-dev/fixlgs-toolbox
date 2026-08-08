import { test } from '@playwright/test';
import { openTool018, upload018, TOOL018_FIXTURES } from './helpers/tool-018';

test.describe('018 harness connection preflight', () => {
  for (const locale of ['ko','en','ja'] as const) {
    test(`${locale} route and required DOM selectors connect`, async ({ page }) => { await openTool018(page, locale); });
  }
  test('ready-state DOM connects after upload', async ({ page }) => {
    await openTool018(page);
    await upload018(page, TOOL018_FIXTURES.noExif);
  });
});
