# TOOL070 보조작업장 체크리스트
| 항목 | 확인방법 | 증거 | 판정 |
|---|---|---|---|
| 기능 4축 | helper/fixture 독립 공식 대조 | check-logic.mjs | PASS |
| A/B 비교 | normalized full precision + epsilon | lib/tool-070-unit-price.ts | PASS |
| 절약액/절약률 | 동일 display basis 차이 | helper/result UI | PASS |
| canonical g/mL | converter 함수 및 fixture | helper + conversion spec | PASS |
| 묶음 총량 | count×per-item | helper + bundle spec | PASS |
| 입력 제한 | 1e15/1e6/30/precision8 | helper + fixture | PASS |
| KO/EN/JA | copy 객체/페이지 콘텐츠 | TSX | PASS |
| 디자인 코드 | MAIN 066/SUB 056·058 대조 | check-design.mjs | PASS |
| 전역 CSS 보호 | git/statical file scope | 신규 전용 module만 | PASS |
| harness structure | spec/fixture 연결 | check-harness.mjs | PASS |
| actual browser/Playwright | 최신 지시서상 주작업장 책임 | HANDOFF | 주작업장 통합검증 전용 |
| production build/full regression | 최신 지시서상 주작업장 책임 | HANDOFF | 주작업장 통합검증 전용 |
