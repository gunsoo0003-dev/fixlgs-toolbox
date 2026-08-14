export type Tool025PresetId =
  | "kr-passport-print"
  | "kr-passport-online"
  | "us-passport-print"
  | "jp-passport-print"
  | "uk-passport-print"
  | "ca-passport-print"
  | "general-30x40"
  | "general-35x45"
  | "custom";

export type Tool025Preset = {
  id: Tool025PresetId;
  kind: "official" | "general" | "custom";
  country: "KR" | "US" | "JP" | "UK" | "CA" | "GENERAL";
  documentType: "passport-print" | "passport-online" | "id-employment" | "custom";
  printWidthMm?: number;
  printHeightMm?: number;
  pixelWidth?: number;
  pixelHeight?: number;
  headMinMm?: number;
  headMaxMm?: number;
  backgroundPolicy?: string;
  digitalFormat?: "jpg" | "png";
  maxBytes?: number;
  verifiedAt: string;
  officialSource?: string;
};

export const TOOL025_LIMITS = {
  maxFiles: 1,
  maxFileBytes: 15 * 1024 * 1024,
  maxSourcePixels: 40_000_000,
  maxCustomWidthMm: 210,
  maxCustomHeightMm: 297,
  printDpi: 300,
  a4WidthMm: 210,
  a4HeightMm: 297,
  a4MarginMm: 10,
  printGapMm: 5,
} as const;

export const TOOL025_PRESETS: readonly Tool025Preset[] = [
  { id:"kr-passport-print", kind:"official", country:"KR", documentType:"passport-print", printWidthMm:35, printHeightMm:45, headMinMm:32, headMaxMm:36, backgroundPolicy:"Uniform white background; no artificial face/background alteration.", digitalFormat:"jpg", verifiedAt:"2026-08-14", officialSource:"Republic of Korea Ministry of Foreign Affairs passport photo guidance" },
  { id:"kr-passport-online", kind:"official", country:"KR", documentType:"passport-online", printWidthMm:35, printHeightMm:45, pixelWidth:413, pixelHeight:531, headMinMm:32, headMaxMm:36, backgroundPolicy:"Uniform white background; no artificial face/background alteration.", digitalFormat:"jpg", maxBytes:500*1024, verifiedAt:"2026-08-14", officialSource:"Republic of Korea Ministry of Foreign Affairs online passport photo guidance" },
  { id:"us-passport-print", kind:"official", country:"US", documentType:"passport-print", printWidthMm:51, printHeightMm:51, headMinMm:25, headMaxMm:35, backgroundPolicy:"Plain white or off-white background; do not digitally alter the image.", digitalFormat:"jpg", verifiedAt:"2026-08-14", officialSource:"U.S. Department of State passport photo requirements" },
  { id:"jp-passport-print", kind:"official", country:"JP", documentType:"passport-print", printWidthMm:35, printHeightMm:45, headMinMm:32, headMaxMm:36, backgroundPolicy:"Use current Ministry of Foreign Affairs composition guidance; this preset does not claim automated compliance.", digitalFormat:"jpg", verifiedAt:"2026-08-14", officialSource:"Japan Ministry of Foreign Affairs passport application photo standards" },
  { id:"uk-passport-print", kind:"official", country:"UK", documentType:"passport-print", printWidthMm:35, printHeightMm:45, headMinMm:29, headMaxMm:34, backgroundPolicy:"Use current GOV.UK passport photo rules; print and digital requirements are separate.", digitalFormat:"jpg", verifiedAt:"2026-08-14", officialSource:"GOV.UK passport photo requirements" },
  { id:"ca-passport-print", kind:"official", country:"CA", documentType:"passport-print", printWidthMm:50, printHeightMm:70, headMinMm:31, headMaxMm:36, backgroundPolicy:"Canada requires commercial photographer-produced passport photos; use this as a size/layout reference only.", digitalFormat:"jpg", verifiedAt:"2026-08-14", officialSource:"Government of Canada passport photo requirements" },
  { id:"general-30x40", kind:"general", country:"GENERAL", documentType:"id-employment", printWidthMm:30, printHeightMm:40, digitalFormat:"jpg", verifiedAt:"2026-08-14" },
  { id:"general-35x45", kind:"general", country:"GENERAL", documentType:"id-employment", printWidthMm:35, printHeightMm:45, digitalFormat:"jpg", verifiedAt:"2026-08-14" },
  { id:"custom", kind:"custom", country:"GENERAL", documentType:"custom", printWidthMm:35, printHeightMm:45, digitalFormat:"jpg", verifiedAt:"2026-08-14" },
] as const;

export function mmToPx(mm:number, dpi:number=TOOL025_LIMITS.printDpi){ return Math.round((mm / 25.4) * dpi); }
export function getTool025Preset(id:Tool025PresetId){ return TOOL025_PRESETS.find((preset)=>preset.id===id) ?? TOOL025_PRESETS[0]; }
