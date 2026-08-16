"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import type { Locale } from "@/lib/site";
import { createStoredZip } from "@/lib/zip";
import {
  buildTool035DocumentText,
  TOOL035_SERVICE_LIMITS,
  characterCount,
  parseTool035PageRange,
  safeTool035BaseName,
  safeTool035ZipPath,
  textItemsToPlainText,
  tool035CombinedZipFilename,
  tool035ImageName,
  tool035ImagesZipFilename,
  tool035PageTextName,
  tool035TextFilename,
  type Tool035Mode,
  type Tool035PageScope,
} from "@/lib/tool-035-pdf-extractor";
import styles from "./pdf-text-image-extractor-tool.module.css";

type PdfDocument = any;
type PdfPage = any;
type PasswordState = "closed" | "required" | "incorrect";
type TextResult = { pageNumber: number; text: string; charCount: number };
type ImageResult = {
  pageNumber: number;
  imageIndex: number;
  width: number;
  height: number;
  name: string;
  blob: Blob;
  url: string;
  hash: string;
  sourceKind: "xobject" | "inline" | "mask";
  format: "png" | "jpg";
  converted: boolean;
};
type FailedPage = { pageNumber: number; stage: "text" | "images"; message: string };
type ImageViewMode = "major" | "all";
type ExclusionFilterMode = "basic" | "level1" | "level2" | "level3" | "custom";
type ImageExtractionStats = { detected: number; decoded: number; failed: number; technicalExcluded: number; duplicateExcluded: number };
type StructuralJpegEntry = { refKey: string; stream: any; width: number; height: number };
type StructuralPageIndex = { jpegEntries: StructuralJpegEntry[]; jpegObjects: number; nonJpegXObjects: number };

