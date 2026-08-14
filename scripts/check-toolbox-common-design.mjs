import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const bootstrap=fs.readFileSync(path.join(root,'app/globals.css'),'utf8');
const commonCssFiles=['styles/toolbox-common.css','styles/toolbox-detail-common.css'];
const globals=[bootstrap,...commonCssFiles.map((rel)=>fs.readFileSync(path.join(root,rel),'utf8'))].join('\n');
const componentsDir=path.join(root,'components');
const files=fs.readdirSync(componentsDir).filter((name)=>name.endsWith('.css'));
const suspicious=[];
const modernPageFiles=fs.readdirSync(componentsDir).filter((name)=>/-page\.tsx$/.test(name));
const legacySharedClassPattern=/className=["'`][^"'`]*(?:toolbox-howto|toolbox-guide(?:-grid)?|toolbox-cautions|toolbox-faq(?:["'`\s])|toolbox-related-tools(?:-grid)?)[^"'`]*/g;
const legacySharedHits=[];
for(const name of modernPageFiles){
  if(name==='app-store-screenshot-maker-page.tsx'){
    const text=fs.readFileSync(path.join(componentsDir,name),'utf8');
    for(const match of text.matchAll(legacySharedClassPattern)) legacySharedHits.push(`${name}: ${match[0]}`);
  }
}
const futureCommonPattern=/\.tool(?:0(?:2[2-9]|[3-9]\d)|[1-9]\d{2})[-_](?:how(?:to)?|guide|expert|practical|notice|notes?|caution|info|result)(?:[-_][A-Za-z0-9_-]+)?\b/gi;
for(const name of files){
  const text=fs.readFileSync(path.join(componentsDir,name),'utf8');
  for(const match of text.matchAll(futureCommonPattern)) suspicious.push(`${name}: ${match[0]}`);
}
const checks=[
  ['shared-guide-grid',globals.includes('.toolbox-tool-guide--five ol'),'established shared 3-column multi-row guide exists'],
  ['shared-expert-head',globals.includes('.toolbox-tool-expert-post--wide-head'),'shared expert-post head modifier exists'],
  ['shared-info-band',globals.includes('.toolbox-tool-info-band-head')&&globals.includes('.toolbox-tool-info-band-list'),'shared important/result information band exists'],
  ['shared-split-notes',globals.includes('.toolbox-tool-info-notes-split'),'shared SAFE AREA + IMPORTANT NOTES split section exists'],
  ['no-019-020-common-tail',!/(?:\.tool019|\.tool020)-(?:safe-area|important-notes|safe-copy|info-notes|notes-head|safe-head)\b/.test(globals),'019/020 common-design selectors no longer duplicated by tool number'],
  ['no-future-common-overrides',suspicious.length===0,suspicious.length?`tool-number common-layout CSS: ${suspicious.join('; ')}`:'no 022+ tool-number common-layout CSS detected'],
  ['no-024-legacy-shared-dom',legacySharedHits.length===0,legacySharedHits.length?`legacy shared DOM classes: ${legacySharedHits.join('; ')}`:'024 uses current shared TOOLBOX DOM classes'],
  ['no-important-in-normalized-block',!fs.readFileSync(path.join(root,'styles/toolbox-detail-common.css'),'utf8').includes('!important'),'normalized common block adds no !important specificity escalation'],
];
let fail=0;
for(const [id,ok,detail] of checks){console.log(`${ok?'PASS':'FAIL'} ${id} - ${detail}`); if(!ok) fail++;}
if(fail) process.exit(1);
