# TOOL036 DESIGN-CODE CHECK

- TOOL: 036 글자 수·문서 통계 계산기
- MAIN reference: TOOL033 PDF Compressor — latest approved detail-page shell, section spacing, panel/card hierarchy, pill actions.
- SUB reference: TOOL018 Image Info & Metadata Checker — compact information/stat card density.
- SUB reference: TOOL016 Add Text to Image — textarea/control field treatment.
- Global CSS changed: NO.
- Legacy sealed CSS used/copied: NO.
- New style scope: `components/character-document-counter-tool.module.css` only.

## Static design decisions

1. Hero/back/eyebrow/title/description/local badge use existing shared TOOLBOX classes.
2. Tool workspace is deliberately text-first: large textarea, three primary statistics cards, five secondary statistics cards, collapsed advanced options.
3. Desktop primary statistics use a 3-column row; mobile collapses to one column.
4. Secondary statistics use a compact five-column grid, reducing to 3/2/1 columns by viewport.
5. Japanese long labels are allowed to wrap; no nowrap/min-width rule is used on metric cards.
6. Buttons reuse the current black/white inverse hierarchy through existing theme variables rather than hard-coded theme overrides.
7. HOW TO / COUNTING GUIDE / IMPORTANT NOTES / FAQ / NEXT WORK / RELATED TOOLS use shared common section classes.

## Main-workspace visual verification

Actual PC/mobile KO/EN/JA, Japanese wrapping, light/dark, focus ring, virtual keyboard and overflow remain main-workspace integration checks under the latest 2026-08-11 auxiliary-workshop rule.
