'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { StableMobileImageFileInput } from "@/components/stable-mobile-image-file-input";
import styles from './image-metadata-checker-tool.module.css';
import { createStoredZip } from '@/lib/zip';
import {
  TOOL018_LIMITS,
  analyzeImageFile,
  cleanFilename,
  estimatedPrintSize,
  formatBytes,
  formatExposureTime,
  stripPrivacyMetadata,
  uniqueNames,
  validateTool018Files,
  type ImageMetadataAnalysis,
  type MetadataEntry,
} from '@/lib/image-metadata';
import type { Locale } from '@/lib/site';

type Item = {
  id: string;
  file: File;
  analysis?: ImageMetadataAnalysis;
  error?: string;
  cleaning?: boolean;
  cleanBlob?: Blob;
  cleanAnalysis?: ImageMetadataAnalysis;
  cleanError?: string;
};

type ViewMode = 'original' | 'clean';

const MAX_FILE_MB = TOOL018_LIMITS.maxFileBytes / 1024 / 1024;
const MAX_TOTAL_MB = TOOL018_LIMITS.maxTotalBytes / 1024 / 1024;
const MAX_MP = TOOL018_LIMITS.maxPixels / 1_000_000;

const copy = {
  ko: {
    title: '이미지 메타데이터 검사 작업장', intro: '이미지를 선택하면 기본 정보와 메타데이터를 자동으로 분석합니다.',
    select: '이미지 선택', drop: '이미지를 여기에 놓으세요', support: `JPG·PNG·WebP · 최대 ${TOOL018_LIMITS.maxFiles}개 · 파일당 ${MAX_FILE_MB}MB · 총 ${MAX_TOTAL_MB}MB · ${MAX_MP}MP`, add: '이미지 추가',
    analyzing: '분석 중', selected: '선택한 이미지', total: '전체', gpsFiles: 'GPS 포함', exifFiles: 'EXIF 있음', noMetadata: '메타데이터 없음', failed: '실패',
    privacy: '개인정보 가능 정보', location: '위치 정보', taken: '촬영 날짜', camera: '카메라 정보', author: '작성자 정보', copyright: '저작권 정보', softwareInfo: '소프트웨어 정보', found: '있음', none: '없음',
    gpsWarn: '이 이미지에는 위치 정보가 포함되어 있습니다. 사진을 공유하면 촬영 위치가 노출될 수 있습니다.',
    basic: '기본 정보', fileName: '파일명', format: '파일 형식', mime: 'MIME 형식', size: '파일 크기', resolution: '해상도', pixels: '총 픽셀', mp: '메가픽셀', ratio: '화면 비율', orientation: '이미지 방향', pixelOrientation: '원본 픽셀 방향', exifOrientation: 'EXIF Orientation', landscape: '가로', portrait: '세로', square: '정사각형', alpha: '투명도', possible: '지원 가능', notPossible: '없음', actualMismatch: '확장자와 실제 이미지 형식이 다릅니다.',
    print: 'DPI·PPI / 예상 인쇄 크기', storedPpi: '메타데이터 PPI', noPpi: 'DPI·PPI 정보 없음', calcPpi: '계산 기준', custom: '사용자 지정', printSize: '예상 인쇄 크기', ppiNote: '파일 PPI와 계산용 PPI는 서로 다른 값입니다.',
    capture: '촬영 정보', noCapture: '촬영 정보 없음', dateTaken: '촬영일', fileModified: '파일 수정 시간', make: '카메라 제조사', model: '카메라 모델', lens: '렌즈', lensSpec: '렌즈 사양', metering: '측광 방식', iso: 'ISO', shutter: '셔터 속도', aperture: '조리개', focal: '초점 거리', focal35: '35mm 환산', exposure: '노출 보정', flash: '플래시', wb: '화이트 밸런스', software: '소프트웨어',
    gps: 'GPS 위치 정보', noGps: 'GPS 위치 정보 없음', lat: '위도', lng: '경도', altitude: '고도', gpsDate: 'GPS 날짜', gpsTime: 'GPS 시간', direction: '방향', map: '지도에서 확인', mapNote: '외부 지도 서비스로 좌표가 전달됩니다.',
    metadata: '전체 메타데이터', metadataCount: '항목', search: '메타데이터 검색', noMatch: '검색 결과가 없습니다.', rawTag: '원본 태그', value: '값', copyJson: 'JSON 복사', copyValue: '값 복사', showMetadata: '전체 메타데이터 보기', hideMetadata: '전체 메타데이터 접기', copied: '복사했습니다.',
    remove: '메타데이터 제거', removeDesc: '원본은 그대로 두고 GPS·촬영 정보·카메라·XMP 등 개인정보성 메타데이터를 제거한 새 파일을 만듭니다. 색상 프로파일처럼 화면 표현에 필요한 정보는 보존합니다.', removeOne: '메타데이터 제거', removeAll: '모든 이미지 메타데이터 제거', removing: '제거 중', removed: '개인정보 메타데이터 제거 완료', partial: '일부 메타데이터가 남아 있습니다.', before: '원본', after: '결과', compare: '제거 결과', exif: 'EXIF', gpsState: 'GPS', imageSize: '해상도', fileSize: '파일 크기', download: '새 이미지 다운로드', zip: 'ZIP 다운로드',
    originalPreview: '원본 보기', cleanPreview: '결과 보기', preview: '이미지 미리보기', noPreview: '미리보기를 준비할 수 없습니다.',
    removeFile: '목록에서 제거', waiting: '대기', cleanComplete: '제거 완료', cleanFailed: '제거 실패', ppiInvalid: 'PPI는 1~2400 사이의 값을 입력해 주세요.', clear: '전체 초기화', retry: '다시 시도',
    errors: { tooMany: `이미지는 최대 ${TOOL018_LIMITS.maxFiles}개까지 선택할 수 있습니다.`, total: `전체 파일 용량이 ${MAX_TOTAL_MB}MB를 넘었습니다.`, file: `파일당 ${MAX_FILE_MB}MB까지 지원합니다.`, unsupported: '지원하지 않는 이미지 형식입니다.', unreadable: '이미지를 읽을 수 없습니다.', pixels: '이미지 해상도가 기본 서비스 범위를 넘었습니다.', metadata: '메타데이터를 읽는 중 오류가 발생했습니다.', clean: '메타데이터를 제거하지 못했습니다.', clipboard: '클립보드에 복사하지 못했습니다.', zip: 'ZIP 파일을 만들지 못했습니다.', download: '파일을 다운로드하지 못했습니다.' },
    local: '이미지와 메타데이터는 서버로 전송되지 않으며 현재 브라우저에서만 확인합니다.',
  },
  en: {
    title: 'Image metadata inspection workspace', intro: 'Select images to analyze basic information and metadata automatically.',
    select: 'Select Images', drop: 'Drop images here', support: `JPG · PNG · WebP · up to ${TOOL018_LIMITS.maxFiles} files · ${MAX_FILE_MB} MB each · ${MAX_TOTAL_MB} MB total · ${MAX_MP} MP`, add: 'Add Images',
    analyzing: 'Analyzing', selected: 'Selected Images', total: 'Total', gpsFiles: 'With GPS', exifFiles: 'With EXIF', noMetadata: 'No metadata', failed: 'Failed',
    privacy: 'Potential Privacy Information', location: 'Location Data', taken: 'Date Taken', camera: 'Camera Information', author: 'Author Information', copyright: 'Copyright Information', softwareInfo: 'Software Information', found: 'Found', none: 'None',
    gpsWarn: 'This image contains location data. Sharing the photo may reveal where it was taken.',
    basic: 'Basic Information', fileName: 'File Name', format: 'File Format', mime: 'MIME Type', size: 'File Size', resolution: 'Resolution', pixels: 'Total Pixels', mp: 'Megapixels', ratio: 'Aspect Ratio', orientation: 'Orientation', pixelOrientation: 'Raw Pixel Orientation', exifOrientation: 'EXIF Orientation', landscape: 'Landscape', portrait: 'Portrait', square: 'Square', alpha: 'Transparency', possible: 'Supported', notPossible: 'None', actualMismatch: 'The filename extension does not match the actual image format.',
    print: 'DPI / PPI & Estimated Print Size', storedPpi: 'Resolution Metadata', noPpi: 'No DPI / PPI information', calcPpi: 'Calculation PPI', custom: 'Custom', printSize: 'Estimated Print Size', ppiNote: 'Stored image PPI and the calculation PPI are separate values.',
    capture: 'Camera Information', noCapture: 'No camera information', dateTaken: 'Date Taken', fileModified: 'File Modified Time', make: 'Camera Make', model: 'Camera Model', lens: 'Lens', lensSpec: 'Lens Specification', metering: 'Metering Mode', iso: 'ISO', shutter: 'Shutter Speed', aperture: 'Aperture', focal: 'Focal Length', focal35: '35mm Equivalent', exposure: 'Exposure Compensation', flash: 'Flash', wb: 'White Balance', software: 'Software',
    gps: 'GPS Location', noGps: 'No Location Data', lat: 'Latitude', lng: 'Longitude', altitude: 'Altitude', gpsDate: 'GPS Date', gpsTime: 'GPS Time', direction: 'Direction', map: 'View on Map', mapNote: 'Coordinates will be sent to an external map service.',
    metadata: 'All Metadata', metadataCount: 'items', search: 'Search metadata', noMatch: 'No matching metadata.', rawTag: 'Original Tag', value: 'Value', copyJson: 'Copy JSON', copyValue: 'Copy Value', showMetadata: 'View All Metadata', hideMetadata: 'Hide Metadata', copied: 'Copied.',
    remove: 'Remove Metadata', removeDesc: 'Keep the original and create a new file with privacy-related metadata such as GPS, camera details, dates, and XMP removed. Color profiles needed for image appearance are preserved.', removeOne: 'Remove Metadata', removeAll: 'Remove Metadata from All', removing: 'Removing Metadata', removed: 'Privacy metadata removed', partial: 'Some metadata remains.', before: 'Original', after: 'Result', compare: 'Removal Result', exif: 'EXIF', gpsState: 'GPS', imageSize: 'Resolution', fileSize: 'File Size', download: 'Download Clean Image', zip: 'Download ZIP',
    originalPreview: 'Original', cleanPreview: 'Result', preview: 'Image Preview', noPreview: 'Preview is unavailable.',
    removeFile: 'Remove from list', waiting: 'Waiting', cleanComplete: 'Removal Complete', cleanFailed: 'Removal Failed', ppiInvalid: 'Enter a PPI value from 1 to 2400.', clear: 'Reset All', retry: 'Try Again',
    errors: { tooMany: `You can select up to ${TOOL018_LIMITS.maxFiles} images.`, total: `Total file size exceeds ${MAX_TOTAL_MB} MB.`, file: `Each file must be ${MAX_FILE_MB} MB or smaller.`, unsupported: 'Unsupported image format.', unreadable: 'The image cannot be read.', pixels: 'Image resolution exceeds the basic service range.', metadata: 'An error occurred while reading metadata.', clean: 'Could not remove metadata.', clipboard: 'Could not copy to the clipboard.', zip: 'Could not create the ZIP file.', download: 'Could not download the file.' },
    local: 'Your images and metadata are analyzed only in this browser and are not uploaded to a server.',
  },
  ja: {
    title: '画像メタデータ確認ワークスペース', intro: '画像を選択すると、基本情報とメタデータを自動で解析します。',
    select: '画像を選択', drop: '画像をここにドロップ', support: `JPG・PNG・WebP · 最大${TOOL018_LIMITS.maxFiles}枚 · 1ファイル${MAX_FILE_MB}MB · 合計${MAX_TOTAL_MB}MB · ${MAX_MP}MP`, add: '画像を追加',
    analyzing: '解析中', selected: '選択した画像', total: '全体', gpsFiles: 'GPSあり', exifFiles: 'EXIFあり', noMetadata: 'メタデータなし', failed: '失敗',
    privacy: '個人情報の可能性がある項目', location: '位置情報', taken: '撮影日時', camera: 'カメラ情報', author: '作成者情報', copyright: '著作権情報', softwareInfo: 'ソフトウェア情報', found: 'あり', none: 'なし',
    gpsWarn: 'この画像には位置情報が含まれています。共有すると撮影場所が分かる可能性があります。',
    basic: '基本情報', fileName: 'ファイル名', format: 'ファイル形式', mime: 'MIMEタイプ', size: 'ファイルサイズ', resolution: '解像度', pixels: '総ピクセル数', mp: 'メガピクセル', ratio: 'アスペクト比', orientation: '画像の向き', pixelOrientation: '元ピクセルの向き', exifOrientation: 'EXIF Orientation', landscape: '横', portrait: '縦', square: '正方形', alpha: '透明度', possible: '対応可能', notPossible: 'なし', actualMismatch: '拡張子と実際の画像形式が異なります。',
    print: 'DPI・PPI / 推定印刷サイズ', storedPpi: '解像度情報', noPpi: 'DPI・PPI情報なし', calcPpi: '計算基準', custom: 'カスタム', printSize: '推定印刷サイズ', ppiNote: 'ファイル内のPPIと計算用PPIは別の値です。',
    capture: '撮影情報', noCapture: '撮影情報なし', dateTaken: '撮影日時', fileModified: 'ファイル更新日時', make: 'カメラメーカー', model: 'カメラモデル', lens: 'レンズ', lensSpec: 'レンズ仕様', metering: '測光方式', iso: 'ISO', shutter: 'シャッタースピード', aperture: '絞り値', focal: '焦点距離', focal35: '35mm換算', exposure: '露出補正', flash: 'フラッシュ', wb: 'ホワイトバランス', software: 'ソフトウェア',
    gps: 'GPS位置情報', noGps: '位置情報なし', lat: '緯度', lng: '経度', altitude: '高度', gpsDate: 'GPS日付', gpsTime: 'GPS時刻', direction: '方向', map: '地図で確認', mapNote: '座標が外部の地図サービスに送信されます。',
    metadata: 'すべてのメタデータ', metadataCount: '項目', search: 'メタデータを検索', noMatch: '一致するメタデータがありません。', rawTag: '元のタグ', value: '値', copyJson: 'JSONをコピー', copyValue: '値をコピー', showMetadata: 'すべてのメタデータを表示', hideMetadata: 'メタデータを閉じる', copied: 'コピーしました。',
    remove: 'メタデータを削除', removeDesc: '元画像はそのまま保持し、GPS・撮影日時・カメラ・XMPなど個人情報性のあるメタデータを削除した新しいファイルを作成します。色表示に必要なプロファイルは保持します。', removeOne: 'メタデータを削除', removeAll: 'すべての画像から削除', removing: '削除中', removed: '個人情報メタデータを削除しました', partial: '一部のメタデータが残っています。', before: '元画像', after: '結果', compare: '削除結果', exif: 'EXIF', gpsState: 'GPS', imageSize: '解像度', fileSize: 'ファイルサイズ', download: '画像をダウンロード', zip: 'ZIPダウンロード',
    originalPreview: '元画像', cleanPreview: '結果', preview: '画像プレビュー', noPreview: 'プレビューを表示できません。',
    removeFile: '一覧から削除', waiting: '待機', cleanComplete: '削除完了', cleanFailed: '削除失敗', ppiInvalid: 'PPIは1〜2400の範囲で入力してください。', clear: 'すべてリセット', retry: '再試行',
    errors: { tooMany: `画像は最大${TOOL018_LIMITS.maxFiles}枚まで選択できます。`, total: `合計ファイルサイズが${MAX_TOTAL_MB}MBを超えています。`, file: `1ファイル${MAX_FILE_MB}MBまで対応します。`, unsupported: '対応していない画像形式です。', unreadable: '画像を読み込めません。', pixels: '画像解像度が基本サービス範囲を超えています。', metadata: 'メタデータの読み取り中にエラーが発生しました。', clean: 'メタデータを削除できませんでした。', clipboard: 'クリップボードにコピーできませんでした。', zip: 'ZIPファイルを作成できませんでした。', download: 'ファイルをダウンロードできませんでした。' },
    local: '画像とメタデータはサーバーに送信されず、このブラウザ内でのみ解析されます。',
  },
} as const;

