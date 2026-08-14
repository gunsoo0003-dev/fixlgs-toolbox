import fs from 'node:fs';
let fail=0;
const site=fs.readFileSync('lib/site.ts','utf8');
const sitemap=fs.readFileSync('app/sitemap.ts','utf8');
for(const token of ['tool025Slug = "id-passport-photo-maker"','tool025Titles','tool025Descriptions','title: tool025Titles','/${locale}/${tool025Slug}']) if(!site.includes(token)){console.error('SITE MISSING',token);fail++;}
for(const token of ['tool025Slug','`${baseUrl}/${locale}/${tool025Slug}`']) if(!sitemap.includes(token)){console.error('SITEMAP MISSING',token);fail++;}
const globalCss=['app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css'];
for(const f of globalCss){if(fs.existsSync(f)){const s=fs.readFileSync(f,'utf8');if(/tool025|id-passport-photo-maker/.test(s)){console.error('GLOBAL CSS CONTAMINATION',f);fail++;}}}
console.log(fail?'INTEGRATION FAIL':'INTEGRATION PASS');process.exit(fail?1:0);
