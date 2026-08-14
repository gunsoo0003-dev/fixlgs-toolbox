"use client";

import { type DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import styles from "./merge-pdf-tool.module.css";
import type { Locale } from "@/lib/site";
import {
  TOOL028_ACCEPT,
  TOOL028_MIN_FILES,
  TOOL028_SERVICE_LIMITS,
  canAcceptByteTotal,
  formatBytes,
  hasPdfSignature,
  moveItem,
  normalizePdfFilename,
} from "@/lib/tool-028-pdf-policy";

type PdfItem = {
  id: string;
  file: File;
  pageCount: number;
  thumbnailUrl: string | null;
};

type ResultState = { url: string; filename: string; bytes: number; pages: number } | null;

type Copy = {
  addTitle: string; addDesc: string; choose: string; local: string; files: string; pages: string; total: string; drag: string;
  preview: string; remove: string; first: string; up: string; down: string; last: string; filename: string; merge: string;
  reset: string; merging: string; done: string; download: string; previous: string; next: string; close: string; page: string;
  minFiles: string; limits: string; invalidPdf: string; encrypted: string; parseFailed: string; fileLarge: string;
  tooManyFiles: string; totalLarge: string; pagesLarge: string; resultMismatch: string; mergeFailed: string; adding: string;
};

const copy: Record<Locale, Copy> = {
  ko: { addTitle:"PDF 파일 추가",addDesc:"두 개 이상의 PDF를 선택하거나 이 영역에 끌어다 놓으세요.",choose:"PDF 선택",local:"브라우저 로컬 처리 · 서버 업로드 없음",files:"파일",pages:"총 페이지",total:"총 용량",drag:"드래그하여 순서 변경",preview:"페이지 미리보기",remove:"삭제",first:"맨앞",up:"위",down:"아래",last:"맨뒤",filename:"결과 파일명",merge:"PDF 합치기",reset:"전체 초기화",merging:"PDF를 합치는 중입니다.",done:"병합 완료",download:"PDF 다운로드",previous:"이전",next:"다음",close:"닫기",page:"페이지",minFiles:"PDF는 두 개 이상 필요합니다.",limits:"서비스 한도: 최대 20개 · 파일당 30MB · 총 100MB · 총 300페이지.",invalidPdf:"PDF 서명이 확인되지 않습니다.",encrypted:"암호화되었거나 이 도구에서 읽을 수 없는 PDF입니다.",parseFailed:"PDF를 읽지 못했습니다.",fileLarge:"파일당 한도 30MB를 초과했습니다.",tooManyFiles:"파일 수 한도 20개를 초과했습니다.",totalLarge:"총 입력 한도 100MB를 초과했습니다.",pagesLarge:"총 페이지 한도 300페이지를 초과했습니다.",resultMismatch:"결과 PDF 페이지 수가 예상과 달라 다운로드를 중단했습니다.",mergeFailed:"PDF 병합에 실패했습니다. 입력 목록은 유지됩니다.",adding:"PDF를 확인하는 중입니다." },
  en: { addTitle:"Add PDF files",addDesc:"Choose at least two PDFs or drop them into this area.",choose:"Choose PDFs",local:"Browser-local processing · no server upload",files:"Files",pages:"Total pages",total:"Total size",drag:"Drag to reorder",preview:"Page preview",remove:"Remove",first:"First",up:"Up",down:"Down",last:"Last",filename:"Output filename",merge:"Merge PDF",reset:"Reset all",merging:"Merging PDF files.",done:"Merge complete",download:"Download PDF",previous:"Previous",next:"Next",close:"Close",page:"Page",minFiles:"At least two PDFs are required.",limits:"Service limits: 20 files · 30MB each · 100MB total · 300 pages total.",invalidPdf:"A valid PDF signature was not found.",encrypted:"This PDF is encrypted or cannot be read by this tool.",parseFailed:"The PDF could not be read.",fileLarge:"The 30MB per-file limit was exceeded.",tooManyFiles:"The 20-file limit was exceeded.",totalLarge:"The 100MB total-input limit was exceeded.",pagesLarge:"The 300-page total limit was exceeded.",resultMismatch:"The generated PDF page count did not match the expected result, so download was stopped.",mergeFailed:"PDF merge failed. Your input list has been kept.",adding:"Checking PDF files." },
  ja: { addTitle:"PDFファイルを追加",addDesc:"2つ以上のPDFを選択するか、このエリアへドロップしてください。",choose:"PDFを選択",local:"ブラウザ内処理 · サーバーアップロードなし",files:"ファイル",pages:"総ページ",total:"総容量",drag:"ドラッグして並べ替え",preview:"ページプレビュー",remove:"削除",first:"先頭",up:"上",down:"下",last:"末尾",filename:"出力ファイル名",merge:"PDFを結合",reset:"すべて初期化",merging:"PDFを結合しています。",done:"結合完了",download:"PDFをダウンロード",previous:"前へ",next:"次へ",close:"閉じる",page:"ページ",minFiles:"PDFは2つ以上必要です。",limits:"サービス上限: 最大20ファイル・1ファイル30MB・合計100MB・合計300ページ。",invalidPdf:"有効なPDFシグネチャを確認できません。",encrypted:"暗号化されているか、このツールで読み取れないPDFです。",parseFailed:"PDFを読み取れませんでした。",fileLarge:"1ファイル30MBの上限を超えています。",tooManyFiles:"20ファイルの上限を超えています。",totalLarge:"合計100MBの上限を超えています。",pagesLarge:"合計300ページの上限を超えています。",resultMismatch:"生成PDFのページ数が予想と一致しないため、ダウンロードを停止しました。",mergeFailed:"PDF結合に失敗しました。入力リストは保持されています。",adding:"PDFを確認しています。" },
};

async function getPdfJs() {
  // Reuse the same package entry already validated by TOOL027 so API and worker stay on one version.
  return await import("pdfjs-dist/webpack.mjs");
}

async function renderPageBlobUrl(file: File, pageNumber: number, maxWidth = 420): Promise<string> {
  const pdfjs = await getPdfJs();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data: bytes });
  const doc = await task.promise;
  try {
    const page = await doc.getPage(pageNumber);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(2, Math.max(.6, maxWidth / Math.max(base.width, 1)));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("CANVAS_CONTEXT_UNAVAILABLE");
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("THUMBNAIL_BLOB_FAILED")), "image/png"));
    return URL.createObjectURL(blob);
  } finally {
    await doc.destroy();
  }
}

