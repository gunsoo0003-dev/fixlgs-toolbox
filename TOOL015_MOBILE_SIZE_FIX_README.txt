TOOL015 모바일 재인코딩 용량초과 수정 패치

원인
- Android Chrome 모바일에서 StableMobileImageFileInput은 카메라 원본을 app-owned 이미지로 재생성해 전달함.
- TOOL015는 이 재생성 파일의 file.size를 그대로 15 MiB 제한에 비교하고 있었음.
- Camera #1 같은 원본 JPG(약 5.9MB)는 정상이어도, 모바일 재인코딩본이 더 커지면서
  TOOL015에서만 "파일 용량 초과"가 발생할 수 있었음.

수정
1) StableMobileImageFileInput
- app-owned 파일에 원본 선택 파일 메타정보(__stableMobileOriginalInfo) 부착
- 화면/기능 변화 없음

2) TOOL015 before-after-image-tool
- 파일당 15 MiB / 총 30 MiB 서비스 입력 제한 검사는
  재생성 파일 크기가 아니라 원본 선택 파일 크기 기준으로 판단
- 픽셀수 20MP 제한과 실제 디코드/처리 로직은 기존 유지

영향 범위
- TOOL015 모바일 카메라 원본의 잘못된 용량초과 차단 해소
- TOOL016 진단 오버레이 제거본(stable-mobile-image-file-input) 기준 포함
- 신규 npm 패키지 없음
