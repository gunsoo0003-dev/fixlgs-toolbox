# TOOL054 FAILURE RESPONSE MAP

- Wrong elapsed/remaining value: inspect `lib/tool-054-timer-stopwatch.ts` and monotonic anchor/base state before touching UI.
- Selector/spec mismatch while product behavior is correct: classify HARNESS_ERROR and fix TOOL054-only test/checker files.
- Fullscreen/audio blocked by browser policy: visual state must remain correct; classify platform/runtime behavior before product change.
- Common layout/category/sitemap integration issue: do not modify protected common files in auxiliary package; hand off exact integration point.
- 051/052/053 regression issue in latest main project: main-workshop integrated regression; do not back-port guesses into this snapshot.
- CSS mismatch requiring global selector change: record as common-change candidate; do not alter protected global or sealed CSS.
