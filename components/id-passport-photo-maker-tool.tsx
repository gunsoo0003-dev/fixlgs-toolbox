"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/site";
import { StableMobileImageFileInput } from "@/components/stable-mobile-image-file-input";
import { TOOL025_LIMITS, TOOL025_PRESETS, getTool025Preset, mmToPx, type Tool025PresetId } from "@/lib/tool-025-id-photo-policy";
import styles from "./id-passport-photo-maker-tool.module.css";

type OutputFormat = "jpg" | "png";
type StableMobileOriginalInfo = { name:string; size:number; type:string; lastModified:number };
type StableMobileOwnedFile = File & { __stableMobileOriginalInfo?: StableMobileOriginalInfo };
type LoadedImage = { file: File; sourceInfo: StableMobileOriginalInfo; width: number; height: number; bitmap: ImageBitmap | HTMLImageElement; url?: string };
type Position = { x:number; y:number };

const labels = {
  ko:{choose:"사진 선택",drop:"정면 사진을 선택하거나 여기에 놓으세요",support:"JPG·PNG·WebP · 1개 · 최대 15MB / 40MP",preset:"국가·문서 규격",official:"공식 규격",general:"일반 편의",custom:"사용자 지정",preview:"미리보기",guide:"얼굴 위치 안내",zoom:"확대·축소",center:"중앙 맞춤",position:"위치 이동",up:"위",down:"아래",left:"왼쪽",right:"오른쪽",output:"출력",size:"출력 크기",format:"파일 형식",download:"개별 다운로드",a4:"A4 인쇄 배치",a4Download:"A4 인쇄용 다운로드",cut:"잘라내기 선",actual:"100% · 실제 크기로 인쇄",reset:"설정 초기화",resetAll:"전체 초기화",newPhoto:"새 사진",customW:"가로 mm",customH:"세로 mm",officialNote:"공식 규격은 제출 직전 발급기관의 최신 안내를 다시 확인하세요.",generalNote:"일반 증명·취업 preset은 편의값이며 제출처 요구가 우선입니다.",passportNote:"여권모드에서는 AI 얼굴·배경 합성, 미용 보정, stretch를 제공하지 않습니다.",local:"LOCAL ONLY",ready:"사진을 불러왔습니다.",badType:"JPG·PNG·WebP 정적 이미지만 사용할 수 있습니다.",tooLarge:"파일은 15MB 이하만 사용할 수 있습니다.",tooManyPixels:"원본 이미지가 40MP를 초과합니다.",decodeFail:"이미지를 읽을 수 없습니다. 손상 파일 또는 지원하지 않는 형식일 수 있습니다.",customInvalid:"사용자 지정 크기는 1mm 이상이며 A4(210×297mm)를 넘을 수 없습니다.",a4Count:"A4 자동 배치 수",digital:"온라인 제출",krOnline:"413×531px · JPG · 500KB 이하로 실제 저장합니다.",onlineEncodeFail:"500KB 이하 JPG를 만들지 못했습니다. 다른 사진을 선택해 주세요.",noApproval:"규격 편집 보조 도구이며 심사 합격을 보장하지 않습니다."},
  en:{choose:"Choose Photo",drop:"Choose a front-facing photo or drop it here",support:"JPG · PNG · WebP · 1 file · up to 15MB / 40MP",preset:"Country & Document Preset",official:"Official",general:"General",custom:"Custom",preview:"Preview",guide:"Face Position Guide",zoom:"Zoom",center:"Center",position:"Position",up:"Up",down:"Down",left:"Left",right:"Right",output:"Output",size:"Output Size",format:"File Format",download:"Download Image",a4:"A4 Print Layout",a4Download:"Download A4 Print",cut:"Cut Guides",actual:"Print at 100% / Actual Size",reset:"Reset settings",resetAll:"Reset all",newPhoto:"New Photo",customW:"Width mm",customH:"Height mm",officialNote:"Recheck the issuing authority's latest requirements before submission.",generalNote:"General ID/employment presets are convenience sizes; recipient requirements take priority.",passportNote:"Passport mode does not provide AI face/background compositing, beauty retouching, or stretch.",local:"LOCAL ONLY",ready:"Photo loaded.",badType:"Use a static JPG, PNG, or WebP image.",tooLarge:"The file must be 15MB or smaller.",tooManyPixels:"The source image exceeds 40MP.",decodeFail:"The image could not be decoded. It may be damaged or unsupported.",customInvalid:"Custom size must be at least 1mm and cannot exceed A4 (210×297mm).",a4Count:"Auto-fit on A4",digital:"Digital Submission",krOnline:"Saved as an actual 413×531px JPG at 500KB or less.",onlineEncodeFail:"Could not create a JPG at or below 500KB. Choose another photo.",noApproval:"This tool assists with sizing and does not guarantee acceptance."},
  ja:{choose:"写真を選択",drop:"正面写真を選択するか、ここにドロップしてください",support:"JPG・PNG・WebP · 1枚 · 最大15MB / 40MP",preset:"国・書類の規格",official:"公式規格",general:"一般便利",custom:"カスタム",preview:"プレビュー",guide:"顔位置ガイド",zoom:"拡大・縮小",center:"中央に配置",position:"位置移動",up:"上",down:"下",left:"左",right:"右",output:"出力",size:"出力サイズ",format:"ファイル形式",download:"個別ダウンロード",a4:"A4印刷配置",a4Download:"A4印刷用ダウンロード",cut:"カットガイド",actual:"100%・実際のサイズで印刷",reset:"設定リセット",resetAll:"全体リセット",newPhoto:"新しい写真",customW:"横 mm",customH:"縦 mm",officialNote:"提出前に発行機関の最新公式案内を確認してください。",generalNote:"一般の証明・就職presetは便利値で、提出先の指定が優先です。",passportNote:"パスポートモードではAI顔・背景合成、美顔補正、stretchを提供しません。",local:"LOCAL ONLY",ready:"写真を読み込みました。",badType:"静止画JPG・PNG・WebPのみ使用できます。",tooLarge:"ファイルは15MB以下にしてください。",tooManyPixels:"元画像が40MPを超えています。",decodeFail:"画像を読み込めません。破損または未対応形式の可能性があります。",customInvalid:"カスタムサイズは1mm以上、A4(210×297mm)以下にしてください。",a4Count:"A4自動配置枚数",digital:"オンライン提出",krOnline:"413×531px・JPG・500KB以下で実際に保存します。",onlineEncodeFail:"500KB以下のJPGを作成できませんでした。別の写真を選択してください。",noApproval:"規格調整を支援するツールで、審査合格を保証しません。"}
} as const;

