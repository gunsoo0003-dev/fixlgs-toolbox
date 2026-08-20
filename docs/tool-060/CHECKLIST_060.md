# TOOL060 EVIDENCE CHECKLIST

| Check | Method | Evidence | Status |
|---|---|---|---|
| source files present | static checker | `STATIC_VALIDATION_RECHECK_060.txt` | PASS |
| shoe/clothing registries separated | source inspection | `lib/tool-060-sizes.ts` | PASS |
| men/women/kids separated | source inspection | `TOOL060_SHOES`, `TOOL060_CLOTHING` | PASS |
| tops/bottoms separated | source inspection | clothing registry | PASS |
| five systems | checker | KR/US/UK/EU/JP | PASS |
| foot-length reference | code/fixture | `footLengthMm` | PASS |
| chest/bust/waist/hip | code/fixture | measurement ranges | PASS |
| child/adult isolation | code/fixture | independent kids rows | PASS |
| brand warning | UI source | result warning | PASS |
| copy/reset/full table | UI source | selectors and handlers | PASS |
| KO/EN/JA | source inspection | localized copy | PASS |
| canonical/hreflang | route source | page metadata | PASS |
| common CSS protection | baseline byte comparison | `COMMON_PROTECTION_DIFF_060.txt` | PASS |
| HARNESS structure | static checker | `STATIC_VALIDATION_RECHECK_060.txt` | PASS |
| Playwright/runtime/build | dependencies unavailable in isolated package | handoff | MAIN WORKSPACE INTEGRATION |
| production table provenance | brief lacks full numeric source tables | REQ master | DATA VERIFY REQUIRED |
