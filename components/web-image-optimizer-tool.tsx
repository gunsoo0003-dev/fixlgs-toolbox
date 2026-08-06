"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/site";
import { createStoredZip } from "@/lib/zip";

type Format = "auto" | "original" | "jpg" | "png" | "webp" | "avif";
type OutputFormat = Exclude<Format, "auto" | "original">;
type UseCase = "web" | "blog" | "shop" | "portfolio" | "smallest" | "custom";
type Level = "auto" | "quality" | "balanced" | "speed" | "smallest" | "custom";
type Kind = "auto" | "photo" | "transparent" | "graphic" | "screenshot" | "keep";
type DetectedKind = Exclude<Kind, "auto" | "keep">;
type Status = "ready" | "analyzing" | "processing" | "done" | "kept" | "failed" | "excluded" | "cancelled";
type SizeMode = "auto" | "original" | "width" | "long" | "box";

type Settings = {
  useCase: UseCase;
  level: Level;
  format: Format;
  kind: Kind;
  sizeMode: SizeMode;
  width: number;
  height: number;
  preventUpscale: boolean;
  quality: number;
  excluded: boolean;
  background: string;
};

type QualityReport = {
  similarity: number;
  alphaDifference: number;
  colorDifference: number;
  edgeDifference: number;
  passed: boolean;
  label: string;
};

type Candidate = {
  format: OutputFormat;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  elapsed: number;
  quality: number;
  report: QualityReport;
  note: string;
};

type Item = {
  id: string;
  file: File;
  name: string;
  sourceFormat: OutputFormat;
  width: number;
  height: number;
  hasAlpha: boolean;
  previewUrl: string;
  settings: Settings;
  individual: boolean;
  expanded: boolean;
  status: Status;
  progress: number;
  detected: DetectedKind;
  fingerprint: string;
  reason?: string;
  resultBlob?: Blob;
  resultUrl?: string;
  resultName?: string;
  resultFormat?: OutputFormat;
  resultWidth?: number;
  resultHeight?: number;
  resultSize?: number;
  candidates?: Candidate[];
  error?: string;
};

// 007 browser-safety limits. These values are validated by the dedicated 007 checker.
export const WEB_IMAGE_OPTIMIZER_LIMITS = {
  count: 10,
  perFile: 15 * 1024 * 1024,
  total: 50 * 1024 * 1024,
  pixels: 20_000_000,
  totalPixels: 20_000_000,
  maxSide: 16_384,
};

const defaults: Settings = {
  useCase: "web",
  level: "auto",
  format: "auto",
  kind: "auto",
  sizeMode: "auto",
  width: 1_920,
  height: 1_920,
  preventUpscale: true,
  quality: 84,
  excluded: false,
  background: "#ffffff",
};

