import {test,expect} from '@playwright/test';
import {openTool023,upload023,TOOL023_TESTIDS} from './helpers/tool-023';

test('023 service limit text is aligned to 20MB / 40MP',async({page})=>{
  await openTool023(page);
  await expect(page.getByTestId(TOOL023_TESTIDS.root)).toContainText('20MB');
  await expect(page.getByTestId(TOOL023_TESTIDS.root)).toContainText('40MP');
});

test('023 normal small fixture remains supported',async({page})=>{
  await upload023(page,'tests/fixtures/tool023/small-32px.png');
  await expect(page.getByTestId(TOOL023_TESTIDS.preview)).toBeVisible();
});

test('023 file-size candidate+1 is rejected',async({page})=>{
  await openTool023(page);
  await page.getByTestId(TOOL023_TESTIDS.fileInput).setInputFiles('tests/fixtures/tool023/over-20mb.png');
  await expect(page.getByTestId(TOOL023_TESTIDS.dropzone).getByRole('alert')).toContainText(/20MB|20 MB/);
});
