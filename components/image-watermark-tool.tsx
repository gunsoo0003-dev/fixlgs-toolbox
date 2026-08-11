"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/site";
import { openFilePicker } from "@/lib/file-picker";

type WatermarkKind = "text" | "logo";
type RepeatMode = "off" | "grid" | "diagonal";
type PositionPreset = "top-left" | "top-center" | "top-right" | "middle-left" | "center" | "middle-right" | "bottom-left" | "bottom-center" | "bottom-right";
type OutputFormat = "original" | "png" | "jpg" | "webp";
type ItemStatus = "ready" | "failed";
type ProcessStatus = "waiting" | "processing" | "completed" | "failed";
type ProcessResult = { status: ProcessStatus; blob?: Blob; name?: string; size?: number; error?: string };
type ProcessMode = "all" | "unprocessed" | "failed";
type FontFamily = "sans" | "serif" | "monospace" | "rounded";

type ImageItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  url: string;
  width: number;
  height: number;
  status: ItemStatus;
  error?: string;
};

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

type PreviewSource = {
  itemId: string;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
};

type WatermarkSettings = {
  kind: WatermarkKind;
  text: string;
  fontFamily: FontFamily;
  bold: boolean;
  color: string;
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;
  shadow: boolean;
  shadowColor: string;
  shadowOpacity: number;
  shadowBlur: number;
  shadowX: number;
  shadowY: number;
  sizeRatio: number;
  opacity: number;
  rotation: number;
  position: PositionPreset;
  margin: number;
  freePosition: boolean;
  relativeX: number | null;
  relativeY: number | null;
  repeatMode: RepeatMode;
  gapX: number;
  gapY: number;
  density: number;
  logoScale: number;
};

type ZipEntry = { name: string; blob: Blob };

type WatermarkBounds = { x: number; y: number; width: number; height: number } | null;

const LIMITS = {
  maxFiles: 20,
  maxPerFile: 15 * 1024 * 1024,
  maxTotalBytes: 80 * 1024 * 1024,
  maxPixelsPerFile: 24_000_000,
  maxOutputPixels: 24_000_000,
};

const PREVIEW_LIMITS = { maxWidth: 1400, maxHeight: 900, thumbnailSide: 160 };

