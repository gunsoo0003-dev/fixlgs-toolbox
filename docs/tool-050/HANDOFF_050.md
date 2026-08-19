# TOOL050 HANDOFF

Tool: 050 — 평일·영업일 계산기 / Business Days Calculator / 平日・営業日計算ツール
Slug: `business-day-calculator`
Category: F. Date & Time
Status: 보조작업장 READY — CODE/FUNCTION-STATIC/DESIGN-CODE/HARNESS-STRUCTURE/PACKAGE/COMMON FILE PROTECTION PASS; runtime integration items handed off

## Dedicated implementation files
- `app/[locale]/business-day-calculator/page.tsx`
- `components/tool-050-business-day-calculator-page.tsx`
- `components/tool-050-business-day-calculator.tsx`
- `components/tool-050-business-day-calculator.module.css`
- `lib/tool-050-business-day.ts`

## Dedicated verification files
- `playwright.tool050.config.ts`
- `tests/tool-050-preflight.spec.ts`
- `tests/tool-050-core.spec.ts`
- `tests/tool-050-feature.spec.ts`
- `tests/tool-050-holiday.spec.ts`
- `tests/tool-050-boundary.spec.ts`
- `tests/tool-050-regression.spec.ts`
- `tests/tool-050-limit.spec.ts`
- `scripts/tool-050/check-secret-scan.mjs`
- `scripts/tool-050/check-static.mjs`
- `scripts/tool-050/check-design.mjs`
- `scripts/tool-050/check-harness.mjs`
- `scripts/tool-050/check-logic.mjs`
- `scripts/tool-050/check-boundary.mjs`
- `scripts/tool-050/run-static-validation.mjs`
- `scripts/tool-050/run-validation-full.mjs`

## Design baseline
MAIN TOOL046; SUB TOOL045; TOOL047 tab semantics reference only.

## Common file protection
No common/global/sealed CSS, site registry, category registry, sitemap, robots, existing tool, or common harness file is modified in this package.

## Holiday dataset
KR/US/JP built-in public-holiday data is bundled for 2025–2027. The product explicitly discloses coverage. Main integration should extend/verify the maintained holiday dataset before claiming wider holiday accuracy.

## Main workspace integration verification
- Integrate route and any protected registry/category/sitemap entries using current main branch conventions.
- Run real browser PC/mobile KO/EN/JA light/dark checks.
- Run `npm run tool050:secret` and require Secret Scan PASS before FINAL.
- Run Playwright preflight/core/feature/holiday/boundary/regression/limit and FINAL.
- Run TypeScript and production build.
- Reconfirm public-holiday source/data maintenance policy and expand years as needed.

## Secret Scan gate
- `tool050:secret` is an official fail-closed verification command.
- The static self-check invokes Secret Scan before the other static gates.
- FULL FINAL invokes Secret Scan as an independent named stage before the static self-check.
- Secret material is never echoed to evidence; findings report only rule, file, and line.
- High-confidence checks include common provider tokens/API keys, private-key PEM blocks, and non-placeholder secret assignments in real `.env*` files.
