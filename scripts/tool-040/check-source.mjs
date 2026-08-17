import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=(rel)=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=(rel)=>fs.existsSync(path.join(root,rel));
const files={
 route:'app/[locale]/delimiter-list-converter/page.tsx', page:'components/delimiter-list-converter-page.tsx', component:'components/delimiter-list-converter-tool.tsx', css:'components/delimiter-list-converter-tool.module.css', engine:'lib/tool-040-delimiter-list.ts', site:'lib/site.ts', sitemap:'app/sitemap.ts', config:'playwright.tool040.config.ts', fixture:'tests/fixtures/tool-040/cases.json'
};
const tests=['tests/tool-040-preflight.spec.ts','tests/tool-040-core.spec.ts','tests/tool-040-boundary.spec.ts','tests/tool-040-feature.spec.ts','tests/tool-040-regression.spec.ts','tests/tool-040-limit.spec.ts'];
const errors=[]; const warnings=[];
for(const [label,rel] of Object.entries(files)) if(!exists(rel)) errors.push(`${label}: MISSING ${rel}`);
for(const rel of tests) if(!exists(rel)) errors.push(`test: MISSING ${rel}`);
if(exists(files.component)){
 const s=read(files.component);
 const selectors=['tool040-root','tool040-local-notice','tool040-file-input','tool040-workspace','tool040-start-dropzone','tool040-file-button','tool040-source','tool040-reset','tool040-presets','tool040-options','tool040-source-kind','tool040-target-kind','tool040-trim','tool040-empty','tool040-quote','tool040-list','tool040-convert','tool040-result-card','tool040-result','tool040-summary','tool040-copy','tool040-download','tool040-status','tool040-error','tool040-replace-dialog','tool040-replace-cancel','tool040-replace-confirm'];
 for(const id of selectors) if(!s.includes(`data-testid="${id}"`)) errors.push(`component: missing selector ${id}`);
 for(const needle of ['onDragEnter={onDragEnter}','onDragOver={onDragOver}','onDragLeave={onDragLeave}','onDrop={onDrop}','data-drag-active={dragActive ? "true" : "false"}','accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"','navigator.clipboard.writeText(result)','new Blob([result]','anchor.download = "converted-list.txt"','TOOL040_ITEM_LIMIT_CANDIDATE']) if(!s.includes(needle)) errors.push(`component: missing contract ${needle}`);
 if((s.match(/data-testid="tool040-workspace"/g)??[]).length!==1) errors.push('component: activeWorkspace selector count must be 1');
}
if(exists(files.engine)){
 const s=read(files.engine);
 for(const needle of ['TOOL040_INPUT_LIMIT_CANDIDATE','TOOL040_CUSTOM_DELIMITER_LIMIT_CANDIDATE','TOOL040_ITEM_LIMIT_CANDIDATE','parseTool040Items','escapeAndWrapTool040Item','decorateTool040Items','convertTool040','text.split(delimiter)']) if(!s.includes(needle)) errors.push(`engine: missing ${needle}`);
 if(s.includes('new RegExp')) errors.push('engine: custom delimiter must remain literal');
}
if(exists(files.css)){
 const s=read(files.css);
 if(!/@media\(max-width:(?:720|520)px\)/.test(s)) errors.push('css: mobile breakpoint missing');
 if(s.includes(':global(')) warnings.push('css: global selector present; inspect scope');
}
if(exists(files.page)) for(const needle of ['040 · TEXT','HOW TO USE','FORMAT GUIDE','IMPORTANT NOTES','FAQ','RELATED TOOLS']) if(!read(files.page).includes(needle)) errors.push(`page: missing ${needle}`);
if(exists(files.route)) for(const needle of ['generateMetadata','alternates','canonical','x-default','/ko/delimiter-list-converter','/en/delimiter-list-converter','/ja/delimiter-list-converter']) if(!read(files.route).includes(needle)) errors.push(`route: missing ${needle}`);
if(exists(files.site)) for(const needle of ['tool040Slug','tool040Titles','tool040Descriptions','delimiter-list-converter']) if(!read(files.site).includes(needle)) errors.push(`site: missing ${needle}`);
if(exists(files.sitemap)) for(const needle of ['tool040Slug','${tool040Slug}']) if(!read(files.sitemap).includes(needle)) errors.push(`sitemap: missing ${needle}`);
if(exists(files.config)) for(const needle of ['tool-040-(preflight|core|boundary|feature|regression|limit)','3040','desktop-040','mobile-040','test-results/tool040-runtime.json']) if(!read(files.config).includes(needle)) errors.push(`config: missing ${needle}`);
const pkg=JSON.parse(read('package.json'));
for(const key of ['check:tool040-static','check:tool040-main','check:tool040-source','test:toolbox:040','test:toolbox:040-final']) if(!pkg.scripts?.[key]) errors.push(`package: missing ${key}`);
const inventory={generatedAt:new Date().toISOString(),tool:'040',files,tests,contracts:{singleActiveWorkspace:true,fileInput:true,fileReplacementConfirmation:true,completeReset:true,resultCopy:true,resultDownload:true,koEnJa:true,protectedSeoRoutes:true,limitCandidateUntilApproval:true},errors,warnings,status:errors.length===0?'PASS':'FAIL'};
fs.mkdirSync(path.join(root,'test-results'),{recursive:true}); fs.writeFileSync(path.join(root,'test-results/tool040-source-inventory.json'),JSON.stringify(inventory,null,2));
console.log(`TOOL040 SOURCE SELF-CHECK: ${inventory.status}`); console.log(`ERRORS=${errors.length} WARNINGS=${warnings.length}`); for(const e of errors) console.log(`FAIL | ${e}`); for(const w of warnings) console.log(`WARN | ${w}`); if(!errors.length) console.log('SENTINEL=TOOL040_SOURCE_SELF_CHECK_PASS'); process.exit(errors.length?1:0);
