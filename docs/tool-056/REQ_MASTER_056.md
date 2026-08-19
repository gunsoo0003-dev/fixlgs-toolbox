# TOOL056 REQ MASTER

## Source basis
- Final production handoff: `FIXLGS_TOOLBOX_056_무게_온도_압력_변환기_제작전달서(1).pdf`
- Fixed scope: mass / temperature / pressure / decimal precision.
- Adjacent scope protection: 055 length-area-volume, 057 speed-fuel-energy, 058 data-cooking, 059 pixel-print are excluded.

## Requirements
| ID | Requirement | Implementation | Verification |
|---|---|---|---|
| 056-F01 | Mass conversion | kg canonical + factor registry | kg/lb/oz fixture + mass spec |
| 056-F02 | Temperature conversion | Celsius canonical affine engine | -40/0/100°C + 0K/-1K |
| 056-F03 | Pressure conversion | Pa canonical + factor registry | atm/bar/psi/kPa fixtures |
| 056-F04 | Precision 0..8 | display formatter + range control | feature/limit/logic |
| 056-F05 | From/To instant result | component state + conversion engine | core specs |
| 056-F06 | Swap/reset/copy/preset | dedicated controls | feature spec/source check |
| 056-C01 | Mass factor basis | `TOOL056_MASS_UNITS` | independent fixture/static logic |
| 056-C02 | Temperature affine basis | `toCelsius/fromCelsius` | exact formula logic |
| 056-C03 | Pressure factor basis | `TOOL056_PRESSURE_UNITS` | atm/bar/psi/mmHg logic |
| 056-C04 | Kelvin boundary | minimum 0 K | boundary/temperature spec |
| 056-C05 | Display-only rounding | `formatTool056` separated from `convertTool056` | logic/feature |
| 056-C06 | Service limits | abs input 1e15 / precision 8 | limit spec/static checker |
| 056-U01 | Three category tabs | mass/temperature/pressure segmented tabs | preflight/design |
| 056-U02 | Mobile-safe unit labels | dedicated CSS module | DESIGN CODE CHECK |
| 056-L01 | KO/EN/JA | page/component copy | source/preflight |
| 056-S01 | SEO metadata | localized title/description/canonical/hreflang | route source check |
| 056-S02 | Structured data | WebApplication/BreadcrumbList/FAQPage | page source check |
| 056-S03 | sitemap/robots/category LIVE | protected common integration | main-work integration |
| 056-Q01 | auxiliary READY | static/design/harness/package/common protection | checklist + evidence |

## Independent omission search additions
- 056-A01: zero mass and pressure are accepted; negatives are rejected.
- 056-A02: negative Celsius/Fahrenheit are allowed only while physical result remains at or above 0 K.
- 056-A03: comma-separated numeric input is normalized locally.
- 056-A04: category switching resets From/To to valid units and prevents cross-category combinations.
- 056-A05: user numeric input/result is not transmitted by TOOL056 code.
- 056-A06: pressure conversion explicitly does not distinguish gauge vs absolute pressure.
