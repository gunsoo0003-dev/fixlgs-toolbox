# TOOL051 HANDOFF

## 대상
- TOOL051 시간 계산기 / Time Calculator / 時間計算ツール
- Route: `/{locale}/time-calculator`
- Category: DATE & TIME
- MAIN design reference: TOOL047
- SUB design reference: TOOL046

## 구현 범위
시간 더하기·빼기 / 두 시각 차이 / 자정 넘김 명시 옵션 / 12↔24시간 변환 / 분·초 carry / 현재 시각 빠른 입력 / 결과 복사 / 초기화 / KO·EN·JA / 모바일 대응.

## 신규 전용 이식 파일
- `app/[locale]/time-calculator/page.tsx`
- `components/tool-051-time-calculator.tsx`
- `components/tool-051-time-calculator.module.css`
- `lib/tool-051-time-calculator.ts`

## 신규 전용 검수·전달 파일
- `playwright.tool051.config.ts`
- `tests/fixtures/tool-051/cases.json`
- `tests/tool-051-preflight.spec.ts`
- `tests/tool-051-core.spec.ts`
- `tests/tool-051-feature.spec.ts`
- `tests/tool-051-boundary.spec.ts`
- `tests/tool-051-regression.spec.ts`
- `tests/tool-051-limit.spec.ts`
- `scripts/tool-051/check-source.mjs`
- `scripts/tool-051/check-design.mjs`
- `scripts/tool-051/check-harness.mjs`
- `scripts/tool-051/check-logic.mjs`
- `scripts/tool-051/check-boundary.mjs`
- `scripts/tool-051/run-static-validation.mjs`
- `docs/tool-051/REQ_MASTER_051.md`
- `docs/tool-051/CHECKLIST_051.md`
- `docs/tool-051/DESIGN_CODE_CHECK_051.md`
- `docs/tool-051/LIMIT_BRIEFING_051.md`
- `docs/tool-051/HANDOFF_051.md`
- `docs/tool-051/PACKAGE_MANIFEST_TOOL051.txt`
- `docs/tool-051/STATIC_VALIDATION_RESULT.txt`
- 원본 `FIXLGS_TOOLBOX_051_시간_계산기_제작전달서(1).pdf`

## 공통파일 보호
`app/globals.css`, `styles/*` 전역 파일, `lib/site.ts`, `app/sitemap.ts`, 공통 components, 기존 완료 도구/검수기를 수정하지 않음.

## 주작업장 통합 필요
- `lib/site.ts`에 TOOL051 slug/title/description/card 등록
- `app/sitemap.ts` KO/EN/JA 051 route 등록
- 050 실제 최신 route slug 확인 후 related link 최종 정합
- 052/053 준비 상태에 따른 NEXT/RELATED 활성 상태 최종 조정
- robots 차단 여부 확인
- 실제 PC/mobile KO/EN/JA light/dark 렌더링
- Playwright preflight/core/feature/boundary/regression/limit 실행
- production build / integrated FINAL / deploy / Search Console

## 서비스 상한
시각 00:00:00~23:59:59, 시간량 최대 999:59:59. 상수는 `TOOL051_LIMITS`에서 관리.

## 의존성
신규 npm/외부 OSS 추가 없음.
