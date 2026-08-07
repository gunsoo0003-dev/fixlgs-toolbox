import fs from 'node:fs';
import crypto from 'node:crypto';

const read=(file)=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const tool=read('components/image-mosaic-blur-tool.tsx');
const css=read('app/globals.css');
const page=read('components/image-mosaic-blur-page.tsx');
const site=read('lib/site.ts');
const sitemap=read('app/sitemap.ts');
const registry=read('lib/validation/tool-registry.ts');
const failures=[];
const requireText=(source,text,label)=>{if(!source.includes(text))failures.push(label)};

requireText(tool,'className="toolbox-workbench" data-testid="tool010-editor"','010 workbench shell missing');
requireText(tool,'className="mosaic-editor-grid toolbox-workbench-editor-grid"','001/009 editor grid not inherited');
requireText(tool,'className="mosaic-canvas-card toolbox-workbench-preview-card"','preview card structure missing');
requireText(tool,'className="mosaic-panel toolbox-workbench-settings-card"','settings card structure missing');
requireText(tool,'className="mosaic-output-card adjuster-output-card"','full-width output card structure missing');
requireText(tool,'className="toolbox-workbench-actions adjuster-output mosaic-output-controls"','output actions structure missing');
requireText(tool,'className="toolbox-workbench-result-card mosaic-result"','result card structure missing');
requireText(tool,'if(includeGuides&&showOriginal)','original view must affect preview only');
requireText(tool,'ec.globalCompositeOperation="destination-in"','brush/rectangle mask compositing missing');
requireText(tool,'working?:Snapshot','move/resize draft snapshot missing');
requireText(tool,'onPointerCancel={pointerCancel}','pointer cancellation handling missing');
requireText(css,'The 001/009 workbench shell remains the visual source of truth','design-source declaration missing');
requireText(page,'EXPERT POST','expert post missing');
requireText(site,'image-mosaic-blur-tool','site registration missing');
requireText(sitemap,'tool010Slug','010 sitemap registration missing');
requireText(registry,'image-mosaic-blur-tool','validation registry missing');
if(tool.includes('if(showOriginal)return'))failures.push('unsafe original-view export branch remains');

const protectedFiles=['components/image-converter-tool.tsx','components/image-brightness-color-adjuster-tool.tsx','tests/tool-009-image-adjuster.spec.ts','tests/tool-009-pixel-output.spec.ts'];
const hashes=protectedFiles.map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(new URL(`../${file}`,import.meta.url))).digest('hex')}));
if(failures.length){console.error(JSON.stringify({status:'FAIL',failures,protectedFiles:hashes},null,2));process.exit(1)}
console.log(JSON.stringify({status:'PASS',checks:17,protectedFiles:hashes},null,2));
