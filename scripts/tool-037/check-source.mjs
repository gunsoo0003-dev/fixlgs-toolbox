import fs from 'node:fs';
const files=[
  'components/text-whitespace-linebreak-cleaner-tool.tsx','components/text-whitespace-linebreak-cleaner-tool.module.css','components/text-whitespace-linebreak-cleaner-page.tsx','app/[locale]/text-whitespace-linebreak-cleaner/page.tsx','lib/tool-037-text-cleaner.ts',
  'tests/fixtures/tool-037/sample.txt','tests/fixtures/tool-037/sample.md','tests/fixtures/tool-037/invalid.json','tests/helpers/tool-037.ts','tests/tool-037-preflight.spec.ts','tests/tool-037-core.spec.ts','tests/tool-037-boundary.spec.ts','tests/tool-037-feature.spec.ts','tests/tool-037-regression.spec.ts','tests/tool-037-limit.spec.ts','playwright.tool037.config.ts','scripts/tool-037/run-validation.mjs'
];
let fail=0;const read=p=>fs.readFileSync(p,'utf8');const pass=(label,ok)=>{console.log(`[${ok?'PASS':'FAIL'}] ${label}`);if(!ok)fail++};
for(const f of files)pass(f,fs.existsSync(f));
const tool=read(files[0]),logic=read(files[4]);
for(const [label,re] of [
  ['root selector',/tool037-root/],['single active workspace',/data-testid="tool037-workspace"/],['file input',/data-testid="tool037-file-input"/],['TXT MD CSV accept',/\.txt,\.md,\.csv/],['file local read',/await file\.text\(\)/],['drag handlers',/onDragEnter[\s\S]*onDragOver[\s\S]*onDragLeave[\s\S]*onDrop/],['safe replacement',/pendingFile[\s\S]*requestFileLoad[\s\S]*tool037-replace-dialog[\s\S]*tool037-replace-cancel[\s\S]*tool037-replace-confirm/],['complete reset file',/setLoadedFile\(null\)/],['complete reset result',/setResult\(""\)/],['result editable',/onChange=\{\(event\) => \{ setResult\(event\.currentTarget\.value\)[\s\S]*data-testid="tool037-result"/],['copy result',/navigator\.clipboard\.writeText\(materializeResult\(result, options\.eol\)\)/],['TXT export',/anchor\.download = "cleaned-text\.txt"/],['UTF-8 blob',/text\/plain;charset=utf-8/]
])pass(label,re.test(tool));
for(const [label,re] of [
  ['approved limit',/maxCharacters:\s*1_000_000/],['mixed EOL normalize',/replace\(\/\\r\\n\/g, '\\n'\)\.replace\(\/\\r\/g, '\\n'\)/],['tabs before trim',/options\.removeTabs[\s\S]*options\.trimEachLine/],['trim before collapse',/options\.trimEachLine[\s\S]*options\.collapseSpaces/],['collapse before blank',/options\.collapseSpaces[\s\S]*options\.removeBlankLines/],['U+0020 only',/line\.replace\(\/ \{2,\}\/g/],['CRLF emit',/options\.eol === 'crlf'/]
])pass(label,re.test(logic));
process.exitCode=fail?1:0;