function errorText(error: unknown, t: Copy): string {
  const text = error instanceof Error ? error.message : String(error);
  if (/encrypt|password/i.test(text)) return t.encrypted;
  return t.parseFailed;
}

export function MergePdfTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState<PdfItem[]>([]);
  const itemsRef = useRef<PdfItem[]>([]);
  const [filename, setFilename] = useState("merged.pdf");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [workspaceDragging, setWorkspaceDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ResultState>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewThumbs, setPreviewThumbs] = useState<Array<string | null>>([]);
  const previewItem = items.find((item) => item.id === previewId) ?? null;

  itemsRef.current = items;
  useEffect(() => () => {
    for (const item of itemsRef.current) if (item.thumbnailUrl) URL.revokeObjectURL(item.thumbnailUrl);
  }, []);
  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);

  const totals = useMemo(() => ({
    bytes: items.reduce((sum, item) => sum + item.file.size, 0),
    pages: items.reduce((sum, item) => sum + item.pageCount, 0),
  }), [items]);

  const clearResult = useCallback(() => {
    setResult((current) => { if (current?.url) URL.revokeObjectURL(current.url); return null; });
    setProgress(0);
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    if (!files.length || busy) return;
    clearResult();
    setStatus(t.adding);
    const newErrors: string[] = [];
    let working = [...itemsRef.current];
    let byteTotal = working.reduce((sum, item) => sum + item.file.size, 0);
    let pageTotal = working.reduce((sum, item) => sum + item.pageCount, 0);
    for (const file of files) {
      if (working.length >= TOOL028_SERVICE_LIMITS.maxFiles) { newErrors.push(`${file.name}: ${t.tooManyFiles}`); continue; }
      if (file.size > TOOL028_SERVICE_LIMITS.maxFileBytes) { newErrors.push(`${file.name}: ${t.fileLarge}`); continue; }
      if (!canAcceptByteTotal(byteTotal, file.size)) { newErrors.push(`${file.name}: ${t.totalLarge}`); continue; }
      if (!(await hasPdfSignature(file))) { newErrors.push(`${file.name}: ${t.invalidPdf}`); continue; }
      try {
        const sourceBytes = new Uint8Array(await file.arrayBuffer());
        const pdf = await PDFDocument.load(sourceBytes, { updateMetadata: false });
        const pageCount = pdf.getPageCount();
        if (pageCount < 1) throw new Error("EMPTY_PDF");
        if (pageTotal + pageCount > TOOL028_SERVICE_LIMITS.maxTotalPages) { newErrors.push(`${file.name}: ${t.pagesLarge}`); continue; }
        let thumbnailUrl: string | null = null;
        try { thumbnailUrl = await renderPageBlobUrl(file, 1, 300); } catch { /* merge eligibility is independent of preview rendering */ }
        working.push({ id: `${Date.now()}-${crypto.randomUUID()}`, file, pageCount, thumbnailUrl });
        byteTotal += file.size;
        pageTotal += pageCount;
      } catch (error) {
        newErrors.push(`${file.name}: ${errorText(error, t)}`);
      }
    }
    setItems(working);
    itemsRef.current = working;
    setErrors(newErrors);
    setStatus("");
    if (inputRef.current) inputRef.current.value = "";
  }, [busy, clearResult, t]);

  const move = useCallback((from: number, to: number) => {
    if (busy) return;
    clearResult();
    setItems((current) => {
      const next = moveItem(current, from, to);
      itemsRef.current = next;
      return next;
    });
  }, [busy, clearResult]);

  const remove = useCallback((index: number) => {
    if (busy) return;
    clearResult();
    setItems((current) => {
      const target = current[index];
      if (target?.thumbnailUrl) URL.revokeObjectURL(target.thumbnailUrl);
      if (target?.id === previewId) setPreviewId(null);
      const next = current.filter((_, i) => i !== index);
      itemsRef.current = next;
      return next;
    });
  }, [busy, clearResult, previewId]);

  const reset = useCallback(() => {
    if (busy) return;
    for (const item of itemsRef.current) if (item.thumbnailUrl) URL.revokeObjectURL(item.thumbnailUrl);
    clearResult();
    setItems([]); itemsRef.current = [];
    setErrors([]); setStatus(""); setFilename("merged.pdf"); setPreviewId(null); setPreviewPage(1);
    if (inputRef.current) inputRef.current.value = "";
  }, [busy, clearResult]);

  const merge = useCallback(async () => {
    if (busy) return;
    const ordered = [...itemsRef.current];
    if (ordered.length < TOOL028_MIN_FILES) { setErrors([t.minFiles]); return; }
    setBusy(true); setErrors([]); clearResult(); setStatus(t.merging); setProgress(2);
    try {
      const output = await PDFDocument.create();
      let expectedPages = 0;
      for (let index = 0; index < ordered.length; index++) {
        const item = ordered[index];
        const bytes = new Uint8Array(await item.file.arrayBuffer());
        const source = await PDFDocument.load(bytes, { updateMetadata: false });
        const indices = source.getPageIndices();
        const pages = await output.copyPages(source, indices);
        for (const page of pages) output.addPage(page);
        expectedPages += indices.length;
        setProgress(Math.min(88, Math.max(5, Math.round(((index + 1) / ordered.length) * 86))));
      }
      setProgress(92);
      const saved = await output.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
      const verified = await PDFDocument.load(saved, { updateMetadata: false });
      const actualPages = verified.getPageCount();
      if (actualPages !== expectedPages) throw new Error("RESULT_PAGE_COUNT_MISMATCH");
      const blob = new Blob([saved.slice().buffer], { type: "application/pdf" });
      const safeName = normalizePdfFilename(filename);
      const url = URL.createObjectURL(blob);
      setResult({ url, filename: safeName, bytes: blob.size, pages: actualPages });
      setFilename(safeName);
      setProgress(100); setStatus(t.done);
    } catch (error) {
      const msg = error instanceof Error && error.message === "RESULT_PAGE_COUNT_MISMATCH" ? t.resultMismatch : `${t.mergeFailed} ${errorText(error, t)}`;
      setErrors([msg]); setStatus(""); setProgress(0);
    } finally { setBusy(false); }
  }, [busy, clearResult, filename, t]);

  useEffect(() => {
    if (!previewItem) { setPreviewThumbs([]); return; }
    let cancelled = false;
    const generated: string[] = [];
    setPreviewThumbs(Array(previewItem.pageCount).fill(null));
    const run = async () => {
      let doc: any = null;
      try {
        const pdfjs = await getPdfJs();
        const data = new Uint8Array(await previewItem.file.arrayBuffer());
        const task = pdfjs.getDocument({ data });
        doc = await task.promise;
        const concurrency = Math.max(1, TOOL028_SERVICE_LIMITS.previewConcurrency);
        for (let start = 1; start <= doc.numPages && !cancelled; start += concurrency) {
          const pageNumbers = Array.from({ length: Math.min(concurrency, doc.numPages - start + 1) }, (_, offset) => start + offset);
          const batch = await Promise.all(pageNumbers.map(async (pageNumber) => {
            const page = await doc!.getPage(pageNumber);
            const base = page.getViewport({ scale: 1 });
            const viewport = page.getViewport({ scale: Math.min(1, 118 / Math.max(base.width, 1)) });
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.ceil(viewport.width)); canvas.height = Math.max(1, Math.ceil(viewport.height));
            const ctx = canvas.getContext("2d", { alpha: false });
            if (!ctx) return null;
            await page.render({ canvas, canvasContext: ctx, viewport }).promise;
            if (cancelled) return null;
            const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PREVIEW_THUMB_BLOB_FAILED")), "image/png"));
            return { pageNumber, url: URL.createObjectURL(blob) };
          }));
          for (const rendered of batch) {
            if (!rendered || cancelled) { if (rendered) URL.revokeObjectURL(rendered.url); continue; }
            generated.push(rendered.url);
            setPreviewThumbs((current) => { const next = [...current]; next[rendered.pageNumber - 1] = rendered.url; return next; });
          }
        }
      } catch { /* page-strip preview failure does not invalidate merging */ }
      finally { if (doc) await doc.destroy().catch(() => undefined); }
    };
    void run();
    return () => { cancelled = true; for (const url of generated) URL.revokeObjectURL(url); };
  }, [previewItem]);

  useEffect(() => {
    if (!previewItem || !previewCanvasRef.current) return;
    let cancelled = false;
    const run = async () => {
      try {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;
        const pdfjs = await getPdfJs();
        const data = new Uint8Array(await previewItem.file.arrayBuffer());
        const task = pdfjs.getDocument({ data });
        const doc = await task.promise;
        try {
          const page = await doc.getPage(previewPage);
          const base = page.getViewport({ scale: 1 });
          const target = Math.min(900, Math.max(320, window.innerWidth - 90));
          const scale = Math.min(2, target / Math.max(base.width, 1));
          const viewport = page.getViewport({ scale });
          if (cancelled) return;
          canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) return;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        } finally { await doc.destroy(); }
      } catch { /* card parse already reported; preview failure is non-destructive */ }
    };
    void run();
    return () => { cancelled = true; };
  }, [previewItem, previewPage]);

  function dropPdfFiles(event: DragEvent<HTMLElement>) {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    setDragging(false);
    setWorkspaceDragging(false);
    if (!busy) void addFiles(Array.from(event.dataTransfer.files));
  }

  const hasItems = items.length > 0;
  const dragActive = dragging || workspaceDragging;

  return <div
    className={styles.wrapper}
    data-testid="tool028-root"
    data-max-files={TOOL028_SERVICE_LIMITS.maxFiles}
    data-max-file-bytes={TOOL028_SERVICE_LIMITS.maxFileBytes}
    data-max-total-bytes={TOOL028_SERVICE_LIMITS.maxTotalBytes}
    data-max-total-pages={TOOL028_SERVICE_LIMITS.maxTotalPages}
    data-preview-concurrency={TOOL028_SERVICE_LIMITS.previewConcurrency}
  >
    <div className={styles.localNote}><strong>LOCAL</strong><span>{t.local}</span></div>
    <div
      className={`${styles.dropzone} ${hasItems ? styles.dropzoneReady : ""} ${dragActive ? styles.dragging : ""}`}
      onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setDragging(true); } }}
      onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setDragging(true); } }}
      onDragLeave={(e) => { const next = e.relatedTarget as Node | null; if (!next || !e.currentTarget.contains(next)) setDragging(false); }}
      onDrop={dropPdfFiles}
      data-drag-active={dragActive ? "true" : "false"}
      data-testid="tool028-dropzone"
    >
      <h2>{t.addTitle}</h2><p>{t.addDesc}</p>
      <button className={styles.primary} type="button" disabled={busy} onClick={() => inputRef.current?.click()}>{items.length ? t.addTitle : t.choose}</button>
      <input ref={inputRef} className={styles.hidden} type="file" accept={TOOL028_ACCEPT} multiple aria-label={t.choose} data-testid="tool028-file-input" onChange={(e) => void addFiles(Array.from(e.currentTarget.files ?? []))} />
    </div>
    <p className={styles.limitNote}>{t.limits}</p>
    {status && <p className={styles.status} role="status" aria-live="polite" data-testid="tool028-status">{status}</p>}
    {errors.length > 0 && <div className={styles.error} role="alert" aria-live="assertive" data-testid="tool028-error">{errors.map((item) => <div key={item}>{item}</div>)}</div>}
    <div className={styles.summary} data-testid="tool028-summary"><div><span>{t.files}</span><strong data-testid="tool028-file-count">{items.length}</strong></div><div><span>{t.pages}</span><strong data-testid="tool028-page-count">{totals.pages}</strong></div><div><span>{t.total}</span><strong data-testid="tool028-byte-total">{formatBytes(totals.bytes)}</strong></div></div>
    {hasItems && <div
      className={`${styles.workspace} ${dragActive ? styles.workspaceDragging : ""}`}
      data-testid="tool028-workspace"
      data-drop-target="pdf-add"
      data-drag-active={dragActive ? "true" : "false"}
      onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setWorkspaceDragging(true); } }}
      onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setWorkspaceDragging(true); } }}
      onDragLeave={(e) => { const next = e.relatedTarget as Node | null; if (!next || !e.currentTarget.contains(next)) setWorkspaceDragging(false); }}
      onDrop={dropPdfFiles}
    >
    <div className={styles.fileList} data-testid="tool028-file-list">
      {items.map((item, index) => <article
        key={item.id}
        className={styles.fileCard}
        onDragOver={(e) => { if (!Array.from(e.dataTransfer.types).includes("Files")) e.preventDefault(); }}
        onDrop={(e) => {
          if (Array.from(e.dataTransfer.types).includes("Files")) return;
          e.preventDefault();
          const from = Number(e.dataTransfer.getData("text/tool028-index"));
          if (Number.isInteger(from)) move(from, index);
        }}
        data-testid="tool028-file-card"
      >
        <div className={styles.orderRail}><div className={styles.order} aria-label={`${index + 1}`}>{index + 1}</div><button className={styles.dragHandle} type="button" draggable={!busy} disabled={busy} onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/tool028-index", String(index)); }} aria-label={`${t.drag}: ${item.file.name}`}>⋮⋮</button></div>
        <div className={styles.thumbnail}>{item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" /> : <span>PDF</span>}</div>
        <div className={styles.fileInfo}><h3 title={item.file.name}>{item.file.name}</h3><p>{item.pageCount} {t.page} · {formatBytes(item.file.size)}</p></div>
        <div className={styles.fileActions}><div className={styles.moveGrid} aria-label={`${item.file.name} order controls`}><button className={styles.moveButton} type="button" disabled={busy || index === 0} onClick={() => move(index, 0)} aria-label={`${t.first}: ${item.file.name}`}>{t.first}</button><button className={styles.moveButton} type="button" disabled={busy || index === 0} onClick={() => move(index, index - 1)} aria-label={`${t.up}: ${item.file.name}`}>{t.up}</button><button className={styles.moveButton} type="button" disabled={busy || index === items.length - 1} onClick={() => move(index, index + 1)} aria-label={`${t.down}: ${item.file.name}`}>{t.down}</button><button className={styles.moveButton} type="button" disabled={busy || index === items.length - 1} onClick={() => move(index, items.length - 1)} aria-label={`${t.last}: ${item.file.name}`}>{t.last}</button></div><div className={styles.fileActionRow}><button className={styles.iconButton} type="button" disabled={busy} onClick={() => { setPreviewId(item.id); setPreviewPage(1); }}>{t.preview}</button><button className={`${styles.iconButton} ${styles.danger}`} type="button" disabled={busy} onClick={() => remove(index)} aria-label={`${t.remove}: ${item.file.name}`}>{t.remove}</button></div></div>
      </article>)}
    </div>
    <div className={styles.controls}><label className={styles.filename}><span>{t.filename}</span><input data-testid="tool028-filename" value={filename} maxLength={140} disabled={busy} onCompositionEnd={(e) => setFilename(e.currentTarget.value)} onChange={(e) => setFilename(e.target.value)} /></label><div className={styles.mergeActions}><button className={styles.ghost} type="button" disabled={busy || items.length === 0} onClick={reset}>{t.reset}</button><button className={styles.primary} type="button" disabled={busy || items.length < TOOL028_MIN_FILES} onClick={() => void merge()} data-testid="tool028-merge-button">{busy ? t.merging : t.merge}</button></div></div>
    {progress > 0 && <div className={styles.progress} aria-label={`${progress}%`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} data-testid="tool028-progress"><span style={{ width: `${progress}%` }} /></div>}
    {result && <section className={styles.result} data-testid="tool028-result"><div><h3>{t.done}</h3><p><strong>{result.filename}</strong> · {result.pages} {t.page} · {formatBytes(result.bytes)}</p></div><a className={styles.download} href={result.url} download={result.filename} data-testid="tool028-download">{t.download}</a></section>}
    </div>}
    {previewItem && <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setPreviewId(null); }}><section className={styles.previewDialog} role="dialog" aria-modal="true" aria-label={`${t.preview}: ${previewItem.file.name}`} data-testid="tool028-preview-dialog"><div className={styles.dialogHead}><h3 title={previewItem.file.name}>{previewItem.file.name}</h3><button className={styles.iconButton} type="button" onClick={() => setPreviewId(null)}>{t.close}</button></div><div className={styles.previewBody}><div className={styles.previewThumbRail} aria-label={t.preview} data-testid="tool028-preview-thumbnails">{previewThumbs.map((url, index) => <button key={index} type="button" className={`${styles.previewThumb} ${previewPage === index + 1 ? styles.previewThumbActive : ""}`} onClick={() => setPreviewPage(index + 1)} aria-label={`${t.page} ${index + 1}`}>{url ? <img src={url} alt="" /> : <span>{index + 1}</span>}<small>{index + 1}</small></button>)}</div><div className={styles.canvasArea}><canvas ref={previewCanvasRef} data-testid="tool028-preview-canvas" /></div></div><div className={styles.dialogFoot}><span>{t.page} {previewPage} / {previewItem.pageCount}</span><div className={styles.dialogNav}><button className={styles.secondary} type="button" disabled={previewPage <= 1} onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}>{t.previous}</button><button className={styles.secondary} type="button" disabled={previewPage >= previewItem.pageCount} onClick={() => setPreviewPage((p) => Math.min(previewItem.pageCount, p + 1))}>{t.next}</button></div></div></section></div>}
  </div>;
}
