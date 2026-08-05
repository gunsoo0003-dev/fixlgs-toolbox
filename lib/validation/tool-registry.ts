export type ValidationLocale = "ko" | "en" | "ja";
export type FunctionalSuite = "image-compressor";

export type ToolValidationDefinition = {
  id: string;
  number: string;
  name: string;
  slug: string;
  locales: readonly ValidationLocale[];
  expectedH1: Record<ValidationLocale, string>;
  functionalSuite?: FunctionalSuite;
};

export const validationTools: readonly ToolValidationDefinition[] = [
  {
    id: "tool-001",
    number: "001",
    name: "JPG·PNG·WebP 이미지 변환기",
    slug: "jpg-png-webp-image-converter",
    locales: ["ko", "en", "ja"],
    expectedH1: {
      ko: "JPG·PNG·WebP 이미지 변환기",
      en: "JPG, PNG & WebP Image Converter",
      ja: "JPG・PNG・WebP画像変換ツール",
    },
  },
  {
    id: "tool-002",
    number: "002",
    name: "HEIC·AVIF 이미지 변환기",
    slug: "heic-avif-image-converter",
    locales: ["ko", "en", "ja"],
    expectedH1: {
      ko: "HEIC·AVIF 이미지 변환기",
      en: "HEIC & AVIF Image Converter",
      ja: "HEIC・AVIF画像変換ツール",
    },
  },
  {
    id: "tool-003",
    number: "003",
    name: "SVG·BMP·TIFF 이미지 변환기",
    slug: "svg-bmp-tiff-image-converter",
    locales: ["ko", "en", "ja"],
    expectedH1: {
      ko: "SVG·BMP·TIFF 이미지 변환기",
      en: "SVG, BMP & TIFF Image Converter",
      ja: "SVG・BMP・TIFF画像変換ツール",
    },
  },
  {
    id: "tool-004",
    number: "004",
    name: "이미지 압축기",
    slug: "image-compressor",
    locales: ["ko", "en", "ja"],
    expectedH1: {
      ko: "이미지 압축기",
      en: "Image Compressor",
      ja: "画像圧縮ツール",
    },
    functionalSuite: "image-compressor",
  },
  {
    id: "tool-005",
    number: "005",
    name: "목표 용량 이미지 압축기",
    slug: "target-size-image-compressor",
    locales: ["ko", "en", "ja"],
    expectedH1: {
      ko: "목표 용량 이미지 압축기",
      en: "Target Size Image Compressor",
      ja: "目標容量画像圧縮ツール",
    },
  },
  {
    id: "tool-006",
    number: "006",
    name: "이미지 크기 변경기",
    slug: "image-resizer",
    locales: ["ko", "en", "ja"],
    expectedH1: {
      ko: "이미지 크기 변경기",
      en: "Image Resizer",
      ja: "画像サイズ変更ツール",
    },
  },
] as const;