async function decodeImageFile(file: Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // Fall through to HTMLImageElement for browsers with partial createImageBitmap support.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function createThumbnailUrl(source: CanvasImageSource, width: number, height: number): Promise<string> {
  const scale = Math.min(1, PREVIEW_LIMITS.thumbnailSide / Math.max(1, width), PREVIEW_LIMITS.thumbnailSide / Math.max(1, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  canvas.width = 1;
  canvas.height = 1;
  if (!blob) throw new Error("thumbnail");
  return URL.createObjectURL(blob);
}

async function inspectImageFile(file: File): Promise<{ width: number; height: number; thumbnailUrl: string }> {
  const decoded = await decodeImageFile(file);
  try {
    const thumbnailUrl = await createThumbnailUrl(decoded.source, decoded.width, decoded.height);
    return { width: decoded.width, height: decoded.height, thumbnailUrl };
  } finally {
    decoded.close();
  }
}

const defaultSettings: WatermarkSettings = {
  kind: "text",
  text: "SAMPLE",
  fontFamily: "sans",
  bold: true,
  color: "#ffffff",
  outline: true,
  outlineColor: "#000000",
  outlineWidth: 8,
  shadow: true,
  shadowColor: "#000000",
  shadowOpacity: 35,
  shadowBlur: 8,
  shadowX: 0,
  shadowY: 4,
  sizeRatio: 9,
  opacity: 42,
  rotation: -18,
  position: "bottom-right",
  margin: 4,
  freePosition: false,
  relativeX: null,
  relativeY: null,
  repeatMode: "off",
  gapX: 14,
  gapY: 12,
  density: 100,
  logoScale: 100,
};

const defaultSecondarySettings: WatermarkSettings = {
  ...defaultSettings,
  kind: "logo",
  text: "©",
  bold: true,
  sizeRatio: 7,
  opacity: 55,
  rotation: 0,
  position: "top-left",
  margin: 4,
  repeatMode: "off",
};

const copy = {
  ko: {
    workspace: "이미지 워터마크 작업장",
    drop: "이미지를 여기에 놓거나 여러 장 선택하세요",
    select: "여러 이미지 선택",
    add: "이미지 추가",
    support: "JPG, PNG, WebP · 여러 장 선택 가능",
    local: "이미지와 워터마크는 서버로 전송되지 않으며 현재 브라우저에서만 처리됩니다.",
    logoLocal: "로고 파일도 현재 브라우저에서만 사용됩니다.",
    selected: "선택한 이미지",
    representative: "대표",
    ready: "준비 완료",
    failed: "실패",
    preview: "대표 미리보기",
    fileList: "이미지 목록",
    noImages: "아직 선택한 이미지가 없습니다.",
    watermark: "워터마크",
    secondWatermark: "두 번째 워터마크",
    enableSecond: "텍스트 + 로고 동시 사용",
    secondNote: "두 번째 레이어는 위치·크기·투명도를 독립적으로 설정할 수 있습니다.",
    text: "텍스트",
    logo: "로고",
    textLabel: "문구",
    font: "글꼴",
    fontSans: "기본",
    fontSerif: "세리프",
    fontMono: "고정폭",
    fontRounded: "라운드",
    bold: "굵게",
    color: "글자 색",
    outline: "외곽선",
    outlineColor: "외곽선 색",
    outlineWidth: "외곽선 두께",
    shadow: "그림자",
    shadowColor: "그림자 색",
    shadowOpacity: "그림자 불투명도",
    shadowBlur: "그림자 흐림",
    shadowX: "그림자 X",
    shadowY: "그림자 Y",
    logoFile: "로고 파일",
    chooseLogo: "로고 선택",
    removeLogo: "로고 제거",
    logoHint: "PNG, JPG, WebP 로고 사용 가능 · 투명 PNG 지원",
    size: "크기",
    logoScale: "로고 비율",
    opacity: "투명도",
    rotation: "회전",
    margin: "가장자리 여백",
    position: "위치",
    freePosition: "자유 위치",
    resetPosition: "위치 초기화",
    repeat: "반복",
    off: "반복 OFF",
    grid: "격자 반복",
    diagonal: "대각선 반복",
    gapX: "가로 간격",
    gapY: "세로 간격",
    density: "밀도",
    output: "출력",
    outputFormat: "출력 형식",
    quality: "품질",
    filename: "결과 파일명 접미사",
    process: "전체 이미지에 적용",
    processUnprocessed: "미처리 이미지에 적용",
    retryFailed: "실패 파일 다시 시도",
    cancelProcessing: "처리 취소",
    again: "다시 생성",
    current: "현재 이미지 다운로드",
    resetWatermark: "워터마크 초기화",
    removeAll: "이미지 모두 제거",
    resetAll: "전체 초기화",
    undo: "Undo",
    redo: "Redo",
    choosePreview: "목록에서 이미지를 선택하면 같은 설정이 다른 비율 이미지에서 어떻게 보이는지 바로 확인할 수 있습니다.",
    relativeNote: "여러 이미지에는 상대 위치와 상대 크기를 기준으로 같은 설정이 적용됩니다.",
    dragHint: "반복 OFF 상태에서 미리보기 위의 워터마크를 드래그해 자유 위치로 이동할 수 있습니다.",
    dropLogoFirst: "로고 워터마크를 사용하려면 먼저 로고 파일을 선택하세요.",
    statusIdle: "설정을 확인한 뒤 전체 이미지에 적용하세요. 완료된 결과는 개별 또는 ZIP으로 다운로드할 수 있습니다.",
    statusProcessing: "이미지를 순서대로 처리하는 중입니다…",
    statusProgress: (done:number,total:number)=>`${done} / ${total} 처리 중`,
    statusCancelled: (done:number,total:number)=>`${done} / ${total} 처리 후 취소되었습니다. 완료된 결과는 유지됩니다.`,
    waiting: "대기",
    processing: "처리 중",
    completed: "완료",
    downloadResult: "다운로드",
    statusDone: (count:number)=>`${count}개 이미지의 결과를 준비했습니다. ZIP 또는 개별 다운로드를 사용할 수 있습니다.`,
    statusPartial: (ok:number, fail:number)=>`${ok}개 성공, ${fail}개 실패로 처리되었습니다.`,
    processingLimit: "현재 설정은 결과 크기가 너무 커서 처리에 실패할 수 있습니다. 이미지 수를 줄이거나 원본 해상도가 너무 큰지 확인하세요.",
    blocked: "일반 사용자 안정성을 위해 파일당 15MiB, 최대 20장, 총 80MiB 범위를 기본 서비스 기준으로 사용합니다.",
    unsupported: "지원하지 않는 이미지 형식입니다.",
    empty: "빈 파일은 사용할 수 없습니다.",
    tooMany: `한 번에 최대 ${LIMITS.maxFiles}장까지 선택할 수 있습니다.`,
    decodeFail: "이미지를 읽을 수 없습니다.",
    tooLargeFile: "기본 서비스 범위를 넘는 큰 파일입니다.",
    tooLargePixels: "해상도가 너무 커서 현재 브라우저에서 안정적으로 처리하기 어렵습니다.",
    zipUnavailable: "현재 환경에서는 ZIP 다운로드를 준비하지 못했습니다. 개별 다운로드를 사용해 주세요.",
    imageListHelp: "썸네일을 눌러 대표 미리보기를 바꾸세요.",
    itemRemove: "삭제",
    compareSize: "원본 픽셀 유지",
    downloadZip: "ZIP 다운로드",
    downloadCurrent: "현재 이미지",
    previewOnly: "미리보기는 선택한 한 장만 보여 주며, 출력은 모든 준비된 이미지에 같은 설정으로 적용됩니다.",
    original: "원본 유지",
    summary: "처리 요약",
    fileCount: "이미지 수",
    logoNotSelected: "로고가 아직 선택되지 않았습니다.",
    originalFormat: "원본 형식 유지",
  },
  en: {
    workspace: "Image watermark workspace",
    drop: "Drop images here or select multiple files",
    select: "Select images",
    add: "Add images",
    support: "JPG, PNG, WebP · multiple files supported",
    local: "Images and watermarks stay in your current browser and are not uploaded.",
    logoLocal: "Logo files are also used only in your current browser session.",
    selected: "Selected images",
    representative: "Preview",
    ready: "Ready",
    failed: "Failed",
    preview: "Preview image",
    fileList: "Image list",
    noImages: "No images selected yet.",
    watermark: "Watermark",
    secondWatermark: "Second watermark",
    enableSecond: "Use text + logo together",
    secondNote: "The second layer has independent position, size, and opacity settings.",
    text: "Text",
    logo: "Logo",
    textLabel: "Text",
    font: "Font",
    fontSans: "Default",
    fontSerif: "Serif",
    fontMono: "Monospace",
    fontRounded: "Rounded",
    bold: "Bold",
    color: "Text color",
    outline: "Outline",
    outlineColor: "Outline color",
    outlineWidth: "Outline width",
    shadow: "Shadow",
    shadowColor: "Shadow color",
    shadowOpacity: "Shadow opacity",
    shadowBlur: "Shadow blur",
    shadowX: "Shadow X",
    shadowY: "Shadow Y",
    logoFile: "Logo file",
    chooseLogo: "Choose logo",
    removeLogo: "Remove logo",
    logoHint: "PNG, JPG, and WebP logos supported · transparent PNG works",
    size: "Size",
    logoScale: "Logo scale",
    opacity: "Opacity",
    rotation: "Rotation",
    margin: "Edge margin",
    position: "Position",
    freePosition: "Free position",
    resetPosition: "Reset position",
    repeat: "Repeat",
    off: "Repeat off",
    grid: "Grid repeat",
    diagonal: "Diagonal repeat",
    gapX: "Horizontal gap",
    gapY: "Vertical gap",
    density: "Density",
    output: "Output",
    outputFormat: "Output format",
    quality: "Quality",
    filename: "Result filename suffix",
    process: "Apply to all images",
    processUnprocessed: "Process unprocessed images",
    retryFailed: "Retry failed images",
    cancelProcessing: "Cancel processing",
    again: "Generate again",
    current: "Download current image",
    resetWatermark: "Reset watermark",
    removeAll: "Remove all images",
    resetAll: "Reset all",
    undo: "Undo",
    redo: "Redo",
    choosePreview: "Select another image in the list to check how the same watermark looks on a different aspect ratio.",
    relativeNote: "The same relative position and relative size are applied to all selected images.",
    dragHint: "When repeat is off, drag the watermark directly in the preview to place it freely.",
    dropLogoFirst: "Choose a logo file first to use logo watermark mode.",
    statusIdle: "Review the settings, then apply the watermark to all images. Completed results can be downloaded individually or as a ZIP.",
    statusProcessing: "Processing images one by one…",
    statusProgress: (done:number,total:number)=>`${done} / ${total} processing`,
    statusCancelled: (done:number,total:number)=>`Cancelled after ${done} / ${total}. Completed results are kept.`,
    waiting: "Waiting",
    processing: "Processing",
    completed: "Completed",
    downloadResult: "Download",
    statusDone: (count:number)=>`Prepared results for ${count} image${count===1?"":"s"}. You can download a ZIP or the current file.`,
    statusPartial: (ok:number, fail:number)=>`Completed with ${ok} success and ${fail} failure${fail===1?"":"s"}.`,
    processingLimit: "The current settings may be too heavy for your device. Check the number of files and source image sizes.",
    blocked: `For stable general use, the default service range is 15 MiB per file, up to ${LIMITS.maxFiles} files, and 80 MiB total.`,
    unsupported: "Unsupported image format.",
    empty: "Empty files cannot be used.",
    tooMany: `You can select up to ${LIMITS.maxFiles} images at once.`,
    decodeFail: "This image could not be read.",
    tooLargeFile: "This file exceeds the stable basic service range.",
    tooLargePixels: "The resolution is too large for stable processing in the current browser.",
    zipUnavailable: "ZIP creation was not available in this environment. Use single-file download instead.",
    imageListHelp: "Click a thumbnail to change the preview image.",
    itemRemove: "Remove",
    compareSize: "Keep original pixels",
    downloadZip: "Download ZIP",
    downloadCurrent: "Current image",
    previewOnly: "The preview shows one selected image, but the output uses the same settings for every ready image.",
    original: "Keep original",
    summary: "Processing summary",
    fileCount: "Image count",
    logoNotSelected: "No logo file selected yet.",
    originalFormat: "Keep original format",
  },
  ja: {
    workspace: "画像ウォーターマーク作業場",
    drop: "画像をここに置くか、複数ファイルを選択してください",
    select: "画像を選択",
    add: "画像を追加",
    support: "JPG・PNG・WebP ・ 複数選択対応",
    local: "画像とウォーターマークは現在のブラウザ内だけで処理され、アップロードされません。",
    logoLocal: "ロゴファイルも現在のブラウザセッション内でのみ使用されます。",
    selected: "選択した画像",
    representative: "代表",
    ready: "準備完了",
    failed: "失敗",
    preview: "代表プレビュー",
    fileList: "画像一覧",
    noImages: "まだ画像が選択されていません。",
    watermark: "ウォーターマーク",
    secondWatermark: "2つ目のウォーターマーク",
    enableSecond: "テキスト + ロゴを同時使用",
    secondNote: "2つ目のレイヤーは位置・サイズ・不透明度を個別に設定できます。",
    text: "テキスト",
    logo: "ロゴ",
    textLabel: "文字列",
    font: "フォント",
    fontSans: "標準",
    fontSerif: "セリフ",
    fontMono: "等幅",
    fontRounded: "丸み",
    bold: "太字",
    color: "文字色",
    outline: "縁取り",
    outlineColor: "縁取り色",
    outlineWidth: "縁取りの太さ",
    shadow: "影",
    shadowColor: "影の色",
    shadowOpacity: "影の不透明度",
    shadowBlur: "影のぼかし",
    shadowX: "影 X",
    shadowY: "影 Y",
    logoFile: "ロゴファイル",
    chooseLogo: "ロゴを選択",
    removeLogo: "ロゴを削除",
    logoHint: "PNG・JPG・WebP ロゴ対応 ・ 透過PNG対応",
    size: "サイズ",
    logoScale: "ロゴ倍率",
    opacity: "不透明度",
    rotation: "回転",
    margin: "端の余白",
    position: "位置",
    freePosition: "自由位置",
    resetPosition: "位置を初期化",
    repeat: "繰り返し",
    off: "繰り返しOFF",
    grid: "格子繰り返し",
    diagonal: "斜め繰り返し",
    gapX: "横間隔",
    gapY: "縦間隔",
    density: "密度",
    output: "出力",
    outputFormat: "出力形式",
    quality: "品質",
    filename: "結果ファイル名の接尾語",
    process: "すべての画像に適用",
    processUnprocessed: "未処理の画像に適用",
    retryFailed: "失敗した画像を再試行",
    cancelProcessing: "処理をキャンセル",
    again: "再生成",
    current: "現在画像をダウンロード",
    resetWatermark: "ウォーターマーク初期化",
    removeAll: "画像をすべて削除",
    resetAll: "全体初期化",
    undo: "Undo",
    redo: "Redo",
    choosePreview: "一覧の別画像を選ぶと、同じウォーターマークが異なる比率でどう見えるか確認できます。",
    relativeNote: "同じ相対位置と相対サイズがすべての選択画像に適用されます。",
    dragHint: "繰り返しOFFのときは、プレビュー上のウォーターマークを直接ドラッグして自由位置へ移動できます。",
    dropLogoFirst: "ロゴウォーターマークを使うには先にロゴファイルを選択してください。",
    statusIdle: "設定を確認してからすべての画像に適用してください。完了した結果は個別またはZIPでダウンロードできます。",
    statusProcessing: "画像を順番に処理しています…",
    statusProgress: (done:number,total:number)=>`${done} / ${total} 処理中`,
    statusCancelled: (done:number,total:number)=>`${done} / ${total} 件を処理した後にキャンセルしました。完了済みの結果は保持されます。`,
    waiting: "待機",
    processing: "処理中",
    completed: "完了",
    downloadResult: "ダウンロード",
    statusDone: (count:number)=>`${count}件の結果を準備しました。ZIPまたは現在画像の個別ダウンロードを利用できます。`,
    statusPartial: (ok:number, fail:number)=>`${ok}件成功、${fail}件失敗で処理しました。`,
    processingLimit: "現在の設定は端末に対して重い可能性があります。画像数と元画像サイズを確認してください。",
    blocked: `一般利用の安定性を優先し、基本サービス範囲は1ファイル15MiB・最大${LIMITS.maxFiles}件・合計80MiBです。`,
    unsupported: "対応していない画像形式です。",
    empty: "空のファイルは使用できません。",
    tooMany: `一度に選択できるのは最大${LIMITS.maxFiles}件です。`,
    decodeFail: "この画像を読み込めませんでした。",
    tooLargeFile: "このファイルは基本サービスの安定範囲を超えています。",
    tooLargePixels: "解像度が大きすぎるため、現在のブラウザで安定処理しにくい画像です。",
    zipUnavailable: "この環境ではZIP作成を準備できませんでした。個別ダウンロードを利用してください。",
    imageListHelp: "サムネイルを選ぶと代表プレビューが切り替わります。",
    itemRemove: "削除",
    compareSize: "元のピクセルを維持",
    downloadZip: "ZIPダウンロード",
    downloadCurrent: "現在画像",
    previewOnly: "プレビューは選択中の1枚だけを表示し、出力では準備完了画像すべてに同じ設定を適用します。",
    original: "元の形式を維持",
    summary: "処理サマリー",
    fileCount: "画像数",
    logoNotSelected: "まだロゴファイルが選択されていません。",
    originalFormat: "元の形式を維持",
  },
} as const;

function getFontFamily(fontFamily: FontFamily) {
  switch (fontFamily) {
    case "serif":
      return 'Georgia, "Times New Roman", serif';
    case "monospace":
      return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
    case "rounded":
      return '"Trebuchet MS", "Arial Rounded MT Bold", system-ui, sans-serif';
    default:
      return 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  }
}

function dataUriToBytes(uri: string) {
  const base64 = uri.split(",")[1] ?? "";
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function crc32(bytes: Uint8Array) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ -1) >>> 0;
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

async function createZipBlob(entries: ZipEntry[]) {
  const encoder = new TextEncoder();
  const fileParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes = new Uint8Array(await entry.blob.arrayBuffer());
    const crc = crc32(dataBytes);

    const local = new Uint8Array(30 + nameBytes.length + dataBytes.length);
    const localView = new DataView(local.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, 0);
    writeUint16(localView, 12, 0);
    writeUint32(localView, 14, crc);
    writeUint32(localView, 18, dataBytes.length);
    writeUint32(localView, 22, dataBytes.length);
    writeUint16(localView, 26, nameBytes.length);
    writeUint16(localView, 28, 0);
    local.set(nameBytes, 30);
    local.set(dataBytes, 30 + nameBytes.length);
    fileParts.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, 0);
    writeUint16(centralView, 14, 0);
    writeUint32(centralView, 16, crc);
    writeUint32(centralView, 20, dataBytes.length);
    writeUint32(centralView, 24, dataBytes.length);
    writeUint16(centralView, 28, nameBytes.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    central.set(nameBytes, 46);
    centralParts.push(central);

    offset += local.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, entries.length);
  writeUint16(endView, 10, entries.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);

  const blobParts: BlobPart[] = [...fileParts, ...centralParts, end].map((part) =>
    part.buffer.slice(part.byteOffset, part.byteOffset + part.byteLength) as ArrayBuffer,
  );
  return new Blob(blobParts, { type: "application/zip" });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type SupportedImageFormat = "jpg" | "png" | "webp";

function resolveSupportedImageFormat(file: Pick<File, "name" | "type">): SupportedImageFormat | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type.toLowerCase();
  if (mime === "image/jpeg" && (ext === "jpg" || ext === "jpeg")) return "jpg";
  if (mime === "image/png" && ext === "png") return "png";
  if (mime === "image/webp" && ext === "webp") return "webp";
  return null;
}

function getOutputFormat(format: OutputFormat, sourceFile: Pick<File, "name" | "type">) {
  if (format === "original") return resolveSupportedImageFormat(sourceFile) ?? "png";
  return format;
}

function buildOutputName(sourceFile: Pick<File, "name" | "type">, suffix: string, format: OutputFormat) {
  const dot = sourceFile.name.lastIndexOf(".");
  const base = dot > 0 ? sourceFile.name.slice(0, dot) : sourceFile.name;
  const finalExt = format === "original" ? getOutputFormat("original", sourceFile) : format;
  return `${base}${suffix ? `-${suffix}` : ""}.${finalExt}`;
}

function makeUniqueOutputName(baseName: string, usedNames: Set<string>) {
  const normalized = baseName.toLowerCase();
  if (!usedNames.has(normalized)) {
    usedNames.add(normalized);
    return baseName;
  }
  const dot = baseName.lastIndexOf(".");
  const stem = dot > 0 ? baseName.slice(0, dot) : baseName;
  const ext = dot > 0 ? baseName.slice(dot) : "";
  let index = 2;
  let candidate = `${stem}-${index}${ext}`;
  while (usedNames.has(candidate.toLowerCase())) {
    index += 1;
    candidate = `${stem}-${index}${ext}`;
  }
  usedNames.add(candidate.toLowerCase());
  return candidate;
}

function positionToRelative(position: PositionPreset, marginPercent: number, wmWidth: number, wmHeight: number, width: number, height: number) {
  const marginX = (width * marginPercent) / 100;
  const marginY = (height * marginPercent) / 100;
  const xSpace = Math.max(0, width - wmWidth - marginX * 2);
  const ySpace = Math.max(0, height - wmHeight - marginY * 2);
  let x = marginX;
  let y = marginY;
  if (position.includes("center")) x = marginX + xSpace / 2;
  if (position.includes("right")) x = width - wmWidth - marginX;
  if (position.startsWith("middle") || position === "center") y = marginY + ySpace / 2;
  if (position.includes("bottom")) y = height - wmHeight - marginY;
  return { x, y };
}

function getRotatedBounds(x: number, y: number, width: number, height: number, angle: number) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rad = (angle * Math.PI) / 180;
  const points = [
    { x, y },
    { x: x + width, y },
    { x, y: y + height },
    { x: x + width, y: y + height },
  ].map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    return {
      x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
      y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
    };
  });
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

