TOOL016 실제 제한 vs 첨부/디코드 실패 진단 V2

목적
- 기능 수정 아님.
- TOOL016이 실제 12MP/6000px 제한에 걸리는지, 아니면 이미지 읽기 실패를 제한 오류로 오해하는지 판별.

이번 V2 차이
- React 렌더링을 기다리지 않고 판정 직후 document.body에 고정 진단 오버레이를 직접 생성.
- 동일 데이터를 window.__TOOL016_DIAG__ 와 localStorage TOOL016_DIAG_LAST 에도 즉시 저장.
- 따라서 검수기가 오류를 10~20ms 만에 감지해도 진단값이 먼저 남도록 구성.

표시값
stage, name, size, type, width, height, pixelCount, maxPixels, maxSide,
fileOver, sideOver, pixelOver, limitExceeded, decodeError

판정
- stage=REJECT_IMAGE_LIMIT + sideOver/pixelOver=true : 실제 제한 초과
- stage=IMAGE_LIMIT_PASS : 제한 통과, 다른 원인
- stage=DECODE_ERROR : 이미지 디코드/첨부 후처리 실패
- stage=REJECT_FILE_SIZE : 15MB 파일 제한 초과

적용
기존 프로젝트 최상위 fixlgs-toolbox에 그대로 덮어쓰기.
추가 설치 없음.

테스트
node .\scripts\run-mobile-real-photo-001-024.mjs --only 16

주의
- 진단용 임시 패치이므로 원인 판별 후 제거/원복 권장.
