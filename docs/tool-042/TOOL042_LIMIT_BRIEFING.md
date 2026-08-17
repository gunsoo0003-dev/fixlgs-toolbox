# TOOL042 LIMIT BRIEFING

Recommended service-valid limits approved for this work:
- Input: 1,000,000 characters
- Rules: 100
- Find string: 1,000 characters per rule
- Replacement string: 10,000 characters per rule
- Result: 5,000,000 characters

Reasoning:
- The tool is browser-local string processing, so stability and predictable UI response matter more than maximum theoretical capacity.
- 100 rules covers normal bulk replacement use without making the mobile editor unwieldy.
- The 5,000,000-character result guard prevents a short replacement source from expanding into an unexpectedly large browser string.
- The same values are treated as a single contract across implementation, UI guidance, fixtures and limit validation.