const presetNames: Record<Tool025PresetId, Record<Locale,string>> = {
  "kr-passport-print":{ko:"한국 여권 · 인화 35×45mm",en:"Korea Passport · Print 35×45mm",ja:"韓国パスポート · 印刷35×45mm"},
  "kr-passport-online":{ko:"한국 여권 · 온라인 413×531px",en:"Korea Passport · Online 413×531px",ja:"韓国パスポート · オンライン413×531px"},
  "us-passport-print":{ko:"미국 여권 · 51×51mm",en:"US Passport · 51×51mm",ja:"米国パスポート · 51×51mm"},
  "jp-passport-print":{ko:"일본 여권 · 35×45mm",en:"Japan Passport · 35×45mm",ja:"日本パスポート · 35×45mm"},
  "uk-passport-print":{ko:"영국 여권 · 35×45mm",en:"UK Passport · 35×45mm",ja:"英国パスポート · 35×45mm"},
  "ca-passport-print":{ko:"캐나다 여권 · 50×70mm",en:"Canada Passport · 50×70mm",ja:"カナダパスポート · 50×70mm"},
  "general-30x40":{ko:"일반 증명·취업 · 30×40mm",en:"General ID/Employment · 30×40mm",ja:"一般証明・就職 · 30×40mm"},
  "general-35x45":{ko:"일반 증명·취업 · 35×45mm",en:"General ID/Employment · 35×45mm",ja:"一般証明・就職 · 35×45mm"},
  custom:{ko:"사용자 지정 mm",en:"Custom mm",ja:"カスタム mm"},
};

