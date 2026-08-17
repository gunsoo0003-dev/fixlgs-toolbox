import fs from 'node:fs';
const files={route:'app/[locale]/text-extractor/page.tsx',page:'components/text-extractor-page.tsx',component:'components/text-extractor-tool.tsx',css:'components/text-extractor-tool.module.css',engine:'lib/tool-041-text-extractor.ts',site:'lib/site.ts',sitemap:'app/sitemap.ts',config:'playwright.tool041.config.ts',fixture:'tests/fixtures/tool-041/cases.json'};
let fail=0; const read=(p)=>fs.readFileSync(p,'utf8'); const pass=(m)=>console.log(`[PASS] ${m}`); const bad=(m)=>{console.error(`[FAIL] ${m}`);fail++;};
for(const [k,p] of Object.entries(files)) fs.existsSync(p)?pass(`${k} exists`):bad(`${k} missing: ${p}`);
if(fs.existsSync(files.component)){const s=read(files.component);for(const n of ['tool041-workspace','workspaceDragging','tool041-file-input','tool041-start-dropzone','tool041-replace-dialog','tool041-copy','tool041-download','tool041-reset','tool041-extract'])s.includes(n)?pass(`component ${n}`):bad(`component missing ${n}`);}
if(fs.existsSync(files.route)){const s=read(files.route);for(const n of ['generateMetadata','alternates','canonical','x-default','/ko/text-extractor','/en/text-extractor','/ja/text-extractor'])s.includes(n)?pass(`route ${n}`):bad(`route missing ${n}`);}
if(fs.existsSync(files.site)){const s=read(files.site);for(const n of ['tool041Slug','tool041Titles','tool041Descriptions','text-extractor'])s.includes(n)?pass(`site ${n}`):bad(`site missing ${n}`);}
if(fs.existsSync(files.sitemap))read(files.sitemap).includes('${tool041Slug}')?pass('sitemap emits 041'):bad('sitemap missing 041');
process.exitCode=fail?1:0;
