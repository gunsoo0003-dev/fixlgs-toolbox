# TOOL059 보조작업장 체크리스트

| 체크항목 | 확인방법 | 실제 증거 | 판정 |
|---|---|---|---|
| TOOL059 전용 구현 파일 존재 | 파일 목록 검사 | check-source 6 required | PASS |
| 공식 수식 | 독립 fixture 대조 | check-logic 13/13 | PASS |
| A4@300 | 210×297mm 역산 | 2480×3508 | PASS |
| 4×6@300 | inch 역산 | 1200×1800 | PASS |
| Effective PPI | 1200×1800 / 4×6 | 300 PPI | PASS |
| 서비스 상한 | 상수/fixture/spec 교차 | px100000, 10000in, PPI2400 | PASS |
| PPI/DPI 용어 분리 | KO/EN/JA source | UI+FAQ | PASS |
| excluded feature 없음 | source scan | no file/canvas/resize | PASS |
| DESIGN-CODE | MAIN TOOL055 비교 | check-design 14/14 | PASS |
| HARNESS STRUCTURE | fixture/spec/checker 연결 | check-harness 18/18 | PASS |
| 공통 CSS 보호 | baseline SHA256 비교 | 8 global/sealed files identical | PASS |
| 공통 TS/registry 보호 | baseline SHA256 비교 | shell/site/sitemap/package identical | PASS |
| 신규 OSS | package diff | 추가 없음 | N/A |
| 실제 브라우저/Playwright | 최신 최상위 이관 규칙 | HANDOFF 기록 | 주작업장 통합검증 전용 |
| production build/전체 regression | 최신 최상위 이관 규칙 | HANDOFF 기록 | 주작업장 통합검증 전용 |
