# TOOL060 REQ MASTER

| REQ | Requirement | Evidence | Status |
|---|---|---|---|
| 060-F01 | KR/US/UK/EU/JP all-country result | `TOOL060_SYSTEMS`, result cards | PASS |
| 060-F02 | men/women/kids | separate registries and UI tabs | PASS |
| 060-F03 | shoes/tops/bottoms | separate mode/item registries | PASS |
| 060-C01 | shoe foot-length reference | `footLengthMm`, foot lookup | PASS |
| 060-C02 | clothing measurement reference | chest/bust/waist/hip ranges | PASS |
| 060-C03 | adult/child isolation | separate `kids` registries | PASS |
| 060-C04 | brand-chart warning | persistent result warning | PASS |
| 060-U01 | 5-country comparison / mobile card structure | module CSS country cards | PASS (code) |
| 060-L01 | KO/EN/JA | page + converter copy | PASS (code) |
| 060-S01 | canonical/hreflang | route metadata | PASS (code) |
| 060-Q01 | FINAL/FAIL0/SKIP0 | actual Playwright/build in integrated project | MAIN WORKSPACE INTEGRATION |
| 060-D01 | exact production reference dataset provenance | source PDF defines methodology but does not reproduce full ISO/general conversion tables | DATA VERIFY REQUIRED |

## Source boundary
The supplied production brief defines the required systems, category separation, foot/body measurement strategy, warnings and official-reference direction. It does **not** contain a complete numeric ISO 19407 conversion table or a universal clothing conversion table. Current static crosswalk rows are an implementation reference dataset and must not be represented as ISO-certified or brand-guaranteed values. Official brand charts also vary, which reinforces the mandatory reference-only warning.
