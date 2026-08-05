"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/site";
import { createStoredZip } from "@/lib/zip";

type Preset = "auto"|"high"|"balanced"|"small"|"custom";
type PngMode = "lossless"|"balanced"|"strong";
type Status = "ready"|"processing"|"done"|"kept"|"failed"|"cancelled"|"excluded";
type Item = {id:string;file:File;name:string;mime:string;format:"jpg"|"png"|"webp";width:number;height:number;orientation:number;decoderOrientationApplied:boolean;previewUrl:string;resultUrl?:string;resultBlob?:Blob;resultName?:string;resultSize?:number;status:Status;error?:string;preset:Preset;quality:number;pngMode:PngMode;excluded:boolean;keepOriginal:boolean};

const LIMITS={count:10,perFile:15*1024*1024,total:50*1024*1024,pixels:30_000_000,totalPixels:80_000_000};
const labels={
 ko:{title:"이미지를 여기에 놓거나 선택하세요",choose:"이미지 선택",add:"이미지 추가",support:"JPG, PNG, WebP · 최대 10개 · 파일당 15MB",local:"파일은 서버로 전송되지 않고 브라우저에서 처리됩니다.",setting:"압축 설정",auto:"자동 추천",high:"고화질",balanced:"균형",small:"용량 절약",custom:"직접 설정",apply:"모든 파일에 적용",advanced:"고급 설정",removeMeta:"메타데이터 기본 제거",png:"PNG 압축 방식",lossless:"무손실",strong:"강한 압축",exclude:"압축 제외",keep:"원본 유지",compress:"압축하기",again:"다시 압축",cancel:"대기 파일 취소",reset:"전체 초기화",zip:"전체 ZIP 다운로드",zipRetry:"ZIP 다시 만들기",compare:"원본과 비교",adjust:"품질 다시 조정",download:"다운로드",ready:"대기",processing:"압축 중",done:"완료",kept:"압축 효과 없음 · 원본 유지",failed:"실패",excluded:"압축 제외",summary:"전체 압축 결과",original:"원본",output:"결과",saved:"절감",progress:"처리 중",close:"닫기",fit:"화면 맞춤",hundred:"100%",zoomIn:"확대",zoomOut:"축소",noFiles:"이미지를 추가하면 파일별 설정과 결과가 여기에 표시됩니다.",retry:"다시 시도",originalOnly:"원본만",compressedOnly:"압축본만",splitView:"비교",currentSetting:"현재 설정",qualityWarning:"품질이 낮아 눈에 띄는 화질 저하가 생길 수 있습니다.",savedSize:"절감 용량",presetLabel:"적용 설정",errorReason:"실패 이유"},
 en:{title:"Drop your images here or choose files",choose:"Choose Images",add:"Add Images",support:"JPG, PNG, WebP · up to 10 files · 15 MB each",local:"Your files are processed in your browser and are not uploaded to a server.",setting:"Compression Setting",auto:"Auto Recommended",high:"High Quality",balanced:"Balanced",small:"Smaller Size",custom:"Custom",apply:"Apply to All Images",advanced:"Advanced Settings",removeMeta:"Metadata removed by default",png:"PNG compression",lossless:"Lossless",strong:"Strong",exclude:"Exclude",keep:"Keep Original",compress:"Compress Images",again:"Compress Again",cancel:"Cancel Waiting Files",reset:"Reset All",zip:"Download All as ZIP",zipRetry:"Retry ZIP",compare:"Compare Quality",adjust:"Adjust Quality",download:"Download",ready:"Ready",processing:"Compressing",done:"Complete",kept:"No reduction · original kept",failed:"Failed",excluded:"Excluded",summary:"Compression summary",original:"Original",output:"Output",saved:"Saved",progress:"Processing",close:"Close",fit:"Fit",hundred:"100%",zoomIn:"Zoom in",zoomOut:"Zoom out",noFiles:"Add images to see file settings and results here.",retry:"Retry",originalOnly:"Original only",compressedOnly:"Compressed only",splitView:"Compare",currentSetting:"Current setting",qualityWarning:"Low quality may cause visible image degradation.",savedSize:"Size saved",presetLabel:"Applied setting",errorReason:"Failure reason"},
 ja:{title:"画像をここにドロップするか、ファイルを選択してください",choose:"画像を選択",add:"画像を追加",support:"JPG・PNG・WebP · 最大10件 · 1件15MB",local:"ファイルはサーバーに送信されず、ブラウザ内で処理されます。",setting:"圧縮設定",auto:"自動おすすめ",high:"高画質",balanced:"バランス",small:"容量を優先",custom:"カスタム設定",apply:"すべての画像に適用",advanced:"詳細設定",removeMeta:"メタデータは基本的に削除",png:"PNG圧縮方式",lossless:"可逆",strong:"強い圧縮",exclude:"圧縮しない",keep:"元画像を維持",compress:"画像を圧縮",again:"もう一度圧縮",cancel:"待機中をキャンセル",reset:"すべてリセット",zip:"すべてZIPでダウンロード",zipRetry:"ZIPを再作成",compare:"画質を比較",adjust:"画質を再調整",download:"ダウンロード",ready:"待機",processing:"圧縮中",done:"完了",kept:"圧縮効果なし・元画像を維持",failed:"失敗",excluded:"圧縮対象外",summary:"圧縮結果",original:"元画像",output:"圧縮後",saved:"削減",progress:"処理中",close:"閉じる",fit:"画面に合わせる",hundred:"100%",zoomIn:"拡大",zoomOut:"縮小",noFiles:"画像を追加すると、ファイル別設定と結果が表示されます。",retry:"再試行",originalOnly:"元画像のみ",compressedOnly:"圧縮後のみ",splitView:"比較",currentSetting:"現在の設定",qualityWarning:"低い画質では目立つ劣化が生じる場合があります。",savedSize:"削減容量",presetLabel:"適用設定",errorReason:"失敗理由"}
} as const;

