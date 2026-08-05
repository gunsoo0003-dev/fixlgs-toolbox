"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Locale } from "@/lib/site";
import { createStoredZip } from "@/lib/zip";

type Format = "jpg" | "png" | "webp";
type Unit = "KB" | "MB";
type Status = "ready" | "processing" | "reached" | "already" | "unreached" | "failed" | "cancelled";
type ViewMode = "split" | "original" | "result";

type Item = {
  id: string;
  file: File;
  name: string;
  format: Format;
  width: number;
  height: number;
  orientation: number;
  decoderOrientationApplied: boolean;
  previewUrl: string;
  targetValue: number;
  targetUnit: Unit;
  minQuality: number;
  minScale: number;
  allowResize: boolean;
  individual: boolean;
  status: Status;
  progress: number;
  resultBlob?: Blob;
  resultUrl?: string;
  resultName?: string;
  resultSize?: number;
  resultWidth?: number;
  resultHeight?: number;
  quality?: number;
  scale?: number;
  attempts?: number;
  reason?: "min-quality" | "min-size" | "near-target";
  acceptUnreached?: boolean;
  stage?: "analyzing" | "quality" | "resizing";
  error?: string;
};

const LIMITS = { count: 10, perFile: 15 * 1024 * 1024, total: 50 * 1024 * 1024, pixels: 30_000_000, totalPixels: 80_000_000 };
// 005 운영 안전선: 10개, 파일당 15MB, 전체 50MB, 이미지당 30MP, 전체 80MP, 품질 탐색 최대 9회.
const SAFETY_RATIO = 0.995;
const MAX_QUALITY_SEARCH = 9;
const RESIZE_STEPS = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.25];
const OXIPNG_MODULE_URL = "https://esm.sh/@jsquash/oxipng@2.3.0?bundle";
const IMAGE_Q_MODULE_URL = "https://esm.sh/image-q@4.0.0?bundle";


type OxiPngModule = { optimise: (data: ArrayBuffer | Uint8Array, options?: { level?: number }) => Promise<ArrayBuffer | Uint8Array> };
type IQPoint = { toUint8Array: () => Uint8Array };
type ImageQModule = {
  utils: { PointContainer: { fromImageData: (data: ImageData) => IQPoint } };
  buildPalette: (images: IQPoint[], options: { colors: number; colorDistanceFormula: string; paletteQuantization: string }) => Promise<unknown>;
  applyPalette: (image: IQPoint, palette: unknown, options: { colorDistanceFormula: string; imageQuantization: string }) => Promise<IQPoint>;
};
let oxipngPromise: Promise<OxiPngModule> | undefined;
let imageQPromise: Promise<ImageQModule> | undefined;
async function importRemote<T>(url: string): Promise<T> { return import(/* webpackIgnore: true */ url) as Promise<T>; }
function loadOxiPng() { return oxipngPromise ??= importRemote<OxiPngModule>(OXIPNG_MODULE_URL); }
function loadImageQ() { return imageQPromise ??= importRemote<ImageQModule>(IMAGE_Q_MODULE_URL); }

const copy = {
  ko: { drop: "이미지를 여기에 놓거나 선택하세요", choose: "이미지 선택", add: "이미지 추가", support: "JPG, PNG, WebP · 최대 10개 · 파일당 15MB", local: "파일은 서버로 전송되지 않고 브라우저에서 처리됩니다.", target: "목표 용량", apply: "모든 파일에 적용", keep: "원본 크기 유지", resize: "목표 달성을 위해 이미지 크기 축소 허용", advanced: "고급 설정", minQuality: "최소 품질", minScale: "최소 이미지 크기", compress: "목표 용량으로 압축", processing: "목표 용량에 맞춰 압축하고 있습니다.", reached: "목표 달성", already: "이미 목표 용량 이하", unreached: "목표 달성 불가", failed: "처리 실패", original: "원본", result: "결과", size: "용량", dimensions: "이미지 크기", quality: "적용 품질", compare: "원본과 비교", retry: "다시 압축", download: "다운로드", zip: "전체 ZIP 다운로드", reset: "전체 초기화", cancel: "대기 파일 취소", remove: "삭제", up: "위로", down: "아래로", originalOnly: "원본만", resultOnly: "결과만", split: "비교", close: "닫기", fit: "화면 맞춤", zoomIn: "확대", zoomOut: "축소", noFiles: "이미지를 추가하면 파일별 목표값과 결과가 여기에 표시됩니다.", invalidTarget: "목표 용량을 0보다 크게 입력하세요.", tinyTarget: "매우 작은 목표값은 원본 크기를 유지한 상태에서 달성하지 못할 수 있습니다.", localStatus: "브라우저 로컬 처리", allDone: "전체 결과", attempts: "탐색 횟수", scale: "축소 비율" },
  en: { drop: "Drop your images here or choose files", choose: "Choose Images", add: "Add Images", support: "JPG, PNG, WebP · up to 10 files · 15 MB each", local: "Your files are processed in your browser and are not uploaded to a server.", target: "Target Size", apply: "Apply to All Images", keep: "Keep Original Dimensions", resize: "Allow Image Resizing to Reach the Target", advanced: "Advanced Settings", minQuality: "Minimum Quality", minScale: "Minimum Image Size", compress: "Compress to Target Size", processing: "Compressing images to the target size...", reached: "Target Reached", already: "Already Below Target", unreached: "Target Not Reached", failed: "Processing Failed", original: "Original", result: "Result", size: "Size", dimensions: "Dimensions", quality: "Quality", compare: "Compare Quality", retry: "Compress Again", download: "Download", zip: "Download All as ZIP", reset: "Reset All", cancel: "Cancel Waiting Files", remove: "Remove", up: "Move up", down: "Move down", originalOnly: "Original only", resultOnly: "Result only", split: "Compare", close: "Close", fit: "Fit", zoomIn: "Zoom in", zoomOut: "Zoom out", noFiles: "Add images to see per-file targets and results here.", invalidTarget: "Enter a target size greater than zero.", tinyTarget: "Very small targets may not be reachable while keeping original dimensions.", localStatus: "Local browser processing", allDone: "Overall result", attempts: "Search attempts", scale: "Scale" },
  ja: { drop: "画像をここにドロップするか、ファイルを選択してください", choose: "画像を選択", add: "画像を追加", support: "JPG・PNG・WebP · 最大10件 · 1件15MB", local: "ファイルはサーバーに送信されず、ブラウザ内で処理されます。", target: "目標容量", apply: "すべての画像に適用", keep: "元の画像サイズを維持", resize: "目標達成のため画像サイズの縮小を許可", advanced: "詳細設定", minQuality: "最低画質", minScale: "最小画像サイズ", compress: "目標容量に圧縮", processing: "目標容量に合わせて圧縮しています。", reached: "目標達成", already: "すでに目標容量以下", unreached: "目標を達成できませんでした", failed: "処理失敗", original: "元画像", result: "結果", size: "容量", dimensions: "画像サイズ", quality: "適用画質", compare: "画質を比較", retry: "もう一度圧縮", download: "ダウンロード", zip: "すべてZIPでダウンロード", reset: "すべてリセット", cancel: "待機中をキャンセル", remove: "削除", up: "上へ", down: "下へ", originalOnly: "元画像のみ", resultOnly: "結果のみ", split: "比較", close: "閉じる", fit: "画面に合わせる", zoomIn: "拡大", zoomOut: "縮小", noFiles: "画像を追加すると、ファイル別の目標値と結果が表示されます。", invalidTarget: "0より大きい目標容量を入力してください。", tinyTarget: "非常に小さい目標値は、元サイズを維持したまま達成できない場合があります。", localStatus: "ブラウザ内ローカル処理", allDone: "全体結果", attempts: "探索回数", scale: "縮小率" },
} as const;

