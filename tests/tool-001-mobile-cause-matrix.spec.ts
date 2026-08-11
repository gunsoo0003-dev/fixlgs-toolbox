import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const root = process.cwd();
const outDir = path.join(root, 'test-results');
const fixture = (n:string)=>path.join(root,'test-fixtures',n);

type R={label:string;category:string;expected:string;selected:boolean;accepted:boolean;preview:boolean;conversion:string;message:string;runtimeErrors:string[];notes:string[]};

async function open(page:Page){
  await page.goto('/ko/jpg-png-webp-image-converter',{waitUntil:'domcontentloaded'});
  await expect(page.getByTestId('converter-file-input')).toBeAttached();
}
async function injectRuntimeCapture(page:Page){
  await page.evaluate(()=>{
    const w=window as any; w.__causeErrors=[];
    addEventListener('error',e=>w.__causeErrors.push(`error:${e.message}`));
    addEventListener('unhandledrejection',e=>w.__causeErrors.push(`rejection:${String(e.reason)}`));
  });
}
async function choose(page:Page,payload:string|{name:string;mimeType:string;buffer:Buffer}){
  const trigger=page.locator('.toolbox-upload-focus button').first();
  const p=page.waitForEvent('filechooser'); await trigger.tap(); const ch=await p; await ch.setFiles(payload as any);
}
async function state(page:Page, run=true){
  await page.waitForTimeout(250);
  const card=page.locator('[data-testid="converter-file-card"]'); const accepted=await card.count()>0;
  let preview=false, conversion='NOT_RUN';
  if(accepted){
    preview=await card.first().locator('img').first().evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0).catch(()=>false);
    if(run){ await page.getByTestId('converter-run').click(); await expect(card.first()).toHaveAttribute('data-status',/done|error/,{timeout:20000}).catch(()=>{}); conversion=await card.first().getAttribute('data-status')||'UNKNOWN'; }
  }
  const message=(await page.locator('.toolbox-tool-workflow').innerText().catch(()=>'' )).replace(/\s+/g,' ').slice(0,600);
  const runtimeErrors=await page.evaluate(()=>((window as any).__causeErrors||[]) as string[]);
  return {accepted,preview,conversion,message,runtimeErrors};
}
async function patch(page:Page, mode:string){
  await page.evaluate((m)=>{
    const w=window as any;
    if(m==='AB_FAIL_ONCE'){const o=Blob.prototype.arrayBuffer;let n=0;Blob.prototype.arrayBuffer=function(){if(++n===1)return Promise.reject(new DOMException('transient','NotReadableError'));return o.call(this)};}
    if(m==='AB_FAIL_ALWAYS'){Blob.prototype.arrayBuffer=function(){return Promise.reject(new DOMException('provider read denied','NotReadableError'));};}
    if(m==='AB_DELAY_5000'){const o=Blob.prototype.arrayBuffer;Blob.prototype.arrayBuffer=async function(){await new Promise(r=>setTimeout(r,5000));return o.call(this)};}
    if(m==='BITMAP_MISSING'){(w as any).createImageBitmap=undefined;}
    if(m==='BITMAP_THROW'){(w as any).createImageBitmap=async()=>{throw new DOMException('decode','InvalidStateError')};}
    if(m==='OBJECTURL_THROW'){URL.createObjectURL=()=>{throw new DOMException('blob url unavailable','NotReadableError')};}
    if(m==='PREVIEW_OBJECTURL_THROW'){const o=URL.createObjectURL;let n=0;URL.createObjectURL=(b:Blob)=>{n++;if(n>=1)throw new DOMException('preview blob url unavailable','NotReadableError');return o(b)};}
    if(m==='RANDOMUUID_MISSING'){(crypto as any).randomUUID=undefined;}
    if(m==='RANDOMUUID_THROW'){(crypto as any).randomUUID=()=>{throw new DOMException('uuid','NotSupportedError')};}
    if(m==='REVOKE_THROW'){URL.revokeObjectURL=()=>{throw new DOMException('revoke','InvalidStateError')};}
  },mode);
}

