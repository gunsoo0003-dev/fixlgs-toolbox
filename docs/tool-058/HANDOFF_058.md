# TOOL058 HANDOFF

- Tool: 058 / 데이터·요리 단위 변환기 / Data & Cooking Unit Converter / データ・料理単位変換ツール
- Category: G. 단위·일반 계산기 (`unit-calc`)
- Slug: `data-cooking-unit-converter`
- Expected URLs: `/ko|en|ja/data-cooking-unit-converter`
- Auxiliary status: READY FOR MAIN-WORK INTEGRATION

## Implemented
- Data category: bit, byte, KB, MB, GB, TB.
- Explicit Decimal 1000 / Binary 1024 selection.
- Binary display uses KiB/MiB/GiB/TiB.
- 1 byte=8 bit.
- Cooking category: cup, tbsp, tsp, mL.
- Cooking canonical reference: FDA nutrition-labeling reference 240/15/5 mL.
- Common-unit simultaneous results, swap/reset/precision/copy.
- KO/EN/JA content, FAQ, notes, structured data, route metadata.
- Dedicated TOOL058 fixture/spec/checker/runner package.

## Main-work integration required
1. Register TOOL058 slug/title/description/card in protected `lib/site.ts` using the current live 056/057 state from the latest main project.
2. Add TOOL058 URLs to protected `app/sitemap.ts` and confirm robots behavior.
3. Confirm category numbering/order 055→056→057→058→059 in the latest integrated project.
4. Run actual browser/Playwright on PC/mobile, KO/EN/JA, light/dark, Japanese wrapping/overflow.
5. Run preflight/core/feature/data/binary/cooking/dimension/boundary/regression/limit and production build in the latest project.
6. Confirm common CSS/layout regression and integrated FINAL PASS.
7. Deploy, Search Console inspect/request index, and record indexing state under the main project workflow.

## Protected common files modified
- None.
- `app/globals.css`, `styles/*.css`, `lib/site.ts`, `app/sitemap.ts`, `package.json`, `package-lock.json` hashes were unchanged during auxiliary production.

## Dependencies
- New npm packages: none.
- Server/API/account/key/external upload: none.

## Actual transplant files
- `app/[locale]/data-cooking-unit-converter/page.tsx`
- `components/tool-058-data-cooking-unit-converter.tsx`
- `components/tool-058-data-cooking-unit-converter.module.css`
- `components/tool-058-data-cooking-unit-converter-page.tsx`
- `lib/tool-058-units.ts`
- `tests/fixtures/tool-058/cases.json`
- `tests/tool-058-preflight.spec.ts`
- `tests/tool-058-core.spec.ts`
- `tests/tool-058-feature.spec.ts`
- `tests/tool-058-data.spec.ts`
- `tests/tool-058-binary.spec.ts`
- `tests/tool-058-cooking.spec.ts`
- `tests/tool-058-dimension.spec.ts`
- `tests/tool-058-boundary.spec.ts`
- `tests/tool-058-regression.spec.ts`
- `tests/tool-058-limit.spec.ts`
- `playwright.tool058.config.ts`
- `scripts/tool-058/check-source.mjs`
- `scripts/tool-058/check-design.mjs`
- `scripts/tool-058/check-harness.mjs`
- `scripts/tool-058/check-logic.mjs`
- `scripts/tool-058/run-static-validation.mjs`
- `scripts/tool-058/run-validation-full.mjs`

## Source basis included
- `docs/tool-058/source/FIXLGS_TOOLBOX_058_데이터_요리_단위_변환기_제작전달서(1).pdf`
