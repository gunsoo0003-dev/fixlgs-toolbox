# TOOL 037 REQ MASTER

- Tool: 037 텍스트 공백·줄바꿈 정리기 / Text Whitespace & Line Break Cleaner
- Category: E. 텍스트 도구
- Slug: `text-whitespace-linebreak-cleaner`
- Processing: browser-local only; no source/result server transfer or storage
- Fixed functions: collapse repeated U+0020 spaces; trim each line; remove U+0009 TAB; remove blank lines; normalize LF/CRLF line endings
- Pipeline: input EOL -> LF; tabs; trim each line; collapse U+0020 spaces; remove blank lines; emit LF/CRLF
- Non-default transformations forbidden: NBSP U+00A0, full-width space U+3000, zero-width U+200B
- Output: editable result + result copy + UTF-8 `cleaned-text.txt`
- Service limit carried from support handoff: 1,000,000 input characters
- MAIN/SUB design baseline: **TOOL036 actual code** (`character-document-counter`)
- Common global CSS changes: none
- Protected range: 001~036

## TOOL036 design/state inheritance

- Reuse TOOL036 detail hero/body/next-work/how-to/expert/info/FAQ hierarchy.
- Reuse TOOL036 local notice, blue single `activeWorkspace`, initial dropzone, textarea state transition, pill button hierarchy and mobile breakpoints.
- TXT/MD/CSV file input is kept as the TOOL036 text-category input contract.
- File card + editor + options + result/summary stay inside one drag-active workspace; only one drag overlay/state is allowed.
- Loading a new file while work exists uses localized cancel/confirm replacement UI.
- `Clear all` is a complete reset: file, input, output, options, summary, errors, status, pending replacement and drag state.
- TOOL037-specific result and cleanup controls may differ only where required by the transform purpose.

## Main integration

- `lib/site.ts`: TOOL037 slug/title/description, text category second LIVE card, 2 available label, locale href mapping.
- `app/sitemap.ts`: KO/EN/JA TOOL037 entries.
- TOOL036 next-work card links to TOOL037.
- Text category numbering remains 036/037/038 through the category page's 3-digit text numbering rule.
- No `tool037` selector is added to protected global/common/sealed CSS.

## Checker gate

- Static source/harness/design/CSS/localization/logic/main-integration checks must pass before browser FINAL.
- Browser stages: preflight / core / boundary / feature / regression / limit / final.
- First official Windows browser validation is FINAL once after checker self-check; classify failures PRODUCT/CHECKER/ENVIRONMENT before edits.
- Result ZIP/log runner uses the TOOL036 robust runner pattern with bounded timeout and failure evidence preservation.
