import {expect,test} from '@playwright/test';
test('TOOL055 protected route still resolves',async({page})=>{await page.goto('/ko/length-area-volume-converter');await expect(page.getByTestId('tool055-root')).toBeVisible();});
test('TOOL058 common lower sections remain present',async({page})=>{await page.goto('/ko/data-cooking-unit-converter');await expect(page.getByText('사용 방법')).toBeVisible();await expect(page.getByText('자주 묻는 질문')).toBeVisible();});
