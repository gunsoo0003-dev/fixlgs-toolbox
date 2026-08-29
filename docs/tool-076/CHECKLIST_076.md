# TOOL076 CHECKLIST
| 항목 | 근거 | 판정 |
|---|---|---|
| 구매금액/개월/수수료율 | 전용 UI + helper | PASS |
| 총수수료/총납부/월납부 | helper + fixture | PASS |
| rate=0 | zero-rate spec + fixture | PASS |
| 3/6/12/24 | compareTool076 + scenario spec | PASS |
| 동일 rate scenario 의미 | UI assumption 문구 | PASS |
| fee-rate 의미 공개 | tool076-fee-definition | PASS |
| KO/EN/JA | page + client copy | PASS |
| canonical/hreflang | 전용 route | PASS |
| WebApplication/Breadcrumb/FAQ | page JSON-LD | PASS |
| local-only/no network | source static check | PASS |
| 서비스 상한 | 1e15 / 100% / 120 / scenario4 | PASS |
| MAIN 디자인 기준 | TOOL066 공식 common shell/finance card 패턴 | PASS (CODE) |
| module.css 분리 | 전용 CSS | PASS |
| legacy sealed 직접 사용 | 없음 | PASS |
| globals/styles 전역 수정 | 없음 | PASS |
| 실제 browser/Playwright | node_modules 없는 전달 사본 | 주작업장 통합검증 |
| TypeScript/production build | node_modules 없는 전달 사본 | 주작업장 통합검증 |
| category/site/sitemap/index | 공통파일 보호 | 주작업장 통합검증 |
