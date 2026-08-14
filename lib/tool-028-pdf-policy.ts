export const TOOL028_MIN_FILES = 2;

// Approved TOOL028 service limits (2026-08-15). Keep product copy and limit checker aligned to this single policy object.
export const TOOL028_SERVICE_LIMITS = Object.freeze({
  maxFiles: 20,
  maxFileBytes: 30 * 1024 * 1024,
  maxTotalBytes: 100 * 1024 * 1024,
  maxTotalPages: 300,
  previewConcurrency: 1,
});

export const TOOL028_ACCEPT = ".pdf,application/pdf";
export const TOOL028_FALLBACK_FILENAME = "merged.pdf";

export type Tool028LimitReason =
  | "TOO_MANY_FILES"
  | "FILE_TOO_LARGE"
  | "TOTAL_TOO_LARGE"
  | "TOO_MANY_PAGES";

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

export function normalizePdfFilename(input: string): string {
  const withoutControl = input.replace(/[\u0000-\u001f\u007f]/g, "");
  const withoutForbidden = withoutControl.replace(/[<>:"/\\|?*]/g, "-");
  const edgeTrimmed = withoutForbidden.trim().replace(/[. ]+$/g, "");
  const withoutDuplicateExt = edgeTrimmed.replace(/(?:\.pdf)+$/i, "");
  const trimmed = withoutDuplicateExt.trim().replace(/[. ]+$/g, "");
  const safeBase = (trimmed || "merged").slice(0, 120).replace(/[. ]+$/g, "") || "merged";
  return `${safeBase}.pdf`;
}

export async function hasPdfSignature(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, Math.min(file.size, 1024)).arrayBuffer());
  const text = new TextDecoder("latin1").decode(head);
  return text.includes("%PDF-");
}

export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return [...items];
  const next = [...items];
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

export function canAcceptByteTotal(existingBytes: number, incomingBytes: number): boolean {
  return existingBytes + incomingBytes <= TOOL028_SERVICE_LIMITS.maxTotalBytes;
}
