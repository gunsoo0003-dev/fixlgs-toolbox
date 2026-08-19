# TOOL051 DESIGN CODE CHECK
- MAIN: TOOL047 — local notice / 3-mode top controls / workspace head / result card / detail-page common sections
- SUB: TOOL046 — date-time calculator input/result workflow and calculator-oriented field density
- Common classes: detail hero/body, next-work, guide, format-guide, info-band, FAQ reused from existing shell
- Dedicated CSS: components/tool-051-time-calculator.module.css only
- app/globals.css / styles global files changed: NONE
- legacy sealed direct use: NONE
- 720px mobile layout checked statically; 390px long-label safety changes the 3 modes to one column
- light/dark colors rely on existing var(--tb-*) and var(--blue) tokens
- actual browser rendering: MAIN workbench integration responsibility per latest top-level auxiliary-workshop rule