const copy = {
  ko: {
    local: "PDF·추출 텍스트·이미지는 서버로 전송하거나 저장하지 않고 현재 브라우저에서 처리됩니다.",
    drop: "PDF 파일을 놓거나 선택하세요", dropReady: "다른 PDF로 교체하거나 여기에 놓으세요", dropSub: "PDF 1개 · 텍스트 레이어와 실제 임베디드 이미지를 추출합니다.", choose: "PDF 선택", replace: "새 PDF",
    mode: "추출 모드", text: "텍스트", images: "이미지", both: "텍스트 + 이미지", textSub: "페이지별 텍스트 → TXT", imagesSub: "임베디드 raster image → 개별/ZIP", bothSub: "TXT와 images 폴더를 ZIP 하나로",
    pageScope: "페이지 범위", all: "전체", selected: "선택", custom: "사용자 지정", customPlaceholder: "예: 1-3,5,8", apply: "범위 적용", selectAll: "전체 선택", clear: "선택 해제",
    page: "페이지", pages: "페이지", selectedCount: "선택", loaded: (n: number) => `${n}페이지 PDF를 불러왔습니다.`,
    extract: "추출 시작", reextract: "다시 추출", cancel: "취소", reset: "초기화", working: (done: number, total: number, page: number) => `${done}/${total} · ${page}페이지 처리 중`, done: (pages: number) => `${pages}페이지 처리가 완료되었습니다.`, cancelled: "작업을 취소했습니다. 완료된 페이지 결과는 유지됩니다.",
    invalid: "정상 PDF 파일을 선택하세요.", empty: "빈 파일은 처리할 수 없습니다.", tooLarge: "파일 용량은 50MB 이하여야 합니다.", tooManyPages: "PDF는 최대 200페이지까지 처리할 수 있습니다.", imageWarning: "추출 이미지가 500개를 넘었습니다. 브라우저 메모리 사용량이 커질 수 있습니다.", imageHardStop: "추출 이미지 1,000개 안전 한도에 도달해 추가 이미지 추출을 중단했습니다. 현재까지의 결과는 유지됩니다.", limitNote: "서비스 한도: PDF 1개 · 50MB · 200페이지 · 이미지 500개부터 경고 · 1,000개 안전 중단", badRange: "페이지 범위를 확인하세요. 예: 1-3,5,8", selectOne: "처리할 페이지를 하나 이상 선택하세요.", damaged: "PDF를 읽을 수 없습니다. 손상되었거나 지원하지 않는 구조일 수 있습니다.",
    passwordTitle: "PDF 비밀번호 입력", passwordRequired: "이 PDF를 열려면 비밀번호가 필요합니다. 비밀번호는 브라우저 밖으로 전송되지 않습니다.", passwordIncorrect: "비밀번호가 맞지 않습니다. 다시 입력하세요.", passwordPlaceholder: "PDF 비밀번호", passwordApply: "PDF 열기", passwordCancel: "취소",
    options: "이미지 결과 방식", imageView: "이미지 표시", majorImages: "주요 이미지만", allImages: "모든 이미지", majorHelp: "기본값입니다. 동일 bitmap 중복은 항상 자동 제거하고, 마스크·아주 작은 장식 이미지를 추가로 숨겨 사진·캡처·도표처럼 의미 있는 이미지를 우선 표시합니다.", allHelp: "동일 bitmap 중복과 여백·투명·라인·기술용 이미지를 자동 제외한 뒤 실제 콘텐츠 래스터 이미지를 가능한 한 모두 표시합니다.", filterTitle: "제외 필터", filterBasic: "기본", filterBasicHelp: "자동 필터만", filterLevel1: "1단계 · 약하게", filterLevel1Help: "작은 아이콘 정도 · 24px", filterLevel2: "2단계 · 보통", filterLevel2Help: "작은 장식·아이콘 · 48px", filterLevel3: "3단계 · 강하게", filterLevel3Help: "큰 이미지 위주 · 96px", filterCustom: "사용자 지정", minSize: "최소 한 변(px)", optionsHelp: "중복·여백·투명·라인·기술용 이미지는 모든 단계에서 자동 제외됩니다. 단계가 높을수록 작은 이미지가 더 많이 제외됩니다.",
    progress: "처리 진행률", results: "추출 결과", summary: "결과 요약", textPages: "텍스트 페이지", imageCount: "추출 이미지", detectedImages: "감지 객체", majorCount: "주요 이미지", excludedCount: "숨김/제외", decodeFailed: "디코딩 실패", failed: "실패", chars: "글자", noText: "추출 가능한 텍스트 없음", scanHint: "문서 전체에 텍스트 레이어가 없습니다. 스캔 PDF일 수 있으며 이 도구는 OCR을 자동 실행하지 않습니다.", noImages: "추출 가능한 임베디드 이미지가 없습니다.", imageObjectsButFailed: "PDF 내부 이미지 객체는 감지했지만 이미지 디코딩에 실패했습니다. 이 문서는 지원하지 않는 이미지 구조를 사용할 수 있습니다.", layoutHint: "다단·표·복잡한 글꼴은 PDF 내부 저장 순서 때문에 사람이 읽는 순서와 다를 수 있습니다.",
    textTab: "텍스트 결과", imageTab: "이미지 결과", preview: "텍스트 미리보기", copyAll: "전체 복사", copied: "복사했습니다.", downloadTxt: "TXT 다운로드", downloadPageTxt: "페이지 TXT", download: "다운로드", downloadZip: "ZIP 다운로드", combinedZip: "TXT + 이미지 ZIP", pngFallback: "PNG fallback", originalJpg: "원본 JPG", xobject: "XObject", inline: "Inline", mask: "Mask", duplicateHidden: "중복 제외", technicalHidden: "여백·기술 객체 제외", filtered: "필터 제외", visible: "현재 표시", zipFailed: "ZIP 생성에 실패했습니다. 이미 생성된 개별 결과는 유지됩니다.", pageFailed: "일부 페이지 처리에 실패했지만 성공한 결과는 유지했습니다.",
  },
  en: {
    local: "The PDF, extracted text, and images stay in the current browser and are not uploaded or stored on a server.",
    drop: "Drop or choose a PDF", dropReady: "Replace the PDF or drop another one here", dropSub: "One PDF · extract the text layer and actual embedded raster images.", choose: "Choose PDF", replace: "New PDF",
    mode: "Extraction mode", text: "Text", images: "Images", both: "Text + Images", textSub: "Page text → TXT", imagesSub: "Embedded raster images → files/ZIP", bothSub: "TXT + images folder in one ZIP",
    pageScope: "Page range", all: "All", selected: "Selected", custom: "Custom", customPlaceholder: "e.g. 1-3,5,8", apply: "Apply range", selectAll: "Select all", clear: "Clear",
    page: "Page", pages: "pages", selectedCount: "Selected", loaded: (n: number) => `Loaded a ${n}-page PDF.`,
    extract: "Start extraction", reextract: "Extract again", cancel: "Cancel", reset: "Reset", working: (done: number, total: number, page: number) => `${done}/${total} · processing page ${page}`, done: (pages: number) => `Finished processing ${pages} pages.`, cancelled: "Extraction was cancelled. Results from completed pages were kept.",
    invalid: "Choose a valid PDF file.", empty: "An empty file cannot be processed.", tooLarge: "The PDF must be 50MB or smaller.", tooManyPages: "PDFs are limited to 200 pages.", imageWarning: "More than 500 images have been extracted. Browser memory use may increase.", imageHardStop: "Image extraction stopped at the 1,000-image safety limit. Results extracted so far were kept.", limitNote: "Service limits: 1 PDF · 50MB · 200 pages · warning after 500 images · safety stop at 1,000", badRange: "Check the page range. Example: 1-3,5,8", selectOne: "Select at least one page to process.", damaged: "The PDF could not be read. It may be damaged or use an unsupported structure.",
    passwordTitle: "Enter PDF password", passwordRequired: "This PDF requires a password. The password never leaves your browser.", passwordIncorrect: "That password did not work. Try again.", passwordPlaceholder: "PDF password", passwordApply: "Open PDF", passwordCancel: "Cancel",
    options: "Image result mode", imageView: "Image view", majorImages: "Major images", allImages: "All images", majorHelp: "Default. Duplicate bitmaps are always removed, while masks and tiny decorative resources are additionally hidden so photos, screenshots, and diagrams are easier to find.", allHelp: "Automatically removes duplicate, blank, transparent, line, and technical raster objects, then shows as many real content images as possible.", filterTitle: "Exclusion filter", filterBasic: "Default", filterBasicHelp: "Automatic filters only", filterLevel1: "Level 1 · Light", filterLevel1Help: "Tiny icons · 24px", filterLevel2: "Level 2 · Medium", filterLevel2Help: "Small decorations/icons · 48px", filterLevel3: "Level 3 · Strong", filterLevel3Help: "Keep larger images · 96px", filterCustom: "Custom", minSize: "Minimum side (px)", optionsHelp: "Duplicate, blank, transparent, line, and technical images are removed automatically at every level. Higher levels exclude more small images.",
    progress: "Processing progress", results: "Extraction results", summary: "Result summary", textPages: "Text pages", imageCount: "Extracted images", detectedImages: "Detected objects", majorCount: "Major images", excludedCount: "Hidden/excluded", decodeFailed: "Decode failed", failed: "Failed", chars: "chars", noText: "No extractable text found", scanHint: "No text layer was found in the document. It may be a scanned PDF; this tool does not run OCR automatically.", noImages: "No extractable embedded images were found.", imageObjectsButFailed: "Image objects were detected inside the PDF, but none could be decoded. This document may use an unsupported image structure.", layoutHint: "Columns, tables, and complex font encodings can produce a reading order different from the visual layout.",
    textTab: "Text results", imageTab: "Image results", preview: "Text preview", copyAll: "Copy all", copied: "Copied.", downloadTxt: "Download TXT", downloadPageTxt: "Page TXT", download: "Download", downloadZip: "Download ZIP", combinedZip: "TXT + Images ZIP", pngFallback: "PNG fallback", originalJpg: "Original JPG", xobject: "XObject", inline: "Inline", mask: "Mask", duplicateHidden: "Duplicates removed", technicalHidden: "Blank/technical removed", filtered: "Filtered", visible: "Visible", zipFailed: "ZIP creation failed. Individual results already created are still available.", pageFailed: "Some pages failed, but successful page results were kept.",
  },
  ja: {
    local: "PDF・抽出テキスト・画像はサーバーへ送信・保存せず、現在のブラウザ内で処理します。",
    drop: "PDFファイルをドロップまたは選択", dropReady: "別のPDFに交換するか、ここへドロップ", dropSub: "PDF 1件 · テキストレイヤーと実際の埋め込みラスター画像を抽出します。", choose: "PDFを選択", replace: "新しいPDF",
    mode: "抽出モード", text: "テキスト", images: "画像", both: "テキスト + 画像", textSub: "ページ別テキスト → TXT", imagesSub: "埋め込み画像 → 個別/ZIP", bothSub: "TXTとimagesフォルダーを1つのZIPに",
    pageScope: "ページ範囲", all: "すべて", selected: "選択", custom: "指定", customPlaceholder: "例: 1-3,5,8", apply: "範囲を適用", selectAll: "すべて選択", clear: "選択解除",
    page: "ページ", pages: "ページ", selectedCount: "選択", loaded: (n: number) => `${n}ページのPDFを読み込みました。`,
    extract: "抽出開始", reextract: "再抽出", cancel: "キャンセル", reset: "リセット", working: (done: number, total: number, page: number) => `${done}/${total} · ${page}ページを処理中`, done: (pages: number) => `${pages}ページの処理が完了しました。`, cancelled: "処理をキャンセルしました。完了ページの結果は保持されます。",
    invalid: "正常なPDFファイルを選択してください。", empty: "空のファイルは処理できません。", tooLarge: "PDFは50MB以下にしてください。", tooManyPages: "PDFは最大200ページまで処理できます。", imageWarning: "抽出画像が500件を超えました。ブラウザのメモリ使用量が増える可能性があります。", imageHardStop: "抽出画像1,000件の安全上限に達したため、追加の画像抽出を停止しました。抽出済みの結果は保持されます。", limitNote: "サービス上限: PDF 1件 · 50MB · 200ページ · 画像500件から警告 · 1,000件で安全停止", badRange: "ページ範囲を確認してください。例: 1-3,5,8", selectOne: "処理するページを1つ以上選択してください。", damaged: "PDFを読み込めません。破損または未対応の構造の可能性があります。",
    passwordTitle: "PDFパスワードを入力", passwordRequired: "このPDFを開くにはパスワードが必要です。パスワードはブラウザ外へ送信されません。", passwordIncorrect: "パスワードが正しくありません。もう一度入力してください。", passwordPlaceholder: "PDFパスワード", passwordApply: "PDFを開く", passwordCancel: "キャンセル",
    options: "画像結果モード", imageView: "画像表示", majorImages: "主要画像のみ", allImages: "すべての画像", majorHelp: "初期値です。同一bitmapの重複は常に自動除外し、さらにマスクや極小の装飾画像を隠して、写真・スクリーンショット・図表を見つけやすくします。", allHelp: "同一bitmapの重複と余白・透明・線・技術用画像を自動除外し、実際のコンテンツ画像を可能な限り表示します。", filterTitle: "除外フィルター", filterBasic: "基本", filterBasicHelp: "自動フィルターのみ", filterLevel1: "レベル1 · 弱", filterLevel1Help: "小さなアイコン程度 · 24px", filterLevel2: "レベル2 · 標準", filterLevel2Help: "小さな装飾・アイコン · 48px", filterLevel3: "レベル3 · 強", filterLevel3Help: "大きめの画像を中心に · 96px", filterCustom: "カスタム", minSize: "最小辺(px)", optionsHelp: "重複・余白・透明・線・技術用画像はすべてのレベルで自動除外されます。レベルが高いほど小さい画像を多く除外します。",
    progress: "処理進行率", results: "抽出結果", summary: "結果概要", textPages: "テキストページ", imageCount: "抽出画像", detectedImages: "検出オブジェクト", majorCount: "主要画像", excludedCount: "非表示/除外", decodeFailed: "デコード失敗", failed: "失敗", chars: "文字", noText: "抽出可能なテキストがありません", scanHint: "文書全体にテキストレイヤーがありません。スキャンPDFの可能性があり、このツールはOCRを自動実行しません。", noImages: "抽出可能な埋め込み画像がありません。", imageObjectsButFailed: "PDF内部の画像オブジェクトは検出しましたが、画像をデコードできませんでした。未対応の画像構造を使用している可能性があります。", layoutHint: "段組み・表・複雑なフォントでは、PDF内部の保存順によって見た目と読む順番が異なる場合があります。",
    textTab: "テキスト結果", imageTab: "画像結果", preview: "テキストプレビュー", copyAll: "すべてコピー", copied: "コピーしました。", downloadTxt: "TXTをダウンロード", downloadPageTxt: "ページTXT", download: "ダウンロード", downloadZip: "ZIPをダウンロード", combinedZip: "TXT + 画像 ZIP", pngFallback: "PNG fallback", originalJpg: "元のJPG", xobject: "XObject", inline: "Inline", mask: "Mask", duplicateHidden: "重複除外", technicalHidden: "余白・技術用除外", filtered: "フィルター除外", visible: "表示中", zipFailed: "ZIP生成に失敗しました。作成済みの個別結果は保持されます。", pageFailed: "一部ページに失敗しましたが、成功した結果は保持されます。",
  },
} as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG_ENCODE_FAILED")), "image/png"));
}

function toByteView(data: unknown) {
  if (data instanceof Uint8ClampedArray) return data;
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  return null;
}

