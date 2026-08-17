import {expect,test} from '@playwright/test';
import {route044} from './helpers/tool-044';

for(const locale of ['ko','en','ja'] as const){
  test(`${locale} initial state inventory`,async({page})=>{
    await page.goto(route044(locale));
    await expect(page.getByTestId('tool044-root')).toBeVisible();
    await expect(page.getByTestId('tool044-workspace')).toBeVisible();
    await expect(page.getByTestId('tool044-start-dropzone')).toBeVisible();
    await expect(page.getByTestId('tool044-input')).toBeVisible();
    await expect(page.getByTestId('tool044-run')).toBeDisabled();
    await expect(page.getByTestId('tool044-result')).toHaveCount(0);
    await expect(page.getByTestId('tool044-file-info')).toHaveCount(0);
  });
}
