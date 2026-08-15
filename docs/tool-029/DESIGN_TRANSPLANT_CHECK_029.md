# TOOL 029 DESIGN-CODE CHECK

- MAIN 기준: **025 증명사진·여권사진 제작기** — 제공된 기준 프로젝트에서 가장 최신 완료 구현이며, 공통 상세페이지 shell/hero/사용방법/전문가/주의/FAQ 구조를 실제 코드로 보유.
- SUB 기준: **024 앱스토어 스크린샷 제작기 계열 공통 구조** — 025가 이어받은 작업영역 카드 밀도/반응형 module 패턴의 상위 계보 확인용.
- PDF 제품군 026~028: 제공 기준 ZIP에 실제 source가 없으므로 디자인 코드 기준으로 추측 이식하지 않음. 029 제작전달서의 PDF UX 요구는 기능 구조에 반영.

## 대입 체크

| 항목 | 기준 | 029 구현 | 판정 |
|---|---|---|---|
| 상세 hero/한 줄 설명 | 025 common | common class 동일 사용 | PASS |
| LOCAL badge | 025 | 동일 common structure | PASS |
| 작업영역 | 025 전용 module 원칙 | 029 전용 module | PASS |
| 설정 카드 | latest tool card density | 18px panel / 18px radius | PASS |
| 핵심 모드 | 029 기능 차이 | 4개 mode card, 모바일 1열 | PASS(정상 특화) |
| 썸네일 | PDF 특화 | PC 4열 / tablet 3열 / mobile 2열 | PASS(정상 특화) |
| 결과/다운로드 | common action hierarchy | primary/secondary 명확화 | PASS |
| HOW TO | 025 common | `toolbox-tool-guide--five` | PASS |
| 전문가 포스팅 | 025 common | `toolbox-tool-expert-post` | PASS |
| 주의사항 | 025 common | `toolbox-tool-info-band` | PASS |
| FAQ | 025 common | `toolbox-tool-faq` | PASS |
| 전역 CSS | 보호 | 변경 없음 | PASS |
| legacy sealed | 보호 | 직접 사용 없음 | PASS |
| mobile/dark/locale global override | 금지 | 신규 전역 override 없음 | PASS |

실제 PC/모바일·KO/EN/JA·light/dark·overflow/폰트/hover/touch는 최신 2026-08-11 지시서에 따라 **주작업장 통합검증**이다.
