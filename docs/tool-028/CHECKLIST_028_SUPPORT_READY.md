# TOOL 028 PDF 합치기 — 보조작업장 출고 체크리스트

판정 체계: PASS / ENVIRONMENT_PENDING / N/A

## 1. 기본 기능
- PASS — 여러 PDF 병합: `pdf-lib`의 `PDFDocument.create()` + `copyPages()` 사용.
- PASS — 파일 순서 변경: stable item id + 현재 배열 순서 기준, drag 및 First/Up/Down/Last 버튼 제공.
- PASS — 페이지 미리보기: `pdfjs-dist` 로컬 worker를 사용한 브라우저 렌더 구조.
- PASS — 결과 파일명 설정: `.pdf` 자동 부여, 중복 확장자 방지, Windows 금지문자 정규화, fallback 처리.
- PASS — 결과 PDF 재파싱 후 pageCount 일치 확인 구조.
- PASS — 페이지 삭제/회전/복제/페이지 단위 재정렬 기능을 넣지 않아 030 경계 유지.

## 2. 파일/오류/상태
- PASS — 최소 2개 파일 조건.
- PASS — PDF signature 사전 확인.
- PASS — 손상/암호화/비 PDF 오류 분기.
- PASS — 개별 삭제/전체 초기화.
- PASS — 동일 파일 재추가를 독립 항목으로 허용.
- PASS — 실패 시 입력 목록 유지 및 재시도 가능 구조.
- PASS — Blob/Object URL 정리 코드 포함.

## 3. 로컬 처리 / 의존성
- PASS — 제품 코드에 upload/fetch/XHR 기반 문서 전송 경로 없음.
- PASS — `pdf-lib@1.17.1` 추가: 무료 OSS, 브라우저 로컬 PDF 페이지 복사/병합 용도.
- PASS — 기존 `pdfjs-dist@5.4.54` 보호/재사용: TOOL027 FINAL PASS 버전 유지, `webpack.mjs` 로더 재사용.
- PASS — package.json / package-lock.json 최소 의존성 변경만 수행.
- PASS — 서버/API/API key/계정/운영비 요구 없음.

## 4. 디자인 코드 정합성
- PASS — PDF 카테고리 기준: TOOL026·027의 공식 common shell/section 및 업로드 전/후 상태전이 이식.
- PASS — 상단 Dropzone + 하단 workspace 동일 `dragActive`; 외부 PDF drag와 내부 reorder drag 별도 MIME 분리.
- PASS — `app/globals.css`, `styles/*` 전역 공통 CSS 변경 없음.
- PASS — `legacy-site-sealed.css`, `legacy-tools-sealed.css` 신규 참조 없음.
- PASS — 028 기능 고유 스타일은 `components/merge-pdf-tool.module.css`에 한정.
- PASS — 공통 toolbox class 재정의 / `:global` / `!important` 오염 없음.

## 5. 다국어 / SEO / 접근성
- PASS — KO/EN/JA 도구명, 설명, HOW TO, WORKFLOW GUIDE, IMPORTANT NOTES, FAQ 구현.
- PASS — KO/EN/JA 자기 canonical + hreflang ko/en/ja/x-default.
- PASS — WebApplication / FAQPage / BreadcrumbList JSON-LD.
- PASS — file input/button/filename/reorder/preview에 접근성 label/aria 경로 구현.
- PASS — 진행/오류 상태 `aria-live` 구조.
- PASS — drag 외 버튼 순서 변경 제공.

## 6. 검수기/fixture
- PASS — 028 전용 preflight / core / feature / boundary / design-state / regression spec 생성.
- PASS — desktop/mobile Playwright 프로젝트 구조 및 전용 port 3028 / `reuseExistingServer:false` 구성.
- PASS — 정상 2p, 정상 3p, mixed page, 한글/일본어 파일명, corrupt/fake/encrypted, 경계 후보 fixture 준비.
- PASS — source/harness/design/package/content/syntax 정적 self-check FAIL=0.
- PASS — 모바일 실기기 runner 001~028 등록 validator errors=0.
- ENVIRONMENT_PENDING — 전달 ZIP에 node_modules가 없고 현재 실행환경에서 registry 설치가 불가하여 실제 Playwright/production build는 아직 미실행.
- PASS — limit-only / FINAL runner 및 승인 한도 spec 생성 완료.

## 7. 서비스 한도 게이트
- PASS — 2026-08-15 사용자 승인: 20 files / 30MB each / 100MB total / 300 pages / preview concurrency 1.
- PASS — 제품 단일 정책 상수, KO/EN/JA 안내문, live DOM data contract, limit spec, checker가 동일 값을 사용.
- PASS — `test:toolbox:028-limit-only` 및 `test:toolbox:028-final` script 연결 완료.

## 8. 공통파일 보호 / 패키지
- PASS — 001~027 기능 로직 보호. 기존 TOOL 수정은 `027 NEXT WORK → 028 LIVE` 링크 연결 1건으로 제한.
- PASS — `site.ts` PDF 카테고리 028 LIVE 등록과 `sitemap.ts` 028 URL 추가만 의도적으로 반영.
- PASS — 전역 CSS 및 sealed CSS 수정 없음.
- PASS — 최소 패치 전달 ZIP 대상으로 package 2개 + 028 전용 구현/fixture/spec/runner/docs만 포함.
- PASS — node_modules/.next/cache/temp/backup 제외.

## 최종 보조작업장 판정
**MAIN_INTEGRATED_LIMIT_APPROVED_VALIDATOR_READY**

028 기능 구현·026·027 디자인 상태전이 이식·승인 한도 동기화·limit-only/FINAL 검수기·모바일 runner 등록까지 통합본에 반영 완료. 현재 컨테이너는 node_modules/registry가 없어 실제 Playwright/production build는 ENVIRONMENT_PENDING이며 Windows 프로젝트 환경에서 FINAL을 실행해 확정한다.
