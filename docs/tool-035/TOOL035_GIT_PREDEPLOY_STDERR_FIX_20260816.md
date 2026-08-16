# TOOL035 Git pre-deploy PowerShell 5 stderr fix — 2026-08-16

- Source result: TOOL035_GIT_PREDEPLOY_20260816_110419.zip
- Root cause: Windows PowerShell 5.1 with `$ErrorActionPreference = 'Stop'` promoted Git LF→CRLF stderr warnings into terminating errors, so successful `git diff` commands were falsely recorded as EXIT_CODE=999.
- Fix: execute Git through `Start-Process -Wait -PassThru` with stdout/stderr redirected separately.
- Contract: only the real native Git process exit code determines PASS/FAIL. stderr is always preserved in terminal/TXT but warnings do not fail a command when exit code is 0.
- No staging, commit, push, or product-code change is performed by this fix.
