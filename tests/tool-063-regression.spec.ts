import {expect,test} from '@playwright/test';
test('TOOL063 regression',async({page})=>{await page.goto('/ja/ratio-proportion-calculator');await expect(page.getByRole('heading',{level:1})).toContainText('比率・比例');});
