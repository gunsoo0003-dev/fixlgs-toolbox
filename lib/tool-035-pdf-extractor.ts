export const TOOL035_SERVICE_LIMITS = {
  inputFiles: 1,
  fileBytes: 50 * 1024 * 1024,
  pages: 200,
  extractedImagesWarning: 500,
  extractedImagesHardStop: 1000,
  pageConcurrency: 1,
} as const;

export const TOOL035_LIMIT_STATUS = "APPROVED_2026_08_15" as const;

export type Tool035Mode = "text" | "images" | "both";
export type Tool035PageScope = "all" | "selected" | "custom";

export function safeTool035BaseName(filename: string) {
  const base = filename.replace(/\.pdf$/i, "").trim() || "source";
  return base
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, 100) || "source";
}

export function safeTool035ZipPath(path: string) {
  return path
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .map((part) => part.replace(/[\\:*?"<>|\u0000-\u001f]/g, "-").replace(/[. ]+$/g, "").slice(0, 120) || "file")
    .join("/");
}

export function parseTool035PageRange(value: string, pageCount: number) {
  if (!Number.isInteger(pageCount) || pageCount < 1) return [];
  const input = value.trim();
  if (!input) throw new Error("EMPTY_RANGE");
  const selected = new Set<number>();
  for (const tokenRaw of input.split(/[\s,;]+/)) {
    const token = tokenRaw.trim();
    if (!token) continue;
    if (/^\d+$/.test(token)) {
      const page = Number(token);
      if (page < 1 || page > pageCount) throw new Error("OUT_OF_RANGE");
      selected.add(page);
      continue;
    }
    const match = token.match(/^(\d+)-(\d+)$/);
    if (!match) throw new Error("INVALID_RANGE");
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (start < 1 || end < 1 || start > pageCount || end > pageCount || start > end) throw new Error("OUT_OF_RANGE");
    for (let page = start; page <= end; page += 1) selected.add(page);
  }
  return [...selected].sort((a, b) => a - b);
}

export function pageNumberLabel(page: number, totalPages: number) {
  const digits = Math.max(3, String(totalPages).length);
  return String(page).padStart(digits, "0");
}

export function tool035ImageName(page: number, imageIndex: number, totalPages: number, extension = "png") {
  return `page-${pageNumberLabel(page, totalPages)}-image-${String(imageIndex).padStart(3, "0")}.${extension}`;
}

export function tool035PageTextName(page: number, totalPages: number) {
  return `page-${pageNumberLabel(page, totalPages)}.txt`;
}

export function tool035TextFilename(sourceName: string) {
  return `${safeTool035BaseName(sourceName)}-text.txt`;
}

export function tool035ImagesZipFilename(sourceName: string) {
  return `${safeTool035BaseName(sourceName)}-images.zip`;
}

export function tool035CombinedZipFilename(sourceName: string) {
  return `${safeTool035BaseName(sourceName)}-extracted.zip`;
}

export type Tool035TextItemLike = {
  str?: string;
  hasEOL?: boolean;
  transform?: number[];
};

/**
 * Conservative text reconstruction: preserve PDF.js item order and only add a
 * line break when PDF.js reports EOL or the baseline changes materially.
 */
export function textItemsToPlainText(items: Tool035TextItemLike[]) {
  let output = "";
  let previousY: number | null = null;
  let previousText = "";
  for (const item of items) {
    const text = typeof item.str === "string" ? item.str : "";
    const y = Array.isArray(item.transform) && Number.isFinite(item.transform[5]) ? item.transform[5] : null;
    if (output && y !== null && previousY !== null && Math.abs(y - previousY) > 3 && !output.endsWith("\n")) output += "\n";
    else if (output && text && previousText && !/[\s\n]$/.test(output) && !/^[,.;:!?%)\]}]/.test(text) && !/[([{]$/.test(previousText)) output += " ";
    output += text;
    if (item.hasEOL && !output.endsWith("\n")) output += "\n";
    if (y !== null) previousY = y;
    if (text) previousText = text;
  }
  return output.replace(/[ \t]+\n/g, "\n").replace(/\n{4,}/g, "\n\n\n").trimEnd();
}

export function buildTool035DocumentText(pages: Array<{ pageNumber: number; text: string }>, totalPages: number) {
  const digits = Math.max(3, String(totalPages).length);
  return pages
    .map(({ pageNumber, text }) => `===== PAGE ${String(pageNumber).padStart(digits, "0")} =====\n${text}`)
    .join("\n\n");
}

export function characterCount(value: string) {
  return [...value].length;
}
