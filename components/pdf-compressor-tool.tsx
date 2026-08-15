"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { PDFDocument } from "pdf-lib";
import type { Locale } from "@/lib/site";
import { TOOL033_ACCEPT, TOOL033_CUSTOM_QUALITY, TOOL033_DEFAULT_PRESET, TOOL033_PRESET_QUALITY, TOOL033_SERVICE_LIMITS, type Tool033Preset, formatTool033Bytes, hasTool033PdfSignature, tool033OutputName, tool033Reduction, tool033RenderScale } from "@/lib/tool-033-pdf-compressor";
import styles from "./pdf-compressor-tool.module.css";

type Loaded = { file: File; pages: number };
type Result = { blob: Blob; url: string; name: string; pages: number; bytes: number };
const copy = {
ko:{local:"브라우저 로컬 처리 · 서버 업로드 없음",drop:"PDF 파일을 놓거나 선택하세요",lead:"PDF 한 개를 선택하면 압축 설정과 미리보기가 열립니다.",choose:"PDF 선택",replace:"새 PDF 선택",mode:"압축 품질",high:"최고화질",highHelp:"원본에 가장 가까운 화질을 우선합니다.",balanced:"균형",balancedHelp:"화질과 용량 감소의 균형을 맞춘 추천 설정입니다.",size:"용량 우선",sizeHelp:"화질을 조금 낮춰 파일 크기를 더 줄입니다.",custom:"사용자 지정",customHelp:"이미지 품질을 직접 조절합니다.",quality:"이미지 품질",compress:"PDF 압축",working:"압축 중",reset:"초기화",original:"원본 용량",result:"압축 후 용량",saved:"절감량",rate:"절감률",larger:"결과가 원본보다 큽니다",noSave:"이 파일에서는 현재 품질 설정으로 용량이 줄지 않았습니다. 더 작은 파일이 필요하면 품질을 낮춰 다시 압축하세요.",preview:"미리보기",source:"원본",output:"결과",page:"페이지",download:"다운로드",again:"설정 변경 후 재압축",invalid:"유효한 PDF가 아닙니다.",large:"PDF는 50MB 이하만 지원합니다.",many:"PDF는 최대 200페이지까지 지원합니다.",encrypted:"암호화되었거나 읽을 수 없는 PDF입니다.",failed:"PDF 압축에 실패했습니다. 원본과 설정은 유지됩니다.",warning:"압축 과정에서 페이지가 이미지로 재구성되어 텍스트 검색·링크·폼·벡터 정보가 사라질 수 있습니다. 결과 미리보기를 확인한 뒤 다운로드하세요.",ready:(n:number)=>`${n}페이지 PDF를 불러왔습니다.`,progress:(n:number,t:number)=>`${n}/${t} 페이지 처리 중`},
en:{local:"Browser-local processing · no server upload",drop:"Drop or choose a PDF",lead:"Choose one PDF to open compression settings and preview.",choose:"Choose PDF",replace:"Choose another PDF",mode:"Compression quality",high:"Highest quality",highHelp:"Prioritizes output closest to the original.",balanced:"Balanced",balancedHelp:"Recommended balance between quality and file-size reduction.",size:"Smaller file",sizeHelp:"Reduces quality slightly to shrink the file further.",custom:"Custom",customHelp:"Adjust image quality manually.",quality:"Image quality",compress:"Compress PDF",working:"Compressing",reset:"Reset",original:"Original size",result:"Compressed size",saved:"Saved",rate:"Size reduction",larger:"The result is larger than the original",noSave:"This quality setting did not reduce the file size. Lower the quality and compress again if you need a smaller file.",preview:"Preview",source:"Original",output:"Result",page:"Page",download:"Download",again:"Change settings and compress again",invalid:"This is not a valid PDF.",large:"PDF files must be 50MB or smaller.",many:"Up to 200 pages are supported.",encrypted:"This PDF is encrypted or cannot be read.",failed:"PDF compression failed. Your source and settings were kept.",warning:"Compression rebuilds pages as images, so searchable text, links, forms and vectors may be lost. Check the result preview before downloading.",ready:(n:number)=>`Loaded a ${n}-page PDF.`,progress:(n:number,t:number)=>`Processing page ${n}/${t}`},
ja:{local:"ブラウザ内処理 · サーバーアップロードなし",drop:"PDFをドロップまたは選択",lead:"PDFを1つ選択すると圧縮設定とプレビューが表示されます。",choose:"PDFを選択",replace:"新しいPDFを選択",mode:"圧縮品質",high:"最高画質",highHelp:"元PDFに最も近い画質を優先します。",balanced:"バランス",balancedHelp:"画質とファイルサイズ削減のバランスを取る推奨設定です。",size:"容量優先",sizeHelp:"画質を少し下げてファイルサイズをさらに削減します。",custom:"カスタム",customHelp:"画像品質を直接調整します。",quality:"画像品質",compress:"PDFを圧縮",working:"圧縮中",reset:"リセット",original:"元のサイズ",result:"圧縮後のサイズ",saved:"削減量",rate:"削減率",larger:"結果が元のファイルより大きくなりました",noSave:"現在の品質設定では容量が小さくなりませんでした。さらに小さくする場合は品質を下げて再圧縮してください。",preview:"プレビュー",source:"元PDF",output:"結果",page:"ページ",download:"ダウンロード",again:"設定を変更して再圧縮",invalid:"有効なPDFではありません。",large:"PDFは50MB以下に対応しています。",many:"最大200ページまで対応しています。",encrypted:"暗号化されているか読み取れないPDFです。",failed:"PDF圧縮に失敗しました。元PDFと設定は保持されています。",warning:"圧縮ではページを画像として再構成するため、検索可能な文字、リンク、フォーム、ベクター情報が失われる場合があります。結果プレビューを確認してからダウンロードしてください。",ready:(n:number)=>`${n}ページのPDFを読み込みました。`,progress:(n:number,t:number)=>`${n}/${t}ページを処理中`}
} as const;

