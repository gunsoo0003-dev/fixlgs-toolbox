import fs from 'node:fs';
import path from 'node:path';

function walk(dir,out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full,out);
    else out.push(full.split(path.sep).join('/'));
  }
  return out;
}

const roots=['lib','components','app','tests','scripts'];
const files=roots.flatMap(root=>walk(root)).filter(file=>/084|paint-wallpaper-quantity/i.test(file));
const bad=/(api[_-]?key\s*[:=]|secret\s*[:=]|bearer\s+[A-Za-z0-9._-]{16,})/i;
let fail=0;
for(const file of files){
  const s=fs.readFileSync(file,'utf8');
  if(bad.test(s)){console.log(`FAIL secret-like token ${file}`);fail++}
}
if(!fail)console.log(`PASS secret scan ${files.length} files`);
process.exitCode=fail?1:0;
