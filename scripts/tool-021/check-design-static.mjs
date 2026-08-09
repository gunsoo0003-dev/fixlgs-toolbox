import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const css=fs.readFileSync(path.join(root,'components/social-media-image-maker-tool.module.css'),'utf8');
const tool=fs.readFileSync(path.join(root,'components/social-media-image-maker-tool.tsx'),'utf8');
const page=fs.readFileSync(path.join(root,'components/social-media-image-maker-page.tsx'),'utf8');
const refs=[
  fs.readFileSync(path.join(root,'components/add-text-to-image-tool.module.css'),'utf8'),
  fs.readFileSync(path.join(root,'components/image-watermark-tool.css'),'utf8'),
];
const checks=[
  ['theme-line', css.includes('var(--tb-line)'), 'uses shared TOOLBOX structural line variable'],
  ['theme-panel', css.includes('var(--tb-panel)'), 'uses shared TOOLBOX panel variable'],
  ['theme-soft', css.includes('var(--tb-soft)'), 'uses shared TOOLBOX soft-field variable'],
  ['theme-muted', css.includes('var(--tb-muted)'), 'uses shared TOOLBOX muted text variable'],
  ['theme-blue', css.includes('var(--blue)'), 'uses fixed Santorini blue variable'],
  ['no-legacy-local-vars', !/--toolbox-(?:line|card|muted)/.test(css), 'no private theme fallback that bypasses shared light/dark tokens'],
  ['mobile-pills', /\.pillRow\s*\{[\s\S]*?overflow-x:\s*auto;[\s\S]*?flex-wrap:\s*nowrap;/m.test(css), 'mobile preset pills are one horizontal scroll row'],
  ['edit-target-selector', tool.includes('data-testid="tool021-edit-targets"') && tool.includes('setEditTarget("background")') && tool.includes('setEditTarget("logo")'), 'compact edit-target selector remains available for direct drag while redundant quick-align controls are removed'],
  ['focus-visible', css.includes(':focus-visible'), 'keyboard focus styling exists'],
  ['file-input-keyboard', css.includes('.visuallyHidden') && css.includes(':focus-within') && tool.includes('className={styles.visuallyHidden}'), 'file pickers stay keyboard-focusable instead of hidden attribute'],
  ['interactive-group-semantics', tool.includes('className={styles.fieldGroup} role="group" aria-label={t.align}') && !/<label>[\s\S]{0,180}<button aria-pressed={common\.textAlign/.test(tool), 'alignment buttons are not nested inside a label'],
  ['canvas-explicit-result', css.includes('background: #ffffff;'), 'preview canvas keeps explicit result surface independent of app theme'],
  ['reference-alignment', refs.every((src)=>src.includes('var(--tb-line)') && src.includes('var(--tb-panel)')), 'aligned to verified 016/017 token system'],
  ['page-toolbox-shell', page.includes('toolbox-tool-detail-body') || page.includes('toolbox-tool-detail-hero'), 'page uses established TOOLBOX detail shell'],
  ['scope-visible', tool.includes('scopeBadge') && tool.includes('aria-pressed={scope === "preset"}'), 'common/current-size editing scope remains explicit'],
];
const rows=checks.map(([id,ok,detail])=>({id,pass:Boolean(ok),detail}));
const result={tool:'021',total:rows.length,pass:rows.filter(r=>r.pass).length,fail:rows.filter(r=>!r.pass).length,rows};
console.log(JSON.stringify(result,null,2));
process.exit(result.fail?1:0);
