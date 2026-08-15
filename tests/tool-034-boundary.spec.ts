import {expect,test} from '@playwright/test';import {route034,tool034ProtectedFixture,upload034} from './helpers/tool-034';
test('rejects non PDF',async({page})=>{await page.goto(route034());await page.getByTestId('tool034-file-input').setInputFiles('tests/fixtures/tool-034/not-pdf.pdf');await expect(page.getByTestId('tool034-error')).toBeVisible();});
test('rejects corrupted PDF',async({page})=>{await page.goto(route034());await page.getByTestId('tool034-file-input').setInputFiles('tests/fixtures/tool-034/corrupted.pdf');await expect(page.getByTestId('tool034-error')).toBeVisible();});
test('password mismatch blocks execution',async({page})=>{await page.goto(route034());await upload034(page);await page.getByTestId('tool034-new-password').fill('abc12345!A');await page.getByTestId('tool034-confirm-password').fill('different');await expect(page.getByTestId('tool034-set-password')).toBeDisabled();});

test('wrong current password does not unlock encrypted PDF',async({page})=>{
  await page.goto(route034());
  await upload034(page,tool034ProtectedFixture);
  await page.getByTestId('tool034-current-password').fill('definitely-wrong-password');
  await page.getByTestId('tool034-remove-password').click();
  await expect(page.getByTestId('tool034-error')).toBeVisible();
  await expect(page.getByTestId('tool034-result')).toHaveCount(0);
});
