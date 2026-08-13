TOOL016 제한/디코드 원인 판별용 임시 진단 패치

목적:
- 기능 우회/제한 완화 없음.
- 기존 TOOL016 load 경로를 그대로 사용하면서 실제 판정값만 화면 + console에 기록.

기록값:
- file.name / file.size / file.type
- decoded width / height / pixelCount
- maxPixels / maxSide
- fileOver / sideOver / pixelOver / limitExceeded
- stage: FILE_RECEIVED / REJECT_FORMAT / REJECT_FILE_SIZE / REJECT_IMAGE_LIMIT / IMAGE_LIMIT_PASS / DECODE_ERROR

판별:
- REJECT_IMAGE_LIMIT + pixelOver/sideOver=true => 실제 제한 초과
- DECODE_ERROR => 이미지 후처리/디코드 실패
- IMAGE_LIMIT_PASS 후 다른 실패 => 제한은 원인 아님

적용:
압축 해제 후 fixlgs-toolbox 폴더를 기존 프로젝트에 덮어쓰기.
추가 설치 없음.

주의:
임시 진단용. 원인 확인 후 원복 또는 진단 UI 제거 권장.
