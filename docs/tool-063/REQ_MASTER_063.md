# TOOL063 REQ MASTER

| REQ-ID | Requirement | Evidence |
|---|---|---|
| 063-F01 | Ratio simplification | `simplifyRatio`, fixture 12:18→2:3 |
| 063-F02 | Solve missing proportion value | `solveProportion`, all A/B/C/D unknown fixtures |
| 063-F03 | Equivalent ratio check | `equivalentRatio`, 3:5 vs 12:20/12:19 |
| 063-F04 | Scale ratio | `scaleRatio`, 4:7×2→8:14 |
| 063-C01 | GCD/common-divisor simplification | engine + logic checker |
| 063-C02 | Cross multiplication | equivalent/proportion engine + formula UI |
| 063-C03 | 1:n / n:1 | `normalizeRatio`, 30:8 fixtures |
| 063-C04 | Three-part ratio | 2:6:4→1:3:2 |
| 063-C05 | zero/invalid handling | 0:0, zero denominator, negative, limit checks |
| 063-C06 | decimal/fraction input | decimal normalization + `1/2` parser |
| 063-U01 | question-mode UX | five modes, responsive module CSS |
| 063-L01 | KO/EN/JA | product/page locale copy + locale route |
| 063-S01 | canonical/hreflang | locale route metadata |
| 063-S02 | WebApplication/Breadcrumb/FAQ | page JSON-LD + actual FAQ |
| 063-P01 | browser-local only | no fetch/API/server calls in product |
| 063-Q01 | auxiliary READY | static/design/harness/package/common-protection evidence |
