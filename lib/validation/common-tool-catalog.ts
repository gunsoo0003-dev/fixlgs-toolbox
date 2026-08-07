import { validationTools, type ToolValidationDefinition } from "./tool-registry";

const addedTools: readonly ToolValidationDefinition[] = [
  {
    id: "tool-008",
    number: "008",
    name: "이미지 자르기·회전기",
    slug: "image-cropper-rotator",
    locales: ["ko", "en", "ja"],
    expectedH1: {
      ko: "이미지 자르기·회전기",
      en: "Image Cropper & Rotator",
      ja: "画像切り抜き・回転ツール",
    },
  },
  {
    id: "tool-009",
    number: "009",
    name: "이미지 밝기·색상 보정기",
    slug: "image-brightness-color-adjuster",
    locales: ["ko", "en", "ja"],
    expectedH1: {
      ko: "이미지 밝기·색상 보정기",
      en: "Image Brightness & Color Adjuster",
      ja: "画像の明るさ・色補正ツール",
    },
  },
] as const;

/**
 * 기존 검수 레지스트리는 수정하지 않고 유지한다.
 * 신규 공통검수는 이 확장 카탈로그만 사용한다.
 */
export const commonValidationTools: readonly ToolValidationDefinition[] = Array.from(
  new Map([...validationTools, ...addedTools].map((tool) => [`${tool.number}:${tool.slug}`, tool])).values(),
);

export function findCommonValidationTool(number: string) {
  return commonValidationTools.find((tool) => tool.number === number);
}
