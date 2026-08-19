# TOOL057 보조작업장 최종 체크리스트

| 체크항목 | 확인방법 | 실제 증거 | 판정 |
|---|---|---|---|
| TOOL057 전용 구현 존재 | 파일 실재 확인 | SOURCE checker | PASS |
| 속도 fixture | Node 계산 | 100km/h, knot | PASS |
| fuel reciprocal | Node 계산 | 30 US MPG, 8L/100km | PASS |
| US/UK MPG 분리 | factor 비교 | logic checker | PASS |
| energy | Node 계산 | 1kWh=3.6MJ | PASS |
| power/hp/PS | Node 계산 | hp/PS watt | PASS |
| round-trip | 4 group 실행 | logic checker | PASS |
| zero/negative/large | 실제 함수 호출 | logic checker | PASS |
| precision/summary limit | 상수/실행 | checker | PASS |
| KO/EN/JA | source 대조 | source checker | PASS |
| canonical/hreflang | route source | source checker | PASS |
| WebApplication JSON-LD | page source | source checker/manual | PASS |
| MAIN 디자인 TOOL055 | CSS/DOM 비교 | design checker | PASS |
| 전용 CSS scope | source search | design checker | PASS |
| 전역 CSS 오염 0 | grep + SHA | common protection evidence | PASS |
| legacy sealed 사용 0 | grep + SHA | source/common evidence | PASS |
| HARNESS STRUCTURE | selector/fixture 대조 | harness checker | PASS |
| 검수기 자체오류 수정 | 1차 FAIL→checker 수정→재실행 | STATIC_VALIDATION_057_RECHECK | PASS |
| TSX syntax probe | global tsc parse probe | syntax error code 없음 | PASS (syntax only) |
| full typecheck | node_modules 필요 | dependency types 없음 | 주작업장 통합검증 |
| actual browser/Playwright | 최신 통합 runtime 필요 | 상위규칙 이관 | 주작업장 통합검증 |
| production build/regression | 최신 통합본 필요 | 상위규칙 이관 | 주작업장 통합검증 |
| category/site/sitemap | 공통파일 보호 | CHANGE MAP | 주작업장 통합작업 |

보조작업장 게이트: CODE PASS / FUNCTION-STATIC PASS / DESIGN-CODE PASS / HARNESS-STRUCTURE PASS / PACKAGE PASS / COMMON FILE PROTECTION PASS.
