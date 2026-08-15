import fs from 'node:fs';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const ts=require('typescript');
const files=['components/pdf-password-metadata-tool.tsx','components/pdf-password-metadata-page.tsx','app/[locale]/pdf-password-metadata/page.tsx','lib/tool-034-pdf-policy.ts','lib/tool-034-qpdf.ts','lib/tool-034-metadata.ts'];
const errors=[];
for(const file of files){
  const source=fs.readFileSync(file,'utf8');
  const out=ts.transpileModule(source,{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}});
  for(const d of out.diagnostics||[]){
    if(d.category===ts.DiagnosticCategory.Error)errors.push(`${file}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`);
  }
}
if(errors.length){
  console.error('TOOL034 SYNTAX FAIL');
  errors.forEach(x=>console.error(' -',x));
  process.exit(1);
}
console.log(`TOOL034 SYNTAX PASS · ${files.length} files`);
