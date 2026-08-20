# TOOL063 DESIGN CODE CHECK

- MAIN reference: TOOL058 — latest calculator/converter page in supplied baseline; tabs → workspace → result → lower common sections.
- SUB references: TOOL055/056/057 — calculator workspace, responsive card and primary-action conventions.
- Shared classes reused: `ToolboxSubpageShell`, hero/body, next-work, guide-five, format-guide/expert-post, info-band, FAQ.
- Feature-specific UI is isolated in `components/tool-063-ratio-proportion-calculator.module.css`.
- `app/globals.css` and global styles: no TOOL063 selector added.
- legacy sealed selectors: not referenced.
- Primary action: black background / white text, matching current calculator family.
- Responsive: 5 desktop mode tabs collapse to one-column mobile list; equation fields collapse to one column at narrow widths.
- Live PC/mobile/KO/EN/JA/light/dark rendering: main workspace integrated verification per 2026-08-11 top-level rule.
