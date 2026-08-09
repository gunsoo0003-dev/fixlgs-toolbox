import fs from 'node:fs';
import path from 'node:path';
const root=path.join(process.cwd(),'test-fixtures','tool-021');
function dims(buf){
  if(buf.length>=24 && buf.subarray(1,4).toString('ascii')==='PNG') return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
  if(buf.length>=4 && buf[0]===0xff && buf[1]===0xd8){
    let o=2; const sof=new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
    while(o+8<=buf.length){ if(buf[o]!==0xff){o++;continue;} const m=buf[o+1]; o+=2; if(m===0xd8||m===0xd9||m===0x01||(m>=0xd0&&m<=0xd7))continue; if(o+2>buf.length)break; const len=buf.readUInt16BE(o); if(len<2||o+len>buf.length)break; if(sof.has(m)&&len>=7)return {height:buf.readUInt16BE(o+3),width:buf.readUInt16BE(o+5)}; o+=len; }
  }
  if(buf.length>=30 && buf.subarray(0,4).toString('ascii')==='RIFF' && buf.subarray(8,12).toString('ascii')==='WEBP'){
    const chunk=buf.subarray(12,16).toString('ascii');
    if(chunk==='VP8X') return {width:1+buf[24]+(buf[25]<<8)+(buf[26]<<16),height:1+buf[27]+(buf[28]<<8)+(buf[29]<<16)};
    if(chunk==='VP8 ') return {width:buf.readUInt16LE(26)&0x3fff,height:buf.readUInt16LE(28)&0x3fff};
    if(chunk==='VP8L' && buf[20]===0x2f){const bits=buf.readUInt32LE(21);return {width:(bits&0x3fff)+1,height:((bits>>14)&0x3fff)+1};}
  }
  return null;
}
const cases=[
 ['landscape.jpg',1200,800],['portrait.jpg',800,1200],['transparent.png',640,640],['sample.webp',800,600],['large-30mp.jpg',6000,5000],['over-40mp.jpg',7000,6000],['animated.webp',320,240],['animated.png',320,240],
];
const rows=cases.map(([name,width,height])=>{const buf=fs.readFileSync(path.join(root,name));const got=dims(buf);return{name,expected:{width,height},got,pass:got?.width===width&&got?.height===height};});
const pass=rows.filter(r=>r.pass).length;
console.log(JSON.stringify({tool:'021',total:rows.length,pass,fail:rows.length-pass,rows},null,2));
process.exit(pass===rows.length?0:1);
