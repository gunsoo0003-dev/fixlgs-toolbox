#!/usr/bin/env node
import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const errors=[];
const site=read('lib/site.ts'), sitemap=read('app/sitemap.ts'), tool=read('components/pdf-page-number-watermark-tool.tsx'), css=read('components/pdf-page-number-watermark-tool.module.css'), page=read('components/pdf-page-number-watermark-page.tsx'), pkg=JSON.parse(read('package.json'));
for(const x of ['tool031Slug = "pdf-page-number-watermark"','tool031Titles','tool031Descriptions']) if(!site.includes(x)) errors.push(`site missing ${x}`);
for(const x of ['tool031Slug','${baseUrl}/${locale}/${tool031Slug}']) if(!sitemap.includes(x)) errors.push(`sitemap missing ${x}`);
for(const x of ['tool031-root','tool031-dropzone','tool031-file-info','tool031-workspace','workspaceDragging','data-drop-target="pdf-replace"','data-drag-active','tool031-create','tool031-result','tool031-download']) if(!tool.includes(x)) errors.push(`state/selector missing ${x}`);
for(const x of ['uploadedFileBar','uploadedFileInfo','workspaceDragging','dragging','chooseButton']) if(!css.includes(x)) errors.push(`css state missing ${x}`);
if(page.includes('pdf-page-organizer`,disabled:true')) errors.push('TOOL030 related card is stale disabled');
if(pkg.dependencies?.['pdf-lib']!=='1.17.1') errors.push(`pdf-lib dependency mismatch: ${pkg.dependencies?.['pdf-lib']}`);
for(const f of ['scripts/run-mobile-real-photo-001-031.mjs','scripts/check-mobile-real-photo-001-031-validator.mjs']) if(!fs.existsSync(f)) errors.push(`missing ${f}`);
if(errors.length){for(const e of errors)console.error('[FAIL]',e);process.exit(1)}
console.log('[PASS] TOOL031 integration/design/state/package contract');
