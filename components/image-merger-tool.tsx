"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/site";
import { openFilePicker } from "@/lib/file-picker";
import { loadBrowserImage } from "@/lib/mobile-image-loader";

type Direction = "vertical" | "horizontal";
type Sizing = "original" | "width" | "height";
type FitBasis = "smallest" | "largest" | "custom";
type CrossAlign = "start" | "center" | "end";
type OutputFormat = "png" | "jpg" | "webp";
type Background = "solid" | "transparent";
type ItemStatus = "checking" | "ready" | "failed";

type ImageItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  url: string;
  img: CanvasImageSource | null;
  status: ItemStatus;
  error?: string;
};

type RenderItem = { item: ImageItem; x: number; y: number; width: number; height: number };

const copy = {
  ko: {
    workspace: "이미지 합치기 작업장", drop: "이미지를 여기에 놓거나 여러 장 선택하세요", select: "여러 이미지 선택", add: "이미지 추가",
    support: "JPG, PNG, WebP · 여러 장 선택 가능", local: "이미지는 서버로 전송되지 않으며 현재 브라우저에서만 처리됩니다.", selected: "선택한 이미지",
    count: "이미지 수", ready: "준비 완료", remove: "삭제", removeAll: "전체 파일 삭제", up: "위로", down: "아래로", first: "맨 앞으로", last: "맨 뒤로",
    direction: "합치기 방향", vertical: "세로", horizontal: "가로", sizing: "이미지 크기", original: "원본 크기 유지", matchWidth: "너비 맞춤", matchHeight: "높이 맞춤",
    basis: "맞춤 기준", smallest: "가장 작은 크기 기준", largest: "가장 큰 크기 기준", custom: "사용자 지정", customWidth: "공통 너비", customHeight: "공통 높이",
    upscale: "업스케일 허용", upscaleWarn: "작은 이미지를 확대하면 화질이 낮아질 수 있습니다.", alignment: "정렬", left: "왼쪽", center: "가운데", right: "오른쪽", top: "위", bottom: "아래",
    gap: "이미지 간격", padding: "외곽 여백", background: "배경", solid: "단색", transparent: "투명", color: "배경색", white: "흰색", black: "검정", retry: "다시 선택", preview: "결과 미리보기", resultSize: "결과 크기",
    totalPixels: "총 픽셀", zoomOut: "축소", zoomIn: "확대", fit: "화면 맞춤", view100: "100% 보기", output: "출력", format: "출력 형식", quality: "출력 품질", filename: "파일명",
    download: "이미지 다운로드", again: "다시 다운로드", resetSettings: "설정 초기화", resetAll: "전체 초기화", needTwo: "합치려면 이미지가 두 장 이상 필요합니다.", addOne: "이미지를 한 장 더 추가하세요.",
    unsupported: "지원하지 않는 이미지 형식입니다.", empty: "빈 파일은 사용할 수 없습니다.", unreadable: "이미지를 읽을 수 없습니다.", partial: "일부 이미지를 불러오지 못했습니다.", tooMany: "한 번에 최대 20장까지 합칠 수 있습니다.", serviceBlocked: "기본 서비스는 결과 한 변 10,000px, 총 2,500만 픽셀까지 지원합니다. 크기 기준·간격·여백을 낮춰 주세요.", tooLarge: "결과 이미지가 매우 큽니다. 현재 기기에서 생성에 실패할 수 있습니다.", blocked: "현재 기기에서 안전하게 생성하기 어려운 크기입니다. 크기 기준을 낮춰 주세요.",
    generating: "결과 생성 중", complete: "완료", pngDefault: "여러 형식과 투명도를 안전하게 유지하기 위해 PNG가 기본입니다.", jpgNote: "JPG는 투명 배경을 지원하지 않아 선택한 배경색으로 합성됩니다.", drag: "드래그하여 순서 변경"
  },
  en: {
    workspace: "Image merger workspace", drop: "Drop images here or select multiple files", select: "Select Images", add: "Add Images", support: "JPG, PNG, WebP · multiple files", local: "Images are processed only in this browser and are not uploaded to a server.", selected: "Selected Images",
    count: "Image Count", ready: "Ready", remove: "Remove", removeAll: "Remove All", up: "Move Up", down: "Move Down", first: "Move to First", last: "Move to Last", direction: "Merge Direction", vertical: "Vertical", horizontal: "Horizontal",
    sizing: "Image Sizing", original: "Keep Original Size", matchWidth: "Match Width", matchHeight: "Match Height", basis: "Fit Basis", smallest: "Fit to Smallest", largest: "Fit to Largest", custom: "Custom Size", customWidth: "Common Width", customHeight: "Common Height",
    upscale: "Allow Upscaling", upscaleWarn: "Upscaling smaller images can reduce visual quality.", alignment: "Alignment", left: "Left", center: "Center", right: "Right", top: "Top", bottom: "Bottom", gap: "Image Gap", padding: "Outer Padding", background: "Background", solid: "Solid", transparent: "Transparent", color: "Background Color", white: "White", black: "Black", retry: "Choose Again", preview: "Result Preview", resultSize: "Result Size", totalPixels: "Total Pixels",
    zoomOut: "Zoom Out", zoomIn: "Zoom In", fit: "Fit to Screen", view100: "View at 100%", output: "Output", format: "Output Format", quality: "Output Quality", filename: "File Name", download: "Download Image", again: "Download Again", resetSettings: "Reset Settings", resetAll: "Reset All", needTwo: "At least two images are required to merge.", addOne: "Add one more image to continue.", unsupported: "This image format is not supported.", empty: "Empty files cannot be used.", unreadable: "The image could not be read.", partial: "Some images could not be loaded.", tooMany: "You can merge up to 20 images at a time.", serviceBlocked: "The standard service supports results up to 10,000 px on either side and 25 million total pixels. Reduce sizing, gap, or padding.", tooLarge: "The result image is very large and may fail on this device.", blocked: "This result is too large to generate safely on the current device. Reduce the sizing basis.", generating: "Generating result", complete: "Complete", pngDefault: "PNG is the safe default for mixed formats and transparency.", jpgNote: "JPG cannot preserve transparency, so the selected background color will be composited.", drag: "Drag to reorder"
  },
  ja: {
    workspace: "画像結合ワークスペース", drop: "画像をここにドロップするか複数選択してください", select: "複数の画像を選択", add: "画像を追加", support: "JPG・PNG・WebP · 複数選択可能", local: "画像はサーバーに送信されず、現在のブラウザ内だけで処理されます。", selected: "選択した画像",
    count: "画像数", ready: "準備完了", remove: "削除", removeAll: "すべて削除", up: "上へ", down: "下へ", first: "先頭へ", last: "最後へ", direction: "結合方向", vertical: "縦", horizontal: "横", sizing: "画像サイズ", original: "元のサイズを維持", matchWidth: "幅を合わせる", matchHeight: "高さを合わせる",
    basis: "サイズ基準", smallest: "最小サイズに合わせる", largest: "最大サイズに合わせる", custom: "カスタム", customWidth: "共通の幅", customHeight: "共通の高さ", upscale: "拡大を許可", upscaleWarn: "小さい画像を拡大すると画質が低下する場合があります。", alignment: "配置", left: "左", center: "中央", right: "右", top: "上", bottom: "下",
    gap: "画像間隔", padding: "外側余白", background: "背景", solid: "単色", transparent: "透明", color: "背景色", white: "白", black: "黒", retry: "選び直す", preview: "結果プレビュー", resultSize: "結果サイズ", totalPixels: "総ピクセル数", zoomOut: "縮小", zoomIn: "拡大", fit: "画面に合わせる", view100: "100%表示", output: "出力", format: "出力形式", quality: "出力画質", filename: "ファイル名", download: "画像をダウンロード", again: "もう一度ダウンロード", resetSettings: "設定をリセット", resetAll: "すべて初期化", needTwo: "結合するには2枚以上の画像が必要です。", addOne: "画像をもう1枚追加してください。", unsupported: "対応していない画像形式です。", empty: "空のファイルは使用できません。", unreadable: "画像を読み込めませんでした。", partial: "一部の画像を読み込めませんでした。", tooMany: "一度に結合できる画像は最大20枚です。", serviceBlocked: "基本サービスでは、結果画像は一辺10,000px、総画素数2,500万ピクセルまで対応します。サイズ・間隔・余白を小さくしてください。", tooLarge: "結果画像が非常に大きく、現在の端末では生成に失敗する場合があります。", blocked: "現在の端末で安全に生成するには大きすぎます。サイズ基準を下げてください。", generating: "結果を生成中", complete: "完了", pngDefault: "複数形式と透明度を安全に扱うためPNGが初期設定です。", jpgNote: "JPGは透明背景に対応しないため、選択した背景色で合成されます。", drag: "ドラッグして並び替え"
  }
} as const;

