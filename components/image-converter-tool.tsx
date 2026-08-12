/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createStoredZip } from "@/lib/zip";
import { tool001LocalNotes, type Locale } from "@/lib/site";
import { MOBILE_FILE_READ_STAGE_TIMEOUT_MS, MOBILE_IMAGE_DECODE_TIMEOUT_MS, constrainForMobileMemory, isMobileImageSafetyActive, isMobileMemorySafetyError, mobileMemoryErrorMessage, releaseCanvas, safeRevokeObjectUrl, withTimeout } from "@/lib/mobile-image-safety";
import { capturePickerFile } from "@/lib/image-input-capture";
import { canUseTool001WorkerEngine, runTool001WorkerConversion } from "@/lib/tool001-image-worker-client";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";
type QualityMode = "auto" | "high" | "balanced" | "space" | "custom";
type Status = "idle" | "queued" | "processing" | "done" | "error" | "cancelled";

const MAX_FILES = 10;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_TOTAL_BYTES = 60 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;
// 001 운영 안전선: 10개, 파일당 20MB, 전체 60MB, 이미지당 40MP. 한계·경계검수 통과값.

type FileItem = {
  id: string;
  file: File;
  previewUrl: string;
  resultUrl?: string;
  resultBlob?: Blob;
  status: Status;
  error?: string;
  outputFormat: OutputFormat;
  width?: number;
  height?: number;
  sourceWidth?: number;
  sourceHeight?: number;
  originalSize: number;
  outputSize?: number;
  transparency?: boolean;
  outputName?: string;
  isNew?: boolean;
  previewFallbackAttempted?: boolean;
};

const outputOptions: { value: OutputFormat; label: Record<Locale, string> }[] = [
  { value: "image/jpeg", label: { ko: "JPG", en: "JPG", ja: "JPG" } },
  { value: "image/png", label: { ko: "PNG", en: "PNG", ja: "PNG" } },
  { value: "image/webp", label: { ko: "WebP", en: "WebP", ja: "WebP" } },
];

const qualityPresets: Record<Exclude<QualityMode, "custom">, Record<Locale, string>> = {
  auto: { ko: "자동 추천", en: "Auto recommended", ja: "自動おすすめ" },
  high: { ko: "고화질", en: "High quality", ja: "高画質" },
  balanced: { ko: "균형", en: "Balanced", ja: "バランス" },
  space: { ko: "용량 절약", en: "Save space", ja: "容量節約" },
};

function getMimeForFormat(format: OutputFormat) {
  return format;
}

function getExtensionForFormat(format: OutputFormat) {
  return format === "image/jpeg" ? "jpg" : format === "image/png" ? "png" : "webp";
}

function baseName(name: string) {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

function uniqueOutputNames(items: FileItem[]) {
  const used = new Map<string, number>();
  return items.map((item) => {
    const desired = `${baseName(item.file.name)}.${getExtensionForFormat(item.outputFormat)}`;
    const key = desired.toLowerCase();
    const count = (used.get(key) ?? 0) + 1;
    used.set(key, count);
    if (count === 1) return desired;
    const dot = desired.lastIndexOf(".");
    return `${desired.slice(0, dot)}-${count}${desired.slice(dot)}`;
  });
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatChange(bytes: number) {
  const abs = Math.abs(bytes);
  const text = formatBytes(abs);
  if (bytes > 0) return `+${text}`;
  if (bytes < 0) return `-${text}`;
  return "0 B";
}

function formatPercent(delta: number, original: number) {
  if (!original) return "0%";
  const percent = (delta / original) * 100;
  return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

type DetectedImageKind = "jpeg" | "png" | "webp";

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

function includesAsciiToken(bytes: Uint8Array, token: string) {
  if (!token || bytes.length < token.length) return false;
  const codes = Array.from(token, (char) => char.charCodeAt(0));
  outer: for (let index = 0; index <= bytes.length - codes.length; index += 1) {
    for (let offset = 0; offset < codes.length; offset += 1) {
      if (bytes[index + offset] !== codes[offset]) continue outer;
    }
    return true;
  }
  return false;
}

function readBlobWithFileReader(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error("filereader-result"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("filereader"));
    reader.onabort = () => reject(new Error("filereader-abort"));
    reader.readAsArrayBuffer(blob);
  });
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("dataurl-result"));
    reader.onerror = () => reject(reader.error ?? new Error("dataurl"));
    reader.onabort = () => reject(new Error("dataurl-abort"));
    reader.readAsDataURL(blob);
  });
}


async function createBlobUrlOrDataUrl(blob: Blob) {
  try {
    return URL.createObjectURL(blob);
  } catch {
    return readBlobAsDataUrl(blob);
  }
}

