# TOOL068 DESIGN CODE CHECK

- MAIN 기준 도구: **TOOL066 부가세 계산기**
- 선정 이유: 동일 H. 사업·금융 계산기 카테고리이며 숫자 입력 → 즉시 결과 → 공식/주의/FAQ 흐름이 가장 유사함.
- SUB 기준: 없음.

## 확인 항목

| 항목 | 기준 | TOOL068 확인 | 판정 |
|---|---|---|---|
| Hero / breadcrumb / eyebrow | TOOL066 | 공통 class 재사용 | PASS |
| 작업영역 shell | TOOL066 | blue-outline workspace + panel card | PASS |
| 모드 탭 | TOOL066 | 3열, active blue | PASS |
| 주요 버튼 | TOOL066 | black primary + neutral reset | PASS |
| 결과 카드 | TOOL066 | responsive grid + large numeric output | PASS |
| 모바일 | TOOL066 | 820/560 breakpoint, single column | PASS |
| HOW TO | TOOL066 | 공통 guide class | PASS |
| 공식/가치 텍스트 | TOOL066 | common format guide class | PASS |
| 주의사항 | TOOL066 | info-band 재사용 | PASS |
| FAQ | TOOL066 | ToolboxFaqList 재사용 | PASS |
| 전용 CSS 위치 | 최신 지시서 | module.css only | PASS |
| globals/styles 오염 | 최신 지시서 | TOOL068 selector 0건 | PASS |
| legacy sealed 사용 | 최신 지시서 | 0건 | PASS |

실제 PC/모바일/KO/EN/JA/light/dark 렌더링, hover/touch/scroll 및 브라우저 overflow 체감은 최신 2026-08-11 상위 규칙에 따라 주작업장 통합검증으로 이관.
