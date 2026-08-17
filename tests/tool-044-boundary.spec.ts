import {expect,test} from '@playwright/test';
import {route044,setText044} from './helpers/tool-044';

test('punctuation only yields zero without NaN or Infinity',async({page})=>{
  await page.goto(route044('en'));
  await setText044(page,'... !!!');
  await page.getByTestId('tool044-run').click();
  const result=page.getByTestId('tool044-result');
  await expect(result).toBeVisible();
  await expect(result).not.toContainText('NaN');
  await expect(result).not.toContainText('Infinity');
});

test('case insensitive and complete reset',async({page})=>{
  await page.goto(route044('en'));
  await setText044(page,'Apple apple APPLE');
  await page.getByTestId('tool044-run').click();
  await expect(page.getByTestId('tool044-keyword-table')).toContainText('3');
  await page.getByTestId('tool044-reset').click();
  await expect(page.getByTestId('tool044-input')).toHaveValue('');
  await expect(page.getByTestId('tool044-result')).toHaveCount(0);
  await expect(page.getByTestId('tool044-file-info')).toHaveCount(0);
  await expect(page.getByTestId('tool044-run')).toBeDisabled();
});

test('unsupported file is rejected without replacing source',async({page})=>{
  await page.goto(route044('en'));
  await setText044(page,'keep source');
  await page.getByTestId('tool044-file-input').setInputFiles({
    name:'bad.pdf',
    mimeType:'application/pdf',
    buffer:Buffer.from('%PDF-invalid')
  });
  await expect(page.getByTestId('tool044-error')).toBeVisible();
  await expect(page.getByTestId('tool044-input')).toHaveValue('keep source');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
