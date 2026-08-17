# TOOL044 변경목록

## 기존 파일 수정
- `components/text-tool-input-common.module.css`
- `app/sitemap.ts`
- `components/text-diff-compare-page.tsx`
- `lib/site.ts`
- `package.json`

## 신규 파일
- `app/[locale]/keyword-frequency-duplicate-analyzer/page.tsx`
- `components/keyword-frequency-duplicate-page.tsx`
- `components/keyword-frequency-duplicate-tool.module.css`
- `components/keyword-frequency-duplicate-tool.tsx`
- `docs/tool-044/CHANGES_044.md`
- `docs/tool-044/HANDOFF_044.md`
- `docs/tool-044/REQ_MASTER_044.md`
- `lib/tool-044-keyword-analyzer.ts`
- `playwright.tool044.config.ts`
- `scripts/tool-044/check-logic.mjs`
- `scripts/tool-044/check-static.mjs`
- `scripts/tool-044/run-static-validation.mjs`
- `tests/helpers/tool-044.ts`
- `tests/tool-044-boundary.spec.ts`
- `tests/tool-044-core.spec.ts`
- `tests/tool-044-limit.spec.ts`
- `tests/tool-044-preflight.spec.ts`
- `tests/tool-044-regression.spec.ts`

## 2026-08-17 design re-alignment
- WORKSPACE MAIN reference: TOOL042 actual text-find-replace-tool.tsx / text-find-replace-tool.module.css.
- Re-aligned TOOL044 workspace to TOOL042 editorCard -> textareaShell -> editorHead -> editorFoot -> single primary action hierarchy.
- Re-aligned textarea initial/loaded heights, pill buttons, card radius/padding, mobile action density to TOOL042.
- Kept TOOL044 as paste-only by product contract; TOOL042 file-upload/drag behavior was not copied.
- Added the missing EXPERT POST section using the existing global toolbox-tool-expert-post wide-head/compact-copy structure.
- Expert content added for KO/EN/JA: density interpretation, SEO boundary, Intl.Segmenter, case folding, duplicate normalization, tie-break, punctuation/emoji, local processing.
- Re-ran TOOL044 static/logic self-check: STATIC 33 PASS / LOGIC 14 PASS / FAIL 0.

## 2026-08-17 common CSS re-alignment
- Promoted the TOOL042-proven text editor/action/result primitives into `components/text-tool-input-common.module.css`.
- TOOL044 now consumes the common CSS directly for root/local notice/editor card/textarea/editor meta/footer/buttons/action row/error/summary cards.
- `keyword-frequency-duplicate-tool.module.css` now keeps only TOOL044-specific presentation: 4-column summary extension, keyword table, repeated/duplicate sentence cards.
- TOOL044 result output now remains inside the same common `workspaceSurface`, matching the TOOL042 work-area flow instead of using an independent outer panel.
- Existing global EXPERT POST classes remain the expert-area source of truth; no tool-specific expert CSS was introduced.
- Static checker now asserts common CSS file presence and direct `inputCommon.*` use for the shared primitives.

## 2026-08-17 expert/common-CSS re-alignment
- TOOL042: added EXPERT POST using shared toolbox-tool-expert-post classes; IMPORTANT NOTES title changed from numeric 042 to localized caution title and --format-head common modifier.
- TOOL043: added EXPERT POST using shared toolbox-tool-expert-post classes; IMPORTANT NOTES title changed from numeric 043 to localized caution title and --format-head common modifier.
- TOOL044: kept shared EXPERT POST; IMPORTANT NOTES title changed from numeric 044 to localized caution title and --format-head common modifier.
- No tool-specific typography CSS added for these sections.


## 2026-08-17 작업영역 공통 CSS / Drag & Drop 재정합
- TOOL042 실제 작업영역을 공통 계약의 원본으로 재확정.
- TOOL042 shared 요소(workspace/dropzone/file bar/editor/textarea/button/action/result)는 `text-tool-input-common.module.css`를 직접 참조하도록 전환.
- TOOL044도 같은 공통 CSS를 직접 사용하며 TXT/MD/CSV 파일 선택과 작업영역 전체 drag & drop을 지원.
- 파일 로드 후 파일명/용량 표시, 새 파일 교체, 기존 입력이 있을 때 교체 확인 dialog, reset 시 파일 상태 초기화를 적용.
- TOOL044 고유 CSS는 키워드 표·요약 확장·중복문장 결과 표현만 유지.
- checker: TOOL042/044 공통 CSS 직접참조 + TOOL044 file/drop handlers를 static gate에 추가. STATIC 64 PASS / LOGIC 14 PASS / FAIL 0.

## PDF section-spacing consistency
- TOOL028/029의 `HOW TO USE` 이후 하단 섹션을 TOOL027과 동일하게 `toolbox-tool-detail-body` 밖으로 이동.
- 별도 margin/padding CSS를 추가하지 않고 기존 공통 `.toolbox-tool-detail-body` 하단 spacing을 직접 사용.
- RELATED TOOLS → HOW TO USE 사이 간격을 TOOL027 구조와 통일.

## Checker/state contract re-sync
- Updated TOOL044 Playwright specs to the latest product state inventory.
- Added file-load, drag/drop, file-replacement cancel/confirm, complete reset, invalid-file, and runtime actionability checks.
- Added state-aware native injection helper for limit tests.
- Added `check-harness.mjs` and `run-validation-full.mjs`.
- Added `test:toolbox:044-final` and stage-only npm scripts.
- Static self-check after sync: 66 static + 14 logic + 32 harness PASS, FAIL 0.

## Windows validation runner fix
- PRE-FLIGHT product tests independently passed 6/6 on desktop/mobile KO/EN/JA.
- Wrapper runner previously returned `status=null` because Windows `.cmd` execution through `spawnSync(shell:false)` did not launch `npx`.
- PRODUCT was not modified.
- Windows Playwright/TypeScript/build commands now run through the shell, matching the successful interactive command.
- Runner now records `SPAWN_ERROR=` whenever process creation itself fails.

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
