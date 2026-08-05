# 005 변경 파일

- `components/target-size-compressor-tool.tsx`
- `components/target-size-compressor-page.tsx`
- `app/[locale]/[toolSlug]/page.tsx`
- `app/sitemap.ts`
- `app/globals.css`
- `lib/site.ts`
- `lib/validation/tool-registry.ts`
- `components/image-compressor-page.tsx`
- `tests/tool-005-target-size-compressor.spec.ts`
- `tests/tool-005-load.spec.ts`
- `public/test-fixtures/target-large.jpg`
- `public/test-fixtures/target-large.png`
- `public/test-fixtures/target-large.webp`
- `docs/005-target-size-compressor-validation.md`
- `package.json`

## 안전 기능 보강

- EXIF 방향 직접 처리 및 중복 회전 방지
- 파일별 최소 품질·최소 이미지 크기 설정 추가
- 탐색 단계별 진행률·취소 안전 처리 추가
- 설정 변경 시 이전 결과와 객체 URL 정리
- 목표 미달성 원인별 안내와 명시적 결과 사용 정책 추가
- 관련 Playwright 검수 추가
