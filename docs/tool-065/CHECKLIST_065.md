# TOOL065 AUXILIARY CHECKLIST

| Check | Evidence | Verdict |
|---|---|---|
| 4 confirmed functions implemented | helper/component/fixtures | PASS |
| BigInt rational arithmetic | `lib/tool-065-fractions.ts` | PASS |
| GCD reduction / positive denominator | helper + logic checker | PASS |
| mixed / negative | fixture + logic checker | PASS |
| denominator 0 / div0 | helper + logic checker | PASS |
| decimal string exact conversion | `parseDecimal065` + 0.625 fixture | PASS |
| repeating display policy | `decimalString065` | PASS |
| KO/EN/JA | component/page copy | PASS |
| canonical/hreflang | route metadata | PASS |
| FAQ/WebApplication/Breadcrumb JSON-LD | page component | PASS |
| external network/server/API | source checker | PASS (none) |
| new dependency | none | PASS |
| global CSS contamination | source/hash evidence | PASS |
| legacy sealed use | no import/copy | PASS |
| HARNESS STRUCTURE | fixture/selectors/spec structure | PASS |
| static final | SOURCE 20/20, LOGIC 11/11, HARNESS 5/5, DESIGN 9/9 | PASS |
| actual Playwright/browser/build/integrated regression | latest main project required | MAIN-WORK INTEGRATION |
