"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StableMobileImageFileInput } from "@/components/stable-mobile-image-file-input";
import styles from "./app-store-screenshot-maker-tool.module.css";
import { createStoredZip } from "@/lib/zip";
import type { Locale } from "@/lib/site";
import { TOOL024_PRESETS, TOOL024_SERVICE_LIMITS, type Tool024StorePreset } from "@/lib/tool-024-store-policy";

type OutputFormat = "png" | "jpg";
type FitMode = "contain" | "cover";
type TextAlign = "left" | "center" | "right";
type Language = "ko" | "en" | "ja";
type BackgroundMode = "solid" | "gradient";
type SlideText = Record<Language, { title: string; description: string }>;
type Slide = {
  id: string;
  fileName: string;
  image: HTMLImageElement;
  url: string;
  width: number;
  height: number;
  bytes: number;
  zoom: number;
  x: number;
  y: number;
  text: SlideText;
};
type ExportFailure = { slideIndex: number; language: Language; presetId: string; reason: string };

const PRESETS = TOOL024_PRESETS;
const LIMITS = TOOL024_SERVICE_LIMITS;

const copy = {
  ko: {
    drop: "앱 스크린샷을 이 영역으로 끌어다 놓거나 파일을 선택하세요.", select: "스크린샷 선택", local: "이미지는 서버로 전송되지 않고 현재 브라우저에서만 처리됩니다.", slides: "화면 목록", add: "이미지 추가", duplicate: "복제", remove: "삭제", up: "앞으로", down: "뒤로", empty: "먼저 실제 앱 스크린샷을 추가하세요.", design: "공통 디자인", bg: "배경색", bgMode: "배경 방식", solid: "단색", gradient: "그라데이션", bg2: "두 번째 배경색", gradientAngle: "그라데이션 각도", titleY: "제목 세로 위치", descY: "설명 세로 위치", frame: "휴대폰 프레임", fit: "화면 맞춤", contain: "전체 표시", cover: "채우기", zoom: "확대·축소", posX: "가로 위치", posY: "세로 위치", title: "제목", desc: "설명", align: "정렬", left: "왼쪽", center: "가운데", right: "오른쪽", titleSize: "제목 크기", descSize: "설명 크기", textColor: "글자색", copy: "스토어 문구", languages: "언어 버전", presets: "출력 규격", preview: "미리보기", export: "출력 설정", format: "파일 형식", current: "현재 이미지 다운로드", zip: "선택 결과 ZIP 다운로드", reset: "전체 초기화", progress: "생성 진행", frameGoogle: "Google Play는 기기 이미지 사용을 피하도록 권장하므로 프레임 기본값이 OFF입니다.", appleFrame: "App Store 프레임은 실제 캡처 기기 유형과 모순되지 않도록 확인하세요.", tagline20: "Google Play에서는 추가 문구 영역을 이미지의 약 20% 이내로 유지하는 것을 권장합니다.", safeText: "제목과 설명은 바깥쪽 안전여백 안에서 배치됩니다.", first3: "첫 1~3장에는 핵심 기능을 우선 배치하세요.", count: "예상 결과", overflow: "문구가 길어 결과에서 잘릴 수 있습니다.", noPreset: "최소 1개 출력 규격을 선택하세요.", noLang: "최소 1개 언어를 선택하세요.", maxFiles: "최대 10장까지 추가할 수 있습니다.", badFile: "JPG·PNG·WebP 정적 이미지만 사용할 수 있습니다.", tooLarge: "파일이 서비스 유효상한을 초과했습니다.", ready: "출력 준비 완료", failed: "일부 결과 생성에 실패했습니다.", apple: "App Store", google: "Google Play", selected: "선택됨", slide: "화면", langKo: "한국어", langEn: "English", langJa: "日本語", noStretch: "No Stretch · 원본 비율 유지", partial: "한 결과가 실패해도 성공한 결과는 유지합니다." },
  en: {
    drop: "Drop app screenshots here or choose files.", select: "Choose screenshots", local: "Images stay in this browser and are not uploaded to a server.", slides: "Screenshots", add: "Add images", duplicate: "Duplicate", remove: "Delete", up: "Move up", down: "Move down", empty: "Add real app screenshots first.", design: "Shared design", bg: "Background", bgMode: "Background style", solid: "Solid", gradient: "Gradient", bg2: "Second background", gradientAngle: "Gradient angle", titleY: "Title vertical position", descY: "Description vertical position", frame: "Phone frame", fit: "Screen fit", contain: "Contain", cover: "Cover", zoom: "Zoom", posX: "Horizontal position", posY: "Vertical position", title: "Title", desc: "Description", align: "Alignment", left: "Left", center: "Center", right: "Right", titleSize: "Title size", descSize: "Description size", textColor: "Text color", copy: "Store copy", languages: "Language versions", presets: "Output presets", preview: "Preview", export: "Export", format: "File format", current: "Download current", zip: "Download selected ZIP", reset: "Reset all", progress: "Export progress", frameGoogle: "Google Play recommends avoiding device imagery, so the frame is OFF by default.", appleFrame: "For App Store exports, make sure the frame does not conflict with the device type actually captured.", tagline20: "For Google Play, keep additional tagline copy to roughly 20% of the image or less.", safeText: "Title and description stay inside the outer text-safe margin.", first3: "Put the most important features in screenshots 1–3.", count: "Expected results", overflow: "This copy may overflow in the final result.", noPreset: "Select at least one output preset.", noLang: "Select at least one language.", maxFiles: "You can add up to 10 screenshots.", badFile: "Use static JPG, PNG, or WebP images.", tooLarge: "This file exceeds the service limit.", ready: "Ready to export", failed: "Some results failed to render.", apple: "App Store", google: "Google Play", selected: "Selected", slide: "Slide", langKo: "한국어", langEn: "English", langJa: "日本語", noStretch: "No Stretch · source aspect ratio preserved", partial: "Successful outputs are kept even if one result fails." },
  ja: {
    drop: "アプリのスクリーンショットをここにドロップするか、ファイルを選択してください。", select: "スクリーンショット選択", local: "画像はサーバーへ送信されず、このブラウザ内でのみ処理されます。", slides: "画面一覧", add: "画像追加", duplicate: "複製", remove: "削除", up: "前へ", down: "後ろへ", empty: "まず実際のアプリスクリーンショットを追加してください。", design: "共通デザイン", bg: "背景色", bgMode: "背景方式", solid: "単色", gradient: "グラデーション", bg2: "2番目の背景色", gradientAngle: "グラデーション角度", titleY: "タイトル縦位置", descY: "説明縦位置", frame: "端末フレーム", fit: "画面フィット", contain: "全体表示", cover: "塗りつぶし", zoom: "拡大・縮小", posX: "横位置", posY: "縦位置", title: "タイトル", desc: "説明", align: "整列", left: "左", center: "中央", right: "右", titleSize: "タイトルサイズ", descSize: "説明サイズ", textColor: "文字色", copy: "ストア文言", languages: "言語版", presets: "出力規格", preview: "プレビュー", export: "出力設定", format: "ファイル形式", current: "現在の画像を保存", zip: "選択結果をZIP保存", reset: "全体リセット", progress: "生成進行", frameGoogle: "Google Playでは端末画像を避けることが推奨されるため、フレームは初期OFFです。", appleFrame: "App Store用フレームは、実際にキャプチャした端末種類と矛盾しないか確認してください。", tagline20: "Google Playでは追加コピー領域を画像のおよそ20%以内に保つことが推奨されます。", safeText: "タイトルと説明は外側のテキスト安全余白内に配置されます。", first3: "最初の1〜3枚には主要機能を優先して配置してください。", count: "予想結果数", overflow: "文章が長く、結果で切れる可能性があります。", noPreset: "出力規格を1つ以上選択してください。", noLang: "言語を1つ以上選択してください。", maxFiles: "最大10枚まで追加できます。", badFile: "静止画JPG・PNG・WebPのみ使用できます。", tooLarge: "ファイルがサービス上限を超えています。", ready: "出力準備完了", failed: "一部の結果生成に失敗しました。", apple: "App Store", google: "Google Play", selected: "選択中", slide: "画面", langKo: "한국어", langEn: "English", langJa: "日本語", noStretch: "No Stretch · 元画像比率を維持", partial: "1件失敗しても成功した結果は保持します。" },
} as const;

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function defaultText(): SlideText { return { ko: { title: "", description: "" }, en: { title: "", description: "" }, ja: { title: "", description: "" } }; }
function safeBase(name: string) { return name.replace(/\.[^.]+$/, "").replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-+|-+$/g, "") || "screenshot"; }
function triggerDownload(blob: Blob, fileName: string) { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500); }