function idFor(file: File) { return `${file.name}:${file.size}:${file.lastModified}:${crypto.randomUUID?.() ?? Math.random()}`; }

function downloadBlob(blob: Blob, name: string) {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch { return false; }
}

function errorText(locale: Locale, code?: string) {
  const t = copy[locale].errors;
  if (!code) return '';
  if (code === 'TOO_MANY_FILES') return t.tooMany;
  if (code === 'TOTAL_TOO_LARGE') return t.total;
  if (code.startsWith('FILE_TOO_LARGE')) return t.file;
  if (code === 'UNSUPPORTED_IMAGE') return t.unsupported;
  if (code === 'UNREADABLE_IMAGE') return t.unreadable;
  if (code === 'PIXEL_LIMIT') return t.pixels;
  return t.metadata;
}

function formatLensSpecification(values?: number[]) {
  if (!values?.length) return undefined;
  if (values.length >= 4) return `${values[0]}–${values[1]} mm · f/${values[2]}–${values[3]}`;
  return values.join(' · ');
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return <div className={styles.infoRow}><dt>{label}</dt><dd>{value == null || value === '' ? '—' : value}</dd></div>;
}

function StatusPill({ value, found, labels }: { value: string; found: boolean; labels: { found: string; none: string } }) {
  return <div className={`${styles.privacyItem} ${found ? styles.present : ''}`}><span>{value}</span><strong>{found ? labels.found : labels.none}</strong></div>;
}

