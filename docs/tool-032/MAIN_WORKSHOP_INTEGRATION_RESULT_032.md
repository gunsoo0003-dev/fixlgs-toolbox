# TOOL032 주작업장 통합 결과

- 기준 프로젝트: TOOL031 배포완료 `d691cea`
- 보호 범위: 001~031
- TOOL032 slug: `pdf-signature`
- 서비스 한도: 추천 A 승인값 유지
  - PDF 1개 / 30 MiB / 300페이지
  - 서명 이미지 10 MiB / 20 MP
  - 그리기 20,000 points
- 중앙 연결: `lib/site.ts`, `app/sitemap.ts`, `package.json`
- PDF 카테고리 디자인 최신 기준: TOOL031
  - 초기 Dropzone
  - 업로드 후 compact 파일 카드
  - workspace 전체 PDF 교체 drop target
  - `dragActive = dragging || workspaceDragging` 공유 상태
- 검수기 단계: preflight / core / boundary / feature / regression / limit / final
- 모바일 실기기: 001~032 중앙 runner 등록, TOOL032 전용 `PDF -> draw signature -> overlay -> create -> result -> download` 흐름
- 내부 정적 self-check: PASS
- 사용자 Windows에서 남은 확정 단계: TypeScript + production build + Desktop Chromium + Mobile Chromium + FINAL
