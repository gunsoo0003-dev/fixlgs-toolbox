# TOOL053 AUXILIARY CHECKLIST
| Item | Evidence | Status |
|---|---|---|
| 053-F01 Timestamp -> Date | component + lib + epoch/Y2K fixtures | PASS |
| 053-F02 Date -> Timestamp | localDateTimeToTimestamp + UI mode | PASS |
| 053-F03 seconds | result/input + fixture | PASS |
| 053-F04 milliseconds | result/input + fixture | PASS |
| 053-F05 UTC/local | same Date instant formatting paths | PASS |
| 053-C01 ISO 8601 | Date.toISOString + exact fixtures | PASS |
| 053-C02 mismatch warning | unitMismatchHint; no auto unit mutation | PASS |
| 053-C03 negative | -1 -> 1969-12-31T23:59:59.000Z | PASS |
| 053-C04 overflow | JS Date boundary constant + error path | PASS |
| 053-U01 two modes | two role=tab buttons | PASS |
| 053-U02 Now | 1s current display + Use current time | PASS |
| 053-U03 Copy | per-row Clipboard API buttons | PASS |
| 053-L01 KO/EN/JA | page + product locale maps | PASS |
| 053-L02 mobile long strings | overflow-wrap + mobile grid | PASS |
| 053-S01 canonical/hreflang | route metadata | PASS |
| Common CSS protection | no tool053 in global/sealed CSS | PASS |
| MAIN/SUB design basis | MAIN 047 / SUB 046 | PASS |
| Harness structure | selectors + 7 specs + fixture | PASS |
| Type/build/Playwright runtime | dependencies absent in supplied auxiliary ZIP | MAIN WORKSPACE INTEGRATION |
| site.ts/sitemap.ts registration | protected common integration files | MAIN WORKSPACE INTEGRATION |
| Search Console/indexing | deployment responsibility | MAIN WORKSPACE INTEGRATION |
