import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(), fail=[]; const read=f=>fs.readFileSync(path.join(root,f),'utf8'); const exists=f=>fs.existsSync(path.join(root,f));
for(const f of ['components/image-padding-background-tool.tsx','components/image-padding-background-page.tsx']) if(!exists(f)) fail.push(`missing ${f}`);
if(!fail.length){const tool=read('components/image-padding-background-tool.tsx'), page=read('components/image-padding-background-page.tsx'), css=read('app/globals.css'), route=read('app/[locale]/[toolSlug]/page.tsx'), site=read('lib/site.ts'), map=read('app/sitemap.ts');
for(const m of ['toolbox-workbench','toolbox-workbench-editor-grid','toolbox-workbench-preview-card','toolbox-workbench-settings-card','adjuster-output-card']) if(!tool.includes(m))fail.push(`layout marker ${m}`);
for(const m of ['data-testid={`tool011-mode-${m}`}','data-testid={`tool011-bg-${b}`}','tool011-undo','tool011-redo','tool011-download']) if(!tool.includes(m))fail.push(`feature marker ${m}`);
for(const m of ['EXPERT POST','toolbox-tool-expert-post','ToolboxFaqList','HOW TO USE']) if(!page.includes(m))fail.push(`page marker ${m}`);
for(const m of ['padding-editor-grid','grid-template-columns:minmax(0,1.55fr) minmax(320px,.75fr)','@media(max-width:640px)']) if(!css.includes(m))fail.push(`css marker ${m}`);
for(const m of ['tool011Slug','ImagePaddingBackgroundPage']) if(!route.includes(m))fail.push(`route marker ${m}`);
if(!site.includes('status: "LIVE"')||!site.includes('tool011Slug'))fail.push('category registration'); if(!map.includes('tool011Slug'))fail.push('sitemap registration');}
if(fail.length){console.error(JSON.stringify({status:'FAIL',fail},null,2));process.exit(1)} console.log(JSON.stringify({status:'PASS',layoutSource:'009/010 workbench classes',tool:'011',expertPost:true,routeSeo:true},null,2));