function rgbaFromDecoded(data: Uint8Array | Uint8ClampedArray, width: number, height: number) {
  const pixels = width * height;
  const rgba = new Uint8ClampedArray(pixels * 4);
  if (data.length >= pixels * 4) {
    rgba.set(data.subarray(0, pixels * 4));
    return rgba;
  }
  if (data.length >= pixels * 3) {
    for (let i = 0, j = 0; i < pixels; i += 1, j += 3) {
      const p = i * 4; rgba[p] = data[j]; rgba[p + 1] = data[j + 1]; rgba[p + 2] = data[j + 2]; rgba[p + 3] = 255;
    }
    return rgba;
  }
  if (data.length >= pixels) {
    for (let i = 0; i < pixels; i += 1) {
      const p = i * 4; rgba[p] = data[i]; rgba[p + 1] = data[i]; rgba[p + 2] = data[i]; rgba[p + 3] = 255;
    }
    return rgba;
  }
  const expected1bpp = Math.ceil(pixels / 8);
  if (data.length >= expected1bpp) {
    for (let i = 0; i < pixels; i += 1) {
      const bit = (data[i >> 3] >> (7 - (i & 7))) & 1;
      const value = bit ? 255 : 0; const p = i * 4;
      rgba[p] = value; rgba[p + 1] = value; rgba[p + 2] = value; rgba[p + 3] = 255;
    }
    return rgba;
  }
  throw new Error("UNSUPPORTED_IMAGE_DATA");
}

function canvasLooksBlankTechnical(source: HTMLCanvasElement, width: number, height: number) {
  if (hasTechnicalGeometry(width, height)) return true;
  if (width * height < 4096) return false;
  const sample = 32;
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = sample; sampleCanvas.height = sample;
  try {
    const ctx = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(source, 0, 0, sample, sample);
    const data = ctx.getImageData(0, 0, sample, sample).data;
    let visible = 0; let transparent = 0; let lumSum = 0; let lumSq = 0;
    let nearWhite = 0; let contentInk = 0; let chromatic = 0;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha < 16) { transparent += 1; continue; }
      visible += 1;
      const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
      const lum = (r * 299 + g * 587 + b * 114) / 1000;
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      lumSum += lum; lumSq += lum * lum;
      if (lum >= 244) nearWhite += 1;
      if (lum <= 232 || spread >= 22) contentInk += 1;
      if (spread >= 28) chromatic += 1;
    }
    const pixels = sample * sample;
    if (visible <= pixels * 0.08 || transparent / pixels >= 0.94) return true;
    const mean = lumSum / Math.max(1, visible);
    const variance = Math.max(0, lumSq / Math.max(1, visible) - mean * mean);
    const stdDev = Math.sqrt(variance);
    const whiteRatio = nearWhite / Math.max(1, visible);
    const inkRatio = contentInk / Math.max(1, visible);
    const chromaRatio = chromatic / Math.max(1, visible);
    if ((mean >= 244 && stdDev <= 12) || (whiteRatio >= 0.965 && inkRatio <= 0.025)) return true;
    if (whiteRatio >= 0.90 && inkRatio <= 0.045 && chromaRatio <= 0.02 && mean >= 238) return true;
    return false;
  } catch {
    return false;
  } finally {
    sampleCanvas.width = 0; sampleCanvas.height = 0;
  }
}

async function decodedImageToPng(raw: any) {
  const value = raw?.bitmap ?? raw;
  const width = Number(raw?.width ?? value?.width ?? 0);
  const height = Number(raw?.height ?? value?.height ?? 0);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) throw new Error("INVALID_IMAGE_SIZE");
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width); canvas.height = Math.ceil(height);
  const context = canvas.getContext("2d", { willReadFrequently: false });
  if (!context) throw new Error("NO_CANVAS_CONTEXT");
  try {
    const bytes = toByteView(raw?.data ?? (typeof ImageData !== "undefined" && value instanceof ImageData ? value.data : null));
    if (bytes) {
      const rgba = rgbaFromDecoded(bytes, canvas.width, canvas.height);
      context.putImageData(new ImageData(rgba, canvas.width, canvas.height), 0, 0);
    } else if (typeof ImageData !== "undefined" && value instanceof ImageData) {
      context.putImageData(value, 0, 0);
    } else {
      // PDF.js can return ImageBitmap/OffscreenCanvas-like objects from another
      // realm. instanceof checks are unreliable across realms, so let Canvas2D
      // validate the CanvasImageSource directly.
      try {
        context.drawImage(value as CanvasImageSource, 0, 0, canvas.width, canvas.height);
      } catch {
        throw new Error("UNSUPPORTED_IMAGE_OBJECT");
      }
    }
    const technicalBlank = canvasLooksBlankTechnical(canvas, canvas.width, canvas.height);
    if (technicalBlank) return { blob: null as Blob | null, width: canvas.width, height: canvas.height, technicalBlank: true };
    const blob = await canvasToPngBlob(canvas);
    return { blob, width: canvas.width, height: canvas.height, technicalBlank: false };
  } finally {
    canvas.width = 0; canvas.height = 0;
  }
}

async function fastImageFingerprint(blob: Blob, width: number, height: number) {
  // Duplicate filtering does not need a cryptographic digest. Reading and
  // hashing every full PNG was a major cost for image-heavy PDFs, so sample
  // only the head/tail plus stable metadata.
  const sampleSize = 4096;
  const head = new Uint8Array(await blob.slice(0, Math.min(sampleSize, blob.size)).arrayBuffer());
  const tailStart = Math.max(0, blob.size - sampleSize);
  const tail = new Uint8Array(await blob.slice(tailStart, blob.size).arrayBuffer());
  let hash = 2166136261;
  const feed = (value: number) => { hash = Math.imul(hash ^ value, 16777619); };
  for (const byte of head) feed(byte);
  for (const byte of tail) feed(byte);
  for (const value of [width, height, blob.size]) {
    feed(value & 255); feed((value >>> 8) & 255); feed((value >>> 16) & 255); feed((value >>> 24) & 255);
  }
  return `img-${(hash >>> 0).toString(16).padStart(8, "0")}-${width}x${height}-${blob.size}`;
}

function getStoreObject(store: any, id: string, timeoutMs = 1500) {
  return new Promise<any>((resolve, reject) => {
    let settled = false;
    const timer = window.setTimeout(() => { if (!settled) { settled = true; reject(new Error("IMAGE_OBJECT_TIMEOUT")); } }, timeoutMs);
    const done = (value: any) => { if (settled) return; settled = true; window.clearTimeout(timer); resolve(value); };
    try {
      // PDF.js PDFObjects.get(id, callback) deliberately returns null when a
      // callback is supplied. The actual object is delivered through the
      // callback once it is resolved, including when it is already ready.
      // Never treat that null return value as the decoded image object.
      if (!store?.get) throw new Error("IMAGE_OBJECT_STORE_UNAVAILABLE");
      store.get(id, done);
    } catch (error) {
      window.clearTimeout(timer); reject(error);
    }
  });
}

async function resolvePdfImageObject(page: PdfPage, id: string, timeoutMs = 1500) {
  try { return await getStoreObject(page.objs, id, timeoutMs); }
  catch { return await getStoreObject(page.commonObjs, id, timeoutMs); }
}

function operatorKind(pdfjs: any, fn: number): ImageResult["sourceKind"] | null {
  const ops = pdfjs.OPS ?? {};
  if (fn === ops.paintImageXObject || fn === ops.paintImageXObjectRepeat) return "xobject";
  if (fn === ops.paintInlineImageXObject || fn === ops.paintInlineImageXObjectGroup) return "inline";
  if (fn === ops.paintImageMaskXObject || fn === ops.paintImageMaskXObjectRepeat || fn === ops.paintSolidColorImageMask) return "mask";
  return null;
}

async function primePageImageResources(page: PdfPage) {
  if (typeof document === "undefined") return;
  const viewport = page.getViewport({ scale: 0.08 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(viewport.width));
  canvas.height = Math.max(1, Math.ceil(viewport.height));
  const context = canvas.getContext("2d");
  if (!context) return;
  let renderTask: any = null;
  let timeoutId: number | null = null;
  try {
    renderTask = page.render({ canvasContext: context, viewport, intent: "display" });
    await Promise.race([
      renderTask.promise,
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error("PRIME_RENDER_TIMEOUT")), 1200);
      }),
    ]);
  } catch {
    try { renderTask?.cancel?.(); } catch {}
    // Priming is best-effort and must never hold a fixture/page indefinitely.
    // The normal operator/object extraction below decides whether an image can be exported.
  } finally {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
    canvas.width = 0;
    canvas.height = 0;
  }
}