function pretty(n:number){if(n<1024)return `${n} B`;if(n<1048576)return `${(n/1024).toFixed(1)} KB`;return `${(n/1048576).toFixed(2)} MB`}
function ext(name:string){return name.toLowerCase().split(".").pop()||""}
function mimeToFormat(type:string,e:string):Item["format"]|null{if(type==="image/jpeg"||["jpg","jpeg"].includes(e))return "jpg";if(type==="image/png"||e==="png")return "png";if(type==="image/webp"||e==="webp")return "webp";return null}
function baseName(name:string){return name.replace(/\.[^.]+$/,"" )||"image"}
function isApng(buf:ArrayBuffer){const b=new Uint8Array(buf);for(let i=8;i+8<b.length;i++){if(String.fromCharCode(...b.slice(i+4,i+8))==="acTL")return true}return false}
function isAnimatedWebp(buf:ArrayBuffer){const b=new Uint8Array(buf);return new TextDecoder().decode(b.slice(12,80)).includes("ANIM")}
function signatureMatches(buf:ArrayBuffer,format:Item["format"]){const b=new Uint8Array(buf);if(format==="jpg")return b[0]===0xff&&b[1]===0xd8&&b[2]===0xff;if(format==="png")return b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47;if(format==="webp")return new TextDecoder().decode(b.slice(0,4))==="RIFF"&&new TextDecoder().decode(b.slice(8,12))==="WEBP";return false}
async function loadImage(file:Blob){const url=URL.createObjectURL(file);try{const img=new Image();img.decoding="async";await new Promise<void>((res,rej)=>{img.onload=()=>res();img.onerror=()=>rej(new Error("decode"));img.src=url});return {img,width:img.naturalWidth,height:img.naturalHeight}}finally{URL.revokeObjectURL(url)}}
function canvasBlob(canvas:HTMLCanvasElement,type:string,quality?:number){return new Promise<Blob>((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error("encode")),type,quality))}
function uniqueName(name:string,used:Set<string>){let candidate=name;let n=2;const dot=name.lastIndexOf(".");const stem=dot>-1?name.slice(0,dot):name;const ex=dot>-1?name.slice(dot):"";while(used.has(candidate.toLowerCase()))candidate=`${stem}-${n++}${ex}`;used.add(candidate.toLowerCase());return candidate}
function presetQuality(p:Preset){return p==="high"?.9:p==="balanced"?.78:p==="small"?.62:p==="custom"?.78:.82}

