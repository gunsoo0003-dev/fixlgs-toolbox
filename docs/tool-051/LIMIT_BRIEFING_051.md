# TOOL051 LIMIT BRIEFING
- Clock time: 00:00:00 ~ 23:59:59
- Duration: 0:00:00 ~ 999:59:59
- Internal unit: integer total seconds
- Clock arithmetic result: normalized to 24-hour clock plus signed dayOffset
- Duration result: may exceed 24 hours when the input model allows it
- UI/helper/checker source of truth: TOOL051_LIMITS.maxDurationHours = 999
