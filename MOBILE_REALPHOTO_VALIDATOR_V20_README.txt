FIXLGS TOOLBOX 모바일 실사진 검수기 V20

목적
- V19에서 남은 검수기 문제만 수정.
- 제품 코드는 수정하지 않음.
- 우선 집중 대상: TOOL005 / TOOL015 / TOOL016.

V20 수정
1) TOOL005
- 실제 case id가 T5_R...인데 기존 toolNumberFromCase가 T005_R...만 인식하던 버그 수정.
- 따라서 V19에서 준비되어 있던 TOOL005 전용 실제 DOM 분기(.target-size-file-actions의 다운로드)가 이제 실행됨.
- 목표 달성 불가 -> 현재 결과 사용 -> 개별 다운로드의 실제 사용자 흐름을 검수.

2) TOOL015 / TOOL016 진단
- 실제 case id T15_R... / T16_R...를 기존 진단 arm이 잘못 판별하던 버그 수정.
- picker input change capture에서 native File 메타데이터(name/size/type/lastModified)를 바이트 read 없이 기록.
- 제품 자체가 URL.createObjectURL에 넘긴 File/Blob 메타데이터를 수동 관찰.
- 제품 자체 Image decode의 load/error 및 naturalWidth/naturalHeight를 수동 관찰.
- 별도 이미지 read/retry/fallback은 하지 않음.
- 제품 판정은 바꾸지 않으며 실패는 그대로 PRODUCT_FAIL.

3) 기존 정상 흐름 보존
- TOOL013 V18 PASS 흐름, 공통 picker, 다운로드, Open/열기 금지, cleanup은 변경하지 않음.

권장 실행
node .\\scripts\\check-mobile-real-photo-validator.mjs
node .\\scripts\\run-mobile-real-photo-001-024.mjs --only 5
node .\\scripts\\run-mobile-real-photo-001-024.mjs --only 15
node .\\scripts\\run-mobile-real-photo-001-024.mjs --only 16
