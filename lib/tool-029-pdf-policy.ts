export const MIB = 1024 * 1024;

export const TOOL029_ACTIVE_LIMITS = {
  maxFileBytes: 50 * MIB,
  maxPages: 300,
  maxOutputFiles: 300,
  maxRangeItems: 100,
} as const;

export type RangeGroup = { start: number; end: number; pages: number[] };
export type ParseResult<T> = { ok: true; value: T; warnings: string[] } | { ok: false; error: string };

function parsePositiveInt(token: string): number | null {
  if (!/^\d+$/.test(token)) return null;
  const value = Number(token);
  return Number.isSafeInteger(value) && value >= 1 ? value : null;
}

export function parseRangeGroups(input: string, totalPages: number, maxItems = TOOL029_ACTIVE_LIMITS.maxRangeItems): ParseResult<RangeGroup[]> {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "EMPTY" };
  if (/[,;/]\s*[,;/]/.test(trimmed)) return { ok: false, error: "INVALID_SYNTAX" };
  const tokens = trimmed.split(/[\n,;/]+/).map((v) => v.trim()).filter(Boolean);
  if (!tokens.length) return { ok: false, error: "EMPTY" };
  if (tokens.length > maxItems) return { ok: false, error: "TOO_MANY_RANGES" };
  const groups: RangeGroup[] = [];
  for (const token of tokens) {
    const match = token.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) return { ok: false, error: "INVALID_SYNTAX" };
    const start = parsePositiveInt(match[1]);
    const end = parsePositiveInt(match[2] ?? match[1]);
    if (!start || !end) return { ok: false, error: "INVALID_PAGE" };
    if (start > end) return { ok: false, error: "REVERSED_RANGE" };
    if (end > totalPages) return { ok: false, error: "OUT_OF_RANGE" };
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    groups.push({ start, end, pages });
  }
  const counts = new Map<number, number>();
  groups.flatMap((g) => g.pages).forEach((page) => counts.set(page, (counts.get(page) ?? 0) + 1));
  const overlap = [...counts.entries()].filter(([, count]) => count > 1).map(([page]) => page);
  return { ok: true, value: groups, warnings: overlap.length ? [`OVERLAP:${overlap.join(",")}`] : [] };
}

export function parsePageSelection(input: string, totalPages: number): ParseResult<number[]> {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, value: [], warnings: [] };
  if (/[,;/]\s*[,;/]/.test(trimmed)) return { ok: false, error: "INVALID_SYNTAX" };
  const tokens = trimmed.split(/[\n,;/]+/).map((v) => v.trim()).filter(Boolean);
  const pages: number[] = [];
  for (const token of tokens) {
    const match = token.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) return { ok: false, error: "INVALID_SYNTAX" };
    const start = parsePositiveInt(match[1]);
    const end = parsePositiveInt(match[2] ?? match[1]);
    if (!start || !end) return { ok: false, error: "INVALID_PAGE" };
    if (start > end) return { ok: false, error: "REVERSED_RANGE" };
    if (end > totalPages) return { ok: false, error: "OUT_OF_RANGE" };
    for (let page = start; page <= end; page += 1) pages.push(page);
  }
  const unique = [...new Set(pages)].sort((a, b) => a - b);
  return { ok: true, value: unique, warnings: unique.length !== pages.length ? ["DUPLICATES_REMOVED"] : [] };
}

export function sanitizePdfBaseName(value: string, fallback = "document") {
  const clean = value
    .replace(/\.[Pp][Dd][Ff]$/, "")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\.\.+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, 100)
    .trim();
  return clean || fallback;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MIB) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / MIB).toFixed(1)} MB`;
}

export function pageListLabel(pages: number[], max = 20) {
  if (pages.length <= max) return pages.join(", ");
  return `${pages.slice(0, max).join(", ")} … +${pages.length - max}`;
}
