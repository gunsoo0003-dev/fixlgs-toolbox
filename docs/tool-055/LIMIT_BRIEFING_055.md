# TOOL055 SERVICE LIMIT BRIEFING

- Input absolute value: `1e15` maximum.
- Display precision: `0..8` decimal digits maximum.
- Common-unit simultaneous results: maximum `6`.
- Negative general measurement values: rejected.
- Zero: accepted.
- NaN / Infinity / empty invalid input: calculation blocked.

The limits follow the production handoff. They are centralized in `TOOL055_LIMITS` and referenced by UI/logic/checker expectations. No attempt is made to search for a technical browser maximum because TOOL055 is CPU/memory-light and the service limit is a readability/numeric-safety boundary.
