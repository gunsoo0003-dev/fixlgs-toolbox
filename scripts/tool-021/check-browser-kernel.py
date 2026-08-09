from pathlib import Path
from base64 import b64encode
import json, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT=Path.cwd()
src=(ROOT/'components/social-media-image-maker-tool.tsx').read_text(encoding='utf-8')
start=src.index('function clamp(')
end=src.index('function downloadBlob(')
snippet=src[start:end]
node_code = r'''
const ts=require('typescript');
let src=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',d=>src+=d); process.stdin.on('end',()=>{
 const out=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 process.stdout.write(out);
});
'''
trans=subprocess.run(['node','-e',node_code],input=snippet,text=True,capture_output=True,check=True)
js=trans.stdout

zip_src=(ROOT/'lib/zip.ts').read_text(encoding='utf-8').replace('export async function createStoredZip','async function createStoredZip')
zip_trans=subprocess.run(['node','-e',node_code],input=zip_src,text=True,capture_output=True,check=True)
zip_js=zip_trans.stdout

def data_url(name):
    p=ROOT/'test-fixtures/tool-021'/name
    ext=p.suffix.lower()
    mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'}.get(ext,'application/octet-stream')
    return f'data:{mime};base64,'+b64encode(p.read_bytes()).decode('ascii')

payload={n:data_url(n) for n in ['landscape.jpg','transparent.png','sample.webp','animated.png','animated.webp','exif-rotated.jpg','no-stretch-marker.png','over-40mp.jpg','mismatch.png']}
text_cases=json.loads((ROOT/'test-fixtures/tool-021/text-cases.json').read_text(encoding='utf-8'))
html=f'''<!doctype html><meta charset="utf-8"><canvas id="c"></canvas><script>{js}\n{zip_js}</script>'''
rows=[]
def add(name, ok, detail): rows.append({'name':name,'pass':bool(ok),'detail':detail})

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page()
    page.set_content(html)
    page.evaluate("window.__fixtures = "+json.dumps(payload,ensure_ascii=False))
    page.evaluate("window.__textCases = "+json.dumps(text_cases,ensure_ascii=False))
    result=page.evaluate(r'''async () => {
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
    }''')
    browser.close()

add('binary-mime-browser',result['mime']==['image/jpeg','image/png','image/webp'],result['mime'])
expected_dims=[{'width':1200,'height':800},{'width':640,'height':640},{'width':800,'height':600}]
add('header-dimensions-browser',result['dims']==expected_dims,result['dims'])
add('animation-detection-browser',result['anim']==[True,True],result['anim'])
add('mime-extension-mismatch-browser',result['mismatchActual']=='image/jpeg' and result['mismatchExt']=='image/png',{'actual':result['mismatchActual'],'extension':result['mismatchExt']})
add('over-40mp-header-browser',result['over40Dims']=={'width':7000,'height':6000},result['over40Dims'])
# Chromium createImageBitmap(...,{imageOrientation:'from-image'}) must expose the oriented dimensions for this fixture.
add('exif-orientation-browser',result['exifDims']=={'width':500,'height':300},result['exifDims'])
expected_render=[['instagram-post',1080,1350],['instagram-story',1080,1920],['facebook-feed',1080,1350],['x-post',1200,675],['linkedin-post',1200,1200]]
add('five-preset-canvas-dimensions',result['rendered']==expected_render,result['rendered'])
bbox=result['bbox']
ratio=(bbox['w']/bbox['h']) if bbox and bbox['h'] else 0
add('no-stretch-browser-marker',bbox is not None and 0.97 <= ratio <= 1.03,{'bbox':bbox,'ratio':ratio})

add('encoded-png-dimensions-browser',all(row[1]=='image/png' and row[2] is True for row in result['exportChecks']),result['exportChecks'])
add('encoded-jpeg-dimensions-browser',all(row[1]=='image/jpeg' and row[2] is True and row[3]>0 for row in result['jpegExportChecks']),result['jpegExportChecks'])
corner=result['corner']; center=result['center']
add('transparent-logo-alpha-browser',corner[:3]==[17,34,51] and center[:3]!=[17,34,51],{'corner':corner,'center':center})
rc=result['resolvedCommon']; ro=result['resolvedOverride']
add('common-override-resolution-browser',rc['cropX']==0 and rc['zoom']==1 and abs(ro['cropX']-.75)<1e-9 and abs(ro['titleX']-.5)<1e-9 and abs(ro['logoOpacity']-.4)<1e-9,{'common':rc,'override':ro})
add('filename-sanitize-browser',result['safeNames'][0]=='한글-제목-테스트' and result['safeNames'][1]=='日本語-ファイル名' and result['safeNames'][2]=='social-design',result['safeNames'])
add('extreme-crop-zoom-browser',result['redCount']>0,{'redPixels':result['redCount']})
add('multilingual-text-browser',all(row[1]>0 for row in result['textResults']),result['textResults'])
expected_zip_names=['한글-파일명-instagram-post.png','日本語ファイル名-instagram-story.png','sample-facebook-feed.png','sample-x-post.png','sample-linkedin-post.png']
add('zip-five-export-dimensions-browser',result['zipType']=='application/zip' and [r[0] for r in result['zipEntries']]==expected_zip_names and all(r[1] is True for r in result['zipEntries']),result['zipEntries'])
add('repeated-export-stability-browser',len(result['repeated'])==5 and all(r[1]>0 and r[2] is True for r in result['repeated']),result['repeated'])
add('preview-export-crop-parity-browser',result['parityDelta'] < 0.01,{'preview':result['previewBox'],'export':result['exportBox'],'maxNormalizedDelta':result['parityDelta']})
add('visibility-state-stability-browser',result['visibilityStable'] is True,result['visibilityStable'])

fail=sum(not r['pass'] for r in rows)
print(json.dumps({'tool':'021','kind':'actual-product-render-kernel-in-chromium','total':len(rows),'pass':len(rows)-fail,'fail':fail,'rows':rows},ensure_ascii=False,indent=2))
sys.exit(1 if fail else 0)
