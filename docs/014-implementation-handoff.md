# 014 이미지 콜라주 만들기 — 주작업장 이식 기록

- route: `/ko|en|ja/image-collage-maker`
- 기존 001~013 개별 기능 컴포넌트는 수정하지 않음.
- 신규: `components/image-collage-maker-tool.tsx`, `components/image-collage-maker-page.tsx`
- 공통 연결 수정: `lib/site.ts`, `app/[locale]/[toolSlug]/page.tsx`, `app/sitemap.ts`, `app/globals.css`, `package.json`
- 지원 레이아웃: 좌우/상하 2분할, 3열/3행/큰1+작은2 대칭형, 2×2/4열/4행, 2×3/3×2/3×3
- 셀: Cover/Contain, 확대, 위치 드래그, 중앙/초기화, 이미지 선택/빈 셀, 이전·다음 셀 교환
- 이미지 목록: 다중 선택/추가/삭제/드래그 순서/이전·다음/순서대로 재배치/대기 이미지 유지
- 스타일: 비율, 결과 폭·높이, 간격, 외곽 여백, 테두리, 배경색/투명
- 출력: PNG/JPG/WebP, 품질, 파일명, 반복 다운로드
- 보수적 서비스 상한 적용: 12장, 개별 15MiB, 총 80MiB, 원본 24MP, 출력 한 변 3000px, 총 9MP, 최대 9셀
- 외부 파일 드래그와 이미지 목록 내부 순서 드래그는 별도 상태로 처리.
- limit-only 제공 사전 harness를 프로젝트에 병합함.

## 검수 상태
이 실행 환경에서는 사내 npm registry에 `@playwright/test` 패키지가 없어 `npm ci`가 404로 실패했다. 따라서 실제 Playwright/Next build PASS 판정은 아직 하지 않았으며, 완료 처리 금지 상태다. 제품 코드와 harness는 다음 실제 프로젝트 환경에서 preflight부터 실행해야 한다.
