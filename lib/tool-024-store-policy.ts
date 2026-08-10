import type { Locale } from "@/lib/site";

export type Tool024Platform = "apple" | "google";
export type Tool024StorePreset = {
  id: string;
  platform: Tool024Platform;
  label: Record<Locale, string>;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  device: string;
  frameDefault: boolean;
};

export const TOOL024_POLICY = {
  verifiedAt: "2026-08-09",
  sources: {
    apple: "Apple App Store Connect screenshot specifications",
    google: "Google Play store listing screenshot requirements",
  },
  apple: {
    formats: ["image/jpeg", "image/png"],
    noAlpha: true,
    minScreenshots: 1,
    maxScreenshots: 10,
  },
  google: {
    formats: ["image/jpeg", "image/png"],
    noAlpha: true,
    minSide: 320,
    maxSide: 3840,
    maxLongToShortRatio: 2,
    recommendedTaglineAreaRatio: 0.2,
    deviceFrameDefault: false,
  },
} as const;

export const TOOL024_PRESETS: readonly Tool024StorePreset[] = [
  { id: "apple-iphone69-p", platform: "apple", label: { ko: "App Store · iPhone 대형 · 세로", en: "App Store · Large iPhone · Portrait", ja: "App Store · 大型iPhone · 縦" }, width: 1320, height: 2868, orientation: "portrait", device: "iPhone 6.9", frameDefault: true },
  { id: "apple-iphone69-l", platform: "apple", label: { ko: "App Store · iPhone 대형 · 가로", en: "App Store · Large iPhone · Landscape", ja: "App Store · 大型iPhone · 横" }, width: 2868, height: 1320, orientation: "landscape", device: "iPhone 6.9", frameDefault: true },
  { id: "apple-ipad13-p", platform: "apple", label: { ko: "App Store · iPad 13 · 세로", en: "App Store · iPad 13 · Portrait", ja: "App Store · iPad 13 · 縦" }, width: 2064, height: 2752, orientation: "portrait", device: "iPad 13", frameDefault: true },
  { id: "apple-ipad13-l", platform: "apple", label: { ko: "App Store · iPad 13 · 가로", en: "App Store · iPad 13 · Landscape", ja: "App Store · iPad 13 · 横" }, width: 2752, height: 2064, orientation: "landscape", device: "iPad 13", frameDefault: true },
  { id: "google-phone-p", platform: "google", label: { ko: "Google Play · Phone · 세로", en: "Google Play · Phone · Portrait", ja: "Google Play · Phone · 縦" }, width: 1080, height: 1920, orientation: "portrait", device: "Phone", frameDefault: false },
  { id: "google-phone-l", platform: "google", label: { ko: "Google Play · Phone · 가로", en: "Google Play · Phone · Landscape", ja: "Google Play · Phone · 横" }, width: 1920, height: 1080, orientation: "landscape", device: "Phone", frameDefault: false },
] as const;

export const TOOL024_SERVICE_LIMITS = {
  maxFiles: 10,
  maxFileBytes: 15 * 1024 * 1024,
  maxTotalBytes: 80 * 1024 * 1024,
  maxPixels: 40_000_000,
} as const;
