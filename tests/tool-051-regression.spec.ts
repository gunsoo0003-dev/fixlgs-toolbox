import { expect, test } from '@playwright/test';
test('TOOL051 keeps common shell and locale route', async ({page}) => { await page.goto('/ja/time-calculator'); await expect(page.getByTestId('tool051-root')).toBeVisible(); await expect(page.locator('body')).toContainText('時間計算ツール'); });
