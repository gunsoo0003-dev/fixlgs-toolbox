# TOOL055 HANDOFF

## Identity
- Tool: 055 — 길이·면적·부피 변환기 / Length, Area & Volume Converter / 長さ・面積・体積変換ツール
- Category: G / `unit-calc`
- Slug: `length-area-volume-converter`
- URLs: `/ko|en|ja/length-area-volume-converter`
- Auxiliary status: CODE PASS / FUNCTION-STATIC PASS / DESIGN-CODE PASS / HARNESS-STRUCTURE PASS / COMMON FILE PROTECTION PASS.

## Implemented fixed scope
- Length, area, volume conversion.
- Pyeong↔m².
- Common-unit simultaneous display up to 6.
- From/To, swap, copy, reset, precision 0..8.
- Browser-local calculation only.
- Input absolute limit 1e15; zero accepted; negative general measurements rejected.

## Canonical factors
- length canonical: meter.
- area canonical: square meter.
- volume canonical: cubic meter.
- pyeong: `400/121 m²`.
- imperial/U.S. factors are stored explicitly in the TOOL055 registry; checker fixture expected values are independent.

## MAIN design baseline
- MAIN TOOL050: calculator workbench/card/action/result density and responsive structure.
- Common information sections reuse official toolbox common classes.
- TOOL055-specific workbench styling only in its CSS module.

## Files to integrate (1:1 package list)
1. `app/[locale]/length-area-volume-converter/page.tsx`
2. `components/tool-055-length-area-volume-converter-page.tsx`
3. `components/tool-055-length-area-volume-converter.tsx`
4. `components/tool-055-length-area-volume-converter.module.css`
5. `lib/tool-055-units.ts`
6. `scripts/check-tool-055-source.mjs`
7. `tests/tool-055-preflight.spec.ts`
8. `tests/tool-055-core.spec.ts`
9. `tests/tool-055-feature.spec.ts`
10. `tests/tool-055-dimension.spec.ts`
11. `tests/tool-055-boundary.spec.ts`
12. `tests/tool-055-regression.spec.ts`
13. `tests/tool-055-limit.spec.ts`
14. `tests/fixtures/tool-055/cases.json`
15. `docs/tool-055/REQ_MASTER_055.md`
16. `docs/tool-055/LIMIT_BRIEFING_055.md`
17. `docs/tool-055/DESIGN_CODE_CHECK_055.md`
18. `docs/tool-055/CHECKLIST_055.md`
19. `docs/tool-055/HANDOFF_055.md`
20. `docs/tool-055/source/FIXLGS_TOOLBOX_055_길이_면적_부피_변환기_제작전달서(1).pdf`
21. `docs/tool-055/evidence/TOOL055_STATIC_CHECK.txt`
22. `docs/tool-055/evidence/TOOL055_SYNTAX_CHECK.txt`
23. `docs/tool-055/evidence/TOOL055_ENGINE_CHECK.txt`
24. `docs/tool-055/evidence/COMMON_PROTECTION_VERIFY_055.txt`

## Common-file changes deliberately NOT made
- `app/globals.css` and all `styles/*.css` global files.
- `lib/site.ts` category/card/slug shared registration.
- sitemap/robots.
- package.json/package-lock.json.
- existing completed tools/checkers/common harness.

## Main-work integration verification
1. Integrate the files above into the latest project.
2. Add TOOL055 card/availability to `unit-calc` category through the current shared registration mechanism.
3. Add shared slug export only if the latest project convention requires it.
4. Add KO/EN/JA TOOL055 routes to sitemap; verify robots does not block them.
5. Verify related/next tool availability against the latest project (056–059 may already exist there).
6. Run actual browser PC/mobile, KO/EN/JA, light/dark, Japanese wrapping/overflow.
7. Run preflight/core/feature/dimension/boundary/regression/limit Playwright suites.
8. Run typecheck, production build, integrated regression and FINAL.
9. Verify Search Console/indexing after deployment.

## Dependency
- New OSS/package: none.
- `package.json` and `package-lock.json`: unchanged by SHA256 comparison.

25. `docs/tool-055/MANIFEST_SHA256_055.txt`
26. `docs/tool-055/evidence/PACKAGE_VERIFY_055.txt`

## Main-work integration update — 2026-08-19
- Integrated TOOL055 route/product/unit registry into the TOOL054 next-project baseline.
- `unit-calc` category registration is LIVE and reports 1 available tool.
- `tool055Slug` and KO/EN/JA titles/descriptions added to the shared site registry.
- TOOL055 KO/EN/JA URLs added to `app/sitemap.ts`; existing robots policy remains unchanged.
- FAQ large heading corrected to locale-specific `자주 묻는 질문 / Frequently asked questions / よくある質問`.
- Added TOOL055 isolated Playwright config, runtime-safety spec, source/design/harness/logic/secret static gates and FULL FINAL runner.
- Main integration static evidence: SOURCE 26/26, DESIGN 18/18, HARNESS 32/32, LOGIC 9/9, Secret Scan 1465/0 — PASS.
- Actual browser / TypeScript / production build are `ENVIRONMENT_BLOCK` in the isolated artifact environment because node_modules is not shipped and dependency installation could not complete within the execution time limit. This is not recorded as PRODUCT FAIL.
- Before commit/push, run `npm run tool055:final` in the normal project environment and require STATUS=PASS, FAIL=0, ENVIRONMENT_BLOCK=0.
