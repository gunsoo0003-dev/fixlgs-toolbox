"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./youtube-channel-banner-tool.module.css";
import { YOUTUBE_BANNER_GUIDELINES, TOOL020_DEVICE_PREVIEWS, TOOL020_SERVICE_LIMITS, scaledSafeArea, validateImageFile, isAnimatedImage, sanitizeDownloadName, clampNormalized, type DevicePreviewMode } from "@/lib/tool-020-youtube-banner";
import { calculateTool020LogoBounds, clampTool020CenterToSafe, drawTool020Banner, isTool020RectInside, measureTool020TitleBounds } from "@/lib/tool-020-renderer";

type Locale="ko"|"en"|"ja"; type Format="jpg"|"png";
type ImageState={file:File;url?:string;img:CanvasImageSource;width:number;height:number;close?:()=>void};
type Design={bgX:number;bgY:number;bgZoom:number;bgDark:number;bgColor:string;title:string;font:string;fontSize:number;color:string;align:CanvasTextAlign;titleX:number;titleY:number;outline:boolean;outlineWidth:number;outlineColor:string;shadow:boolean;shadowBlur:number;shadowX:number;shadowY:number;shadowColor:string;logoX:number;logoY:number;logoScale:number;logoOpacity:number;guide:boolean};
const initial:Design={bgX:.5,bgY:.5,bgZoom:1,bgDark:0,bgColor:"#111111",title:"",font:"system-ui, -apple-system, 'Noto Sans KR', 'Noto Sans JP', sans-serif",fontSize:120,color:"#ffffff",align:"center",titleX:.5,titleY:.5,outline:false,outlineWidth:4,outlineColor:"#000000",shadow:true,shadowBlur:16,shadowX:4,shadowY:4,shadowColor:"rgba(0,0,0,.55)",logoX:.5,logoY:.42,logoScale:.18,logoOpacity:1,guide:true};
const copy={ko:{choose:"배경 이미지 선택",blank:"빈 배너 시작",replace:"배경 이미지 교체",title:"제목",logo:"로고",addLogo:"로고 선택",removeLogo:"로고 제거",background:"배경",position:"배경 위치",zoom:"확대·축소",dark:"배경 어둡게",font:"글꼴",size:"글자 크기",color:"글자색",outline:"외곽선",shadow:"그림자",logoSize:"로고 크기",opacity:"투명도",safe:"안전영역",tv:"TV 미리보기",desktop:"PC 미리보기",mobile:"모바일 미리보기",format:"파일 형식",quality:"이미지 품질",fileSize:"파일 크기",download:"배너 다운로드",again:"다시 다운로드",newImage:"새 이미지",reset:"전체 초기화",inside:"안전영역 안",outside:"안전영역 밖",local:"이미지와 문구는 이 브라우저에서만 처리됩니다.",bad:"지원하지 않거나 손상된 이미지입니다.",animated:"애니메이션 이미지는 지원하지 않습니다.",mismatch:"파일 확장자와 실제 이미지 형식이 일치하지 않습니다.",large:"일반 사용자 안정 범위를 초과한 파일입니다.",small:"원본 이미지가 작아 배너에서 흐리게 보일 수 있습니다.",limit:"현재 YouTube 업로드 기준 6MB를 초과합니다.",guide:"가이드 표시",left:"왼쪽",center:"가운데",right:"오른쪽"},en:{choose:"Choose Background Image",blank:"Start Blank",replace:"Replace Background",title:"Title",logo:"Logo",addLogo:"Choose Logo",removeLogo:"Remove Logo",background:"Background",position:"Background Position",zoom:"Zoom",dark:"Darken Background",font:"Font",size:"Font Size",color:"Text Color",outline:"Outline",shadow:"Shadow",logoSize:"Logo Size",opacity:"Opacity",safe:"Safe Area",tv:"TV Preview",desktop:"Desktop Preview",mobile:"Mobile Preview",format:"File Format",quality:"Image Quality",fileSize:"File Size",download:"Download Banner",again:"Download Again",newImage:"New Image",reset:"Reset All",inside:"Inside Safe Area",outside:"Outside Safe Area",local:"Images and text are processed only in this browser.",bad:"Unsupported or damaged image.",animated:"Animated images are not supported.",mismatch:"The file extension and image type do not match.",large:"This file exceeds the general-user stability limit.",small:"The source image may look soft when enlarged for the banner.",limit:"The result exceeds the current 6 MB YouTube upload limit.",guide:"Show Guide",left:"Left",center:"Center",right:"Right"},ja:{choose:"背景画像を選択",blank:"空のバナーから開始",replace:"背景画像を変更",title:"タイトル",logo:"ロゴ",addLogo:"ロゴを選択",removeLogo:"ロゴを削除",background:"背景",position:"背景位置",zoom:"拡大・縮小",dark:"背景を暗くする",font:"フォント",size:"文字サイズ",color:"文字色",outline:"縁取り",shadow:"影",logoSize:"ロゴサイズ",opacity:"不透明度",safe:"セーフエリア",tv:"テレビプレビュー",desktop:"PCプレビュー",mobile:"モバイルプレビュー",format:"ファイル形式",quality:"画質",fileSize:"ファイルサイズ",download:"バナーをダウンロード",again:"もう一度ダウンロード",newImage:"新しい画像",reset:"リセット",inside:"セーフエリア内",outside:"セーフエリア外",local:"画像と文字はこのブラウザ内だけで処理されます。",bad:"対応していない、または破損した画像です。",animated:"アニメーション画像には対応していません。",mismatch:"拡張子と画像形式が一致していません。",large:"一般ユーザー向けの安定範囲を超えるファイルです。",small:"元画像が小さいため、バナーではぼやける場合があります。",limit:"現在のYouTubeアップロード上限6MBを超えています。",guide:"ガイドを表示",left:"左",center:"中央",right:"右"}} as const;

