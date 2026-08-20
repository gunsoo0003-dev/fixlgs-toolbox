# TOOL066 HANDOFF

- 도구: 066 부가세 계산기 / VAT Calculator / 消費税計算ツール
- 카테고리: H. 사업·금융 계산기 (`business-finance`)
- slug: `vat-calculator`
- 예상 URL: `/ko|en|ja/vat-calculator`
- 보조작업장 상태: READY — CODE PASS / FUNCTION-STATIC PASS / DESIGN-CODE PASS / HARNESS-STRUCTURE PASS / PACKAGE 준비 / COMMON FILE PROTECTION PASS

## 구현 기능
- 공급가액→부가세·합계
- 부가세 포함 합계→공급가액·부가세 역산
- 포함/별도 전환
- 기본 10% preset
- custom rate 0~100% 참고 계산
- 공급가액+VAT→유효 세율 역산
- 공급가액/VAT/합계 3카드
- formula/breakdown
- copy/reset
- KRW 표시 precision 0~2, 내부 산술 precision 유지
- 납부세액 아님 안내
- KO/EN/JA 및 066 전용 metadata/canonical/hreflang/JSON-LD/FAQ

## 이식 대상 전용 파일
- `app/[locale]/vat-calculator/page.tsx`
- `components/tool-066-vat-calculator-page.tsx`
- `components/tool-066-vat-calculator.tsx`
- `components/tool-066-vat-calculator.module.css`
- `lib/tool-066-vat.ts`
- `tests/fixtures/tool-066/cases.json`
- `tests/tool-066-preflight.spec.ts`
- `tests/tool-066-core.spec.ts`
- `tests/tool-066-feature.spec.ts`
- `tests/tool-066-rate.spec.ts`
- `tests/tool-066-inclusive.spec.ts`
- `tests/tool-066-roundtrip.spec.ts`
- `tests/tool-066-legal-warning.spec.ts`
- `tests/tool-066-boundary.spec.ts`
- `tests/tool-066-regression.spec.ts`
- `tests/tool-066-limit.spec.ts`
- `scripts/tool-066/check-source.mjs`
- `scripts/tool-066/check-design.mjs`
- `scripts/tool-066/check-harness.mjs`
- `scripts/tool-066/check-logic.mjs`
- `scripts/tool-066/run-static-validation.mjs`

## 원본/검수자료
`docs/tool-066/` 전체. 원본 제작전달서는 `docs/tool-066/source/`에 변경 없이 보존.

## 공통파일 보호
- `app/globals.css` 및 `styles/*.css`: 원본 ZIP과 SHA-256 동일.
- `lib/site.ts`, `app/sitemap.ts`, `package.json`: 066 변경 없음.
- legacy sealed 직접 사용 없음.
- 신규 OSS/dependency 없음.

## 주작업장 통합검증
최신 통합본에서 다음을 수행한다.
1. `lib/site.ts`에 tool066 slug/card/category 연결.
2. `app/sitemap.ts` KO/EN/JA 3 URL 추가.
3. 필요 시 package.json에 066 전용 runner script 연결(기존 script 임의 변경 금지).
4. 실제 browser/PC/mobile/KO/EN/JA/light/dark 확인.
5. Playwright: preflight→core→feature→rate→inclusive→roundtrip→legal-warning→boundary→regression→limit.
6. 061~065 및 067/068 공통영역 regression은 최신 프로젝트 존재 범위에서 수행.
7. TypeScript/production build/console/runtime/통합 FINAL.
8. 배포 후 sitemap/robots/canonical/hreflang/Search Console/색인.

## 보조작업장 실행 기록
정적 검증 중 첫 실행에서 검수기 source token 탐색이 동적 `data-testid`를 literal로 요구해 HARNESS_ERROR 1건 발생. 제품 코드는 변경하지 않고 `check-source.mjs`만 수정했고 재실행 PASS 4/4.
