# TOOL 034 DESIGN-CODE CHECK

MAIN: TOOL029 — single-PDF upload → file/status area → work panel → result flow.
SUB: TOOL018 — metadata information/editor concept only.

PASS evidence:
- Reuses official common page classes for hero/body/NEXT WORK/HOW TO/PRACTICAL GUIDE/IMPORTANT NOTES/FAQ.
- TOOL034-specific Password/Metadata tabs, security status cards, password fields and metadata editor are isolated in `pdf-password-metadata-tool.module.css`.
- No `app/globals.css` or `styles/*.css` edits.
- No legacy sealed selector import/copy/extension.
- No `!important`.
- Desktop 2-column work area collapses to 1 column; metadata label/value rows collapse vertically on mobile.
- Japanese long labels are not forced with nowrap/min-width.

Real browser visual verdict: MAIN WORKSPACE INTEGRATED VALIDATION.
