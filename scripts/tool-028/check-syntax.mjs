import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
let ts;
try { ts=require('typescript'); }
catch { console.error('[FAIL] project-local TypeScript is unavailable; run npm install before syntax validation'); process.exit(87); }
const files=['app/[locale]/merge-pdf/page.tsx','components/merge-pdf-page.tsx','components/merge-pdf-tool.tsx','lib/tool-028-pdf-policy.ts','playwright.tool028-runtime.config.ts','tests/tool-028-preflight.spec.ts','tests/tool-028-core.spec.ts','tests/tool-028-feature.spec.ts','tests/tool-028-design-state.spec.ts','tests/tool-028-boundary.spec.ts','tests/tool-028-regression.spec.ts','tests/tool-028-limit.spec.ts'];
let fail=0;
for(const file of files){
  const source=fs.readFileSync(file,'utf8');
  const result=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},reportDiagnostics:true,fileName:file});
  const errors=(result.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
  if(errors.length){fail++;console.log(`[FAIL] ${file}`);for(const d of errors)console.log(ts.flattenDiagnosticMessageText(d.messageText,' '));}
  else console.log(`[PASS] ${file}`);
}
process.exit(fail?1:0);
