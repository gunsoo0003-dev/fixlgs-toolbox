# TOOL076 DESIGN-CODE CHECK
- MAIN: TOOL066 부가세 계산기. 이유: 현재 제공 프로젝트에서 H 사업·금융 카테고리의 최신 실제 계산기 구현.
- SUB: 제작전달서 상 TOOL075 기능 경계. 제공 압축본에는 TOOL075 구현파일이 없어 실제 CSS/DOM 기준으로 사용할 수 없음.
- 재사용 common: ToolboxSubpageShell, toolbox-tool-detail-hero/body, toolbox-next-work, toolbox-tool-guide, toolbox-tool-format-guide/toolbox-tool-expert-post, toolbox-tool-info-band, ToolboxFaqList.
- 고유 UI: 입력/결과/scenario는 `tool-076-card-installment.module.css`에만 정의.
- app/globals.css/styles 전역 파일 수정 없음.
- legacy-site-sealed.css / legacy-tools-sealed.css 직접 참조 없음.
- mobile: 900px/560px에서 입력/결과/scenario 열 축소, 숫자 overflow-wrap 적용.
- 실브라우저 시각 판정은 최신 최상위 지시대로 주작업장 통합검증.
