# TOOL 025 MOBILE REAL-DEVICE CHECKLIST

기준: 기존 `scripts/run-mobile-real-photo-001-024.mjs` V20 흐름을 그대로 유지하고 TOOL025만 추가한다.

- [x] 기존 Android Chrome + Native Picker 흐름 유지
- [x] Gallery -> Camera -> 첫 사진 -> Chrome 복귀 -> 즉시 소스크롤 유지
- [x] TOOL025 slug `id-passport-photo-maker` 등록
- [x] 실제 input `tool025-file-input` 등록
- [x] 업로드 후 `tool025-preview canvas` 확인
- [x] 상시 Dropzone `tool025-dropzone` + `dropzoneReady` 확인
- [x] workspace `tool025-workspace-dropzone` 확인
- [x] 출력 px `tool025-output-size` 확인
- [x] A4 count `tool025-a4-count >= 1` 확인
- [x] 개별 다운로드 Android Download 저장 확인
- [x] A4 다운로드 Android Download 저장 확인
- [x] PRODUCT_FAIL / HARNESS_FAIL 기존 분류 유지
- [x] 진행상황 `[PROGRESS]`, `[FLOW]` 기존 출력 유지
- [x] 성공/실패/검수기 자체 오류 모두 Desktop ZIP 생성 시도
- [x] 운영 025가 미배포면 새 서버를 만들지 않고, 이미 실행 중인 로컬 dev 서버만 탐색하여 기존 runner에 `--base-url` 효과로 연결
- [x] 로컬 연결이 필요할 때만 adb reverse 사용하고 종료 시 제거
- [x] 404/Page not found는 PRODUCT_FAIL이 아니라 HARNESS_FAIL