function createFileItemId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // fallback below
  }
  try {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

const ATTACH_HEADER_BYTES = 256 * 1024;

async function readAttachHeader(file: File): Promise<Uint8Array> {
  // Android content providers can make a full-file read unexpectedly slow or flaky.
  // Attachment only needs enough bytes to validate the container signature/animation marker.
  const headerBlob = file.slice(0, Math.min(file.size, ATTACH_HEADER_BYTES));
  try {
    return new Uint8Array(await withTimeout(headerBlob.arrayBuffer(), MOBILE_FILE_READ_STAGE_TIMEOUT_MS, "file-read-timeout"));
  } catch (firstError) {
    try {
      return new Uint8Array(await withTimeout(readBlobWithFileReader(headerBlob), MOBILE_FILE_READ_STAGE_TIMEOUT_MS, "file-read-timeout"));
    } catch {
      throw firstError;
    }
  }
}

function readU16BE(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readU24LE(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function parseHeaderDimensions(bytes: Uint8Array, kind: DetectedImageKind): { width: number; height: number } | null {
  if (kind === "png" && bytes.length >= 24 && ascii(bytes, 12, 4) === "IHDR") {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint32(16, false);
    const height = view.getUint32(20, false);
    return width > 0 && height > 0 ? { width, height } : null;
  }
  if (kind === "jpeg") {
    const sof = new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
    let offset = 2;
    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
      if (offset >= bytes.length) break;
      const marker = bytes[offset++];
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (offset + 1 >= bytes.length) break;
      const length = readU16BE(bytes, offset);
      if (length < 2 || offset + length > bytes.length) break;
      if (sof.has(marker) && length >= 7) {
        const height = readU16BE(bytes, offset + 3);
        const width = readU16BE(bytes, offset + 5);
        return width > 0 && height > 0 ? { width, height } : null;
      }
      offset += length;
    }
    return null;
  }
  if (kind === "webp" && bytes.length >= 30) {
    const chunk = ascii(bytes, 12, 4);
    if (chunk === "VP8X" && bytes.length >= 30) {
      return { width: readU24LE(bytes, 24) + 1, height: readU24LE(bytes, 27) + 1 };
    }
    if (chunk === "VP8 " && bytes.length >= 30 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
      const width = (bytes[26] | (bytes[27] << 8)) & 0x3fff;
      const height = (bytes[28] | (bytes[29] << 8)) & 0x3fff;
      return width > 0 && height > 0 ? { width, height } : null;
    }
    if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
      const b1 = bytes[21], b2 = bytes[22], b3 = bytes[23], b4 = bytes[24];
      const width = 1 + ((b1 | (b2 << 8)) & 0x3fff);
      const height = 1 + (((b2 >> 6) | (b3 << 2) | (b4 << 10)) & 0x3fff);
      return { width, height };
    }
  }
  return null;
}

async function inspectImageFile(file: File): Promise<{ kind: DetectedImageKind; animated: boolean; width?: number; height?: number }> {
  if (file.size === 0) throw new Error("empty");
  const bytes = await readAttachHeader(file);
  let kind: DetectedImageKind | null = null;
  let animated = false;
  // Filename/MIME metadata from Android content providers is advisory only.
  // Keep attachment validation lightweight; full decoding is deferred until conversion.
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    kind = "jpeg";
  } else if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 3) === "PNG" && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    kind = "png";
    animated = includesAsciiToken(bytes, "acTL");
  } else if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    kind = "webp";
    animated = includesAsciiToken(bytes, "ANIM") || includesAsciiToken(bytes, "ANMF");
  }
  if (!kind) throw new Error("signature");
  const dimensions = parseHeaderDimensions(bytes, kind);
  return { kind, animated, width: dimensions?.width, height: dimensions?.height };
}

function duplicateKey(file: File) {
  return `${file.name.toLowerCase()}|${file.size}|${file.lastModified}`;
}


async function loadImageSource(file: File, headerDimensions?: { width?: number; height?: number }): Promise<{ source: CanvasImageSource; width: number; height: number; dispose?: () => void }> {
  if (typeof window !== "undefined" && "createImageBitmap" in window) {
    let bitmapTimedOut = false;
    try {
      const sourceWidth = headerDimensions?.width ?? 0;
      const sourceHeight = headerDimensions?.height ?? 0;
      const mobileTarget = sourceWidth > 0 && sourceHeight > 0 ? constrainForMobileMemory(sourceWidth, sourceHeight) : null;
      const bitmapOptions: ImageBitmapOptions = mobileTarget?.scaled && isMobileImageSafetyActive()
        ? { imageOrientation: "from-image", resizeWidth: mobileTarget.width, resizeHeight: mobileTarget.height, resizeQuality: "high" }
        : { imageOrientation: "from-image" };
      const bitmapPromise = createImageBitmap(file, bitmapOptions);
      // A content-provider/browser decoder can occasionally never settle on mobile.
      // Bound the wait, then fall back to the Image path instead of leaving the UI stuck forever.
      bitmapPromise.then((lateBitmap) => {
        if (bitmapTimedOut) lateBitmap.close();
      }).catch(() => { /* handled by the awaited race below */ });
      const bitmap = await Promise.race([
        bitmapPromise,
        new Promise<never>((_, reject) => window.setTimeout(() => {
          bitmapTimedOut = true;
          reject(new Error("bitmap-timeout"));
        }, MOBILE_IMAGE_DECODE_TIMEOUT_MS)),
      ]);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, dispose: () => bitmap.close() };
    } catch {
      // fallback below
    }
  }

  const sourceUrl = await createBlobUrlOrDataUrl(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      callback();
    };
    const timer = window.setTimeout(() => {
      finish(() => {
        safeRevokeObjectUrl(sourceUrl);
        reject(new Error("image-timeout"));
      });
    }, MOBILE_IMAGE_DECODE_TIMEOUT_MS);
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      finish(() => resolve({ source: image, width, height, dispose: () => safeRevokeObjectUrl(sourceUrl) }));
    };
    image.onerror = () => {
      finish(() => {
        safeRevokeObjectUrl(sourceUrl);
        reject(new Error("이미지를 불러올 수 없습니다."));
      });
    };
    image.src = sourceUrl;
  });
}

