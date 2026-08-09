"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./social-media-image-maker-tool.module.css";
import { createStoredZip } from "@/lib/zip";
import type { Locale } from "@/lib/site";

type OutputFormat = "jpg" | "png";
type Scope = "common" | "preset";
type EditTarget = "background" | "title" | "subtitle" | "logo";

type SocialPreset = {
  id: string;
  platform: string;
  usage: Record<Locale, string>;
  label: Record<Locale, string>;
  width: number;
  height: number;
  ratio: string;
  sourceType: "official-supported" | "toolbox-recommended";
  verifiedAt: string;
  note: Record<Locale, string>;
  suffix: string;
};

type Asset = {
  fileName: string;
  objectUrl?: string;
  image: CanvasImageSource;
  width: number;
  height: number;
};

type CommonState = {
  title: string;
  subtitle: string;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  textColor: string;
  titleSize: number;
  subtitleSize: number;
  backgroundColor: string;
  overlayColor: string;
  overlayOpacity: number;
  titleX: number;
  titleY: number;
  subtitleX: number;
  subtitleY: number;
  logoX: number;
  logoY: number;
  logoScale: number;
  logoOpacity: number;
};

type PresetOverride = Partial<Pick<CommonState, "titleX" | "titleY" | "titleSize" | "subtitleX" | "subtitleY" | "subtitleSize" | "logoX" | "logoY" | "logoScale" | "logoOpacity">> & {
  cropX?: number;
  cropY?: number;
  zoom?: number;
};

type RenderState = CommonState & {
  cropX: number;
  cropY: number;
  zoom: number;
};

const LIMITS = {
  maxBackgroundBytes: 20 * 1024 * 1024,
  maxLogoBytes: 10 * 1024 * 1024,
  maxTitleChars: 120,
  maxSubtitleChars: 240,
  maxPixels: 40_000_000,
} as const;

const FONT_OPTIONS = [
  { value: `Inter, "Pretendard", "Noto Sans KR", "Segoe UI", sans-serif`, label: { ko: "기본 산세리프", en: "Default Sans", ja: "基本サンセリフ" } },
  { value: `"Arial Black", "Arial Bold", Arial, sans-serif`, label: { ko: "볼드 산세리프", en: "Bold Sans", ja: "太字サンセリフ" } },
  { value: `Georgia, "Times New Roman", serif`, label: { ko: "세리프", en: "Serif", ja: "セリフ" } },
] as const;

const SOCIAL_PRESETS: SocialPreset[] = [
  {
    id: "instagram-post",
    platform: "Instagram",
    usage: { ko: "게시물", en: "Post", ja: "投稿" },
    label: { ko: "Instagram 게시물", en: "Instagram Post", ja: "Instagram 投稿" },
    width: 1080,
    height: 1350,
    ratio: "4:5",
    sourceType: "official-supported",
    verifiedAt: "2026-08-09",
    note: {
      ko: "TOOLBOX 기본 preset · Instagram 공식 지원 범위 안의 4:5",
      en: "TOOLBOX default preset · 4:5 within Instagram's supported range",
      ja: "TOOLBOX基本プリセット · Instagram公式対応範囲内の4:5",
    },
    suffix: "instagram-post",
  },
  {
    id: "instagram-story",
    platform: "Instagram",
    usage: { ko: "스토리", en: "Story", ja: "ストーリー" },
    label: { ko: "Instagram Story", en: "Instagram Story", ja: "Instagram Story" },
    width: 1080,
    height: 1920,
    ratio: "9:16",
    sourceType: "official-supported",
    verifiedAt: "2026-08-09",
    note: {
      ko: "TOOLBOX 기본 preset · 세로 전체화면 Story 권장 비율",
      en: "TOOLBOX default preset · recommended full-screen Story ratio",
      ja: "TOOLBOX基本プリセット · 全画面Story推奨比率",
    },
    suffix: "instagram-story",
  },
  {
    id: "facebook-feed",
    platform: "Facebook",
    usage: { ko: "피드", en: "Feed", ja: "フィード" },
    label: { ko: "Facebook", en: "Facebook", ja: "Facebook" },
    width: 1080,
    height: 1350,
    ratio: "4:5",
    sourceType: "official-supported",
    verifiedAt: "2026-08-09",
    note: {
      ko: "TOOLBOX 기본 preset · Meta 안내에서 많이 쓰는 4:5",
      en: "TOOLBOX default preset · 4:5 commonly used in Meta guidance",
      ja: "TOOLBOX基本プリセット · Meta案内で使いやすい4:5",
    },
    suffix: "facebook",
  },
  {
    id: "x-post",
    platform: "X",
    usage: { ko: "게시물", en: "Post", ja: "投稿" },
    label: { ko: "X", en: "X", ja: "X" },
    width: 1200,
    height: 675,
    ratio: "16:9",
    sourceType: "toolbox-recommended",
    verifiedAt: "2026-08-09",
    note: {
      ko: "TOOLBOX 권장 preset · X 공식 강제 단일 픽셀값은 아님",
      en: "TOOLBOX recommended preset · not an X mandatory single pixel size",
      ja: "TOOLBOX推奨プリセット · Xの単一必須ピクセル値ではありません",
    },
    suffix: "x",
  },
  {
    id: "linkedin-post",
    platform: "LinkedIn",
    usage: { ko: "게시물", en: "Post", ja: "投稿" },
    label: { ko: "LinkedIn", en: "LinkedIn", ja: "LinkedIn" },
    width: 1200,
    height: 1200,
    ratio: "1:1",
    sourceType: "toolbox-recommended",
    verifiedAt: "2026-08-09",
    note: {
      ko: "TOOLBOX 권장 preset · LinkedIn 일반 게시물용 권장값",
      en: "TOOLBOX recommended preset · practical value for LinkedIn posts",
      ja: "TOOLBOX推奨プリセット · LinkedIn投稿向けの実用値",
    },
    suffix: "linkedin",
  },
];

const previewCardSizes: Record<string, { width: number; height: number }> = {
  "instagram-post": { width: 190, height: 238 },
  "instagram-story": { width: 190, height: 338 },
  "facebook-feed": { width: 190, height: 238 },
  "x-post": { width: 190, height: 107 },
  "linkedin-post": { width: 190, height: 190 },
};

const activePreviewSizes: Record<string, { width: number; height: number }> = {
  "instagram-post": { width: 340, height: 425 },
  "instagram-story": { width: 250, height: 444 },
  "facebook-feed": { width: 340, height: 425 },
  "x-post": { width: 420, height: 236 },
  "linkedin-post": { width: 360, height: 360 },
};

const DEFAULT_COMMON: CommonState = {
  title: "",
  subtitle: "",
  fontFamily: FONT_OPTIONS[0].value,
  textAlign: "left",
  textColor: "#ffffff",
  titleSize: 0.074,
  subtitleSize: 0.04,
  backgroundColor: "#0f172a",
  overlayColor: "#000000",
  overlayOpacity: 0.22,
  titleX: 0.08,
  titleY: 0.12,
  subtitleX: 0.08,
  subtitleY: 0.26,
  logoX: 0.74,
  logoY: 0.07,
  logoScale: 0.16,
  logoOpacity: 1,
};

