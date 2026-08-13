V12 PHOTO GRID FIX

- Gallery/Recents navigation unchanged.
- Photo-grid selection now prefers proven repeated cells, then restricts geometric fallback to RecyclerView/GridView/scrollable collection descendants.
- 4th photo is chosen row-major only inside that proven collection.
- After tapping slot 1 the harness requires an actual Android UI change or browser return; dead taps are HARNESS_FAIL with XML/JSON/PNG artifacts.
- Product code is not modified.
