# TOOL052 EVIDENCE CHECKLIST

| 체크항목 | 확인방법 | 실제 증거 | 판정 |
|---|---|---|---|
| 도구번호/slug | source grep | 052 / world-time-timezone-converter | PASS |
| 도시검색 | component | query + `searchCities` | PASS |
| UTC 변환 | helper/component | UTC reference branch | PASS |
| 동일 instant 다중도시 | component/helper | `formatLocal(instant, zone)` | PASS |
| 현재시간 | component | `nowMs` + 60s refresh | PASS |
| 지정시간 | component | date/time + source zone | PASS |
| DST | logic static execution | NY 2026 spring/fall fixtures | PASS |
| 30분 offset | logic static execution | Kolkata +330 | PASS |
| 45분 offset | logic static execution | Eucla +525 | PASS |
| 날짜 경계 | component | prev/same/next labels | PASS |
| 12/24 | component | hourCycle controls | PASS |
| 회의시간 | helper/component | 30m intersection | PASS |
| 최대 12도시 | helper/UI/limit spec | single constant=12 | PASS |
| 도시 순서 변경 | component | moveCity ±1 | PASS |
| 도시 삭제 | component | minimum 2 protection | PASS |
| KO/EN/JA | page/component | 3 locale dictionaries | PASS |
| SEO/canonical/hreflang | page | metadata + alternates | PASS |
| structured data | page | WebApplication/Breadcrumb/FAQ | PASS |
| CSS 전역 오염 | original ZIP diff | 기존파일 변경 0건 | PASS |
| legacy sealed 사용 | source scan | 0건 | PASS |
| HARNESS STRUCTURE | `check-harness.mjs` | FAIL=0 | PASS |
| STATIC validation | `run-static-validation.mjs` | fail=0 | PASS |
| 실제 브라우저 | 최신 지시서 이관 | 주작업장 통합검증 | 주작업장 통합검증 |
| production build | 최신 지시서 이관 | 주작업장 통합검증 | 주작업장 통합검증 |
| 배포/색인 | 제작범위 이관 | 주작업장 | 주작업장 통합검증 |
