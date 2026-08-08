import { existsSync, readFileSync } from 'node:fs';

const required = [
  'components/image-watermark-tool.tsx',
  'components/image-watermark-page.tsx',
  'components/image-watermark-tool.css',
  'app/[locale]/[toolSlug]/page.tsx',
  'lib/site.ts',
  'app/sitemap.ts',
  'docs/tool-017/original/붙여넣은 마크다운(1)(20260808-050601).md',
];

const errors = [];
for (const file of required) if (!existsSync(file)) errors.push(`missing ${file}`);

function requireAll(source, needles, label) {
  for (const needle of needles) if (!source.includes(needle)) errors.push(`${label} missing: ${needle}`);
}
function forbidAny(source, needles, label) {
  for (const needle of needles) if (source.includes(needle)) errors.push(`${label} forbidden: ${needle}`);
}

if (!errors.length) {
  const tool = readFileSync(required[0], 'utf8');
  const page = readFileSync(required[1], 'utf8');
  const css = readFileSync(required[2], 'utf8');
  const route = readFileSync(required[3], 'utf8');
  const site = readFileSync(required[4], 'utf8');
  const sitemap = readFileSync(required[5], 'utf8');
  const originalSpec = readFileSync(required[6], 'utf8');
  const globals = readFileSync('app/globals.css', 'utf8');

  requireAll(tool, [
    'data-testid="tool017-root"', 'data-testid="tool017-preview-canvas"', 'data-testid="tool017-state"',
    'secondaryEnabled', 'processImages', 'downloadZipResults', 'makeUniqueOutputName',
    'maxFiles: 20', 'maxPerFile: 15 * 1024 * 1024', 'maxTotalBytes: 80 * 1024 * 1024',
    'maxPixelsPerFile: 24_000_000', 'maxOutputPixels: 24_000_000',
    'ctx.fillStyle = "#ffffff"', 'decodeImageFile(item.file)', 'PREVIEW_LIMITS.maxWidth', 'decoded.close()',
  ], 'base implementation contract');

  // Behavior-oriented static invariants: these intentionally inspect control flow and formulas,
  // not just feature-label strings.
  requireAll(tool, [
    'const densityScale = 100 / clamp(settings.density, 1, 1000)',
    '(itemWidth + (shortest * settings.gapX) / 100) * densityScale',
    '(itemHeight + (shortest * settings.gapY) / 100) * densityScale',
    'function resolveSupportedImageFormat',
    'mime === "image/jpeg" && (ext === "jpg" || ext === "jpeg")',
    'mime === "image/png" && ext === "png"',
    'mime === "image/webp" && ext === "webp"',
    'if (!resolveSupportedImageFormat(file)) throw new Error(t.unsupported)',
    'if (!resolveSupportedImageFormat(file)) {',
    'buildOutputName(item.file, filenameSuffix.trim(), outputFormat)',
    'buildOutputName(selectedItem.file, filenameSuffix.trim(), outputFormat)',
    'const beginContinuousEdit = useCallback',
    'const commitContinuousEdit = useCallback',
    'continuousHistoryRef.current = settingsRef.current',
    'setFuture([])',
    'if (isProcessing) return;',
    'setShowOriginal(false)',
    'for (const item of targets)',
    'await renderItemBlob(item, settings, secondarySettings, secondaryEnabled, logoImage, outputFormat, quality)',
    'result?.status === "completed" && result.blob && result.name',
  ], 'behavior contract');

  forbidAny(tool, [
    'const gapScale = settings.density / 100',
    'setProcessedCount(',
    'const [processedCount,',
    'buildOutputName(item.name,',
    'buildOutputName(selectedItem.name,',
    'image: HTMLImageElement',
    'item.image',
  ], 'regression contract');

  if ((tool.match(/onDrop=\{/g) || []).length < 2 || !tool.includes('tool017-editor toolbox-workbench-editor-grid ${externalDrag ? "is-dragging" : ""}')) {
    errors.push('expanded editor drag & drop contract missing');
  }

  requireAll(page, ['@/components/image-watermark-tool.css', '017 · IMAGE EDIT', 'FAQPage', 'BreadcrumbList', 'WebApplication', '기존 워터마크 제거 기능은 제공하지 않습니다.'], 'page contract');
  requireAll(page, ['Add Watermark to Images', '画像ウォーターマーク追加ツール'], 'localized page title contract');
  requireAll(site, ['export const tool017Slug = "image-watermark-tool"', 'status: "LIVE"', 'Add Watermark to Images', '画像ウォーターマーク追加ツール'], 'site contract');
  requireAll(route, ['tool017Slug', 'ImageWatermarkPage'], 'route contract');
  if (!sitemap.includes('${baseUrl}/${locale}/${tool017Slug}')) errors.push('sitemap tool017 URL missing');
  if (!css.includes('.tool017-workbench') || !css.includes('.tool017-editor')) errors.push('dedicated tool017 CSS contract missing');
  if (globals.includes('tool017')) errors.push('tool017-specific CSS residue remains in app/globals.css');
  requireAll(originalSpec, ['[웹도구 017. 이미지 워터마크 넣기 최종 제작 전달서]', '텍스트 워터마크', '로고 워터마크', '반복 워터마크'], 'original spec contract');
  if (/removeExistingWatermark|inpaint/i.test(tool)) errors.push('forbidden existing-watermark removal residue');
}

if (errors.length) {
  console.error('017 SOURCE CHECK: FAIL');
  errors.forEach((error) => console.error('-', error));
  process.exit(1);
}
console.log('017 SOURCE CHECK: PASS');
console.log('- behavior invariants: density direction / processing lock / history snapshot / MIME-extension policy / sequential result reuse');
console.log('- route: /ko|en|ja/image-watermark-tool');
console.log('- static service candidates: files=20, perFile=15MiB, total=80MiB, pixels=24MP');
