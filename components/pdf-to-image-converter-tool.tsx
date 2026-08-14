"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Locale } from "@/lib/site";
import { createStoredZip } from "@/lib/zip";
import {
  parseTool027PageRange,
  safeTool027BaseName,
  TOOL027_LIMIT_DISPLAY,
  TOOL027_LIMITS,
  tool027OutputName,
} from "@/lib/tool-027-pdf-image";
import styles from "./pdf-to-image-converter-tool.module.css";

type Format = "jpg" | "png";
type PdfDocument = any;
type PdfLoadingTask = any;
type PdfRenderTask = any;
type Result = { page: number; blob: Blob; width: number; height: number; name: string };
type PasswordState = "closed" | "required" | "incorrect";

const copy = {
  ko: {
    local: "PDF와 결과 이미지는 서버로 전송하거나 저장하지 않고 현재 브라우저에서 처리됩니다.",
    drop: "PDF 파일을 놓거나 선택하세요",
    dropReady: "다른 PDF로 교체하거나 여기에 놓으세요",
    dropLead: "PDF 한 개를 선택하면 페이지 미리보기와 변환 설정이 열립니다.",
    select: "PDF 파일 선택",
    replace: "새 PDF 선택",
    fileSummary: (name: string, pages: number, size: string) => `${name} · ${pages}페이지 · ${size}`,
    pages: "페이지 선택",
    all: "모두 선택",
    none: "선택 해제",
    range: "페이지 범위 예: 1-3,5,8",
    apply: "범위 적용",
    selected: "선택됨",
    format: "출력 형식",
    resolution: "해상도",
    standard: "표준 · 1.5x",
    sharp: "선명 · 2.0x",
    high: "고해상도 · 3.0x",
    advanced: "고급 설정",
    quality: "JPG 품질",
    customScale: "사용자 지정 렌더 배율",
    scaleHelp: "1.0x~3.0x. 실제 결과 픽셀 수가 함께 증가합니다.",
    convert: "선택 페이지 변환",
    cancel: "변환 취소",
    reset: "전체 초기화",
    download: "다운로드",
    zip: "ZIP 저장",
    results: "변환 결과",
    failedPages: "실패 페이지",
    loaded: (n: number) => `${n}페이지 PDF를 불러왔습니다.`,
    working: (done: number, total: number, page: number) => `${done}/${total} · ${page}페이지 변환 중`,
    done: (n: number) => `${n}개 결과가 준비되었습니다.`,
    cancelled: "변환을 취소했습니다. 지금까지 완료된 결과는 유지됩니다.",
    invalid: "PDF 파일을 확인할 수 없습니다. 손상되었거나 PDF 형식이 아닐 수 있습니다.",
    large: `PDF는 ${TOOL027_LIMIT_DISPLAY.maxFileMiB}MB 이하만 지원합니다.`,
    tooMany: `PDF는 최대 ${TOOL027_LIMIT_DISPLAY.maxPages}페이지까지 지원합니다.`,
    badRange: "페이지 범위를 확인하세요. 예: 1-3,5,8",
    selectOne: "변환할 페이지를 하나 이상 선택하세요.",
    partial: "일부 페이지 변환에 실패했지만 성공한 결과는 유지했습니다.",
    previewLimit: `페이지가 많은 문서는 앞 ${TOOL027_LIMITS.thumbnailPages}페이지만 미리보기를 만들고 나머지는 페이지 번호로 선택할 수 있습니다.`,
    passwordTitle: "PDF 비밀번호 입력",
    passwordRequired: "이 PDF를 열려면 비밀번호가 필요합니다. 비밀번호는 브라우저 밖으로 전송되지 않습니다.",
    passwordIncorrect: "비밀번호가 맞지 않습니다. 다시 입력하세요.",
    passwordPlaceholder: "PDF 비밀번호",
    passwordApply: "PDF 열기",
    passwordCancel: "취소",
    canvasLimit: "이 페이지는 선택한 해상도에서 브라우저 안전 범위를 넘습니다. 더 낮은 해상도로 다시 시도하세요.",
    zipFailed: "ZIP 생성에 실패했습니다. 개별 결과는 그대로 다운로드할 수 있습니다.",
    previewPage: (n: number) => `${n}페이지 미리보기`,
  },
  en: {
    local: "The PDF and result images stay in your browser and are not uploaded or stored on a server.",
    drop: "Drop or choose a PDF",
    dropReady: "Replace the PDF or drop another one here",
    dropLead: "Choose one PDF to open page previews and conversion settings.",
    select: "Choose PDF",
    replace: "Choose another PDF",
    fileSummary: (name: string, pages: number, size: string) => `${name} · ${pages} pages · ${size}`,
    pages: "Select pages",
    all: "Select all",
    none: "Clear selection",
    range: "Page range e.g. 1-3,5,8",
    apply: "Apply range",
    selected: "Selected",
    format: "Output format",
    resolution: "Resolution",
    standard: "Standard · 1.5x",
    sharp: "Sharp · 2.0x",
    high: "High · 3.0x",
    advanced: "Advanced settings",
    quality: "JPG quality",
    customScale: "Custom render scale",
    scaleHelp: "1.0x–3.0x. Higher values create more output pixels.",
    convert: "Convert selected pages",
    cancel: "Cancel conversion",
    reset: "Reset all",
    download: "Download",
    zip: "Download ZIP",
    results: "Conversion results",
    failedPages: "Failed pages",
    loaded: (n: number) => `Loaded a ${n}-page PDF.`,
    working: (done: number, total: number, page: number) => `${done}/${total} · converting page ${page}`,
    done: (n: number) => `${n} results are ready.`,
    cancelled: "Conversion was cancelled. Completed results were kept.",
    invalid: "This PDF could not be opened. It may be damaged or not be a valid PDF.",
    large: `PDF files must be ${TOOL027_LIMIT_DISPLAY.maxFileMiB}MB or smaller.`,
    tooMany: `Up to ${TOOL027_LIMIT_DISPLAY.maxPages} PDF pages are supported.`,
    badRange: "Check the page range. Example: 1-3,5,8",
    selectOne: "Select at least one page to convert.",
    partial: "Some pages failed, but successful results were kept.",
    previewLimit: `For long documents, thumbnails are rendered for the first ${TOOL027_LIMITS.thumbnailPages} pages; the rest stay selectable by page number.`,
    passwordTitle: "Enter PDF password",
    passwordRequired: "This PDF needs a password. The password never leaves your browser.",
    passwordIncorrect: "That password did not work. Try again.",
    passwordPlaceholder: "PDF password",
    passwordApply: "Open PDF",
    passwordCancel: "Cancel",
    canvasLimit: "This page would exceed the browser-safe canvas range at the selected resolution. Try a lower resolution.",
    zipFailed: "ZIP creation failed. Individual results are still available for download.",
    previewPage: (n: number) => `Preview of page ${n}`,
  },
  ja: {
    local: "PDFと変換後の画像はサーバーへ送信・保存せず、現在のブラウザ内で処理します。",
    drop: "PDFファイルをドロップまたは選択",
    dropReady: "別のPDFに交換するか、ここへドロップしてください",
    dropLead: "PDFを1つ選択するとページプレビューと変換設定が表示されます。",
    select: "PDFファイルを選択",
    replace: "新しいPDFを選択",
    fileSummary: (name: string, pages: number, size: string) => `${name} · ${pages}ページ · ${size}`,
    pages: "ページを選択",
    all: "すべて選択",
    none: "選択解除",
    range: "ページ範囲 例: 1-3,5,8",
    apply: "範囲を適用",
    selected: "選択済み",
    format: "出力形式",
    resolution: "解像度",
    standard: "標準 · 1.5x",
    sharp: "鮮明 · 2.0x",
    high: "高解像度 · 3.0x",
    advanced: "詳細設定",
    quality: "JPG品質",
    customScale: "カスタム描画倍率",
    scaleHelp: "1.0x～3.0x。倍率を上げると出力ピクセル数も増えます。",
    convert: "選択したページを変換",
    cancel: "変換をキャンセル",
    reset: "すべてリセット",
    download: "ダウンロード",
    zip: "ZIPでダウンロード",
    results: "変換結果",
    failedPages: "失敗ページ",
    loaded: (n: number) => `${n}ページのPDFを読み込みました。`,
    working: (done: number, total: number, page: number) => `${done}/${total} · ${page}ページを変換中`,
    done: (n: number) => `${n}件の結果を準備しました。`,
    cancelled: "変換をキャンセルしました。完了済みの結果は保持されています。",
    invalid: "PDFを開けませんでした。破損しているか、PDF形式ではない可能性があります。",
    large: `PDFは${TOOL027_LIMIT_DISPLAY.maxFileMiB}MB以下にしてください。`,
    tooMany: `PDFは最大${TOOL027_LIMIT_DISPLAY.maxPages}ページまで対応します。`,
    badRange: "ページ範囲を確認してください。例: 1-3,5,8",
    selectOne: "変換するページを1つ以上選択してください。",
    partial: "一部ページは失敗しましたが、成功した結果は保持しました。",
    previewLimit: `ページ数が多い場合、先頭${TOOL027_LIMITS.thumbnailPages}ページのみサムネイルを作成し、残りはページ番号で選択できます。`,
    passwordTitle: "PDFパスワードを入力",
    passwordRequired: "このPDFを開くにはパスワードが必要です。パスワードはブラウザ外へ送信されません。",
    passwordIncorrect: "パスワードが正しくありません。もう一度入力してください。",
    passwordPlaceholder: "PDFパスワード",
    passwordApply: "PDFを開く",
    passwordCancel: "キャンセル",
    canvasLimit: "選択した解像度ではブラウザの安全なキャンバス範囲を超えます。低い解像度で再試行してください。",
    zipFailed: "ZIPの作成に失敗しました。個別の結果はそのままダウンロードできます。",
    previewPage: (n: number) => `${n}ページのプレビュー`,
  },
} as const;

