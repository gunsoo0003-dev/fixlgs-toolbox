"use client";
import { materializeImageBlob } from "@/lib/mobile-file-materializer";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/site";

type Effect = "none" | "grayscale" | "sepia";
type Values={brightness:number;contrast:number;saturation:number;temperature:number;sharpness:number;effect:Effect};
type ResultInfo={size:number;format:string;width:number;height:number}|null;
const defaults:Values={brightness:0,contrast:0,saturation:0,temperature:0,sharpness:0,effect:"none"};
const MAX_PIXELS=19_200_000,MAX_SIDE=16_384,MAX_HISTORY=30;
const labels={
 ko:{select:"이미지 선택",drop:"이미지를 여기에 놓으세요",support:"JPG, PNG, WebP 지원 · 한 장 · 최대 1,920만 픽셀",replace:"다른 이미지 선택",local:"이미지는 서버로 전송되지 않으며 현재 브라우저에서만 처리됩니다.",auto:"자동보정",brightness:"밝기",contrast:"대비",saturation:"채도",temperature:"색온도",sharpness:"선명도",grayscale:"흑백",sepia:"세피아",reset:"초기값",resetAll:"모든 보정값 초기화",undo:"실행 취소",redo:"다시 실행",original:"원본",adjusted:"보정 결과",compare:"비교 보기",format:"출력 형식",quality:"출력 품질",filename:"파일명",download:"이미지 다운로드",downloadAgain:"다시 다운로드",working:"결과 생성 중",fullReset:"전체 초기화",cool:"차갑게",warm:"따뜻하게",error:"이미지를 읽을 수 없습니다.",unsupported:"지원하지 않는 이미지 형식입니다. JPG, PNG, WebP를 선택해 주세요.",empty:"빈 파일은 사용할 수 없습니다.",tooLarge:"최대 1,920만 픽셀 또는 한 변 16,384px를 초과한 이미지는 처리할 수 없습니다.",memory:"브라우저 메모리가 부족합니다.",transparent:"투명도",yes:"있음",no:"없음",fit:"화면 맞춤",zoomIn:"확대",zoomOut:"축소",bg:"JPG 배경색",result:"결과 정보",originalSize:"원본 용량",resultSize:"결과 용량",pixel:"픽셀 크기",applied:"적용값",ready:"다운로드 준비 완료",processing:"미리보기 생성 중",jpgNotice:"JPG는 투명도를 지원하지 않아 선택한 배경색으로 저장됩니다."},
 en:{select:"Select Image",drop:"Drop an image here",support:"Supports JPG, PNG and WebP · one image · up to 19.2 MP",replace:"Select Another Image",local:"Your image is processed only in this browser and is not uploaded to a server.",auto:"Auto Adjust",brightness:"Brightness",contrast:"Contrast",saturation:"Saturation",temperature:"Temperature",sharpness:"Sharpness",grayscale:"Grayscale",sepia:"Sepia",reset:"Reset Value",resetAll:"Reset All Adjustments",undo:"Undo",redo:"Redo",original:"Original",adjusted:"Adjusted",compare:"Compare",format:"Output Format",quality:"Output Quality",filename:"File Name",download:"Download Image",downloadAgain:"Download Again",working:"Creating Result",fullReset:"Reset All",cool:"Cooler",warm:"Warmer",error:"The image could not be read.",unsupported:"This image format is not supported. Select JPG, PNG, or WebP.",empty:"Empty files cannot be used.",tooLarge:"Images over 19.2 megapixels or 16,384px on either side cannot be processed.",memory:"The browser does not have enough memory.",transparent:"Transparency",yes:"Yes",no:"No",fit:"Fit",zoomIn:"Zoom in",zoomOut:"Zoom out",bg:"JPG background",result:"Result information",originalSize:"Original size",resultSize:"Result size",pixel:"Pixel size",applied:"Applied values",ready:"Ready to download",processing:"Creating preview",jpgNotice:"JPG does not support transparency and will use the selected background color."},
 ja:{select:"画像を選択",drop:"画像をここにドロップ",support:"JPG・PNG・WebPに対応 · 1枚 · 最大1,920万画素",replace:"別の画像を選択",local:"画像はサーバーに送信されず、現在のブラウザ内だけで処理されます。",auto:"自動補正",brightness:"明るさ",contrast:"コントラスト",saturation:"彩度",temperature:"色温度",sharpness:"シャープネス",grayscale:"白黒",sepia:"セピア",reset:"初期値",resetAll:"すべての補正をリセット",undo:"元に戻す",redo:"やり直す",original:"元画像",adjusted:"補正後",compare:"比較表示",format:"出力形式",quality:"出力品質",filename:"ファイル名",download:"画像をダウンロード",downloadAgain:"もう一度ダウンロード",working:"画像を作成中",fullReset:"すべて初期化",cool:"寒色",warm:"暖色",error:"画像を読み込めませんでした。",unsupported:"対応していない画像形式です。JPG・PNG・WebPを選択してください。",empty:"空のファイルは使用できません。",tooLarge:"1,920万画素または一辺16,384pxを超える画像は処理できません。",memory:"ブラウザのメモリが不足しています。",transparent:"透明度",yes:"あり",no:"なし",fit:"画面に合わせる",zoomIn:"拡大",zoomOut:"縮小",bg:"JPG背景色",result:"結果情報",originalSize:"元の容量",resultSize:"結果容量",pixel:"ピクセルサイズ",applied:"適用値",ready:"ダウンロードの準備完了",processing:"プレビューを作成中",jpgNotice:"JPGは透明度に対応していないため、選択した背景色で保存されます。"}
} as const;

