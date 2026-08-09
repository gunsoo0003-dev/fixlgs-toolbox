import {test,expect} from '@playwright/test';
import {openTool020Route,TOOL020_TESTIDS} from './helpers/tool-020';

test.describe('020 regression-only',()=>{
  test('protected existing content-image routes still respond',async({page})=>{
    for(const route of ['/ko/youtube-thumbnail-maker','/ko/add-text-to-image','/ko/image-watermark-tool']){
      const response=await page.goto(route,{waitUntil:'domcontentloaded'});
      expect(response,`HARNESS_ERROR: no response for protected route ${route}`).not.toBeNull();
      expect(response?.status(),`PRODUCT_FAIL: protected route ${route} returned ${response?.status()}`).toBeLessThan(400);
    }
  });
  test('new KO EN JA routes respond',async({page})=>{for(const locale of ['ko','en','ja'] as const)await openTool020Route(page,locale)});
  test('content-image category links to TOOL020 without depending on visual line breaks',async({page})=>{
    await page.goto('/ko/category/content-image');
    await expect(page.locator('a[href="/ko/youtube-channel-banner-maker"]'),'PRODUCT_FAIL: category route link to TOOL020 missing').toHaveCount(1);
  });
  test('TOOL020 root remains unique on public route',async({page})=>{
    await openTool020Route(page,'ko');
    await expect(page.getByTestId(TOOL020_TESTIDS.root),'HARNESS_ERROR: duplicate TOOL020 roots').toHaveCount(1);
  });
});
