# TOOL 030 DESIGN-CODE CHECK

MAIN 기준: **TOOL 026 이미지 PDF 변환기**

비교/이식 항목: hero 폭·제목·설명·LOCAL badge, tool detail body, NEXT WORK, HOW TO, USE CASES, EXPERT POST, IMPORTANT NOTES, FAQ, RELATED TOOLS, 공통 border/radius/section 계층.

030 정상 특화 영역: PDF 페이지 thumbnail grid, multi-select toolbar, drag handle, 이동 버튼, blank-page panel, 결과 변경 요약. 이 영역은 기능 차이가 커서 공통 CSS로 억지 통합하지 않고 `pdf-page-organizer-tool.module.css`로 격리했다.

정적 판정: PASS. app/globals.css 및 공식 styles 전역 CSS 신규 selector 0건, legacy sealed 직접 참조 0건, 공통 `.toolbox-*` selector를 module에서 override한 항목 0건.