async function extractPageImages(page: PdfPage, pdfjs: any, pageNumber: number, totalPages: number, shouldAbort: () => boolean, maxImages: number, skipXObjects = false) {
  const opList = await page.getOperatorList();
  // Do not render the whole page just because PDFObjects.has() is not ready yet.
  // Most image objects arrive shortly after getOperatorList(); use a short
  // bounded resolve first and prime only on an actual miss.
  let primed = false;
  const output: ImageResult[] = [];
  const stats: ImageExtractionStats = { detected: 0, decoded: 0, failed: 0, technicalExcluded: 0, duplicateExcluded: 0 };
  const cache = new Map<string, { blob: Blob; width: number; height: number; hash: string }>();
  for (let i = 0; i < opList.fnArray.length; i += 1) {
    if (shouldAbort() || output.length >= maxImages) break;
    const kind = operatorKind(pdfjs, opList.fnArray[i]);
    if (!kind || (skipXObjects && kind === "xobject")) continue;
    stats.detected += 1;
    const args = opList.argsArray[i] ?? [];
    let raw: any = null;
    let cacheKey = "";
    try {
      if (kind === "xobject" && typeof args[0] === "string") {
        cacheKey = `${kind}:${args[0]}`;
        const existing = cache.get(cacheKey);
        if (existing) {
          const imageIndex = output.length + 1;
          output.push({ pageNumber, imageIndex, width: existing.width, height: existing.height, blob: existing.blob, url: URL.createObjectURL(existing.blob), hash: existing.hash, sourceKind: kind, format: "png", converted: true, name: tool035ImageName(pageNumber, imageIndex, totalPages) });
          stats.decoded += 1;
          continue;
        }
        try {
          raw = await resolvePdfImageObject(page, args[0], 250);
        } catch {
          // If readiness could not be inspected (or changed after inspection),
          // retry once after a single page-level priming render.
          if (!primed) {
            await primePageImageResources(page);
            primed = true;
          }
          raw = await resolvePdfImageObject(page, args[0], 1500);
        }
      } else {
        raw = args[0];
        if (kind === "inline" && Array.isArray(raw)) raw = raw[0];
      }
      if (!raw) throw new Error("EMPTY_IMAGE_OBJECT");
      const decoded = await decodedImageToPng(raw);
      if (decoded.technicalBlank || !decoded.blob) { stats.technicalExcluded += 1; continue; }
      const hash = await fastImageFingerprint(decoded.blob, decoded.width, decoded.height);
      if (cacheKey) cache.set(cacheKey, { blob: decoded.blob, width: decoded.width, height: decoded.height, hash });
      const imageIndex = output.length + 1;
      output.push({ pageNumber, imageIndex, width: decoded.width, height: decoded.height, blob: decoded.blob, url: URL.createObjectURL(decoded.blob), hash, sourceKind: kind, format: "png", converted: true, name: tool035ImageName(pageNumber, imageIndex, totalPages) });
      stats.decoded += 1;
    } catch {
      stats.failed += 1;
    }
    if (i % 16 === 0) await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
  return { images: output, stats };
}


async function buildStructuralImageIndex(pdfDoc: any): Promise<Map<number, StructuralPageIndex>> {
  const index = new Map<number, StructuralPageIndex>();
  if (!pdfDoc) return index;
  const { PDFName, PDFDict, PDFRawStream } = await import("pdf-lib");
  const context = pdfDoc.context;
  const pages = pdfDoc.getPages();
  const imageName = PDFName.of("Image"); const formName = PDFName.of("Form");
  const resourcesName = PDFName.of("Resources"); const xObjectName = PDFName.of("XObject");
  const subtypeName = PDFName.of("Subtype"); const filterName = PDFName.of("Filter");
  const widthName = PDFName.of("Width"); const heightName = PDFName.of("Height");
  const asDict = (value: any) => { try { return context.lookup(value, PDFDict); } catch { return value instanceof PDFDict ? value : null; } };
  const resolve = (value: any) => { try { return context.lookup(value); } catch { return value; } };
  const nameText = (value: any) => { try { return String(value); } catch { return ""; } };
  const numberValue = (value: any) => { const resolved = resolve(value); try { if (typeof resolved?.asNumber === "function") return Number(resolved.asNumber()); const parsed = Number(String(resolved)); return Number.isFinite(parsed) ? parsed : 0; } catch { return 0; } };

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    const jpegEntries: StructuralJpegEntry[] = [];
    const visited = new Set<string>();
    let jpegObjects = 0; let nonJpegXObjects = 0;
    const visitResources = (resourcesValue: any) => {
      const resources = asDict(resourcesValue); if (!resources) return;
      let xObjects: any = null; try { xObjects = asDict(resources.get(xObjectName)); } catch {}
      if (!xObjects?.entries) return;
      for (const [, rawRef] of xObjects.entries()) {
        const refKey = nameText(rawRef);
        if (refKey && visited.has(refKey)) continue;
        if (refKey) visited.add(refKey);
        const object = resolve(rawRef);
        if (!(object instanceof PDFRawStream)) continue;
        const subtype = object.dict.get(subtypeName);
        if (nameText(subtype) === nameText(imageName)) {
          const filterText = nameText(object.dict.get(filterName));
          if (!filterText.includes("DCTDecode")) { nonJpegXObjects += 1; continue; }
          jpegObjects += 1;
          const width = numberValue(object.dict.get(widthName)); const height = numberValue(object.dict.get(heightName));
          if (width > 0 && height > 0) jpegEntries.push({ refKey: refKey || `page-${pageIndex + 1}-jpeg-${jpegObjects}`, stream: object, width, height });
        } else if (nameText(subtype) === nameText(formName)) {
          visitResources(object.dict.get(resourcesName));
        }
      }
    };
    visitResources(pages[pageIndex].node.get(resourcesName));
    index.set(pageIndex + 1, { jpegEntries, jpegObjects, nonJpegXObjects });
    if (pageIndex % 12 === 11) await new Promise((resolveYield) => window.setTimeout(resolveYield, 0));
  }
  return index;
}

async function extractStructuralJpegImages(pageIndex: StructuralPageIndex | undefined, pageNumber: number, totalPages: number, maxImages: number, documentCache: Map<string, { blob: Blob; width: number; height: number; hash: string }>, emittedRefs: Set<string>) {
  if (!pageIndex || maxImages <= 0) return { images: [] as ImageResult[], jpegObjects: pageIndex?.jpegObjects ?? 0, nonJpegXObjects: pageIndex?.nonJpegXObjects ?? 0, duplicateExcluded: 0 };
  const output: ImageResult[] = [];
  let duplicateExcluded = 0;
  for (const entry of pageIndex.jpegEntries) {
    if (output.length >= maxImages) break;
    if (emittedRefs.has(entry.refKey)) { duplicateExcluded += 1; continue; }
    try {
      let cached = documentCache.get(entry.refKey);
      if (!cached) {
        const encoded = entry.stream.getContents();
        const jpegBlob = new Blob([new Uint8Array(encoded)], { type: "image/jpeg" });
        const hash = await fastImageFingerprint(jpegBlob, entry.width, entry.height);
        cached = { blob: jpegBlob, width: entry.width, height: entry.height, hash };
        documentCache.set(entry.refKey, cached);
      }
      emittedRefs.add(entry.refKey);
      const imageIndex = output.length + 1;
      output.push({ pageNumber, imageIndex, width: cached.width, height: cached.height, blob: cached.blob, url: URL.createObjectURL(cached.blob), hash: cached.hash, sourceKind: "xobject", format: "jpg", converted: false, name: tool035ImageName(pageNumber, imageIndex, totalPages, "jpg") });
    } catch {
      // PDF.js fallback may still recover this resource.
    }
  }
  return { images: output, jpegObjects: pageIndex.jpegObjects, nonJpegXObjects: pageIndex.nonJpegXObjects, duplicateExcluded };
}

function hasTechnicalGeometry(width: number, height: number) {
  const minSide = Math.min(width, height);
  const maxSide = Math.max(width, height);
  if (minSide <= 2) return true;
  if (minSide <= 8 && maxSide / Math.max(1, minSide) >= 40) return true;
  return false;
}

async function isLikelyBlankTechnicalImage(image: ImageResult) {
  if (image.sourceKind === "mask") return true;
  if (hasTechnicalGeometry(image.width, image.height)) return true;
  const area = image.width * image.height;
  if (area < 4096) return false;
  const byteDensity = image.blob.size / Math.max(1, area);
  // PNG fallback images have already paid the expensive PDF.js decode/PNG encode
  // cost. Sample every meaningful PNG fallback so large blank/whitespace bitmaps
  // cannot escape simply because their compressed byte density is above a gate.
  // Original JPEG fast-path objects keep a conservative density gate so direct
  // JPEG extraction remains fast.
  const shouldPixelInspect = image.converted || byteDensity <= 0.025;
  if (!shouldPixelInspect) return false;
  if (typeof document === "undefined" || typeof createImageBitmap !== "function") return false;
  let bitmap: ImageBitmap | null = null;
  const canvas = document.createElement("canvas");
  const sample = 32;
  canvas.width = sample; canvas.height = sample;
  try {
    bitmap = await createImageBitmap(image.blob, { resizeWidth: sample, resizeHeight: sample, resizeQuality: "low" } as any);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(bitmap, 0, 0, sample, sample);
    const data = ctx.getImageData(0, 0, sample, sample).data;
    let visible = 0;
    let transparent = 0;
    let lumSum = 0;
    let lumSq = 0;
    let nearWhite = 0;
    let contentInk = 0;
    let chromatic = 0;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha < 16) { transparent += 1; continue; }
      visible += 1;
      const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
      const lum = (r * 299 + g * 587 + b * 114) / 1000;
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      lumSum += lum; lumSq += lum * lum;
      if (lum >= 244) nearWhite += 1;
      if (lum <= 232 || spread >= 22) contentInk += 1;
      if (spread >= 28) chromatic += 1;
    }
    const pixels = sample * sample;
    const transparentRatio = transparent / pixels;
    if (visible <= pixels * 0.08 || transparentRatio >= 0.94) return true;
    const mean = lumSum / Math.max(1, visible);
    const variance = Math.max(0, lumSq / Math.max(1, visible) - mean * mean);
    const stdDev = Math.sqrt(variance);
    const whiteRatio = nearWhite / Math.max(1, visible);
    const inkRatio = contentInk / Math.max(1, visible);
    const chromaRatio = chromatic / Math.max(1, visible);

    // Pure/near-pure white or transparent resources.
    if ((mean >= 244 && stdDev <= 12) || (whiteRatio >= 0.965 && inkRatio <= 0.025)) return true;
    // Large blank boxes with faint grey borders/shadows survive stricter white
    // tests; they still have almost no dark/coloured information.
    if (whiteRatio >= 0.90 && inkRatio <= 0.045 && chromaRatio <= 0.02 && mean >= 238) return true;
    return false;
  } catch {
    return false;
  } finally {
    try { bitmap?.close(); } catch {}
    canvas.width = 0; canvas.height = 0;
  }
}

