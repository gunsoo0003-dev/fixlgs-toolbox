# TOOL042 REQ MASTER

| ID | Requirement | Evidence / target | Status |
|---|---|---|---|
| REQ-042-001 | 4 fixed functions are present | single replace, case policy, multi-rule simultaneous replace, counts | PASS |
| REQ-042-002 | Matching is literal, not regex | engine uses string search, no RegExp from user input | PASS |
| REQ-042-003 | Multi-rule replacement uses original source | candidate collection precedes reconstruction | PASS |
| REQ-042-004 | Overlap rule is fixed | longest match, then earlier rule | PASS |
| REQ-042-005 | Duplicate find collision is blocked | validation uses selected case policy | PASS |
| REQ-042-006 | Empty replacement is allowed | replacement string may be empty | PASS |
| REQ-042-007 | Total and per-rule counts are exposed | result model and UI badges | PASS |
| REQ-042-008 | Original text is not overwritten | separate read-only result | PASS |
| REQ-042-009 | Browser-local handling | File.text / clipboard only; no server/API code | PASS |
| REQ-042-010 | KO/EN/JA labels and FAQ exist | locale-specific page copy | PASS |
| REQ-042-011 | Approved service limits are synchronized | 1,000,000 / 100 / 1,000 / 10,000 / 5,000,000 | PASS |
| REQ-042-012 | Common CSS and legacy sealed areas remain protected | static protection checker | PASS |

Final re-entry required after any DOM/testid/UI-string change during design review.
