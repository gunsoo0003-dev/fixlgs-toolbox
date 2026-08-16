# TOOL 035 변경지도

## 구현
- `app/[locale]/pdf-text-image-extractor/page.tsx` — 035 locale route
- `components/pdf-text-image-extractor-page.tsx` — SEO/content/common sections
- `components/pdf-text-image-extractor-tool.tsx` — upload/modes/range/extraction/results/download/state
- `components/pdf-text-image-extractor-tool.module.css` — tool-only work area/responsive styles
- `lib/tool-035-pdf-extractor.ts` — service limits, safe names/ranges/text reconstruction/image filenames

## 검수자료
- `tests/tool-035-*.spec.ts` — preflight/core/boundary/feature/regression/limit
- `test-fixtures/tool-035/*` — native/scan/text/image/encrypted/corrupt/locale/special operator/limit fixtures
- `scripts/tool-035/*` — static self-check + mobile runner payload

## 공통/의존성
- `package.json`: 변경 없음
- `package-lock.json`: 변경 없음
- 기존 `pdfjs-dist 5.4.54` 재사용
- 전역 CSS/legacy sealed/common component/helper/test engine: 변경 없음
