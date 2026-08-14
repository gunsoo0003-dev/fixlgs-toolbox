export const TOOL027_LIMITS = {
  // Approved TOOL027 service limits (2026-08-14). Keep product, copy, fixtures, and validators in sync.
  maxFileBytes: 50 * 1024 * 1024,
  maxPages: 100,
  maxScale: 3,
  maxCanvasPixels: 55_000_000,
  thumbnailPages: 60,
  sequentialRenderConcurrency: 1,
} as const;

export const TOOL027_LIMIT_DISPLAY = {
  maxFileMiB: TOOL027_LIMITS.maxFileBytes / 1024 / 1024,
  maxPages: TOOL027_LIMITS.maxPages,
  maxScale: TOOL027_LIMITS.maxScale,
} as const;

export function parseTool027PageRange(value: string, total: number): number[] {
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

export function safeTool027BaseName(name: string): string {
  return name
    .replace(/\.pdf$/i, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, 90) || "document";
}

export function tool027OutputName(base: string, page: number, totalPages: number, extension: "jpg" | "png") {
  const digits = Math.max(3, String(totalPages).length);
  return `${safeTool027BaseName(base)}-page-${String(page).padStart(digits, "0")}.${extension}`;
}
