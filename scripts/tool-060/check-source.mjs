import fs from 'node:fs';
const files=['lib/tool-060-sizes.ts','components/tool-060-shoe-clothing-size-converter.tsx','components/tool-060-shoe-clothing-size-converter.module.css','components/tool-060-shoe-clothing-size-converter-page.tsx','app/[locale]/shoe-clothing-size-converter/page.tsx'];
const fail=[];for(const f of files){if(!fs.existsSync(f))fail.push(`missing ${f}`)}
const all=files.filter(f=>fs.existsSync(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n');
for(const token of ['TOOL060_SYSTEMS','TOOL060_SHOES','TOOL060_CLOTHING','tool060-root','shoe-clothing-size-converter','KR','US','UK','EU','JP'])if(!all.includes(token))fail.push(`missing token ${token}`);
for(const bad of ['tool059-','Tool059','tool058-root'])if(all.includes(bad))fail.push(`stale token ${bad}`);
console.log(fail.length?`SOURCE FAIL\n${fail.join('\n')}`:'SOURCE PASS');process.exit(fail.length?1:0);
