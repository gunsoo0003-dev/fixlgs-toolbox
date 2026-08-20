# TOOL071 CHECKLIST

| 체크항목 | 확인방법 | 판정 |
|---|---|---|
| 8 KPI schema | engine + fixture | PASS |
| 공식/분모 표시 | UI selector + schema | PASS |
| zero denominator | engine throw + boundary spec | PASS |
| raw-vs-rounded | logic check | PASS |
| KO/EN/JA | page/client copy + route spec | PASS |
| A/B 2세트 | UI + feature spec | PASS |
| max amount/count/input/precision | engine/UI/fixture | PASS |
| 외부 API 없음 | static scan | PASS |
| 공통 CSS 오염 없음 | global styles TOOL071 scan | PASS |
| legacy sealed 미사용 | design scan | PASS |
| MAIN 066 common DOM 구조 | page static comparison | PASS |
| 실제 브라우저/Playwright | 최신 상위 지시 | 주작업장 통합검증 |
| production build | 최신 상위 지시 | 주작업장 통합검증 |
| sitemap/category card/site.ts | 공통파일 보호 | 주작업장 통합 이식 |
