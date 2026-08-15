export const TOOL033_ACCEPT = ".pdf,application/pdf";
export const TOOL033_SERVICE_LIMITS = Object.freeze({ maxFiles: 1, maxFileBytes: 50 * 1024 * 1024, maxPages: 200, previewPages: 5, renderConcurrency: 1 });
export const TOOL033_DEFAULT_PRESET = "balanced" as const;
export const TOOL033_PRESET_QUALITY = Object.freeze({ high: 97, balanced: 92, size: 82 });
export const TOOL033_CUSTOM_QUALITY = Object.freeze({ min: 55, max: 98 });
export type Tool033Preset = keyof typeof TOOL033_PRESET_QUALITY | "custom";

export function tool033RenderScale(preset: Tool033Preset, quality: number) {
  if (preset === "high") return 1.6;
  if (preset === "balanced") return 1.5;
  if (preset === "size") return 1.4;
  const q = Math.max(TOOL033_CUSTOM_QUALITY.min, Math.min(TOOL033_CUSTOM_QUALITY.max, quality));
  return 1.3 + ((q - TOOL033_CUSTOM_QUALITY.min) / (TOOL033_CUSTOM_QUALITY.max - TOOL033_CUSTOM_QUALITY.min)) * 0.32;
}

export function formatTool033Bytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const v = bytes / 1024 ** i;
  return `${v >= 10 || i === 0 ? v.toFixed(0) : v.toFixed(1)} ${units[i]}`;
}
export function tool033Reduction(original: number, result: number) {
  const saved = original - result;
  const percent = original > 0 && saved > 0 ? (saved / original) * 100 : 0;
  return { saved, percent, increased: saved < 0 };
}
export function tool033OutputName(name: string) {
  const base = name.replace(/\.pdf$/i, "").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").trim().replace(/[. ]+$/g, "") || "document";
  return `${base.slice(0, 110)}-compressed.pdf`;
}
export async function hasTool033PdfSignature(file: Blob) {
  const head = new Uint8Array(await file.slice(0, Math.min(file.size, 1024)).arrayBuffer());
  return new TextDecoder("latin1").decode(head).includes("%PDF-");
}
