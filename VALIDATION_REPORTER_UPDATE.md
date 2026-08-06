# 공통 검수기 결과 요약 개선

- 동일 테스트가 PC·모바일·다국어에서 반복 실패해도 원인별 1건으로 묶어 보고합니다.
- 스킵 항목은 실패와 분리하고, `test.skip()`에 기록된 사유와 대상 프로젝트를 표시합니다.
- 모든 검수 종료 시 다음 파일을 자동 생성합니다.
  - `test-results/toolbox-validation-summary.txt`
  - `test-results/toolbox-validation-summary.json`
- 기존 HTML·JSON·콘솔 리포트는 그대로 유지합니다.
