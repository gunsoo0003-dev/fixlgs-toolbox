"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, PointerEvent as ReactPointerEvent } from "react";
import type { Locale } from "@/lib/site";
import {
  TOOL032_LIMITS,
  TOOL032_LIMIT_DISPLAY,
  applyTool032Signature,
  clampPlacement,
  inspectTool032Pdf,
  placementHeightRatio,
  resolveTool032Pages,
  safeTool032Filename,
  visiblePageSize,
  type Tool032PageScope,
  type Tool032Placement,
  type Tool032SignatureAsset,
} from "@/lib/tool-032-pdf-signature";
import styles from "./pdf-signature-tool.module.css";

type PdfDoc = any;
type AssetState = Tool032SignatureAsset & { url: string };
type Mode = "draw" | "image";
type Gesture = {
  kind: "move" | "resize";
  pointerId: number;
  startX: number;
  startY: number;
  start: Tool032Placement;
  rect: DOMRect;
} | null;

const toBlobPart = (bytes: Uint8Array): ArrayBuffer => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

const copy = {
  ko: {
    local: "PDF와 서명 데이터는 서버로 전송하거나 저장하지 않고 현재 브라우저에서 처리됩니다.",
    drop: "PDF 파일을 놓거나 선택하세요", dropReady: "다른 PDF로 교체하거나 여기에 놓으세요",
    lead: "PDF 한 개를 선택하면 서명 만들기와 배치 화면이 열립니다.", choose: "PDF 파일 선택", replace: "새 PDF 선택",
    draw: "서명 그리기", image: "서명 이미지", signature: "서명 만들기", clear: "지우기", redraw: "다시 그리기",
    pen: "펜 두께", color: "펜 색상", black: "검정", blue: "파랑", thin: "얇게", normal: "보통", thick: "굵게",
    imageChoose: "서명 이미지 선택", imageHelp: "PNG·JPG·WebP. 스마트폰 사진 방향을 정상화하고 투명 PNG alpha를 유지합니다.",
    preview: "배치 미리보기", page: "페이지", prev: "이전", next: "다음", position: "위치", size: "크기",
    undo: "실행 취소", redo: "다시 실행", rotate: "서명 회전", placementHelp: "미리보기의 서명을 드래그하거나 모서리 핸들로 크기를 조절할 수 있습니다.",
    scope: "적용 페이지", current: "현재 페이지", all: "전체 페이지", odd: "홀수 페이지", even: "짝수 페이지", custom: "사용자 지정", previewApplied: "현재 페이지에 서명이 적용됩니다.", previewExcluded: "현재 페이지는 적용 대상이 아닙니다.",
    range: "예: 1-3,5,8-10", filename: "결과 파일명", create: "서명 PDF 만들기", creating: "PDF 생성 중", download: "PDF 다운로드",
    keepEditing: "계속 편집", reset: "전체 초기화", newPdf: "새 PDF", result: "결과", applied: "적용 페이지", pages: "페이지",
    noPdf: "PDF를 먼저 선택하세요.", badPdf: "손상되었거나 지원하지 않는 PDF입니다. 암호화·권한 제한 PDF는 처리하지 않습니다.",
    largePdf: `PDF는 ${TOOL032_LIMIT_DISPLAY.maxPdfMiB}MB 이하만 지원합니다.`, tooManyPages: `PDF는 최대 ${TOOL032_LIMIT_DISPLAY.maxPages}페이지까지 지원합니다.`,
    noSignature: "서명을 직접 그리거나 서명 이미지를 선택하세요.", emptyDraw: "빈 서명은 사용할 수 없습니다.", strokeLimit: `서명 입력은 최대 ${TOOL032_LIMIT_DISPLAY.maxStrokePoints.toLocaleString()}개 포인트까지 지원합니다.`,
    imageLarge: `서명 이미지는 ${TOOL032_LIMIT_DISPLAY.maxSignatureMiB}MB 이하만 지원합니다.`, imagePixels: `서명 이미지는 최대 ${TOOL032_LIMIT_DISPLAY.maxSignatureMP}MP까지 지원합니다.`, imageBad: "지원하지 않거나 손상된 서명 이미지입니다.",
    badRange: "페이지 범위를 확인하세요. 예: 1-3,5,8-10", created: (n: number) => `서명 PDF를 생성하고 ${n}개 적용 페이지를 확인했습니다.`,
    working: (done: number, total: number, page: number) => `${done}/${total} · ${page}페이지에 서명 적용 중`,
    loaded: (name: string, pages: number) => `${name} · ${pages}페이지`,
    visualOnly: "이 도구는 보이는 서명 그래픽을 추가합니다. 인증서·PKI 기반 디지털 서명이나 법적 효력을 보장하지 않습니다.",
    posNames: ["왼쪽 위", "가운데 위", "오른쪽 위", "왼쪽 가운데", "정중앙", "오른쪽 가운데", "왼쪽 아래", "가운데 아래", "오른쪽 아래"],
  },
  en: {
    local: "Your PDF and signature data stay in the current browser and are not uploaded or stored on a server.",
    drop: "Drop or choose a PDF file", dropReady: "Replace the PDF or drop another one here", lead: "Choose one PDF to open signature creation and placement.", choose: "Choose PDF", replace: "Choose another PDF",
    draw: "Draw signature", image: "Signature image", signature: "Create signature", clear: "Clear", redraw: "Draw again",
    pen: "Pen width", color: "Pen color", black: "Black", blue: "Blue", thin: "Thin", normal: "Normal", thick: "Thick",
    imageChoose: "Choose signature image", imageHelp: "PNG, JPG, or WebP. Smartphone orientation is normalized and transparent PNG alpha is preserved.",
    preview: "Placement preview", page: "Page", prev: "Previous", next: "Next", position: "Position", size: "Size",
    undo: "Undo", redo: "Redo", rotate: "Signature rotation", placementHelp: "Drag the signature on the preview or resize it with the corner handle.",
    scope: "Apply to pages", current: "Current page", all: "All pages", odd: "Odd pages", even: "Even pages", custom: "Custom range", previewApplied: "The signature will be applied to this page.", previewExcluded: "This page is not included in the selected scope.",
    range: "e.g. 1-3,5,8-10", filename: "Output filename", create: "Create signed PDF", creating: "Creating PDF", download: "Download PDF",
    keepEditing: "Keep editing", reset: "Reset all", newPdf: "New PDF", result: "Result", applied: "Applied pages", pages: "pages",
    noPdf: "Choose a PDF first.", badPdf: "This PDF is damaged or unsupported. Encrypted or permission-restricted PDFs are not processed.",
    largePdf: `PDF files must be ${TOOL032_LIMIT_DISPLAY.maxPdfMiB}MB or smaller.`, tooManyPages: `Up to ${TOOL032_LIMIT_DISPLAY.maxPages} pages are supported.`,
    noSignature: "Draw a signature or choose a signature image.", emptyDraw: "An empty signature cannot be used.", strokeLimit: `Drawing supports up to ${TOOL032_LIMIT_DISPLAY.maxStrokePoints.toLocaleString()} points.`,
    imageLarge: `Signature images must be ${TOOL032_LIMIT_DISPLAY.maxSignatureMiB}MB or smaller.`, imagePixels: `Signature images must be ${TOOL032_LIMIT_DISPLAY.maxSignatureMP}MP or smaller.`, imageBad: "This signature image is damaged or unsupported.",
    badRange: "Check the page range, for example 1-3,5,8-10.", created: (n: number) => `Created the PDF and verified ${n} applied pages.`, working: (done: number, total: number, page: number) => `${done}/${total} · Applying signature to page ${page}`,
    loaded: (name: string, pages: number) => `${name} · ${pages} pages`, visualOnly: "This tool adds a visible signature graphic. It does not create a certificate/PKI digital signature or guarantee legal validity.",
    posNames: ["Top left", "Top center", "Top right", "Middle left", "Center", "Middle right", "Bottom left", "Bottom center", "Bottom right"],
  },
  ja: {
    local: "PDFと署名データはサーバーへ送信・保存せず、現在のブラウザ内で処理します。",
    drop: "PDFファイルをドロップまたは選択", dropReady: "別のPDFに交換するか、ここへドロップ", lead: "PDFを1つ選ぶと署名作成と配置画面が開きます。", choose: "PDFを選択", replace: "別のPDFを選択",
    draw: "署名を描く", image: "署名画像", signature: "署名を作成", clear: "クリア", redraw: "描き直す",
    pen: "ペンの太さ", color: "ペン色", black: "黒", blue: "青", thin: "細い", normal: "標準", thick: "太い",
    imageChoose: "署名画像を選択", imageHelp: "PNG・JPG・WebP。スマートフォン写真の向きを補正し、透過PNGのalphaを維持します。",
    preview: "配置プレビュー", page: "ページ", prev: "前へ", next: "次へ", position: "配置", size: "サイズ",
    undo: "元に戻す", redo: "やり直す", rotate: "署名の回転", placementHelp: "プレビュー上の署名をドラッグし、角のハンドルでサイズを調整できます。",
    scope: "適用ページ", current: "現在のページ", all: "すべてのページ", odd: "奇数ページ", even: "偶数ページ", custom: "ページ指定", previewApplied: "現在のページに署名が適用されます。", previewExcluded: "現在のページは適用対象ではありません。",
    range: "例: 1-3,5,8-10", filename: "出力ファイル名", create: "署名PDFを作成", creating: "PDF作成中", download: "PDFをダウンロード",
    keepEditing: "編集を続ける", reset: "リセット", newPdf: "新しいPDF", result: "結果", applied: "適用ページ", pages: "ページ",
    noPdf: "先にPDFを選択してください。", badPdf: "破損または未対応のPDFです。暗号化・権限制限PDFは処理しません。",
    largePdf: `PDFは${TOOL032_LIMIT_DISPLAY.maxPdfMiB}MB以下にしてください。`, tooManyPages: `PDFは最大${TOOL032_LIMIT_DISPLAY.maxPages}ページまで対応します。`,
    noSignature: "署名を描くか署名画像を選択してください。", emptyDraw: "空の署名は使用できません。", strokeLimit: `署名入力は最大${TOOL032_LIMIT_DISPLAY.maxStrokePoints.toLocaleString()}ポイントまでです。`,
    imageLarge: `署名画像は${TOOL032_LIMIT_DISPLAY.maxSignatureMiB}MB以下にしてください。`, imagePixels: `署名画像は最大${TOOL032_LIMIT_DISPLAY.maxSignatureMP}MPまでです。`, imageBad: "未対応または破損した署名画像です。",
    badRange: "ページ範囲を確認してください。例: 1-3,5,8-10", created: (n: number) => `署名PDFを作成し、${n}ページへの適用を確認しました。`, working: (done: number, total: number, page: number) => `${done}/${total}・${page}ページに署名を適用中`,
    loaded: (name: string, pages: number) => `${name}・${pages}ページ`, visualOnly: "このツールは見える署名画像を追加します。証明書・PKI方式のデジタル署名や法的効力を保証するものではありません。",
    posNames: ["左上", "上中央", "右上", "左中央", "中央", "右中央", "左下", "下中央", "右下"],
  },
} as const;

