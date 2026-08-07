import { test } from '@playwright/test';
import { openTool013, revealTool013ReadyDom } from './helpers/tool-013';

test.describe('013 harness connection preflight', () => {
  for (const locale of ['ko','en','ja'] as const) {
    test(`${locale} route and initial DOM selectors connect`, async ({ page }) => {
      await openTool013(page, locale);
    });
  }

  test('ready-state DOM selectors connect after upload without running feature assertions', async ({ page }) => {
    await openTool013(page, 'ko');
    await revealTool013ReadyDom(page);
  });
});
