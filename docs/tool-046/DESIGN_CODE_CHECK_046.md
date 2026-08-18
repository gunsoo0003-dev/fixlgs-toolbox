# TOOL046 DESIGN-CODE CHECK

- Target: WEB TOOL 046 날짜 더하기·빼기 계산기
- MAIN requested by production brief: TOOL045 날짜 차이 계산기.
- Availability note: supplied project ZIP is TOOL041 next-project baseline and does not contain TOOL045 implementation files. Therefore TOOL045 *actual code* could not be physically diffed in this work copy. This is not marked PASS; it is handed to main-workspace integration verification.
- Fallback structural reference used for dedicated-file conventions only: TOOL040 recent completed component/page/module pattern.
- Dedicated styling only: `components/date-add-subtract-calculator-tool.module.css`.
- Global CSS edits: NONE.
- `styles/*` global edits: NONE.
- legacy sealed direct use: NONE.
- Primary action: black background / white text dedicated class, matching current completed-tool visual convention.
- Mobile code: 1-column input grid at <=720px; 44px minimum action controls; no fixed-width controls.
- Locale strings: KO/EN/JA included in dedicated component/page.
- Main-workspace required visual check: TOOL045 actual page/DOM/CSS/state versus TOOL046 after integration, PC/mobile, KO/EN/JA, light/dark.