const positionPresetLabels: Record<Locale, Record<PositionPreset, string>> = {
  ko: {
    "top-left": "왼쪽 위", "top-center": "가운데 위", "top-right": "오른쪽 위",
    "middle-left": "왼쪽 가운데", center: "가운데", "middle-right": "오른쪽 가운데",
    "bottom-left": "왼쪽 아래", "bottom-center": "가운데 아래", "bottom-right": "오른쪽 아래",
  },
  en: {
    "top-left": "Top left", "top-center": "Top center", "top-right": "Top right",
    "middle-left": "Middle left", center: "Center", "middle-right": "Middle right",
    "bottom-left": "Bottom left", "bottom-center": "Bottom center", "bottom-right": "Bottom right",
  },
  ja: {
    "top-left": "左上", "top-center": "上中央", "top-right": "右上",
    "middle-left": "左中央", center: "中央", "middle-right": "右中央",
    "bottom-left": "左下", "bottom-center": "下中央", "bottom-right": "右下",
  },
};

function drawPreviewSelection(ctx: CanvasRenderingContext2D, bounds: Exclude<WatermarkBounds, null>) {
  const shortest = Math.max(1, Math.min(ctx.canvas.width, ctx.canvas.height));
  const outer = Math.max(2, shortest * 0.004);
  const inner = Math.max(1, shortest * 0.002);
  const handle = Math.max(7, shortest * 0.014);
  const x = bounds.x;
  const y = bounds.y;
  const w = bounds.width;
  const h = bounds.height;

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  ctx.lineWidth = outer + inner * 2;
  ctx.strokeStyle = "rgba(255,255,255,.96)";
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([Math.max(5, shortest * 0.012), Math.max(4, shortest * 0.008)]);
  ctx.lineWidth = inner * 2;
  ctx.strokeStyle = "#111827";
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
  for (const [hx, hy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = inner * 2;
    ctx.fillRect(hx - handle / 2, hy - handle / 2, handle, handle);
    ctx.strokeRect(hx - handle / 2, hy - handle / 2, handle, handle);
  }
  ctx.restore();
}

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, settings: WatermarkSettings, logo: HTMLImageElement | null) {
  const shortest = Math.min(width, height);
  const opacity = clamp(settings.opacity / 100, 0, 1);
  const densityScale = 100 / clamp(settings.density, 1, 1000);
  const watermarkHeight = Math.max(14, shortest * (settings.sizeRatio / 100) * (settings.kind === "logo" ? settings.logoScale / 100 : 1));

  const drawTextSingle = (x: number, y: number) => {
    const fontSize = watermarkHeight;
    ctx.font = `${settings.bold ? "700" : "500"} ${fontSize}px ${getFontFamily(settings.fontFamily)}`;
    ctx.textBaseline = "top";
    const measured = ctx.measureText(settings.text || " ");
    const wmWidth = Math.max(measured.width, fontSize * 0.5);
    const wmHeight = fontSize;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
    ctx.rotate((settings.rotation * Math.PI) / 180);
    ctx.translate(-wmWidth / 2, -wmHeight / 2);
    if (settings.shadow) {
      const shadowAlpha = clamp(settings.shadowOpacity / 100, 0, 1);
      const sr = parseInt(settings.shadowColor.slice(1, 3), 16) || 0;
      const sg = parseInt(settings.shadowColor.slice(3, 5), 16) || 0;
      const sb = parseInt(settings.shadowColor.slice(5, 7), 16) || 0;
      ctx.shadowColor = `rgba(${sr},${sg},${sb},${shadowAlpha})`;
      ctx.shadowBlur = Math.max(0, fontSize * settings.shadowBlur / 100);
      ctx.shadowOffsetX = fontSize * settings.shadowX / 100;
      ctx.shadowOffsetY = fontSize * settings.shadowY / 100;
    }
    if (settings.outline) {
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(1, fontSize * settings.outlineWidth / 100);
      ctx.strokeStyle = settings.outlineColor;
      ctx.strokeText(settings.text || " ", 0, 0);
    }
    ctx.fillStyle = settings.color;
    ctx.fillText(settings.text || " ", 0, 0);
    ctx.restore();
    return { width: wmWidth, height: wmHeight };
  };

  const drawLogoSingle = (x: number, y: number) => {
    if (!logo) return { width: watermarkHeight, height: watermarkHeight };
    const ratio = logo.naturalWidth / Math.max(1, logo.naturalHeight);
    const wmHeight = watermarkHeight;
    const wmWidth = wmHeight * ratio;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
    ctx.rotate((settings.rotation * Math.PI) / 180);
    ctx.translate(-wmWidth / 2, -wmHeight / 2);
    ctx.drawImage(logo, 0, 0, wmWidth, wmHeight);
    ctx.restore();
    return { width: wmWidth, height: wmHeight };
  };

  if (settings.repeatMode === "off") {
    const sampleMeasure = settings.kind === "text"
      ? (() => {
          ctx.font = `${settings.bold ? "700" : "500"} ${watermarkHeight}px ${getFontFamily(settings.fontFamily)}`;
          const m = ctx.measureText(settings.text || " ");
          return { width: Math.max(m.width, watermarkHeight * 0.5), height: watermarkHeight };
        })()
      : (() => {
          const ratio = logo ? logo.naturalWidth / Math.max(1, logo.naturalHeight) : 1;
          return { width: watermarkHeight * ratio, height: watermarkHeight };
        })();

    const coords = settings.freePosition && settings.relativeX !== null && settings.relativeY !== null
      ? { x: settings.relativeX * width, y: settings.relativeY * height }
      : positionToRelative(settings.position, settings.margin, sampleMeasure.width, sampleMeasure.height, width, height);
    const rad = (settings.rotation * Math.PI) / 180;
    const rotatedWidth = Math.abs(sampleMeasure.width * Math.cos(rad)) + Math.abs(sampleMeasure.height * Math.sin(rad));
    const rotatedHeight = Math.abs(sampleMeasure.width * Math.sin(rad)) + Math.abs(sampleMeasure.height * Math.cos(rad));
    const desiredCenterX = coords.x + sampleMeasure.width / 2;
    const desiredCenterY = coords.y + sampleMeasure.height / 2;
    const centerX = rotatedWidth >= width ? width / 2 : clamp(desiredCenterX, rotatedWidth / 2, width - rotatedWidth / 2);
    const centerY = rotatedHeight >= height ? height / 2 : clamp(desiredCenterY, rotatedHeight / 2, height - rotatedHeight / 2);
    const boundedX = centerX - sampleMeasure.width / 2;
    const boundedY = centerY - sampleMeasure.height / 2;
    if (settings.kind === "text") drawTextSingle(boundedX, boundedY);
    else drawLogoSingle(boundedX, boundedY);
    return getRotatedBounds(boundedX, boundedY, sampleMeasure.width, sampleMeasure.height, settings.rotation);
  }

  const itemHeight = watermarkHeight;
  let itemWidth: number;
  if (settings.kind === "logo") {
    const baseRatio = logo ? logo.naturalWidth / Math.max(1, logo.naturalHeight) : 1;
    itemWidth = Math.max(1, itemHeight * baseRatio);
  } else {
    ctx.font = `${settings.bold ? "700" : "500"} ${itemHeight}px ${getFontFamily(settings.fontFamily)}`;
    itemWidth = Math.max(ctx.measureText(settings.text || " ").width, itemHeight * 0.5);
  }
  const stepX = Math.max(12, (itemWidth + (shortest * settings.gapX) / 100) * densityScale);
  const stepY = Math.max(12, (itemHeight + (shortest * settings.gapY) / 100) * densityScale);
  const startX = -width;
  const endX = width * 2;
  const startY = -height;
  const endY = height * 2;
  for (let y = startY, row = 0; y < endY; y += stepY, row += 1) {
    for (let x = startX; x < endX; x += stepX) {
      const shiftedX = settings.repeatMode === "diagonal" ? x + (row % 2 ? stepX / 2 : 0) : x;
      if (settings.kind === "text") drawTextSingle(shiftedX, y);
      else drawLogoSingle(shiftedX, y);
    }
  }
  return null;
}

