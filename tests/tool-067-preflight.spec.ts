import {test,expect} from '@playwright/test';
const path='/ko/selling-price-margin-calculator';
test('TOOL067 preflight route and root',async({page})=>{await page.goto(path);await expect(page.getByTestId('tool-067-root')).toBeVisible();await expect(page.getByRole('heading',{name:'판매가격·마진 계산기'})).toBeVisible();});
