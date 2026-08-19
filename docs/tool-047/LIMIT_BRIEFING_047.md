# TOOL047 LIMIT BRIEFING

Service-valid date range: 1900-01-01 through 2100-12-31.
Custom milestone: 1 through 10,000 days.
Event name: 0 through 80 characters.

Boundary policy:
- Inputs outside the supported date range are invalid.
- Milestones whose resulting date would exceed the supported date range are shown as outside service range instead of fabricating a date.
- February 29 anniversary dates are preserved only in valid leap years; non-leap years are not silently substituted.
