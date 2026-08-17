# TOOL045 DESIGN CODE CHECK

- MAIN: **TOOL036 글자 수·문서 통계 계산기** — 즉시 계산형 작업영역, local notice, 결과 카드 계층, responsive 결과 구조를 기준으로 사용.
- SUB: **TOOL039 목록 정렬·중복 제거기** — 최신 텍스트 계열의 module.css 분리, 전용 selector/testid, 공통 섹션 재사용 패턴 확인에만 사용.
- 신규 기능 고유 UI: `components/date-difference-calculator-tool.module.css`에만 작성.
- 공통 정보 섹션: `ToolboxSubpageShell`, 공통 HOW TO/NEXT WORK/RELATED/FAQ class를 재사용.
- `app/globals.css`, `styles/*.css`, `legacy-*-sealed.css`: 수정 없음 / TOOL045 selector 오염 0.
- 모바일: date input grid 2열→1열, result grid 2열→1열, 380px에서 header button full width.
- 모바일 가이드 카드 heading은 `text-wrap: balance`로 문장 의미 단위가 유지되도록 줄바꿈을 안정화하고, 한 단어만 다음 줄에 고립되는 orphan wrap을 금지한다.
- 다크: hard-coded panel/text 색 대신 TOOLBOX CSS variable 사용. 오류색만 기존 계열과 동일한 red semantic 사용.
- JA 긴 문구: result strong `overflow-wrap:anywhere`, date workspace 1열 모바일 구조로 가로 overflow 위험 완화.

판정: DESIGN-CODE PASS. 실제 viewport/폰트/hover/touch/light-dark 실렌더링은 최신 최상위 지시대로 주작업장 통합검증.


## MOBILE/PC-TYPO — 2026-08-17 추가
- TOOL045 가이드 카드 제목은 PC/mobile 모두 실제 렌더에서 의미 단위 줄바꿈을 확인한다.
- `word-break: keep-all`로 마지막 단어가 단독 다음 줄로 고립되는 경우 CSS 강제 줄바꿈보다 문구를 우선 단축한다.
- 이번 실제 피드백에서 3개 한국어 제목을 짧은 의미 단위로 수정했다.


## Category numbering regression — TOOL045
The category page is a separate protected regression surface. TOOL045 must display `045` on `/category/date-time` in KO/EN/JA. The category card number must derive from the global TOOL number, not `index + 1`.
- Category-number formatter must include `date-time` in the 3-digit global TOOL-number branch so TOOL045 renders exactly `045`.
- Category card href must be locale-relative and resolve to `/ko|en|ja/date-difference-calculator`; hard-coded KO href is forbidden.
