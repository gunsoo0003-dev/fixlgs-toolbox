# TOOL 035 - PDF 텍스트·이미지 추출기 최종 증거형 체크리스트

## 기준
- MAIN: 030 PDF 페이지 정리 도구
- SUB-1: 029 PDF 분할·페이지 추출기
- SUB-2: 027 PDF 이미지 변환기
- 승인 한도: 1 PDF / 50MB / 200 pages / image warning 500 / image hard stop 1000 / page concurrency 1

| 게이트 | 확인방법 | 실제 증거 | 판정 |
|---|---|---|---|
| 도장깨기 4기능 | source/spec 대조 | text/images/page group/TXT·ZIP 코드 및 spec | PASS |
| text/image/both | DOM/state/spec | 3 mode testids + core spec | PASS |
| native text / scan 경계 | source/boundary | getTextContent + scan hint, OCR network path 없음 | PASS |
| embedded image / 027 경계 | source/regression | operator list path, `page.render` 금지검사 PASS | PASS |
| special images | fixture/harness | repeated XObject / soft mask / inline / mask 4종 fixture 등록 | PASS |
| TXT/ZIP 안전 | helper/source | deterministic names + traversal sanitizer | PASS |
| 취소/초기화/stale | source/logic | jobIdRef + abortRef + cleanup/revoke | PASS |
| KO/EN/JA | content/source | 3 locale UI/content strings | PASS |
| SEO/content | content checker | HOW TO/USE CASES/EXPERT/IMPORTANT/FAQ + JSON-LD | PASS |
| 접근성 | source | labels/roles/aria-live/native keyboard controls | PASS |
| 승인 한도 동기화 | logic/harness | 50MB/200/500/1000/1 exact assertions | PASS |
| limit fixtures | fixture parse | exact 200 pages / over 201 pages confirmed | PASS |
| HARNESS STRUCTURE | 6 specs + selector contract | check-harness PASS | PASS |
| 모바일 runner 등록자료 | static contract | `mobile-runner-entry.mjs` | PASS |
| DESIGN-CODE | MAIN/SUB + CSS static | check-design PASS | PASS |
| 전역 CSS 오염 | hash/static | protected global CSS exact hashes | PASS |
| legacy sealed 사용 | source/hash | 신규 참조 0 + hashes unchanged | PASS |
| 신규 OSS | package comparison | package files unchanged, existing pdfjs-dist reused | PASS |
| TS/TSX syntax | TypeScript transpileModule | 10 files PASS / fail 0 | PASS |
| 전체 정적 self-check | final run | 7 groups PASS / fail 0 | PASS |
| REQ 원본 재대입 | independent final re-read | `REQ_MASTER.md`, 누락 special fixture 4종 추가 후 재검수 | PASS |
| 공통파일 보호 | original/work SHA256 | global CSS + package files identical | PASS |
| 실제 브라우저/Playwright | 최신 보조지시서 역할경계 | 주작업장 installed runtime에서 실행 | 주작업장 통합검증 |
| production build | 최신 보조지시서 역할경계 | 주작업장 installed runtime에서 실행 | 주작업장 통합검증 |
| 실제 PC/mobile/KO·EN·JA/light·dark | 최신 보조지시서 역할경계 | 주작업장 browser validation | 주작업장 통합검증 |
| 실제 TXT/image pixel/ZIP download | runtime output inspection | 주작업장 Playwright/download result | 주작업장 통합검증 |
| PDF 카테고리 모바일 실기기 | 운영 원칙 | category batch runner | 주작업장 통합검증 |

## 보조작업장 최종 게이트
- CODE PASS: PASS
- FUNCTION-STATIC PASS: PASS
- DESIGN-CODE PASS: PASS
- HARNESS-STRUCTURE PASS: PASS
- PACKAGE PASS: PASS (최종 ZIP 51파일 재개봉, manifest exact, 금지 산출물 0건)
- COMMON FILE PROTECTION PASS: PASS
