# TOOL 031 REQ MASTER

|REQ-ID|요구사항|구현 위치|정적 판정|
|---|---|---|---|
|REQ-031-001|페이지 번호|pdf-page-number-watermark-tool.tsx|PASS|
|REQ-031-002|시작 번호|pdf-page-number-watermark-tool.tsx|PASS|
|REQ-031-003|머리말|pdf-page-number-watermark-tool.tsx|PASS|
|REQ-031-004|꼬리말|pdf-page-number-watermark-tool.tsx|PASS|
|REQ-031-005|텍스트 워터마크|pdf-page-number-watermark-tool.tsx|PASS|
|REQ-031-006|로고 워터마크|pdf-page-number-watermark-tool.tsx|PASS|
|REQ-031-007|위치|9-point anchor|PASS|
|REQ-031-008|투명도|watermarkOpacity|PASS|
|REQ-031-009|전체 페이지 범위|resolvePages|PASS|
|REQ-031-010|첫/마지막 페이지 제외|resolvePages|PASS|
|REQ-031-011|홀수/짝수|resolvePages|PASS|
|REQ-031-012|사용자 범위 문법|parsePageRange|PASS|
|REQ-031-013|대표 페이지 미리보기|buildPreview|PASS|
|REQ-031-014|재생성/재다운로드|createPdf/download|PASS|
|REQ-031-015|로컬 처리|client-only + 안내|PASS|
|REQ-031-016|한국어|copy/labels|PASS|
|REQ-031-017|English|copy/labels|PASS|
|REQ-031-018|日本語|copy/labels|PASS|
|REQ-031-019|서비스 한도 후보|tool-031-pdf.ts|승인 대기|
|REQ-031-020|결과 pageCount 보존|post-save PDF load check|PASS|
|REQ-031-021|원본 페이지 객체 유지|pdf-lib page overlay|PASS 구조|
|REQ-031-022|혼합 page size normalized anchor|page.getSize 기반 placement|PASS 구조|
|REQ-031-023|PNG alpha/비율|embedPng + ratio|PASS 구조|
|REQ-031-024|WebP 로고|Canvas PNG 변환|PASS 구조|
|REQ-031-025|암호화/손상 PDF 오류|PDFDocument.load 오류 분기|PASS 구조|
|REQ-031-026|SEO canonical/hreflang/x-default|route page metadata|PASS|
|REQ-031-027|FAQPage/Breadcrumb/WebApplication|page JSON-LD|PASS|
|REQ-031-028|공통 CSS 비오염|hash checker|PASS|
|REQ-031-029|모바일 runner 등록 준비|mobile-runner-registration.json|PASS|
|REQ-031-030|실제 결과 pixel/browser/build|주작업장 통합검증|이관|
