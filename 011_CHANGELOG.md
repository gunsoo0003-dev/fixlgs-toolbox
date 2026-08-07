# 011 변경 파일

## 신규
- `components/image-padding-background-tool.tsx`
- `components/image-padding-background-page.tsx`
- `tests/helpers/tool-011.ts`
- `tests/tool-011-image-padding-background.spec.ts`
- `tests/tool-011-input-errors.spec.ts`
- `tests/tool-011-rendering-output.spec.ts`
- `tests/tool-011-device-theme.spec.ts`
- `tests/tool-011-regression.spec.ts`
- `tests/tool-011-limit.spec.ts`
- `scripts/check-tool-011-validator.mjs`
- `scripts/check-tool-011-source.mjs`
- `scripts/run-tool-011-preflight.mjs`
- `scripts/run-tool-011-tier-validation.mjs`
- `scripts/run-tool-011-partial-validation.mjs`
- `scripts/run-tool-011-final-validation.mjs`
- `docs/011-validation-coverage.json`
- `docs/011-design-layout-evidence.md`
- `docs/011-common-module-candidates.md`
- `docs/011-four-gate-validation.md`
- `test-fixtures/tool011-*`
- `011_STATUS.md`
- `011_RUN_COMMANDS.txt`

## 최소 공통 등록 변경
- `app/[locale]/[toolSlug]/page.tsx`: 011 라우트·메타 등록
- `app/sitemap.ts`: 011 3개 언어 URL 등록
- `lib/site.ts`: 011 도구 카드 LIVE/언어별 링크 등록
- `lib/validation/tool-registry.ts`: 011 공통 검수 등록
- `app/globals.css`: 011 내부 작업장 전용 CSS 추가
- `package.json`: 011 검수 명령 추가

## 보호 확인
- 위 허용 공통 등록 파일을 제외한 010 기준본 기존 파일 SHA-256 비교: 변경 0 / 누락 0.
