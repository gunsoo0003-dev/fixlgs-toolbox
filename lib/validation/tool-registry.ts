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
  {
    id: "tool-007",
    number: "007",
    name: "웹 이미지 최적화기",
    slug: "web-image-optimizer",
    locales: ["ko", "en", "ja"],
    expectedH1: { ko: "웹 이미지 최적화기", en: "Web Image Optimizer", ja: "Web画像最適化ツール" },
  },
  {
    id: "tool-008",
    number: "008",
    name: "이미지 자르기·회전 도구",
    slug: "image-cropper-rotator",
    locales: ["ko", "en", "ja"],
    expectedH1: { ko: "이미지 자르기·회전기", en: "Image Cropper & Rotator", ja: "画像切り抜き・回転ツール" },
  },
  {
    id: "tool-009",
    number: "009",
    name: "이미지 밝기·색상 보정기",
    slug: "image-brightness-color-adjuster",
    locales: ["ko", "en", "ja"],
    expectedH1: { ko: "이미지 밝기·색상 보정기", en: "Image Brightness & Color Adjuster", ja: "画像の明るさ・色補正ツール" },
  },
  {
    id: "tool-010",
    number: "010",
    name: "이미지 모자이크·블러 도구",
    slug: "image-mosaic-blur-tool",
    locales: ["ko", "en", "ja"],
    expectedH1: { ko: "이미지 모자이크·블러 도구", en: "Image Mosaic & Blur Tool", ja: "画像モザイク・ぼかしツール" },
  },

  {
    id: "tool-011",
    number: "011",
    name: "이미지 여백·배경 추가기",
    slug: "image-padding-background-tool",
    locales: ["ko", "en", "ja"],
    expectedH1: { ko: "이미지 여백·배경 추가기", en: "Image Padding & Background Tool", ja: "画像余白・背景追加ツール" },
  },] as const;
