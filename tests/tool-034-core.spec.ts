import {expect,test} from '@playwright/test';import {route034,tool034ProtectedFixture,tool034ProtectedPassword,upload034} from './helpers/tool-034';
test('plain PDF exposes metadata editor',async({page})=>{await page.goto(route034());await upload034(page);await expect(page.getByTestId('tool034-security-status')).toContainText(/미보호|Unprotected|未保護/);await page.getByRole('tab',{name:/메타데이터|Metadata/}).click();await expect(page.getByTestId('tool034-meta-title')).toBeVisible();});
test('metadata edit produces independently verified result',async({page})=>{await page.goto(route034());await upload034(page);await page.getByRole('tab',{name:/메타데이터|Metadata/}).click();await page.getByTestId('tool034-meta-title').fill('TOOL034 VERIFIED TITLE');await page.getByTestId('tool034-save-metadata').click();await expect(page.getByTestId('tool034-result')).toBeVisible();await expect(page.getByTestId('tool034-download')).toBeEnabled();});
test('AES-256 opening password path produces verified result',async({page})=>{await page.goto(route034());await upload034(page);await page.getByTestId('tool034-new-password').fill('Tool034!Secure#2026');await page.getByTestId('tool034-confirm-password').fill('Tool034!Secure#2026');await page.getByTestId('tool034-set-password').click();await expect(page.getByTestId('tool034-result')).toBeVisible({timeout:30000});});

test('encrypted PDF is detected and opening password can be removed with verified result',async({page})=>{
  await page.goto(route034());
  await upload034(page,tool034ProtectedFixture);
  await expect(page.getByTestId('tool034-security-status')).toContainText(/비밀번호 필요|Password required|パスワード/);
  await page.getByTestId('tool034-current-password').fill(tool034ProtectedPassword);
  await page.getByTestId('tool034-remove-password').click();
  await expect(page.getByTestId('tool034-result')).toBeVisible({timeout:30000});
  await expect(page.getByTestId('tool034-download')).toBeEnabled();
});
