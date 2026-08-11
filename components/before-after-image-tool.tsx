"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Locale } from "@/lib/site";
import { openFilePicker } from "@/lib/file-picker";
import styles from "./before-after-image-tool.module.css";
import { loadBrowserImage } from "@/lib/mobile-image-loader";

type SlotKey = "before" | "after";
type FitMode = "cover" | "contain";
type LayoutMode = "horizontal" | "vertical";
type LabelPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
type OutputFormat = "png" | "jpg" | "webp";

const LIMITS = { fileBytes:15*1024*1024, totalBytes:30*1024*1024, sourcePixels:12_000_000, maxSide:3000, maxPixels:9_000_000, labelLength:24 } as const;

type SlotState = {
  key: SlotKey;
  file: File | null;
  name: string;
  url: string;
  source: CanvasImageSource | null;
  width: number;
  height: number;
  fit: FitMode;
  zoom: number;
  offsetX: number;
  offsetY: number;
  label: string;
  labelVisible: boolean;
  labelPosition: LabelPosition;
};

type Snapshot = {
  before: SlotState;
  after: SlotState;
  layout: LayoutMode;
  split: number;
  linkedFit: boolean;
  linkedZoom: boolean;
  labelsVisible: boolean;
  fontSize: number;
  textColor: string;
  labelBackground: string;
  labelOpacity: number;
  labelBold: boolean;
  dividerVisible: boolean;
  dividerWidth: number;
  dividerColor: string;
  gap: number;
  padding: number;
  transparent: boolean;
  backgroundColor: string;
  width: number;
  height: number;
};

