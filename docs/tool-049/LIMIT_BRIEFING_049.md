# TOOL049 SERVICE LIMIT BRIEFING

- Employment periods: **30 total** (the primary employment period plus up to 29 added rows).
- Date technical range: Gregorian year **0001..9999**.
- Reversed range: rejected; never auto-swapped.
- Overlapping ranges: allowed and summed as entered; not automatically de-duplicated.
- Cumulative calculation: exact elapsed days are summed first. The Y/M/D total is deterministically re-expressed against a fixed Gregorian anchor; no floating-point average month/year conversion is used.
- This is a lightweight local calculator. The 30-row cap is a UX/service cap, not a CPU or memory ceiling.
- Main workspace must keep product copy, tests, and any public FAQ/limit constant synchronized if the production limit is changed.
