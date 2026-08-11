import { materializeImageBlob } from "@/lib/mobile-file-materializer";
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/site";
import { createStoredZip } from "@/lib/zip";

type OutputFormat = "image/jpeg" | "image/png" | "image/avif";
type Status = "idle" | "processing" | "done" | "error" | "cancelled";
type QualityMode = "auto" | "high" | "balanced" | "space" | "custom";
type InputKind = "heic" | "avif" | "jpeg" | "png";
type FileItem = { id:string; file:File; inputKind:InputKind; previewUrl?:string; outputFormat:OutputFormat; status:Status; originalSize:number; width?:number; height?:number; resultBlob?:Blob; resultUrl?:string; outputSize?:number; outputName?:string; error?:string; warning?:string; isNew?:boolean };

const MAX_FILES=10, MAX_FILE_BYTES=10*1024*1024, MAX_TOTAL_BYTES=50*1024*1024, MAX_PIXELS=40_000_000;
// 002 운영 안전선: 10개, 파일당 10MB, 전체 50MB, 이미지당 40MP. JPG/PNG→AVIF 한계·경계검수 통과값.
const copy={
ko:{select:"이미지 선택",add:"이미지 추가",drop:"이미지를 여기에 놓거나 선택하세요.",supported:"지원 형식: HEIC, HEIF, AVIF, JPG, PNG",local:"이미지 파일은 서버로 업로드되지 않고 브라우저에서 처리됩니다. 변환 기능 코드는 외부 CDN에서 불러올 수 있습니다.",output:"출력 설정",outputHelp:"입력 형식에 맞는 출력 형식만 선택할 수 있습니다.",allOutput:"전체 출력 형식",quality:"품질",auto:"자동 추천",high:"고화질",balanced:"균형",space:"용량 절약",custom:"직접 설정",advanced:"고급 설정",metadata:"개인정보 보호를 위해 메타데이터는 제거됩니다. 촬영 방향은 결과 픽셀에 반영합니다.",jpgBg:"JPG 배경색",white:"흰색",black:"검은색",pick:"사용자 지정",convert:"변환하기",convertNew:"추가한 이미지만 변환",reconvert:"전체 다시 변환",converting:"변환 중...",cancel:"취소",zip:"전체 ZIP 다운로드",zipping:"ZIP 생성 중...",retryZip:"ZIP 다시 만들기",reset:"전체 초기화",remove:"삭제",download:"다운로드",notice:"안내",empty:"파일을 추가하면 입력 형식에 맞는 출력 옵션이 표시됩니다.",avifSlow:"AVIF 변환에는 시간이 조금 더 걸릴 수 있습니다.",unsupported:"지원하지 않거나 손상된 파일입니다.",signature:"확장자와 실제 파일 형식이 일치하지 않습니다.",limit:`최대 ${MAX_FILES}개, 파일당 10MB, 전체 50MB까지 처리할 수 있습니다.`,processing:(n:number,total:number)=>`${n} / ${total}개 처리 중`,done:(ok:number,fail:number,cancelled:number)=>`${ok}개 완료 · ${fail}개 실패${cancelled?` · ${cancelled}개 취소`:""}`,pngLossless:"PNG는 무손실로 처리됩니다.",files:"파일",completed:"완료",failed:"실패",cancelled:"취소됨",idle:"대기",processingLabel:"처리 중",larger:"원본보다 용량 증가",similar:"원본과 비슷함",smaller:"용량 감소",colorWarn:"색상 차이 확인 권장",zipFail:"ZIP 생성에 실패했습니다. 개별 다운로드는 계속 사용할 수 있습니다.",cdnFail:"변환 기능 코드를 불러오지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도하세요.",added:(n:number)=>`${n}개 이미지를 추가했습니다.`,skipped:(n:number)=>`${n}개 파일을 제외했습니다.`},
en:{select:"Choose Images",add:"Add Images",drop:"Drop images here or choose files.",supported:"Supported: HEIC, HEIF, AVIF, JPG, PNG",local:"Image files are not uploaded. They are processed in your browser, while conversion code may be loaded from an external CDN.",output:"Output Settings",outputHelp:"Only valid output formats are available for each input type.",allOutput:"Apply output to all",quality:"Quality",auto:"Auto recommended",high:"High quality",balanced:"Balanced",space:"Smaller file",custom:"Custom",advanced:"Advanced Settings",metadata:"Metadata is removed for privacy. Photo orientation is applied to the output pixels.",jpgBg:"JPG Background",white:"White",black:"Black",pick:"Custom color",convert:"Convert Images",convertNew:"Convert Added Images",reconvert:"Reconvert All",converting:"Converting...",cancel:"Cancel",zip:"Download All as ZIP",zipping:"Creating ZIP...",retryZip:"Create ZIP Again",reset:"Reset All",remove:"Remove",download:"Download",notice:"Notice",empty:"Add files to see valid output formats.",avifSlow:"AVIF conversion may take longer.",unsupported:"This file is unsupported or damaged.",signature:"The file extension does not match its actual format.",limit:`Up to ${MAX_FILES} files, 10 MB per file, and 50 MB total.`,processing:(n:number,total:number)=>`Processing ${n} of ${total}`,done:(ok:number,fail:number,cancelled:number)=>`${ok} done · ${fail} failed${cancelled?` · ${cancelled} cancelled`:""}`,pngLossless:"PNG is exported losslessly.",files:"Files",completed:"Done",failed:"Failed",cancelled:"Cancelled",idle:"Ready",processingLabel:"Processing",larger:"Larger than original",similar:"Similar to original",smaller:"File size reduced",colorWarn:"Check color differences",zipFail:"ZIP creation failed. Individual downloads remain available.",cdnFail:"Conversion code could not be loaded. Check your connection and try again.",added:(n:number)=>`${n} image(s) added.`,skipped:(n:number)=>`${n} file(s) skipped.`},
ja:{select:"画像を選択",add:"画像を追加",drop:"画像をここにドロップするか、ファイルを選択してください。",supported:"対応形式: HEIC、HEIF、AVIF、JPG、PNG",local:"画像ファイルはアップロードされず、ブラウザ内で処理されます。変換コードは外部CDNから読み込む場合があります。",output:"出力設定",outputHelp:"入力形式ごとに利用できる出力形式だけを表示します。",allOutput:"出力形式を一括適用",quality:"画質",auto:"自動おすすめ",high:"高画質",balanced:"バランス",space:"容量優先",custom:"手動設定",advanced:"詳細設定",metadata:"プライバシー保護のためメタデータは削除されます。撮影方向は出力画像に反映します。",jpgBg:"JPGの背景色",white:"白",black:"黒",pick:"色を指定",convert:"画像を変換",convertNew:"追加画像のみ変換",reconvert:"すべて再変換",converting:"変換中...",cancel:"キャンセル",zip:"すべてZIPでダウンロード",zipping:"ZIPを作成中...",retryZip:"ZIPを再作成",reset:"すべてリセット",remove:"削除",download:"ダウンロード",notice:"案内",empty:"ファイルを追加すると利用可能な出力形式が表示されます。",avifSlow:"AVIFへの変換には時間がかかる場合があります。",unsupported:"対応していないか、破損しているファイルです。",signature:"拡張子と実際のファイル形式が一致しません。",limit:`最大${MAX_FILES}件、1ファイル10MB、合計50MBまで処理できます。`,processing:(n:number,total:number)=>`${n} / ${total}件を処理中`,done:(ok:number,fail:number,cancelled:number)=>`${ok}件完了・${fail}件失敗${cancelled?`・${cancelled}件キャンセル`:""}`,pngLossless:"PNGは無損失で出力されます。",files:"ファイル",completed:"完了",failed:"失敗",cancelled:"キャンセル",idle:"待機",processingLabel:"処理中",larger:"元画像より容量増加",similar:"元画像とほぼ同じ",smaller:"容量削減",colorWarn:"色の違いを確認",zipFail:"ZIPの作成に失敗しました。個別ダウンロードは利用できます。",cdnFail:"変換コードを読み込めませんでした。接続を確認して再試行してください。",added:(n:number)=>`${n}件の画像を追加しました。`,skipped:(n:number)=>`${n}件のファイルを除外しました。`}
} as const;

