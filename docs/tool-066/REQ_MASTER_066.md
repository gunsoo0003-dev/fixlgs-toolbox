# TOOL066 REQ 추적 마스터

| REQ-ID | 요구사항 | 구현/검증 근거 | 판정 |
|---|---|---|---|
| 066-F01 | 공급가액→부가세 | `calculateExclusive`, fixture exclusive-10 | PASS |
| 066-F02 | 공급가액→합계 | `calculateExclusive`, 100000→110000 | PASS |
| 066-F03 | 합계→공급가액 | `calculateInclusive`, 110000→100000 | PASS |
| 066-F04 | 포함·별도 toggle | `tool066-toggle-*` | PASS |
| 066-C01 | 기본 10% | state/preset + fixture | PASS |
| 066-C02 | 포함금액 VAT 10/110 | inclusive engine / formula guide | PASS |
| 066-C03 | 세율 역산 | `calculateEffectiveRate`, 500000/50000→10% | PASS |
| 066-C04 | custom reference rate | custom warning + 5% fixture | PASS |
| 066-C05 | 납부세액 구분 warning | `tool066-legal-warning` | PASS |
| 066-U01 | mode UX PC/mobile 코드 | 3 tabs + responsive module CSS | PASS (CODE) |
| 066-L01 | KO/EN/JA route+locale | page/client copy + route | PASS (CODE) |
| 066-S01 | canonical/hreflang | route metadata | PASS |
| 066-Q01 | FINAL/FAIL0/SKIP0 | 주작업장 실제 Playwright/통합 FINAL | 주작업장 통합검증 |
| 066-P01 | 입력 0 이상 | engine validation | PASS |
| 066-P02 | 금액 상한 1e15 | engine + fixture + limit spec | PASS |
| 066-P03 | 세율 0~100 | engine + boundary spec | PASS |
| 066-P04 | 내부 precision/표시 최대2 | engine + UI range | PASS |
| 066-P05 | 서버/API/저장 없음 | 전용 소스 정적 확인 | PASS |
