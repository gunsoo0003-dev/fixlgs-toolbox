import fs from 'node:fs';

const tool = fs.readFileSync('components/image-merger-tool.tsx','utf8');
const page = fs.readFileSync('components/image-merger-page.tsx','utf8');
const route = fs.readFileSync('app/[locale]/[toolSlug]/page.tsx','utf8');
const site = fs.readFileSync('lib/site.ts','utf8');
const css = fs.readFileSync('app/globals.css','utf8');

const checks = [
  ['013 tool component', tool.includes('data-testid="tool013-workbench"')],
  ['001-style upload DOM', tool.includes('toolbox-tool-workflow') && tool.includes('toolbox-workbench-upload') && tool.includes('toolbox-workbench-topline') && tool.includes('toolbox-upload-focus') && tool.includes('toolbox-upload-icon')],
  ['multiple file input', tool.includes('multiple type="file"')],
  ['stable internal id', tool.includes('function uid()') && tool.includes('id:file') === false],
  ['supported jpg png webp', tool.includes('image/jpeg') && tool.includes('image/png') && tool.includes('image/webp')],
  ['signature validation', tool.includes('signatureOk(file)')],
  ['EXIF-aware decode', tool.includes('imageOrientation: "from-image"')],
  ['vertical horizontal merge', tool.includes('"vertical"') && tool.includes('"horizontal"')],
  ['original width height sizing', tool.includes('"original"') && tool.includes('"width"') && tool.includes('"height"')],
  ['aspect ratio preserved', tool.includes('item.height * w / item.width') && tool.includes('item.width * h / item.height')],
  ['upscale control', tool.includes('allowUpscale')],
  ['cross-axis alignment', tool.includes('align === "start"') && tool.includes('align === "end"')],
  ['gap number + slider', tool.includes('type="number"') && tool.includes('className="merger-range"')],
  ['outer padding', tool.includes('padding*2') && tool.includes('t.padding')],
  ['solid transparent background', tool.includes('Background = "solid" | "transparent"')],
  ['white black quick colors', tool.includes('t.white') && tool.includes('t.black')],
  ['png jpg webp output', tool.includes('OutputFormat = "png" | "jpg" | "webp"')],
  ['large canvas guard', tool.includes('MAX_SIDE_BLOCK') && tool.includes('MAX_PIXELS_BLOCK')],
  ['fit and actual pixel view separated', tool.includes('fitPreview') && tool.includes('viewActualPixels')],
  ['desktop reorder', tool.includes('draggable') && tool.includes('onDrop=')],
  ['mobile reorder controls', tool.includes('t.up') && tool.includes('t.down') && tool.includes('t.first') && tool.includes('t.last')],
  ['failed file retry preserves item until replacement', tool.includes('retryInputRef') && tool.includes('retryFailedFile') && !tool.includes('remove(item.id);setTimeout')],
  ['object URL cleanup', tool.includes('URL.revokeObjectURL')],
  ['image bitmap cleanup', tool.includes('closeRenderable') && tool.includes('target.url !== url')],
  ['three locale UI', tool.includes('ko: {') && tool.includes('en: {') && tool.includes('ja: {')],
  ['013 page detail hero', page.includes('toolbox-tool-detail-hero tool013-detail-hero') && page.includes('013 · IMAGE EDIT')],
  ['013 shell/contact appName', page.includes('<ToolboxSubpageShell locale={locale} appName={t.title}>') && !page.includes('currentSlug=') && !page.includes('backLabel=')],
  ['001-style guide flow', page.includes('tool013-how-to') && page.includes('tool013-format-guide') && page.includes('HOW TO USE') && page.includes('IMAGE MERGING GUIDE') && page.includes('MERGE ROUTES') && page.includes('PRACTICAL DETAILS')],
  ['HOW TO USE continuous 3-column rails', page.includes('tool013-how-to-grid') && css.includes('.tool013-how-to-grid ol') && css.includes('33.333333%') && css.includes('66.666667%') && css.includes('grid-template-columns:repeat(3,minmax(0,1fr))')],
  ['001-style FAQ initial count', page.includes('initialCount={5}')],
  ['013 wrapping overrides', css.includes('.tool013-format-guide') && css.includes('white-space:normal') && css.includes('.toolbox-locale-ko .tool013-format-guide') && css.includes('.toolbox-locale-ja .tool013-format-guide')],
  ['schema data', page.includes('WebApplication') && page.includes('FAQPage') && page.includes('BreadcrumbList')],
  ['route connection', route.includes('ImageMergerPage') && route.includes('tool013Slug')],
  ['site slug', site.includes('tool013Slug = "image-merger"')],
  ['013 responsive css', css.includes('.merger-workbench') && css.includes('@media(max-width:760px)')],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}\t${name}`);
  if (!ok) failed++;
}
console.log(`\nTOTAL ${checks.length} / PASS ${checks.length-failed} / FAIL ${failed}`);
process.exitCode = failed ? 1 : 0;