const copy = {
  ko: {
    chooseBg: "배경 이미지 선택",
    replaceBg: "배경 교체",
    blank: "빈 디자인 시작",
    removeBg: "배경 제거",
    chooseLogo: "로고 선택",
    removeLogo: "로고 제거",
    startHint: "배경 이미지 선택 또는 빈 디자인 시작",
    dropHint: "이미지를 이 영역으로 끌어다 놓거나 아래 버튼으로 선택하세요.",
    local: "이미지, 텍스트, 로고는 현재 브라우저에서만 처리되며 FIXLGS 서버로 업로드되지 않습니다.",
    title: "제목",
    subtitle: "설명",
    titlePlaceholder: "예: 가을 프로모션",
    subtitlePlaceholder: "예: 기간, 혜택, 핵심 문구를 입력하세요.",
    font: "글꼴",
    align: "정렬",
    left: "왼쪽",
    center: "가운데",
    right: "오른쪽",
    top: "위",
    bottom: "아래",
    textColor: "글자색",
    titleSize: "제목 크기",
    subtitleSize: "설명 크기",
    bgColor: "배경색",
    overlayColor: "오버레이 색상",
    overlayOpacity: "오버레이 불투명도",
    outputPlatforms: "출력 플랫폼",
    currentSize: "현재 편집 규격",
    applyAll: "모든 규격에 적용",
    adjustCurrent: "이 규격만 조정",
    presetPreview: "규격 미리보기",
    sourceOfficial: "공식 지원 범위",
    sourceRecommended: "TOOLBOX 권장",
    activePreset: "현재 편집 중",
    overrideOn: "Override 있음",
    overrideOff: "공통값 사용",
    backgroundPosition: "배경 위치",
    zoom: "확대·축소",
    x: "가로",
    y: "세로",
    titlePosition: "제목 위치",
    subtitlePosition: "설명 위치",
    logoPosition: "로고 위치",
    logoScale: "로고 크기",
    logoOpacity: "로고 불투명도",
    resetSize: "이 규격 조정 초기화",
    resetAll: "전체 초기화",
    fileFormat: "파일 형식",
    imageQuality: "이미지 품질",
    downloadCurrent: "현재 규격 다운로드",
    downloadZip: "선택한 규격 ZIP 다운로드",
    continueEditing: "계속 편집",
    chooseAtLeastOne: "최소 1개 규격을 선택하세요.",
    statusReady: "설정이 준비되었습니다.",
    statusDownloading: "결과를 만드는 중입니다…",
    statusZip: "ZIP 파일을 준비하는 중입니다…",
    statusDone: "다운로드를 시작했습니다.",
    statusReset: "모든 상태를 초기화했습니다.",
    bgInfo: "배경",
    logoInfo: "로고",
    none: "없음",
    commonScope: "공통 디자인",
    presetScope: "현재 규격 override",
    exportGuide: "동일 디자인을 유지하면서 필요한 규격만 crop·위치·크기를 따로 조정하세요.",
    fileError: "JPG, PNG, WebP 파일만 사용할 수 있습니다.",
    sizeErrorBg: "배경 이미지는 20MB 이하만 지원합니다.",
    sizeErrorLogo: "로고 이미지는 10MB 이하만 지원합니다.",
    titleLimit: "제목은 120자 이하로 입력하세요.",
    pixelLimit: "원본 이미지는 4,000만 픽셀 이하만 지원합니다.",
    mismatchError: "파일 확장자와 실제 이미지 형식이 일치하지 않습니다.",
    animationError: "애니메이션 PNG/WebP는 지원하지 않습니다. 정지 이미지 파일을 사용하세요.",
    partialError: "일부 결과 생성에 실패해 성공한 파일만 개별 다운로드했습니다.",
    dimensionError: "결과 이미지 크기 검증에 실패했습니다. 다시 시도하세요.",
    editTarget: "편집 대상",
    backgroundTarget: "배경",
    titleTarget: "제목",
    subtitleTarget: "설명",
    logoTarget: "로고",
    quickAlign: "빠른 배치",
    moveHint: "미리보기에서 드래그하거나 화살표 키로 미세 이동할 수 있습니다.",
    subtitleLimit: "설명은 240자 이하로 입력하세요.",
    loadFail: "이미지를 불러오지 못했습니다. 다른 파일로 다시 시도하세요.",
    download: "다운로드",
    selected: "선택됨",
    notSelected: "선택 안 됨",
    actualSize: "실제 결과",
    workingHint: "Preview와 export는 같은 렌더 로직을 사용합니다.",
    outputCount: "선택 결과",
    noBg: "배경 이미지를 넣지 않으면 선택한 배경색과 오버레이로 빈 디자인을 만듭니다.",
  },
  en: {
    chooseBg: "Choose Background Image",
    replaceBg: "Replace Background",
    blank: "Start Blank",
    removeBg: "Remove Background",
    chooseLogo: "Choose Logo",
    removeLogo: "Remove Logo",
    startHint: "Choose a background image or start from a blank design",
    dropHint: "Drag and drop an image here, or choose a file with the button below.",
    local: "Images, text, and logos are processed only in this browser and are not uploaded to the FIXLGS server.",
    title: "Title",
    subtitle: "Description",
    titlePlaceholder: "e.g. Autumn Promotion",
    subtitlePlaceholder: "e.g. Add dates, benefits, or the key message.",
    font: "Font",
    align: "Align",
    left: "Left",
    center: "Center",
    right: "Right",
    top: "Top",
    bottom: "Bottom",
    textColor: "Text color",
    titleSize: "Title size",
    subtitleSize: "Description size",
    bgColor: "Background color",
    overlayColor: "Overlay color",
    overlayOpacity: "Overlay opacity",
    outputPlatforms: "Output Platforms",
    currentSize: "Current size",
    applyAll: "Apply to All Sizes",
    adjustCurrent: "Adjust This Size Only",
    presetPreview: "Size Preview",
    sourceOfficial: "Official range",
    sourceRecommended: "TOOLBOX recommended",
    activePreset: "Currently editing",
    overrideOn: "Override on",
    overrideOff: "Using common values",
    backgroundPosition: "Background position",
    zoom: "Zoom",
    x: "X",
    y: "Y",
    titlePosition: "Title position",
    subtitlePosition: "Description position",
    logoPosition: "Logo position",
    logoScale: "Logo size",
    logoOpacity: "Logo opacity",
    resetSize: "Reset This Size",
    resetAll: "Reset All",
    fileFormat: "File format",
    imageQuality: "Image quality",
    downloadCurrent: "Download Current Size",
    downloadZip: "Download Selected as ZIP",
    continueEditing: "Continue Editing",
    chooseAtLeastOne: "Select at least one size.",
    statusReady: "Your design is ready.",
    statusDownloading: "Generating your result…",
    statusZip: "Preparing the ZIP file…",
    statusDone: "Download started.",
    statusReset: "All states have been reset.",
    bgInfo: "Background",
    logoInfo: "Logo",
    none: "None",
    commonScope: "Common design",
    presetScope: "Current size override",
    exportGuide: "Keep one design and fine-tune crop, position, and scale only where a size needs its own adjustment.",
    fileError: "Only JPG, PNG, and WebP files are supported.",
    sizeErrorBg: "Background images must be 20MB or smaller.",
    sizeErrorLogo: "Logo images must be 10MB or smaller.",
    titleLimit: "Keep the title within 120 characters.",
    pixelLimit: "Source images must be 40 megapixels or smaller.",
    mismatchError: "The file extension does not match the actual image format.",
    animationError: "Animated PNG/WebP is not supported. Use a still image file.",
    partialError: "Some exports failed, so the successful files were downloaded individually.",
    dimensionError: "The exported image dimensions could not be verified. Please try again.",
    editTarget: "Edit target",
    backgroundTarget: "Background",
    titleTarget: "Title",
    subtitleTarget: "Description",
    logoTarget: "Logo",
    quickAlign: "Quick align",
    moveHint: "Drag on the preview or use arrow keys for fine movement.",
    subtitleLimit: "Keep the description within 240 characters.",
    loadFail: "The image could not be loaded. Please try another file.",
    download: "Download",
    selected: "Selected",
    notSelected: "Not selected",
    actualSize: "Output size",
    workingHint: "Preview and export use the same rendering logic.",
    outputCount: "Selected outputs",
    noBg: "If you do not choose a background image, a blank design is created using the selected background color and overlay.",
  },
  ja: {
    chooseBg: "背景画像を選択",
    replaceBg: "背景を変更",
    blank: "空のデザインから開始",
    removeBg: "背景を削除",
    chooseLogo: "ロゴを選択",
    removeLogo: "ロゴを削除",
    startHint: "背景画像を選択するか、空のデザインから開始してください",
    dropHint: "画像をこの領域へドラッグ＆ドロップするか、下のボタンから選択してください。",
    local: "画像・テキスト・ロゴはこのブラウザ内でのみ処理され、FIXLGSサーバーへアップロードされません。",
    title: "タイトル",
    subtitle: "説明",
    titlePlaceholder: "例: 秋のプロモーション",
    subtitlePlaceholder: "例: 期間、特典、要点を入力してください。",
    font: "フォント",
    align: "配置",
    left: "左",
    center: "中央",
    right: "右",
    top: "上",
    bottom: "下",
    textColor: "文字色",
    titleSize: "タイトルサイズ",
    subtitleSize: "説明サイズ",
    bgColor: "背景色",
    overlayColor: "オーバーレイ色",
    overlayOpacity: "オーバーレイ不透明度",
    outputPlatforms: "出力プラットフォーム",
    currentSize: "現在のサイズ",
    applyAll: "すべてのサイズに適用",
    adjustCurrent: "このサイズのみ調整",
    presetPreview: "サイズプレビュー",
    sourceOfficial: "公式対応範囲",
    sourceRecommended: "TOOLBOX推奨",
    activePreset: "現在編集中",
    overrideOn: "Overrideあり",
    overrideOff: "共通値を使用",
    backgroundPosition: "背景位置",
    zoom: "拡大・縮小",
    x: "X",
    y: "Y",
    titlePosition: "タイトル位置",
    subtitlePosition: "説明位置",
    logoPosition: "ロゴ位置",
    logoScale: "ロゴサイズ",
    logoOpacity: "ロゴ不透明度",
    resetSize: "このサイズをリセット",
    resetAll: "すべてリセット",
    fileFormat: "ファイル形式",
    imageQuality: "画質",
    downloadCurrent: "現在のサイズをダウンロード",
    downloadZip: "選択したサイズを ZIP でダウンロード",
    continueEditing: "編集を続ける",
    chooseAtLeastOne: "少なくとも1つのサイズを選択してください。",
    statusReady: "設定が準備できました。",
    statusDownloading: "結果を生成しています…",
    statusZip: "ZIPファイルを準備しています…",
    statusDone: "ダウンロードを開始しました。",
    statusReset: "すべての状態を初期化しました。",
    bgInfo: "背景",
    logoInfo: "ロゴ",
    none: "なし",
    commonScope: "共通デザイン",
    presetScope: "現在サイズの override",
    exportGuide: "同じデザインを保ちつつ、必要なサイズだけ crop・位置・サイズを個別に調整できます。",
    fileError: "JPG、PNG、WebP ファイルのみ対応しています。",
    sizeErrorBg: "背景画像は20MB以下のみ対応します。",
    sizeErrorLogo: "ロゴ画像は10MB以下のみ対応します。",
    titleLimit: "タイトルは120文字以内で入力してください。",
    pixelLimit: "元画像は4,000万ピクセル以下のみ対応します。",
    mismatchError: "ファイル拡張子と実際の画像形式が一致していません。",
    animationError: "アニメーションPNG/WebPには対応していません。静止画像を使用してください。",
    partialError: "一部の出力に失敗したため、成功したファイルのみ個別にダウンロードしました。",
    dimensionError: "出力画像のサイズ検証に失敗しました。もう一度お試しください。",
    editTarget: "編集対象",
    backgroundTarget: "背景",
    titleTarget: "タイトル",
    subtitleTarget: "説明",
    logoTarget: "ロゴ",
    quickAlign: "クイック配置",
    moveHint: "プレビュー上でドラッグするか、矢印キーで微調整できます。",
    subtitleLimit: "説明は240文字以内で入力してください。",
    loadFail: "画像を読み込めませんでした。別のファイルで再試行してください。",
    download: "ダウンロード",
    selected: "選択済み",
    notSelected: "未選択",
    actualSize: "実際の出力",
    workingHint: "プレビューと書き出しは同じ描画ロジックを使います。",
    outputCount: "選択された出力",
    noBg: "背景画像を選ばない場合は、背景色とオーバーレイで空のデザインを作成します。",
  },
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sanitizeFileName(input: string) {
  return input.replace(/[<>:"/\\|?*\x00-\x1F]/g, "-").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "social-design";
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.decoding = "async";
    image.src = url;
  });
}


function extensionMime(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return null;
}

async function sniffImageMime(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (isJpeg) return "image/jpeg";

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const isPng = bytes.length >= 8 && pngSignature.every((value, index) => bytes[index] === value);
  if (isPng) return "image/png";

  const isWebp = bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (isWebp) return "image/webp";

  return null;
}

function includesAscii(bytes: Uint8Array, token: string) {
  const needle = new TextEncoder().encode(token);
  outer: for (let i = 0; i <= bytes.length - needle.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (bytes[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

async function detectUnsupportedAnimation(file: File, actualMime: string) {
  if (actualMime !== "image/png" && actualMime !== "image/webp") return false;
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (actualMime === "image/png") return includesAscii(bytes, "acTL");
  return includesAscii(bytes, "ANIM") || includesAscii(bytes, "ANMF");
}

async function sniffImageDimensions(file: File, actualMime: string): Promise<{ width: number; height: number } | null> {
  const bytes = new Uint8Array(await file.slice(0, Math.min(file.size, 512 * 1024)).arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (actualMime === "image/png" && bytes.length >= 24) {
    return { width: view.getUint32(16, false), height: view.getUint32(20, false) };
  }

  if (actualMime === "image/jpeg" && bytes.length >= 4) {
    let offset = 2;
    const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    while (offset + 8 <= bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > bytes.length) break;
      const length = view.getUint16(offset, false);
      if (length < 2 || offset + length > bytes.length) break;
      if (sof.has(marker) && length >= 7) {
        return { height: view.getUint16(offset + 3, false), width: view.getUint16(offset + 5, false) };
      }
      offset += length;
    }
  }

  if (actualMime === "image/webp" && bytes.length >= 30) {
    const chunk = String.fromCharCode(...bytes.slice(12, 16));
    if (chunk === "VP8X") {
      const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
      const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
      return { width, height };
    }
    if (chunk === "VP8 " && bytes.length >= 30) {
      return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
    }
    if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
      const bits = view.getUint32(21, true);
      const width = (bits & 0x3fff) + 1;
      const height = ((bits >> 14) & 0x3fff) + 1;
      return { width, height };
    }
  }

  return null;
}

async function verifyBlobDimensions(blob: Blob, preset: SocialPreset) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob);
    const valid = bitmap.width === preset.width && bitmap.height === preset.height;
    bitmap.close();
    return valid;
  }

  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    return image.naturalWidth === preset.width && image.naturalHeight === preset.height;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function fileToAsset(file: File): Promise<Asset> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { fileName: file.name, image: bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Fall through to the HTMLImageElement decoder for browsers without this option.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    return { fileName: file.name, objectUrl, image, width: image.naturalWidth, height: image.naturalHeight };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function disposeAsset(asset: Asset | null) {
  if (!asset) return;
  if (asset.objectUrl) URL.revokeObjectURL(asset.objectUrl);
  const close = (asset.image as { close?: () => void }).close;
  if (typeof close === "function") close.call(asset.image);
}

function alphaHex(color: string, opacity: number) {
  const value = clamp(Math.round(opacity * 255), 0, 255).toString(16).padStart(2, "0");
  return `${color}${value}`;
}

function splitWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const char of paragraph) {
      const next = line + char;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = char;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  size: number,
  align: "left" | "center" | "right",
  color: string,
  fontFamily: string,
  fontWeight: number,
) {
  if (!text.trim()) return;
  ctx.save();
  ctx.font = `${fontWeight} ${Math.round(size)}px ${fontFamily}`;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = Math.max(4, size * 0.08);
  ctx.shadowOffsetY = Math.max(2, size * 0.06);

  const maxWidth = width;
  const lines = splitWrappedLines(ctx, text, maxWidth);
  const lineHeight = size * 1.24;
  const anchorX = x;

  lines.forEach((line, index) => {
    ctx.fillText(line, anchorX, y + index * lineHeight, maxWidth);
  });
  ctx.restore();
}

function drawGuideOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, label: string) {
  ctx.save();
  ctx.strokeStyle = "rgba(8, 104, 215, 0.55)";
  ctx.lineWidth = Math.max(1, width * 0.004);
  ctx.setLineDash([6, 6]);
  const margin = Math.round(Math.min(width, height) * 0.06);
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(8, 104, 215, 0.9)";
  ctx.fillRect(14, 14, Math.min(width * 0.42, 220), 28);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${Math.max(11, Math.round(width * 0.028))}px Inter, Arial, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText(label, 24, 28);
  ctx.restore();
}

function resolveState(common: CommonState, override: PresetOverride | undefined): RenderState {
  return {
    ...common,
    titleX: override?.titleX ?? common.titleX,
    titleY: override?.titleY ?? common.titleY,
    titleSize: override?.titleSize ?? common.titleSize,
    subtitleX: override?.subtitleX ?? common.subtitleX,
    subtitleY: override?.subtitleY ?? common.subtitleY,
    subtitleSize: override?.subtitleSize ?? common.subtitleSize,
    logoX: override?.logoX ?? common.logoX,
    logoY: override?.logoY ?? common.logoY,
    logoScale: override?.logoScale ?? common.logoScale,
    logoOpacity: override?.logoOpacity ?? common.logoOpacity,
    cropX: override?.cropX ?? 0,
    cropY: override?.cropY ?? 0,
    zoom: override?.zoom ?? 1,
  };
}

function renderDesignToCanvas(
  canvas: HTMLCanvasElement,
  preset: SocialPreset,
  background: Asset | null,
  logo: Asset | null,
  state: RenderState,
  options?: { previewLabel?: string | null; scaleTo?: { width: number; height: number } },
) {
  const outputWidth = options?.scaleTo?.width ?? preset.width;
  const outputHeight = options?.scaleTo?.height ?? preset.height;
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = outputWidth;
  const height = outputHeight;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = state.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  if (background) {
    const baseScale = Math.max(width / background.width, height / background.height);
    const scale = baseScale * clamp(state.zoom, 1, 2.8);
    const drawWidth = background.width * scale;
    const drawHeight = background.height * scale;
    const overflowX = Math.max(0, drawWidth - width);
    const overflowY = Math.max(0, drawHeight - height);
    const drawX = -(overflowX * ((clamp(state.cropX, -1, 1) + 1) / 2));
    const drawY = -(overflowY * ((clamp(state.cropY, -1, 1) + 1) / 2));
    ctx.drawImage(background.image, drawX, drawY, drawWidth, drawHeight);
  }

  if (state.overlayOpacity > 0) {
    ctx.fillStyle = alphaHex(state.overlayColor, state.overlayOpacity);
    ctx.fillRect(0, 0, width, height);
  }

  const minDim = Math.min(width, height);
  const titleSize = minDim * state.titleSize;
  const subtitleSize = minDim * state.subtitleSize;
  const textWidth = width * 0.82;

  drawMultilineText(
    ctx,
    state.title,
    width * clamp(state.titleX, 0.03, 0.9),
    height * clamp(state.titleY, 0.03, 0.9),
    textWidth,
    titleSize,
    state.textAlign,
    state.textColor,
    state.fontFamily,
    700,
  );

  drawMultilineText(
    ctx,
    state.subtitle,
    width * clamp(state.subtitleX, 0.03, 0.9),
    height * clamp(state.subtitleY, 0.03, 0.95),
    textWidth,
    subtitleSize,
    state.textAlign,
    state.textColor,
    state.fontFamily,
    500,
  );

  if (logo) {
    ctx.save();
    ctx.globalAlpha = clamp(state.logoOpacity, 0, 1);
    const targetWidth = minDim * clamp(state.logoScale, 0.06, 0.36);
    const ratio = logo.height / logo.width;
    const targetHeight = targetWidth * ratio;
    const x = clamp(width * state.logoX, 0, width - targetWidth);
    const y = clamp(height * state.logoY, 0, height - targetHeight);
    ctx.drawImage(logo.image, x, y, targetWidth, targetHeight);
    ctx.restore();
  }

  if (options?.previewLabel) {
    drawGuideOverlay(ctx, width, height, options.previewLabel);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, format: OutputFormat, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("encode-failed"));
      },
      format === "png" ? "image/png" : "image/jpeg",
      format === "png" ? undefined : quality,
    );
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function PresetCanvas({
  preset,
  background,
  logo,
  state,
  locale,
  active,
  interactive = false,
  onDrag,
}: {
  preset: SocialPreset;
  background: Asset | null;
  logo: Asset | null;
  state: RenderState;
  locale: Locale;
  active?: boolean;
  interactive?: boolean;
  onDrag?: (dx: number, dy: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    renderDesignToCanvas(ref.current, preset, background, logo, state, {
      previewLabel: active ? `${preset.label[locale]} · ${preset.width}×${preset.height}` : null,
      scaleTo: (active ? activePreviewSizes[preset.id] : previewCardSizes[preset.id]) ?? { width: 190, height: 190 },
    });
  }, [preset, background, logo, state, locale, active]);

  const previewSize = (active ? activePreviewSizes[preset.id] : previewCardSizes[preset.id]) ?? { width: 190, height: 190 };
  const pointer = useRef<{ x: number; y: number } | null>(null);
  return <canvas
    ref={ref}
    width={previewSize.width}
    height={previewSize.height}
    className={`${styles.previewCanvas} ${interactive ? styles.interactiveCanvas : ""}`}
    onPointerDown={interactive ? (event) => { pointer.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); } : undefined}
    onPointerMove={interactive ? (event) => {
      if (!pointer.current || !onDrag) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const dx = (event.clientX - pointer.current.x) / Math.max(1, rect.width);
      const dy = (event.clientY - pointer.current.y) / Math.max(1, rect.height);
      pointer.current = { x: event.clientX, y: event.clientY };
      onDrag(dx, dy);
    } : undefined}
    onPointerUp={interactive ? () => { pointer.current = null; } : undefined}
    onPointerCancel={interactive ? () => { pointer.current = null; } : undefined}
  />;
}