async function renderItemBlob(item: ImageItem, settings: WatermarkSettings, secondarySettings: WatermarkSettings, secondaryEnabled: boolean, logo: HTMLImageElement | null, outputFormat: OutputFormat, quality: number) {
  if (item.width * item.height > LIMITS.maxOutputPixels) throw new Error("too-large-output");
  const canvas = document.createElement("canvas");
  canvas.width = item.width;
  canvas.height = item.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  if (!ctx) throw new Error("canvas");
  const format = getOutputFormat(outputFormat, item.file);
  if (format === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, item.width, item.height);
  }
  const decoded = await decodeImageFile(item.file);
  try {
    ctx.drawImage(decoded.source, 0, 0, item.width, item.height);
    drawWatermark(ctx, item.width, item.height, settings, logo);
    if (secondaryEnabled) drawWatermark(ctx, item.width, item.height, secondarySettings, logo);
    const mime = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, format === "png" ? undefined : quality / 100));
    if (!blob) throw new Error("blob");
    return { blob, format };
  } finally {
    decoded.close();
    canvas.width = 1;
    canvas.height = 1;
  }
}

export function ImageWatermarkTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settings, setSettings] = useState<WatermarkSettings>(defaultSettings);
  const [secondaryEnabled, setSecondaryEnabled] = useState(false);
  const [secondarySettings, setSecondarySettings] = useState<WatermarkSettings>(defaultSecondarySettings);
  const [history, setHistory] = useState<WatermarkSettings[]>([]);
  const [future, setFuture] = useState<WatermarkSettings[]>([]);
  const [status, setStatus] = useState<string>(t.statusIdle);
  const [error, setError] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [externalDrag, setExternalDrag] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
  const [quality, setQuality] = useState(92);
  const [filenameSuffix, setFilenameSuffix] = useState("watermarked");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [logoName, setLogoName] = useState<string>("");
  const [zipReady, setZipReady] = useState<Blob | null>(null);
  const [zipName, setZipName] = useState("image-watermarks.zip");
  const [previewBounds, setPreviewBounds] = useState<WatermarkBounds>(null);
  const [previewSource, setPreviewSource] = useState<PreviewSource | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Record<string, ProcessResult>>({});
  const cancelRef = useRef(false);
  const settingsRef = useRef<WatermarkSettings>(defaultSettings);
  const continuousHistoryRef = useRef<WatermarkSettings | null>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number; active: boolean }>({ offsetX: 0, offsetY: 0, active: false });

  const itemsRef = useRef<ImageItem[]>([]);
  const logoUrlRef = useRef<string | null>(null);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { logoUrlRef.current = logoUrl; }, [logoUrl]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => () => {
    itemsRef.current.forEach((item) => { if (item.url) URL.revokeObjectURL(item.url); });
    if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current);
  }, []);

  const readyItems = useMemo(() => items.filter((item) => item.status === "ready"), [items]);
  const selectedItem = useMemo(() => readyItems.find((item) => item.id === selectedId) ?? readyItems[0] ?? null, [readyItems, selectedId]);
  const completedCount = useMemo(() => readyItems.filter((item) => results[item.id]?.status === "completed").length, [readyItems, results]);
  const failedProcessCount = useMemo(() => readyItems.filter((item) => results[item.id]?.status === "failed").length, [readyItems, results]);

  useEffect(() => {
    if (selectedItem && selectedId !== selectedItem.id) setSelectedId(selectedItem.id);
  }, [selectedId, selectedItem]);

  const invalidateResults = useCallback(() => {
    setResults({});
    setZipReady(null);
    setStatus(t.statusIdle);
  }, [t.statusIdle]);

  const beginContinuousEdit = useCallback(() => {
    if (continuousHistoryRef.current === null) {
      continuousHistoryRef.current = settingsRef.current;
      setFuture([]);
    }
  }, []);

  const commitContinuousEdit = useCallback(() => {
    const previous = continuousHistoryRef.current;
    continuousHistoryRef.current = null;
    if (!previous) return;
    if (JSON.stringify(previous) === JSON.stringify(settingsRef.current)) return;
    setHistory((prevHistory) => [...prevHistory.slice(-39), previous]);
  }, []);

  const pushSettings = useCallback((next: WatermarkSettings | ((prev: WatermarkSettings) => WatermarkSettings), skipHistory = false) => {
    if (skipHistory) beginContinuousEdit();
    else continuousHistoryRef.current = null;
    setSettings((prev) => {
      const computed = typeof next === "function" ? next(prev) : next;
      if (!skipHistory) {
        setHistory((prevHistory) => [...prevHistory.slice(-39), prev]);
        setFuture([]);
      }
      settingsRef.current = computed;
      return computed;
    });
    invalidateResults();
    setError("");
  }, [beginContinuousEdit, invalidateResults]);

  const pushSecondarySettings = useCallback((next: WatermarkSettings | ((prev: WatermarkSettings) => WatermarkSettings)) => {
    setSecondarySettings((prev) => typeof next === "function" ? next(prev) : next);
    invalidateResults();
    setError("");
  }, [invalidateResults]);

  const resetWatermarks = useCallback(() => {
    continuousHistoryRef.current = null;
    settingsRef.current = defaultSettings;
    setSettings(defaultSettings);
    setSecondaryEnabled(false);
    setSecondarySettings(defaultSecondarySettings);
    setHistory([]);
    setFuture([]);
    invalidateResults();
  }, [invalidateResults]);

  const loadImageFromFile = useCallback(async (file: File) => {
    if (!resolveSupportedImageFormat(file)) throw new Error(t.unsupported);
    if (file.size <= 0) throw new Error(t.empty);
    if (file.size > LIMITS.maxPerFile) throw new Error(t.tooLargeFile);
    try {
      const inspected = await inspectImageFile(file);
      if (inspected.width * inspected.height > LIMITS.maxPixelsPerFile) {
        URL.revokeObjectURL(inspected.thumbnailUrl);
        throw new Error(t.tooLargePixels);
      }
      return inspected;
    } catch (error) {
      if (error instanceof Error && new Set<string>([t.tooLargePixels, t.unsupported, t.empty, t.tooLargeFile]).has(error.message)) throw error;
      throw new Error(t.decodeFail);
    }
  }, [t.decodeFail, t.empty, t.tooLargeFile, t.tooLargePixels, t.unsupported]);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    if (items.length + files.length > LIMITS.maxFiles) {
      setError(t.tooMany);
      return;
    }
    const totalBytes = items.reduce((sum, item) => sum + item.size, 0) + files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > LIMITS.maxTotalBytes) {
      setError(t.blocked);
      return;
    }
    setError("");
    const nextItems: ImageItem[] = [];
    for (const file of files) {
      try {
        const { width, height, thumbnailUrl } = await loadImageFromFile(file);
        nextItems.push({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          url: thumbnailUrl,
          width,
          height,
          status: "ready",
        });
      } catch (e) {
        nextItems.push({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          url: "",
          width: 0,
          height: 0,
          status: "failed",
          error: e instanceof Error ? e.message : t.decodeFail,
        });
      }
    }
    setItems((prev) => [...prev, ...nextItems]);
    const firstReady = nextItems.find((item) => item.status === "ready");
    if (firstReady) setSelectedId(firstReady.id);
  }, [items, loadImageFromFile, t.blocked, t.decodeFail, t.tooMany]);

  const loadLogo = useCallback(async (file: File) => {
    setError("");
    if (!resolveSupportedImageFormat(file)) {
      setError(t.unsupported);
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    try {
      await image.decode();
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      setLogoUrl(url);
      setLogoImage(image);
      setLogoName(file.name);
      invalidateResults();
    } catch {
      URL.revokeObjectURL(url);
      setError(t.decodeFail);
    }
  }, [invalidateResults, logoUrl, t.decodeFail, t.unsupported]);

  const removeItem = useCallback((id: string) => {
    if (isProcessing) return;
    setItems((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found?.url) URL.revokeObjectURL(found.url);
      const filtered = prev.filter((item) => item.id !== id);
      if (selectedId === id) setSelectedId(filtered.find((item) => item.status === "ready")?.id ?? null);
      return filtered;
    });
    setResults((prev) => { const next = { ...prev }; delete next[id]; return next; });
    setZipReady(null);
  }, [isProcessing, selectedId]);

  const clearAll = useCallback(() => {
    if (isProcessing) return;
    items.forEach((item) => item.url && URL.revokeObjectURL(item.url));
    setItems([]);
    setSelectedId(null);
    setZipReady(null);
    setResults({});
    setStatus(t.statusIdle);
    setError("");
  }, [isProcessing, items, t.statusIdle]);

  const resetAll = useCallback(() => {
    if (isProcessing) return;
    clearAll();
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(null);
    setLogoImage(null);
    setLogoName("");
    continuousHistoryRef.current = null;
    settingsRef.current = defaultSettings;
    setSettings(defaultSettings);
    setSecondaryEnabled(false);
    setSecondarySettings(defaultSecondarySettings);
    setHistory([]);
    setFuture([]);
    setShowOriginal(false);
    setOutputFormat("original");
    setQuality(92);
    setFilenameSuffix("watermarked");
  }, [clearAll, isProcessing, logoUrl]);


  useEffect(() => {
    let cancelled = false;
    const item = selectedItem;
    setPreviewBounds(null);
    setPreviewSource(null);
    if (!item) return () => { cancelled = true; };
    void (async () => {
      try {
        const decoded = await decodeImageFile(item.file);
        try {
          if (cancelled) return;
          const scale = Math.min(1, PREVIEW_LIMITS.maxWidth / decoded.width, PREVIEW_LIMITS.maxHeight / decoded.height);
          const width = Math.max(1, Math.round(decoded.width * scale));
          const height = Math.max(1, Math.round(decoded.height * scale));
          const sourceCanvas = document.createElement("canvas");
          sourceCanvas.width = width;
          sourceCanvas.height = height;
          const sourceCtx = sourceCanvas.getContext("2d");
          if (!sourceCtx) throw new Error("canvas");
          sourceCtx.drawImage(decoded.source, 0, 0, width, height);
          if (!cancelled) setPreviewSource({ itemId: item.id, canvas: sourceCanvas, width, height });
        } finally {
          decoded.close();
        }
      } catch {
        if (!cancelled) setError(t.decodeFail);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedItem, t.decodeFail]);

  useEffect(() => {
    const item = selectedItem;
    const source = previewSource;
    const canvas = canvasRef.current;
    if (!item || !source || source.itemId !== item.id || !canvas) {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source.canvas, 0, 0, source.width, source.height);
    if (showOriginal) {
      setPreviewBounds(null);
      return;
    }
    const bounds = settings.kind === "text" || logoImage ? drawWatermark(ctx, source.width, source.height, settings, logoImage) : null;
    if (secondaryEnabled && (secondarySettings.kind === "text" || logoImage)) drawWatermark(ctx, source.width, source.height, secondarySettings, logoImage);
    if (bounds && settings.repeatMode === "off") drawPreviewSelection(ctx, bounds);
    setPreviewBounds(bounds);
  }, [logoImage, previewSource, secondaryEnabled, secondarySettings, selectedItem, settings, showOriginal]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (settings.repeatMode !== "off") return;
    if (!previewBounds || !selectedItem) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const hitPadding = Math.max(12, Math.min(canvas.width, canvas.height) * 0.02);
    if (x < previewBounds.x - hitPadding || x > previewBounds.x + previewBounds.width + hitPadding || y < previewBounds.y - hitPadding || y > previewBounds.y + previewBounds.height + hitPadding) return;
    beginContinuousEdit();
    dragRef.current = { offsetX: x - previewBounds.x, offsetY: y - previewBounds.y, active: true };
    setDragging(true);
    canvas.setPointerCapture?.(event.pointerId);
  }, [beginContinuousEdit, previewBounds, selectedItem, settings.repeatMode]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active || !selectedItem) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const nextX = clamp(x - dragRef.current.offsetX, 0, Math.max(0, canvas.width - (previewBounds?.width ?? 0)));
    const nextY = clamp(y - dragRef.current.offsetY, 0, Math.max(0, canvas.height - (previewBounds?.height ?? 0)));
    setSettings((prev) => {
      const next = { ...prev, freePosition: true, relativeX: nextX / Math.max(1, canvas.width), relativeY: nextY / Math.max(1, canvas.height) };
      settingsRef.current = next;
      return next;
    });
    invalidateResults();
  }, [invalidateResults, previewBounds, selectedItem]);

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
    canvasRef.current?.releasePointerCapture?.(event.pointerId);
    commitContinuousEdit();
  }, [commitContinuousEdit]);

  const processImages = useCallback(async (mode: ProcessMode) => {
    if (isProcessing || !readyItems.length) return;
    if ((settings.kind === "logo" || (secondaryEnabled && secondarySettings.kind === "logo")) && !logoImage) {
      setError(t.dropLogoFirst);
      return;
    }
    const baseResults: Record<string, ProcessResult> = mode === "all" ? {} : { ...results };
    const targets = mode === "all"
      ? readyItems
      : mode === "unprocessed"
        ? readyItems.filter((item) => !baseResults[item.id] || baseResults[item.id].status === "waiting")
        : readyItems.filter((item) => baseResults[item.id]?.status === "failed");
    if (!targets.length) {
      setStatus(t.statusDone(completedCount));
      return;
    }

    setError("");
    setIsProcessing(true);
    cancelRef.current = false;
    setZipReady(null);
    setStatus(t.statusProcessing);

    const working: Record<string, ProcessResult> = { ...baseResults };
    if (mode === "all") readyItems.forEach((item) => { working[item.id] = { status: "waiting" }; });
    const targetIds = new Set(targets.map((item) => item.id));
    const usedNames = new Set<string>();
    readyItems.forEach((item) => {
      const result = working[item.id];
      if (!targetIds.has(item.id) && result?.status === "completed" && result.name) usedNames.add(result.name.toLowerCase());
    });
    setResults({ ...working });

    let handled = 0;
    for (const item of targets) {
      if (cancelRef.current) break;
      working[item.id] = { status: "processing" };
      setResults({ ...working });
      try {
        const { blob } = await renderItemBlob(item, settings, secondarySettings, secondaryEnabled, logoImage, outputFormat, quality);
        const baseName = buildOutputName(item.file, filenameSuffix.trim(), outputFormat);
        const name = makeUniqueOutputName(baseName, usedNames);
        working[item.id] = { status: "completed", blob, name, size: blob.size };
      } catch (e) {
        working[item.id] = { status: "failed", error: e instanceof Error ? e.message : t.processingLimit };
      }
      handled += 1;
      setResults({ ...working });
      const totalCompleted = readyItems.filter((candidate) => working[candidate.id]?.status === "completed").length;
      setStatus(t.statusProgress(handled, targets.length));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    const totalCompleted = readyItems.filter((item) => working[item.id]?.status === "completed").length;
    const totalFailed = readyItems.filter((item) => working[item.id]?.status === "failed").length;
    if (cancelRef.current) setStatus(t.statusCancelled(handled, targets.length));
    else setStatus(totalFailed ? t.statusPartial(totalCompleted, totalFailed) : t.statusDone(totalCompleted));
    setIsProcessing(false);
  }, [completedCount, filenameSuffix, isProcessing, logoImage, outputFormat, quality, readyItems, results, secondaryEnabled, secondarySettings, settings, t]);

  const downloadZipResults = useCallback(async () => {
    const entries: ZipEntry[] = readyItems.flatMap((item) => {
      const result = results[item.id];
      return result?.status === "completed" && result.blob && result.name ? [{ name: result.name, blob: result.blob }] : [];
    });
    if (!entries.length) return;
    try {
      const zip = await createZipBlob(entries);
      const name = "watermarked-images.zip";
      setZipReady(zip);
      setZipName(name);
      downloadBlob(zip, name);
    } catch {
      setError(t.zipUnavailable);
    }
  }, [readyItems, results, t.zipUnavailable]);

  const cancelProcessing = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const downloadCurrent = useCallback(async () => {
    if (!selectedItem) return;
    if ((settings.kind === "logo" || (secondaryEnabled && secondarySettings.kind === "logo")) && !logoImage) {
      setError(t.dropLogoFirst);
      return;
    }
    const existing = results[selectedItem.id];
    if (existing?.status === "completed" && existing.blob && existing.name) {
      downloadBlob(existing.blob, existing.name);
      return;
    }
    try {
      const { blob } = await renderItemBlob(selectedItem, settings, secondarySettings, secondaryEnabled, logoImage, outputFormat, quality);
      const usedNames = new Set(Object.values(results).flatMap((result) => result.status === "completed" && result.name ? [result.name.toLowerCase()] : []));
      const name = makeUniqueOutputName(buildOutputName(selectedItem.file, filenameSuffix.trim(), outputFormat), usedNames);
      setResults((prev) => ({ ...prev, [selectedItem.id]: { status: "completed", blob, name, size: blob.size } }));
      downloadBlob(blob, name);
    } catch {
      setResults((prev) => ({ ...prev, [selectedItem.id]: { status: "failed", error: t.processingLimit } }));
      setError(t.processingLimit);
    }
  }, [completedCount, filenameSuffix, logoImage, outputFormat, quality, results, secondaryEnabled, secondarySettings, selectedItem, settings, t.dropLogoFirst, t.processingLimit]);

  const downloadItemResult = useCallback((itemId: string) => {
    const result = results[itemId];
    if (result?.status === "completed" && result.blob && result.name) downloadBlob(result.blob, result.name);
  }, [results]);

  const summaryItems = useMemo(() => [
    `${t.fileCount}: ${readyItems.length}`,
    `${t.completed}: ${completedCount}`,
    `${t.failed}: ${failedProcessCount}`,
    `${t.compareSize}`,
    `${t.outputFormat}: ${outputFormat === "original" ? t.originalFormat : outputFormat.toUpperCase()}`,
    settings.kind === "text" ? `${t.text}: ${settings.text || "-"}` : `${t.logo}: ${logoName || "-"}`,
    secondaryEnabled ? `${t.secondWatermark}: ${secondarySettings.kind === "text" ? secondarySettings.text || "-" : logoName || "-"}` : null,
  ].filter((item): item is string => Boolean(item)), [completedCount, failedProcessCount, logoName, outputFormat, readyItems.length, secondaryEnabled, secondarySettings.kind, secondarySettings.text, settings.kind, settings.text, t]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const next = [...prev];
      const previous = next.pop()!;
      setFuture((futurePrev) => [settings, ...futurePrev].slice(0, 40));
      continuousHistoryRef.current = null;
      settingsRef.current = previous;
      setSettings(previous);
      invalidateResults();
      return next;
    });
  }, [invalidateResults, settings]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (!prev.length) return prev;
      const [next, ...rest] = prev;
      setHistory((historyPrev) => [...historyPrev.slice(-39), settings]);
      continuousHistoryRef.current = null;
      settingsRef.current = next;
      setSettings(next);
      invalidateResults();
      return rest;
    });
  }, [invalidateResults, settings]);

  return (
    <div className="tool017-workbench toolbox-workbench" data-testid="tool017-root">
      <div
        className={`toolbox-workbench-upload ${externalDrag ? "is-dragging" : ""}`}
        onDragEnter={(event) => { if (Array.from(event.dataTransfer.types).includes("Files")) { event.preventDefault(); setExternalDrag(true); } }}
        onDragOver={(event) => { if (Array.from(event.dataTransfer.types).includes("Files")) { event.preventDefault(); setExternalDrag(true); } }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setExternalDrag(false); }}
        onDrop={(event) => { if (event.dataTransfer.files.length) { event.preventDefault(); event.stopPropagation(); setExternalDrag(false); void addFiles(event.dataTransfer.files); } }}
      >
        <div className="toolbox-workbench-topline">
          <div>
            <span>WORKSPACE</span>
            <strong>{t.workspace}</strong>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="toolbox-upload-focus">
            <span className="toolbox-upload-icon" aria-hidden="true">＋</span>
            <h2>{t.drop}</h2>
            <p>{t.local}</p>
            <button type="button" onClick={() => openFilePicker(inputRef.current)} data-testid="tool017-select">{t.select}</button>
            <small>{t.support}</small>
          </div>
        ) : (
          <div className="toolbox-upload-active">
            <div className="toolbox-upload-active-head">
              <div>
                <span>{t.selected}</span>
                <p>{t.local}</p>
              </div>
              <div className="toolbox-upload-active-actions">
                <div className="toolbox-file-stats">
                  <span>{items.length} {t.fileCount}</span>
                  <span>{readyItems.length} {t.ready}</span>
                  <span>{items.filter((item) => item.status === "failed").length} {t.failed}</span>
                </div>
                <button type="button" onClick={() => openFilePicker(inputRef.current)} data-testid="tool017-select">＋ {t.add}</button>
              </div>
            </div>
            <div className="toolbox-upload-selected-file"><strong>{t.selected}</strong><span>{t.support}</span></div>
          </div>
        )}
      </div>
      {error && items.length === 0 ? <p className="tool017-error tool017-upload-error" role="alert" data-testid="tool017-error">{error}</p> : null}
      <input ref={inputRef} data-testid="tool017-input" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => { if (event.target.files) void addFiles(event.target.files); event.currentTarget.value = ""; }} />
      <input ref={logoInputRef} data-testid="tool017-logo-input" type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void loadLogo(file); event.currentTarget.value = ""; }} />
      {items.length > 0 ? <>
      <div
        className={`tool017-editor toolbox-workbench-editor-grid ${externalDrag ? "is-dragging" : ""}`}
        onDragEnter={(event) => { if (Array.from(event.dataTransfer.types).includes("Files")) { event.preventDefault(); setExternalDrag(true); } }}
        onDragOver={(event) => { if (Array.from(event.dataTransfer.types).includes("Files")) { event.preventDefault(); setExternalDrag(true); } }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setExternalDrag(false); }}
        onDrop={(event) => { if (event.dataTransfer.files.length) { event.preventDefault(); event.stopPropagation(); setExternalDrag(false); void addFiles(event.dataTransfer.files); } }}
      >
        <aside className="tool017-files toolbox-workbench-settings-card">
          <div className="toolbox-workbench-settings-head">
            <div>
              <span>{t.fileList}</span>
              <p>{t.imageListHelp}</p>
            </div>
            <div className="tool017-mini-meta"><span>{readyItems.length} {t.ready}</span></div>
          </div>
          {items.length ? (
            <div className="tool017-file-list">
              {items.map((item) => (
                <button type="button" key={item.id} data-process-status={item.status === "failed" ? "failed" : results[item.id]?.status ?? "waiting"} data-result-name={results[item.id]?.name ?? ""} className={`tool017-file-item ${selectedItem?.id === item.id ? "is-selected" : ""} ${item.status === "failed" ? "is-failed" : ""}`} onClick={() => item.status === "ready" && setSelectedId(item.id)}>
                  <div className="tool017-thumb">{item.url ? <img src={item.url} alt="" /> : <span>!</span>}</div>
                  <div className="tool017-file-copy">
                    <strong>{item.name}</strong>
                    {selectedItem?.id === item.id ? <span className="tool017-representative-mark"><span aria-hidden="true">✓</span>{t.representative}</span> : null}
                    <small>{item.status === "ready" ? `${item.width} × ${item.height}${results[item.id]?.size ? ` · ${(results[item.id]!.size! / 1024).toFixed(1)} KB` : ""}` : item.error || t.failed}</small>
                  </div>
                  <span className={`tool017-status-chip is-${item.status === "failed" ? "failed" : results[item.id]?.status ?? "waiting"}`}>{item.status === "failed" ? t.failed : results[item.id]?.status === "processing" ? t.processing : results[item.id]?.status === "completed" ? t.completed : results[item.id]?.status === "failed" ? t.failed : t.waiting}</span>
                  <span className="tool017-file-actions">{results[item.id]?.status === "completed" ? <span role="button" tabIndex={0} className="tool017-file-download" onClick={(event) => { event.stopPropagation(); downloadItemResult(item.id); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); downloadItemResult(item.id); } }}>{t.downloadResult}</span> : null}<span className="tool017-remove" role="button" tabIndex={isProcessing ? -1 : 0} aria-disabled={isProcessing} onClick={(event) => { event.stopPropagation(); if (!isProcessing) removeItem(item.id); }} onKeyDown={(event) => { if (!isProcessing && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); event.stopPropagation(); removeItem(item.id); } }}>{t.itemRemove}</span></span>
                </button>
              ))}
            </div>
          ) : <p className="tool017-empty">{t.noImages}</p>}
        </aside>

        <main className="tool017-preview toolbox-workbench-preview-card">
          <div className="toolbox-workbench-settings-head">
            <div>
              <span>{t.preview}</span>
              <p>{selectedItem ? `${selectedItem.width} × ${selectedItem.height}px` : t.noImages}</p>
            </div>
            <div className="tool017-preview-actions">
              <button type="button" data-testid="tool017-preview-original" aria-pressed={showOriginal} className={showOriginal ? "is-active" : ""} onClick={() => setShowOriginal(true)}>{showOriginal ? <span className="tool017-active-mark" aria-hidden="true">✓</span> : null}{locale === "ko" ? "원본" : locale === "en" ? "Original" : "元画像"}</button>
              <button type="button" data-testid="tool017-preview-result" aria-pressed={!showOriginal} className={!showOriginal ? "is-active" : ""} onClick={() => setShowOriginal(false)}>{!showOriginal ? <span className="tool017-active-mark" aria-hidden="true">✓</span> : null}{locale === "ko" ? "결과" : locale === "en" ? "Result" : "結果"}</button>
              <button type="button" onClick={undo} disabled={!history.length}>{t.undo}</button>
              <button type="button" onClick={redo} disabled={!future.length}>{t.redo}</button>
            </div>
          </div>
          <div className="tool017-canvas-wrap">
            {selectedItem ? <canvas ref={canvasRef} data-testid="tool017-preview-canvas" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} className={dragging ? "is-dragging" : ""} /> : <p className="tool017-empty-preview">{t.choosePreview}</p>}
          </div>
          <div className="tool017-preview-notes">
            <p>{t.previewOnly}</p>
            <p>{t.dragHint}</p>
            <p>{t.relativeNote}</p>
          </div>
        </main>

        <aside className="tool017-settings toolbox-workbench-settings-card">
          <div className="toolbox-workbench-settings-head">
            <div><span>{t.watermark}</span><p>{settings.kind === "text" ? t.text : t.logo}</p></div>
          </div>
          <div className="tool017-segment">
            <button type="button" data-testid="tool017-mode-text" className={settings.kind === "text" ? "is-active" : ""} onClick={() => pushSettings((prev) => ({ ...prev, kind: "text" }))}>{t.text}</button>
            <button type="button" data-testid="tool017-mode-logo" className={settings.kind === "logo" ? "is-active" : ""} onClick={() => pushSettings((prev) => ({ ...prev, kind: "logo" }))}>{t.logo}</button>
          </div>
          {settings.kind === "text" ? (
            <div className="tool017-fields">
              <label>{t.textLabel}<input data-testid="tool017-text-input" value={settings.text} maxLength={300} onChange={(event) => pushSettings((prev) => ({ ...prev, text: event.target.value || " " }), true)} onBlur={commitContinuousEdit} /></label>
              <div className="tool017-two">
                <label>{t.font}<select value={settings.fontFamily} onChange={(event) => pushSettings((prev) => ({ ...prev, fontFamily: event.target.value as FontFamily }))}><option value="sans">{t.fontSans}</option><option value="serif">{t.fontSerif}</option><option value="monospace">{t.fontMono}</option><option value="rounded">{t.fontRounded}</option></select></label>
                <label className="tool017-check"><input type="checkbox" checked={settings.bold} onChange={(event) => pushSettings((prev) => ({ ...prev, bold: event.target.checked }))} />{t.bold}</label>
              </div>
              <div className="tool017-three">
                <label>{t.color}<input type="color" value={settings.color} onChange={(event) => pushSettings((prev) => ({ ...prev, color: event.target.value }))} /></label>
                <label className="tool017-check"><input type="checkbox" checked={settings.outline} onChange={(event) => pushSettings((prev) => ({ ...prev, outline: event.target.checked }))} />{t.outline}</label>
                <label className="tool017-check"><input type="checkbox" checked={settings.shadow} onChange={(event) => pushSettings((prev) => ({ ...prev, shadow: event.target.checked }))} />{t.shadow}</label>
              </div>
              {settings.outline ? <div className="tool017-two"><label>{t.outlineColor}<input type="color" value={settings.outlineColor} onChange={(event) => pushSettings((prev) => ({ ...prev, outlineColor: event.target.value }))} /></label><label>{t.outlineWidth}<input type="range" min="1" max="20" value={settings.outlineWidth} onChange={(event) => pushSettings((prev) => ({ ...prev, outlineWidth: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.outlineWidth}%</span></label></div> : null}
              {settings.shadow ? <div><div className="tool017-two"><label>{t.shadowColor}<input type="color" value={settings.shadowColor} onChange={(event) => pushSettings((prev) => ({ ...prev, shadowColor: event.target.value }))} /></label><label>{t.shadowOpacity}<input type="range" min="0" max="100" value={settings.shadowOpacity} onChange={(event) => pushSettings((prev) => ({ ...prev, shadowOpacity: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.shadowOpacity}%</span></label></div><div className="tool017-three"><label>{t.shadowBlur}<input type="range" min="0" max="30" value={settings.shadowBlur} onChange={(event) => pushSettings((prev) => ({ ...prev, shadowBlur: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.shadowBlur}</span></label><label>{t.shadowX}<input type="range" min="-20" max="20" value={settings.shadowX} onChange={(event) => pushSettings((prev) => ({ ...prev, shadowX: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.shadowX}</span></label><label>{t.shadowY}<input type="range" min="-20" max="20" value={settings.shadowY} onChange={(event) => pushSettings((prev) => ({ ...prev, shadowY: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.shadowY}</span></label></div></div> : null}
            </div>
          ) : (
            <div className="tool017-fields">
              <div className="tool017-logo-picker">
                <label>{t.logoFile}</label>
                <div className="tool017-logo-actions"><button type="button" onClick={() => openFilePicker(logoInputRef.current)} data-testid="tool017-logo-select">{t.chooseLogo}</button>{logoImage ? <button type="button" onClick={() => { if (logoUrl) URL.revokeObjectURL(logoUrl); setLogoUrl(null); setLogoImage(null); setLogoName(""); invalidateResults(); }}>{t.removeLogo}</button> : null}</div>
                <p>{logoName || t.logoHint}</p>
                <small>{t.logoLocal}</small>
              </div>
              {!logoImage ? <p className="tool017-soft-warning">{t.logoNotSelected}</p> : null}
            </div>
          )}

          <div className="toolbox-workbench-settings-head"><div><span>{t.position}</span><p>{settings.repeatMode === "off" ? t.position : t.repeat}</p></div></div>
          <div className="tool017-fields">
            <label>{t.size}<input data-testid="tool017-size" type="range" min="3" max="30" value={settings.sizeRatio} onChange={(event) => pushSettings((prev) => ({ ...prev, sizeRatio: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.sizeRatio}%</span></label>
            {settings.kind === "logo" ? <label>{t.logoScale}<input type="range" min="40" max="180" value={settings.logoScale} onChange={(event) => pushSettings((prev) => ({ ...prev, logoScale: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.logoScale}%</span></label> : null}
            <div className="tool017-two">
              <label>{t.opacity}<input data-testid="tool017-opacity" type="range" min="0" max="100" value={settings.opacity} onChange={(event) => pushSettings((prev) => ({ ...prev, opacity: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.opacity}%</span></label>
              <label>{t.rotation}<input data-testid="tool017-rotation" type="range" min="-180" max="180" value={settings.rotation} onChange={(event) => pushSettings((prev) => ({ ...prev, rotation: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.rotation}°</span></label>
            </div>
          </div>

        </aside>

        <section className="tool017-horizontal-settings" aria-label={t.output}>
          <div className="tool017-horizontal-grid">
            <div className="tool017-horizontal-card tool017-repeat-secondary-card">
              <div className="tool017-stacked-section tool017-repeat-card">
                <div className="toolbox-workbench-settings-head"><div><span>{t.repeat}</span><p>{settings.repeatMode === "off" ? t.off : settings.repeatMode === "grid" ? t.grid : t.diagonal}</p></div></div>
                <div className="tool017-fields">
                  <div className="tool017-segment tool017-segment-three">
                    <button type="button" data-testid="tool017-repeat-off" className={settings.repeatMode === "off" ? "is-active" : ""} onClick={() => pushSettings((prev) => ({ ...prev, repeatMode: "off" }))}>{t.off}</button>
                    <button type="button" data-testid="tool017-repeat-grid" className={settings.repeatMode === "grid" ? "is-active" : ""} onClick={() => pushSettings((prev) => ({ ...prev, repeatMode: "grid" }))}>{t.grid}</button>
                    <button type="button" data-testid="tool017-repeat-diagonal" className={settings.repeatMode === "diagonal" ? "is-active" : ""} onClick={() => pushSettings((prev) => ({ ...prev, repeatMode: "diagonal" }))}>{t.diagonal}</button>
                  </div>
                  {settings.repeatMode !== "off" ? (
                    <>
                      <label>{t.density}<input data-testid="tool017-density" type="range" min="60" max="160" value={settings.density} onChange={(event) => pushSettings((prev) => ({ ...prev, density: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.density}%</span></label>
                      <div className="tool017-two">
                        <label>{t.gapX}<input data-testid="tool017-gap-x" type="range" min="0" max="40" value={settings.gapX} onChange={(event) => pushSettings((prev) => ({ ...prev, gapX: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.gapX}%</span></label>
                        <label>{t.gapY}<input data-testid="tool017-gap-y" type="range" min="0" max="40" value={settings.gapY} onChange={(event) => pushSettings((prev) => ({ ...prev, gapY: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.gapY}%</span></label>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="tool017-stacked-section tool017-secondary-card">
                <div className="toolbox-workbench-settings-head"><div><span>{t.secondWatermark}</span><p>{t.secondNote}</p></div></div>
                <div className="tool017-fields">
                  <label className="tool017-check"><input data-testid="tool017-secondary-enabled" type="checkbox" checked={secondaryEnabled} onChange={(event) => { setSecondaryEnabled(event.target.checked); invalidateResults(); }} />{t.enableSecond}</label>
                  {secondaryEnabled ? (
                    <>
                      <div className="tool017-segment">
                        <button type="button" className={secondarySettings.kind === "text" ? "is-active" : ""} onClick={() => pushSecondarySettings((prev) => ({ ...prev, kind: "text" }))}>{t.text}</button>
                        <button type="button" className={secondarySettings.kind === "logo" ? "is-active" : ""} onClick={() => pushSecondarySettings((prev) => ({ ...prev, kind: "logo" }))}>{t.logo}</button>
                      </div>
                      {secondarySettings.kind === "text" ? <label>{t.textLabel}<input value={secondarySettings.text} maxLength={300} onChange={(event) => pushSecondarySettings((prev) => ({ ...prev, text: event.target.value || " " }))} /></label> : <div className="tool017-logo-picker"><p>{logoName || t.logoHint}</p><button type="button" onClick={() => openFilePicker(logoInputRef.current)}>{t.chooseLogo}</button></div>}
                      <div className="tool017-two">
                        <label>{t.size}<input type="range" min="3" max="30" value={secondarySettings.sizeRatio} onChange={(event) => pushSecondarySettings((prev) => ({ ...prev, sizeRatio: Number(event.target.value) }))} /><span>{secondarySettings.sizeRatio}%</span></label>
                        <label>{t.opacity}<input type="range" min="0" max="100" value={secondarySettings.opacity} onChange={(event) => pushSecondarySettings((prev) => ({ ...prev, opacity: Number(event.target.value) }))} /><span>{secondarySettings.opacity}%</span></label>
                      </div>
                      <label>{t.rotation}<input type="range" min="-180" max="180" value={secondarySettings.rotation} onChange={(event) => pushSecondarySettings((prev) => ({ ...prev, rotation: Number(event.target.value) }))} /><span>{secondarySettings.rotation}°</span></label>
                      <div className="tool017-grid-presets">
                        {([
                          ["top-left", "↖"], ["top-center", "↑"], ["top-right", "↗"],
                          ["middle-left", "←"], ["center", "•"], ["middle-right", "→"],
                          ["bottom-left", "↙"], ["bottom-center", "↓"], ["bottom-right", "↘"],
                        ] as const).map(([preset, label]) => <button type="button" key={`secondary-${preset}`} aria-label={`${t.secondWatermark} · ${t.position}: ${positionPresetLabels[locale][preset]}`} title={positionPresetLabels[locale][preset]} className={secondarySettings.position === preset ? "is-active" : ""} onClick={() => pushSecondarySettings((prev) => ({ ...prev, position: preset, freePosition: false, relativeX: null, relativeY: null, repeatMode: "off" }))}>{label}</button>)}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>


            <div className="tool017-horizontal-card tool017-position-card">
              <div className="toolbox-workbench-settings-head"><div><span>{t.position}</span><p>{settings.repeatMode === "off" ? t.position : t.repeat}</p></div></div>
              <div className="tool017-fields">
                {settings.repeatMode === "off" ? (
                  <>
                    <label>{t.margin}<input type="range" min="0" max="20" value={settings.margin} onChange={(event) => pushSettings((prev) => ({ ...prev, margin: Number(event.target.value) }), true)} onPointerUp={commitContinuousEdit} onKeyUp={commitContinuousEdit} onBlur={commitContinuousEdit} /><span>{settings.margin}%</span></label>
                    <div className="tool017-grid-presets">
                      {([
                        ["top-left", "↖"], ["top-center", "↑"], ["top-right", "↗"],
                        ["middle-left", "←"], ["center", "•"], ["middle-right", "→"],
                        ["bottom-left", "↙"], ["bottom-center", "↓"], ["bottom-right", "↘"],
                      ] as const).map(([preset, label]) => (
                        <button type="button" key={`horizontal-${preset}`} aria-label={`${t.position}: ${positionPresetLabels[locale][preset]}`} title={positionPresetLabels[locale][preset]} className={settings.position === preset && !settings.freePosition ? "is-active" : ""} onClick={() => pushSettings((prev) => ({ ...prev, position: preset, freePosition: false, relativeX: null, relativeY: null }))}>{label}</button>
                      ))}
                    </div>
                    <div className="tool017-two">
                      <label className="tool017-check"><input type="checkbox" checked={settings.freePosition} onChange={(event) => pushSettings((prev) => ({ ...prev, freePosition: event.target.checked, relativeX: event.target.checked ? prev.relativeX : null, relativeY: event.target.checked ? prev.relativeY : null }))} />{t.freePosition}</label>
                      <button type="button" className="tool017-reset-btn" onClick={() => pushSettings((prev) => ({ ...prev, freePosition: false, relativeX: null, relativeY: null }))}>{t.resetPosition}</button>
                    </div>
                  </>
                ) : <p className="tool017-soft-warning">{t.dragHint}</p>}
              </div>
            </div>

            <div className="tool017-horizontal-card tool017-export-card">
              <div className="toolbox-workbench-settings-head"><div><span>{t.output}</span><p>{t.summary}</p></div></div>
              <div className="tool017-fields">
                <label>{t.outputFormat}<select data-testid="tool017-output-format" value={outputFormat} onChange={(event) => { setOutputFormat(event.target.value as OutputFormat); invalidateResults(); }}><option value="original">{t.original}</option><option value="png">PNG</option><option value="jpg">JPG</option><option value="webp">WebP</option></select></label>
                <label>{t.quality}<input data-testid="tool017-quality" type="range" min="40" max="100" disabled={outputFormat === "png" || outputFormat === "original" && selectedItem?.file.type === "image/png"} value={quality} onChange={(event) => { setQuality(Number(event.target.value)); invalidateResults(); }} /><span>{quality}%</span></label>
                <label>{t.filename}<input value={filenameSuffix} onChange={(event) => { setFilenameSuffix(event.target.value); invalidateResults(); }} /></label>
                <div className="tool017-summary-box">
                  {summaryItems.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="tool017-output toolbox-workbench-result-card">
        <div className="toolbox-workbench-settings-head">
          <div><span>{t.output}</span><p>{t.statusIdle}</p></div>
        </div>
        <div className="tool017-output-body">
          <div className="toolbox-workbench-actions">
            <button type="button" className="toolbox-primary-action" onClick={() => void processImages("all")} disabled={!readyItems.length || isProcessing || ((settings.kind === "logo" || (secondaryEnabled && secondarySettings.kind === "logo")) && !logoImage)} data-testid="tool017-process-all">{t.process}</button>
            <button type="button" data-testid="tool017-process-unprocessed" onClick={() => void processImages("unprocessed")} disabled={isProcessing || !readyItems.some((item) => !results[item.id] || results[item.id].status === "waiting")}>{t.processUnprocessed}</button>
            <button type="button" data-testid="tool017-retry-failed" onClick={() => void processImages("failed")} disabled={isProcessing || !failedProcessCount}>{t.retryFailed}</button>
            {isProcessing ? <button type="button" data-testid="tool017-cancel" onClick={cancelProcessing}>{t.cancelProcessing}</button> : null}
            <button type="button" onClick={() => void downloadZipResults()} disabled={isProcessing || !completedCount} data-testid="tool017-download-zip">{t.downloadZip}</button>
            <button type="button" data-testid="tool017-download-current" onClick={() => void downloadCurrent()} disabled={!selectedItem || ((settings.kind === "logo" || (secondaryEnabled && secondarySettings.kind === "logo")) && !logoImage)}>{t.current}</button>
            <button type="button" onClick={resetWatermarks}>{t.resetWatermark}</button>
            <button type="button" onClick={clearAll} disabled={isProcessing}>{t.removeAll}</button>
            <button type="button" className="toolbox-restart-action" onClick={resetAll} disabled={isProcessing}>{t.resetAll}</button>
          </div>
          {zipReady ? <div className="tool017-zip-row"><strong>{zipName}</strong><button type="button" onClick={() => downloadBlob(zipReady, zipName)}>{t.downloadZip}</button></div> : null}
          <div className="toolbox-workbench-summary"><strong>{completedCount}</strong><span>{t.summary}</span><span>{completedCount} / {readyItems.length} · {t.failed} {failedProcessCount}</span></div>
          <p className="tool017-status" aria-live="polite">{status}</p>
          {error ? <p className="tool017-error" role="alert" data-testid="tool017-error">{error}</p> : null}
          <span hidden data-testid="tool017-state" data-files={readyItems.length} data-kind={settings.kind} data-repeat={settings.repeatMode} data-position={settings.position} data-opacity={settings.opacity} data-size={settings.sizeRatio} data-secondary={secondaryEnabled ? "1" : "0"} data-secondary-kind={secondarySettings.kind} data-completed={completedCount} data-failed={failedProcessCount} data-processing={isProcessing ? "1" : "0"} data-output={outputFormat} data-preview={showOriginal ? "original" : "result"} />
        </div>
      </div>
      </> : null}
    </div>
  );
}