const copy = {
  ko: {
    workspace:"전후 비교 이미지 작업장", intro:"Before와 After 이미지 두 장을 선택하면 바로 비교 미리보기가 만들어집니다.", local:"이미지는 서버로 전송되지 않으며 현재 브라우저에서만 처리됩니다.",
    step1:"1. Before·After 이미지 선택", step1Desc:"비교할 이전 사진과 이후 사진을 각각 한 장씩 넣어 주세요.", step2:"2. 비교 방식 선택", step2Desc:"좌우 또는 상하 비교와 두 사진의 분할 비율을 정합니다.", step3:"3. 이미지 위치·크기 맞춤", step3Desc:"미리보기를 보면서 각 사진의 보이는 범위와 확대율을 맞춥니다.", step4:"4. 문구·구분선 설정", step4Desc:"필요한 경우 Before·After 문구와 중앙 구분선을 꾸밉니다.", step5:"5. 결과 확인·다운로드", step5Desc:"결과 크기와 파일 형식을 확인한 뒤 완성 이미지를 저장합니다.",
    before:"Before 이미지", after:"After 이미지", choose:"이미지 선택", replace:"이미지 교체", remove:"삭제", selectTwo:"두 이미지 선택", support:"JPG, JPEG, PNG, WebP · 정확히 두 이미지 · 파일당 15 MiB · 최대 12MP", tooMany:"이미지는 두 장만 선택할 수 있습니다.", tooBigFile:"개별 파일은 15 MiB 이하만 사용할 수 있습니다.", tooBigTotal:"두 이미지의 총 용량은 30 MiB 이하만 사용할 수 있습니다.", tooBigSource:"12MP를 초과하는 이미지는 기본 서비스에서 사용할 수 없습니다.", outputLimit:"결과 이미지는 한 변 3000px, 총 900만 픽셀까지 지원합니다.", unsupported:"지원하지 않는 이미지 형식입니다.", unreadable:"이미지를 읽을 수 없습니다.", empty:"빈 파일은 사용할 수 없습니다.",
    preview:"결과 미리보기", needTwo:"Before와 After 이미지 두 장을 선택해 주세요.", layout:"비교 방향", horizontal:"좌우 비교", vertical:"상하 비교", swap:"Before·After 바꾸기", split:"분할 비율", center:"중앙으로", selected:"선택 이미지", fit:"이미지 맞춤", together:"두 이미지 함께 설정", separate:"개별 설정", cover:"채우기", contain:"전체 보기", zoom:"확대율", linkZoom:"확대율 연결", resetFit:"맞춤 초기화", resetBefore:"Before 맞춤 초기화", resetAfter:"After 맞춤 초기화", resetBoth:"두 이미지 맞춤 초기화",
    labels:"Before·After 문구", showLabels:"라벨 전체 표시", showBeforeLabel:"Before 라벨 표시", showAfterLabel:"After 라벨 표시", beforeLabel:"Before 문구", afterLabel:"After 문구", position:"라벨 위치", topLeft:"왼쪽 위", topCenter:"위 중앙", topRight:"오른쪽 위", bottomLeft:"왼쪽 아래", bottomCenter:"아래 중앙", bottomRight:"오른쪽 아래", fontSize:"글자 크기", textColor:"글자 색상", labelBg:"라벨 배경", opacity:"배경 투명도", bold:"굵게",
    divider:"중앙 구분선", showDivider:"구분선 표시", thickness:"두께", dividerColor:"색상", gap:"이미지 사이 간격", padding:"외곽 여백", background:"배경", transparent:"투명", backgroundColor:"배경색",
    result:"결과 설정", ratio:"결과 비율", resultSize:"결과 크기", width:"결과 너비", height:"결과 높이", output:"출력", format:"출력 형식", quality:"출력 품질", filename:"파일명", download:"이미지 다운로드", downloadAgain:"다시 다운로드", resetStyle:"비교 스타일 초기화", resetAll:"전체 초기화", undo:"실행 취소", redo:"다시 실행", zoomOut:"축소", zoomIn:"확대", fitScreen:"화면 맞춤", view100:"100% 보기", generating:"결과 생성 중", ready:"다운로드 준비 완료", lowRes:"한쪽 이미지의 해상도가 낮아 확대하면 흐려질 수 있습니다.", large:"결과 이미지가 매우 큽니다. 현재 기기에서 생성에 실패할 수 있습니다.",
  },
  en: {
    workspace:"Before & After workspace", intro:"Choose Before and After images to build the comparison preview immediately.", local:"Images stay in this browser and are never uploaded to a server.",
    step1:"1. Choose Before & After Images", step1Desc:"Add one earlier image and one later image to compare.", step2:"2. Choose the Comparison Layout", step2Desc:"Pick side-by-side or top-and-bottom and set the split ratio.", step3:"3. Fit and Position the Images", step3Desc:"Use the preview to adjust each image's crop, position, and zoom.", step4:"4. Set Labels and Divider", step4Desc:"Optionally customize the Before/After labels and center divider.", step5:"5. Review and Download", step5Desc:"Check the result size and file format, then save the finished image.",
    before:"Before Image", after:"After Image", choose:"Select Image", replace:"Replace Image", remove:"Remove", selectTwo:"Select Two Images", support:"JPG, JPEG, PNG, WebP · exactly two images · 15 MiB each · up to 12 MP", tooMany:"You can select only two images.", tooBigFile:"Each file must be 15 MiB or smaller.", tooBigTotal:"The two images must total 30 MiB or less.", tooBigSource:"Images over 12 MP are outside the basic service limit.", outputLimit:"Output is limited to 3000 px per side and 9 million total pixels.", unsupported:"This image format is not supported.", unreadable:"The image could not be read.", empty:"Empty files cannot be used.",
    preview:"Result Preview", needTwo:"Select both Before and After images.", layout:"Comparison Layout", horizontal:"Side by Side", vertical:"Top & Bottom", swap:"Swap Before & After", split:"Split Ratio", center:"Reset to Center", selected:"Selected Image", fit:"Image Fit", together:"Adjust Together", separate:"Adjust Separately", cover:"Fill", contain:"Fit Entire Image", zoom:"Zoom", linkZoom:"Link Zoom", resetFit:"Reset Image Fit", resetBefore:"Reset Before Fit", resetAfter:"Reset After Fit", resetBoth:"Reset Both Fits",
    labels:"Before & After Labels", showLabels:"Show All Labels", showBeforeLabel:"Show Before Label", showAfterLabel:"Show After Label", beforeLabel:"Before Label", afterLabel:"After Label", position:"Label Position", topLeft:"Top Left", topCenter:"Top Center", topRight:"Top Right", bottomLeft:"Bottom Left", bottomCenter:"Bottom Center", bottomRight:"Bottom Right", fontSize:"Font Size", textColor:"Text Color", labelBg:"Label Background", opacity:"Background Opacity", bold:"Bold",
    divider:"Center Divider", showDivider:"Show Divider", thickness:"Thickness", dividerColor:"Color", gap:"Image Gap", padding:"Outer Padding", background:"Background", transparent:"Transparent", backgroundColor:"Background Color",
    result:"Result Settings", ratio:"Result Ratio", resultSize:"Result Size", width:"Width", height:"Height", output:"Output", format:"Output Format", quality:"Output Quality", filename:"File Name", download:"Download Image", downloadAgain:"Download Again", resetStyle:"Reset Comparison Style", resetAll:"Reset All", undo:"Undo", redo:"Redo", zoomOut:"Zoom Out", zoomIn:"Zoom In", fitScreen:"Fit to Screen", view100:"100% View", generating:"Generating result", ready:"Download ready", lowRes:"One image has low resolution and may look soft when enlarged.", large:"The result is very large and may fail on this device.",
  },
  ja: {
    workspace:"ビフォー・アフター比較ワークスペース", intro:"比較前と比較後の画像を選ぶと、すぐに比較プレビューを作成します。", local:"画像はサーバーに送信されず、現在のブラウザ内だけで処理されます。",
    step1:"1. 比較前・比較後の画像を選択", step1Desc:"比較する前の画像と後の画像を1枚ずつ追加します。", step2:"2. 比較方法を選択", step2Desc:"左右または上下の比較方法と分割比率を決めます。", step3:"3. 画像の位置と大きさを調整", step3Desc:"プレビューを見ながら表示範囲と拡大率を調整します。", step4:"4. ラベルと区切り線を設定", step4Desc:"必要に応じて比較前・比較後の文字と中央の区切り線を設定します。", step5:"5. 結果を確認してダウンロード", step5Desc:"結果サイズとファイル形式を確認して完成画像を保存します。",
    before:"比較前の画像", after:"比較後の画像", choose:"画像を選択", replace:"画像を変更", remove:"削除", selectTwo:"2枚の画像を選択", support:"JPG・JPEG・PNG・WebP · 画像は2枚 · 1ファイル15 MiB · 最大12MP", tooMany:"画像は2枚だけ選択できます。", tooBigFile:"1ファイル15 MiB以下の画像を使用してください。", tooBigTotal:"2枚の合計は30 MiB以下にしてください。", tooBigSource:"12MPを超える画像は基本サービスの対象外です。", outputLimit:"出力画像は一辺3000px、合計900万画素まで対応します。", unsupported:"対応していない画像形式です。", unreadable:"画像を読み込めませんでした。", empty:"空のファイルは使用できません。",
    preview:"結果プレビュー", needTwo:"比較前と比較後の画像を2枚選択してください。", layout:"比較方向", horizontal:"左右比較", vertical:"上下比較", swap:"比較前・比較後を\n入れ替え", split:"分割比率", center:"中央に戻す", selected:"選択中の画像", fit:"画像の表示方法", together:"2枚を一緒に\n調整", separate:"個別に調整", cover:"枠いっぱいに表示", contain:"画像全体を\n表示", zoom:"拡大率", linkZoom:"拡大率を連動", resetFit:"表示設定をリセット", resetBefore:"比較前をリセット", resetAfter:"比較後をリセット", resetBoth:"2枚ともリセット",
    labels:"比較前・比較後のラベル", showLabels:"ラベル全体を表示", showBeforeLabel:"比較前ラベルを表示", showAfterLabel:"比較後ラベルを表示", beforeLabel:"比較前の文字", afterLabel:"比較後の文字", position:"ラベル位置", topLeft:"左上", topCenter:"上中央", topRight:"右上", bottomLeft:"左下", bottomCenter:"下中央", bottomRight:"右下", fontSize:"文字サイズ", textColor:"文字色", labelBg:"ラベル背景", opacity:"背景の不透明度", bold:"太字",
    divider:"中央の区切り線", showDivider:"区切り線を表示", thickness:"太さ", dividerColor:"色", gap:"画像間隔", padding:"外側余白", background:"背景", transparent:"透明", backgroundColor:"背景色",
    result:"結果設定", ratio:"結果の比率", resultSize:"結果サイズ", width:"幅", height:"高さ", output:"出力", format:"出力形式", quality:"出力品質", filename:"ファイル名", download:"画像をダウンロード", downloadAgain:"もう一度ダウンロード", resetStyle:"比較スタイルをリセット", resetAll:"すべて初期化", undo:"元に戻す", redo:"やり直す", zoomOut:"縮小", zoomIn:"拡大", fitScreen:"画面に合わせる", view100:"100%表示", generating:"結果を生成中", ready:"ダウンロード準備完了", lowRes:"片方の画像解像度が低いため、拡大するとぼやける場合があります。", large:"結果画像が非常に大きく、現在の端末では生成に失敗する場合があります。",
  },
} as const;

