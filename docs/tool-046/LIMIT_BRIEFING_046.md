# TOOL046 SERVICE LIMIT BRIEFING

Candidate only; final service limit remains main-workspace approval gate.

- Date input candidate: `0001-01-01` through `9999-12-31`.
- Quantity candidate: integer `0..100000`.
- Negative quantity: rejected; direction is represented only by Add/Subtract.
- Decimal quantity: rejected.
- Unit semantics: day=calendar day, week=7 calendar days, month=calendar month with end-of-month clamp, year=calendar year with leap-day clamp.
- Extreme out-of-range resulting year: rejected.

Rationale: arithmetic is lightweight and local; the candidate prevents meaningless extremely large inputs while covering ordinary use by a wide margin. Main workspace must decide the production-facing limit and synchronize product/UI/checker/FAQ if changed.
