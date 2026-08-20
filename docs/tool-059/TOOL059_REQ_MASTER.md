# TOOL059 REQ MASTER

기준: FIXLGS_TOOLBOX_059 픽셀·인쇄 크기 변환기 최종 제작전달서 (2026-08-19)

| REQ | 요구사항 | 구현/검증 근거 | 판정 |
|---|---|---|---|
| 059-F01 | Pixels → Print Size | `pixelsToPrint`, 3000×2000@300 fixture | PASS |
| 059-F02 | Print Size → Required Pixels | `printToPixels`, A4@300 fixture | PASS |
| 059-F03 | Effective PPI | `effectivePpi`, 1200×1800 over 4×6 | PASS |
| 059-F04 | inch/cm/mm | `toInches/fromInches`, unit spec | PASS |
| 059-C01 | aspect ratio | `aspectRatio`, lock switch, ratio spec | PASS |
| 059-C02 | megapixels | `megapixels` + result card | PASS |
| 059-C03 | PPI/DPI 구분 | KO/EN/JA UI notes + FAQ | PASS |
| 059-U01 | A4/A5/A6/Letter/photo/card presets | `TOOL059_PRESETS` | PASS |
| 059-U02 | 72/96/150/200/240/300/600 PPI | `TOOL059_PPI_PRESETS` | PASS |
| 059-L01 | KO/EN/JA | route/page/component localized copy | PASS (CODE) |
| 059-S01 | canonical/hreflang | route metadata | PASS (CODE) |
| 059-S02 | FAQ visible content | page component | PASS (CODE) |
| 059-B01 | 1..100000px | shared constant + boundary fixture | PASS |
| 059-B02 | physical <=10000in | shared constant + limit spec | PASS |
| 059-B03 | PPI <=2400 | shared constant + boundary fixture | PASS |
| 059-X01 | no resize/upscale/upload/metadata write | source checker | PASS |
| 059-X02 | browser local / no API | source structure | PASS |
| 059-Q01 | FINAL FAIL0/SKIP0 | static final evidence | PASS (STATIC); runtime FINAL = 주작업장 통합검증 |

## 2차 독립 누락 탐색 추가 REQ
- 059-C04: aspect ratio lock은 가로 변경뿐 아니라 세로 변경 시에도 반대 축 자동 재계산. PASS.
- 059-U03: 픽셀 비율과 실물 비율이 0.5% 초과 차이일 때 mismatch 경고. PASS.
- 059-Q02: 전용 checker가 동적 selector를 정적 문자열로 오판하지 않도록 harness 자체 오류 분리. PASS.
