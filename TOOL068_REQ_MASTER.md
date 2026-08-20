# TOOL068 REQ MASTER

| REQ | 요구사항 | 구현 근거 | 검수 근거 | 상태 |
|---|---|---|---|---|
| 068-F01 | 판매금액 | `tool068-sale` | core fixture | PASS |
| 068-F02 | 수수료율 및 수수료액 | `rate`, `commission` | sale-10 | PASS |
| 068-F03 | 판매자 부담 배송비 | `sellerShipping` | shipping fixture | PASS |
| 068-F04 | 기타 비용 | `otherCost` | profit fixture | PASS |
| 068-F05 | 정산금 | `settlement` | 90,000/87,000/85,000 fixtures | PASS |
| 068-C01 | % + 고정 수수료 | `fixedFee` | mixed-fee 3%+300 | PASS |
| 068-C02 | 상품원가 → 순이익 | `netProfit=settlement-productCost` | 85,000-50,000=35,000 | PASS |
| 068-C03 | buyer/seller shipping 분리 | 별도 input/state | buyer-shipping fixture | PASS |
| 068-C04 | 실효 수수료율 | `totalFee/sale*100` | source/logic check | PASS |
| 068-C05 | 목표 순이익 역산 | `requiredSaleForTarget` | 83,333.333... fixture | PASS |
| 068-U01 | 정산금/순이익/목표순이익 모드 | 3 tabs | design/source check | PASS |
| 068-L01 | KO/EN/JA | page/UI copy | source review | PASS |
| 068-S01 | canonical/hreflang | dedicated route metadata | static source review | PASS |
| 068-Q01 | 전용 검수 구조 | 9 specs + fixture + static scripts | harness check | PASS |
| 068-P01 | 로컬 처리/외부 API 없음 | no fetch/axios/server calls | secret/source scan | PASS |
| 068-D01 | 공통 CSS 오염 금지 | 전용 module.css | design check | PASS |
| 068-D02 | MAIN 디자인 기준 | TOOL066 | DESIGN CODE CHECK | PASS |
| 068-I01 | sitemap/site/category 연결 | 주작업장 공통파일 작업 | HANDOFF | 주작업장 통합검증 전용 |
| 068-I02 | Playwright/브라우저/빌드 | 기준 ZIP에 node_modules 없음 | HANDOFF | 주작업장 통합검증 전용 |
