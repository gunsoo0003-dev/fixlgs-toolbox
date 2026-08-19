# TOOL057 CHANGE MAP

## 신규 이식 파일
- `lib/tool-057-units.ts`
- `components/tool-057-speed-fuel-energy-converter.tsx`
- `components/tool-057-speed-fuel-energy-converter.module.css`
- `components/tool-057-speed-fuel-energy-converter-page.tsx`
- `app/[locale]/speed-fuel-energy-converter/page.tsx`

## 신규 검수 자료
- `scripts/tool-057/*`
- `tests/tool-057-*.spec.ts`
- `tests/fixtures/tool-057/cases.json`
- `docs/tool-057/*`

## 주작업장 연결 필요
- `lib/site.ts`: TOOL057 slug/title/category card LIVE 등록.
- `app/sitemap.ts`: KO/EN/JA URL 등록.
- 필요 시 category route의 057 카드 연결.
- package.json script는 보조작업장에서 공통파일 보호를 위해 수정하지 않음. 원하면 주작업장에서 057 checker script 연결.
