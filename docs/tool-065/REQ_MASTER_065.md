# TOOL065 REQ MASTER

| REQ | Requirement | Static evidence | Status |
|---|---|---|---|
| 065-F01 | Fraction + − × ÷ | BigInt rational `operate065`; fixture 5 cases | PASS |
| 065-F02 | Simplify | `normalize065` + GCD; 12/18→2/3 | PASS |
| 065-F03 | Fraction→decimal | `decimalString065`; 3/4→0.75, 1/3 precision policy | PASS |
| 065-F04 | Decimal→fraction | string-based `parseDecimal065`; 0.625→5/8 | PASS |
| 065-C01 | Lowest terms | denominator normalization + GCD | PASS |
| 065-C02 | Mixed number | `1 1/2→3/2`, mixed output | PASS |
| 065-C03 | Negative fraction | `-1/2+1/4→-1/4` | PASS |
| 065-C04 | denominator zero | `DENOMINATOR_ZERO` | PASS |
| 065-C05 | division by zero | `DIVISION_ZERO` | PASS |
| 065-U01 | 4-mode responsive UX | dedicated component/module.css | PASS (code) |
| 065-L01 | KO/EN/JA | page/client copy + locale route | PASS (code) |
| 065-S01 | canonical/hreflang | route metadata | PASS |
| 065-Q01 | auxiliary static FAIL0 | `STATIC_FINAL_065.txt` | PASS |
| 065-LIM01 | service limits | 100 digits / 120 chars / precision 12 | PASS |
| 065-PRIV01 | local only | no fetch/API/socket dependency | PASS |
