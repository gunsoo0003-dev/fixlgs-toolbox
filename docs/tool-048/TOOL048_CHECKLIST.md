# TOOL048 CHECKLIST

| 체크항목 | 확인방법 | 실제 증거 | 판정 |
|---|---|---|---|
| 4대 핵심 기능 코드 | component/helper 대조 | `calculateTool048`, 4 result testid | PASS |
| 날짜-only/timezone 독립 | helper 검사 | Gregorian serial, Date parsing 미사용 | PASS |
| 동일일 0일 | 독립 runtime | 0y 0m 0d / elapsed 0 / D-Day | PASS |
| 미래 DOB 오류 | 독립 runtime | `DOB_AFTER_AS_OF` | PASS |
| 윤년/2월29일 | runtime + fixture | 2024-02-29 -> 2025-02-28 = 1y 0m 0d | PASS |
| 월말 | runtime + fixture | 2026-01-31 -> 2026-02-28 = 0y 1m 0d | PASS |
| 서비스 상한 | helper/UI/fixture | 1900-01-01 ~ 2100-12-31 | PASS |
| KO/EN/JA | page/tool source | 3 locale copy 존재 | PASS |
| canonical/hreflang | route page | KO/EN/JA/x-default | PASS |
| 개인정보 로컬 | source static | network/storage primitive 없음 | PASS |
| Clipboard fallback | component source | success-only completed + fallback | PASS |
| MAIN 디자인 기준 | TOOL045 대조 | DESIGN CODE CHECK | PASS |
| 전역 CSS 오염 | diff/static | 신규 전역 CSS 변경 없음 | PASS |
| legacy sealed | static | 직접 참조 0 | PASS |
| harness structure | static checker | 6 spec + fixture selector namespace | PASS |
| TypeScript 전체 | `npx tsc --noEmit` | node_modules 없음으로 dependency type 미탐지 | 주작업장 통합검증 전용 |
| 실제 browser/Playwright | 최신 지시서 | 주작업장 책임 | 주작업장 통합검증 전용 |
| sitemap/robots/category 등록 | 공통파일 보호 | 보조작업장 미수정 | 주작업장 통합검증 전용 |
| production build/FINAL | 최신 지시서 | 주작업장 책임 | 주작업장 통합검증 전용 |
