# 001~005 도구별 독립 한계검수기

## 공통 원칙
- 기능 기본검수와 한계검수를 분리한다.
- 각 픽셀 단계는 독립 테스트로 실행한다.
- 데스크톱과 모바일 viewport 결과를 구분한다.
- 처리시간, 입력/결과 용량, 상태, 반복 횟수를 JSON으로 남긴다.
- 현재 코드의 제한값은 검수 결과 확정 전까지 임시 보호값이다.

## 도구별 계측
- 001: JPG/PNG/WebP 실제 디코딩·재인코딩, 4/12/24/36/40MP.
- 002: JPG/PNG→AVIF 실제 인코딩, 4/12/24/32/40MP. 실제 HEIC 디코딩은 HEIC fixture 확보 후 별도 검수가 필요하다.
- 003: SVG 복잡도와 래스터 출력, 4/12/24/36/40MP. 실제 다중 페이지 TIFF 총 픽셀은 TIFF fixture 확보 후 별도 검수가 필요하다.
- 004: JPG 실제 압축, 4/12/24/30MP.
- 005: 목표 용량 반복 압축, 4/12/24/30MP, 크기 축소 허용/비허용과 반복 횟수 기록.

## 실행 명령
```powershell
npm run test:toolbox:001-limit
npm run test:toolbox:002-limit
npm run test:toolbox:003-limit
npm run test:toolbox:004-limit
npm run test:toolbox:005-limit
```

통합 실행도 가능하지만 002와 005는 시간이 길 수 있으므로 번호별 실행을 권장한다.
