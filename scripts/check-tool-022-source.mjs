import fs from 'node:fs';
const files=['app/[locale]/blog-open-graph-image-maker/page.tsx','components/blog-open-graph-image-maker-page.tsx','components/blog-open-graph-image-maker-tool.tsx','components/blog-open-graph-image-maker.module.css','lib/tool-022-blog-og.ts'];
for(const f of files) if(!fs.existsSync(f)) throw new Error(`missing ${f}`);
const tool=fs.readFileSync(files[2],'utf8'), data=fs.readFileSync(files[4],'utf8'), page=fs.readFileSync(files[1],'utf8');
const checks={
  root:tool.includes('data-testid="tool-022-root"'),
  presets:['naver','blogger','website','og'].every(x=>data.includes(`id:'${x}'`)),
  og1200:data.includes("id:'og', width:1200, height:630"),
  noStretch:tool.includes('Math.max(dw/sw,dh/sh)*zoom'),
  override:tool.includes('setOverrides')&&tool.includes("'titleX'")&&tool.includes("'logoX'"),
  positions:['aria-label="title x"','aria-label="description x"','aria-label="logo x"'].every(x=>tool.includes(x)),
  formats:tool.includes("type Format='jpg'|'png'"),
  zip:tool.includes('createStoredZip'),
  zipFresh:tool.includes('const downloadZip=async()=>{try{const out=await makeResults();'),
  locale:['블로그·오픈그래프 이미지 제작기','Blog & Open Graph Image Maker','ブログ・OG 画像作成ツール'].every(x=>page.includes(x)),
  localOnly:page.includes('브라우저')&&page.includes('processed only in this browser'),
};
for(const [k,v] of Object.entries(checks)) console.log(`${v?'PASS':'FAIL'} ${k}`);
if(Object.values(checks).some(v=>!v)) process.exit(1);
