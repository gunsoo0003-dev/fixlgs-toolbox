# TOOL065 HANDOFF

- Tool: 065 / 분수·소수 계산기 / Fraction & Decimal Calculator / 分数・小数計算ツール
- Category: G. 단위·일반 계산기 (`unit-calc`)
- Slug: `fraction-decimal-calculator`
- Expected URLs: `/ko|en|ja/fraction-decimal-calculator`
- Auxiliary status: READY FOR MAIN-WORK INTEGRATION

## Implemented
- Fraction operations: add, subtract, multiply, divide.
- GCD simplify / positive-denominator normalization.
- Fraction→decimal with finite/repeating display policy.
- Decimal→fraction from exact input string.
- Mixed-number and negative input.
- Simplified fraction + mixed number + decimal result.
- Expandable working steps, copy, reset, precision control.
- Error handling: invalid syntax, denominator 0, division by 0, input/rational limits.
- KO/EN/JA content, FAQ, notes, structured data, route metadata.
- TOOL065 fixture/spec/static-checker package.

## Protected common files modified
- None.
- No edits to `app/globals.css`, `styles/*.css`, `lib/site.ts`, sitemap/robots, common components, common validation engine, or existing completed tools.

## Dependencies
- New npm packages: none.
- Server/API/account/key/external upload: none.

## Actual transplant files
- `app/[locale]/fraction-decimal-calculator/page.tsx`
- `components/tool-065-fraction-decimal-calculator.tsx`
- `components/tool-065-fraction-decimal-calculator.module.css`
- `components/tool-065-fraction-decimal-calculator-page.tsx`
- `lib/tool-065-fractions.ts`
- `tests/fixtures/tool-065/cases.json`
- `tests/tool-065-core.spec.ts`
- `tests/tool-065-conversion.spec.ts`
- `tests/tool-065-boundary.spec.ts`
- `scripts/tool-065/check-source.mjs`
- `scripts/tool-065/check-logic.mjs`
- `scripts/tool-065/check-harness.mjs`
- `scripts/tool-065/check-design.mjs`
- `scripts/tool-065/run-static-validation.mjs`

## Main-work integration required
1. Register TOOL065 card/slug/title/description in protected current `lib/site.ts` using the latest integrated 059-064 state.
2. Add TOOL065 KO/EN/JA URLs to protected sitemap and confirm robots.
3. Connect related tools 061/063/064 and next 066 using actual current live slugs.
4. Run actual browser/Playwright PC/mobile, KO/EN/JA, light/dark, Japanese wrapping/overflow.
5. Run TOOL065 preflight/core/feature/arithmetic/conversion/boundary/parser/regression/limit suites or merge these dedicated specs into the current checker convention.
6. Run production build, integrated 061-064/common regression, FINAL FAIL0/SKIP0.
7. Deploy, Search Console URL inspect/request indexing, record indexing state.

## Important integration note
The supplied auxiliary project ends at TOOL058, while TOOL065 must regress against 061-064 per the production brief. Therefore 061-064 integration/route references are deliberately not fabricated or added to protected files here; main-work must use the latest integrated project.

## Source basis
- Original TOOL065 production brief is included unchanged under `docs/tool-065/source/`.
