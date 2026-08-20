# TOOL063 Failure Map

- wrong simplification → `lib/tool-063-ratio-proportion.ts` → `simplifyRatio`, decimal normalization/GCD
- wrong missing value → `solveProportion`, inspect selected unknown branch and zero denominator guard
- wrong equivalence → `equivalentRatio`, cross-product tolerance
- wrong scale → `scaleRatio`
- wrong 1:n/n:1 → `normalizeRatio`
- invalid/zero/negative/limit UI mismatch → product `msg()` + `TOOL063_LIMITS`
- selector mismatch → `components/tool-063-ratio-proportion-calculator.tsx` data-testid + `tests/tool-063-*`
- locale/SEO mismatch → page component + locale route metadata
- global style regression → main integration only; this package does not modify global CSS
