# TOOL057 FAILURE MAP

- 속도 값 오류: `lib/tool-057-units.ts` → speed factor, `tests/fixtures/tool-057/cases.json`.
- 연비 방향/0 오류: `toTool057Canonical`, `fromTool057Canonical`, US/UK gallon factor 확인.
- kW/kWh 혼입: `Tool057Group`, energy/power registry 및 subtab state 확인.
- hp/PS 동일값 오판: power registry factor 확인.
- select/summary 불일치: `TOOL057_DEFAULTS`와 `getTool057Unit` 확인.
- selector mismatch: `components/tool-057-speed-fuel-energy-converter.tsx` data-testid ↔ `scripts/tool-057/check-harness.mjs`.
- 모바일 overflow: 전용 module의 input grid, summary grid, min-width, overflow-wrap 확인.
- route/SEO: `app/[locale]/speed-fuel-energy-converter/page.tsx`.
- category card/sitemap 누락: 공통 보호 대상이므로 주작업장에서 `lib/site.ts`, `app/sitemap.ts` 확인.
