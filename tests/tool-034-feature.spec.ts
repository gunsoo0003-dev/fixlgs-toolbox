import {expect,test} from '@playwright/test';
import {route034,upload034} from './helpers/tool-034';

test('034 upload state changes from dropzone to compact workspace',async({page})=>{
  await page.goto(route034());
  await expect(page.getByTestId('tool034-dropzone')).toBeVisible();
  await upload034(page);
  await expect(page.getByTestId('tool034-dropzone')).toHaveCount(0);
  await expect(page.getByTestId('tool034-file-info')).toBeVisible();
  await expect(page.getByTestId('tool034-workspace')).toBeVisible();
});

test('034 password and metadata primary actions are exposed',async({page})=>{
  await page.goto(route034());
  await upload034(page);
  await expect(page.getByTestId('tool034-new-password')).toHaveAttribute('maxlength','128');
  await page.getByRole('tab',{name:/메타데이터|Metadata/}).click();
  await expect(page.getByTestId('tool034-meta-title')).toHaveAttribute('maxlength','2000');
  await expect(page.getByTestId('tool034-remove-metadata')).toBeVisible();
});


test('034 reset clears uploaded file and returns to pre-upload Dropzone',async({page})=>{
  await page.goto(route034());
  await upload034(page);
  await expect(page.getByTestId('tool034-file-info')).toBeVisible();
  await page.getByRole('button',{name:/초기화|Reset|リセット/}).click();
  await expect(page.getByTestId('tool034-file-info')).toHaveCount(0);
  await expect(page.getByTestId('tool034-dropzone')).toBeVisible();
});

test('034 post-upload file/status/tabs/panels share one workspace wrapper',async({page})=>{
  await page.goto(route034());
  await upload034(page);
  const workspace=page.getByTestId('tool034-workspace');
  await expect(workspace.getByTestId('tool034-file-info')).toBeVisible();
  await expect(workspace.getByTestId('tool034-security-status')).toBeVisible();
  await expect(workspace.getByRole('tab',{name:/비밀번호|Password|パスワード/})).toBeVisible();
  await expect(workspace.getByTestId('tool034-main-panel')).toBeVisible();
});
