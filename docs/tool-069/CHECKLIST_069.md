# TOOL069 보조작업장 체크리스트

| 체크항목 | 확인방법 | 실제 증거 | 판정 |
|---|---|---|---|
| 원본 069 필수축 | 제작전달서 대조 | fixed/selling/variable/CM/BE units/revenue 구현 | PASS |
| 계산식 | source token + fixture 독립 검산 | STATIC_VALIDATION_069.txt | PASS |
| 목표이익/판매량 확장 | fixture 독립 검산 | base/target/volume PASS | PASS |
| contribution 0/negative | engine + boundary spec | impossible branch | PASS |
| decimal ceil | fixture 750.25→751 | cases.json | PASS |
| KO/EN/JA | 정적 문자열 대조 | page/client | PASS |
| responsive | module media query | 820px/560px | PASS (CODE) |
| MAIN 디자인 | TOOL066 DOM/common shell 대조 | DESIGN-CODE checker | PASS |
| 전용 CSS 물리분할 | module.css 존재 | global CSS 추가 0 | PASS |
| legacy sealed | source 검색 | 직접 사용 0 | PASS |
| HARNESS structure | testid/spec 대조 | checker PASS | PASS |
| 공통파일 보호 | 원본 SHA-256 대조 | protection PASS | PASS |
| 신규 dependency | package diff | 없음 | PASS |
| 실브라우저/Playwright/build | 최신 최상위 지시대로 이관 | HANDOFF 통합검증 목록 | 주작업장 통합검증 |
