# TOOL065 SERVICE LIMIT BRIEFING

- Numerator: maximum 100 digits.
- Denominator: maximum 100 digits.
- Input string: maximum 120 characters.
- Decimal display precision: maximum 12 places.
- Mixed whole/numerator/denominator: normalized into the same 100-digit rational policy.
- Scientific notation: excluded.
- Repeating decimal exact notation: excluded; display precision only.

Rationale: this is a browser-local general calculator. 100-digit rational operands are already far beyond ordinary user needs while avoiding unbounded BigInt growth. The UI, parser, fixture and static checker use the same declared candidate values, while fixture expected values remain independently recorded.
