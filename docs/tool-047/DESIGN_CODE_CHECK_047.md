# TOOL047 DESIGN CODE CHECK

MAIN: current TOOLBOX detail-page shell used by completed text/PDF/image tools (`ToolboxSubpageShell` + detail hero/body/guide/FAQ structure).

Checked elements:
- Header/footer shell reused without modification.
- Hero: back link, numbered eyebrow, H1, one-line description, LOCAL badge.
- Work area: dedicated calculator module only; no new global selector.
- Result: primary result card, milestone cards, common detail sections below.
- HOW TO USE / EXPERT POST / IMPORTANT NOTES / FAQ follow established detail-page section sequence.
- Mobile: dedicated module collapses mode buttons, fields, milestone grid and actions at 720px.
- Dark mode: module consumes existing CSS variables; no global theme override.
- KO/EN/JA: no locale-specific global CSS added.
- Legacy sealed CSS: not referenced.

No common CSS or shared component files were modified in the handoff package.


## DESIGN REVIEW FINAL ALIGNMENT (2026-08-19)

Checker contract updated after local visual review against TOOL045 date-tool design vocabulary.

- LOCAL notice bar is required before mode controls.
- Three mode tabs remain one row; active tab uses `var(--blue)` background + white text.
- DATE WORKSPACE uses the blue-series border/background, shared header rhythm, and reset action in the workspace header.
- Date/event inputs use card-style fields and the existing TOOLBOX CSS variables.
- RESULT uses a common result header with copy action while preserving TOOL047's large D-Day value as its tool-specific result expression.
- Mobile <=720px collapses fields to one column but preserves the three mode tabs and >=44px primary controls.
- No global/common CSS files are modified for this alignment.

Machine check: `scripts/tool-047/check-design.mjs` via `scripts/tool-047/run-static-validation.mjs`.
