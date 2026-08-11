# TOOLBOX 공통 검수기 FULL 속도 최적화

- 001~024 전수 검사 범위 유지
- PC 실제 upload click -> filechooser -> change 전수 유지
- 모바일 실제 tap -> filechooser -> change 전수 유지
- PC drag & drop 전수 유지
- KO/EN/JA 직접 URL + reload + runtime 전수 유지
- 각 단계에서 단일 Playwright test/page를 재사용하여 test/page 재생성 오버헤드 제거
- 기능 없음은 capability profile 기준 조기 제외 가능 구조 유지
- 제품 기능/CSS 변경 없음
- Desktop 결과 ZIP 자동 생성 유지
