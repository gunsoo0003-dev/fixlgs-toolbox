# TOOL035 DESIGN CODE CHECK — 2026-08-16 revised

## Latest design donors
- Full-width lower explanation sections: TOOL032 actual page wrapper structure.
- Uploaded-state drag/workspace contract: TOOL033/TOOL034 actual code.
- Dropzone/card/button spacing and emphasis tokens: TOOL034 actual module CSS.
- TOOL035-specific page-range/progress UX: TOOL029 only where the feature contract requires it.

## Mandatory anti-regression checks
1. `toolbox-tool-detail-body` closes before HOW TO USE / USE CASES / EXPERT POST / IMPORTANT NOTES / FAQ / processing note.
2. After upload, there is exactly one `tool035-workspace` drag target.
3. `activeWorkspace` owns one drag overlay and contains the file card, controls, progress, errors/status/limit notice, and result area.
4. Drag enter/leave/drop uses one shared `workspaceDragging` state; visual drag emphasis reaches file/control/result cards.
5. Dropzone rhythm matches TOOL034: 28px padding, 18px radius, 16px strong text, 12px support text, same blue hover/drag emphasis family.
6. Uploaded card/workspace rhythm matches TOOL034: 16px major gap/radius, 42px primary control height, overlay inset -6px/radius 22px.
7. Mobile keeps a 760px vertical-flow breakpoint and a narrow 420px breakpoint; image results remain two columns at 760px and collapse further on narrow screens as defined by 035.
8. Module CSS must not override `.toolbox-*` common selectors and must not introduce `!important`.
9. LOCAL processing notice remains before the upload area.

## Mechanical result
- `node scripts/tool-035/check-design.mjs`: PASS
- `node scripts/tool-035/run-static-validation.mjs`: PASS (7/7 groups)
- `node scripts/tool-035/check-main-integration.mjs`: PASS
- `node scripts/check-mobile-real-photo-001-035-validator.mjs`: PASS

## Remaining user-Windows gate
This code-level design gate does not replace real browser verification. TypeScript, production build, Desktop Chromium, Mobile Chromium, and the complete FINAL runner still require the Windows official validation environment before final PASS declaration.
