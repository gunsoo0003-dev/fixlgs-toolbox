import { existsSync, readFileSync } from 'node:fs';
const required=[
'components/youtube-thumbnail-maker-page.tsx','components/youtube-thumbnail-maker-tool.tsx','components/youtube-thumbnail-maker-tool.module.css','lib/tool-019-service-limits.ts','lib/tool-019-platform-guideline.ts','tests/helpers/tool-019.ts','tests/tool-019-preflight.spec.ts','tests/tool-019-core.spec.ts','tests/tool-019-boundary.spec.ts','tests/tool-019-regression.spec.ts','tests/tool-019-limit.spec.ts','playwright.tool019-runtime.config.ts','test-fixtures/sample.jpg','test-fixtures/crop-probe.jpg','test-fixtures/low-640x360.jpg','test-fixtures/corrupt.jpg','test-fixtures/empty.jpg','test-fixtures/mime-mismatch.jpg','test-fixtures/animated-apng.png','test-fixtures/animated.webp'];
let failed=false;
for(const f of required)if(!existsSync(f)){console.error(`[PRODUCT_FAIL] missing 019 file: ${f}`);failed=true;}
if(!failed){
 const tool=readFileSync('components/youtube-thumbnail-maker-tool.tsx','utf8');const page=readFileSync('components/youtube-thumbnail-maker-page.tsx','utf8');const route=readFileSync('app/[locale]/[toolSlug]/page.tsx','utf8');const site=readFileSync('lib/site.ts','utf8');const sitemap=readFileSync('app/sitemap.ts','utf8');
 for(const token of ['tool019-root','tool019-file-input','tool019-preview-canvas','tool019-small-preview','tool019-download','fitUnder2MB','pointerDown','pointerMove','pointerUp','TOOL019_SERVICE_LIMITS','TOOL019_PLATFORM_GUIDELINE'])if(!tool.includes(token)){console.error(`[PRODUCT_FAIL] missing implementation token: ${token}`);failed=true;}
 for(const token of ['WebApplication','FAQPage','BreadcrumbList','youtube-thumbnail-maker','NEXT WORK','RELATED TOOLS','EXPERT POST','SAFE AREA'])if(!page.includes(token)){console.error(`[PRODUCT_FAIL] missing page/SEO token: ${token}`);failed=true;}
 for(const [name,text,tokens] of [['route',route,['YoutubeThumbnailMakerPage','tool019Slug']],['site',site,['tool019Slug','tool019Titles','tool019Descriptions']],['sitemap',sitemap,['tool019Slug']]])for(const token of tokens)if(!text.includes(token)){console.error(`[PRODUCT_FAIL] missing 019 integration token in ${name}: ${token}`);failed=true;}
 if(/fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(tool)){console.error('[PRODUCT_FAIL] unexpected network-transfer code in 019 tool');failed=true;}
}
console.log(`019 SOURCE CHECK: ${failed?'FAIL':'PASS'}`);process.exit(failed?1:0);
