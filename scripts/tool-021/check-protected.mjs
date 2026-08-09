import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd();
const manifestPath=path.join(root,'scripts/tool-021/protected-baseline.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const hash=(file)=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const changed=[]; const missing=[];
for (const [rel,expected] of Object.entries(manifest)) {
  const file=path.join(root,rel);
  if(!fs.existsSync(file)){ missing.push(rel); continue; }
  const actual=hash(file);
  if(actual!==expected) changed.push({file:rel,expected,actual});
}
const intentional=[
 'components/social-media-image-maker-page.tsx',
 'components/social-media-image-maker-tool.tsx',
 'components/social-media-image-maker-tool.module.css',
 'lib/site.ts','app/[locale]/[toolSlug]/page.tsx','app/sitemap.ts','package.json'
];
const result={tool:'021',protectedFiles:Object.keys(manifest).length,missing,changed,intentional,status:missing.length||changed.length?'FAIL':'PASS'};
console.log(JSON.stringify(result,null,2));
if(missing.length||changed.length) process.exit(1);
