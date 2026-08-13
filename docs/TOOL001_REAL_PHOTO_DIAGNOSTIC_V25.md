# TOOL001 REAL PHOTO DIAGNOSTIC V25

목적: 실제 Galaxy Photo Picker에서 성공/실패가 섞이는 원인을 넓게 탐색하고 최초 분기 지점을 자동 요약한다.

기본 8 CASE:
1. KNOWN_GOOD_1 — 평소 성공하는 실제 사진
2. KNOWN_GOOD_REPEAT — 1번과 동일 사진 재선택
3. KNOWN_BAD_1 — 평소 실패하는 실제 사진
4. KNOWN_BAD_REPEAT — 3번과 동일 사진 재선택
5. CAMERA_PHOTO — Galaxy 카메라 원본
6. SCREENSHOT — Galaxy 실제 스크린샷
7. DOWNLOADED_OR_EDITED — 다운로드/편집 저장 이미지
8. KNOWN_BAD_REPEAT_2 — 3번 실패 사진 추가 반복

검수 범위:
- 업로드 버튼 화이트리스트 및 오클릭/예상외 navigation
- Photo Picker open / selection / commit / close / Chrome result-return
- input.files / trusted change
- File metadata
- provider read reader/elapsed/error
- byte signature / EXIF
- 제품 limit / inspection / width / height / pixels / 40MP 후보
- preview URL / card / decoded preview
- 동일 파일 반복 성공률 차이(timing race)
- GOOD/BAD 최초 분기 단계 자동 요약

실행:
node scripts/verify-tool-001-real-photo-diagnostic-v25.mjs
node scripts/run-tool-001-real-photo-diagnostic-v25.mjs --url "https://toolbox.fixlgs.com/ko/jpg-png-webp-image-converter"

결과 ZIP은 Windows Desktop에 생성된다.
