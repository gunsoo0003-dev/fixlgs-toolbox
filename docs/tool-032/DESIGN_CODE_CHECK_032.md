# TOOL 032 DESIGN CODE CHECK

- MAIN: TOOL 027 PDF 이미지 변환기
- SUB: TOOL 026 이미지 PDF 변환기
- selection reason: supplied project contains integrated PDF tool implementation through 027; 028~031 implementations are absent, so no nonexistent design was guessed or copied.

## transplanted common grammar
- `ToolboxSubpageShell` and common detail hero/content sections
- official `--tb-*`/`--blue` token family inherited in local module
- upload/dropzone -> work panels -> result -> NEXT WORK -> HOW TO/use cases/expert/caution/FAQ/related order
- 18px-ish panels, line/radius/spacing grammar, pill actions, responsive stacking

## 032 functional specialization
- signature creation panel
- PDF page preview with visual overlay
- drag/resize + 3x3 position fallback
- page-scope controls and verified result
All specialization is scoped to `components/pdf-signature-tool.module.css`.

## protection judgement
- no `app/globals.css` or `styles/*.css` mutation
- no `legacy-site-sealed.css` / `legacy-tools-sealed.css` selector copied or extended
- no tool-number global override
- protected baseline current recheck: 21/21 identical

Sub-workshop judgement: DESIGN-CODE PASS. Actual PC/mobile/KO/EN/JA/light/dark browser rendering remains main-workshop integrated runtime verification under the current top-level instruction.