const copy = {
  ko: {
    drop: "이미지를 여기에 놓거나 선택하세요",
    choose: "이미지 선택",
    add: "이미지 추가",
    support: "JPG, PNG, WebP, AVIF · 정적 이미지",
    local: "파일은 서버로 전송되지 않고 브라우저에서 처리됩니다.",
    safeLimit: "안전 처리 한도: 최대 10개 · 파일당 15MB · 전체 50MB · 파일당/전체 2천만 픽셀 · 최대 한 변 16,384px",
    workspace: "웹 이미지 최적화 작업장",
    useCase: "사용 목적",
    level: "최적화 수준",
    format: "출력 형식",
    size: "최대 크기",
    advanced: "고급 설정",
    web: "일반 웹",
    blog: "블로그·콘텐츠",
    shop: "쇼핑몰 상품",
    portfolio: "고화질 포트폴리오",
    smallest: "용량 최소화",
    custom: "직접 설정",
    auto: "자동 추천",
    quality: "품질 우선",
    balanced: "균형",
    speed: "속도 우선",
    autoSelect: "자동 선택",
    keep: "원본 유지",
    originalSize: "원본 크기 유지",
    maxWidth: "최대 가로 폭",
    long: "긴 변 제한",
    box: "최대 영역",
    prevent: "작은 이미지 확대 안 함",
    apply: "모든 파일에 적용",
    globalSettings: "전체 설정",
    workflowHint: "전체 설정을 확인한 뒤 ‘전체 이미지 최적화’를 누르세요. 결과가 생성되면 파일별 다운로드와 전체 ZIP 다운로드를 사용할 수 있습니다.",
    run: "전체 이미지 최적화",
    processingAll: "전체 이미지 최적화 중...",
    processing: "이미지 형식과 품질을 비교하고 있습니다.",
    done: "최적화 완료",
    kept: "원본 유지",
    failed: "최적화 실패",
    excluded: "처리 제외",
    reason: "자동 선택 이유",
    details: "후보 상세",
    hide: "상세 닫기",
    compare: "원본과 비교",
    adjust: "설정 변경",
    download: "다운로드",
    zip: "전체 ZIP 다운로드",
    again: "전체 이미지 다시 최적화",
    reset: "전체 초기화",
    remove: "삭제",
    up: "위로",
    down: "아래로",
    individual: "개별 설정",
    close: "설정 닫기",
    exclude: "이 파일 처리 제외",
    type: "이미지 유형",
    photo: "사진",
    transparent: "투명 그래픽·로고",
    graphic: "그래픽·아이콘",
    screenshot: "스크린샷·텍스트",
    detected: "자동 추정",
    original: "원본",
    result: "결과",
    saved: "절감률",
    cancel: "대기 작업 취소",
    noFiles: "이미지를 추가하면 파일별 분석 결과가 표시됩니다.",
    confirmApply: "개별 설정을 전체 설정으로 덮어씁니다.",
    unsupported: "지원하지 않는 형식이거나 애니메이션 이미지입니다.",
    limit: "브라우저 보호를 위한 안전 범위를 초과했습니다.",
    fit: "화면 맞춤",
    hundred: "100% 보기",
    zoomIn: "확대",
    zoomOut: "축소",
    keepNow: "이 파일은 원본 유지",
    optimizeThis: "이 파일만 최적화",
    regenerate: "이 파일만 다시 최적화",
    resultActions: "결과 다운로드",
    comparePosition: "비교 위치",
    qualityPass: "품질 기준 통과",
    qualityFail: "품질 기준 미달",
    transparencyProtected: "투명도 보호",
    currentFileFinishes: "현재 후보 생성이 끝난 뒤 대기 작업을 중단합니다.",
    changedNeedsRun: "설정이 변경되었습니다. 다시 최적화하면 결과에 반영됩니다.",
    loadSaving: "페이지 10회 로드 기준 단순 전송량 절감",
  },
  en: {
    drop: "Drop your images here or choose files",
    choose: "Choose Images",
    add: "Add Images",
    support: "JPG, PNG, WebP, AVIF · static images",
    local: "Your files are processed in your browser and are not uploaded to a server.",
    safeLimit: "Safe limits: up to 10 files · 15 MB each · 50 MB total · 20 million pixels per file and in total · max side 16,384 px",
    workspace: "Web image optimization workspace",
    useCase: "Use Case",
    level: "Optimization Level",
    format: "Output Format",
    size: "Maximum Size",
    advanced: "Advanced Settings",
    web: "General Web",
    blog: "Blog & Content",
    shop: "Online Store",
    portfolio: "High-Quality Portfolio",
    smallest: "Smallest File Size",
    custom: "Custom",
    auto: "Auto Recommended",
    quality: "Quality First",
    balanced: "Balanced",
    speed: "Speed First",
    autoSelect: "Auto Select",
    keep: "Keep Original",
    originalSize: "Keep Original Dimensions",
    maxWidth: "Maximum Width",
    long: "Long Edge Limit",
    box: "Maximum Area",
    prevent: "Do Not Enlarge Smaller Images",
    apply: "Apply to All Images",
    globalSettings: "Global Settings",
    workflowHint: "Review the global settings, then select Optimize All Images. When processing finishes, file downloads and the ZIP download will appear.",
    run: "Optimize All Images",
    processingAll: "Optimizing All Images...",
    processing: "Comparing image formats and quality...",
    done: "Optimization Complete",
    kept: "Original File Kept",
    failed: "Optimization Failed",
    excluded: "Excluded",
    reason: "Selection Reason",
    details: "Candidate Details",
    hide: "Hide Details",
    compare: "Compare Quality",
    adjust: "Adjust Settings",
    download: "Download",
    zip: "Download All as ZIP",
    again: "Optimize All Images Again",
    reset: "Reset All",
    remove: "Remove",
    up: "Move up",
    down: "Move down",
    individual: "Individual Settings",
    close: "Close Settings",
    exclude: "Exclude this file",
    type: "Image Type",
    photo: "Photo",
    transparent: "Transparent Graphic & Logo",
    graphic: "Graphics & Icons",
    screenshot: "Screenshot & Text",
    detected: "Auto Detected",
    original: "Original",
    result: "Result",
    saved: "Savings",
    cancel: "Cancel Waiting Files",
    noFiles: "Add images to see analysis for each file.",
    confirmApply: "Individual settings will be replaced by the global settings.",
    unsupported: "This file is unsupported or animated.",
    limit: "This file exceeds the browser-safety range.",
    fit: "Fit to Screen",
    hundred: "100%",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    keepNow: "Keep Original for This File",
    optimizeThis: "Optimize This Image",
    regenerate: "Optimize This Image Again",
    resultActions: "Download Results",
    comparePosition: "Comparison position",
    qualityPass: "Quality check passed",
    qualityFail: "Quality check failed",
    transparencyProtected: "Transparency protected",
    currentFileFinishes: "The current candidate will finish before queued work stops.",
    changedNeedsRun: "Settings changed. Optimize again to apply them.",
    loadSaving: "Simple transfer saving across 10 page loads",
  },
  ja: {
    drop: "画像をここにドロップするか、ファイルを選択してください",
    choose: "画像を選択",
    add: "画像を追加",
    support: "JPG・PNG・WebP・AVIF · 静止画像",
    local: "ファイルはサーバーに送信されず、ブラウザ内で処理されます。",
    safeLimit: "安全処理上限: 最大10件 · 1件15MB · 合計50MB · 1件/合計2,000万画素 · 最大辺16,384px",
    workspace: "Web画像最適化ワークスペース",
    useCase: "使用目的",
    level: "最適化レベル",
    format: "出力形式",
    size: "最大サイズ",
    advanced: "詳細設定",
    web: "一般Web",
    blog: "ブログ・コンテンツ",
    shop: "オンラインショップ商品",
    portfolio: "高画質ポートフォリオ",
    smallest: "容量を最小化",
    custom: "カスタム設定",
    auto: "自動おすすめ",
    quality: "画質を優先",
    balanced: "バランス",
    speed: "速度を優先",
    autoSelect: "自動選択",
    keep: "元のファイルを維持",
    originalSize: "元の画像サイズを維持",
    maxWidth: "最大横幅",
    long: "長辺の上限",
    box: "最大領域",
    prevent: "小さい画像を拡大しない",
    apply: "すべての画像に適用",
    globalSettings: "全体設定",
    workflowHint: "全体設定を確認してから「すべての画像を最適化」を押してください。処理後に個別ダウンロードとZIPダウンロードが表示されます。",
    run: "すべての画像を最適化",
    processingAll: "すべての画像を最適化中...",
    processing: "画像形式と画質を比較しています。",
    done: "最適化完了",
    kept: "元のファイルを維持",
    failed: "最適化失敗",
    excluded: "処理対象外",
    reason: "自動選択の理由",
    details: "候補の詳細",
    hide: "詳細を閉じる",
    compare: "画質を比較",
    adjust: "設定を変更",
    download: "ダウンロード",
    zip: "すべてZIPでダウンロード",
    again: "すべての画像を再最適化",
    reset: "すべてリセット",
    remove: "削除",
    up: "上へ",
    down: "下へ",
    individual: "個別設定",
    close: "設定を閉じる",
    exclude: "このファイルを処理しない",
    type: "画像タイプ",
    photo: "写真",
    transparent: "透明グラフィック・ロゴ",
    graphic: "グラフィック・アイコン",
    screenshot: "スクリーンショット・文字",
    detected: "自動推定",
    original: "元画像",
    result: "結果",
    saved: "削減率",
    cancel: "待機中をキャンセル",
    noFiles: "画像を追加するとファイルごとの解析結果が表示されます。",
    confirmApply: "個別設定を全体設定で上書きします。",
    unsupported: "未対応形式またはアニメーション画像です。",
    limit: "ブラウザ保護用の安全範囲を超えています。",
    fit: "画面に合わせる",
    hundred: "100%表示",
    zoomIn: "拡大",
    zoomOut: "縮小",
    keepNow: "このファイルは元画像を維持",
    optimizeThis: "この画像だけ最適化",
    regenerate: "この画像だけ再最適化",
    resultActions: "結果をダウンロード",
    comparePosition: "比較位置",
    qualityPass: "画質基準を通過",
    qualityFail: "画質基準に未達",
    transparencyProtected: "透明度を保護",
    currentFileFinishes: "現在の候補生成が完了した後、待機中の処理を停止します。",
    changedNeedsRun: "設定が変更されました。再最適化すると結果に反映されます。",
    loadSaving: "ページ10回表示時の単純転送量削減",
  },
} as const;

function pretty(bytes: number) {
  return bytes < 1_024
    ? `${bytes} B`
    : bytes < 1_048_576
      ? `${(bytes / 1_024).toFixed(1)} KB`
      : `${(bytes / 1_048_576).toFixed(2)} MB`;
}

function extFormat(file: File): OutputFormat | null {
  const extension = file.name.toLowerCase().split(".").pop();
  if (file.type === "image/jpeg" || extension === "jpg" || extension === "jpeg") return "jpg";
  if (file.type === "image/png" || extension === "png") return "png";
  if (file.type === "image/webp" || extension === "webp") return "webp";
  if (file.type === "image/avif" || extension === "avif") return "avif";
  return null;
}

