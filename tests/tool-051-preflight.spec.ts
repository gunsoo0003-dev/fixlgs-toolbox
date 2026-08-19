import { expect, test } from '@playwright/test';
test('TOOL051 route and root load', async ({page}) => { await page.goto('/en/time-calculator'); await expect(page.getByTestId('tool051-root')).toBeVisible(); await expect(page.getByRole('heading',{name:'Time Calculator'})).toBeVisible(); });
