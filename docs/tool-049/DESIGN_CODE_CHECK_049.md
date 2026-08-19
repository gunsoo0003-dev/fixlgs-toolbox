# TOOL049 DESIGN-CODE CHECK

- Target: TOOL049 근속·재직기간 계산기.
- MAIN: TOOL045 날짜 차이 계산기.
  - Reused design language: LOCAL notice, blue-outline workspace, date-card fields, explicit toggle, result cards, <=720px one-column date layout, black/white action hierarchy.
- SUB: TOOL046 날짜 더하기·빼기 계산기.
  - Referenced: calculate/reset/copy action structure, native date inputs, responsive action rows.
- Functional specialization retained: multi-employment rows and cumulative total are TOOL049-only and isolated in dedicated module CSS.
- Official common classes used by page: detail hero/body, next-work/related, how-to guide, format/expert guide, info band, FAQ.
- Dedicated CSS: `components/employment-tenure-calculator-tool.module.css`.
- `app/globals.css` edits: NONE.
- `styles/*` global edits: NONE.
- `legacy-site-sealed.css` / `legacy-tools-sealed.css` direct use: NONE.
- Global TOOL049 selector scan: 0 hits in protected styles.
- Mobile source contract: date grid -> one column; action row responsive; result text overflow-safe; controls >=44px.
- KO/EN/JA strings are contained in dedicated source; Japanese title remains in common hero title structure.
- Actual browser PC/mobile/light/dark/font/overflow visual validation: MAIN-WORKSPACE INTEGRATION under current top-level auxiliary instructions.
