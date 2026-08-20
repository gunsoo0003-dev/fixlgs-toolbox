import fs from 'node:fs';
const s=fs.readFileSync('lib/tool-060-sizes.ts','utf8');const fail=[];
for(const x of ["men:[shoe(","women:[shoe(","kids:[shoe(","men:{","women:{","kids:{","tops:[clothing(","bottoms:[clothing("])if(!s.includes(x))fail.push(`dataset missing ${x}`);
for(const sys of ['KR','US','UK','EU','JP'])if(!s.includes(sys))fail.push(`system missing ${sys}`);
if(s.includes('US = KR')||s.includes('KR -'))fail.push('forbidden arithmetic crosswalk pattern');
console.log(fail.length?`LOGIC FAIL\n${fail.join('\n')}`:'LOGIC PASS');process.exit(fail.length?1:0);
