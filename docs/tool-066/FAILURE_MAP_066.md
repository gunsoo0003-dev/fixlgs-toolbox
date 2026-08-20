# TOOL066 실패 대응지도

- 100000@10%가 10000/110000이 아니면 PRODUCT_FAIL: `lib/tool-066-vat.ts` exclusive 계산 확인.
- 110000 포함@10%가 100000/10000이 아니면 PRODUCT_FAIL: inclusive `/1.1` 역산 확인.
- 제품 정상인데 selector 미탐지면 HARNESS_ERROR: `tests/tool-066-*` data-testid 확인.
- custom rate 경고 누락은 PRODUCT_FAIL: `tool066-custom-warning` 확인.
- 납부세액 구분문구 누락은 PRODUCT_FAIL: `tool066-legal-warning` 확인.
- 공통 CSS/layout 변경이 필요하면 보조작업장 수정 금지, 주작업장 통합 후보로 이관.
- 실제 브라우저/Playwright/build/전체 regression 실패는 주작업장 통합 단계에서 PRODUCT/HARNESS/ENVIRONMENT로 재분류.
