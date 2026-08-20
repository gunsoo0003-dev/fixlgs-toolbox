# TOOL059 DESIGN CODE CHECK

- MAIN 기준 도구: TOOL055 길이·면적·부피 변환기
- SUB 기준: 없음(필요 요소는 공식 common shell 재사용)
- 기준 요소: ToolboxSubpageShell, HOW TO, IMPORTANT NOTES, FAQ, 3-tab calculator shell, result card, black primary action, blue active state, 820/520 responsive breakpoints.
- TOOL059 기능상 정상 차이: 데스크톱 입력/결과 2-column, paper/photo presets, aspect-ratio switch, Effective PPI mode.
- 전용 CSS: `components/tool-059-pixel-print-converter.module.css`
- 공식 common class 재사용: `toolbox-tool-guide`, `toolbox-tool-info-band`, `toolbox-tool-faq`, `toolbox-tool-related`.
- app/globals.css 신규 selector: 없음.
- styles 전역 공통 CSS 변경: 없음.
- legacy sealed 직접 사용/복사/확장: 없음.
- Primary Action: TOOL055 계열과 동일한 black/white.
- active tab/preset: Santorini blue 의미 상태로만 사용.
- mobile: 820px에서 workspace 1열, 520px에서 inputs/results 1열 및 preset 2열.
- KO/EN/JA 실제 렌더링/overflow/light-dark/hover/touch: 주작업장 통합검증.

판정: DESIGN-CODE PASS.