async function pdfjs(){ return await import("pdfjs-dist/webpack.mjs"); }
async function pageCount(blob: Blob){ const p=await pdfjs(); const task=p.getDocument({data:new Uint8Array(await blob.arrayBuffer())}); const doc=await task.promise; try{return doc.numPages;} finally{await doc.destroy();} }
async function render(blob: Blob, pageNo:number, canvas:HTMLCanvasElement){ const p=await pdfjs(); const task=p.getDocument({data:new Uint8Array(await blob.arrayBuffer())}); const doc=await task.promise; try{ const pg=await doc.getPage(Math.min(pageNo,doc.numPages)); const base=pg.getViewport({scale:1}); const max=Math.min(900, Math.max(300, window.innerWidth-80)); const vp=pg.getViewport({scale:Math.min(1.6,max/Math.max(1,base.width))}); canvas.width=Math.ceil(vp.width); canvas.height=Math.ceil(vp.height); const ctx=canvas.getContext("2d",{alpha:false}); if(!ctx) throw new Error("CANVAS"); await pg.render({canvas,canvasContext:ctx,viewport:vp}).promise; } finally{await doc.destroy();} }
async function canvasJpeg(canvas:HTMLCanvasElement, quality:number){ return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(new Error("JPEG")),"image/jpeg",quality)); }

