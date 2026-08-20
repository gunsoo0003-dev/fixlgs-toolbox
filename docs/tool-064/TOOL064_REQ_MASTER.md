# TOOL064 REQ 추적 마스터

| REQ | 요구사항 | 정적/fixture 근거 | 판정 |
|---|---|---|---|
| 064-F01 | 평균 | 10,20,30 → 20 | PASS |
| 064-F02 | 중앙값 | odd/even helper + median spec | PASS |
| 064-F03 | 최빈값 | none/single/multiple helper + mode spec | PASS |
| 064-F04 | 합계/개수 | helper + core spec | PASS |
| 064-F05 | 최소/최대/범위 | helper + core/boundary spec | PASS |
| 064-C01 | odd/even 중앙값 | 10,20,30 / 1,2,3,4 | PASS |
| 064-C02 | mode none/single/multiple | 1,2,3,4 / 1,2,2,3,4 / 1,1,2,2,3 | PASS |
| 064-C03 | invalid parser | 1,abc,3 오류 토큰 노출 | PASS |
| 064-C04 | negative/decimal | -5,0,5 및 소수 parser | PASS |
| 064-U01 | 숫자 목록 UX | textarea + comma/space/newline | PASS |
| 064-L01 | KO/EN/JA | page copy + metadata | PASS |
| 064-S01 | canonical/hreflang | route metadata | PASS |
| 064-Q01 | FINAL/FAIL0/SKIP0 | 정적 검수 결과 | PASS(보조 정적) |

주작업장 통합검증: 실제 브라우저/Playwright, PC·모바일 KO/EN/JA, production build, 061/062/063 포함 통합 regression, sitemap/robots/배포/Search Console/색인.