function formatMiB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 1 : 2)} MB`;
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function canvasBlob(canvas: HTMLCanvasElement, format: Format, quality: number) {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("ENCODE_FAILED")),
      format === "jpg" ? "image/jpeg" : "image/png",
      format === "jpg" ? quality : undefined,
    );
  });
}

async function getPdfJs() {
  // pdfjs-dist/webpack.mjs keeps the API and worker on the same package version.
  // The webpack entry currently ships without a declaration file that Next.js build resolves.
  return await import("pdfjs-dist/webpack.mjs");
}

export function PdfToImageConverterTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<PdfDocument | null>(null);
  const loadingTaskRef = useRef<PdfLoadingTask | null>(null);
  const renderTaskRef = useRef<PdfRenderTask | null>(null);
  const passwordUpdaterRef = useRef<((value: string) => void) | null>(null);
  const thumbnailTokenRef = useRef(0);
  const cancelledRef = useRef(false);
  const thumbsRef = useRef<Record<number, string>>({});
  const resultsRef = useRef<Result[]>([]);

  const [dragging, setDragging] = useState(false);
  const [workspaceDragging, setWorkspaceDragging] = useState(false);
  const [doc, setDoc] = useState<PdfDocument | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [range, setRange] = useState("");
  const [format, setFormat] = useState<Format>("jpg");
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(0.9);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [failed, setFailed] = useState<number[]>([]);
  const [passwordState, setPasswordState] = useState<PasswordState>("closed");
  const [password, setPassword] = useState("");

  useEffect(() => { thumbsRef.current = thumbs; }, [thumbs]);
  useEffect(() => { resultsRef.current = results; }, [results]);
  useEffect(() => {
    return () => {
      thumbnailTokenRef.current += 1;
      cancelledRef.current = true;
      try { renderTaskRef.current?.cancel?.(); } catch {}
      try { loadingTaskRef.current?.destroy?.(); } catch {}
      try { docRef.current?.destroy?.(); } catch {}
      Object.values(thumbsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const pageCount = doc?.numPages ?? 0;
  const selectedPages = useMemo(() => [...selected].sort((a, b) => a - b), [selected]);

  function revokeThumbs() {
    Object.values(thumbsRef.current).forEach((url) => URL.revokeObjectURL(url));
    thumbsRef.current = {};
    setThumbs({});
  }

  function revokeResults() {
    resultsRef.current = [];
    setResults([]);
  }

  async function disposeCurrentDocument() {
    thumbnailTokenRef.current += 1;
    cancelledRef.current = true;
    try { renderTaskRef.current?.cancel?.(); } catch {}
    renderTaskRef.current = null;
    try { await loadingTaskRef.current?.destroy?.(); } catch {}
    loadingTaskRef.current = null;
    try { await docRef.current?.destroy?.(); } catch {}
    docRef.current = null;
    setDoc(null);
    setFile(null);
    revokeThumbs();
    revokeResults();
    setSelected(new Set());
    setRange("");
    setFailed([]);
    setProgress({ done: 0, total: 0 });
    setPasswordState("closed");
    setPassword("");
    passwordUpdaterRef.current = null;
  }

  async function loadPdf(nextFile: File) {
    if (busy) return;
    setIsError(false);
    setStatus("");
    if (nextFile.size > TOOL027_LIMITS.maxFileBytes) {
      setIsError(true);
      setStatus(t.large);
      return;
    }

    await disposeCurrentDocument();
    cancelledRef.current = false;

    try {
      const bytes = new Uint8Array(await nextFile.arrayBuffer());
      const signature = String.fromCharCode(...bytes.slice(0, 5));
      if (signature !== "%PDF-") throw new Error("NOT_PDF");

      const pdfjs: any = await getPdfJs();
      const loadingTask = pdfjs.getDocument({ data: bytes });
      loadingTaskRef.current = loadingTask;
      loadingTask.onPassword = (updatePassword: (value: string) => void, reason: number) => {
        passwordUpdaterRef.current = updatePassword;
        setPassword("");
        setPasswordState(reason === pdfjs.PasswordResponses?.INCORRECT_PASSWORD ? "incorrect" : "required");
      };

      const nextDoc = await loadingTask.promise;
      loadingTaskRef.current = null;
      if (nextDoc.numPages < 1 || nextDoc.numPages > TOOL027_LIMITS.maxPages) {
        await nextDoc.destroy();
        setIsError(true);
        setStatus(t.tooMany);
        setPasswordState("closed");
        return;
      }

      docRef.current = nextDoc;
      setDoc(nextDoc);
      setFile(nextFile);
      setSelected(new Set(Array.from({ length: nextDoc.numPages }, (_, index) => index + 1)));
      setPasswordState("closed");
      setPassword("");
      passwordUpdaterRef.current = null;
      setStatus(t.loaded(nextDoc.numPages));
      setIsError(false);
      void buildThumbnails(nextDoc);
    } catch (error) {
      if (cancelledRef.current) return;
      console.error("TOOL027_PDF_LOAD", error);
      loadingTaskRef.current = null;
      docRef.current = null;
      setDoc(null);
      setFile(null);
      setPasswordState("closed");
      passwordUpdaterRef.current = null;
      setIsError(true);
      setStatus(t.invalid);
    }
  }

  async function buildThumbnails(pdf: PdfDocument) {
    const token = ++thumbnailTokenRef.current;
    const next: Record<number, string> = {};
    const count = Math.min(pdf.numPages, TOOL027_LIMITS.thumbnailPages);
    for (let pageNumber = 1; pageNumber <= count; pageNumber += 1) {
      if (token !== thumbnailTokenRef.current || pdf !== docRef.current) break;
      let canvas: HTMLCanvasElement | null = null;
      try {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 0.28 });
        canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("NO_CONTEXT");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        const task = page.render({ canvasContext: context, viewport });
        await task.promise;
        const blob = await canvasBlob(canvas, "jpg", 0.72);
        if (token !== thumbnailTokenRef.current || pdf !== docRef.current) break;
        next[pageNumber] = URL.createObjectURL(blob);
        setThumbs({ ...next });
        page.cleanup?.();
      } catch {
        // A failed thumbnail does not block the page-number selector or final render.
      } finally {
        if (canvas) { canvas.width = 0; canvas.height = 0; }
      }
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    }
  }

  function applyRange() {
    try {
      const pages = parseTool027PageRange(range, pageCount);
      if (!pages.length) throw new Error("EMPTY_RANGE");
      setSelected(new Set(pages));
      setIsError(false);
      setStatus("");
    } catch {
      setIsError(true);
      setStatus(t.badRange);
    }
  }

  function togglePage(page: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(page)) next.delete(page); else next.add(page);
      return next;
    });
  }

  function cancelConversion() {
    cancelledRef.current = true;
    try { renderTaskRef.current?.cancel?.(); } catch {}
    setStatus(t.cancelled);
  }

  async function convert() {
    if (!docRef.current || !file || !selectedPages.length) {
      setIsError(true);
      setStatus(t.selectOne);
      return;
    }

    cancelledRef.current = false;
    setBusy(true);
    setIsError(false);
    setFailed([]);
    revokeResults();
    setProgress({ done: 0, total: selectedPages.length });

    const output: Result[] = [];
    const failedPages: number[] = [];
    for (let index = 0; index < selectedPages.length; index += 1) {
      if (cancelledRef.current) break;
      const pageNumber = selectedPages[index];
      setStatus(t.working(index + 1, selectedPages.length, pageNumber));
      let canvas: HTMLCanvasElement | null = null;
      try {
        const page = await docRef.current.getPage(pageNumber);
        const viewport = page.getViewport({ scale: Math.min(scale, TOOL027_LIMITS.maxScale) });
        if (viewport.width * viewport.height > TOOL027_LIMITS.maxCanvasPixels) throw new Error("CANVAS_LIMIT");
        canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("NO_CONTEXT");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        const task = page.render({ canvasContext: context, viewport });
        renderTaskRef.current = task;
        await task.promise;
        renderTaskRef.current = null;
        if (cancelledRef.current) break;
        const blob = await canvasBlob(canvas, format, quality);
        const extension: Format = format;
        const name = tool027OutputName(file.name, pageNumber, pageCount, extension);
        output.push({ page: pageNumber, blob, width: canvas.width, height: canvas.height, name });
        page.cleanup?.();
      } catch (error) {
        renderTaskRef.current = null;
        if (cancelledRef.current) break;
        console.error("TOOL027_PAGE_RENDER", pageNumber, error);
        failedPages.push(pageNumber);
        if (error instanceof Error && error.message === "CANVAS_LIMIT") {
          setStatus(t.canvasLimit);
          setIsError(true);
        }
      } finally {
        if (canvas) { canvas.width = 0; canvas.height = 0; }
      }
      resultsRef.current = [...output];
      setResults([...output]);
      setFailed([...failedPages]);
      setProgress({ done: index + 1, total: selectedPages.length });
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    }

    setBusy(false);
    renderTaskRef.current = null;
    if (cancelledRef.current) {
      setStatus(t.cancelled);
      setIsError(false);
    } else if (failedPages.length) {
      setStatus(t.partial);
      setIsError(true);
    } else {
      setStatus(t.done(output.length));
      setIsError(false);
    }
  }

  async function downloadZip() {
    if (!results.length || !file) return;
    try {
      const zip = await createStoredZip(results.map((result) => ({ name: result.name, blob: result.blob })));
      downloadBlob(zip, `${safeTool027BaseName(file.name)}-images.zip`);
    } catch (error) {
      console.error("TOOL027_ZIP", error);
      setIsError(true);
      setStatus(t.zipFailed);
    }
  }

  async function resetAll() {
    await disposeCurrentDocument();
    setBusy(false);
    setFormat("jpg");
    setScale(2);
    setQuality(0.9);
    setIsError(false);
    setStatus("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function dropPdf(event: DragEvent<HTMLElement>) {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    setDragging(false);
    setWorkspaceDragging(false);
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) void loadPdf(nextFile);
  }

  function chooseFile() {
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  }

  function submitPassword() {
    if (!password || !passwordUpdaterRef.current) return;
    const updater = passwordUpdaterRef.current;
    passwordUpdaterRef.current = null;
    updater(password);
  }

  const dropReady = Boolean(doc && file);
  const dragActive = dragging || workspaceDragging;

  return (
    <div
      className={styles.wrapper}
      data-testid="tool027-root"
      data-max-file-bytes={TOOL027_LIMITS.maxFileBytes}
      data-max-pages={TOOL027_LIMITS.maxPages}
      data-max-scale={TOOL027_LIMITS.maxScale}
      data-max-canvas-pixels={TOOL027_LIMITS.maxCanvasPixels}
    >
      <div className={styles.localNote}><strong>LOCAL</strong><span>{t.local}</span></div>

      <section
        className={`${styles.dropzone} ${dropReady ? styles.dropzoneReady : ""} ${dragActive ? styles.dragging : ""}`}
        data-testid="tool027-dropzone"
        onDragEnter={(event) => { if (Array.from(event.dataTransfer.types).includes("Files")) { event.preventDefault(); setDragging(true); } }}
        onDragOver={(event) => { if (Array.from(event.dataTransfer.types).includes("Files")) { event.preventDefault(); setDragging(true); } }}
        onDragLeave={(event) => { const next = event.relatedTarget as Node | null; if (!next || !event.currentTarget.contains(next)) setDragging(false); }}
        onDrop={dropPdf}
      >
        <h2>{dropReady ? t.dropReady : t.drop}</h2>
        <p>{dropReady && file ? t.fileSummary(file.name, pageCount, formatMiB(file.size)) : t.dropLead}</p>
        <button className={styles.uploadAction} type="button" onClick={chooseFile}>{dropReady ? t.replace : t.select}</button>
        <input
          ref={inputRef}
          className={styles.hidden}
          data-testid="tool027-file-input"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => {
            const nextFile = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (nextFile) void loadPdf(nextFile);
          }}
        />
      </section>

      {passwordState !== "closed" && (
        <section className={styles.passwordBox} data-testid="tool027-password-box">
          <div><strong>{t.passwordTitle}</strong><p>{passwordState === "incorrect" ? t.passwordIncorrect : t.passwordRequired}</p></div>
          <input
            type="password"
            aria-label={t.passwordTitle}
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") submitPassword(); }}
          />
          <div className={styles.passwordActions}>
            <button className={styles.primary} type="button" onClick={submitPassword} disabled={!password}>{t.passwordApply}</button>
            <button className={styles.secondary} type="button" onClick={() => void resetAll()}>{t.passwordCancel}</button>
          </div>
        </section>
      )}

      {status && (
        <p className={`${styles.status} ${isError ? styles.error : ""}`} role={isError ? "alert" : "status"} aria-live="polite" data-testid="tool027-status">
          {status}
        </p>
      )}

      {doc && file && (
        <div
          className={`${styles.workspace} ${workspaceDragging ? styles.workspaceDragging : ""}`}
          data-testid="tool027-workspace"
          data-drop-target="pdf-replace"
          onDragEnter={(event) => { if (Array.from(event.dataTransfer.types).includes("Files")) { event.preventDefault(); setWorkspaceDragging(true); } }}
          onDragOver={(event) => { if (Array.from(event.dataTransfer.types).includes("Files")) { event.preventDefault(); setWorkspaceDragging(true); } }}
          onDragLeave={(event) => { const next = event.relatedTarget as Node | null; if (!next || !event.currentTarget.contains(next)) setWorkspaceDragging(false); }}
          onDrop={dropPdf}
        >
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <div><p>PAGES</p><h2>{t.pages}</h2></div>
              <div className={styles.panelActions}>
                <span className={styles.pill} data-testid="tool027-selected-count">{selected.size} / {pageCount}</span>
                <button className={styles.textBtn} type="button" onClick={() => setSelected(new Set(Array.from({ length: pageCount }, (_, index) => index + 1)))}>{t.all}</button>
                <button className={styles.textBtn} type="button" onClick={() => setSelected(new Set())}>{t.none}</button>
              </div>
            </div>

            <div className={styles.rangeRow}>
              <input data-testid="tool027-range" aria-label={t.range} value={range} onChange={(event) => setRange(event.target.value)} placeholder={t.range} />
              <button className={styles.secondary} type="button" onClick={applyRange}>{t.apply}</button>
            </div>
            {pageCount > TOOL027_LIMITS.thumbnailPages && <p className={styles.note}>{t.previewLimit}</p>}

            <div className={styles.thumbs} data-testid="tool027-thumbnails">
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`${styles.thumbCard} ${selected.has(pageNumber) ? styles.selected : ""}`}
                  aria-pressed={selected.has(pageNumber)}
                  aria-label={`${pageNumber} · ${selected.has(pageNumber) ? t.selected : t.pages}`}
                  data-testid="tool027-page-card"
                  data-page={pageNumber}
                  onClick={() => togglePage(pageNumber)}
                >
                  <span className={styles.checkMark} aria-hidden="true">{selected.has(pageNumber) ? "✓" : ""}</span>
                  {thumbs[pageNumber]
                    ? <img src={thumbs[pageNumber]} alt={t.previewPage(pageNumber)} />
                    : <span className={styles.pdfPlaceholder}>PDF</span>}
                  <strong>Page {pageNumber}</strong>
                </button>
              ))}
            </div>
          </section>

          <aside className={`${styles.panel} ${styles.settings}`}>
            <div className={styles.panelHead}><div><p>OUTPUT</p><h2>{locale === "ko" ? "변환 설정" : locale === "ja" ? "変換設定" : "Conversion settings"}</h2></div></div>
            <label className={styles.field}><span>{t.format}</span><select data-testid="tool027-format" value={format} onChange={(event) => setFormat(event.target.value as Format)}><option value="jpg">JPG</option><option value="png">PNG</option></select></label>
            <label className={styles.field}><span>{t.resolution}</span><select data-testid="tool027-scale-preset" value={String(scale)} onChange={(event) => setScale(Number(event.target.value))}><option value="1.5">{t.standard}</option><option value="2">{t.sharp}</option><option value="3">{t.high}</option></select></label>
            <details className={styles.advanced}>
              <summary>{t.advanced}</summary>
              {format === "jpg" && <label className={styles.field}><span>{t.quality} · {Math.round(quality * 100)}%</span><input data-testid="tool027-quality" type="range" min="0.6" max="1" step="0.05" value={quality} onChange={(event) => setQuality(Number(event.target.value))} aria-valuemin={60} aria-valuemax={100} aria-valuenow={Math.round(quality * 100)} /></label>}
              <label className={styles.field}><span>{t.customScale} · {scale.toFixed(1)}x</span><input data-testid="tool027-custom-scale" type="range" min="1" max={TOOL027_LIMITS.maxScale} step="0.25" value={scale} onChange={(event) => setScale(Number(event.target.value))} aria-valuemin={1} aria-valuemax={TOOL027_LIMITS.maxScale} aria-valuenow={scale} /><small>{t.scaleHelp}</small></label>
            </details>
            <div className={styles.actions}>
              <button className={styles.primary} data-testid="tool027-convert" type="button" disabled={busy || selected.size === 0} onClick={() => void convert()}>{t.convert}</button>
              {busy && <button className={styles.secondary} data-testid="tool027-cancel" type="button" onClick={cancelConversion}>{t.cancel}</button>}
              <button className={styles.ghost} data-testid="tool027-reset-all" type="button" onClick={() => void resetAll()}>{t.reset}</button>
            </div>
            {progress.total > 0 && (
              <div className={styles.progressBlock}>
                <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}><span style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} /></div>
                <p>{progress.done} / {progress.total}</p>
              </div>
            )}
          </aside>
        </div>
      )}

      {results.length > 0 && (
        <section className={`${styles.panel} ${styles.results}`} data-testid="tool027-results">
          <div className={styles.panelHead}>
            <div><p>RESULT</p><h2>{t.results}</h2></div>
            {results.length > 1 && <button className={styles.primary} type="button" onClick={() => void downloadZip()} data-testid="tool027-export-zip">{t.zip}</button>}
          </div>
          {failed.length > 0 && <p className={styles.failed}>{t.failedPages}: {failed.join(", ")}</p>}
          <div className={styles.resultList}>
            {results.map((result) => (
              <article className={styles.result} data-testid="tool027-result-card" data-page={result.page} key={result.page}>
                {thumbs[result.page] ? <img src={thumbs[result.page]} alt={t.previewPage(result.page)} /> : <div className={styles.resultPlaceholder} aria-hidden="true">PDF</div>}
                <div className={styles.resultMeta}><strong>{result.name}</strong><span data-testid="tool027-result-size">{result.width} × {result.height} · {formatMiB(result.blob.size)}</span></div>
                <button className={styles.secondary} data-testid="tool027-download" type="button" onClick={() => downloadBlob(result.blob, result.name)}>{t.download}</button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
