# TOOL060 HANDOFF

## Identity
- Tool: 060 — Shoe & Clothing Size Converter / 신발·의류 사이즈 변환기 / 靴・衣類サイズ変換ツール
- Category: G. Unit & Calculator
- Slug: `shoe-clothing-size-converter`
- Expected routes: `/ko|en|ja/shoe-clothing-size-converter`
- Status: COMPONENT PACKAGE COMPLETE; integration/runtime and numeric source verification remain explicit gates.

## Implemented
- Shoes vs clothing separated.
- Men / women / kids separated.
- Clothing tops / bottoms separated.
- KR / US / UK / EU / JP shown simultaneously.
- Shoe foot-length reference and lookup.
- Clothing chest/bust/waist/hip ranges.
- Separate kids registries; no adult fallback.
- Reference-only and brand-chart warning.
- Copy, reset, full table.
- KO/EN/JA UI, SEO copy, FAQ, structured data, canonical/hreflang.
- Mobile vertical-country-card CSS.

## Integration files
- `app/[locale]/shoe-clothing-size-converter/page.tsx`
- `components/tool-060-shoe-clothing-size-converter-page.tsx`
- `components/tool-060-shoe-clothing-size-converter.tsx`
- `components/tool-060-shoe-clothing-size-converter.module.css`
- `lib/tool-060-sizes.ts`
- `playwright.tool060.config.ts`
- `tests/tool-060-preflight.spec.ts`
- `tests/tool-060-core.spec.ts`
- `tests/tool-060-category.spec.ts`
- `tests/tool-060-boundary.spec.ts`
- `tests/tool-060-regression.spec.ts`
- `tests/fixtures/tool-060/cases.json`
- `scripts/tool-060/*`

## Protected common files
No edits. Baseline byte comparison PASS for globals/common/theme/compat/legacy sealed CSS.

## Main workspace integration
- Register category/card/site/sitemap/robots only in the latest integrated project according to main-workspace procedure.
- Run actual localhost, Playwright desktop/mobile, KO/EN/JA, light/dark, production build and 055~059 integrated regression.
- Supplied baseline ends at TOOL058, so TOOL059 integrated regression could not be performed here.

## Data provenance gate
The supplied TOOL060 brief requires ISO/general international reference methodology but does not reproduce the full numeric source tables. Therefore the bundled static rows are a **general implementation reference dataset**, not an ISO-certified table and not a brand-specific guarantee. Before public production FINAL, main workspace must either (a) validate/replace rows against the approved reference source set and record source/date, or (b) retain the general-reference characterization and approve the crosswalk values explicitly.

Official web verification performed during this work confirmed that current adidas and Nike footwear charts publish brand-specific US/UK/EU/JP/foot-length mappings and that size/measurement guidance is product/brand dependent. This supports keeping the UI as reference-only rather than guaranteed sizing.

## Dependency
No new npm dependency added. `package.json` / `package-lock.json` unchanged.
