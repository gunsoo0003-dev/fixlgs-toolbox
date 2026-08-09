import fs from 'node:fs';
const required=[
  'components/youtube-channel-banner-tool.tsx','components/youtube-channel-banner-tool.module.css','components/youtube-channel-banner-page.tsx',
  'lib/tool-020-youtube-banner.ts','lib/tool-020-renderer.ts','docs/tool020/REQ-MASTER.md',
  'app/[locale]/[toolSlug]/page.tsx','lib/site.ts','app/sitemap.ts','package.json'
];
let ok=true;
for(const f of required){if(!fs.existsSync(f)){console.error('MISSING',f);ok=false}}
const tool=fs.readFileSync('components/youtube-channel-banner-tool.tsx','utf8');
for(const token of ['tool020-root','tool020-preview-${id}','tool020-download','sanitizeDownloadName','isAnimatedImage']){if(!tool.includes(token)){console.error('MISSING TOOL TOKEN',token);ok=false}}
const policy=fs.readFileSync('lib/tool-020-youtube-banner.ts','utf8');
for(const token of ['2560','1440','2048','1152','1235','338','backgroundMaxBytes','maxSourcePixels','maxTitleChars']){if(!policy.includes(token)){console.error('MISSING POLICY',token);ok=false}}
const route=fs.readFileSync('app/[locale]/[toolSlug]/page.tsx','utf8');
for(const token of ['YoutubeChannelBannerPage','tool020Slug','tool020Titles','tool020Descriptions']){if(!route.includes(token)){console.error('MISSING ROUTE TOKEN',token);ok=false}}
const site=fs.readFileSync('lib/site.ts','utf8');
for(const token of ['youtube-channel-banner-maker','tool020Titles','tool020Descriptions']){if(!site.includes(token)){console.error('MISSING SITE TOKEN',token);ok=false}}
const sitemap=fs.readFileSync('app/sitemap.ts','utf8'); if(!sitemap.includes('tool020Slug')){console.error('MISSING SITEMAP TOKEN tool020Slug');ok=false}
const pkg=JSON.parse(fs.readFileSync('package.json','utf8')); for(const key of ['test:toolbox:020-preflight','test:toolbox:020-core-only','test:toolbox:020-boundary-only','test:toolbox:020-regression-only','test:toolbox:020-limit-only','test:toolbox:020-final']){if(!pkg.scripts?.[key]){console.error('MISSING SCRIPT',key);ok=false}}
console.log(ok?'TOOL020 SOURCE CHECK PASS':'TOOL020 SOURCE CHECK FAIL'); process.exit(ok?0:1);
