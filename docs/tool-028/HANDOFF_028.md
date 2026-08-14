# TOOL 028 PDF 합치기 — HANDOFF

## 상태
`MAIN_INTEGRATED_LIMIT_APPROVED_VALIDATOR_READY`

## 구현 대상
- 번호: 028
- 카테고리: D. PDF 도구
- slug: `merge-pdf`
- KO: PDF 합치기
- EN: Merge PDF
- JA: PDF 結合ツール
- 경로: `/{locale}/merge-pdf`

## 구현 완료 기능
1. 여러 PDF 파일 추가/병합.
2. 업로드 순서 보존 및 stable id 기반 파일 카드.
3. PC drag + 모바일/키보드 First/Up/Down/Last 순서 이동.
4. 파일별 첫 페이지 thumbnail + 전체 page preview.
5. 파일별 페이지 수/파일 크기, 총 페이지 수/총 용량 표시.
6. 결과 파일명 설정/정규화.
7. `pdf-lib` copyPages 기반 원본 PDF page object 병합.
8. 결과 PDF 재파싱 및 pageCount 검증 후 다운로드 허용.
9. corrupt/encrypted/non-PDF 입력 식별 및 오류 표시.
10. 브라우저 로컬 처리. 제품 코드에 파일 서버 전송 경로 없음.
11. KO/EN/JA 콘텐츠, HOW TO, 전문가형 WORKFLOW GUIDE, 주의사항, FAQ.
12. canonical/hreflang/JSON-LD.

## 신규 의존성
- `pdf-lib@1.17.1` — PDF page copy/merge. 브라우저 로컬. 무료 OSS. 외부전송/운영비 없음.
- 기존 `pdfjs-dist@5.4.54` 보호 — TOOL027 FINAL PASS 버전을 그대로 재사용. 028 미리보기는 검증된 `pdfjs-dist/webpack.mjs` 동적 로더를 사용하며 외부 CDN을 사용하지 않음.
- 변경 package: `package.json`, `package-lock.json`.

## CSS
- PDF 카테고리 디자인 기준: TOOL026·027의 공식 common shell/section 및 업로드 전/후 상태전이.
- 상단 Dropzone과 하단 workspace는 동일 `dragActive` 상태를 공유하고, 외부 PDF 추가 drag와 내부 카드 reorder drag는 별도 MIME으로 분리.
- 전용 CSS: `components/merge-pdf-tool.module.css`.
- `app/globals.css`, `styles/*`, `legacy-*-sealed.css` 변경 없음.
- 전역 selector 신규 추가 없음.

## 검수기
- `playwright.tool028-runtime.config.ts`
- `scripts/tool-028/*`
- `scripts/run-mobile-real-photo-001-028.mjs`
- `scripts/check-mobile-real-photo-001-028-validator.mjs`
- `tests/tool-028-preflight.spec.ts`
- `tests/tool-028-design-state.spec.ts`
- `tests/tool-028-core.spec.ts`
- `tests/tool-028-feature.spec.ts`
- `tests/tool-028-boundary.spec.ts`
- `tests/tool-028-regression.spec.ts`
- `tests/tool-028-limit.spec.ts`
- `tests/fixtures/tool-028/*`

주작업 통합본 정적 self-check 결과: source/harness/design/package/content/syntax FAIL 0. 모바일 실기기 runner 001~028 등록 validator도 PASS.
현재 전달 ZIP에는 node_modules가 없고 실행환경 네트워크 설치가 불가하여 실제 Playwright/production build는 아직 실행하지 않았으며 `ENVIRONMENT_PENDING`으로 분리한다.

## 서비스 한도 — 사용자 승인 완료 (2026-08-15)
다음 값을 TOOL028 정식 제품/검수 기준으로 확정했다.
- maxFiles: 20
- maxFileBytes: 30MB
- maxTotalBytes: 100MB
- maxTotalPages: 300
- previewConcurrency: 1

제품 정책, KO/EN/JA 안내문, live DOM data contract, `tool-028-limit.spec.ts`, limit checker, FINAL runner를 위 값으로 동기화했다.

## 남은 본검수
1. 로컬 `npm install` 후 dependency 설치값 확인.
2. TypeScript/build 확인.
3. PC/모바일 KO/EN/JA 실렌더링, light/dark, drag/touch/keyboard/scroll/overflow.
4. 실제 A+B PDF 병합 후 5페이지 결과 재파싱.
5. 재정렬 후 marker/page order 검증.
6. mixed page size/orientation 유지 확인.
7. 암호화/손상/비 PDF 오류 및 복구 확인.
8. 모바일 실기기 runner 028 등록은 완료됨. 실제 Galaxy 실행은 PDF 카테고리 종료 시 일괄.
9. 승인 한도 limit-only 실행.
10. 전체 regression + production build + 통합 FINAL FAIL 0 / SKIP 0.

## 변경 파일
- `package.json`
- `package-lock.json`
- `app/sitemap.ts`
- `lib/site.ts`
- `components/pdf-to-image-converter-page.tsx` (027 NEXT WORK → 028 LIVE 연결만)
- `app/[locale]/merge-pdf/page.tsx`
- `components/merge-pdf-page.tsx`
- `components/merge-pdf-tool.tsx`
- `components/merge-pdf-tool.module.css`
- `lib/tool-028-pdf-policy.ts`
- `playwright.tool028-runtime.config.ts`
- `scripts/tool-028/check-content.mjs`
- `scripts/tool-028/check-limit-contract.mjs`
- `scripts/tool-028/check-design-transplant.mjs`
- `scripts/tool-028/check-harness.mjs`
- `scripts/tool-028/check-package.mjs`
- `scripts/tool-028/check-source.mjs`
- `scripts/tool-028/check-syntax.mjs`
- `scripts/tool-028/run-validation.mjs`
- `scripts/tool-028/runtime-workspace.mjs`
- `scripts/run-mobile-real-photo-001-028.mjs`
- `scripts/check-mobile-real-photo-001-028-validator.mjs`
- `tests/tool-028-preflight.spec.ts`
- `tests/tool-028-design-state.spec.ts`
- `tests/tool-028-core.spec.ts`
- `tests/tool-028-feature.spec.ts`
- `tests/tool-028-boundary.spec.ts`
- `tests/tool-028-regression.spec.ts`
- `tests/tool-028-limit.spec.ts`
- `tests/fixtures/tool-028/*`
- `docs/tool-028/*`
