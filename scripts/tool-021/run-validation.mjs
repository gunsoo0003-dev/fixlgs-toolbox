import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const mode=process.argv[2]||'preflight';
const allowed=new Set(['preflight','core-only','boundary-only','feature-only','regression-only','limit-only','final']);
if(!allowed.has(mode)){ console.error(`unknown mode: ${mode}`); process.exit(2); }
const root=process.cwd();
const outDir=fs.mkdtempSync(path.join(os.tmpdir(),`tool021-${mode}-`));
const results=[];

function run(name,cmd,args){
  const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8',env:process.env,shell:false});
  const spawnError=r.error ? `\nSPAWN_ERROR: ${r.error.message}` : '';
  const log=`$ ${cmd} ${args.join(' ')}\n${r.stdout||''}\n${r.stderr||''}${spawnError}`;
  fs.writeFileSync(path.join(outDir,`${name}.log`),log);
  results.push({name,status:r.status??1,error:r.error?.message??null});
  return !r.error && r.status===0;
}
function findPython(){
  for(const candidate of process.platform==='win32' ? [['python',[]],['py',['-3']]] : [['python3',[]],['python',[]]]){
    const r=spawnSync(candidate[0],[...candidate[1],'--version'],{encoding:'utf8',shell:false});
    if(!r.error && r.status===0) return candidate;
  }
  return null;
}
function runPython(name,script){
  const py=findPython();
  if(!py){
    fs.writeFileSync(path.join(outDir,`${name}.log`),'BLOCKED: Python 3 command not found. Tried platform-standard launchers.\n');
    results.push({name,status:89,error:'python-not-found'}); return false;
  }
  return run(name,py[0],[...py[1],script]);
}

// Minimal dependency-free ZIP writer (stored method) so Windows does not require a `zip` executable.
const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(buf){let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&0xff]^(c>>>8);return (c^0xffffffff)>>>0;}
function zipDirectory(dir,zipPath){
  const files=[];
  function walk(current,base=''){for(const ent of fs.readdirSync(current,{withFileTypes:true})){const abs=path.join(current,ent.name);const rel=base?`${base}/${ent.name}`:ent.name;if(ent.isDirectory())walk(abs,rel);else files.push({abs,rel:rel.replace(/\\/g,'/')});}}
  walk(dir);
  const local=[]; const central=[]; let offset=0;
  for(const f of files){const body=fs.readFileSync(f.abs);const name=Buffer.from(f.rel,'utf8');const crc=crc32(body);const lh=Buffer.alloc(30);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0x0800,6);lh.writeUInt16LE(0,8);lh.writeUInt32LE(crc,14);lh.writeUInt32LE(body.length,18);lh.writeUInt32LE(body.length,22);lh.writeUInt16LE(name.length,26);local.push(lh,name,body);
    const ch=Buffer.alloc(46);ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt16LE(0x0800,8);ch.writeUInt16LE(0,10);ch.writeUInt32LE(crc,16);ch.writeUInt32LE(body.length,20);ch.writeUInt32LE(body.length,24);ch.writeUInt16LE(name.length,28);ch.writeUInt32LE(offset,42);central.push(ch,name);offset+=lh.length+name.length+body.length;
  }
  const centralSize=central.reduce((n,b)=>n+b.length,0);const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(centralSize,12);end.writeUInt32LE(offset,16);fs.writeFileSync(zipPath,Buffer.concat([...local,...central,end]));
}

let ok=true;
ok=run('runner-contract','node',['scripts/tool-021/check-runner-contract.mjs'])&&ok;
ok=run('source','node',['scripts/tool-021/check-source.mjs'])&&ok;
ok=run('protected','node',['scripts/tool-021/check-protected.mjs'])&&ok;
ok=runPython('fixtures','scripts/tool-021/check-fixtures.py')&&ok;
ok=run('harness','node',['scripts/tool-021/check-harness.mjs'])&&ok;
ok=run('syntax','node',['scripts/tool-021/check-syntax.mjs'])&&ok;
ok=run('render-math','node',['scripts/tool-021/check-render-math.mjs'])&&ok;
ok=run('image-headers','node',['scripts/tool-021/check-image-headers.mjs'])&&ok;
ok=run('zip-engine','node',['--experimental-strip-types','scripts/tool-021/check-zip-engine.mjs'])&&ok;
ok=run('browser-kernel','node',['scripts/tool-021/check-browser-kernel.mjs'])&&ok;
ok=run('browser-layout','node',['scripts/tool-021/check-browser-layout.mjs'])&&ok;
ok=run('design-static','node',['scripts/tool-021/check-design-static.mjs'])&&ok;

const runtimeSpec={
 'core-only':'tests/tool-021-core.spec.ts','boundary-only':'tests/tool-021-boundary.spec.ts','feature-only':'tests/tool-021-design.spec.ts','regression-only':'tests/tool-021-regression.spec.ts','limit-only':'tests/tool-021-limit.spec.ts',
};
if(mode!=='preflight'){
  const nextBin=path.join(root,'node_modules','next','dist','bin','next');
  const pwCli=path.join(root,'node_modules','@playwright','test','cli.js');
  if(mode==='final'){
    if(!fs.existsSync(nextBin)){fs.writeFileSync(path.join(outDir,'build-blocked.log'),'BLOCKED: Next.js runtime is unavailable. Production build is required before READY.\n');results.push({name:'production-build',status:87});ok=false;}
    else ok=run('production-build','node',['scripts/tool-021/runtime-workspace.mjs','build'])&&ok;
  }
  if(!fs.existsSync(pwCli)){fs.writeFileSync(path.join(outDir,'runtime-blocked.log'),'BLOCKED: @playwright/test CLI is unavailable. Runtime validation is required before READY.\n');results.push({name:'playwright-runtime',status:88});ok=false;}
  else if(mode==='final') for(const spec of Object.values(runtimeSpec)) ok=run(`playwright-${path.basename(spec)}`,'node',[pwCli,'test',spec,'--workers=1','--config=playwright.tool021-runtime.config.ts'])&&ok;
  else ok=run('playwright-runtime','node',[pwCli,'test',runtimeSpec[mode],'--workers=1','--config=playwright.tool021-runtime.config.ts'])&&ok;
}

const pass=results.filter(x=>x.status===0).length;const fail=results.length-pass;
const summary=`TOOL 021 ${mode}\nPASS=${pass}\nFAIL=${fail}\nSTATUS=${ok?'PASS':'FAIL'}\n`;
fs.writeFileSync(path.join(outDir,'summary.txt'),summary);fs.writeFileSync(path.join(outDir,'summary.json'),JSON.stringify({tool:'021',mode,pass,fail,status:ok?'PASS':'FAIL',results},null,2));
const zipName=`021_${mode}_검수결과.zip`;
const desktopDir=path.join(os.homedir(),'Desktop');
const defaultResultDir=fs.existsSync(desktopDir) ? desktopDir : root;
const resultDir=process.env.TOOL021_RESULT_DIR ? path.resolve(process.env.TOOL021_RESULT_DIR) : defaultResultDir;
fs.mkdirSync(resultDir,{recursive:true});const zipPath=path.join(resultDir,zipName);try{fs.unlinkSync(zipPath);}catch{}
zipDirectory(outDir,zipPath);fs.rmSync(outDir,{recursive:true,force:true});
console.log(`${summary}ZIP=${zipPath}`);process.exit(ok?0:1);
