import {expect,test} from '@playwright/test';
test('TOOL066 route remains referenced and TOOL071 does not require network API',async({page})=>{await page.goto('/ko/ad-sales-performance-calculator');await expect(page.getByTestId('tool071-root')).toBeVisible();await expect(page.getByText('광고·매출 성과 계산기')).toBeVisible()});
