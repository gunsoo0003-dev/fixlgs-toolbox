# TOOL 025 HANDOFF

## 대상
- TOOL 025: 증명사진·여권사진 제작기 / ID & Passport Photo Maker / 証明写真・パスポート写真作成ツール
- slug: `id-passport-photo-maker`
- 신규 OSS: 없음
- 서버/API/키/계정/과금/외부 파일 전송: 없음

## 구현 완료
- 증명사진 / 여권사진 / 취업사진
- 한국·미국·일본·영국·캐나다 여권 preset (2026-08-14 공식 규격 재확인)
- 일반 30×40mm / 35×45mm / 사용자 지정 mm
- face guide ON/OFF, 중앙선, head range가 전달서에 있는 국가의 guide
- No Stretch cover crop, zoom, pointer drag, D-pad, center
- JPG/PNG 개별 다운로드
- A4 210×297mm @300dpi 반복 배치 + cut guide + 실제크기 인쇄 안내
- 15MB / 40MP 서비스 후보 적용
- animated APNG/WebP, MIME mismatch, corrupt decode 방어
- KO/EN/JA page copy, FAQ, JSON-LD, metadata, canonical/hreflang, sitemap

## 디자인 코드 기준
- MAIN 기준 도구: TOOL 024 (같은 콘텐츠 이미지 카테고리의 최신 완료 도구)
- 공통 shell/hero/NEXT WORK/RELATED TOOLS/HOW TO/FAQ의 공식 common 구조를 024와 비교·재사용
- 작업영역은 025 기능 차이가 커 신규 전용 module.css로 분리

## CSS
- 신규 전용 CSS: `components/id-passport-photo-maker-tool.module.css`
- `app/globals.css` 신규 스타일: 없음
- `styles/*.css` 전역 신규 스타일: 없음
- `legacy-site-sealed.css`, `legacy-tools-sealed.css` 참조/복사: 없음
- 기존 공통 page shell/guide/next-work/FAQ class 재사용

## 최소 통합 변경
- `lib/site.ts`: tool025 slug/title/description/category card 등록
- `app/sitemap.ts`: KO/EN/JA 025 URL 등록
- 기존 001~024 구현 파일 수정: 없음

## 자동검수 준비
- `tests/tool-025-core.spec.ts`
- `tests/tool-025-boundary.spec.ts`
- `tests/tool-025-regression.spec.ts`
- `tests/tool-025-limit.spec.ts`
- `scripts/tool-025/check-source.mjs`
- `scripts/tool-025/check-harness.mjs`
- `scripts/tool-025/check-integration.mjs`
- `scripts/tool-025/check-runner-contract.mjs`
- `scripts/tool-025/check-syntax.mjs`
- `scripts/tool-025/runtime-workspace.mjs`
- `scripts/tool-025/run-validation.mjs`
- `playwright.tool025-runtime.config.ts`
- `package.json` 025 preflight/core/boundary/regression/limit/final scripts

## 보조작업장 판정
- CODE PASS: 정적 검사 기준 PASS
- FUNCTION-STATIC PASS: 전달서 핵심 기능 코드 경로 PASS
- DESIGN-CODE PASS: 기준 공통 shell + 025 전용 module, 전역 CSS 오염 0
- HARNESS-STRUCTURE PASS: selector/spec 구조 PASS
- PACKAGE PASS: 신규 OSS 없음, dependency 변경 없음
- COMMON FILE PROTECTION PASS: 전역 CSS/legacy/기존 001~024 구현 파일 비변경

## 주작업장 통합검증으로 이관
2026-08-11 최신 보조작업장 개정에 따라 아래는 보조작업장 NOT READY 사유가 아니며 주작업장에서 실행한다.
- localhost/실브라우저
- Playwright actual run
- PC/mobile actual viewport
- KO/EN/JA actual render
- light/dark/hover/touch/scroll/overflow 체감
- actual download decode and pixel inspection
- production build
- full regression / integrated FINAL
- 서비스 유효상한 실제 limit-only 비교 및 최종 상한 확정

## 주작업장 권장 검수 순서
1. preflight
2. core-only
3. boundary-only
4. regression-only
5. 서비스 유효상한 실제 적용
6. limit-only
7. FINAL

결과 ZIP 이름은 전달서 고정값 `025_preflight_검수결과.zip` ~ `025_final_검수결과.zip`을 사용하고, 동일 단계 재실행 시 덮어쓴다.

## 2026-08-14 main-workshop hardening v2
- Android Chrome image input now uses the existing `StableMobileImageFileInput` `pixels` path, which documents the TOOL001 V57R2 golden provider-file -> bitmap -> canvas -> app-owned File boundary. No shared 001~024 source was modified.
- TOOL025 preserves original picker metadata via `__stableMobileOriginalInfo` for 15MB limit messages/file naming while downstream decode works on the app-owned mobile copy.
- Korea online passport preset is now operational, not guidance-only: output stays 413x531px, format selector is locked to JPG, and the encoder searches for the highest practical JPEG quality at or below 500KB.
- Added `feature-only` runner/spec. It verifies format lock and inspects the downloaded JPG file size <= 500KB.
- Static checks after merge: RUNNER CONTRACT PASS / SOURCE PASS / HARNESS STRUCTURE PASS / INTEGRATION PASS. Global CSS contamination search: none.
- Real Android Native Picker validation, TypeScript, production build and FINAL still require the user's dependency-equipped execution environment before FINAL PASS can be declared.

## 2026-08-14 content-density revision
- TOOL024 common content-section DOM remains transplanted.
- TOOL025 content was expanded to at least the TOOL024 density baseline, with additional subject-specific guidance where passport/ID workflows require it.
- Added `scripts/tool-025/check-content-density.mjs` and wired it into every validation mode's static gate.


## 2026-08-14 design-lock validator revision
- TOOL025 visual design is frozen at v12. Product design must not be altered by validator hardening.
- Added `docs/tool-025/FINAL_VALIDATION_CHECKLIST_025.md` as the single final checklist.
- Added `scripts/tool-025/check-final-checklist.mjs` to map checklist items back to product source, policy, runtime specs and runner contract.
- Added `tests/tool-025-design-state.spec.ts` to verify the TOOL024-derived Dropzone lifecycle: initial visible dropzone -> loaded `dropzoneReady` -> shared workspace drag highlight -> dragleave neutral ready state.
- FINAL now includes the checklist gate and the runtime design-state feature gate in the same one-run sequence.
- Final result ZIP continues to be created on Windows Desktop on PASS or FAIL.
