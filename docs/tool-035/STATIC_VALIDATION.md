# TOOL 035 Static Validation Evidence

Final auxiliary static run:

`node scripts/tool-035/run-static-validation.mjs`

Result: `TOOL035 STATIC VALIDATION: PASS | groups=7 | fail=0`

Groups:
1. check-source.mjs
2. check-content.mjs
3. check-logic.mjs
4. check-harness.mjs
5. check-design.mjs
6. check-package.mjs
7. check-common-protection.mjs

Additional TypeScript transpile syntax self-check: PASS, 10 TS/TSX/spec files, fail 0.
Special fixture parse/render sanity check with local PDF parser: repeated-xobject, soft-mask, inline-image, image-mask, exact-200-pages and over-200-pages all opened/rendered; page counts 200/201 verified.

No claim is made here that Playwright or production build passed. Those need the main-workshop installed runtime.
