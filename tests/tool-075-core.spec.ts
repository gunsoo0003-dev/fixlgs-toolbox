import {test,expect} from '@playwright/test';
const path='/ko/loan-interest-calculator';
test('TOOL075 root and three methods',async({page})=>{await page.goto(path);await expect(page.getByTestId('tool075-root')).toBeVisible();for(const id of ['equal-payment','equal-principal','bullet'])await expect(page.getByTestId(`tool075-method-${id}`)).toBeVisible();await expect(page.getByTestId('tool075-result-interest')).toBeVisible();await expect(page.getByTestId('tool075-schedule')).toBeVisible();});
