# TOOL 038 CHANGE MAP

## Dedicated implementation
- app/[locale]/case-sentence-format-converter/page.tsx
- components/case-sentence-format-converter-page.tsx
- components/case-sentence-format-converter-tool.tsx
- components/case-sentence-format-converter-tool.module.css
- lib/tool-038-case.ts

## Dedicated validation
- tests/fixtures/tool-038/cases.json
- scripts/tool-038/check-source.mjs
- scripts/tool-038/check-logic.mjs
- docs/tool-038/REQ_MASTER.md

## Protected common integration not modified
- lib/site.ts
- app/sitemap.ts
- package.json / package-lock.json
- app/globals.css
- styles/*.css common/sealed files

## Main integration tasks
Register TOOL038 in latest `lib/site.ts`, sitemap, text category card and package runner only after transplant into the actual latest main worktree.
