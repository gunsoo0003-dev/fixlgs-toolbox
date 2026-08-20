# TOOL062 REQ 추적 마스터

기준: FIXLGS TOOLBOX 웹도구 062 할인 가격 계산기 제작전달서 (2026-08-19)

| REQ-ID | 요구사항 | 구현 근거 | 검증 근거 | 판정 |
|---|---|---|---|---|
| 062-F01 | 할인율 | `tool-062-discount.ts` rate validation / 기본 모드 | 20% fixture | PASS |
| 062-F02 | 할인금액 | step `discountAmount` | 100000→20000 | PASS |
| 062-F03 | 최종가격 | sequential `after/final` | 100000→80000, 279→223.20 | PASS |
| 062-F04 | 추가 할인 | 2차 + 선택 3차 순차 적용 | 20+10, 30+10 fixtures | PASS |
| 062-C01 | 실질 할인율 | `(1-final/original)*100` | 28%, 37% | PASS |
| 062-C02 | 순차 breakdown | step before/discount/after 저장·표시 | step 1/2/3 testid | PASS |
| 062-C03 | 원래가격 역산 | `final/(1-rate/100)` | 80@20→100 | PASS |
| 062-C04 | 할인율 역산 | `(original-final)/original*100` | 150→100 = 33.3333% | PASS |
| 062-C05 | 100% reverse 오류 | `REVERSE_100` | boundary fixture | PASS |
| 062-U01 | 기본/추가 할인 flow | 3 mode tabs + additional toggle | source/design/harness checks | PASS |
| 062-L01 | KO/EN/JA | product/page localized copy | route/preflight specs prepared | PASS |
| 062-S01 | canonical/hreflang | locale route metadata | source check | PASS |
| 062-S02 | 구조화 데이터/FAQ | WebApplication/Breadcrumb/FAQPage | visible FAQ map cross-check | PASS |
| 062-P01 | 개인정보/로컬 | network API 없음 | source + secret scan | PASS |
| 062-LIM01 | 가격 상한 | `1e15` | limit fixture/spec | PASS |
| 062-LIM02 | 할인 정밀도 | 최대 8자리 | helper contract | PASS |
| 062-LIM03 | stack 단계 | 최대 3단계 | helper/UI contract | PASS |
| 062-LIM04 | 입력 문자열 | 최대 30자 | helper/input maxLength | PASS |
| 062-D01 | 디자인 MAIN | TOOL058 shell/workspace 계열 | design static check | PASS |
| 062-D02 | 디자인 SUB | TOOL051 calculator mode/tab 계열 | design static check | PASS |
| 062-CSS01 | 전역 CSS 보호 | TOOL062 전용 module.css | source hash + contamination scan | PASS |
| 062-Q01 | 보조작업장 출고 | CODE/FUNCTION-STATIC/DESIGN-CODE/HARNESS/PACKAGE/COMMON 보호 | HANDOFF + package manifest | PASS |
| 062-Q02 | 실브라우저/Playwright/build | 최신 최상위 지시서상 주작업장 통합검증 | HANDOFF에 이관 | 주작업장 통합검증 |

## 2차 독립 누락 탐색 결과
- 통화 선택은 표시 전용이며 환율 계산 없음.
- VAT/세금/배송비/수수료/cart/가격비교/계정저장은 범위 제외 유지.
- 0%/100%/>100%, zero original, final>original, reverse 100% 예외를 분리.
- 279×20%에서 소수 통화 금액이 표시 단계에서 손실되지 않도록 formatter를 보완함.
