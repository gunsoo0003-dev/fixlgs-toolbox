import {test,expect} from '@playwright/test';
import {openTool023,upload023,TOOL023_TESTIDS} from './helpers/tool-023';

test('023 does not expose horizontal overflow at mobile width',async({page})=>{await page.setViewportSize({width:360,height:800});await page.goto('/ja/app-icon-favicon-generator');const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);expect(overflow).toBeFalsy();});

test('023 chronic-design guard: hero copy, notes band, and expert density stay normalized',async({page})=>{
  await openTool023(page);
  const hero=page.locator('.toolbox-tool-detail-hero--single-line-description');
  await expect(hero).toBeVisible();
  const info=page.locator('.toolbox-tool-info-band--section-start');
  await expect(info).toHaveCount(1);
  await expect(info.locator('.toolbox-tool-info-band-head')).toHaveCount(1);
  await expect(info.locator('.toolbox-tool-info-band-list li')).toHaveCount(5);
  const expert=page.locator('.toolbox-tool-expert-post .toolbox-tool-practical-grid article');
  await expect(expert).toHaveCount(8);
});

test('023 chronic-workspace guard: loaded workspace keeps replacement drag-drop and reset split',async({page})=>{
  await upload023(page);
  await expect(page.getByTestId('tool023-workspace-dropzone')).toBeVisible();
  await expect(page.getByTestId('tool023-reset-settings')).toBeVisible();
  await expect(page.getByTestId('tool023-reset-all')).toBeVisible();
  await page.getByTestId('tool023-reset-settings').click();
  await expect(page.getByTestId(TOOL023_TESTIDS.preview)).toBeVisible();
  await page.getByTestId('tool023-reset-all').click();
  await expect(page.getByTestId('tool023-start-card')).toBeVisible();
});

test('023 chronic-preview guard: safe zone is Android-only and favicon preview is not low-res scaled output',async({page})=>{
  await upload023(page);
  await expect(page.getByTestId('tool023-safe-toggle')).toBeChecked();
  await page.getByRole('button',{name:'파비콘'}).click();
  await expect(page.getByTestId('tool023-safe-toggle')).toHaveCount(0);
  const favImgs=page.locator('[class*="faviconPreviewImage"]');
  await expect(favImgs).toHaveCount(3);
  for(let i=0;i<3;i++){
    const natural=await favImgs.nth(i).evaluate((img:HTMLImageElement)=>({w:img.naturalWidth,h:img.naturalHeight}));
    expect(natural.w).toBeGreaterThanOrEqual(180);
    expect(natural.h).toBeGreaterThanOrEqual(180);
  }
});
