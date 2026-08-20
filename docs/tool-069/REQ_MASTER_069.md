# TOOL069 REQ 추적 마스터

| REQ-ID | 요구사항 | 근거 | 판정 |
|---|---|---|---|
| 069-F01 | 고정비 | `tool069-fixed` | PASS |
| 069-F02 | 판매가 | `tool069-selling` | PASS |
| 069-F03 | 변동비 | `tool069-variable` | PASS |
| 069-F04 | 상품당 이익 | `sellingPrice-variableCost` | PASS |
| 069-F05 | BE 판매량 | `fixedCost/contribution` | PASS |
| 069-F06 | BE 매출 | `fixedCost/contributionRatio` | PASS |
| 069-C01 | 공헌이익률 | `contribution/sellingPrice` | PASS |
| 069-C02 | 목표이익 5,000,000→2,000 | fixture + target engine | PASS |
| 069-C03 | 예상 1,000→1,000,000 profit | fixture + volume engine | PASS |
| 069-C04 | contribution<=0 impossible | product state + boundary spec | PASS |
| 069-C05 | 750.25→751 practical | fixture + `Math.ceil` | PASS |
| 069-U01 | 3 mode UX + responsive code | client/module CSS | PASS (CODE) |
| 069-L01 | KO/EN/JA | route/page/client copy | PASS (CODE) |
| 069-S01 | canonical/hreflang/JSON-LD | route/page | PASS |
| 069-P01 | 금액 상한 1e15 | engine constant | PASS |
| 069-P02 | 판매량 상한 1e12 | engine constant | PASS |
| 069-P03 | input 30 chars / precision max8 | engine/UI | PASS |
| 069-Q01 | FINAL FAIL0/SKIP0 | 실제 통합 Playwright/build | 주작업장 통합검증 |
