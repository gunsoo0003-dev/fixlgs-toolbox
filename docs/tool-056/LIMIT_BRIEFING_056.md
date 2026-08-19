# TOOL056 SERVICE LIMIT BRIEFING

- Input absolute value: `1e15` maximum.
- Display precision: `0..8` decimal digits.
- Kelvin minimum: `0 K`.
- Mass and pressure: zero accepted; negative rejected.
- Temperature: negative values accepted when not below absolute zero.
- NaN / Infinity / empty invalid input: calculation blocked.
- Gauge/absolute pressure correction: outside scope.

The limits follow the production handoff and are centralized in `TOOL056_LIMITS`. This tool is computationally light; the service ceiling is a numeric safety/readability boundary rather than an attempt to find a browser crash limit.
