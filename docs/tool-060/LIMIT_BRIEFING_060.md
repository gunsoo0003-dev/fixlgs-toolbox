# TOOL060 SERVICE LIMIT BRIEFING

TOOL060 is a static lookup tool, not a large-file processor.

- Systems: fixed 5 (KR/US/UK/EU/JP)
- Genders: fixed 3 (men/women/kids)
- Product groups: shoes/tops/bottoms
- Result cards: maximum 5
- Shoe foot-length input: only rows represented in the selected gender registry; no adult fallback for kids
- Clothing measurement lookup: only represented body-measurement ranges; no extrapolation outside table
- Unsupported values: explicit unsupported-range state
- Brand catalog/API: excluded
- Account/cloud storage: excluded

This keeps service limits identical across UI, dataset and checker expectations.
