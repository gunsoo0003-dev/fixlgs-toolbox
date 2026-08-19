# TOOL050 REQ MASTER

- REQ-050-F01: Saturday/Sunday are excluded from business days.
- REQ-050-F02: Public holidays can be excluded; holiday inclusion mode excludes weekends only.
- REQ-050-F03: Between-dates mode calculates business days with inclusive start/end policy.
- REQ-050-F04: Target-date mode calculates N business days after/before a base date; N=0 returns base date.
- REQ-050-F05: Korea, United States, Japan holiday datasets are selectable and immediately recomputed.
- REQ-050-C01: Result shows business days, total calendar days, excluded weekends, excluded holidays.
- REQ-050-C02: Excluded holiday date/name list is available when exclusions occur.
- REQ-050-C03: Custom holiday input is optional, normalized/deduplicated, capped at 200.
- REQ-050-C04: Maximum calculation range is 20 years.
- REQ-050-C05: Holiday dataset coverage is disclosed; unsupported years are not claimed as fully holiday-accurate.
- REQ-050-U01: Two calculation modes are clearly separated with accessible tab semantics.
- REQ-050-U02: Result summary copy is supported.
- REQ-050-L01: KO/EN/JA UI, metadata, canonical and hreflang are provided.
- REQ-050-S01: Browser-local processing only; no server/API/account requirement.
- REQ-050-S02: No common/global/sealed CSS changes are required.
- REQ-050-Q01: Dedicated preflight/core/feature/holiday/boundary/regression/limit harness structure exists.
