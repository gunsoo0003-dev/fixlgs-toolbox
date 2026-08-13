TOOL016 INPUT PIPELINE DIAG V3

Purpose
- Diagnose exactly where the selected Android image dimensions/size change.
- Product limits and TOOL016 logic are NOT changed by this patch.
- TOOL001 golden mobile capture algorithm is not altered; diagnostics are attached only when the input is inside [data-testid="tool016-root"].

Recorded checkpoints
1. PICKER_FILE_RECEIVED: native File name/size/type/lastModified (File has no width/height metadata).
2. BITMAP_DECODED: createImageBitmap(first) width/height.
3. CANVAS_SIZED: canvas width/height used for the app-owned snapshot.
4. OWNED_FILE_CREATED: generated app-owned File name/size/type.
5. OWNED_FILE_REDECODED: createImageBitmap(owned) width/height.

Output
- Fixed on-screen overlay: [TOOL016 INPUT PIPELINE DIAG]
- window.__tool016PipelineDiag
- localStorage key: TOOL016_PIPELINE_DIAG

Interpretation
- BITMAP_DECODED already 3024x4032 => dimensions are already that size at provider/browser decode; canvas is not enlarging it.
- BITMAP_DECODED 1536x2048 but OWNED_FILE_REDECODED 3024x4032 => conversion/canvas stage is changing dimensions.
- All checkpoints 1536x2048 but TOOL016 later reports 3024x4032 => downstream TOOL016 read/validation is wrong.
