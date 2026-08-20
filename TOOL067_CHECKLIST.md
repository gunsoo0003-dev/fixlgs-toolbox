# TOOL067 보조작업장 최종 체크리스트

| 항목 | 증거 | 판정 |
|---|---|---|
| 도구번호/명/카테고리/slug | 067 / 판매가격·마진 / business-finance / selling-price-margin-calculator | PASS |
| 원가+판매가 핵심식 | check-logic 10000/15000 | PASS |
| 마진/마크업 분모 분리 | 33.3333% vs 50% | PASS |
| 목표 마진 가격 | 20%→12500, 25%→13333.3333 | PASS |
| 허용 원가 | 20000@25%→15000 | PASS |
| 손실 | 10000/8000→-2000/-25% | PASS |
| 0/99/100 경계 | target 0/99 PASS, 100 error | PASS |
| 서비스 상한 | 1e15, precision8, input30 | PASS |
| KO/EN/JA 구조 | source checker | PASS |
| canonical/hreflang | route source checker | PASS |
| FAQ/JSON-LD | page source checker | PASS |
| 디자인 MAIN/SUB | 062 MAIN / 063 SUB | PASS |
| module.css 격리 | source/design/protection checker | PASS |
| 전역 CSS 오염 | 변경 없음 | PASS |
| legacy sealed 참조 | 없음 | PASS |
| HARNESS STRUCTURE | checker 14/14 | PASS |
| 검수 spec 구조 | checker 28/28 | PASS |
| 실제 브라우저/Playwright | node_modules 없는 전달 사본 | 주작업장 통합검증 |
| production build | node_modules 없는 전달 사본 | 주작업장 통합검증 |
| 통합 061~066/068 regression | 최신 통합본 필요 | 주작업장 통합검증 |
| category/sitemap/robots 연결 | 공통파일 보호 범위 | 주작업장 통합검증 |
| 배포/색인 | 주작업장 범위 | 주작업장 통합검증 |
