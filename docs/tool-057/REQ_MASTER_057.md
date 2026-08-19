# TOOL057 REQ MASTER — 속도·연비·에너지 변환기

기준: FIXLGS_TOOLBOX_057 최종 제작전달서(2026-08-19) + 보조작업장 1/2/3차 최신 최상위 개정.

| REQ-ID | 요구사항 | 구현/검증 근거 | 보조작업장 판정 |
|---|---|---|---|
| 057-F01 | 속도 km/h·mph·m/s | `lib/tool-057-units.ts`, logic checker | PASS |
| 057-F01A | knots·ft/s 확장 | unit registry + summary | PASS |
| 057-F02 | 연비 km/L·L/100km·MPG | reciprocal engine | PASS |
| 057-C01 | MPG US/UK 분리 | gallon별 독립 factor + fixture | PASS |
| 057-F03 | 에너지 J/kJ/MJ/Wh/kWh/cal/kcal/BTU | J canonical registry | PASS |
| 057-F03P | 전력 W/kW/MW·hp·PS·BTU/h | W canonical registry | PASS |
| 057-C02 | kW vs kWh 분리 | energy/power 별도 group/subtab | PASS |
| 057-C03 | hp vs PS 분리 | 독립 watt factor + fixture | PASS |
| 057-F04 | 대표 결과 동시 표시 최대 6 | `summarizeTool057` + summary grid | PASS |
| 057-F05 | From/To/Swap/Precision/Copy/Reset | 전용 component | PASS |
| 057-F06 | 즉시 계산 | state 기반 render 계산 | PASS |
| 057-V01 | fuel > 0 | FUEL_NON_POSITIVE | PASS |
| 057-V02 | speed/energy/power zero 허용 | logic checker | PASS |
| 057-V03 | 일반 음수 오류 | NEGATIVE_VALUE | PASS |
| 057-V04 | 절대값 상한 1e15 | VALUE_LIMIT | PASS |
| 057-V05 | precision 최대 8 | range + formatter clamp | PASS |
| 057-C04 | all-group round-trip | logic checker 4개 group | PASS |
| 057-L01 | KO/EN/JA | component/page copy | PASS |
| 057-L02 | JA mobile overflow 방지 코드 | min-width/overflow-wrap/mobile grid | PASS (code) |
| 057-S01 | canonical/hreflang | route metadata | PASS |
| 057-S02 | WebApplication structured data | page JSON-LD | PASS |
| 057-P01 | 브라우저 로컬 처리 안내 | LOCAL notice + no API/server code | PASS |
| 057-P02 | 실제 숫자 analytics 전송 없음 | 057 전용 코드 전송 로직 없음 | PASS |
| 057-D01 | MAIN TOOL055 디자인 계열 | DESIGN checker | PASS |
| 057-D02 | 전용 module.css | 057 module only | PASS |
| 057-D03 | 공통/legacy CSS 보호 | baseline SHA 비교 | PASS |
| 057-H01 | selector/fixture/checker 구조 | harness checker | PASS |
| 057-Q01 | static FAIL0 | final static validation | PASS |
| 057-Q02 | PC/mobile 실제 viewport | 최신 통합본 필요 | 주작업장 통합검증 |
| 057-Q03 | 실제 KO/EN/JA/light/dark | 최신 통합본 필요 | 주작업장 통합검증 |
| 057-Q04 | Playwright actual run | node_modules/runtime 없음 | 주작업장 통합검증 |
| 057-Q05 | production build/full regression | 최신 통합본 필요 | 주작업장 통합검증 |
| 057-I01 | category card/site registry/sitemap 등록 | 공통 보호 대상 | 주작업장 통합작업 |
| 057-I02 | 배포/Search Console/색인 | 주작업장 범위 | 주작업장 통합작업 |
