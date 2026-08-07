# 010 이미지 모자이크·블러 도구 변경 내역

- 001/009의 실제 작업장 외곽 JSX·CSS 구조로 재정렬
- 선택 이미지부터 결과 정보까지 하나의 `toolbox-workbench` 외곽 안에 배치
- 출력 설정을 상단 2열 밖의 전체 폭 `adjuster-output-card`로 이식
- 다음 작업·사용 방법·전문가 콘텐츠는 도구 외곽 밖 페이지 흐름 유지
- 브러시 모자이크·블러가 실제 스트로크 폭으로 합성되도록 마스크 캔버스 방식 적용
- 원본 보기 상태가 다운로드 결과에 영향을 주던 안전 오류 수정
- 영역 이동·크기 변경을 각각 Undo 가능한 히스토리 단계로 수정
- 브러시 포인트 과다 저장 완화를 위한 최소 거리 단순화 적용
- Pointer cancel·pointer capture 해제 처리 추가
- 0바이트·파일 시그니처·MIME·확장자 불일치 검증 추가
- 010 source/추가/회귀/경계/자동 한계검수 연결
- 최종 실행기에 source·일본어·build·common·core·additional·regression·boundary·auto-limit 단계 연결
- 기존 001·009 도구와 핵심 검수 파일, robots.ts 비변경 확인
