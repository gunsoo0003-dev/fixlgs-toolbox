# TOOL067 DESIGN CODE CHECK

- MAIN 기준: TOOL062 할인 가격 계산기
  - 가격 계산형 3모드 탭, 입력/결과 2열, 결과 강조, 공식, Copy/Reset, 모바일 1열 구조.
- SUB 기준: TOOL063 비율·비례 계산기
  - 비율/역산 계산 구조, HOW TO/REFERENCE/NOTES/FAQ 하단 공통 순서, 경계값 검수 패턴.
- 공식 common 재사용: ToolboxSubpageShell, toolbox-tool-detail-hero/body, toolbox-next-work, toolbox-tool-guide, toolbox-tool-format-guide, toolbox-tool-info-band, toolbox-tool-faq.
- 전용 CSS: `components/tool-067-selling-price-margin-calculator.module.css` 단 1개.
- 전역 CSS 수정: 없음.
- legacy sealed 직접 사용: 없음.
- !important: 없음.
- desktop: 3 tabs, 입력/결과 2열.
- mobile: 560px 이하 tabs/input/result 1열.
- 기능상 정상 차이: 062의 추가할인 박스 대신 Margin/Markup/Allowed Cost 결과 구조 사용.
- DESIGN-CODE 판정: PASS. 실제 viewport/폰트/overflow는 주작업장 통합검증.
