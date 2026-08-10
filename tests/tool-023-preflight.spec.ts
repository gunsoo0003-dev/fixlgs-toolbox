import {test,expect} from '@playwright/test';
import {openTool023,TOOL023_TESTIDS} from './helpers/tool-023';

test('023 preflight initial workspace follows completed 022 upload contract',async({page})=>{
  await openTool023(page);
  await expect(page.getByTestId(TOOL023_TESTIDS.fileInput)).toHaveAttribute('accept',/image\/png/);
  const start=page.getByTestId('tool023-start-card');
  const drop=page.getByTestId('tool023-dropzone');
  await expect(start).toBeVisible();
  await expect(start).toHaveClass(/toolbox-workbench/);
  await expect(drop).toHaveClass(/toolbox-workbench-upload/);
  await expect(drop.locator('.toolbox-workbench-topline')).toBeVisible();
  await expect(drop.locator('.toolbox-upload-focus')).toBeVisible();
  await expect(drop.locator('.toolbox-upload-icon')).toHaveText('＋');
  await expect(drop.getByRole('button')).toBeVisible();
});

for(const locale of ['ko','en','ja'])test(`023 ${locale} route`,async({page})=>{await openTool023(page,locale);});