function metadataJson(analysis: ImageMetadataAnalysis) {
  const { name, formatLabel, mime, size, width, height, totalPixels, megapixels, aspectRatio, orientation, pixelOrientation, exifOrientation, resolution, dateTaken, make, model, lensMake, lensModel, lensSpecification, software, artist, copyright, iso, exposureTime, fNumber, focalLength, focalLength35mm, exposureBias, flash, whiteBalance, meteringMode, gps, hasExif, hasGps, hasXmp, hasIptc, hasIcc, entries } = analysis;
  return { name, format: formatLabel, mime, size, width, height, totalPixels, megapixels, aspectRatio, orientation, pixelOrientation, exifOrientation, resolution, dateTaken, make, model, lensMake, lensModel, lensSpecification, software, artist, copyright, iso, exposureTime, fNumber, focalLength, focalLength35mm, exposureBias, flash, whiteBalance, meteringMode, gps, hasExif, hasGps, hasXmp, hasIptc, hasIcc, metadata: entries.map(({ group, tag, label, value }) => ({ group, tag, label, value })) };
}

export function ImageMetadataCheckerTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [drag, setDrag] = useState(false);
  const [ppi, setPpi] = useState(300);
  const [customPpi, setCustomPpi] = useState('300');
  const [ppiError, setPpiError] = useState('');
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('original');
  const [previewUrl, setPreviewUrl] = useState('');
  const [copyState, setCopyState] = useState('');
  const [globalError, setGlobalError] = useState('');

  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const analysis = viewMode === 'clean' && selected?.cleanAnalysis ? selected.cleanAnalysis : selected?.analysis;

  useEffect(() => {
    if (!selected && items[0]) setSelectedId(items[0].id);
  }, [items, selected]);

  useEffect(() => {
    if (!selected) { setPreviewUrl(''); return; }
    const source = viewMode === 'clean' && selected.cleanBlob ? selected.cleanBlob : selected.file;
    const url = URL.createObjectURL(source);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selected, viewMode]);

  useEffect(() => {
    setQuery('');
    setViewMode('original');
    setMetadataOpen(false);
  }, [selectedId]);

  useEffect(() => {
    const stored = selected?.analysis?.resolution?.ppiX;
    const next = stored && stored >= 1 && stored <= 2400 ? Math.round(stored) : 300;
    setPpi(next);
    setCustomPpi(String(next));
    setPpiError('');
  }, [selectedId, selected?.analysis?.resolution?.ppiX]);

  const totals = useMemo(() => ({
    all: items.length,
    gps: items.filter((item) => item.analysis?.hasGps).length,
    exif: items.filter((item) => item.analysis?.hasExif).length,
    none: items.filter((item) => item.analysis && !item.analysis.metadataEntryCount).length,
    failed: items.filter((item) => item.error).length,
  }), [items]);

  async function analyzeOne(item: Item) {
    try {
      const result = await analyzeImageFile(item.file);
      if (result.totalPixels > TOOL018_LIMITS.maxPixels) throw new Error('PIXEL_LIMIT');
      setItems((prev) => prev.map((current) => current.id === item.id ? { ...current, analysis: result, error: undefined } : current));
    } catch (error) {
      const code = error instanceof Error ? error.message : 'METADATA_ERROR';
      setItems((prev) => prev.map((current) => current.id === item.id ? { ...current, error: code } : current));
    }
  }

  async function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    if (!incoming.length) return;
    const mergedFiles = [...items.map((item) => item.file), ...incoming];
    const errors = validateTool018Files(mergedFiles);
    if (errors.length) { setGlobalError(errorText(locale, errors[0])); return; }
    setGlobalError('');
    const fresh: Item[] = incoming.map((file) => ({ id: idFor(file), file }));
    setItems((prev) => [...prev, ...fresh]);
    if (!selectedId && fresh[0]) setSelectedId(fresh[0].id);
    for (const item of fresh) await analyzeOne(item);
  }

  function removeItem(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? '');
  }

  function resetAll() { setItems([]); setSelectedId(''); setGlobalError(''); setQuery(''); setViewMode('original'); }

  async function cleanItem(id: string) {
    const current = items.find((item) => item.id === id);
    if (!current?.analysis) return;
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, cleaning: true, cleanError: undefined } : item));
    try {
      const blob = await stripPrivacyMetadata(current.file, current.analysis);
      const cleanFile = new File([blob], cleanFilename(current.file.name, current.analysis.format), { type: blob.type, lastModified: Date.now() });
      const cleanAnalysis = await analyzeImageFile(cleanFile);
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, cleaning: false, cleanBlob: blob, cleanAnalysis } : item));
      if (id === selectedId) setViewMode('clean');
    } catch {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, cleaning: false, cleanError: 'CLEAN_ERROR' } : item));
    }
  }

  async function cleanAll() {
    for (const item of items) if (item.analysis && !item.error) await cleanItem(item.id);
  }

  async function downloadZip() {
    const clean = items.filter((item) => item.cleanBlob);
    if (!clean.length) return;
    try {
      const names = uniqueNames(clean.map((item) => cleanFilename(item.file.name, item.analysis?.format)));
      const blob = await createStoredZip(clean.map((item, index) => ({ name: names[index], blob: item.cleanBlob! })));
      if (!downloadBlob(blob, 'metadata-clean-images.zip')) setGlobalError(t.errors.download);
    } catch { setGlobalError(t.errors.zip); }
  }

  const print = analysis ? estimatedPrintSize(analysis.width, analysis.height, ppi) : undefined;
  const filteredEntries = useMemo(() => {
    const entries = analysis?.entries ?? [];
    const q = query.trim().toLocaleLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => `${entry.group} ${entry.label} ${entry.tag} ${entry.value}`.toLocaleLowerCase().includes(q));
  }, [analysis, query]);
  const groups = useMemo(() => {
    const map = new Map<string, MetadataEntry[]>();
    for (const entry of filteredEntries) map.set(entry.group, [...(map.get(entry.group) ?? []), entry]);
    return [...map.entries()];
  }, [filteredEntries]);

  const anyCapture = Boolean(analysis && (analysis.dateTaken || analysis.fileModified || analysis.make || analysis.model || analysis.lensModel || analysis.lensSpecification || analysis.iso != null || analysis.exposureTime != null || analysis.fNumber != null || analysis.focalLength != null || analysis.meteringMode || analysis.software));
  const removalComplete = selected?.cleanAnalysis && !selected.cleanAnalysis.hasGps && !selected.cleanAnalysis.dateTaken && !selected.cleanAnalysis.make && !selected.cleanAnalysis.model && !selected.cleanAnalysis.lensModel && !selected.cleanAnalysis.artist && !selected.cleanAnalysis.copyright && !selected.cleanAnalysis.software && !selected.cleanAnalysis.hasXmp && !selected.cleanAnalysis.hasIptc;

  const handleExternalDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    event.preventDefault();
    setDrag(true);
  };
  const handleExternalDragOver = (event: DragEvent<HTMLElement>) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    event.preventDefault();
    setDrag(true);
  };
  const handleExternalDragLeave = (event: DragEvent<HTMLElement>) => {
    const related = event.relatedTarget;
    if (related instanceof Node && event.currentTarget.contains(related)) return;
    setDrag(false);
  };
  const handleExternalDrop = (event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.files.length) return;
    event.preventDefault();
    event.stopPropagation();
    setDrag(false);
    void addFiles(event.dataTransfer.files);
  };

  return <div className="toolbox-tool-workflow" data-testid="tool018-root">
    <section
      className="toolbox-workbench"
      onDragEnter={handleExternalDragEnter}
      onDragOver={handleExternalDragOver}
      onDragLeave={handleExternalDragLeave}
      onDrop={handleExternalDrop}
    >
      <div
        className={`toolbox-workbench-upload ${drag ? 'is-dragging' : ''}`}
        data-testid="tool018-dropzone"
      >
        <div className="toolbox-workbench-topline">
          <div><span>WORKSPACE</span><strong>{t.title}</strong></div>
        </div>
        <StableMobileImageFileInput mobileCaptureMode="original" ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple hidden data-testid="tool018-input" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) void addFiles(event.target.files); event.currentTarget.value = ''; }}/>
        {items.length === 0 ? (
          <div className="toolbox-upload-focus">
            <span className="toolbox-upload-icon" aria-hidden="true">＋</span>
            <h2>{t.drop}</h2>
            <p>{t.intro}</p>
            <button type="button" onClick={() => inputRef.current?.click()}>{t.select}</button>
            <small>{t.support}</small>
          </div>
        ) : (
          <div className="toolbox-upload-active" data-testid="tool018-batch-summary">
            <div className="toolbox-upload-active-head">
              <div><span>{t.selected}</span><p>{t.support}</p></div>
              <div className="toolbox-upload-active-actions">
                <div className="toolbox-file-stats"><span>{totals.all} {t.total}</span><span>{totals.gps} {t.gpsFiles}</span><span>{totals.failed} {t.failed}</span></div>
                <button type="button" onClick={() => inputRef.current?.click()}>＋ {t.add}</button>
                <button type="button" className={styles.resetButton} onClick={resetAll}>{t.clear}</button>
              </div>
            </div>
            <div className={styles.summaryGrid}><div><strong>{totals.all}</strong><span>{t.total}</span></div><div><strong>{totals.gps}</strong><span>{t.gpsFiles}</span></div><div><strong>{totals.exif}</strong><span>{t.exifFiles}</span></div><div><strong>{totals.none}</strong><span>{t.noMetadata}</span></div><div><strong>{totals.failed}</strong><span>{t.failed}</span></div></div>
            <div className={styles.fileList}>{items.map((item) => <article key={item.id} className={`${styles.fileItem} ${selected?.id === item.id ? styles.activeFile : ''}`} data-testid="tool018-file-item">
              <button type="button" className={styles.fileSelect} onClick={() => setSelectedId(item.id)}><strong>{item.file.name}</strong><span>{item.analysis ? `${item.analysis.width}×${item.analysis.height} · ${item.analysis.formatLabel}` : item.error ? errorText(locale, item.error) : t.analyzing}</span></button>
              <div className={styles.fileFlags}>{item.analysis && <><span>{item.cleaning ? t.removing : item.cleanError ? t.cleanFailed : item.cleanAnalysis ? t.cleanComplete : t.waiting}</span><span>EXIF {item.analysis.hasExif ? t.found : t.none}</span><span>GPS {item.analysis.hasGps ? t.found : t.none}</span></>}<button type="button" aria-label={t.removeFile} onClick={() => removeItem(item.id)}>×</button></div>
            </article>)}</div>
          </div>
        )}
        <p className={styles.localNote}>{t.local}</p>
      </div>

      <div className={`${styles.content} ${items.length === 0 && !globalError ? styles.contentEmpty : ''} ${drag ? styles.contentDragging : ''}`}>
        {globalError && <p className={styles.error} role="alert">{globalError}</p>}

    {selected?.error && <section className={styles.stepCard}><p className={styles.error} role="alert">{errorText(locale, selected.error)}</p><button type="button" className={styles.secondary} onClick={() => void analyzeOne(selected)}>{t.retry}</button></section>}

    {analysis && selected && <>
      <section className={styles.workspace} data-testid="tool018-result">
        <div className={styles.previewCard}>
          <div className={styles.sectionTitle}><div><span>PREVIEW</span><h3>{t.preview}</h3></div>{selected.cleanBlob && <div className={styles.segment}><button className={viewMode === 'original' ? styles.activeSegment : ''} onClick={() => setViewMode('original')}>{t.originalPreview}</button><button className={viewMode === 'clean' ? styles.activeSegment : ''} onClick={() => setViewMode('clean')}>{t.cleanPreview}</button></div>}</div>
          <div className={`${styles.previewWrap} ${analysis.hasAlpha ? styles.checker : ''}`}>{previewUrl ? <img src={previewUrl} alt=""/> : <span>{t.noPreview}</span>}</div>
          <p className={styles.previewName}>{analysis.name}</p>
        </div>

        <div className={styles.compactStack}>
          <article className={`${styles.privacyCard} ${styles.compactCard}`} data-testid="tool018-privacy-summary">
            <div className={styles.sectionTitle}><div><span>PRIVACY</span><h3>{t.privacy}</h3></div></div>
            <div className={styles.privacyGrid}>
              <StatusPill value={t.location} found={analysis.hasGps} labels={t}/>
              <StatusPill value={t.taken} found={Boolean(analysis.dateTaken)} labels={t}/>
              <StatusPill value={t.camera} found={Boolean(analysis.make || analysis.model || analysis.lensModel)} labels={t}/>
              <StatusPill value={t.author} found={Boolean(analysis.artist)} labels={t}/>
              <StatusPill value={t.copyright} found={Boolean(analysis.copyright)} labels={t}/><StatusPill value={t.softwareInfo} found={Boolean(analysis.software)} labels={t}/>
            </div>
            {analysis.hasGps && <p className={styles.warning} data-testid="tool018-gps-warning">{t.gpsWarn}</p>}
            {analysis.extensionMismatch && <p className={styles.warning}>{t.actualMismatch}</p>}
            {analysis.warnings.length > 0 && <p className={styles.warning}>{analysis.warnings.join(' · ')}</p>}
          </article>

          <article className={`${styles.stepCard} ${styles.compactCard}`} data-testid="tool018-print-info"><div className={styles.sectionTitle}><div><span>02</span><h3>{t.print}</h3></div></div>
            <div className={styles.resolutionBox}><span>{t.storedPpi}</span><strong>{analysis.resolution?.ppiX ? `${analysis.resolution.ppiX.toFixed(2)} × ${(analysis.resolution.ppiY ?? analysis.resolution.ppiX).toFixed(2)} PPI` : t.noPpi}</strong>{analysis.resolution && <small>{analysis.resolution.source}</small>}</div>
            <div className={styles.ppiControls}><span>{t.calcPpi}</span><div className={styles.ppiPresets}>{[72,96,150,200,300].map((value) => <button key={value} className={ppi === value ? styles.activeSegment : ''} onClick={() => { setPpi(value); setCustomPpi(String(value)); setPpiError(''); }}>{value}</button>)}<label><span>{t.custom}</span><input data-testid="tool018-custom-ppi" type="number" min="1" max="2400" value={customPpi} onChange={(event: ChangeEvent<HTMLInputElement>) => { const raw = event.target.value; setCustomPpi(raw); const next = Number(raw); if (raw !== '' && Number.isFinite(next) && next >= 1 && next <= 2400) { setPpi(next); setPpiError(''); } else setPpiError(t.ppiInvalid); }}/></label></div>{ppiError && <p className={styles.error} role="alert">{ppiError}</p>}</div>
            {print && <div className={styles.printResult} data-testid="tool018-print-size"><span>{ppi} PPI · {t.printSize}</span><strong>{print.widthCm.toFixed(2)} × {print.heightCm.toFixed(2)} cm</strong><b>{print.widthIn.toFixed(2)} × {print.heightIn.toFixed(2)} in</b></div>}
            <p className={styles.muted}>{t.ppiNote}</p>
          </article>

          <article className={`${styles.stepCard} ${styles.compactCard}`} data-testid="tool018-gps-info"><div className={styles.sectionTitle}><div><span>04</span><h3>{t.gps}</h3></div></div>{analysis.hasGps && analysis.gps ? <><dl><InfoRow label={t.lat} value={analysis.gps.latitude != null ? analysis.gps.latitude.toFixed(8) : undefined}/><InfoRow label={t.lng} value={analysis.gps.longitude != null ? analysis.gps.longitude.toFixed(8) : undefined}/><InfoRow label={t.altitude} value={analysis.gps.altitude != null ? `${analysis.gps.altitude.toFixed(2)} m` : undefined}/><InfoRow label={t.gpsDate} value={analysis.gps.date}/><InfoRow label={t.gpsTime} value={analysis.gps.time}/><InfoRow label={t.direction} value={analysis.gps.direction != null ? `${analysis.gps.direction.toFixed(2)}°` : undefined}/></dl>{analysis.gps.latitude != null && analysis.gps.longitude != null && <div className={styles.mapRow}><button type="button" className={styles.secondary} onClick={() => window.open(`https://www.google.com/maps?q=${encodeURIComponent(`${analysis.gps!.latitude},${analysis.gps!.longitude}`)}`, '_blank', 'noopener,noreferrer')}>{t.map}</button><span>{t.mapNote}</span></div>}</> : <p className={styles.emptyText}>{t.noGps}</p>}</article>
        </div>
      </section>

      <section className={styles.detailStack}>
        <article className={styles.stepCard} data-testid="tool018-basic-info"><div className={styles.sectionTitle}><div><span>01</span><h3>{t.basic}</h3></div></div><dl>
          <InfoRow label={t.fileName} value={analysis.name}/><InfoRow label={t.format} value={analysis.formatLabel}/><InfoRow label={t.mime} value={analysis.mime}/><InfoRow label={t.size} value={formatBytes(analysis.size)}/><InfoRow label={t.resolution} value={`${analysis.width.toLocaleString()} × ${analysis.height.toLocaleString()} px`}/><InfoRow label={t.pixels} value={`${analysis.totalPixels.toLocaleString()} px`}/><InfoRow label={t.mp} value={`${analysis.megapixels.toFixed(2)} MP`}/><InfoRow label={t.ratio} value={analysis.aspectRatio}/><InfoRow label={t.orientation} value={analysis.orientation === 'landscape' ? t.landscape : analysis.orientation === 'portrait' ? t.portrait : analysis.orientation === 'square' ? t.square : '—'}/><InfoRow label={t.pixelOrientation} value={analysis.pixelOrientation === 'landscape' ? t.landscape : analysis.pixelOrientation === 'portrait' ? t.portrait : analysis.pixelOrientation === 'square' ? t.square : '—'}/><InfoRow label={t.exifOrientation} value={analysis.exifOrientation}/><InfoRow label={t.alpha} value={analysis.hasAlpha ? t.possible : t.notPossible}/>
        </dl></article>

        <article className={styles.stepCard} data-testid="tool018-camera-info"><div className={styles.sectionTitle}><div><span>03</span><h3>{t.capture}</h3></div></div>{anyCapture ? <dl>
          <InfoRow label={t.dateTaken} value={analysis.dateTaken}/><InfoRow label={t.fileModified} value={analysis.fileModified}/><InfoRow label={t.make} value={analysis.make}/><InfoRow label={t.model} value={analysis.model}/><InfoRow label={t.lens} value={[analysis.lensMake, analysis.lensModel].filter(Boolean).join(' ')}/><InfoRow label={t.lensSpec} value={formatLensSpecification(analysis.lensSpecification)}/><InfoRow label={t.iso} value={analysis.iso != null ? `ISO ${analysis.iso}` : undefined}/><InfoRow label={t.shutter} value={formatExposureTime(analysis.exposureTime)}/><InfoRow label={t.aperture} value={analysis.fNumber != null ? `f/${analysis.fNumber}` : undefined}/><InfoRow label={t.focal} value={analysis.focalLength != null ? `${analysis.focalLength} mm` : undefined}/><InfoRow label={t.focal35} value={analysis.focalLength35mm != null ? `${analysis.focalLength35mm} mm` : undefined}/><InfoRow label={t.exposure} value={analysis.exposureBias != null ? `${analysis.exposureBias > 0 ? '+' : ''}${analysis.exposureBias} EV` : undefined}/><InfoRow label={t.flash} value={analysis.flash}/><InfoRow label={t.wb} value={analysis.whiteBalance}/><InfoRow label={t.metering} value={analysis.meteringMode}/><InfoRow label={t.software} value={analysis.software}/>
        </dl> : <p className={styles.emptyText}>{t.noCapture}</p>}</article>
      </section>

      <section className={styles.stepCard} data-testid="tool018-metadata-details"><div className={styles.metadataHead}><div className={styles.sectionTitle}><div><span>05</span><h3>{t.metadata}</h3></div><strong>{analysis.metadataEntryCount} {t.metadataCount}</strong></div><div className={styles.metadataActions}><button type="button" className={styles.secondary} aria-expanded={metadataOpen} onClick={() => setMetadataOpen((value) => !value)}>{metadataOpen ? t.hideMetadata : t.showMetadata}</button>{metadataOpen && <><input value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search}/><button type="button" className={styles.secondary} onClick={async () => { try { await navigator.clipboard.writeText(JSON.stringify(metadataJson(analysis), null, 2)); setCopyState(t.copied); setTimeout(() => setCopyState(''), 1800); } catch { setGlobalError(t.errors.clipboard); } }}>{t.copyJson}</button></>}</div>{copyState && <p className={styles.status} aria-live="polite">{copyState}</p>}</div>
        {metadataOpen ? (groups.length ? <div className={styles.metadataGroups}>{groups.map(([group, entries]) => <details key={group}><summary>{group}<span>{entries.length}</span></summary><div className={styles.metadataList}>{entries.map((entry, index) => <div className={styles.metadataRow} key={`${entry.tag}-${index}`}><div><strong>{entry.label}</strong><small>{t.rawTag}: {entry.tag}</small></div><div className={styles.metadataValue}><p>{entry.value || '—'}</p><button type="button" className={styles.metadataCopy} aria-label={`${t.copyValue}: ${entry.label}`} onClick={async () => { try { await navigator.clipboard.writeText(entry.value || ''); setCopyState(t.copied); setTimeout(() => setCopyState(''), 1800); } catch { setGlobalError(t.errors.clipboard); } }}>{t.copyValue}</button></div></div>)}</div></details>)}</div> : <p className={styles.emptyText}>{query ? t.noMatch : t.noMetadata}</p>) : <p className={styles.muted}>{t.showMetadata}</p>}
      </section>

      <section className={styles.stepCard} data-testid="tool018-removal"><div className={styles.sectionTitle}><div><span>06</span><h3>{t.remove}</h3></div></div><p className={styles.removeDesc}>{t.removeDesc}</p>
        <div className={`${styles.actions} toolbox-workbench-actions`}><button type="button" className={`${styles.primary} toolbox-primary-action`} data-testid="tool018-remove-metadata" disabled={selected.cleaning} onClick={() => void cleanItem(selected.id)}>{selected.cleaning ? t.removing : t.removeOne}</button>{items.length > 1 && <button type="button" className={styles.secondary} data-testid="tool018-remove-all" onClick={() => void cleanAll()}>{t.removeAll}</button>}{items.some((item) => item.cleanBlob) && <button type="button" className={styles.secondary} data-testid="tool018-download-zip" onClick={() => void downloadZip()}>{t.zip}</button>}</div>
        {selected.cleanError && <p className={styles.error}>{t.errors.clean}</p>}
        {selected.cleanAnalysis && selected.cleanBlob && <div className={styles.compareCard} data-testid="tool018-removal-result"><div className={styles.compareTitle}><strong>{t.compare}</strong><span className={removalComplete ? styles.successText : styles.warningText}>{removalComplete ? t.removed : t.partial}</span></div><div className={styles.compareGrid}>
          <div><span>{t.gpsState}</span><strong>{selected.analysis?.hasGps ? t.found : t.none} → {selected.cleanAnalysis.hasGps ? t.found : t.none}</strong></div><div><span>{t.exif}</span><strong>{selected.analysis?.hasExif ? t.found : t.none} → {selected.cleanAnalysis.hasExif ? t.found : t.none}</strong></div><div><span>{t.imageSize}</span><strong>{selected.analysis?.width}×{selected.analysis?.height} → {selected.cleanAnalysis.width}×{selected.cleanAnalysis.height}</strong></div><div><span>{t.fileSize}</span><strong>{formatBytes(selected.file.size)} → {formatBytes(selected.cleanBlob.size)}</strong></div>
        </div><div className={`${styles.actions} toolbox-workbench-actions`}><button type="button" className={`${styles.primary} toolbox-primary-action`} data-testid="tool018-download-clean" onClick={() => { if (!downloadBlob(selected.cleanBlob!, cleanFilename(selected.file.name, selected.analysis?.format))) setGlobalError(t.errors.download); }}>{t.download}</button></div></div>}
      </section>
    </>}

    <div data-testid="tool018-state" hidden data-files={items.length} data-gps={totals.gps} data-exif={totals.exif} data-selected={selected?.id ?? ''} data-ready={analysis ? '1' : '0'} data-clean={selected?.cleanAnalysis ? '1' : '0'} data-original-gps={selected?.analysis?.hasGps ? '1' : '0'} data-clean-gps={selected?.cleanAnalysis ? (selected.cleanAnalysis.hasGps ? '1' : '0') : ''} data-original-exif={selected?.analysis?.hasExif ? '1' : '0'} data-clean-exif={selected?.cleanAnalysis ? (selected.cleanAnalysis.hasExif ? '1' : '0') : ''} data-original-exif-orientation={selected?.analysis?.exifOrientation ?? ''} data-clean-exif-orientation={selected?.cleanAnalysis?.exifOrientation ?? ''} data-original-icc={selected?.analysis?.hasIcc ? '1' : '0'} data-clean-icc={selected?.cleanAnalysis ? (selected.cleanAnalysis.hasIcc ? '1' : '0') : ''} data-original-xmp={selected?.analysis?.hasXmp ? '1' : '0'} data-clean-xmp={selected?.cleanAnalysis ? (selected.cleanAnalysis.hasXmp ? '1' : '0') : ''} data-max-files={TOOL018_LIMITS.maxFiles} data-max-file-bytes={TOOL018_LIMITS.maxFileBytes} data-max-total-bytes={TOOL018_LIMITS.maxTotalBytes} data-max-pixels={TOOL018_LIMITS.maxPixels}/>
      </div>
    </section>
  </div>;
}