function verifySignature(bytes:Uint8Array, type:string){
  if(type==="image/jpeg") return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
  if(type==="image/png") return bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47;
  if(type==="image/webp") return String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP";
  return false;
}
async function loadBitmap(file:File):Promise<LoadedImage>{
  const owned=file as StableMobileOwnedFile;
  const sourceInfo=owned.__stableMobileOriginalInfo??{name:file.name,size:file.size,type:file.type,lastModified:file.lastModified};
  const scan=new Uint8Array(await file.slice(0,Math.min(file.size,512*1024)).arrayBuffer());
  if(!verifySignature(scan,file.type)) throw new Error("TYPE");
  const ascii=new TextDecoder("latin1").decode(scan);
  if((file.type==="image/webp"&&(ascii.includes("ANIM")||ascii.includes("ANMF")))||(file.type==="image/png"&&ascii.includes("acTL"))) throw new Error("ANIMATED");
  if("createImageBitmap" in window){
    const bitmap=await createImageBitmap(file,{imageOrientation:"from-image"});
    return {file,sourceInfo,width:bitmap.width,height:bitmap.height,bitmap};
  }
  const url=URL.createObjectURL(file);
  const img=new Image();
  img.decoding="async";
  img.src=url;
  await img.decode();
  return {file,sourceInfo,width:img.naturalWidth,height:img.naturalHeight,bitmap:img,url};
}
function closeLoaded(img:LoadedImage|null){
  if(!img) return;
  if("close" in img.bitmap && typeof (img.bitmap as ImageBitmap).close==="function") (img.bitmap as ImageBitmap).close();
  if(img.url) URL.revokeObjectURL(img.url);
}
function canvasBlob(canvas:HTMLCanvasElement,format:OutputFormat,quality=.94){return new Promise<Blob>((resolve,reject)=>canvas.toBlob((blob)=>blob?resolve(blob):reject(new Error("ENCODE")),format==="jpg"?"image/jpeg":"image/png",quality));}
async function jpegAtMost(canvas:HTMLCanvasElement,maxBytes:number){
  let best:Blob|null=null;
  let low=.35,high=.94;
  for(let i=0;i<8;i++){
    const quality=(low+high)/2;
    const blob=await canvasBlob(canvas,"jpg",quality);
    if(blob.size<=maxBytes){best=blob;low=quality;}else{high=quality;}
  }
  if(!best){const fallback=await canvasBlob(canvas,"jpg",.30);if(fallback.size<=maxBytes)best=fallback;}
  return best;
}
function safeBase(name:string){return (name.replace(/\.[^.]+$/," ").trim()||"id-photo").replace(/[\\/:*?"<>|]+/g,"-").replace(/\s+/g,"-").slice(0,80);}
function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);}

export function IdPassportPhotoMakerTool({locale}:{locale:Locale}){
  const t=labels[locale];
  const inputRef=useRef<HTMLInputElement>(null);
  const previewRef=useRef<HTMLCanvasElement>(null);
  const a4PreviewRef=useRef<HTMLCanvasElement>(null);
  const [image,setImage]=useState<LoadedImage|null>(null);
  const [presetId,setPresetId]=useState<Tool025PresetId>("kr-passport-print");
  const [customW,setCustomW]=useState(35);
  const [customH,setCustomH]=useState(45);
  const [zoom,setZoom]=useState(1);
  const [position,setPosition]=useState<Position>({x:0,y:0});
  const [guide,setGuide]=useState(true);
  const [format,setFormat]=useState<OutputFormat>("jpg");
  const [cutGuides,setCutGuides]=useState(true);
  const [status,setStatus]=useState("");
  const [error,setError]=useState("");
  const [dropDragging,setDropDragging]=useState(false);
  const [workspaceDragging,setWorkspaceDragging]=useState(false);
  const pointer=useRef<{x:number;y:number;start:Position}|null>(null);
  const preset=getTool025Preset(presetId);
  const isCustom=presetId==="custom";
  const widthMm=isCustom?customW:(preset.printWidthMm??35);
  const heightMm=isCustom?customH:(preset.printHeightMm??45);
  const customValid=widthMm>=1&&heightMm>=1&&widthMm<=TOOL025_LIMITS.maxCustomWidthMm&&heightMm<=TOOL025_LIMITS.maxCustomHeightMm;
  const outputSize=useMemo(()=>preset.pixelWidth&&preset.pixelHeight?{w:preset.pixelWidth,h:preset.pixelHeight}:{w:mmToPx(widthMm),h:mmToPx(heightMm)},[preset,widthMm,heightMm]);
  const a4Layout=useMemo(()=>{
    if(!customValid) return {cols:0,rows:0,count:0};
    const innerW=TOOL025_LIMITS.a4WidthMm-TOOL025_LIMITS.a4MarginMm*2;
    const innerH=TOOL025_LIMITS.a4HeightMm-TOOL025_LIMITS.a4MarginMm*2;
    const cols=Math.max(0,Math.floor((innerW+TOOL025_LIMITS.printGapMm)/(widthMm+TOOL025_LIMITS.printGapMm)));
    const rows=Math.max(0,Math.floor((innerH+TOOL025_LIMITS.printGapMm)/(heightMm+TOOL025_LIMITS.printGapMm)));
    return {cols,rows,count:cols*rows};
  },[widthMm,heightMm,customValid]);

  const drawPhoto=(ctx:CanvasRenderingContext2D,w:number,h:number,withGuide:boolean)=>{
    if(!image) return;
    ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);
    const base=Math.max(w/image.width,h/image.height);
    const scale=base*zoom;
    const dw=image.width*scale,dh=image.height*scale;
    const dx=(w-dw)/2+position.x*w*0.28;
    const dy=(h-dh)/2+position.y*h*0.28;
    ctx.drawImage(image.bitmap,dx,dy,dw,dh);
    if(withGuide){
      ctx.save();
      ctx.strokeStyle="rgba(0,122,255,.95)";ctx.lineWidth=Math.max(2,w/260);ctx.setLineDash([w/45,w/70]);
      ctx.strokeRect(ctx.lineWidth,ctx.lineWidth,w-ctx.lineWidth*2,h-ctx.lineWidth*2);
      ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();
      ctx.setLineDash([]);
      if(preset.headMinMm&&preset.headMaxMm&&preset.printHeightMm){
        const maxH=h*(preset.headMaxMm/preset.printHeightMm); const minH=h*(preset.headMinMm/preset.printHeightMm);
        const top=(h-maxH)/2;
        ctx.strokeStyle="rgba(0,122,255,.78)";ctx.strokeRect(w*.19,top,w*.62,maxH);
        ctx.strokeStyle="rgba(0,122,255,.46)";ctx.strokeRect(w*.24,(h-minH)/2,w*.52,minH);
      } else {
        ctx.strokeStyle="rgba(0,122,255,.65)";ctx.beginPath();ctx.ellipse(w/2,h*.46,w*.28,h*.34,0,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
  };

  useEffect(()=>{
    const canvas=previewRef.current;if(!canvas)return;
    const h=520,w=Math.max(260,Math.round(h*(outputSize.w/outputSize.h)));
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    ctx.clearRect(0,0,w,h);ctx.fillStyle="#f4f4f5";ctx.fillRect(0,0,w,h);
    drawPhoto(ctx,w,h,guide);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[image,presetId,customW,customH,zoom,position,guide,outputSize.w,outputSize.h]);

  useEffect(()=>{
    const canvas=a4PreviewRef.current;if(!canvas)return;
    const scale=2;
    const w=210*scale,h=297*scale;
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    ctx.clearRect(0,0,w,h);ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);
    if(!image||!customValid||a4Layout.count<1)return;
    const photoW=widthMm*scale,photoH=heightMm*scale,gap=TOOL025_LIMITS.printGapMm*scale,margin=TOOL025_LIMITS.a4MarginMm*scale;
    for(let r=0;r<a4Layout.rows;r++)for(let c=0;c<a4Layout.cols;c++){
      const x=margin+c*(photoW+gap),y=margin+r*(photoH+gap);
      ctx.save();ctx.translate(x,y);drawPhoto(ctx,photoW,photoH,false);ctx.restore();
      if(cutGuides){ctx.save();ctx.strokeStyle="#999";ctx.lineWidth=1;ctx.setLineDash([4,3]);ctx.strokeRect(x-.5,y-.5,photoW+1,photoH+1);ctx.restore();}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[image,widthMm,heightMm,zoom,position,cutGuides,a4Layout.cols,a4Layout.rows,a4Layout.count,customValid]);

  useEffect(()=>()=>closeLoaded(image),[image]);

  const acceptFile=async(file?:File)=>{
    if(!file)return;setError("");setStatus("");
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setError(t.badType);return;}
    if(file.size>TOOL025_LIMITS.maxFileBytes){setError(t.tooLarge);return;}
    try{
      const loaded=await loadBitmap(file);
      if(loaded.sourceInfo.size>TOOL025_LIMITS.maxFileBytes){closeLoaded(loaded);setError(t.tooLarge);return;}
      if(loaded.width*loaded.height>TOOL025_LIMITS.maxSourcePixels){closeLoaded(loaded);setError(t.tooManyPixels);return;}
      closeLoaded(image);setImage(loaded);setZoom(1);setPosition({x:0,y:0});setStatus(t.ready);
    }catch(err){setError(err instanceof Error&&(err.message==="TYPE"||err.message==="ANIMATED")?t.badType:t.decodeFail);}
  };
  const renderIndividual=async()=>{
    if(!image||!customValid)return;
    const canvas=document.createElement("canvas");canvas.width=outputSize.w;canvas.height=outputSize.h;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    drawPhoto(ctx,canvas.width,canvas.height,false);
    const onlineKr=presetId==="kr-passport-online";
    const blob=onlineKr&&preset.maxBytes?await jpegAtMost(canvas,preset.maxBytes):await canvasBlob(canvas,format);
    if(!blob){setError(t.onlineEncodeFail);return;}
    setError("");
    const actualFormat:OutputFormat=onlineKr?"jpg":format;
    const ext=actualFormat==="jpg"?"jpg":"png";
    downloadBlob(blob,`${safeBase(image.sourceInfo.name)}-${presetId}-${outputSize.w}x${outputSize.h}.${ext}`);
  };
  const renderA4=async()=>{
    if(!image||!customValid||a4Layout.count<1)return;
    const canvas=document.createElement("canvas");canvas.width=mmToPx(210);canvas.height=mmToPx(297);
    const ctx=canvas.getContext("2d");if(!ctx)return;ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
    const photoW=mmToPx(widthMm),photoH=mmToPx(heightMm),gap=mmToPx(TOOL025_LIMITS.printGapMm),margin=mmToPx(TOOL025_LIMITS.a4MarginMm);
    for(let r=0;r<a4Layout.rows;r++)for(let c=0;c<a4Layout.cols;c++){
      const x=margin+c*(photoW+gap),y=margin+r*(photoH+gap);
      ctx.save();ctx.translate(x,y);drawPhoto(ctx,photoW,photoH,false);ctx.restore();
      if(cutGuides){ctx.save();ctx.strokeStyle="#999";ctx.lineWidth=1;ctx.setLineDash([5,5]);ctx.strokeRect(x-.5,y-.5,photoW+1,photoH+1);ctx.restore();}
    }
    const blob=await canvasBlob(canvas,"png");downloadBlob(blob,`${safeBase(image.sourceInfo.name)}-${presetId}-A4-210x297mm.png`);
  };
  const nudge=(dx:number,dy:number)=>setPosition(p=>({x:Math.max(-1,Math.min(1,p.x+dx)),y:Math.max(-1,Math.min(1,p.y+dy))}));
  const reset=()=>{setZoom(1);setPosition({x:0,y:0});setGuide(true);setFormat("jpg");setCutGuides(true);setError("");setStatus("");};
  const resetAll=()=>{closeLoaded(image);setImage(null);reset();if(inputRef.current)inputRef.current.value="";};
  const presetGroups={official:TOOL025_PRESETS.filter(p=>p.kind==="official"),general:TOOL025_PRESETS.filter(p=>p.kind==="general"),custom:TOOL025_PRESETS.filter(p=>p.kind==="custom")};

  return <div className={styles.wrapper} data-testid="tool025-root">
    <div className={styles.localNote}><strong>{t.local}</strong><span>{locale==="ko"?"얼굴 사진은 서버로 전송되지 않습니다.":locale==="ja"?"顔写真はサーバーへ送信されません。":"Face photos are not uploaded."}</span></div>

    {error&&<p className={styles.error} role="alert" data-testid="tool025-error">{error}</p>}
    {status&&<p className={styles.status} aria-live="polite">{status}</p>}

    <StableMobileImageFileInput ref={inputRef} className={styles.hidden} accept="image/jpeg,image/png,image/webp" mobileCaptureMode="pixels" onChange={e=>void acceptFile(e.currentTarget.files?.[0])} data-testid="tool025-file-input"/>

    <section
      className={`${styles.dropzone} ${image?styles.dropzoneReady:""} ${(dropDragging||workspaceDragging)?styles.dragging:""}`}
      data-testid="tool025-dropzone"
      onDragOver={e=>{e.preventDefault();setDropDragging(true)}}
      onDragLeave={()=>setDropDragging(false)}
      onDrop={e=>{e.preventDefault();setDropDragging(false);void acceptFile(e.dataTransfer.files[0])}}
    >
      <h2>{t.drop}</h2>
      <p>{image?`${image.sourceInfo.name} · ${image.width}×${image.height}px · ${Math.max(1,Math.round(image.sourceInfo.size/1024))} KB`:t.support}</p>
      <button className={styles.primary} onClick={()=>inputRef.current?.click()}>{image?(locale==="ko"?"새 사진 선택":locale==="ja"?"新しい写真を選択":"Choose another photo"):t.choose}</button>
    </section>

    <div
      className={`${styles.workspace} ${(dropDragging||workspaceDragging)?styles.workspaceDragging:""}`}
      data-testid="tool025-workspace-dropzone"
      onDragEnter={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();setWorkspaceDragging(true)}}}
      onDragOver={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();setWorkspaceDragging(true)}}}
      onDragLeave={e=>{const next=e.relatedTarget as Node|null;if(!next||!e.currentTarget.contains(next))setWorkspaceDragging(false)}}
      onDrop={e=>{if(!Array.from(e.dataTransfer.types).includes("Files"))return;e.preventDefault();setWorkspaceDragging(false);void acceptFile(e.dataTransfer.files[0])}}
    >
      <section className={`${styles.panel} ${styles.previewPanel}`}>
        <div className={styles.panelHead}><div><p>01 · PREVIEW</p><h3>{t.preview}</h3></div><span className={styles.sizeBadge}>{outputSize.w}×{outputSize.h}px</span></div>
        <div className={styles.canvasWrap} data-testid="tool025-preview" onPointerDown={e=>{if(!image)return;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);pointer.current={x:e.clientX,y:e.clientY,start:position}}} onPointerMove={e=>{if(!pointer.current)return;const rect=e.currentTarget.getBoundingClientRect();const dx=(e.clientX-pointer.current.x)/Math.max(1,rect.width);const dy=(e.clientY-pointer.current.y)/Math.max(1,rect.height);setPosition({x:Math.max(-1,Math.min(1,pointer.current.start.x+dx*2.2)),y:Math.max(-1,Math.min(1,pointer.current.start.y+dy*2.2))})}} onPointerUp={()=>{pointer.current=null}} onPointerCancel={()=>{pointer.current=null}}>
          {image?<canvas ref={previewRef}/>:<div className={styles.previewEmpty}>{t.drop}</div>}
        </div>
        <label className={styles.check}><input type="checkbox" checked={guide} onChange={e=>setGuide(e.target.checked)}/>{t.guide}</label>
      </section>

      <section className={`${styles.panel} ${styles.presetPanel}`}>
        <div className={styles.panelHead}><div><p>02 · PRESET</p><h3>{t.preset}</h3></div></div>
        <div className={styles.group}><strong>{t.official}</strong>{presetGroups.official.map(p=><button key={p.id} className={presetId===p.id?styles.activePreset:""} onClick={()=>{setPresetId(p.id);setFormat(p.digitalFormat??"jpg")}}>{presetNames[p.id][locale]}</button>)}</div>
        <div className={styles.group}><strong>{t.general}</strong>{presetGroups.general.map(p=><button key={p.id} className={presetId===p.id?styles.activePreset:""} onClick={()=>setPresetId(p.id)}>{presetNames[p.id][locale]}</button>)}</div>
        <div className={styles.group}><strong>{t.custom}</strong>{presetGroups.custom.map(p=><button key={p.id} className={presetId===p.id?styles.activePreset:""} onClick={()=>setPresetId(p.id)}>{presetNames[p.id][locale]}</button>)}</div>
        {isCustom&&<div className={styles.customGrid}><label>{t.customW}<input type="number" min="1" max="210" value={customW} onChange={e=>setCustomW(Number(e.target.value))}/></label><label>{t.customH}<input type="number" min="1" max="297" value={customH} onChange={e=>setCustomH(Number(e.target.value))}/></label></div>}
        {!customValid&&<p className={styles.error}>{t.customInvalid}</p>}
        <p className={styles.guideText}>{preset.kind==="official"?t.officialNote:t.generalNote}</p>
        {preset.backgroundPolicy&&<p className={styles.warning}>{preset.backgroundPolicy}</p>}
        {preset.documentType.startsWith("passport")&&<p className={styles.warning}>{t.passportNote}</p>}
      </section>
    </div>

    <div className={styles.lowerGrid}>
      <section className={`${styles.panel} ${styles.exportPanel}`}>
        <div className={styles.panelHead}><div><p>04 · EXPORT</p><h3>{t.output}</h3></div></div>
        <div className={styles.info}><span>{t.size}</span><strong data-testid="tool025-output-size">{outputSize.w} × {outputSize.h}px</strong><small>{widthMm} × {heightMm}mm · {TOOL025_LIMITS.printDpi}dpi reference</small></div>
        {presetId==="kr-passport-online"&&<div className={styles.digitalNote} data-testid="tool025-online-rule"><strong>{t.digital}</strong><span>{t.krOnline}</span></div>}
        <label className={styles.formatRow}>{t.format}<select data-testid="tool025-format" value={presetId==="kr-passport-online"?"jpg":format} disabled={presetId==="kr-passport-online"} onChange={e=>setFormat(e.target.value as OutputFormat)}><option value="jpg">JPG</option><option value="png">PNG</option></select></label>
        <p className={styles.guideText}>{preset.officialSource??t.generalNote}</p><p className={styles.verified}>verifiedAt · {preset.verifiedAt}</p>
        <div className={styles.actions}>
          <button className={styles.primary} disabled={!image||!customValid} onClick={()=>void renderIndividual()} data-testid="tool025-download">{t.download}</button>
          <button className={styles.secondary} disabled={!image||!customValid||a4Layout.count<1} onClick={()=>void renderA4()} data-testid="tool025-a4-download">{t.a4Download}</button>
          <button className={styles.secondary} onClick={reset} data-testid="tool025-reset-settings">{t.reset}</button>
          <button className={styles.ghost} onClick={resetAll} data-testid="tool025-reset-all">{t.resetAll}</button>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.a4Panel}`}>
        <div className={styles.panelHead}><div><p>05 · A4 PRINT</p><h3>{t.a4}</h3></div></div>
        <div className={styles.a4Preview}><canvas ref={a4PreviewRef} aria-label={t.a4}/></div>
        <div className={styles.info}><span>{t.a4Count}</span><strong data-testid="tool025-a4-count">{a4Layout.count}</strong><small>210 × 297mm · {a4Layout.cols} × {a4Layout.rows}</small></div>
        <label className={styles.check}><input type="checkbox" checked={cutGuides} onChange={e=>setCutGuides(e.target.checked)}/>{t.cut}</label>
        <p className={styles.actual}>{t.actual}</p>
      </section>

      <section className={`${styles.panel} ${styles.alignPanel}`}>
        <div className={styles.panelHead}><div><p>03 · ALIGN</p><h3>{t.position}</h3></div></div>
        <label className={styles.range}>{t.zoom}<input data-testid="tool025-zoom" type="range" min="1" max="3" step="0.01" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><span>{zoom.toFixed(2)}×</span></label>
        <button className={styles.secondary} onClick={()=>setPosition({x:0,y:0})}>{t.center}</button>
        <div className={styles.dpad} aria-label={t.position}><button aria-label={t.up} onClick={()=>nudge(0,-.05)}>↑</button><button aria-label={t.left} onClick={()=>nudge(-.05,0)}>←</button><button aria-label={t.center} onClick={()=>setPosition({x:0,y:0})}>•</button><button aria-label={t.right} onClick={()=>nudge(.05,0)}>→</button><button aria-label={t.down} onClick={()=>nudge(0,.05)}>↓</button></div>
        <p className={styles.guideText}>{t.noApproval}</p>
      </section>
    </div>
  </div>
}