function ext(format:OutputFormat){return format==="image/jpeg"?"jpg":format==="image/png"?"png":"avif"}
function baseName(name:string){return name.replace(/\.[^.]+$/,"")}
function formatBytes(bytes:number){if(!Number.isFinite(bytes))return"-";if(bytes<1024)return`${bytes} B`;if(bytes<1048576)return`${(bytes/1024).toFixed(1)} KB`;return`${(bytes/1048576).toFixed(2)} MB`}
function qualityValue(mode:QualityMode,custom:number){return mode==="custom"?custom:mode==="high"?92:mode==="balanced"?78:mode==="space"?60:84}
function allowedFormats(kind:InputKind):OutputFormat[]{return kind==="heic"||kind==="avif"?["image/jpeg","image/png"]:["image/avif"]}
function defaultFormat(kind:InputKind):OutputFormat{return kind==="heic"||kind==="avif"?"image/jpeg":"image/avif"}
function remoteImport(url:string):Promise<any>{return Function("u","return import(u)")(url)}
async function decodeHeic(file:File){const mod=await remoteImport("https://esm.sh/heic-to@1.5.2/csp");return await mod.heicTo({blob:file,type:"image/png",quality:1}) as Blob}
async function encodeAvif(imageData:ImageData,quality:number){const mod=await remoteImport("https://esm.sh/@jsquash/avif@2.1.1");const buffer=await mod.encode(imageData,{cqLevel:Math.round(63-(quality/100)*55),speed:8});const output=new Uint8Array(buffer);return new Blob([output],{type:"image/avif"})}
async function canvasBlob(canvas:HTMLCanvasElement,type:"image/jpeg"|"image/png",quality?:number){return new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("export failed")),type,quality))}
async function detectKind(file:File):Promise<InputKind|null>{const b=new Uint8Array(await file.slice(0,16).arrayBuffer());if(b[0]===0xff&&b[1]===0xd8)return"jpeg";if(b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47)return"png";const brand=new TextDecoder().decode(b.slice(8,16)).toLowerCase();if(brand.includes("avif")||brand.includes("avis"))return"avif";if(brand.includes("heic")||brand.includes("heif")||brand.includes("heix")||brand.includes("mif1")||brand.includes("msf1"))return"heic";return null}
async function sourceFrom(file:File,kind:InputKind){const blob=kind==="heic"?await decodeHeic(file):file;const bitmap=await createImageBitmap(blob,{imageOrientation:"from-image"});return{blob,bitmap}}
function uniqueNames(items:FileItem[]){const used=new Map<string,number>();return items.map(item=>{const key=`${baseName(item.file.name)}.${ext(item.outputFormat)}`;const n=(used.get(key)||0)+1;used.set(key,n);return n===1?key:`${baseName(item.file.name)}-${n}.${ext(item.outputFormat)}`})}
function duplicateKey(file:File){return `${file.name.toLowerCase()}|${file.size}|${file.lastModified}`}
function expectedKind(file:File):InputKind|null{const n=file.name.toLowerCase();if(/\.jpe?g$/.test(n))return"jpeg";if(n.endsWith(".png"))return"png";if(n.endsWith(".avif"))return"avif";if(/\.(heic|heif)$/.test(n))return"heic";return null}

