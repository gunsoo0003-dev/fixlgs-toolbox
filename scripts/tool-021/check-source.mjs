import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const file = path.join(root, 'components/social-media-image-maker-tool.tsx');
const page = path.join(root, 'components/social-media-image-maker-page.tsx');
const css = path.join(root, 'components/social-media-image-maker-tool.module.css');
const src = fs.readFileSync(file, 'utf8');
const pageSrc = fs.readFileSync(page, 'utf8');
const cssSrc = fs.readFileSync(css, 'utf8');

const checks = [];
function check(id, ok, detail) { checks.push({id, ok:Boolean(ok), detail}); }
function has(pattern) { return pattern instanceof RegExp ? pattern.test(src) : src.includes(pattern); }

const expected = [
  ['instagram-post',1080,1350],
  ['instagram-story',1080,1920],
  ['facebook-feed',1080,1350],
  ['x-post',1200,675],
  ['linkedin-post',1200,1200],
];
for (const [id,w,h] of expected) {
  check(`preset-${id}`, src.includes(`id: "${id}"`) && src.includes(`width: ${w}`) && src.includes(`height: ${h}`), `${id} ${w}x${h}`);
}
check('common-override', has('type PresetOverride') && has('resolveState') && has('overrides[preset.id]'), 'common + per-preset state');
check('title-size-override', has('titleSize') && /PresetOverride[\s\S]{0,240}titleSize/.test(src), 'per-preset title size');
check('subtitle-size-override', has('subtitleSize') && /PresetOverride[\s\S]{0,260}subtitleSize/.test(src), 'per-preset subtitle size');
check('no-stretch', has('Math.max(width / background.width, height / background.height)'), 'cover scale preserves aspect ratio');
check('text-anchor', has('const anchorX = x;') && has('ctx.fillText(line, anchorX') && !has('x + width / 2'), 'text alignment uses normalized anchor without double offset');
check('normalized-crop', has('cropX') && has('cropY') && has('min="-1" max="1"'), 'normalized crop range');
check('mime-cross-check', has('extensionMime') && has('sniffImageMime') && has('expectedMime !== actualMime') && has('file.type && file.type !== actualMime'), 'extension + declared MIME + binary signature mismatch');
check('animation-guard', has('detectUnsupportedAnimation') && has('"ANIM"') && has('"ANMF"') && has('"acTL"'), 'APNG/Animated WebP guard');
check('file-limit', has('maxBackgroundBytes: 20 * 1024 * 1024') && has('file.size > LIMITS.maxBackgroundBytes') && has('maxTitleChars: 120') && has('maxSubtitleChars: 240'), '20MB and 120/240 service limits');
check('pixel-limit', has('maxPixels: 40_000_000') && has('sniffImageDimensions') && has('headerDimensions.width * headerDimensions.height > LIMITS.maxPixels') && has('asset.width * asset.height > LIMITS.maxPixels'), '40MP pre-decode guard plus decoded defense-in-depth');
check('zero-selection', !has('previous.length === 1'), 'zero selection is reachable');
check('blob-dimension-verify', has('verifyBlobDimensions') && has('bitmap.width === preset.width') && has('bitmap.height === preset.height'), 'post-encode dimension check');
check('filename-sanitize', has('sanitizeFileName') && has('preset.suffix') && has('-sns-set.zip'), 'safe suffix-based filenames');
check('sequential-export', has('for (const preset of selectedPresets)') && !has('Promise.all(selectedPresets'), 'selected outputs render sequentially');
check('zip-partial-recovery', has('partialError') && has('const files: Array<{ name: string; blob: Blob }> = [];') && has('for (const file of files) downloadBlob(file.blob, file.name)'), 'successful outputs preserved and recovered individually');
check('drag', has('onPointerDown') && has('onPointerMove') && has('onDrag'), 'pointer drag');
check('keyboard', has('ArrowLeft') && has('ArrowRight') && has('ArrowUp') && has('ArrowDown'), 'arrow-key nudge');
check('quick-align-removed', !has('quickAlign("left")') && !has('quickAlign("bottom")'), 'redundant on-screen quick-align controls intentionally removed; drag and keyboard nudge remain');
check('aria-slider', has('aria-label={`${t.backgroundPosition} ${t.x}`}') && has('aria-label={t.zoom}') && has('aria-label={`${t.titlePosition} ${t.x}`}') && has('aria-label={t.imageQuality}'), 'all important range controls have accessible names');
check('aria-preview', has('aria-pressed={active}') && has('aria-pressed={editTarget === "background"}') && has('aria-pressed={scope === "common"}'), 'preview/editor selection semantics');
check('role-alert', has('role="alert"'), 'errors announced');
const pillBlock = src.slice(src.indexOf('className={styles.pillRow}'), src.indexOf('className={styles.editorGrid}'));
check('no-nested-interactive', pillBlock.indexOf('</button>') >= 0 && pillBlock.indexOf('<label className={styles.checkboxWrap}>') > pillBlock.indexOf('</button>'), 'preset selector keeps checkbox outside selection button');
check('dimension-fallback', has('createImageBitmap') && has('image.naturalWidth === preset.width') && has('URL.revokeObjectURL(url)'), 'dimension verification has non-createImageBitmap fallback');
check('reset-controls', has('tool021-reset-preset') && has('tool021-reset-all') && has('delete next[selectedPresetId]'), 'preset-only and all reset controls');
check('continue-editing', has('tool021-continue-editing') && has('continueEditing'), 'explicit continue-editing action keeps the editor state');
check('mobile-pill-scroll', cssSrc.includes('overflow-x: auto') && cssSrc.includes('flex-wrap: nowrap') && cssSrc.includes('.pillRow'), 'mobile horizontal preset row');
check('local-only', !/fetch\(|XMLHttpRequest|axios|navigator\.sendBeacon/.test(src), 'no content upload/analytics calls');
check('object-url-lifecycle', src.includes('backgroundRef.current') && src.includes('logoRef.current') && src.includes('disposeAsset') && src.includes('URL.revokeObjectURL'), 'asset decoder resources are released on replace/reset/unmount');
check('download-url-revoke', has('function downloadBlob') && has('URL.createObjectURL(blob)') && has('URL.revokeObjectURL(url)'), 'download ZIP/image Blob URLs are explicitly revoked');
check('tab-visibility-no-reset', !/visibilitychange|document\.hidden|visibilityState/.test(src), 'no tab visibility handler resets editor state on background/return');
check('exif-orientation', has('createImageBitmap(file, { imageOrientation: "from-image" })') && has('tool021-bg-dimensions'), 'EXIF orientation explicitly requested in bitmap decoder');
check('residue-scan', !/data-testid=.{0,40}tool0(?:19|20|22)/.test(src) && !/tool-0(?:19|20)-/.test(src), 'no copied 019/020/022 selectors');
check('page-ko', pageSrc.includes('SNS 이미지 제작기'), 'KO page copy');
check('page-en', pageSrc.includes('Social Media Image Maker'), 'EN page copy');
check('page-ja', pageSrc.includes('SNS 画像作成ツール'), 'JA page copy');
check('structured-data', pageSrc.includes('WebApplication') && pageSrc.includes('FAQPage') && pageSrc.includes('BreadcrumbList'), 'JSON-LD');
check('related-active-only', pageSrc.includes('image-watermark-tool') && pageSrc.includes('add-text-to-image') && pageSrc.includes('image-metadata-checker'), 'existing related tools only');
check('next-022', pageSrc.includes('022') && pageSrc.includes('Blog & Open Graph Image Maker'), 'next work');

const failed = checks.filter(c => !c.ok);
const out = { tool:'021', checkedAt:new Date().toISOString(), sourceSha256:crypto.createHash('sha256').update(src).digest('hex'), total:checks.length, pass:checks.length-failed.length, fail:failed.length, checks };
console.log(JSON.stringify(out, null, 2));
if (failed.length) process.exit(1);
