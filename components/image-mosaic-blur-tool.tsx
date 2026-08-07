"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/site";

type Method = "mosaic" | "blur" | "solid";
type ToolMode = "select" | "rect" | "brush" | "pan";
type Point = { x: number; y: number };
type Region = {
  id: string;
  kind: "rect" | "brush";
  x: number;
  y: number;
  width: number;
  height: number;
  points?: Point[];
  brushSize?: number;
  method: Method;
  strength: number;
  color: string;
};
type Snapshot = { regions: Region[]; pixelateAll: boolean; pixelStrength: number };
const MAX_PIXELS = 67_108_864;
const MAX_SIDE = 8192;
const MAX_HISTORY = 60;
const MAX_REGIONS = 75;
const REGION_WARNING = 60;

const text = {
  ko: { select:"이미지 선택", drop:"이미지를 여기에 놓으세요", paste:"클립보드 이미지 붙여넣기", support:"JPG, PNG, WebP · 한 번에 한 장", local:"이미지는 서버로 전송되지 않으며 현재 브라우저에서만 처리됩니다.", workspace:"이미지 모자이크·블러 작업장", chosen:"선택한 이미지", replace:"이미지 교체", rect:"사각형", brush:"자유 브러시", selectMode:"선택", pan:"캔버스 이동", mosaic:"모자이크", blur:"블러", solid:"단색 가림", strength:"강도", brushSize:"브러시 크기", color:"가림 색상", undo:"실행 취소", redo:"다시 실행", fit:"화면 맞춤", actual:"100% 보기", original:"원본 보기", result:"결과 보기", hideAreas:"영역 숨기기", showAreas:"영역 표시", delete:"영역 삭제", deleteAll:"모든 영역 삭제", whole:"전체 픽셀화", applied:"적용 영역", safety:"민감한 문자 정보는 완전 불투명 단색 가림을 권장합니다.", verify:"다운로드 전에 가려지지 않은 정보가 없는지 확대해 확인하세요.", output:"출력 설정", format:"출력 형식", quality:"출력 품질", filename:"파일명", download:"이미지 다운로드", again:"다시 다운로드", reset:"전체 초기화", ready:"편집 준비 완료", creating:"결과 생성 중", unsupported:"지원하지 않는 이미지 형식입니다.", unreadable:"이미지를 읽을 수 없습니다.", empty:"빈 파일은 사용할 수 없습니다.", mismatch:"파일 확장자와 실제 이미지 형식이 일치하지 않습니다.", tooLarge:"현재 안전 처리 한도는 19.2MP, 최대 한 변 16,384px입니다.", tooManyRegions:"영역은 최대 75개까지 추가할 수 있습니다. 60개부터는 편집 속도가 느려질 수 있습니다.", noImage:"클립보드에서 이미지를 찾을 수 없습니다.", black:"검정", white:"흰색", custom:"사용자 지정", selected:"선택된 영역", none:"없음" },
  en: { select:"Select Image", drop:"Drop an image here", paste:"Paste Image from Clipboard", support:"JPG, PNG, WebP · One image at a time", local:"Your image is processed only in this browser and is not uploaded to a server.", workspace:"Image mosaic and blur workspace", chosen:"Selected image", replace:"Replace Image", rect:"Rectangle", brush:"Freehand Brush", selectMode:"Select", pan:"Pan", mosaic:"Mosaic", blur:"Blur", solid:"Solid Redaction", strength:"Strength", brushSize:"Brush Size", color:"Redaction Color", undo:"Undo", redo:"Redo", fit:"Fit to Screen", actual:"View at 100%", original:"View Original", result:"View Result", hideAreas:"Hide Areas", showAreas:"Show Areas", delete:"Delete Area", deleteAll:"Delete All Areas", whole:"Pixelate Entire Image", applied:"Applied Areas", safety:"Use solid redaction for sensitive text that must not be recovered.", verify:"Check the image for visible private information before downloading.", output:"Output settings", format:"Output Format", quality:"Output Quality", filename:"File Name", download:"Download Image", again:"Download Again", reset:"Reset All", ready:"Ready to Edit", creating:"Creating Result", unsupported:"This image format is not supported.", unreadable:"The image could not be read.", empty:"Empty files cannot be used.", mismatch:"The file extension does not match the actual image format.", tooLarge:"The safe processing limit is 67.1MP and 8,192px per side.", tooManyRegions:"You can add up to 75 areas. Editing may slow down from 60 areas.", noImage:"No image was found in the clipboard.", black:"Black", white:"White", custom:"Custom", selected:"Selected Area", none:"None" },
  ja: { select:"画像を選択", drop:"画像をここにドロップ", paste:"クリップボードから画像を貼り付け", support:"JPG・PNG・WebP · 1回に1枚", local:"画像はサーバーに送信されず、現在のブラウザ内だけで処理されます。", workspace:"画像モザイク・ぼかしワークスペース", chosen:"選択した画像", replace:"画像を変更", rect:"長方形", brush:"フリーブラシ", selectMode:"選択", pan:"キャンバスを移動", mosaic:"モザイク", blur:"ぼかし", solid:"不透明な塗りつぶし", strength:"強さ", brushSize:"ブラシサイズ", color:"塗りつぶし色", undo:"元に戻す", redo:"やり直す", fit:"画面に合わせる", actual:"100%表示", original:"元画像を表示", result:"編集後を表示", hideAreas:"領域を非表示", showAreas:"領域を表示", delete:"領域を削除", deleteAll:"すべての領域を削除", whole:"画像全体をピクセル化", applied:"適用した領域", safety:"復元されてはいけない文字情報には不透明な塗りつぶしを使用してください。", verify:"ダウンロード前に個人情報が残っていないか拡大して確認してください。", output:"出力設定", format:"出力形式", quality:"出力品質", filename:"ファイル名", download:"画像をダウンロード", again:"もう一度ダウンロード", reset:"すべて初期化", ready:"編集準備完了", creating:"結果を作成中", unsupported:"対応していない画像形式です。", unreadable:"画像を読み込めませんでした。", empty:"空のファイルは使用できません。", mismatch:"拡張子と実際の画像形式が一致していません。", tooLarge:"現在の処理上限候補は19.2MP、最大辺16,384pxです。", tooManyRegions:"領域は最大75個まで追加できます。60個以降は編集速度が低下する場合があります。", noImage:"クリップボードに画像がありません。", black:"黒", white:"白", custom:"カスタム", selected:"選択中の領域", none:"なし" }
} as const;

