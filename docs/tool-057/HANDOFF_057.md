# HANDOFF — TOOL057 속도·연비·에너지 변환기

- 도구번호: 057
- 카테고리: G. 단위·일반 계산기
- slug: `speed-fuel-energy-converter`
- 예상 URL: `/ko|en|ja/speed-fuel-energy-converter`
- 보조작업장 상태: READY (static/component package)
- 전체 TOOLBOX FINAL: 미확정 — 주작업장 통합 FINAL 필요

## 구현 완료
- Speed: km/h, mph, m/s, knot, ft/s. m/s canonical factor engine.
- Fuel economy: km/L, L/100km, MPG(US), MPG(UK). reciprocal engine.
- Energy: J, kJ, MJ, Wh, kWh, cal, kcal, BTU. J canonical.
- Power: W, kW, MW, hp, PS, BTU/h. W canonical.
- 대표 결과 최대 6, quick unit, swap, precision(0~8), copy, reset.
- fuel >0, 일반 음수 차단, abs input 1e15 상한.
- kW/kWh 분리, hp/PS 분리, US/UK MPG 분리 안내.
- KO/EN/JA, local-processing 안내, canonical/hreflang, WebApplication JSON-LD.

## MAIN 디자인 기준
- TOOL055 길이·면적·부피 변환기.
- 공통 shell/정보섹션 class 재사용, 기능 고유 UI는 TOOL057 module.css에 한정.

## 공통파일 보호
원본 ZIP 대비 SHA 동일 확인:
`app/globals.css`, 공식 styles 전역 7종, `lib/site.ts`, `app/sitemap.ts` 모두 무변경.
신규 패키지/OSS 추가 없음. `package.json`, lockfile 수정 없음.

## 전용 이식 파일
1. `lib/tool-057-units.ts`
2. `components/tool-057-speed-fuel-energy-converter.tsx`
3. `components/tool-057-speed-fuel-energy-converter.module.css`
4. `components/tool-057-speed-fuel-energy-converter-page.tsx`
5. `app/[locale]/speed-fuel-energy-converter/page.tsx`

## 전용 검수자료
- `scripts/tool-057/check-source.mjs`
- `scripts/tool-057/check-design.mjs`
- `scripts/tool-057/check-harness.mjs`
- `scripts/tool-057/check-logic.mjs`
- `scripts/tool-057/run-static-validation.mjs`
- `tests/tool-057-preflight.spec.ts`
- `tests/tool-057-core.spec.ts`
- `tests/tool-057-feature.spec.ts`
- `tests/tool-057-fuel.spec.ts`
- `tests/tool-057-power.spec.ts`
- `tests/tool-057-energy.spec.ts`
- `tests/tool-057-dimension.spec.ts`
- `tests/tool-057-boundary.spec.ts`
- `tests/tool-057-regression.spec.ts`
- `tests/tool-057-limit.spec.ts`
- `tests/fixtures/tool-057/cases.json`

## 실행 결과
- SOURCE 34/34 PASS
- DESIGN-CODE 26/26 PASS
- HARNESS-STRUCTURE 15/15 PASS
- LOGIC/BOUNDARY/ROUNDTRIP 24/24 PASS
- 첫 source checker에서 동적 탭 ID/MPG 위치 오판 5건을 HARNESS_ERROR로 분리. 제품 수정 없이 checker만 보정 후 FAIL 0.

## 주작업장 통합작업/검증
1. `lib/site.ts` TOOL057 slug/title/category card 등록.
2. `app/sitemap.ts` KO/EN/JA URL 등록.
3. 최신 통합본에서 actual browser PC/mobile, KO/EN/JA, light/dark, JA overflow.
4. 실제 Playwright preflight/core/feature/fuel/power/energy/dimension/boundary/regression/limit.
5. production build, 전체 common regression, console/runtime.
6. 배포, Search Console URL 검사/색인 요청.

현재 사본은 node_modules 부재로 Next/React dependency type 해석과 production build를 보조작업장에서 최종 판정하지 않음.