const OXIPNG_MODULE_URL="https://esm.sh/@jsquash/oxipng@2.3.0?bundle";
const IMAGE_Q_MODULE_URL="https://esm.sh/image-q@4.0.0?bundle";
type OxiPngModule={optimise:(data:ArrayBuffer|Uint8Array,options?:{level?:number})=>Promise<ArrayBuffer|Uint8Array>};
type ImageQPointContainer={toUint8Array:()=>Uint8Array};
type ImageQModule={
 utils:{PointContainer:{fromImageData:(data:ImageData)=>ImageQPointContainer}};
 buildPalette:(images:ImageQPointContainer[],options:{colors:number;colorDistanceFormula:string;paletteQuantization:string})=>Promise<unknown>;
 applyPalette:(image:ImageQPointContainer,palette:unknown,options:{colorDistanceFormula:string;imageQuantization:string})=>Promise<ImageQPointContainer>;
};
let oxipngPromise:Promise<OxiPngModule>|undefined;
let imageQPromise:Promise<ImageQModule>|undefined;
async function importRemote<T>(url:string):Promise<T>{return import(/* webpackIgnore: true */ url) as Promise<T>}
function loadOxiPng(){return oxipngPromise??=(importRemote<OxiPngModule>(OXIPNG_MODULE_URL))}
function loadImageQ(){return imageQPromise??=(importRemote<ImageQModule>(IMAGE_Q_MODULE_URL))}
async function optimizePng(blob:Blob,level:number){
 const {optimise}=await loadOxiPng();
 const result=await optimise(await blob.arrayBuffer(),{level});
 return new Blob([result],{type:"image/png"});
}
async function quantizePng(canvas:HTMLCanvasElement,colors:number){
 const iq=await loadImageQ();
 const ctx=canvas.getContext("2d",{alpha:true,willReadFrequently:true});
 if(!ctx)throw new Error("canvas");
 const source=ctx.getImageData(0,0,canvas.width,canvas.height);
 const point=iq.utils.PointContainer.fromImageData(source);
 const palette=await iq.buildPalette([point],{colors,colorDistanceFormula:"euclidean-bt709",paletteQuantization:"wuquant"});
 const quantized=await iq.applyPalette(point,palette,{colorDistanceFormula:"euclidean-bt709",imageQuantization:"floyd-steinberg"});
 const bytes=quantized.toUint8Array();
 ctx.putImageData(new ImageData(new Uint8ClampedArray(bytes),canvas.width,canvas.height),0,0);
}
function readExifOrientation(buffer:ArrayBuffer){
 const view=new DataView(buffer);
 if(view.byteLength<4||view.getUint16(0,false)!==0xffd8)return 1;
 let offset=2;
 while(offset+4<view.byteLength){
  const marker=view.getUint16(offset,false);offset+=2;
  if((marker&0xff00)!==0xff00)break;
  const size=view.getUint16(offset,false);
  if(marker===0xffe1&&offset+size<=view.byteLength){
   const start=offset+2;
   if(view.getUint32(start,false)!==0x45786966)return 1;
   const tiff=start+6;const little=view.getUint16(tiff,false)===0x4949;
   if(view.getUint16(tiff+2,little)!==0x2a)return 1;
   const ifd=tiff+view.getUint32(tiff+4,little);
   if(ifd+2>view.byteLength)return 1;
   const count=view.getUint16(ifd,little);
   for(let i=0;i<count;i++){const entry=ifd+2+i*12;if(entry+12>view.byteLength)break;if(view.getUint16(entry,little)===0x0112)return view.getUint16(entry+8,little)||1;}
  }
  offset+=Math.max(2,size);
 }
 return 1;
}

function readJpegDimensions(buffer:ArrayBuffer){
 const view=new DataView(buffer);
 if(view.byteLength<4||view.getUint16(0,false)!==0xffd8)return null;
 let offset=2;
 while(offset+9<view.byteLength){
  if(view.getUint8(offset)!==0xff){offset++;continue}
  const marker=view.getUint8(offset+1);offset+=2;
  if(marker===0xd8||marker===0xd9||marker===0x01)continue;
  if(marker>=0xd0&&marker<=0xd7)continue;
  if(offset+2>view.byteLength)break;
  const size=view.getUint16(offset,false);
  if(size<2||offset+size>view.byteLength)break;
  if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){
   if(offset+7>view.byteLength)return null;
   return {width:view.getUint16(offset+5,false),height:view.getUint16(offset+3,false)};
  }
  offset+=size;
 }
 return null;
}
function orientedSize(width:number,height:number,orientation:number){return orientation>=5&&orientation<=8?{width:height,height:width}:{width,height}}
function drawWithOrientation(ctx:CanvasRenderingContext2D,source:CanvasImageSource,width:number,height:number,orientation:number){
 switch(orientation){
  case 2:ctx.translate(width,0);ctx.scale(-1,1);break;
  case 3:ctx.translate(width,height);ctx.rotate(Math.PI);break;
  case 4:ctx.translate(0,height);ctx.scale(1,-1);break;
  case 5:ctx.rotate(.5*Math.PI);ctx.scale(1,-1);break;
  case 6:ctx.rotate(.5*Math.PI);ctx.translate(0,-height);break;
  case 7:ctx.rotate(.5*Math.PI);ctx.translate(width,-height);ctx.scale(-1,1);break;
  case 8:ctx.rotate(-.5*Math.PI);ctx.translate(-width,0);break;
 }
 ctx.drawImage(source,0,0,width,height);
}
async function loadOrientedDrawable(file:Blob){
 if(typeof createImageBitmap==="function"){
  try{const bitmap=await createImageBitmap(file,{imageOrientation:"none"});return {source:bitmap as CanvasImageSource,width:bitmap.width,height:bitmap.height,close:()=>bitmap.close()}}catch{}
 }
 const loaded=await loadImage(file);return {source:loaded.img as CanvasImageSource,width:loaded.width,height:loaded.height,close:()=>{}};
}