const cases=[
  ['MIME_IMAGE_JPG','metadata','image/jpg MIME alias','sample.jpg','mobile.jpg','image/jpg','NONE'],
  ['MIME_PJPEG','metadata','image/pjpeg MIME alias','sample.jpg','mobile.jpg','image/pjpeg','NONE'],
  ['MIME_XPNG','metadata','image/x-png MIME alias','square.png','mobile.png','image/x-png','NONE'],
  ['MIME_EMPTY','metadata','blank MIME','sample.jpg','mobile.jpg','','NONE'],
  ['MIME_OCTET','metadata','generic MIME','sample.jpg','mobile.jpg','application/octet-stream','NONE'],
  ['NAME_UPPER','metadata','uppercase extension','sample.jpg','MOBILE.JPG','image/jpeg','NONE'],
  ['NAME_MULTI_DOT','metadata','multiple dots','sample.jpg','photo.edit.final.jpg','image/jpeg','NONE'],
  ['NAME_UNICODE','metadata','unicode provider display name','sample.jpg','사진_日本語_😀.jpg','image/jpeg','NONE'],
  ['NAME_NO_EXT','metadata','no extension though JPEG bytes','sample.jpg','content_12345','image/jpeg','NONE'],
  ['NAME_WRONG_EXT','metadata','JPEG bytes named PNG','sample.jpg','content.png','image/png','NONE'],
  ['JPEG_TRAILING_BYTES','signature','valid decodable JPEG with trailing provider bytes','sample.jpg','trailing.jpg','image/jpeg','TRAIL'],
  ['JPEG_EOI_MISSING','signature','JPEG missing terminal EOI','sample.jpg','noeoi.jpg','image/jpeg','NO_EOI'],
  ['PNG_TRAILING_BYTES','signature','PNG with trailing bytes','square.png','trailing.png','image/png','TRAIL'],
  ['LASTMODIFIED_ZERO','metadata','provider lastModified zero','sample.jpg','lm0.jpg','image/jpeg','LM0'],
  ['LASTMODIFIED_ONE','metadata','provider lastModified minimal','sample.jpg','lm1.jpg','image/jpeg','LM1'],
  ['ARRAYBUFFER_FAIL_ONCE','byte-read','transient File.arrayBuffer failure','sample.jpg','ab1.jpg','image/jpeg','AB_FAIL_ONCE'],
  ['ARRAYBUFFER_FAIL_ALWAYS','byte-read','persistent File.arrayBuffer failure','sample.jpg','ab2.jpg','image/jpeg','AB_FAIL_ALWAYS'],
  ['ARRAYBUFFER_DELAY_5000','byte-read','very slow provider read','sample.jpg','slow.jpg','image/jpeg','AB_DELAY_5000'],
  ['BITMAP_API_MISSING','decode','createImageBitmap unavailable fallback','sample.jpg','nobitmap.jpg','image/jpeg','BITMAP_MISSING'],
  ['BITMAP_THROW','decode','createImageBitmap rejects fallback','sample.jpg','bitmapfail.jpg','image/jpeg','BITMAP_THROW'],
  ['OBJECTURL_THROW','decode','blob URL unavailable when fallback/preview needed','sample.jpg','urlfail.jpg','image/jpeg','OBJECTURL_THROW'],
  ['RANDOMUUID_MISSING','post-decode','crypto.randomUUID unavailable','sample.jpg','uuidmissing.jpg','image/jpeg','RANDOMUUID_MISSING'],
  ['RANDOMUUID_THROW','post-decode','crypto.randomUUID throws','sample.jpg','uuidthrow.jpg','image/jpeg','RANDOMUUID_THROW'],
  ['RAPID_MULTI_8','event/concurrency','8 files in one picker selection','sample.jpg','multi.jpg','image/jpeg','MULTI8'],
  ['RAPID_RESELECT','event/concurrency','same file can be reselected after async completion','sample.jpg','reselect.jpg','image/jpeg','RESELECT'],
  ['TWO_FAST_SELECTIONS','event/concurrency','second picker selection immediately after first','sample.jpg','fast.jpg','image/jpeg','TWO_FAST'],
  ['INPUT_CLEAR_DURING_READ','lifecycle','input clear while provider read pending','sample.jpg','clear.jpg','image/jpeg','CLEAR_DURING'],
  ['INPUT_REMOVE_DURING_READ','lifecycle','input DOM removal while provider read pending','sample.jpg','remove.jpg','image/jpeg','REMOVE_DURING'],
  ['VISIBILITY_CHANGE_DURING_READ','lifecycle','visibility/focus transition during read','sample.jpg','focus.jpg','image/jpeg','VISIBILITY'],
  ['DELAYED_READ_10S','lifecycle','captured File remains readable after long picker-return delay','sample.jpg','delay10.jpg','image/jpeg','DELAY10'],
] as const;

