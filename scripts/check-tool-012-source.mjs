import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(), fail=[]; const read=f=>fs.readFileSync(path.join(root,f),'utf8'); const exists=f=>fs.existsSync(path.join(root,f));
for(const f of ['components/image-border-rounded-tool.tsx','components/image-border-rounded-page.tsx','components/image-border-rounded-tool.module.css']) if(!exists(f)) fail.push(`missing ${f}`);
if(!fail.length){
 const tool=read('components/image-border-rounded-tool.tsx'), page=read('components/image-border-rounded-page.tsx'), route=read('app/[locale]/[toolSlug]/page.tsx'), site=read('lib/site.ts'), map=read('app/sitemap.ts');
 for(const m of ['rounded','circle','borderAlign','shadowBlur','shadowSpread','autoPadding','extraPadding','toBlob','image/png','image/webp','image/jpeg','undo','redo']) if(!tool.includes(m))fail.push(`tool marker ${m}`);
 for(const m of ['ToolboxFaqList','WebApplication','FAQPage','BreadcrumbList','HOW TO USE']) if(!page.includes(m))fail.push(`page marker ${m}`);
 for(const m of ['tool012Slug','ImageBorderRoundedPage','tool012Titles','tool012Descriptions']) if(!route.includes(m))fail.push(`route marker ${m}`);
 for(const m of ['tool012Slug','tool012Titles','tool012Descriptions','status: "LIVE"']) if(!site.includes(m))fail.push(`site marker ${m}`);
 if(!map.includes('tool012Slug'))fail.push('sitemap registration');
 for(const m of ['SERVICE_LIMITS={maxPixels:80_000_000,maxSide:16_000}','out.w>SERVICE_LIMITS.maxSide','out.w*out.h>SERVICE_LIMITS.maxPixels','tool012-service-limit']) if(!tool.includes(m))fail.push(`service limit marker ${m}`);
 for(const m of ['80,000,000','16,000px','최대 결과 크기는 얼마인가요?','What is the maximum result size?','最大の結果サイズはどれくらいですか？']) if(!page.includes(m))fail.push(`service guidance marker ${m}`);
 if(!tool.includes('borderAlign'))fail.push('border alignment missing');
}
if(fail.length){console.error(JSON.stringify({status:'FAIL',fail},null,2));process.exit(1)}
console.log(JSON.stringify({status:'PASS',tool:'012',route:true,sitemap:true,seoContent:true,serviceLimitApplied:true},null,2));
