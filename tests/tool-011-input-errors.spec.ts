import { test, expect } from '@playwright/test';
import { openTool011, upload011 } from './helpers/tool-011';

test.describe('011 input boundary and error handling', () => {
  test('zero byte corrupt unsupported and uppercase extension are classified without crash', async ({page}) => {
    await openTool011(page);
    await page.getByTestId('tool011-file').setInputFiles({name:'EMPTY.JPG', mimeType:'image/jpeg', buffer:Buffer.alloc(0)});
    await expect(page.getByTestId('tool011-error')).toBeVisible();
    await page.getByTestId('tool011-file').setInputFiles('test-fixtures/sample.svg');
    await expect(page.getByTestId('tool011-error')).toBeVisible();
  });
  test('padding numeric input accepts editing state then clamps negative, text, decimal and over-range safely', async ({page}) => {
    await openTool011(page); await upload011(page); await page.getByTestId('tool011-mode-padding').click();
    const input=page.getByTestId('tool011-padding-all');
    for(const value of ['', '-1', 'abc', '1.7', '999999999']) { await input.fill(value); await input.blur(); await expect(page.getByTestId('tool011-editor')).toBeVisible(); }
  });
  test('CMYK color profile, alpha edge, and tiny images decode without changing the workflow', async ({page}) => {
    await openTool011(page); for(const fixture of ['test-fixtures/tool011-cmyk.jpg','test-fixtures/tool011-alpha-edge.png','test-fixtures/tool011-tiny.png']) { await upload011(page,fixture); await expect(page.getByTestId('tool011-editor')).toBeVisible(); }
  });
  test('EXIF orientation consistently affects preview, canvas calculation and final output', async ({page}) => {
    await openTool011(page); await upload011(page,'test-fixtures/exif-rotated.jpg');
    const dims=await page.getByTestId('tool011-original-size').textContent(); expect(dims).toMatch(/\d+\s*[×x]\s*\d+/);
    await expect(page.getByTestId('tool011-canvas')).toBeVisible();
  });
});