test.describe('TOOL001 exhaustive locally reproducible mobile cause matrix',()=>{
 test.use({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
 test('cause matrix',async({browser})=>{
  test.setTimeout(600000); fs.mkdirSync(outDir,{recursive:true}); const results:R[]=[];
  const persist=(phase:string)=>{const report={generatedAt:new Date().toISOString(),phase,expected:cases.length,results};fs.writeFileSync(path.join(outDir,'tool001-mobile-cause-matrix.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(outDir,'tool001-mobile-cause-matrix.txt'),['TOOL001 MOBILE CAUSE MATRIX V15',`phase=${phase}`,`count=${results.length}/${cases.length}`,...results.map(r=>`${r.label}\tcategory=${r.category}\taccepted=${r.accepted}\tpreview=${r.preview}\tconversion=${r.conversion}\tmessage=${r.message}\truntime=${JSON.stringify(r.runtimeErrors)}\tnotes=${JSON.stringify(r.notes)}`)].join('\n'));};
  persist('STARTED');
  for(let i=0;i<cases.length;i++){
   const [label,category,expected,src,name,mime,mode]=cases[i]; const pfx=`[C${String(i+1).padStart(2,'0')}/${cases.length}]`; console.log(`\n${pfx} ${label} START - ${expected}`);
   const notes:string[]=[]; let selected=false; let s={accepted:false,preview:false,conversion:'NOT_RUN',message:'',runtimeErrors:[] as string[]};
   let context:any=null; let page:any=null;
   try{
    await Promise.race([
     (async()=>{
    context=await browser.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
    page=await context.newPage(); page.setDefaultTimeout(7000); page.setDefaultNavigationTimeout(7000);
    await open(page); await injectRuntimeCapture(page);
    const original=fs.readFileSync(fixture(src)); let buffer=original; let payloadName=name; let lastModified=Date.now();
    if(mode==='TRAIL') buffer=Buffer.concat([original,Buffer.from([0,0,0,0,0x41,0x4e,0x44,0x52,0x4f,0x49,0x44])]);
    if(mode==='NO_EOI') buffer=original.subarray(0,Math.max(0,original.length-2));
    if(mode==='LM0') lastModified=0; if(mode==='LM1') lastModified=1;
    if(['AB_FAIL_ONCE','AB_FAIL_ALWAYS','AB_DELAY_5000','BITMAP_MISSING','BITMAP_THROW','OBJECTURL_THROW','RANDOMUUID_MISSING','RANDOMUUID_THROW'].includes(mode)) await patch(page,mode);
    if(mode==='MULTI8'){
      const trigger=page.locator('.toolbox-upload-focus button').first();const cp=page.waitForEvent('filechooser');await trigger.tap();const ch=await cp;await ch.setFiles(Array.from({length:8},(_,k)=>({name:`m${k}.jpg`,mimeType:'image/jpeg',buffer:original})));selected=true;
    }else{
      await choose(page,{name:payloadName,mimeType:mime,buffer}); selected=true;
    }
    if(mode==='CLEAR_DURING'||mode==='REMOVE_DURING'){
      await page.evaluate((m)=>{const input=document.querySelector('[data-testid="converter-file-input"]') as HTMLInputElement|null;if(!input)return;if(m==='CLEAR_DURING')input.value='';else input.remove();},mode);
    }
    if(mode==='VISIBILITY') await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));});
    if(mode==='DELAY10') await page.waitForTimeout(10000);
    if(mode==='RESELECT'){
      await page.waitForTimeout(800); s=await state(page,false);
      const input=page.getByTestId('converter-file-input'); await input.setInputFiles([]); await input.setInputFiles({name:payloadName,mimeType:mime,buffer});
      notes.push('second same-file selection issued directly to stable file input');
    }
    if(mode==='TWO_FAST'){
      const input=page.getByTestId('converter-file-input'); await input.setInputFiles({name:'fast2.jpg',mimeType:'image/jpeg',buffer:original});
      notes.push('second selection issued directly without waiting for first workflow completion');
    }
    s=await state(page,true);
    if(mode==='MULTI8') notes.push(`cards=${await page.locator('[data-testid="converter-file-card"]').count()}`);
     })(),
     new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('SCENARIO_TIMEOUT_25000')),25000)),
    ]);
   }catch(e){
     const msg=String((e as Error)?.stack||e);
     notes.push(`${msg.includes('SCENARIO_TIMEOUT_25000')?'TIMEOUT':'EXCEPTION'}:${msg.slice(0,1500)}`);
   } finally {
     if(context) await context.close().catch(()=>{});
   }
   const r:R={label,category,expected,selected,accepted:s.accepted,preview:s.preview,conversion:s.conversion,message:s.message,runtimeErrors:s.runtimeErrors,notes};results.push(r);
   console.log(`${pfx} selected=${selected?'YES':'NO'} accepted=${r.accepted?'YES':'NO'} preview=${r.preview?'YES':'NO'} conversion=${r.conversion}`);if(r.notes.length)console.log(`${pfx} notes=${r.notes.join(' | ')}`);persist(`AFTER_${label}`);
  }
  persist('COMPLETE'); console.log(`\n[CAUSE MATRIX V15] COMPLETE ${results.length}/${cases.length}`);
  expect(results.length).toBe(cases.length);
 });
});
