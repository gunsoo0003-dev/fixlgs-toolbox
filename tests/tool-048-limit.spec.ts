import { expect,test } from '@playwright/test';
test('TOOL048 service range is present on date inputs',async({page})=>{await page.goto('/en/age-life-calculator');for(const id of ['tool048-dob','tool048-as-of']){await expect(page.getByTestId(id)).toHaveAttribute('min','1900-01-01');await expect(page.getByTestId(id)).toHaveAttribute('max','2100-12-31');}});
