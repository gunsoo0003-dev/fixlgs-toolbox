import fs from 'node:fs';
const files=['components/add-text-to-image-tool.tsx','components/add-text-to-image-tool.module.css','components/add-text-to-image-page.tsx'];
const need=['tool016-root','tool016-preview-canvas','Add Title','タイトルを追加','제목 추가','strokeText','shadowBlur','toBlob','add-text-to-image','주의사항','EXPERT POST','NEXT WORK'];
let text='';for(const f of files){if(!fs.existsSync(f)){console.error('MISSING',f);process.exit(1)}text+=fs.readFileSync(f,'utf8')+'\n'}
for(const x of need){if(!text.includes(x)){console.error('MISSING TOKEN',x);process.exit(1)}}console.log('016 SOURCE CHECK: PASSED');
