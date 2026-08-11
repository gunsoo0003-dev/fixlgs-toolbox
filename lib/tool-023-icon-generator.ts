import { materializeImageBlob } from "@/lib/mobile-file-materializer";
export const TOOL023_MAX_BYTES = 20 * 1024 * 1024;
export const TOOL023_MAX_PIXELS = 40_000_000;
export const ANDROID_SIZES = [48,72,96,144,192] as const;
export const FAVICON_SIZES = [16,32,48] as const;
export const PWA_SIZES = [192,512] as const;
export type FitMode = 'contain'|'cover';
export type Layout = { fit: FitMode; scale:number; x:number; y:number; background:string; transparent:boolean };

export function safeBaseName(name:string){
  return name.replace(/\.[^.]+$/,'').replace(/[<>:"/\\|?*\x00-\x1F]/g,'-').replace(/\.{2,}/g,'.').replace(/^[. -]+|[ .-]+$/g,'').trim().replace(/\s+/g,'-').toLowerCase() || 'icon';
}
export async function sniffImage(file:File){
  const b=new Uint8Array(await file.slice(0,16).arrayBuffer());
  const png=b.length>=8 && [137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v);
  const jpg=b[0]===0xff&&b[1]===0xd8&&b[2]===0xff;
  const webp=b.length>=12 && String.fromCharCode(...b.slice(0,4))==='RIFF' && String.fromCharCode(...b.slice(8,12))==='WEBP';
  return png?'image/png':jpg?'image/jpeg':webp?'image/webp':'';
}

export async function isAnimatedImage(file:File,mime:string){
  const bytes=new Uint8Array(await file.slice(0,256*1024).arrayBuffer());
  const text=new TextDecoder('latin1').decode(bytes);
  if(mime==='image/png') return text.includes('acTL');
  if(mime==='image/webp') return text.includes('ANIM') || text.includes('ANMF');
  return false;
}

export async function decodeImage(file:File){
  if(!file.size) throw new Error('EMPTY_FILE');
  if(file.size>TOOL023_MAX_BYTES) throw new Error('FILE_TOO_LARGE');
  const sniff=await sniffImage(file);
  if(!sniff || sniff!==file.type) throw new Error('MIME_MISMATCH');
  if(await isAnimatedImage(file,sniff)) throw new Error('ANIMATED_UNSUPPORTED');
  const materialized=await materializeImageBlob(file);
  const bitmap=await createImageBitmap(materialized,{imageOrientation:'from-image'});
  if(bitmap.width*bitmap.height>TOOL023_MAX_PIXELS){bitmap.close();throw new Error('PIXELS_TOO_LARGE');}
  return bitmap;
}
function canvasToBlob(canvas:HTMLCanvasElement,type='image/png',quality?:number){return new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('ENCODE_FAILED')),type,quality));}
export async function renderSquare(bitmap:ImageBitmap,size:number,layout:Layout,maskable=false){
  const c=document.createElement('canvas'); c.width=size;c.height=size; const ctx=c.getContext('2d',{alpha:true}); if(!ctx)throw new Error('CANVAS_FAILED');
  if(!layout.transparent || maskable){ctx.fillStyle=layout.background||'#ffffff';ctx.fillRect(0,0,size,size)}else ctx.clearRect(0,0,size,size);
  const contain=Math.min(size/bitmap.width,size/bitmap.height), cover=Math.max(size/bitmap.width,size/bitmap.height);
  const base=layout.fit==='cover'?cover:contain; const ratio=base*layout.scale;
  const w=bitmap.width*ratio,h=bitmap.height*ratio;
  const dx=(size-w)/2+layout.x*size,dy=(size-h)/2+layout.y*size;
  ctx.drawImage(bitmap,dx,dy,w,h);
  return canvasToBlob(c);
}
function u16(v:number){return [v&255,(v>>>8)&255]}
function u32(v:number){return [v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255]}
export async function makeIco(frames:{size:number;blob:Blob}[]){
  const payloads=await Promise.all(frames.map(async f=>({size:f.size,bytes:new Uint8Array(await f.blob.arrayBuffer())})));
  const head:number[]=[0,0,1,0,...u16(payloads.length)];
  let offset=6+16*payloads.length; const entries:number[]=[];
  for(const f of payloads){entries.push(f.size===256?0:f.size,f.size===256?0:f.size,0,0,1,0,32,0,...u32(f.bytes.length),...u32(offset));offset+=f.bytes.length;}
  const out=new Uint8Array(offset);out.set(head,0);out.set(entries,6);let p=6+entries.length;for(const f of payloads){out.set(f.bytes,p);p+=f.bytes.length}
  return new Blob([out],{type:'image/x-icon'});
}
function crc32(data:Uint8Array){let c=0xffffffff;for(const byte of data){c^=byte;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
function dosDateTime(){const d=new Date();const time=((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1))&0xffff;const date=(((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate())&0xffff;return {time,date}}
export async function makeZip(files:{path:string;blob:Blob}[]){
  const enc=new TextEncoder(); const locals:Uint8Array[]=[]; const centrals:Uint8Array[]=[]; let offset=0; const {time,date}=dosDateTime();
  for(const file of files){const name=enc.encode(file.path.replace(/^\/+|\.\.(\/|\\)/g,''));const data=new Uint8Array(await file.blob.arrayBuffer());const crc=crc32(data);
    const local=new Uint8Array(30+name.length+data.length);let p=0;const push=(a:number[])=>{local.set(a,p);p+=a.length};push([0x50,0x4b,0x03,0x04,20,0,0,0,0,0,...u16(time),...u16(date),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),0,0]);local.set(name,p);p+=name.length;local.set(data,p);locals.push(local);
    const central=new Uint8Array(46+name.length);p=0;const cpush=(a:number[])=>{central.set(a,p);p+=a.length};cpush([0x50,0x4b,0x01,0x14,0,20,0,0,0,0,0,...u16(time),...u16(date),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),0,0,0,0,0,0,0,0,0,0,0,...u32(offset)]);central.set(name,p);centrals.push(central);offset+=local.length;
  }
  const centralSize=centrals.reduce((n,x)=>n+x.length,0), end=new Uint8Array([0x50,0x4b,0x05,0x06,0,0,0,0,...u16(files.length),...u16(files.length),...u32(centralSize),...u32(offset),0,0]);
  const blobParts:BlobPart[]=[
    ...locals.map(bytes=>{const copy=new Uint8Array(bytes.byteLength);copy.set(bytes);return copy.buffer}),
    ...centrals.map(bytes=>{const copy=new Uint8Array(bytes.byteLength);copy.set(bytes);return copy.buffer}),
    (()=>{const copy=new Uint8Array(end.byteLength);copy.set(end);return copy.buffer})()
  ];
  return new Blob(blobParts,{type:'application/zip'});
}
export function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200)}