async function detectTransparency(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement("canvas");
  try {
    const maxSide = 256;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const sampleWidth = Math.max(1, Math.floor(width * scale));
    const sampleHeight = Math.max(1, Math.floor(height * scale));
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.clearRect(0, 0, sampleWidth, sampleHeight);
    ctx.drawImage(source, 0, 0, sampleWidth, sampleHeight);
    const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
    for (let index = 3; index < imageData.length; index += 16) {
      if (imageData[index] < 255) return true;
    }
    return false;
  } finally {
    releaseCanvas(canvas);
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      mime,
      quality,
    );
  });
}


function getQualityPresetLabel(mode: QualityMode, locale: Locale) {
  if (mode === "custom") return locale === "ko" ? "직접 설정" : locale === "en" ? "Custom" : "手動設定";
  return qualityPresets[mode][locale];
}

function qualityFor(mode: QualityMode, format: OutputFormat) {
  if (format === "image/png") return undefined;
  if (mode === "custom") return undefined;
  const defaults: Record<Exclude<QualityMode, "custom">, Record<Exclude<OutputFormat, "image/png">, number>> = {
    auto: { "image/jpeg": 0.92, "image/webp": 0.88 },
    high: { "image/jpeg": 0.96, "image/webp": 0.94 },
    balanced: { "image/jpeg": 0.88, "image/webp": 0.84 },
    space: { "image/jpeg": 0.76, "image/webp": 0.72 },
  };
  return defaults[mode][format];
}

