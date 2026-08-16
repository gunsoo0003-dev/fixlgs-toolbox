# TOOL 035 REQ Master

Source basis: TOOL 035 final production brief + supplied auxiliary 1st/2nd/3rd top-level instructions.

Status rule for this auxiliary package: runtime/browser/Playwright/production-build/integrated regression items explicitly transferred by the supplied 2026-08-11 top-level auxiliary instructions are recorded separately as `주작업장 통합검증`, not as static PASS.

Two-pass method: (1) requirements were atomized before/while implementation; (2) the original TOOL 035 brief was re-read independently at finalization and missing special-image fixtures were added (repeated XObject, soft mask, inline image, image mask).

| REQ-ID | 원본 섹션 | 요구사항 | 적용 대상 | 구현 위치 | 검증 방법 | 판정 | 판정 근거 |
|---|---|---|---|---|---|---|---|
| REQ-001 | 1 | 텍스트 추출을 제공한다 | 기능 | components/pdf-text-image-extractor-tool.tsx / lib/tool-035-pdf-extractor.ts | source + static logic | getTextContent 경로 |  |
| REQ-002 | 1 | 이미지 추출을 제공한다 | 기능 | components/pdf-text-image-extractor-tool.tsx / lib/tool-035-pdf-extractor.ts | source + static logic | operator list image path |  |
| REQ-003 | 1 | 결과를 페이지별로 구분한다 | 결과 | tool state / text page blocks / image page metadata | source + core spec | pageNumber 연결 |  |
| REQ-004 | 1 | TXT와 ZIP 저장을 제공한다 | 다운로드 | tool component + lib/zip.ts reuse | source + core/feature spec | TXT/ZIP controls |  |
| REQ-005 | 2 | 기존 FINAL PASS 공통 구조를 보호한다 | 보호 | 전용 파일만 추가 | protected hash comparison | 10 protected files identical |  |
| REQ-006 | 2 | 기존 pdfjs-dist를 우선 재사용한다 | 의존성 | pdfjs-dist/webpack.mjs | package static check | existing 5.4.54 reused |  |
| REQ-007 | 3 | 027의 페이지 전체 렌더링 역할을 침범하지 않는다 | 경계 | operator image extraction only | forbidden path check | page.render absent |  |
| REQ-008 | 3 | 029처럼 페이지 PDF 자체를 만들지 않는다 | 경계 | content extraction outputs only | source review | no PDF page export |  |
| REQ-009 | 3 | 034 metadata 편집을 수행하지 않는다 | 경계 | no metadata editor | source review | metadata editing absent |  |
| REQ-010 | 3 | OCR은 기본 범위에서 제외한다 | 경계 | scan hint only | source/content check | OCR API/fetch absent |  |
| REQ-011 | 5 | PDF 업로드와 drag & drop을 지원한다 | 입력 | tool upload zone | source review | input/drop handlers |  |
| REQ-012 | 5 | 텍스트/이미지 모드를 분리한다 | UI | text/images/both mode controls | source + core specs | three mode testids |  |
| REQ-013 | 5 | 페이지 단위 처리 및 범위 선택을 제공한다 | 기능 | scope all/selected/custom | source + feature spec | range parser + controls |  |
| REQ-014 | 5 | 이미지 개별 다운로드와 다수 ZIP을 제공한다 | 출력 | download buttons + ZIP | source + specs | download paths |  |
| REQ-015 | 8 | PDF 입력은 1개로 제한한다 | 한도 | TOOL035_SERVICE_LIMITS.inputFiles | static limit check | approved inputFiles=1 |  |
| REQ-016 | 8 | 페이지별 텍스트 미리보기와 글자 수를 제공한다 | 결과 | text result cards | source review | char count UI |  |
| REQ-017 | 8 | 페이지별 이미지 개수/크기/형식을 제공한다 | 결과 | image cards | source review | page/index/width/height/format |  |
| REQ-018 | 8 | 텍스트 전체 복사와 TXT 다운로드를 제공한다 | 출력 | tool actions | source review | copy/download |  |
| REQ-019 | 8 | 둘 다 모드 ZIP에 text와 images를 구조화한다 | 출력 | combined ZIP builder | source + feature spec | /text + /images |  |
| REQ-020 | 8 | 텍스트 레이어 없음/scan 가능성을 안내한다 | 오류 | scanHint locale strings | source + boundary spec | tool035-scan-hint |  |
| REQ-021 | 8 | 취소/초기화/새 파일/재다운로드를 지원한다 | 상태 | cancel/reset/re-run actions | source + feature spec | job lifecycle |  |
| REQ-022 | 8 | 진행률은 실제 처리 페이지 기반이다 | 성능 | processed page count | source/design static | no timer progress |  |
| REQ-023 | 8 | 최소 이미지 크기 필터는 기본 OFF다 | 선택기능 | filterSmall=false | static logic | default OFF |  |
| REQ-024 | 8 | 중복 숨기기는 선택 기능이며 기본 OFF다 | 선택기능 | hideDuplicates=false + hash | static logic | default OFF + hash |  |
| REQ-025 | 10 | 텍스트 추출은 getTextContent 계열을 사용한다 | 텍스트 | helper/tool | static source | getTextContent present |  |
| REQ-026 | 10 | 페이지 순서와 pageNumber를 유지한다 | 텍스트 | sequential loop/results | source/spec | page markers |  |
| REQ-027 | 10 | TXT에 명확한 페이지 구분자를 둔다 | TXT | buildTool035TextFile | static logic | PAGE marker |  |
| REQ-028 | 10 | 줄/문단 재구성은 보수적으로 한다 | 텍스트 | reconstructTool035Text | source review | coordinate/eol conservative |  |
| REQ-029 | 10 | 공백/줄바꿈을 과도하게 정리하지 않는다 | 텍스트 | reconstructTool035Text | source review | limited normalization |  |
| REQ-030 | 10 | 전체 text item 0이면 scan 가능성을 안내한다 | 오류 | scan hint | boundary spec | scan-image-only fixture |  |
| REQ-031 | 11 | 페이지 canvas 렌더가 아닌 raster image object를 추출한다 | 이미지 | getOperatorList + OPS | static source | paintImage* operators |  |
| REQ-032 | 11 | 원본 stream을 안정적으로 보존할 수 없으면 PNG fallback을 표시한다 | 이미지 | decoded bitmap → PNG | source/content check | PNG fallback label |  |
| REQ-033 | 11 | JPEG 원본 직접 복원 가능성은 과장하지 않는다 | 이미지 | fallbackOnly current path | content check | no 100% lossless claim |  |
| REQ-034 | 11 | inline image fixture를 분리한다 | fixture | test-fixtures/tool-035/inline-image.pdf | fixture validation + harness | renderable + harness registered |  |
| REQ-035 | 11 | image mask fixture를 분리한다 | fixture | test-fixtures/tool-035/image-mask.pdf | fixture validation + harness | renderable + harness registered |  |
| REQ-036 | 11 | soft mask fixture를 분리한다 | fixture | test-fixtures/tool-035/soft-mask.pdf | fixture validation + harness | renderable + harness registered |  |
| REQ-037 | 11 | repeated XObject fixture를 분리한다 | fixture | test-fixtures/tool-035/repeated-xobject.pdf | fixture validation + harness | renderable + harness registered |  |
| REQ-038 | 11 | 작은 아이콘/1x1을 자동 삭제하지 않는다 | 이미지 | filter opt-in | static logic | filterSmall default false |  |
| REQ-039 | 11 | 이미지 파일명은 결정적 구조를 사용한다 | 출력 | tool035ImageFileName | static source | page-###-image-###.png |  |
| REQ-040 | 12 | ZIP 파일명과 폴더 구조를 결정적으로 만든다 | 출력 | safe base/zip paths | source review | text/images structure |  |
| REQ-041 | 12 | Windows 금지문자/공백/끝점/충돌을 정규화한다 | 안전 | safeTool035BaseName | source review | filename sanitizer |  |
| REQ-042 | 12 | ZIP path traversal을 차단한다 | 안전 | safeTool035ZipPath | static logic | ../ and absolute normalization |  |
| REQ-043 | 12 | 브라우저 다중 자동 다운로드에 의존하지 않는다 | 출력 | ZIP for multiple images | source review | single ZIP flow |  |
| REQ-044 | 13 | PC first flow를 도구명→설명→업로드→모드→추출로 구성한다 | 디자인 | page/tool components | design static check | MAIN 030 transplant |  |
| REQ-045 | 13 | 다운로드 후 상태를 유지하여 재추출할 수 있다 | 상태 | results retained until reset | feature spec | re-extraction flow |  |
| REQ-046 | 14 | 모바일은 세로 흐름으로 구성한다 | 반응형 | module.css breakpoint | design static check | vertical flow |  |
| REQ-047 | 14 | 페이지 선택은 체크/범위 입력을 제공한다 | 모바일 | selected/custom controls | source review | not drag-only |  |
| REQ-048 | 14 | 긴 텍스트 overflow를 막는다 | 반응형 | min-width/overflow-wrap rules | design static check | overflow-safe CSS |  |
| REQ-049 | 14 | 이미지 grid는 모바일 2열 반응형이다 | 반응형 | module.css | design static check | 2-column mobile grid |  |
| REQ-050 | 15 | KO/EN/JA 핵심 UI를 제공한다 | 다국어 | locale strings | content/source check | three locales present |  |
| REQ-051 | 16 | label/aria-live/focus/keyboard 접근성을 제공한다 | 접근성 | semantic controls/aria-live | source review | aria labels + native controls |  |
| REQ-052 | 16 | 이미지 alt는 사실 정보만 사용한다 | 접근성 | page/index/size-based alt | source review | no content guessing |  |
| REQ-053 | 17 | PDF/텍스트/파일명/이미지/password/EXIF를 서버/Analytics에 보내지 않는다 | 개인정보 | local-only implementation | static forbidden network check | fetch/axios/XHR absent |  |
| REQ-054 | 17 | Analytics 실패가 parsing을 막지 않는 구조다 | 개인정보 | no parsing analytics dependency | source review | analytics not in processing path |  |
| REQ-055 | 18 | 빈/0byte/MIME mismatch/손상 PDF를 처리한다 | 오류 | validation/error states | boundary specs | corrupt/fake fixtures |  |
| REQ-056 | 18 | 암호 PDF/wrong password를 처리한다 | 오류 | password UI + PDF.js password flow | boundary spec | encrypted fixture |  |
| REQ-057 | 18 | text 0 / image 0 결과를 오류로 위조하지 않는다 | 오류 | empty result notices | boundary/core specs | text-only/image-only fixtures |  |
| REQ-058 | 18 | 취소 후 stale 결과가 섞이지 않도록 job-id/abort를 관리한다 | 상태 | jobIdRef/abortRef | static logic | stale guard |  |
| REQ-059 | 19 | 페이지 전체 병렬 parse를 금지하고 순차 처리한다 | 성능 | for-loop await; concurrency=1 | static limit/source | approved pageConcurrency=1 |  |
| REQ-060 | 19 | page cleanup/object URL 해제를 수행한다 | 메모리 | page.cleanup/revokeObjectURL | static logic | cleanup tokens |  |
| REQ-061 | 20 | 서비스 유효상한을 사용자 승인 후 확정한다 | 한도 | APPROVED_2026_08_15 | static limit check | user approved in conversation |  |
| REQ-062 | 20 | 파일 용량 한도 50MB를 제품/UI/checker에 동기화한다 | 한도 | SERVICE_LIMITS + locale copy + limit spec | static logic/harness | 50MB |  |
| REQ-063 | 20 | 페이지 수 한도 200을 제품/UI/checker에 동기화한다 | 한도 | SERVICE_LIMITS + fixture/spec | static logic/harness | 200 + 201 fixtures |  |
| REQ-064 | 20 | 이미지 500개부터 경고한다 | 한도 | extractedImagesWarning | static logic | 500 |  |
| REQ-065 | 20 | 이미지 1000개에서 안전 중단한다 | 한도 | extractedImagesHardStop | static logic | 1000 |  |
| REQ-066 | 21 | TXT UTF-8/page order 검수 spec을 준비한다 | 검수 | tool-035-core.spec.ts | harness static | core spec present |  |
| REQ-067 | 21 | scan PDF에서 OCR 결과를 생성하지 않는 검수 spec을 준비한다 | 검수 | tool-035-boundary.spec.ts | harness static | scan fixture |  |
| REQ-068 | 21 | 027 경계 회귀 spec을 준비한다 | 검수 | tool-035-regression.spec.ts | harness static | page-render boundary |  |
| REQ-069 | 21 | KO/EN/JA/SEO 회귀 spec을 준비한다 | 검수 | tool-035-regression.spec.ts | harness static | locale/SEO assertions |  |
| REQ-070 | 22 | native text/multicolumn/text-only/image-only/rotation/encrypted/corrupt/limits fixtures를 준비한다 | fixture | test-fixtures/tool-035 | harness static | fixture set |  |
| REQ-071 | 23 | 모바일 실기기 runner 등록 payload를 준비한다 | 모바일 | scripts/tool-035/mobile-runner-entry.mjs | harness static | selector/userPath/success/error |  |
| REQ-072 | 23 | 실제 스마트폰 테스트는 PDF 카테고리 단위 일괄 실행으로 남긴다 | 모바일 | HANDOFF main integration | documented transfer | category batch |  |
| REQ-073 | 24 | slug와 KO/EN/JA URL을 동일 035로 유지한다 | SEO | app/[locale]/pdf-text-image-extractor | source/content check | route present |  |
| REQ-074 | 24 | WebApplication/FAQPage/BreadcrumbList를 실제 페이지와 일치시킨다 | SEO | page component JSON-LD | content check | schema tokens |  |
| REQ-075 | 24 | OCR/완벽복원/100% 무손실 같은 과장을 금지한다 | SEO | content copy | content check | overclaim forbidden |  |
| REQ-076 | 25 | 사용방법/FAQ/주의사항을 3개 언어로 제공한다 | 콘텐츠 | page component | content check | HOW TO/FAQ/IMPORTANT NOTES |  |
| REQ-077 | 25 | 전문가 포스팅을 포함한다 | 콘텐츠 | page component | content check | EXPERT POST |  |
| REQ-078 | 29 | REQ 1차 원자화와 2차 독립 누락 탐색을 기록한다 | 검수 | docs/tool-035/REQ_MASTER.md | document review | this matrix + original re-read |  |
| REQ-079 | 29 | 출고 전 원본 전달서를 다시 대조한다 | 검수 | REQ_MASTER + CHECKLIST | final source re-read | final reapplication |  |
| REQ-080 | 30 | FAIL 0/SKIP 0 구조로 출고한다 | 출고 | static validation + checklist | static execution | 7 groups fail=0; runtime separated per auxiliary top rule |  |
| REQ-081 | 31 | 기능/디자인/기존영향/완료근거 4대 검증을 기록한다 | 출고 | CHECKLIST/DESIGN_CODE_CHECK/PROTECTED_HASHES | document + static | all static gates covered |  |
| REQ-082 | 33 | 최소 패치 ZIP 최상위 폴더를 fixlgs-toolbox로 한다 | 패키지 | final ZIP | ZIP reopen validation | packaging gate |  |
| REQ-083 | 33 | node_modules/.next/cache/results/temp를 ZIP에서 제외한다 | 패키지 | final ZIP | ZIP manifest validation | exclusion gate |  |
| REQ-084 | 33 | source/tests/fixtures/runner/docs/original brief를 포함한다 | 패키지 | final ZIP | ZIP manifest validation | required groups |  |
| REQ-085 | 34 | 최종 제작 명령의 기능 축소 금지를 지킨다 | 출고 | all tool files | source + checklist | mandatory 4 functions present |  |

## 별도 주작업장 통합검증

- 실제 브라우저 page entry 및 localhost
- 실제 Playwright preflight/core/boundary/feature/regression/limit 실행
- PC/mobile 실제 viewport 및 KO/EN/JA/light/dark 렌더링
- 실제 TXT 다운로드 인코딩/내용, embedded image pixel decode, ZIP 다운로드 파일/폴더 구조 확인
- production build 및 최신 프로젝트 통합 regression/FINAL
- PDF 카테고리 모바일 실기기 일괄 runner 실행

이 항목들은 전달 ZIP의 spec/fixture/runner를 사용해 주작업장에서 수행한다.
