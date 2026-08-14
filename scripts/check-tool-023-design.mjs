import fs from 'node:fs';
const page=fs.readFileSync('components/app-icon-favicon-generator-page.tsx','utf8');
const tool=fs.readFileSync('components/app-icon-favicon-generator-tool.tsx','utf8');
const css=fs.readFileSync('components/app-icon-favicon-generator-tool.module.css','utf8');
const globals=[fs.readFileSync('app/globals.css','utf8'),fs.readFileSync('styles/toolbox-common.css','utf8'),fs.readFileSync('styles/toolbox-detail-common.css','utf8')].join('\n');
const checks={
  hero:page.includes('toolbox-tool-detail-hero'),
  heroSingleLine:page.includes('toolbox-tool-detail-hero--single-line-description')&&globals.includes('.toolbox-tool-detail-hero--single-line-description'),
  howTo:page.includes('toolbox-tool-guide'),
  expert:page.includes('toolbox-tool-expert-post')&&page.includes('toolbox-tool-practical-grid'),
  expertDensity:page.includes("['출력 전에는 가장 작은 결과부터 검토'")&&page.includes("['배포 후에는 파일 교체와 표시 갱신을 분리'")&&page.includes("['Review the smallest outputs before shipping'")&&page.includes("['Separate file replacement from cache refresh'")&&page.includes("['最小サイズの結果から先に確認'")&&page.includes("['ファイル更新とキャッシュ更新を分けて確認'"),
  cautionSharedBand:page.includes('toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap')&&page.includes('toolbox-tool-info-band-list'),
  cautionNoLegacyFormatGuide:!page.includes('IMPORTANT NOTES</p><h2')||page.includes('toolbox-tool-info-band-head'),
  faq:page.includes('toolbox-tool-faq'),
  related:page.includes('RELATED TOOLS'),
  initialWorkspace022Contract:tool.includes('toolbox-workbench')&&tool.includes('toolbox-workbench-upload')&&tool.includes('toolbox-workbench-topline')&&tool.includes('toolbox-upload-focus')&&tool.includes('toolbox-upload-icon')&&tool.includes('tool023-start-card'),
  initialWorkspaceDrop:tool.includes('tool023-dropzone')&&tool.includes('onDragEnter')&&tool.includes('onDragOver')&&tool.includes('onDrop')&&tool.includes("dropEffect='copy'"),
  loadedWorkspaceDrop:tool.includes('tool023-workspace-dropzone')&&tool.includes('replaceDrop')&&tool.includes('onDrop'),
  resetSplit:tool.includes('tool023-reset-settings')&&tool.includes('reset(false)')&&tool.includes('tool023-reset-all')&&tool.includes('reset(true)'),
  safeAndroidOnly:tool.includes('tool023-safe-toggle')&&css.includes('.safeAndroid:after')&&!css.includes('.safePwa'),
  previewNormalized:css.includes('.previewFrame{width:min(100%,180px)')&&css.includes('.pwaVisual{width:min(100%,180px)')&&css.includes('.actual{width:min(100%,180px)'),
  faviconHiResPreview:css.includes('.faviconPreviewImage')&&css.includes('image-rendering:auto')&&!css.includes('image-rendering:pixelated'),
  mobile:css.includes('@media'),
  noDedicatedCommonCss:!globals.includes('.tool023-guide')&&!globals.includes('.tool023-expert')&&!globals.includes('.tool023-caution')&&!globals.includes('.tool023-notice')&&!globals.includes('.tool023-result-info')
};
let fail=false;for(const [k,v] of Object.entries(checks)){console.log(`${v?'PASS':'FAIL'} ${k}`);if(!v)fail=true;}process.exit(fail?1:0);