export function SocialMediaImageMakerTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [startedBlank, setStartedBlank] = useState(false);
  const [background, setBackground] = useState<Asset | null>(null);
  const [logo, setLogo] = useState<Asset | null>(null);
  const [common, setCommon] = useState<CommonState>(DEFAULT_COMMON);
  const [overrides, setOverrides] = useState<Record<string, PresetOverride>>({});
  const [selectedPresetId, setSelectedPresetId] = useState(SOCIAL_PRESETS[0].id);
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>(SOCIAL_PRESETS.map((preset) => preset.id));
  const [scope, setScope] = useState<Scope>("common");
  const [editTarget, setEditTarget] = useState<EditTarget>("background");
  const [format, setFormat] = useState<OutputFormat>("jpg");
  const [quality, setQuality] = useState(0.92);
  const [status, setStatus] = useState<string>(t.statusReady);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const backgroundRef = useRef<Asset | null>(null);
  const logoRef = useRef<Asset | null>(null);
  useEffect(() => { backgroundRef.current = background; }, [background]);
  useEffect(() => { logoRef.current = logo; }, [logo]);
  useEffect(() => () => {
    disposeAsset(backgroundRef.current);
    disposeAsset(logoRef.current);
  }, []);

  const currentPreset = useMemo(() => SOCIAL_PRESETS.find((item) => item.id === selectedPresetId) ?? SOCIAL_PRESETS[0], [selectedPresetId]);
  const currentState = useMemo(() => resolveState(common, overrides[selectedPresetId]), [common, overrides, selectedPresetId]);
  const hasStarted = startedBlank || !!background;
  const baseFileName = useMemo(() => sanitizeFileName(background?.fileName.replace(/\.[^.]+$/, "") ?? "social-design"), [background]);

  const setAsset = useCallback(async (file: File, kind: "background" | "logo") => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const expectedMime = extensionMime(file.name);
    if (!expectedMime || (file.type && !validTypes.includes(file.type))) {
      setError(t.fileError);
      return;
    }
    const actualMime = await sniffImageMime(file);
    if (!actualMime || expectedMime !== actualMime || (file.type && file.type !== actualMime)) {
      setError(t.mismatchError);
      return;
    }
    if (kind === "background" && file.size > LIMITS.maxBackgroundBytes) {
      setError(t.sizeErrorBg);
      return;
    }
    if (kind === "logo" && file.size > LIMITS.maxLogoBytes) {
      setError(t.sizeErrorLogo);
      return;
    }

    const headerDimensions = await sniffImageDimensions(file, actualMime);
    if (headerDimensions && headerDimensions.width * headerDimensions.height > LIMITS.maxPixels) {
      setError(t.pixelLimit);
      return;
    }
    if (await detectUnsupportedAnimation(file, actualMime)) {
      setError(t.animationError);
      return;
    }

    try {
      setError("");
      const asset = await fileToAsset(file);
      if (asset.width * asset.height > LIMITS.maxPixels) {
        disposeAsset(asset);
        setError(t.pixelLimit);
        return;
      }
      if (kind === "background") {
        setStartedBlank(false);
        setBackground((previous) => {
          disposeAsset(previous);
          return asset;
        });
      } else {
        setLogo((previous) => {
          disposeAsset(previous);
          return asset;
        });
      }
    } catch {
      setError(t.loadFail);
    }
  }, [t.animationError, t.fileError, t.loadFail, t.mismatchError, t.pixelLimit, t.sizeErrorBg, t.sizeErrorLogo]);

  const updateCommon = useCallback(<K extends keyof CommonState>(key: K, value: CommonState[K]) => {
    setCommon((previous) => ({ ...previous, [key]: value }));
  }, []);

  const updateTextAlign = useCallback((align: CommonState["textAlign"]) => {
    const anchorX = align === "left" ? 0.08 : align === "center" ? 0.5 : 0.9;
    setCommon((previous) => ({
      ...previous,
      textAlign: align,
      titleX: anchorX,
      subtitleX: anchorX,
    }));
  }, []);

  const updateOverride = useCallback((key: keyof PresetOverride, value: number) => {
    setOverrides((previous) => {
      const current = previous[selectedPresetId] ?? {};
      const next = { ...current, [key]: value };
      return { ...previous, [selectedPresetId]: next };
    });
  }, [selectedPresetId]);

  const updateScopedLayout = useCallback((key: keyof Pick<CommonState, "titleX" | "titleY" | "subtitleX" | "subtitleY" | "logoX" | "logoY" | "logoScale" | "logoOpacity">, value: number) => {
    if (scope === "common") {
      setCommon((previous) => ({ ...previous, [key]: value }));
      return;
    }
    updateOverride(key, value);
  }, [scope, updateOverride]);

  const togglePreset = useCallback((presetId: string) => {
    setSelectedPresetIds((previous) => {
      const exists = previous.includes(presetId);
      return exists ? previous.filter((id) => id !== presetId) : [...previous, presetId];
    });
  }, []);

  const resetPreset = useCallback(() => {
    setOverrides((previous) => {
      const next = { ...previous };
      delete next[selectedPresetId];
      return next;
    });
    setStatus(t.statusReady);
  }, [selectedPresetId, t.statusReady]);

  const resetAll = useCallback(() => {
    disposeAsset(background);
    disposeAsset(logo);
    setBackground(null);
    setLogo(null);
    setStartedBlank(false);
    setCommon(DEFAULT_COMMON);
    setOverrides({});
    setSelectedPresetId(SOCIAL_PRESETS[0].id);
    setSelectedPresetIds(SOCIAL_PRESETS.map((preset) => preset.id));
    setScope("common");
    setEditTarget("background");
    setFormat("jpg");
    setQuality(0.92);
    setError("");
    setStatus(t.statusReset);
  }, [background, logo, t.statusReset]);

  const exportPreset = useCallback(async (preset: SocialPreset) => {
    const canvas = document.createElement("canvas");
    renderDesignToCanvas(canvas, preset, background, logo, resolveState(common, overrides[preset.id]), {});
    const blob = await canvasToBlob(canvas, format, quality);
    if (!(await verifyBlobDimensions(blob, preset))) throw new Error("dimension-mismatch");
    return {
      blob,
      fileName: `${baseFileName}-${preset.suffix}.${format === "png" ? "png" : "jpg"}`,
    };
  }, [background, baseFileName, common, format, logo, overrides, quality]);

  const handleDownloadCurrent = useCallback(async () => {
    setBusy(true);
    setError("");
    setStatus(t.statusDownloading);
    try {
      const result = await exportPreset(currentPreset);
      downloadBlob(result.blob, result.fileName);
      setStatus(t.statusDone);
    } catch (error) {
      setError(error instanceof Error && error.message === "dimension-mismatch" ? t.dimensionError : t.loadFail);
    } finally {
      setBusy(false);
    }
  }, [currentPreset, exportPreset, t.dimensionError, t.loadFail, t.statusDone, t.statusDownloading]);

  const handleDownloadZip = useCallback(async () => {
    if (selectedPresetIds.length === 0) {
      setError(t.chooseAtLeastOne);
      return;
    }
    setBusy(true);
    setError("");
    setStatus(t.statusZip);
    const selectedPresets = SOCIAL_PRESETS.filter((preset) => selectedPresetIds.includes(preset.id));
    const files: Array<{ name: string; blob: Blob }> = [];
    let generationFailed = false;

    for (const preset of selectedPresets) {
      try {
        const result = await exportPreset(preset);
        files.push({ name: result.fileName, blob: result.blob });
      } catch {
        generationFailed = true;
      }
    }

    try {
      if (generationFailed || files.length !== selectedPresets.length) throw new Error("partial-generation");
      const zip = await createStoredZip(files);
      downloadBlob(zip, `${baseFileName}-sns-set.zip`);
      setStatus(t.statusDone);
    } catch {
      for (const file of files) downloadBlob(file.blob, file.name);
      const message = files.length > 0 ? t.partialError : t.loadFail;
      setError(message);
      setStatus(message);
    } finally {
      setBusy(false);
    }
  }, [baseFileName, exportPreset, selectedPresetIds, t.chooseAtLeastOne, t.loadFail, t.partialError, t.statusDone, t.statusZip]);

  const moveTarget = useCallback((dx: number, dy: number) => {
    const stepX = dx;
    const stepY = dy;
    if (editTarget === "background") {
      updateOverride("cropX", clamp(currentState.cropX + stepX * 2, -1, 1));
      updateOverride("cropY", clamp(currentState.cropY + stepY * 2, -1, 1));
      return;
    }
    if (editTarget === "title") {
      updateScopedLayout("titleX", clamp(currentState.titleX + stepX, 0.03, 0.9));
      updateScopedLayout("titleY", clamp(currentState.titleY + stepY, 0.03, 0.9));
      return;
    }
    if (editTarget === "subtitle") {
      updateScopedLayout("subtitleX", clamp(currentState.subtitleX + stepX, 0.03, 0.9));
      updateScopedLayout("subtitleY", clamp(currentState.subtitleY + stepY, 0.03, 0.95));
      return;
    }
    updateScopedLayout("logoX", clamp(currentState.logoX + stepX, 0, 0.92));
    updateScopedLayout("logoY", clamp(currentState.logoY + stepY, 0, 0.92));
  }, [currentState, editTarget, updateOverride, updateScopedLayout]);

  const visibleField = (commonKey: keyof Pick<CommonState, "titleX" | "titleY" | "subtitleX" | "subtitleY" | "logoX" | "logoY" | "logoScale" | "logoOpacity">) => currentState[commonKey];

  return (
    <section className={styles.wrapper} data-testid="tool021-root">
      <p className={styles.localLine}>{t.local}</p>

      {!hasStarted ? (
        <section className={`toolbox-workbench ${styles.workspaceCard}`} data-testid="tool021-start-card">
          <div
            className={`toolbox-workbench-upload ${dragActive ? "is-dragging" : ""}`}
            data-testid="tool021-drop-zone"
            onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
            onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setDragActive(true); }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragActive(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              const file = event.dataTransfer.files?.[0];
              if (file) void setAsset(file, "background");
            }}
          >
            <div className="toolbox-workbench-topline">
              <div>
                <span>WORKSPACE</span>
                <strong>{locale === "ko" ? "SNS 이미지 제작 작업장" : locale === "en" ? "Social Media Image Workspace" : "SNS画像作成ワークスペース"}</strong>
              </div>
            </div>
            <div className={`toolbox-upload-focus ${styles.workspaceDropFocus}`}>
              <span className="toolbox-upload-icon" aria-hidden="true">＋</span>
              <h2>{t.chooseBg}</h2>
              <p>{t.dropHint}</p>
              <label className={styles.workspaceUploadButton}>
                <input
                  data-testid="tool021-background-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={styles.visuallyHidden}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void setAsset(file, "background");
                    event.currentTarget.value = "";
                  }}
                />
                {t.chooseBg}
              </label>
              <small>Instagram 4:5 · Story 9:16 · Facebook 4:5 · X 16:9 · LinkedIn 1:1 · JPG · PNG · WebP</small>
            </div>
            {error ? <div className="toolbox-workbench-notice"><strong>{locale === "ko" ? "안내" : locale === "en" ? "Notice" : "案内"}</strong><span className={styles.error} role="alert" data-testid="tool021-error">{error}</span></div> : null}
          </div>
          <div className={styles.blankStartRow}>
            <button data-testid="tool021-start-blank" className={styles.secondaryButton} onClick={() => { setStartedBlank(true); setError(""); setStatus(t.statusReady); }}>
              {t.blank}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className={styles.introGrid}>
            <article className={styles.assetCard}>
              <div className={styles.assetHead}>
                <h3>{t.bgInfo}</h3>
                <span data-testid="tool021-bg-dimensions">{background ? `${background.width}×${background.height}px` : t.none}</span>
              </div>
              <p>{background ? background.fileName : t.noBg}</p>
              <div className={styles.inlineActions}>
                <label className={styles.uploadButton}>
                  <input
                    data-testid="tool021-background-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={styles.visuallyHidden}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void setAsset(file, "background");
                      event.currentTarget.value = "";
                    }}
                  />
                  {background ? t.replaceBg : t.chooseBg}
                </label>
                <button className={styles.secondaryButton} onClick={() => { setBackground((previous) => { disposeAsset(previous); return null; }); setStartedBlank(true); }}>
                  {t.removeBg}
                </button>
              </div>
            </article>
            <article className={styles.assetCard}>
              <div className={styles.assetHead}>
                <h3>{t.logoInfo}</h3>
                <span>{logo ? `${logo.width}×${logo.height}px` : t.none}</span>
              </div>
              <p>{logo ? logo.fileName : t.none}</p>
              <div className={styles.inlineActions}>
                <label className={styles.uploadButton}>
                  <input
                    data-testid="tool021-logo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={styles.visuallyHidden}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void setAsset(file, "logo");
                      event.currentTarget.value = "";
                    }}
                  />
                  {t.chooseLogo}
                </label>
                <button className={styles.secondaryButton} onClick={() => setLogo((previous) => { disposeAsset(previous); return null; })}>
                  {t.removeLogo}
                </button>
              </div>
            </article>
            <article className={styles.assetCard}>
              <div className={styles.assetHead}>
                <h3>{t.outputCount}</h3>
                <span>{selectedPresetIds.length}</span>
              </div>
              <p>{t.exportGuide}</p>
              <p className={styles.hint}>{t.workingHint}</p>
            </article>
          </section>

          <section className={styles.platformSection}>
            <div className={styles.sectionHead}>
              <div>
                <p>PRESETS</p>
                <h3>{t.outputPlatforms}</h3>
              </div>
              <div className={styles.scopeBadge}>{scope === "common" ? t.commonScope : t.presetScope}</div>
            </div>

            <div className={styles.pillRow}>
              {SOCIAL_PRESETS.map((preset) => {
                const isSelected = selectedPresetIds.includes(preset.id);
                const hasOverride = !!overrides[preset.id] && Object.keys(overrides[preset.id] ?? {}).length > 0;
                return (
                  <div className={styles.pillShell} key={preset.id}>
                    <button
                      type="button"
                      className={`${styles.pill} ${selectedPresetId === preset.id ? styles.pillActive : ""}`}
                      data-testid={`tool021-preset-${preset.id}`}
                      onClick={() => setSelectedPresetId(preset.id)}
                      aria-pressed={selectedPresetId === preset.id}
                    >
                      <span>{preset.label[locale]}</span>
                      <strong>{preset.width}×{preset.height}</strong>
                      <small data-testid={`tool021-override-${preset.id}`}>{hasOverride ? t.overrideOn : t.overrideOff}</small>
                    </button>
                    <label className={styles.checkboxWrap}>
                      <input data-testid={`tool021-select-${preset.id}`} type="checkbox" checked={isSelected} onChange={() => togglePreset(preset.id)} aria-label={`${preset.label[locale]} ${isSelected ? t.selected : t.notSelected}`} />
                    </label>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.editorGrid}>
            <div className={styles.previewPanel}>
              <div className={styles.sectionHead}>
                <div>
                  <p>PREVIEW</p>
                  <h3>{t.currentSize}</h3>
                </div>
                <div className={styles.previewMeta}>
                  <strong>{currentPreset.label[locale]}</strong>
                  <span>{currentPreset.width} × {currentPreset.height} · {currentPreset.ratio}</span>
                </div>
              </div>
              <div
                className={styles.previewBox}
                tabIndex={0}
                data-testid="tool021-interactive-preview"
                aria-label={t.moveHint}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 0.02 : 0.006;
                  if (event.key === "ArrowLeft") { event.preventDefault(); moveTarget(-step, 0); }
                  if (event.key === "ArrowRight") { event.preventDefault(); moveTarget(step, 0); }
                  if (event.key === "ArrowUp") { event.preventDefault(); moveTarget(0, -step); }
                  if (event.key === "ArrowDown") { event.preventDefault(); moveTarget(0, step); }
                }}
              >
                <PresetCanvas preset={currentPreset} background={background} logo={logo} state={currentState} locale={locale} active interactive onDrag={moveTarget} />
              </div>
              <div className={styles.editTargetRow} data-testid="tool021-edit-targets">
                <span>{t.editTarget}</span>
                <div className={styles.segmented} role="group" aria-label={t.editTarget}>
                  <button aria-pressed={editTarget === "background"} className={editTarget === "background" ? styles.segmentedActive : ""} onClick={() => setEditTarget("background")}>{t.backgroundTarget}</button>
                  <button aria-pressed={editTarget === "title"} className={editTarget === "title" ? styles.segmentedActive : ""} onClick={() => setEditTarget("title")}>{t.titleTarget}</button>
                  <button aria-pressed={editTarget === "subtitle"} className={editTarget === "subtitle" ? styles.segmentedActive : ""} onClick={() => setEditTarget("subtitle")}>{t.subtitleTarget}</button>
                  <button aria-pressed={editTarget === "logo"} className={editTarget === "logo" ? styles.segmentedActive : ""} onClick={() => setEditTarget("logo")}>{t.logoTarget}</button>
                </div>
              </div>

              <div className={styles.previewLegend}>
                <span>{currentPreset.sourceType === "official-supported" ? t.sourceOfficial : t.sourceRecommended}</span>
                <strong>{currentPreset.note[locale]}</strong>
              </div>
            </div>

            <aside className={styles.controlPanel}>
              <section className={styles.controlCard}>
                <div className={styles.sectionHeadCompact}>
                  <h4>{t.applyAll}</h4>
                  <div className={styles.scopeToggle} role="group" aria-label={t.applyAll}>
                    <button data-testid="tool021-scope-common" aria-pressed={scope === "common"} className={scope === "common" ? styles.scopeActive : ""} onClick={() => setScope("common")}>{t.applyAll}</button>
                    <button data-testid="tool021-scope-preset" aria-pressed={scope === "preset"} className={scope === "preset" ? styles.scopeActive : ""} onClick={() => setScope("preset")}>{t.adjustCurrent}</button>
                  </div>
                </div>
                <div className={styles.fieldGrid}>
                  <label>
                    <span>{t.title}</span>
                    <input data-testid="tool021-title" value={common.title} maxLength={LIMITS.maxTitleChars} placeholder={t.titlePlaceholder} onChange={(event) => {
                      if (event.target.value.length > LIMITS.maxTitleChars) { setError(t.titleLimit); return; }
                      setError("");
                      updateCommon("title", event.target.value);
                    }} />
                  </label>
                  <label>
                    <span>{t.subtitle}</span>
                    <textarea data-testid="tool021-subtitle" value={common.subtitle} maxLength={LIMITS.maxSubtitleChars} placeholder={t.subtitlePlaceholder} onChange={(event) => {
                      if (event.target.value.length > LIMITS.maxSubtitleChars) { setError(t.subtitleLimit); return; }
                      setError("");
                      updateCommon("subtitle", event.target.value);
                    }} />
                  </label>
                  <label>
                    <span>{t.font}</span>
                    <select value={common.fontFamily} onChange={(event) => updateCommon("fontFamily", event.target.value)}>
                      {FONT_OPTIONS.map((font) => <option key={font.value} value={font.value}>{font.label[locale]}</option>)}
                    </select>
                  </label>
                  <div className={styles.fieldGroup} role="group" aria-label={t.align}>
                    <span>{t.align}</span>
                    <div className={styles.segmented}>
                      <button aria-pressed={common.textAlign === "left"} className={common.textAlign === "left" ? styles.segmentedActive : ""} onClick={() => updateTextAlign("left")}>{t.left}</button>
                      <button aria-pressed={common.textAlign === "center"} className={common.textAlign === "center" ? styles.segmentedActive : ""} onClick={() => updateTextAlign("center")}>{t.center}</button>
                      <button aria-pressed={common.textAlign === "right"} className={common.textAlign === "right" ? styles.segmentedActive : ""} onClick={() => updateTextAlign("right")}>{t.right}</button>
                    </div>
                  </div>
                  <label>
                    <span>{t.textColor}</span>
                    <input type="color" value={common.textColor} onChange={(event) => updateCommon("textColor", event.target.value)} />
                  </label>
                  <label>
                    <span>{t.titleSize}</span>
                    <input aria-label={t.titleSize} type="range" min="0.04" max="0.12" step="0.002" value={common.titleSize} onChange={(event) => updateCommon("titleSize", Number(event.target.value))} />
                  </label>
                  <label>
                    <span>{t.subtitleSize}</span>
                    <input aria-label={t.subtitleSize} type="range" min="0.024" max="0.08" step="0.002" value={common.subtitleSize} onChange={(event) => updateCommon("subtitleSize", Number(event.target.value))} />
                  </label>
                  <label>
                    <span>{t.bgColor}</span>
                    <input type="color" value={common.backgroundColor} onChange={(event) => updateCommon("backgroundColor", event.target.value)} />
                  </label>
                  <label>
                    <span>{t.overlayColor}</span>
                    <input type="color" value={common.overlayColor} onChange={(event) => updateCommon("overlayColor", event.target.value)} />
                  </label>
                  <label>
                    <span>{t.overlayOpacity} · {Math.round(common.overlayOpacity * 100)}%</span>
                    <input aria-label={t.overlayOpacity} type="range" min="0" max="0.8" step="0.02" value={common.overlayOpacity} onChange={(event) => updateCommon("overlayOpacity", Number(event.target.value))} />
                  </label>
                </div>
              </section>

              <section className={styles.controlCard}>
                <div className={styles.fieldGrid}>
                  <label>
                    <span>{t.fileFormat}</span>
                    <select data-testid="tool021-format" value={format} onChange={(event) => setFormat(event.target.value as OutputFormat)}>
                      <option value="jpg">JPG</option>
                      <option value="png">PNG</option>
                    </select>
                  </label>
                  <label>
                    <span>{t.imageQuality} · {Math.round(quality * 100)}</span>
                    <input aria-label={t.imageQuality} type="range" min="0.4" max="1" step="0.02" disabled={format === "png"} value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
                  </label>
                </div>
                <div className={styles.actionStack}>
                  <button className={styles.primaryButton} data-testid="tool021-download-current" disabled={busy} onClick={() => void handleDownloadCurrent()}>{t.downloadCurrent}</button>
                  <button className={styles.secondaryButton} data-testid="tool021-download-zip" disabled={busy} onClick={() => void handleDownloadZip()}>{t.downloadZip}</button>
                  <button className={styles.ghostButton} data-testid="tool021-continue-editing" disabled={busy} onClick={() => { setError(""); setStatus(t.statusReady); }}>{t.continueEditing}</button>
                  <button className={styles.ghostButton} data-testid="tool021-reset-all" disabled={busy} onClick={resetAll}>{t.resetAll}</button>
                </div>
                <p className={styles.status} data-testid="tool021-status" aria-live="polite">{status}</p>
                {error ? <p className={styles.error} role="alert" data-testid="tool021-error">{error}</p> : null}
              </section>

              <section className={styles.controlCard}>
                <div className={styles.sectionHeadCompact}><h4>{scope === "common" ? t.commonScope : t.presetScope}</h4></div>
                <div className={styles.positionBlock}>
                  <h5>{t.backgroundPosition}</h5>
                  <div className={styles.sliderRow}><span>{t.x}</span><input data-testid="tool021-background-x" aria-label={`${t.backgroundPosition} ${t.x}`} type="range" min="-1" max="1" step="0.01" value={currentState.cropX} onChange={(event) => updateOverride("cropX", Number(event.target.value))} /></div>
                  <div className={styles.sliderRow}><span>{t.y}</span><input data-testid="tool021-background-y" aria-label={`${t.backgroundPosition} ${t.y}`} type="range" min="-1" max="1" step="0.01" value={currentState.cropY} onChange={(event) => updateOverride("cropY", Number(event.target.value))} /></div>
                  <div className={styles.sliderRow}><span>{t.zoom}</span><input aria-label={t.zoom} type="range" min="1" max="2.8" step="0.02" value={currentState.zoom} onChange={(event) => updateOverride("zoom", Number(event.target.value))} /></div>
                </div>
                <div className={styles.positionBlock}>
                  <h5>{t.titlePosition}</h5>
                  {scope === "preset" ? <label className={styles.sliderRow}><span>{t.titleSize}</span><input aria-label={t.titleSize} type="range" min="0.04" max="0.12" step="0.002" value={currentState.titleSize} onChange={(event) => updateOverride("titleSize", Number(event.target.value))} /></label> : null}
                  <div className={styles.sliderRow}><span>{t.x}</span><input data-testid="tool021-title-x" aria-label={`${t.titlePosition} ${t.x}`} type="range" min="0.03" max="0.9" step="0.01" value={visibleField("titleX")} onChange={(event) => updateScopedLayout("titleX", Number(event.target.value))} /></div>
                  <div className={styles.sliderRow}><span>{t.y}</span><input data-testid="tool021-title-y" aria-label={`${t.titlePosition} ${t.y}`} type="range" min="0.03" max="0.9" step="0.01" value={visibleField("titleY")} onChange={(event) => updateScopedLayout("titleY", Number(event.target.value))} /></div>
                </div>
                <div className={styles.positionBlock}>
                  <h5>{t.subtitlePosition}</h5>
                  {scope === "preset" ? <label className={styles.sliderRow}><span>{t.subtitleSize}</span><input aria-label={t.subtitleSize} type="range" min="0.024" max="0.08" step="0.002" value={currentState.subtitleSize} onChange={(event) => updateOverride("subtitleSize", Number(event.target.value))} /></label> : null}
                  <div className={styles.sliderRow}><span>{t.x}</span><input data-testid="tool021-subtitle-x" aria-label={`${t.subtitlePosition} ${t.x}`} type="range" min="0.03" max="0.9" step="0.01" value={visibleField("subtitleX")} onChange={(event) => updateScopedLayout("subtitleX", Number(event.target.value))} /></div>
                  <div className={styles.sliderRow}><span>{t.y}</span><input data-testid="tool021-subtitle-y" aria-label={`${t.subtitlePosition} ${t.y}`} type="range" min="0.03" max="0.95" step="0.01" value={visibleField("subtitleY")} onChange={(event) => updateScopedLayout("subtitleY", Number(event.target.value))} /></div>
                </div>
                <div className={styles.positionBlock}>
                  <h5>{t.logoPosition}</h5>
                  <div className={styles.sliderRow}><span>{t.x}</span><input data-testid="tool021-logo-x" aria-label={`${t.logoPosition} ${t.x}`} type="range" min="0" max="0.92" step="0.01" value={visibleField("logoX")} onChange={(event) => updateScopedLayout("logoX", Number(event.target.value))} /></div>
                  <div className={styles.sliderRow}><span>{t.y}</span><input data-testid="tool021-logo-y" aria-label={`${t.logoPosition} ${t.y}`} type="range" min="0" max="0.92" step="0.01" value={visibleField("logoY")} onChange={(event) => updateScopedLayout("logoY", Number(event.target.value))} /></div>
                  <div className={styles.sliderRow}><span>{t.logoScale}</span><input aria-label={t.logoScale} type="range" min="0.06" max="0.36" step="0.01" value={visibleField("logoScale")} onChange={(event) => updateScopedLayout("logoScale", Number(event.target.value))} /></div>
                  <div className={styles.sliderRow}><span>{t.logoOpacity}</span><input aria-label={t.logoOpacity} type="range" min="0" max="1" step="0.02" value={visibleField("logoOpacity")} onChange={(event) => updateScopedLayout("logoOpacity", Number(event.target.value))} /></div>
                </div>
                <button className={styles.secondaryButton} data-testid="tool021-reset-preset" onClick={resetPreset}>{t.resetSize}</button>
              </section>

            </aside>

          </section>

          <section className={styles.gridSection}>
            <div className={styles.sectionHead}>
              <div>
                <p>GRID PREVIEW</p>
                <h3>{t.presetPreview}</h3>
              </div>
              <span className={styles.gridInfo}>{t.actualSize}</span>
            </div>
            <div className={styles.previewGrid}>
              {SOCIAL_PRESETS.map((preset) => {
                const active = selectedPresetId === preset.id;
                const checked = selectedPresetIds.includes(preset.id);
                const hasOverride = !!overrides[preset.id] && Object.keys(overrides[preset.id] ?? {}).length > 0;
                const state = resolveState(common, overrides[preset.id]);
                return (
                  <article key={preset.id} className={`${styles.previewCard} ${active ? styles.previewCardActive : ""}`}>
                    <div className={styles.previewCardHead}>
                      <div>
                        <h4>{preset.label[locale]}</h4>
                        <p>{preset.width} × {preset.height} · {preset.ratio}</p>
                      </div>
                      <div className={styles.previewCardFlags}>
                        <span>{preset.sourceType === "official-supported" ? t.sourceOfficial : t.sourceRecommended}</span>
                        <strong>{hasOverride ? t.overrideOn : t.overrideOff}</strong>
                      </div>
                    </div>
                    <button className={styles.cardCanvasButton} onClick={() => setSelectedPresetId(preset.id)} aria-label={preset.label[locale]} aria-pressed={active} data-testid={`tool021-preview-${preset.id}`}>
                      <PresetCanvas preset={preset} background={background} logo={logo} state={state} locale={locale} />
                    </button>
                    <p className={styles.previewNote}>{preset.note[locale]}</p>
                    <div className={styles.previewCardActions}>
                      <label className={styles.checkboxText}><input type="checkbox" checked={checked} onChange={() => togglePreset(preset.id)} /> {checked ? t.selected : t.notSelected}</label>
                      <button className={styles.inlineDownload} disabled={busy} onClick={async () => {
                        setBusy(true);
                        setError("");
                        setStatus(t.statusDownloading);
                        try {
                          const result = await exportPreset(preset);
                          downloadBlob(result.blob, result.fileName);
                          setStatus(t.statusDone);
                        } catch (error) {
                          setError(error instanceof Error && error.message === "dimension-mismatch" ? t.dimensionError : t.loadFail);
                        } finally {
                          setBusy(false);
                        }
                      }}>{t.download}</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
