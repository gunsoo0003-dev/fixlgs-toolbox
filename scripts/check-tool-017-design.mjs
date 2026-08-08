import { readFileSync } from 'node:fs';

const tool = readFileSync('components/image-watermark-tool.tsx','utf8');
const page = readFileSync('components/image-watermark-page.tsx','utf8');
const css = readFileSync('components/image-watermark-tool.css','utf8');
const globals = readFileSync('app/globals.css','utf8');

const checks = [
  ['001 workbench root', tool.includes('tool017-workbench toolbox-workbench')],
  ['001 upload container', tool.includes('toolbox-workbench-upload')],
  ['001 large empty dropzone', tool.includes('toolbox-upload-focus') && tool.includes('toolbox-upload-icon')],
  ['001 active upload state', tool.includes('toolbox-upload-active') && tool.includes('toolbox-upload-active-head')],
  ['first screen stays upload-only before files', tool.includes('{items.length > 0 ? <>') && !tool.includes('tool017-local-strip')],
  ['output card aligns to editor inset', css.includes('.tool017-output{margin:0 28px 28px') && css.includes('.tool017-output{margin:0 22px 22px') && css.includes('.tool017-output{margin:0 20px 20px')],
  ['expert/practical guide section present', page.includes('toolbox-tool-format-guide toolbox-tool-expert-post tool017-examples')],
  ['external drag uses same blue-tint family as upload', css.includes('.tool017-editor.is-dragging{background:color-mix(in srgb,var(--blue) 7%,var(--tb-panel))}') && globals.includes('.toolbox-workbench-upload.is-dragging{background:color-mix(in srgb,var(--blue) 7%,var(--tb-panel));}')],
  ['editor uses common grid', tool.includes('toolbox-workbench-editor-grid')],
  ['file panel uses settings card', tool.includes('tool017-files toolbox-workbench-settings-card')],
  ['preview uses preview card', tool.includes('tool017-preview toolbox-workbench-preview-card')],
  ['settings uses settings card', tool.includes('tool017-settings toolbox-workbench-settings-card')],
  ['primary action uses common class', tool.includes('className="toolbox-primary-action"')],
  ['upload and editor external drop handlers', (tool.match(/onDrop=/g) ?? []).length >= 2 && tool.includes('externalDrag')],
  ['watermark pointer drag separated', tool.includes('dragRef') && tool.includes('setDragging') && tool.includes('setExternalDrag')],
  ['tool page 3-digit eyebrow', page.includes('017 · IMAGE EDIT')],
  ['next work common structure', page.includes('className="toolbox-next-work"') && page.indexOf('className="toolbox-next-work"') > page.indexOf('<ImageWatermarkTool')],
  ['how-to common heading', page.includes('toolbox-tool-guide tool017-how-to tool013-how-to-grid') && page.includes('toolbox-tool-guide-head')],
  ['how-to multirow column dividers', page.includes('tool013-how-to-grid') && globals.includes('.tool013-how-to-grid li:nth-child(3n+1)') && globals.includes('border-right:1px solid rgba(255,255,255,.28)!important')],
  ['faq common heading', page.includes('toolbox-tool-faq tool017-faq') && page.includes('toolbox-tool-guide-head')],
  ['dedicated CSS imported', page.includes('import "@/components/image-watermark-tool.css"')],
  ['editor spacing matches established 3-column rhythm', css.includes('gap:16px') && css.includes('padding:28px') && css.includes('background:var(--tb-soft)')],
  ['panels use adaptive panel/line variables', css.includes('.tool017-files,.tool017-settings,.tool017-preview{overflow:hidden;border:1px solid var(--tb-line)') && css.includes('.tool017-files,.tool017-settings{padding:20px;background:var(--tb-panel)')],
  ['preview original/result active state visible', css.includes('.tool017-preview-actions button.is-active{border-color:var(--blue)')],
  ['preview original/result also has non-color selected mark', tool.includes('aria-pressed={showOriginal}') && tool.includes('aria-pressed={!showOriginal}') && tool.includes('tool017-active-mark')],
  ['representative file has non-color selected mark', tool.includes('tool017-representative-mark') && tool.includes('t.representative')],
  ['preview selection outline exists for low-opacity watermark', tool.includes('function drawPreviewSelection') && tool.includes('drawPreviewSelection(ctx, bounds)')],
  ['single-position controls hidden during repeat', tool.includes('{settings.repeatMode === "off" ? (') && tool.includes('tool017-position-card') && tool.includes('data-testid="tool017-repeat-off"')],
  ['final PC horizontal order is repeat-secondary then position then output', tool.indexOf('tool017-repeat-secondary-card') < tool.indexOf('tool017-position-card') && tool.indexOf('tool017-position-card') < tool.indexOf('tool017-export-card')],
  ['repeat density precedes gap controls', tool.indexOf('<label>{t.density}') < tool.indexOf('<label>{t.gapX}')],
  ['primary position presets are labelled', tool.includes('aria-label={`${t.position}: ${positionPresetLabels[locale][preset]}`}')],
  ['secondary position presets are labelled', tool.includes('aria-label={`${t.secondWatermark} · ${t.position}: ${positionPresetLabels[locale][preset]}`}')],
  ['obsolete undefined 017 classes removed', !tool.includes('tool017-shadow-settings') && !page.includes('tool017-next-work')],
  ['disabled action state visible', css.includes('.tool017-output .toolbox-workbench-actions button:disabled{opacity:.45')],
  ['responsive preview-first order', css.includes('.tool017-preview{order:1}') && css.includes('.tool017-settings{order:2}') && css.includes('.tool017-files{order:3}')],
  ['mobile editor padding', css.includes('@media(max-width:640px)') && css.includes('.tool017-editor{padding:20px}')],
  ['ko semantic wrapping protected', css.includes('.toolbox-locale-ko .tool017-detail-hero .toolbox-tool-detail-heading h1') && css.includes('word-break:keep-all')],
  ['ja long heading wrapping protected', css.includes('.toolbox-locale-ja .tool017-detail-hero .toolbox-tool-detail-heading h1') && css.includes('overflow-wrap:anywhere')],
  ['preview header actions can wrap at medium widths', css.includes('.tool017-preview-actions{flex-wrap:wrap;justify-content:flex-end}')],
  ['long preset labels can wrap safely', css.includes('.tool017-segment button,.tool017-grid-presets button{white-space:normal;overflow-wrap:anywhere;line-height:1.35}')],
  ['checkerboard adapts to theme tokens', css.includes('.tool017-canvas-wrap{background-color:var(--tb-soft)') && css.includes('color-mix(in srgb,var(--tb-muted) 22%,transparent)')],
  ['dark error/failure contrast hardened', css.includes('html[data-theme="dark"] .tool017-error') && css.includes('color:#fdba74') && css.includes('html[data-theme="dark"] .tool017-status-chip.is-completed')],
  ['no hardcoded Santorini blue in dedicated CSS', !css.includes('#0868D7')],
  ['no hardcoded black border tokens in dedicated CSS', !/border:[^;]*rgba\(17,24,39/.test(css)],
  ['no 017 selector leaked into globals', !globals.includes('.tool017-')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('017 DESIGN STATIC CHECK: FAIL');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}
console.log('017 DESIGN STATIC CHECK: PASS');
for (const [name] of checks) console.log(`- ${name}`);
