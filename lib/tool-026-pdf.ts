export type PdfPageSize = "a4" | "letter";
export type PdfOrientation = "portrait" | "landscape" | "auto";

export const PDF_PAGE_PRESETS = {
  a4: { label: "A4", widthPt: 595.2755905512, heightPt: 841.8897637795, widthMm: 210, heightMm: 297 },
  letter: { label: "Letter", widthPt: 612, heightPt: 792, widthMm: 215.9, heightMm: 279.4 },
} as const;

// TOOL026 service policy approved for main-workshop integration on 2026-08-14.
// Keep product copy, fixtures, limit specs and validator expectations tied to these values.
export const PDF_LIMITS = {
  maxFiles: 20,
  maxFileBytes: 15 * 1024 * 1024,
  maxTotalBytes: 80 * 1024 * 1024,
  maxPixelsPerFile: 24_000_000,
  maxMarginMm: 50,
} as const;

export const PDF_LIMIT_DISPLAY = {
  maxFileMiB: PDF_LIMITS.maxFileBytes / 1024 / 1024,
  maxTotalMiB: PDF_LIMITS.maxTotalBytes / 1024 / 1024,
  maxPixelsMP: PDF_LIMITS.maxPixelsPerFile / 1_000_000,
} as const;

export const mmToPt = (mm: number) => mm * 72 / 25.4;

export function resolvePageBox(pageSize: PdfPageSize, orientation: PdfOrientation, imageWidth: number, imageHeight: number) {
  const preset = PDF_PAGE_PRESETS[pageSize];
  const actual = orientation === "auto" ? (imageWidth > imageHeight ? "landscape" : "portrait") : orientation;
  return actual === "landscape"
    ? { width: preset.heightPt, height: preset.widthPt, orientation: actual }
    : { width: preset.widthPt, height: preset.heightPt, orientation: actual };
}

export function containBox(pageWidth: number, pageHeight: number, marginMm: number, imageWidth: number, imageHeight: number) {
  const margin = mmToPt(marginMm);
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;
  if (!(availableWidth > 0) || !(availableHeight > 0) || !(imageWidth > 0) || !(imageHeight > 0)) throw new Error("INVALID_LAYOUT");
  const scale = Math.min(availableWidth / imageWidth, availableHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height, margin };
}

export function safePdfFilename(value: string) {
  const trimmed = value.trim().replace(/\.pdf$/i, "").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").replace(/\s+/g, " ").slice(0, 120);
  return `${trimmed || "image-to-pdf"}.pdf`;
}

function ascii(text: string) { return new TextEncoder().encode(text); }
function concat(parts: Uint8Array[]) { const len = parts.reduce((s,p)=>s+p.length,0); const out = new Uint8Array(len); let off=0; for(const p of parts){out.set(p,off);off+=p.length;} return out; }

export type JpegPageInput = { jpeg: Uint8Array; pixelWidth: number; pixelHeight: number; pageWidth: number; pageHeight: number; x: number; y: number; drawWidth: number; drawHeight: number };

/** Minimal PDF 1.4 writer for browser-produced JPEG page images. One image = one page. */
export function buildPdfFromJpegs(pages: JpegPageInput[]) {
  if (!pages.length) throw new Error("NO_PAGES");
  const objects: Uint8Array[] = [];
  const pageObjectIds: number[] = [];
  objects[1] = ascii("<< /Type /Catalog /Pages 2 0 R >>");
  for (let i=0;i<pages.length;i++) pageObjectIds.push(3 + i*3);
  objects[2] = ascii(`<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectIds.map(id=>`${id} 0 R`).join(" ")}] >>`);
  for (let i=0;i<pages.length;i++) {
    const p=pages[i], pageId=3+i*3, imageId=pageId+1, contentId=pageId+2;
    const name=`Im${i+1}`;
    objects[pageId]=ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${p.pageWidth.toFixed(4)} ${p.pageHeight.toFixed(4)}] /Resources << /XObject << /${name} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects[imageId]=concat([ascii(`<< /Type /XObject /Subtype /Image /Width ${p.pixelWidth} /Height ${p.pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`),p.jpeg,ascii("\nendstream")]);
    const cmd=`q\n${p.drawWidth.toFixed(4)} 0 0 ${p.drawHeight.toFixed(4)} ${p.x.toFixed(4)} ${p.y.toFixed(4)} cm\n/${name} Do\nQ\n`;
    const cb=ascii(cmd);
    objects[contentId]=concat([ascii(`<< /Length ${cb.length} >>\nstream\n`),cb,ascii("endstream")]);
  }
  const header=ascii("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const chunks: Uint8Array[]=[header]; let offset=header.length; const offsets:number[]=[0];
  for(let id=1;id<objects.length;id++){
    const prefix=ascii(`${id} 0 obj\n`), suffix=ascii("\nendobj\n"); offsets[id]=offset; chunks.push(prefix,objects[id],suffix); offset += prefix.length+objects[id].length+suffix.length;
  }
  const xrefOffset=offset;
  let xref=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for(let id=1;id<objects.length;id++) xref += `${String(offsets[id]).padStart(10,"0")} 00000 n \n`;
  xref += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(ascii(xref));
  return concat(chunks);
}
