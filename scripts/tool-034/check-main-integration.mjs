import fs from 'node:fs';
const fail=[]; const need=(ok,msg)=>{if(!ok)fail.push(msg)};
const site=fs.readFileSync('lib/site.ts','utf8');
const sitemap=fs.readFileSync('app/sitemap.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
for(const token of ['tool034Slug = "pdf-password-metadata"','tool034Titles','tool034Descriptions','href: `/${"ko"}/${tool034Slug}`','index === 8']) need(site.includes(token),`site integration missing ${token}`);
need(sitemap.includes('tool034Slug')&&sitemap.includes('${baseUrl}/${locale}/${tool034Slug}'),'sitemap KO/EN/JA route generation missing');
for(const key of ['test:toolbox:034-preflight','test:toolbox:034-core-only','test:toolbox:034-boundary-only','test:toolbox:034-feature-only','test:toolbox:034-regression-only','test:toolbox:034-limit-only','test:toolbox:034-final','check:toolbox:mobile-real-photo-001-034','test:toolbox:034-mobile-real']) need(Boolean(pkg.scripts?.[key]),`package script missing ${key}`);
need(pkg.dependencies?.['qpdf-wasm-esm-embedded']==='1.1.1','qpdf dependency missing');
need(lock.packages?.['']?.dependencies?.['qpdf-wasm-esm-embedded']==='1.1.1','package-lock root qpdf dependency missing');
need(Boolean(lock.packages?.['node_modules/qpdf-wasm-esm-embedded']),'package-lock qpdf package entry missing');
for(const f of ['scripts/run-mobile-real-photo-001-034.mjs','scripts/check-mobile-real-photo-001-034-validator.mjs','scripts/tool-034/mobile-runner-registration.json']) need(fs.existsSync(f),`mobile registration artifact missing ${f}`);
if(fail.length){console.error('TOOL034 MAIN INTEGRATION FAIL');fail.forEach(x=>console.error(' -',x));process.exit(1)}
console.log('TOOL034 MAIN INTEGRATION PASS');
