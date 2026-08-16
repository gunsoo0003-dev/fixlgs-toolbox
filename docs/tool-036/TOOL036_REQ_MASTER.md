# TOOL036 REQ MASTER

| ID | Requirement | Implementation / evidence | Status |
|---|---|---|---|
| R036-001 | Preserve all 8 core statistics | tool component + helper selectors | PASS |
| R036-002 | Real-time calculation without Calculate button | 120ms debounce effect | PASS |
| R036-003 | Grapheme-based character count | `countTool036Graphemes` / Intl.Segmenter | PASS |
| R036-004 | Unicode White_Space excluded count | `stripTool036UnicodeWhitespace` | PASS |
| R036-005 | Locale-aware word segmentation | Intl.Segmenter word + isWordLike | PASS |
| R036-006 | Locale-aware sentence segmentation | Intl.Segmenter sentence | PASS |
| R036-007 | Paragraphs separated by blank line(s) | `countTool036ParagraphsPortable` | PASS |
| R036-008 | Empty input line count 0; real line breaks counted | `countTool036Lines` | PASS |
| R036-009 | UTF-8 bytes | TextEncoder | PASS |
| R036-010 | Reading time 150/200/250 WPM | presets + seconds calculation | PASS |
| R036-011 | Character and word goals default OFF | details/options + goal toggle | PASS |
| R036-012 | Remaining/over amount is text, not color-only | goal state text | PASS |
| R036-013 | Copy statistics | Clipboard output with 8 metrics | PASS |
| R036-014 | Clear all | resets text/statistics/goals/WPM/status | PASS |
| R036-015 | Sample text | localized sample button | PASS |
| R036-016 | KO/EN/JA UI | localized component/page copy | PASS |
| R036-017 | Japanese no-space text must not count as one word | functional fixture check | PASS |
| R036-018 | Emoji / combining / ZWJ grapheme fixture | functional fixture check | PASS |
| R036-019 | IME should not rewrite text/cursor | composition hooks, no text normalization | PASS |
| R036-020 | Browser-local; no original text upload/storage/Analytics | no fetch/API/storage code in tool | PASS |
| R036-021 | Large textarea + 3 core cards + compact secondary grid | dedicated module CSS | PASS |
| R036-022 | Advanced options collapsed by default | native details without open attribute | PASS |
| R036-023 | Mobile single-column main flow / Japanese wrapping | module breakpoints, no nowrap metric labels | PASS (CODE) |
| R036-024 | Light/dark via common theme variables | module uses `--tb-*` and `--blue` | PASS (CODE) |
| R036-025 | SEO title/description/canonical/hreflang | dedicated route page | PASS |
| R036-026 | WebApplication/FAQPage/BreadcrumbList | page JSON-LD | PASS |
| R036-027 | Related 037/038/042 only when routes actually exist | 037/038/042 currently disabled placeholders | PASS |
| R036-028 | Common CSS / existing tools protected | hash checker + no global edits | PASS |
| R036-029 | Service limit approved and synchronized | Candidate A 300k approved; product/UI/boundary/limit checker synchronized | PASS |
| R036-030 | Actual browser/Playwright/build/integration FINAL | main workspace per latest auxiliary rule | MAIN WORKSPACE |
