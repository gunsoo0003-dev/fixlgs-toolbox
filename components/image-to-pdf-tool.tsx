"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Locale } from "@/lib/site";
import { StableMobileImageFileInput } from "@/components/stable-mobile-image-file-input";
import styles from "./image-to-pdf-tool.module.css";
import {
  PDF_LIMIT_DISPLAY,
  PDF_LIMITS,
  buildPdfFromJpegs,
  containBox,
  resolvePageBox,
  safePdfFilename,
  type PdfOrientation,
  type PdfPageSize,
} from "@/lib/tool-026-pdf";

type StableMobileOriginalInfo = { name: string; size: number; type: string; lastModified: number };
type StableMobileOwnedFile = File & { __stableMobileOriginalInfo?: StableMobileOriginalInfo };
type Item = { id: string; file: File; name: string; size: number; width: number; height: number; url: string };

const t = {
  ko: {
    drop: "JPG·PNG 이미지를 여기에 놓으세요",
    drop2: "한 장 또는 여러 장을 선택할 수 있습니다. 파일은 브라우저 안에서만 처리됩니다.",
    ready: "이미지를 더 추가하거나 작업 영역에 놓으세요.",
    choose: "이미지 선택",
    add: "이미지 추가",
    images: "이미지 순서",
    clear: "전체 삭제",
    settings: "PDF 설정",
    page: "페이지 크기",
    orientation: "방향",
    portrait: "세로",
    landscape: "가로",
    auto: "자동",
    margin: "여백",
    filename: "파일명",
    preview: "페이지 미리보기",
    create: "PDF 만들기",
    creating: "PDF 생성 중",
    download: "PDF 다운로드",
    again: "다시 생성",
    reset: "전체 초기화",
    remove: "삭제",
    tooMany: `이미지는 최대 ${PDF_LIMITS.maxFiles}장까지 사용할 수 있습니다.`,
    tooLarge: `파일당 최대 ${PDF_LIMIT_DISPLAY.maxFileMiB}MB까지 사용할 수 있습니다.`,
    totalLarge: `전체 입력 용량은 최대 ${PDF_LIMIT_DISPLAY.maxTotalMiB}MB입니다.`,
    pixels: `한 이미지당 최대 ${PDF_LIMIT_DISPLAY.maxPixelsMP}MP입니다.`,
    bad: "손상되었거나 지원하지 않는 JPG·PNG 파일입니다.",
    empty: "이미지를 한 장 이상 선택하세요.",
    done: "PDF 생성 완료",
    pages: "페이지",
    local: "LOCAL",
    result: "결과",
    progress: "처리",
    noMargin: "없음",
  },
  en: {
    drop: "Drop JPG or PNG images here",
    drop2: "Choose one or multiple images. Files stay in your browser.",
    ready: "Add more images or drop them anywhere in this workspace.",
    choose: "Choose Images",
    add: "Add Images",
    images: "Image order",
    clear: "Remove all",
    settings: "PDF settings",
    page: "Page size",
    orientation: "Orientation",
    portrait: "Portrait",
    landscape: "Landscape",
    auto: "Auto",
    margin: "Margin",
    filename: "Filename",
    preview: "Page preview",
    create: "Create PDF",
    creating: "Creating PDF",
    download: "Download PDF",
    again: "Create again",
    reset: "Reset all",
    remove: "Remove",
    tooMany: `Up to ${PDF_LIMITS.maxFiles} images are supported.`,
    tooLarge: `Each file must be ${PDF_LIMIT_DISPLAY.maxFileMiB}MB or smaller.`,
    totalLarge: `Total input size must be ${PDF_LIMIT_DISPLAY.maxTotalMiB}MB or smaller.`,
    pixels: `Each image must be ${PDF_LIMIT_DISPLAY.maxPixelsMP}MP or smaller.`,
    bad: "This JPG or PNG file is damaged or unsupported.",
    empty: "Choose at least one image.",
    done: "PDF created",
    pages: "pages",
    local: "LOCAL",
    result: "Result",
    progress: "Progress",
    noMargin: "None",
  },
  ja: {
    drop: "JPG・PNG画像をここにドロップ",
    drop2: "1枚または複数枚を選択できます。ファイルはブラウザ内でのみ処理されます。",
    ready: "画像を追加するか、ワークスペースにドロップしてください。",
    choose: "画像を選択",
    add: "画像を追加",
    images: "画像の順番",
    clear: "すべて削除",
    settings: "PDF設定",
    page: "ページサイズ",
    orientation: "向き",
    portrait: "縦向き",
    landscape: "横向き",
    auto: "自動",
    margin: "余白",
    filename: "ファイル名",
    preview: "ページプレビュー",
    create: "PDFを作成",
    creating: "PDF作成中",
    download: "PDFをダウンロード",
    again: "再作成",
    reset: "すべて初期化",
    remove: "削除",
    tooMany: `画像は最大${PDF_LIMITS.maxFiles}枚までです。`,
    tooLarge: `1ファイル${PDF_LIMIT_DISPLAY.maxFileMiB}MBまでです。`,
    totalLarge: `合計入力容量は${PDF_LIMIT_DISPLAY.maxTotalMiB}MBまでです。`,
    pixels: `1画像${PDF_LIMIT_DISPLAY.maxPixelsMP}MPまでです。`,
    bad: "破損しているか未対応のJPG・PNGです。",
    empty: "画像を1枚以上選択してください。",
    done: "PDF作成完了",
    pages: "ページ",
    local: "LOCAL",
    result: "結果",
    progress: "処理",
    noMargin: "なし",
  },
} as const;

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const bytes = (n: number) => n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

