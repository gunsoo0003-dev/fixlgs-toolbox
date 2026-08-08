# 016 디자인 정합성 정적 점검 기록

상태: 실제 브라우저 렌더 비교 전 정적 구조 점검 완료 / 실렌더 판정 미완료

비교 기준:
- 012 이미지 테두리·둥근 모서리: 단일 이미지 편집 작업영역, Hero, workbench, preview/settings, Primary Action
- 013 이미지 합치기: 다중 요소 관리, 작업 카드/목록, 하단 콘텐츠 구조

정적으로 확인한 공통 기준:
- toolbox-tool-detail-hero 사용
- 뒤로가기 / 016 · IMAGE EDIT / H1 / 설명 / LOCAL 배지 구조
- toolbox-tool-detail-body 사용
- toolbox-workbench 사용
- toolbox-workbench-upload 사용
- toolbox-workbench-preview-card 사용
- toolbox-workbench-settings-card 사용
- toolbox-workbench-actions 사용
- toolbox-primary-action 사용
- NEXT WORK 존재
- HOW TO USE 존재
- EXPERT POST 존재
- FAQ 존재
- 공통 globals.css 수정 없음

정상 차이:
- 016은 여러 텍스트 레이어를 선택·복제·삭제·정렬해야 하므로 별도 레이어 목록 카드가 존재한다.
- 016은 단일 이미지 도구이므로 다중파일 drag 정렬 영역은 적용 대상이 아니다.

실제 화면에서 반드시 추가 확인할 항목:
- PC: Hero 높이, workbench 폭/밀도, preview/settings 비율, Primary Action 표시
- Mobile: 미리보기 우선 순서, 텍스트 목록 접힘/밀도, 버튼 줄바꿈, 키보드 표시 시 레이아웃
- Light/Dark: 사용자 텍스트색과 UI 테마 분리, 카드 대비
- JA Mobile: 選択中の文字 / 今日の日付を入力 / 文字領域の幅 / 背景の不透明度 / 画面に合わせる 줄바꿈

판정 제한:
현재 보조작업장 실행환경에서 Next/@playwright/test 의존성을 설치할 수 없어 실제 렌더 스크린샷 비교는 수행하지 못했다. 이 항목은 정적 PASS로 대체하지 않는다.
