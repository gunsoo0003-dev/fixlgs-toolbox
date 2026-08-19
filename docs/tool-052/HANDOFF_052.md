# HANDOFF TOOL052

## 기본정보
- 번호: TOOL052
- 도구명: 세계시간·타임존 변환기
- category: F. 날짜·시간
- slug: `world-time-timezone-converter`
- 예상 URL: `/ko|en|ja/world-time-timezone-converter`
- 보조작업장 상태: READY (정적/구조/로직/디자인코드/하네스구조/패키지 기준)

## 구현 기능
도시 검색·추가·삭제·순서 변경, UTC/도시 기준 지정시각, 현재시간 갱신, 다중도시 비교, 날짜경계, UTC offset, DST 상태, 12/24시간제, DST nonexistent/ambiguous 처리, 최대 12도시, 30/45분 offset, 결과복사, 도시별 업무시간과 공통 회의시간.

## IANA / 타임존 데이터
- 전달서 기준 release metadata: IANA TZDB 2026c / 2026-07-08.
- 도시 metadata와 release metadata는 `lib/tool-052-timezone-data.ts`로 분리.
- 실제 계산은 브라우저의 `Intl.DateTimeFormat` IANA zone rules를 사용하므로 브라우저/OS가 가진 tzdata 버전이 실제 rule source다.
- 따라서 '2026c 규칙을 자체 bundle로 완전 고정'한 구조는 아니다. 주작업장은 production 대상 브라우저에서 대표 zone offset 전환을 재검증하고, 향후 exact-version pin이 필요하면 전용 tzdata bundle/OSS 도입을 별도 판단한다.

## 이식 대상 파일
1. `app/[locale]/world-time-timezone-converter/page.tsx`
2. `components/tool-052-world-time-tool.tsx`
3. `components/tool-052-world-time-tool.module.css`
4. `lib/tool-052-timezone.ts`
5. `lib/tool-052-timezone-data.ts`
6. `tests/tool-052-preflight.spec.ts`
7. `tests/tool-052-core.spec.ts`
8. `tests/tool-052-boundary.spec.ts`
9. `tests/tool-052-feature.spec.ts`
10. `tests/tool-052-regression.spec.ts`
11. `tests/tool-052-limit.spec.ts`
12. `scripts/tool-052/check-static.mjs`
13. `scripts/tool-052/check-design.mjs`
14. `scripts/tool-052/check-harness.mjs`
15. `scripts/tool-052/check-logic.mjs`
16. `scripts/tool-052/check-boundary.mjs`
17. `scripts/tool-052/run-static-validation.mjs`
18. `scripts/tool-052/run-validation-full.mjs`
19. `playwright.tool052.config.ts`

## 공통파일
- 수정 0건.
- 원본 프로젝트 ZIP과 `diff -qr` 재대조 결과 기존 파일 내용 차이 0건, TOOL052 신규 파일만 존재.
- app/globals.css / styles 공통 / sealed / 기존 완료도구 / 기존 검수기 미수정.

## 주작업장 연결 필요
- 최신 통합본의 category/date-time 카드 및 site registry에 TOOL052 연결.
- sitemap/robots를 현재 통합 규칙에 맞게 반영.
- 최신 048~051이 이 보조작업장 제공 ZIP에는 없으므로 045~051 전체 회귀는 주작업장 최신본에서 수행.
- Playwright actual preflight -> core -> boundary -> feature -> regression -> limit -> FINAL.
- PC/mobile KO/EN/JA light/dark 실렌더링, production build, 배포, Search Console, 색인 기록.

## 검수 결과
- syntax transpile: 4/4 PASS
- `node scripts/tool-052/run-static-validation.mjs`: PASS / fail=0
- logic: Seoul +09:00, Kolkata +05:30, Eucla +08:45, NY spring nonexistent, NY fall ambiguous PASS
- HARNESS STRUCTURE: PASS
- DESIGN-CODE: PASS
- 실제 Playwright/브라우저/build: 최신 보조작업장 최상위 규칙에 따라 주작업장 통합검증
