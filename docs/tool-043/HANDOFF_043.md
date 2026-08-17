# TOOL043 HANDOFF

## Scope
- TOOL043: Text Diff & Compare / 두 텍스트 비교기
- Protected baseline: TOOL001~042
- Design baseline: actual TOOL042 code/state/layout; TOOL043-specific diff functions only added.

## Implemented
- Added/removed/changed/unchanged deterministic line diff.
- Word detail inside changed blocks with Intl.Segmenter fallback.
- A/B reconstruction invariant and exact fixtures.
- Plain-text diff report and Clipboard API UI with manual report fallback.
- KO/EN/JA route, metadata, canonical/hreflang, sitemap, FAQ, related tools.
- PC two-column input and mobile single-column result.
- Approved service limit: 200,000 characters and 20,000 lines per text.
- Internal changed-block word token safeguard: 20,000 tokens.

## Validation completed in this workspace
- TOOL043 static self-check: 58 PASS / 0 FAIL.
- TOOL043 logic exact/boundary checker: 59 PASS / 0 FAIL.
- Isolated strict TypeScript check for core diff engine: PASS.
- Earlier TypeScript transpile syntax check covered the pre-additive TOOL043 TS/TSX set. After the user-approved file/drop/swap/filter/download UI additions, full project TypeScript remains ENVIRONMENT BLOCKED by missing type packages; do not reuse the earlier transpile result as final evidence.
- Performance evidence:
  - 20,000 lines / one changed line: ~25.2 ms, reconstruction PASS.
  - 10,000 lines / all different: ~24.3 ms, reconstruction PASS.
  - ~200,000 chars / single-line change: ~12.4 ms, reconstruction PASS.

## Environment block — not a product PASS
The supplied clean next-work ZIP intentionally had no dependencies. An attempted npm/Playwright resolution failed with npm registry `EAI_AGAIN`; package directories created by the interrupted install are empty. Therefore actual Next build and Playwright browser execution are structurally unavailable in this runtime. They are NOT marked PASS.

Required integration environment run order:
1. Install dependencies from the existing package-lock.
2. `npm run check:tool043-static`
3. `npx tsc --noEmit`
4. `npm run build`
5. `npm run test:toolbox:043-preflight`
6. `npm run test:toolbox:043-core-only`
7. `npm run test:toolbox:043-boundary-only`
8. `npm run test:toolbox:043-regression-only`
9. `npm run test:toolbox:043-limit-only`
10. Actual clipboard text verification on KO/EN/JA PC/mobile.
11. Only after all pass: integrated FINAL, Git selective staging/push/archive/clean.

## Git note
The provided next-work ZIP contains no `.git`, so commit/push/HEAD/archive evidence cannot be produced from this isolated copy. Do not synthesize Git PASS. Use the actual repository for the final Git gate.

## User-approved additive UX (2026-08-17)
- Added independent A/B plain-text file loading for TXT, MD, CSV, JSON, XML, LOG.
- Added independent A/B drag-and-drop zones; dropping on A never mutates B and vice versa.
- Added A ↔ B swap, actual per-line numbers, changes-only filter, and TXT report download.
- DOCX/PDF redline, semantic/AI diff, merge remain out of scope.
- Diff engine contract and approved 200,000-character / 20,000-line limits are unchanged.

## Empty-state design alignment (2026-08-17)
- Replaced the always-visible initial textareas with two independent light-blue dashed start workspaces matching the established TOOLBOX upload/start visual language.
- A and B remain visibly distinct through badges and baseline/comparison descriptions.
- Supported formats (TXT, MD, CSV, JSON, XML, LOG) are visible before any input.
- Clicking an empty side activates and focuses only that side's textarea; paste, file selection, and drag/drop also activate only the acted-on side.
- Reset returns both sides to the empty blue start state. Existing result UI and diff engine were intentionally left unchanged.
- Static/state-source gates pass; actual browser transition verification remains part of the environment-blocked Playwright gate and is not claimed as FINAL PASS.

## 2026-08-17 shared text-workspace CSS refactor
- TOOL042 deployed blue input/dropzone values are the source of truth.
- Shared module: `components/text-tool-input-common.module.css`.
- TOOL042 and TOOL043 both import/use the shared workspace surface, drag state, start dropzone, plus icon, file button, and responsive rules.
- TOOL043 keeps only A/B-specific modifiers and per-tool copy/file-format data in its own component/CSS.
- This is a maintenance refactor; TOOL042 behavior/wording and TOOL043 diff/result behavior are not intentionally changed.
