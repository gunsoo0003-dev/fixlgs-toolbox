# TOOL069 HANDOFF

- 도구: 069 손익분기점 계산기 / Break-even Point Calculator / 損益分岐点計算ツール
- 카테고리: H. 사업·금융 계산기 (`business-finance`)
- slug: `break-even-point-calculator`
- 예상 URL: `/ko|en|ja/break-even-point-calculator`
- 보조작업장 상태: READY — CODE PASS / FUNCTION-STATIC PASS / DESIGN-CODE PASS / HARNESS-STRUCTURE PASS / PACKAGE PASS / COMMON FILE PROTECTION PASS
- MAIN 디자인 기준: TOOL066 부가세 계산기. 제공 기준 ZIP에는 067·068 실제 구현이 없어 066을 가장 가까운 숫자형 사업·금융 계산기로 선정.

## 구현 기능
- 고정비 / 판매가 / 단위당 변동비 입력
- 상품당 이익(공헌이익) = 판매가 − 변동비
- 공헌이익률 = 공헌이익 ÷ 판매가
- 손익분기 판매량 계산값 + 실제 최소 올림 판매량
- 손익분기 매출 = 고정비 ÷ 공헌이익률
- 목표 이익 판매량/매출
- 예상 판매량 기준 영업이익
- Margin of Safety 수량 및 손익분기 이하/도달/초과 상태
- 판매가≤변동비 손익분기 불가 처리
- Copy / Reset
- KO/EN/JA, metadata, canonical, hreflang, WebApplication/Breadcrumb/FAQ JSON-LD
- 브라우저 로컬 계산, 서버/API/저장 없음

## 이식 대상 전용 파일
- `app/[locale]/break-even-point-calculator/page.tsx`
- `components/tool-069-break-even-calculator-page.tsx`
- `components/tool-069-break-even-calculator.tsx`
- `components/tool-069-break-even-calculator.module.css`
- `lib/tool-069-break-even.ts`
- `tests/fixtures/tool-069/cases.json`
- `tests/tool-069-preflight.spec.ts`
- `tests/tool-069-core.spec.ts`
- `tests/tool-069-feature.spec.ts`
- `tests/tool-069-boundary.spec.ts`
- `tests/tool-069-limit.spec.ts`
- `tests/tool-069-regression.spec.ts`
- `scripts/tool-069/check-source.mjs`
- `scripts/tool-069/check-design.mjs`
- `scripts/tool-069/check-harness.mjs`
- `scripts/tool-069/check-logic.mjs`
- `scripts/tool-069/check-fixtures.mjs`
- `scripts/tool-069/check-protection.mjs`
- `scripts/tool-069/run-static-validation.mjs`

## 정적 검증 결과
- `run-static-validation.mjs`: PASS 6/6
- 엔진 단독 TypeScript compile: PASS
- 첫 정적 실행에서 동적 `data-testid`를 literal로 찾는 HARNESS_ERROR 1건 발견 → 제품 코드 변경 없이 `check-harness.mjs`만 수정 → 재실행 PASS.

## 공통파일 보호
다음 파일은 원본 ZIP SHA-256과 동일함.
- `app/globals.css`
- `styles/global-base.css`
- `styles/toolbox-common.css`
- `styles/toolbox-detail-common.css`
- `styles/theme.css`
- `styles/toolbox-compat.css`
- `styles/legacy-site-sealed.css`
- `styles/legacy-tools-sealed.css`
- `lib/site.ts`
- `app/sitemap.ts`
- `package.json`

신규 OSS/dependency 없음. legacy sealed 직접 사용 없음.

## 주작업장 통합검증
1. 최신 통합본에 069 전용 파일 이식.
2. `lib/site.ts` 카테고리/카드/slug 연결 및 `app/sitemap.ts` KO/EN/JA URL 연결은 주작업장에서 수행.
3. 최신 프로젝트에 존재하는 067/068 실제 UI/DOM/CSS와 069 경계 재대조.
4. 실제 PC/mobile, KO/EN/JA, light/dark, 일본어 긴 라벨 overflow 확인.
5. Playwright preflight→core→feature→boundary→regression→limit 실행.
6. 061~068/070+common 최신 통합 regression.
7. 전체 TypeScript / production build / console/runtime / 통합 FINAL.
8. 배포 후 canonical/hreflang/sitemap/robots/Search Console/색인.
