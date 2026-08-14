# TOOL 025 모바일 실기기 검수기 V17 업데이트 보고

## 기준
- 기존 `scripts/run-mobile-real-photo-001-024.mjs` V20을 원본 기준으로 사용.
- 기존 Android Chrome / Native Picker / UIAutomator / Camera 첫 사진 / 즉시 소스크롤 / PRODUCT_FAIL 재검사 / Download 실저장 확인 / Desktop ZIP 로직은 유지.
- TOOL025만 registry/workflow에 추가.

## TOOL025 추가 항목
- slug: `id-passport-photo-maker`
- input: `tool025-file-input`
- preview: `tool025-preview canvas`
- dropzone: `tool025-dropzone` + 업로드 후 `dropzoneReady`
- workspace: `tool025-workspace-dropzone`
- output size: `tool025-output-size`
- A4 count: `tool025-a4-count`
- individual download: `tool025-download`
- A4 download: `tool025-a4-download`

## 404 오판 방지
- 025 운영 페이지가 아직 미배포면 production 404를 PRODUCT_FAIL로 판정하지 않음.
- 새 Next 서버를 검수기가 자동 생성하지 않음.
- 이미 실행 중인 로컬 dev server만 3000/3001/3002/3003/3025에서 탐색.
- 발견 시 adb reverse로 Android `127.0.0.1`에 연결하여 기존 runner가 그대로 검사.
- 운영/로컬 모두 없으면 `HARNESS_TOOL025_BASE_UNAVAILABLE`로 종료.
- 페이지 404/Page not found는 `HARNESS_WEB_ROUTE_NOT_AVAILABLE`.

## 자체검사
- 001~025 source audit PASS
- mobile validator static/source self-check PASS
- TOOL025 FINAL checklist PASS
- 신규 Next server spawn 금지 guard PASS
