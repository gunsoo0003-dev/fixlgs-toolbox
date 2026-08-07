# 015 주작업장 이식 기록

- 대상: 웹도구 015 전후 비교 이미지 만들기
- slug: `before-after-image-maker`
- 신규 전용 컴포넌트/검수기/fixture/docs 이식 완료
- `lib/site.ts`: 015 slug/title/description + image-edit 8번째 카드 LIVE 연결
- `app/[locale]/[toolSlug]/page.tsx`: 015 static params / metadata / route 연결
- `app/sitemap.ts`: ko/en/ja 015 URL 추가
- `package.json`: 015 전용 source/harness/validator/preflight/core/regression/limit script 병합
- 001~014 기존 개별 기능/검수 파일 변경 없음

정적 확인:
- 015 SOURCE CHECK: PASS
- 015 HARNESS STATIC PREFLIGHT: PASS
- 015 VALIDATOR SELF-CHECK: PASS

실제 PC/모바일 디자인과 Playwright 단계 검수는 주작업장 로컬 실행 후 진행한다.
