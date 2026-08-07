import { test, expect } from '@playwright/test';
import { openTool011, upload011, canvasSize, dragCanvasPointer } from './helpers/tool-011';

test.describe('011 core canvas compose', () => {
  test.beforeEach(async ({page}) => { await openTool011(page); await upload011(page); });
  test('all-side and separate padding calculate exact output size', async ({page}) => {
    const original = await canvasSize(page);
    await page.getByTestId('tool011-mode-padding').click();
    await page.getByTestId('tool011-padding-all').fill('20');
    await page.getByTestId('tool011-padding-all').blur();
    let result = await canvasSize(page);
    expect(result.width).toBe(original.width + 40); expect(result.height).toBe(original.height + 40);
    await page.getByTestId('tool011-link-padding').click();
    await page.getByTestId('tool011-padding-top').fill('1');
    await page.getByTestId('tool011-padding-bottom').fill('2');
    await page.getByTestId('tool011-padding-left').fill('3');
    await page.getByTestId('tool011-padding-right').fill('4');
    await page.getByTestId('tool011-padding-right').blur();
    result = await canvasSize(page);
    expect(result.width).toBe(original.width + 7); expect(result.height).toBe(original.height + 3);
  });
  test('square and ratio modes preserve the whole foreground image', async ({page}) => {
    await page.getByTestId('tool011-mode-square').click();
    let result=await canvasSize(page); expect(result.width).toBe(result.height);
    await page.getByTestId('tool011-mode-ratio').click();
    await page.getByTestId('tool011-ratio-9-16').click();
    result=await canvasSize(page); expect(Math.abs(result.width/result.height-9/16)).toBeLessThan(.002);
    await expect(page.getByTestId('tool011-crop-state')).toHaveText(/not cropped|잘리지|切り取/);
  });
  test('solid transparent and blur backgrounds switch deterministically', async ({page}) => {
    for (const mode of ['solid','transparent','blur']) {
      await page.getByTestId(`tool011-bg-${mode}`).click();
      await expect(page.getByTestId('tool011-background-state')).toHaveAttribute('data-background', mode);
    }
  });
  test('alignment, drag, scale and undo redo are history backed', async ({page}) => {
    await page.getByTestId('tool011-align-top').click();
    await page.getByTestId('tool011-scale').fill('80');
    await dragCanvasPointer(page,'mouse');
    await expect(page.getByTestId('tool011-undo')).toBeEnabled(); await page.getByTestId('tool011-undo').click(); await expect(page.getByTestId('tool011-redo')).toBeEnabled();
  });
});
