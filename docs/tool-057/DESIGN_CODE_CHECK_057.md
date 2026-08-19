# TOOL057 DESIGN CODE CHECK 1·2

- MAIN 기준 도구: **TOOL055 길이·면적·부피 변환기**
- 선정 이유: 동일 G 카테고리, 즉시 단위변환, category tabs → value/from/to/swap → quick units → precision → result/multi-result 흐름이 가장 유사.
- SUB 기준: 없음. 현재 제공 기준 사본에서 MAIN만으로 필요한 공통 패턴 확인 가능.

## CHECK 1
- TOOL055의 `root/localNotice/tabs/workspace/card/inputGrid/actionRow/resultCard/summaryGrid/advanced` 구조를 유지: PASS.
- Primary Action 검정 배경/흰 글씨 유지: PASS.
- TOOL057 특화 `energy/power` 2차 탭과 연비·차원 안내만 전용 module에 추가: PASS.
- 공통 HOW TO / info band / FAQ class 재사용: PASS.
- `app/globals.css` 및 공식 styles 전역 파일 TOOL057 selector 추가 없음: PASS.
- legacy sealed selector 사용/복사 없음: PASS.

## CHECK 2
- 057 고유 UI는 `components/tool-057-speed-fuel-energy-converter.module.css`에만 존재: PASS.
- `!important` 신규 override 없음: PASS.
- 820px/520px responsive 구조 유지, `min-width:0`, `overflow-wrap:anywhere` 존재: PASS.
- KO/EN/JA 문자열이 component/page 내부에서 독립 제공: PASS.
- kW/kWh는 group 분리, hp/PS는 explicit text로 혼동 방지: PASS.
- 디자인 수정 후 selector/data-testid 구조 영향 없음. HARNESS STRUCTURE 재검증 PASS.

실제 PC/mobile viewport, 실제 일본어 줄바꿈·폰트·light/dark는 2026-08-11 최상위 규칙에 따라 주작업장 통합검증.
