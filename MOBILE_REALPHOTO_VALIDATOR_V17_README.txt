FIXLGS TOOLBOX MOBILE REALPHOTO VALIDATOR V17
Date: 2026-08-13

Scope: validator/harness only. Product source is not modified.
Base: V16 real-device result TOOLBOX_MOBILE_REALPHOTO_001_024_20260813060830.zip.

V17 changes from the V16 real-device evidence
1. Android Download observation fixed.
   - V16 called adb shell sh -c with the shell program split into arguments. On the tested Windows/adb path this could produce empty Download snapshots.
   - V17 sends the complete remote loop directly to adb shell and stores command status/stdout/stderr/observed dirs as diagnostic evidence.
   - /sdcard and /storage/emulated/0 aliases are canonicalized to avoid duplicate file entries.

2. Chrome duplicate-download confirmation is handled as a real user step.
   - If Chrome displays the native "파일을 다시 다운로드하시겠습니까?" confirmation, V17 taps ONLY "다시 다운로드".
   - Open/열기 is never tapped. If Open/열기 is observed, it is logged as IGNORED.
   - No downloaded file is opened and no file viewer is entered.

3. Open/열기 was removed from the native picker commit fallback too.
   - Allowed commit actions remain completion/confirmation choices only.

4. Download-stage classification corrected.
   - If product processing/result is ready but download verification fails, W7 RESULT_READY is recorded PASS and only W8 DOWNLOAD_VERIFY fails.
   - These cases no longer inflate BLOCKED_STEPS with W7/W8 as if result generation never happened.

5. TOOL003 input policy detection corrected.
   - The visible "지원하지 않거나 손상된 파일입니다" message is detected even when it is not role=alert.
   - Camera JPG rejection is INPUT_NOT_APPLICABLE for TOOL003, whose test-source policy is SVG/BMP/TIFF.

6. TOOL005 real user branch added.
   - If the target-size workflow reaches data-status=unreached and the UI offers "현재 결과 사용", V17 presses that user-visible choice and continues to actual download verification.
   - This is not a rescue bypass; it follows the product's displayed user path.

7. TOOL023 upload control corrected.
   - V16 clicked the whole dropzone DIV and the native picker did not open.
   - V17 explicitly clicks the visible button inside [data-testid="tool023-dropzone"].

8. End-of-run cleanup/termination corrected.
   - Browser context close and Playwright Android device close are both attempted with timeout-protected cleanup logs.
   - After cleanup and result ZIP creation, V17 prints [EXIT] NORMAL and terminates the Node process so PowerShell returns.

9. TOOL015 and TOOL016 remain normal product test targets.
   - No INPUT_NA or size-limit bypass is added.
   - Any repeated limit rejection remains visible as a product result for later product-side analysis.

10. TOOL018 remains TOOL018_SPECIAL_FAIL when it does not pass.

Expected terminal end
[CLEANUP] BROWSER_CONTEXT_CLOSE ...
[CLEANUP] ANDROID_DEVICE_CLOSE ...
[CLEANUP] COMPLETE
RESULT ZIP TARGET: ...
[ARCHIVE] PASS ...
[EXIT] NORMAL code=...
PowerShell prompt returns.

Run
cd C:\Users\Administrator\Desktop\WebProjects\fixlgs-toolbox
node .\scripts\check-mobile-real-photo-validator.mjs
node .\scripts\run-mobile-real-photo-001-024.mjs

Real-device status
- Static/package self-check can be run before overlay.
- Android real-device verification is still required. Do not claim PASS before that run.
