import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let ts;
for (const candidate of [
  path.join(process.cwd(), "node_modules", "typescript", "lib", "typescript.js"),
  "/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js",
]) {
  if (fs.existsSync(candidate)) { ts = require(candidate); break; }
}
if (!ts) { console.error("FAIL TypeScript compiler unavailable"); process.exit(1); }
const files = [
  "components/pdf-signature-tool.tsx",
  "components/pdf-signature-page.tsx",
  "lib/tool-032-pdf-signature.ts",
  "app/[locale]/pdf-signature/page.tsx",
  "playwright.tool032.config.ts",
  "tests/tool-032-preflight.spec.ts",
  "tests/tool-032-core.spec.ts",
  "tests/tool-032-boundary.spec.ts", "tests/tool-032-feature.spec.ts",
  "tests/tool-032-regression.spec.ts",
  "tests/tool-032-limit.spec.ts",
];
let fail = 0;
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const out = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.Preserve },
  });
  const errors = (out.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    fail += errors.length;
    console.log("FAIL", file);
    for (const d of errors) console.log(ts.flattenDiagnosticMessageText(d.messageText, " "));
  } else console.log("PASS syntax", file);
}
process.exitCode = fail ? 1 : 0;