const SERVICE_MAX_IMAGES = 20;
const SERVICE_MAX_SIDE = 10_000;
const SERVICE_MAX_PIXELS = 25_000_000;
const MAX_SIDE_WARN = 12000;
const MAX_PIXELS_WARN = 64_000_000;
const MAX_SIDE_BLOCK = 16384;
const MAX_PIXELS_BLOCK = 100_000_000;

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function clampInt(v: string | number, max = 5000) { const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : 0; }
function safeName(v: string) { return (v.trim() || "merged-images").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-").slice(0, 120); }
function fmtBytes(n: number) { return n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : `${(n/1048576).toFixed(2)} MB`; }
function isSupported(file: File) { return ["image/jpeg", "image/png", "image/webp"].includes(file.type) && /\.(jpe?g|png|webp)$/i.test(file.name); }
function closeRenderable(source: CanvasImageSource | null) { if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) source.close(); }
async function signatureOk(file: File) {
  const b = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === "image/jpeg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (file.type === "image/png") return b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71;
  return String.fromCharCode(...b.slice(0,4)) === "RIFF" && String.fromCharCode(...b.slice(8,12)) === "WEBP";
}

export function ImageMergerTool({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const retryInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const dragId = useRef<string | null>(null);
  const touchDrag = useRef<{id:string; y:number} | null>(null);
  const renderVersion = useRef(0);
  const itemsRef = useRef<ImageItem[]>([]);

  const [items, setItems] = useState<ImageItem[]>([]);
  const [direction, setDirection] = useState<Direction>("vertical");
  const [sizing, setSizing] = useState<Sizing>("width");
  const [basis, setBasis] = useState<FitBasis>("smallest");
  const [customSize, setCustomSize] = useState(1200);
  const [allowUpscale, setAllowUpscale] = useState(false);
  const [align, setAlign] = useState<CrossAlign>("center");
  const [gap, setGap] = useState(0);
  const [padding, setPadding] = useState(0);
  const [background, setBackground] = useState<Background>("solid");
  const [color, setColor] = useState("#ffffff");
  const [format, setFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState(92);
  const [filename, setFilename] = useState("merged-images");
  const [zoom, setZoom] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [resultBytes, setResultBytes] = useState<number | null>(null);
  const [retryId, setRetryId] = useState<string | null>(null);
  const [externalDragOver, setExternalDragOver] = useState(false);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => () => { for (const item of itemsRef.current) { closeRenderable(item.img); URL.revokeObjectURL(item.url); } }, []);

  const readyItems = useMemo(() => items.filter(i => i.status === "ready" && i.img), [items]);

  const layout = useMemo(() => {
    if (!readyItems.length) return { width: 0, height: 0, pixels: 0, placements: [] as RenderItem[] };
    const widths = readyItems.map(i => i.width);
    const heights = readyItems.map(i => i.height);
    let target = customSize;
    if (sizing === "width") target = basis === "smallest" ? Math.min(...widths) : basis === "largest" ? Math.max(...widths) : customSize;
    if (sizing === "height") target = basis === "smallest" ? Math.min(...heights) : basis === "largest" ? Math.max(...heights) : customSize;
    const sizes = readyItems.map(item => {
      if (sizing === "original") return { width: item.width, height: item.height };
      if (sizing === "width") {
        const w = allowUpscale ? target : Math.min(target, item.width);
        return { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(item.height * w / item.width)) };
      }
      const h = allowUpscale ? target : Math.min(target, item.height);
      return { width: Math.max(1, Math.round(item.width * h / item.height)), height: Math.max(1, Math.round(h)) };
    });
    const innerW = direction === "vertical" ? Math.max(...sizes.map(s => s.width)) : sizes.reduce((a,s) => a+s.width,0) + gap * Math.max(0,sizes.length-1);
    const innerH = direction === "horizontal" ? Math.max(...sizes.map(s => s.height)) : sizes.reduce((a,s) => a+s.height,0) + gap * Math.max(0,sizes.length-1);
    const width = innerW + padding*2;
    const height = innerH + padding*2;
    let cursor = padding;
    const placements = readyItems.map((item, idx) => {
      const s = sizes[idx];
      let x = padding, y = padding;
      if (direction === "vertical") {
        x = padding + (align === "start" ? 0 : align === "end" ? innerW - s.width : (innerW - s.width)/2);
        y = cursor; cursor += s.height + gap;
      } else {
        x = cursor;
        y = padding + (align === "start" ? 0 : align === "end" ? innerH - s.height : (innerH - s.height)/2);
        cursor += s.width + gap;
      }
      return { item, x: Math.round(x), y: Math.round(y), width: s.width, height: s.height };
    });
    return { width: Math.round(width), height: Math.round(height), pixels: Math.round(width*height), placements };
  }, [readyItems, sizing, basis, customSize, allowUpscale, direction, align, gap, padding]);

  const warnLarge = layout.width > MAX_SIDE_WARN || layout.height > MAX_SIDE_WARN || layout.pixels > MAX_PIXELS_WARN;
  const serviceBlockLarge = layout.width > SERVICE_MAX_SIDE || layout.height > SERVICE_MAX_SIDE || layout.pixels > SERVICE_MAX_PIXELS;
  const technicalBlockLarge = layout.width > MAX_SIDE_BLOCK || layout.height > MAX_SIDE_BLOCK || layout.pixels > MAX_PIXELS_BLOCK;
  const blockLarge = serviceBlockLarge || technicalBlockLarge;
  const previewBaseScale = layout.width && layout.height ? Math.min(1, 920/layout.width, 620/layout.height) : 1;
  const fitPreview = () => setZoom(1);
  const viewActualPixels = () => setZoom(Math.max(1, 1 / previewBaseScale));

  const decodeFile = useCallback(async (file: File, id: string, url: string) => {
    try {
      if (!file.size) throw new Error(t.empty);
      if (!isSupported(file)) throw new Error(t.unsupported);
      if (!(await signatureOk(file))) throw new Error(t.unreadable);
      let img: CanvasImageSource;
      let width = 0, height = 0;
      if (typeof createImageBitmap === "function") {
        try {
          const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
          img = bitmap; width = bitmap.width; height = bitmap.height;
        } catch {
          const fallback = new Image(); fallback.decoding = "async"; fallback.src = url;
          await fallback.decode();
          img = fallback; width = fallback.naturalWidth; height = fallback.naturalHeight;
        }
      } else {
        const fallback = new Image(); fallback.decoding = "async"; fallback.src = url;
        await fallback.decode();
        img = fallback; width = fallback.naturalWidth; height = fallback.naturalHeight;
      }
      if (!width || !height) { closeRenderable(img); throw new Error(t.unreadable); }
      setItems(prev => {
        const target = prev.find(it => it.id === id);
        if (!target || target.url !== url) { closeRenderable(img); return prev; }
        return prev.map(it => {
          if (it.id !== id) return it;
          closeRenderable(it.img);
          return {...it, img, width, height, status:"ready", error:undefined};
        });
      });
    } catch (e) {
      setItems(prev => prev.map(it => it.id === id ? {...it, status:"failed", error: e instanceof Error ? e.message : t.unreadable} : it));
    }
  }, [t.empty, t.unsupported, t.unreadable]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    const currentCount = itemsRef.current.length;
    const remaining = Math.max(0, SERVICE_MAX_IMAGES - currentCount);
    const accepted = files.slice(0, remaining);
    if (!accepted.length) { setError(t.tooMany); return; }
    const additions = accepted.map(file => { const id=uid(), url=URL.createObjectURL(file); return {id,file,name:file.name,size:file.size,width:0,height:0,url,img:null,status:"checking" as const}; });
    setError(files.length > accepted.length ? t.tooMany : ""); setResultBytes(null);
    setItems(prev => [...prev, ...additions]);
    additions.forEach(it => void decodeFile(it.file, it.id, it.url));
  }, [decodeFile, t.tooMany]);


  const retryFailedFile = useCallback((file: File) => {
    if (!retryId) return;
    const target = itemsRef.current.find(item => item.id === retryId);
    if (!target) { setRetryId(null); return; }
    const url = URL.createObjectURL(file);
    closeRenderable(target.img);
    URL.revokeObjectURL(target.url);
    setItems(prev => prev.map(item => item.id === retryId ? { id: item.id, file, name: file.name, size: file.size, width: 0, height: 0, url, img: null, status: "checking" as const } : item));
    void decodeFile(file, retryId, url);
    setRetryId(null);
    setResultBytes(null);
    setError("");
  }, [retryId, decodeFile]);

  const move = useCallback((id: string, to: number) => {
    setItems(prev => {
      const from = prev.findIndex(i => i.id === id); if (from < 0) return prev;
      const next = [...prev]; const [picked] = next.splice(from,1); next.splice(Math.max(0,Math.min(to,next.length)),0,picked); return next;
    });
    setResultBytes(null);
  }, []);

  const moveDelta = (id: string, d: number) => setItems(prev => { const from=prev.findIndex(i=>i.id===id); if(from<0)return prev; const to=Math.max(0,Math.min(prev.length-1,from+d)); if(to===from)return prev; const next=[...prev]; const [picked]=next.splice(from,1); next.splice(to,0,picked); return next; });
  const remove = (id:string) => setItems(prev => { const target=prev.find(i=>i.id===id); if(target) { closeRenderable(target.img); URL.revokeObjectURL(target.url); } return prev.filter(i=>i.id!==id); });
  const removeAll = () => { items.forEach(i=>{closeRenderable(i.img);URL.revokeObjectURL(i.url)}); setItems([]); setResultBytes(null); setError(""); setStatus(""); };

  const paint = useCallback((canvas: HTMLCanvasElement, full = false) => {
    if (!layout.width || !layout.height) return false;
    const maxPreview = full ? Infinity : 920;
    const scale = full ? 1 : Math.min(1, maxPreview/layout.width, 620/layout.height);
    const w = Math.max(1,Math.round(layout.width*scale)), h=Math.max(1,Math.round(layout.height*scale));
    canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext("2d",{alpha:true}); if(!ctx)return false;
    ctx.clearRect(0,0,w,h);
    if (background === "solid" || format === "jpg") { ctx.fillStyle=color; ctx.fillRect(0,0,w,h); }
    for (const p of layout.placements) if (p.item.img) ctx.drawImage(p.item.img, p.x*scale,p.y*scale,p.width*scale,p.height*scale);
    return true;
  }, [layout, background, color, format]);

  useEffect(() => {
    const version=++renderVersion.current;
    requestAnimationFrame(() => { if(version===renderVersion.current && previewRef.current) paint(previewRef.current,false); });
  }, [paint]);

  const download = async () => {
    if (readyItems.length < 2) { setError(t.needTwo); return; }
    if (serviceBlockLarge) { setError(t.serviceBlocked); return; }
    if (technicalBlockLarge) { setError(t.blocked); return; }
    setError(""); setStatus(t.generating); setResultBytes(null);
    await new Promise(r=>setTimeout(r,0));
    try {
      const canvas=document.createElement("canvas"); if(!paint(canvas,true)) throw new Error(t.unreadable);
      const mime=format==="jpg"?"image/jpeg":format==="webp"?"image/webp":"image/png";
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,mime,format==="png"?undefined:quality/100));
      if(!blob) throw new Error(t.unreadable);
      const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${safeName(filename)}.${format}`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);
      setResultBytes(blob.size); setStatus(t.complete);
      canvas.width=1; canvas.height=1;
    } catch (e) { setError(e instanceof Error?e.message:t.unreadable); setStatus(""); }
  };

  const resetSettings = () => { setDirection("vertical"); setSizing("width"); setBasis("smallest"); setCustomSize(1200); setAllowUpscale(false); setAlign("center"); setGap(0); setPadding(0); setBackground("solid"); setColor("#ffffff"); setFormat("png"); setQuality(92); setFilename("merged-images"); setZoom(1); setResultBytes(null); setError(""); };
  const resetAll = () => { removeAll(); resetSettings(); };

  return <div className="toolbox-tool-workflow" data-testid="tool013-root">
    <section className="merger-workbench toolbox-workbench" data-testid="tool013-workbench">
      <div className={`toolbox-workbench-upload${externalDragOver?" is-dragging":""}`} data-testid="tool013-upload" onDragEnter={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();setExternalDragOver(true)}}} onDragOver={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!externalDragOver)setExternalDragOver(true)}}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setExternalDragOver(false)}} onDrop={e=>{if(e.dataTransfer.files.length===0)return;e.preventDefault();e.stopPropagation();setExternalDragOver(false);addFiles(e.dataTransfer.files)}}>
        <div className="toolbox-workbench-topline"><div><span>WORKSPACE</span><strong>{t.workspace}</strong></div></div>
        <input ref={inputRef} data-testid="tool013-file-input" hidden multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{if(e.target.files)addFiles(e.target.files);e.target.value=""}}/>
        <input ref={retryInputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file)retryFailedFile(file);e.target.value=""}}/>
        {items.length===0 ? (
          <div className="toolbox-upload-focus">
            <span className="toolbox-upload-icon" aria-hidden="true">＋</span>
            <h2>{t.drop}</h2>
            <p>{t.local}</p>
            <button type="button" data-testid="tool013-select" onClick={()=>openFilePicker(inputRef.current)}>{t.select}</button>
            <small>{t.support}</small>
          </div>
        ) : (
          <div className="toolbox-upload-active merger-upload-active">
            <div className="toolbox-upload-active-head">
              <div><span>{t.selected}</span><p>{t.local}</p></div>
              <div className="toolbox-upload-active-actions"><div className="toolbox-file-stats"><span>{items.length} files</span><span>{readyItems.length} ready</span></div><button type="button" onClick={()=>openFilePicker(inputRef.current)}>＋ {t.add}</button></div>
            </div>
            <div className="toolbox-upload-selected-file"><strong>{t.count}: {items.length}</strong><span>{t.support}</span></div>
          </div>
        )}
      </div>

    {items.length>0 && <div className={`merger-main-grid toolbox-workbench-editor-grid${externalDragOver?" is-file-dragging":""}`} onDragEnter={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();setExternalDragOver(true)}}} onDragOver={e=>{if(Array.from(e.dataTransfer.types).includes("Files")){e.preventDefault();if(!externalDragOver)setExternalDragOver(true)}}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setExternalDragOver(false)}} onDrop={e=>{if(e.dataTransfer.files.length===0)return;e.preventDefault();e.stopPropagation();setExternalDragOver(false);addFiles(e.dataTransfer.files)}}>
      <section className="merger-files toolbox-workbench-preview-card" data-testid="tool013-files">
        <div className="toolbox-workbench-settings-head"><div><span>{t.selected}</span><p>{t.count}: {items.length} · {t.ready}: {readyItems.length}</p></div><button onClick={removeAll}>{t.removeAll}</button></div>
        <div className="merger-file-list">
          {items.map((item,index)=><article key={item.id} className={`merger-file ${item.status}`} data-testid="tool013-file-card" data-status={item.status} draggable onDragStart={()=>{dragId.current=item.id}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragId.current && dragId.current!==item.id) move(dragId.current,index);dragId.current=null}}>
            <button className="merger-handle" aria-label={t.drag} title={t.drag} onPointerDown={e=>{touchDrag.current={id:item.id,y:e.clientY};(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)}} onPointerMove={e=>{const d=touchDrag.current;if(!d||d.id!==item.id)return; const dy=e.clientY-d.y;if(Math.abs(dy)>46){moveDelta(item.id,dy>0?1:-1);touchDrag.current={id:item.id,y:e.clientY}}}} onPointerUp={()=>{touchDrag.current=null}}>⋮⋮</button>
            <span className="merger-order">{index+1}</span><img src={item.url} alt=""/><div className="merger-file-meta"><strong title={item.name}>{item.name}</strong><span>{item.status==="ready"?`${item.width} × ${item.height}px · ${fmtBytes(item.size)}`:item.status==="checking"?"…":item.error}</span></div>
            {item.status==="failed"&&<button className="merger-retry" onClick={()=>{setRetryId(item.id);openFilePicker(retryInputRef.current)}}>{t.retry}</button>}<div className="merger-reorder"><button aria-label={t.up} disabled={index===0} onClick={()=>moveDelta(item.id,-1)}>↑</button><button aria-label={t.down} disabled={index===items.length-1} onClick={()=>moveDelta(item.id,1)}>↓</button><button aria-label={t.first} disabled={index===0} onClick={()=>move(item.id,0)}>⇤</button><button aria-label={t.last} disabled={index===items.length-1} onClick={()=>move(item.id,items.length-1)}>⇥</button></div><button className="merger-remove" onClick={()=>remove(item.id)}>{t.remove}</button>
          </article>)}
        </div>
      </section>

      <aside className="merger-settings toolbox-workbench-settings-card" data-testid="tool013-settings">
        <div className="merger-section"><div className="toolbox-workbench-settings-head"><div><span>{t.direction}</span></div></div><div className="merger-segment two"><button data-testid="tool013-direction-vertical" className={direction==="vertical"?"is-active":""} onClick={()=>{setDirection("vertical"); if(sizing==="height")setSizing("width")}}>{t.vertical}</button><button className={direction==="horizontal"?"is-active":""} onClick={()=>{setDirection("horizontal"); if(sizing==="width")setSizing("height")}}>{t.horizontal}</button></div></div>
        <div className="merger-section"><div className="toolbox-workbench-settings-head"><div><span>{t.sizing}</span></div></div><div className="merger-segment"><button className={sizing==="original"?"is-active":""} onClick={()=>setSizing("original")}>{t.original}</button><button data-testid="tool013-sizing-width" className={sizing==="width"?"is-active":""} onClick={()=>setSizing("width")}>{t.matchWidth}</button><button className={sizing==="height"?"is-active":""} onClick={()=>setSizing("height")}>{t.matchHeight}</button></div>{sizing!=="original"&&<><label>{t.basis}<select data-testid="tool013-size-basis" value={basis} onChange={e=>setBasis(e.target.value as FitBasis)}><option value="smallest">{t.smallest}</option><option value="largest">{t.largest}</option><option value="custom">{t.custom}</option></select></label>{basis==="custom"&&<label>{sizing==="width"?t.customWidth:t.customHeight}<input data-testid="tool013-custom-size" inputMode="numeric" value={customSize} onChange={e=>setCustomSize(Math.max(1,clampInt(e.target.value,16384)))}/><span>px</span></label>}<label className="merger-check"><input data-testid="tool013-allow-upscale" type="checkbox" checked={allowUpscale} onChange={e=>setAllowUpscale(e.target.checked)}/>{t.upscale}</label>{(allowUpscale||basis==="largest")&&<p className="merger-note">{t.upscaleWarn}</p>}</>}</div>
        <div className="merger-section"><div className="toolbox-workbench-settings-head"><div><span>{t.alignment}</span></div></div><div className="merger-segment">{direction==="vertical"?<><button className={align==="start"?"is-active":""} onClick={()=>setAlign("start")}>{t.left}</button><button className={align==="center"?"is-active":""} onClick={()=>setAlign("center")}>{t.center}</button><button className={align==="end"?"is-active":""} onClick={()=>setAlign("end")}>{t.right}</button></>:<><button className={align==="start"?"is-active":""} onClick={()=>setAlign("start")}>{t.top}</button><button className={align==="center"?"is-active":""} onClick={()=>setAlign("center")}>{t.center}</button><button className={align==="end"?"is-active":""} onClick={()=>setAlign("end")}>{t.bottom}</button></>}</div></div>
        <div className="merger-section merger-numbers"><label>{t.gap}<input data-testid="tool013-gap" type="number" min="0" max="2000" value={gap} onChange={e=>setGap(clampInt(e.target.value,2000))}/><span>px</span></label><input className="merger-range" aria-label={t.gap} type="range" min="0" max="200" value={Math.min(gap,200)} onChange={e=>setGap(+e.target.value)}/><label>{t.padding}<input data-testid="tool013-padding" type="number" min="0" max="2000" value={padding} onChange={e=>setPadding(clampInt(e.target.value,2000))}/><span>px</span></label><input className="merger-range" aria-label={t.padding} type="range" min="0" max="200" value={Math.min(padding,200)} onChange={e=>setPadding(+e.target.value)}/></div>
        <div className="merger-section"><div className="toolbox-workbench-settings-head"><div><span>{t.background}</span></div></div><div className="merger-segment two"><button className={background==="solid"?"is-active":""} onClick={()=>setBackground("solid")}>{t.solid}</button><button className={background==="transparent"?"is-active":""} onClick={()=>setBackground("transparent")}>{t.transparent}</button></div><div className="merger-color-presets"><button className={background==="solid"&&color.toLowerCase()==="#ffffff"?"is-active":""} onClick={()=>{setBackground("solid");setColor("#ffffff")}}>{t.white}</button><button className={background==="solid"&&color.toLowerCase()==="#000000"?"is-active":""} onClick={()=>{setBackground("solid");setColor("#000000")}}>{t.black}</button></div><label>{t.color}<input type="color" value={color} onChange={e=>{setBackground("solid");setColor(e.target.value)}}/></label></div>
      </aside>
    </div>}

    {items.length>0 && <section className="merger-preview-card toolbox-workbench-preview-card" data-testid="tool013-preview"><div className="toolbox-workbench-settings-head"><div><span>{t.preview}</span><p>{layout.width} × {layout.height}px · {t.totalPixels}: {layout.pixels.toLocaleString()}</p></div></div><div className={`merger-preview ${background==="transparent"?"is-transparent":""}`}><canvas ref={previewRef} data-testid="tool013-preview-canvas" style={{transform:`scale(${zoom})`}}/></div><div className="merger-viewbar"><button onClick={()=>setZoom(v=>Math.max(.5,v-.25))}>{t.zoomOut}</button><strong>{Math.round(zoom*100)}%</strong><button onClick={()=>setZoom(v=>Math.min(2,v+.25))}>{t.zoomIn}</button><button onClick={fitPreview}>{t.fit}</button><button onClick={viewActualPixels}>{t.view100}</button></div>{readyItems.length===1&&<p className="merger-note">{t.addOne}</p>}{warnLarge&&!blockLarge&&<p className="merger-warning" data-testid="tool013-limit-warning">{t.tooLarge}</p>}{serviceBlockLarge&&<p className="merger-warning is-blocked" data-testid="tool013-limit-blocked">{t.serviceBlocked}</p>}{technicalBlockLarge&&!serviceBlockLarge&&<p className="merger-warning is-blocked" data-testid="tool013-limit-blocked">{t.blocked}</p>}</section>}

    {items.length>0 && <section className="merger-output-card toolbox-workbench-settings-card" data-testid="tool013-output"><div className="toolbox-workbench-settings-head"><div><span>{t.output}</span><p>{t.resultSize}: {layout.width} × {layout.height}px</p></div></div><div className="merger-output-controls"><label>{t.format}<select value={format} onChange={e=>setFormat(e.target.value as OutputFormat)}><option value="png">PNG</option><option value="jpg">JPG</option><option value="webp">WebP</option></select></label><label>{t.quality}<input type="range" min="40" max="100" disabled={format==="png"} value={quality} onChange={e=>setQuality(+e.target.value)}/><span>{format==="png"?"—":`${quality}%`}</span></label><label>{t.filename}<input value={filename} onChange={e=>setFilename(e.target.value)} onBlur={()=>setFilename(safeName(filename))}/></label></div><p className="merger-note">{format==="jpg"&&background==="transparent"?t.jpgNote:t.pngDefault}</p><div className="merger-actions"><button className="toolbox-primary-action" data-testid="tool013-download" disabled={readyItems.length<2||blockLarge} onClick={download}>{resultBytes!==null?t.again:t.download}</button><button onClick={resetSettings}>{t.resetSettings}</button><button onClick={resetAll}>{t.resetAll}</button></div>{resultBytes!==null&&<div className="toolbox-workbench-result-card merger-result"><strong>{t.complete}</strong><span>{layout.width} × {layout.height}px</span><span>{format.toUpperCase()}</span><span>{fmtBytes(resultBytes)}</span></div>}<p aria-live="polite" className="merger-status" data-testid="tool013-status">{status}</p>{error&&<p role="alert" className="merger-error" data-testid="tool013-error">{error}</p>}</section>}
    </section>
  </div>;
}
