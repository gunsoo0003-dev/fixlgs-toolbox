import { test, expect } from '@playwright/test';
import { openTool022 } from './helpers/tool-022';

test('022 route and required presets', async ({ page }) => {
  await openTool022(page);
  await page.getByTestId('tool022-start-blank').click();
  for (const id of ['naver', 'blogger', 'website', 'og']) {
    await expect(page.getByTestId(`tool022-preset-${id}`)).toBeVisible();
  }
});