async function validateImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, Math.min(file.size, 262144)).arrayBuffer());
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  const isWebp = bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  const mimeMatches = file.type === "image/jpeg" ? isJpeg : file.type === "image/png" ? isPng : file.type === "image/webp" ? isWebp : false;
  if (!mimeMatches) throw new Error("bad-type");
  if (isPng) {
    for (let i = 8; i + 8 <= bytes.length; i++) {
      if (bytes[i] === 0x61 && bytes[i + 1] === 0x63 && bytes[i + 2] === 0x54 && bytes[i + 3] === 0x4c) throw new Error("animated");
    }
  }
  if (isWebp && bytes.length > 20) {
    const chunk = String.fromCharCode(...bytes.slice(12, 16));
    if (chunk === "VP8X" && (bytes[20] & 0x02) !== 0) throw new Error("animated");
  }
}

async function loadImage(file: File) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("bad-type");
  if (file.size > LIMITS.maxFileBytes) throw new Error("too-large");
  await validateImageSignature(file);
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.decoding = "async"; image.src = url;
    await image.decode();
    if (image.naturalWidth * image.naturalHeight > LIMITS.maxPixels) throw new Error("too-large");
    return { image, url, width: image.naturalWidth, height: image.naturalHeight };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export function AppStoreScreenshotMakerTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeId, setActiveId] = useState("");
  const [selectedPresets, setSelectedPresets] = useState<string[]>(["google-phone-p"]);
  const [activePresetId, setActivePresetId] = useState("google-phone-p");
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("solid");
  const [background, setBackground] = useState("#f7f7f5");
  const [background2, setBackground2] = useState("#dfefff");
  const [gradientAngle, setGradientAngle] = useState(135);
  const [textColor, setTextColor] = useState("#111111");
  const [titleSize, setTitleSize] = useState(0.075);
  const [descriptionSize, setDescriptionSize] = useState(0.035);
  const [titleY, setTitleY] = useState(0.055);
  const [descriptionY, setDescriptionY] = useState(0.145);
  const [align, setAlign] = useState<TextAlign>("center");
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [frameEnabled, setFrameEnabled] = useState(false);
  const [format, setFormat] = useState<OutputFormat>("png");
  const [dragging, setDragging] = useState(false);
  const [workspaceDragging, setWorkspaceDragging] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [exportFailures, setExportFailures] = useState<ExportFailure[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slidesRef = useRef<Slide[]>([]);

  const activeSlide = slides.find((s) => s.id === activeId) ?? slides[0];
  const activePreset = PRESETS.find((p) => p.id === activePresetId) ?? PRESETS[0];
  const hasSlides = slides.length > 0;

  useEffect(() => { setFrameEnabled(activePreset.frameDefault); }, [activePreset.id]);
  useEffect(() => { if (!activeId && slides[0]) setActiveId(slides[0].id); }, [activeId, slides]);
  useEffect(() => { slidesRef.current = slides; }, [slides]);
  useEffect(() => () => { Array.from(new Set(slidesRef.current.map((s) => s.url))).forEach((url) => URL.revokeObjectURL(url)); }, []);

  const updateActive = useCallback((patch: Partial<Slide>) => {
    if (!activeSlide) return;
    setSlides((prev) => prev.map((s) => s.id === activeSlide.id ? { ...s, ...patch } : s));
  }, [activeSlide]);

  const contentLanguage = locale as Language;

  const updateText = useCallback((field: "title" | "description", value: string) => {
    if (!activeSlide) return;
    setSlides((prev) => prev.map((s) => s.id === activeSlide.id ? { ...s, text: { ...s.text, [contentLanguage]: { ...s.text[contentLanguage], [field]: value } } } : s));
  }, [activeSlide, contentLanguage]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const currentBytes = slides.reduce((sum, slide) => sum + slide.bytes, 0);
    const slots = Math.max(0, LIMITS.maxFiles - slides.length);
    const requested = Array.from(files);
    const exceededCount = requested.length > slots;
    const incoming = requested.slice(0, slots);
    if (currentBytes + incoming.reduce((sum, file) => sum + file.size, 0) > LIMITS.maxTotalBytes) { setStatus(t.tooLarge); return; }
    if (!incoming.length) { setStatus(t.maxFiles); return; }
    const added: Slide[] = [];
    for (const file of incoming) {
      try {
        const loaded = await loadImage(file);
        added.push({ id: uid(), fileName: file.name, ...loaded, zoom: 1, x: 0, y: 0, text: defaultText(), bytes: file.size });
      } catch (error) { setStatus(error instanceof Error && error.message === "too-large" ? t.tooLarge : t.badFile); }
    }
    if (added.length) {
      setSlides((prev) => [...prev, ...added]);
      setActiveId((current) => current || added[0].id);
      setStatus(exceededCount ? t.maxFiles : "");
    }
  }, [slides, t]);

  const move = (id: string, delta: number) => setSlides((prev) => { const index = prev.findIndex((s) => s.id === id); const next = index + delta; if (index < 0 || next < 0 || next >= prev.length) return prev; const clone = [...prev]; [clone[index], clone[next]] = [clone[next], clone[index]]; return clone; });
  const duplicate = (slide: Slide) => { if (slides.length >= LIMITS.maxFiles) { setStatus(t.maxFiles); return; } const clone = { ...slide, id: uid(), text: JSON.parse(JSON.stringify(slide.text)) as SlideText }; setSlides((prev) => [...prev, clone]); setActiveId(clone.id); };
  const remove = (id: string) => setSlides((prev) => { const target = prev.find((s) => s.id === id); const next = prev.filter((s) => s.id !== id); if (target && !next.some((s) => s.url === target.url)) URL.revokeObjectURL(target.url); if (activeId === id) setActiveId(next[0]?.id ?? ""); return next; });

  const render = useCallback(async (slide: Slide, preset: Tool024StorePreset, language: Language): Promise<Blob> => {
    const canvas = document.createElement("canvas"); canvas.width = preset.width; canvas.height = preset.height;
    const ctx = canvas.getContext("2d", { alpha: false }); if (!ctx) throw new Error("canvas");
    if (backgroundMode === "gradient") {
      const rad = (gradientAngle * Math.PI) / 180;
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const len = Math.abs(canvas.width * Math.cos(rad)) + Math.abs(canvas.height * Math.sin(rad));
      const x0 = cx - Math.cos(rad) * len / 2, y0 = cy - Math.sin(rad) * len / 2;
      const x1 = cx + Math.cos(rad) * len / 2, y1 = cy + Math.sin(rad) * len / 2;
      const gradient = ctx.createLinearGradient(x0, y0, x1, y1); gradient.addColorStop(0, background); gradient.addColorStop(1, background2); ctx.fillStyle = gradient;
    } else ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const portrait = preset.height >= preset.width;
    const headerH = Math.round(preset.height * (portrait ? 0.23 : 0.28));
    const margin = Math.round(Math.min(preset.width, preset.height) * 0.07);
    const screenX = margin; const screenY = headerH; const screenW = preset.width - margin * 2; const screenH = preset.height - headerH - margin;
    const radius = Math.round(Math.min(screenW, screenH) * 0.055);
    ctx.save();
    if (frameEnabled) {
      ctx.fillStyle = "#111111"; roundRect(ctx, screenX, screenY, screenW, screenH, radius); ctx.fill();
    }
    const inset = frameEnabled ? Math.max(8, Math.round(Math.min(screenW, screenH) * 0.018)) : 0;
    const ix = screenX + inset, iy = screenY + inset, iw = screenW - inset * 2, ih = screenH - inset * 2;
    roundRect(ctx, ix, iy, iw, ih, Math.max(0, radius - inset)); ctx.clip();
    const baseScale = fitMode === "contain" ? Math.min(iw / slide.width, ih / slide.height) : Math.max(iw / slide.width, ih / slide.height);
    const scale = baseScale * slide.zoom;
    const dw = slide.width * scale, dh = slide.height * scale;
    const dx = ix + (iw - dw) / 2 + slide.x * iw * 0.35;
    const dy = iy + (ih - dh) / 2 + slide.y * ih * 0.35;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(ix, iy, iw, ih); ctx.drawImage(slide.image, dx, dy, dw, dh);
    ctx.restore();
    const text = slide.text[language];
    const tx = align === "left" ? margin : align === "right" ? preset.width - margin : preset.width / 2;
    ctx.textAlign = align; ctx.textBaseline = "top"; ctx.fillStyle = textColor;
    ctx.font = `700 ${Math.round(preset.width * titleSize)}px Arial, sans-serif`;
    drawWrapped(ctx, text.title, tx, Math.round(preset.height * titleY), preset.width - margin * 2, Math.round(preset.width * titleSize * 1.15), 2);
    ctx.font = `400 ${Math.round(preset.width * descriptionSize)}px Arial, sans-serif`;
    drawWrapped(ctx, text.description, tx, Math.round(preset.height * descriptionY), preset.width - margin * 2, Math.round(preset.width * descriptionSize * 1.35), 2);
    const type = format === "jpg" ? "image/jpeg" : "image/png";
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("blob")), type, format === "jpg" ? 0.92 : undefined));
  }, [backgroundMode, background, background2, gradientAngle, textColor, titleSize, descriptionSize, titleY, descriptionY, align, fitMode, frameEnabled, format]);

  useEffect(() => {
    if (!activeSlide || !canvasRef.current) return;
    render(activeSlide, activePreset, contentLanguage).then(async (blob) => {
      const bitmap = await createImageBitmap(blob); const canvas = canvasRef.current; if (!canvas) return;
      const maxW = 520, maxH = 540; const scale = Math.min(maxW / bitmap.width, maxH / bitmap.height);
      canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext("2d"); ctx?.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
    }).catch(() => undefined);
  }, [activeSlide, activePreset, contentLanguage, render]);

  const expectedCount = slides.length * selectedPresets.length;
  const currentText = activeSlide?.text[contentLanguage];
  const overflow = !!currentText && (currentText.title.length > 42 || currentText.description.length > 90);

  const downloadCurrent = async () => {
    if (!activeSlide) return; const blob = await render(activeSlide, activePreset, contentLanguage); triggerDownload(blob, `${safeBase(activeSlide.fileName)}_${activePreset.id}.${format === "jpg" ? "jpg" : "png"}`);
  };

  const downloadZip = async () => {
    if (!slides.length) return; if (!selectedPresets.length) { setStatus(t.noPreset); return; }
    const files: Array<{ name: string; blob: Blob }> = []; const failures: ExportFailure[] = []; const total = expectedCount; setProgress({ done: 0, total }); setExportFailures([]); let done = 0;
    for (const presetId of selectedPresets) {
      const preset = PRESETS.find((p) => p.id === presetId)!;
      const language = contentLanguage;
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        try { const blob = await render(slide, preset, language); files.push({ name: `${preset.id}/${String(i + 1).padStart(2, "0")}_${safeBase(slide.fileName)}.${format === "jpg" ? "jpg" : "png"}`, blob }); }
        catch (error) { failures.push({ slideIndex: i, language, presetId: preset.id, reason: error instanceof Error ? error.message : "render" }); }
        done += 1; setProgress({ done, total }); await new Promise((r) => setTimeout(r, 0));
      }
    }
    if (failures.length) files.push({ name: "FAILED.txt", blob: new Blob([failures.map((f) => `${f.slideIndex + 1}:${f.language}:${f.presetId}:${f.reason}`).join("\n")], { type: "text/plain;charset=utf-8" }) });
    setExportFailures(failures);
    const zip = await createStoredZip(files); triggerDownload(zip, "fixlgs_app-store-screenshots.zip"); setStatus(failures.length ? t.failed : t.ready);
  };

  const retryFailures = async () => {
    if (!exportFailures.length) return;
    const recovered: Array<{ name: string; blob: Blob }> = []; const remaining: ExportFailure[] = [];
    for (const failure of exportFailures) {
      const slide = slides[failure.slideIndex]; const preset = PRESETS.find((p) => p.id === failure.presetId);
      if (!slide || !preset) { remaining.push(failure); continue; }
      try {
        const blob = await render(slide, preset, failure.language);
        recovered.push({ name: `${preset.id}/${String(failure.slideIndex + 1).padStart(2, "0")}_${safeBase(slide.fileName)}.${format === "jpg" ? "jpg" : "png"}`, blob });
      } catch (error) { remaining.push({ ...failure, reason: error instanceof Error ? error.message : "render" }); }
    }
    setExportFailures(remaining);
    if (recovered.length) { const zip = await createStoredZip(recovered); triggerDownload(zip, "fixlgs_app-store-screenshots_retry.zip"); }
    setStatus(remaining.length ? t.failed : t.ready);
  };

  const resetAll = () => { Array.from(new Set(slides.map((s) => s.url))).forEach((url) => URL.revokeObjectURL(url)); setSlides([]); setActiveId(""); setStatus(""); setProgress({ done: 0, total: 0 }); setExportFailures([]); };

  return <div className={styles.wrapper} data-testid="tool024-root">
    <div className={styles.localNote}><strong>LOCAL</strong><span>{t.local}</span></div>
    <section className={`${styles.dropzone} ${hasSlides ? styles.dropzoneReady : ""} ${(dragging || workspaceDragging) ? styles.dragging : ""}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); void addFiles(e.dataTransfer.files); }} data-testid="tool024-dropzone">
      <h2>{t.drop}</h2><p>{t.noStretch}</p><button className={styles.primary} onClick={() => inputRef.current?.click()}>{t.select}</button><StableMobileImageFileInput ref={inputRef} className={styles.hidden} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => e.currentTarget.files && void addFiles(e.currentTarget.files)} />
    </section>

    {status && <p className={styles.status} role="status">{status}</p>}

    <div className={`${styles.workspace} ${(dragging || workspaceDragging) ? styles.workspaceDragging : ""}`} data-testid="tool024-workspace-dropzone" onDragEnter={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); setWorkspaceDragging(true); } }} onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) { e.preventDefault(); setWorkspaceDragging(true); } }} onDragLeave={(e) => { const next = e.relatedTarget as Node | null; if (!next || !e.currentTarget.contains(next)) setWorkspaceDragging(false); }} onDrop={(e) => { if (!Array.from(e.dataTransfer.types).includes("Files")) return; e.preventDefault(); setWorkspaceDragging(false); void addFiles(e.dataTransfer.files); }}>
      <section className={styles.panel}>
        <div className={styles.panelHead}><div><p>01 · SLIDES</p><h3>{t.slides}</h3></div><button className={styles.secondary} onClick={() => inputRef.current?.click()}>{t.add}</button></div>
        {!slides.length ? <p className={styles.muted}>{t.empty}</p> : <div className={styles.slideList}>{slides.map((slide, index) => <article key={slide.id} className={`${styles.slideCard} ${activeSlide?.id === slide.id ? styles.activeCard : ""}`} onClick={() => setActiveId(slide.id)}>
          <img src={slide.url} alt="" /><div className={styles.slideMeta}><strong>{index + 1}. {slide.fileName}</strong><span>{slide.width}×{slide.height}</span></div>
          <div className={styles.tinyActions}><button onClick={(e) => { e.stopPropagation(); move(slide.id, -1); }} disabled={index === 0}>↑</button><button onClick={(e) => { e.stopPropagation(); move(slide.id, 1); }} disabled={index === slides.length - 1}>↓</button><button onClick={(e) => { e.stopPropagation(); duplicate(slide); }}>＋</button><button onClick={(e) => { e.stopPropagation(); remove(slide.id); }}>×</button></div>
        </article>)}</div>}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}><div><p>02 · DESIGN</p><h3>{t.design}</h3></div></div>
        <div className={styles.fieldGrid}>
          <label>{t.bgMode}<select data-testid="tool024-background-mode" value={backgroundMode} onChange={(e) => setBackgroundMode(e.target.value as BackgroundMode)}><option value="solid">{t.solid}</option><option value="gradient">{t.gradient}</option></select></label>
          <label>{t.bg}<input type="color" value={background} onChange={(e) => setBackground(e.target.value)} /></label>
          {backgroundMode === "gradient" && <><label>{t.bg2}<input type="color" value={background2} onChange={(e) => setBackground2(e.target.value)} /></label><label>{t.gradientAngle}<input type="range" min="0" max="360" step="5" value={gradientAngle} onChange={(e) => setGradientAngle(Number(e.target.value))} /></label></>}
          <label>{t.textColor}<input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} /></label>
          <label>{t.fit}<select value={fitMode} onChange={(e) => setFitMode(e.target.value as FitMode)}><option value="contain">{t.contain}</option><option value="cover">{t.cover}</option></select></label>
          <label>{t.align}<select value={align} onChange={(e) => setAlign(e.target.value as TextAlign)}><option value="left">{t.left}</option><option value="center">{t.center}</option><option value="right">{t.right}</option></select></label>
          <label>{t.titleSize}<input type="range" min="0.045" max="0.11" step="0.005" value={titleSize} onChange={(e) => setTitleSize(Number(e.target.value))} /></label>
          <label>{t.descSize}<input type="range" min="0.022" max="0.06" step="0.002" value={descriptionSize} onChange={(e) => setDescriptionSize(Number(e.target.value))} /></label>
          <label>{t.titleY}<input data-testid="tool024-title-y" type="range" min="0.025" max="0.14" step="0.005" value={titleY} onChange={(e) => setTitleY(Number(e.target.value))} /></label>
          <label>{t.descY}<input data-testid="tool024-description-y" type="range" min="0.09" max="0.22" step="0.005" value={descriptionY} onChange={(e) => setDescriptionY(Number(e.target.value))} /></label>
        </div>
        <div className={styles.segmented}><button data-testid="tool024-frame-toggle" className={frameEnabled ? styles.on : ""} onClick={() => setFrameEnabled((v) => !v)}>{t.frame}: {frameEnabled ? "ON" : "OFF"}</button></div>
        {activePreset.platform === "google" && <><p className={styles.guide}>{t.frameGoogle}</p><p className={styles.guide}>{t.tagline20}</p></>}
        {activePreset.platform === "apple" && frameEnabled && <p className={styles.guide}>{t.appleFrame}</p>}
        {activeSlide && <div className={styles.fieldGrid}>
          <label>{t.zoom}<input type="range" min="0.7" max="1.7" step="0.01" value={activeSlide.zoom} onChange={(e) => updateActive({ zoom: Number(e.target.value) })} /></label>
          <label>{t.posX}<input type="range" min="-1" max="1" step="0.01" value={activeSlide.x} onChange={(e) => updateActive({ x: Number(e.target.value) })} /></label>
          <label>{t.posY}<input type="range" min="-1" max="1" step="0.01" value={activeSlide.y} onChange={(e) => updateActive({ y: Number(e.target.value) })} /></label>
        </div>}
      </section>

      <section className={`${styles.panel} ${styles.previewPanel}`}>
        <div className={styles.panelHead}><div><p>03 · PREVIEW</p><h3>{t.preview}</h3></div><span className={styles.sizeBadge}>{activePreset.width}×{activePreset.height}</span></div>
        <div className={styles.canvasWrap}>{activeSlide ? <canvas ref={canvasRef} data-testid="tool024-preview" /> : <div className={styles.previewEmpty}>{t.empty}</div>}</div>
        <p className={styles.guide}>{t.first3}</p><p className={styles.guide}>{t.safeText}</p>
      </section>
    </div>

    <div className={styles.lowerGrid}>
      <section className={`${styles.panel} ${styles.copyPanel}`}>
        <div className={styles.panelHead}><div><p>04 · COPY</p><h3>{t.copy}</h3></div></div>
        {activeSlide ? <div className={styles.textFields}><label>{t.title}<input className={styles.titleInput} value={currentText?.title ?? ""} maxLength={120} onChange={(e) => updateText("title", e.target.value)} /></label><label>{t.desc}<textarea className={styles.descriptionInput} value={currentText?.description ?? ""} maxLength={240} rows={6} onChange={(e) => updateText("description", e.target.value)} /></label>{overflow && <p className={styles.warning}>{t.overflow}</p>}</div> : <p className={styles.muted}>{t.empty}</p>}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}><div><p>05 · PRESETS</p><h3>{t.presets}</h3></div></div>
        <div className={styles.presetList}>{PRESETS.map((preset) => <label key={preset.id} className={`${styles.presetCard} ${activePresetId === preset.id ? styles.activePreset : ""}`}><input type="checkbox" checked={selectedPresets.includes(preset.id)} onChange={() => setSelectedPresets((prev) => prev.includes(preset.id) ? prev.filter((id) => id !== preset.id) : [...prev, preset.id])} /><button onClick={() => setActivePresetId(preset.id)}><strong>{preset.label[locale]}</strong><span>{preset.width}×{preset.height}</span></button></label>)}</div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}><div><p>06 · EXPORT</p><h3>{t.export}</h3></div></div>
        <label className={styles.formatRow}>{t.format}<select data-testid="tool024-output-format" value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)}><option value="png">PNG</option><option value="jpg">JPG</option></select></label>
        <div className={styles.exportInfo}><span>{t.count}</span><strong data-testid="tool024-result-count">{expectedCount}</strong></div>
        {progress.total > 0 && <div className={styles.progress}><div style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} /></div>}
        <p className={styles.guide}>{t.partial}</p>
        {exportFailures.length > 0 && <div className={styles.failureBox} data-testid="tool024-export-failures"><strong>{t.failed}</strong><ul>{exportFailures.map((failure) => <li key={`${failure.slideIndex}-${failure.language}-${failure.presetId}`}>{failure.slideIndex + 1} · {failure.language.toUpperCase()} · {failure.presetId} · {failure.reason}</li>)}</ul><button className={styles.secondary} onClick={() => void retryFailures()}>RETRY FAILED</button></div>}
        <div className={styles.actions}><button className={styles.secondary} disabled={!activeSlide} onClick={() => void downloadCurrent()}>{t.current}</button><button className={styles.primary} disabled={!slides.length} onClick={() => void downloadZip()} data-testid="tool024-export-zip">{t.zip}</button><button className={styles.ghost} onClick={resetAll}>{t.reset}</button></div>
      </section>
    </div>
  </div>;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + width, y, x + width, y + height, r); ctx.arcTo(x + width, y + height, x, y + height, r); ctx.arcTo(x, y + height, x, y, r); ctx.arcTo(x, y, x + width, y, r); ctx.closePath();
}
function drawWrapped(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  if (!text) return; const tokens = text.includes(" ") ? text.split(/\s+/) : Array.from(text); let line = "", lineNo = 0;
  for (let i = 0; i < tokens.length && lineNo < maxLines; i++) { const token = tokens[i]; const separator = text.includes(" ") && line ? " " : ""; const test = line + separator + token; if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, y + lineNo * lineHeight); lineNo++; line = token; } else line = test; }
  if (line && lineNo < maxLines) ctx.fillText(line, x, y + lineNo * lineHeight);
}
