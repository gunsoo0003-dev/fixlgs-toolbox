# TOOL068 보조작업장 체크리스트

## 1. CODE / FUNCTION-STATIC
- [x] 판매금액, 수수료율, 고정 수수료 구현
- [x] 판매자 부담 배송비, 고객에게 받은 배송비 분리
- [x] 기타 비용 구현
- [x] 상품원가와 정산금/순이익 분리
- [x] 실효 수수료율 구현
- [x] 목표 순이익 역산 구현
- [x] 0%, 100%, 음수, 1e15 상한 구조
- [x] 정산금과 순이익 이중차감 방지 구조
- [x] Copy / Reset
- [x] 로컬 계산, 외부 API 없음

## 2. LOCALE / CONTENT
- [x] KO
- [x] EN
- [x] JA
- [x] 사용 방법 5단계
- [x] 주의사항
- [x] FAQ 6개
- [x] WebApplication / BreadcrumbList / FAQPage JSON-LD
- [x] canonical / hreflang / x-default route metadata

## 3. DESIGN-CODE
- [x] MAIN=TOOL066
- [x] 공통 shell/class 재사용
- [x] 전용 module.css 사용
- [x] app/globals.css 신규 selector 0건
- [x] styles 전역 TOOL068 selector 0건
- [x] legacy sealed 직접 사용 0건
- [x] mobile breakpoint 코드

## 4. HARNESS
- [x] fixture
- [x] preflight spec
- [x] core spec
- [x] feature spec
- [x] shipping ownership spec
- [x] reverse target spec
- [x] boundary spec
- [x] limit spec
- [x] design spec
- [x] regression spec
- [x] independent static formula check
- [x] secret scan

## 5. 실제 판정
- CODE PASS: PASS
- FUNCTION-STATIC PASS: PASS
- DESIGN-CODE PASS: PASS
- HARNESS-STRUCTURE PASS: PASS
- COMMON FILE PROTECTION PASS: PASS
- PACKAGE PASS: ZIP 재개봉 후 확정
- 브라우저/Playwright/production build/통합 regression: 주작업장 통합검증 전용
