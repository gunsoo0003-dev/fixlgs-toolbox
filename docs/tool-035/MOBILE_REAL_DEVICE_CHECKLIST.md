# TOOL 035 모바일 실기기 등록/후속 체크

등록 payload: `scripts/tool-035/mobile-runner-entry.mjs`

사용자 경로:
1. PDF 선택
2. 텍스트 / 이미지 / 둘 다 모드 선택
3. 추출
4. 페이지별 결과 확인
5. TXT 또는 ZIP 다운로드

핵심 selector:
- input: `[data-testid="tool035-file-input"]`
- ready: `[data-testid="tool035-workspace"]`
- action: `[data-testid="tool035-extract"]`
- result: `[data-testid="tool035-results"]`
- error: `[data-testid="tool035-error"]`

실제 스마트폰 실행은 PDF 카테고리 단위 일괄 검수에서 shared runner에 등록/병합 후 실행한다.
