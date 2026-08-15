# TOOL 030 실패 대응 지도

- PDF 선택 즉시 실패: signature/MIME/size -> 제품 validation; 정상 PDF인데 parser 실패 -> encrypted/damaged/engine 분리.
- thumbnail만 실패: PDF.js preview/worker/canvas 문제로 분리. 결과 PDF 생성 로직(pdf-lib)을 억지 변경하지 않는다.
- save 후 pageCount/rotation/size mismatch: PRODUCT_FAIL 후보. output copy/order/rotation/blank size를 우선 확인.
- Playwright selector miss: 실제 DOM 상태가 정상이라면 HARNESS_ERROR 후보. 제품 UI를 검수기에 맞춰 왜곡하지 않는다.
- limit FAIL: 승인된 FINAL A(50MB / 원본 100 / 편집 후 150 / concurrency 2 / history 30)와 제품 UI/constants/checker expected가 동일한지 먼저 확인한다.
- 공통 CSS/layout에서만 발생: 보조작업장 공통파일 수정 금지. 주작업장 통합검증으로 이관한다.
