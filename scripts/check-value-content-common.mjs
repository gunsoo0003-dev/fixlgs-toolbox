import fs from 'node:fs';

function scanBalanced(src,start,open,close){let d=0,q=null,esc=false;for(let i=start;i<src.length;i++){const c=src[i];if(q){if(esc)esc=false;else if(c==='\\')esc=true;else if(c===q)q=null;continue;}if(c==='\''||c==='"'||c==='`'){q=c;continue;}if(c===open)d++;else if(c===close){d--;if(d===0)return src.slice(start,i+1);}}throw new Error(`unbalanced ${open}${close}`)}
function findLocale(src,loc){const base=src.indexOf('const copy=');const p=src.indexOf(`${loc}:{`,base);if(p<0)throw new Error(`missing locale ${loc}`);const b=src.indexOf('{',p);return scanBalanced(src,b,'{','}');}
function findArray(block,key){const p=block.indexOf(`${key}:[`);if(p<0)throw new Error(`missing ${key}`);const b=block.indexOf('[',p);return scanBalanced(block,b,'[',']');}
function topItems(arr){let d=0,q=null,esc=false,count=0,has=false;for(let i=1;i<arr.length-1;i++){const c=arr[i];if(q){if(esc)esc=false;else if(c==='\\')esc=true;else if(c===q)q=null;continue;}if(c==='\''||c==='"'||c==='`'){q=c;has=true;continue;}if(c==='['||c==='{'||c==='('){d++;has=true;}else if(c===']'||c==='}'||c===')')d--;else if(c===','&&d===0){count++;has=false;}else if(!/\s/.test(c))has=true;}return arr.slice(1,-1).trim()?count+1:0;}
function chars(s){return [...s.replace(/\s+/g,'')].length;}

const [component,baselineFile,tool]=process.argv.slice(2);if(!component||!baselineFile||!tool)throw new Error('usage: component baseline tool');
const src=fs.readFileSync(component,'utf8');const baseline=JSON.parse(fs.readFileSync(baselineFile,'utf8'));let fail=0;
const check=(ok,msg)=>{console.log(`${ok?'PASS':'FAIL'} ${msg}`);if(!ok)fail++;};
for(const loc of ['ko','en','ja']){const block=findLocale(src,loc);for(const key of ['steps','notes','faqs']){const n=topItems(findArray(block,key));const min=baseline.locales[loc][key];check(n>=min,`${loc} ${key} ${n} >= ${min}`);}const nchar=chars(block);const minChars=Math.floor(baseline.locales[loc].chars*0.90);check(nchar>=minChars,`${loc} content chars ${nchar} >= ${minChars}`);}
check(src.includes('"@type":"FAQPage"')||src.includes("'@type':'FAQPage'")||src.includes('"@type": "FAQPage"'), 'FAQPage JSON-LD exists');
check(/mainEntity\s*:\s*t\.faqs\.map/.test(src), 'FAQ JSON-LD derives from visible FAQ data');
check(src.includes('toolbox-tool-expert-post'), 'expert content section exists');
check(src.includes('IMPORTANT NOTES'), 'important notes section exists');
check(src.includes('ToolboxFaqList'), 'shared FAQ component exists');
console.log(`VALUE CONTENT ${tool}: ${fail?'FAIL':'PASS'} (${fail} failures)`);process.exitCode=fail?1:0;
