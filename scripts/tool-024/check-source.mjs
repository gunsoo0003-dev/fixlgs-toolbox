import fs from 'node:fs';
const files=['components/app-store-screenshot-maker-tool.tsx','components/app-store-screenshot-maker-tool.module.css','components/app-store-screenshot-maker-page.tsx','lib/tool-024-store-policy.ts'];
let fail=0; for(const f of files){if(!fs.existsSync(f)){console.error('MISSING',f);fail++;}}
const src=fs.readFileSync(files[0],'utf8');
const policy=fs.readFileSync(files[3],'utf8');
const required=['tool024-root','tool024-dropzone','tool024-preview','tool024-export-zip','createStoredZip','tool024-workspace-dropzone','workspaceDragging','contentLanguage = locale as Language','selectedPresets','tool024-background-mode','tool024-title-y','tool024-description-y','tool024-frame-toggle','tool024-output-format','backgroundMode === "gradient"','new Set(slidesRef.current.map((s) => s.url))','type SlideText = Record<Language','type Slide = {','validateImageSignature','tool024-export-failures','retryFailures'];
for(const token of required){if(!src.includes(token)){console.error('MISSING TOKEN',token);fail++;}}
const policyRequired=['verifiedAt: "2026-08-09"','maxFiles: 10','15 * 1024 * 1024','80 * 1024 * 1024','1320, height: 2868','1080, height: 1920','recommendedTaglineAreaRatio: 0.2','deviceFrameDefault: false'];
for(const token of policyRequired){if(!policy.includes(token)){console.error('MISSING POLICY TOKEN',token);fail++;}}
if(/tool0(19|20|21)-root/.test(src)){console.error('COPY RESIDUE');fail++;}
console.log(fail?'SOURCE FAIL':'SOURCE PASS'); process.exit(fail?1:0);
