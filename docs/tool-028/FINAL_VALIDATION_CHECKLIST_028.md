# TOOL 028 FINAL VALIDATION CHECKLIST

## Product
- [x] Multiple PDF merge without page rasterization (`pdf-lib copyPages`).
- [x] File reorder, delete, reset, filename normalization.
- [x] Page preview using protected `pdfjs-dist@5.4.54` local loader.
- [x] External PDF add drag uses one shared `dragActive` across dropzone/workspace.
- [x] Internal reorder drag uses a separate MIME contract.
- [x] KO/EN/JA, HOW TO, workflow guide, notes, FAQ, SEO/hreflang/structured data.

## Approved service limits — 2026-08-15
- [x] Max files: 20.
- [x] Per-file: 30 MiB.
- [x] Total input: 100 MiB.
- [x] Total pages: 300.
- [x] Preview concurrency: 1.
- [x] Product constant/copy/live DOM/limit spec/checker use the same values.

## Validator self-check
- [x] Source/route/catalog/sitemap contract.
- [x] Exact 028 runner/spec/config link; previous TOOL spec link prohibited.
- [x] package/lock: `pdf-lib@1.17.1`; protected `pdfjs-dist@5.4.54`.
- [x] Runtime copy includes `types/`.
- [x] Common CSS/sealed CSS not polluted by 028.
- [x] Mobile real-device runner 028 registration self-check PASS.
- [x] Failed/missing dependency environment still writes a result ZIP.

## User Windows FINAL gate
- [ ] Installed `pdf-lib` = 1.17.1 and `pdfjs-dist` = 5.4.54.
- [ ] Local TypeScript syntax PASS.
- [ ] `tsc --noEmit` PASS.
- [ ] Isolated production build PASS.
- [ ] Core PASS.
- [ ] Boundary PASS.
- [ ] Feature PASS.
- [ ] Design-state PASS.
- [ ] Regression PASS.
- [ ] Limit PASS.
- [ ] FINAL summary FAIL=0 / SKIP=0.
- [ ] Desktop `028_final_검수결과.zip` generated.

Actual Galaxy execution is not repeated per TOOL. TOOL028 is registered now; PDF category real-device execution is deferred to the category-end batch per control policy.
