export const TOOL031_LIMITS = {
  maxPdfBytes: 30 * 1024 * 1024,
  maxPages: 300,
  maxLogoBytes: 10 * 1024 * 1024,
  maxHeaderFooterChars: 200,
  maxWatermarkChars: 300,
} as const;

export const TOOL031_LIMIT_DISPLAY = { maxPdfMiB: 30, maxPages: 300, maxLogoMiB: 10, maxHeaderFooterChars: 200, maxWatermarkChars: 300 } as const;

export type PageRangeMode = "all" | "except-first" | "except-last" | "odd" | "even" | "custom";
export type Anchor = "top-left"|"top-center"|"top-right"|"middle-left"|"center"|"middle-right"|"bottom-left"|"bottom-center"|"bottom-right";
export type NumberFormat = "1" | "01" | "page" | "of-total";

export function parsePageRange(input: string, pageCount: number): number[] {
  const value = input.trim();
  if (!value) return [];
  const result = new Set<number>();
  for (const token of value.split(",")) {
    const part = token.trim();
    if (!part) continue;
    if (/^\d+$/.test(part)) {
      const n = Number(part);
      if (n < 1 || n > pageCount) throw new Error("RANGE_OUT_OF_BOUNDS");
      result.add(n - 1);
      continue;
    }
    const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (!match) throw new Error("RANGE_SYNTAX");
    const start = Number(match[1]); const end = Number(match[2]);
    if (start < 1 || end < 1 || start > pageCount || end > pageCount) throw new Error("RANGE_OUT_OF_BOUNDS");
    if (start > end) throw new Error("RANGE_REVERSED");
    for (let n = start; n <= end; n++) result.add(n - 1);
  }
  return [...result].sort((a,b)=>a-b);
}

export function resolvePages(mode: PageRangeMode, pageCount: number, custom: string): number[] {
  const all = Array.from({ length: pageCount }, (_, i) => i);
  if (mode === "all") return all;
  if (mode === "except-first") return all.slice(1);
  if (mode === "except-last") return all.slice(0, -1);
  if (mode === "odd") return all.filter(i => (i + 1) % 2 === 1);
  if (mode === "even") return all.filter(i => (i + 1) % 2 === 0);
  return parsePageRange(custom, pageCount);
}

export function formatPageNumber(value: number, total: number, format: NumberFormat, locale: "ko"|"en"|"ja") {
  if (format === "01") return String(value).padStart(2, "0");
  if (format === "page") return locale === "ja" ? `ページ ${value}` : locale === "ko" ? `페이지 ${value}` : `Page ${value}`;
  if (format === "of-total") return locale === "ja" ? `${value} / ${total}` : locale === "ko" ? `${value} / ${total}` : `${value} of ${total}`;
  return String(value);
}

export function safeOutputName(name: string) {
  const cleaned = name.replace(/[\\/:*?"<>|]+/g, "-").replace(/\.pdf$/i, "").trim().slice(0, 120);
  const base = cleaned || "document-numbered-watermarked";
  return `${base}.pdf`;
}
