# TOOL033 DESIGN-CODE CHECK

- MAIN: TOOL032 PDF 서명 넣기 — 최신 PDF 업로드 전/후 상태전이, compact 파일바, 2열 workspace, shared drag, 모바일 breakpoint.
- SUB: TOOL031 PDF 페이지 번호·워터마크 — preview/settings 패널 위계와 하단 action/result 구조.
- ORIGIN: TOOL028 PDF 합치기 — PDF 카테고리 공통 업로드/LOCAL/결과 디자인 원형.
- 업로드 전: 큰 Dropzone만 표시.
- 업로드 후: 큰 Dropzone 제거, compact 파일바 표시.
- workspace: preview/settings 2열, 900px 이하 1열.
- shared drag: uploaded file bar와 workspace가 동일 drag state로 반응.
- 모바일: 파일명 overflow 보호, 버튼 full-width, preview tab 2열.
- 전용 CSS: components/pdf-compressor-tool.module.css. 공통 CSS 수정 없음.
- 승인 서비스 한도: 50 MiB / 200 pages / render concurrency 1.

정적 디자인 계약: PASS 6/6. 실제 Chromium PC/mobile 및 light/dark 체감은 사용자 Windows FINAL에서 확정.
