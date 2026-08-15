# TOOL 030 REQ MASTER — 재대입 결과

| REQ | 요구사항 | 구현/근거 | 보조작업 판정 |
|---|---|---|---|
| R001 | 한 PDF 내부 페이지 정리 | 단일 file input + organizer state | PASS |
| R002 | 페이지 삭제 | deleteSelected | PASS |
| R003 | 순서 변경 | drag + moveSelected | PASS |
| R004 | 복제 | duplicateSelected/sourcePageIndex 유지 | PASS |
| R005 | 90도 회전 | rotateSelected/normalizeRotation | PASS |
| R006 | 역순 정렬 | reverseOrder + confirm + Undo | PASS |
| R007 | 빈 페이지 추가 | insertBlankPage + A4/Letter/adjacent | PASS |
| R008 | thumbnail 전체 보기 | PDF.js canvas | PASS |
| R009 | 단일/다중/전체/해제/Shift 선택 | selected Set + UI | PASS |
| R010 | 모바일 drag 대체 이동 | 위/아래/맨앞/맨뒤 카드 버튼 | PASS |
| R011 | 다중 선택 내부 순서 유지 | moveSelected 정적 검수 | PASS |
| R012 | 복제본 원본 바로 뒤 | duplicateSelected | PASS |
| R013 | stable internal ID | makeId | PASS |
| R014 | 현재 번호/원본 번호 표시 | page card | PASS |
| R015 | rotation/duplicate/blank badge | page card | PASS |
| R016 | Undo/Redo state history | past/future state array | PASS |
| R017 | 결과 rasterize 금지 | PDFDocument.copyPages | PASS |
| R018 | 원본 page structure 최대 보존 | copyPages | PASS |
| R019 | 결과 pageCount/rotation/size 재열기 검증 | createPdf verification | PASS |
| R020 | 결과명 original-organized.pdf | organizedFilename | PASS |
| R021 | 변경 요약 | summarizeChanges | PASS |
| R022 | 계속 편집/재다운로드/새 PDF/초기화 | result actions | PASS |
| R023 | 손상/위장/암호 PDF 오류 | loadPdf validation + fixtures | PASS |
| R024 | 최소 1페이지 유지 | delete guard | PASS |
| R025 | 편집 후 page limit guard | centralized approved limit | PASS(FINAL A) |
| R026 | 브라우저 로컬 처리 | client-only dynamic PDF engines | PASS |
| R027 | KO/EN/JA 핵심 UI | ui locale object | PASS |
| R028 | PC 4열/모바일 2열 | module CSS | PASS |
| R029 | 긴 문구 overflow/touch target 코드 | overflow-wrap, min-height, responsive | PASS |
| R030 | 라이트/다크 preview PDF 색 비변형 | preview fixed white, common theme text/panel | PASS(CODE) |
| R031 | HOW TO/예시/주의/FAQ | page component | PASS |
| R032 | 전문가 포스팅 | EXPERT POST section | PASS |
| R033 | WebApplication/FAQ/Breadcrumb 구조화데이터 | JSON-LD | PASS |
| R034 | canonical/hreflang/metadata | route metadata | PASS |
| R035 | 028/029/033 역할 침범 금지 | 제외 기능 준수 | PASS |
| R036 | 관련 도구 깨진 링크 금지 | 현재 기준 존재 경로만 활성/미제작 disabled | PASS(CODE) |
| R037 | common CSS 오염 금지 | protected hashes 동일 | PASS |
| R038 | legacy sealed 신규 참조 금지 | source/static scan | PASS |
| R039 | 신규 OSS 안전 조건 | pdf-lib/pdfjs-dist local OSS | PASS(METADATA) |
| R040 | 서비스 상한 최종 확정 | 후보 A 사용자 승인: 50MB / 100 / 150 / concurrency 2 / history 30 | PASS(FINAL A) |
| R041 | 실제 Playwright/PC/모바일/KO-EN-JA | 최신 2026-08-11 상위 지시로 주작업장 이관 | 주작업장 통합검증 |
| R042 | TypeScript/production build/전체 regression/FINAL | 최신 통합본 필요 | 주작업장 통합검증 |
| R043 | sitemap/category/mobile real-device runner 등록 | 공통 연결부 | 주작업장 통합검증 |
| R044 | 배포/서치콘솔/색인 | 주작업장 | 주작업장 통합검증 |
