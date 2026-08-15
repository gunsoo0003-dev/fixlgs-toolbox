import { PDFDocument, degrees } from "pdf-lib";

export const TOOL032_LIMITS = {
  maxPdfBytes: 30 * 1024 * 1024,
  maxPages: 300,
  maxSignatureImageBytes: 10 * 1024 * 1024,
  maxSignaturePixels: 20_000_000,
  maxStrokePoints: 20_000,
  minWidthRatio: 0.05,
  maxWidthRatio: 0.6,
} as const;

export const TOOL032_LIMIT_DISPLAY = {
  maxPdfMiB: TOOL032_LIMITS.maxPdfBytes / 1024 / 1024,
  maxPages: TOOL032_LIMITS.maxPages,
  maxSignatureMiB: TOOL032_LIMITS.maxSignatureImageBytes / 1024 / 1024,
  maxSignatureMP: TOOL032_LIMITS.maxSignaturePixels / 1_000_000,
  maxStrokePoints: TOOL032_LIMITS.maxStrokePoints,
} as const;

export type Tool032PageScope = "current" | "all" | "odd" | "even" | "custom";
export type Tool032Placement = { x: number; y: number; width: number };
export type Tool032SignatureAsset = { bytes: Uint8Array; width: number; height: number; mime: "image/png" };

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function safeTool032Filename(name: string) {
  const base = name
    .replace(/\.pdf$/i, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, 100) || "document";
  return `${base}-signed.pdf`;
}

export function parseTool032PageRange(value: string, total: number): number[] {
  if (!Number.isInteger(total) || total < 1) throw new Error("PAGE_COUNT");
  const out = new Set<number>();
  if (!value.trim()) return [];
  for (const raw of value.split(",")) {
    const token = raw.trim();
    if (/^\d+$/.test(token)) {
      const page = Number(token);
      if (page < 1 || page > total) throw new Error("PAGE_RANGE");
      out.add(page);
      continue;
    }
    const match = token.match(/^(\d+)\s*-\s*(\d+)$/);
    if (!match) throw new Error("PAGE_RANGE");
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (start < 1 || end > total || start > end) throw new Error("PAGE_RANGE");
    for (let page = start; page <= end; page += 1) out.add(page);
  }
  return [...out].sort((a, b) => a - b);
}

export function resolveTool032Pages(scope: Tool032PageScope, current: number, total: number, custom = "") {
  if (scope === "current") return [current];
  if (scope === "all") return Array.from({ length: total }, (_, i) => i + 1);
  if (scope === "odd") return Array.from({ length: total }, (_, i) => i + 1).filter((n) => n % 2 === 1);
  if (scope === "even") return Array.from({ length: total }, (_, i) => i + 1).filter((n) => n % 2 === 0);
  const pages = parseTool032PageRange(custom, total);
  if (!pages.length) throw new Error("PAGE_RANGE");
  return pages;
}

export function visiblePageSize(width: number, height: number, rotation: number) {
  const angle = ((rotation % 360) + 360) % 360;
  return angle === 90 || angle === 270 ? { width: height, height: width } : { width, height };
}

export function placementHeightRatio(placementWidth: number, pageVisibleWidth: number, pageVisibleHeight: number, assetWidth: number, assetHeight: number) {
  if (!(assetWidth > 0 && assetHeight > 0 && pageVisibleWidth > 0 && pageVisibleHeight > 0)) return 0.12;
  return placementWidth * (pageVisibleWidth / pageVisibleHeight) * (assetHeight / assetWidth);
}

export function clampPlacement(
  placement: Tool032Placement,
  heightRatio: number,
): Tool032Placement {
  const width = Math.max(TOOL032_LIMITS.minWidthRatio, Math.min(TOOL032_LIMITS.maxWidthRatio, placement.width));
  const x = Math.max(0, Math.min(1 - width, placement.x));
  const h = Math.max(0.01, Math.min(1, heightRatio));
  const y = Math.max(0, Math.min(1 - h, placement.y));
  return { x, y, width };
}

export function visibleBoxToPdfBox(
  pageWidth: number,
  pageHeight: number,
  rotation: number,
  xRatio: number,
  yRatioTop: number,
  widthRatio: number,
  heightRatio: number,
) {
  const angle = ((rotation % 360) + 360) % 360;
  const visible = visiblePageSize(pageWidth, pageHeight, angle);
  const vx = xRatio * visible.width;
  const vy = (1 - yRatioTop - heightRatio) * visible.height;
  const vw = widthRatio * visible.width;
  const vh = heightRatio * visible.height;
  if (angle === 90) return { x: pageWidth - vy - vh, y: vx, width: vh, height: vw };
  if (angle === 180) return { x: pageWidth - vx - vw, y: pageHeight - vy - vh, width: vw, height: vh };
  if (angle === 270) return { x: vy, y: pageHeight - vx - vw, width: vh, height: vw };
  return { x: vx, y: vy, width: vw, height: vh };
}

export async function inspectTool032Pdf(bytes: Uint8Array) {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: false, updateMetadata: false });
  const pages = doc.getPages();
  if (!pages.length) throw new Error("EMPTY_PDF");
  return pages.map((page, index) => ({
    page: index + 1,
    width: page.getWidth(),
    height: page.getHeight(),
    rotation: page.getRotation().angle,
  }));
}

export async function applyTool032Signature(args: {
  pdfBytes: Uint8Array;
  signature: Tool032SignatureAsset;
  pages: number[];
  placement: Tool032Placement;
  rotationDeg: number;
  onProgress?: (done: number, total: number, page: number) => void;
}) {
  const pdf = await PDFDocument.load(args.pdfBytes, { ignoreEncryption: false, updateMetadata: false });
  const allPages = pdf.getPages();
  if (!allPages.length) throw new Error("EMPTY_PDF");
  const image = await pdf.embedPng(args.signature.bytes);
  const applied: number[] = [];

  for (const pageNumber of [...new Set(args.pages)].sort((a, b) => a - b)) {
    if (pageNumber < 1 || pageNumber > allPages.length) throw new Error("PAGE_RANGE");
    const page = allPages[pageNumber - 1];
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const pageRotation = page.getRotation().angle;
    const visible = visiblePageSize(pageWidth, pageHeight, pageRotation);
    const hRatio = placementHeightRatio(args.placement.width, visible.width, visible.height, args.signature.width, args.signature.height);
    const safe = clampPlacement(args.placement, hRatio);
    const box = visibleBoxToPdfBox(pageWidth, pageHeight, pageRotation, safe.x, safe.y, safe.width, hRatio);
    page.drawImage(image, {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      rotate: degrees(args.rotationDeg),
    });
    applied.push(pageNumber);
    args.onProgress?.(applied.length, args.pages.length, pageNumber);
    await Promise.resolve();
  }

  const output = await pdf.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
  const verify = await PDFDocument.load(output, { ignoreEncryption: false, updateMetadata: false });
  if (verify.getPageCount() !== allPages.length) throw new Error("VERIFY_PAGE_COUNT");
  return { bytes: output, pageCount: verify.getPageCount(), applied };
}
