# TOOL047 HANDOFF

## 대상
- TOOL047 디데이·기념일 계산기
- Route: `/{locale}/dday-anniversary-calculator`
- Category: DATE & TIME
- MAIN design reference: current TOOLBOX detail-page shell + closest completed date/time calculation page available in the production baseline when integrated.

## 신규 전용 파일
- `app/[locale]/dday-anniversary-calculator/page.tsx`
- `components/tool-047-dday-anniversary-tool.tsx`
- `components/tool-047-dday-anniversary-tool.module.css`
- `lib/tool-047-dday.ts`
- `docs/tool-047/REQ_MASTER_047.md`
- `docs/tool-047/HANDOFF_047.md`
- `docs/tool-047/CHECKLIST_047.md`
- `docs/tool-047/DESIGN_CODE_CHECK_047.md`
- `docs/tool-047/LIMIT_BRIEFING_047.md`
- `docs/tool-047/PACKAGE_MANIFEST_TOOL047.txt`
- `scripts/tool-047/check-static.mjs`
- `scripts/tool-047/check-logic.mjs`
- 원본 전달서

## 구현 범위
D-day / 지난 날짜 / 생일까지 / 반복 기념일 / 주요 milestone / 빠른 날짜 프리셋 / 이벤트명 / 결과 복사 / reset.

## 서비스 상한
1900-01-01 ~ 2100-12-31, milestone 1~10,000일.

## 공통파일 보호
보조작업장에서 `app/globals.css`, `styles/*` 전역 파일, 공통 component, `lib/site.ts`, `app/sitemap.ts`, 기존 완료 도구를 수정하지 않았다.

## 주작업장 통합 필요
- `lib/site.ts` TOOL047 등록/카드/관련도구 연결
- `app/sitemap.ts` KO/EN/JA route 등록
- 동적 route registry가 사용되는 경우 TOOL047 slug 등록
- canonical/hreflang 프로젝트 공통 registry와 최종 대조
- 최신 공통 CSS/레이아웃 전체 regression
- production build / Playwright / 통합 FINAL / 배포 / Search Console

## 검수 상태
- STATIC: PASS
- LOGIC: PASS
- BOUNDARY: PASS
- DESIGN-CODE: PASS (common/global CSS untouched)
- RUNTIME/BUILD: 주작업장 통합검증 필요 (이 사본에는 node_modules 없음)

## 정적 self-check
Run: `node scripts/tool-047/check-static.mjs`
Run: `node --experimental-strip-types scripts/tool-047/check-logic.mjs`
