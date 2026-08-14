# TOOL 028 REQ MASTER — 최종 재대입 요약

| REQ | 요구사항 | 구현/근거 | 판정 |
|---|---|---|---|
| R028-001 | 여러 PDF 병합 | `MergePdfTool`, `PDFDocument.create/copyPages` | PASS |
| R028-002 | 파일 순서 변경 | drag + move buttons + current array order | PASS |
| R028-003 | 페이지 미리보기 | pdfjs thumbnail/dialog | PASS |
| R028-004 | 결과 파일명 | `normalizePdfFilename` | PASS |
| R028-005 | 원본 페이지 rasterize 금지 | merge path `copyPages` | PASS |
| R028-006 | 브라우저 로컬 처리 | no upload/fetch/XHR document path | PASS |
| R028-007 | 추가 업로드/삭제/초기화 | product state handlers | PASS |
| R028-008 | 페이지수/파일크기/총합 | product stats | PASS |
| R028-009 | 모바일 대체 이동 | First/Up/Down/Last buttons | PASS |
| R028-010 | 결과 재파싱 | generated PDF pageCount verification | PASS |
| R028-011 | corrupt/encrypted/non-PDF 식별 | signature + PDF load errors | PASS |
| R028-012 | KO/EN/JA | route/page/tool copy | PASS |
| R028-013 | HOW TO/전문가 콘텐츠/주의/FAQ | `merge-pdf-page.tsx` | PASS |
| R028-014 | canonical/hreflang/structured data | route page metadata + JSON-LD | PASS |
| R028-015 | 접근성 | aria labels/live + keyboard buttons | PASS |
| R028-016 | 공통 CSS 보호 | only module CSS, no global/sealed diff | PASS |
| R028-017 | OSS 기록 | package lock + HANDOFF | PASS |
| R028-018 | 전용 fixture/spec/runner | tool-028 files | PASS |
| R028-019 | 실제 브라우저 PC/모바일 | main integration | MAIN_INTEGRATION |
| R028-020 | production build/통합 regression/FINAL | main integration | MAIN_INTEGRATION |
| R028-021 | 서비스 유효상한 | 20 files / 30MB each / 100MB total / 300 pages / preview 1, 사용자 승인 2026-08-15 | PASS |
| R028-022 | 페이지 단위 편집 030 경계 유지 | no page edit controls | PASS |
| R028-023 | 디지털 서명/고급 PDF 구조 과장 금지 | caution content | PASS |
| R028-024 | 결과 실패 시 입력 유지 | merge error branch | PASS |
| R028-025 | 동일 파일 재추가 정책 | independent items | PASS |

## 독립 누락 탐색 결과
- 기본 4기능 누락 0.
- 030 기능 침범 0.
- 공통 CSS/legacy 신규 오염 0.
- 신규 서버/API/키/외부전송 0.
- 서비스 한도 사용자 승인 완료. 제품/limit checker/FINAL을 동일 승인값으로 동기화.
