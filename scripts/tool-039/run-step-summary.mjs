import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const desktop = path.join(process.env.USERPROFILE || os.homedir(), 'Desktop');
const step = process.argv[2];
const commands = {
  static: ['scripts/tool-039/run-static-validation.mjs', []],
  main: ['scripts/tool-039/check-main-integration.mjs', []],
  source: ['scripts/check-tool-039-source.mjs', []],
};
if (!commands[step]) { console.error(`Unknown TOOL039 step: ${step}`); process.exit(2); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `tool039-summary-${step}-`));
const zipPath = path.join(desktop, `039_${step}_검수결과.zip`);
const summaryTxt = `TOOL 039 ${step}\n`;
const node = process.execPath;

function crc32(buf) { let c=0xffffffff; for (const b of buf) { c ^= b; for (let k=0;k<8;k++) c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1); } return (c^0xffffffff)>>>0; }
function zipDirectory(dir, out) {
  const files=[];
  const walk=(cur,rel='')=>{for(const e of fs.readdirSync(cur,{withFileTypes:true})){const abs=path.join(cur,e.name), r=rel?`${rel}/${e.name}`:e.name; if(e.isDirectory()) walk(abs,r); else files.push({abs,rel:r.replace(/\\/g,'/')});}};
  walk(dir);
  const local=[], central=[]; let offset=0;
  for(const f of files){const body=fs.readFileSync(f.abs), name=Buffer.from(f.rel), crc=crc32(body); const lh=Buffer.alloc(30); lh.writeUInt32LE(0x04034b50,0); lh.writeUInt16LE(20,4); lh.writeUInt16LE(0x0800,6); lh.writeUInt32LE(crc,14); lh.writeUInt32LE(body.length,18); lh.writeUInt32LE(body.length,22); lh.writeUInt16LE(name.length,26); local.push(lh,name,body); const ch=Buffer.alloc(46); ch.writeUInt32LE(0x02014b50,0); ch.writeUInt16LE(20,4); ch.writeUInt16LE(20,6); ch.writeUInt16LE(0x0800,8); ch.writeUInt32LE(crc,16); ch.writeUInt32LE(body.length,20); ch.writeUInt32LE(body.length,24); ch.writeUInt16LE(name.length,28); ch.writeUInt32LE(offset,42); central.push(ch,name); offset+=lh.length+name.length+body.length; }
  const size=central.reduce((n,b)=>n+b.length,0); const end=Buffer.alloc(22); end.writeUInt32LE(0x06054b50,0); end.writeUInt16LE(files.length,8); end.writeUInt16LE(files.length,10); end.writeUInt32LE(size,12); end.writeUInt32LE(offset,16); fs.writeFileSync(out,Buffer.concat([...local,...central,end]));
}

try {
  fs.mkdirSync(desktop,{recursive:true});
  const [script,args]=commands[step];
  const started=new Date().toISOString();
  const p=spawnSync(node,[script,...args],{cwd:root,encoding:'utf8',windowsHide:true,shell:false});
  const stdout=String(p.stdout??''); const stderr=String(p.stderr??''); const exitCode=typeof p.status==='number'?p.status:1;
  const status=exitCode===0?'PASS':'FAIL';
  const summary={tool:'039',step,status,exitCode,started,ended:new Date().toISOString(),stdout,stderr};
  fs.writeFileSync(path.join(tmp,'summary.txt'),`${summaryTxt}STATUS=${status}\nEXITCODE=${exitCode}\nSTART=${started}\nEND=${summary.ended}\n`,'utf8');
  fs.writeFileSync(path.join(tmp,'summary.json'),JSON.stringify(summary,null,2),'utf8');
  fs.writeFileSync(path.join(tmp,'output.log'),stdout,'utf8');
  fs.writeFileSync(path.join(tmp,'error.log'),stderr,'utf8');
  try{fs.unlinkSync(zipPath)}catch{}
  zipDirectory(tmp,zipPath);
  console.log(`${summaryTxt}STATUS=${status}\nEXITCODE=${exitCode}\nZIP=${zipPath}`.trim());
  process.exit(exitCode);
} catch (e) {
  const msg=e instanceof Error?e.message:String(e); const started=new Date().toISOString();
  fs.writeFileSync(path.join(tmp,'summary.txt'),`${summaryTxt}STATUS=FAIL\nEXITCODE=1\nERROR=${msg}\n`,'utf8');
  fs.writeFileSync(path.join(tmp,'summary.json'),JSON.stringify({tool:'039',step,status:'FAIL',exitCode:1,error:msg},null,2),'utf8');
  try{fs.unlinkSync(zipPath)}catch{}
  zipDirectory(tmp,zipPath);
  console.error(`${summaryTxt}STATUS=FAIL\nEXITCODE=1\nZIP=${zipPath}`.trim());
  process.exit(1);
} finally { try{fs.rmSync(tmp,{recursive:true,force:true})}catch{} }
