# TOOL049 CHECKLIST

| Check | Evidence | Status |
|---|---|---|
| Required base functions | start/end, Y/M/D, multi-career | PASS |
| Current employment | explicit toggle + as-of date | PASS |
| Today shortcut | local calendar ISO date setter | PASS |
| Total elapsed days | integer Gregorian serial delta | PASS |
| Multiple career warning | overlap is not automatically removed | PASS |
| 30-period service limit | main period + maximum 29 added rows | PASS |
| Reverse-date error | calculation stopped with localized alert | PASS |
| Incomplete added row | localized error before calculation | PASS |
| Leap year / month end | fixture logic PASS | PASS |
| Copy result | Clipboard API, localized units | PASS |
| Reset | all dedicated state cleared | PASS |
| KO/EN/JA source | page and workspace copy maps | PASS |
| Mobile code | one-column dates/actions at <=720px | PASS |
| Accessibility source | labels, native date, alert/live/status | PASS |
| Local privacy | no network/storage code | PASS |
| MAIN design | TOOL045 actual source/module compared | PASS |
| SUB design | TOOL046 action/date-control conventions compared | PASS |
| Global CSS protection | protected styles scanned; TOOL049 selector 0 | PASS |
| legacy sealed protection | no direct import/reference/selector | PASS |
| Static source/logic/design validation | `node --experimental-strip-types scripts/tool-049/run-static-validation.mjs` | PASS |
| Type/build runtime | dependencies absent in supplied ZIP | MAIN-WORKSPACE INTEGRATION |
| Browser/Playwright | main-workspace integrated validation | MAIN-WORKSPACE INTEGRATION |
| sitemap/robots/category registration | protected common files not changed here | MAIN-WORKSPACE INTEGRATION |
