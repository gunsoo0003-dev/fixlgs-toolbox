# TOOL069 DESIGN-CODE CHECK
- MAIN: TOOL066 부가세 계산기
- 비교 요소: `ToolboxSubpageShell`, hero, LOCAL badge, 3-mode tabs, 숫자 입력 card, black primary action, blue active tab, result cards, HOW TO, info band, FAQ, NEXT WORK.
- 정상 차이: 069는 BE units의 계산값/ceil 목표를 2행으로 분리하고 contribution/BE revenue를 결과 핵심으로 배치.
- 전용 UI는 `tool-069-break-even-calculator.module.css`에만 작성.
- app/globals.css 및 styles 전역 파일 변경 없음.
- legacy sealed 사용 없음.
- 모바일: 820px에서 input/result 1열, 560px에서 mode tab 1열 및 BE 계산값/실제 목표 1열.
- 실렌더링/폰트/overflow 체감은 주작업장 통합검증.
