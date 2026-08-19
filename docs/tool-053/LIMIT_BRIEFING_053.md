# TOOL053 LIMIT BRIEFING
- Numeric timestamp values are accepted only as safe integers.
- Internal canonical unit: integer milliseconds.
- JavaScript Date absolute boundary constant: ±8,640,000,000,000,000 ms.
- Seconds input is multiplied by 1000 and must remain a safe integer and inside the same millisecond boundary.
- Decimal timestamps are excluded from v1.
- Negative timestamps are valid inside the supported range.
- 10/13 digits are warning heuristics only; explicit unit is never overridden.
- Overflow behavior: no forced conversion; show supported-range error.
