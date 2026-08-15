import fs from "node:fs";

const files = [
  "components/pdf-signature-tool.tsx",
  "components/pdf-signature-page.tsx",
  "components/pdf-signature-tool.module.css",
  "lib/tool-032-pdf-signature.ts",
  "app/[locale]/pdf-signature/page.tsx",
];
let fail = 0;
const need = (ok, msg) => { console.log(ok ? "PASS" : "FAIL", msg); if (!ok) fail += 1; };
for (const f of files) need(fs.existsSync(f), `exists ${f}`);
const src = files.filter(fs.existsSync).map((f) => fs.readFileSync(f, "utf8")).join("\n");
for (const token of [
  "pdf-signature", "tool032-root", "tool032-file-input", "tool032-draw-canvas", "tool032-signature-input",
  "tool032-signature-overlay", "tool032-preview-scope-state", "previewPageApplied", "tool032-file-info", "workspaceDragging", "pdf-replace", "tool032-create", "tool032-result", "tool032-download", "pdf-lib", "pdfjs-dist/webpack.mjs",
  "parseTool032PageRange", "visibleBoxToPdfBox", "applyTool032Signature", "image/png", "image/jpeg", "image/webp",
  "current", "all", "odd", "even", "custom", "-15", "+15", "FAQPage", "BreadcrumbList", "EXPERT POST"
]) need(src.includes(token), `source token ${token}`);

const component = fs.existsSync("components/pdf-signature-tool.tsx") ? fs.readFileSync("components/pdf-signature-tool.tsx", "utf8") : "";
need(component.includes("const toBlobPart = (bytes: Uint8Array): ArrayBuffer"), "BlobPart uses explicit ArrayBuffer boundary");
need(component.includes("new Blob([toBlobPart(output.bytes)]"), "PDF output Blob uses safe ArrayBuffer part");
need(/\}, \[mode, file, pageMeta\.length\]\);/.test(component), "draw canvas setup reruns after PDF workspace mounts");
need(component.includes("function ensureDrawCanvasSize(canvas: HTMLCanvasElement)"), "draw canvas has synchronous size guard");
need(component.includes("if (!ensureDrawCanvasSize(e.currentTarget)) return;"), "pointer down synchronously sizes draw canvas");
need(component.includes("drawPoint(e, false); activeDrawPointerRef.current = null;"), "pointer up commits final draw point before export");
need(component.includes("void exportDrawing(e.currentTarget);"), "pointer up exports from captured draw canvas");

for (const forbidden of ["fetch(", "axios", "firebase", "supabase", "openai", "uploadToServer", "PKI signing"]) {
  need(!src.toLowerCase().includes(forbidden.toLowerCase()), `no forbidden backend/claim token ${forbidden}`);
}
need(!/canvas\.toDataURL\([^)]*application\/pdf|page\.drawPage\(/i.test(src), "no whole-page rasterized PDF writer path");
for (const f of ["app/globals.css", "styles/global-base.css", "styles/toolbox-common.css", "styles/toolbox-detail-common.css", "styles/theme.css", "styles/toolbox-compat.css", "styles/legacy-site-sealed.css", "styles/legacy-tools-sealed.css"]) {
  if (!fs.existsSync(f)) continue;
  const s = fs.readFileSync(f, "utf8");
  need(!/tool0?32|pdf-signature/i.test(s), `no common CSS contamination ${f}`);
}
process.exitCode = fail ? 1 : 0;
