export const TOOL030_LIMIT_CANDIDATES = {
  inputFileBytes: [50 * 1024 * 1024, 80 * 1024 * 1024],
  sourcePages: [100, 150],
  editedPages: [150, 200],
  thumbnailConcurrency: [2, 4],
  historySteps: [30, 50],
} as const;

// Approved service limits — Candidate A confirmed by user on 2026-08-15.
export const TOOL030_LIMITS = {
  maxFileBytes: TOOL030_LIMIT_CANDIDATES.inputFileBytes[0],
  maxSourcePages: TOOL030_LIMIT_CANDIDATES.sourcePages[0],
  maxEditedPages: TOOL030_LIMIT_CANDIDATES.editedPages[0],
  thumbnailConcurrency: TOOL030_LIMIT_CANDIDATES.thumbnailConcurrency[0],
  historySteps: TOOL030_LIMIT_CANDIDATES.historySteps[0],
} as const;

export const TOOL030_LIMIT_DISPLAY = {
  maxFileMiB: TOOL030_LIMITS.maxFileBytes / 1024 / 1024,
  maxSourcePages: TOOL030_LIMITS.maxSourcePages,
  maxEditedPages: TOOL030_LIMITS.maxEditedPages,
  historySteps: TOOL030_LIMITS.historySteps,
} as const;

export type Tool030BlankSize = "adjacent" | "a4" | "letter";
export type Tool030BlankPosition = "before" | "after" | "first" | "last";

export type Tool030PageState = {
  id: string;
  sourcePageIndex: number | null;
  originalPageNumber: number | null;
  rotation: 0 | 90 | 180 | 270;
  isDuplicate: boolean;
  isBlank: boolean;
  width: number;
  height: number;
};

export const A4_PDF_POINTS = { width: 595.2755905512, height: 841.8897637795 } as const;
export const LETTER_PDF_POINTS = { width: 612, height: 792 } as const;

export function normalizeRotation(value: number): 0 | 90 | 180 | 270 {
  const n = ((Math.round(value / 90) * 90) % 360 + 360) % 360;
  if (n === 90 || n === 180 || n === 270) return n;
  return 0;
}

export function organizedFilename(originalName: string) {
  const base = originalName.replace(/\.pdf$/i, "").trim() || "document";
  const safe = base.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").replace(/\s+/g, " ").slice(0, 120);
  return `${safe}-organized.pdf`;
}

export function clonePageState(items: Tool030PageState[]) {
  return items.map((item) => ({ ...item }));
}

export function selectedInPageOrder(items: Tool030PageState[], selected: ReadonlySet<string>) {
  return items.filter((item) => selected.has(item.id));
}

export function moveSelected(items: Tool030PageState[], selected: ReadonlySet<string>, direction: "up" | "down" | "first" | "last") {
  if (!selected.size) return clonePageState(items);
  const selectedItems = items.filter((item) => selected.has(item.id));
  const remaining = items.filter((item) => !selected.has(item.id));
  if (!selectedItems.length || selectedItems.length === items.length) return clonePageState(items);
  if (direction === "first") return [...selectedItems, ...remaining];
  if (direction === "last") return [...remaining, ...selectedItems];

  const result = clonePageState(items);
  if (direction === "up") {
    for (let i = 1; i < result.length; i += 1) {
      if (selected.has(result[i].id) && !selected.has(result[i - 1].id)) {
        [result[i - 1], result[i]] = [result[i], result[i - 1]];
      }
    }
    return result;
  }
  for (let i = result.length - 2; i >= 0; i -= 1) {
    if (selected.has(result[i].id) && !selected.has(result[i + 1].id)) {
      [result[i], result[i + 1]] = [result[i + 1], result[i]];
    }
  }
  return result;
}

export function resolveBlankPageSize(
  items: Tool030PageState[],
  selectedIds: ReadonlySet<string>,
  position: Tool030BlankPosition,
  size: Tool030BlankSize,
) {
  if (size === "a4") return A4_PDF_POINTS;
  if (size === "letter") return LETTER_PDF_POINTS;
  if (!items.length) return A4_PDF_POINTS;

  if (position === "first") return { width: items[0].width, height: items[0].height };
  if (position === "last") {
    const last = items[items.length - 1];
    return { width: last.width, height: last.height };
  }
  const anchorIndex = items.findIndex((item) => selectedIds.has(item.id));
  if (anchorIndex < 0) return { width: items[0].width, height: items[0].height };
  const preferred = position === "before" ? items[Math.max(0, anchorIndex - 1)] ?? items[anchorIndex] : items[Math.min(items.length - 1, anchorIndex + 1)] ?? items[anchorIndex];
  return { width: preferred.width, height: preferred.height };
}

export function insertBlankPage(
  items: Tool030PageState[],
  selectedIds: ReadonlySet<string>,
  position: Tool030BlankPosition,
  blank: Tool030PageState,
) {
  if (!items.length) return [blank];
  if (position === "first") return [blank, ...items];
  if (position === "last") return [...items, blank];
  const anchorIndex = items.findIndex((item) => selectedIds.has(item.id));
  if (anchorIndex < 0) return [...items, blank];
  const insertAt = position === "before" ? anchorIndex : anchorIndex + 1;
  return [...items.slice(0, insertAt), blank, ...items.slice(insertAt)];
}

export function summarizeChanges(items: Tool030PageState[], sourceCount: number) {
  const duplicates = items.filter((item) => item.isDuplicate).length;
  const blanks = items.filter((item) => item.isBlank).length;
  const rotated = items.filter((item) => item.rotation !== 0).length;
  const sourceInstances = items.filter((item) => !item.isBlank).length;
  const deleted = Math.max(0, sourceCount - (sourceInstances - duplicates));
  return { pages: items.length, deleted, duplicates, blanks, rotated };
}