function signatureMatches(buffer: ArrayBuffer, format: OutputFormat) {
  const bytes = new Uint8Array(buffer);
  if (format === "jpg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (format === "png") return bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const decoder = new TextDecoder();
  if (format === "webp") return decoder.decode(bytes.slice(0, 4)) === "RIFF" && decoder.decode(bytes.slice(8, 12)) === "WEBP";
  const brand = decoder.decode(bytes.slice(4, 20));
  return brand.includes("ftypavif") || brand.includes("ftypavis");
}

function hasChunk(buffer: ArrayBuffer, name: string, start = 0, end?: number) {
  const bytes = new Uint8Array(buffer);
  const query = new TextEncoder().encode(name);
  const limit = Math.min(bytes.length, end ?? bytes.length);
  outer: for (let index = start; index <= limit - query.length; index += 1) {
    for (let offset = 0; offset < query.length; offset += 1) {
      if (bytes[index + offset] !== query[offset]) continue outer;
    }
    return true;
  }
  return false;
}

function isAnimated(buffer: ArrayBuffer, format: OutputFormat) {
  if (format === "png") return hasChunk(buffer, "acTL", 8);
  if (format === "webp") return hasChunk(buffer, "ANIM", 12, 1_024) || hasChunk(buffer, "ANMF", 12, 1_024);
  if (format === "avif") return hasChunk(buffer, "avis", 0, 128) || hasChunk(buffer, "trak", 0, 8_192);
  return false;
}

async function drawable(file: Blob) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap as CanvasImageSource, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // Fallback below.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("decode"));
      image.src = url;
    });
    return { source: image as CanvasImageSource, width: image.naturalWidth, height: image.naturalHeight, close: () => undefined };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function mime(format: OutputFormat) {
  if (format === "jpg") return "image/jpeg";
  return `image/${format}`;
}

function remoteImport(url: string): Promise<unknown> {
  return Function("u", "return import(u)")(url) as Promise<unknown>;
}

async function encodeAvif(imageData: ImageData, quality: number) {
  const module = (await remoteImport("https://esm.sh/@jsquash/avif@2.1.1")) as {
    encode: (data: ImageData, options: { cqLevel: number; speed: number }) => Promise<ArrayBuffer>;
  };
  const result = await module.encode(imageData, {
    cqLevel: Math.round((1 - quality) * 50),
    speed: 6,
  });
  return new Blob([new Uint8Array(result)], { type: "image/avif" });
}

async function canvasBlob(canvas: HTMLCanvasElement, format: OutputFormat, quality: number) {
  if (format === "avif") {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("canvas");
    return encodeAvif(context.getImageData(0, 0, canvas.width, canvas.height), quality);
  }
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode"))), mime(format), quality);
  });
}

function analyse(context: CanvasRenderingContext2D, width: number, height: number, alpha: boolean): DetectedKind {
  if (alpha) return "transparent";
  const sampleWidth = Math.min(128, width);
  const sampleHeight = Math.min(128, height);
  const data = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
  let edges = 0;
  let variance = 0;
  let mean = 0;
  let lowChroma = 0;
  const count = data.length / 4;
  for (let index = 0; index < data.length; index += 4) {
    const value = (data[index] + data[index + 1] + data[index + 2]) / 3;
    mean += value;
    if (Math.max(data[index], data[index + 1], data[index + 2]) - Math.min(data[index], data[index + 1], data[index + 2]) < 18) lowChroma += 1;
  }
  mean /= count;
  for (let y = 1; y < sampleHeight; y += 1) {
    for (let x = 1; x < sampleWidth; x += 1) {
      const index = (y * sampleWidth + x) * 4;
      const left = (y * sampleWidth + x - 1) * 4;
      const up = ((y - 1) * sampleWidth + x) * 4;
      const value = (data[index] + data[index + 1] + data[index + 2]) / 3;
      variance += (value - mean) ** 2;
      const leftValue = (data[left] + data[left + 1] + data[left + 2]) / 3;
      const upValue = (data[up] + data[up + 1] + data[up + 2]) / 3;
      if (Math.abs(value - leftValue) > 38 || Math.abs(value - upValue) > 38) edges += 1;
    }
  }
  const edgeRatio = edges / Math.max(1, (sampleWidth - 1) * (sampleHeight - 1));
  const varianceRatio = variance / count;
  if (edgeRatio > 0.28 || (edgeRatio > 0.17 && lowChroma / count > 0.65)) return "screenshot";
  if (varianceRatio < 850 || edgeRatio > 0.18) return "graphic";
  return "photo";
}

function qualityFor(settings: Settings, format: OutputFormat) {
  let quality =
    settings.level === "quality"
      ? 0.93
      : settings.level === "speed"
        ? 0.82
        : settings.level === "smallest"
          ? 0.69
          : settings.level === "custom"
            ? settings.quality / 100
            : 0.85;
  if (settings.useCase === "portfolio") quality = Math.max(quality, 0.92);
  if (settings.useCase === "shop") quality = Math.max(quality, 0.89);
  if (format === "avif") quality = Math.min(0.91, quality + 0.02);
  return quality;
}

function targetSize(width: number, height: number, settings: Settings, kind: Kind) {
  if (settings.sizeMode === "original" || kind === "transparent" || kind === "graphic") return { width, height };
  let maximum = settings.width;
  if (settings.sizeMode === "auto") {
    maximum =
      settings.useCase === "blog"
        ? 1_600
        : settings.useCase === "shop"
          ? 2_000
          : settings.useCase === "portfolio"
            ? 2_560
            : settings.useCase === "smallest"
              ? 1_280
              : 1_920;
  }
  let ratio = 1;
  if (settings.sizeMode === "box") ratio = Math.min(settings.width / width, settings.height / height);
  else if (settings.sizeMode === "long") ratio = settings.width / Math.max(width, height);
  else ratio = maximum / width;
  if (settings.preventUpscale) ratio = Math.min(1, ratio);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function unique(name: string, used: Set<string>) {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot) : "";
  let index = 2;
  let candidate = `${base}-${index}${extension}`;
  while (used.has(candidate)) candidate = `${base}-${(index += 1)}${extension}`;
  used.add(candidate);
  return candidate;
}

