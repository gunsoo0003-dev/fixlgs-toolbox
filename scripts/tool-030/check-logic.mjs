import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tool030-logic-'));
const require = createRequire(import.meta.url);
let tscCli;
try {
  tscCli = require.resolve('typescript/bin/tsc');
} catch {
  console.error('FAIL local TypeScript package not found. Run npm install first.');
  process.exit(1);
}
execFileSync(process.execPath, [tscCli,'lib/tool-030-pdf.ts','--target','ES2022','--module','CommonJS','--moduleResolution','Node','--outDir',tmp,'--skipLibCheck'], {stdio:'inherit'});
const mod = await import(`file://${path.join(tmp,'tool-030-pdf.js')}`);
let fail=0; const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)fail++;};
const p=(id,n)=>({id,sourcePageIndex:n-1,originalPageNumber:n,rotation:0,isDuplicate:false,isBlank:false,width:600,height:800});
const pages=[p('1',1),p('2',2),p('3',3),p('4',4)];
ok('normalize -90 -> 270', mod.normalizeRotation(-90)===270);
ok('normalize 450 -> 90', mod.normalizeRotation(450)===90);
ok('filename', mod.organizedFilename('sample.pdf')==='sample-organized.pdf');
ok('move first preserves selected order', mod.moveSelected(pages,new Set(['2','4']),'first').map(x=>x.id).join(',')==='2,4,1,3');
ok('move last preserves selected order', mod.moveSelected(pages,new Set(['2','4']),'last').map(x=>x.id).join(',')==='1,3,2,4');
ok('move up block', mod.moveSelected(pages,new Set(['2','3']),'up').map(x=>x.id).join(',')==='2,3,1,4');
ok('move down block', mod.moveSelected(pages,new Set(['2','3']),'down').map(x=>x.id).join(',')==='1,4,2,3');
const blank={id:'b',sourcePageIndex:null,originalPageNumber:null,rotation:0,isDuplicate:false,isBlank:true,width:600,height:800};
ok('insert blank before', mod.insertBlankPage(pages,new Set(['2']),'before',blank).map(x=>x.id).join(',')==='1,b,2,3,4');
ok('insert blank after', mod.insertBlankPage(pages,new Set(['2']),'after',blank).map(x=>x.id).join(',')==='1,2,b,3,4');
const s=mod.summarizeChanges([{...pages[0]}, {...pages[1],id:'2d',isDuplicate:true}, blank],4);
ok('summary duplicate',s.duplicates===1); ok('summary blank',s.blanks===1); ok('summary pages',s.pages===3);
process.exitCode=fail?1:0;