function originalInfo(file: File): StableMobileOriginalInfo {
  const owned = file as StableMobileOwnedFile;
  return owned.__stableMobileOriginalInfo ?? {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };
}

async function signatureOk(file: File) {
  const b = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a;
  return jpeg || png;
}

async function decodeDimensions(file: File) {
  if (!(await signatureOk(file))) throw new Error("bad");
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try { return { width: bitmap.width, height: bitmap.height }; }
  finally { bitmap.close(); }
}

async function fileToJpeg(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    canvas.width = 1;
    canvas.height = 1;
    if (!blob) throw new Error("jpeg");
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

export function ImageToPdfTool({ locale }: { locale: Locale }) {
  const c = t[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [pageSize, setPageSize] = useState<PdfPageSize>("a4");
  const [orientation, setOrientation] = useState<PdfOrientation>("auto");
  const [margin, setMargin] = useState(10);
  const [filename, setFilename] = useState("image-to-pdf");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [dragging, setDragging] = useState(false);
  const [workspaceDragging, setWorkspaceDragging] = useState(false);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.size, 0), [items]);

  useEffect(() => () => {
    itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
  }, []);

  const resetResult = () => { setPdf(null); setProgress(0); setStatus(""); };

  async function addFiles(list: FileList | File[]) {
    setError("");
    resetResult();
    const incoming = Array.from(list);
    if (!incoming.length) return;
    if (itemsRef.current.length + incoming.length > PDF_LIMITS.maxFiles) { setError(c.tooMany); return; }

    let running = itemsRef.current.reduce((sum, item) => sum + item.size, 0);
    const next: Item[] = [];
    const fail = (message: string) => {
      next.forEach((item) => URL.revokeObjectURL(item.url));
      setError(message);
    };

    for (const file of incoming) {
      const source = originalInfo(file);
      if (source.size > PDF_LIMITS.maxFileBytes) { fail(c.tooLarge); return; }
      running += source.size;
      if (running > PDF_LIMITS.maxTotalBytes) { fail(c.totalLarge); return; }
      try {
        const dimensions = await decodeDimensions(file);
        if (dimensions.width * dimensions.height > PDF_LIMITS.maxPixelsPerFile) { fail(c.pixels); return; }
        next.push({
          id: uid(),
          file,
          name: source.name,
          size: source.size,
          width: dimensions.width,
          height: dimensions.height,
          url: URL.createObjectURL(file),
        });
      } catch {
        fail(c.bad);
        return;
      }
    }
    setItems((prev) => [...prev, ...next]);
  }

  function remove(id: string) {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.id !== id);
    });
    resetResult();
  }

  function move(id: string, to: number) {
    setItems((prev) => {
      const from = prev.findIndex((item) => item.id === id);
      if (from < 0) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
      return next;
    });
    resetResult();
  }

  function clear() {
    itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    setItems([]);
    setError("");
    resetResult();
  }

  function reset() {
    clear();
    setPageSize("a4");
    setOrientation("auto");
    setMargin(10);
    setFilename("image-to-pdf");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function createPdf() {
    if (!items.length) { setError(c.empty); return; }
    setError("");
    setStatus(c.creating);
    setProgress(0);
    try {
      const pages = [];
      for (let i = 0; i < items.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        const item = items[i];
        const jpg = await fileToJpeg(item.file);
        const page = resolvePageBox(pageSize, orientation, jpg.width, jpg.height);
        const box = containBox(page.width, page.height, margin, jpg.width, jpg.height);
        pages.push({ jpeg: jpg.bytes, pixelWidth: jpg.width, pixelHeight: jpg.height, pageWidth: page.width, pageHeight: page.height, x: box.x, y: box.y, drawWidth: box.width, drawHeight: box.height });
        setProgress(i + 1);
      }
      const out = buildPdfFromJpegs(pages);
      setPdf(new Blob([out], { type: "application/pdf" }));
      setStatus(c.done);
    } catch {
      setPdf(null);
      setError(c.bad);
      setStatus("");
    }
  }

  function download() {
    if (!pdf) return;
    const url = URL.createObjectURL(pdf);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = safePdfFilename(filename);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function dropFiles(e: DragEvent<HTMLElement>) {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    e.preventDefault();
    setDragging(false);
    setWorkspaceDragging(false);
    void addFiles(e.dataTransfer.files);
  }

  const hasItems = items.length > 0;
  const dragActive = dragging || workspaceDragging;

  return <div
    className={styles.wrapper}
    data-testid="tool026-root"
    data-max-files={PDF_LIMITS.maxFiles}
    data-max-file-bytes={PDF_LIMITS.maxFileBytes}
    data-max-total-bytes={PDF_LIMITS.maxTotalBytes}
    data-max-pixels={PDF_LIMITS.maxPixelsPerFile}
    data-max-margin-mm={PDF_LIMITS.maxMarginMm}
  >
    <div className={styles.localNote}><strong>{c.local}</strong><span>{c.drop2}</span></div>

    <StableMobileImageFileInput
      ref={inputRef}
      className={styles.hidden}
      data-testid="tool026-file-input"
      type="file"
      accept="image/jpeg,image/png,.jpg,.jpeg,.png"
      multiple
      mobileCaptureMode="pixels"
      onChange={(e) => {
        if (e.currentTarget.files) void addFiles(e.currentTarget.files);
        e.currentTarget.value = "";
      }}
    />

    <section
      className={`${styles.dropzone} ${hasItems ? styles.dropzoneReady : ""} ${dragActive ? styles.dragging : ""}`}
      data-testid="tool026-dropzone"
      onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); setDragging(true); } }}
      onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); setDragging(true); } }}
      onDragLeave={(e) => { const next = e.relatedTarget as Node | null; if (!next || !e.currentTarget.contains(next)) setDragging(false); }}
      onDrop={dropFiles}
    >
      <h2>{c.drop}</h2>
      <p>{hasItems ? c.ready : c.drop2}</p>
      <button type="button" className={styles.primary} onClick={() => inputRef.current?.click()}>{hasItems ? c.add : c.choose}</button>
    </section>

    {error && <div className={styles.error} role="alert" aria-live="assertive" data-testid="tool026-error">{error}</div>}

    <div className={styles.summary} data-testid="tool026-summary">
      <span className={styles.pill} data-testid="tool026-count">{items.length} / {PDF_LIMITS.maxFiles}</span>
      <span className={styles.pill} data-testid="tool026-total">{bytes(total)} / {PDF_LIMIT_DISPLAY.maxTotalMiB} MB</span>
      <span className={styles.pill}>{items.length} {c.pages}</span>
      <span className={styles.pill}>{c.local}</span>
    </div>

    {hasItems && <div
      className={`${styles.workspace} ${workspaceDragging ? styles.workspaceDragging : ""}`}
      data-testid="tool026-workspace-dropzone"
      onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); setWorkspaceDragging(true); } }}
      onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); setWorkspaceDragging(true); } }}
      onDragLeave={(e) => { const next = e.relatedTarget as Node | null; if (!next || !e.currentTarget.contains(next)) setWorkspaceDragging(false); }}
      onDrop={dropFiles}
    >
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div><p>01 · IMAGES</p><h2>{c.images}</h2></div>
          <div className={styles.panelActions}><button type="button" className={styles.secondary} onClick={() => inputRef.current?.click()}>＋ {c.add}</button><button type="button" className={styles.textBtn} onClick={clear}>{c.clear}</button></div>
        </div>
        <div className={styles.list} data-testid="tool026-list">{items.map((item, index) => <article
          key={item.id}
          className={styles.item}
          draggable
          data-testid="tool026-item"
          onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/tool026-id", item.id); }}
          onDragOver={(e) => { if (!Array.from(e.dataTransfer.types).includes("Files")) e.preventDefault(); }}
          onDrop={(e) => {
            if (Array.from(e.dataTransfer.types).includes("Files")) return;
            e.preventDefault();
            const id = e.dataTransfer.getData("text/tool026-id");
            if (id) move(id, index);
          }}
        >
          <img className={styles.thumb} src={item.url} alt="" />
          <div className={styles.itemMeta}><strong title={item.name}>{index + 1}. {item.name}</strong><span>{item.width}×{item.height} · {bytes(item.size)}</span></div>
          <div className={styles.move}>
            <button type="button" aria-label={`${c.images} ${index + 1} first`} disabled={index === 0} onClick={() => move(item.id, 0)}>⇤</button>
            <button type="button" aria-label={`${c.images} ${index + 1} up`} disabled={index === 0} onClick={() => move(item.id, index - 1)}>↑</button>
            <button type="button" aria-label={`${c.images} ${index + 1} down`} disabled={index === items.length - 1} onClick={() => move(item.id, index + 1)}>↓</button>
            <button type="button" aria-label={`${c.images} ${index + 1} last`} disabled={index === items.length - 1} onClick={() => move(item.id, items.length - 1)}>⇥</button>
            <button type="button" className={styles.delete} aria-label={`${c.remove} ${index + 1}`} onClick={() => remove(item.id)}>×</button>
          </div>
        </article>)}</div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}><div><p>02 · PDF SETTINGS</p><h2>{c.settings}</h2></div></div>
        <div className={styles.settings}>
          <div className={styles.field}><label htmlFor="tool026-page">{c.page}</label><select id="tool026-page" data-testid="tool026-page-size" value={pageSize} onChange={(e) => { setPageSize(e.target.value as PdfPageSize); resetResult(); }}><option value="a4">A4 · 210×297mm</option><option value="letter">Letter · 8.5×11in</option></select></div>
          <div className={styles.field}><label htmlFor="tool026-orientation">{c.orientation}</label><select id="tool026-orientation" data-testid="tool026-orientation" value={orientation} onChange={(e) => { setOrientation(e.target.value as PdfOrientation); resetResult(); }}><option value="auto">{c.auto}</option><option value="portrait">{c.portrait}</option><option value="landscape">{c.landscape}</option></select></div>
          <div className={styles.field}><label htmlFor="tool026-margin">{c.margin} · {margin}mm</label><div className={styles.presets}>{[0, 5, 10, 20].map((value) => <button type="button" key={value} data-active={margin === value} onClick={() => { setMargin(value); resetResult(); }}>{value === 0 ? c.noMargin : `${value}mm`}</button>)}</div><div className={styles.marginRow}><input id="tool026-margin" data-testid="tool026-margin-range" type="range" min="0" max={PDF_LIMITS.maxMarginMm} value={margin} onChange={(e) => { setMargin(Number(e.target.value)); resetResult(); }} /><input aria-label={`${c.margin} value`} data-testid="tool026-margin-number" type="number" min="0" max={PDF_LIMITS.maxMarginMm} value={margin} onChange={(e) => { setMargin(Math.max(0, Math.min(PDF_LIMITS.maxMarginMm, Number(e.target.value) || 0))); resetResult(); }} /></div></div>
          <div className={styles.field}><label htmlFor="tool026-name">{c.filename}</label><input id="tool026-name" data-testid="tool026-filename" value={filename} maxLength={120} onChange={(e) => setFilename(e.target.value)} /></div>
          <div className={styles.actions}><button type="button" className={styles.primary} data-testid="tool026-create" disabled={status === c.creating} onClick={() => void createPdf()}>{pdf ? c.again : c.create}</button><button type="button" className={styles.secondary} data-testid="tool026-reset-all" onClick={reset}>{c.reset}</button></div>
          <div className={styles.status} role="status" data-testid="tool026-status" aria-live="polite">{status}{status === c.creating ? ` · ${progress}/${items.length}` : ""}</div>
          {pdf && <div className={styles.result} data-testid="tool026-result"><div><strong>{c.result}</strong><span data-testid="tool026-result-meta">{items.length} {c.pages} · {bytes(pdf.size)}</span></div><button type="button" className={styles.primary} data-testid="tool026-download" onClick={download}>{c.download}</button></div>}
        </div>
      </section>
    </div>}

    {hasItems && <section className={`${styles.panel} ${styles.previewPanel}`} data-testid="tool026-preview-panel">
      <div className={styles.panelHead}><div><p>03 · PAGE PREVIEW</p><h2>{c.preview}</h2></div><span className={styles.pill}>{items.length} {c.pages}</span></div>
      <div className={styles.previewWrap}>{items.map((item, index) => {
        const page = resolvePageBox(pageSize, orientation, item.width, item.height);
        return <div key={item.id} className={styles.pagePreview} data-testid="tool026-page-preview" data-landscape={page.orientation === "landscape"}><span className={styles.pageNo}>{index + 1}</span><img src={item.url} alt="" style={{ padding: `${Math.min(22, margin / 2)}%` }} /></div>;
      })}</div>
    </section>}
  </div>;
}
