export const YOUTUBE_BANNER_GUIDELINES = {
  recommended: { width: 2560, height: 1440 },
  minimum: { width: 2048, height: 1152 },
  safeAtMinimum: { width: 1235, height: 338 },
  maxBytes: 6 * 1024 * 1024,
  aspectRatio: 16 / 9,
  acceptedBackgroundMime: ["image/jpeg", "image/png", "image/webp"] as const,
  acceptedLogoMime: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;

export const TOOL020_SERVICE_LIMITS = {
  backgroundCount: 1,
  logoCount: 1,
  backgroundMaxBytes: 20 * 1024 * 1024,
  logoMaxBytes: 5 * 1024 * 1024,
  maxSourcePixels: 40_000_000,
  maxTitleChars: 120,
  maxHistoryStates: 24,
} as const;

export type DevicePreviewMode = "tv" | "desktop" | "mobile" | "safe";
export type NormalizedPoint = { x: number; y: number };

export function scaledSafeArea(width = YOUTUBE_BANNER_GUIDELINES.recommended.width, height = YOUTUBE_BANNER_GUIDELINES.recommended.height) {
  const scaleX = width / YOUTUBE_BANNER_GUIDELINES.minimum.width;
  const scaleY = height / YOUTUBE_BANNER_GUIDELINES.minimum.height;
  const safeWidth = Math.round(YOUTUBE_BANNER_GUIDELINES.safeAtMinimum.width * scaleX);
  const safeHeight = Math.round(YOUTUBE_BANNER_GUIDELINES.safeAtMinimum.height * scaleY);
  return { width: safeWidth, height: safeHeight, x: Math.round((width - safeWidth) / 2), y: Math.round((height - safeHeight) / 2) };
}

export const TOOL020_DEVICE_PREVIEWS: Record<DevicePreviewMode, { widthRatio: number; heightRatio: number; label: string }> = {
  tv: { widthRatio: 1, heightRatio: 1, label: "TV" },
  desktop: { widthRatio: 1, heightRatio: 423 / 1440, label: "Desktop" },
  mobile: { widthRatio: 1544 / 2560, heightRatio: 423 / 1440, label: "Mobile" },
  safe: { widthRatio: scaledSafeArea().width / 2560, heightRatio: scaledSafeArea().height / 1440, label: "Safe Area" },
};

const extensionMap: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"], "image/webp": ["webp"],
};

export function validateImageFile(file: File, role: "background" | "logo") {
  const accepted = role === "background" ? YOUTUBE_BANNER_GUIDELINES.acceptedBackgroundMime : YOUTUBE_BANNER_GUIDELINES.acceptedLogoMime;
  const max = role === "background" ? TOOL020_SERVICE_LIMITS.backgroundMaxBytes : TOOL020_SERVICE_LIMITS.logoMaxBytes;
  if (!file.size) return { ok: false, code: "EMPTY_FILE" as const };
  if (!(accepted as readonly string[]).includes(file.type)) return { ok: false, code: "UNSUPPORTED_TYPE" as const };
  const ext = file.name.toLowerCase().split(".").pop() || "";
  if (extensionMap[file.type] && !extensionMap[file.type].includes(ext)) return { ok: false, code: "MIME_EXTENSION_MISMATCH" as const };
  if (file.size > max) return { ok: false, code: "FILE_TOO_LARGE" as const };
  return { ok: true, code: "OK" as const };
}

export async function isAnimatedImage(file: File) {
  const bytes = new Uint8Array(await file.slice(0, Math.min(file.size, 1024 * 1024)).arrayBuffer());
  if (file.type === "image/png") {
    const text = new TextDecoder("latin1").decode(bytes);
    return text.includes("acTL");
  }
  if (file.type === "image/webp") {
    const text = new TextDecoder("latin1").decode(bytes);
    return text.includes("ANIM");
  }
  return false;
}

export function sanitizeDownloadName(original: string | undefined, format: "jpg" | "png") {
  const fallback = "youtube-channel-banner";
  const source = original ? original.replace(/\.[^.]+$/, "") + "-banner" : fallback;
  let base = source.replace(/[<>:"/\\|?*\x00-\x1F]/g, "-").trim().replace(/[. ]+$/g, "");
  if (!base) base = fallback;
  if (base.length > 100) base = base.slice(0, 100).replace(/[. ]+$/g, "");
  return `${base}.${format}`;
}

export function clampNormalized(v: number) { return Math.max(0, Math.min(1, v)); }
