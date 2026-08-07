# 011 기준 디자인·레이아웃 이식 근거

## 실제 확인 기준
- 006 `components/image-resizer-tool.tsx`: 검증된 `toolbox-workbench`, 업로드/선택 상태, 작업장 액션 구조.
- 009 `components/image-brightness-color-adjuster-page.tsx`: 페이지 하단 순서와 `EXPERT POST` 별도 섹션.
- 010 `components/image-mosaic-blur-tool.tsx`: `toolbox-workbench-editor-grid` 미리보기/설정 2열, `adjuster-output-card` 전체폭 출력 구조.
- 공통 CSS `app/globals.css`: PC 2열 → 980/1240px 이하 1열, 640px 이하 모바일 버튼/패널 재배치 기준.

## 011 이식 결과
- 바깥 작업장: `toolbox-workbench` 그대로 사용.
- 파일 선택 전/후: 기존 `toolbox-workbench-upload`, `toolbox-upload-focus`, `toolbox-upload-active` 그대로 사용.
- 편집부: `toolbox-workbench-editor-grid` + 010과 같은 미리보기 왼쪽/설정 오른쪽 구조.
- 출력부: 009/010과 같은 `adjuster-output-card` 전체폭 구조.
- 011 전용 CSS는 내부 컨트롤과 캔버스에만 추가하고 공통 001~010 스타일을 교체하지 않음.
- 모바일: PC 단순 축소가 아니라 1열 전환, 버튼 재배치, 긴 일본어 줄바꿈, 캔버스 최대 높이 제한을 별도 적용.

## 실제 화면 확인 상태
- 현재 실행 환경에서 `@playwright/test` 패키지 설치가 내부 npm 404로 차단되어 브라우저 렌더링 비교는 미확인.
- 따라서 이 문서는 "소스 구조 이식 근거"이며 PC/모바일 실제 화면 PASS를 의미하지 않는다.
