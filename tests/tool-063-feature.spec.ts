import {expect,test} from '@playwright/test';
test('TOOL063 feature',async({page})=>{await page.goto('/en/ratio-proportion-calculator');await page.getByTestId('tool063-tab-advanced').click();await expect(page.getByTestId('tool063-root')).toHaveAttribute('data-mode','advanced');});
