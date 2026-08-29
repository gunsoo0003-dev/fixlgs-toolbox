# TOOL075 DESIGN CODE CHECK
- MAIN 기준: TOOL066 부가세 계산기.
- 기준 요소: ToolboxSubpageShell, detail hero/body, LOCAL notice, 3-way tabs, input/result cards, black primary action, responsive one-column mobile, HOW TO / NEXT WORK / RELATED / CAUTION / FAQ common classes.
- 075 고유 구조: 상환방식 탭, 3열 입력, 비교 카드, amortization table only.
- 공식 common class 재사용: toolbox-tool-detail-*, toolbox-next-work-*, toolbox-tool-guide, toolbox-tool-format-guide, toolbox-tool-caution, toolbox-tool-faq.
- 전용 CSS: `components/tool-075-loan-calculator.module.css` only.
- 전역 CSS 변경: 없음.
- legacy sealed 직접 사용: 없음.
- 신규 global override: 없음.
- 실브라우저/Playwright/실 PC·모바일/KO·EN·JA/light·dark: 주작업장 통합검증.
