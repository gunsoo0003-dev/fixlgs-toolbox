import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const fixture=(name:string)=>path.join(process.cwd(),'test-fixtures',name);
const sample=fs.readFileSync(fixture('sample.jpg'));
const uniqueJpeg=(name:string, extra=0, marker=1)=>({name,mimeType:'image/jpeg',buffer:Buffer.concat([sample,Buffer.alloc(extra),Buffer.from([marker])])});

test.describe('008 comprehensive validation',()=>{
  test('routes, category 02, expert content and localized UI', async({page})=>{
    for (const [locale,title] of [['ko','이미지 자르기·회전기'],['en','Image Cropper & Rotator'],['ja','画像切り抜き・回転ツール']] as const){
      await page.goto(`/${locale}/image-cropper-rotator`);
      await expect(page.locator('h1')).toContainText(title);
      await expect(page.getByText('008 · IMAGE EDIT')).toBeVisible();
      await expect(page.locator('a[href$="/category/image-edit"]').first()).toBeVisible();
      await expect(page.getByTestId('cropper-workbench')).toBeVisible();
      await expect(page.locator('.toolbox-tool-format-guide').first()).toBeVisible();
    }
  });

  test('all executable controls are real buttons',async({page})=>{
    await page.goto('/ko/image-cropper-rotator');
    await page.getByTestId('cropper-file-input').setInputFiles(fixture('sample.jpg'));
    for(const name of ['자르기 조정','이미지 이동','회전','반전','보기','더보기','건너뛰기','결과 확인']) await expect(page.getByRole('button',{name,exact:true})).toBeVisible();
  });

  test('core edit flow, result and distinct downloads',async({page})=>{
    await page.goto('/ko/image-cropper-rotator');
    await page.getByTestId('cropper-file-input').setInputFiles(fixture('sample.jpg'));
    await page.getByRole('button',{name:'회전',exact:true}).click();
    await page.getByRole('button',{name:'오른쪽으로 90도'}).click();
    await page.getByRole('button',{name:'반전',exact:true}).click();
    await page.getByRole('button',{name:'좌우 반전'}).click();
    await page.getByRole('button',{name:'실행 취소'}).click();
    await page.getByRole('button',{name:'결과 확인'}).click();
    await expect(page.getByRole('heading',{name:'편집 결과'})).toBeVisible();
    await expect(page.locator('[data-testid^="cropper-download-"]:not([data-testid="cropper-download-zip"])').first()).toBeVisible();
    await expect(page.getByTestId('cropper-download-zip')).toBeVisible();
  });

  test('precise controls, batch target, skip and original inclusion',async({page})=>{
    await page.goto('/ko/image-cropper-rotator');
    await page.getByTestId('cropper-file-input').setInputFiles([fixture('sample.jpg'),fixture('transparent.png')]);
    await page.getByRole('button',{name:'더보기',exact:true}).click();
    await expect(page.getByRole('button',{name:'좌표 적용'})).toBeVisible();
    await page.getByTestId('cropper-batch-details').locator('summary').click();
    await expect(page.getByTestId('cropper-batch-selected')).toBeVisible();
    await page.getByRole('button',{name:'건너뛰기'}).click();
    await page.getByRole('button',{name:'결과 확인'}).click();
    await expect(page.getByRole('button',{name:'원본으로 포함'})).toBeVisible();
  });

  test('wheel zoom and all eight crop handles',async({page})=>{
    await page.goto('/ko/image-cropper-rotator');
    await page.getByTestId('cropper-file-input').setInputFiles(fixture('sample.jpg'));
    for(const cls of ['handle-lt','handle-t','handle-rt','handle-r','handle-rb','handle-b','handle-lb','handle-l']) await expect(page.locator(`.${cls}`)).toBeVisible();
    await page.getByTestId('cropper-stage').hover(); await page.mouse.wheel(0,-120);
    await expect(page.getByText(/110%|120%/)).toBeVisible();
  });

  test('deduplicates identical content',async({page})=>{
    await page.goto('/ko/image-cropper-rotator');
    await page.getByTestId('cropper-file-input').setInputFiles([fixture('sample.jpg'),fixture('sample.jpg')]);
    await expect(page.locator('.cropper-file-row')).toHaveCount(1);
  });

  test('accepts 10 unique files and rejects the 11th',async({page})=>{
    await page.goto('/ko/image-cropper-rotator');
    const files=Array.from({length:11},(_,i)=>uniqueJpeg(`u${i}.jpg`,0,i+1));
    await page.getByTestId('cropper-file-input').setInputFiles(files);
    await expect(page.locator('.cropper-file-row')).toHaveCount(10);
  });

  test('rejects unsupported, zero-byte, animated markers and MIME mismatch',async({page})=>{
    await page.goto('/ko/image-cropper-rotator');
    const animated={name:'animated.webp',mimeType:'image/webp',buffer:Buffer.concat([fs.readFileSync(fixture('sample.webp')),Buffer.from('ANIM')])};
    const bad=[{name:'zero.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(0)},animated,{name:'fake.jpg',mimeType:'image/jpeg',buffer:Buffer.from('<svg></svg>')}];
    await page.getByTestId('cropper-file-input').setInputFiles(bad);
    await expect(page.locator('.cropper-file-row')).toHaveCount(0);
    await expect(page.getByTestId('cropper-message')).toBeVisible();
  });

  test('per-file byte safety limit',async({page})=>{
    await page.goto('/ko/image-cropper-rotator');
    await page.getByTestId('cropper-file-input').setInputFiles(uniqueJpeg('over.jpg',15*1024*1024,7));
    await expect(page.locator('.cropper-file-row')).toHaveCount(0);
    await expect(page.getByTestId('cropper-message')).toContainText('안전한도');
  });

  test('pixel and side boundaries',async({page})=>{
    await page.addInitScript(()=>{
      const original=createImageBitmap;
      Object.defineProperty(window,'__originalCreateImageBitmap',{value:original});
      window.createImageBitmap=async(blob:ImageBitmapSource)=>{
        const file=blob as File;
        const dims=file.name.includes('side-over')?{width:16385,height:1}:file.name.includes('pixels-over')?{width:5000,height:3400}:{width:5000,height:3397};
        return {width:dims.width,height:dims.height,close(){}} as ImageBitmap;
      };
    });
    await page.goto('/ko/image-cropper-rotator');
    const ok=uniqueJpeg('pixels-ok.jpg',0,21);
    const overPixels=uniqueJpeg('pixels-over.jpg',0,22);
    const overSide=uniqueJpeg('side-over.jpg',0,23);
    await page.getByTestId('cropper-file-input').setInputFiles(ok);
    await expect(page.locator('.cropper-file-row')).toHaveCount(1);

    // 각 경계 입력은 새 페이지 상태에서 검증한다. 결과 화면에만 존재하는
    // 전체 초기화 버튼에 의존하지 않아 불필요한 대기와 타임아웃을 막는다.
    await page.reload();
    await page.getByTestId('cropper-file-input').setInputFiles(overPixels);
    await expect(page.locator('.cropper-file-row')).toHaveCount(0);
    await expect(page.getByTestId('cropper-message')).toContainText('안전한도');

    await page.reload();
    await page.getByTestId('cropper-file-input').setInputFiles(overSide);
    await expect(page.locator('.cropper-file-row')).toHaveCount(0);
    await expect(page.getByTestId('cropper-message')).toContainText('안전한도');
  });

  test('local processing does not upload user file',async({page})=>{
    const writes:string[]=[]; page.on('request',r=>{if(['POST','PUT','PATCH'].includes(r.method())) writes.push(r.url());});
    await page.goto('/ko/image-cropper-rotator');
    await page.getByTestId('cropper-file-input').setInputFiles(fixture('sample.jpg'));
    await page.waitForTimeout(300);
    expect(writes).toEqual([]);
  });

  test('SEO, sitemap and robots',async({page,request})=>{
    await page.goto('/ko/image-cropper-rotator');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/\/ko\/image-cropper-rotator$/);
    for(const lang of ['ko','en','ja']) await expect(page.locator(`link[hreflang="${lang}"]`)).toHaveCount(1);
    const sm=await (await request.get('/sitemap.xml')).text(); for(const l of ['ko','en','ja']) expect(sm).toContain(`/${l}/image-cropper-rotator`);
    const rb=await (await request.get('/robots.txt')).text(); expect(rb).toContain('sitemap.xml');
  });

  test('no horizontal overflow in current viewport',async({page})=>{
    await page.goto('/ko/image-cropper-rotator');
    await page.getByTestId('cropper-file-input').setInputFiles(fixture('sample.jpg'));
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('source constants and exclusions remain explicit',async()=>{
    const src=fs.readFileSync(path.join(process.cwd(),'components/image-cropper-rotator-tool.tsx'),'utf8');
    expect(src).toContain('count: 10'); expect(src).toContain('15 * 1024 * 1024'); expect(src).toContain('50 * 1024 * 1024');
    expect(src).toContain('pixels: 16_986_931'); expect(src).toContain('side: 16_384'); expect(src).toContain('MAX_UNDO = 30');
    expect(src).not.toContain('image/avif');
  });
});
