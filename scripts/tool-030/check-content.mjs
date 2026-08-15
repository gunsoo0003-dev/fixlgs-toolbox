import fs from 'node:fs';
let fail=0; const files=['components/pdf-page-organizer-page.tsx','components/pdf-page-organizer-tool.tsx'];
const src=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const required=['HOW TO USE','USE CASES','EXPERT POST','IMPORTANT NOTES','FAQ','삭제·이동·복제·회전','Reverse Order','逆順','브라우저','server','サーバー'];
for(const token of required){const ok=src.includes(token);console.log(ok?'PASS':'FAIL',token);if(!ok)fail++;}
process.exitCode=fail?1:0;
