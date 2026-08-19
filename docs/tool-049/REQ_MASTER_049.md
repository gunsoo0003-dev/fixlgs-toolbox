# TOOL049 REQ MASTER

Source basis: TOOL049 final production handoff, 139-tool list, auxiliary-workspace instructions.

| REQ | Requirement | Implementation / evidence | Status |
|---|---|---|---|
| 049-F01 | 입사·퇴사 기간 계산 | `calculateTool049Period` + main date inputs | PASS |
| 049-F02 | 연·월·일 표시 | Gregorian `tool049CalendarDuration` + `tool049-duration` | PASS |
| 049-F03 | 여러 경력 합산 | added employment rows + `totalTool049Periods` | PASS |
| 049-U01 | 현재 재직 모드 | explicit `tool049-current` checkbox | PASS |
| 049-U02 | 기준일 선택 | current mode mounts `tool049-asof` | PASS |
| 049-U03 | 오늘 빠른 선택 | `tool049-today` sets local calendar today | PASS |
| 049-U04 | 총일수 보조 표시 | exact serial-day total in `tool049-total-days` | PASS |
| 049-U05 | 결과 복사 | Clipboard API, mounted only after valid result | PASS |
| 049-U06 | 경력 행 추가/삭제 | dedicated row cards and remove controls | PASS |
| 049-U07 | 초기화/재실행 | reset clears dates, rows, result/error/status | PASS |
| 049-C01 | 역순 날짜 차단 | `START_AFTER_END` error path | PASS |
| 049-C02 | 존재하지 않는 날짜 차단 | ISO parser + month/day validation | PASS |
| 049-C03 | 윤년 처리 | Gregorian leap-year helper + fixture | PASS |
| 049-C04 | 월말 처리 | calendar duration fixture 2025-01-31 -> 2025-02-28 | PASS |
| 049-C05 | 동일 날짜 | 0 years / 0 months / 0 days / 0 total days | PASS |
| 049-C06 | 중복 경력 자동 제거 금지 | periods are summed exactly as entered; UI/FAQ warning | PASS |
| 049-C07 | 근무일·공휴일 계산 제외 | no weekday/holiday engine; TOOL050 guidance | PASS |
| 049-C08 | 급여·퇴직금·연차·법률 판단 제외 | no excluded-domain implementation | PASS |
| 049-L01 | KO/EN/JA | dedicated copy maps in page + tool | PASS |
| 049-L02 | 일본어 긴 문자열 모바일 대응 코드 | mobile one-column + overflow-safe result | PASS (CODE) |
| 049-D01 | MAIN 디자인 기준 | TOOL045 actual TSX/module/page inspected | PASS |
| 049-D02 | SUB 디자인 기준 | TOOL046 actual TSX/module/page inspected | PASS |
| 049-D03 | 전용 module CSS | `employment-tenure-calculator-tool.module.css` only | PASS |
| 049-D04 | 공통/legacy CSS 보호 | static scan shows zero TOOL049 selector additions | PASS |
| 049-A01 | input labels / native date | label-wrapped native `type=date` fields | PASS |
| 049-A02 | 오류 alert / 결과 live | `role=alert`, `aria-live=polite`, status | PASS |
| 049-P01 | 브라우저 로컬 처리 | no fetch/XHR/beacon/storage in dedicated tool | PASS |
| 049-P02 | 날짜값 Analytics 전송 금지 | no analytics/network code in dedicated implementation | PASS |
| 049-S01 | metadata/canonical/hreflang | dedicated route metadata, ko/en/ja/x-default | PASS |
| 049-S02 | WebApplication/Breadcrumb/FAQ schema | page JSON-LD generated from visible copy | PASS |
| 049-S03 | sitemap/robots/category live registration | protected common files intentionally not edited | MAIN-WORKSPACE INTEGRATION |
| 049-Q01 | dedicated preflight/core/feature/boundary/regression/limit specs | six TOOL049 specs prepared | PASS (STRUCTURE) |
| 049-Q02 | Playwright actual execution | no project dependencies/node_modules in supplied package | MAIN-WORKSPACE INTEGRATION |
| 049-Q03 | production build / integrated FINAL | latest top-level auxiliary rule assigns to main workspace | MAIN-WORKSPACE INTEGRATION |
| 049-LIM01 | maximum employment periods | total 30 periods = main + 29 added rows | PASS |
| 049-LIM02 | date technical range | parser supports Gregorian year 0001..9999 | PASS |
