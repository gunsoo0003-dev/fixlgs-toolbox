import {expect,test} from '@playwright/test';
test('TOOL082 ratio over service limit is rejected',async({page})=>{await page.goto('/ja/building-coverage-floor-area-ratio-calculator');await page.getByTestId('tool082-target-coverage').fill('1000.01');await expect(page.getByTestId('tool082-target-error')).toBeVisible()});
