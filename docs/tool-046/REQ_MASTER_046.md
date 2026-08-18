# TOOL046 REQ MASTER

| REQ | Source requirement | Implementation / evidence | Status |
|---|---|---|---|
| 046-001 | 기준 날짜 선택 | native date input `tool046-start-date` | PASS |
| 046-002 | 더하기·빼기 | direction select | PASS |
| 046-003 | 일/주/개월/년 | unit select | PASS |
| 046-004 | 결과 날짜 | result date card | PASS |
| 046-005 | 결과 요일 | UTC calendar weekday from date-only structure | PASS |
| 046-006 | 월말 clamp | `addMonthsClamped` | PASS |
| 046-007 | 윤년 year clamp | `addYearsClamped` | PASS |
| 046-008 | week = 7 days | helper `signed * 7` | PASS |
| 046-009 | 0 = same date | fixture | PASS |
| 046-010 | negative quantity blocked | validation | PASS |
| 046-011 | no 30 days = 1 month conversion | separate month path | PASS |
| 046-012 | quick +7/+30/+90/+6mo/+1yr | preset buttons | PASS |
| 046-013 | result copy | Clipboard API | PASS |
| 046-014 | KO/EN/JA | dedicated copy maps | PASS |
| 046-015 | mobile one-column | module CSS media query | PASS |
| 046-016 | server transmission/storage prohibited | no network/storage code | PASS |
| 046-017 | input dates not logged | no console logging | PASS |
| 046-018 | accessibility labels/keyboard/live result | native controls + labels + aria-live | PASS |
| 046-019 | exclude business day/D-day/time/timezone | no excluded-domain calculation implemented | PASS |
| 046-020 | related tools 045/047/050/051 | related section links prepared | PASS |
| 046-021 | metadata/canonical/hreflang | dedicated route metadata | PASS |
| 046-022 | WebApplication schema | dedicated page JSON-LD | PASS |
| 046-023 | sitemap/robots integration | protected common files intentionally untouched | MAIN-WORKSPACE INTEGRATION |
| 046-024 | actual TOOL045 design as MAIN | source ZIP lacks TOOL045 actual code | MAIN-WORKSPACE INTEGRATION |
| 046-025 | browser/runtime/Playwright/build/final | transferred by current top-level auxiliary instructions | MAIN-WORKSPACE INTEGRATION |
| 046-026 | file/pixel checks | calculator has no file/pixel output | N/A |