export function PdfCompressorTool({locale}:{locale:Locale}){
 const t=copy[locale]; const input=useRef<HTMLInputElement>(null); const canvas=useRef<HTMLCanvasElement>(null);
 const [loaded,setLoaded]=useState<Loaded|null>(null); const [preset,setPreset]=useState<Tool033Preset>(TOOL033_DEFAULT_PRESET); const [quality,setQuality]=useState<number>(TOOL033_PRESET_QUALITY.balanced); const [busy,setBusy]=useState(false); const [status,setStatus]=useState(""); const [error,setError]=useState(""); const [progress,setProgress]=useState(0); const [result,setResult]=useState<Result|null>(null); const [previewKind,setPreviewKind]=useState<"source"|"result">("source"); const [previewPage,setPreviewPage]=useState(1); const [drag,setDrag]=useState(false);
 const clearResult=useCallback(()=>{setResult(r=>{if(r)URL.revokeObjectURL(r.url);return null});setProgress(0);},[]);
 useEffect(()=>()=>{ if(result) URL.revokeObjectURL(result.url); },[result]);
 useEffect(()=>{ const target=previewKind==="result"&&result?result.blob:loaded?.file; if(!target||!canvas.current)return; void render(target,previewPage,canvas.current).catch(()=>{}); },[loaded,result,previewKind,previewPage]);
 const loadFile=useCallback(async(file?:File)=>{if(!file||busy)return; clearResult();setError("");setStatus(""); if(file.size>TOOL033_SERVICE_LIMITS.maxFileBytes){setError(t.large);return;} if(!(await hasTool033PdfSignature(file))){setError(t.invalid);return;} try{const pages=await pageCount(file); if(pages<1)throw new Error("EMPTY"); if(pages>TOOL033_SERVICE_LIMITS.maxPages){setError(t.many);return;} setLoaded({file,pages});setPreviewPage(1);setPreviewKind("source");setStatus(t.ready(pages));}catch{setError(t.encrypted);} finally{if(input.current)input.current.value="";}},[busy,clearResult,t]);
 function drop(e:DragEvent<HTMLDivElement>){e.preventDefault();setDrag(false);void loadFile(e.dataTransfer.files?.[0]);}
 const compress=useCallback(async()=>{ if(!loaded||busy)return; clearResult();setBusy(true);setError("");setProgress(1); try{
 const p=await pdfjs();
 const task=p.getDocument({data:new Uint8Array(await loaded.file.arrayBuffer())});
 const doc=await task.promise;
 const out=await PDFDocument.create();
 let bytes: Uint8Array<ArrayBufferLike>;
 try{
  const renderScale=tool033RenderScale(preset,quality);
  for(let i=1;i<=doc.numPages;i++){
   setStatus(t.progress(i,doc.numPages));
   const pg=await doc.getPage(i);
   const base=pg.getViewport({scale:1});
   const vp=pg.getViewport({scale:renderScale});
   const c=document.createElement("canvas");
   c.width=Math.max(1,Math.ceil(vp.width));c.height=Math.max(1,Math.ceil(vp.height));
   const ctx=c.getContext("2d",{alpha:false});if(!ctx)throw new Error("CANVAS");
   ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);
   await pg.render({canvas:c,canvasContext:ctx,viewport:vp,background:"#ffffff"}).promise;
   const jpg=await canvasJpeg(c,Math.max(.55,Math.min(.98,quality/100)));
   const img=await out.embedJpg(await jpg.arrayBuffer());
   const op=out.addPage([base.width,base.height]);op.drawImage(img,{x:0,y:0,width:base.width,height:base.height});
   c.width=1;c.height=1;setProgress(Math.round(i/doc.numPages*88));
  }
  bytes=await out.save({useObjectStreams:true,addDefaultPage:false});
 } finally{await doc.destroy();}
 const blobBytes=new Uint8Array(bytes.byteLength); blobBytes.set(bytes); const blob=new Blob([blobBytes.buffer],{type:"application/pdf"}); const pages=await pageCount(blob); if(pages!==loaded.pages)throw new Error("PAGE_COUNT_MISMATCH"); const url=URL.createObjectURL(blob); const r={blob,url,name:tool033OutputName(loaded.file.name),pages,bytes:blob.size};setResult(r);setPreviewKind("result");setStatus("");setProgress(100);
 }catch{setError(t.failed);setStatus("");}finally{setBusy(false);} },[busy,clearResult,loaded,preset,quality,t]);
 const reset=()=>{if(busy)return;clearResult();setLoaded(null);setError("");setStatus("");setPreset(TOOL033_DEFAULT_PRESET);setQuality(TOOL033_PRESET_QUALITY.balanced);setPreviewPage(1);setPreviewKind("source");};
 const reduction=result&&loaded?tool033Reduction(loaded.file.size,result.bytes):null; const maxPage=result?.pages??loaded?.pages??1;
 return <div className={styles.wrapper} data-testid="tool033-root" data-max-file-bytes={TOOL033_SERVICE_LIMITS.maxFileBytes} data-max-pages={TOOL033_SERVICE_LIMITS.maxPages}>
  <div className={styles.local}><strong>LOCAL</strong><span>{t.local}</span></div>
  <input ref={input} className={styles.hidden} type="file" accept={TOOL033_ACCEPT} aria-label={t.choose} data-testid="tool033-file-input" onChange={e=>void loadFile(e.currentTarget.files?.[0])}/>
  {!loaded ? <section className={`${styles.dropzone} ${drag?styles.dragging:""}`} data-testid="tool033-dropzone" data-drag-active={drag?"true":"false"}
    onClick={()=>{if(!busy)input.current?.click()}} onDragEnter={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!busy)setDrag(true)}}} onDragOver={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!busy)setDrag(true)}}} onDragLeave={e=>{const next=e.relatedTarget as Node|null;if(!next||!e.currentTarget.contains(next))setDrag(false)}} onDrop={drop}>
    <h2>{t.drop}</h2><p>{t.lead}</p><button className={styles.uploadAction} type="button" disabled={busy} onClick={e=>{e.stopPropagation();input.current?.click()}}>{t.choose}</button>
  </section> : <div className={`${styles.uploadedFileBar} ${drag?styles.dragging:""}`} data-testid="tool033-file-info" data-drag-active={drag?"true":"false"}
    onDragEnter={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!busy)setDrag(true)}}} onDragOver={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!busy)setDrag(true)}}} onDragLeave={e=>{const next=e.relatedTarget as Node|null;if(!next||!e.currentTarget.contains(next))setDrag(false)}} onDrop={drop}>
    <div className={styles.uploadedFileInfo}><strong title={loaded.file.name}>{loaded.file.name}</strong><span>{formatTool033Bytes(loaded.file.size)} · {loaded.pages} {t.page}</span></div>
    <button className={styles.uploadAction} type="button" disabled={busy} onClick={()=>input.current?.click()}>{t.replace}</button>
  </div>}
  {error&&<div className={styles.error} role="alert" data-testid="tool033-error">{error}</div>}{status&&<p className={styles.status} role="status" aria-live="polite">{status}</p>}
  {loaded&&<div className={`${styles.workspace} ${drag?styles.workspaceDragging:""}`} data-testid="tool033-workspace" data-drag-active={drag?"true":"false"}
    onDragEnter={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!busy)setDrag(true)}}} onDragOver={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!busy)setDrag(true)}}} onDragLeave={e=>{const next=e.relatedTarget as Node|null;if(!next||!e.currentTarget.contains(next))setDrag(false)}} onDrop={drop}>
   <section className={styles.panel} data-testid="tool033-preview-panel"><div className={styles.panelHead}><div><p>PREVIEW</p><h2>{t.preview}</h2></div><div className={styles.previewTabs}><button type="button" className={previewKind==="source"?styles.activeTab:""} onClick={()=>setPreviewKind("source")}>{t.source}</button><button type="button" disabled={!result} className={previewKind==="result"?styles.activeTab:""} onClick={()=>setPreviewKind("result")}>{t.output}</button></div></div><div className={styles.canvasWrap}><canvas ref={canvas} data-testid="tool033-preview-canvas"/></div><div className={styles.pager}><button type="button" disabled={previewPage<=1} onClick={()=>setPreviewPage(p=>Math.max(1,p-1))}>‹</button><span>{t.page} {previewPage} / {maxPage}</span><button type="button" disabled={previewPage>=maxPage} onClick={()=>setPreviewPage(p=>Math.min(maxPage,p+1))}>›</button></div></section>
   <section className={styles.panel} data-testid="tool033-settings-panel"><div className={styles.panelHead}><div><p>033 · PDF</p><h2>{t.mode}</h2></div></div><div className={styles.settings}><div className={styles.modeGrid} data-testid="tool033-presets">
    <button type="button" data-testid="tool033-preset-high" className={preset==="high"?styles.selected:""} onClick={()=>{setPreset("high");setQuality(TOOL033_PRESET_QUALITY.high);clearResult()}} aria-pressed={preset==="high"}><strong>{t.high}<em>97%</em></strong><span>{t.highHelp}</span></button>
    <button type="button" data-testid="tool033-preset-balanced" className={preset==="balanced"?styles.selected:""} onClick={()=>{setPreset("balanced");setQuality(TOOL033_PRESET_QUALITY.balanced);clearResult()}} aria-pressed={preset==="balanced"}><strong>{t.balanced}<em>92%</em></strong><span>{t.balancedHelp}</span></button>
    <button type="button" data-testid="tool033-preset-size" className={preset==="size"?styles.selected:""} onClick={()=>{setPreset("size");setQuality(TOOL033_PRESET_QUALITY.size);clearResult()}} aria-pressed={preset==="size"}><strong>{t.size}<em>82%</em></strong><span>{t.sizeHelp}</span></button>
    <button type="button" data-testid="tool033-preset-custom" className={preset==="custom"?styles.selected:""} onClick={()=>{setPreset("custom");clearResult()}} aria-pressed={preset==="custom"}><strong>{t.custom}<em>{quality}%</em></strong><span>{t.customHelp}</span></button>
   </div><p className={styles.warning}>{t.warning}</p>
   <label className={styles.quality}><span>{t.quality}<strong>{quality}%</strong></span><input type="range" min={TOOL033_CUSTOM_QUALITY.min} max={TOOL033_CUSTOM_QUALITY.max} step="1" value={quality} disabled={preset!=="custom"||busy} aria-valuemin={TOOL033_CUSTOM_QUALITY.min} aria-valuemax={TOOL033_CUSTOM_QUALITY.max} aria-valuenow={quality} onChange={e=>{setQuality(Number(e.target.value));clearResult()}} data-testid="tool033-quality"/></label>
   <div className={styles.actions}><button className={styles.ghost} type="button" disabled={busy} onClick={reset}>{t.reset}</button><button className={styles.primary} type="button" disabled={busy} onClick={()=>void compress()} data-testid="tool033-compress-button">{busy?t.working:t.compress}</button></div>{busy&&<div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:`${progress}%`}}/></div>}</div></section>
   {result&&reduction&&<section className={`${styles.result} ${styles.fullWidth}`} data-testid="tool033-result"><div className={styles.metrics}><div><span>{t.original}</span><strong>{formatTool033Bytes(loaded.file.size)}</strong></div><div><span>{t.result}</span><strong>{formatTool033Bytes(result.bytes)}</strong></div><div><span>{t.saved}</span><strong>{reduction.saved>0?formatTool033Bytes(reduction.saved):"—"}</strong></div><div><span>{t.rate}</span><strong>{reduction.percent.toFixed(1)}%</strong></div></div><p className={reduction.increased?styles.warning:styles.resultNote}>{reduction.increased?t.larger:reduction.percent===0?t.noSave:`${reduction.percent.toFixed(1)}%`}</p><div className={styles.resultActions}><button type="button" className={styles.ghost} onClick={()=>{clearResult();setPreviewKind("source")}}>{t.again}</button><a href={result.url} download={result.name} className={styles.download} data-testid="tool033-download">{t.download}</a></div></section>}
  </div>}
 </div>;
}
