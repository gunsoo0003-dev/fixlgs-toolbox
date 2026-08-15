# TOOL 029 Third-party OSS

## pdf-lib 1.17.1
- 용도: 입력 PDF 파싱, 원본 페이지 객체를 새 PDFDocument로 `copyPages`, 결과 PDF save.
- 라이선스: MIT.
- 처리 위치: 브라우저 로컬.
- 서버/API/API key/account/운영비: 없음.
- 사용자 파일 외부 전송: 없음.

## pdfjs-dist 5.4.54
- 용도: 페이지 썸네일 저해상도 미리보기 렌더.
- 라이선스: Apache-2.0.
- 처리 위치: 브라우저 로컬.
- 서버/API/API key/account/운영비: 없음.
- 사용자 파일 외부 전송: 없음.
- native optional canvas는 브라우저 제품 경로에서 사용하지 않는다.

## package 변경
- `package.json`: 위 2개 runtime dependency 최소 추가 + TOOL029 전용 validation scripts 추가.
- `package-lock.json`: 위 버전 및 pdf-lib의 필수 하위 의존성 lock 최소 추가.
- 기존 dependency 삭제/교체/일괄 upgrade 없음.