function pretty(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / 1048576).toFixed(2)} MB`; }
function targetBytes(value: number, unit: Unit) { return Math.floor(value * (unit === "KB" ? 1000 : 1_000_000) * SAFETY_RATIO); }
function ext(name: string) { return name.toLowerCase().split(".").pop() || ""; }
function detectFormat(type: string, extension: string): Format | null { if (type === "image/jpeg" || extension === "jpg" || extension === "jpeg") return "jpg"; if (type === "image/png" || extension === "png") return "png"; if (type === "image/webp" || extension === "webp") return "webp"; return null; }
function signatureMatches(buffer: ArrayBuffer, format: Format) { const b = new Uint8Array(buffer); if (format === "jpg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff; if (format === "png") return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47; return new TextDecoder().decode(b.slice(0, 4)) === "RIFF" && new TextDecoder().decode(b.slice(8, 12)) === "WEBP"; }
function isApng(buffer: ArrayBuffer) { const b = new Uint8Array(buffer); for (let i = 8; i + 8 < b.length; i++) if (String.fromCharCode(...b.slice(i + 4, i + 8)) === "acTL") return true; return false; }
function isAnimatedWebp(buffer: ArrayBuffer) { return new TextDecoder().decode(new Uint8Array(buffer).slice(12, 100)).includes("ANIM"); }
function readExifOrientation(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return 1;
  let offset = 2;
  while (offset + 4 < view.byteLength) {
    const marker = view.getUint16(offset, false); offset += 2;
    if ((marker & 0xff00) !== 0xff00) break;
    const size = view.getUint16(offset, false);
    if (marker === 0xffe1 && offset + size <= view.byteLength) {
      const start = offset + 2;
      if (view.getUint32(start, false) !== 0x45786966) return 1;
      const tiff = start + 6;
      const little = view.getUint16(tiff, false) === 0x4949;
      if (view.getUint16(tiff + 2, little) !== 0x2a) return 1;
      const ifd = tiff + view.getUint32(tiff + 4, little);
      if (ifd + 2 > view.byteLength) return 1;
      const count = view.getUint16(ifd, little);
      for (let i = 0; i < count; i++) {
        const entry = ifd + 2 + i * 12;
        if (entry + 12 > view.byteLength) break;
        if (view.getUint16(entry, little) === 0x0112) return view.getUint16(entry + 8, little) || 1;
      }
    }
    offset += Math.max(2, size);
  }
  return 1;
}
function readJpegDimensions(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return null;
  let offset = 2;
  while (offset + 9 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) { offset++; continue; }
    const marker = view.getUint8(offset + 1); offset += 2;
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > view.byteLength) break;
    const size = view.getUint16(offset, false);
    if (size < 2 || offset + size > view.byteLength) break;
    if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
      if (offset + 7 > view.byteLength) return null;
      return { width: view.getUint16(offset + 5, false), height: view.getUint16(offset + 3, false) };
    }
    offset += size;
  }
  return null;
}
function orientedSize(width: number, height: number, orientation: number) {
  return orientation >= 5 && orientation <= 8 ? { width: height, height: width } : { width, height };
}
function drawWithOrientation(ctx: CanvasRenderingContext2D, source: CanvasImageSource, width: number, height: number, orientation: number) {
  switch (orientation) {
    case 2: ctx.translate(width, 0); ctx.scale(-1, 1); break;
    case 3: ctx.translate(width, height); ctx.rotate(Math.PI); break;
    case 4: ctx.translate(0, height); ctx.scale(1, -1); break;
    case 5: ctx.rotate(Math.PI / 2); ctx.scale(1, -1); break;
    case 6: ctx.rotate(Math.PI / 2); ctx.translate(0, -height); break;
    case 7: ctx.rotate(Math.PI / 2); ctx.translate(width, -height); ctx.scale(-1, 1); break;
    case 8: ctx.rotate(-Math.PI / 2); ctx.translate(-width, 0); break;
  }
  ctx.drawImage(source, 0, 0, width, height);
}
async function loadOrientedDrawable(file: Blob) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "none" });
      return { source: bitmap as CanvasImageSource, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {}
  }
  const image = await loadImage(file);
  return { source: image as CanvasImageSource, width: image.naturalWidth, height: image.naturalHeight, close: () => {} };
}
function uniqueName(name: string, used: Set<string>) { const dot = name.lastIndexOf("."); const stem = dot >= 0 ? name.slice(0, dot) : name; const suffix = dot >= 0 ? name.slice(dot) : ""; let candidate = name; let n = 2; while (used.has(candidate.toLowerCase())) candidate = `${stem}-${n++}${suffix}`; used.add(candidate.toLowerCase()); return candidate; }
function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number) { return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error("encode")), type, quality)); }
async function loadImage(file: Blob) { const url = URL.createObjectURL(file); try { const img = new Image(); img.decoding = "async"; await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("decode")); img.src = url; }); return img; } finally { URL.revokeObjectURL(url); } }
function drawScaled(img: CanvasImageSource, width: number, height: number) { const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true }); if (!ctx) throw new Error("canvas"); ctx.drawImage(img, 0, 0, width, height); return canvas; }
function drawItemCanvas(item: Item, drawable: { source: CanvasImageSource; width: number; height: number }, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!ctx) throw new Error("canvas");
  const sourceIsAlreadyOriented = item.decoderOrientationApplied || (drawable.width === item.width && drawable.height === item.height && item.orientation >= 5 && item.orientation <= 8);
  if (item.format !== "jpg" || item.orientation === 1 || sourceIsAlreadyOriented) ctx.drawImage(drawable.source, 0, 0, width, height);
  else {
    const rawWidth = item.orientation >= 5 && item.orientation <= 8 ? height : width;
    const rawHeight = item.orientation >= 5 && item.orientation <= 8 ? width : height;
    drawWithOrientation(ctx, drawable.source, rawWidth, rawHeight, item.orientation);
  }
  return canvas;
}
async function optimizePng(blob: Blob, level = 3) { const { optimise } = await loadOxiPng(); const result = await optimise(await blob.arrayBuffer(), { level }); const output = new Uint8Array(result); return new Blob([output], { type: "image/png" }); }
async function quantizeCanvas(canvas: HTMLCanvasElement, colors: number) { const iq = await loadImageQ(); const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true }); if (!ctx) throw new Error("canvas"); const source = ctx.getImageData(0, 0, canvas.width, canvas.height); const point = iq.utils.PointContainer.fromImageData(source); const palette = await iq.buildPalette([point], { colors, colorDistanceFormula: "euclidean-bt709", paletteQuantization: "wuquant" }); const quant = await iq.applyPalette(point, palette, { colorDistanceFormula: "euclidean-bt709", imageQuantization: "floyd-steinberg" }); ctx.putImageData(new ImageData(new Uint8ClampedArray(quant.toUint8Array()), canvas.width, canvas.height), 0, 0); }

async function searchLossy(
  canvas: HTMLCanvasElement,
  mime: "image/jpeg" | "image/webp",
  target: number,
  minQuality: number,
  shouldCancel: () => boolean,
  onAttempt?: (attempt: number, max: number) => void,
) {
  let low = minQuality / 100, high = 0.98, best: { blob: Blob; quality: number } | null = null, attempts = 0;
  for (let i = 0; i < MAX_QUALITY_SEARCH; i++) {
    if (shouldCancel()) throw new DOMException("cancelled", "AbortError");
    attempts++;
    onAttempt?.(attempts, MAX_QUALITY_SEARCH + 1);
    const q = (low + high) / 2;
    const blob = await canvasBlob(canvas, mime, q);
    if (blob.size <= target) { best = { blob, quality: Math.round(q * 100) }; low = q; } else high = q;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  if (!best) {
    if (shouldCancel()) throw new DOMException("cancelled", "AbortError");
    attempts++;
    onAttempt?.(attempts, MAX_QUALITY_SEARCH + 1);
    const blob = await canvasBlob(canvas, mime, minQuality / 100);
    if (blob.size <= target) best = { blob, quality: minQuality };
    else return { blob, quality: minQuality, attempts, reached: false };
  }
  return { blob: best.blob, quality: best.quality, attempts, reached: true };
}

async function searchPng(
  canvas: HTMLCanvasElement,
  target: number,
  shouldCancel: () => boolean,
  onAttempt?: (attempt: number, max: number) => void,
) {
  const colorsList = [256, 192, 128, 96, 64, 48, 32, 24, 16];
  const maxAttempts = 2 + colorsList.length * 2;
  let attempts = 0;
  if (shouldCancel()) throw new DOMException("cancelled", "AbortError");
  const base = await canvasBlob(canvas, "image/png"); attempts++; onAttempt?.(attempts, maxAttempts);
  let best = await optimizePng(base, 3); attempts++; onAttempt?.(attempts, maxAttempts);
  if (best.size <= target) return { blob: best, quality: 100, attempts, reached: true };
  for (const colors of colorsList) {
    if (shouldCancel()) throw new DOMException("cancelled", "AbortError");
    const candidateCanvas = drawScaled(canvas, canvas.width, canvas.height);
    await quantizeCanvas(candidateCanvas, colors); attempts++; onAttempt?.(attempts, maxAttempts);
    const candidate = await optimizePng(await canvasBlob(candidateCanvas, "image/png"), 3); attempts++; onAttempt?.(attempts, maxAttempts);
    if (candidate.size < best.size) best = candidate;
    if (candidate.size <= target) return { blob: candidate, quality: Math.max(20, Math.round(colors / 2.56)), attempts, reached: true };
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return { blob: best, quality: 20, attempts, reached: false };
}

type ProcessUpdate = { progress: number; stage: "analyzing" | "quality" | "resizing" };
async function processItem(item: Item, shouldCancel: () => boolean, onUpdate: (update: ProcessUpdate) => void) {
  const target = targetBytes(item.targetValue, item.targetUnit);
  if (item.file.size <= target) return { blob: item.file, width: item.width, height: item.height, quality: 100, scale: 1, attempts: 0, status: "already" as const, reason: undefined };
  onUpdate({ progress: 5, stage: "analyzing" });
  const drawable = await loadOrientedDrawable(item.file);
  const scales = item.allowResize ? [1, ...RESIZE_STEPS.filter((scale) => scale >= item.minScale)] : [1];
  let smallest: { blob: Blob; width: number; height: number; quality: number; scale: number; attempts: number } | null = null;
  let totalAttempts = 0;
  try {
    for (let scaleIndex = 0; scaleIndex < scales.length; scaleIndex++) {
      if (shouldCancel()) throw new DOMException("cancelled", "AbortError");
      const scale = scales[scaleIndex];
      const width = Math.max(1, Math.round(item.width * scale));
      const height = Math.max(1, Math.round(item.height * scale));
      onUpdate({ progress: Math.max(10, Math.round((scaleIndex / scales.length) * 75)), stage: scale === 1 ? "quality" : "resizing" });
      const canvas = drawItemCanvas(item, drawable, width, height);
      const updateAttempt = (attempt: number, max: number) => {
        const scaleBase = (scaleIndex / scales.length) * 80;
        const attemptPart = (attempt / Math.max(1, max)) * (80 / scales.length);
        onUpdate({ progress: Math.min(92, Math.round(10 + scaleBase + attemptPart)), stage: scale === 1 ? "quality" : "resizing" });
      };
      const result = item.format === "png"
        ? await searchPng(canvas, target, shouldCancel, updateAttempt)
        : await searchLossy(canvas, item.format === "jpg" ? "image/jpeg" : "image/webp", target, item.minQuality, shouldCancel, updateAttempt);
      totalAttempts += result.attempts;
      if (result.blob && (!smallest || result.blob.size < smallest.blob.size)) smallest = { blob: result.blob, width, height, quality: result.quality, scale, attempts: totalAttempts };
      if (result.blob && result.blob.size <= target) return { blob: result.blob, width, height, quality: result.quality, scale, attempts: totalAttempts, status: "reached" as const, reason: undefined };
    }
  } finally {
    drawable.close();
  }
  if (!smallest) throw new Error("No output generated");
  const overRatio = smallest.blob.size / target;
  const reason = item.allowResize && smallest.scale <= item.minScale ? "min-size" as const : "min-quality" as const;
  return { ...smallest, attempts: totalAttempts, status: "unreached" as const, reason: overRatio <= 1.02 ? "near-target" as const : reason };
}

export function TargetSizeCompressorTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [items, setItems] = useState<Item[]>([]);
  const [targetValue, setTargetValue] = useState(100);
  const [targetUnit, setTargetUnit] = useState<Unit>("KB");
  const [allowResize, setAllowResize] = useState(false);
  const [minQuality, setMinQuality] = useState(40);
  const [minScale, setMinScale] = useState(0.25);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [compareId, setCompareId] = useState<string>();
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [split, setSplit] = useState(50);
  const [zoom, setZoom] = useState(1);
  const cancelRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<Item[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => () => { itemsRef.current.forEach((i) => { URL.revokeObjectURL(i.previewUrl); if (i.resultUrl) URL.revokeObjectURL(i.resultUrl); }); }, []);

  async function addFiles(list: FileList | File[]) {
    if (running) return;
    setMessage("");
    const incoming = Array.from(list);
    const currentTotal = items.reduce((s, i) => s + i.file.size, 0);
    const currentPixels = items.reduce((s, i) => s + i.width * i.height, 0);
    let total = currentTotal, pixels = currentPixels;
    const next: Item[] = [];
    for (const file of incoming) {
      if (items.length + next.length >= LIMITS.count) { setMessage(`Maximum ${LIMITS.count} files.`); break; }
      if (!file.size || file.size > LIMITS.perFile || total + file.size > LIMITS.total) { setMessage("File size limit exceeded."); continue; }
      const format = detectFormat(file.type, ext(file.name)); if (!format) { setMessage("Unsupported format."); continue; }
      const buffer = await file.arrayBuffer(); if (!signatureMatches(buffer, format) || (format === "png" && isApng(buffer)) || (format === "webp" && isAnimatedWebp(buffer))) { setMessage("Unsupported or animated image."); continue; }
      if (items.some((i) => i.file.name === file.name && i.file.size === file.size && i.file.lastModified === file.lastModified) || next.some((i) => i.file.name === file.name && i.file.size === file.size)) continue;
      try {
        const orientation = format === "jpg" ? readExifOrientation(buffer) : 1;
        const rawDimensions = format === "jpg" ? readJpegDimensions(buffer) : null;
        const drawable = await loadOrientedDrawable(file);
        const expected = rawDimensions ? orientedSize(rawDimensions.width, rawDimensions.height, orientation) : orientedSize(drawable.width, drawable.height, orientation);
        const decoderOrientationApplied = !!rawDimensions && drawable.width === expected.width && drawable.height === expected.height && (drawable.width !== rawDimensions.width || drawable.height !== rawDimensions.height);
        const { width, height } = expected;
        drawable.close();
        if (!width || !height || width * height > LIMITS.pixels || pixels + width * height > LIMITS.totalPixels) { setMessage("Image pixel limit exceeded."); continue; }
        total += file.size; pixels += width * height;
        next.push({ id: crypto.randomUUID(), file, name: file.name, format, width, height, orientation, decoderOrientationApplied, previewUrl: URL.createObjectURL(file), targetValue, targetUnit, minQuality, minScale, allowResize, individual: false, status: "ready", progress: 0 });
      } catch { setMessage("Damaged or unsupported image."); }
    }
    setItems((old) => [...old, ...next]);
  }

  function clearResult(item: Item) {
    if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    return { ...item, resultBlob: undefined, resultUrl: undefined, resultName: undefined, resultSize: undefined, resultWidth: undefined, resultHeight: undefined, quality: undefined, scale: undefined, attempts: undefined, reason: undefined, acceptUnreached: false };
  }
  function applyToAll() { setItems((old) => old.map((item) => ({ ...clearResult(item), targetValue, targetUnit, minQuality, minScale, allowResize, individual: false, status: item.status === "processing" ? item.status : "ready", progress: 0, stage: undefined, error: undefined }))); }
  function patch(id: string, patchValue: Partial<Item>, markIndividual = true) {
    const changesSetting = ["targetValue", "targetUnit", "minQuality", "minScale", "allowResize"].some((key) => key in patchValue);
    setItems((old) => old.map((item) => {
      if (item.id !== id) return item;
      const base = changesSetting ? clearResult(item) : item;
      return { ...base, ...patchValue, individual: markIndividual ? true : item.individual };
    }));
  }
  function move(id: string, dir: number) { setItems((old) => { const index = old.findIndex((i) => i.id === id), target = index + dir; if (index < 0 || target < 0 || target >= old.length) return old; const copyItems = [...old]; [copyItems[index], copyItems[target]] = [copyItems[target], copyItems[index]]; return copyItems; }); }
  function remove(id: string) { if (running) return; setItems((old) => { const item = old.find((i) => i.id === id); if (item) { URL.revokeObjectURL(item.previewUrl); if (item.resultUrl) URL.revokeObjectURL(item.resultUrl); } return old.filter((i) => i.id !== id); }); }

  async function compress(ids?: string[]) {
    if (running || !items.length) return;
    const selected = ids ? new Set(ids) : null;
    const invalid = items.find((i) => (selected ? selected.has(i.id) : true) && (!Number.isFinite(i.targetValue) || i.targetValue <= 0));
    if (invalid) { setMessage(t.invalidTarget); return; }
    setRunning(true); cancelRef.current = false; setMessage("");
    const used = new Set<string>();
    for (const source of items) if (source.resultName) used.add(source.resultName.toLowerCase());
    for (const item of items) {
      if (selected && !selected.has(item.id)) continue;
      if (cancelRef.current) { patch(item.id, { status: "cancelled" }, false); continue; }
      patch(item.id, { status: "processing", progress: 2, stage: "analyzing", error: undefined, reason: undefined }, false);
      try {
        const latest = itemsRef.current.find((entry) => entry.id === item.id) || item;
        const result = await processItem(latest, () => cancelRef.current, ({ progress, stage }) => patch(item.id, { progress, stage }, false));
        const name = uniqueName(item.name, used); const url = URL.createObjectURL(result.blob);
        setItems((old) => old.map((i) => {
          if (i.id !== item.id) return i;
          if (i.resultUrl) URL.revokeObjectURL(i.resultUrl);
          return { ...i, status: result.status, progress: 100, stage: undefined, reason: result.reason, acceptUnreached: false, resultBlob: result.blob, resultUrl: url, resultName: name, resultSize: result.blob.size, resultWidth: result.width, resultHeight: result.height, quality: result.quality, scale: result.scale, attempts: result.attempts };
        }));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") patch(item.id, { status: "cancelled", progress: 100, stage: undefined }, false);
        else patch(item.id, { status: "failed", progress: 100, stage: undefined, error: error instanceof Error ? error.message : "failed" }, false);
      }
    }
    setRunning(false);
  }

  function reset() {
    if (running) { cancelRef.current = true; setMessage(locale === "ko" ? "현재 파일 처리가 끝나면 대기 작업을 취소합니다." : locale === "en" ? "Waiting work will be cancelled after the current file finishes." : "現在のファイル処理後に待機中の作業をキャンセルします。"); return; }
    items.forEach((item) => { URL.revokeObjectURL(item.previewUrl); if (item.resultUrl) URL.revokeObjectURL(item.resultUrl); });
    setItems([]); setCompareId(undefined); setMessage(""); setTargetValue(100); setTargetUnit("KB"); setAllowResize(false); setMinQuality(40); setMinScale(0.25);
  }
  async function downloadZip() { const valid = items.filter((i) => (i.status === "reached" || i.status === "already" || (i.status === "unreached" && i.acceptUnreached)) && i.resultBlob && i.resultName); if (!valid.length) return; const zip = await createStoredZip(valid.map((i) => ({ name: i.resultName!, blob: i.resultBlob! }))); const url = URL.createObjectURL(zip); const a = document.createElement("a"); a.href = url; a.download = "fixlgs-target-size-compressor.zip"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  function download(item: Item) { if (!item.resultBlob || !item.resultName || (item.status === "unreached" && !item.acceptUnreached)) return; const a = document.createElement("a"); a.href = item.resultUrl!; a.download = item.resultName; a.click(); }

  const summary = useMemo(() => ({ reached: items.filter((i) => i.status === "reached").length, already: items.filter((i) => i.status === "already").length, unreached: items.filter((i) => i.status === "unreached").length, failed: items.filter((i) => i.status === "failed").length, original: items.reduce((s, i) => s + i.file.size, 0), result: items.reduce((s, i) => s + (i.resultSize || 0), 0) }), [items]);
  const compare = items.find((i) => i.id === compareId && i.resultUrl);
  const statusText = (s: Status) => s === "reached" ? t.reached : s === "already" ? t.already : s === "unreached" ? t.unreached : s === "failed" ? t.failed : s === "processing" ? t.processing : s === "cancelled" ? (locale === "ko" ? "취소됨" : locale === "en" ? "Cancelled" : "キャンセル済み") : (locale === "ko" ? "대기" : locale === "en" ? "Ready" : "待機");
  const stageText = (stage?: Item["stage"]) => stage === "analyzing" ? (locale === "ko" ? "이미지를 분석하고 있습니다." : locale === "en" ? "Analyzing image..." : "画像を解析しています。") : stage === "resizing" ? (locale === "ko" ? "이미지 크기를 조정하고 있습니다." : locale === "en" ? "Adjusting image dimensions..." : "画像サイズを調整しています。") : (locale === "ko" ? "최고 품질 결과를 찾고 있습니다." : locale === "en" ? "Finding the highest quality result..." : "最も高い画質の結果を探しています。");
  const reasonText = (item: Item) => item.reason === "near-target" ? (locale === "ko" ? "목표에 근접했지만 실제 파일 크기가 기준을 조금 초과했습니다." : locale === "en" ? "The result is close, but still slightly exceeds the actual byte limit." : "目標に近いものの、実際のファイル容量がわずかに上限を超えています。") : item.reason === "min-size" ? (locale === "ko" ? "설정한 최소 이미지 크기까지 줄였지만 목표를 달성하지 못했습니다." : locale === "en" ? "The minimum image size was reached before the target could be met." : "最小画像サイズまで縮小しましたが、目標を達成できませんでした。") : (locale === "ko" ? "설정한 최소 품질에서 원본 크기를 유지한 채 목표를 달성하지 못했습니다." : locale === "en" ? "The minimum quality was reached while keeping the selected dimensions." : "設定した最低画質で、選択した画像サイズを維持したまま目標を達成できませんでした。");

  return (
    <div className="toolbox-tool-workflow">
      <section className="toolbox-workbench target-size-workbench" data-testid="target-size-workbench">
        <div
          className="toolbox-workbench-upload"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            addFiles(event.dataTransfer.files);
          }}
        >
          <div className="toolbox-workbench-topline">
            <div>
              <span>WORKSPACE</span>
              <strong>{locale === "ko" ? "목표 용량 압축 작업장" : locale === "en" ? "Target size compression workspace" : "目標容量圧縮ワークスペース"}</strong>
            </div>
          </div>

          <input
            ref={inputRef}
            data-testid="target-file-input"
            type="file"
            hidden
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />

          {items.length === 0 ? (
            <div className="toolbox-upload-focus">
              <span className="toolbox-upload-icon" aria-hidden="true">＋</span>
              <h2>{t.drop}</h2>
              <p>{locale === "ko" ? "여러 이미지를 한 번에 추가하고 같은 목표 용량을 적용할 수 있습니다." : locale === "en" ? "Add several images at once and apply the same target size." : "複数の画像をまとめて追加し、同じ目標容量を適用できます。"}</p>
              <button type="button" onClick={() => inputRef.current?.click()}>{t.choose}</button>
              <small>{t.support}<br />{t.local}</small>
            </div>
          ) : (
            <div className="toolbox-upload-active target-size-upload-active">
              <div className="toolbox-upload-active-head">
                <div>
                  <span>{locale === "ko" ? "선택한 이미지" : locale === "en" ? "Selected images" : "選択した画像"}</span>
                  <p>{locale === "ko" ? "파일별 목표값과 처리 상태, 결과를 한곳에서 확인합니다." : locale === "en" ? "Review per-file targets, status, and results in one place." : "ファイル別の目標値、処理状態、結果を一か所で確認できます。"}</p>
                </div>
                <div className="toolbox-upload-active-actions">
                  <div className="toolbox-file-stats">
                    <span>{items.length} files</span>
                    <span>{summary.reached + summary.already} done</span>
                    <span>{summary.failed} failed</span>
                  </div>
                  <button type="button" disabled={running} onClick={() => inputRef.current?.click()}>＋ {t.add}</button>
                </div>
              </div>
            </div>
          )}

          <div className="toolbox-workbench-settings-head target-size-settings-head">
            <div>
              <span>{t.target}</span>
              <p>{locale === "ko" ? "입력한 용량을 넘지 않는 범위에서 가능한 가장 높은 품질을 찾습니다." : locale === "en" ? "Find the highest possible quality without exceeding the selected size." : "指定容量を超えない範囲で、できるだけ高い画質を探します。"}</p>
            </div>
            <button type="button" className="target-size-apply" disabled={running} onClick={applyToAll}>{t.apply}</button>
          </div>

          <div className="target-size-settings" data-testid="target-settings">
            <div className="target-size-setting-main">
              <label>
                <span className="target-size-label">{t.target}</span>
                <span className="target-size-input-row">
                  <input data-testid="target-value" type="number" min="0.1" step="0.1" value={targetValue} onChange={(event) => setTargetValue(Number(event.target.value))} />
                  <select data-testid="target-unit" value={targetUnit} onChange={(event) => setTargetUnit(event.target.value as Unit)}>
                    <option>KB</option><option>MB</option>
                  </select>
                </span>
              </label>
              <div className="target-size-presets">
                {([[50, "KB"], [100, "KB"], [200, "KB"], [500, "KB"], [1, "MB"]] as const).map(([value, unit]) => (
                  <button data-testid={`preset-${value}${unit}`} key={`${value}${unit}`} type="button" className={targetValue === value && targetUnit === unit ? "is-active" : ""} onClick={() => { setTargetValue(value); setTargetUnit(unit); }}>{value}{unit}</button>
                ))}
              </div>
            </div>

            <div className="target-size-setting-options">
              <label className="target-size-mode-toggle">
                <input type="checkbox" checked={allowResize} onChange={(event) => setAllowResize(event.target.checked)} />
                <span><strong>{allowResize ? t.resize : t.keep}</strong><small>{allowResize ? (locale === "ko" ? "품질 조정만으로 부족할 때 비율을 유지하며 단계적으로 줄입니다." : locale === "en" ? "Resize proportionally only when quality adjustment is not enough." : "画質調整だけで不足する場合に、比率を維持して段階的に縮小します。") : (locale === "ko" ? "가로·세로 픽셀을 유지하고 품질만 조정합니다." : locale === "en" ? "Keep the original pixel dimensions and adjust quality only." : "元のピクセルサイズを維持し、画質のみ調整します。")}</small></span>
              </label>
              <details>
                <summary>{t.advanced}</summary>
                <div className="target-size-advanced-grid">
                  <label>{t.minQuality}<input data-testid="minimum-quality" type="range" min="20" max="80" value={minQuality} onChange={(event) => setMinQuality(Number(event.target.value))} /><output>{minQuality}</output></label>
                  <label>{t.minScale}<select data-testid="minimum-scale" value={minScale} onChange={(event) => setMinScale(Number(event.target.value))}><option value="0.5">50%</option><option value="0.4">40%</option><option value="0.3">30%</option><option value="0.25">25%</option></select></label>
                </div>
              </details>
            </div>
          </div>

          {targetValue > 0 && targetUnit === "KB" && targetValue < 20 && <p className="target-size-warning">{t.tinyTarget}</p>}
          {message && <p className="toolbox-error-message" role="alert">{message}</p>}
        </div>

        {items.length > 0 && (
          <div className="toolbox-workbench-files target-size-workbench-files" data-testid="target-file-list">
            <div className="target-size-list">
              {items.map((item, index) => (
                <article key={item.id} className={`target-size-file-card status-${item.status}`} data-testid="target-file-card" data-status={item.status} data-format={item.format} data-original-size={item.file.size} data-result-size={item.resultSize || ""} data-result-width={item.resultWidth || ""} data-result-height={item.resultHeight || ""} data-quality={item.quality || ""} data-scale={item.scale || ""} data-attempts={item.attempts || ""} data-orientation={item.orientation} data-reason={item.reason || ""} data-accepted={item.acceptUnreached ? "true" : "false"}>
                  <img src={item.previewUrl} alt="" />
                  <div className="target-size-file-main">
                    <div className="target-size-file-title"><div><strong>{item.name}</strong><span>{item.format.toUpperCase()} · {pretty(item.file.size)} · {item.width}×{item.height}</span></div><b data-testid="target-status">{statusText(item.status)}</b></div>
                    <div className="target-size-file-controls">
                      <label>{t.target}<span><input aria-label={`${item.name} ${t.target}`} type="number" min="0.1" step="0.1" disabled={running} value={item.targetValue} onChange={(event) => patch(item.id, { targetValue: Number(event.target.value), status: "ready", reason: undefined })} /><select aria-label={`${item.name} ${locale === "ko" ? "단위" : locale === "en" ? "unit" : "単位"}`} value={item.targetUnit} disabled={running} onChange={(event) => patch(item.id, { targetUnit: event.target.value as Unit, status: "ready", reason: undefined })}><option>KB</option><option>MB</option></select></span></label>
                      <label className="target-size-file-resize"><input aria-label={`${item.name} ${t.resize}`} type="checkbox" disabled={running} checked={item.allowResize} onChange={(event) => patch(item.id, { allowResize: event.target.checked, status: "ready", reason: undefined })} />{t.resize}</label>
                      <label className="target-size-file-quality">{t.minQuality}<span><input aria-label={`${item.name} ${t.minQuality}`} type="range" min="20" max="80" disabled={running} value={item.minQuality} onChange={(event) => patch(item.id, { minQuality: Number(event.target.value), status: "ready", reason: undefined })} /><output>{item.minQuality}</output></span></label>
                      <label className="target-size-file-scale">{t.minScale}<select aria-label={`${item.name} ${t.minScale}`} value={item.minScale} disabled={running || !item.allowResize} onChange={(event) => patch(item.id, { minScale: Number(event.target.value), status: "ready", reason: undefined })}><option value="0.5">50%</option><option value="0.4">40%</option><option value="0.3">30%</option><option value="0.25">25%</option></select></label>
                    </div>
                    {item.status === "processing" && <div className="target-size-progress"><i style={{ width: `${item.progress}%` }} /><span>{stageText(item.stage)} {item.progress}%</span></div>}
                    {item.resultBlob && <div className="target-size-result-meta" data-testid="target-result-meta"><span>{t.target}: {item.targetValue}{item.targetUnit}</span><span>{t.result}: <b data-testid="result-size-bytes" data-bytes={item.resultSize}>{pretty(item.resultSize!)}</b></span><span>{t.dimensions}: {item.width}×{item.height} → {item.resultWidth}×{item.resultHeight}</span><span>{t.quality}: {item.quality}</span><span>{t.scale}: {Math.round((item.scale || 1) * 100)}%</span><span>{t.attempts}: {item.attempts}</span></div>}
                    {item.status === "unreached" && <div className="target-size-unreached" role="status"><strong>{t.unreached}</strong><p>{reasonText(item)}</p><div><button type="button" disabled={running || item.allowResize} onClick={() => patch(item.id, { allowResize: true, status: "ready", reason: undefined })}>{locale === "ko" ? "크기 축소 허용" : locale === "en" ? "Allow resizing" : "サイズ縮小を許可"}</button><button type="button" disabled={running} onClick={() => patch(item.id, { acceptUnreached: !item.acceptUnreached })}>{item.acceptUnreached ? (locale === "ko" ? "현재 결과 사용 취소" : locale === "en" ? "Do not use current result" : "現在の結果を使用しない") : (locale === "ko" ? "현재 결과 사용" : locale === "en" ? "Use current result" : "現在の結果を使用")}</button></div></div>}
                    {item.error && <p className="toolbox-error-message">{item.error}</p>}
                    <div className="target-size-file-actions"><button type="button" aria-label={`${item.name} ${t.up}`} disabled={running || index === 0} onClick={() => move(item.id, -1)}>{t.up}</button><button type="button" aria-label={`${item.name} ${t.down}`} disabled={running || index === items.length - 1} onClick={() => move(item.id, 1)}>{t.down}</button><button type="button" aria-label={`${item.name} ${t.remove}`} disabled={running} onClick={() => remove(item.id)}>{t.remove}</button>{item.resultUrl && <button type="button" onClick={() => setCompareId(item.id)}>{t.compare}</button>}{item.resultBlob && (item.status !== "unreached" || item.acceptUnreached) && <button type="button" aria-label={`${item.name} ${t.download}`} onClick={() => download(item)}>{t.download}</button>}<button type="button" disabled={running} onClick={() => compress([item.id])}>{t.retry}</button></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="toolbox-workbench-actions target-size-actions">
            <button data-testid="target-compress-button" type="button" className="toolbox-primary-action" disabled={running || targetValue <= 0} onClick={() => compress()}>{t.compress}</button>
            {running && <button type="button" onClick={() => { cancelRef.current = true; }}>{t.cancel}</button>}
            <button data-testid="target-zip-button" type="button" className="toolbox-zip-action" onClick={downloadZip} disabled={summary.reached + summary.already + items.filter((item) => item.status === "unreached" && item.acceptUnreached).length === 0}>{t.zip}</button>
            <button type="button" className="toolbox-restart-action" onClick={reset}>{t.reset}</button>
          </div>
        )}

        {(summary.reached + summary.already + summary.unreached + summary.failed > 0) && (
          <div className="target-size-summary" data-testid="target-summary">
            <div><p>{t.allDone}</p><strong>{summary.reached + summary.already} / {items.length}</strong></div>
            <span>{t.reached} {summary.reached}</span><span>{t.already} {summary.already}</span><span>{t.unreached} {summary.unreached}</span><span>{t.failed} {summary.failed}</span><span>{t.original} {pretty(summary.original)}</span><span>{t.result} {pretty(summary.result)}</span>
          </div>
        )}
      </section>

      {compare && <div className="compressor-compare-modal" role="dialog" aria-modal="true"><div className="compressor-compare-panel"><div className="compressor-compare-head"><div><strong>{compare.name}</strong><span>{compare.targetValue}{compare.targetUnit} · {pretty(compare.resultSize!)}</span></div><button onClick={() => setCompareId(undefined)}>{t.close}</button></div><div className="compressor-compare-toolbar"><button onClick={() => setViewMode("original")}>{t.originalOnly}</button><button onClick={() => setViewMode("split")}>{t.split}</button><button onClick={() => setViewMode("result")}>{t.resultOnly}</button><button onClick={() => setZoom(Math.max(.5, zoom - .25))}>{t.zoomOut}</button><button onClick={() => setZoom(Math.min(3, zoom + .25))}>{t.zoomIn}</button><button onClick={() => setZoom(1)}>{t.fit}</button></div><div className={`compressor-compare-stage mode-${viewMode}`} style={{ "--compare": `${split}%`, "--zoom": zoom } as CSSProperties}><img src={compare.previewUrl} className="compare-original" alt={t.original} /><img src={compare.resultUrl} className="compare-result" alt={t.result} />{viewMode === "split" && <input aria-label="comparison" type="range" min="0" max="100" value={split} onChange={(event) => setSplit(Number(event.target.value))} />}</div></div></div>}
    </div>
  );
}