export function ImageConverterTool({ locale }: { locale: Locale }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<FileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [globalFormat, setGlobalFormat] = useState<OutputFormat>("image/webp");
  const [qualityMode, setQualityMode] = useState<QualityMode>("auto");
  const [customQuality, setCustomQuality] = useState(88);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [zipState, setZipState] = useState<"idle" | "working" | "error">("idle");
  const cancelRef = useRef(false);
  // Incremented by a full reset so any in-flight async conversion becomes stale.
  const conversionGenerationRef = useRef(0);
  // Item deletion must invalidate only that item's late async result.
  const removedItemIdsRef = useRef(new Set<string>());

  const itemsRef = useRef<FileItem[]>([]);
  const attachmentQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        safeRevokeObjectUrl(item.previewUrl);
        if (item.resultUrl) safeRevokeObjectUrl(item.resultUrl);
      });
    };
  }, []);

  const supportedLabel = useMemo(() => tool001LocalNotes[locale], [locale]);

  const aggregate = useMemo(() => {
    const done = items.filter((item) => item.status === "done").length;
    const failed = items.filter((item) => item.status === "error").length;
    const originalSize = items.reduce((sum, item) => sum + item.originalSize, 0);
    const outputSize = items.reduce((sum, item) => sum + (item.outputSize ?? 0), 0);
    return { done, failed, originalSize, outputSize, delta: outputSize - originalSize };
  }, [items]);

  const effectiveQualityLabel = useMemo(() => {
    if (globalFormat === "image/png") return locale === "ko" ? "PNG는 무손실로 처리됩니다." : locale === "en" ? "PNG is handled as lossless output." : "PNGは無損失で処理されます。";
    if (qualityMode === "custom") {
      return locale === "ko"
        ? `직접 설정 ${customQuality}`
        : locale === "en"
          ? `Custom ${customQuality}`
          : `手動設定 ${customQuality}`;
    }
    return qualityPresets[qualityMode][locale];
  }, [customQuality, globalFormat, locale, qualityMode]);

  const addFilesInternal = async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const baseItems = itemsRef.current;
    const existing = new Set(baseItems.map((item) => duplicateKey(item.file)));
    const accepted: FileItem[] = [];
    let total = baseItems.reduce((sum, item) => sum + item.originalSize, 0);
    let rejected = 0;
    let duplicate = 0;
    let animated = 0;
    let memoryRejected = 0;

    for (const file of incoming) {
      if (baseItems.length + accepted.length >= MAX_FILES || file.size > MAX_FILE_BYTES || total + file.size > MAX_TOTAL_BYTES) {
        rejected += 1;
        continue;
      }
      const key = duplicateKey(file);
      if (existing.has(key)) {
        duplicate += 1;
        continue;
      }
      try {
        // V26: capture the picker-backed File exactly once while the input is still alive.
        // Every later preview/conversion uses this app-owned File, never the Android provider handle.
        const ownedFile = await capturePickerFile(file);
        const inspection = await inspectImageFile(ownedFile);
        if (inspection.animated) {
          animated += 1;
          continue;
        }
        existing.add(key);
        total += ownedFile.size;
        const previewUrl = await createBlobUrlOrDataUrl(ownedFile);
        accepted.push({
          id: createFileItemId(),
          file: ownedFile,
          previewUrl,
          status: "idle",
          outputFormat: globalFormat,
          originalSize: ownedFile.size,
          sourceWidth: inspection.width,
          sourceHeight: inspection.height,
          isNew: true,
        });
      } catch (error) {
        rejected += 1;
        if (isMobileMemorySafetyError(error)) memoryRejected += 1;
      }
    }

    setItems((prev) => [...prev, ...accepted]);
    const parts = [
      accepted.length
        ? locale === "ko" ? `${accepted.length}개 이미지를 추가했습니다.` : locale === "en" ? `Added ${accepted.length} image(s).` : `${accepted.length}件の画像を追加しました。`
        : "",
      duplicate
        ? locale === "ko" ? `중복 ${duplicate}개 제외.` : locale === "en" ? `${duplicate} duplicate(s) skipped.` : `重複${duplicate}件を除外。`
        : "",
      animated
        ? locale === "ko" ? `애니메이션 이미지 ${animated}개 제외.` : locale === "en" ? `${animated} animated image(s) skipped.` : `アニメーション画像${animated}件を除外。`
        : "",
      memoryRejected ? mobileMemoryErrorMessage(locale) : "",
      rejected
        ? locale === "ko" ? `손상·형식 불일치·제한 초과 ${rejected}개 제외.` : locale === "en" ? `${rejected} damaged, mismatched, or oversized file(s) skipped.` : `破損・形式不一致・制限超過${rejected}件を除外。`
        : "",
    ].filter(Boolean);
    setMessage(parts.join(" ") || (locale === "ko" ? "추가할 수 있는 이미지가 없습니다." : locale === "en" ? "No valid images were added." : "追加できる画像がありません。"));
  };

  const addFiles = (fileList: FileList | File[]) => {
    const snapshot = Array.from(fileList);
    const run = attachmentQueueRef.current.then(
      () => addFilesInternal(snapshot),
      () => addFilesInternal(snapshot),
    );
    attachmentQueueRef.current = run.catch(() => undefined);
    return run;
  };

  const removeItem = (id: string) => {
    removedItemIdsRef.current.add(id);
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        safeRevokeObjectUrl(target.previewUrl);
        if (target.resultUrl) safeRevokeObjectUrl(target.resultUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearAll = () => {
    conversionGenerationRef.current += 1;
    cancelRef.current = true;
    removedItemIdsRef.current.clear();
    setProcessing(false);
    setItems((prev) => {
      prev.forEach((item) => {
        safeRevokeObjectUrl(item.previewUrl);
        if (item.resultUrl) safeRevokeObjectUrl(item.resultUrl);
      });
      return [];
    });
    setMessage("");
    setGlobalFormat("image/webp");
    setQualityMode("auto");
    setCustomQuality(88);
    setBackgroundColor("#ffffff");
    setAdvancedOpen(false);
    setZipState("idle");
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const setAllFormats = (format: OutputFormat) => {
    setGlobalFormat(format);
    setItems((prev) => prev.map((item) => ({ ...item, outputFormat: format })));
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    let url = "";
    try {
      url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => safeRevokeObjectUrl(url), 1000);
      return true;
    } catch {
      if (url) safeRevokeObjectUrl(url);
      setMessage(locale === "ko"
        ? "다운로드를 시작하지 못했습니다. 다시 시도해 주세요."
        : locale === "en"
          ? "The download could not be started. Please try again."
          : "ダウンロードを開始できませんでした。もう一度お試しください。");
      return false;
    }
  };

  const convertAll = async (onlyNew = false) => {
    if (processing || items.length === 0) return;
    cancelRef.current = false;
    const runGeneration = conversionGenerationRef.current;
    setProcessing(true);
    setZipState("idle");
    const sourceItems = [...items];
    const names = uniqueOutputNames(sourceItems);
    const targetIndexes = sourceItems.map((item,index)=>({item,index})).filter(({item})=>!onlyNew || item.isNew);
    const nextItems = [...sourceItems];
    let memoryFailureCount = 0;

    const runIsCurrent = () => conversionGenerationRef.current === runGeneration;
    const publishCurrentItems = () => {
      if (!runIsCurrent()) return;
      setItems((current) => {
        const liveIds = new Set(current.map((entry) => entry.id));
        return nextItems.filter((entry) => liveIds.has(entry.id) && !removedItemIdsRef.current.has(entry.id));
      });
    };

    for (let step = 0; step < targetIndexes.length; step += 1) {
      const { item, index: i } = targetIndexes[step];
      if (!runIsCurrent()) return;
      if (removedItemIdsRef.current.has(item.id)) continue;
      if (cancelRef.current) {
        nextItems[i] = { ...item, status: "cancelled", isNew: false };
        publishCurrentItems();
        continue;
      }
      if (item.resultUrl) safeRevokeObjectUrl(item.resultUrl);
      nextItems[i] = { ...item, status: "processing", error: undefined, resultBlob: undefined, resultUrl: undefined, outputSize: undefined };
      publishCurrentItems();
      if (!runIsCurrent()) return;
      setMessage(locale === "ko" ? `${step + 1} / ${targetIndexes.length}개 처리 중` : locale === "en" ? `Processing ${step + 1} of ${targetIndexes.length}` : `${step + 1} / ${targetIndexes.length}件を処理中`);
      let loaded: Awaited<ReturnType<typeof loadImageSource>> | null = null;
      let producedResultUrl: string | undefined;
      try {
        const format = item.outputFormat;
        const quality = qualityFor(qualityMode, format);
        if (item.sourceWidth && item.sourceHeight && item.sourceWidth * item.sourceHeight > MAX_PIXELS) {
          throw new Error("Image dimensions exceed the safe processing limit");
        }
        let blob: Blob | null = null;
        let resultWidth = 0;
        let resultHeight = 0;
        let transparency = false;
        let workerCompleted = false;

        // V26 primary path: image work is physically isolated from React/FilePicker in a Worker.
        // The Worker receives only our captured Blob and returns a finished Blob/result size.
        if (canUseTool001WorkerEngine()) {
          try {
            const workerResult = await runTool001WorkerConversion({
              blob: item.file,
              outputFormat: format,
              quality,
              backgroundColor,
              sourceWidth: item.sourceWidth,
              sourceHeight: item.sourceHeight,
              maxPixels: MAX_PIXELS,
              mobile: isMobileImageSafetyActive(),
            });
            blob = workerResult.blob;
            resultWidth = workerResult.width;
            resultHeight = workerResult.height;
            workerCompleted = true;
          } catch (workerError) {
            const workerMessage = workerError instanceof Error ? workerError.message : String(workerError);
            if (/worker-timeout|memory|allocation|pixel-limit/i.test(workerMessage)) throw workerError;
          }
        }

        if (!workerCompleted) {
          loaded = await loadImageSource(item.file, { width: item.sourceWidth, height: item.sourceHeight });
          if (!runIsCurrent()) { loaded.dispose?.(); return; }
          if (removedItemIdsRef.current.has(item.id)) { loaded.dispose?.(); continue; }
          if (!loaded.width || !loaded.height || loaded.width * loaded.height > MAX_PIXELS) {
            throw new Error("Image dimensions exceed the safe processing limit");
          }
          transparency = await detectTransparency(loaded.source, loaded.width, loaded.height);
          if (!runIsCurrent() || removedItemIdsRef.current.has(item.id)) { loaded.dispose?.(); if (!runIsCurrent()) return; continue; }
          const canvas = document.createElement("canvas");
          const target = constrainForMobileMemory(loaded.width, loaded.height);
          canvas.width = target.width; canvas.height = target.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas 2D context unavailable");
          if (format === "image/jpeg") { ctx.fillStyle = backgroundColor; ctx.fillRect(0, 0, canvas.width, canvas.height); }
          else ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(loaded.source, 0, 0, canvas.width, canvas.height);
          resultWidth = canvas.width;
          resultHeight = canvas.height;
          try {
            blob = await withTimeout(canvasToBlob(canvas, getMimeForFormat(format), quality), 12_000, "canvas-export-timeout");
          } finally {
            releaseCanvas(canvas);
          }
          loaded.dispose?.();
          loaded = null;
        }
        if (!runIsCurrent()) return;
        if (removedItemIdsRef.current.has(item.id)) continue;
        if (!blob || blob.size <= 0) throw new Error("Failed to export image");
        producedResultUrl = await createBlobUrlOrDataUrl(blob);
        if (!runIsCurrent() || removedItemIdsRef.current.has(item.id)) {
          safeRevokeObjectUrl(producedResultUrl);
          if (!runIsCurrent()) return;
          continue;
        }
        nextItems[i] = { ...item, status: "done", error: undefined, resultBlob: blob, resultUrl: producedResultUrl, outputSize: blob.size, outputFormat: format, outputName: names[i], width: resultWidth, height: resultHeight, transparency, isNew: false };
      } catch (error) {
        loaded?.dispose?.();
        if (!runIsCurrent()) return;
        if (removedItemIdsRef.current.has(item.id)) {
          if (producedResultUrl) safeRevokeObjectUrl(producedResultUrl);
          continue;
        }
        const memorySafety = isMobileMemorySafetyError(error);
        if (memorySafety) {
          memoryFailureCount += 1;
          setMessage(mobileMemoryErrorMessage(locale));
        }
        nextItems[i] = { ...item, status: "error", error: memorySafety ? mobileMemoryErrorMessage(locale) : error instanceof Error ? error.message : "Unknown error", isNew: false };
      }
      publishCurrentItems();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    if (!runIsCurrent()) return;
    const liveNextItems = nextItems.filter((item) => !removedItemIdsRef.current.has(item.id));
    const done = liveNextItems.filter((item) => item.status === "done").length;
    const failed = liveNextItems.filter((item) => item.status === "error").length;
    const cancelled = liveNextItems.filter((item) => item.status === "cancelled").length;
    setProcessing(false);
    const summaryMessage = locale === "ko" ? `${done}개 완료 · ${failed}개 실패${cancelled ? ` · ${cancelled}개 취소` : ""}` : locale === "en" ? `${done} done · ${failed} failed${cancelled ? ` · ${cancelled} cancelled` : ""}` : `${done}件完了・${failed}件失敗${cancelled ? `・${cancelled}件キャンセル` : ""}`;
    setMessage(memoryFailureCount > 0 ? `${mobileMemoryErrorMessage(locale)} ${summaryMessage}` : summaryMessage);
  };

  const downloadAllZip = async () => {
    const readyFiles = items.filter((item) => item.status === "done" && item.resultBlob).map((item) => ({ name: item.outputName ?? `${baseName(item.file.name)}.${getExtensionForFormat(item.outputFormat)}`, blob: item.resultBlob as Blob }));
    if (readyFiles.length === 0) return;
    setZipState("working");
    try {
      const zipBlob = await createStoredZip(readyFiles);
      setZipState(downloadBlob(zipBlob, `fixlgs-image-converter.zip`) ? "idle" : "error");
    } catch { setZipState("error"); }
  };

  const hasDownloadableResults = items.some((item) => item.status === "done" && item.resultBlob);

  return (
    <div className="toolbox-tool-workflow">
      <section className="toolbox-workbench">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          if (event.dataTransfer.files.length > 0) {
            void addFiles(event.dataTransfer.files);
          }
        }}
        className={`toolbox-workbench-upload ${dragActive ? "is-dragging" : ""}`}
      >
        <div className="toolbox-workbench-topline">
          <div><span>WORKSPACE</span><strong>{locale === "ko" ? "이미지 변환 작업장" : locale === "en" ? "Image conversion workspace" : "画像変換ワークスペース"}</strong></div>
        </div>
        <input
          data-testid="converter-file-input"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          className="hidden"
          onChange={(event) => {
            const input = event.currentTarget;
            const selectedFiles = input.files ? Array.from(input.files) : [];
            if (selectedFiles.length > 0) {
              // Android/Samsung file pickers can expose content-provider-backed Files.
              // Keep the input selection alive until async read/decode has finished;
              // clearing it immediately can release the underlying file handle too early.
              void addFiles(selectedFiles).finally(() => {
                input.value = "";
              });
            }
          }}
        />
        {items.length === 0 ? (
          <div className="toolbox-upload-focus">
            <span className="toolbox-upload-icon" aria-hidden="true">＋</span>
            <h2>{locale === "ko" ? "이미지를 여기에 놓으세요" : locale === "en" ? "Drop images here" : "画像をここにドロップ"}</h2>
            <p>{locale === "ko" ? "여러 파일을 한 번에 추가하거나 아래 버튼으로 선택할 수 있습니다." : locale === "en" ? "Add several files at once, or choose them with the button below." : "複数ファイルをまとめて追加するか、下のボタンから選択できます。"}</p>
            <button type="button" onClick={() => fileInputRef.current?.click()}>{locale === "ko" ? "이미지 선택" : locale === "en" ? "Choose images" : "画像を選択"}</button>
            <small>{supportedLabel}</small>
          </div>
        ) : (
          <div className="toolbox-upload-active">
            <div className="toolbox-upload-active-head">
              <div>
                <span>{locale === "ko" ? "선택한 이미지" : locale === "en" ? "Selected images" : "選択した画像"}</span>
                <p>{locale === "ko" ? "파일을 놓은 자리에서 순서, 형식, 상태와 결과를 바로 확인합니다." : locale === "en" ? "Manage order, format, status, and results where you added the files." : "追加した場所で順序、形式、状態、結果を確認できます。"}</p>
              </div>
              <div className="toolbox-upload-active-actions">
                <div className="toolbox-file-stats">
                  <span>{items.length} files</span>
                  <span>{aggregate.done} done</span>
                  <span>{aggregate.failed} failed</span>
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()}>＋ {locale === "ko" ? "이미지 추가" : locale === "en" ? "Add images" : "画像を追加"}</button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <article key={item.id} data-testid="converter-file-card" data-status={item.status} className="overflow-hidden rounded-[1.5rem] border border-border bg-surface-2">
                <div className="aspect-[4/3] bg-black/5 dark:bg-white/5">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                    onLoad={(event) => {
                      const image = event.currentTarget;
                      const width = image.naturalWidth;
                      const height = image.naturalHeight;
                      if (!width || !height) return;
                      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, width, height } : entry));
                    }}
                    onError={() => {
                      if (item.previewFallbackAttempted) return;
                      void readBlobAsDataUrl(item.file).then((dataUrl) => {
                        setItems((current) => current.map((entry) => {
                          if (entry.id !== item.id) return entry;
                          safeRevokeObjectUrl(entry.previewUrl);
                          return { ...entry, previewUrl: dataUrl, previewFallbackAttempted: true };
                        }));
                      }).catch(() => {
                        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, previewFallbackAttempted: true } : entry));
                      });
                    }}
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold" title={item.file.name}>
                        {item.file.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted">
                        {formatBytes(item.originalSize)} · {item.width ?? "-"}×{item.height ?? "-"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        item.status === "done"
                          ? "bg-success/10 text-success"
                          : item.status === "error"
                            ? "bg-warning/10 text-warning"
                            : item.status === "processing"
                              ? "bg-foreground/10 text-foreground dark:bg-white/10 dark:text-white"
                              : "border border-border text-muted"
                      }`}
                    >
                      {item.status === "done"
                        ? locale === "ko"
                          ? "완료"
                          : locale === "en"
                            ? "Done"
                            : "完了"
                        : item.status === "error"
                          ? locale === "ko"
                            ? "실패"
                            : locale === "en"
                              ? "Error"
                              : "失敗"
                          : item.status === "processing"
                            ? locale === "ko"
                              ? "변환중"
                              : locale === "en"
                                ? "Working"
                                : "処理中"
                            : locale === "ko"
                              ? "대기"
                              : locale === "en"
                                ? "Ready"
                                : "待機"}
                    </span>
                  </div>

                  <label className="flex flex-col gap-2 text-xs font-medium text-muted">
                    <span>{locale === "ko" ? "파일별 출력 형식" : locale === "en" ? "Per-file output format" : "ファイルごとの出力形式"}</span>
                    <select
                      value={item.outputFormat}
                      onChange={(event) => {
                        const value = event.target.value as OutputFormat;
                        setItems((prev) => prev.map((current) => (current.id === item.id ? { ...current, outputFormat: value } : current)));
                      }}
                      className="rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground dark:focus:border-white"
                    >
                      {outputOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label[locale]}
                        </option>
                      ))}
                    </select>
                  </label>

                  {item.status === "done" && item.resultBlob ? (
                    <div className="grid gap-2 rounded-2xl border border-border bg-surface p-3 text-xs leading-6 text-muted">
                      <div className="flex justify-between gap-3">
                        <span>{locale === "ko" ? "결과 용량" : locale === "en" ? "Output size" : "変換後サイズ"}</span>
                        <span className="font-medium text-foreground">{formatBytes(item.outputSize ?? 0)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>{locale === "ko" ? "용량 변화" : locale === "en" ? "Size change" : "容量変化"}</span>
                        <span className="font-medium text-foreground">{formatChange((item.outputSize ?? 0) - item.originalSize)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>{locale === "ko" ? "변화율" : locale === "en" ? "Rate" : "比率"}</span>
                        <span className="font-medium text-foreground">{formatPercent((item.outputSize ?? 0) - item.originalSize, item.originalSize)}</span>
                      </div>
                    </div>
                  ) : item.status === "error" ? (
                    <div className="rounded-2xl border border-warning/30 bg-warning/10 p-3 text-xs leading-6 text-warning">
                      {item.error || (locale === "ko" ? "변환 실패" : locale === "en" ? "Conversion failed" : "変換失敗")}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => moveItem(index, -1)}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium transition hover:border-foreground hover:text-foreground dark:hover:border-white dark:hover:text-white"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 1)}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium transition hover:border-foreground hover:text-foreground dark:hover:border-white dark:hover:text-white"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium transition hover:border-foreground hover:text-foreground dark:hover:border-white dark:hover:text-white"
                    >
                      {locale === "ko" ? "삭제" : locale === "en" ? "Remove" : "削除"}
                    </button>
                    {item.status === "done" && item.resultBlob ? (
                      <>
                        <button
                          type="button"
                          onClick={() => downloadBlob(item.resultBlob as Blob, item.outputName ?? `${baseName(item.file.name)}.${getExtensionForFormat(item.outputFormat)}`)}
                          className="ml-auto rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background dark:bg-white dark:text-black"
                        >
                          {locale === "ko" ? "다운로드" : locale === "en" ? "Download" : "保存"}
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
          </div>
        )}

        <div className="toolbox-workbench-settings-head">
          <div>
            <span>{locale === "ko" ? "출력 설정" : locale === "en" ? "Output settings" : "出力設定"}</span>
            <p>{locale === "ko" ? "파일을 추가한 뒤 원하는 형식과 품질을 선택하세요." : locale === "en" ? "Choose the format and quality after adding files." : "ファイル追加後に形式と画質を選択してください。"}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {outputOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAllFormats(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  globalFormat === option.value
                    ? "bg-foreground text-background dark:bg-white dark:text-black"
                    : "border border-border bg-surface-2 text-foreground hover:border-foreground hover:text-foreground dark:hover:border-white dark:hover:text-white"
                }`}
              >
                {option.label[locale]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <p className="text-sm font-medium text-foreground">{locale === "ko" ? "품질" : locale === "en" ? "Quality" : "画質"}</p>
            <p className="mt-1 text-sm text-muted">{effectiveQualityLabel}</p>
            {globalFormat !== "image/png" ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {(["auto", "high", "balanced", "space", "custom"] as QualityMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setQualityMode(mode)}
                    className={`rounded-full px-3 py-1.5 transition ${
                      qualityMode === mode
                        ? "bg-foreground text-background dark:bg-white dark:text-black"
                        : "border border-border bg-surface text-foreground hover:border-foreground hover:text-foreground dark:hover:border-white dark:hover:text-white"
                    }`}
                  >
                    {getQualityPresetLabel(mode, locale)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted">
                {locale === "ko"
                  ? "PNG는 기본 무손실 출력입니다."
                  : locale === "en"
                    ? "PNG is handled as lossless output."
                    : "PNGは無損失出力です。"}
              </p>
            )}
            {globalFormat !== "image/png" && qualityMode === "custom" ? (
              <div className="mt-4">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={customQuality}
                  onChange={(event) => setCustomQuality(Number(event.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>1</span>
                  <span>{customQuality}</span>
                  <span>100</span>
                </div>
              </div>
            ) : null}
          </div>

          {globalFormat === "image/jpeg" ? (
            <label className="flex min-w-52 flex-col gap-2 text-sm font-medium">
              <span>{locale === "ko" ? "JPG 배경색" : locale === "en" ? "JPG background" : "JPG背景色"}</span>
              <input
                type="color"
                value={backgroundColor}
                onChange={(event) => setBackgroundColor(event.target.value)}
                className="h-12 w-full cursor-pointer rounded-2xl border border-border bg-surface p-1"
              />
            </label>
          ) : null}
        </div>

        {advancedOpen ? (
          <div className="mt-4 rounded-2xl border border-border bg-surface p-4 text-sm leading-7 text-muted">
            {locale === "ko"
              ? "기본적으로 메타데이터는 제거됩니다. JPG는 투명 배경을 지원하지 않으므로 JPG로 변환할 때는 선택한 배경색으로 채워집니다."
              : locale === "en"
                ? "Metadata is removed by default. JPG does not support transparency, so transparent areas are filled with the selected background color when converting to JPG."
                : "メタデータは基本的に削除されます。JPGは透明背景に対応しないため、JPG変換時は選択した背景色で塗りつぶされます。"}
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="toolbox-workbench-actions">
            <button
              data-testid="converter-run"
              type="button"
              onClick={() => processing ? (cancelRef.current = true) : void convertAll(false)}
              disabled={false}
              className="toolbox-primary-action"
            >
              {processing
                ? (locale === "ko" ? "취소" : locale === "en" ? "Cancel" : "キャンセル")
                : hasDownloadableResults
                  ? (locale === "ko" ? "다시 변환" : locale === "en" ? "Convert again" : "もう一度変換")
                  : (locale === "ko" ? "변환하기" : locale === "en" ? "Convert" : "変換する")}
            </button>
            {!processing && hasDownloadableResults && items.some((item) => item.isNew) ? (
              <button type="button" onClick={() => void convertAll(true)}>
                {locale === "ko" ? "추가한 이미지만 변환" : locale === "en" ? "Convert added images" : "追加画像のみ変換"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={downloadAllZip}
              disabled={!hasDownloadableResults}
              className="toolbox-zip-action"
            >
              {zipState === "working" ? (locale === "ko" ? "ZIP 생성 중..." : locale === "en" ? "Creating ZIP..." : "ZIPを作成中...") : zipState === "error" ? (locale === "ko" ? "ZIP 다시 만들기" : locale === "en" ? "Create ZIP Again" : "ZIPを再作成") : (locale === "ko" ? "전체 ZIP 다운로드" : locale === "en" ? "Download all as ZIP" : "すべてZIPで保存")}
            </button>
            <button
              type="button"
              className="toolbox-restart-action"
              onClick={clearAll}
            >
              {locale === "ko" ? "전체 초기화" : locale === "en" ? "Reset all" : "すべてリセット"}
            </button>
          </div>
        ) : null}
      </div>

      {message ? (
        <div className="toolbox-workbench-notice">
          <strong className="mr-2 text-foreground">{locale === "ko" ? "안내" : locale === "en" ? "Notice" : "案内"}</strong>
          <span>{message}</span>
        </div>
      ) : null}


      </section>

      <section className="toolbox-next-work">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{locale === "ko" ? "다음 작업" : locale === "en" ? "Next steps" : "次の作業"}</h2>
            <p className="mt-1 text-sm text-muted">
              {locale === "ko"
                ? "이 결과를 이어서 활용하기 좋은 도구를 먼저 보여줍니다."
                : locale === "en"
                  ? "Tools that naturally continue this result are shown first."
                  : "この結果を続けて使いやすいツールを先に表示します。"}
            </p>
          </div>
          <a href={`/${locale}`} className="text-sm font-medium text-foreground">
            {locale === "ko" ? "카테고리로 돌아가기" : locale === "en" ? "Back to categories" : "カテゴリへ戻る"}
          </a>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ToolCardSkeleton title={locale === "ko" ? "이미지 압축기" : locale === "en" ? "Image Compressor" : "画像圧縮"} description={locale === "ko" ? "001의 다음 흐름으로 연결되는 도구" : locale === "en" ? "Natural next step after conversion" : "変換後の次に使いやすいツール"} />
          <ToolCardSkeleton title={locale === "ko" ? "이미지 크기 변경기" : locale === "en" ? "Image Resizer" : "画像サイズ変更"} description={locale === "ko" ? "웹용 크기 조정에 연결" : locale === "en" ? "For resizing before upload" : "アップロード前のサイズ調整"} />
          <ToolCardSkeleton title={locale === "ko" ? "웹 이미지 최적화기" : locale === "en" ? "Web Image Optimizer" : "Web最適化"} description={locale === "ko" ? "용량 줄이기와 웹 최적화" : locale === "en" ? "For lighter web-ready assets" : "軽量なWeb向け画像へ"} />
        </div>
      </section>
    </div>
  );
}

function ToolCardSkeleton({ title, description }: { title: string; description: string }) {
  return (
    <div className="toolbox-next-work-card">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <div className="toolbox-next-work-card-foot"><span>Coming soon</span><strong aria-hidden="true">↗</strong></div>
    </div>
  );
}

