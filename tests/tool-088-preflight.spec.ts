import {test,expect} from '@playwright/test';
test('TOOL088 preflight route/root/workspace',{tag:'@preflight'},async({page})=>{await page.goto('/ko/concrete-volume-calculator');await expect(page.getByTestId('tool088-root')).toBeVisible();await expect(page.getByTestId('tool088-workspace')).toBeVisible();});
