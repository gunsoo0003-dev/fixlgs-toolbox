# TOOL 025 Design Transplant Checklist — v12 DESIGN LOCK

Reference: TOOL 024 actual JSX/CSS state transition. No visual reinterpretation.

## Dropzone / workspace
- [x] Visible full-width Dropzone remains mounted before and after upload.
- [x] Before upload: dashed blue Dropzone + plus icon + choose button.
- [x] After upload: same Dropzone changes to neutral compact `dropzoneReady`; it is not removed.
- [x] `dropzoneReady::before` removes the blue plus icon.
- [x] Dropzone and workspace share drag state (`dropDragging || workspaceDragging`).
- [x] Workspace uses TOOL024 `::after` drag overlay and panel border tint.
- [x] No custom second drag-overlay DOM.
- [x] Dropped replacement routes to `acceptFile(e.dataTransfer.files[0])`.

## Layout
- [x] PREVIEW spans columns 1/2; PRESET is column 3.
- [x] Preview minimum work area is 620px on desktop.
- [x] Lower row is EXPORT / A4 PRINT / ALIGN in three equal columns.
- [x] Lower cards use equal-height stretch.
- [x] No standalone RESET card.
- [x] No `order:-1` mobile workaround.

## EXPORT / A4
- [x] Individual download + A4 download + Reset settings + Reset all are one EXPORT action group.
- [x] A4 card is preview/guide only.
- [x] A4 preview repeats the actual uploaded photo on canvas.
- [x] A4 download remains in EXPORT.

## Common content / CSS protection
- [x] TOOL024 common HOW TO / expert / important notes / FAQ DOM is reused.
- [x] TOOL025 common-area styles are not added to globals or sealed legacy CSS.
- [x] TOOL025 unique styles remain in the component CSS module.

## Validator lock
- [x] `check-design-transplant.mjs` checks the above source/CSS contract.
- [x] `tool-025-design-state.spec.ts` checks upload-before/upload-after/workspace-drag states in a browser.
- [x] `FINAL_VALIDATION_CHECKLIST_025.md` is the complete one-run final checklist.
