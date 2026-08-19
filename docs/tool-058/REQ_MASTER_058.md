# TOOL058 REQ MASTER

## Source basis
- Final production handoff: `FIXLGS_TOOLBOX_058_데이터_요리_단위_변환기_제작전달서(1).pdf`
- Dojangkkaegi fixed scope: bit/byte/KB/MB/GB/TB, 1000/1024 basis, cup/tbsp/tsp/mL.

## Requirements
| ID | Requirement | Implementation | Verification |
|---|---|---|---|
| 058-F01 | bit/byte/KB/MB/GB/TB | `lib/tool-058-units.ts` data registry | logic + data fixture/spec |
| 058-F02 | Decimal 1000 | notation-specific factor engine | 1KB=1000B, 1GB=1000MB |
| 058-F03 | Binary 1024 | notation-specific factor engine | 1KiB=1024B, 1GiB=1024MiB |
| 058-F04 | cup/tbsp/tsp/mL | separate cooking registry | 240/15/5mL fixtures |
| 058-F05 | representative simultaneous results | data 6 / cooking 4 | logic + limit specs |
| 058-C01 | IEC labels | KiB/MiB/GiB/TiB in binary UI | source/design/binary spec |
| 058-C02 | bit-byte separation | 1 byte=8 bit | logic/data spec |
| 058-C03 | cooking reference visible | FDA nutrition-labeling reference label | page/product source |
| 058-C04 | data/cooking registry isolation | independent constants/types | dimension spec |
| 058-U01 | category / From / To / immediate result | two category tabs + fields | preflight/core |
| 058-U02 | notation toggle | decimal/binary buttons | core/binary |
| 058-U03 | swap/reset/precision/copy | product controls | feature spec |
| 058-L01 | KO/EN/JA | page/product/unit registry | source/design |
| 058-L02 | Japanese mobile overflow preparation | dedicated module breakpoints | design check |
| 058-S01 | canonical/hreflang | route metadata | source check |
| 058-S02 | FAQPage only with visible FAQ | page JSON-LD + actual FAQ section | source check |
| 058-P01 | local-only processing | no fetch/API/upload in product | source check |
| 058-Q01 | auxiliary READY | static/design/harness/package/common protection | checklist/evidence |

## Explicit exclusions preserved
- ZIP/7z compression and transfer-time/storage analysis.
- Ingredient-density cup↔g conversion.
- Nutrition analysis and recipe generation.
- Server, account, API, or external upload.
