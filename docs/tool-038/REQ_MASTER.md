# TOOL 038 REQ MASTER

- REQ-001 PASS: 5 modes implemented in `lib/tool-038-case.ts` and exposed in the UI.
- REQ-002 PASS: every mode derives from immutable `source` state; result is never fed back as source.
- REQ-003 PASS: upper/lower use default Unicode `toUpperCase`/`toLowerCase` mapping.
- REQ-004 PASS: title mode treats whitespace, hyphen and apostrophe as sub-word separators.
- REQ-005 PASS: sentence mode lowercases first, then capitalizes after start/newline/`.!?。！？`.
- REQ-006 PASS: first mode changes only the first cased character.
- REQ-007 PASS: no normalization/trim/whitespace cleanup is performed.
- REQ-008 PASS: KO/EN/JA UI copy and mixed-language fixtures prepared.
- REQ-009 PASS: explicit textarea labels, keyboard buttons, aria-pressed and aria-live copy status.
- REQ-010 PASS: sentence/title limitations are visible in UI content.
- REQ-011 PASS: browser-local implementation; no API/server/analytics payload containing source/result.
- REQ-012 PASS: dedicated module CSS only; no common or sealed CSS modification in patch scope.
- REQ-013 PASS: canonical/hreflang metadata prepared on dedicated locale route.
- REQ-014 PASS: Unicode/emoji/CRLF/TAB/punctuation/hyphen/apostrophe fixtures prepared.
- REQ-015 N/A: pixel verification; tool 038 is not a pixel-output tool.
- REQ-016 HANDOFF: service text limit remains unapproved by user; limit UI/checker/final are intentionally not hard-coded.
- REQ-017 HANDOFF: site/category card, sitemap, and package scripts are common integration files and remain protected.
- REQ-018 HANDOFF: 036/037 actual source code was not present in the supplied 034 archive; common shell/style was used without inventing global changes.
