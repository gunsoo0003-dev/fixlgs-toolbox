# TOOL062 DESIGN-CODE CHECK 1/2

- MAIN 기준: TOOL058 데이터·요리 단위 변환기
  - ToolboxSubpageShell, detail hero/body, NEXT WORK, HOW TO, guide, notes, FAQ 순서
  - 작업영역의 panel/card, 2열→모바일 1열 전환, 전용 module.css 범위
- SUB 기준: TOOL051 시간 계산기
  - 계산기형 mode tab, 즉시 결과, 복사/초기화 흐름
- Primary Action: 검정 배경 + 흰색 글씨 유지
- Final Price: 결과 중 가장 큰 타이포
- Additional Discount: 기본 접힘, 필요 시 2차/3차 노출
- KO/EN/JA 문자열 구조 포함, 일본어 `元の価格 / 最終価格 / 実質割引率 / 追加割引` 구분
- app/globals.css 신규 selector: 0
- styles 전역파일 TOOL062 selector: 0
- legacy sealed 참조/복사: 0
- `!important`: 0
- 모바일 breakpoint: 전용 module.css 820px/560px
- 디자인 수정 후 검수기 영향: formatter 표시 규칙 보완은 DOM/selector/testid 영향 없음

최종 판정: DESIGN-CODE PASS
실제 PC/모바일 브라우저, light/dark, 실제 overflow/줄바꿈은 주작업장 통합검증.