async function getPdfJs() { return await import("pdfjs-dist/webpack.mjs"); }

function sanitizeOutputName(value: string, fallback: string) {
  const cleaned = value.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/\s+/g, " ").slice(0, 120);
  const base = (cleaned || fallback).replace(/\.pdf$/i, "");
  return `${base || "document-signed"}.pdf`;
}

function hasExpectedImageMagic(bytes: Uint8Array, mime: string) {
  if (mime === "image/png") return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (mime === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/webp") return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function PdfSignatureTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<PdfDoc | null>(null);
  const loadingTaskRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const activeDrawPointerRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const strokePointsRef = useRef(0);
  const gestureRef = useRef<Gesture>(null);
  const historyRef = useRef<Tool032Placement[]>([{ x: 0.66, y: 0.76, width: 0.25 }]);

  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageMeta, setPageMeta] = useState<Array<{ page: number; width: number; height: number; rotation: number }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState<Mode>("draw");
  const [drawAsset, setDrawAsset] = useState<AssetState | null>(null);
  const [imageAsset, setImageAsset] = useState<AssetState | null>(null);
  const [penWidth, setPenWidth] = useState(4);
  const [penColor, setPenColor] = useState<"#111111" | "#0a66c2">("#111111");
  const [placement, setPlacement] = useState<Tool032Placement>(historyRef.current[0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [signatureRotation, setSignatureRotation] = useState(0);
  const [scope, setScope] = useState<Tool032PageScope>("current");
  const [customRange, setCustomRange] = useState("");
  const [filename, setFilename] = useState("document-signed.pdf");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dragging, setDragging] = useState(false);
  const [workspaceDragging, setWorkspaceDragging] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; pageCount: number; applied: number[]; name: string } | null>(null);
  const [previewRatio, setPreviewRatio] = useState(1 / 1.414);
  const [drawingActive, setDrawingActive] = useState(false);
  const drawAssetRef = useRef<AssetState | null>(null);
  const imageAssetRef = useRef<AssetState | null>(null);

  const activeAsset = mode === "draw" ? drawAsset : imageAsset;
  const dragActive = dragging || workspaceDragging;
  const meta = pageMeta[currentPage - 1];
  const visible = meta ? visiblePageSize(meta.width, meta.height, meta.rotation) : { width: 595, height: 842 };
  const heightRatio = activeAsset ? placementHeightRatio(placement.width, visible.width, visible.height, activeAsset.width, activeAsset.height) : 0.12;
  const safePlacement = clampPlacement(placement, heightRatio);
  const scopePages = useMemo(() => {
    try { return pageMeta.length ? resolveTool032Pages(scope, currentPage, pageMeta.length, customRange) : []; }
    catch { return []; }
  }, [scope, currentPage, pageMeta.length, customRange]);
  const previewPageApplied = scopePages.includes(currentPage);

  useEffect(() => {
    return () => {
      try { renderTaskRef.current?.cancel?.(); } catch {}
      try { loadingTaskRef.current?.destroy?.(); } catch {}
      try { pdfDocRef.current?.destroy?.(); } catch {}
      if (drawAssetRef.current?.url) URL.revokeObjectURL(drawAssetRef.current.url);
      if (imageAssetRef.current?.url) URL.revokeObjectURL(imageAssetRef.current.url);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { drawAssetRef.current = drawAsset; }, [drawAsset]);
  useEffect(() => { imageAssetRef.current = imageAsset; }, [imageAsset]);
  useEffect(() => {
    if (!file || pageMeta.length === 0 || !pdfDocRef.current) return;
    void renderPreview(currentPage);
  }, [currentPage, file, pageMeta.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const setup = () => { ensureDrawCanvasSize(canvas); };
    setup();
    window.addEventListener("resize", setup);
    return () => window.removeEventListener("resize", setup);
  }, [mode, file, pageMeta.length]);

  function setMessage(message: string, error = false) { setStatus(message); setIsError(error); }

  function commitPlacement(next: Tool032Placement) {
    const nextSafe = clampPlacement(next, heightRatio);
    const history = historyRef.current.slice(0, historyIndex + 1);
    const last = history[history.length - 1];
    if (last && Math.abs(last.x - nextSafe.x) < 0.0005 && Math.abs(last.y - nextSafe.y) < 0.0005 && Math.abs(last.width - nextSafe.width) < 0.0005) {
      setPlacement(nextSafe); return;
    }
    history.push(nextSafe);
    if (history.length > 30) history.shift();
    historyRef.current = history;
    setHistoryIndex(history.length - 1);
    setPlacement(nextSafe);
  }

  function undo() {
    if (historyIndex <= 0) return;
    const next = historyIndex - 1; setHistoryIndex(next); setPlacement(historyRef.current[next]);
  }
  function redo() {
    if (historyIndex >= historyRef.current.length - 1) return;
    const next = historyIndex + 1; setHistoryIndex(next); setPlacement(historyRef.current[next]);
  }

  async function disposePdf() {
    try { renderTaskRef.current?.cancel?.(); } catch {}
    try { await loadingTaskRef.current?.destroy?.(); } catch {}
    try { await pdfDocRef.current?.destroy?.(); } catch {}
    renderTaskRef.current = null; loadingTaskRef.current = null; pdfDocRef.current = null;
    setFile(null); setPdfBytes(null); setPageMeta([]); setCurrentPage(1); setProgress({ done: 0, total: 0 }); setResult(null);
  }

  async function loadPdf(next: File) {
    if (busy) return;
    setMessage("");
    if (next.size > TOOL032_LIMITS.maxPdfBytes) { setMessage(t.largePdf, true); return; }
    await disposePdf();
    try {
      const bytes = new Uint8Array(await next.arrayBuffer());
      if (new TextDecoder("ascii").decode(bytes.slice(0, 5)) !== "%PDF-") throw new Error("NOT_PDF");
      const inspected = await inspectTool032Pdf(bytes);
      if (inspected.length > TOOL032_LIMITS.maxPages) throw new Error("TOO_MANY");
      const pdfjs: any = await getPdfJs();
      const loadingTask = pdfjs.getDocument({ data: bytes.slice() });
      loadingTaskRef.current = loadingTask;
      const pdf = await loadingTask.promise;
      loadingTaskRef.current = null;
      if (pdf.numPages !== inspected.length) throw new Error("PAGE_MISMATCH");
      pdfDocRef.current = pdf;
      setFile(next); setPdfBytes(bytes); setPageMeta(inspected); setCurrentPage(1);
      const defaultName = safeTool032Filename(next.name);
      setFilename(defaultName); setScope("current"); setCustomRange("");
      setMessage(t.loaded(next.name, inspected.length));
    } catch (error) {
      console.error("TOOL032_PDF_LOAD", error);
      await disposePdf();
      setMessage(error instanceof Error && error.message === "TOO_MANY" ? t.tooManyPages : t.badPdf, true);
    }
  }

  async function renderPreview(pageNumber: number, explicitDoc?: PdfDoc) {
    const pdf = explicitDoc ?? pdfDocRef.current;
    const canvas = previewCanvasRef.current;
    if (!pdf || !canvas) return;
    try {
      try { renderTaskRef.current?.cancel?.(); } catch {}
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(1.6, Math.max(0.7, 900 / Math.max(base.width, base.height)));
      const viewport = page.getViewport({ scale });
      setPreviewRatio(viewport.width / viewport.height);
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("NO_CONTEXT");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
      const task = page.render({ canvasContext: context, viewport });
      renderTaskRef.current = task; await task.promise; renderTaskRef.current = null; page.cleanup?.();
    } catch (error: any) {
      if (error?.name !== "RenderingCancelledException") console.error("TOOL032_PREVIEW", error);
    }
  }

  async function createAssetFromBlob(blob: Blob, width: number, height: number): Promise<AssetState> {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return { bytes, width, height, mime: "image/png", url: URL.createObjectURL(blob) };
  }

  function ensureDrawCanvasSize(canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(220 * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      strokePointsRef.current = 0;
      lastPointRef.current = null;
    }
    return true;
  }

  async function exportDrawing(canvasOverride?: HTMLCanvasElement) {
    const canvas = canvasOverride ?? drawCanvasRef.current;
    if (!canvas || strokePointsRef.current < 2) { setDrawAsset(null); setMessage(t.emptyDraw, true); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if (image.data[(y * canvas.width + x) * 4 + 3] > 0) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
      }
    }
    if (maxX < minX || maxY < minY) { setMessage(t.emptyDraw, true); return; }
    const pad = Math.max(4, Math.round(Math.min(canvas.width, canvas.height) * 0.025));
    minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad); maxX = Math.min(canvas.width - 1, maxX + pad); maxY = Math.min(canvas.height - 1, maxY + pad);
    const crop = document.createElement("canvas"); crop.width = maxX - minX + 1; crop.height = maxY - minY + 1;
    crop.getContext("2d")?.drawImage(canvas, minX, minY, crop.width, crop.height, 0, 0, crop.width, crop.height);
    const blob = await new Promise<Blob | null>((resolve) => crop.toBlob(resolve, "image/png"));
    if (!blob) return;
    const asset = await createAssetFromBlob(blob, crop.width, crop.height);
    crop.width = 1; crop.height = 1;
    setDrawAsset((old) => { if (old?.url) URL.revokeObjectURL(old.url); return asset; });
    setMessage("");
  }

  function drawPoint(event: ReactPointerEvent<HTMLCanvasElement>, start: boolean) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const point = { x: (event.clientX - rect.left) * sx, y: (event.clientY - rect.top) * sy };
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = penColor; ctx.lineWidth = penWidth * Math.min(sx, sy);
    if (start || !lastPointRef.current) { lastPointRef.current = point; return; }
    ctx.beginPath(); ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y); ctx.lineTo(point.x, point.y); ctx.stroke();
    lastPointRef.current = point;
    strokePointsRef.current += 1;
    if (strokePointsRef.current > TOOL032_LIMITS.maxStrokePoints) { activeDrawPointerRef.current = null; setMessage(t.strokeLimit, true); }
  }

  function clearDrawing() {
    const canvas = drawCanvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    strokePointsRef.current = 0; lastPointRef.current = null; activeDrawPointerRef.current = null; setDrawingActive(false);
    setDrawAsset((old) => { if (old?.url) URL.revokeObjectURL(old.url); return null; });
    setMessage("");
  }

  async function loadSignatureImage(next: File) {
    setMessage("");
    if (next.size > TOOL032_LIMITS.maxSignatureImageBytes) { setMessage(t.imageLarge, true); return; }
    if (!/^(image\/png|image\/jpeg|image\/webp)$/i.test(next.type)) { setMessage(t.imageBad, true); return; }
    try {
      const header = new Uint8Array(await next.slice(0, 16).arrayBuffer());
      if (!hasExpectedImageMagic(header, next.type.toLowerCase())) throw new Error("MIME_MISMATCH");
      const bitmap = await createImageBitmap(next, { imageOrientation: "from-image" });
      try {
        if (bitmap.width * bitmap.height > TOOL032_LIMITS.maxSignaturePixels) { setMessage(t.imagePixels, true); return; }
        const canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("NO_CONTEXT");
        ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(bitmap, 0, 0);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        canvas.width = 1; canvas.height = 1;
        if (!blob) throw new Error("ENCODE");
        const asset = await createAssetFromBlob(blob, bitmap.width, bitmap.height);
        setImageAsset((old) => { if (old?.url) URL.revokeObjectURL(old.url); return asset; });
        setMode("image"); setMessage("");
      } finally { bitmap.close(); }
    } catch (error) { console.error("TOOL032_SIGNATURE_IMAGE", error); setMessage(t.imageBad, true); }
  }

  function applyPreset(index: number) {
    const col = index % 3, row = Math.floor(index / 3);
    const w = placement.width, h = heightRatio;
    const x = col === 0 ? 0.04 : col === 1 ? (1 - w) / 2 : 0.96 - w;
    const y = row === 0 ? 0.04 : row === 1 ? (1 - h) / 2 : 0.96 - h;
    commitPlacement({ x, y, width: w });
  }

  function startGesture(event: ReactPointerEvent<HTMLElement>, kind: "move" | "resize") {
    if (!activeAsset || !previewWrapRef.current) return;
    event.preventDefault(); event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = { kind, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, start: safePlacement, rect: previewWrapRef.current.getBoundingClientRect() };
  }

  function moveGesture(event: ReactPointerEvent<HTMLElement>) {
    const g = gestureRef.current; if (!g || g.pointerId !== event.pointerId) return;
    const dx = (event.clientX - g.startX) / Math.max(1, g.rect.width);
    const dy = (event.clientY - g.startY) / Math.max(1, g.rect.height);
    if (g.kind === "move") setPlacement(clampPlacement({ ...g.start, x: g.start.x + dx, y: g.start.y + dy }, heightRatio));
    else setPlacement(clampPlacement({ ...g.start, width: g.start.width + dx }, heightRatio));
  }

  function endGesture(event: ReactPointerEvent<HTMLElement>) {
    const g = gestureRef.current; if (!g || g.pointerId !== event.pointerId) return;
    gestureRef.current = null; commitPlacement(placement);
  }

  async function createPdf() {
    if (!file || !pdfBytes) { setMessage(t.noPdf, true); return; }
    if (!activeAsset) { setMessage(t.noSignature, true); return; }
    let pages: number[];
    try { pages = resolveTool032Pages(scope, currentPage, pageMeta.length, customRange); }
    catch { setMessage(t.badRange, true); return; }
    setBusy(true); setProgress({ done: 0, total: pages.length }); setMessage(""); setResult(null);
    try {
      const output = await applyTool032Signature({
        pdfBytes, signature: activeAsset, pages, placement: safePlacement, rotationDeg: signatureRotation,
        onProgress: (done, total, page) => { setProgress({ done, total }); setMessage(t.working(done, total, page)); },
      });
      const name = sanitizeOutputName(filename, safeTool032Filename(file.name));
      const blob = new Blob([toBlobPart(output.bytes)], { type: "application/pdf" });
      setResult({ blob, pageCount: output.pageCount, applied: output.applied, name });
      setMessage(t.created(output.applied.length)); setIsError(false);
    } catch (error) { console.error("TOOL032_CREATE", error); setMessage(t.badPdf, true); }
    finally { setBusy(false); }
  }

  async function resetAll() {
    await disposePdf(); clearDrawing();
    setDragging(false); setWorkspaceDragging(false);
    setImageAsset((old) => { if (old?.url) URL.revokeObjectURL(old.url); return null; });
    setMode("draw"); setPlacement({ x: 0.66, y: 0.76, width: 0.25 }); historyRef.current = [{ x: 0.66, y: 0.76, width: 0.25 }]; setHistoryIndex(0);
    setSignatureRotation(0); setScope("current"); setCustomRange(""); setFilename("document-signed.pdf"); setMessage(""); setBusy(false);
    if (pdfInputRef.current) pdfInputRef.current.value = ""; if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault(); setDragging(false); setWorkspaceDragging(false); const next = event.dataTransfer.files?.[0]; if (next) void loadPdf(next);
  }

  return (
    <div className={styles.wrapper} data-testid="tool032-root" data-max-pdf-bytes={TOOL032_LIMITS.maxPdfBytes} data-max-pages={TOOL032_LIMITS.maxPages} data-max-signature-bytes={TOOL032_LIMITS.maxSignatureImageBytes} data-max-signature-pixels={TOOL032_LIMITS.maxSignaturePixels} data-max-stroke-points={TOOL032_LIMITS.maxStrokePoints}>
      <div className={styles.localNote}><strong>LOCAL</strong><span>{t.local}</span></div>
      <div className={styles.visualNotice}>{t.visualOnly}</div>

      <input ref={pdfInputRef} className={styles.hidden} data-testid="tool032-file-input" type="file" accept="application/pdf,.pdf" onChange={(e) => { const next = e.currentTarget.files?.[0]; e.currentTarget.value = ""; if (next) void loadPdf(next); }} />
      {!file ? <section className={`${styles.dropzone} ${dragActive ? styles.dragging : ""}`} data-testid="tool032-dropzone" data-drag-active={dragActive ? "true" : "false"}
        onClick={() => { if (!busy) pdfInputRef.current?.click(); }}
        onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setDragging(true); } }}
        onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setDragging(true); } }}
        onDragLeave={(e) => { const next = e.relatedTarget as Node | null; if (!next || !e.currentTarget.contains(next)) setDragging(false); }} onDrop={handleDrop}>
        <h2>{t.drop}</h2><p>{t.lead}</p>
        <button className={styles.uploadAction} type="button" onClick={(e) => { e.stopPropagation(); if (pdfInputRef.current) pdfInputRef.current.value = ""; pdfInputRef.current?.click(); }}>{t.choose}</button>
      </section> : <div className={`${styles.uploadedFileBar} ${dragActive ? styles.dragging : ""}`} data-testid="tool032-file-info" data-drag-active={dragActive ? "true" : "false"}>
        <div className={styles.uploadedFileInfo}><strong>{file.name}</strong><span>{(file.size / 1048576).toFixed(2)} MB · {pageMeta.length} {t.pages}</span></div>
        <button className={styles.uploadAction} type="button" disabled={busy} onClick={() => { if (pdfInputRef.current) pdfInputRef.current.value = ""; pdfInputRef.current?.click(); }}>{t.replace}</button>
      </div>}

      {status && <p className={`${styles.status} ${isError ? styles.error : ""}`} data-testid="tool032-status" role={isError ? "alert" : "status"} aria-live="polite">{status}</p>}

      {file && pageMeta.length > 0 && <>
        <div className={`${styles.workspace} ${dragActive ? styles.workspaceDragging : ""}`} data-testid="tool032-workspace" data-drop-target="pdf-replace" data-drag-active={dragActive ? "true" : "false"}
          onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setWorkspaceDragging(true); } }}
          onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); if (!busy) setWorkspaceDragging(true); } }}
          onDragLeave={(e) => { const next = e.relatedTarget as Node | null; if (!next || !e.currentTarget.contains(next)) setWorkspaceDragging(false); }} onDrop={handleDrop}>
          <section className={styles.panel} data-testid="tool032-preview-panel">
            <div className={styles.panelHead}><div><p>PREVIEW</p><h2>{t.preview}</h2></div></div>
            <div ref={previewWrapRef} className={styles.previewWrap} style={{ aspectRatio: String(previewRatio) }} data-testid="tool032-preview-wrap">
              <canvas ref={previewCanvasRef} className={styles.previewCanvas} />
              {activeAsset && previewPageApplied && <div className={styles.signatureOverlay} data-testid="tool032-signature-overlay" style={{ left: `${safePlacement.x * 100}%`, top: `${safePlacement.y * 100}%`, width: `${safePlacement.width * 100}%`, height: `${heightRatio * 100}%`, transform: `rotate(${signatureRotation}deg)` }} onPointerDown={(e) => startGesture(e, "move")} onPointerMove={moveGesture} onPointerUp={endGesture} onPointerCancel={endGesture}>
                <img src={activeAsset.url} alt="" draggable={false} /><button type="button" aria-label={t.size} className={styles.resizeHandle} onPointerDown={(e) => startGesture(e, "resize")} onPointerMove={moveGesture} onPointerUp={endGesture} onPointerCancel={endGesture} />
              </div>}
            </div>
            {activeAsset && <p className={`${styles.previewScopeState} ${previewPageApplied ? styles.previewScopeApplied : styles.previewScopeExcluded}`} data-testid="tool032-preview-scope-state" data-applied={previewPageApplied ? "true" : "false"} aria-live="polite">{previewPageApplied ? t.previewApplied : t.previewExcluded}</p>}
            <div className={styles.previewNav}><button type="button" className={styles.secondary} disabled={currentPage <= 1} onClick={() => setCurrentPage((n) => Math.max(1, n - 1))}>{t.prev}</button><span>{t.page} {currentPage} / {pageMeta.length}</span><button type="button" className={styles.secondary} disabled={currentPage >= pageMeta.length} onClick={() => setCurrentPage((n) => Math.min(pageMeta.length, n + 1))}>{t.next}</button></div>
            <p className={styles.help}>{t.placementHelp}</p>
            <div className={styles.precisionGrid} aria-label={t.position}>{t.posNames.map((name, index) => <button key={name} type="button" className={styles.positionButton} onClick={() => applyPreset(index)} aria-label={name}>{index + 1}</button>)}</div>
            <div className={styles.settingsGrid}>
              <label>{t.size}<input data-testid="tool032-size" type="range" min={TOOL032_LIMITS.minWidthRatio * 100} max={TOOL032_LIMITS.maxWidthRatio * 100} step="1" value={Math.round(placement.width * 100)} onChange={(e) => setPlacement(clampPlacement({ ...placement, width: Number(e.target.value) / 100 }, heightRatio))} onPointerUp={() => commitPlacement(placement)} aria-valuemin={TOOL032_LIMITS.minWidthRatio * 100} aria-valuemax={TOOL032_LIMITS.maxWidthRatio * 100} aria-valuenow={Math.round(placement.width * 100)} /></label>
              <label>{t.rotate}<select value={signatureRotation} onChange={(e) => setSignatureRotation(Number(e.target.value))}><option value={-15}>-15°</option><option value={0}>0°</option><option value={15}>+15°</option></select></label>
            </div>
            <div className={styles.inlineActions}><button type="button" className={styles.secondary} disabled={historyIndex <= 0} onClick={undo}>{t.undo}</button><button type="button" className={styles.secondary} disabled={historyIndex >= historyRef.current.length - 1} onClick={redo}>{t.redo}</button></div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><div><p>032 · PDF</p><h2>{t.signature}</h2></div></div>
            <div className={styles.settings}>
              <div className={styles.group} data-testid="tool032-signature-panel">
                <div className={styles.groupHead}><h3>{t.signature}</h3></div>
                <div className={styles.segmented} role="tablist" aria-label={t.signature}>
                  <button type="button" role="tab" aria-selected={mode === "draw"} className={mode === "draw" ? styles.activeTab : ""} onClick={() => setMode("draw")}>{t.draw}</button>
                  <button type="button" role="tab" aria-selected={mode === "image"} className={mode === "image" ? styles.activeTab : ""} onClick={() => setMode("image")}>{t.image}</button>
                </div>
                {mode === "draw" ? <>
                  <div className={styles.drawControls}><label>{t.pen}<select value={penWidth} onChange={(e) => setPenWidth(Number(e.target.value))}><option value={2}>{t.thin}</option><option value={4}>{t.normal}</option><option value={7}>{t.thick}</option></select></label><label>{t.color}<select value={penColor} onChange={(e) => setPenColor(e.target.value as any)}><option value="#111111">{t.black}</option><option value="#0a66c2">{t.blue}</option></select></label></div>
                  <canvas ref={drawCanvasRef} className={`${styles.drawCanvas} ${drawingActive ? styles.drawCanvasActive : ""}`} data-testid="tool032-draw-canvas" aria-label={t.draw} onPointerDown={(e) => { if (activeDrawPointerRef.current !== null) return; e.preventDefault(); if (!ensureDrawCanvasSize(e.currentTarget)) return; setDrawingActive(true); activeDrawPointerRef.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); lastPointRef.current = null; drawPoint(e, true); }} onPointerMove={(e) => { if (activeDrawPointerRef.current === e.pointerId) { e.preventDefault(); drawPoint(e, false); } }} onPointerUp={(e) => { if (activeDrawPointerRef.current !== e.pointerId) return; e.preventDefault(); drawPoint(e, false); activeDrawPointerRef.current = null; lastPointRef.current = null; setDrawingActive(false); void exportDrawing(e.currentTarget); }} onPointerCancel={() => { activeDrawPointerRef.current = null; lastPointRef.current = null; setDrawingActive(false); }} />
                  <div className={styles.inlineActions}><button type="button" className={styles.secondary} onClick={clearDrawing}>{t.clear}</button><button type="button" className={styles.secondary} onClick={clearDrawing}>{t.redraw}</button></div>
                </> : <>
                  <button type="button" className={styles.imagePicker} onClick={() => { if (imageInputRef.current) imageInputRef.current.value = ""; imageInputRef.current?.click(); }}>{t.imageChoose}</button>
                  <input ref={imageInputRef} className={styles.hidden} data-testid="tool032-signature-input" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" onChange={(e) => { const next = e.currentTarget.files?.[0]; e.currentTarget.value = ""; if (next) void loadSignatureImage(next); }} />
                  <p className={styles.help}>{t.imageHelp}</p>{imageAsset && <div className={styles.signatureThumb}><img src={imageAsset.url} alt="" /></div>}
                </>}
              </div>

              <div className={styles.group} data-testid="tool032-output-panel">
                <div className={styles.groupHead}><h3>{t.scope}</h3><span className={styles.pill}>{scopePages.length} {t.pages}</span></div>
                <div className={styles.scopeGrid}>{(["current", "all", "odd", "even", "custom"] as Tool032PageScope[]).map((value) => <label key={value} className={scope === value ? styles.scopeActive : ""}><input type="radio" name="tool032-scope" checked={scope === value} onChange={() => setScope(value)} /><span>{value === "current" ? t.current : value === "all" ? t.all : value === "odd" ? t.odd : value === "even" ? t.even : t.custom}</span></label>)}</div>
                {scope === "custom" && <input className={styles.textInput} data-testid="tool032-range" aria-label={t.custom} placeholder={t.range} value={customRange} onChange={(e) => setCustomRange(e.target.value)} />}
                <label className={styles.field}>{t.filename}<input className={styles.textInput} data-testid="tool032-filename" value={filename} onChange={(e) => setFilename(e.target.value)} /></label>
                {busy && <div className={styles.progressBlock}><div className={styles.progress}><span style={{ width: `${progress.total ? progress.done / progress.total * 100 : 0}%` }} /></div><small>{progress.done} / {progress.total}</small></div>}
              </div>
            </div>
          </section>
        </div>
        <div className={styles.actions}><button className={styles.primary} data-testid="tool032-create" type="button" disabled={busy || !activeAsset || (scope === "custom" && !scopePages.length)} onClick={() => void createPdf()}>{busy ? t.creating : t.create}</button>{result && <button type="button" className={styles.secondary} data-testid="tool032-download" onClick={() => downloadBlob(result.blob, result.name)}>{t.download}</button>}<button type="button" className={styles.ghost} disabled={!result} onClick={() => setMessage("")}>{t.keepEditing}</button><button type="button" className={styles.ghost} onClick={() => pdfInputRef.current?.click()}>{t.newPdf}</button><button type="button" className={styles.ghost} onClick={() => void resetAll()}>{t.reset}</button></div>
        {result && <div className={styles.result} data-testid="tool032-result"><div><strong>{t.result}</strong><span>{result.name} · {result.pageCount} {t.pages} · {t.applied}: {result.applied.join(", ")}</span></div><button type="button" className={styles.primary} onClick={() => downloadBlob(result.blob, result.name)}>{t.download}</button></div>}
      </>}
    </div>
  );
}
