# TOOL076 HANDOFF
- 도구: 076 카드 할부 계산기 / Credit Card Installment Calculator / クレジットカード分割払い計算ツール
- 카테고리: H. 사업·금융 계산기 (`business-finance`)
- slug: `credit-card-installment-calculator`
- 예상 URL: `/ko|en|ja/credit-card-installment-calculator`
- 상태: 보조작업장 READY — CODE PASS / FUNCTION-STATIC PASS / DESIGN-CODE PASS / HARNESS-STRUCTURE PASS / PACKAGE PASS / COMMON FILE PROTECTION PASS

## 구현 기능
구매금액, 할부개월, 총 할부 수수료율, 월 납부액, 총 수수료, 총 납부액, rate=0 무이자 reference, 3/6/12/24 동일-rate scenario, formula, copy/reset, KO/EN/JA, metadata/canonical/hreflang, JSON-LD/FAQ.

## 계산 계약
`fee = purchase × rate / 100`, `total = purchase + fee`, `monthly = total / months`. rate는 전체 할부기간에 적용하는 **총 할부 수수료율**이다. 카드사별 실시간 조건을 추정하지 않는다.

## 이식 대상 전용 파일
- `app/[locale]/credit-card-installment-calculator/page.tsx`
- `components/tool-076-card-installment-page.tsx`
- `components/tool-076-card-installment.tsx`
- `components/tool-076-card-installment.module.css`
- `lib/tool-076-installment.ts`
- `tests/fixtures/tool-076/cases.json`
- `tests/tool-076-preflight.spec.ts`
- `tests/tool-076-core.spec.ts`
- `tests/tool-076-zero-rate.spec.ts`
- `tests/tool-076-scenario.spec.ts`
- `tests/tool-076-boundary.spec.ts`
- `tests/tool-076-limit.spec.ts`
- `playwright.tool076.config.ts`
- `scripts/tool-076/` 전체
- `docs/tool-076/` 전체

## 공통파일 보호
app/globals.css, styles/*.css, lib/site.ts, app/sitemap.ts, package.json, 기존 완료 도구/검수기는 수정하지 않았다. 신규 OSS 없음. legacy sealed 직접 사용 없음.

## 주작업장 통합검증
1. 최신 프로젝트에서 slug/title/description/category card를 `lib/site.ts`에 안전하게 연결.
2. sitemap KO/EN/JA 3 URL 추가 및 robots 확인.
3. 실제 PC/mobile, KO/EN/JA, light/dark, 일본어 줄바꿈/overflow 확인.
4. Playwright preflight/core/zero-rate/scenario/boundary/limit 및 071~075/077+common regression.
5. TypeScript / production build / console/runtime / FINAL.
6. 배포 후 canonical/hreflang/structured data/sitemap/Search Console/색인.

## 환경 기록
제공된 다음작업용 ZIP에는 node_modules가 없어 `npx tsc --noEmit`가 Next/React/Playwright 모듈 미탐지로 실행 불가. 이는 제품 FAIL로 판정하지 않았고 실제 runtime/type/build는 주작업장 통합검증으로 이관한다.
