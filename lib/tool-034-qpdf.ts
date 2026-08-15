'use client';

type RunResult={bytes?:Uint8Array;stdout:string;stderr:string;exitCode:number};
async function makeModule(){
  const imported = await import('qpdf-wasm-esm-embedded');
  const stdout:string[]=[]; const stderr:string[]=[];
  const mod = await imported.default({noInitialRun:true,print:(s:string)=>stdout.push(String(s)),printErr:(s:string)=>stderr.push(String(s))});
  return {mod,stdout,stderr};
}
function safeUnlink(mod:any,path:string){try{mod.FS.unlink(path)}catch{}}
export async function runQpdf(bytes:Uint8Array,args:string[],expectOutput=true):Promise<RunResult>{
  const {mod,stdout,stderr}=await makeModule();
  const stamp=`${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const input=`/tool034-${stamp}-input.pdf`; const output=`/tool034-${stamp}-output.pdf`;
  mod.FS.writeFile(input,bytes);
  let exitCode=0;
  try{
    const finalArgs=args.map((x)=>x==='__INPUT__'?input:x==='__OUTPUT__'?output:x);
    const ret=mod.callMain(finalArgs); if(typeof ret==='number') exitCode=ret;
    const out=expectOutput?new Uint8Array(mod.FS.readFile(output)):undefined;
    return {bytes:out,stdout:stdout.join('\n'),stderr:stderr.join('\n'),exitCode};
  }catch(error){
    const code=Number((error as {status?:number})?.status); if(Number.isFinite(code)) exitCode=code;
    return {stdout:stdout.join('\n'),stderr:[stderr.join('\n'),String((error as Error)?.message||error)].filter(Boolean).join('\n'),exitCode:exitCode||2};
  }finally{safeUnlink(mod,input);safeUnlink(mod,output)}
}
export async function inspectEncryption(bytes:Uint8Array,password?:string){
  const args=['__INPUT__']; if(password!==undefined) args.push(`--password=${password}`); args.push('--show-encryption');
  const r=await runQpdf(bytes,args,false); const text=`${r.stdout}\n${r.stderr}`;
  const wrong=/invalid password|incorrect password|password supplied is incorrect|password required|requires? a password/i.test(text);
  const encrypted=wrong || (!/File is not encrypted/i.test(text) && (/encryption/i.test(text)||/R\s*=|P\s*=/i.test(text)));
  return {encrypted,wrong,text,exitCode:r.exitCode};
}
export async function decryptPdf(bytes:Uint8Array,password:string){
  const r=await runQpdf(bytes,['__INPUT__',`--password=${password}`,'--decrypt','__OUTPUT__']);
  if(!r.bytes||r.exitCode===2) throw new Error(/password/i.test(r.stderr)?'WRONG_PASSWORD':'QPDF_DECRYPT_FAIL');
  return r.bytes;
}
export async function encryptPdf(bytes:Uint8Array,password:string){
  const r=await runQpdf(bytes,['__INPUT__','--encrypt',password,password,'256','--','__OUTPUT__']);
  if(!r.bytes||r.exitCode===2) throw new Error('QPDF_ENCRYPT_FAIL');
  return r.bytes;
}
