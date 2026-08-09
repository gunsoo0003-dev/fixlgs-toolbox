import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openTool020Harness,TOOL020_TESTIDS,tool020Fixture,tool020Root} from './helpers/tool-020';

test.describe('020 boundary-only',()=>{
  test('MIME/extension mismatch is rejected explicitly',async({page})=>{
    const root=await openTool020Harness(page);
    const buffer=fs.readFileSync(tool020Fixture('mime-mismatch.jpg'));
    await root.getByTestId(TOOL020_TESTIDS.backgroundInput).setInputFiles({name:'mismatch.jpg',mimeType:'image/png',buffer});
    await expect(root.getByRole('alert'),'PRODUCT_FAIL: MIME/extension mismatch was not surfaced').toBeVisible();
  });

  test('animated PNG and WebP markers are rejected',async({page})=>{
    for(const [file,mime] of [['animated-marker.png','image/png'],['animated-marker.webp','image/webp']] as const){
      const root=await openTool020Harness(page);
      await root.getByTestId(TOOL020_TESTIDS.backgroundInput).setInputFiles({name:file,mimeType:mime,buffer:fs.readFileSync(tool020Fixture(file))});
      await expect(root.getByRole('alert'),'PRODUCT_FAIL: animated image was not rejected').toBeVisible();
    }
  });

  test('corrupted JPG is rejected without exposing a false editor state',async({page})=>{
    const root=await openTool020Harness(page);
    await root.getByTestId(TOOL020_TESTIDS.backgroundInput).setInputFiles(tool020Fixture('corrupted.jpg'));
    await expect(root.getByRole('alert'),'PRODUCT_FAIL: corrupt JPG was not rejected').toBeVisible();
    await expect(root.getByTestId(TOOL020_TESTIDS.preview),'HARNESS_ERROR: corrupt upload unexpectedly switched DOM state').toHaveCount(0);
  });
});