const RATIOS = [
  ["1:1",1],["4:5",4/5],["5:4",5/4],["3:2",3/2],["2:3",2/3],["16:9",16/9],["9:16",9/16]
] as const;

function blankSlot(key: SlotKey, locale: Locale): SlotState {
  const label = key === "before" ? (locale === "ko" ? "전" : locale === "ja" ? "比較前" : "Before") : (locale === "ko" ? "후" : locale === "ja" ? "比較後" : "After");
  return { key,file:null,name:"",url:"",source:null,width:0,height:0,fit:"cover",zoom:1,offsetX:0,offsetY:0,label,labelVisible:true,labelPosition:key==="before"?"top-left":"top-right" };
}
function supported(file: File){ return ["image/jpeg","image/png","image/webp"].includes(file.type) && /\.(jpe?g|png|webp)$/i.test(file.name); }
function closeSource(source: CanvasImageSource | null){ if(typeof ImageBitmap!=="undefined" && source instanceof ImageBitmap) source.close(); }
function safeName(v:string){ return (v.trim()||"before-after").replace(/[\\/:*?"<>|]+/g,"-").replace(/\s+/g,"-").slice(0,100); }
function clamp(n:number,min:number,max:number){ return Math.max(min,Math.min(max,n)); }
function cloneSlot(s:SlotState):SlotState{ return {...s}; }
function snapshotSlot(s:SlotState):SlotState{ return {...s}; }

function cellRects(width:number,height:number,padding:number,gap:number,layout:LayoutMode,split:number){
  const innerW=Math.max(1,width-padding*2), innerH=Math.max(1,height-padding*2);
  const ratio=clamp(split,30,70)/100;
  if(layout==="horizontal"){
    const usable=Math.max(1,innerW-gap); const a=Math.round(usable*ratio); const b=usable-a;
    return {before:{x:padding,y:padding,w:a,h:innerH},after:{x:padding+a+gap,y:padding,w:b,h:innerH},divider:{x:padding+a+gap/2,y:padding,w:0,h:innerH}};
  }
  const usable=Math.max(1,innerH-gap); const a=Math.round(usable*ratio); const b=usable-a;
  return {before:{x:padding,y:padding,w:innerW,h:a},after:{x:padding,y:padding+a+gap,w:innerW,h:b},divider:{x:padding,y:padding+a+gap/2,w:innerW,h:0}};
}

function drawSlot(ctx:CanvasRenderingContext2D, slot:SlotState, rect:{x:number;y:number;w:number;h:number}){
  if(!slot.source||!slot.width||!slot.height) return;
  const base = slot.fit==="cover" ? Math.max(rect.w/slot.width,rect.h/slot.height) : Math.min(rect.w/slot.width,rect.h/slot.height);
  const scale=base*slot.zoom; const dw=slot.width*scale, dh=slot.height*scale;
  const maxX=Math.max(0,(dw-rect.w)/2), maxY=Math.max(0,(dh-rect.h)/2);
  const cx=rect.x+rect.w/2 + slot.offsetX*maxX; const cy=rect.y+rect.h/2 + slot.offsetY*maxY;
  ctx.save(); ctx.beginPath(); ctx.rect(rect.x,rect.y,rect.w,rect.h); ctx.clip(); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality="high"; ctx.drawImage(slot.source,cx-dw/2,cy-dh/2,dw,dh); ctx.restore();
}

function drawLabel(ctx:CanvasRenderingContext2D, slot:SlotState, rect:{x:number;y:number;w:number;h:number}, fontSize:number, textColor:string,bg:string,opacity:number,bold:boolean){
  const text=slot.label.trim(); if(!text) return;
  const fs=clamp(fontSize,10,72), px=12, py=7, margin=14;
  ctx.save(); ctx.font=`${bold?700:600} ${fs}px sans-serif`; const metrics=ctx.measureText(text); const w=Math.min(rect.w-margin*2,metrics.width+px*2), h=fs*1.25+py*2;
  let x=rect.x+margin,y=rect.y+margin;
  if(slot.labelPosition.includes("right")) x=rect.x+rect.w-margin-w; else if(slot.labelPosition.includes("center")) x=rect.x+(rect.w-w)/2;
  if(slot.labelPosition.startsWith("bottom")) y=rect.y+rect.h-margin-h;
  ctx.globalAlpha=clamp(opacity,0,100)/100; ctx.fillStyle=bg; const r=Math.min(12,h/2); ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill();
  ctx.globalAlpha=1; ctx.fillStyle=textColor; ctx.textBaseline="middle"; ctx.textAlign="center"; ctx.fillText(text,x+w/2,y+h/2,Math.max(1,w-px*2)); ctx.restore();
}

export function BeforeAfterImageTool({locale}:{locale:Locale}){
  const t=copy[locale];
  const beforeInput=useRef<HTMLInputElement>(null), afterInput=useRef<HTMLInputElement>(null), bothInput=useRef<HTMLInputElement>(null), previewRef=useRef<HTMLCanvasElement>(null);
  const beforeRef=useRef<SlotState>(blankSlot("before",locale)), afterRef=useRef<SlotState>(blankSlot("after",locale));
  const dragRef=useRef<{slot:SlotKey;x:number;y:number;startX:number;startY:number}|null>(null); const renderRevision=useRef(0);
  const history=useRef<Snapshot[]>([]), redoStack=useRef<Snapshot[]>([]);

  const [before,setBefore]=useState(()=>blankSlot("before",locale)); const [after,setAfter]=useState(()=>blankSlot("after",locale)); const [selected,setSelected]=useState<SlotKey>("before");
  const [layout,setLayout]=useState<LayoutMode>("horizontal"); const [split,setSplit]=useState(50); const [linkedFit,setLinkedFit]=useState(true); const [linkedZoom,setLinkedZoom]=useState(false);
  const [labelsVisible,setLabelsVisible]=useState(true); const [fontSize,setFontSize]=useState(28); const [textColor,setTextColor]=useState("#ffffff"); const [labelBackground,setLabelBackground]=useState("#000000"); const [labelOpacity,setLabelOpacity]=useState(58); const [labelBold,setLabelBold]=useState(true);
  const [dividerVisible,setDividerVisible]=useState(true); const [dividerWidth,setDividerWidth]=useState(2); const [dividerColor,setDividerColor]=useState("#ffffff"); const [gap,setGap]=useState(0); const [padding,setPadding]=useState(0); const [transparent,setTransparent]=useState(false); const [backgroundColor,setBackgroundColor]=useState("#ffffff");
  const [width,setWidth]=useState(1200); const [height,setHeight]=useState(1200); const [ratioName,setRatioName]=useState("1:1"); const [format,setFormat]=useState<OutputFormat>("png"); const [quality,setQuality]=useState(92); const [filename,setFilename]=useState("before-after"); const [viewZoom,setViewZoom]=useState(1);
  const [error,setError]=useState(""); const [status,setStatus]=useState(""); const [downloaded,setDownloaded]=useState(false);

  useEffect(()=>{beforeRef.current=before},[before]); useEffect(()=>{afterRef.current=after},[after]);
  useEffect(()=>()=>{for(const slot of [beforeRef.current,afterRef.current]){closeSource(slot.source);if(slot.url)URL.revokeObjectURL(slot.url)}},[]);

  const makeSnapshot=useCallback(():Snapshot=>({before:snapshotSlot(beforeRef.current),after:snapshotSlot(afterRef.current),layout,split,linkedFit,linkedZoom,labelsVisible,fontSize,textColor,labelBackground,labelOpacity,labelBold,dividerVisible,dividerWidth,dividerColor,gap,padding,transparent,backgroundColor,width,height}),[layout,split,linkedFit,linkedZoom,labelsVisible,fontSize,textColor,labelBackground,labelOpacity,labelBold,dividerVisible,dividerWidth,dividerColor,gap,padding,transparent,backgroundColor,width,height]);
  const remember=useCallback(()=>{history.current.push(makeSnapshot());if(history.current.length>50)history.current.shift();redoStack.current=[]},[makeSnapshot]);
  const applySnapshot=(s:Snapshot)=>{setBefore(cloneSlot(s.before));setAfter(cloneSlot(s.after));setLayout(s.layout);setSplit(s.split);setLinkedFit(s.linkedFit);setLinkedZoom(s.linkedZoom);setLabelsVisible(s.labelsVisible);setFontSize(s.fontSize);setTextColor(s.textColor);setLabelBackground(s.labelBackground);setLabelOpacity(s.labelOpacity);setLabelBold(s.labelBold);setDividerVisible(s.dividerVisible);setDividerWidth(s.dividerWidth);setDividerColor(s.dividerColor);setGap(s.gap);setPadding(s.padding);setTransparent(s.transparent);setBackgroundColor(s.backgroundColor);setWidth(s.width);setHeight(s.height)};
  const undo=()=>{const s=history.current.pop();if(!s)return;redoStack.current.push(makeSnapshot());applySnapshot(s)}; const redo=()=>{const s=redoStack.current.pop();if(!s)return;history.current.push(makeSnapshot());applySnapshot(s)};

  const decode=useCallback(async(file:File,key:SlotKey)=>{
    try{
      if(!file.size)throw new Error(t.empty); if(!supported(file))throw new Error(t.unsupported);
      if(file.size>LIMITS.fileBytes)throw new Error(t.tooBigFile);
      const other=key==="before"?afterRef.current.file:beforeRef.current.file;
      if(file.size+(other?.size??0)>LIMITS.totalBytes)throw new Error(t.tooBigTotal);
      const url=URL.createObjectURL(file); let source:CanvasImageSource,width=0,height=0;
      try{if(typeof createImageBitmap==="function"){try{const b=await createImageBitmap(file,{imageOrientation:"from-image"});source=b;width=b.width;height=b.height}catch{const img=new Image();img.decoding="async";img.src=url;await img.decode();source=img;width=img.naturalWidth;height=img.naturalHeight}}else{const img=new Image();img.decoding="async";img.src=url;await img.decode();source=img;width=img.naturalWidth;height=img.naturalHeight}}catch(e){URL.revokeObjectURL(url);throw e}
      if(!width||!height){closeSource(source);URL.revokeObjectURL(url);throw new Error(t.unreadable)}
      if(width*height>LIMITS.sourcePixels){closeSource(source);URL.revokeObjectURL(url);throw new Error(t.tooBigSource)}
      const old=key==="before"?beforeRef.current:afterRef.current; closeSource(old.source);if(old.url)URL.revokeObjectURL(old.url);
      // File objects/decoded image sources are intentionally not part of undo history.
      // Replacing a file invalidates snapshots that may reference a closed ImageBitmap/Object URL.
      history.current=[];redoStack.current=[];
      const next={...old,file,name:file.name,url,source,width,height,zoom:1,offsetX:0,offsetY:0}; if(key==="before")setBefore(next);else setAfter(next); setError("");setDownloaded(false);
    }catch(e){setError(e instanceof Error?e.message:t.unreadable)}
  },[t.empty,t.unsupported,t.unreadable]);
  const chooseMany=useCallback((files:FileList|null)=>{if(!files?.length)return;if(files.length>2){setError(t.tooMany);return}if(files[0])void decode(files[0],"before");if(files[1])void decode(files[1],"after")},[decode,t.tooMany]);
  const chooseOne=useCallback((files:FileList|null,key:SlotKey)=>{const f=files?.[0];if(!f)return;void decode(f,key)},[decode]);
  const chooseDropped=useCallback((files:FileList|null,key?:SlotKey)=>{if(!files?.length)return;if(files.length>2){setError(t.tooMany);return}if(files.length===2){chooseMany(files);return}const target=key??(!beforeRef.current.source?"before":!afterRef.current.source?"after":selected);void decode(files[0],target)},[chooseMany,decode,selected,t.tooMany]);
  const removeSlot=(key:SlotKey)=>{const cur=key==="before"?beforeRef.current:afterRef.current;closeSource(cur.source);if(cur.url)URL.revokeObjectURL(cur.url);history.current=[];redoStack.current=[];const next=blankSlot(key,locale);if(key==="before")setBefore(next);else setAfter(next);setDownloaded(false)};
  const swap=()=>{remember();setBefore({...after,key:"before"});setAfter({...before,key:"after"});setSelected(s=>s==="before"?"after":"before")};

  const updateSlot=(key:SlotKey,patch:Partial<SlotState>,record=false)=>{if(record)remember();const set=key==="before"?setBefore:setAfter;set(prev=>({...prev,...patch}));setDownloaded(false)};
  const setFit=(fit:FitMode)=>{remember();if(linkedFit){updateSlot("before",{fit,zoom:1,offsetX:0,offsetY:0});updateSlot("after",{fit,zoom:1,offsetX:0,offsetY:0})}else updateSlot(selected,{fit,zoom:1,offsetX:0,offsetY:0})};
  const setZoomForSelected=(zoom:number)=>{const z=clamp(zoom,1,3);if(linkedZoom){setBefore(s=>({...s,zoom:z}));setAfter(s=>({...s,zoom:z}))}else updateSlot(selected,{zoom:z})};
  const resetFit=(key:SlotKey)=>{remember();updateSlot(key,{fit:"cover",zoom:1,offsetX:0,offsetY:0})};
  const resetBothFits=()=>{remember();setBefore(v=>({...v,fit:"cover",zoom:1,offsetX:0,offsetY:0}));setAfter(v=>({...v,fit:"cover",zoom:1,offsetX:0,offsetY:0}));setDownloaded(false)};
  const resetStyle=()=>{remember();const b=blankSlot("before",locale),a=blankSlot("after",locale);setBefore(s=>({...s,label:b.label,labelVisible:true,labelPosition:b.labelPosition}));setAfter(s=>({...s,label:a.label,labelVisible:true,labelPosition:a.labelPosition}));setLabelsVisible(true);setFontSize(28);setTextColor("#ffffff");setLabelBackground("#000000");setLabelOpacity(58);setLabelBold(true);setDividerVisible(true);setDividerWidth(2);setDividerColor("#ffffff");setGap(0);setPadding(0);setTransparent(false);setBackgroundColor("#ffffff")};
  const resetAll=()=>{for(const s of [beforeRef.current,afterRef.current]){closeSource(s.source);if(s.url)URL.revokeObjectURL(s.url)};setBefore(blankSlot("before",locale));setAfter(blankSlot("after",locale));setSelected("before");setLayout("horizontal");setSplit(50);setLinkedFit(true);setLinkedZoom(false);setLabelsVisible(true);setFontSize(28);setTextColor("#ffffff");setLabelBackground("#000000");setLabelOpacity(58);setLabelBold(true);setDividerVisible(true);setDividerWidth(2);setDividerColor("#ffffff");setGap(0);setPadding(0);setTransparent(false);setBackgroundColor("#ffffff");setWidth(1200);setHeight(1200);setRatioName("1:1");setFormat("png");setQuality(92);setFilename("before-after");setViewZoom(1);setError("");setStatus("");setDownloaded(false);history.current=[];redoStack.current=[]};

  const renderTo=useCallback((canvas:HTMLCanvasElement,outW:number,outH:number,preview:boolean)=>{
    const maxW=preview?900:outW,maxH=preview?620:outH; const scale=preview?Math.min(1,maxW/outW,maxH/outH):1; const cw=Math.max(1,Math.round(outW*scale)),ch=Math.max(1,Math.round(outH*scale)); canvas.width=cw;canvas.height=ch;const ctx=canvas.getContext("2d");if(!ctx)return;
    ctx.save();ctx.scale(scale,scale);if(!transparent||format==="jpg"){ctx.fillStyle=backgroundColor;ctx.fillRect(0,0,outW,outH)}else ctx.clearRect(0,0,outW,outH);
    const rects=cellRects(outW,outH,padding,gap,layout,split);drawSlot(ctx,before,rects.before);drawSlot(ctx,after,rects.after);
    if(labelsVisible){if(before.labelVisible)drawLabel(ctx,before,rects.before,fontSize,textColor,labelBackground,labelOpacity,labelBold);if(after.labelVisible)drawLabel(ctx,after,rects.after,fontSize,textColor,labelBackground,labelOpacity,labelBold)}
    if(dividerVisible&&dividerWidth>0){ctx.strokeStyle=dividerColor;ctx.lineWidth=dividerWidth;ctx.beginPath();if(layout==="horizontal"){const x=Math.round(rects.divider.x)+((dividerWidth%2)?0.5:0);ctx.moveTo(x,padding);ctx.lineTo(x,outH-padding)}else{const y=Math.round(rects.divider.y)+((dividerWidth%2)?0.5:0);ctx.moveTo(padding,y);ctx.lineTo(outW-padding,y)}ctx.stroke()}
    ctx.restore();
  },[transparent,format,backgroundColor,padding,gap,layout,split,before,after,labelsVisible,fontSize,textColor,labelBackground,labelOpacity,labelBold,dividerVisible,dividerWidth,dividerColor]);

  useEffect(()=>{const canvas=previewRef.current;if(!canvas)return;const rev=++renderRevision.current;requestAnimationFrame(()=>{if(rev!==renderRevision.current)return;renderTo(canvas,width,height,true)})},[renderTo,width,height]);

  const previewRects=useMemo(()=>cellRects(width,height,padding,gap,layout,split),[width,height,padding,gap,layout,split]);
  const onPointerDown=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const canvas=e.currentTarget;const r=canvas.getBoundingClientRect();const lx=(e.clientX-r.left)*(width/r.width),ly=(e.clientY-r.top)*(height/r.height);const hit=(rect:{x:number;y:number;w:number;h:number})=>lx>=rect.x&&lx<=rect.x+rect.w&&ly>=rect.y&&ly<=rect.y+rect.h;const slot:SlotKey|null=hit(previewRects.before)?"before":hit(previewRects.after)?"after":null;if(!slot)return;remember();setSelected(slot);const s=slot==="before"?before:after;dragRef.current={slot,x:e.clientX,y:e.clientY,startX:s.offsetX,startY:s.offsetY};canvas.setPointerCapture(e.pointerId)};
  const onPointerMove=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const d=dragRef.current;if(!d)return;const rect=d.slot==="before"?previewRects.before:previewRects.after;const slot=d.slot==="before"?before:after;if(!slot.source)return;const base=slot.fit==="cover"?Math.max(rect.w/slot.width,rect.h/slot.height):Math.min(rect.w/slot.width,rect.h/slot.height);const dw=slot.width*base*slot.zoom,dh=slot.height*base*slot.zoom;const maxX=Math.max(1,(dw-rect.w)/2),maxY=Math.max(1,(dh-rect.h)/2);const canvas=e.currentTarget.getBoundingClientRect();const dx=(e.clientX-d.x)*(width/canvas.width),dy=(e.clientY-d.y)*(height/canvas.height);updateSlot(d.slot,{offsetX:clamp(d.startX+dx/maxX,-1,1),offsetY:clamp(d.startY+dy/maxY,-1,1)})};
  const endDrag=()=>{dragRef.current=null};

  const setRatio=(name:string,value:number)=>{remember();setRatioName(name);setHeight(clamp(Math.round(width/value),64,LIMITS.maxSide))};
  const previewScale=useMemo(()=>Math.min(1,900/width,620/height),[width,height]);
  const lowRes=useMemo(()=>{const rects=previewRects;const check=(s:SlotState,r:{w:number;h:number})=>s.source&&(s.width<r.w*.6||s.height<r.h*.6);return !!(check(before,rects.before)||check(after,rects.after))},[before,after,previewRects]);
  const tooLarge=width>LIMITS.maxSide||height>LIMITS.maxSide||width*height>LIMITS.maxPixels;

  const download=async()=>{if(!before.source||!after.source){setError(t.needTwo);return}if(tooLarge){setError(t.outputLimit);return}setStatus(t.generating);setError("");try{const canvas=document.createElement("canvas");renderTo(canvas,width,height,false);const mime=format==="jpg"?"image/jpeg":format==="webp"?"image/webp":"image/png";const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("encode")),mime,format==="png"?undefined:quality/100));const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${safeName(filename)}.${format}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setDownloaded(true);setStatus(t.ready)}catch{setError(locale==="ko"?"결과를 생성하지 못했습니다. 다시 시도해 주세요.":locale==="en"?"The result could not be generated. Please try again.":"結果を生成できませんでした。もう一度お試しください。");setStatus("")}};

  const selectedSlot=selected==="before"?before:after;
  const posOptions:[[LabelPosition,string],[LabelPosition,string],[LabelPosition,string],[LabelPosition,string],[LabelPosition,string],[LabelPosition,string]]=[["top-left",t.topLeft],["top-center",t.topCenter],["top-right",t.topRight],["bottom-left",t.bottomLeft],["bottom-center",t.bottomCenter],["bottom-right",t.bottomRight]];

  return <div className={styles.shell} data-testid="tool015-workbench">
    <input ref={beforeInput} hidden data-testid="tool015-before-input" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={e=>chooseOne(e.target.files,"before")}/><input ref={afterInput} hidden data-testid="tool015-after-input" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={e=>chooseOne(e.target.files,"after")}/><input ref={bothInput} hidden data-testid="tool015-both-input" type="file" multiple accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={e=>chooseMany(e.target.files)}/>
    <div className={styles.head}><div><span>WORKSPACE</span><h2>{t.workspace}</h2></div><p>{t.intro}<br/>{t.local}</p></div>
    <section className={styles.stepCard} data-step="1">
      <div className={styles.stepHead}><div><span>STEP 01</span><h3>{t.step1}</h3></div><p>{t.step1Desc}</p></div>
      <div className={styles.uploadGrid} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();chooseDropped(e.dataTransfer.files)}}>
        {(["before","after"] as SlotKey[]).map(key=>{const slot=key==="before"?before:after;return <section key={key} className={`${styles.slot} ${selected===key?styles.active:""}`} data-testid={`tool015-${key}-slot`} onClick={()=>setSelected(key)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();e.stopPropagation();chooseDropped(e.dataTransfer.files,key)}}>
          {!slot.source?<button type="button" className={styles.slotButton} onClick={()=>key==="before"?openFilePicker(beforeInput.current):openFilePicker(afterInput.current)}><b>＋</b><strong>{key==="before"?t.before:t.after}</strong><span>{t.choose}</span></button>:<div className={styles.slotReady}><img src={slot.url} alt={slot.name}/><div className={styles.slotMeta}><strong>{key==="before"?t.before:t.after}</strong><p>{slot.name}<br/>{slot.width} × {slot.height}px</p><div className={styles.slotActions}><button onClick={()=>key==="before"?openFilePicker(beforeInput.current):openFilePicker(afterInput.current)}>{t.replace}</button><button onClick={()=>removeSlot(key)}>{t.remove}</button></div></div></div>}
        </section>})}
      </div>
      <div className={styles.dualSelect}><button type="button" onClick={()=>openFilePicker(bothInput.current)}>{t.selectTwo}</button></div><p className={styles.support}>{t.support}</p>{error&&<p role="alert" className={styles.error} data-testid="tool015-error">{error}</p>}
    </section>

    <aside className={styles.settings} data-testid="tool015-settings">
      <section className={styles.stepCard} data-step="2">
        <div className={styles.stepHead}><div><span>STEP 02</span><h3>{t.step2}</h3></div><p>{t.step2Desc}</p></div>
        <section className={styles.section}><div className={styles.sectionTitle}><strong>{t.layout}</strong></div><div className={styles.segment}><button className={layout==="horizontal"?styles.active:""} data-testid="tool015-layout-horizontal" onClick={()=>{remember();setLayout("horizontal")}}>{t.horizontal}</button><button className={layout==="vertical"?styles.active:""} data-testid="tool015-layout-vertical" onClick={()=>{remember();setLayout("vertical")}}>{t.vertical}</button></div><div className={styles.field}><span>{t.split}</span><input data-testid="tool015-split" type="range" min="30" max="70" step="10" value={split} onPointerDown={remember} onChange={e=>setSplit(+e.target.value)}/></div><div className={`${styles.segment} ${styles.three}`}>{[30,40,50,60,70].slice(1,4).map(v=><button key={v} className={split===v?styles.active:""} onClick={()=>{remember();setSplit(v)}}>{v}:{100-v}</button>)}</div><button className={styles.ghostButton} onClick={()=>{remember();setSplit(50)}} style={{marginTop:8}}>{t.center}</button></section>
      </section>

      <section className={styles.stepCard} data-step="3">
        <div className={styles.stepHead}><div><span>STEP 03</span><h3>{t.step3}</h3></div><p>{t.step3Desc}</p></div>
        <div className={styles.fitStage}>
          <section className={styles.previewCard} data-testid="tool015-preview"><div className={styles.previewHead}><div><span>PREVIEW</span><p>{t.preview} · {width.toLocaleString()} × {height.toLocaleString()}px</p></div><button className={styles.smallButton} onClick={swap} disabled={!before.source&&!after.source} data-testid="tool015-swap">{t.swap}</button></div><div className={styles.previewWrap}>{before.source||after.source?<canvas ref={previewRef} data-testid="tool015-preview-canvas" style={{transform:`scale(${viewZoom})`}} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}/>:<div className={styles.emptyPreview}><b>{t.preview}</b><span>{t.needTwo}</span></div>}</div><div className={styles.toolbar}><button onClick={undo} disabled={!history.current.length}>{t.undo}</button><button onClick={redo} disabled={!redoStack.current.length}>{t.redo}</button><button onClick={()=>setViewZoom(z=>clamp(z-.1,.6,1.5))}>{t.zoomOut}</button><button onClick={()=>setViewZoom(1)}>{t.fitScreen}</button><button onClick={()=>setViewZoom(clamp(1/previewScale,1,5))}>{t.view100}</button><button onClick={()=>setViewZoom(z=>clamp(z+.1,.6,1.5))}>{t.zoomIn}</button><strong>{selected==="before"?t.before:t.after}</strong></div>{lowRes&&<p className={styles.warning}>{t.lowRes}</p>}{tooLarge&&<p className={styles.warning}>{t.large}</p>}</section>
          <div className={styles.fitControls}>
            <div className={styles.mobileTabs} role="tablist" aria-label={t.selected}><button type="button" role="tab" aria-selected={selected==="before"} className={selected==="before"?styles.active:""} data-testid="tool015-mobile-before-tab" onClick={()=>setSelected("before")}>{t.before}</button><button type="button" role="tab" aria-selected={selected==="after"} className={selected==="after"?styles.active:""} data-testid="tool015-mobile-after-tab" onClick={()=>setSelected("after")}>{t.after}</button></div>
            <section className={styles.section}><div className={styles.sectionTitle}><strong>{t.fit}</strong><small>{t.selected}: {selected==="before"?"Before":"After"}</small></div><label className={styles.check}><input type="checkbox" checked={linkedFit} onChange={e=>setLinkedFit(e.target.checked)}/>{linkedFit?t.together:t.separate}</label><div className={styles.segment}><button data-testid="tool015-fit-cover" className={selectedSlot.fit==="cover"?styles.active:""} onClick={()=>setFit("cover")}>{t.cover}</button><button data-testid="tool015-fit-contain" className={selectedSlot.fit==="contain"?styles.active:""} onClick={()=>setFit("contain")}>{t.contain}</button></div><div className={styles.field}><span>{t.zoom} · {selectedSlot.zoom.toFixed(2)}×</span><input data-testid="tool015-zoom" type="range" min="1" max="3" step="0.05" value={selectedSlot.zoom} onPointerDown={remember} onChange={e=>setZoomForSelected(+e.target.value)}/></div><label className={styles.check}><input type="checkbox" checked={linkedZoom} onChange={e=>setLinkedZoom(e.target.checked)}/>{t.linkZoom}</label><div className={`${styles.segment} ${styles.three}`}><button onClick={()=>resetFit("before")}>{t.resetBefore}</button><button onClick={()=>resetFit("after")}>{t.resetAfter}</button><button onClick={resetBothFits}>{t.resetBoth}</button></div></section>
          </div>
        </div>
      </section>

      <section className={styles.stepCard} data-step="4">
        <div className={styles.stepHead}><div><span>STEP 04</span><h3>{t.step4}</h3></div><p>{t.step4Desc}</p></div>
        <div className={styles.twoColumnSections}>
          <section className={styles.section}><div className={styles.sectionTitle}><strong>{t.labels}</strong></div><label className={styles.check}><input data-testid="tool015-label-visible" type="checkbox" checked={labelsVisible} onChange={e=>{remember();setLabelsVisible(e.target.checked)}}/>{t.showLabels}</label><div className={styles.labelVisibility}><label className={styles.check}><input data-testid="tool015-before-label-visible" type="checkbox" checked={before.labelVisible} onChange={e=>updateSlot("before",{labelVisible:e.target.checked},true)}/>{t.showBeforeLabel}</label><label className={styles.check}><input data-testid="tool015-after-label-visible" type="checkbox" checked={after.labelVisible} onChange={e=>updateSlot("after",{labelVisible:e.target.checked},true)}/>{t.showAfterLabel}</label></div><div className={styles.pair}><label><input data-testid="tool015-before-label" aria-label={t.beforeLabel} maxLength={LIMITS.labelLength} onFocus={remember} value={before.label} onChange={e=>updateSlot("before",{label:e.target.value.slice(0,LIMITS.labelLength)})}/></label><label><input data-testid="tool015-after-label" aria-label={t.afterLabel} maxLength={LIMITS.labelLength} onFocus={remember} value={after.label} onChange={e=>updateSlot("after",{label:e.target.value.slice(0,LIMITS.labelLength)})}/></label></div><div className={styles.field}><span>{t.position}</span><select value={selectedSlot.labelPosition} onFocus={remember} onChange={e=>updateSlot(selected,{labelPosition:e.target.value as LabelPosition})}>{posOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><div className={styles.field}><span>{t.fontSize}</span><input type="number" min="10" max="72" value={fontSize} onFocus={remember} onChange={e=>setFontSize(clamp(+e.target.value,10,72))}/></div><div className={styles.field}><span>{t.textColor}</span><input type="color" value={textColor} onFocus={remember} onChange={e=>setTextColor(e.target.value)}/></div><div className={styles.field}><span>{t.labelBg}</span><input type="color" value={labelBackground} onFocus={remember} onChange={e=>setLabelBackground(e.target.value)}/></div><div className={styles.field}><span>{t.opacity} · {labelOpacity}%</span><input type="range" min="0" max="100" value={labelOpacity} onPointerDown={remember} onChange={e=>setLabelOpacity(+e.target.value)}/></div><label className={styles.check}><input type="checkbox" checked={labelBold} onChange={e=>{remember();setLabelBold(e.target.checked)}}/>{t.bold}</label></section>
          <section className={styles.section}><div className={styles.sectionTitle}><strong>{t.divider}</strong></div><label className={styles.check}><input data-testid="tool015-divider-visible" type="checkbox" checked={dividerVisible} onChange={e=>{remember();setDividerVisible(e.target.checked)}}/>{t.showDivider}</label><div className={styles.field}><span>{t.thickness}</span><input data-testid="tool015-divider-width" type="number" min="0" max="30" value={dividerWidth} onFocus={remember} onChange={e=>setDividerWidth(clamp(+e.target.value,0,30))}/></div><div className={styles.field}><span>{t.dividerColor}</span><input type="color" value={dividerColor} onFocus={remember} onChange={e=>setDividerColor(e.target.value)}/></div><div className={styles.field}><span>{t.gap}</span><input data-testid="tool015-gap" type="number" min="0" max="200" value={gap} onFocus={remember} onChange={e=>setGap(clamp(+e.target.value,0,200))}/></div><div className={styles.field}><span>{t.padding}</span><input data-testid="tool015-padding" type="number" min="0" max="300" value={padding} onFocus={remember} onChange={e=>setPadding(clamp(+e.target.value,0,300))}/></div></section>
        </div>
      </section>

      <section className={styles.stepCard} data-step="5">
        <div className={styles.stepHead}><div><span>STEP 05</span><h3>{t.step5}</h3></div><p>{t.step5Desc}</p></div>
        <div className={styles.twoColumnSections}>
          <section className={styles.section}><div className={styles.sectionTitle}><strong>{t.result}</strong></div><div className={`${styles.segment} ${styles.three}`}>{RATIOS.map(([n,r])=><button key={n} className={ratioName===n?styles.active:""} onClick={()=>setRatio(n,r)}>{n}</button>)}</div><div className={styles.pair}><label><input data-testid="tool015-width" type="number" min="64" max={LIMITS.maxSide} value={width} onFocus={remember} onChange={e=>{setRatioName("custom");setWidth(clamp(Math.floor(+e.target.value||64),64,LIMITS.maxSide))}}/></label><label><input data-testid="tool015-height" type="number" min="64" max={LIMITS.maxSide} value={height} onFocus={remember} onChange={e=>{setRatioName("custom");setHeight(clamp(Math.floor(+e.target.value||64),64,LIMITS.maxSide))}}/></label></div><label className={styles.check}><input data-testid="tool015-transparent" type="checkbox" checked={transparent} disabled={format==="jpg"} onChange={e=>{remember();setTransparent(e.target.checked)}}/>{t.transparent}</label><div className={styles.field}><span>{t.backgroundColor}</span><input type="color" value={backgroundColor} onFocus={remember} onChange={e=>setBackgroundColor(e.target.value)}/></div></section>
          <section className={`${styles.section} ${styles.output}`}><div className={styles.sectionTitle}><strong>{t.output}</strong></div><div className={styles.outputGrid}><label>{t.format}<select data-testid="tool015-format" value={format} onChange={e=>{const f=e.target.value as OutputFormat;setFormat(f);if(f==="jpg")setTransparent(false)}}><option value="png">PNG</option><option value="jpg">JPG</option><option value="webp">WebP</option></select></label><label>{t.quality}<input type="range" min="40" max="100" disabled={format==="png"} value={quality} onChange={e=>setQuality(+e.target.value)}/></label><label style={{gridColumn:"1/-1"}}>{t.filename}<input value={filename} onChange={e=>setFilename(e.target.value)} onBlur={()=>setFilename(safeName(filename))}/></label></div><div className={styles.actions}><button className={styles.primary} data-testid="tool015-download" disabled={!before.source||!after.source} onClick={download}>{downloaded?t.downloadAgain:t.download}</button><button className={styles.secondary} onClick={resetStyle}>{t.resetStyle}</button><button className={styles.secondary} data-testid="tool015-reset-all" onClick={resetAll}>{t.resetAll}</button></div>{status&&<p className={styles.status} aria-live="polite" data-testid="tool015-status">{status}</p>}</section>
        </div>
      </section>
    </aside>
    <div data-testid="tool015-state" hidden data-layout={layout} data-split={split} data-selected={selected} data-before-ready={before.source?"1":"0"} data-after-ready={after.source?"1":"0"} data-before-name={before.name} data-after-name={after.name} data-before-label={before.label} data-after-label={after.label} data-before-label-visible={before.labelVisible?"1":"0"} data-after-label-visible={after.labelVisible?"1":"0"} data-before-fit={before.fit} data-after-fit={after.fit} data-before-zoom={before.zoom} data-after-zoom={after.zoom} data-labels={labelsVisible?"1":"0"} data-divider={dividerVisible?"1":"0"} data-width={width} data-height={height} data-gap={gap} data-padding={padding} data-transparent={transparent?"1":"0"} data-format={format}/>
  </div>;
}
