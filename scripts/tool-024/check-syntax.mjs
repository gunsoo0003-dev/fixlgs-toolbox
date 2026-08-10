import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const files=['components/app-store-screenshot-maker-page.tsx','components/app-store-screenshot-maker-tool.tsx','lib/tool-024-store-policy.ts','tests/tool-024-core.spec.ts','tests/tool-024-boundary.spec.ts','tests/tool-024-regression.spec.ts','tests/tool-024-limit.spec.ts','tests/tool-024-feature.spec.ts','playwright.tool024-runtime.config.ts'];
let bad=0;
for(const file of files){const src=fs.readFileSync(file,'utf8');const r=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.Preserve},fileName:path.basename(file),reportDiagnostics:true});const errs=(r.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);if(errs.length){bad+=errs.length;console.error(file,errs.map(e=>ts.flattenDiagnosticMessageText(e.messageText,' ')).join('\n'));}}
if(bad)process.exit(1);console.log('SYNTAX PASS');
