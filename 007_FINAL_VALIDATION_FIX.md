# 007 final validation fix

- Duplicate files are identified by SHA-256 content fingerprint instead of browser-assigned timestamps.
- Duplicate entries are removed before count and total-byte limit checks.
- Safe-limit validation now targets a dedicated `optimizer-safe-limit` element and checks the exact localized text.
- No other tool code was modified.