export function HeicAvifConverterTool({locale}:{locale:Locale}){
 const t=copy[locale], inputRef=useRef<HTMLInputElement|null>(null), itemsRef=useRef<FileItem[]>([]), cancelRef=useRef(false);
 const [items,setItems]=useState<FileItem[]>([]),[drag,setDrag]=useState(false),[qualityMode,setQualityMode]=useState<QualityMode>("auto"),[customQuality,setCustomQuality]=useState(84),[bg,setBg]=useState("#ffffff"),[advanced,setAdvanced]=useState(false),[processing,setProcessing]=useState(false),[message,setMessage]=useState(""),[zipState,setZipState]=useState<"idle"|"working"|"error">("idle");
 useEffect(()=>{itemsRef.current=items},[items]);useEffect(()=>()=>itemsRef.current.forEach(i=>{if(i.previewUrl)URL.revokeObjectURL(i.previewUrl);if(i.resultUrl)URL.revokeObjectURL(i.resultUrl)}),[]);
 const completed=items.filter(i=>i.status==="done"&&i.resultBlob), newCount=items.filter(i=>i.isNew&&i.status!=="processing").length;
 const totals=useMemo(()=>{const original=completed.reduce((s,i)=>s+i.originalSize,0),output=completed.reduce((s,i)=>s+(i.outputSize||0),0);return{original,output,delta:output-original}},[completed]);
 const commonFormats=useMemo(()=>items.length?allowedFormats(items[0].inputKind).filter(f=>items.every(i=>allowedFormats(i.inputKind).includes(f))):[],[items]);
 const hasJpg=items.some(i=>i.outputFormat==="image/jpeg"), hasLossy=items.some(i=>i.outputFormat!=="image/png");
 function patch(id:string,p:Partial<FileItem>){setItems(prev=>prev.map(i=>i.id===id?{...i,...p}:i))}
 async function addFiles(list:FileList|File[]){const incoming=Array.from(list),accepted:FileItem[]=[];let total=items.reduce((s,i)=>s+i.originalSize,0),skipped=0,duplicates=0,mismatches=0;const seen=new Set(items.map(i=>duplicateKey(i.file)));
  for(const file of incoming){if(items.length+accepted.length>=MAX_FILES||file.size===0||file.size>MAX_FILE_BYTES||total+file.size>MAX_TOTAL_BYTES){skipped++;continue}const key=duplicateKey(file);if(seen.has(key)){duplicates++;continue}const kind=await detectKind(file),expected=expectedKind(file);if(!kind){skipped++;continue}if(!expected||expected!==kind){mismatches++;continue}total+=file.size;seen.add(key);const item:FileItem={id:crypto.randomUUID(),file,inputKind:kind,outputFormat:defaultFormat(kind),status:"idle",originalSize:file.size,isNew:true};
   try{const {bitmap}=await sourceFrom(file,kind);if(bitmap.width*bitmap.height>MAX_PIXELS){bitmap.close();skipped++;continue}const c=document.createElement("canvas"),scale=Math.min(1,640/Math.max(bitmap.width,bitmap.height));c.width=Math.max(1,Math.round(bitmap.width*scale));c.height=Math.max(1,Math.round(bitmap.height*scale));c.getContext("2d")?.drawImage(bitmap,0,0,c.width,c.height);const thumb=await canvasBlob(c,"image/png");item.previewUrl=URL.createObjectURL(thumb);item.width=bitmap.width;item.height=bitmap.height;bitmap.close()}catch{item.previewUrl=kind==="heic"?undefined:URL.createObjectURL(await materializeImageBlob(file))}accepted.push(item)}
  setItems(prev=>[...prev,...accepted]);const extra=[duplicates?`${locale==="ko"?"중복":"en"===locale?"Duplicates":"重複"} ${duplicates}`:"",mismatches?`${t.signature} (${mismatches})`:"",skipped?`${t.skipped(skipped)} ${t.limit}`:""].filter(Boolean).join(" · ");setMessage(`${accepted.length?t.added(accepted.length):""}${extra?` ${extra}`:""}`.trim()||t.unsupported)}
 function remove(id:string){setItems(prev=>{const x=prev.find(i=>i.id===id);if(x?.previewUrl)URL.revokeObjectURL(x.previewUrl);if(x?.resultUrl)URL.revokeObjectURL(x.resultUrl);return prev.filter(i=>i.id!==id)})}
 function reset(){itemsRef.current.forEach(i=>{if(i.previewUrl)URL.revokeObjectURL(i.previewUrl);if(i.resultUrl)URL.revokeObjectURL(i.resultUrl)});setItems([]);setMessage("");setZipState("idle");setQualityMode("auto");setCustomQuality(84);setBg("#ffffff");setAdvanced(false)}
 function move(index:number,direction:-1|1){setItems(prev=>{const target=index+direction;if(target<0||target>=prev.length)return prev;const next=[...prev];[next[index],next[target]]=[next[target],next[index]];return next})}
 async function retry(id:string){const item=itemsRef.current.find(i=>i.id===id);if(!item||processing)return;patch(id,{status:"idle",error:undefined,isNew:true});await convert(true)}
 function setAll(format:OutputFormat){setItems(prev=>prev.map(i=>allowedFormats(i.inputKind).includes(format)?{...i,outputFormat:format}:i))}
 async function convert(onlyNew=false){if(processing||!items.length)return;cancelRef.current=false;setProcessing(true);setZipState("idle");let next=items.map(i=>{if(i.resultUrl)URL.revokeObjectURL(i.resultUrl);return onlyNew&&!i.isNew?i:{...i,status:"idle" as Status,resultBlob:undefined,resultUrl:undefined,outputSize:undefined,error:undefined,warning:undefined}});const targets=next.map((i,index)=>({i,index})).filter(x=>!onlyNew||x.i.isNew);const names=uniqueNames(next);
  let processed=0;for(const {i:item,index} of targets){if(cancelRef.current){next[index]={...next[index],status:"cancelled"};continue}processed++;next[index]={...next[index],status:"processing"};setItems([...next]);setMessage(`${t.processing(processed,targets.length)}${item.outputFormat==="image/avif"?` · ${t.avifSlow}`:""}`);
   try{const {bitmap}=await sourceFrom(item.file,item.inputKind);if(bitmap.width*bitmap.height>MAX_PIXELS){bitmap.close();throw new Error(t.limit)}const canvas=document.createElement("canvas");canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext("2d",{willReadFrequently:item.outputFormat==="image/avif"});if(!ctx)throw new Error(t.unsupported);if(item.outputFormat==="image/jpeg"){ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height)}ctx.drawImage(bitmap,0,0);bitmap.close();const q=qualityValue(qualityMode,customQuality)/100;let result:Blob;if(item.outputFormat==="image/avif")result=await encodeAvif(ctx.getImageData(0,0,canvas.width,canvas.height),q*100);else result=await canvasBlob(canvas,item.outputFormat,q);const delta=Math.abs(result.size-item.originalSize)/Math.max(1,item.originalSize);next[index]={...next[index],status:"done",isNew:false,resultBlob:result,resultUrl:URL.createObjectURL(result),outputSize:result.size,outputName:names[index],warning:delta<.03?t.similar:result.size>item.originalSize?t.larger:t.smaller,width:canvas.width,height:canvas.height}}
   catch(error){const text=error instanceof Error&&/fetch|import|module|network/i.test(error.message)?t.cdnFail:error instanceof Error?error.message:t.unsupported;next[index]={...next[index],status:"error",error:text}}
  }
  setItems([...next]);const ok=next.filter(i=>i.status==="done").length,fail=next.filter(i=>i.status==="error").length,cancelled=next.filter(i=>i.status==="cancelled").length;setMessage(t.done(ok,fail,cancelled));setProcessing(false)}
 function download(blob:Blob,name:string){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
 async function zip(){if(!completed.length||zipState==="working")return;setZipState("working");try{const blob=await createStoredZip(completed.map((i,index)=>({name:i.outputName||`${baseName(i.file.name)}-${index+1}.${ext(i.outputFormat)}`,blob:i.resultBlob!})));download(blob,"fixlgs-heic-avif-converter.zip");setZipState("idle")}catch{setZipState("error");setMessage(t.zipFail)}}
 const deltaPct=totals.original?(totals.delta/totals.original)*100:0;
 return (
  <div className="toolbox-tool-workflow">
   <section className="toolbox-workbench">
    <div
     className={`toolbox-workbench-upload ${drag ? "is-dragging" : ""}`}
     onDragOver={(e)=>{e.preventDefault();setDrag(true)}}
     onDragLeave={()=>setDrag(false)}
     onDrop={(e)=>{e.preventDefault();setDrag(false);void addFiles(e.dataTransfer.files)}}
    >
     <div className="toolbox-workbench-topline">
      <div>
       <span>WORKSPACE</span>
       <strong>{locale==="ko"?"HEIC·AVIF 이미지 변환 작업장":locale==="en"?"HEIC & AVIF conversion workspace":"HEIC・AVIF画像変換ワークスペース"}</strong>
      </div>
     </div>

     <input data-testid="heic-file-input" ref={inputRef} type="file" hidden multiple accept=".heic,.heif,.avif,.jpg,.jpeg,.png,image/heic,image/heif,image/avif,image/jpeg,image/png" onChange={e=>{if(e.target.files)void addFiles(e.target.files);e.currentTarget.value=""}}/>

     {items.length===0 ? (
      <div className="toolbox-upload-focus">
       <span className="toolbox-upload-icon" aria-hidden="true">＋</span>
       <h2>{locale==="ko"?"이미지를 여기에 놓으세요":locale==="en"?"Drop images here":"画像をここにドロップ"}</h2>
       <p>{locale==="ko"?"여러 파일을 한 번에 추가하거나 아래 버튼으로 선택할 수 있습니다.":locale==="en"?"Add several files at once, or choose them with the button below.":"複数ファイルをまとめて追加するか、下のボタンから選択できます。"}</p>
       <button type="button" onClick={()=>inputRef.current?.click()}>{t.select}</button>
       <small>{t.supported}<br/>{t.limit}</small>
      </div>
     ) : (
      <div className="toolbox-upload-active">
       <div className="toolbox-upload-active-head">
        <div>
         <span>{locale==="ko"?"선택한 이미지":locale==="en"?"Selected images":"選択した画像"}</span>
         <p>{locale==="ko"?"파일을 추가한 자리에서 형식, 상태와 결과를 바로 확인합니다.":locale==="en"?"Review format, status, and results where the files were added.":"追加した場所で形式、状態、結果を確認できます。"}</p>
        </div>
        <div className="toolbox-upload-active-actions">
         <div className="toolbox-file-stats">
          <span>{items.length} {t.files}</span>
          <span>{completed.length} {t.completed}</span>
          <span>{items.filter(i=>i.status==="error").length} {t.failed}</span>
         </div>
         <button type="button" onClick={()=>inputRef.current?.click()}>＋ {t.add}</button>
        </div>
       </div>

       <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item,index)=>(
         <article key={item.id} data-testid="heic-file-card" data-status={item.status} className="overflow-hidden rounded-[1.5rem] border border-border bg-surface-2">
          <div className="aspect-[4/3] bg-black/5 dark:bg-white/5">
           {item.previewUrl?<img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-sm font-bold tracking-[.12em] text-muted">{item.inputKind.toUpperCase()}</div>}
          </div>
          <div className="space-y-3 p-4">
           <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
             <h3 className="truncate text-sm font-semibold" title={item.file.name}>{item.file.name}</h3>
             <p className="mt-1 text-xs text-muted">{item.inputKind.toUpperCase()} · {formatBytes(item.originalSize)}{item.width&&item.height?` · ${item.width}×${item.height}`:""}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${item.status==="done"?"bg-success/10 text-success":item.status==="error"?"bg-warning/10 text-warning":item.status==="processing"?"bg-foreground/10 text-foreground dark:bg-white/10 dark:text-white":"border border-border text-muted"}`}>
             {item.status==="processing"?t.processingLabel:item.status==="done"?t.completed:item.status==="error"?t.failed:item.status==="cancelled"?t.cancelled:t.idle}
            </span>
           </div>

           <div>
            <p className="mb-2 text-xs font-medium text-muted">{locale==="ko"?"파일별 출력 형식":locale==="en"?"Per-file output format":"ファイルごとの出力形式"}</p>
            <div className="flex flex-wrap gap-2">
             {allowedFormats(item.inputKind).map(f=><button type="button" key={f} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${item.outputFormat===f?"bg-foreground text-background dark:bg-white dark:text-black":"border border-border bg-surface text-foreground"}`} disabled={processing} onClick={()=>patch(item.id,{outputFormat:f})}>{ext(f).toUpperCase()}</button>)}
            </div>
           </div>

           {item.resultBlob&&<div className="grid gap-2 rounded-2xl border border-border bg-surface p-3 text-xs leading-6 text-muted"><div className="flex justify-between gap-3"><span>{locale==="ko"?"용량 변화":locale==="en"?"Size change":"容量変化"}</span><span className="font-medium text-foreground">{formatBytes(item.originalSize)} → {formatBytes(item.outputSize||0)}</span></div><div className="flex justify-between gap-3"><span>{locale==="ko"?"결과 상태":locale==="en"?"Result":"結果"}</span><span className="font-medium text-foreground">{item.warning}</span></div></div>}
           {item.error&&<div className="rounded-2xl border border-warning/30 bg-warning/10 p-3 text-xs leading-6 text-warning">{item.error}</div>}

           <div className="flex flex-wrap gap-2">
            <button type="button" onClick={()=>move(index,-1)} disabled={processing||index===0} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs">↑</button><button type="button" onClick={()=>move(index,1)} disabled={processing||index===items.length-1} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs">↓</button>
            {item.status==="error"&&<button type="button" onClick={()=>void retry(item.id)} disabled={processing} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs">{locale==="ko"?"다시 시도":locale==="en"?"Retry":"再試行"}</button>}
            {item.resultBlob&&<button type="button" onClick={()=>download(item.resultBlob!,item.outputName||`${baseName(item.file.name)}.${ext(item.outputFormat)}`)} className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background dark:bg-white dark:text-black">{t.download}</button>}
            <button type="button" onClick={()=>remove(item.id)} disabled={processing} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium">{t.remove}</button>
           </div>
          </div>
         </article>
        ))}
       </div>
      </div>
     )}

     <div className="toolbox-workbench-settings-head">
      <div>
       <span>{t.output}</span>
       <p>{t.outputHelp}</p>
      </div>
      {commonFormats.length>0&&<div className="grid gap-3 sm:grid-cols-3">{commonFormats.map(f=><button key={f} type="button" onClick={()=>setAll(f)} disabled={processing} className="rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-semibold transition hover:border-foreground dark:hover:border-white">{ext(f).toUpperCase()}</button>)}</div>}
     </div>

     <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="rounded-2xl border border-border bg-surface-2 p-4">
       <p className="text-sm font-medium text-foreground">{t.quality}</p>
       <p className="mt-1 text-sm text-muted">{items.length===0?t.empty:items.every(i=>i.outputFormat==="image/png")?t.pngLossless:t.avifSlow}</p>
       {hasLossy&&<div className="mt-3 flex flex-wrap items-center gap-2 text-sm">{(["auto","high","balanced","space","custom"] as QualityMode[]).map(m=><button type="button" key={m} className={`rounded-full px-3 py-1.5 transition ${qualityMode===m?"bg-foreground text-background dark:bg-white dark:text-black":"border border-border bg-surface text-foreground"}`} onClick={()=>setQualityMode(m)} disabled={processing}>{m==="auto"?t.auto:m==="high"?t.high:m==="balanced"?t.balanced:m==="space"?t.space:t.custom}</button>)}</div>}
       {qualityMode==="custom"&&hasLossy&&<div className="mt-4"><input className="w-full accent-[var(--accent)]" type="range" min="35" max="95" value={customQuality} onChange={e=>setCustomQuality(Number(e.target.value))}/><div className="mt-1 flex justify-between text-xs text-muted"><span>35</span><span>{customQuality}</span><span>95</span></div></div>}
      </div>
     </div>

     <button className="toolbox-converter-advanced-toggle mt-4 w-full rounded-2xl border border-border bg-surface px-4 py-3" type="button" onClick={()=>setAdvanced(v=>!v)} aria-expanded={advanced}>{t.advanced}<span>{advanced?"−":"+"}</span></button>
     {advanced&&<div className="mt-4 rounded-2xl border border-border bg-surface p-4 text-sm leading-7 text-muted"><p>{t.metadata}</p>{hasJpg&&<div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-2 text-xs">{t.jpgBg}</span><button type="button" className={`rounded-full px-3 py-1.5 text-xs ${bg==="#ffffff"?"bg-foreground text-background dark:bg-white dark:text-black":"border border-border"}`} onClick={()=>setBg("#ffffff")}>{t.white}</button><button type="button" className={`rounded-full px-3 py-1.5 text-xs ${bg==="#000000"?"bg-foreground text-background dark:bg-white dark:text-black":"border border-border"}`} onClick={()=>setBg("#000000")}>{t.black}</button><label className="flex items-center gap-2 text-xs">{t.pick}<input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="h-9 w-10 rounded-lg border border-border bg-transparent p-1"/></label></div>}</div>}

     {message&&<div className="toolbox-workbench-notice" aria-live="polite"><strong className="mr-2 text-foreground">{t.notice}</strong><span>{message}</span></div>}
     {completed.length>0&&<div className="toolbox-workbench-summary"><span>{formatBytes(totals.original)}</span><strong>→</strong><span>{formatBytes(totals.output)}</span><span>{totals.delta>0?"+":""}{formatBytes(Math.abs(totals.delta))} · {deltaPct>0?"+":""}{deltaPct.toFixed(1)}%</span></div>}

     {items.length>0&&<div className="toolbox-workbench-actions">
      {processing?<button type="button" className="toolbox-primary-action" onClick={()=>{cancelRef.current=true}}>{t.cancel}</button>:<><button data-testid="heic-run" type="button" className="toolbox-primary-action" onClick={()=>void convert(false)}>{completed.length?t.reconvert:t.convert}</button>{newCount>0&&completed.length>0&&<button type="button" onClick={()=>void convert(true)}>{t.convertNew}</button>}</>}
      <button type="button" className="toolbox-zip-action" onClick={()=>void zip()} disabled={!completed.length||zipState==="working"}>{zipState==="working"?t.zipping:zipState==="error"?t.retryZip:t.zip}</button>
      <button type="button" className="toolbox-restart-action" onClick={reset} disabled={processing}>{t.reset}</button>
     </div>}
    </div>
   </section>
   <button className="toolbox-converter-mobile-add" type="button" onClick={()=>inputRef.current?.click()}>{t.add}</button>
  </div>
 )
}