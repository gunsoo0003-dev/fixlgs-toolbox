import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const report=[]; let fail=0;
const checks=[
 ['route file exists', fs.existsSync(path.join(root,'app/[locale]/delimiter-list-converter/page.tsx'))],
 ['tool040 slug', /tool040Slug\s*=\s*["']delimiter-list-converter["']/.test(read('lib/site.ts'))],
 ['tool040 titles', /tool040Titles:/.test(read('lib/site.ts'))],
 ['tool040 descriptions', /tool040Descriptions:/.test(read('lib/site.ts'))],
 ['text category maps 040', /"text":\s*\[[\s\S]*tool040Slug/.test(read('lib/site.ts'))],
 ['localized text href 040', /categorySlug === "text"[\s\S]*tool040Slug/.test(read('lib/site.ts'))],
 ['sitemap imports 040', /tool040Slug/.test(read('app/sitemap.ts'))],
 ['sitemap emits 040', /\$\{tool040Slug\}/.test(read('app/sitemap.ts'))],
 ['KO metadata', /\/ko\/delimiter-list-converter/.test(read('app/[locale]/delimiter-list-converter/page.tsx'))],
 ['EN metadata', /\/en\/delimiter-list-converter/.test(read('app/[locale]/delimiter-list-converter/page.tsx'))],
 ['JA metadata', /\/ja\/delimiter-list-converter/.test(read('app/[locale]/delimiter-list-converter/page.tsx'))],
 ['039 primary design contract', /tool040-workspace/.test(read('components/delimiter-list-converter-tool.tsx')) && /workspaceDragging/.test(read('components/delimiter-list-converter-tool.tsx'))],
 ['file input contract', /tool040-file-input/.test(read('components/delimiter-list-converter-tool.tsx')) && /tool040-start-dropzone/.test(read('components/delimiter-list-converter-tool.tsx'))],
 ['replacement dialog contract', /tool040-replace-dialog/.test(read('components/delimiter-list-converter-tool.tsx'))],
 ['copy and download contract', /tool040-copy/.test(read('components/delimiter-list-converter-tool.tsx')) && /tool040-download/.test(read('components/delimiter-list-converter-tool.tsx'))],
 ['runner config', fs.existsSync(path.join(root,'playwright.tool040.config.ts'))],
];
for(const [name,ok] of checks){report.push(`${ok?'PASS':'FAIL'} | ${name}`); if(!ok)fail++;}
console.log(report.join('\n')); process.exitCode=fail?1:0;
