import {test,expect} from '@playwright/test';
for(const locale of ['ko','en','ja'])test(`061 preflight ${locale}`,async({page})=>{await page.goto(`/${locale}/percentage-percent-change-calculator`);await expect(page.getByTestId('tool061-root')).toBeVisible();await expect(page.getByTestId('tool061-mode-percentageOf')).toBeVisible();await expect(page.getByTestId('tool061-result')).toBeVisible();});
