# 웹도구 015 이식 변경지도

## 대상
- 내부 도구번호: 015
- 실제 UI 표시번호 기대값: 15
- 도구명: 전후 비교 이미지 만들기
- category: `image-edit`
- slug: `before-after-image-maker`
- route: `/ko|en|ja/before-after-image-maker`

## 신규 전용 파일
- `components/before-after-image-page.tsx` — 페이지, 다국어 본문, JSON-LD, 사용방법, 전문가 포스팅, FAQ, 다음 작업
- `components/before-after-image-tool.tsx` — Before/After 편집·Canvas·다운로드
- `components/before-after-image-tool.module.css` — 015 전용 작업영역·모바일·사용방법 미세 스타일
- `tests/helpers/tool-015.ts`
- `tests/tool-015-preflight.spec.ts`
- `tests/tool-015-core.spec.ts`
- `tests/tool-015-regression.spec.ts`
- `tests/tool-015-limit.spec.ts`
- `tests/config/tool-015-limit-candidates.ts`
- `scripts/check-tool-015-source.mjs`
- `scripts/check-tool-015-harness.mjs`
- `scripts/check-tool-015-validator.mjs`
- `scripts/run-tool-015-preflight.mjs`
- `scripts/run-tool-015-partial-validation.mjs`
- `scripts/run-tool-015-regression-only.mjs`
- `scripts/run-tool-015-limit-only.mjs`
- `docs/015-validation-plan.md`
- `docs/015-limit-only-prep.md`
- `docs/015-integration-map.md`
- `docs/015-failure-response-map.md`

## 주작업장 최신본에서 연결할 기존 파일
보조작업장 확인용 수정본을 통째로 덮어쓰지 않는다.

### `lib/site.ts`
- `tool015Slug = "before-after-image-maker"`
- KO/EN/JA title·description 등록
- `image-edit` 8번째 카드(실제 표시번호 15)를 LIVE + href로 연결
- 카드 제목 줄바꿈은 기존 category page 배열의 의미 단위 줄바꿈을 유지

### `app/[locale]/[toolSlug]/page.tsx`
- `BeforeAfterImagePage` import
- static params에 tool015Slug 추가
- metadata title/description/canonical/hreflang 연결
- route 분기에 015 추가

### `app/sitemap.ts`
- 기존 구조 유지 후 015의 ko/en/ja URL만 추가

### `app/robots.ts`
- 구조 변경 필요 없음. 기존 sitemap URL 유지 여부만 회귀 확인

### package.json
전체 덮어쓰기 금지. 아래 신규 script key만 필요한 경우 병합:
- `check:tool015-source`
- `check:tool015-harness`
- `check:tool015-validator`
- `test:toolbox:015-preflight`
- `test:toolbox:015-core`
- `test:toolbox:015-core-only`
- `test:toolbox:015-regression`
- `test:toolbox:015-regression-only`
- `test:toolbox:015-limit`
- `test:toolbox:015-limit-only`

## 관련 도구
- 016 이미지에 글자 넣기: 아직 미제작이면 비활성
- 013 이미지 합치기: `/image-merger`
- 014 이미지 콜라주 만들기: `/image-collage-maker`
- 004 이미지 압축기
- 006 이미지 크기 변경기

## 문의 app
`ToolboxSubpageShell appName`에는 언어별 실제 015 도구명을 전달한다.
- KO: 전후 비교 이미지 만들기
- EN: Before & After Image Maker
- JA: ビフォー・アフター比較画像作成

## dependency
신규 npm dependency 없음. Canvas/ImageBitmap/Pointer Events만 사용.

## 공통모듈 사용
- `ToolboxSubpageShell`
- `ToolboxFaqList`
- 기존 globals.css 공통 tool detail / next work / guide / expert post 클래스

## 보조작업장 확인용 기존파일 변경
- `lib/site.ts`
- `app/[locale]/[toolSlug]/page.tsx`
- `package.json`
이 3개는 주작업장 이식용으로 통째로 덮어쓰지 말고 위 변경지도만 반영한다.
