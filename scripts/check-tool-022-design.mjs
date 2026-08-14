import fs from 'node:fs';
const css=fs.readFileSync('components/blog-open-graph-image-maker.module.css','utf8');
const tool=fs.readFileSync('components/blog-open-graph-image-maker-tool.tsx','utf8');
const page=fs.readFileSync('components/blog-open-graph-image-maker-page.tsx','utf8');
const globals=[fs.readFileSync('app/globals.css','utf8'),fs.readFileSync('styles/toolbox-common.css','utf8'),fs.readFileSync('styles/toolbox-detail-common.css','utf8')].join('\n');
const checks={
  detailHero:page.includes('toolbox-tool-detail-hero')&&page.includes('toolbox-subpage-back')&&page.includes('toolbox-subpage-eyebrow')&&page.includes('toolbox-tool-detail-heading')&&page.includes('toolbox-tool-detail-badge'),
  detailBody:page.includes('toolbox-tool-detail-body'),
  nextWork:page.includes('NEXT WORK')&&page.includes('toolbox-next-work'),
  relatedTools:page.includes('RELATED TOOLS')&&page.includes('toolbox-related-tools'),
  howTo:page.includes('HOW TO USE')&&page.includes('toolbox-tool-guide'),
  formatGuide:page.includes('FORMAT GUIDE')&&page.includes('toolbox-tool-format-guide'),
  useCases:page.includes('USE CASES')&&page.includes('tool022-use-cases'),
  expertPost:page.includes('EXPERT POST')&&page.includes('tool022-expert-post'),
  importantNotes:page.includes('IMPORTANT NOTES')&&page.includes('toolbox-tool-info-band--section-start'),
  faq:page.includes('toolbox-tool-faq'),
  processingNote:page.includes('toolbox-tool-processing-note'),
  desktopGrid:css.includes('grid-template-columns:minmax(0,1.45fr)'),
  mobile:css.includes('@media(max-width:900px)'),
  mobilePresets:css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),
  primaryBlack:css.includes('background:#080808;color:#fff'),
  darkPrimary:css.includes('html[data-theme="dark"] .primary'),
  cards:css.includes('border-radius:22px'),
  mobileTabs:tool.includes('mobileTabs'),
  jaCopy:tool.includes('選択した画像を ZIP でダウンロード'),
  workspace021:css.includes('.localLine')&&css.includes('.workspaceDropFocus')&&css.includes('.workspaceUploadButton')&&css.includes('.blankStartRow')&&tool.includes('toolbox-workbench'),
  dragDrop:tool.includes('tool022-drop-zone')&&tool.includes('onDragEnter')&&tool.includes('onDragOver')&&tool.includes('onDrop')&&tool.includes("dropEffect='copy'"),
  howToSharedGrid:page.includes('toolbox-tool-guide--five')&&globals.includes('.toolbox-tool-guide--five ol')&&globals.includes('33.333333%')&&globals.includes('66.666667%'),
  howToNoToolOverride:!page.includes('pageStyles.howTo')&&!globals.includes('.tool022-howTo')&&!globals.includes('.tool022-guide'),
  expertSharedLayout:page.includes('toolbox-tool-practical-grid')&&page.includes('toolbox-tool-expert-post--wide-head')&&globals.includes('.toolbox-tool-expert-post--wide-head'),
  cautionSharedBand:page.includes('toolbox-tool-info-band--bottom-gap')&&globals.includes('.toolbox-tool-info-band--bottom-gap'),
};
for(const [k,v] of Object.entries(checks)) console.log(`${v?'PASS':'FAIL'} ${k}`);
if(Object.values(checks).some(v=>!v)) process.exit(1);

const exportPos=tool.indexOf('<h3>EXPORT</h3>');
const previewPos=tool.indexOf('<h3>{t.preview}</h3>');
const horizontalSettings=tool.includes('tool022-settings-horizontal') && css.includes('.settingsHorizontal{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))');
const exportBeforePreview=exportPos>=0 && previewPos>=0 && exportPos<previewPos;
console.log(`horizontalSettings=${horizontalSettings?'PASS':'FAIL'}`);
console.log(`exportBeforePreview=${exportBeforePreview?'PASS':'FAIL'}`);
if(!horizontalSettings||!exportBeforePreview) process.exitCode=1;
