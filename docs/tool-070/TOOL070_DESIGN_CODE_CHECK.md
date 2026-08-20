# TOOL070 DESIGN CODE CHECK
- MAIN: TOOL066 부가세 계산기 — 사업·금융 계산기 작업영역, 검정 Primary Action, common page shell/하단 섹션 구조
- SUB: TOOL056 — g/kg 단위 변환 패턴
- SUB: TOOL058 — mL/L 단위 변환 패턴
- 신규 기능 CSS는 `components/tool-070-unit-price-comparison.module.css`에만 작성
- app/globals.css 및 styles 전역 파일 변경 없음
- legacy sealed 직접 사용 없음
- PC A/B 2열, <=900px A/B 1열, <=560px 제어부 재배치
- 긴 일본어/100mL/1L 결과 문자열은 min-width:0 + overflow-wrap으로 코드상 보호
- 실제 viewport/폰트/hover/touch/light/dark는 주작업장 통합검증
