#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root=process.cwd();
const scriptPath=path.join(root,'scripts','run-mobile-real-photo-001-025.mjs');
const runner=fs.readFileSync(scriptPath,'utf8');
const specs=[
  ['001','components/image-converter-tool.tsx',['converter-file-input','converter-upload-button','converter-file-card','converter-run']],
  ['002','components/heic-avif-converter-tool.tsx',['heic-file-input','heic-file-card','heic-run']],
  ['003','components/svg-bmp-tiff-converter-tool.tsx',['svg-file-input','svg-file-card','svg-run']],
  ['004','components/image-compressor-tool.tsx',['compressor-file-input','compressor-file-card','compressor-run']],
  ['005','components/target-size-compressor-tool.tsx',['target-file-input','target-file-card','target-compress-button']],
  ['006','components/image-resizer-tool.tsx',['resizer-file-input','resizer-file-card','resizer-run']],
  ['007','components/web-image-optimizer-tool.tsx',['optimizer-file-input','optimizer-file-card','optimizer-run']],
  ['008','components/image-cropper-rotator-tool.tsx',['cropper-file-input','cropper-stage','cropper-download-zip']],
  ['009','components/image-brightness-color-adjuster-tool.tsx',['tool009-select','tool009-editor','tool009-preview-canvas','tool009-auto','tool009-download']],
  ['010','components/image-mosaic-blur-tool.tsx',['tool010-select','tool010-editor','tool010-canvas','tool010-applied-count','tool010-download']],
  ['011','components/image-padding-background-tool.tsx',['tool011-file','tool011-editor','tool011-canvas-wrap','tool011-download','tool011-result']],
  ['012','components/image-border-rounded-tool.tsx',['tool012-file','tool012-editor','tool012-border-toggle','tool012-download']],
  ['013','components/image-merger-tool.tsx',['tool013-file-input','tool013-file-card','tool013-download']],
  ['014','components/image-collage-maker-tool.tsx',['tool014-file-input','tool014-preview-canvas','tool014-download']],
  ['015','components/before-after-image-tool.tsx',['tool015-before-input','tool015-after-input','tool015-preview-canvas','tool015-state','tool015-download']],
  ['016','components/add-text-to-image-tool.tsx',['tool016-file-input','tool016-preview-canvas','tool016-content','tool016-download']],
  ['017','components/image-watermark-tool.tsx',['tool017-input','tool017-preview-canvas','tool017-text-input','tool017-process-all','tool017-download-current']],
  ['018','components/image-metadata-checker-tool.tsx',['tool018-input','tool018-result','tool018-basic-info']],
  ['019','components/youtube-thumbnail-maker-tool.tsx',['tool019-file-input','tool019-preview-canvas','tool019-title-text','tool019-output','tool019-download']],
  ['020','components/youtube-channel-banner-tool.tsx',['tool020-background-input','tool020-preview-canvas','tool020-title','tool020-output','tool020-download']],
  ['021','components/social-media-image-maker-tool.tsx',['tool021-background-input','tool021-interactive-preview','tool021-download-current','tool021-status']],
  ['022','components/blog-open-graph-image-maker-tool.tsx',['tool022-background-input','tool-022-root','tool022-download-current','tool022-status']],
  ['023','components/app-icon-favicon-generator-tool.tsx',['tool023-file-input','tool023-preview','tool023-generate','tool023-file-list','tool023-status']],
  ['024','components/app-store-screenshot-maker-tool.tsx',['tool024-dropzone','tool024-preview','tool024-result-count','tool024-export-zip']],
  ['025','components/id-passport-photo-maker-tool.tsx',['tool025-file-input','tool025-dropzone','tool025-workspace-dropzone','tool025-preview','tool025-output-size','tool025-a4-count','tool025-download','tool025-a4-download']],
];
const failures=[]; const report=[];
for(const [tool,rel,ids] of specs){
  const file=path.join(root,rel);
  if(!fs.existsSync(file)){failures.push(`TOOL${tool} source missing: ${rel}`);continue;}
  const src=fs.readFileSync(file,'utf8');
  const found=[];
  for(const id of ids){
    const dynamicSourceAlias = id==='tool019-title-text' ? 'tool019-${k}-text' : '';
    const sourceOk=src.includes(`data-testid=\"${id}\"`) || src.includes(`data-testid={'${id}'}`) || src.includes(`data-testid={\`${id}\``) || src.includes(id) || (dynamicSourceAlias && src.includes(dynamicSourceAlias));
    const runnerOk=runner.includes(id);
    found.push({id,sourceOk,runnerOk});
    if(!sourceOk)failures.push(`TOOL${tool} source token missing: ${id}`);
    if(!runnerOk)failures.push(`TOOL${tool} runner token missing: ${id}`);
  }
  report.push({tool,source:rel,checks:found});
}
// Source-derived service facts that must not be silently overridden by the validator.
const tool003=fs.readFileSync(path.join(root,'components/svg-bmp-tiff-converter-tool.tsx'),'utf8');
if(!/accept="\.svg,\.bmp,\.tif,\.tiff,image\/svg\+xml,image\/bmp,image\/tiff"/.test(tool003)) failures.push('TOOL003 accepted source types changed; re-audit fixed-photo policy');
if(!runner.includes('fixedGalleryInputUnsupported:true')) failures.push('TOOL003 source-input exception missing from runner');
if(!runner.includes('IMMEDIATE_SMALL_SCROLL')) failures.push('post-attachment immediate scroll state missing');
if(/sleep\(5000\)|setTimeout\([^,]+,\s*5000/.test(runner)) failures.push('fixed 5-second wait exists');
if(!runner.includes('discoverPhotoGrid')) failures.push('runtime Android media-grid discovery missing');
if(!runner.includes('snapshotNative')) failures.push('native UI evidence capture missing');
if(!runner.includes('TOOL018_SPECIAL_FAIL')) failures.push('TOOL018 special classification missing');
if(!runner.includes("uploads:2") || !runner.includes('tool015-before-input') || !runner.includes('tool015-after-input')) failures.push('multi-image source workflow missing');

fs.writeFileSync(path.join(root,'docs','MOBILE_REALPHOTO_001_025_SOURCE_AUDIT.json'),JSON.stringify({createdAt:new Date().toISOString(),report,failures},null,2));
console.log(`[SOURCE-AUDIT] tools=${report.length} failures=${failures.length}`);
for(const f of failures)console.error(`[FAIL] ${f}`);
if(failures.length)process.exit(1);
console.log('[PASS] 001~025 source workflow map matches validator');
