import type {Page} from '@playwright/test';
export const route034=(locale='ko')=>`/${locale}/pdf-password-metadata`;
export const tool034ProtectedFixture='tests/fixtures/tool-034/protected-known-password.pdf';
export const tool034ProtectedPassword='Tool034!Fixture#2026';
export async function upload034(page:Page,file='tests/fixtures/tool-034/plain-basic.pdf'){
  await page.getByTestId('tool034-file-input').setInputFiles(file);
  await page.getByTestId('tool034-security-status').waitFor();
}
