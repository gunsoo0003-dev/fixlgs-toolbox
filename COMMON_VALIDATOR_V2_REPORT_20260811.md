# TOOLBOX 공통 검수기 2차 보정

- desktop user-path는 desktop-chromium에서만 실행
- mobile user-path는 mobile-chromium에서만 실행
- 모바일 중심점 elementFromPoint 판정 제거
- 모바일은 Playwright 실제 tap() -> filechooser -> change 경로로 판정
- PC는 실제 click() -> filechooser -> change 경로 유지
- drag/drop은 desktop 전용, mobile은 capability N/A
- runtime error에 pageerror stack / console source location 원문 기록 강화
- 공통 검수 종료 후 Windows Desktop에 결과 ZIP 자동 생성
  - full: TOOLBOX_공통검수_검수결과.zip
  - fast: TOOLBOX_공통검수_fast_검수결과.zip
- 제품 TS/TSX/CSS 기능 파일은 이번 2차 검수기 보정에서 변경하지 않음
