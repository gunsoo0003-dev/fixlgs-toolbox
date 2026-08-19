# TOOL052 DESIGN CODE CHECK

## 기준 도구
- MAIN: TOOL047 디데이·기념일 계산기
  - 기준 요소: DATE WORKSPACE shell, 상단 mode control, 입력 카드, 결과 카드, 모바일 1열 전환, LOCAL notice
- SUB: TOOL046 날짜 더하기·빼기 계산기
  - 기준 요소: 날짜/시간 입력 계층, 결과 정보 밀도
- SUB: TOOL045 날짜 차이 계산기
  - 기준 요소: 공통 hero / HOW TO / 전문가 영역 / 주의 / FAQ / 다음작업·관련도구

## 판정
- 기존 toolbox common hero/detail/how-to/expert/info/faq class 재사용: PASS
- 기능 고유 UI는 `tool-052-world-time-tool.module.css`에만 작성: PASS
- `app/globals.css` 신규 적재: 0건
- `styles/*` 공통 CSS 수정: 0건
- `legacy-site-sealed.css`, `legacy-tools-sealed.css` 신규 참조: 0건
- 모바일 `<=720px` 도시/업무시간 카드 1열: PASS
- 고정 900/1200px min-width 없음: PASS
- focus/hover 상태 코드 존재: PASS
- DST/날짜경계는 색상만이 아닌 텍스트 병행: PASS

정적 DESIGN-CODE 판정: PASS
실브라우저 디자인 판정: 주작업장 통합검증
