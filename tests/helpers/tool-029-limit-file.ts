import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function createSizedValidPdf(sourcePath:string,targetBytes:number){
  const source=fs.readFileSync(sourcePath);
  const marker=Buffer.from('startxref');
  const index=source.lastIndexOf(marker);
  if(index<0) throw new Error('STARTXREF_NOT_FOUND');
  if(targetBytes<source.length) throw new Error('TARGET_TOO_SMALL');
  const need=targetBytes-source.length;
  const chunks:Buffer[]=[]; let remaining=need;
  while(remaining>0){
    const size=Math.min(1000,remaining);
    if(size===1) chunks.push(Buffer.from('\n'));
    else chunks.push(Buffer.from(`%${'A'.repeat(Math.max(0,size-2))}\n`).slice(0,size));
    remaining-=size;
  }
  const out=Buffer.concat([source.subarray(0,index),...chunks,source.subarray(index)]);
  if(out.length!==targetBytes) throw new Error(`SIZE_MISMATCH:${out.length}`);
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tool029-limit-'));
  const file=path.join(dir,`tool029-${targetBytes}.pdf`);fs.writeFileSync(file,out);
  return {file,cleanup:()=>fs.rmSync(dir,{recursive:true,force:true})};
}
