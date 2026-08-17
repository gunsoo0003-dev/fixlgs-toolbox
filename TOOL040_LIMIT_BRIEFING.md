# TOOL 040 SERVICE LIMIT BRIEFING

원본 제작전달서 21절의 강제 승인 게이트에 따라 아래 값은 **최종값이 아니라 현재 코드 후보값**이다.

- 입력 길이 후보: 300,000 chars
- 사용자 구분자 길이 후보: 50 chars
- 최종 item 수 후보: 50,000 items
- trim 기본 후보: ON
- empty 제거 기본 후보: ON
- quote 기본: OFF
- list prefix 기본: OFF
- target comma: `, `
- target semicolon: `; `
- target pipe: `|`
- target newline: LF `\n`

현재 제품/limit checker는 후보값 300,000 / 50 / 50,000을 사용하지만, **사용자 승인 전 FINAL 확정값으로 취급하지 않는다.**
승인 후 제품 상수, UI 문구, boundary/limit checker, fixture expected를 동일값으로 재대입하고 limit-only 후 FINAL을 실행한다.
