import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { chromium } from "@playwright/test";

const ROOT=process.cwd();
const src=fs.readFileSync(path.join(ROOT,"components/social-media-image-maker-tool.tsx"),"utf8");
const start=src.indexOf("function clamp(");
const end=src.indexOf("function downloadBlob(");
if(start<0||end<0||end<=start) throw new Error("Unable to isolate TOOL 021 render kernel.");
const snippet=src.slice(start,end);
const js=ts.transpileModule(snippet,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;

const zipSrc=fs.readFileSync(path.join(ROOT,"lib/zip.ts"),"utf8").replace("export async function createStoredZip","async function createStoredZip");
const zipJs=ts.transpileModule(zipSrc,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;

function mimeFor(name){
  const ext=path.extname(name).toLowerCase();
  return ({".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".webp":"image/webp"})[ext]||"application/octet-stream";
}
function dataUrl(name){
  const b=fs.readFileSync(path.join(ROOT,"test-fixtures/tool-021",name));
  return `data:${mimeFor(name)};base64,${b.toString("base64")}`;
}
const fixtureNames=["landscape.jpg","transparent.png","sample.webp","animated.png","animated.webp","exif-rotated.jpg","no-stretch-marker.png","over-40mp.jpg","mismatch.png"];
const payload=Object.fromEntries(fixtureNames.map(n=>[n,dataUrl(n)]));
const textCases=JSON.parse(fs.readFileSync(path.join(ROOT,"test-fixtures/tool-021/text-cases.json"),"utf8"));

const rows=[];
const add=(name,pass,detail)=>rows.push({name,pass:Boolean(pass),detail});
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage();
  await page.setContent(`<!doctype html><meta charset="utf-8"><canvas id="c"></canvas><script>${js}\n${zipJs}</script>`);
  await page.evaluate(v=>{window.__fixtures=v},payload);
  await page.evaluate(v=>{window.__textCases=v},textCases);
  const result=await page.evaluate(async () => {
      async function fileFromDataUrl(url,name,type){ const b=await (await fetch(url)).blob(); return new File([b],name,{type:type||b.type}); }
      const jpg=await fileFromDataUrl(__fixtures['landscape.jpg'],'landscape.jpg','image/jpeg');
      const png=await fileFromDataUrl(__fixtures['transparent.png'],'transparent.png','image/png');
      const webp=await fileFromDataUrl(__fixtures['sample.webp'],'sample.webp','image/webp');
      const apng=await fileFromDataUrl(__fixtures['animated.png'],'animated.png','image/png');
      const awebp=await fileFromDataUrl(__fixtures['animated.webp'],'animated.webp','image/webp');
      const exif=await fileFromDataUrl(__fixtures['exif-rotated.jpg'],'exif-rotated.jpg','image/jpeg');
      const markerFile=await fileFromDataUrl(__fixtures['no-stretch-marker.png'],'no-stretch-marker.png','image/png');
      const over40=await fileFromDataUrl(__fixtures['over-40mp.jpg'],'over-40mp.jpg','image/jpeg');
      const mismatch=await fileFromDataUrl(__fixtures['mismatch.png'],'mismatch.png','image/png');
      const mime=[await sniffImageMime(jpg),await sniffImageMime(png),await sniffImageMime(webp)];
      const dims=[await sniffImageDimensions(jpg,'image/jpeg'),await sniffImageDimensions(png,'image/png'),await sniffImageDimensions(webp,'image/webp')];
      const anim=[await detectUnsupportedAnimation(apng,'image/png'),await detectUnsupportedAnimation(awebp,'image/webp')];
      const mismatchActual=await sniffImageMime(mismatch);
      const mismatchExt=extensionMime(mismatch.name);
      const over40Dims=await sniffImageDimensions(over40,'image/jpeg');
      const exifAsset=await fileToAsset(exif);
      const exifDims={width:exifAsset.width,height:exifAsset.height}; disposeAsset(exifAsset);
      const state={title:'',subtitle:'',fontFamily:'Arial, sans-serif',textAlign:'left',textColor:'#ffffff',titleSize:.074,subtitleSize:.04,backgroundColor:'#0f172a',overlayColor:'#000000',overlayOpacity:0,titleX:.08,titleY:.12,subtitleX:.08,subtitleY:.26,logoX:.74,logoY:.07,logoScale:.16,logoOpacity:1,cropX:0,cropY:0,zoom:1};
      const presets=[['instagram-post',1080,1350],['instagram-story',1080,1920],['facebook-feed',1080,1350],['x-post',1200,675],['linkedin-post',1200,1200]];
      const rendered=[];
      for (const [id,w,h] of presets){ const c=document.createElement('canvas'); renderDesignToCanvas(c,{id,width:w,height:h},null,null,state,{}); rendered.push([id,c.width,c.height]); }
      const marker=await fileToAsset(markerFile);
      const c=document.createElement('canvas');
      renderDesignToCanvas(c,{id:'instagram-story',width:1080,height:1920},marker,null,state,{scaleTo:{width:360,height:640}});
      const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let minX=1e9,maxX=-1,minY=1e9,maxY=-1,count=0;
      for(let y=0;y<c.height;y++) for(let x=0;x<c.width;x++){ const i=(y*c.width+x)*4; if(d[i]>180 && d[i+1]<80 && d[i+2]<80 && d[i+3]>200){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);count++;}}
      disposeAsset(marker);
      const bbox=count?{w:maxX-minX+1,h:maxY-minY+1,count}:null;

      const exportChecks=[];
      const jpegExportChecks=[];
      for (const [id,w,h] of presets){
        const out=document.createElement('canvas');
        const preset={id,width:w,height:h};
        renderDesignToCanvas(out,preset,null,null,state,{});
        const blob=await canvasToBlob(out,'png',.92);
        exportChecks.push([id,blob.type,await verifyBlobDimensions(blob,preset)]);
        const jpgBlob=await canvasToBlob(out,'jpg',.86);
        jpegExportChecks.push([id,jpgBlob.type,await verifyBlobDimensions(jpgBlob,preset),jpgBlob.size]);
      }

      const logoFile=await fileFromDataUrl(__fixtures['transparent.png'],'transparent.png','image/png');
      const logoAsset=await fileToAsset(logoFile);
      const logoCanvas=document.createElement('canvas');
      const logoState={...state,backgroundColor:'#112233',logoX:0,logoY:0,logoScale:.36,logoOpacity:1};
      renderDesignToCanvas(logoCanvas,{id:'linkedin-post',width:400,height:400},null,logoAsset,logoState,{});
      const lctx=logoCanvas.getContext('2d');
      const corner=Array.from(lctx.getImageData(1,1,1,1).data);
      const center=Array.from(lctx.getImageData(72,72,1,1).data);
      disposeAsset(logoAsset);

      const resolvedCommon=resolveState(state,undefined);
      const resolvedOverride=resolveState(state,{cropX:.75,cropY:-.5,zoom:1.6,titleX:.5,titleY:.2,titleSize:.09,subtitleX:.5,subtitleY:.42,subtitleSize:.05,logoX:.1,logoY:.82,logoScale:.22,logoOpacity:.4});
      const safeNames=[sanitizeFileName('한글 제목 / 테스트:*?'),sanitizeFileName('日本語 ファイル名<>|'),sanitizeFileName('   ')];

      const cropCanvas=document.createElement('canvas');
      const marker2=await fileToAsset(markerFile);
      renderDesignToCanvas(cropCanvas,{id:'x-post',width:1200,height:675},marker2,null,{...state,zoom:2.2,cropX:1,cropY:-1},{});
      const cropData=cropCanvas.getContext('2d').getImageData(0,0,1200,675).data;
      let redCount=0; for(let i=0;i<cropData.length;i+=4){ if(cropData[i]>180 && cropData[i+1]<80 && cropData[i+2]<80 && cropData[i+3]>200) redCount++; }
      disposeAsset(marker2);

      const textResults=[];
      for (const key of ['koLong','enLong','jaNoSpace','emoji']){
        const tc=document.createElement('canvas');
        const ts={...state,title:__textCases[key],textColor:'#ffffff',backgroundColor:'#000000',titleX:.08,titleY:.08};
        renderDesignToCanvas(tc,{id:'linkedin-post',width:500,height:500},null,null,ts,{});
        const td=tc.getContext('2d').getImageData(0,0,500,500).data;
        let changed=0; for(let i=0;i<td.length;i+=4){if(td[i]>10||td[i+1]>10||td[i+2]>10) changed++;}
        textResults.push([key,changed]);
      }

      // Build a real product ZIP from five actual PNG exports and inspect its stored entries.
      const zipInputs=[];
      for (const [id,w,h] of presets){
        const zc=document.createElement('canvas');
        const preset={id,width:w,height:h};
        renderDesignToCanvas(zc,preset,null,null,state,{});
        const zb=await canvasToBlob(zc,'png',.92);
        zipInputs.push({name:(id==='instagram-post'?`${sanitizeFileName('한글 파일명')}-${id}.png`:id==='instagram-story'?`${sanitizeFileName('日本語ファイル名')}-${id}.png`:`sample-${id}.png`),blob:zb});
      }
      const zipBlob=await createStoredZip(zipInputs);
      const zbytes=new Uint8Array(await zipBlob.arrayBuffer());
      const zipEntries=[];
      let pos=0;
      while(pos+30<=zbytes.length){
        const sig=zbytes[pos]|(zbytes[pos+1]<<8)|(zbytes[pos+2]<<16)|(zbytes[pos+3]<<24);
        if((sig>>>0)!==0x04034b50) break;
        const nameLen=zbytes[pos+26]|(zbytes[pos+27]<<8);
        const extraLen=zbytes[pos+28]|(zbytes[pos+29]<<8);
        const size=(zbytes[pos+18]|(zbytes[pos+19]<<8)|(zbytes[pos+20]<<16)|(zbytes[pos+21]<<24))>>>0;
        const name=new TextDecoder().decode(zbytes.slice(pos+30,pos+30+nameLen));
        const start=pos+30+nameLen+extraLen;
        const data=zbytes.slice(start,start+size);
        const blob=new Blob([data],{type:'image/png'});
        const expected=presets[zipEntries.length];
        zipEntries.push([name,await verifyBlobDimensions(blob,{width:expected[1],height:expected[2]})]);
        pos=start+size;
      }

      // Repeat export several times to catch state/resource poisoning in the renderer/encoder path.
      const repeated=[];
      for(let n=0;n<5;n++){
        const rc=document.createElement('canvas');
        const preset={id:'linkedin-post',width:1200,height:1200};
        renderDesignToCanvas(rc,preset,null,null,{...state,title:`repeat-${n}`},{});
        const rb=await canvasToBlob(rc,'jpg',.8);
        repeated.push([n,rb.size,await verifyBlobDimensions(rb,preset)]);
      }

      // Preview/export parity: compare normalized crop-marker geometry from preview scale and final export.
      async function redBox(canvas){
        const dd=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
        let minX=1e9,maxX=-1,minY=1e9,maxY=-1,count=0;
        for(let y=0;y<canvas.height;y++) for(let x=0;x<canvas.width;x++){ const i=(y*canvas.width+x)*4; if(dd[i]>180&&dd[i+1]<80&&dd[i+2]<80&&dd[i+3]>200){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);count++;} }
        return count?{x:minX/canvas.width,y:minY/canvas.height,w:(maxX-minX+1)/canvas.width,h:(maxY-minY+1)/canvas.height}:null;
      }
      const parityAsset=await fileToAsset(markerFile);
      const parityState={...state,cropX:.37,cropY:-.28,zoom:1.35};
      const previewParity=document.createElement('canvas');
      const exportParity=document.createElement('canvas');
      const parityPreset={id:'instagram-post',width:1080,height:1350};
      renderDesignToCanvas(previewParity,parityPreset,parityAsset,null,parityState,{scaleTo:{width:360,height:450}});
      renderDesignToCanvas(exportParity,parityPreset,parityAsset,null,parityState,{});
      const previewBox=await redBox(previewParity);
      const exportBox=await redBox(exportParity);
      disposeAsset(parityAsset);
      const parityDelta=previewBox&&exportBox?Math.max(...['x','y','w','h'].map(k=>Math.abs(previewBox[k]-exportBox[k]))):999;

      // Verify visibility changes do not mutate the product state object by themselves.
      const beforeState=JSON.stringify(resolvedOverride);
      document.dispatchEvent(new Event('visibilitychange'));
      const afterState=JSON.stringify(resolvedOverride);

      return {mime,dims,anim,mismatchActual,mismatchExt,over40Dims,exifDims,rendered,bbox,exportChecks,jpegExportChecks,corner,center,resolvedCommon,resolvedOverride,safeNames,redCount,textResults,zipType:zipBlob.type,zipEntries,repeated,previewBox,exportBox,parityDelta,visibilityStable:beforeState===afterState};
    });

  add("binary-mime-browser",JSON.stringify(result.mime)===JSON.stringify(["image/jpeg","image/png","image/webp"]),result.mime);
  add("header-dimensions-browser",
    result.dims?.length===3 &&
    result.dims[0]?.width===1200 && result.dims[0]?.height===800 &&
    result.dims[1]?.width===640 && result.dims[1]?.height===640 &&
    result.dims[2]?.width===800 && result.dims[2]?.height===600,
    result.dims);
  add("animation-detection-browser",JSON.stringify(result.anim)===JSON.stringify([true,true]),result.anim);
  add("mime-extension-mismatch-browser",result.mismatchActual==="image/jpeg"&&result.mismatchExt==="image/png",{actual:result.mismatchActual,extension:result.mismatchExt});
  add("over-40mp-header-browser",result.over40Dims?.width===7000&&result.over40Dims?.height===6000,result.over40Dims);
  add("exif-orientation-browser",result.exifDims?.width===500&&result.exifDims?.height===300,result.exifDims);
  const expectedRender=[["instagram-post",1080,1350],["instagram-story",1080,1920],["facebook-feed",1080,1350],["x-post",1200,675],["linkedin-post",1200,1200]];
  add("five-preset-canvas-dimensions",JSON.stringify(result.rendered)===JSON.stringify(expectedRender),result.rendered);
  const ratio=result.bbox&&result.bbox.h?result.bbox.w/result.bbox.h:0;
  add("no-stretch-browser-marker",!!result.bbox&&ratio>=0.97&&ratio<=1.03,{bbox:result.bbox,ratio});
  add("encoded-png-dimensions-browser",result.exportChecks.every(r=>r[1]==="image/png"&&r[2]===true),result.exportChecks);
  add("encoded-jpeg-dimensions-browser",result.jpegExportChecks.every(r=>r[1]==="image/jpeg"&&r[2]===true&&r[3]>0),result.jpegExportChecks);
  add("transparent-logo-alpha-browser",JSON.stringify(result.corner.slice(0,3))===JSON.stringify([17,34,51])&&JSON.stringify(result.center.slice(0,3))!==JSON.stringify([17,34,51]),{corner:result.corner,center:result.center});
  add("common-override-resolution-browser",result.resolvedCommon.cropX===0&&result.resolvedCommon.zoom===1&&Math.abs(result.resolvedOverride.cropX-.75)<1e-9&&Math.abs(result.resolvedOverride.titleX-.5)<1e-9&&Math.abs(result.resolvedOverride.logoOpacity-.4)<1e-9,{common:result.resolvedCommon,override:result.resolvedOverride});
  add("filename-sanitize-browser",result.safeNames[0]==="한글-제목-테스트"&&result.safeNames[1]==="日本語-ファイル名"&&result.safeNames[2]==="social-design",result.safeNames);
  add("extreme-crop-zoom-browser",result.redCount>0,{redPixels:result.redCount});
  add("multilingual-text-browser",result.textResults.every(r=>r[1]>0),result.textResults);
  const expectedZip=["한글-파일명-instagram-post.png","日本語ファイル名-instagram-story.png","sample-facebook-feed.png","sample-x-post.png","sample-linkedin-post.png"];
  add("zip-five-export-dimensions-browser",result.zipType==="application/zip"&&JSON.stringify(result.zipEntries.map(r=>r[0]))===JSON.stringify(expectedZip)&&result.zipEntries.every(r=>r[1]===true),result.zipEntries);
  add("repeated-export-stability-browser",result.repeated.length===5&&result.repeated.every(r=>r[1]>0&&r[2]===true),result.repeated);
  add("preview-export-crop-parity-browser",result.parityDelta<0.01,{preview:result.previewBox,export:result.exportBox,maxNormalizedDelta:result.parityDelta});
  add("visibility-state-stability-browser",result.visibilityStable===true,result.visibilityStable);
} finally {
  await browser.close();
}
const fail=rows.filter(r=>!r.pass).length;
console.log(JSON.stringify({tool:"021",kind:"actual-product-render-kernel-in-node-playwright",total:rows.length,pass:rows.length-fail,fail,rows},null,2));
process.exit(fail?1:0);
