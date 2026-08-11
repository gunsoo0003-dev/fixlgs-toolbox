"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Locale } from "@/lib/site";
import { openFilePicker } from "@/lib/file-picker";
import { createStoredZip } from "@/lib/zip";
import { createBrowserSafePreviewUrl, loadBrowserImage } from "@/lib/mobile-image-loader";

type Status = "editing" | "ready" | "skipped" | "error";
type EditState = {
  crop: { x: number; y: number; w: number; h: number };
  ratio: string;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  zoom: number;
  panX: number;
  panY: number;
  grid: boolean;
  quality: number;
};
type Item = {
  id: string;
  file: File;
  url: string;
  status: Status;
  width: number;
  height: number;
  edit: EditState;
  undo: EditState[];
  redo: EditState[];
  result?: { blob: Blob; url: string; width: number; height: number; name: string };
  error?: string;
  selected: boolean;
  includeOriginal: boolean;
};

const LIMITS = { count: 10, perFile: 15 * 1024 * 1024, total: 50 * 1024 * 1024, pixels: 16_986_931, side: 16_384 };
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MIN_CROP_PX = 32;
const MAX_UNDO = 30;

async function fileFingerprint(file: File) {
  const data = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function isAnimatedImage(bytes: Uint8Array, type: string) {
  const text = new TextDecoder("latin1").decode(bytes);
  if (type === "image/webp") return text.includes("ANIM") || text.includes("ANMF");
  if (type === "image/png") return text.includes("acTL");
  return false;
}
const initialEdit = (): EditState => ({ crop: { x: .1, y: .1, w: .8, h: .8 }, ratio: "free", rotation: 0, flipX: false, flipY: false, zoom: 1, panX: 0, panY: 0, grid: true, quality: 92 });
const cloneEdit = (e: EditState): EditState => ({ ...e, crop: { ...e.crop } });

const copy = {
  ko: { workspace:"이미지 편집 작업장",drop:"이미지를 여기에 놓거나 선택하세요.",support:"JPG, PNG, WebP · 최대 10개 · 파일당 15MB · 전체 50MB · 최대 16,986,931픽셀 · 최대 한 변 16,384px",choose:"이미지 선택",add:"이미지 추가",current:"현재 이미지",edited:"편집 완료",pending:"미편집",skipped:"건너뜀",previous:"이전",next:"다음",cropMode:"자르기 조정",moveMode:"이미지 이동",crop:"자르기",rotate:"회전",flip:"반전",view:"보기",more:"더보기",ratio:"자르기 비율",free:"자유",original:"원본",custom:"직접 입력",switch:"가로·세로 전환",applyRatio:"비율 적용",left:"왼쪽으로 90도",right:"오른쪽으로 90도",fine:"미세 회전",applyAngle:"각도 적용",resetAngle:"0도로 복원",horizontal:"좌우 반전",vertical:"상하 반전",zoomOut:"축소",zoomIn:"확대",fit:"화면 맞춤",actual:"100% 보기",center:"중앙 정렬",grid:"삼분할 그리드",precise:"정밀 자르기 설정",x:"X 위치",y:"Y 위치",width:"자르기 폭",height:"자르기 높이",applyCoords:"좌표 적용",quality:"저장 품질",resetEdit:"편집 초기화",skip:"건너뛰기",applyNext:"적용하고 다음",result:"결과 확인",empty:"이미지를 선택하면 편집 캔버스가 표시됩니다.",output:"결과 이미지 크기",undo:"실행 취소",redo:"다시 실행",delete:"현재 이미지 삭제",download:"다운로드",zip:"전체 ZIP 다운로드",backEdit:"편집으로 돌아가기",results:"편집 결과",includeOriginal:"원본으로 포함",editNow:"지금 편집",resetAll:"전체 초기화",batch:"일괄 적용",batchRatio:"현재 비율 적용",batchLeft:"전체 왼쪽 90도",batchRight:"전체 오른쪽 90도",targetPending:"미편집 파일만",targetSelected:"선택한 파일",targetAll:"전체 파일",errorType:"지원하지 않는 파일입니다.",errorLimit:"안전한도를 초과한 파일은 제외했습니다.",local:"파일은 서버로 전송되지 않고 브라우저에서 처리됩니다." },
  en: { workspace:"Image editing workspace",drop:"Drop your images here or choose files.",support:"JPG, PNG, WebP · Up to 10 files · 15MB each · 50MB total · Up to 16,986,931 pixels · 16,384px max side",choose:"Choose Images",add:"Add Images",current:"Current Image",edited:"Edited",pending:"Not Edited",skipped:"Skipped",previous:"Previous",next:"Next",cropMode:"Adjust Crop",moveMode:"Move Image",crop:"Crop",rotate:"Rotate",flip:"Flip",view:"View",more:"More",ratio:"Crop Ratio",free:"Free",original:"Original",custom:"Custom",switch:"Switch Orientation",applyRatio:"Apply Ratio",left:"Rotate Left 90°",right:"Rotate Right 90°",fine:"Fine Rotation",applyAngle:"Apply Angle",resetAngle:"Reset to 0°",horizontal:"Flip Horizontally",vertical:"Flip Vertically",zoomOut:"Zoom Out",zoomIn:"Zoom In",fit:"Fit to Screen",actual:"View at 100%",center:"Center Crop",grid:"Rule of Thirds Grid",precise:"Precise crop settings",x:"X Position",y:"Y Position",width:"Crop Width",height:"Crop Height",applyCoords:"Apply Coordinates",quality:"Save Quality",resetEdit:"Reset Edits",skip:"Skip",applyNext:"Apply & Next",result:"View Results",empty:"Choose images to open the editing canvas.",output:"Output Dimensions",undo:"Undo",redo:"Redo",delete:"Delete Current Image",download:"Download",zip:"Download All as ZIP",backEdit:"Back to editing",results:"Edited results",includeOriginal:"Include original",editNow:"Edit now",resetAll:"Reset All",batch:"Batch apply",batchRatio:"Apply current ratio",batchLeft:"Rotate all left 90°",batchRight:"Rotate all right 90°",targetPending:"Not edited only",targetSelected:"Selected files",targetAll:"All files",errorType:"This file type is not supported.",errorLimit:"Files over the safety limits were excluded.",local:"Your files are processed in your browser and are not uploaded to a server." },
  ja: { workspace:"画像編集ワークスペース",drop:"画像をここにドロップするか、ファイルを選択してください。",support:"JPG・PNG・WebP／最大10枚／1枚15MB／合計50MB／最大16,986,931画素／最大辺16,384px",choose:"画像を選択",add:"画像を追加",current:"編集中の画像",edited:"編集完了",pending:"未編集",skipped:"スキップ",previous:"前へ",next:"次へ",cropMode:"切り抜き調整",moveMode:"画像を移動",crop:"切り抜き",rotate:"回転",flip:"反転",view:"表示",more:"その他",ratio:"切り抜き比率",free:"自由",original:"元の比率",custom:"カスタム",switch:"縦横を切り替え",applyRatio:"比率を適用",left:"左に90度回転",right:"右に90度回転",fine:"角度を微調整",applyAngle:"角度を適用",resetAngle:"0度に戻す",horizontal:"左右反転",vertical:"上下反転",zoomOut:"縮小",zoomIn:"拡大",fit:"画面に合わせる",actual:"100%表示",center:"中央に配置",grid:"三分割グリッド",precise:"精密切り抜き設定",x:"X位置",y:"Y位置",width:"切り抜き幅",height:"切り抜き高さ",applyCoords:"座標を適用",quality:"保存画質",resetEdit:"編集をリセット",skip:"スキップ",applyNext:"適用して次へ",result:"結果を確認",empty:"画像を選択すると編集キャンバスが表示されます。",output:"出力画像サイズ",undo:"元に戻す",redo:"やり直す",delete:"現在の画像を削除",download:"ダウンロード",zip:"すべてZIPでダウンロード",backEdit:"編集に戻る",results:"編集結果",includeOriginal:"元画像を含める",editNow:"今すぐ編集",resetAll:"すべてリセット",batch:"一括適用",batchRatio:"現在の比率を適用",batchLeft:"すべて左に90度回転",batchRight:"すべて右に90度回転",targetPending:"未編集のみ",targetSelected:"選択した画像",targetAll:"すべての画像",errorType:"この形式は対応していません。",errorLimit:"安全上限を超えたファイルは除外されました。",local:"ファイルはサーバーに送信されず、ブラウザ内で処理されます。" }
} as const;

function outputName(file: File) {
  const dot = file.name.lastIndexOf(".");
  return dot > 0 ? `${file.name.slice(0, dot)}-edited${file.name.slice(dot)}` : `${file.name}-edited`;
}
function mimeFor(file: File) { return file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg"; }
function downloadBlob(blob: Blob, name: string) { const u=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000); }

export function ImageCropperRotatorTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ kind:"crop"|"move"|"resize"; sx:number; sy:number; start:EditState; corner?:string } | null>(null);
  const pointersRef = useRef(new Map<number,{x:number;y:number}>());
  const pinchRef = useRef<{distance:number;zoom:number}|null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"crop" | "move">("crop");
  const [tab, setTab] = useState<"crop" | "rotate" | "flip" | "view" | "more">("crop");
  const [view, setView] = useState<"edit"|"results">("edit");
  const [message, setMessage] = useState("");
  const [customW,setCustomW]=useState(4), [customH,setCustomH]=useState(5);
  const [batchTarget,setBatchTarget]=useState<"pending"|"selected"|"all">("pending");
  const [coordDraft,setCoordDraft]=useState({x:0,y:0,w:1,h:1});
  const [angleDraft,setAngleDraft]=useState(0);
  const [globalQuality,setGlobalQuality]=useState(92);
  const active = items[index];
  const edited = items.filter(i=>i.status==="ready").length;

  const mutateActive = useCallback((fn:(e:EditState)=>EditState, push=true) => {
    if (!active) return;
    setItems(cur=>cur.map(it=>{
      if(it.id!==active.id) return it;
      const next=fn(cloneEdit(it.edit));
      return { ...it, edit:next, undo:push?[...it.undo.slice(-(MAX_UNDO-1)),cloneEdit(it.edit)]:it.undo, redo:push?[]:it.redo, status:it.status==="ready"?"editing":it.status, result: push&&it.result ? undefined : it.result };
    }));
  },[active]);

  const draw = useCallback(() => {
    if(!active || !canvasRef.current || !imageRef.current) return;
    const img=imageRef.current, e=active.edit;
    const rad=e.rotation*Math.PI/180;
    const absCos=Math.abs(Math.cos(rad)), absSin=Math.abs(Math.sin(rad));
    const w=Math.max(1,Math.round(img.naturalWidth*absCos+img.naturalHeight*absSin));
    const h=Math.max(1,Math.round(img.naturalWidth*absSin+img.naturalHeight*absCos));
    const scale=Math.min(1,Math.sqrt(LIMITS.pixels/(w*h)));
    const c=canvasRef.current; c.width=Math.max(1,Math.round(w*scale));c.height=Math.max(1,Math.round(h*scale));
    const ctx=c.getContext("2d"); if(!ctx)return; ctx.clearRect(0,0,c.width,c.height);
    ctx.save();ctx.translate(c.width/2+e.panX*c.width,c.height/2+e.panY*c.height);ctx.scale(e.zoom*(e.flipX?-1:1),e.zoom*(e.flipY?-1:1));ctx.rotate(rad);ctx.drawImage(img,-img.naturalWidth*scale/2,-img.naturalHeight*scale/2,img.naturalWidth*scale,img.naturalHeight*scale);ctx.restore();
  },[active]);

  useEffect(()=>{ if(!active){imageRef.current=null;return;} const img=new Image();img.onload=()=>{imageRef.current=img;draw();};img.src=active.url;return()=>{ if(imageRef.current===img) imageRef.current=null;};},[active?.id,draw]);
  useEffect(()=>{draw();},[active?.edit,draw]);
  useEffect(()=>{
    if(!active) return;
    const rad=active.edit.rotation*Math.PI/180;
    const rw=Math.max(1,Math.round(active.width*Math.abs(Math.cos(rad))+active.height*Math.abs(Math.sin(rad))));
    const rh=Math.max(1,Math.round(active.width*Math.abs(Math.sin(rad))+active.height*Math.abs(Math.cos(rad))));
    setCoordDraft({x:Math.round(active.edit.crop.x*rw),y:Math.round(active.edit.crop.y*rh),w:Math.max(1,Math.round(active.edit.crop.w*rw)),h:Math.max(1,Math.round(active.edit.crop.h*rh))});
    setAngleDraft(active.edit.rotation);
  },[active?.id,active?.edit.crop,active?.edit.rotation,active?.width,active?.height]);
  useEffect(()=>()=>{items.forEach(i=>{URL.revokeObjectURL(i.url);if(i.result)URL.revokeObjectURL(i.result.url);});},[]); // intentional unmount cleanup

  async function addFiles(list: FileList | File[]) {
    setMessage(""); const all=Array.from(list); const currentBytes=items.reduce((s,i)=>s+i.file.size,0); let used=currentBytes; const room=LIMITS.count-items.length; const accepted=all.slice(0,Math.max(0,room)); const next:Item[]=[];
    const known = new Set(await Promise.all(items.map(i=>fileFingerprint(i.file))));
    for(const file of accepted){
      if(!ACCEPTED.includes(file.type)||file.size===0){setMessage(t.errorType);continue;}
      const bytes=new Uint8Array(await file.slice(0,Math.min(file.size,1_048_576)).arrayBuffer());
      if(isAnimatedImage(bytes,file.type)){setMessage(t.errorType);continue;}
      const fingerprint=await fileFingerprint(file); if(known.has(fingerprint)) continue; known.add(fingerprint);
      if(file.size>LIMITS.perFile||used+file.size>LIMITS.total){setMessage(t.errorLimit);continue;}
      try{const loaded=await loadBrowserImage(file,"from-image"); const pixels=loaded.width*loaded.height; if(pixels>LIMITS.pixels||loaded.width>LIMITS.side||loaded.height>LIMITS.side){loaded.close();setMessage(t.errorLimit);continue;} const item:Item={id:crypto.randomUUID(),file,url:await createBrowserSafePreviewUrl(file),status:"editing",width:loaded.width,height:loaded.height,edit:initialEdit(),undo:[],redo:[],selected:false,includeOriginal:false};loaded.close();next.push(item);used+=file.size;}catch{setMessage(t.errorType);}
    }
    if(next.length){setItems(cur=>[...cur,...next]);if(!items.length)setIndex(0);setView("edit");}
  }

  function removeCurrent(){if(!active)return;URL.revokeObjectURL(active.url);if(active.result)URL.revokeObjectURL(active.result.url);const id=active.id;setItems(cur=>cur.filter(i=>i.id!==id));setIndex(i=>Math.max(0,Math.min(i,items.length-2)));}
  function resetAll(){items.forEach(i=>{URL.revokeObjectURL(i.url);if(i.result)URL.revokeObjectURL(i.result.url);});setItems([]);setIndex(0);setView("edit");setMessage("");}
  function go(delta:number){if(items.length)setIndex(i=>Math.max(0,Math.min(items.length-1,i+delta)));}
  function undo(){if(!active||!active.undo.length)return;setItems(cur=>cur.map(i=>i.id===active.id?{...i,redo:[cloneEdit(i.edit),...i.redo].slice(0,30),edit:cloneEdit(i.undo[i.undo.length-1]),undo:i.undo.slice(0,-1)}:i));}
  function redo(){if(!active||!active.redo.length)return;setItems(cur=>cur.map(i=>i.id===active.id?{...i,undo:[...i.undo,cloneEdit(i.edit)].slice(-30),edit:cloneEdit(i.redo[0]),redo:i.redo.slice(1)}:i));}
  function resetEdit(){mutateActive(()=>initialEdit());}

  function applyRatio(value:string, cw=customW,ch=customH){
    const ratios:Record<string,number|undefined>={"1:1":1,"4:3":4/3,"3:2":3/2,"16:9":16/9,original:active?active.width/active.height:undefined,custom:cw/ch,free:undefined};
    mutateActive(e=>{e.ratio=value;const r=ratios[value];if(r){const centerX=e.crop.x+e.crop.w/2,centerY=e.crop.y+e.crop.h/2;let w=e.crop.w,h=w/r;if(h>.9){h=.9;w=h*r;}if(w>.9){w=.9;h=w/r;}e.crop={x:Math.max(0,Math.min(1-w,centerX-w/2)),y:Math.max(0,Math.min(1-h,centerY-h/2)),w,h};}return e;});
  }
  function switchRatio(){if(!active)return; if(active.edit.ratio==="custom"){const a=customW;setCustomW(customH);setCustomH(a);applyRatio("custom",customH,a);} else {const map:Record<string,string>={"4:3":"3:4","3:2":"2:3","16:9":"9:16","3:4":"4:3","2:3":"3:2","9:16":"16:9"};const next=map[active.edit.ratio];if(next){const [a,b]=next.split(":").map(Number);setCustomW(a);setCustomH(b);applyRatio("custom",a,b);}}}

  async function createResult(item:Item){
    const img=new Image(); await new Promise<void>((res,rej)=>{img.onload=()=>res();img.onerror=()=>rej();img.src=item.url;});
    const e=item.edit,rad=e.rotation*Math.PI/180,absCos=Math.abs(Math.cos(rad)),absSin=Math.abs(Math.sin(rad));
    const bw=Math.max(1,Math.round(img.naturalWidth*absCos+img.naturalHeight*absSin)); const bh=Math.max(1,Math.round(img.naturalWidth*absSin+img.naturalHeight*absCos));
    const base=document.createElement("canvas");base.width=bw;base.height=bh;const b=base.getContext("2d")!;b.translate(bw/2+e.panX*bw,bh/2+e.panY*bh);b.scale(e.zoom*(e.flipX?-1:1),e.zoom*(e.flipY?-1:1));b.rotate(rad);b.drawImage(img,-img.naturalWidth/2,-img.naturalHeight/2);
    const x=Math.round(e.crop.x*bw),y=Math.round(e.crop.y*bh),w=Math.max(1,Math.round(e.crop.w*bw)),h=Math.max(1,Math.round(e.crop.h*bh));const out=document.createElement("canvas");out.width=w;out.height=h;out.getContext("2d")!.drawImage(base,x,y,w,h,0,0,w,h);
    const mime=mimeFor(item.file);const blob=await new Promise<Blob>((res,rej)=>out.toBlob(b=>b?res(b):rej(new Error("encode")),mime,mime==="image/png"?undefined:globalQuality/100));return {blob,url:URL.createObjectURL(blob),width:w,height:h,name:outputName(item.file)};
  }
  async function applyAndNext(){if(!active)return;try{const result=await createResult(active);setItems(cur=>cur.map(i=>{if(i.id!==active.id)return i;if(i.result)URL.revokeObjectURL(i.result.url);return{...i,status:"ready",result,error:undefined};}));
      const next=items.findIndex((i,n)=>n>index&&i.status!=="ready"); if(next>=0)setIndex(next);else setView("results");}catch{setItems(cur=>cur.map(i=>i.id===active.id?{...i,status:"error",error:"Export failed"}:i));}}
  function skip(){if(!active)return;setItems(cur=>cur.map(i=>i.id===active.id?{...i,status:"skipped"}:i));const next=items.findIndex((i,n)=>n>index&&i.status!=="ready");if(next>=0)setIndex(next);else setView("results");}
  async function downloadZip(){
    const used=new Map<string,number>(); const unique=(name:string)=>{const dot=name.lastIndexOf(".");const stem=dot>0?name.slice(0,dot):name,ext=dot>0?name.slice(dot):"";const n=(used.get(name)||0)+1;used.set(name,n);return n===1?name:`${stem}-${n}${ext}`;};
    const files=items.flatMap(i=>i.status==="ready"&&i.result?[{name:unique(i.result.name),blob:i.result.blob}]:i.includeOriginal?[{name:unique(i.file.name),blob:i.file}]:[]);if(!files.length)return;downloadBlob(await createStoredZip(files),"fixlgs-image-cropper-rotator.zip");
  }
  function batch(kind:"ratio"|"left"|"right") { setItems(cur=>cur.map(i=>{
    const eligible=batchTarget==="all"||(batchTarget==="pending"&&i.status!=="ready")||(batchTarget==="selected"&&i.selected); if(!eligible)return i;
    const e=cloneEdit(i.edit); if(kind==="ratio"&&active){const ratio=active.edit.crop.w/active.edit.crop.h;const cx=e.crop.x+e.crop.w/2,cy=e.crop.y+e.crop.h/2;let w=e.crop.w,h=w/ratio;if(h>.9){h=.9;w=h*ratio}if(w>.9){w=.9;h=w/ratio}e.ratio=active.edit.ratio;e.crop={x:Math.max(0,Math.min(1-w,cx-w/2)),y:Math.max(0,Math.min(1-h,cy-h/2)),w,h};}
    if(kind==="left")e.rotation-=90;if(kind==="right")e.rotation+=90;if(i.result)URL.revokeObjectURL(i.result.url);return{...i,edit:e,status:i.status==="ready"?"editing":i.status,result:undefined};})); }

  function pointerPos(ev:ReactPointerEvent){const c=canvasRef.current;if(!c)return{x:0,y:0};const r=c.getBoundingClientRect();return{x:(ev.clientX-r.left)/r.width,y:(ev.clientY-r.top)/r.height};}
  function onPointerDown(ev:ReactPointerEvent,kind:"crop"|"move"|"resize",corner?:string){if(!active)return;pointersRef.current.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});ev.currentTarget.setPointerCapture(ev.pointerId);const p=pointerPos(ev);dragRef.current={kind,sx:p.x,sy:p.y,start:cloneEdit(active.edit),corner};}
  function onPointerMove(ev:ReactPointerEvent){
    if(pointersRef.current.has(ev.pointerId)){pointersRef.current.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});if(pointersRef.current.size===2&&active){const [a,b]=Array.from(pointersRef.current.values());const dist=Math.hypot(a.x-b.x,a.y-b.y);if(!pinchRef.current)pinchRef.current={distance:dist,zoom:active.edit.zoom};else mutateActive(e=>({...e,zoom:Math.max(1,Math.min(5,pinchRef.current!.zoom*dist/pinchRef.current!.distance))}),false);return;}}
    const d=dragRef.current;if(!d||!active)return;const p=pointerPos(ev),dx=p.x-d.sx,dy=p.y-d.sy;mutateActive(e=>{e=cloneEdit(d.start);if(d.kind==="move"){e.panX=Math.max(-.5,Math.min(.5,e.panX+dx));e.panY=Math.max(-.5,Math.min(.5,e.panY+dy));}else if(d.kind==="crop"){e.crop.x=Math.max(0,Math.min(1-e.crop.w,e.crop.x+dx));e.crop.y=Math.max(0,Math.min(1-e.crop.h,e.crop.y+dy));}else{let{x,y,w,h}=e.crop;const min=.04;if(d.corner?.includes("r"))w=Math.max(min,Math.min(1-x,w+dx));if(d.corner?.includes("l")){const nx=Math.max(0,Math.min(x+w-min,x+dx));w+=x-nx;x=nx;}if(d.corner?.includes("b"))h=Math.max(min,Math.min(1-y,h+dy));if(d.corner?.includes("t")){const ny=Math.max(0,Math.min(y+h-min,y+dy));h+=y-ny;y=ny;}e.crop={x,y,w,h};}return e;},false);}
  function onPointerUp(ev?:ReactPointerEvent){if(ev)pointersRef.current.delete(ev.pointerId);if(pointersRef.current.size<2)pinchRef.current=null;const d=dragRef.current;if(!d||!active)return;setItems(cur=>cur.map(i=>i.id===active.id?{...i,undo:[...i.undo.slice(-(MAX_UNDO-1)),d.start],redo:[]}:i));dragRef.current=null;}

  const ratioButtons=useMemo(()=>[["free",t.free],["original",t.original],["1:1","1:1"],["4:3","4:3"],["3:2","3:2"],["16:9","16:9"],["custom",t.custom]] as const,[t]);
  const rotatedSize=active?(()=>{const r=active.edit.rotation*Math.PI/180;return{w:Math.max(1,Math.round(active.width*Math.abs(Math.cos(r))+active.height*Math.abs(Math.sin(r)))),h:Math.max(1,Math.round(active.width*Math.abs(Math.sin(r))+active.height*Math.abs(Math.cos(r))))};})():{w:0,h:0};
  const cropStyle=active?{left:`${active.edit.crop.x*100}%`,top:`${active.edit.crop.y*100}%`,width:`${active.edit.crop.w*100}%`,height:`${active.edit.crop.h*100}%`}:undefined;
  const outputW=active?Math.max(1,Math.round(rotatedSize.w*active.edit.crop.w)):0, outputH=active?Math.max(1,Math.round(rotatedSize.h*active.edit.crop.h)):0;
  function applyCoordinates(){if(!active)return;const x=Math.max(0,Math.min(rotatedSize.w-1,coordDraft.x)),y=Math.max(0,Math.min(rotatedSize.h-1,coordDraft.y));const w=Math.max(MIN_CROP_PX,Math.min(rotatedSize.w-x,coordDraft.w)),h=Math.max(MIN_CROP_PX,Math.min(rotatedSize.h-y,coordDraft.h));mutateActive(e=>({...e,crop:{x:x/rotatedSize.w,y:y/rotatedSize.h,w:w/rotatedSize.w,h:h/rotatedSize.h}}));}
  function onWheel(ev:React.WheelEvent){ev.preventDefault();mutateActive(e=>({...e,zoom:Math.max(1,Math.min(5,e.zoom+(ev.deltaY<0?.1:-.1)))}));}

  return <div className="toolbox-tool-workflow cropper-tool-shell">
    <section className="toolbox-workbench cropper-workbench" data-testid="cropper-workbench" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();addFiles(e.dataTransfer.files);}}>
      <div className="toolbox-workbench-upload"><div className="toolbox-workbench-topline"><div><span>WORKSPACE</span><strong>{t.workspace}</strong></div></div><input ref={inputRef} data-testid="cropper-file-input" type="file" hidden multiple accept="image/jpeg,image/png,image/webp" onChange={e=>{if(e.target.files)addFiles(e.target.files);e.currentTarget.value="";}}/>
      {items.length===0?<div className="toolbox-upload-focus cropper-upload-focus"><div className="toolbox-upload-icon" aria-hidden="true">✦</div><h2>{t.drop}</h2><p>{t.support}</p><button type="button" className="toolbox-upload-primary" onClick={()=>openFilePicker(inputRef.current)}>{t.choose}</button></div>:<div className="toolbox-upload-summary cropper-upload-summary"><div><strong>{items.length}</strong><span>{t.current}</span></div><button type="button" onClick={()=>openFilePicker(inputRef.current)}>{t.add}</button></div>}</div>
      {message&&<p className="cropper-message" role="alert" data-testid="cropper-message">{message}</p>}
      {items.length>0&&view==="edit"&&active&&<div className="cropper-editor-wrap"><div className="cropper-progress-bar"><button onClick={()=>go(-1)} disabled={index===0}>{t.previous}</button><div><strong>{index+1} / {items.length} · {edited} {t.edited}</strong><span>{active.file.name}</span></div><button onClick={()=>go(1)} disabled={index===items.length-1}>{t.next}</button></div>
      <div className="cropper-editor-grid"><aside className="cropper-file-panel">{items.map((it,i)=><div key={it.id} className="cropper-file-row"><button className={i===index?"is-active":""} onClick={()=>setIndex(i)}><img src={it.url} alt=""/><span><strong>{it.file.name}</strong><small>{it.status==="ready"?t.edited:it.status==="skipped"?t.skipped:t.pending}</small></span></button><label className="cropper-file-select"><input type="checkbox" checked={it.selected} onChange={()=>setItems(cur=>cur.map(x=>x.id===it.id?{...x,selected:!x.selected}:x))}/><span aria-hidden="true">✓</span></label></div>)}</aside>
      <main className="cropper-canvas-panel"><div className="cropper-mode-switch"><button className={mode==="crop"?"is-active":""} onClick={()=>setMode("crop")}>{t.cropMode}</button><button className={mode==="move"?"is-active":""} onClick={()=>setMode("move")}>{t.moveMode}</button></div>
      <div ref={stageRef} className="cropper-stage" data-testid="cropper-stage" onWheel={onWheel}><canvas ref={canvasRef}/><div className={`cropper-selection ${active.edit.grid?"show-grid":""}`} style={cropStyle} onPointerDown={e=>onPointerDown(e,mode==="move"?"move":"crop")} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>{["lt","t","rt","r","rb","b","lb","l"].map(c=><i key={c} className={`handle-${c}`} onPointerDown={e=>{e.stopPropagation();onPointerDown(e,"resize",c);}} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}/>)}</div></div>
      <div className="cropper-canvas-actions"><button onClick={undo} disabled={!active.undo.length}>{t.undo}</button><button onClick={redo} disabled={!active.redo.length}>{t.redo}</button><button onClick={resetEdit}>{t.resetEdit}</button><button onClick={removeCurrent}>{t.delete}</button></div><div className="cropper-output-state"><span>{t.output}</span><strong>{outputW} × {outputH}px</strong><small>{Math.round(active.edit.zoom*100)}% · {active.edit.rotation.toFixed(1)}°</small></div></main>
      <aside className="cropper-settings-panel"><div className="cropper-tabs">{(["crop","rotate","flip","view","more"] as const).map(k=><button key={k} className={tab===k?"is-active":""} onClick={()=>setTab(k)}>{t[k]}</button>)}</div><div className="cropper-control-section">
      {tab==="crop"&&<><h3>{t.ratio}</h3><div className="cropper-ratio-grid">{ratioButtons.map(([v,l])=><button key={v} className={active.edit.ratio===v?"is-active":""} onClick={()=>applyRatio(v)}>{l}</button>)}</div><button className="cropper-secondary-wide" onClick={switchRatio}>{t.switch}</button>{active.edit.ratio==="custom"&&<div className="cropper-custom-grid"><label>W<input type="number" min="1" max="100" value={customW} onChange={e=>setCustomW(Math.max(1,Number(e.target.value)||1))}/></label><label>H<input type="number" min="1" max="100" value={customH} onChange={e=>setCustomH(Math.max(1,Number(e.target.value)||1))}/></label><button onClick={()=>applyRatio("custom")}>{t.applyRatio}</button></div>}</>}
      {tab==="rotate"&&<><div className="cropper-two-buttons"><button onClick={()=>mutateActive(e=>({...e,rotation:e.rotation-90}))}>{t.left}</button><button onClick={()=>mutateActive(e=>({...e,rotation:e.rotation+90}))}>{t.right}</button></div><label className="cropper-range-label">{t.fine}<input type="range" min="-45" max="45" step=".5" value={active.edit.rotation%90} onChange={e=>mutateActive(x=>({...x,rotation:Number(e.target.value)}))}/></label><div className="cropper-angle-row"><input type="number" min="-360" max="360" step=".1" value={angleDraft} onChange={e=>setAngleDraft(Number(e.target.value)||0)}/><button onClick={()=>mutateActive(x=>({...x,rotation:Math.max(-360,Math.min(360,angleDraft))}))}>{t.applyAngle}</button><button onClick={()=>{setAngleDraft(0);mutateActive(e=>({...e,rotation:0}))}}>{t.resetAngle}</button></div></>}
      {tab==="flip"&&<div className="cropper-two-buttons"><button className={active.edit.flipX?"is-active":""} onClick={()=>mutateActive(e=>({...e,flipX:!e.flipX}))}>{t.horizontal}</button><button className={active.edit.flipY?"is-active":""} onClick={()=>mutateActive(e=>({...e,flipY:!e.flipY}))}>{t.vertical}</button></div>}
      {tab==="view"&&<><div className="cropper-two-buttons"><button onClick={()=>mutateActive(e=>({...e,zoom:Math.max(1,e.zoom-.1)}))}>{t.zoomOut}</button><button onClick={()=>mutateActive(e=>({...e,zoom:Math.min(5,e.zoom+.1)}))}>{t.zoomIn}</button></div><div className="cropper-two-buttons"><button onClick={()=>mutateActive(e=>({...e,zoom:1,panX:0,panY:0}))}>{t.fit}</button><button onClick={()=>mutateActive(e=>({...e,zoom:1}))}>{t.actual}</button></div><button className="cropper-secondary-wide" onClick={()=>mutateActive(e=>({...e,crop:{...e.crop,x:(1-e.crop.w)/2,y:(1-e.crop.h)/2}}))}>{t.center}</button><button className={active.edit.grid?"is-active cropper-secondary-wide":"cropper-secondary-wide"} onClick={()=>mutateActive(e=>({...e,grid:!e.grid}))}>{t.grid}</button></>}
      {tab==="more"&&<><details open><summary>{t.precise}</summary><div className="cropper-coord-grid"><label>{t.x}<input type="number" min="0" value={coordDraft.x} onChange={e=>setCoordDraft(v=>({...v,x:Number(e.target.value)||0}))}/></label><label>{t.y}<input type="number" min="0" value={coordDraft.y} onChange={e=>setCoordDraft(v=>({...v,y:Number(e.target.value)||0}))}/></label><label>{t.width}<input type="number" min={MIN_CROP_PX} value={coordDraft.w} onChange={e=>setCoordDraft(v=>({...v,w:Number(e.target.value)||MIN_CROP_PX}))}/></label><label>{t.height}<input type="number" min={MIN_CROP_PX} value={coordDraft.h} onChange={e=>setCoordDraft(v=>({...v,h:Number(e.target.value)||MIN_CROP_PX}))}/></label></div><button className="cropper-secondary-wide" onClick={applyCoordinates}>{t.applyCoords}</button></details><label className="cropper-range-label">{t.quality} {active.edit.quality}<input type="range" min="50" max="100" step="1" value={globalQuality} onChange={e=>{const q=Number(e.target.value);setGlobalQuality(q);setItems(cur=>cur.map(i=>({...i,edit:{...i.edit,quality:q}})));}}/></label><details data-testid="cropper-batch-details"><summary>{t.batch}</summary><div className="cropper-two-buttons"><button data-testid="cropper-batch-pending" className={batchTarget==="pending"?"is-active":""} onClick={()=>setBatchTarget("pending")}>{t.targetPending}</button><button data-testid="cropper-batch-selected" className={batchTarget==="selected"?"is-active":""} onClick={()=>setBatchTarget("selected")}>{t.targetSelected}</button><button data-testid="cropper-batch-all" className={batchTarget==="all"?"is-active":""} onClick={()=>setBatchTarget("all")}>{t.targetAll}</button></div><button className="cropper-secondary-wide" onClick={()=>batch("ratio")}>{t.batchRatio}</button><button className="cropper-secondary-wide" onClick={()=>batch("left")}>{t.batchLeft}</button><button className="cropper-secondary-wide" onClick={()=>batch("right")}>{t.batchRight}</button></details></>}
      </div><div className="cropper-final-actions"><button className="cropper-skip" onClick={skip}>{t.skip}</button><button className="cropper-apply" onClick={applyAndNext}>{index===items.length-1?t.result:t.applyNext}</button></div></aside></div></div>}
      {items.length>0&&view==="results"&&<section className="cropper-results"><div className="cropper-results-head"><div><span>RESULT</span><h2>{t.results}</h2><p>{edited} / {items.length} · {t.local}</p></div><button onClick={()=>setView("edit")}>{t.backEdit}</button></div><div className="cropper-result-grid">{items.map((it,i)=><article key={it.id}>{it.result?<img src={it.result.url} alt=""/>:<img src={it.url} alt=""/>}<div><strong>{it.file.name}</strong><small>{it.result?`${it.result.width} × ${it.result.height}px`:it.status==="skipped"?t.skipped:t.pending}</small></div><div className="cropper-result-actions">{it.result?<><button onClick={()=>{setIndex(i);setView("edit")}}>{t.editNow}</button><button data-testid={`cropper-download-${it.id}`} onClick={()=>downloadBlob(it.result!.blob,it.result!.name)}>{t.download}</button></>:<><button onClick={()=>{setIndex(i);setView("edit")}}>{t.editNow}</button><button className={it.includeOriginal?"is-active":""} onClick={()=>setItems(cur=>cur.map(x=>x.id===it.id?{...x,includeOriginal:!x.includeOriginal}:x))}>{t.includeOriginal}</button></>}</div></article>)}</div><div className="cropper-result-footer"><button onClick={()=>setView("edit")}>{t.backEdit}</button><button data-testid="cropper-download-zip" className="cropper-apply" onClick={downloadZip} disabled={!edited}>{t.zip}</button><button data-testid="cropper-reset-all" onClick={resetAll}>{t.resetAll}</button></div></section>}
      {items.length===0&&<p className="cropper-empty-note">{t.empty}</p>}
    </section>
  </div>;
}
