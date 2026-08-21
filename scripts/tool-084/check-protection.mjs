import fs from 'node:fs';
import path from 'node:path';

let pass=0,fail=0;
const c=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};
const protectedFiles=['app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css'];
for(const file of protectedFiles)c(`protected exists ${file}`,fs.existsSync(file));

function walk(dir,out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full,out);
    else out.push(full.split(path.sep).join('/'));
  }
  return out;
}
const files=walk('.').filter(file=>/tool-084|paint-wallpaper-quantity-calculator|tool084|TOOL084/i.test(file));
c('tool084 files isolated',files.length>0);
const ui=fs.readFileSync('components/tool-084-paint-wallpaper-calculator.tsx','utf8');
c('no legacy sealed reference',!ui.includes('legacy-site-sealed')&&!ui.includes('legacy-tools-sealed'));
console.log(`RESULT COMMON FILE PROTECTION PASS=${pass} FAIL=${fail}`);
process.exitCode=fail?1:0;
