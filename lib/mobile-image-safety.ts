export const MOBILE_IMAGE_MAX_DIMENSION = 2048;
export const MOBILE_IMAGE_DECODE_TIMEOUT_MS = 4_000;
export const MOBILE_FILE_READ_STAGE_TIMEOUT_MS = 6_000;

export function isMobileImageSafetyActive() {
  if (typeof window === "undefined") return false;
  try {
    const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
    if (nav.userAgentData?.mobile === true) return true;
    if (/Android|iPhone|iPod|Mobile/i.test(navigator.userAgent)) return true;
    return window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 1180px)").matches;
  } catch {
    return false;
  }
}

export function constrainForMobileMemory(width: number, height: number, maxDimension = MOBILE_IMAGE_MAX_DIMENSION) {
  if (!isMobileImageSafetyActive() || width <= 0 || height <= 0) {
    return { width, height, scaled: false, scale: 1 };
  }
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height, scaled: false, scale: 1 };
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scaled: true,
    scale,
  };
}

export function releaseCanvas(canvas?: HTMLCanvasElement | null) {
  if (!canvas) return;
  try {
    canvas.width = 0;
    canvas.height = 0;
  } catch {
    // GC remains the fallback.
  }
}

export function safeRevokeObjectUrl(url?: string) {
  if (!url?.startsWith("blob:")) return;
  try { URL.revokeObjectURL(url); } catch { /* no-op */ }
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, code: string): Promise<T> {
  let timer: number | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error(code)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) window.clearTimeout(timer);
  }
}

export function isMobileMemorySafetyError(error: unknown) {
  if (error instanceof RangeError) return true;
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /bitmap-timeout|image-timeout|file-read-timeout|memory|allocation|out of memory|canvas/i.test(message);
}

export function mobileMemoryErrorMessage(locale: "ko" | "en" | "ja") {
  if (locale === "ko") return "파일이 너무 크거나 모바일 메모리가 부족하여 처리하지 못했습니다. 더 작은 이미지로 다시 시도해 주세요.";
  if (locale === "ja") return "ファイルが大きすぎるか、モバイルのメモリが不足しているため処理できませんでした。より小さい画像でもう一度お試しください。";
  return "The file is too large or mobile memory is low. Please try again with a smaller image.";
}
