import fs from 'node:fs';
const r=p=>fs.readFileSync(p,'utf8');const site=r('lib/site.ts'),map=r('app/sitemap.ts'),prev=r('components/text-extractor-page.tsx');
const checks=[['route',fs.existsSync('app/[locale]/text-find-replace/page.tsx')],['site slug',/tool042Slug\s*=\s*["']text-find-replace["']/.test(site)],['text card 042',/title:\s*tool042Titles/.test(site)],['localized href 042',/categorySlug === "text"[\s\S]*tool042Slug/.test(site)],['sitemap 042',/\$\{tool042Slug\}/.test(map)],['041 next links 042',/Link href=\{`\/\$\{locale\}\/\$\{related\[1\]\.slug\}`\}[\s\S]*<span>042<\/span>/.test(prev)]];
let f=0;for(const[n,ok]of checks){console.log(`[${ok?'PASS':'FAIL'}] ${n}`);if(!ok)f++}process.exitCode=f?1:0;
