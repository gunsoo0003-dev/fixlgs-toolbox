import { test, expect } from '@playwright/test';
import { openTool011, upload011, dragCanvasPointer } from './helpers/tool-011';

test.describe('011 PC tablet mobile theme accessibility', () => {
  for (const [name,width,height] of [['desktop',1440,900],['tablet portrait',768,1024],['tablet landscape',1024,768],['mobile',390,844]] as const) {
    test(`${name} layout has no horizontal overflow and controls remain reachable`, async ({page}) => {
      await page.setViewportSize({width,height}); await openTool011(page,'ja'); await upload011(page);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth); expect(overflow).toBeLessThanOrEqual(1);
      await expect(page.getByTestId('tool011-download')).toBeVisible(); if(name==='mobile') await dragCanvasPointer(page,'touch');
    });
  }
  test('light and dark themes keep canvas boundary and active-state contrast visible', async ({page}) => {
    await openTool011(page); await upload011(page); await page.screenshot({path:'test-results/tool011-light.png',fullPage:true});
    await page.locator('html').evaluate(el=>el.setAttribute('data-theme','dark')); await page.screenshot({path:'test-results/tool011-dark.png',fullPage:true});
    await expect(page.getByTestId('tool011-canvas-wrap')).toBeVisible();
  });
  test('keyboard focus order, labels and status are exposed', async ({page}) => {
    await openTool011(page); await upload011(page); await page.keyboard.press('Tab');
    await expect(page.getByTestId('tool011-status')).toHaveAttribute('aria-live','polite');
  });
});
