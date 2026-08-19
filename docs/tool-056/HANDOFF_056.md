# TOOL056 HANDOFF

## Identity
- Tool: 056 — 무게·온도·압력 변환기 / Weight, Temperature & Pressure Converter / 重量・温度・圧力変換ツール
- Category: G / `unit-calc`
- Slug: `weight-temperature-pressure-converter`
- URLs: `/ko|en|ja/weight-temperature-pressure-converter`
- Auxiliary status: CODE PASS / FUNCTION-STATIC PASS / DESIGN-CODE PASS / HARNESS-STRUCTURE PASS / PACKAGE PASS / COMMON FILE PROTECTION PASS.

## Implemented fixed scope
- Mass: mg, g, kg, t, oz, lb.
- Temperature: °C, °F, K.
- Pressure: Pa, kPa, MPa, bar, atm, psi, mmHg.
- Precision 0..8, From/To, instant conversion, swap, reset, preset, copy.
- Browser-local calculation only.
- Input absolute limit 1e15.
- Mass/pressure negative rejected; temperature negatives allowed; Kelvin below 0 rejected.

## Conversion basis
- Mass canonical: kilogram.
- Pressure canonical: pascal.
- Temperature canonical: Celsius with affine scale+offset conversion.
- Temperature formula basis: °F = °C × 1.8 + 32; K = °C + 273.15.
- Standard atmosphere: 101325 Pa.
- Conventional mmHg registry: 133.3224 Pa.
- psi registry: 6894.757293168 Pa.
- lb registry: 0.45359237 kg; oz = 1/16 lb.
- External basis cross-check: NIST SP 811 / NIST OWM unit-conversion references.

## MAIN design baseline
- MAIN TOOL055: same G-category converter workbench and common detail structure.
- Common information sections reuse official toolbox common classes.
- TOOL056-specific workbench styling only in its CSS module.

## Files to integrate
1. `app/[locale]/weight-temperature-pressure-converter/page.tsx`
2. `components/tool-056-weight-temperature-pressure-converter-page.tsx`
3. `components/tool-056-weight-temperature-pressure-converter.tsx`
4. `components/tool-056-weight-temperature-pressure-converter.module.css`
5. `lib/tool-056-units.ts`
6. `playwright.tool056.config.ts`
7. `tests/tool-056-preflight.spec.ts`
8. `tests/tool-056-design.spec.ts`
9. `tests/tool-056-core.spec.ts`
10. `tests/tool-056-feature.spec.ts`
11. `tests/tool-056-temperature.spec.ts`
12. `tests/tool-056-pressure.spec.ts`
13. `tests/tool-056-mass.spec.ts`
14. `tests/tool-056-boundary.spec.ts`
15. `tests/tool-056-regression.spec.ts`
16. `tests/tool-056-limit.spec.ts`
17. `tests/fixtures/tool-056/cases.json`
18. `scripts/tool-056/check-source.mjs`
19. `scripts/tool-056/check-design.mjs`
20. `scripts/tool-056/check-harness.mjs`
21. `scripts/tool-056/check-logic.mjs`
22. `scripts/tool-056/run-static-validation.mjs`
23. `scripts/tool-056/run-validation-full.mjs`
24. `docs/tool-056/REQ_MASTER_056.md`
25. `docs/tool-056/LIMIT_BRIEFING_056.md`
26. `docs/tool-056/DESIGN_CODE_CHECK_056.md`
27. `docs/tool-056/CHECKLIST_056.md`
28. `docs/tool-056/HANDOFF_056.md`
29. `docs/tool-056/source/FIXLGS_TOOLBOX_056_무게_온도_압력_변환기_제작전달서(1).pdf`
30. `docs/tool-056/evidence/TOOL056_STATIC_CHECK.txt`
31. `docs/tool-056/evidence/COMMON_PROTECTION_VERIFY_056.txt`
32. `docs/tool-056/evidence/PACKAGE_VERIFY_056.txt`
33. `docs/tool-056/MANIFEST_SHA256_056.txt`

## Common-file changes deliberately NOT made
- `app/globals.css` and all official global `styles/*.css` files.
- `lib/site.ts` category/card/slug shared registration.
- `app/sitemap.ts` / robots.
- `package.json` / `package-lock.json`.
- existing completed tools/checkers/common harness.

## Main-work integration verification
1. Integrate the dedicated files into the latest project.
2. Add TOOL056 slug/title/description and LIVE card to `unit-calc` using the latest shared registration mechanism.
3. Add KO/EN/JA TOOL056 routes to sitemap; verify robots remains open.
4. Add package scripts only if current project convention requires named `tool056:*` commands; no new dependency is required.
5. Verify NEXT WORK 057 and RELATED 055/058/059 availability against the latest integrated state.
6. Run actual browser PC/mobile, KO/EN/JA, light/dark, long pressure labels, Japanese wrapping/overflow.
7. Run preflight/core/feature/temperature/pressure/mass/boundary/regression/limit Playwright suites.
8. Run typecheck, production build, integrated regression and FINAL; require FAIL=0 / SKIP=0 in the normal project environment.
9. Deploy, request indexing and record indexing state per main-work control procedure.

## Dependency
- New OSS/package: none.
- package.json and package-lock.json must remain unchanged in auxiliary package.
