import {expect,test} from '@playwright/test';
import {route034,upload034} from './helpers/tool-034';

test('034 approved service-limit contract is synchronized in DOM',async({page})=>{
  await page.goto(route034());
  await expect(page.getByTestId('tool034-dropzone').getByText(/50MB/)).toBeVisible();
  await upload034(page);
  await expect(page.getByTestId('tool034-new-password')).toHaveAttribute('maxlength','128');
  await page.getByRole('tab',{name:/메타데이터|Metadata/}).click();
  for(const id of ['tool034-meta-title','tool034-meta-author','tool034-meta-subject','tool034-meta-keywords'])
    await expect(page.getByTestId(id)).toHaveAttribute('maxlength','2000');
});
