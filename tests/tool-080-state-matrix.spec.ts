import {expect,test} from '@playwright/test';
const url='/ko/rental-yield-calculator';
test('TOOL080 normal',async({page})=>{await page.goto(url);await expect(page.getByTestId('tool080-gross')).toContainText('6');await expect(page.getByTestId('tool080-net')).toContainText('5.2')});
test('TOOL080 error survives and recovers',async({page})=>{await page.goto(url);await page.getByTestId('tool080-deposit').fill('200000000');await expect(page.getByTestId('tool080-error')).toBeVisible();await expect(page.getByTestId('tool080-root')).toBeVisible();await page.getByTestId('tool080-deposit').fill('50000000');await expect(page.getByTestId('tool080-net')).toBeVisible()});
test('TOOL080 boundary',async({page})=>{await page.goto(url);await page.getByTestId('tool080-purchase').fill('0');await expect(page.getByTestId('tool080-error')).toBeVisible()});
test('TOOL080 state transition interest unit',async({page})=>{await page.goto(url);const before=await page.getByTestId('tool080-annual-interest').textContent();await page.getByTestId('tool080-interest-unit').selectOption('monthly');const after=await page.getByTestId('tool080-annual-interest').textContent();expect(after).not.toBe(before)});
for(const locale of ['ko','en','ja'])test(`TOOL080 locale ${locale}`,async({page})=>{await page.goto(`/${locale}/rental-yield-calculator`);await expect(page.getByTestId('tool080-root')).toBeVisible()});
