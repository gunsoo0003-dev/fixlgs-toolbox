# TOOL058 DESIGN-CODE CHECK

## Baseline
- MAIN: TOOL055 Length, Area & Volume Converter.
- Reason: same G category and same value → From/To → immediate result → common units → precision/copy/reset flow.

## Checks
- `ToolboxSubpageShell` and shared hero/body/next/how-to/guide/notes/FAQ classes reused.
- Lower page order preserved: HOW TO → REFERENCE GUIDE → IMPORTANT NOTES → FAQ.
- TOOL058-specific workspace isolated in `tool-058-data-cooking-unit-converter.module.css`.
- Desktop: 2 category tabs, 2 notation buttons, four-part value/from/swap/to row, 3-column data summary.
- Tablet: 2-column input/summary preparation.
- Mobile: 1-column input/summary; Japanese labels and IEC strings wrap without forced global overrides.
- Active category/notation uses blue plus text/aria state; basis is never color-only.
- Global CSS modification: none.
- Legacy sealed direct reference: none.
- `!important`: none.

## Result
DESIGN-CODE PASS: 21/21 static design assertions after one HARNESS_ERROR correction in the checker.
Actual browser/viewport/light-dark rendering remains MAIN-WORK INTEGRATION VERIFICATION under the latest top-level auxiliary-workshop rule.
