# TOOL048 HANDOFF

- 도구 번호: 048
- 도구명: 나이·생후기간 계산기 / Age & Elapsed Life Calculator
- 카테고리: F. 날짜·시간 도구
- slug: `age-life-calculator`
- 예상 URL: `/ko/age-life-calculator`, `/en/age-life-calculator`, `/ja/age-life-calculator`
- 보조작업장 상태: READY (정적/구조 범위)

## 구현 기능
- 만나이: 완료된 calendar years -> months -> days
- 연나이: 기준연도 - 출생연도
- 생후 일수: 실제 Gregorian elapsed days, 동일일 0일
- 다음 생일: 날짜, 요일, 남은 일수, 당일 D-Day
- 기준일: 브라우저 로컬 오늘 기본값 + 사용자 변경
- 결과 복사: Clipboard 성공 시에만 완료 상태, 실패 시 선택 가능한 텍스트 fallback
- 미래 생년월일 validation
- 서비스 유효상한 후보: 1900-01-01 ~ 2100-12-31
- 2월 29일 정책: 비윤년에는 2월 28일을 생일로 처리(FEB_28)
- KO/EN/JA UI/SEO/FAQ/사용방법/주의사항

## MAIN 디자인 기준
- MAIN: TOOL045 날짜 차이 계산기
- 기준 요소: hero/body/common content sections, local notice, date input grid, reset button, primary result + secondary result cards, mobile single-column transition
- TOOL046/047은 제공 프로젝트 압축본에 실제 통합 코드가 없어 디자인 기준으로 추측 사용하지 않음

## 이식 대상 전용 파일
- `app/[locale]/age-life-calculator/page.tsx`
- `components/age-life-calculator-page.tsx`
- `components/age-life-calculator-tool.tsx`
- `components/age-life-calculator-tool.module.css`
- `lib/tool-048-age-life.ts`
- `playwright.tool048.config.ts`
- `tests/fixtures/tool-048/cases.json`
- `tests/tool-048-preflight.spec.ts`
- `tests/tool-048-core.spec.ts`
- `tests/tool-048-boundary.spec.ts`
- `tests/tool-048-regression.spec.ts`
- `tests/tool-048-limit.spec.ts`
- `tests/tool-048-feature.spec.ts`
- `scripts/tool-048/check-source.mjs`
- `scripts/tool-048/check-logic.mjs`
- `scripts/tool-048/check-harness.mjs`
- `scripts/tool-048/check-design.mjs`
- `scripts/tool-048/run-static-validation.mjs`
- `docs/tool-048/HANDOFF_048.md`
- `docs/tool-048/CHANGES_048.md`
- `docs/tool-048/TOOL048_REQ_MASTER.md`
- `docs/tool-048/TOOL048_CHECKLIST.md`
- `docs/tool-048/TOOL048_DESIGN_CODE_CHECK.md`
- `planning-original/TOOL048_ORIGINAL_DELIVERY_SPEC.pdf` (원본 제작전달서)

## 공통파일 변경
- 없음.
- `app/globals.css`, `styles/*.css`, legacy sealed, 공통 component/helper, 기존 완료 도구, sitemap/robots/category 연결 파일을 수정하지 않음.
- package.json/package-lock.json 변경 없음. 신규 OSS 없음.

## 검수 결과
- SOURCE: PASS
- LOGIC/FIXTURE: PASS
- HARNESS STRUCTURE: PASS
- DESIGN-CODE: PASS (MAIN TOOL045)
- helper 독립 런타임 exact expected: PASS
- 전체 TypeScript: ENVIRONMENT (node_modules 미포함 압축본으로 Next/React/Playwright type resolution 불가; 기존 TOOL045 포함 프로젝트 전체 동일 오류)

## 주작업장 통합검증
- 최신 프로젝트에 신규 route/category/site 등록
- sitemap/robots 실제 등록 및 기존 URL 회귀 확인
- 실제 브라우저 PC/mobile KO/EN/JA/light/dark
- Clipboard 실제 성공/실패 경로
- Playwright preflight/core/boundary/feature/regression/limit
- checker self-check 및 실제 test count/0-test/SKIP 확인
- TypeScript, production build, 통합 regression, FINAL
- 배포, Search Console URL 검사/색인 요청

## 통합 주의
- TOOL048 페이지는 공통 category/route 파일을 보조작업장에서 수정하지 않았으므로 주작업장에서 최신 구조에 맞게 정식 연결해야 함.
- 비윤년 2/29 생일 정책(FEB_28)을 제품/FAQ/fixture/검수기에서 동일하게 유지할 것.
- 서비스 유효상한 1900~2100을 변경하면 helper/UI/fixture/limit/FAQ를 한 번에 동기화할 것.