function makeSampleCanvas(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 160 / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("canvas");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function edgeStrength(data: Uint8ClampedArray, width: number, height: number) {
  let total = 0;
  let count = 0;
  for (let y = 1; y < height; y += 1) {
    for (let x = 1; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const left = index - 4;
      const up = index - width * 4;
      const value = (data[index] + data[index + 1] + data[index + 2]) / 3;
      const leftValue = (data[left] + data[left + 1] + data[left + 2]) / 3;
      const upValue = (data[up] + data[up + 1] + data[up + 2]) / 3;
      total += Math.abs(value - leftValue) + Math.abs(value - upValue);
      count += 2;
    }
  }
  return total / Math.max(1, count);
}

async function compareQuality(referenceCanvas: HTMLCanvasElement, candidateBlob: Blob, kind: Kind, hasAlpha: boolean): Promise<QualityReport> {
  const candidate = await drawable(candidateBlob);
  const canvas = document.createElement("canvas");
  canvas.width = referenceCanvas.width;
  canvas.height = referenceCanvas.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("canvas");
  context.drawImage(candidate.source, 0, 0, canvas.width, canvas.height);
  candidate.close();
  const reference = referenceCanvas.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, canvas.width, canvas.height).data;
  const output = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let squared = 0;
  let colorDifference = 0;
  let alphaDifference = 0;
  for (let index = 0; index < reference.length; index += 4) {
    for (let channel = 0; channel < 3; channel += 1) {
      const difference = reference[index + channel] - output[index + channel];
      squared += difference * difference;
      colorDifference += Math.abs(difference);
    }
    alphaDifference += Math.abs(reference[index + 3] - output[index + 3]);
  }
  const pixels = reference.length / 4;
  const mse = squared / Math.max(1, pixels * 3);
  const similarity = Math.max(0, 1 - mse / (255 * 255));
  const normalizedColor = colorDifference / Math.max(1, pixels * 3 * 255);
  const normalizedAlpha = alphaDifference / Math.max(1, pixels * 255);
  const referenceEdge = edgeStrength(reference, canvas.width, canvas.height);
  const outputEdge = edgeStrength(output, canvas.width, canvas.height);
  const edgeDifference = Math.abs(referenceEdge - outputEdge) / Math.max(1, referenceEdge);
  const strict = kind === "screenshot" || kind === "graphic" || kind === "transparent";
  const passed =
    similarity >= (strict ? 0.988 : 0.978) &&
    normalizedColor <= (strict ? 0.032 : 0.048) &&
    edgeDifference <= (strict ? 0.18 : 0.3) &&
    (!hasAlpha || normalizedAlpha <= 0.005);
  return {
    similarity,
    alphaDifference: normalizedAlpha,
    colorDifference: normalizedColor,
    edgeDifference,
    passed,
    label: passed ? "pass" : "fail",
  };
}

