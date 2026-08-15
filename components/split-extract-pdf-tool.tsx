"use client";

import { useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Locale } from "@/lib/site";
import { createStoredZip } from "@/lib/zip";
import { TOOL029_ACTIVE_LIMITS, formatBytes, pageListLabel, parsePageSelection, parseRangeGroups, sanitizePdfBaseName, type RangeGroup } from "@/lib/tool-029-pdf-policy";
import styles from "./split-extract-pdf-tool.module.css";

type Mode = "range" | "selected" | "individual" | "odd-even";
type SelectedOutput = "combined" | "separate";
type OddEven = "odd" | "even" | "both";
type ResultItem = { name: string; blob: Blob; pages: number[]; pageCount: number };
type Thumb = { page: number; dataUrl?: string; error?: boolean };
type OutputPlan = { name: string; pages: number[] };

const copy = {
  ko: {
    choose:"PDF 선택", drop:"PDF 파일 1개를 선택하거나 여기에 놓으세요", support:"PDF · 1개 · 최대 50MB / 300페이지", local:"PDF는 브라우저 안에서만 처리되며 서버로 업로드되지 않습니다.",
    modes:{range:["페이지 범위 분할","1-3 / 4-7처럼 여러 PDF"],selected:["특정 페이지 추출","1,3,5-8을 하나 또는 개별 PDF"],individual:["페이지별 개별 PDF","모든 페이지를 1장씩 분리"],"odd-even":["홀수·짝수 분리","홀수/짝수 또는 두 결과"]},
    rangeInput:"분할 범위", rangeHelp:"쉼표·줄바꿈·/로 각 결과를 구분하세요. 예: 1-3 / 4-7 / 8-10", selectedInput:"페이지 선택", selectedHelp:"예: 1,3,5-8 · 중복은 제거하고 오름차순으로 정리합니다.", combined:"선택 페이지를 하나의 PDF", separate:"각 페이지를 개별 PDF", odd:"홀수 페이지만", even:"짝수 페이지만", both:"홀수 + 짝수", prefix:"결과 파일명 접두어", preview:"예상 결과", execute:"처리하기", split:"PDF 분할", extract:"페이지 추출", downloadZip:"결과 ZIP 다운로드", download:"다운로드", newPdf:"새 PDF", reset:"초기화", continue:"계속 편집", selectAll:"전체 선택", clear:"전체 해제", invert:"선택 반전", thumbnails:"페이지 미리보기", loadingThumbs:"썸네일을 순차 생성 중입니다.", result:"처리 결과", fileInfo:"PDF 정보", pages:"페이지", files:"파일", totalPages:"총 페이지", noSelection:"페이지를 1개 이상 선택하세요.", noEven:"짝수 페이지가 없습니다.", processing:"PDF 페이지를 복사하고 있습니다.", ready:"PDF를 읽었습니다.", overlap:"일부 페이지가 여러 범위 결과에 중복 포함됩니다.", duplicate:"중복 페이지는 제거했습니다.",
    errors:{BAD_COUNT:"PDF 파일은 한 번에 1개만 선택할 수 있습니다.",BAD_TYPE:"PDF 파일만 선택할 수 있습니다.",TOO_LARGE:"50MB 이하 PDF를 사용하세요.",SIGNATURE:"PDF 서명을 확인할 수 없습니다.",PASSWORD:"비밀번호가 설정되어 있거나 지원하지 않는 PDF입니다.",CORRUPT:"PDF를 읽을 수 없습니다. 손상되었거나 지원하지 않는 구조일 수 있습니다.",TOO_MANY_PAGES:"300페이지 이하 PDF를 사용하세요.",EMPTY:"범위를 입력하세요.",INVALID_SYNTAX:"페이지 문법을 확인하세요. 예: 1-3, 5, 8-10",INVALID_PAGE:"페이지 번호는 1 이상이어야 합니다.",REVERSED_RANGE:"5-3 같은 역방향 범위는 사용할 수 없습니다.",OUT_OF_RANGE:"PDF의 총 페이지 수를 넘는 번호가 포함되어 있습니다.",TOO_MANY_RANGES:"범위 항목은 최대 100개까지 사용할 수 있습니다.",OUTPUT_LIMIT:"예상 결과 파일 수는 최대 300개까지 가능합니다.",PROCESS:"PDF 생성 중 오류가 발생했습니다.",ZIP_FAIL:"ZIP 생성에 실패했습니다. 이미 만든 PDF는 개별 다운로드할 수 있습니다."}
  },
  en: {
    choose:"Choose PDF", drop:"Choose one PDF or drop it here", support:"PDF · 1 file · up to 50MB / 300 pages", local:"The PDF is processed only in your browser and is not uploaded to a server.",
    modes:{range:["Split by Page Range","Create files such as 1-3 / 4-7"],selected:["Extract Selected Pages","Use 1,3,5-8 in one or separate PDFs"],individual:["One PDF per Page","Split every page into its own PDF"],"odd-even":["Split Odd / Even Pages","Odd, even, or both outputs"]},
    rangeInput:"Split ranges", rangeHelp:"Separate each result with commas, line breaks, or /. Example: 1-3 / 4-7 / 8-10", selectedInput:"Select pages", selectedHelp:"Example: 1,3,5-8 · duplicates are removed and pages are sorted ascending.", combined:"Combine selected pages", separate:"Separate PDF per page", odd:"Odd pages only", even:"Even pages only", both:"Odd + even", prefix:"Result filename prefix", preview:"Expected result", execute:"Process", split:"Split PDF", extract:"Extract Pages", downloadZip:"Download Result ZIP", download:"Download", newPdf:"New PDF", reset:"Reset", continue:"Continue editing", selectAll:"Select all", clear:"Clear", invert:"Invert selection", thumbnails:"Page preview", loadingThumbs:"Generating thumbnails sequentially.", result:"Results", fileInfo:"PDF info", pages:"pages", files:"files", totalPages:"Total pages", noSelection:"Select at least one page.", noEven:"There are no even pages.", processing:"Copying PDF pages.", ready:"PDF loaded.", overlap:"Some pages are included in more than one split range.", duplicate:"Duplicate pages were removed.",
    errors:{BAD_COUNT:"Choose one PDF at a time.",BAD_TYPE:"Choose a PDF file.",TOO_LARGE:"Use a PDF of 50MB or less.",SIGNATURE:"The PDF signature could not be verified.",PASSWORD:"This PDF is password-protected or unsupported.",CORRUPT:"The PDF could not be read. It may be damaged or unsupported.",TOO_MANY_PAGES:"Use a PDF with no more than 300 pages.",EMPTY:"Enter a page range.",INVALID_SYNTAX:"Check the page syntax. Example: 1-3, 5, 8-10",INVALID_PAGE:"Page numbers must be 1 or greater.",REVERSED_RANGE:"Reverse ranges such as 5-3 are not supported.",OUT_OF_RANGE:"A page number exceeds the document page count.",TOO_MANY_RANGES:"You can use up to 100 range items.",OUTPUT_LIMIT:"The expected output count can be up to 300 files.",PROCESS:"An error occurred while creating the PDF.",ZIP_FAIL:"ZIP creation failed. The PDFs already created remain available for individual download."}
  },
  ja: {
    choose:"PDFを選択", drop:"PDFファイルを1つ選択するか、ここにドロップしてください", support:"PDF · 1ファイル · 最大50MB / 300ページ", local:"PDFはブラウザ内だけで処理され、サーバーへアップロードされません。",
    modes:{range:["ページ範囲で分割","1-3 / 4-7 のように複数PDFを作成"],selected:["指定ページを抽出","1,3,5-8を1つまたは個別PDFに"],individual:["ページごとに個別PDF","すべてのページを1ページずつ分割"],"odd-even":["奇数・偶数ページを分割","奇数、偶数、または両方"]},
    rangeInput:"分割するページ範囲", rangeHelp:"各結果をカンマ・改行・/ で区切ります。例: 1-3 / 4-7 / 8-10", selectedInput:"ページを選択", selectedHelp:"例: 1,3,5-8 · 重複を除き昇順に整理します。", combined:"選択ページを1つのPDFに", separate:"各ページを個別PDFに", odd:"奇数ページのみ", even:"偶数ページのみ", both:"奇数 + 偶数", prefix:"結果ファイル名の接頭辞", preview:"予想結果", execute:"処理する", split:"PDFを分割", extract:"ページを抽出", downloadZip:"結果ZIPをダウンロード", download:"ダウンロード", newPdf:"新しいPDF", reset:"リセット", continue:"編集を続ける", selectAll:"すべて選択", clear:"すべて解除", invert:"選択を反転", thumbnails:"ページプレビュー", loadingThumbs:"サムネイルを順番に生成しています。", result:"処理結果", fileInfo:"PDF情報", pages:"ページ", files:"ファイル", totalPages:"総ページ数", noSelection:"1ページ以上選択してください。", noEven:"偶数ページがありません。", processing:"PDFページをコピーしています。", ready:"PDFを読み込みました。", overlap:"一部のページが複数の範囲結果に重複して含まれます。", duplicate:"重複ページを削除しました。",
    errors:{BAD_COUNT:"PDFファイルは一度に1つだけ選択してください。",BAD_TYPE:"PDFファイルを選択してください。",TOO_LARGE:"50MB以下のPDFを使用してください。",SIGNATURE:"PDFシグネチャを確認できません。",PASSWORD:"パスワード付き、または未対応のPDFです。",CORRUPT:"PDFを読み込めません。破損または未対応形式の可能性があります。",TOO_MANY_PAGES:"300ページ以下のPDFを使用してください。",EMPTY:"ページ範囲を入力してください。",INVALID_SYNTAX:"ページ指定を確認してください。例: 1-3, 5, 8-10",INVALID_PAGE:"ページ番号は1以上にしてください。",REVERSED_RANGE:"5-3のような逆方向範囲は使用できません。",OUT_OF_RANGE:"PDFの総ページ数を超える番号があります。",TOO_MANY_RANGES:"範囲項目は最大100件まで使用できます。",OUTPUT_LIMIT:"予想出力ファイル数は最大300件です。",PROCESS:"PDF生成中にエラーが発生しました。",ZIP_FAIL:"ZIPの作成に失敗しました。作成済みPDFは個別にダウンロードできます。"}
  }
} as const;

