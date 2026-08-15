# TOOL 032 모바일 실기기 runner 등록 계약

개별 TOOL에서는 등록 계약을 완성하고 실제 스마트폰 실테스트는 PDF 카테고리 종료 시 일괄한다.

- tool: 032
- slug: `pdf-signature`
- route: `/ko/pdf-signature`, `/en/pdf-signature`, `/ja/pdf-signature`
- PDF input: `[data-testid="tool032-file-input"]`
- ready DOM: `[data-testid="tool032-workspace"]`
- drawing path: `[data-testid="tool032-draw-canvas"]` pointer stroke → `[data-testid="tool032-signature-overlay"]`
- image input: `[data-testid="tool032-signature-input"]`
- placement: `[data-testid="tool032-signature-overlay"]` drag / resize handle + 3x3 preset buttons
- apply: scope radio (`current/all/odd/even/custom`) + optional `[data-testid="tool032-range"]`
- create: `[data-testid="tool032-create"]`
- success: `[data-testid="tool032-result"]`
- download: `[data-testid="tool032-download"]`
- user path: PDF 선택 → draw 또는 image → preview → 배치 → 적용 페이지 → 결과 생성 → 다운로드
- PASS: ready 생성 + signature overlay 생성 + result 생성 + download event 관찰
- FAIL: 제품 alert, ready 미생성, signature 생성 실패, result 미생성, download 미발생

공통 모바일 runner 파일은 보조작업장 보호 대상이므로 이 패키지에서 직접 수정하지 않는다. 주작업장 최신 runner에 위 계약을 032 case로 등록한다.
