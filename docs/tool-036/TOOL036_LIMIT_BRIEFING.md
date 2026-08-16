# TOOL036 Service Limit Briefing — APPROVED

- Competitor public hard limit: no consistently verified common hard character limit in the production handoff research.
- Previous TOOL036 product hard limit: none in the auxiliary implementation.
- Candidate A: 300,000 grapheme characters — recommended for general-user sufficiency and mobile / Japanese segmentation stability.
- Candidate B: 500,000 grapheme characters — broader long-document use, with higher segmentation/mobile load risk.
- User decision: APPROVED recommended Candidate A on 2026-08-15.
- Final service limit: **300,000 Unicode grapheme clusters**.
- Product behavior: accept through exactly 300,000 graphemes; when input exceeds the limit, keep only the first 300,000 graphemes and show a localized explicit limit message.
- Synchronization target: PRODUCT / UI / boundary / limit checker / HANDOFF all use 300,000 as the approved value.
- Main workspace still performs actual browser/mobile load verification before integrated FINAL.