function errorMessage(locale: Locale, code: string) {
  const errors = copy[locale].errors as Record<string,string>;
  return errors[code] ?? errors.PROCESS;
}
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function selectedText(pages: number[]) { return pages.join(","); }
function padding(total: number) { return Math.max(3, String(total).length); }
function defaultRangeText(count:number){if(count<=3)return `1-${count}`;if(count<=7)return `1-3 / 4-${count}`;return `1-3 / 4-7 / 8-${count}`;}
function defaultSelectedPages(count:number){return count>=8?[1,3,5,6,7,8]:Array.from({length:count},(_,i)=>i+1);}
function defaultSelectionText(count:number){return selectedText(defaultSelectedPages(count));}

export function SplitExtractPdfTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const renderTicket = useRef(0);
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [thumbs, setThumbs] = useState<Thumb[]>([]);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [workspaceDragging, setWorkspaceDragging] = useState(false);
  const [mode, setMode] = useState<Mode>("range");
  const [rangeText, setRangeText] = useState("1-3 / 4-7");
  const [selectionText, setSelectionText] = useState("1,3,5-8");
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<SelectedOutput>("combined");
  const [oddEven, setOddEven] = useState<OddEven>("both");
  const [prefix, setPrefix] = useState("document");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [busy, setBusy] = useState(false);

  const rangeParsed = useMemo(() => pageCount ? parseRangeGroups(rangeText, pageCount) : { ok:false as const, error:"EMPTY" }, [rangeText,pageCount]);
  const selectionParsed = useMemo(() => pageCount ? parsePageSelection(selectionText, pageCount) : { ok:true as const, value:[] as number[], warnings:[] as string[] }, [selectionText,pageCount]);

  const plans = useMemo<OutputPlan[]>(() => {
    if (!file || !pageCount) return [];
    const base = sanitizePdfBaseName(prefix, sanitizePdfBaseName(file.name));
    const pad = padding(pageCount);
    if (mode === "range") {
      if (!rangeParsed.ok) return [];
      const seen=new Map<string,number>();
      return rangeParsed.value.map((g:RangeGroup) => {
        const raw=`${base}-pages-${String(g.start).padStart(pad,"0")}-${String(g.end).padStart(pad,"0")}.pdf`;
        const count=(seen.get(raw)??0)+1;seen.set(raw,count);
        return {name:count===1?raw:raw.replace(/\.pdf$/i,`-${count}.pdf`),pages:g.pages};
      });
    }
    if (mode === "selected") {
      const pages = selectionParsed.ok ? selectionParsed.value : selected;
      if (!pages.length) return [];
      if (selectedOutput === "combined") return [{ name:`${base}-extracted.pdf`, pages }];
      return pages.map((page) => ({ name:`${base}-page-${String(page).padStart(pad,"0")}.pdf`, pages:[page] }));
    }
    if (mode === "individual") return Array.from({length:pageCount},(_,i)=>({name:`${base}-page-${String(i+1).padStart(pad,"0")}.pdf`,pages:[i+1]}));
    const odd = Array.from({length:pageCount},(_,i)=>i+1).filter((p)=>p%2===1);
    const even = Array.from({length:pageCount},(_,i)=>i+1).filter((p)=>p%2===0);
    const output:OutputPlan[]=[];
    if ((oddEven==="odd"||oddEven==="both")&&odd.length) output.push({name:`${base}-odd.pdf`,pages:odd});
    if ((oddEven==="even"||oddEven==="both")&&even.length) output.push({name:`${base}-even.pdf`,pages:even});
    return output;
  },[file,pageCount,prefix,mode,rangeParsed,selectionParsed,selected,selectedOutput,oddEven]);

  const invalid = useMemo(() => {
    if (!file) return "";
    if (mode==="range"&&!rangeParsed.ok) return rangeParsed.error;
    if (mode==="selected"&&!selectionParsed.ok) return selectionParsed.error;
    if (mode==="selected"&&selectionParsed.ok&&!selectionParsed.value.length) return "NO_SELECTION";
    if (mode==="odd-even"&&oddEven==="even"&&pageCount<2) return "NO_EVEN";
    if (plans.length>TOOL029_ACTIVE_LIMITS.maxOutputFiles) return "OUTPUT_LIMIT";
    return "";
  },[file,mode,rangeParsed,selectionParsed,plans.length,oddEven,pageCount]);

  async function renderThumbnails(data:ArrayBuffer, count:number, ticket:number) {
    setThumbLoading(true); setThumbs(Array.from({length:count},(_,i)=>({page:i+1})));
    try {
      const pdfjs = await import("pdfjs-dist/webpack.mjs");
      const task = pdfjs.getDocument({data:new Uint8Array(data.slice(0))});
      const doc = await task.promise;
      for (let i=1;i<=count;i+=1) {
        if (renderTicket.current!==ticket) { await doc.destroy(); return; }
        try {
          const page=await doc.getPage(i); const base=page.getViewport({scale:1});
          const scale=Math.min(.32, 150/base.width); const viewport=page.getViewport({scale});
          const canvas=document.createElement("canvas"); canvas.width=Math.max(1,Math.ceil(viewport.width)); canvas.height=Math.max(1,Math.ceil(viewport.height));
          const ctx=canvas.getContext("2d",{alpha:false}); if(!ctx) throw new Error("CTX");
          await page.render({canvasContext:ctx,viewport}).promise;
          const dataUrl=canvas.toDataURL("image/jpeg",.72);
          setThumbs((old)=>old.map((thumb)=>thumb.page===i?{page:i,dataUrl}:thumb));
        } catch { setThumbs((old)=>old.map((thumb)=>thumb.page===i?{page:i,error:true}:thumb)); }
        if (i%4===0) await new Promise((resolve)=>setTimeout(resolve,0));
      }
      await doc.destroy();
    } catch { setThumbs(Array.from({length:count},(_,i)=>({page:i+1,error:true}))); }
    finally { if(renderTicket.current===ticket)setThumbLoading(false); }
  }

  async function acceptFile(candidate?:File) {
    if(!candidate)return; setError("");setStatus("");setResults([]);setProgress(0);
    if(candidate.type!=="application/pdf"&&!candidate.name.toLowerCase().endsWith(".pdf")){setError(t.errors.BAD_TYPE);return;}
    if(candidate.size>TOOL029_ACTIVE_LIMITS.maxFileBytes){setError(t.errors.TOO_LARGE);return;}
    const buffer=await candidate.arrayBuffer(); const sig=new Uint8Array(buffer.slice(0,5));
    if(new TextDecoder("latin1").decode(sig)!=="%PDF-"){setError(t.errors.SIGNATURE);return;}
    try{
      const {PDFDocument}=await import("pdf-lib");
      const doc=await PDFDocument.load(buffer,{ignoreEncryption:false,updateMetadata:false}); const count=doc.getPageCount();
      if(count<1) throw new Error("CORRUPT");
      if(count>TOOL029_ACTIVE_LIMITS.maxPages){setError(t.errors.TOO_MANY_PAGES);return;}
      const base=sanitizePdfBaseName(candidate.name,"document");
      setFile(candidate);setBytes(buffer);setPageCount(count);setPrefix(base);setRangeText(defaultRangeText(count));setSelectionText(defaultSelectionText(count));setSelected(defaultSelectedPages(count));setStatus(t.ready);
      const ticket=++renderTicket.current; void renderThumbnails(buffer,count,ticket);
    }catch(err){
      const message=err instanceof Error?err.message:"";
      setError(/encrypt|password/i.test(message)?t.errors.PASSWORD:t.errors.CORRUPT);
    }
  }

  function updateSelectionFromText(value:string){
    setSelectionText(value); if(!pageCount)return; const parsed=parsePageSelection(value,pageCount); if(parsed.ok)setSelected(parsed.value);
  }
  function togglePage(page:number){
    if(mode!=="selected")return;
    const next=selected.includes(page)?selected.filter((p)=>p!==page):[...selected,page].sort((a,b)=>a-b);
    setSelected(next);setSelectionText(selectedText(next));setResults([]);
  }
  function resetWork(){setMode("range");setSelectedOutput("combined");setOddEven("both");setResults([]);setError("");setProgress(0);if(pageCount){setRangeText(defaultRangeText(pageCount));setSelectionText(defaultSelectionText(pageCount));setSelected(defaultSelectedPages(pageCount));}}
  function clearAll(){renderTicket.current+=1;setFile(null);setBytes(null);setPageCount(0);setThumbs([]);setResults([]);setSelected([]);setError("");setStatus("");setProgress(0);if(inputRef.current)inputRef.current.value="";}

  async function processPdf(){
    if(!bytes||!file||invalid||busy)return;
    setBusy(true);setError("");setStatus(t.processing);setResults([]);setProgress(2);
    try{
      const {PDFDocument}=await import("pdf-lib"); const source=await PDFDocument.load(bytes,{ignoreEncryption:false,updateMetadata:false}); const made:ResultItem[]=[];
      for(let i=0;i<plans.length;i+=1){const plan=plans[i];const out=await PDFDocument.create();const copied=await out.copyPages(source,plan.pages.map((p)=>p-1));copied.forEach((page)=>out.addPage(page));const saved=await out.save({useObjectStreams:true,addDefaultPage:false,updateFieldAppearances:false});const verified=await PDFDocument.load(saved,{updateMetadata:false});const verifiedCount=verified.getPageCount();if(verifiedCount!==plan.pages.length)throw new Error("PAGE_COUNT_MISMATCH");made.push({name:plan.name,blob:new Blob([saved as BlobPart],{type:"application/pdf"}),pages:plan.pages,pageCount:verifiedCount});setProgress(Math.round(((i+1)/plans.length)*100));await new Promise((resolve)=>setTimeout(resolve,0));}
      setResults(made);setStatus(`${t.result}: ${made.length} ${t.files}`);
    }catch{setError(t.errors.PROCESS);setStatus("");}
    finally{setBusy(false);}
  }
  async function downloadAll(){
    if(!results.length||!file)return; if(results.length===1){downloadBlob(results[0].blob,results[0].name);return;}
    const base=sanitizePdfBaseName(prefix,sanitizePdfBaseName(file.name)); const zipName=mode==="selected"?`${base}-extracted-pages.zip`:`${base}-split.zip`;
    try{const zip=await createStoredZip(results.map(({name,blob})=>({name,blob})));downloadBlob(zip,zipName);}catch{setError(t.errors.ZIP_FAIL);}
  }

  function dropPdfFile(event: DragEvent<HTMLElement>){
    if(!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    setDragging(false);
    setWorkspaceDragging(false);
    if(busy) return;
    if(event.dataTransfer.files.length!==1){setError(t.errors.BAD_COUNT);return;}
    void acceptFile(event.dataTransfer.files[0]);
  }

  const dragActive = dragging || workspaceDragging;

  const selectedPages=selectionParsed.ok?selectionParsed.value:selected;
  const expectedPages=plans.reduce((sum,p)=>sum+p.pages.length,0);
  const warning = mode==="range"&&rangeParsed.ok&&rangeParsed.warnings.length?t.overlap:mode==="selected"&&selectionParsed.ok&&selectionParsed.warnings.length?t.duplicate:"";
  const invalidText=invalid==="NO_SELECTION"?t.noSelection:invalid==="NO_EVEN"?t.noEven:invalid?errorMessage(locale,invalid):"";

  return <div className={styles.wrapper} data-testid="tool029-root">
    <div className={styles.localNote}><strong>LOCAL ONLY</strong><span>{t.local}</span></div>
    {error&&<p className={styles.error} role="alert" data-testid="tool029-error">{error}</p>}
    {status&&<p className={styles.status} aria-live="polite" data-testid="tool029-status">{status}</p>}

    <input ref={inputRef} className={styles.hidden} type="file" accept="application/pdf,.pdf" data-testid="tool029-file-input" onChange={(e)=>void acceptFile(e.currentTarget.files?.[0])}/>
    <div className={`${styles.dropzone} ${file?styles.dropzoneReady:""} ${dragActive?styles.dragging:""}`} data-testid="tool029-dropzone" data-drag-active={dragActive?"true":"false"} onClick={()=>{if(!busy)inputRef.current?.click()}} onDragEnter={(e)=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!busy)setDragging(true)}}} onDragOver={(e)=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!busy)setDragging(true)}}} onDragLeave={(e)=>{const next=e.relatedTarget as Node|null;if(!next||!e.currentTarget.contains(next))setDragging(false)}} onDrop={dropPdfFile}>
      <strong>{file?t.newPdf:t.drop}</strong><span>{file?`${file.name} · ${formatBytes(file.size)} · ${pageCount} ${t.pages}`:t.support}</span><button type="button" className={styles.primaryButton} disabled={busy}>{file?t.newPdf:t.choose}</button>
    </div>

    {file&&<div className={`${styles.workspace} ${dragActive?styles.workspaceDragging:""}`} data-testid="tool029-workspace" data-drop-target="pdf-replace" data-drag-active={dragActive?"true":"false"} onDragEnter={(e)=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!busy)setWorkspaceDragging(true)}}} onDragOver={(e)=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!busy)setWorkspaceDragging(true)}}} onDragLeave={(e)=>{const next=e.relatedTarget as Node|null;if(!next||!e.currentTarget.contains(next))setWorkspaceDragging(false)}} onDrop={dropPdfFile}>
      <div className={styles.fileCard} data-testid="tool029-file-info"><div><h3>{file.name}</h3><p>{formatBytes(file.size)} · {t.totalPages} {pageCount}</p></div><button type="button" className={styles.ghostButton} data-testid="tool029-new-pdf" disabled={busy} onClick={clearAll}>{t.newPdf}</button></div>
      <div className={styles.modeGrid} role="tablist" aria-label="PDF mode">{(["range","selected","individual","odd-even"] as Mode[]).map((key)=><button key={key} type="button" role="tab" aria-selected={mode===key} className={`${styles.modeButton} ${mode===key?styles.active:""}`} disabled={busy} onClick={()=>{setMode(key);setResults([]);setError("")}} data-testid={`tool029-mode-${key}`}><strong>{t.modes[key][0]}</strong><span>{t.modes[key][1]}</span></button>)}</div>

      <div className={styles.workGrid}>
        <section className={`${styles.panel} ${styles.settingsPanel}`} data-testid="tool029-settings">
          <h3>{mode==="range"?t.modes.range[0]:mode==="selected"?t.modes.selected[0]:mode==="individual"?t.modes.individual[0]:t.modes["odd-even"][0]}</h3>
          {mode==="range"&&<label className={styles.label}>{t.rangeInput}<textarea className={styles.textarea} value={rangeText} disabled={busy} onChange={(e)=>{setRangeText(e.target.value);setResults([])}} data-testid="tool029-range-input"/><span className={styles.help}>{t.rangeHelp}</span></label>}
          {mode==="selected"&&<><label className={styles.label}>{t.selectedInput}<textarea className={styles.textarea} value={selectionText} disabled={busy} onChange={(e)=>{updateSelectionFromText(e.target.value);setResults([])}} data-testid="tool029-selection-input"/><span className={styles.help}>{t.selectedHelp}</span></label><div className={styles.segmented}><button type="button" className={selectedOutput==="combined"?styles.selected:""} disabled={busy} onClick={()=>setSelectedOutput("combined")}>{t.combined}</button><button type="button" className={selectedOutput==="separate"?styles.selected:""} disabled={busy} onClick={()=>setSelectedOutput("separate")}>{t.separate}</button></div></>}
          {mode==="individual"&&<p className={styles.help}>{locale==="ko"?"전체 페이지를 원본 순서대로 한 페이지씩 별도 PDF로 만들고 ZIP으로 받을 수 있습니다.":locale==="ja"?"全ページを元の順番で1ページずつ個別PDFにし、ZIPでまとめて保存できます。":"Every page is copied in its original order into an individual PDF and can be downloaded as one ZIP."}</p>}
          {mode==="odd-even"&&<div className={styles.radioRow}><label><input type="radio" disabled={busy} checked={oddEven==="odd"} onChange={()=>setOddEven("odd")}/>{t.odd}</label><label><input type="radio" disabled={busy} checked={oddEven==="even"} onChange={()=>setOddEven("even")}/>{t.even}</label><label><input type="radio" disabled={busy} checked={oddEven==="both"} onChange={()=>setOddEven("both")}/>{t.both}</label></div>}
          <label className={styles.label}>{t.prefix}<input className={styles.input} disabled={busy} value={prefix} onChange={(e)=>setPrefix(e.target.value)} data-testid="tool029-prefix"/></label>
        </section>

        <section className={`${styles.panel} ${styles.thumbnailPanel}`} data-testid="tool029-thumbnails">
          <div className={styles.thumbHead}><h3>{t.thumbnails}</h3>{mode==="selected"&&<div className={styles.thumbActions}><button type="button" disabled={busy} onClick={()=>{const p=Array.from({length:pageCount},(_,i)=>i+1);setSelected(p);setSelectionText(selectedText(p))}}>{t.selectAll}</button><button type="button" disabled={busy} onClick={()=>{setSelected([]);setSelectionText("")}}>{t.clear}</button><button type="button" disabled={busy} onClick={()=>{const p=Array.from({length:pageCount},(_,i)=>i+1).filter((x)=>!selectedPages.includes(x));setSelected(p);setSelectionText(selectedText(p))}}>{t.invert}</button></div>}</div>
          {thumbLoading&&<p className={styles.smallMuted}>{t.loadingThumbs}</p>}
          <div className={styles.thumbGrid}>{thumbs.map((thumb)=>{const isSelected=selectedPages.includes(thumb.page);return <button key={thumb.page} type="button" className={`${styles.thumb} ${mode==="selected"?styles.selectable:""}`} aria-selected={mode==="selected"?isSelected:undefined} disabled={mode!=="selected"||busy} onClick={()=>togglePage(thumb.page)} data-testid={`tool029-page-${thumb.page}`}>{thumb.dataUrl?<img src={thumb.dataUrl} alt={`${t.pages} ${thumb.page}`}/>:<div className={styles.loadingThumb}>{thumb.error?"Preview unavailable":"…"}</div>}{isSelected&&mode==="selected"&&<span className={styles.check}>✓</span>}<span>{thumb.page}</span></button>})}</div>
        </section>

        <section className={`${styles.panel} ${styles.actionPanel}`} data-testid="tool029-action-panel">
          {warning&&<p className={styles.warning}>{warning}</p>}{invalidText&&<p className={styles.error}>{invalidText}</p>}
          <div className={styles.summary} data-testid="tool029-plan"><strong>{t.preview}: {plans.length} {t.files} / {expectedPages} {t.pages}</strong><span>{plans.slice(0,4).map((p)=>`${p.name} [${pageListLabel(p.pages,10)}]`).join(" · ")}{plans.length>4?` · … +${plans.length-4}`:""}</span></div>
          <div className={styles.footerActions}><button type="button" className={styles.primaryButton} disabled={Boolean(invalid)||!plans.length||busy} onClick={()=>void processPdf()} data-testid="tool029-process">{mode==="range"?t.split:mode==="selected"?t.extract:t.execute}</button><button type="button" className={styles.secondaryButton} disabled={busy} onClick={resetWork}>{t.reset}</button></div>
          {progress>0&&progress<100&&<div className={styles.progress} aria-label={`${progress}%`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} data-testid="tool029-progress"><i style={{width:`${progress}%`}}/></div>}
          {results.length>0&&<div className={styles.resultList} data-testid="tool029-results"><h3>{t.result}</h3>{results.map((r)=><div className={styles.resultRow} key={r.name} data-testid="tool029-result-row"><div><strong>{r.name}</strong><span>{r.pageCount} {t.pages} · {formatBytes(r.blob.size)}</span></div><button type="button" className={styles.ghostButton} onClick={()=>downloadBlob(r.blob,r.name)}>{t.download}</button></div>)}<div className={styles.footerActions}><button type="button" className={styles.primaryButton} data-testid="tool029-download-all" onClick={()=>void downloadAll()}>{results.length>1?t.downloadZip:t.download}</button><button type="button" className={styles.secondaryButton} onClick={()=>setResults([])}>{t.continue}</button></div></div>}
        </section>
      </div>
    </div>}
  </div>;
}
