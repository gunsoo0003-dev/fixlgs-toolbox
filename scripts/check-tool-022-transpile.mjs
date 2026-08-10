import fs from 'node:fs';
import ts from 'typescript';
const files=[
'app/[locale]/blog-open-graph-image-maker/page.tsx',
'components/blog-open-graph-image-maker-page.tsx',
'components/blog-open-graph-image-maker-tool.tsx',
'lib/tool-022-blog-og.ts',
'tests/helpers/tool-022.ts',
'tests/tool-022-preflight.spec.ts','tests/tool-022-core.spec.ts','tests/tool-022-boundary.spec.ts','tests/tool-022-regression.spec.ts','tests/tool-022-limit.spec.ts',
'tests/config/tool-022-limit-candidates.ts','playwright.tool022-runtime.config.ts'
];
let failed=false;
for(const file of files){
 const source=fs.readFileSync(file,'utf8');
 const out=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},fileName:file,reportDiagnostics:true});
 const errors=(out.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
 if(errors.length){failed=true;console.log(`FAIL ${file}`);for(const d of errors)console.log(ts.flattenDiagnosticMessageText(d.messageText,' '));}
 else console.log(`PASS ${file}`);
}
if(failed)process.exit(1);