export function ImageCompressorTool({locale}:{locale:Locale}){
 const t=labels[locale]; const [items,setItems]=useState<Item[]>([]); const [drag,setDrag]=useState(false); const [preset,setPreset]=useState<Preset>("auto"); const [pngMode,setPngMode]=useState<PngMode>("lossless"); const [busy,setBusy]=useState(false); const [progress,setProgress]=useState(0); const [message,setMessage]=useState(""); const [zipError,setZipError]=useState(false); const [compareId,setCompareId]=useState<string>(); const [zoom,setZoom]=useState(1); const [split,setSplit]=useState(50); const [compareMode,setCompareMode]=useState<"split"|"original"|"compressed">("split"); const cancelRef=useRef(false); const inputRef=useRef<HTMLInputElement>(null); const itemsRef=useRef<Item[]>([]);
 useEffect(()=>{itemsRef.current=items},[items]);
 useEffect(()=>()=>{for(const i of itemsRef.current){URL.revokeObjectURL(i.previewUrl);if(i.resultUrl)URL.revokeObjectURL(i.resultUrl)}},[]);
 const addFiles=async(files:File[])=>{setMessage("");const remaining=LIMITS.count-itemsRef.current.length;if(remaining<=0){setMessage(locale==="ko"?"최대 10개까지 추가할 수 있습니다.":locale==="en"?"You can add up to 10 files.":"最大10件まで追加できます。");return}const next:Item[]=[];let totalSize=itemsRef.current.reduce((a,b)=>a+b.file.size,0);let totalPixels=itemsRef.current.reduce((a,b)=>a+b.width*b.height,0);for(const file of files.slice(0,remaining)){try{if(file.size===0||file.size>LIMITS.perFile)throw new Error("size");if(totalSize+file.size>LIMITS.total)throw new Error("total");const format=mimeToFormat(file.type,ext(file.name));if(!format)throw new Error("format");const buf=await file.arrayBuffer();if(!signatureMatches(buf,format))throw new Error("format");if(format==="png"&&isApng(buf))throw new Error("animated");if(format==="webp"&&isAnimatedWebp(buf))throw new Error("animated");const orientation=format==="jpg"?readExifOrientation(buf):1;const rawDimensions=format==="jpg"?readJpegDimensions(buf):null;const drawable=await loadOrientedDrawable(file);const expected=rawDimensions?orientedSize(rawDimensions.width,rawDimensions.height,orientation):orientedSize(drawable.width,drawable.height,orientation);const decoderOrientationApplied=!!rawDimensions&&drawable.width===expected.width&&drawable.height===expected.height&&(drawable.width!==rawDimensions.width||drawable.height!==rawDimensions.height);const {width,height}=expected;drawable.close();if(width*height>LIMITS.pixels)throw new Error("pixels");if(totalPixels+width*height>LIMITS.totalPixels)throw new Error("totalPixels");totalSize+=file.size;totalPixels+=width*height;next.push({id:crypto.randomUUID(),file,name:file.name,mime:file.type||`image/${format}`,format,width,height,orientation,decoderOrientationApplied,previewUrl:URL.createObjectURL(file),status:"ready",preset,quality:Math.round(presetQuality(preset)*100),pngMode,excluded:false,keepOriginal:false})}catch(e){const code=(e as Error).message;setMessage(locale==="ko"?code==="animated"?"애니메이션 WebP와 APNG는 지원하지 않습니다.":code==="pixels"||code==="totalPixels"?"이미지 해상도가 안전 처리 한도를 초과했습니다.":code==="size"||code==="total"?"파일 용량이 안전 처리 한도를 초과했습니다.":"손상되었거나 지원하지 않는 이미지입니다.":locale==="en"?code==="animated"?"Animated WebP and APNG are not supported.":code.includes("Pixel")||code.includes("pixels")?"The image resolution exceeds the safe processing limit.":code==="size"||code==="total"?"The file size exceeds the safe processing limit.":"The image is damaged or unsupported.":code==="animated"?"アニメーションWebPとAPNGには対応していません。":code.includes("pixel")||code.includes("Pixels")?"画像の解像度が安全処理上限を超えています。":code==="size"||code==="total"?"ファイル容量が安全処理上限を超えています。":"破損または未対応の画像です。")} }if(next.length)setItems(v=>[...v,...next])};
 const clearResult=(i:Item)=>{if(i.resultUrl)URL.revokeObjectURL(i.resultUrl);return {...i,resultUrl:undefined,resultBlob:undefined,resultSize:undefined,resultName:undefined,status:i.excluded?"excluded":"ready" as Status,error:undefined}};
 const remove=(id:string)=>{if(busy)return;setItems(v=>v.filter(i=>{if(i.id===id){URL.revokeObjectURL(i.previewUrl);if(i.resultUrl)URL.revokeObjectURL(i.resultUrl);return false}return true}));};
 const reset=()=>{if(busy){cancelRef.current=true;return}for(const i of itemsRef.current){URL.revokeObjectURL(i.previewUrl);if(i.resultUrl)URL.revokeObjectURL(i.resultUrl)}setItems([]);setPreset("auto");setPngMode("lossless");setProgress(0);setMessage("");setCompareId(undefined)};
 const applyAll=()=>setItems(v=>v.map(i=>({...clearResult(i),preset,quality:Math.round(presetQuality(preset)*100),pngMode})));
 const compressOne=async(i:Item)=>{
  if(i.excluded||i.keepOriginal)return {blob:i.file,status:i.excluded?"excluded":"kept" as Status};
  const drawable=await loadOrientedDrawable(i.file);
  const canvas=document.createElement("canvas");canvas.width=i.width;canvas.height=i.height;
  const ctx=canvas.getContext("2d",{alpha:true});if(!ctx){drawable.close();throw new Error("canvas")}
  const decodedAlreadyOriented=i.decoderOrientationApplied||(drawable.width===i.width&&drawable.height===i.height&&i.orientation>=5&&i.orientation<=8);
  if(decodedAlreadyOriented)ctx.drawImage(drawable.source,0,0,i.width,i.height);
  else drawWithOrientation(ctx,drawable.source,drawable.width,drawable.height,i.orientation);
  drawable.close();
  let out:Blob;
  if(i.format==="png"){
   if(i.pngMode!=="lossless"){
    const colors=i.pngMode==="strong"?96:224;
    await quantizePng(canvas,colors);
   }
   const encoded=await canvasBlob(canvas,"image/png");
   out=await optimizePng(encoded,i.pngMode==="lossless"?3:i.pngMode==="balanced"?2:1);
  }else{
   const type=i.format==="jpg"?"image/jpeg":"image/webp";
   const quality=i.preset==="custom"?i.quality/100:presetQuality(i.preset);
   out=await canvasBlob(canvas,type,quality);
  }
  if(out.size>=i.file.size&&i.orientation===1)return {blob:i.file,status:"kept" as Status};
  return {blob:out,status:"done" as Status};
 };
 const run=async(targetIds?:string[])=>{if(busy)return;setBusy(true);cancelRef.current=false;setZipError(false);const used=new Set<string>();for(const i of itemsRef.current){if(i.resultName)used.add(i.resultName.toLowerCase())}const ids=targetIds??itemsRef.current.filter(i=>!i.resultBlob&&i.status!=="excluded").map(i=>i.id);let done=0;for(const id of ids){if(cancelRef.current){setItems(v=>v.map(i=>ids.includes(i.id)&&!i.resultBlob?{...i,status:"cancelled"}:i));break}setItems(v=>v.map(i=>i.id===id?{...clearResult(i),status:"processing"}:i));try{const current=itemsRef.current.find(i=>i.id===id)!;const result=await compressOne(current);const extension=current.format==="jpg"?(ext(current.name)==="jpeg"?"jpeg":"jpg"):current.format;const name=uniqueName(`${baseName(current.name)}.${extension}`,used);const url=URL.createObjectURL(result.blob);setItems(v=>v.map(i=>i.id===id?{...i,resultBlob:result.blob,resultUrl:url,resultSize:result.blob.size,resultName:name,status:result.status}:i))}catch(error){const reason=error instanceof Error&&error.message?error.message:t.failed;setItems(v=>v.map(i=>i.id===id?{...i,status:"failed",error:reason}:i))}done++;setProgress(Math.round(done/Math.max(1,ids.length)*100));setMessage(`${t.progress} ${done} / ${ids.length}`);await new Promise(r=>setTimeout(r,0))}setBusy(false)};
 const download=(i:Item)=>{const blob=i.resultBlob??i.file;const name=i.resultName??i.name;const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
 const downloadZip=async()=>{try{const files=itemsRef.current.filter(i=>i.status!=="failed").map(i=>({name:i.resultName??i.name,blob:i.resultBlob??i.file}));const blob=await createStoredZip(files);const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="fixlgs-image-compressor.zip";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);setZipError(false)}catch{setZipError(true)}};
 const totals=useMemo(()=>{const valid=items.filter(i=>i.resultBlob);const original=valid.reduce((a,b)=>a+b.file.size,0);const output=valid.reduce((a,b)=>a+(b.resultSize??b.file.size),0);return {count:valid.length,original,output,saved:Math.max(0,original-output),rate:original?Math.max(0,Math.round((original-output)/original*100)):0}},[items]);
 const compare=items.find(i=>i.id===compareId);
 const statusText=(s:Status)=>s==="processing"?t.processing:s==="done"?t.done:s==="kept"?t.kept:s==="failed"?t.failed:s==="excluded"?t.excluded:s==="cancelled"?t.cancel:t.ready;
 return (
  <div className="toolbox-tool-workflow">
    <section className="toolbox-workbench compressor-workbench">
      <div
        className={`toolbox-workbench-upload ${drag ? "is-dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          void addFiles([...event.dataTransfer.files]);
        }}
      >
        <div className="toolbox-workbench-topline">
          <div>
            <span>WORKSPACE</span>
            <strong>{locale === "ko" ? "이미지 압축 작업장" : locale === "en" ? "Image compression workspace" : "画像圧縮ワークスペース"}</strong>
          </div>
        </div>

        <input
          ref={inputRef}
          data-testid="compressor-file-input"
          type="file"
          hidden
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            void addFiles([...(event.target.files ?? [])]);
            event.currentTarget.value = "";
          }}
        />

        {items.length === 0 ? (
          <div className="toolbox-upload-focus">
            <span className="toolbox-upload-icon" aria-hidden="true">＋</span>
            <h2>{t.title}</h2>
            <p>{locale === "ko" ? "여러 이미지를 한 번에 추가하거나 아래 버튼으로 선택할 수 있습니다." : locale === "en" ? "Add several images at once, or choose them with the button below." : "複数の画像をまとめて追加するか、下のボタンから選択できます。"}</p>
            <button type="button" onClick={() => inputRef.current?.click()}>{t.choose}</button>
            <small>{t.support}<br />{t.local}</small>
          </div>
        ) : (
          <div className="toolbox-upload-active compressor-upload-active">
            <div className="toolbox-upload-active-head">
              <div>
                <span>{locale === "ko" ? "선택한 이미지" : locale === "en" ? "Selected images" : "選択した画像"}</span>
                <p>{locale === "ko" ? "파일 순서와 압축 설정, 처리 상태와 결과를 한곳에서 확인합니다." : locale === "en" ? "Manage order, compression settings, status, and results in one place." : "ファイル順、圧縮設定、処理状態、結果を一か所で確認できます。"}</p>
              </div>
              <div className="toolbox-upload-active-actions">
                <div className="toolbox-file-stats">
                  <span>{items.length} files</span>
                  <span>{items.filter((item) => item.status === "done" || item.status === "kept").length} done</span>
                  <span>{items.filter((item) => item.status === "failed").length} failed</span>
                </div>
                <button type="button" onClick={() => inputRef.current?.click()}>＋ {t.add}</button>
              </div>
            </div>
          </div>
        )}

        <div className="toolbox-workbench-settings-head compressor-settings-head">
          <div>
            <span>{t.setting}</span>
            <p>{t.removeMeta}</p>
          </div>
          <button className="compressor-apply" type="button" onClick={applyAll}>{t.apply}</button>
        </div>

        <div className="compressor-setting-options">
          <div className="toolbox-converter-quality-grid">
            {(["auto", "high", "balanced", "small", "custom"] as Preset[]).map((value) => (
              <button key={value} type="button" className={preset === value ? "is-active" : ""} onClick={() => setPreset(value)}>
                {value === "auto" ? t.auto : value === "high" ? t.high : value === "balanced" ? t.balanced : value === "small" ? t.small : t.custom}
              </button>
            ))}
          </div>
          <div className="compressor-png-mode">
            <span>{t.png}</span>
            {(["lossless", "balanced", "strong"] as PngMode[]).map((value) => (
              <button key={value} type="button" className={pngMode === value ? "is-active" : ""} onClick={() => setPngMode(value)}>
                {value === "lossless" ? t.lossless : value === "balanced" ? t.balanced : t.strong}
              </button>
            ))}
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="toolbox-workbench-files compressor-workbench-files">
          <div className="compressor-file-list">
            {items.map((item) => (
              <article
                data-testid="compressor-file-card"
                data-status={item.status}
                data-format={item.format}
                data-original-size={item.file.size}
                data-result-size={item.resultSize ?? ""}
                data-width={item.width}
                data-height={item.height}
                data-orientation={item.orientation}
                data-result-name={item.resultName ?? ""}
                key={item.id}
                className={`compressor-file-card status-${item.status}`}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const from = event.dataTransfer.getData("text/plain");
                  setItems((current) => {
                    const next = [...current];
                    const fromIndex = next.findIndex((entry) => entry.id === from);
                    const toIndex = next.findIndex((entry) => entry.id === item.id);
                    if (fromIndex < 0 || toIndex < 0) return current;
                    const [moved] = next.splice(fromIndex, 1);
                    next.splice(toIndex, 0, moved);
                    return next;
                  });
                }}
              >
                <img src={item.previewUrl} alt="" />
                <div className="compressor-file-info">
                  <strong>{item.name}</strong>
                  <span>{item.format.toUpperCase()} · {pretty(item.file.size)} · {item.width}×{item.height}</span>
                  <small>{statusText(item.status)}</small>
                  {item.resultSize != null && <><b>{pretty(item.file.size)} → {pretty(item.resultSize)} · {Math.max(0, Math.round((item.file.size - item.resultSize) / item.file.size * 100))}%</b><span>{t.savedSize}: {pretty(Math.max(0,item.file.size-item.resultSize))} · {t.presetLabel}: {item.format==="png"?(item.pngMode==="lossless"?t.lossless:item.pngMode==="balanced"?t.balanced:t.strong):(item.preset==="custom"?`${t.custom} ${item.quality}`:item.preset==="auto"?t.auto:item.preset==="high"?t.high:item.preset==="balanced"?t.balanced:t.small)}</span></>}
                  {item.error && <p className="compressor-file-error"><strong>{t.errorReason}</strong>: {item.error}</p>}
                </div>
                <div className="compressor-file-controls">
                  <select data-testid="compressor-item-preset" value={item.preset} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? {...clearResult(entry), preset: event.target.value as Preset} : entry))}>
                    {(["auto", "high", "balanced", "small", "custom"] as Preset[]).map((value) => (
                      <option key={value} value={value}>{value === "auto" ? t.auto : value === "high" ? t.high : value === "balanced" ? t.balanced : value === "small" ? t.small : t.custom}</option>
                    ))}
                  </select>
                  {item.preset === "custom" && item.format !== "png" && <div className="compressor-quality-control"><input data-testid="compressor-item-quality" aria-label="quality" type="range" min="30" max="100" value={item.quality} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? {...clearResult(entry), quality: Number(event.target.value)} : entry))} /><output>{item.quality}</output>{item.quality<45&&<small>{t.qualityWarning}</small>}</div>}
                  {item.format === "png" && <select data-testid="compressor-item-png-mode" aria-label={t.png} value={item.pngMode} onChange={(event)=>setItems((current)=>current.map((entry)=>entry.id===item.id?{...clearResult(entry),pngMode:event.target.value as PngMode}:entry))}><option value="lossless">{t.lossless}</option><option value="balanced">{t.balanced}</option><option value="strong">{t.strong}</option></select>}
                  <label><input data-testid="compressor-item-keep-original" disabled={busy} type="checkbox" checked={item.keepOriginal} onChange={(event)=>setItems((current)=>current.map((entry)=>entry.id===item.id?{...clearResult(entry),keepOriginal:event.target.checked,excluded:false}:entry))} />{t.keep}</label><label><input data-testid="compressor-item-exclude" disabled={busy} type="checkbox" checked={item.excluded} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? {...clearResult(entry), excluded: event.target.checked, status: event.target.checked ? "excluded" : "ready"} : entry))} />{t.exclude}</label>
                  <div>
                    {item.status==="failed"&&<button data-testid="compressor-item-retry" type="button" onClick={()=>void run([item.id])}>{t.retry}</button>}{item.resultUrl && <><button data-testid="compressor-item-compare" type="button" onClick={() => { setCompareId(item.id); setZoom(1); setSplit(50); setCompareMode("split"); }}>{t.compare}</button><button data-testid="compressor-item-recompress" type="button" onClick={() => void run([item.id])}>{t.adjust}</button><button data-testid="compressor-item-download" type="button" onClick={() => download(item)}>{t.download}</button></>}
                    <button type="button" disabled={busy} aria-label={`${item.name} ${t.reset}`} onClick={() => remove(item.id)}>×</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {totals.count > 0 && (
        <section className="compressor-summary" data-testid="compressor-summary" data-count={totals.count} data-original-size={totals.original} data-output-size={totals.output} data-saved-size={totals.saved} data-savings-rate={totals.rate}>
          <div><span>{t.summary}</span><strong>{pretty(totals.original)} → {pretty(totals.output)}</strong></div>
          <div><b>{pretty(totals.saved)}</b><em>{totals.rate}%</em></div>
        </section>
      )}

      {busy && <div className="compressor-progress"><span style={{width: `${progress}%`}} /><p>{message}</p></div>}
      {message && !busy && <div data-testid="compressor-message" className="toolbox-workbench-notice">{message}</div>}

      <div className="toolbox-workbench-actions compressor-actions">
        <button data-testid="compressor-run" className="toolbox-primary-action" disabled={!items.length || busy} onClick={() => void run()}>{totals.count ? t.again : t.compress}</button>
        {busy && <button type="button" onClick={() => { cancelRef.current = true; }}>{t.cancel}</button>}
        <button data-testid="compressor-zip" className="toolbox-zip-action" disabled={!totals.count} onClick={() => void downloadZip()}>{zipError ? t.zipRetry : t.zip}</button>
        <button data-testid="compressor-reset" className="toolbox-restart-action" type="button" onClick={reset}>{busy?t.cancel:t.reset}</button>
      </div>

      <button className="toolbox-converter-mobile-add" type="button" onClick={() => inputRef.current?.click()}>{t.add}</button>
    </section>

    {compare && (
      <div data-testid="compressor-compare-modal" className="compressor-modal" role="dialog" aria-modal="true">
        <div className="compressor-modal-panel">
          <header><div><strong>{compare.name}</strong><span>{pretty(compare.file.size)} → {pretty(compare.resultSize ?? compare.file.size)} · {t.currentSetting}: {compare.format==="png"?compare.pngMode:(compare.preset==="custom"?`${compare.preset} ${compare.quality}`:compare.preset)}</span></div><button type="button" onClick={() => setCompareId(undefined)}>{t.close}</button></header>
          <div className={`compressor-compare-stage mode-${compareMode}`}><div style={{transform: `scale(${zoom})`}}><img src={compareMode==="compressed"?(compare.resultUrl??compare.previewUrl):compare.previewUrl} alt={`${t.original} ${compare.name}`} />{compareMode==="split"&&<><div className="compressor-after" style={{width: `${split}%`}}><img src={compare.resultUrl ?? compare.previewUrl} alt={`${t.output} ${compare.name}`} /></div><span className="compressor-slider" style={{left: `${split}%`}} /></>}</div>{compareMode==="split"&&<input data-testid="compressor-compare-slider" className="compressor-split-range" aria-label="before after comparison" type="range" min="0" max="100" value={split} onChange={(event) => setSplit(Number(event.target.value))} />}</div>
          <footer><button type="button" onClick={()=>setCompareMode("original")}>{t.originalOnly}</button><button type="button" onClick={()=>setCompareMode("compressed")}>{t.compressedOnly}</button><button type="button" onClick={()=>setCompareMode("split")}>{t.splitView}</button><button type="button" onClick={() => setZoom(.75)}>{t.fit}</button><button type="button" onClick={() => setZoom(1)}>{t.hundred}</button><button type="button" onClick={() => setZoom((value) => Math.max(.5, value - .25))}>{t.zoomOut}</button><button type="button" onClick={() => setZoom((value) => Math.min(3, value + .25))}>{t.zoomIn}</button><button type="button" onClick={()=>void run([compare.id])}>{t.adjust}</button></footer>
        </div>
      </div>
    )}
  </div>
 );
}