function cloneSnapshot(s: Snapshot): Snapshot { return { pixelateAll:s.pixelateAll, pixelStrength:s.pixelStrength, regions:s.regions.map(r=>({...r,points:r.points?.map(p=>({...p}))})) }; }
function safeName(v:string){return (v.trim()||"image-redacted").replace(/[\\/:*?"<>|]+/g,"-").replace(/\s+/g,"-").slice(0,120)}
function formatBytes(v:number){if(v<1024)return `${v} B`;if(v<1048576)return `${(v/1024).toFixed(1)} KB`;return `${(v/1048576).toFixed(1)} MB`}

type ImageKind="jpeg"|"png"|"webp";
function extensionKind(name:string):ImageKind|null{const extension=name.split(".").pop()?.toLowerCase();if(extension==="jpg"||extension==="jpeg")return "jpeg";if(extension==="png")return "png";if(extension==="webp")return "webp";return null}
function mimeKind(type:string):ImageKind|null{return type==="image/jpeg"?"jpeg":type==="image/png"?"png":type==="image/webp"?"webp":null}
async function inspectImageFile(file:File):Promise<ImageKind>{
  if(file.size===0)throw new Error("empty");
  const bytes=new Uint8Array(await file.slice(0,64).arrayBuffer());
  const ascii=(start:number,length:number)=>String.fromCharCode(...bytes.slice(start,start+length));
  let actual:ImageKind|null=null;
  if(bytes[0]===0xff&&bytes[1]===0xd8)actual="jpeg";
  else if(bytes.length>=8&&bytes[0]===0x89&&ascii(1,3)==="PNG"&&bytes[4]===0x0d&&bytes[5]===0x0a&&bytes[6]===0x1a&&bytes[7]===0x0a)actual="png";
  else if(bytes.length>=12&&ascii(0,4)==="RIFF"&&ascii(8,4)==="WEBP")actual="webp";
  if(!actual)throw new Error("unsupported");
  const mime=mimeKind(file.type);if(!mime||mime!==actual)throw new Error("mismatch");
  const extension=extensionKind(file.name);if(extension&&extension!==actual)throw new Error("mismatch");
  return actual;
}

async function readExifOrientation(file: File): Promise<number> {
  if (mimeKind(file.type) !== "jpeg") return 1;
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return 1;
  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (marker === 0xe1 && offset + 4 + length <= bytes.length) {
      const start = offset + 4;
      if (String.fromCharCode(...bytes.slice(start, start + 4)) === "Exif") {
        const tiff = start + 6;
        const little = bytes[tiff] === 0x49 && bytes[tiff + 1] === 0x49;
        const u16 = (i: number) => little ? bytes[i] | (bytes[i + 1] << 8) : (bytes[i] << 8) | bytes[i + 1];
        const u32 = (i: number) => little
          ? (bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24)) >>> 0
          : ((bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3]) >>> 0;
        const ifd = tiff + u32(tiff + 4);
        const count = u16(ifd);
        for (let n = 0; n < count; n += 1) {
          const entry = ifd + 2 + n * 12;
          if (u16(entry) === 0x0112) return u16(entry + 8) || 1;
        }
      }
    }
    if (!length) break;
    offset += 2 + length;
  }
  return 1;
}

async function decodeOrientedBitmap(file: File): Promise<ImageBitmap> {
  const orientation = await readExifOrientation(file);
  const raw = await createImageBitmap(file, { imageOrientation: "none" });
  if (orientation === 1) return raw;
  const swap = orientation >= 5 && orientation <= 8;
  const normalized = document.createElement("canvas");
  normalized.width = swap ? raw.height : raw.width;
  normalized.height = swap ? raw.width : raw.height;
  const context = normalized.getContext("2d");
  if (!context) { raw.close(); throw new Error("decode"); }
  switch (orientation) {
    case 2: context.translate(raw.width, 0); context.scale(-1, 1); break;
    case 3: context.translate(raw.width, raw.height); context.rotate(Math.PI); break;
    case 4: context.translate(0, raw.height); context.scale(1, -1); break;
    case 5: context.rotate(Math.PI / 2); context.scale(1, -1); break;
    case 6: context.translate(raw.height, 0); context.rotate(Math.PI / 2); break;
    case 7: context.translate(raw.height, raw.width); context.rotate(Math.PI / 2); context.scale(-1, 1); break;
    case 8: context.translate(0, raw.width); context.rotate(-Math.PI / 2); break;
  }
  context.drawImage(raw, 0, 0);
  raw.close();
  return createImageBitmap(normalized);
}

function pointInRegion(p:Point,r:Region){if(r.kind==="rect")return p.x>=r.x&&p.x<=r.x+r.width&&p.y>=r.y&&p.y<=r.y+r.height;const pts=r.points||[];return pts.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<=(r.brushSize||20)/2)}

