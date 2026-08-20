# TOOL066 보조작업장 최종 체크리스트

| 체크항목 | 확인방법 | 실제 증거 | 판정 |
|---|---|---|---|
| 원본 범위 3축 | 전달서/REQ 대조 | REQ_MASTER_066 | PASS |
| 공급가액→VAT/합계 | 독립 fixture | STATIC_VALIDATION_066_RECHECK | PASS |
| 포함합계→공급가액/VAT | 독립 fixture | STATIC_VALIDATION_066_RECHECK | PASS |
| 세율 역산 | fixture | STATIC_VALIDATION_066_RECHECK | PASS |
| custom rate | UI source/spec | check-source + feature spec | PASS |
| 납부세액 구분 | UI source/spec | legal-warning spec | PASS |
| KO/EN/JA | copy/route static | check-source | PASS |
| 모바일/긴 숫자 코드 | CSS breakpoint/overflow | DESIGN_CODE_CHECK_066 | PASS (CODE) |
| SEO canonical/hreflang | route static | check-source | PASS |
| structured data/FAQ | page source | page component | PASS |
| 서비스 상한 | engine/fixture/spec | LIMIT_BRIEFING_066 | PASS |
| 전용 harness 구조 | spec/fixture 존재 및 expected 독립대조 | check-harness | PASS |
| 공통 CSS 보호 | 원본 ZIP hash diff | COMMON_PROTECTION_DIFF_066 | PASS |
| legacy sealed 미사용 | source/design scan | check-design | PASS |
| 신규 OSS | package 변화 없음 | CHANGE_MAP_066 | N/A (미도입) |
| 실제 browser/Playwright | 최신 지시서상 주작업장 책임 | HANDOFF_066 | 주작업장 통합검증 |
| production build | 최신 지시서상 주작업장 책임 | HANDOFF_066 | 주작업장 통합검증 |
| sitemap/category 정식 연결 | 공통파일 보호 대상 | HANDOFF_066 | 주작업장 통합검증 |
| 전체 regression/FINAL | 최신 통합본 필요 | HANDOFF_066 | 주작업장 통합검증 |
