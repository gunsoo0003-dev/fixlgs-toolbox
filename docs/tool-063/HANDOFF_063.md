# HANDOFF — TOOL063 비율·비례 계산기

- Category: G. Unit & Calculator
- Slug: `ratio-proportion-calculator`
- Expected URLs: `/ko|en|ja/ratio-proportion-calculator`
- Auxiliary status: CODE PASS / FUNCTION-STATIC PASS / DESIGN-CODE PASS / HARNESS-STRUCTURE PASS / PACKAGE PASS / COMMON FILE PROTECTION PASS

## Implemented
- 2-term ratio simplification
- missing proportion value for A/B/C/D positions
- equivalent-ratio cross-product check
- ratio scaling
- 1:n and n:1 normalization
- 3-part ratio simplification
- decimal and simple fraction input
- copy/reset, display precision, KO/EN/JA copy
- WebApplication + BreadcrumbList + visible FAQ/FAQPage data

## Integration files
- `lib/tool-063-ratio-proportion.ts`
- `components/tool-063-ratio-proportion-calculator.tsx`
- `components/tool-063-ratio-proportion-calculator.module.css`
- `components/tool-063-ratio-proportion-calculator-page.tsx`
- `app/[locale]/ratio-proportion-calculator/page.tsx`

## Validation files
- `tests/fixtures/tool-063/cases.json`
- `tests/tool-063-*.spec.ts`
- `scripts/tool-063/*.mjs`
- `docs/tool-063/*`

## Common-file protection
No existing global CSS/common component/common engine/existing completed tool was edited for TOOL063. No package dependency was added.

## Main-workspace integration required
- register TOOL063 in the current category/registry/site map using the main workspace's latest structure
- connect related TOOL061/062 and next TOOL064 routes if present in the latest main copy
- actual browser + Playwright PC/mobile KO/EN/JA light/dark
- production build, integrated regression, common CSS/layout impact
- sitemap/robots/deploy/Search Console/indexing
- final service-limit decision

## Environment note
Full `tsc --noEmit` was attempted on the supplied ZIP. The ZIP has no installed dependency tree, so Next/React/Playwright modules were unresolved across existing TOOL055-058 and TOOL063 alike. See `docs/tool-063/evidence/TSC_FULL_063.txt`. Static TOOL063 source/design/harness/logic checks pass independently.