export function ImageMosaicBlurTool({locale}:{locale:Locale}){
  const t=text[locale]; const input=useRef<HTMLInputElement>(null); const canvas=useRef<HTMLCanvasElement>(null); const wrap=useRef<HTMLDivElement>(null); const image=useRef<CanvasImageSource|null>(null); const imageBitmap=useRef<ImageBitmap|null>(null); const drag=useRef<{type:"draw"|"move"|"resize"|"pan";start:Point;origin?:Region;last?:Point;regionId?:string;working?:Snapshot}|null>(null);
  const [file,setFile]=useState<File|null>(null); const [pasteReady,setPasteReady]=useState(false); const [jpgBackground,setJpgBackground]=useState("#ffffff"); const [dimensions,setDimensions]=useState({width:0,height:0}); const [mode,setMode]=useState<ToolMode>("rect"); const [method,setMethod]=useState<Method>("mosaic"); const [strength,setStrength]=useState(24); const [brushSize,setBrushSize]=useState(48); const [color,setColor]=useState("#000000"); const [selectedId,setSelectedId]=useState<string|null>(null); const [showAreas,setShowAreas]=useState(true); const [showOriginal,setShowOriginal]=useState(false); const [zoom,setZoom]=useState(1); const [pan,setPan]=useState({x:0,y:0}); const [format,setFormat]=useState("original"); const [quality,setQuality]=useState(92); const [filename,setFilename]=useState("image-redacted"); const [status,setStatus]=useState(""); const [error,setError]=useState(""); const [resultSize,setResultSize]=useState<number|null>(null); const [history,setHistory]=useState<Snapshot[]>([{regions:[],pixelateAll:false,pixelStrength:24}]); const [historyIndex,setHistoryIndex]=useState(0); const [draftSnapshot,setDraftSnapshot]=useState<Snapshot|null>(null);
  const snapshot=history[historyIndex]; const effectiveSnapshot=draftSnapshot??snapshot; const regions=effectiveSnapshot.regions; const selected=regions.find(r=>r.id===selectedId)||null;
  const resolvedFormat=useMemo(()=>format==="original"?(file?.type==="image/png"?"png":file?.type==="image/webp"?"webp":"jpg"):format,[format,file]);

  const commit=useCallback((next:Snapshot)=>{const trimmed=history.slice(0,historyIndex+1);const nextHistory=[...trimmed,cloneSnapshot(next)].slice(-MAX_HISTORY);setHistory(nextHistory);setHistoryIndex(nextHistory.length-1);setResultSize(null)},[history,historyIndex]);
  const updateSelected=(patch:Partial<Region>)=>{if(!selected)return;commit({...snapshot,regions:regions.map(r=>r.id===selected.id?{...r,...patch}:r)});};

  const renderTo = useCallback((ctx:CanvasRenderingContext2D,w:number,h:number,includeGuides:boolean,background?:string)=>{
    const img=image.current;
    if(!img)return;
    ctx.save();
    ctx.clearRect(0,0,w,h);
    if(background){ctx.fillStyle=background;ctx.fillRect(0,0,w,h)}
    ctx.drawImage(img,0,0,w,h);
    if(includeGuides&&showOriginal){ctx.restore();return}

    const sx=w/dimensions.width,sy=h/dimensions.height;
    const makeMask=(region:Region)=>{
      const mask=document.createElement("canvas");mask.width=w;mask.height=h;
      const mc=mask.getContext("2d");if(!mc)return null;
      mc.fillStyle="#fff";mc.strokeStyle="#fff";mc.lineCap="round";mc.lineJoin="round";
      if(region.kind==="rect")mc.fillRect(region.x*sx,region.y*sy,region.width*sx,region.height*sy);
      else{const pts=region.points||[];if(!pts.length)return mask;mc.lineWidth=Math.max(1,(region.brushSize||20)*Math.max(sx,sy));mc.beginPath();mc.moveTo(pts[0].x*sx,pts[0].y*sy);for(const point of pts.slice(1))mc.lineTo(point.x*sx,point.y*sy);mc.stroke()}
      return mask;
    };
    const applyEffect=(region:Region)=>{
      const mask=makeMask(region);if(!mask)return;
      const before=document.createElement("canvas");before.width=w;before.height=h;
      const bc=before.getContext("2d");if(!bc)return;bc.drawImage(ctx.canvas,0,0);
      const effect=document.createElement("canvas");effect.width=w;effect.height=h;
      const ec=effect.getContext("2d");if(!ec)return;
      if(region.method==="solid"){ec.fillStyle=region.color;ec.fillRect(0,0,w,h)}
      else if(region.method==="blur"){const radius=Math.max(1,region.strength*Math.max(sx,sy)/2);ec.filter=`blur(${radius}px)`;ec.drawImage(before,0,0)}
      else{
        const block=Math.max(2,Math.round(region.strength*Math.max(sx,sy)));
        const small=document.createElement("canvas");small.width=Math.max(1,Math.ceil(w/block));small.height=Math.max(1,Math.ceil(h/block));
        const sc=small.getContext("2d");if(!sc)return;sc.imageSmoothingEnabled=false;sc.drawImage(before,0,0,w,h,0,0,small.width,small.height);
        ec.imageSmoothingEnabled=false;ec.drawImage(small,0,0,small.width,small.height,0,0,w,h);
      }
      ec.globalCompositeOperation="destination-in";ec.drawImage(mask,0,0);ec.globalCompositeOperation="source-over";
      ctx.drawImage(effect,0,0);
    };
    if(effectiveSnapshot.pixelateAll){applyEffect({id:"all",kind:"rect",x:0,y:0,width:dimensions.width,height:dimensions.height,method:"mosaic",strength:effectiveSnapshot.pixelStrength,color:"#000000"})}
    for(const region of regions)applyEffect(region);

    if(includeGuides&&showAreas){
      for(const region of regions){
        ctx.save();ctx.strokeStyle=region.id===selectedId?"#0868D7":"rgba(8,104,215,.62)";ctx.fillStyle="#0868D7";ctx.lineWidth=Math.max(1,2/zoom);ctx.setLineDash(region.id===selectedId?[]:[6/zoom,5/zoom]);
        if(region.kind==="rect"){
          ctx.strokeRect(region.x*sx,region.y*sy,region.width*sx,region.height*sy);
          if(region.id===selectedId){const hs=Math.max(7,9/zoom);for(const [hx,hy] of [[region.x,region.y],[region.x+region.width,region.y],[region.x,region.y+region.height],[region.x+region.width,region.y+region.height]])ctx.fillRect(hx*sx-hs/2,hy*sy-hs/2,hs,hs)}
        }else{
          const pts=region.points||[];if(pts.length){ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=(region.brushSize||20)*Math.max(sx,sy)+Math.max(2,2/zoom);ctx.beginPath();ctx.moveTo(pts[0].x*sx,pts[0].y*sy);for(const point of pts.slice(1))ctx.lineTo(point.x*sx,point.y*sy);ctx.stroke()}
        }
        ctx.restore();
      }
    }
    ctx.restore();
  },[dimensions,regions,selectedId,showAreas,showOriginal,effectiveSnapshot.pixelStrength,effectiveSnapshot.pixelateAll,zoom]);

  useEffect(()=>{const c=canvas.current;if(!c||!dimensions.width)return;c.width=Math.min(dimensions.width,1600);c.height=Math.round(c.width*dimensions.height/dimensions.width);const ctx=c.getContext("2d");if(ctx)renderTo(ctx,c.width,c.height,true)},[renderTo,dimensions]);

  const load=async(f:File)=>{
    setError("");setStatus("");
    try{
      await inspectImageFile(f);
      const url=URL.createObjectURL(f);
      try{
        const bitmap=await decodeOrientedBitmap(f);
        if(bitmap.width>MAX_SIDE||bitmap.height>MAX_SIDE||bitmap.width*bitmap.height>MAX_PIXELS){bitmap.close();setError(t.tooLarge);return}
        imageBitmap.current?.close();imageBitmap.current=bitmap;image.current=bitmap;
        setFile(f);setDimensions({width:bitmap.width,height:bitmap.height});setFilename(`${f.name.replace(/\.[^.]+$/,"")}-redacted`);setHistory([{regions:[],pixelateAll:false,pixelStrength:24}]);setHistoryIndex(0);setDraftSnapshot(null);setSelectedId(null);setZoom(1);setPan({x:0,y:0});setShowOriginal(false);setShowAreas(true);setResultSize(null);setStatus(t.ready);
      }finally{URL.revokeObjectURL(url)}
    }catch(error){const code=error instanceof Error?error.message:"decode";setError(code==="empty"?t.empty:code==="mismatch"?t.mismatch:code==="unsupported"?t.unsupported:t.unreadable)}
  };
  useEffect(()=>{const onPaste=(e:ClipboardEvent)=>{const data=e.clipboardData;if(!data)return;const direct=Array.from(data.files ?? []).find(file=>file.type.startsWith("image/"));const item=Array.from(data.items ?? []).find(entry=>entry.type.startsWith("image/"));const f=direct??item?.getAsFile()??null;if(f){e.preventDefault();void load(f)}};window.addEventListener("paste",onPaste);setPasteReady(true);return()=>{setPasteReady(false);window.removeEventListener("paste",onPaste)}},[]);
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(!file)return;const mod=e.ctrlKey||e.metaKey;if(mod&&e.key.toLowerCase()==="z"){e.preventDefault();setHistoryIndex(i=>e.shiftKey?Math.min(history.length-1,i+1):Math.max(0,i-1));return}if(mod&&e.key.toLowerCase()==="y"){e.preventDefault();setHistoryIndex(i=>Math.min(history.length-1,i+1));return}if((e.key==="Delete"||e.key==="Backspace")&&selected){e.preventDefault();commit({...snapshot,regions:regions.filter(r=>r.id!==selected.id)});setSelectedId(null);return}if(selected&&["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){e.preventDefault();const step=e.shiftKey?10:1;const dx=e.key==="ArrowLeft"?-step:e.key==="ArrowRight"?step:0;const dy=e.key==="ArrowUp"?-step:e.key==="ArrowDown"?step:0;const nx=Math.max(0,Math.min(dimensions.width-selected.width,selected.x+dx));const ny=Math.max(0,Math.min(dimensions.height-selected.height,selected.y+dy));const moved={...selected,x:nx,y:ny,points:selected.points?.map(q=>({x:q.x+nx-selected.x,y:q.y+ny-selected.y}))};commit({...snapshot,regions:regions.map(r=>r.id===selected.id?moved:r)})}};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[file,history.length,selected,snapshot,regions,dimensions,commit]);
  const canvasPoint=(e:React.PointerEvent<HTMLCanvasElement>):Point=>{const c=canvas.current!;const rect=c.getBoundingClientRect();return {x:Math.max(0,Math.min(dimensions.width,(e.clientX-rect.left)/rect.width*dimensions.width)),y:Math.max(0,Math.min(dimensions.height,(e.clientY-rect.top)/rect.height*dimensions.height))}};
  const pointerDown=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    if(!file||e.button!==0)return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p=canvasPoint(e);
    if(mode==="pan"){drag.current={type:"pan",start:{x:e.clientX,y:e.clientY},last:{x:pan.x,y:pan.y}};return}
    if(mode==="select"){
      const hit=[...snapshot.regions].reverse().find(region=>pointInRegion(p,region));
      setSelectedId(hit?.id||null);
      if(hit){
        const near=hit.kind==="rect"&&Math.hypot(p.x-(hit.x+hit.width),p.y-(hit.y+hit.height))<=Math.max(12,20/zoom);
        const working=cloneSnapshot(snapshot);
        drag.current={type:near?"resize":"move",start:p,origin:{...hit,points:hit.points?.map(point=>({...point}))},regionId:hit.id,working};
        setDraftSnapshot(working);
      }
      return;
    }
    if(snapshot.regions.length>=MAX_REGIONS){setError(t.tooManyRegions);return}
    if(snapshot.regions.length>=REGION_WARNING)setStatus(locale==="ko"?"영역이 60개를 넘어 편집 속도가 느려질 수 있습니다.":locale==="en"?"More than 60 areas may reduce editing performance.":"領域が60個を超えると編集速度が低下する場合があります。");
    const id=crypto.randomUUID();
    const region:Region=mode==="rect"?{id,kind:"rect",x:p.x,y:p.y,width:1,height:1,method,strength,color}:{id,kind:"brush",x:p.x,y:p.y,width:1,height:1,points:[p],brushSize,method,strength,color};
    const working={...cloneSnapshot(snapshot),regions:[...snapshot.regions,region]};
    drag.current={type:"draw",start:p,regionId:id,working};
    setSelectedId(id);
    setDraftSnapshot(working);
  };
  const pointerMove=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    const active=drag.current;if(!active)return;
    e.preventDefault();
    if(active.type==="pan"){setPan({x:(active.last?.x||0)+e.clientX-active.start.x,y:(active.last?.y||0)+e.clientY-active.start.y});return}
    const p=canvasPoint(e);
    const base=active.working??cloneSnapshot(snapshot);
    const nextRegions=base.regions.map(region=>{
      if(region.id!==active.regionId)return region;
      if(active.type==="resize"&&active.origin?.kind==="rect"){
        return {...active.origin,width:Math.max(3,Math.min(dimensions.width-active.origin.x,p.x-active.origin.x)),height:Math.max(3,Math.min(dimensions.height-active.origin.y,p.y-active.origin.y))};
      }
      if(active.type==="move"&&active.origin){
        const dx=p.x-active.start.x,dy=p.y-active.start.y;
        const nx=Math.max(0,Math.min(dimensions.width-active.origin.width,active.origin.x+dx));
        const ny=Math.max(0,Math.min(dimensions.height-active.origin.height,active.origin.y+dy));
        return {...active.origin,x:nx,y:ny,points:active.origin.points?.map(point=>({x:point.x+nx-active.origin!.x,y:point.y+ny-active.origin!.y}))};
      }
      if(active.type==="draw"&&region.kind==="rect"){
        const x=Math.min(active.start.x,p.x),y=Math.min(active.start.y,p.y);
        return {...region,x,y,width:Math.abs(p.x-active.start.x),height:Math.abs(p.y-active.start.y)};
      }
      if(active.type==="draw"&&region.kind==="brush"){
        const points=[...(region.points||[])];
        const last=points.at(-1);
        if(!last||Math.hypot(last.x-p.x,last.y-p.y)>=Math.max(1,(region.brushSize||20)/8))points.push(p);
        const xs=points.map(point=>point.x),ys=points.map(point=>point.y);
        return {...region,points,x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
      }
      return region;
    });
    const working={...base,regions:nextRegions};
    active.working=working;
    setDraftSnapshot(working);
  };
  const pointerUp=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
    const active=drag.current;if(!active)return;
    e.preventDefault();
    if(active.type==="pan"){drag.current=null;return}
    const end=canvasPoint(e);
    let working=active.working??cloneSnapshot(snapshot);
    const finalRegions=working.regions.map(region=>{
      if(region.id!==active.regionId)return region;
      if(active.type==="draw"&&region.kind==="rect")return {...region,x:Math.min(active.start.x,end.x),y:Math.min(active.start.y,end.y),width:Math.abs(end.x-active.start.x),height:Math.abs(end.y-active.start.y)};
      if(active.type==="draw"&&region.kind==="brush"){
        const points=[...(region.points||[])];const last=points.at(-1);if(!last||Math.hypot(last.x-end.x,last.y-end.y)>0.5)points.push(end);
        const xs=points.map(point=>point.x),ys=points.map(point=>point.y);
        return {...region,points,x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
      }
      return region;
    }).filter(region=>region.kind==="brush"?(region.points?.length??0)>=2:region.width>=3&&region.height>=3);
    working={...working,regions:finalRegions};
    drag.current=null;
    setDraftSnapshot(null);
    const changed=JSON.stringify(cloneSnapshot(snapshot))!==JSON.stringify(cloneSnapshot(working));
    if(changed)commit(working);
    if(!finalRegions.some(region=>region.id===active.regionId))setSelectedId(null);
    setResultSize(null);
  };
  const pointerCancel=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);drag.current=null;setDraftSnapshot(null)};
  const download=async()=>{
    if(!file||!image.current)return;setError("");setStatus(t.creating);
    try{const out=document.createElement("canvas");out.width=dimensions.width;out.height=dimensions.height;const ctx=out.getContext("2d",{willReadFrequently:true});if(!ctx)throw new Error("canvas");renderTo(ctx,out.width,out.height,false,resolvedFormat==="jpg"?jpgBackground:undefined);const mime=resolvedFormat==="png"?"image/png":resolvedFormat==="webp"?"image/webp":"image/jpeg";const blob=await new Promise<Blob|null>(resolve=>out.toBlob(resolve,mime,quality/100));if(!blob)throw new Error("blob");const href=URL.createObjectURL(blob);try{const anchor=document.createElement("a");anchor.href=href;anchor.download=`${safeName(filename)}.${resolvedFormat}`;document.body.appendChild(anchor);anchor.click();anchor.remove()}finally{setTimeout(()=>URL.revokeObjectURL(href),0)}setResultSize(blob.size);setStatus(t.ready)}catch{setError(t.unreadable);setStatus("")}
  };
  const reset=()=>{setHistory([{regions:[],pixelateAll:false,pixelStrength:24}]);setHistoryIndex(0);setDraftSnapshot(null);setSelectedId(null);setResultSize(null);setPan({x:0,y:0});setZoom(1);setShowOriginal(false);setShowAreas(true)};
  const fullReset=()=>{reset();imageBitmap.current?.close();imageBitmap.current=null;image.current=null;setFile(null);setDimensions({width:0,height:0});setStatus("");setError("");setFilename("image-redacted");setFormat("original")};
  const pasteFromClipboard=async()=>{try{const items=await navigator.clipboard.read();for(const item of items){const type=item.types.find(value=>value.startsWith("image/"));if(type){const blob=await item.getType(type);await load(new File([blob],"clipboard-image",{type}));return}}setError(t.noImage)}catch{setError(t.noImage)}};
  const selectFile=(event:React.ChangeEvent<HTMLInputElement>)=>{const next=event.target.files?.[0];if(next)void load(next);event.target.value=""};

  if(!file)return (
    <div className="toolbox-tool-workflow" data-testid="tool010-root" data-clipboard-paste-ready={pasteReady?"true":"false"}>
      <section className="toolbox-workbench">
        <div className="toolbox-workbench-upload" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const next=event.dataTransfer.files[0];if(next)void load(next)}}>
          <div className="toolbox-workbench-topline"><div><span>WORKSPACE</span><strong>{t.workspace}</strong></div></div>
          <div className="toolbox-upload-focus">
            <span className="toolbox-upload-icon" aria-hidden="true">＋</span><h2>{t.drop}</h2><p>{t.local}</p>
            <div className="mosaic-upload-actions"><button data-testid="tool010-select" type="button" onClick={()=>input.current?.click()}>{t.select}</button><button className="mosaic-paste" type="button" onClick={pasteFromClipboard}>{t.paste}</button></div>
            <small>{t.support}</small>
          </div>
          <input ref={input} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile}/>
        </div>
        {error&&<p className="mosaic-error" role="alert" data-testid="tool010-error">{error}</p>}
      </section>
    </div>
  );

  return (
    <div className="toolbox-tool-workflow" data-testid="tool010-root" data-clipboard-paste-ready={pasteReady?"true":"false"}>
      <section className="toolbox-workbench" data-testid="tool010-editor">
        <div className="toolbox-workbench-upload is-active-workspace">
          <div className="toolbox-workbench-topline"><div><span>WORKSPACE</span><strong>{t.workspace}</strong></div></div>
          <div className="toolbox-upload-active">
            <div className="toolbox-upload-active-head">
              <div><span>{t.chosen}</span><p>{t.local}</p></div>
              <div className="toolbox-upload-active-actions"><div className="toolbox-file-stats"><span>{dimensions.width} × {dimensions.height}px</span><span>{formatBytes(file.size)}</span><span>{file.type.replace("image/","").toUpperCase()}</span></div><button type="button" onClick={()=>input.current?.click()}>＋ {t.replace}</button></div>
            </div>
            <div className="toolbox-upload-selected-file"><strong title={file.name}>{file.name}</strong><span>{status}</span></div>
            <input ref={input} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile}/>
          </div>
        </div>
        <div className="mosaic-editor-grid toolbox-workbench-editor-grid">
          <section className="mosaic-canvas-card toolbox-workbench-preview-card">
            <div className="mosaic-toolbar">{([["select",t.selectMode],["rect",t.rect],["brush",t.brush],["pan",t.pan]] as const).map(([value,label])=><button type="button" key={value} data-testid={`tool010-mode-${value}`} className={mode===value?"is-active":""} aria-pressed={mode===value} onClick={()=>setMode(value)}>{label}</button>)}<span/><button type="button" data-testid="tool010-undo" onClick={()=>setHistoryIndex(index=>Math.max(0,index-1))} disabled={historyIndex===0}>{t.undo}</button><button type="button" data-testid="tool010-redo" onClick={()=>setHistoryIndex(index=>Math.min(history.length-1,index+1))} disabled={historyIndex===history.length-1}>{t.redo}</button></div>
            <div ref={wrap} className="mosaic-canvas-wrap"><canvas ref={canvas} data-testid="tool010-canvas" aria-label={t.workspace} style={{transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,touchAction:"none",cursor:mode==="pan"?"grab":mode==="brush"?"crosshair":"default"}} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerCancel}/></div>
            <div className="mosaic-viewbar"><button type="button" data-testid="tool010-zoom-out" aria-label={locale==="ko"?"축소":locale==="en"?"Zoom Out":"縮小"} onClick={()=>setZoom(value=>Math.max(.25,value-.25))}>−</button><strong data-testid="tool010-zoom-level">{Math.round(zoom*100)}%</strong><button type="button" data-testid="tool010-zoom-in" aria-label={locale==="ko"?"확대":locale==="en"?"Zoom In":"拡大"} onClick={()=>setZoom(value=>Math.min(4,value+.25))}>＋</button><button type="button" data-testid="tool010-fit" onClick={()=>{setZoom(1);setPan({x:0,y:0})}}>{t.fit}</button><button type="button" data-testid="tool010-actual" onClick={()=>setZoom(1)}>{t.actual}</button><button type="button" aria-pressed={showOriginal} onClick={()=>setShowOriginal(value=>!value)}>{showOriginal?t.result:t.original}</button><button type="button" aria-pressed={!showAreas} onClick={()=>setShowAreas(value=>!value)}>{showAreas?t.hideAreas:t.showAreas}</button></div>
          </section>
          <aside className="mosaic-panel toolbox-workbench-settings-card">
            <div className="toolbox-workbench-settings-head"><div><span>{locale==="ko"?"가림 설정":locale==="en"?"Redaction settings":"隠し方の設定"}</span><p data-testid="tool010-applied-count">{t.applied}: {regions.length}</p></div></div>
            <div className="mosaic-segment">{([["mosaic",t.mosaic],["blur",t.blur],["solid",t.solid]] as const).map(([value,label])=><button type="button" key={value} className={method===value?"is-active":""} aria-pressed={method===value} onClick={()=>{setMethod(value);if(selected)updateSelected({method:value})}}>{label}</button>)}</div>
            <label>{t.strength}<input data-testid="tool010-strength" type="range" min="4" max="80" value={selected?.strength??strength} onChange={event=>{const value=+event.target.value;setStrength(value);if(selected)updateSelected({strength:value})}}/><span>{selected?.strength??strength}</span></label>
            <label>{t.brushSize}<input type="range" min="8" max="180" value={brushSize} onChange={event=>setBrushSize(+event.target.value)}/><span>{brushSize}px</span></label>
            <div className="mosaic-colors"><span>{t.color}</span><button type="button" onClick={()=>{setColor("#000000");if(selected)updateSelected({color:"#000000"})}}>{t.black}</button><button type="button" onClick={()=>{setColor("#ffffff");if(selected)updateSelected({color:"#ffffff"})}}>{t.white}</button><input aria-label={t.custom} type="color" value={selected?.color??color} onChange={event=>{setColor(event.target.value);if(selected)updateSelected({color:event.target.value})}}/></div>
            <div className="mosaic-selected"><strong>{t.selected}</strong><span>{selected?`${selected.kind} · ${selected.method}`:t.none}</span></div>
            <button type="button" data-testid="tool010-delete-selected" onClick={()=>{if(selected){commit({...snapshot,regions:regions.filter(region=>region.id!==selected.id)});setSelectedId(null)}}} disabled={!selected}>{t.delete}</button>
            <button type="button" data-testid="tool010-delete-all" onClick={()=>{commit({...snapshot,regions:[]});setSelectedId(null)}} disabled={!regions.length}>{t.deleteAll}</button>
            <button type="button" data-testid="tool010-pixelate-all" className={snapshot.pixelateAll?"is-active":""} aria-pressed={snapshot.pixelateAll} onClick={()=>commit({...snapshot,pixelateAll:!snapshot.pixelateAll})}>{t.whole}</button>
            <label>{locale==="ko"?"전체 픽셀화 강도":locale==="en"?"Full pixelation strength":"全体ピクセル化の強さ"}<input data-testid="tool010-pixel-strength" type="range" min="4" max="80" value={snapshot.pixelStrength} onChange={event=>commit({...snapshot,pixelStrength:+event.target.value})}/><span>{snapshot.pixelStrength}</span></label>
            <p className="mosaic-safety">{t.safety}<br/>{t.verify}</p>
          </aside>
        </div>
        <div className="mosaic-output-card adjuster-output-card">
          <div className="toolbox-workbench-settings-head adjuster-output-head"><div><span>{t.output}</span><p data-testid="tool010-output-applied-count">{t.applied}: {regions.length}</p></div></div>
          <section className="toolbox-workbench-actions adjuster-output mosaic-output-controls">
            <div><label>{t.format}<select data-testid="tool010-output-format" value={format} onChange={event=>{setFormat(event.target.value);setResultSize(null)}}><option value="original">{locale==="ko"?"원본 형식 유지":locale==="en"?"Keep original format":"元の形式を維持"}</option><option value="jpg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option></select></label><label>{t.quality}<input type="range" min="40" max="100" value={quality} disabled={resolvedFormat==="png"} onChange={event=>{setQuality(+event.target.value);setResultSize(null)}}/><span>{resolvedFormat==="png"?"—":`${quality}%`}</span></label><label>{t.filename}<input type="text" value={filename} onChange={event=>{setFilename(event.target.value);setResultSize(null)}} onBlur={()=>setFilename(safeName(filename))}/></label>{resolvedFormat==="jpg"&&<label>{locale==="ko"?"JPG 배경색":locale==="en"?"JPG background":"JPG背景色"}<input aria-label={locale==="ko"?"JPG 배경색":locale==="en"?"JPG background":"JPG背景色"} type="color" value={jpgBackground} onChange={event=>{setJpgBackground(event.target.value);setResultSize(null)}}/></label>}</div>
            <div><button type="button" className="toolbox-primary-action" data-testid="tool010-download" onClick={download}>{resultSize?t.again:t.download}</button><button type="button" data-testid="tool010-full-reset" onClick={fullReset}>{t.reset}</button></div>
          </section>
          <section className="toolbox-workbench-result-card mosaic-result" data-testid="tool010-result" aria-label={locale==="ko"?"결과 정보":locale==="en"?"Result information":"結果情報"}><strong>{locale==="ko"?"결과 정보":locale==="en"?"Result information":"結果情報"}</strong><span>{dimensions.width} × {dimensions.height}px</span><span>{t.applied}: {regions.length}</span><span>{resolvedFormat.toUpperCase()}</span>{resultSize!==null&&<span>{formatBytes(resultSize)}</span>}</section>
          {status&&<p className="adjuster-status" aria-live="polite">{status}</p>}
          {error&&<p className="mosaic-error" role="alert" data-testid="tool010-error">{error}</p>}
        </div>
      </section>
    </div>
  );
}
