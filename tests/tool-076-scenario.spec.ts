import {expect,test} from '@playwright/test';
test('TOOL076 scenarios 3 6 12 24',async({page})=>{await page.goto('/ja/credit-card-installment-calculator');await page.getByTestId('tool076-mode-compare').click();for(const m of [3,6,12,24])await expect(page.getByTestId(`tool076-scenario-${m}`)).toBeVisible();await expect(page.getByTestId('tool076-scenario-assumption')).toBeVisible()});
