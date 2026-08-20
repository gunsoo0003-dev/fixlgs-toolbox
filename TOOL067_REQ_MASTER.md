# TOOL067 REQ MASTER — 판매가격·마진 계산기

기준: 2026-08-19 최종 제작전달서. 보조작업장 범위는 신규 도구 전용 구현/정적 검수/검수기 구조/패키지이며 실제 브라우저·Playwright·production build·통합 regression·배포·색인은 주작업장 통합검증으로 이관한다.

| REQ | 요구사항 | 구현/증거 |
|---|---|---|
| 067-F01 | 원가 | `tool-067-cost`, helper validation |
| 067-F02 | 판매가 | `tool-067-selling` |
| 067-F03 | 마진액 | `profit=selling-cost`, `tool-067-profit` |
| 067-F04 | 마진율 | `profit/selling*100`, `tool-067-margin` |
| 067-F05 | 목표 마진 판매가 | `cost/(1-target)`, `tool-067-target-price` |
| 067-C01 | margin vs markup | markup은 원가 분모, 별도 결과 카드 |
| 067-C02 | allowed cost | `selling*(1-target)`, `tool-067-allowed-cost` |
| 067-C03 | negative margin | 10000/8000 -> -2000/-25% |
| 067-C04 | 100% target error | `TARGET_MARGIN_RANGE` |
| 067-U01 | mode UX PC/mobile | 3 tabs + desktop 2열/mobile 1열 CSS |
| 067-L01 | KO/EN/JA | page/component 3언어 copy |
| 067-S01 | canonical/hreflang | route metadata self + ko/en/ja/x-default |
| 067-Q01 | 전용 검수 구조 | fixture + 11 specs + static check scripts |
| 067-P01 | 개인정보 | fetch/API 없음, 브라우저 로컬 계산 문구 |
| 067-B01 | 서비스 상한 | amount <=1e15, target <100, input <=30 chars, precision <=8 |
