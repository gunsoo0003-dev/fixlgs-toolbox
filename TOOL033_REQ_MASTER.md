# TOOL033 PDF 압축기 REQ 마스터

기준: FIXLGS_TOOLBOX_033_PDF_압축기_최종제작전달서 + 보조작업장 1/2/3차 최신 상위개정.
판정: PASS / 주작업장 통합검증 / N/A.

| REQ | 요구사항 | 구현/근거 | 판정 |
|---|---|---|---|
| 033-001 | PDF 1개 입력 | tool033-file-input, single file input | PASS |
| 033-002 | 압축 프리셋 3종 | 최고화질 97% / 균형 92% / 용량 우선 82% | PASS |
| 033-003 | 단일 실압축 엔진 | PDF.js page render -> JPEG -> pdf-lib page rebuild | PASS |
| 033-004 | 이미지 품질 실제 연결 | preset/custom quality가 renderScale/JPEG quality에 실제 연결 | PASS |
| 033-005 | 사용자 지정 품질 | Custom 선택 시 55~98% range 활성화 | PASS |
| 033-006 | 전후 실제 byte 비교 | File.size / Blob.size | PASS |
| 033-007 | 절감량/절감률 계산 | tool033Reduction | PASS |
| 033-008 | 결과가 더 큰 상태 별도 표시 | increased branch | PASS |
| 033-009 | 최종 결과 PDF 재파싱 | pageCount(blob) | PASS |
| 033-010 | 최종 결과 bytes 미리보기 | result.blob을 PDF.js로 재로드 | PASS |
| 033-011 | 원본/결과 미리보기 전환 | previewKind source/result | PASS |
| 033-012 | 페이지 미리보기 이동 | previewPage pager | PASS |
| 033-013 | 브라우저 로컬 처리 | pdfjs-dist/pdf-lib client-only, 외부 전송 코드 없음 | PASS |
| 033-014 | 서버/API/로그인/유료서비스 없음 | 신규 서비스/키 없음 | PASS |
| 033-015 | 이미지 재구성 기능손실 경고 | KO/EN/JA 경고 UI | PASS |
| 033-016 | 기본 프리셋 | initial preset=balanced 92% | PASS |
| 033-017 | 정확한 목표용량 보장 금지 | FAQ/문구에 미보장 명시 | PASS |
| 033-018 | 압축률 사전 약속 금지 | 결과 후 실제 계산만 표시 | PASS |
| 033-019 | 파일명 -compressed.pdf | tool033OutputName | PASS |
| 033-020 | PDF header 검사 | hasTool033PdfSignature | PASS |
| 033-021 | 파싱 실패/암호화 오류 | pageCount load catch | PASS |
| 033-022 | 페이지 0/이상 입력 차단 | pageCount <1 branch | PASS |
| 033-023 | 재압축/설정 변경 | 결과 해제 후 설정 유지 | PASS |
| 033-024 | 초기화 | reset | PASS |
| 033-025 | 처리 진행률 | 모든 preset/custom에서 page별 progress | PASS |
| 033-026 | 압축 순차 처리 | for loop 1 page at a time | PASS |
| 033-027 | 모바일 1열 UI | module.css <=700px | PASS |
| 033-028 | 파일명 overflow 방지 | ellipsis/overflow-wrap | PASS |
| 033-029 | KO/EN/JA | page/tool copy 3개 언어 | PASS |
| 033-030 | 라이트/다크 공통 구조 상속 | var(--tb-*), 공통 shell 사용 | PASS |
| 033-031 | 사용방법 | HOW TO USE 5단계 | PASS |
| 033-032 | 전문가/워크플로 가이드 | 6개 실무 기준 카드 | PASS |
| 033-033 | 주의사항 | 5개 항목 | PASS |
| 033-034 | FAQ | 6개 항목 | PASS |
| 033-035 | 관련도구 | 027/028 링크 | PASS |
| 033-036 | NEXT WORK | 034 표시 | PASS |
| 033-037 | SEO title/description | route metadata | PASS |
| 033-038 | canonical/hreflang | route metadata ko/en/ja/x-default | PASS |
| 033-039 | 구조화 데이터 | WebApplication + FAQPage | PASS |
| 033-040 | sitemap 등록 | 공통파일 보호상 HANDOFF에서 주작업장 반영 | 주작업장 통합검증 |
| 033-041 | category 카드 등록 | lib/site.ts 공통 연결부라 HANDOFF | 주작업장 통합검증 |
| 033-042 | robots 영향 | 신규 route 차단 여부 통합본에서 확인 | 주작업장 통합검증 |
| 033-043 | MAIN 디자인 기준 | 032 PDF 서명 넣기 최신 상태전이 | PASS |
| 033-044 | SUB 디자인 기준 | 031 PDF 페이지 번호·워터마크 + 028 공통 PDF 원형 | PASS |
| 033-045 | 공통 CSS 무수정 | 전용 module.css만 제공 | PASS |
| 033-046 | legacy sealed 신규 사용 금지 | 직접 참조 없음 | PASS |
| 033-047 | 기존 의존성 우선 | pdf-lib/pdfjs-dist 기존 버전 재사용 | PASS |
| 033-048 | 신규 OSS 없음 | package dependency 추가 없음 | PASS |
| 033-049 | selector contract | tool033-* 정적 검사 PASS | PASS |
| 033-050 | fixture | 정상/20p/손상/암호화/MIME mismatch 준비 | PASS |
| 033-051 | preflight/core/feature/boundary/regression/limit spec | tests/tool-033-*.spec.ts | PASS |
| 033-052 | 모바일 실기기 runner 등록 자료 | mobile-runner-registration.json | PASS |
| 033-053 | 실제 Playwright/브라우저 | 보조작업장 최신 최상위 규칙에 따라 주작업장 이관 | 주작업장 통합검증 |
| 033-054 | production build | 주작업장 이관 | 주작업장 통합검증 |
| 033-055 | 전체 regression/FINAL | 주작업장 이관 | 주작업장 통합검증 |
| 033-056 | 서비스 유효상한 | 승인 50MiB/200p/render concurrency 1. 제품·limit checker 동기화 완료 | 주작업장 통합검증 |

REQ 1차 추출 후 원본 전달서를 다시 대조한 2차 누락 탐색 완료. 보조작업장 범위 내 FAIL/NOT VERIFIED 0.
