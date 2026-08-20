import {expect,test} from '@playwright/test';
test('TOOL058 protected baseline route still resolves',async({page})=>{await page.goto('/ko/data-cooking-unit-converter');await expect(page.getByTestId('tool058-root')).toBeVisible();});
test('TOOL064 common lower sections remain present',async({page})=>{await page.goto('/ko/statistics-calculator');await expect(page.getByText('사용 방법')).toBeVisible();await expect(page.getByText('자주 묻는 질문')).toBeVisible();});
