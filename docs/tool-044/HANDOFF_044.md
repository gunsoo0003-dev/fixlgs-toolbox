# TOOL044 HANDOFF

## 대상
- TOOL044 키워드 빈도·중복 분석기
- Route: `/{locale}/keyword-frequency-duplicate-analyzer`
- 기준: TOOL043 실제 텍스트 도구 구조 + `text-tool-input-common.module.css`

## 확정 기능
1. 단어 빈도
2. 키워드 밀도
3. 반복 문장
4. 중복 문장
5. 상위 키워드

## 분석 계약
- KO/EN/JA `Intl.Segmenter` 우선, deterministic fallback
- 영문 키워드 기본 case-insensitive
- 숫자 token 포함, emoji-only token 제외
- 밀도 = 빈도 / 전체 분석 대상 단어 수 × 100
- 빈도 내림차순, 동률은 첫 등장 순
- 중복문장 비교: trim + 내부 연속 whitespace 1칸 + locale case folding
- 원문 표시값 보존
- 입력/결과는 브라우저 로컬 처리; 서버/API/Analytics 전송 추가 없음

## 사용자 승인 서비스 상한
- 입력: 300,000자
- 문장: 30,000문장
- 고유 키워드: 50,000개
- 기본 결과 표시: 상위 20개

제품과 checker는 단일 상수 `TOOL044_SERVICE_LIMITS`를 기준으로 사용한다.

## self-check 증거
- STATIC: 33 PASS / 0 FAIL
- LOGIC: 14 PASS / 0 FAIL
- EN/KO exact, JA sentence duplicate, case-insensitive, whitespace normalization,
  punctuation-only zero, emoji exclusion, frequency invariant, density formula/range,
  tie-break, deterministic normalization, numeric token, character boundary 포함

## 현재 환경 제약
전달 ZIP에는 `node_modules`가 없고 현재 실행 컨테이너에서 `npm ci`가 환경 단계에서 차단되었다.
따라서 TypeScript, Next production build, Playwright PC/mobile은 이 사본에서 PASS로 기록하지 않는다.

주작업장 통합 후 실행:
- `npm run check:tool044-static`
- `npm run test:toolbox:044-preflight`
- `npm run test:toolbox:044-core-only`
- `npm run test:toolbox:044-boundary-only`
- `npm run test:toolbox:044-regression-only`
- `npm run test:toolbox:044-limit-only`
- `npx tsc --noEmit`
- `npm run build`

FAIL은 PRODUCT / CHECKER-HARNESS / ENVIRONMENT로 먼저 분류한다.
TOOL043에서 추가된 State-dependent Mount Contract를 유지한다.

## 통합 영향 파일
- `package.json`
- `lib/site.ts`
- `app/sitemap.ts`
- `components/text-diff-compare-page.tsx`

기존 001~043은 위 통합 지점 외 임의 수정하지 않았다.

## DESIGN RE-ALIGNMENT 2026-08-17
- User-directed MAIN reference for the work area: TOOL042 actual implementation.
- TOOL044 work area now follows TOOL042's editor card, textarea state sizing, head/footer density, pill actions, primary action alignment, and mobile breakpoints while preserving TOOL044 paste-only functionality.
- EXPERT POST was added with the existing global TOOLBOX expert-post classes; no shared/global CSS was modified.
- Static/logic self-check after design change: 33/33 + 14/14 PASS.

## 2026-08-17 common CSS re-alignment
- Promoted the TOOL042-proven text editor/action/result primitives into `components/text-tool-input-common.module.css`.
- TOOL044 now consumes the common CSS directly for root/local notice/editor card/textarea/editor meta/footer/buttons/action row/error/summary cards.
- `keyword-frequency-duplicate-tool.module.css` now keeps only TOOL044-specific presentation: 4-column summary extension, keyword table, repeated/duplicate sentence cards.
- TOOL044 result output now remains inside the same common `workspaceSurface`, matching the TOOL042 work-area flow instead of using an independent outer panel.
- Existing global EXPERT POST classes remain the expert-area source of truth; no tool-specific expert CSS was introduced.
- Static checker now asserts common CSS file presence and direct `inputCommon.*` use for the shared primitives.

- Design correction: TOOL042/043/044 expert and important-notes sections now use existing shared detail CSS; numeric headings 042/043/044 were removed from IMPORTANT NOTES.


## 2026-08-17 작업영역 공통 CSS / Drag & Drop 재정합
- TOOL042 실제 작업영역을 공통 계약의 원본으로 재확정.
- TOOL042 shared 요소(workspace/dropzone/file bar/editor/textarea/button/action/result)는 `text-tool-input-common.module.css`를 직접 참조하도록 전환.
- TOOL044도 같은 공통 CSS를 직접 사용하며 TXT/MD/CSV 파일 선택과 작업영역 전체 drag & drop을 지원.
- 파일 로드 후 파일명/용량 표시, 새 파일 교체, 기존 입력이 있을 때 교체 확인 dialog, reset 시 파일 상태 초기화를 적용.
- TOOL044 고유 CSS는 키워드 표·요약 확장·중복문장 결과 표현만 유지.
- checker: TOOL042/044 공통 CSS 직접참조 + TOOL044 file/drop handlers를 static gate에 추가. STATIC 64 PASS / LOGIC 14 PASS / FAIL 0.

## Checker re-sync after design lock
- Latest TOOL044 product DOM/state/file/drag/replace/reset/limit contract re-inventoried.
- Preflight now validates initial mounted/visible/actionable state.
- Core now validates direct input, TXT file load, drag/drop, replacement cancel/confirm, result invalidation.
- Boundary validates punctuation-only, NaN/Infinity absence, complete reset, unsupported file rejection.
- LIMIT uses state-aware bounded native injection only after the textarea is confirmed visible.
- Harness self-check verifies every getByTestId selector exists in the latest product, no skip/fixme/only, desktop+mobile discovery, and no stale TOOL042/043 selector.
- Self-check result: STATIC 66 PASS / LOGIC 14 PASS / HARNESS 32 PASS / FAIL 0.
- Runtime FINAL must still be executed on the Windows project with installed dependencies; do not record FINAL PASS from static self-check alone.

## Windows runner incident classification
- Classification: CHECKER/HARNESS, not PRODUCT.
- Evidence: direct `npx playwright test tests/tool-044-preflight.spec.ts ...` = 6/6 PASS while wrapper returned EXIT=null with no Playwright output.
- Fix: Windows shell launch + explicit spawn-error evidence in `run-validation-full.mjs`.

## CORE fixture expected correction
- Classification: CHECKER/FIXTURE, not PRODUCT.
- `tests/fixtures/tool-044/sample.txt` contains 7 analyzed tokens (`Hello world apple banana apple hello WORLD`).
- Therefore `apple` is 2/7 = 28.57%, not 2/3 = 66.67%.
- Direct-input 3-token fixture keeps the valid 66.67% expectation; file-input test now expects the actual sample fixture contract.

## BOUNDARY NaN/Infinity false-positive correction
- Classification: CHECKER/HARNESS, not PRODUCT.
- Punctuation-only input correctly renders zero result values.
- The previous checker searched the entire page body and matched explanatory text containing the literal words `NaN` and `Infinity`.
- The assertion now scopes to `tool044-result` only, which is the actual runtime result region being validated.
- Product copy and analyzer code were not changed.
