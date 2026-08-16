import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const report=[]; let fail=0;
const checks=[
 ['route file exists', fs.existsSync(path.join(root,'app/[locale]/list-sorter-duplicate-remover/page.tsx'))],
 ['tool039 slug', /tool039Slug\s*=\s*["']list-sorter-duplicate-remover["']/.test(read('lib/site.ts'))],
 ['tool039 titles', /tool039Titles:/.test(read('lib/site.ts'))],
 ['tool039 descriptions', /tool039Descriptions:/.test(read('lib/site.ts'))],
 ['text category maps 039', /categorySlug === \"text\"[\s\S]*tool039Slug/.test(read('lib/site.ts'))],
 ['sitemap imports 039', /tool039Slug/.test(read('app/sitemap.ts'))],
 ['sitemap emits 039', /\$\{tool039Slug\}/.test(read('app/sitemap.ts'))],
 ['KO metadata', /\/ko\/list-sorter-duplicate-remover/.test(read('app/[locale]/list-sorter-duplicate-remover/page.tsx'))],
 ['EN metadata', /\/en\/list-sorter-duplicate-remover/.test(read('app/[locale]/list-sorter-duplicate-remover/page.tsx'))],
 ['JA metadata', /\/ja\/list-sorter-duplicate-remover/.test(read('app/[locale]/list-sorter-duplicate-remover/page.tsx'))],
 ['038 primary design note', /TOOL038/.test(read('TOOL039_DESIGN_CODE_CHECK.md'))],
 ['038 workspace contract in tool', /tool039-workspace/.test(read('components/list-sorter-duplicate-remover-tool.tsx')) && /workspaceDragging/.test(read('components/list-sorter-duplicate-remover-tool.tsx'))],
 ['file input contract in tool', /tool039-file-input/.test(read('components/list-sorter-duplicate-remover-tool.tsx')) && /tool039-start-dropzone/.test(read('components/list-sorter-duplicate-remover-tool.tsx'))],
 ['replacement dialog contract', /tool039-replace-dialog/.test(read('components/list-sorter-duplicate-remover-tool.tsx'))],
 ['runner config', fs.existsSync(path.join(root,'playwright.tool039.config.ts'))],
];
for(const [name,ok] of checks){report.push(`${ok?'PASS':'FAIL'} | ${name}`); if(!ok)fail++;}
console.log(report.join('\n')); process.exitCode=fail?1:0;
