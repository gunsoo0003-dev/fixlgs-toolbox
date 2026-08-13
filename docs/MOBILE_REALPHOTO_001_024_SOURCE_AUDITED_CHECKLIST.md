# TOOLBOX 001~024 모바일 실사진 검수기 — 소스 전수조사 기준 체크리스트

이 문서는 사용자 설명을 받아 적은 절차가 아니라, 프로젝트의 실제 컴포넌트/테스트 selector와 Android 런타임 UI 탐색을 기준으로 한 검수기 명세다.

## Android 공통 상태머신
1. WEB_TOOL_OPEN — 실제 TOOL URL 로드.
2. UPLOAD_CONTROL_RESOLVED — 실제 hidden file input과 연결된 사용자 표시 업로드 control을 소스/DOM에서 찾음.
3. UPLOAD_CONTROL_CLICKED — trusted click 1회.
4. CHOOSER_OPEN — UIAutomator dump로 Android 시스템 chooser 실제 진입 확인.
5. MEDIA_ACTION_SELECTED — 현재 chooser의 모든 항목을 text/content-desc/resource-id/bounds/clickable로 수집하고 camera/files/media 역할을 런타임 분류. 고정 문구 의존 금지.
6. MEDIA_UI_DISCOVERY — 다음 Android 화면을 다시 dump. 앨범/컬렉션/최근/갤러리 등은 후보 점수로만 사용하고 실제 화면 구조를 우선함.
7. PHOTO_GRID_PROVEN — 비슷한 크기의 반복 썸네일 셀이 4개 이상 존재하고 x축 열이 2개 이상임을 기하학적으로 확인. 이 상태 전에는 “1번째 사진”을 누르지 않음.
8. PHOTO_SLOT_1_SELECTED — 증명된 grid를 행 우선 정렬해 1번째 셀 1회 탭.
9. RETURN_TO_WEB — picker 종료와 Chrome 복귀 확인. 필요할 때만 완료/추가/열기 계열 commit 1회.
10. IMMEDIATE_SMALL_SCROLL — 웹 복귀 즉시 아래로 짧게 1회 스크롤. 고정 5초 대기 금지.
11. ATTACH_STATE_READY — TOOL별 DOM 상태가 실제로 생성될 때까지 상태 poll.
12. TOOL_WORKFLOW — 아래 TOOL별 소스 기준 작업 실행.
13. RESULT_READY — TOOL별 실제 결과/다운로드 준비 상태 확인.

각 Android 단계는 XML + node JSON + 화면 PNG를 결과 폴더에 저장한다. 검수기는 화면 문구를 추측해서 다음 단계로 건너뛰지 않는다.

## TOOL별 소스 기준 작업
- 001 `image-converter-tool.tsx`: converter-file-input → converter-file-card → converter-run → card data-status=done.
- 002 `heic-avif-converter-tool.tsx`: heic-file-input → heic-file-card → heic-run → data-status=done.
- 003 `svg-bmp-tiff-converter-tool.tsx`: 입력 소스 허용은 SVG/BMP/TIFF. 고정 갤러리 사진이 소스 정책에 의해 거절되면 PRODUCT_FAIL이 아니라 INPUT_NOT_APPLICABLE로 분리. 지원 입력이 실제로 받아들여지면 svg-run까지 진행.
- 004 `image-compressor-tool.tsx`: compressor-file-card → compressor-run → done/kept.
- 005 `target-size-compressor-tool.tsx`: target-file-card → target-compress-button → reached/already/unreached 중 정상 처리 상태.
- 006 `image-resizer-tool.tsx`: resizer-file-card → resizer-run → done/kept.
- 007 `web-image-optimizer-tool.tsx`: optimizer-file-card → optimizer-run → done/kept.
- 008 `image-cropper-rotator-tool.tsx`: cropper-stage → 실제 편집/결과 확인 → cropper-download-zip 준비.
- 009 `image-brightness-color-adjuster-tool.tsx`: tool009-select → editor/preview → tool009-auto → 결과/다운로드.
- 010 `image-mosaic-blur-tool.tsx`: tool010-select → canvas → 실제 사각 영역 생성 → applied-count>0 → 다운로드.
- 011 `image-padding-background-tool.tsx`: tool011-file → editor/canvas-wrap → 다운로드 → result.
- 012 `image-border-rounded-tool.tsx`: tool012-file → editor → border toggle 적용 → output/download.
- 013 `image-merger-tool.tsx`: 이미지 2회 독립 선택. 매 선택마다 Android 전체 흐름+웹 복귀 즉시 스크롤. file-card 2개 → download.
- 014 `image-collage-maker-tool.tsx`: 이미지 2회 독립 선택 → preview-canvas → download.
- 015 `before-after-image-tool.tsx`: before-input 1회 + after-input 1회. 각각 Android 전체 흐름+스크롤 → state before/after ready → download.
- 016 `add-text-to-image-tool.tsx`: file input → preview → content에 TEST → download.
- 017 `image-watermark-tool.tsx`: input → preview → text-input TEST → process-all → download-current ready.
- 018 `image-metadata-checker-tool.tsx`: original-byte/metadata 특수 도구. result/basic-info 확인. 실패는 TOOL018_SPECIAL_FAIL로 일반 실패와 분리.
- 019 `youtube-thumbnail-maker-tool.tsx`: file-input → preview → 동적 testid `tool019-title-text`에 TEST → output → download.
- 020 `youtube-channel-banner-tool.tsx`: background-input → preview → title TEST → output → download.
- 021 `social-media-image-maker-tool.tsx`: background-input → interactive-preview → download-current/status.
- 022 `blog-open-graph-image-maker-tool.tsx`: background-input → root/editor 상태 → download-current/status.
- 023 `app-icon-favicon-generator-tool.tsx`: file-input → preview → generate → file-list/status.
- 024 `app-store-screenshot-maker-tool.tsx`: dropzone 내부 file input → preview → result-count>0 → export-zip → export-failures 확인.

## 판정 규칙
- PASS: 사용자 흐름 1회로 첨부부터 결과까지 성공.
- FLAKY: 1차 PRODUCT_FAIL, 독립 재검사 1회에서 PASS.
- PRODUCT_FAIL_ATTACH / PROCESS / RESULT: 제품 단계별 실패.
- HARNESS_FAIL: Android UI/ADB/selector/검수기 조작 실패. 제품 실패와 분리.
- TOOL018_SPECIAL_FAIL: 018 전용 분리.
- INPUT_NOT_APPLICABLE: 고정 실사진이 해당 TOOL 소스 입력정책과 불일치하여 기능검수 자체가 성립하지 않음.

## 실기기 전 실행 전 자체검사
`node scripts/check-mobile-real-photo-validator.mjs`

이 명령은 runner 문법뿐 아니라 001~024 실제 컴포넌트 소스의 testid/action과 검수기 정의를 대조한다. source-audit가 실패하면 전체 실기기 검수를 시작하지 않는다.


## V10 Android picker route correction
- Required route after media action: visible `갤러리` control -> visible `카메라` control -> proven repeated photo grid -> slot 1.
- Gallery/Recents are separate mandatory states; they no longer compete in one generic navigation score.
- Phase matching uses visible text/content-desc and clickable ancestor only, not package/resource-id words.
- After slot selection and browser return, immediate small downward scroll remains mandatory.
