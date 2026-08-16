import fs from 'node:fs';

const required = [
  'app/[locale]/pdf-text-image-extractor/page.tsx',
  'components/pdf-text-image-extractor-page.tsx',
  'components/pdf-text-image-extractor-tool.tsx',
  'components/pdf-text-image-extractor-tool.module.css',
  'lib/tool-035-pdf-extractor.ts',
];
let fail=0;
for(const file of required){const ok=fs.existsSync(file);console.log(ok?'PASS':'FAIL',file);if(!ok)fail++;}
const src=required.filter(fs.existsSync).map(f=>fs.readFileSync(f,'utf8')).join('\n');
const tokens=['tool035-root','tool035-file-input','tool035-mode-${key}','tool035-page-scope','tool035-extract','tool035-results','getTextContent','getOperatorList','paintImageXObject','paintInlineImageXObject','paintImageMaskXObject','PNG fallback','createStoredZip','safeTool035ZipPath','jobIdRef','abortRef','pdfjs-dist/webpack.mjs'];
for(const token of tokens){const ok=src.includes(token);console.log(ok?'PASS token':'FAIL token',token);if(!ok)fail++;}
const forbidden=['toDataURL("image/jpeg"','OCR API','fetch(','axios','XMLHttpRequest'];
for(const token of forbidden){const bad=src.includes(token);console.log(bad?'FAIL forbidden':'PASS forbidden-absent',token);if(bad)fail++;}
process.exitCode=fail?1:0;