function clamp(v:number){return Math.max(0,Math.min(255,v));}
function renderPixels(src:ImageData,v:Values){
 const out=new ImageData(new Uint8ClampedArray(src.data),src.width,src.height),d=out.data;
 const c=(259*(v.contrast+255))/(255*(259-v.contrast)),sat=1+v.saturation/100,temp=v.temperature*.55;
 for(let i=0;i<d.length;i+=4){let r=d[i],g=d[i+1],b=d[i+2];r+=v.brightness*2.1;g+=v.brightness*2.1;b+=v.brightness*2.1;r=c*(r-128)+128;g=c*(g-128)+128;b=c*(b-128)+128;const lum=.2126*r+.7152*g+.0722*b;r=lum+(r-lum)*sat;g=lum+(g-lum)*sat;b=lum+(b-lum)*sat;r+=temp;b-=temp;g-=Math.abs(temp)*.08;if(v.effect==="grayscale"){r=g=b=lum}else if(v.effect==="sepia"){const rr=.393*r+.769*g+.189*b,gg=.349*r+.686*g+.168*b,bb=.272*r+.534*g+.131*b;r=rr;g=gg;b=bb}d[i]=clamp(r);d[i+1]=clamp(g);d[i+2]=clamp(b)}
 if(v.sharpness>0){const base=new Uint8ClampedArray(d),w=src.width,h=src.height,a=Math.min(.9,v.sharpness/100*.8);for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const p=(y*w+x)*4;for(let k=0;k<3;k++){const blur=(base[p-4+k]+base[p+4+k]+base[p-w*4+k]+base[p+w*4+k]+base[p+k]*4)/8;d[p+k]=clamp(base[p+k]+(base[p+k]-blur)*a*2.2)}}}
 return out;
}
function formatBytes(n:number){return n<1024?`${n} B`:n<1024*1024?`${(n/1024).toFixed(1)} KB`:`${(n/1024/1024).toFixed(2)} MB`;}
function safeName(v:string){return v.replace(/[\\/:*?"<>|]/g,"-").replace(/[. ]+$/g,"").slice(0,120)||"image-adjusted";}

export function ImageBrightnessColorAdjusterTool({locale}:{locale:Locale}){
 const t=labels[locale],input=useRef<HTMLInputElement>(null),canvas=useRef<HTMLCanvasElement>(null),source=useRef<ImageData|null>(null),loadToken=useRef(0);
 const operationToken=useRef(0),valuesRef=useRef<Values>(defaults);
 const [file,setFile]=useState<File|null>(null),[values,setValues]=useState<Values>(defaults),[history,setHistory]=useState<Values[]>([defaults]),[index,setIndex]=useState(0),[view,setView]=useState<"original"|"adjusted"|"compare">("adjusted"),[compare,setCompare]=useState(50),[format,setFormat]=useState("original"),[quality,setQuality]=useState(92),[filename,setFilename]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[errorKind,setErrorKind]=useState<""|"format"|"decode"|"size"|"memory">(""),[status,setStatus]=useState(""),[zoom,setZoom]=useState(1),[bgColor,setBgColor]=useState("#ffffff"),[transparent,setTransparent]=useState(false),[dimensions,setDimensions]=useState({width:0,height:0}),[result,setResult]=useState<ResultInfo>(null);
 const historyRef=useRef<Values[]>([defaults]),indexRef=useRef(0);
 const info=useMemo(()=>file?`${file.name} · ${formatBytes(file.size)}`:"",[file]);
 const resolvedExt=file?(format==="original"?(file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg"):format):"jpg";
 function sameValues(a:Values,b:Values){return a.brightness===b.brightness&&a.contrast===b.contrast&&a.saturation===b.saturation&&a.temperature===b.temperature&&a.sharpness===b.sharpness&&a.effect===b.effect}
 function applyHistory(nextHistory:Values[],nextIndex:number){historyRef.current=nextHistory;indexRef.current=nextIndex;setHistory(nextHistory);setIndex(nextIndex)}
 function commit(next:Values){
  const currentHistory=historyRef.current,currentIndex=indexRef.current;
  valuesRef.current=next;setValues(next);setResult(null);
  if(sameValues(currentHistory[currentIndex],next))return;
  const nextHistory=[...currentHistory.slice(0,currentIndex+1),next].slice(-MAX_HISTORY);
  applyHistory(nextHistory,nextHistory.length-1);
 }
 function update<K extends keyof Values>(key:K,val:Values[K]){const next={...valuesRef.current,[key]:val};valuesRef.current=next;setValues(next);setResult(null)}
 function finish(){const next=valuesRef.current,current=historyRef.current[indexRef.current];if(!sameValues(current,next))commit(next)}
 function undo(){const currentIndex=indexRef.current;if(currentIndex<=0)return;const nextIndex=currentIndex-1,next=historyRef.current[nextIndex];valuesRef.current=next;setValues(next);setResult(null);applyHistory(historyRef.current,nextIndex)}
 function redo(){const currentIndex=indexRef.current;if(currentIndex>=historyRef.current.length-1)return;const nextIndex=currentIndex+1,next=historyRef.current[nextIndex];valuesRef.current=next;setValues(next);setResult(null);applyHistory(historyRef.current,nextIndex)}
 function resetAll(){commit({...defaults})}
 function fullReset(){loadToken.current++;operationToken.current++;setBusy(false);setFile(null);source.current=null;valuesRef.current=defaults;setValues(defaults);applyHistory([defaults],0);setError("");setErrorKind("");setStatus("");setResult(null);setFormat("original");setQuality(92);setFilename("");setZoom(1);setTransparent(false)}
 async function load(f:File){
  const token=++loadToken.current;operationToken.current++;setBusy(false);setError("");setErrorKind("");setStatus(t.processing);setResult(null);
  if(f.size===0){setError(t.empty);setErrorKind("decode");setStatus("");return}
  const ext=(f.name.split(".").pop()||"").toLowerCase();
  const extMime:Record<string,string[]>={jpg:["image/jpeg"],jpeg:["image/jpeg"],png:["image/png"],webp:["image/webp"]};
  if(!extMime[ext]||!extMime[ext].includes(f.type)){setError(t.unsupported);setErrorKind("format");setStatus("");return}
  try{const bmp=await createImageBitmap(f,{imageOrientation:"from-image"});if(token!==loadToken.current){bmp.close();return}if(bmp.width*bmp.height>MAX_PIXELS||bmp.width>MAX_SIDE||bmp.height>MAX_SIDE){setError(t.tooLarge);setErrorKind("size");setStatus("");bmp.close();return}const scale=Math.min(1,1400/bmp.width,900/bmp.height),oc=document.createElement("canvas");oc.width=Math.max(1,Math.round(bmp.width*scale));oc.height=Math.max(1,Math.round(bmp.height*scale));const ctx=oc.getContext("2d",{willReadFrequently:true});if(!ctx)throw new Error("canvas");ctx.drawImage(bmp,0,0,oc.width,oc.height);const img=ctx.getImageData(0,0,oc.width,oc.height);let hasAlpha=false;for(let i=3;i<img.data.length;i+=4){if(img.data[i]<255){hasAlpha=true;break}}source.current=img;setTransparent(hasAlpha);setDimensions({width:bmp.width,height:bmp.height});setFile(f);setFilename(safeName(f.name.replace(/\.[^.]+$/,"")+"-adjusted"));valuesRef.current=defaults;setValues(defaults);applyHistory([defaults],0);setView("adjusted");setZoom(1);setStatus("");bmp.close()}catch(e){setStatus("");setError(e instanceof RangeError?t.memory:t.error);setErrorKind(e instanceof RangeError?"memory":"decode")}
 }
 function onFile(e:ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(f)void load(f);e.target.value=""}
 useEffect(()=>()=>{loadToken.current++;operationToken.current++;source.current=null},[]);
 useEffect(()=>{if(!canvas.current||!source.current)return;const c=canvas.current;c.width=source.current.width;c.height=source.current.height;const ctx=c.getContext("2d");if(!ctx)return;if(view==="original"){ctx.putImageData(source.current,0,0);return}const adjusted=renderPixels(source.current,values);if(view==="adjusted"){ctx.putImageData(adjusted,0,0);return}ctx.putImageData(source.current,0,0);const x=Math.round(c.width*compare/100);ctx.putImageData(adjusted,0,0,0,0,x,c.height)},[values,view,compare,file]);
 function autoAdjust(){if(!source.current)return;const d=source.current.data;let lum=0,r=0,g=0,b=0,n=0,min=255,max=0;for(let i=0;i<d.length;i+=40){const y=(d[i]+d[i+1]+d[i+2])/3;r+=d[i];g+=d[i+1];b+=d[i+2];lum+=y;min=Math.min(min,y);max=Math.max(max,y);n++}lum/=n;r/=n;b/=n;const range=max-min;const next:Values={brightness:Math.round(Math.max(-24,Math.min(24,(128-lum)/5))),contrast:Math.round(Math.max(0,Math.min(18,(150-range)/10))),saturation:lum<55?8:range<80?6:3,temperature:Math.round(Math.max(-18,Math.min(18,(b-r)/8))),sharpness:0,effect:"none"};commit(next)}
 async function download(){if(!file||busy)return;const token=++operationToken.current;setBusy(true);setError("");setErrorKind("");setStatus(t.working);let bmp:ImageBitmap|null=null;try{bmp=await createImageBitmap(await materializeImageBlob(file),{imageOrientation:"from-image"});if(token!==operationToken.current)return;const c=document.createElement("canvas");c.width=bmp.width;c.height=bmp.height;const ctx=c.getContext("2d",{willReadFrequently:true});if(!ctx)throw new Error("canvas");if(resolvedExt==="jpg"){ctx.fillStyle=bgColor;ctx.fillRect(0,0,c.width,c.height)}ctx.drawImage(bmp,0,0);const img=renderPixels(ctx.getImageData(0,0,c.width,c.height),values);ctx.putImageData(img,0,0);const mime=resolvedExt==="png"?"image/png":resolvedExt==="webp"?"image/webp":"image/jpeg",blob=await new Promise<Blob|null>(res=>c.toBlob(res,mime,quality/100));if(token!==operationToken.current)return;if(!blob)throw new Error("blob");const href=URL.createObjectURL(blob);try{const a=document.createElement("a");a.href=href;a.download=`${safeName(filename)}.${resolvedExt}`;document.body.appendChild(a);a.click();a.remove();setResult({size:blob.size,format:resolvedExt.toUpperCase(),width:c.width,height:c.height});setStatus(t.ready)}finally{setTimeout(()=>URL.revokeObjectURL(href),0)}}catch(e){if(token===operationToken.current){setStatus("");setError(e instanceof RangeError?t.memory:t.error);setErrorKind(e instanceof RangeError?"memory":"decode")}}finally{bmp?.close();if(token===operationToken.current)setBusy(false)}}
 if(!file)return (
  <div className="toolbox-tool-workflow">
    <section className="toolbox-workbench">
      <div
        className="toolbox-workbench-upload"
        onDragOver={(event)=>event.preventDefault()}
        onDrop={(event)=>{event.preventDefault();const nextFile=event.dataTransfer.files[0];if(nextFile)void load(nextFile)}}
      >
        <div className="toolbox-workbench-topline">
          <div>
            <span>WORKSPACE</span>
            <strong>{locale==="ko"?"이미지 밝기·색상 보정 작업장":locale==="en"?"Brightness and color workspace":"明るさ・色補正ワークスペース"}</strong>
          </div>
        </div>
        <div className="toolbox-upload-focus">
          <span className="toolbox-upload-icon" aria-hidden="true">＋</span>
          <h2>{t.drop}</h2>
          <p>{t.local}</p>
          <button type="button" onClick={()=>input.current?.click()} data-testid="tool009-select">{t.select}</button>
          <small>{t.support}</small>
        </div>
        <input ref={input} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile}/>
      </div>
      {status&&<p className="adjuster-status" aria-live="polite">{status}</p>}
      {error&&<div className="adjuster-error" role="alert" data-testid="tool009-error"><p>{error}</p>{errorKind==="format"&&<div className="adjuster-error-links"><Link href={`/${locale}/heic-avif-image-converter`}>HEIC·AVIF</Link><Link href={`/${locale}/svg-bmp-tiff-image-converter`}>SVG·BMP·TIFF</Link></div>}</div>}
   </section>
  </div>
 );
 const sliders:[keyof Pick<Values,"brightness"|"contrast"|"saturation"|"temperature"|"sharpness">,string,number,number][]=[["brightness",t.brightness,-100,100],["contrast",t.contrast,-100,100],["saturation",t.saturation,-100,100],["temperature",t.temperature,-100,100],["sharpness",t.sharpness,0,100]];
 const applied=`B ${values.brightness} · C ${values.contrast} · S ${values.saturation} · T ${values.temperature} · SH ${values.sharpness}${values.effect!=="none"?` · ${values.effect}`:""}`;
 return (
  <div className="toolbox-tool-workflow">
   <section className="toolbox-workbench" data-testid="tool009-editor">
    <div className="toolbox-workbench-upload is-active-workspace">
      <div className="toolbox-workbench-topline">
        <div>
          <span>WORKSPACE</span>
          <strong>{locale==="ko"?"이미지 밝기·색상 보정 작업장":locale==="en"?"Brightness and color workspace":"明るさ・色補正ワークスペース"}</strong>
        </div>
      </div>
      <div className="toolbox-upload-active">
        <div className="toolbox-upload-active-head">
          <div>
            <span>{locale==="ko"?"선택한 이미지":locale==="en"?"Selected image":"選択した画像"}</span>
            <p>{locale==="ko"?"선택한 자리에서 원본 정보와 보정 상태를 바로 확인합니다.":locale==="en"?"Review source details and adjustment status where the image was selected.":"画像を選択した場所で元画像情報と補正状態を確認できます。"}</p>
          </div>
          <div className="toolbox-upload-active-actions">
            <div className="toolbox-file-stats">
              <span>{dimensions.width} × {dimensions.height}px</span>
              <span>{formatBytes(file.size)}</span>
              <span>{t.transparent}: {transparent?t.yes:t.no}</span>
            </div>
            <button type="button" onClick={()=>input.current?.click()}>＋ {t.replace}</button>
          </div>
        </div>
        <div className="toolbox-upload-selected-file">
          <strong title={file.name}>{file.name}</strong>
          <span>{info}</span>
        </div>
        <input ref={input} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile}/>
      </div>
    </div>

    <div className="adjuster-grid toolbox-workbench-editor-grid">
      <section className="adjuster-preview toolbox-workbench-preview-card">
        <div className="adjuster-preview-top">
          <div className="adjuster-view-tabs">{(["original","adjusted","compare"] as const).map(k=><button type="button" key={k} className={view===k?"is-active":""} onClick={()=>setView(k)}>{k==="original"?t.original:k==="adjusted"?t.adjusted:t.compare}</button>)}</div>
          <div className="adjuster-zoom"><button type="button" onClick={()=>setZoom(z=>Math.max(.5,z-.25))}>{t.zoomOut}</button><button type="button" onClick={()=>setZoom(1)}>{t.fit}</button><button type="button" onClick={()=>setZoom(z=>Math.min(3,z+.25))}>{t.zoomIn}</button></div>
        </div>
        <div className="adjuster-canvas-wrap"><canvas ref={canvas} data-testid="tool009-preview-canvas" style={{transform:`scale(${zoom})`}}/>{view==="compare"&&<><div className="adjuster-divider" style={{left:`${compare}%`}}/><input className="adjuster-compare" aria-label={t.compare} type="range" min="0" max="100" value={compare} onChange={e=>setCompare(+e.target.value)}/></>}</div>
        <div className="adjuster-history"><button type="button" data-testid="tool009-undo" onClick={undo} disabled={index===0}>{t.undo}</button><button type="button" data-testid="tool009-redo" onClick={redo} disabled={index>=history.length-1}>{t.redo}</button></div>
      </section>

      <aside className="adjuster-panel toolbox-workbench-settings-card">
        <div className="toolbox-workbench-settings-head">
          <div><span>{locale==="ko"?"보정 설정":locale==="en"?"Adjustment settings":"補正設定"}</span><p>{locale==="ko"?"원본과 비교하며 필요한 항목만 조절하세요.":locale==="en"?"Adjust only what you need while comparing with the original.":"元画像と比較しながら必要な項目だけ調整します。"}</p></div>
        </div>
        <button type="button" className="adjuster-auto toolbox-primary-action" onClick={autoAdjust} data-testid="tool009-auto">{t.auto}</button>
        {sliders.map(([key,label,min,max])=><div className="adjuster-control" key={key}><div><label htmlFor={`a-${key}`}>{label}</label><input aria-label={`${label} value`} type="number" min={min} max={max} value={values[key]} onChange={e=>update(key,Math.max(min,Math.min(max,Number.isFinite(+e.target.value)?+e.target.value:0)) as never)} onBlur={finish}/></div>{key==="temperature"&&<small>{t.cool} ← 0 → {t.warm}</small>}<input id={`a-${key}`} data-testid={`tool009-${key}`} type="range" min={min} max={max} value={values[key]} onChange={e=>update(key,+e.target.value as never)} onPointerUp={finish} onKeyUp={finish}/><button type="button" onClick={()=>commit({...values,[key]:0})}>{t.reset}</button></div>)}
        <div className="adjuster-effects"><button type="button" className={values.effect==="grayscale"?"is-active":""} onClick={()=>commit({...values,effect:values.effect==="grayscale"?"none":"grayscale"})}>{t.grayscale}</button><button type="button" className={values.effect==="sepia"?"is-active":""} onClick={()=>commit({...values,effect:values.effect==="sepia"?"none":"sepia"})}>{t.sepia}</button></div>
        <button type="button" data-testid="tool009-reset-adjustments" className="adjuster-reset-values" onClick={resetAll}>{t.resetAll}</button>
      </aside>
    </div>

    <div className="adjuster-output-card">
    <div className="toolbox-workbench-settings-head adjuster-output-head">
      <div><span>{locale==="ko"?"출력 설정":locale==="en"?"Output settings":"出力設定"}</span><p>{locale==="ko"?"형식과 품질을 확인한 뒤 결과 이미지를 저장하세요.":locale==="en"?"Confirm format and quality before saving the result.":"形式と画質を確認して結果を保存します。"}</p></div>
    </div>
    <section className="toolbox-workbench-actions adjuster-output">
      <div><label>{t.format}<select data-testid="tool009-output-format" value={format} onChange={e=>{setFormat(e.target.value);setResult(null)}}><option value="original">{locale==="ko"?"원본 형식 유지":locale==="en"?"Keep original format":"元の形式を維持"}</option><option value="jpg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option></select></label><label>{t.quality}<input type="range" min="40" max="100" value={quality} disabled={resolvedExt==="png"} onChange={e=>{setQuality(+e.target.value);setResult(null)}}/><span>{resolvedExt==="png"?"—":`${quality}%`}</span></label><label>{t.filename}<input type="text" value={filename} onChange={e=>{setFilename(e.target.value);setResult(null)}} onBlur={()=>setFilename(safeName(filename))}/></label>{resolvedExt==="jpg"&&<label>{t.bg}<input type="color" value={bgColor} onChange={e=>{setBgColor(e.target.value);setResult(null)}}/></label>}</div>
      <div><button type="button" data-testid="tool009-download" className="adjuster-download toolbox-primary-action" onClick={download} disabled={busy}>{busy?t.working:result?t.downloadAgain:t.download}</button><button type="button" data-testid="tool009-full-reset" onClick={fullReset}>{t.fullReset}</button></div>
    </section>
    {transparent&&resolvedExt==="jpg"&&<p className="adjuster-notice">{t.jpgNotice}</p>}
    <section className="adjuster-result toolbox-workbench-result-card" data-testid="tool009-result" aria-label={t.result}><strong>{t.result}</strong><span>{t.originalSize}: {formatBytes(file.size)}</span><span>{t.pixel}: {dimensions.width} × {dimensions.height}px</span><span>{t.applied}: {applied}</span>{result&&<><span>{t.resultSize}: {formatBytes(result.size)}</span><span>{t.format}: {result.format}</span></>}</section>
    {status&&<p className="adjuster-status" aria-live="polite">{status}</p>}
    {error&&<div className="adjuster-error" role="alert" data-testid="tool009-error"><p>{error}</p>{errorKind==="format"&&<div className="adjuster-error-links"><Link href={`/${locale}/heic-avif-image-converter`}>HEIC·AVIF</Link><Link href={`/${locale}/svg-bmp-tiff-image-converter`}>SVG·BMP·TIFF</Link></div>}</div>}
    </div>
   </section>
  </div>
 );
}