export function WebImageOptimizerTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);
  const itemsRef = useRef<Item[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [global, setGlobal] = useState<Settings>(defaults);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [compareId, setCompareId] = useState<string | null>(null);
  const [zipState, setZipState] = useState<"idle" | "creating" | "error">("idle");
  const [comparePosition, setComparePosition] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState(true);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!running && !itemsRef.current.some((item) => item.resultBlob)) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [running]);

  useEffect(
    () => () => {
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        if (item.resultUrl && item.resultUrl !== item.previewUrl) URL.revokeObjectURL(item.resultUrl);
        item.candidates?.forEach((candidate) => URL.revokeObjectURL(candidate.url));
      });
    },
    [],
  );

  const patch = (id: string, patchValue: Partial<Item>, settingsPatch?: Partial<Settings>) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patchValue,
              settings: settingsPatch ? { ...item.settings, ...settingsPatch } : item.settings,
            }
          : item,
      ),
    );
  };

  const clearResult = (item: Item) => {
    if (item.resultUrl && item.resultUrl !== item.previewUrl) URL.revokeObjectURL(item.resultUrl);
    item.candidates?.forEach((candidate) => URL.revokeObjectURL(candidate.url));
  };

  async function fileFingerprint(file: File) {
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function addFiles(files: FileList | File[]) {
    setMessage("");
    const fingerprints = new Set(items.map((item) => item.fingerprint));
    const incomingUnique: Array<{ file: File; fingerprint: string }> = [];
    for (const file of Array.from(files)) {
      const fingerprint = await fileFingerprint(file);
      if (fingerprints.has(fingerprint)) continue;
      fingerprints.add(fingerprint);
      incomingUnique.push({ file, fingerprint });
    }
    const existingBytes = items.reduce((total, item) => total + item.file.size, 0);
    if (items.length + incomingUnique.length > WEB_IMAGE_OPTIMIZER_LIMITS.count || existingBytes + incomingUnique.reduce((total, entry) => total + entry.file.size, 0) > WEB_IMAGE_OPTIMIZER_LIMITS.total) {
      setMessage(t.limit);
      return;
    }
    const added: Item[] = [];
    let totalPixels = items.reduce((total, item) => total + item.width * item.height, 0);
    for (const { file, fingerprint } of incomingUnique) {
      try {
        if (file.size === 0 || file.size > WEB_IMAGE_OPTIMIZER_LIMITS.perFile) throw new Error("limit");
        const format = extFormat(file);
        if (!format) throw new Error("unsupported");
        const header = await file.slice(0, Math.min(file.size, 8_192)).arrayBuffer();
        if (!signatureMatches(header, format) || isAnimated(header, format)) throw new Error("unsupported");
        const decoded = await drawable(file);
        const pixelCount = decoded.width * decoded.height;
        if (pixelCount > WEB_IMAGE_OPTIMIZER_LIMITS.pixels || Math.max(decoded.width, decoded.height) > WEB_IMAGE_OPTIMIZER_LIMITS.maxSide || totalPixels + pixelCount > WEB_IMAGE_OPTIMIZER_LIMITS.totalPixels) {
          decoded.close();
          throw new Error("limit");
        }
        const sample = makeSampleCanvas(decoded.source, decoded.width, decoded.height);
        const context = sample.getContext("2d", { willReadFrequently: true })!;
        const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
        let hasAlpha = false;
        for (let index = 3; index < pixels.length; index += 4) {
          if (pixels[index] < 255) {
            hasAlpha = true;
            break;
          }
        }
        const detected = analyse(context, sample.width, sample.height, hasAlpha);
        const width = decoded.width;
        const height = decoded.height;
        decoded.close();
        totalPixels += pixelCount;
        added.push({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          sourceFormat: format,
          width,
          height,
          hasAlpha,
          previewUrl: URL.createObjectURL(file),
          settings: { ...global },
          individual: false,
          expanded: false,
          status: "ready",
          progress: 0,
          detected,
          fingerprint,
        });
      } catch (error) {
        setMessage(error instanceof Error && error.message === "limit" ? t.limit : t.unsupported);
      }
    }
    setItems((current) => [...current, ...added]);
  }

  function applyAll() {
    if (items.some((item) => item.individual) && !window.confirm(t.confirmApply)) return;
    setItems((current) =>
      current.map((item) => {
        clearResult(item);
        return {
          ...item,
          settings: { ...global },
          individual: false,
          status: "ready",
          resultBlob: undefined,
          resultUrl: undefined,
          resultName: undefined,
          candidates: undefined,
          reason: undefined,
          error: undefined,
        };
      }),
    );
    setMessage(t.changedNeedsRun);
  }

  function updateGlobal(value: Partial<Settings>) {
    setGlobal((current) => ({ ...current, ...value }));
    if (items.some((item) => item.resultBlob)) setMessage(t.changedNeedsRun);
  }

  function settingPanel(settings: Settings, onChange: (value: Partial<Settings>) => void, prefix: string) {
    return (
      <div className="optimizer-settings-grid">
        <fieldset>
          <legend>{t.useCase}</legend>
          <div className="optimizer-choice-grid">
            {(["web", "blog", "shop", "portfolio", "smallest", "custom"] as UseCase[]).map((value) => (
              <button type="button" className={settings.useCase === value ? "is-active" : ""} onClick={() => onChange({ useCase: value })} key={value}>
                {t[value]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t.level}</legend>
          <div className="optimizer-choice-grid">
            {(["auto", "quality", "balanced", "speed", "smallest", "custom"] as Level[]).map((value) => (
              <button type="button" className={settings.level === value ? "is-active" : ""} onClick={() => onChange({ level: value })} key={value}>
                {t[value]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t.format}</legend>
          <select value={settings.format} onChange={(event) => onChange({ format: event.target.value as Format })} aria-label={`${prefix}-${t.format}`}>
            <option value="auto">{t.autoSelect}</option>
            <option value="original">{t.keep}</option>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
            <option value="avif">AVIF</option>
          </select>
          {settings.format === "jpg" && (
            <div className="optimizer-background-setting">
              <small>{locale === "ko" ? "투명 영역에 적용할 배경색" : locale === "en" ? "Background for transparent areas" : "透明領域に適用する背景色"}</small>
              <div>
                <button type="button" className={settings.background === "#ffffff" ? "is-active" : ""} onClick={() => onChange({ background: "#ffffff" })}>{locale === "ko" ? "흰색" : locale === "en" ? "White" : "白"}</button>
                <button type="button" className={settings.background === "#000000" ? "is-active" : ""} onClick={() => onChange({ background: "#000000" })}>{locale === "ko" ? "검은색" : locale === "en" ? "Black" : "黒"}</button>
                <input type="color" value={settings.background} onChange={(event) => onChange({ background: event.target.value })} aria-label={locale === "ko" ? "사용자 지정 배경색" : locale === "en" ? "Custom background color" : "カスタム背景色"} />
              </div>
            </div>
          )}
        </fieldset>
        <fieldset>
          <legend>{t.size}</legend>
          <select value={settings.sizeMode} onChange={(event) => onChange({ sizeMode: event.target.value as SizeMode })} aria-label={`${prefix}-${t.size}`}>
            <option value="auto">{t.auto}</option>
            <option value="original">{t.originalSize}</option>
            <option value="width">{t.maxWidth}</option>
            <option value="long">{t.long}</option>
            <option value="box">{t.box}</option>
          </select>
          {settings.sizeMode !== "auto" && settings.sizeMode !== "original" && (
            <div className="optimizer-number-row optimizer-dimension-labels">
              <label><span>{locale === "ko" ? "최대 가로(px)" : locale === "en" ? "Max width (px)" : "最大横幅(px)"}</span><input aria-label={`${prefix}-width`} type="number" min="1" max={WEB_IMAGE_OPTIMIZER_LIMITS.maxSide} value={settings.width} onChange={(event) => onChange({ width: Number(event.target.value) })} /></label>
              {settings.sizeMode === "box" && <label><span>{locale === "ko" ? "최대 세로(px)" : locale === "en" ? "Max height (px)" : "最大縦幅(px)"}</span><input aria-label={`${prefix}-height`} type="number" min="1" max={WEB_IMAGE_OPTIMIZER_LIMITS.maxSide} value={settings.height} onChange={(event) => onChange({ height: Number(event.target.value) })} /></label>}
            </div>
          )}
          <label className="target-size-mode-toggle unified-option-toggle optimizer-check">
            <input type="checkbox" checked={settings.preventUpscale} onChange={(event) => onChange({ preventUpscale: event.target.checked })} />
            <span>{t.prevent}</span>
          </label>
        </fieldset>
        {settings.level === "custom" && (
          <fieldset>
            <legend>{t.quality}</legend>
            <input type="range" min="40" max="98" value={settings.quality} onChange={(event) => onChange({ quality: Number(event.target.value) })} />
            <strong>{settings.quality}</strong>
          </fieldset>
        )}
      </div>
    );
  }

  async function makeCandidate(canvas: HTMLCanvasElement, reference: HTMLCanvasElement, format: OutputFormat, quality: number, kind: Kind, hasAlpha: boolean) {
    const started = performance.now();
    const blob = await canvasBlob(canvas, format, quality);
    const report = await compareQuality(reference, blob, kind, hasAlpha);
    return {
      format,
      blob,
      url: URL.createObjectURL(blob),
      width: canvas.width,
      height: canvas.height,
      size: blob.size,
      elapsed: performance.now() - started,
      quality,
      report,
      note: report.passed ? t.qualityPass : t.qualityFail,
    } satisfies Candidate;
  }

  function candidateFormats(item: Item, kind: Kind): OutputFormat[] {
    if (item.settings.format === "original") return [] as OutputFormat[];
    if (item.settings.format !== "auto") return [item.settings.format] as OutputFormat[];
    if (kind === "transparent" || item.hasAlpha) return ["webp", "avif", "png"] as OutputFormat[];
    if (kind === "screenshot" || kind === "graphic") return item.settings.level === "smallest" ? (["webp", "png", "avif"] as OutputFormat[]) : (["webp", "png"] as OutputFormat[]);
    if (item.settings.level === "speed") return ["webp"] as OutputFormat[];
    return ["webp", "avif"] as OutputFormat[];
  }

  async function optimizeItem(base: Item, usedNames: Set<string>) {
    if (base.settings.excluded) {
      patch(base.id, { status: "excluded", progress: 100 });
      return;
    }
    patch(base.id, { status: "analyzing", progress: 10, error: undefined });
    const decoded = await drawable(base.file);
    const kind: Kind = base.settings.kind === "auto" ? base.detected : base.settings.kind;
    const size = targetSize(base.width, base.height, base.settings, kind);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("canvas");
    if (base.settings.format === "jpg" || (!base.hasAlpha && base.sourceFormat === "jpg")) {
      context.fillStyle = base.settings.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
    const reference = makeSampleCanvas(canvas, canvas.width, canvas.height);
    decoded.close();
    patch(base.id, { status: "processing", progress: 30 });

    if (kind === "keep" || base.settings.format === "original") {
      const resultName = unique(base.name, usedNames);
      patch(base.id, {
        status: "kept",
        progress: 100,
        resultBlob: base.file,
        resultUrl: base.previewUrl,
        resultName,
        resultFormat: base.sourceFormat,
        resultWidth: base.width,
        resultHeight: base.height,
        resultSize: base.file.size,
        reason: locale === "ko" ? "사용자가 원본 유지를 선택했습니다." : locale === "en" ? "The original was kept by user choice." : "ユーザー設定により元画像を維持しました。",
        candidates: [],
      });
      return;
    }

    const formats: OutputFormat[] = Array.from(new Set<OutputFormat>(candidateFormats(base, kind)));
    const candidates: Candidate[] = [];
    for (const format of formats) {
      if (cancelRef.current) break;
      if (base.hasAlpha && format === "jpg" && base.settings.format === "auto") continue;
      try {
        const quality = qualityFor(base.settings, format);
        const candidate = await makeCandidate(canvas, reference, format, quality, kind, base.hasAlpha && format !== "jpg");
        candidates.push(candidate);
      } catch {
        // One failed candidate must not fail the complete file.
      }
      patch(base.id, { progress: Math.min(85, 30 + Math.round((candidates.length / Math.max(1, formats.length)) * 55)) });
    }

    const minimumSaving = base.settings.level === "quality" ? 0.04 : base.settings.level === "smallest" ? 0.02 : 0.06;
    const worthwhile = candidates.filter((candidate) => candidate.report.passed && candidate.size <= base.file.size * (1 - minimumSaving));
    let best = worthwhile.sort((left, right) => left.size - right.size)[0];
    if ((base.settings.level === "balanced" || base.settings.level === "auto") && worthwhile.length > 1) {
      const webp = worthwhile.find((candidate) => candidate.format === "webp");
      const avif = worthwhile.find((candidate) => candidate.format === "avif");
      if (webp && avif && (avif.size > webp.size * 0.88 || avif.elapsed > webp.elapsed * 3.5)) best = webp;
    }

    if (!best) {
      const resultName = unique(base.name, usedNames);
      patch(base.id, {
        status: "kept",
        progress: 100,
        resultBlob: base.file,
        resultUrl: base.previewUrl,
        resultName,
        resultFormat: base.sourceFormat,
        resultWidth: base.width,
        resultHeight: base.height,
        resultSize: base.file.size,
        reason:
          locale === "ko"
            ? "용량·화질·투명도 기준을 모두 통과한 실질적 개선 후보가 없어 원본을 유지했습니다."
            : locale === "en"
              ? "The original was kept because no candidate passed size, quality and transparency checks with a meaningful improvement."
              : "容量・画質・透明度の基準を満たす有効な改善候補がないため元画像を維持しました。",
        candidates,
      });
      return;
    }

    const dot = base.name.lastIndexOf(".");
    const stem = dot > 0 ? base.name.slice(0, dot) : base.name;
    const resultName = unique(`${stem}.${best.format}`, usedNames);
    const reason =
      locale === "ko"
        ? `${kind === "photo" ? "사진형" : kind === "transparent" ? "투명 그래픽" : kind === "screenshot" ? "스크린샷·텍스트" : "그래픽"} 이미지로 판단하고 후보의 용량·화질·처리 시간을 비교해 ${best.format.toUpperCase()}를 선택했습니다.`
        : locale === "en"
          ? `${best.format.toUpperCase()} was selected after comparing the detected image type, file size, visual quality and processing time.`
          : `画像タイプ・容量・画質・処理時間を比較し、${best.format.toUpperCase()}を選択しました。`;
    patch(base.id, {
      status: "done",
      progress: 100,
      resultBlob: best.blob,
      resultUrl: best.url,
      resultName,
      resultFormat: best.format,
      resultWidth: best.width,
      resultHeight: best.height,
      resultSize: best.size,
      reason,
      candidates,
    });
  }

  async function run(ids?: string[]) {
    if (running || !items.length) return;
    setRunning(true);
    cancelRef.current = false;
    setMessage("");
    const usedNames = new Set<string>(items.filter((item) => item.resultName && (!ids || !ids.includes(item.id))).map((item) => item.resultName!));
    const targets = ids ? items.filter((item) => ids.includes(item.id)) : items;
    for (const item of targets) {
      if (cancelRef.current) {
        patch(item.id, { status: "cancelled" });
        continue;
      }
      try {
        clearResult(item);
        await optimizeItem({ ...item, resultBlob: undefined, resultUrl: undefined, candidates: undefined }, usedNames);
      } catch (error) {
        patch(item.id, { status: "failed", progress: 100, error: error instanceof Error ? error.message : t.failed });
      }
    }
    setRunning(false);
  }

  function remove(id: string) {
    setItems((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
        clearResult(item);
      }
      return current.filter((entry) => entry.id !== id);
    });
    if (compareId === id) setCompareId(null);
  }

  function move(id: string, direction: number) {
    setItems((current) => {
      const next = [...current];
      const index = next.findIndex((item) => item.id === id);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= next.length) return current;
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }

  function reset() {
    const currentItems = itemsRef.current;
    if ((running || currentItems.some((item) => item.resultBlob)) && !window.confirm(locale === "ko" ? "진행 중인 작업과 모든 결과를 제거합니다." : locale === "en" ? "Remove the active job and all results?" : "処理中の作業とすべての結果を削除しますか？")) return;
    cancelRef.current = true;
    currentItems.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      clearResult(item);
    });
    itemsRef.current = [];
    setItems([]);
    setRunning(false);
    setCompareId(null);
    setComparePosition(50);
    setZoom(1);
    setFitMode(true);
    setZipState("idle");
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function download(item: Item) {
    if (!item.resultBlob || !item.resultName) return;
    const url = URL.createObjectURL(item.resultBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = item.resultName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }

  async function zip() {
    const list = items.filter((item) => (item.status === "done" || item.status === "kept") && item.resultBlob && item.resultName);
    if (!list.length) return;
    setZipState("creating");
    try {
      const archive = await createStoredZip(list.map((item) => ({ name: item.resultName!, blob: item.resultBlob! })));
      const url = URL.createObjectURL(archive);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "fixlgs-web-image-optimizer.zip";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1_000);
      setZipState("idle");
    } catch {
      setZipState("error");
    }
  }

  function keepOriginal(item: Item) {
    clearResult(item);
    patch(item.id, {
      status: "kept",
      resultBlob: item.file,
      resultUrl: item.previewUrl,
      resultName: item.name,
      resultFormat: item.sourceFormat,
      resultWidth: item.width,
      resultHeight: item.height,
      resultSize: item.file.size,
      reason: locale === "ko" ? "사용자가 비교 후 원본 유지를 선택했습니다." : locale === "en" ? "The original was kept after manual comparison." : "比較後に元画像を維持しました。",
      candidates: [],
    });
  }

  const summary = useMemo(
    () =>
      items.reduce(
        (result, item) => {
          if (item.status !== "excluded") result.original += item.file.size;
          if (item.resultSize !== undefined) result.result += item.resultSize;
          if (item.status === "done") result.done += 1;
          if (item.status === "kept") result.kept += 1;
          if (item.status === "failed") result.failed += 1;
          return result;
        },
        { original: 0, result: 0, done: 0, kept: 0, failed: 0 },
      ),
    [items],
  );
  const compare = items.find((item) => item.id === compareId);
  const processedCount = items.filter((item) => ["done", "kept", "failed", "cancelled", "excluded"].includes(item.status)).length;
  const totalSaved = Math.max(0, summary.original - summary.result);
  const totalSavingRate = summary.original ? Math.max(0, Math.round((totalSaved / summary.original) * 100)) : 0;

  return (
    <div className="toolbox-tool-workflow optimizer-tool">
      <section className="toolbox-workbench target-size-workbench resizer-workbench optimizer-workbench" data-testid="optimizer-workbench">
        <div
          className="toolbox-workbench-upload"
          onDragOver={(event) => {
            event.preventDefault();
            event.currentTarget.classList.add("is-dragging");
          }}
          onDragLeave={(event) => event.currentTarget.classList.remove("is-dragging")}
          onDrop={(event) => {
            event.preventDefault();
            event.currentTarget.classList.remove("is-dragging");
            void addFiles(event.dataTransfer.files);
          }}
        >
          <div className="toolbox-workbench-topline">
            <div><span>WORKSPACE</span><strong>{t.workspace}</strong></div>
          </div>
          <input
            ref={inputRef}
            data-testid="optimizer-file-input"
            type="file"
            hidden
            multiple
            accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
            onChange={(event) => {
              if (event.target.files) void addFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
          {items.length === 0 ? (
            <div className="toolbox-upload-focus">
              <span className="toolbox-upload-icon" aria-hidden="true">＋</span>
              <h2>{t.drop}</h2>
              <p>{locale === "ko" ? "웹 사용 목적에 맞는 형식·크기·품질 후보를 비교합니다." : locale === "en" ? "Compare format, dimensions, and quality candidates for web use." : "Web用途に適した形式・サイズ・画質候補を比較します。"}</p>
              <button type="button" onClick={() => inputRef.current?.click()}>{t.choose}</button>
              <small><span>{t.support}</span><br /><span>{t.local}</span><br /><span data-testid="optimizer-safe-limit">{t.safeLimit}</span></small>
            </div>
          ) : (
            <div className="toolbox-upload-active toolbox-upload-summary-card target-size-upload-active">
              <div className="toolbox-upload-summary-main">
                <span className="toolbox-upload-summary-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M12 16V5m0 0L8 9m4-4 4 4M5 15v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3"/></svg></span>
                <div>
                  <strong>{locale === "ko" ? "선택한 이미지" : locale === "en" ? "Selected images" : "選択した画像"}</strong>
                  <p>{locale === "ko" ? "이미지를 이 작업장에 놓거나 버튼으로 추가하세요." : locale === "en" ? "Drop more images anywhere in this workspace, or use the button." : "このワークスペースに画像をドロップするか、ボタンで追加してください。"}</p>
                </div>
              </div>
              <div className="toolbox-upload-summary-actions">
                <div className="toolbox-file-stats">
                  <span>{items.length} files</span>
                  <span>{summary.done + summary.kept} done</span>
                  <span>{summary.failed} failed</span>
                </div>
                <button type="button" onClick={() => inputRef.current?.click()}>＋ {t.add}</button>
              </div>
            </div>
          )}
          <div className="toolbox-workbench-topline target-size-settings-head">
            <div><span>OPTIMIZE SETTINGS</span><strong>{t.globalSettings}</strong></div>
            <button type="button" className="target-size-apply" onClick={applyAll}>{t.apply}</button>
          </div>
          {settingPanel(global, updateGlobal, "global")}
          {items.length > 0 && <p className="optimizer-workflow-hint">{t.workflowHint}</p>}
          {items.some((item) => item.individual) && (
            <p className="target-size-warning" role="status">
              {items.filter((item) => item.individual).length} {locale === "ko" ? "개 파일에 개별 설정이 적용되어 있습니다. 전체 설정으로 바꾸려면 ‘모든 파일에 적용’을 누르세요." : locale === "en" ? "files use individual settings. Select Apply to All Images to replace them with the global settings." : "件に個別設定が適用されています。全体設定に変更する場合は「すべての画像に適用」を押してください。"}
            </p>
          )}
          {message && <p className="target-size-warning" role="alert">{message}</p>}
        </div>

        <div className="target-size-workbench-files">
          {items.length === 0 ? (
            <p className="compressor-empty">{t.noFiles}</p>
          ) : (
            <div className="target-size-list">
              {items.map((item, index) => {
                const saving = item.resultSize !== undefined ? Math.max(0, Math.round((1 - item.resultSize / item.file.size) * 100)) : 0;
                return (
                  <article className={`target-size-file-card optimizer-file-card status-${item.status}`} key={item.id} data-testid="optimizer-file-card" data-status={item.status}>
                    <img src={item.previewUrl} alt="" />
                    <div className="target-size-file-main">
                      <div className="target-size-file-title">
                        <div><strong>{item.name}</strong><span>{item.sourceFormat.toUpperCase()} · {pretty(item.file.size)} · {item.width}×{item.height}</span></div>
                        <b>{item.individual ? `${t.individual} · ` : ""}{item.status === "done" ? t.done : item.status === "kept" ? t.kept : item.status === "failed" ? t.failed : item.status === "excluded" ? t.excluded : item.status === "processing" || item.status === "analyzing" ? t.processing : item.status === "cancelled" ? t.cancel : t.detected}</b>
                      </div>
                      <div className="resizer-expected optimizer-expected">
                        <span>{t.original}<strong>{item.sourceFormat.toUpperCase()} · {item.width}×{item.height}</strong></span>
                        <i>→</i>
                        <span>{t.result}<strong>{item.resultFormat ? `${item.resultFormat.toUpperCase()} · ${item.resultWidth}×${item.resultHeight}` : (locale === "ko" ? "자동 추천" : locale === "en" ? "Auto recommended" : "自動おすすめ")}</strong></span>
                        {item.status === "kept" && <em>{t.kept}</em>}
                        {item.resultSize !== undefined && <small>{pretty(item.file.size)} → {pretty(item.resultSize)} · {t.saved} {saving}%</small>}
                      </div>
                      <div className="optimizer-detected">
                        <span>{t.type}: <strong>{item.detected === "photo" ? t.photo : item.detected === "transparent" ? t.transparent : item.detected === "screenshot" ? t.screenshot : t.graphic}</strong></span>
                        {item.hasAlpha && <span>{t.transparencyProtected}</span>}
                      </div>
                      {item.reason && <p className="optimizer-reason"><b>{t.reason}</b>{item.reason}</p>}
                      <div className="target-size-file-actions">
                        <button type="button" onClick={() => patch(item.id, { expanded: !item.expanded })}>{item.expanded ? t.close : t.individual}</button>
                        <button type="button" onClick={() => move(item.id, -1)} disabled={running || index === 0} aria-label={`${t.up}: ${item.name}`}>{t.up}</button>
                        <button type="button" onClick={() => move(item.id, 1)} disabled={running || index === items.length - 1} aria-label={`${t.down}: ${item.name}`}>{t.down}</button>
                        <button type="button" onClick={() => remove(item.id)} disabled={running} aria-label={`${t.remove}: ${item.name}`}>{t.remove}</button>
                        {item.resultBlob && <button type="button" onClick={() => { setCompareId(item.id); setComparePosition(50); setZoom(1); setFitMode(true); }}>{t.compare}</button>}
                        {item.resultBlob && <button type="button" className="optimizer-file-download" onClick={() => download(item)} aria-label={`${t.download}: ${item.name}`}>{t.download}</button>}
                      </div>
                      {item.expanded && (
                        <div className="resizer-file-settings optimizer-file-settings">
                          <label>{t.type}
                            <select value={item.settings.kind} onChange={(event) => { clearResult(item); patch(item.id, { individual: true, status: "ready", resultBlob: undefined, resultUrl: undefined, candidates: undefined }, { kind: event.target.value as Kind }); setMessage(t.changedNeedsRun); }}>
                              <option value="auto">{t.auto}</option><option value="photo">{t.photo}</option><option value="transparent">{t.transparent}</option><option value="graphic">{t.graphic}</option><option value="screenshot">{t.screenshot}</option><option value="keep">{t.keep}</option>
                            </select>
                          </label>
                          {settingPanel(item.settings, (value) => { clearResult(item); patch(item.id, { individual: true, status: "ready", resultBlob: undefined, resultUrl: undefined, candidates: undefined }, value); setMessage(t.changedNeedsRun); }, `file-${item.id}`)}
                          <label className="target-size-mode-toggle unified-option-toggle"><input type="checkbox" checked={item.settings.excluded} onChange={(event) => patch(item.id, { individual: true }, { excluded: event.target.checked })} /><span><strong>{t.exclude}</strong></span></label>
                        </div>
                      )}
                      {item.candidates && item.expanded && (
                        <div className="optimizer-candidates"><h4>{t.details}</h4>{item.candidates.map((candidate) => <div key={`${candidate.format}-${candidate.size}`} className={candidate.report.passed ? "is-pass" : "is-fail"}><b>{candidate.format.toUpperCase()}</b><span>{pretty(candidate.size)}</span><span>{Math.round(candidate.elapsed)}ms</span><span>{candidate.report.passed ? t.qualityPass : t.qualityFail}</span><span>{Math.round(candidate.report.similarity * 1000) / 10}%</span></div>)}</div>
                      )}
                      {(item.status === "processing" || item.status === "analyzing") && <div className="target-size-progress"><i style={{ width: `${item.progress}%` }} /><span>{item.progress}%</span></div>}
                      {item.error && <p className="target-size-warning">{item.error}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {running && <div className="target-size-progress resizer-overall-progress" role="status"><i style={{ width: `${Math.round(processedCount / Math.max(1, items.filter((item) => !item.settings.excluded).length) * 100)}%` }} /><span>{processedCount} / {items.filter((item) => !item.settings.excluded).length} · {t.processing}</span></div>}

        <div className="toolbox-workbench-actions">
          <button
            data-testid="optimizer-run"
            className="toolbox-primary-action"
            type="button"
            disabled={!running && (!items.length || items.every((item) => item.settings.excluded))}
            onClick={() => {
              if (running) {
                cancelRef.current = true;
                setMessage(t.currentFileFinishes);
                return;
              }
              void run();
            }}
          >{running ? t.cancel : items.some((item) => item.resultBlob) ? t.again : t.run}</button>
          <button
            data-testid="optimizer-zip"
            className="toolbox-zip-action"
            type="button"
            onClick={() => void zip()}
            disabled={!items.some((item) => item.resultBlob) || zipState === "creating"}
          >{zipState === "creating" ? (locale === "ko" ? "ZIP 생성 중..." : locale === "en" ? "Creating ZIP..." : "ZIP作成中...") : zipState === "error" ? (locale === "ko" ? "ZIP 다시 생성" : locale === "en" ? "Retry ZIP" : "ZIPを再作成") : t.zip}</button>
          <button data-testid="optimizer-reset" className="toolbox-restart-action" type="button" onClick={reset}>{t.reset}</button>
        </div>

        {items.some((item) => item.resultBlob) && (
          <div className="target-size-summary" data-testid="optimizer-summary">
            <div><p>RESULT</p><strong>{summary.done + summary.kept}</strong></div><span>{t.done}: {summary.done}</span><span>{t.kept}: {summary.kept}</span><span>{t.failed}: {summary.failed}</span><span>{t.original}: {pretty(summary.original)}</span><span>{t.result}: {pretty(summary.result)}</span><span>{pretty(totalSaved)} · {totalSavingRate}%</span>
          </div>
        )}
      </section>

      {compare && compare.resultUrl && (
        <section className="optimizer-compare target-size-workbench" data-testid="optimizer-compare">
          <div className="toolbox-workbench-topline"><div><span>COMPARE</span><strong>{compare.name}</strong></div><button type="button" onClick={() => setCompareId(null)} aria-label={t.close}>×</button></div>
          <div className="optimizer-compare-toolbar"><button type="button" onClick={() => { setFitMode(true); setZoom(1); }}>{t.fit}</button><button type="button" onClick={() => { setFitMode(false); setZoom(1); }}>{t.hundred}</button><button type="button" onClick={() => { setFitMode(false); setZoom((value) => Math.max(0.5, value - 0.25)); }}>{t.zoomOut}</button><strong>{Math.round(zoom * 100)}%</strong><button type="button" onClick={() => { setFitMode(false); setZoom((value) => Math.min(4, value + 0.25)); }}>{t.zoomIn}</button></div>
          <div className={`optimizer-slider-stage ${fitMode ? "is-fit" : ""}`}><div className="optimizer-slider-canvas" style={{ transform: `scale(${fitMode ? 1 : zoom})` }}><img className="optimizer-slider-original" src={compare.previewUrl} alt={`${t.original}: ${compare.name}`} /><div className="optimizer-slider-result" style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}><img src={compare.resultUrl} alt={`${t.result}: ${compare.name}`} /></div><i className="optimizer-slider-divider" style={{ left: `${comparePosition}%` }} /></div></div>
          <label className="optimizer-slider-range">{t.comparePosition}<input type="range" min="0" max="100" value={comparePosition} onChange={(event) => setComparePosition(Number(event.target.value))} aria-label={t.comparePosition} /></label>
          <div className="optimizer-compare-meta"><span>{t.original}: <b>{compare.sourceFormat.toUpperCase()} · {compare.width}×{compare.height} · {pretty(compare.file.size)}</b></span><span>{t.result}: <b>{compare.resultFormat?.toUpperCase()} · {compare.resultWidth}×{compare.resultHeight} · {pretty(compare.resultSize ?? 0)}</b></span></div>
          <div className="optimizer-compare-actions"><button type="button" onClick={() => keepOriginal(compare)}>{t.keepNow}</button></div>
        </section>
      )}
    </div>
  );
}