function isMajorImage(image: ImageResult) {
  if (image.sourceKind === "mask") return false;
  const minSide = Math.min(image.width, image.height);
  const area = image.width * image.height;
  return (minSide >= 48 && area >= 4096) || (minSide >= 24 && area >= 20000);
}

export function PdfTextImageExtractorTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<PdfDocument | null>(null);
  const loadingTaskRef = useRef<any>(null);
  const passwordUpdaterRef = useRef<((value: string) => void) | null>(null);
  const jobIdRef = useRef(0);
  const abortRef = useRef(false);
  const imagesRef = useRef<ImageResult[]>([]);
  const sourceBytesRef = useRef<Uint8Array | null>(null);
  const canonicalPageCountRef = useRef(0);
  const structuralDocRef = useRef<any>(null);
  const structuralIndexRef = useRef<Map<number, StructuralPageIndex> | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<Tool035Mode>("both");
  const [scope, setScope] = useState<Tool035PageScope>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [customRange, setCustomRange] = useState("1-3,5");
  const [dragging, setDragging] = useState(false);
  const [workspaceDragging, setWorkspaceDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [limitNotice, setLimitNotice] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0, page: 0 });
  const [textResults, setTextResults] = useState<TextResult[]>([]);
  const [imageResults, setImageResults] = useState<ImageResult[]>([]);
  const [failedPages, setFailedPages] = useState<FailedPage[]>([]);
  const [activeTab, setActiveTab] = useState<"text" | "images">("text");
  const [imageViewMode, setImageViewMode] = useState<ImageViewMode>("major");
  const [imageStats, setImageStats] = useState<ImageExtractionStats>({ detected: 0, decoded: 0, failed: 0, technicalExcluded: 0, duplicateExcluded: 0 });
  const [exclusionFilter, setExclusionFilter] = useState<ExclusionFilterMode>("basic");
  const [minSize, setMinSize] = useState(24);
  const [previewLimit, setPreviewLimit] = useState(60);
  const [passwordState, setPasswordState] = useState<PasswordState>("closed");
  const [password, setPassword] = useState("");

  const revokeImages = useCallback((items: ImageResult[]) => { for (const item of items) URL.revokeObjectURL(item.url); }, []);
  const clearResults = useCallback(() => {
    revokeImages(imagesRef.current); imagesRef.current = [];
    setTextResults([]); setImageResults([]); setFailedPages([]); setImageStats({ detected: 0, decoded: 0, failed: 0, technicalExcluded: 0, duplicateExcluded: 0 }); setProgress({ done: 0, total: 0, page: 0 }); setLimitNotice("");
  }, [revokeImages]);

  const disposeDocument = useCallback(async () => {
    jobIdRef.current += 1; abortRef.current = true;
    try { loadingTaskRef.current?.destroy?.(); } catch {}
    loadingTaskRef.current = null; passwordUpdaterRef.current = null;
    const doc = docRef.current; docRef.current = null;
    sourceBytesRef.current = null; canonicalPageCountRef.current = 0; structuralDocRef.current = null; structuralIndexRef.current = null;
    try { await doc?.destroy?.(); } catch {}
  }, []);

  useEffect(() => () => { void disposeDocument(); revokeImages(imagesRef.current); }, [disposeDocument, revokeImages]);

  const dedupedImages = useMemo(() => {
    const hashes = new Set<string>();
    return imageResults.filter((image) => {
      if (hashes.has(image.hash)) return false;
      hashes.add(image.hash);
      return true;
    });
  }, [imageResults]);

  const duplicateExcludedCount = Math.max(0, imageStats.duplicateExcluded + imageResults.length - dedupedImages.length);

  const majorImages = useMemo(() => dedupedImages.filter((image) => isMajorImage(image)), [dedupedImages]);

  const effectiveMinSize = exclusionFilter === "level1" ? 24 : exclusionFilter === "level2" ? 48 : exclusionFilter === "level3" ? 96 : exclusionFilter === "custom" ? minSize : 0;

  const visibleImages = useMemo(() => {
    const source = imageViewMode === "major" ? majorImages : dedupedImages;
    return source.filter((image) => !(effectiveMinSize > 0 && (image.width < effectiveMinSize || image.height < effectiveMinSize)));
  }, [dedupedImages, majorImages, imageViewMode, effectiveMinSize]);

  const previewImages = useMemo(() => visibleImages.slice(0, previewLimit), [visibleImages, previewLimit]);

  useEffect(() => { setPreviewLimit(60); }, [imageViewMode, exclusionFilter, minSize]);

  const pageSelection = useMemo(() => {
    if (!pageCount) return [];
    if (scope === "all") return Array.from({ length: pageCount }, (_, index) => index + 1);
    if (scope === "selected") return [...selected].sort((a, b) => a - b);
    try { return parseTool035PageRange(customRange, pageCount); } catch { return []; }
  }, [scope, selected, customRange, pageCount]);

  const totalText = useMemo(() => buildTool035DocumentText(textResults, pageCount || Math.max(1, textResults.length)), [textResults, pageCount]);
  const textPageCount = textResults.filter((x) => x.text.trim()).length;
  const allTextEmpty = textResults.length > 0 && textPageCount === 0;
  const filteredExcludedCount = Math.max(0, (imageViewMode === "major" ? majorImages.length : dedupedImages.length) - visibleImages.length);

  const resetAll = useCallback(async () => {
    await disposeDocument(); clearResults(); setFile(null); setPageCount(0); setMode("both"); setImageViewMode("major"); setExclusionFilter("basic"); setMinSize(24); setPreviewLimit(60); setScope("all"); setSelected(new Set()); setCustomRange("1-3,5"); setBusy(false); setError(""); setStatus(""); setLimitNotice(""); setPasswordState("closed"); setPassword(""); abortRef.current = false;
    if (inputRef.current) inputRef.current.value = "";
  }, [clearResults, disposeDocument]);

  const loadPdf = useCallback(async (nextFile: File) => {
    await disposeDocument(); clearResults(); setError(""); setStatus(""); setLimitNotice(""); setPasswordState("closed"); setPassword(""); abortRef.current = false;
    if (nextFile.size <= 0) { setError(t.empty); return; }
    if (nextFile.size > TOOL035_SERVICE_LIMITS.fileBytes) { setError(t.tooLarge); return; }
    if (nextFile.type && nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) { setError(t.invalid); return; }
    setBusy(true);
    try {
      const bytes = new Uint8Array(await nextFile.arrayBuffer());
      if (new TextDecoder("latin1").decode(bytes.slice(0, 5)) !== "%PDF-") throw new Error("INVALID_PDF");
      const { PDFDocument } = await import("pdf-lib");
      const structuralPdf = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
      const canonicalPageCount = structuralPdf.getPageCount();
      if (!canonicalPageCount) throw new Error("ZERO_PAGES");
      if (canonicalPageCount > TOOL035_SERVICE_LIMITS.pages) throw new Error("TOO_MANY_PAGES");
      sourceBytesRef.current = bytes;
      canonicalPageCountRef.current = canonicalPageCount;
      structuralDocRef.current = structuralPdf;

      const pdfjs: any = await import("pdfjs-dist/webpack.mjs");
      const loadingTask = pdfjs.getDocument({
        data: bytes,
        // Extraction needs stable decoded pixel payloads. PDF.js may otherwise
        // hand image decoding to OffscreenCanvas/ImageDecoder and expose bitmap
        // objects with null `data`, which is excellent for rendering but fragile
        // for embedded-image export. Keep the extraction path deterministic.
        isOffscreenCanvasSupported: false,
        isImageDecoderSupported: false,
        maxImageSize: -1,
      });
      loadingTaskRef.current = loadingTask;
      loadingTask.onPassword = (updatePassword: (value: string) => void, reason: number) => {
        passwordUpdaterRef.current = updatePassword; setPassword("");
        setPasswordState(reason === pdfjs.PasswordResponses?.INCORRECT_PASSWORD ? "incorrect" : "required");
      };
      const doc = await loadingTask.promise;
      loadingTaskRef.current = null;
      if (!doc.numPages) throw new Error("ZERO_PAGES");
      if (doc.numPages > TOOL035_SERVICE_LIMITS.pages) { try { await doc.destroy?.(); } catch {} throw new Error("TOO_MANY_PAGES"); }
      const effectivePageCount = canonicalPageCount;
      docRef.current = doc; setFile(nextFile); setPageCount(effectivePageCount); setSelected(new Set(Array.from({ length: effectivePageCount }, (_, index) => index + 1))); setCustomRange(effectivePageCount <= 5 ? `1-${effectivePageCount}` : "1-3,5"); setStatus(t.loaded(effectivePageCount)); setPasswordState("closed"); passwordUpdaterRef.current = null;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "";
      if (message !== "PasswordException") { setError(message === "INVALID_PDF" ? t.invalid : message === "TOO_MANY_PAGES" ? t.tooManyPages : t.damaged); setFile(null); setPageCount(0); }
    } finally { setBusy(false); }
  }, [clearResults, disposeDocument, t]);

  const onFileInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const next = event.currentTarget.files?.[0]; event.currentTarget.value = ""; if (next) void loadPdf(next);
  }, [loadPdf]);
  const chooseFile = useCallback(() => { if (!busy) { if (inputRef.current) inputRef.current.value = ""; inputRef.current?.click(); } }, [busy]);
  const dropPdf = useCallback((event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault(); setDragging(false); setWorkspaceDragging(false); if (!busy) { const next = event.dataTransfer.files?.[0]; if (next) void loadPdf(next); }
  }, [busy, loadPdf]);

  const applyCustomRange = () => {
    try {
      const pages = parseTool035PageRange(customRange, pageCount); if (!pages.length) throw new Error("EMPTY");
      setSelected(new Set(pages)); setScope("custom"); setError("");
    } catch { setError(t.badRange); }
  };

  const getPageForExtraction = useCallback(async (pageNumber: number, pdfjs: any) => {
    const doc = docRef.current;
    if (!doc) throw new Error("PDF_NOT_READY");
    const canonical = canonicalPageCountRef.current || pageCount;
    if (doc.numPages === canonical || pageNumber <= doc.numPages) {
      return { page: await doc.getPage(pageNumber), temporaryDoc: null as any };
    }

    const originalBytes = sourceBytesRef.current;
    if (!originalBytes) throw new Error("PDF_SOURCE_BYTES_UNAVAILABLE");
    const { PDFDocument } = await import("pdf-lib");
    const sourcePdf = structuralDocRef.current ?? await PDFDocument.load(originalBytes, { ignoreEncryption: true, updateMetadata: false });
    if (pageNumber < 1 || pageNumber > sourcePdf.getPageCount()) throw new Error("PAGE_OUT_OF_RANGE");
    const singlePdf = await PDFDocument.create();
    const [copiedPage] = await singlePdf.copyPages(sourcePdf, [pageNumber - 1]);
    singlePdf.addPage(copiedPage);
    const singleBytes = await singlePdf.save({ useObjectStreams: false, addDefaultPage: false, updateFieldAppearances: false });
    const temporaryTask = pdfjs.getDocument({
      data: singleBytes,
      isOffscreenCanvasSupported: false,
      isImageDecoderSupported: false,
      maxImageSize: -1,
    });
    const temporaryDoc = await temporaryTask.promise;
    return { page: await temporaryDoc.getPage(1), temporaryDoc };
  }, [pageCount]);

  const runExtraction = async () => {
    const doc = docRef.current;
    if (!doc || !file) return;
    let pages = pageSelection;
    if (scope === "custom") {
      try { pages = parseTool035PageRange(customRange, pageCount); }
      catch { setError(t.badRange); return; }
    }
    if (!pages.length) { setError(t.selectOne); return; }

    const jobId = ++jobIdRef.current; abortRef.current = false; clearResults(); setBusy(true); setError(""); setStatus(""); setProgress({ done: 0, total: pages.length, page: pages[0] ?? 0 });
    const textOut: TextResult[] = []; const imageOut: ImageResult[] = []; const failed: FailedPage[] = [];
    const statsOut: ImageExtractionStats = { detected: 0, decoded: 0, failed: 0, technicalExcluded: 0, duplicateExcluded: 0 };
    let imageHardStopped = false;
    try {
      const pdfjs: any = await import("pdfjs-dist/webpack.mjs");
      if ((mode === "images" || mode === "both") && !structuralIndexRef.current && structuralDocRef.current) {
        setStatus(locale === "ko" ? "PDF 이미지 리소스를 한 번만 색인하는 중" : locale === "ja" ? "PDF画像リソースを一度だけ索引中" : "Indexing PDF image resources once");
        structuralIndexRef.current = await buildStructuralImageIndex(structuralDocRef.current);
      }
      const structuralJpegCache = new Map<string, { blob: Blob; width: number; height: number; hash: string }>();
      const emittedStructuralRefs = new Set<string>();
      const emittedHashes = new Set<string>();
      for (let index = 0; index < pages.length; index += 1) {
        if (abortRef.current || jobId !== jobIdRef.current) break;
        const pageNumber = pages[index]; setProgress({ done: index, total: pages.length, page: pageNumber }); setStatus(t.working(index + 1, pages.length, pageNumber));
        let page: PdfPage | null = null;
        let temporaryDoc: PdfDocument | null = null;
        try {
          const resolvedPage = await getPageForExtraction(pageNumber, pdfjs);
          page = resolvedPage.page;
          temporaryDoc = resolvedPage.temporaryDoc;
          if (mode === "text" || mode === "both") {
            try {
              const content = await page.getTextContent({ includeMarkedContent: false, disableNormalization: false });
              const text = textItemsToPlainText(content.items ?? []);
              textOut.push({ pageNumber, text, charCount: characterCount(text) });
              if ((index + 1) % 4 === 0 || index === pages.length - 1) setTextResults([...textOut]);
            } catch (cause) { failed.push({ pageNumber, stage: "text", message: cause instanceof Error ? cause.message : "TEXT_FAILED" }); }
          }
          if (mode === "images" || mode === "both") {
            try {
              const remainingImageBudget = Math.max(0, TOOL035_SERVICE_LIMITS.extractedImagesHardStop - imageOut.length);
              // Fast path: inspect PDF resources first. Pages whose XObject images
              // are all DCTDecode can export the original JPEG bytes directly and
              // skip expensive PDF.js bitmap decoding for those XObjects.
              const structural = await extractStructuralJpegImages(structuralIndexRef.current?.get(pageNumber), pageNumber, pageCount, remainingImageBudget, structuralJpegCache, emittedStructuralRefs);
              statsOut.duplicateExcluded += structural.duplicateExcluded;
              const useOriginalJpegs = structural.jpegObjects > 0 && structural.nonJpegXObjects === 0;
              if (!useOriginalJpegs) {
                for (const image of structural.images) URL.revokeObjectURL(image.url);
              }
              const structuralImages = useOriginalJpegs ? structural.images : [];
              const pdfJsBudget = Math.max(0, remainingImageBudget - structuralImages.length);
              const extracted = await extractPageImages(page, pdfjs, pageNumber, pageCount, () => abortRef.current || jobId !== jobIdRef.current, pdfJsBudget, useOriginalJpegs);
              statsOut.technicalExcluded += extracted.stats.technicalExcluded;
              const combined = [...structuralImages, ...extracted.images].filter((image) => {
                if (emittedHashes.has(image.hash)) { URL.revokeObjectURL(image.url); statsOut.duplicateExcluded += 1; return false; }
                emittedHashes.add(image.hash); return true;
              });
              const contentImages: ImageResult[] = [];
              for (const image of combined) {
                // PNG fallback images are blank-filtered on the already-decoded
                // canvas before PNG encoding. Only original JPEG fast-path
                // objects need a conservative blob sample here.
                if (!image.converted && await isLikelyBlankTechnicalImage(image)) {
                  URL.revokeObjectURL(image.url);
                  statsOut.technicalExcluded += 1;
                  continue;
                }
                contentImages.push(image);
              }
              const pageImages = contentImages.map((image, index) => ({
                ...image,
                imageIndex: index + 1,
                name: tool035ImageName(pageNumber, index + 1, pageCount, image.format),
              }));
              statsOut.detected += extracted.stats.detected + structural.jpegObjects;
              statsOut.decoded += pageImages.length;
              statsOut.failed += extracted.stats.failed;
              setImageStats({ ...statsOut });
              imageOut.push(...pageImages); imagesRef.current = [...imageOut];
              if ((index + 1) % 4 === 0 || index === pages.length - 1 || imageOut.length >= TOOL035_SERVICE_LIMITS.extractedImagesHardStop) {
                setImageResults([...imageOut]);
              }
              if (imageOut.length >= TOOL035_SERVICE_LIMITS.extractedImagesHardStop) {
                imageHardStopped = true;
                setLimitNotice(t.imageHardStop);
                abortRef.current = true;
              } else if (imageOut.length > TOOL035_SERVICE_LIMITS.extractedImagesWarning) {
                setLimitNotice(t.imageWarning);
              }
            } catch (cause) { failed.push({ pageNumber, stage: "images", message: cause instanceof Error ? cause.message : "IMAGE_FAILED" }); }
          }
        } catch (cause) {
          failed.push({ pageNumber, stage: mode === "images" ? "images" : "text", message: cause instanceof Error ? cause.message : "PAGE_FAILED" });
        } finally {
          try { page?.cleanup?.(); } catch {}
          try { await temporaryDoc?.destroy?.(); } catch {}
        }
        setFailedPages([...failed]); setProgress({ done: index + 1, total: pages.length, page: pageNumber });
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
      if ((mode === "text" || mode === "both") && textOut.length) setTextResults([...textOut]);
      if ((mode === "images" || mode === "both") && imageOut.length !== imageResults.length) setImageResults([...imageOut]);
      if ((mode === "images" || mode === "both") && statsOut.detected > 0 && statsOut.decoded === 0 && statsOut.technicalExcluded === 0) setError(t.imageObjectsButFailed);
      if (imageHardStopped) setStatus(t.done(Math.min(pages.length, progress.done || pages.length)));
      else if (abortRef.current || jobId !== jobIdRef.current) setStatus(t.cancelled);
      else if (failed.length) { setError(t.pageFailed); setStatus(t.done(pages.length)); }
      else setStatus(t.done(pages.length));
      if (mode === "images") setActiveTab("images"); else setActiveTab("text");
    } catch { setError(t.damaged); }
    finally { if (jobId === jobIdRef.current) setBusy(false); }
  };

  const cancelWork = () => { abortRef.current = true; setStatus(t.cancelled); };
  const toggleSelectedPage = (page: number) => setSelected((current) => { const next = new Set(current); if (next.has(page)) next.delete(page); else next.add(page); return next; });

  const downloadText = () => { if (!file || !textResults.length) return; downloadBlob(new Blob([totalText], { type: "text/plain;charset=utf-8" }), tool035TextFilename(file.name)); };
  const downloadPageText = (result: TextResult) => { downloadBlob(new Blob([`===== PAGE ${result.pageNumber} =====\n${result.text}`], { type: "text/plain;charset=utf-8" }), tool035PageTextName(result.pageNumber, pageCount)); };
  const copyAll = async () => { try { await navigator.clipboard.writeText(totalText); setStatus(t.copied); } catch { setError("Clipboard unavailable"); } };
  const downloadImage = (result: ImageResult) => downloadBlob(result.blob, result.name);

  const downloadImagesZip = async () => {
    if (!file || !visibleImages.length) return;
    try {
      const zip = await createStoredZip(visibleImages.map((image) => ({ name: safeTool035ZipPath(`images/${image.name}`), blob: image.blob })));
      downloadBlob(zip, tool035ImagesZipFilename(file.name));
    } catch { setError(t.zipFailed); }
  };
  const downloadCombinedZip = async () => {
    if (!file) return;
    try {
      const entries: Array<{ name: string; blob: Blob }> = [];
      if (textResults.length) entries.push({ name: safeTool035ZipPath(`text/${tool035TextFilename(file.name)}`), blob: new Blob([totalText], { type: "text/plain;charset=utf-8" }) });
      for (const image of visibleImages) entries.push({ name: safeTool035ZipPath(`images/${image.name}`), blob: image.blob });
      if (!entries.length) return;
      const zip = await createStoredZip(entries); downloadBlob(zip, tool035CombinedZipFilename(file.name));
    } catch { setError(t.zipFailed); }
  };

  const submitPassword = () => { if (!passwordUpdaterRef.current || !password) return; const updater = passwordUpdaterRef.current; setPasswordState("closed"); updater(password); };
  const cancelPassword = () => { try { loadingTaskRef.current?.destroy?.(); } catch {} passwordUpdaterRef.current = null; setPasswordState("closed"); setPassword(""); setBusy(false); setError(t.invalid); };

  const hasResults = textResults.length > 0 || imageResults.length > 0 || progress.done > 0;

  return <div className={styles.root} data-testid="tool035-root">
    <div className={styles.localNote}><strong>LOCAL</strong><span>{t.local}</span></div>
    <input ref={inputRef} className={styles.hiddenInput} type="file" accept="application/pdf,.pdf" onChange={onFileInputChange} data-testid="tool035-file-input" />

    {!file ? <section className={`${styles.dropzone} ${dragging ? styles.dragging : ""}`} onClick={chooseFile} onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); setDragging(true); } }} onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false); }} onDrop={dropPdf} data-testid="tool035-dropzone">
      <strong>{t.drop}</strong><span>{t.dropSub}</span><small className={styles.limitNote}>{t.limitNote}</small><button type="button" className={styles.primaryButton} onClick={(e) => { e.stopPropagation(); chooseFile(); }}>{t.choose}</button>
      {error ? <div className={styles.error} role="alert" data-testid="tool035-error" onClick={(e) => e.stopPropagation()}>{error}</div> : null}
    </section> : <section className={`${styles.activeWorkspace} ${workspaceDragging ? styles.workspaceDragging : ""}`} onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); setWorkspaceDragging(true); } }} onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setWorkspaceDragging(false); }} onDrop={dropPdf} data-testid="tool035-workspace">
      <div className={styles.fileCard} data-testid="tool035-file-info"><div><strong>{file.name}</strong><span>{formatBytes(file.size)} · {pageCount} {t.pages}</span><small>{t.limitNote}</small></div><button type="button" className={styles.secondaryButton} onClick={chooseFile} disabled={busy}>{t.replace}</button></div>

      <section className={styles.controlPanel} aria-label={t.mode}>
        <div className={styles.sectionHead}><strong>{t.mode}</strong></div>
        <div className={styles.modeGrid} role="tablist" aria-label={t.mode}>
          {(["text", "images", "both"] as Tool035Mode[]).map((key) => <button key={key} type="button" role="tab" aria-selected={mode === key} className={mode === key ? styles.activeMode : ""} onClick={() => { setMode(key); setActiveTab(key === "images" ? "images" : "text"); }} disabled={busy} data-testid={`tool035-mode-${key}`}><strong>{key === "text" ? t.text : key === "images" ? t.images : t.both}</strong><span>{key === "text" ? t.textSub : key === "images" ? t.imagesSub : t.bothSub}</span></button>)}
        </div>
      </section>

      <section className={styles.controlPanel} aria-label={t.pageScope} data-testid="tool035-page-scope">
        <div className={styles.sectionHead}><strong>{t.pageScope}</strong><span>{t.selectedCount} {pageSelection.length}/{pageCount}</span></div>
        <div className={styles.scopeButtons}>{(["all", "selected", "custom"] as Tool035PageScope[]).map((key) => <button key={key} type="button" className={scope === key ? styles.activeScope : ""} onClick={() => setScope(key)} disabled={busy}>{key === "all" ? t.all : key === "selected" ? t.selected : t.custom}</button>)}</div>
        {scope === "custom" ? <div className={styles.rangeRow}><input value={customRange} onChange={(e) => setCustomRange(e.target.value)} placeholder={t.customPlaceholder} aria-label={t.custom} data-testid="tool035-range-input" /><button type="button" className={styles.secondaryButton} onClick={applyCustomRange}>{t.apply}</button></div> : null}
        {scope === "selected" ? <><div className={styles.selectionActions}><button type="button" onClick={() => setSelected(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)))}>{t.selectAll}</button><button type="button" onClick={() => setSelected(new Set())}>{t.clear}</button></div><div className={styles.pagePicker} data-testid="tool035-page-picker">{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => <label key={page} data-testid={`tool035-page-${page}`} className={selected.has(page) ? styles.pageSelected : ""}><input type="checkbox" aria-label={`${t.page} ${page}`} checked={selected.has(page)} onChange={() => toggleSelectedPage(page)} /><span>{page}</span></label>)}</div></> : null}
      </section>

      {(mode === "images" || mode === "both") ? <section className={styles.controlPanel} aria-label={t.options} data-testid="tool035-image-options">
        <div className={styles.sectionHead}><strong>{t.options}</strong><span>{t.imageView}</span></div>
        <div className={styles.imageViewGrid} role="radiogroup" aria-label={t.imageView}>
          <label className={imageViewMode === "major" ? styles.imageViewActive : ""}><input type="radio" name="tool035-image-view" value="major" checked={imageViewMode === "major"} onChange={() => setImageViewMode("major")} data-testid="tool035-image-view-major" /><strong>{t.majorImages}</strong><span>{t.majorHelp}</span></label>
          <label className={imageViewMode === "all" ? styles.imageViewActive : ""}><input type="radio" name="tool035-image-view" value="all" checked={imageViewMode === "all"} onChange={() => setImageViewMode("all")} data-testid="tool035-image-view-all" /><strong>{t.allImages}</strong><span>{t.allHelp}</span></label>
        </div>
        <div className={styles.filterBlock}><div className={styles.filterTitle}><strong>{t.filterTitle}</strong></div><div className={styles.filterGrid} role="radiogroup" aria-label={t.filterTitle}>{([
          ["basic", t.filterBasic, t.filterBasicHelp], ["level1", t.filterLevel1, t.filterLevel1Help], ["level2", t.filterLevel2, t.filterLevel2Help], ["level3", t.filterLevel3, t.filterLevel3Help], ["custom", t.filterCustom, t.minSize],
        ] as const).map(([key, label, help]) => <label key={key} className={exclusionFilter === key ? styles.filterActive : ""}><input type="radio" name="tool035-exclusion-filter" value={key} checked={exclusionFilter === key} onChange={() => setExclusionFilter(key)} data-testid={`tool035-filter-${key}`} /><strong>{label}</strong><span>{help}</span></label>)}</div>{exclusionFilter === "custom" ? <label className={styles.customFilterRow}><span>{t.minSize}</span><input type="number" min={1} max={4096} value={minSize} onChange={(e) => setMinSize(Math.max(1, Math.min(4096, Number(e.target.value) || 1)))} data-testid="tool035-filter-custom-size" /></label> : null}</div>
        <p className={styles.help}>{t.optionsHelp}</p>
      </section> : null}

      <div className={styles.actions}><button type="button" className={styles.primaryButton} onClick={() => void runExtraction()} disabled={busy || !pageSelection.length} data-testid="tool035-extract">{hasResults ? t.reextract : t.extract}</button>{busy ? <button type="button" className={styles.secondaryButton} onClick={cancelWork} data-testid="tool035-cancel">{t.cancel}</button> : null}<button type="button" className={styles.secondaryButton} onClick={() => void resetAll()} disabled={busy}>{t.reset}</button></div>

      {(busy || progress.total > 0) ? <div className={styles.progressBlock} data-testid="tool035-progress"><div><strong>{t.progress}</strong><span>{progress.done}/{progress.total}</span></div><div className={styles.progressTrack} role="progressbar" aria-valuemin={0} aria-valuemax={progress.total || 1} aria-valuenow={progress.done}><i style={{ width: `${progress.total ? Math.round(progress.done / progress.total * 100) : 0}%` }} /></div></div> : null}

    {error ? <div className={styles.error} role="alert" data-testid="tool035-error">{error}</div> : null}
    {status ? <div className={styles.status} aria-live="polite" data-testid="tool035-status">{status}</div> : null}
    {limitNotice ? <div className={styles.limitNotice} aria-live="polite" data-testid="tool035-limit-notice">{limitNotice}</div> : null}

    {hasResults ? <section className={styles.resultsPanel} data-testid="tool035-results">
      <div className={styles.resultHead}><div><span>RESULT</span><strong>{t.results}</strong></div><div className={styles.summaryGrid}><div><span>{t.textPages}</span><strong>{textPageCount}</strong></div><div><span>{t.detectedImages}</span><strong data-testid="tool035-stat-detected">{imageStats.detected}</strong></div><div><span>{t.imageCount}</span><strong data-testid="tool035-stat-decoded">{imageResults.length}</strong></div><div><span>{t.duplicateHidden}</span><strong data-testid="tool035-stat-duplicates">{duplicateExcludedCount}</strong></div><div><span>{t.technicalHidden}</span><strong data-testid="tool035-stat-technical">{imageStats.technicalExcluded}</strong></div><div><span>{t.majorCount}</span><strong data-testid="tool035-stat-major">{majorImages.length}</strong></div><div><span>{t.excludedCount}</span><strong>{Math.max(0, dedupedImages.length - majorImages.length)}</strong></div><div><span>{t.decodeFailed}</span><strong data-testid="tool035-stat-decode-failed">{imageStats.failed}</strong></div><div><span>{t.visible}</span><strong data-testid="tool035-stat-visible">{visibleImages.length}</strong></div><div><span>{t.failed}</span><strong>{failedPages.length}</strong></div></div></div>
      {allTextEmpty && (mode === "text" || mode === "both") ? <div className={styles.scanNotice} data-testid="tool035-scan-hint"><strong>{t.noText}</strong><span>{t.scanHint}</span></div> : null}
      {textResults.length > 0 ? <div className={styles.layoutNotice}>{t.layoutHint}</div> : null}
      <div className={styles.resultTabs} role="tablist" aria-label={t.results}>{mode !== "images" ? <button type="button" role="tab" aria-selected={activeTab === "text"} className={activeTab === "text" ? styles.activeResultTab : ""} onClick={() => setActiveTab("text")}>{t.textTab}</button> : null}{mode !== "text" ? <button type="button" role="tab" aria-selected={activeTab === "images"} className={activeTab === "images" ? styles.activeResultTab : ""} onClick={() => setActiveTab("images")}>{t.imageTab}</button> : null}</div>

      {activeTab === "text" && mode !== "images" ? <div className={styles.textResults} data-testid="tool035-text-results"><div className={styles.resultActions}><button type="button" className={styles.primaryButton} onClick={() => void copyAll()} disabled={!textResults.length}>{t.copyAll}</button><button type="button" className={styles.secondaryButton} onClick={downloadText} disabled={!textResults.length}>{t.downloadTxt}</button>{mode === "both" ? <button type="button" className={styles.secondaryButton} onClick={() => void downloadCombinedZip()} disabled={!textResults.length && !visibleImages.length}>{t.combinedZip}</button> : null}</div>{textResults.map((result) => <article key={result.pageNumber} className={styles.textCard} data-testid="tool035-text-page"><div className={styles.textCardHead}><div><strong>{t.page} {result.pageNumber}</strong><span>{result.charCount} {t.chars}</span></div><button type="button" onClick={() => downloadPageText(result)}>{t.downloadPageTxt}</button></div><pre>{result.text || t.noText}</pre></article>)}</div> : null}

      {activeTab === "images" && mode !== "text" ? <div className={styles.imageResults} data-testid="tool035-image-results"><div className={styles.resultActions}><button type="button" className={styles.primaryButton} onClick={() => void downloadImagesZip()} disabled={!visibleImages.length}>{t.downloadZip}</button>{mode === "both" ? <button type="button" className={styles.secondaryButton} onClick={() => void downloadCombinedZip()} disabled={!textResults.length && !visibleImages.length}>{t.combinedZip}</button> : null}<span>{imageViewMode === "major" ? `${majorImages.length} ${t.majorCount}` : `${dedupedImages.length} ${t.imageCount}`}{duplicateExcludedCount ? ` · ${duplicateExcludedCount} ${t.duplicateHidden}` : ""}{imageStats.technicalExcluded ? ` · ${imageStats.technicalExcluded} ${t.technicalHidden}` : ""}{filteredExcludedCount ? ` · ${filteredExcludedCount} ${t.filtered}` : ""}</span></div>{visibleImages.length ? <><div className={styles.imageGrid}>{previewImages.map((image) => <article key={`${image.pageNumber}-${image.imageIndex}-${image.hash}`} className={styles.imageCard} data-testid="tool035-image-card"><div className={styles.imagePreview}><img src={image.url} alt={`${t.page} ${image.pageNumber} · ${image.imageIndex} · ${image.width}×${image.height}`} /></div><div className={styles.imageMeta}><strong>{image.name}</strong><span>{t.page} {image.pageNumber} · {image.width}×{image.height}</span><span>{image.sourceKind === "xobject" ? t.xobject : image.sourceKind === "inline" ? t.inline : t.mask} · {image.converted ? t.pngFallback : t.originalJpg}</span><button type="button" onClick={() => downloadImage(image)}>{t.download}</button></div></article>)}</div>{previewImages.length < visibleImages.length ? <div className={styles.resultActions}><button type="button" className={styles.secondaryButton} onClick={() => setPreviewLimit((value) => Math.min(value + 60, visibleImages.length))}>+ {Math.min(60, visibleImages.length - previewImages.length)} · {previewImages.length}/{visibleImages.length}</button></div> : null}</> : <div className={styles.emptyResult}>{t.noImages}</div>}</div> : null}
    </section> : null}
    </section>}

    {passwordState !== "closed" ? <div className={styles.passwordBackdrop} role="presentation"><section className={styles.passwordDialog} role="dialog" aria-modal="true" aria-labelledby="tool035-password-title"><h3 id="tool035-password-title">{t.passwordTitle}</h3><p>{passwordState === "incorrect" ? t.passwordIncorrect : t.passwordRequired}</p><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} onKeyDown={(e) => { if (e.key === "Enter") submitPassword(); }} autoFocus /><div><button type="button" className={styles.primaryButton} onClick={submitPassword} disabled={!password}>{t.passwordApply}</button><button type="button" className={styles.secondaryButton} onClick={cancelPassword}>{t.passwordCancel}</button></div></section></div> : null}
  </div>;
}
