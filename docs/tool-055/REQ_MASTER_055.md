# TOOL055 REQ MASTER

## Source basis
- Final production handoff: `FIXLGS_TOOLBOX_055_길이_면적_부피_변환기_제작전달서(1).pdf`
- Dojangkkaegi fixed scope: length / area / pyeong↔m² / volume / common-unit simultaneous display.

## Requirements
| ID | Requirement | Implementation | Verification |
|---|---|---|---|
| 055-F01 | Length conversion | `lib/tool-055-units.ts`, converter component | 1m→100cm, 1in→2.54cm |
| 055-F02 | Area conversion | area registry | 1m²→10000cm², 1ft²→0.09290304m² |
| 055-F03 | Volume conversion | volume registry | 1L→1000mL/cm³, 1m³→1000L |
| 055-F04 | Pyeong↔m² | `pyeong factor=400/121` | 1평→3.3057851239669422m² |
| 055-F05 | Common units simultaneously | summary registry, max 6 | summary count 6 |
| 055-C01 | Explicit dimension separation | `Tool055Dimension`, independent registries | dimension spec |
| 055-C02 | Exact conversion factors | canonical factors | independent fixture/static check |
| 055-C03 | Display-only rounding | `formatTool055` separated from `convertTool055` | precision spec |
| 055-C04 | Service limits | 1e15 / precision 8 / summary 6 | limit spec/static checker |
| 055-U01 | Category/From/To flow | tabs + value + From + Swap + To | preflight/core specs |
| 055-U02 | Swap/copy/reset | component controls | feature spec/source check |
| 055-L01 | KO/EN/JA | page/component copy | preflight spec/source structure |
| 055-L02 | JA mobile-safe strings | module responsive wrapping | DESIGN CODE CHECK |
| 055-S01 | canonical/hreflang | route metadata | source inspection |
| 055-S02 | sitemap/robots | common protected; integration item | main-work integration verification |
| 055-Q01 | auxiliary READY | static/code/design/harness/package/common protection | checklist + package verification |

## Independent omission search additions
- 055-A01: locale comma normalization is explicit and tested.
- 055-A02: same-unit conversion preserves numeric value.
- 055-A03: input/result values are not sent to analytics/server by TOOL055 code.
- 055-A04: no cross-dimension unit appears in From/To after category switch.
