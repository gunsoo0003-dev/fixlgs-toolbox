# FIXLGS TOOLBOX 공통 검수기 4차 속도 최적화

- 제품 코드/CSS 변경 없음.
- FAST는 001~024 전수검사가 아니라 대표 8개(001, 008, 009, 012, 016, 017, 018, 024) 샘플링.
- 대표군은 구형 시작점/복합 cropper/실기기 정상 기준군/018 runtime 의심군/최신 카테고리3 기준군을 포함.
- FAST PC와 모바일은 각각 하나의 Playwright test 안에서 Page를 재사용하여 순차 검수.
- chooser/goto/ready 타임아웃을 fast 전용으로 짧게 제한하여 장시간 정체 방지.
- FULL은 기존 001~024 전수검수 구조를 유지.
- Desktop 결과 ZIP 자동 생성 유지.
- 모바일 drag/drop은 계속 N/A.

권장 사용:
- 평소/수정 직후: npm run test:toolbox:common-user-path-fast
- 최종 출고 전: npm run test:toolbox:common-user-path
