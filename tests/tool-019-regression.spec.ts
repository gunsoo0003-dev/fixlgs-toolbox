import {test,expect} from '@playwright/test';
test.describe('019 regression-only',()=>{
 test('protected existing routes still respond',async({page})=>{for(const route of ['/ko/add-text-to-image','/ko/before-after-image-maker','/ko/image-collage-maker']){const r=await page.goto(route);expect(r?.status()).toBeLessThan(400);}});
 test('new KO EN JA routes respond',async({page})=>{for(const locale of ['ko','en','ja']){const r=await page.goto(`/${locale}/youtube-thumbnail-maker`);expect(r?.status()).toBeLessThan(400);await expect(page.getByTestId('tool019-root')).toBeVisible();}});
 test('content image category links to 019',async({page})=>{await page.goto('/ko/category/content-image');await expect(page.getByRole('link',{name:/유튜브 썸네일 제작기/})).toHaveAttribute('href','/ko/youtube-thumbnail-maker');});
 test('related tool links point only to existing protected tools',async({page})=>{await page.goto('/ko/youtube-thumbnail-maker');for(const href of ['/ko/add-text-to-image','/ko/image-brightness-color-adjuster','/ko/image-cropper-rotator','/ko/image-resizer','/ko/image-compressor'])await expect(page.locator(`a[href="${href}"]`)).toHaveCount(1);});
});
