# TOOL066 DESIGN-CODE CHECK 1·2

- MAIN 기준: TOOL055 길이·면적·부피 변환기
  - 공통 shell, 작업영역 카드, 입력→결과 구조, secondary/primary action 계층, 안내 섹션 순서
- SUB 기준: TOOL058 데이터·요리 단위 변환기
  - 3-mode tab 구조, 결과 요약 grid, 모바일 단일열, 긴 숫자 overflow 대응

## CHECK 1
- 공통 `ToolboxSubpageShell` 사용: PASS
- hero/body/next-work/how-to/reference/notes/FAQ common class 재사용: PASS
- 기능 고유 CSS는 `tool-066-vat-calculator.module.css`에 한정: PASS
- app/globals.css/styles 전역 신규 selector: 0건
- legacy sealed 직접 import/복사/확장: 0건
- Primary Action: 검정 배경/흰 글씨 계열 유지: PASS
- 3모드 및 결과 3카드 responsive 구조: PASS (CODE)

## CHECK 2
- CHECK 1 이후 제품 DOM/selector 변경 없음.
- 전용 CSS scope 재확인: PASS
- 820px/560px breakpoint 코드 확인: PASS
- KO/EN/JA 긴 문자열은 tab을 560px 이하 단일열 처리, 결과 숫자는 overflow-wrap 처리: PASS (CODE)
- 실제 브라우저/viewport/폰트/라이트·다크 체감: 주작업장 통합검증

최종 DESIGN-CODE PASS: PASS
