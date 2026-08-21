import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let ts;
try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js')}
const files=['lib/tool-078-stock-average-cost.ts','components/tool-078-stock-average-cost-calculator.tsx','components/tool-078-stock-average-cost-calculator-page.tsx','app/[locale]/stock-average-cost-calculator/page.tsx'];
let failed=0;
for(const file of files){const source=fs.readFileSync(file,'utf8');const out=ts.transpileModule(source,{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.Preserve}});const errors=(out.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);if(errors.length){failed+=errors.length;console.error(file,errors.map(e=>ts.flattenDiagnosticMessageText(e.messageText,' ')).join('\n'));}}
if(failed)process.exit(1);console.log('TOOL078 TS/TSX SYNTAX PASS');
