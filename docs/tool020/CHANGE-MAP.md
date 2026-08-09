# TOOL 020 변경지도

## 신규 전용 구현
- `components/youtube-channel-banner-page.tsx` — 020 페이지 콘텐츠/SEO/다국어 데이터 진입부
- `components/youtube-channel-banner-tool.tsx` — 020 편집 UI/상태/입출력/상호작용
- `components/youtube-channel-banner-tool.module.css` — 020 전용 반응형/작업영역 스타일
- `lib/tool-020-youtube-banner.ts` — 정책/제한/파일검증/안전영역/파일명 등 도구 전용 로직
- `lib/tool-020-renderer.ts` — preview/export 공용 Canvas 렌더링

## 격리 실행·검수
- `app/__tool020-harness/page.tsx` — 보조작업장 격리 확인용 020 전용 harness
- `tests/tool-020-*.spec.ts` — preflight/core/boundary/regression/limit 전용 spec
- `scripts/check-tool-020-*.mjs` — source/harness 정적 검수
- `test-fixtures/tool020/*` — 실제 이미지/손상/경계 fixture

## 주작업장 공통 연결 후보 — 보조작업장에서는 수정하지 않음
- 최신 `app/[locale]/[toolSlug]/page.tsx` 또는 현재 route 구조에 020 component 연결
- 최신 site/category data에 020 등록
- KO/EN/JA 카테고리 카드 등록
- sitemap에 KO/EN/JA 020 URL 추가
- robots 영향 확인
- 문의 `app=` 값 연결
- 실제 활성 관련도구 링크 연결

## 보호영역
공통 CSS/layout/header/footer/navigation/workbench/site/category/route/sitemap/robots와 기존 완료 도구·검수기는 수정하지 않았다.
