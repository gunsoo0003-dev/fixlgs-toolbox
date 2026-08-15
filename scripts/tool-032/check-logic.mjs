import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
let ts;
for (const candidate of [
  path.join(process.cwd(), "node_modules", "typescript", "lib", "typescript.js"),
  "/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js"
]) { if (fs.existsSync(candidate)) { ts = require(candidate); break; } }
if (!ts) { console.error("FAIL TypeScript compiler unavailable for pure-logic harness"); process.exit(1); }
const source = fs.readFileSync("lib/tool-032-pdf-signature.ts", "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const module = { exports: {} };
const sandbox = { module, exports: module.exports, require: (name) => name === "pdf-lib" ? { PDFDocument: {}, degrees: (x) => x } : require(name), console };
vm.runInNewContext(js, sandbox, { filename: "tool-032-pdf-signature.js" });
const m = module.exports;
let fail = 0; const need = (ok, msg) => { console.log(ok ? "PASS" : "FAIL", msg); if (!ok) fail += 1; };
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const approx = (a,b) => Object.keys(b).every((k) => Math.abs(a[k]-b[k]) < 1e-9);
need(same(m.parseTool032PageRange("1-3,3,5", 8), [1,2,3,5]), "range dedup/sort");
for (const bad of ["0", "-1", "9", "4-2", "1-99", "abc"]) { let threw=false; try { m.parseTool032PageRange(bad, 8); } catch { threw=true; } need(threw, `range rejects ${bad}`); }
need(same(m.resolveTool032Pages("odd",1,6), [1,3,5]), "odd pages");
need(same(m.resolveTool032Pages("even",1,6), [2,4,6]), "even pages");
need(same(m.visiblePageSize(595,842,90), {width:842,height:595}), "rotation visible size");
const box0=m.visibleBoxToPdfBox(600,800,0,.1,.2,.25,.1); need(approx(box0,{x:60,y:560,width:150,height:80}), "rotation 0 normalized box");
const box90=m.visibleBoxToPdfBox(600,800,90,.1,.2,.25,.1); need(approx(box90,{x:120,y:80,width:60,height:200}), "rotation 90 normalized box");
need(m.safeTool032Filename("계약서 日本語.pdf") === "계약서 日本語-signed.pdf", "Unicode filename preserved");
need(m.safeTool032Filename("a<>:?.pdf") === "a-----signed.pdf", "unsafe filename chars sanitized");
process.exitCode = fail ? 1 : 0;
