# TOOL060 DESIGN CODE CHECK

- MAIN reference: TOOL058 (latest available G-category converter in supplied baseline)
- SUB reference: TOOL055~057 common information-section pattern only
- Common shell reused: `toolbox-tool-detail-*`, `toolbox-next-work`, `toolbox-tool-guide`, `toolbox-tool-format-guide`, `toolbox-tool-info-band`, `toolbox-tool-faq`
- Tool-specific UI: `components/tool-060-shoe-clothing-size-converter.module.css`
- Global CSS edits: NONE
- legacy sealed direct use: NONE
- New global selectors: NONE
- Responsive code: 820px / 520px breakpoints; five-country results become vertical cards
- Japanese long-label handling: buttons allow wrapping; result cards avoid horizontal scrolling
- DESIGN-CODE CHECK 1: PASS
- DESIGN-CODE CHECK 2: PASS (static code scope)
- Actual browser rendering/light-dark/KO-EN-JA viewport confirmation: MAIN WORKSPACE INTEGRATION
