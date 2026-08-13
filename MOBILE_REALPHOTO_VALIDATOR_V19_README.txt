FIXLGS TOOLBOX MOBILE REAL PHOTO VALIDATOR V19
Date: 2026-08-13

Scope: validator-only patch. Product code is not modified.

V19 changes
1) TOOL005
- Keep the real user flow: Target not reached -> Use current result -> download.
- After accepting the current result, first try the real per-file Download action.
- If that product action is not exposed but the product's own ZIP download is enabled, use that product download as a verification fallback.
- No synthetic file injection and no product bypass.

2) TOOL015 / TOOL016 diagnostics
- Arm a capture-phase listener before opening Android picker.
- Record native input File metadata synchronously before StableMobileImageFileInput clears/replaces input.files.
- Metadata only: name/size/type/lastModified. The validator does NOT read file bytes, so it does not compete with the product's Android provider read.
- Query Android MediaStore by the captured display name for width/height/size when Android permits it.
- Record product service-limit data attributes, visible image/canvas dimensions, and limit/error text.
- Save diagnostics both immediately after browser return and again after ATTACH failure.
- Product verdict is unchanged: failures remain PRODUCT_FAIL.

3) TOOL013
- V18 behavior is preserved. No new changes to its working download confirmation flow.

Recommended focused run
node .\\scripts\\run-mobile-real-photo-001-024.mjs --only 5
node .\\scripts\\run-mobile-real-photo-001-024.mjs --only 15
node .\\scripts\\run-mobile-real-photo-001-024.mjs --only 16

Then run 001-024 once after focused cases are clean.
