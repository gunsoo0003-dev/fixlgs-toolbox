# TOOL045 REQ MASTER — 날짜 차이 계산기

기준: `FIXLGS_TOOLBOX_045_날짜_차이_계산기_최종제작전달서` + 보조작업장 1/2/3차 최신 최상위 개정.

| REQ | 근거 | 요구 | 구현/검증 | 판정 |
|---|---|---|---|---|
| 045-R001 | 전달서 1 | 두 날짜 사이 일수 | `calculateTool045` + total card | PASS |
| 045-R002 | 전달서 1 | 주·월·연 결과 | applied 주/나머지 + 별도 calendar period | PASS |
| 045-R003 | 전달서 1,5 | 시작일 포함 토글 | `includeStart` 정확히 +1 | PASS |
| 045-R004 | 전달서 1,5 | 평일·주말 수 | O(1) day-type 계산, invariant 검증 | PASS |
| 045-R005 | 전달서 5 | 같은 날짜 기본 0 / 포함 1 | fixture same/same-included | PASS |
| 045-R006 | 전달서 5,22 | 역순 자동 swap 금지 | `START_AFTER_END` 오류 | PASS |
| 045-R007 | 전달서 5,14 | 로컬 date-only 계산 | Gregorian serial, `Date` parsing 미사용 | PASS |
| 045-R008 | 전달서 5 | Gregorian 윤년/월길이 | leap helper + fixtures | PASS |
| 045-R009 | 전달서 5 | 주/나머지는 적용 총 일수 기준 | appliedDays / 7 | PASS |
| 045-R010 | 전달서 6,22 | 30/365 단순 환산 금지 | complete calendar unit algorithm | PASS |
| 045-R011 | 전달서 5 | 평일+주말=적용 총 날짜 | logic checker invariant | PASS |
| 045-R012 | 전달서 7 | 시작/종료/토글/결과 첫 화면 | 전용 tool component | PASS |
| 045-R013 | 전달서 7 | 미완성 입력 오결과 금지 | empty state 유지 | PASS |
| 045-R014 | 전달서 7 | 결과 카드 순서 | 총 일수→주/일→달력→평일→주말 | PASS |
| 045-R015 | 전달서 7 | reset | `tool045-reset` | PASS |
| 045-R016 | 전달서 8 | PC 2열 날짜 | `.dateGrid` 2 columns | PASS |
| 045-R017 | 전달서 8 | mobile 1열 | 720px breakpoint | PASS |
| 045-R018 | 전달서 8 | KO/EN/JA | tool/page/metadata 3개 언어 | PASS |
| 045-R019 | 전달서 9 | 서버 저장·전송 없음 | 클라이언트 계산, fetch/API 없음 | PASS |
| 045-R020 | 전달서 10,11 | 윤년/평년/월말/연말/주말 fixture | cases.json | PASS |
| 045-R021 | 전달서 12 | 독립 expected exact equality 준비 | fixtures + check-logic + Playwright specs | PASS |
| 045-R022 | 전달서 15 | H1/메타/FAQ/JSON-LD | route/page component | PASS |
| 045-R023 | 전달서 16 | label/aria/focus/error live | labels, aria-label, role alert | PASS |
| 045-R024 | 전달서 17 | 046/047/050 연결 경계 | coming/related cards, 기능 미구현 | PASS |
| 045-R025 | 전달서 22 | 046/047/050 대표기능 중복 금지 | date add/D-day/holiday 로직 없음 | PASS |
| 045-R026 | 1/2/3차 | 공통 CSS 절대보호 | global/style/sealed TOOL045 오염 0 | PASS |
| 045-R027 | 1/3차 | 신규 전용 module.css | dedicated CSS module | PASS |
| 045-R028 | 1/3차 | MAIN 기준 도구 필수 | MAIN TOOL036, SUB TOOL039 | PASS |
| 045-R029 | 2차 | HARNESS STRUCTURE READY | selectors/fixtures/specs 정적 대조 | PASS |
| 045-R030 | 3차 | 디자인 후 harness 재대입 | 최종 selector 기준 check-harness 재실행 | PASS |
| 045-R031 | 전달서 13 | 서비스 유효상한 사용자 승인 | 임의 서비스 cap 미적용; 기술상 4-digit Gregorian 범위만 helper에 명시 | 주작업장 통합검증 전용 |
| 045-R032 | 최신 1/2/3차 | 실제 browser/Playwright/build/통합 FINAL | 보조작업장 최신 최상위 정정에 따라 이관 | 주작업장 통합검증 전용 |
| 045-R033 | 전달서 19 | REQ 1차→2차 누락탐색→재대입 | 본 master 최종 재대입 | PASS |
| 045-R034 | 전달서 23 | 전달 ZIP 구조/HANDOFF 1:1 | ZIP 재개봉 목록 검사 | PASS |

## 2차 독립 누락 탐색
원본 전달서 1~27 섹션을 다시 대조했다. 공휴일/영업일, 날짜 더하기·빼기, D-day 반복, 시간대·시각 차이, 여러 기간 합산은 명시적 제외 범위이므로 구현하지 않았다.

## 최종 재대입
필수 보조작업장 범위 FAIL 0 / NOT VERIFIED 0. `045-R031`, `045-R032`만 문서상 주작업장 통합검증 전용으로 분리한다.
