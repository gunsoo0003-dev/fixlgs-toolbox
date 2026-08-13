FIXLGS TOOLBOX MOBILE REALPHOTO VALIDATOR V16
Date: 2026-08-13

Scope: validator/harness only. Product source is not modified.

V16 changes
1. TOOL start-state recovery: restore Chrome foreground and close leftover native picker/viewer states before each TOOL.
2. Picker runtime-state handling: fixed user route remains Media -> Gallery -> Camera -> first photo, while direct-restored Gallery/Camera states are proven rather than misclassified.
3. Visible upload controls mapped from actual source for TOOL013/014/015/017/020.
4. Multi-image tools continue to select the same Camera first photo repeatedly.
5. Immediate small scroll after each photo return; no fixed 5-second wait.
6. Download verification rewritten: click only the product download control; never click Open and never enter a file viewer. Compare Android Download snapshots by size/mtime/ctime/inode and store before/after evidence.
7. If Android storage cannot prove a download, classify as HARNESS_DOWNLOAD_FILE_NOT_OBSERVED instead of false PRODUCT_FAIL. Product alerts/disabled product controls remain PRODUCT_FAIL.
8. Failure continuation: current TOOL records dependency-unreachable downstream steps as BLOCKED; runner continues to the next TOOL.
9. Retest: only first-pass PRODUCT_FAIL gets one independent retest. A retest HARNESS_FAIL never overwrites the original PRODUCT_FAIL.
10. TOOL016 remains a normal product test target. No INPUT_NA/limit bypass was added.
11. TOOL018 remains separately classified as TOOL018_SPECIAL_FAIL.
12. End-of-run result ZIP is created automatically on Desktop and its path is printed. Archive failure is separate and does not erase test results.
13. Result summary adds BLOCKED step count and retest note.

Real-device status
- Static/source-map self-check only in this package.
- Real Android device verification is still required.