async function loadImage(file:File):Promise<ImageState>{
  if(typeof createImageBitmap==="function"){
    try{const bitmap=await createImageBitmap(file,{imageOrientation:"from-image"});return {file,img:bitmap,width:bitmap.width,height:bitmap.height,close:()=>bitmap.close()}}catch{}
  }
  return await new Promise<ImageState>((resolve,reject)=>{const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>resolve({file,url,img,width:img.naturalWidth,height:img.naturalHeight});img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("decode"))};img.src=url})
}
function releaseImage(v:ImageState|null){if(!v)return;v.close?.();if(v.url)URL.revokeObjectURL(v.url)}
function formatBytes(n:number){return n<1024*1024?`${(n/1024).toFixed(0)} KB`:`${(n/1024/1024).toFixed(2)} MB`}
export function YoutubeChannelBannerTool({locale}:{locale:Locale}){
 const t=copy[locale]; const [bg,setBg]=useState<ImageState|null>(null),[logo,setLogo]=useState<ImageState|null>(null),[started,setStarted]=useState(false),[design,setDesign]=useState<Design>(initial),[mode,setMode]=useState<DevicePreviewMode>("tv"),[format,setFormat]=useState<Format>("jpg"),[quality,setQuality]=useState(92),[blob,setBlob]=useState<Blob|null>(null),[error,setError]=useState(""),[warning,setWarning]=useState(""),[history,setHistory]=useState<Design[]>([initial]),[hIndex,setHIndex]=useState(0),[downloaded,setDownloaded]=useState(false),[selected,setSelected]=useState<"title"|"logo">("title"); const canvas=useRef<HTMLCanvasElement>(null); const bgInput=useRef<HTMLInputElement>(null); const drag=useRef<{kind:"bg"|"title"|"logo";x:number;y:number;start:Design}|null>(null);
 const safe=useMemo(()=>scaledSafeArea(),[]); const preview=TOOL020_DEVICE_PREVIEWS[mode];
 const setD=useCallback((patch:Partial<Design>,commit=true)=>{setDesign(d=>{const n={...d,...patch};if(commit){setHistory(h=>{const base=h.slice(0,hIndex+1);const next=[...base,n].slice(-TOOL020_SERVICE_LIMITS.maxHistoryStates);setHIndex(next.length-1);return next})}return n});setBlob(null);setDownloaded(false)},[hIndex]);
 useEffect(()=>()=>{releaseImage(bg);releaseImage(logo)},[bg,logo]);
 const pick=async(file:File|undefined,role:"background"|"logo")=>{if(!file)return;setError("");setWarning("");const v=validateImageFile(file,role);if(!v.ok){setError(v.code==="MIME_EXTENSION_MISMATCH"?t.mismatch:v.code==="FILE_TOO_LARGE"?t.large:t.bad);return}if(await isAnimatedImage(file)){setError(t.animated);return}try{const next=await loadImage(file);if(next.width*next.height>TOOL020_SERVICE_LIMITS.maxSourcePixels){releaseImage(next);setError(t.large);return}if(role==="background"){releaseImage(bg);setBg(next);setStarted(true);setD({bgX:.5,bgY:.5,bgZoom:1},true);if(next.width<2560||next.height<1440)setWarning(t.small)}else{releaseImage(logo);setLogo(next);setD({logoX:.5,logoY:.42,logoScale:.18,logoOpacity:1},true)}}catch{setError(t.bad)}};
 const draw=useCallback((ctx:CanvasRenderingContext2D,w:number,h:number)=>drawTool020Banner(ctx,w,h,design,bg,logo,safe.width),[bg,logo,design,safe.width]);
 useEffect(()=>{const c=canvas.current;if(!c)return;const ctx=c.getContext("2d");if(!ctx)return;requestAnimationFrame(()=>draw(ctx,c.width,c.height))},[draw]);
 const exportBlob=async(q=quality)=>{const c=document.createElement("canvas");c.width=YOUTUBE_BANNER_GUIDELINES.recommended.width;c.height=YOUTUBE_BANNER_GUIDELINES.recommended.height;const ctx=c.getContext("2d");if(!ctx)throw new Error("canvas");draw(ctx,c.width,c.height);return await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error("encode")),format==="jpg"?"image/jpeg":"image/png",format==="jpg"?q/100:undefined))};
 const checkSize=async()=>{try{setError("");setBlob(await exportBlob())}catch{setError(t.bad)}};
 const fitUnderLimit=async()=>{if(format!=="jpg")return;try{setError("");let lo=45,hi=quality,best:Blob|null=null,bestQ=lo;for(let i=0;i<7&&lo<=hi;i++){const q=Math.floor((lo+hi)/2),candidate=await exportBlob(q);if(candidate.size<=YOUTUBE_BANNER_GUIDELINES.maxBytes){best=candidate;bestQ=q;lo=q+1}else hi=q-1}if(!best){best=await exportBlob(45);bestQ=45}setQuality(bestQ);setBlob(best)}catch{setError(t.bad)}};
 const download=async()=>{try{setError("");const b=blob??await exportBlob();setBlob(b);const url=URL.createObjectURL(b);const a=document.createElement("a");a.href=url;a.download=sanitizeDownloadName(bg?.file.name,format);a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setDownloaded(true)}catch{setError(t.bad)}};
 const reset=()=>{releaseImage(bg);releaseImage(logo);setBg(null);setLogo(null);setStarted(false);setDesign(initial);setHistory([initial]);setHIndex(0);setBlob(null);setError("");setWarning("");setDownloaded(false)};
 const undo=()=>{if(hIndex<=0)return;const i=hIndex-1;setHIndex(i);setDesign(history[i]);setBlob(null)};const redo=()=>{if(hIndex>=history.length-1)return;const i=hIndex+1;setHIndex(i);setDesign(history[i]);setBlob(null)};
 const pointerDown=(e:React.PointerEvent)=>{const rect=e.currentTarget.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;let kind:"bg"|"title"|"logo"="bg";if(logo&&Math.abs(x-design.logoX)<.12&&Math.abs(y-design.logoY)<.18){kind="logo";setSelected("logo")}else if(design.title&&Math.abs(y-design.titleY)<.14){kind="title";setSelected("title")}drag.current={kind,x,y,start:design};e.currentTarget.setPointerCapture(e.pointerId)};
 const pointerMove=(e:React.PointerEvent)=>{if(!drag.current)return;const rect=e.currentTarget.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height,dx=x-drag.current.x,dy=y-drag.current.y,s=drag.current.start;if(drag.current.kind==="bg")setD({bgX:clampNormalized(s.bgX-dx),bgY:clampNormalized(s.bgY-dy)},false);if(drag.current.kind==="title")setD({titleX:clampNormalized(s.titleX+dx),titleY:clampNormalized(s.titleY+dy)},false);if(drag.current.kind==="logo")setD({logoX:clampNormalized(s.logoX+dx),logoY:clampNormalized(s.logoY+dy)},false)};
 const pointerUp=()=>{if(!drag.current)return;drag.current=null;setD({},true)};
 const keyMove=(e:React.KeyboardEvent)=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key))return;e.preventDefault();const px=e.shiftKey?10:1,stepX=px/2560,stepY=px/1440;if(selected==="logo"&&logo){const p:{logoX?:number;logoY?:number}={};if(e.key==="ArrowLeft")p.logoX=clampNormalized(design.logoX-stepX);if(e.key==="ArrowRight")p.logoX=clampNormalized(design.logoX+stepX);if(e.key==="ArrowUp")p.logoY=clampNormalized(design.logoY-stepY);if(e.key==="ArrowDown")p.logoY=clampNormalized(design.logoY+stepY);setD(p,true);return}const p:{titleX?:number;titleY?:number}={};if(e.key==="ArrowLeft")p.titleX=clampNormalized(design.titleX-stepX);if(e.key==="ArrowRight")p.titleX=clampNormalized(design.titleX+stepX);if(e.key==="ArrowUp")p.titleY=clampNormalized(design.titleY-stepY);if(e.key==="ArrowDown")p.titleY=clampNormalized(design.titleY+stepY);setD(p,true)};
 const safeRect={x:safe.x,y:safe.y,width:safe.width,height:safe.height};const measureCtx=canvas.current?.getContext("2d")??null;const titleBounds=measureCtx?measureTool020TitleBounds(measureCtx,design,safe.width,2560,1440):null;const logoBounds=calculateTool020LogoBounds(logo,design,2560,1440);const titleInside=isTool020RectInside(titleBounds,safeRect);const logoInside=isTool020RectInside(logoBounds,safeRect);
 const moveTitleInside=()=>{if(!measureCtx||!titleBounds)return;const p=clampTool020CenterToSafe(titleBounds,design.titleX,design.titleY,safeRect,2560,1440);setD({titleX:p.x,titleY:p.y});setSelected("title")};
 const moveLogoInside=()=>{if(!logoBounds)return;const p=clampTool020CenterToSafe(logoBounds,design.logoX,design.logoY,safeRect,2560,1440);setD({logoX:p.x,logoY:p.y});setSelected("logo")};
 const workspaceTitle=locale==='ko'?'유튜브 채널 배너 제작 작업장':locale==='ja'?'YouTubeチャンネルバナー作成ワークスペース':'YouTube channel banner workspace';
 const dragCaption=locale==='ko'?'미리보기에서 배경·제목·로고를 직접 드래그해 위치를 조절할 수 있습니다.':locale==='ja'?'プレビュー上で背景・タイトル・ロゴを直接ドラッグして位置を調整できます。':'Drag the background, title, and logo directly in the preview to adjust their position.';
 const safeTitle=locale==='ko'?'제목 안전영역 안으로':locale==='ja'?'タイトルをセーフエリア内へ':'Move title into safe area';
 const safeLogo=locale==='ko'?'로고 안전영역 안으로':locale==='ja'?'ロゴをセーフエリア内へ':'Move logo into safe area';
 const outputTitle=locale==='ko'?'출력':locale==='ja'?'出力':'Output';
 const guideTitle=locale==='ko'?'가이드':locale==='ja'?'ガイド':'Guide';
 return <div className={styles.root} data-testid="tool020-root">
   <input ref={bgInput} className={styles.hiddenInput} data-testid="tool020-background-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{pick(e.target.files?.[0],"background");e.currentTarget.value=""}}/>
   <p className={styles.muted}>{t.local}</p>

   {!(started||bg)&&<section className={`toolbox-workbench ${styles.card}`}>
     <div data-testid="tool020-drop" className={`toolbox-workbench-upload ${styles.preUpload}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();pick(e.dataTransfer.files?.[0],"background")}}>
       <div className="toolbox-workbench-topline"><div><span>WORKSPACE</span><strong>{workspaceTitle}</strong></div></div>
       <div className="toolbox-upload-focus">
         <span className="toolbox-upload-icon" aria-hidden="true">＋</span>
         <h2>{t.choose}</h2>
         <p>{t.local}</p>
         <button type="button" onClick={()=>bgInput.current?.click()}>{t.choose}</button>
         <small>2560×1440 · 16:9 · JPG · PNG · WebP</small>
       </div>
       {error&&<div className="toolbox-workbench-notice"><strong>{locale==='ko'?'안내':locale==='ja'?'案内':'Notice'}</strong><span className={styles.error} role="alert">{error}</span></div>}
     </div>
     <div className={styles.actions}><button className={styles.button} onClick={()=>setStarted(true)} data-testid="tool020-start-blank">{t.blank}</button></div>
   </section>}

   {(started||bg)&&<>
     <section className={`toolbox-workbench ${styles.card}`} onDragOver={e=>{if(e.dataTransfer.types.includes('Files'))e.preventDefault()}} onDrop={e=>{if(e.dataTransfer.files.length){e.preventDefault();pick(e.dataTransfer.files[0],"background")}}}>
       <div className={styles.toolbar}>
         <strong>{workspaceTitle}</strong>
         <div className={styles.toolbarActions}>
           <button className={styles.button} onClick={undo} disabled={hIndex<=0}>{locale==='ko'?'실행 취소':locale==='ja'?'元に戻す':'Undo'}</button>
           <button className={styles.button} onClick={redo} disabled={hIndex>=history.length-1}>{locale==='ko'?'다시 실행':locale==='ja'?'やり直す':'Redo'}</button>
         </div>
       </div>

       <div className={styles.workspace}>
         <section className={styles.previewSection}>
           <div className={styles.previewToolbar} role="tablist">{([['tv',t.tv],['desktop',t.desktop],['mobile',t.mobile],['safe',t.safe]] as const).map(([id,label])=><button key={id} role="tab" aria-selected={mode===id} className={mode===id?styles.active:""} onClick={()=>setMode(id)} data-testid={`tool020-preview-${id}`}>{label}</button>)}</div>
           <div className={styles.canvasWrap} tabIndex={0} aria-label="YouTube banner preview" onKeyDown={keyMove} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>
             <canvas ref={canvas} className={styles.canvas} width="1280" height="720" data-testid="tool020-preview-canvas"/>
             {design.guide&&mode!=="tv"&&<div className={styles.mask} aria-hidden="true"><div className={styles.visibleWindow} style={{width:`${preview.widthRatio*100}%`,height:`${preview.heightRatio*100}%`}}/></div>}
             {design.guide&&<div className={styles.safeLine} style={{width:`${safe.width/2560*100}%`,height:`${safe.height/1440*100}%`}} aria-hidden="true"/>}
             <span className={styles.guideLabel}>{TOOL020_DEVICE_PREVIEWS[mode].label}</span>
           </div>
           <div className={styles.statusCard}><strong>{titleInside&&logoInside?t.inside:t.outside}</strong>{warning&&<p className={styles.warning} role="status" aria-live="polite">{warning}</p>}{error&&<p className={styles.error} role="alert" aria-live="assertive" data-testid="tool020-error">{error}</p>}</div>
           <p className={styles.caption}>{dragCaption}</p>
         </section>

         <div className={styles.controlColumns}>
           <div className={styles.controlStack}>
             <section className={styles.section}>
               <h3>{t.background}</h3>
               <button className={styles.uploadButton} type="button" onClick={()=>bgInput.current?.click()}>{bg?t.replace:t.choose}</button>
               <label className={styles.label}>{t.position} X<input type="range" min="0" max="100" value={design.bgX*100} onChange={e=>setD({bgX:+e.target.value/100})}/></label>
               <label className={styles.label}>{t.position} Y<input type="range" min="0" max="100" value={design.bgY*100} onChange={e=>setD({bgY:+e.target.value/100})}/></label>
               <label className={styles.label}>{t.zoom}<input data-testid="tool020-bg-zoom" type="range" min="100" max="300" value={design.bgZoom*100} onChange={e=>setD({bgZoom:+e.target.value/100})}/></label>
               <label className={styles.label}>{t.dark}<input type="range" min="0" max="80" value={design.bgDark*100} onChange={e=>setD({bgDark:+e.target.value/100})}/></label>
               <label className={styles.label}>{locale==='ko'?'배경색':locale==='ja'?'背景色':'Background Color'}<input type="color" value={design.bgColor} onChange={e=>setD({bgColor:e.target.value})}/></label>
             </section>
           </div>

           <div className={styles.controlStack}>
             <section className={styles.section}>
               <h3>{t.title}</h3>
               <label className={styles.label}>{t.title}<textarea data-testid="tool020-title" onFocus={()=>setSelected("title")} maxLength={TOOL020_SERVICE_LIMITS.maxTitleChars} value={design.title} onChange={e=>setD({title:e.target.value})}/></label>
               <label className={styles.label}>{t.font}<select value={design.font} onChange={e=>setD({font:e.target.value})}><option value="system-ui, -apple-system, 'Noto Sans KR', 'Noto Sans JP', sans-serif">Sans / Gothic</option><option value="Georgia, 'Times New Roman', serif">Serif</option><option value="ui-monospace, SFMono-Regular, Menlo, monospace">Monospace</option></select></label>
               <label className={styles.label}>{t.size}<input type="range" min="36" max="260" value={design.fontSize} onChange={e=>setD({fontSize:+e.target.value})}/></label>
               <label className={styles.label}>{t.color}<input type="color" value={design.color} onChange={e=>setD({color:e.target.value})}/></label>
               <div className={styles.row}><label className={styles.label}>X<input type="range" min="0" max="100" value={design.titleX*100} onChange={e=>setD({titleX:+e.target.value/100})}/></label><label className={styles.label}>Y<input type="range" min="0" max="100" value={design.titleY*100} onChange={e=>setD({titleY:+e.target.value/100})}/></label></div>
               <div className={styles.seg}>{([['left',t.left],['center',t.center],['right',t.right]] as const).map(([id,label])=><button key={id} className={design.align===id?styles.active:""} onClick={()=>setD({align:id})}>{label}</button>)}</div>
               {design.title&&<button className={styles.button} type="button" onClick={moveTitleInside}>{safeTitle}</button>}
               <label className={styles.check}><input type="checkbox" checked={design.outline} onChange={e=>setD({outline:e.target.checked})}/>{t.outline}</label>
               {design.outline&&<div className={styles.row}><label className={styles.label}>{locale==='ko'?'두께':locale==='ja'?'太さ':'Width'}<input type="number" min="1" max="20" value={design.outlineWidth} onChange={e=>setD({outlineWidth:+e.target.value||1})}/></label><label className={styles.label}>{locale==='ko'?'색상':locale==='ja'?'色':'Color'}<input type="color" value={design.outlineColor} onChange={e=>setD({outlineColor:e.target.value})}/></label></div>}
               <label className={styles.check}><input type="checkbox" checked={design.shadow} onChange={e=>setD({shadow:e.target.checked})}/>{t.shadow}</label>
             </section>
           </div>

           <div className={styles.controlStack}>
             <section className={styles.section}>
               <h3>{t.logo}</h3>
               <label className={styles.uploadButton}>{t.addLogo}<input className={styles.hiddenInput} data-testid="tool020-logo-input" type="file" onClick={()=>setSelected("logo")} accept="image/jpeg,image/png,image/webp" onChange={e=>pick(e.target.files?.[0],"logo")}/></label>
               {logo&&<><div className={styles.row}><label className={styles.label}>X<input type="range" min="0" max="100" value={design.logoX*100} onChange={e=>setD({logoX:+e.target.value/100})}/></label><label className={styles.label}>Y<input type="range" min="0" max="100" value={design.logoY*100} onChange={e=>setD({logoY:+e.target.value/100})}/></label></div><label className={styles.label}>{t.logoSize}<input type="range" min="5" max="50" value={design.logoScale*100} onChange={e=>setD({logoScale:+e.target.value/100})}/></label><label className={styles.label}>{t.opacity}<input type="range" min="10" max="100" value={design.logoOpacity*100} onFocus={()=>setSelected("logo")} onChange={e=>setD({logoOpacity:+e.target.value/100})}/></label><div className={styles.inlineActions}><button className={styles.button} type="button" onClick={moveLogoInside}>{safeLogo}</button><button className={styles.button} onClick={()=>{releaseImage(logo);setLogo(null)}}>{t.removeLogo}</button></div></>}
             </section>
             <section className={styles.section}>
               <h3>{guideTitle}</h3>
               <label className={styles.check}><input type="checkbox" checked={design.guide} onChange={e=>setD({guide:e.target.checked})}/>{t.guide}</label>
               <p className={styles.caption}>{locale==='ko'?'TV·PC·모바일 미리보기와 중앙 안전영역을 함께 확인해 중요한 제목과 로고가 잘리지 않도록 조정하세요.':locale==='ja'?'TV・PC・モバイルプレビューと中央セーフエリアを確認し、重要なタイトルやロゴが切れないように調整してください。':'Use TV, desktop, mobile, and safe-area previews to keep important title and logo content visible.'}</p>
             </section>
             <section className={styles.section}>
               <h3>{outputTitle}</h3>
               <label className={styles.label}>{t.format}<select value={format} onChange={e=>{setFormat(e.target.value as Format);setBlob(null)}}><option value="jpg">JPG</option><option value="png">PNG</option></select></label>
               <label className={styles.label}>{t.quality}<input type="range" min="45" max="100" disabled={format==="png"} value={quality} onChange={e=>{setQuality(+e.target.value);setBlob(null)}}/></label>
               <div className={styles.inlineActions}><button className={styles.button} data-testid="tool020-check-size" onClick={checkSize}>{t.fileSize}</button>{format==="jpg"&&<button className={styles.button} data-testid="tool020-fit-limit" onClick={fitUnderLimit}>≤ 6 MB</button>}</div>
             </section>
           </div>
         </div>
       </div>
     </section>

     <section className={`${styles.card} toolbox-workbench-result-card`} data-testid="tool020-output">
       <div className={styles.info}>
         <div><span>Result</span><strong>2560 × 1440</strong></div>
         <div><span>{locale==='ko'?'비율':locale==='ja'?'比率':'Ratio'}</span><strong>16:9</strong></div>
         <div><span>{t.format}</span><strong>{format.toUpperCase()}</strong></div>
         {format==='jpg'&&<div><span>{t.quality}</span><strong>{quality}</strong></div>}
         <div><span>{t.fileSize}</span><strong data-testid="tool020-file-size">{blob?formatBytes(blob.size):"—"}</strong></div>
         <div><span>Limit</span><strong>{blob&&blob.size>YOUTUBE_BANNER_GUIDELINES.maxBytes?t.limit:'≤ 6 MB'}</strong></div>
       </div>
       <p className={styles.caption}>{locale==='ko'?'가이드와 미리보기 마스크는 편집용이며 최종 다운로드 파일에는 포함되지 않습니다.':locale==='ja'?'ガイドとプレビューマスクは編集用で、最終ダウンロード画像には含まれません。':'Guides and preview masks are editing aids and are not included in the downloaded image.'}</p>
       <div className={styles.actions}>
         <button className={`${styles.primary} toolbox-primary-action`} data-testid="tool020-download" onClick={download}>{downloaded?t.again:t.download}</button>
         <button className={styles.button} onClick={()=>{releaseImage(bg);setBg(null);setStarted(false);setBlob(null);setWarning("")}}>{t.newImage}</button>
         <button className={styles.button} onClick={reset}>{t.reset}</button>
       </div>
     </section>
   </>}
 </div>
}
