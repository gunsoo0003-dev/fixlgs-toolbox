import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const failures=[];const need=(ok,msg)=>{if(!ok)failures.push(msg)};
const checklist=read('docs/tool-025/FINAL_VALIDATION_CHECKLIST_025.md');
const tool=read('components/id-passport-photo-maker-tool.tsx');
const css=read('components/id-passport-photo-maker-tool.module.css');
const policy=read('lib/tool-025-id-photo-policy.ts');
const core=read('tests/tool-025-core.spec.ts');
const boundary=read('tests/tool-025-boundary.spec.ts');
const feature=read('tests/tool-025-feature.spec.ts');
const designState=read('tests/tool-025-design-state.spec.ts');
const regression=read('tests/tool-025-regression.spec.ts');
const limit=read('tests/tool-025-limit.spec.ts');
const runner=read('scripts/tool-025/run-validation.mjs');
const mobileRunner=read('scripts/run-mobile-real-photo-001-025.mjs');
const mobileCheck=read('scripts/check-mobile-real-photo-validator.mjs');
const mobileAudit=read('scripts/audit-mobile-real-photo-source-map.mjs');
const packageJson=read('package.json');

for(const heading of ['A. 024 디자인/드롭 상태 이식','B. 확정 레이아웃','C. EXPORT/A4/ALIGN','D. 증명사진/여권사진 기능','E. 파일 입력/안정성/한도','F. 다국어/콘텐츠/통합','G. 검수기 자체 완료 기준','H. 실행 전제']) need(checklist.includes(heading),`checklist heading missing: ${heading}`);
need(!checklist.includes('- [ ]'),'unchecked checklist item remains');

for(const token of ['styles.dropzoneReady','dropDragging||workspaceDragging','data-testid="tool025-workspace-dropzone"','void acceptFile(e.dataTransfer.files[0])','StableMobileImageFileInput','mobileCaptureMode="pixels"','data-testid="tool025-download"','data-testid="tool025-a4-download"','data-testid="tool025-reset-settings"','data-testid="tool025-reset-all"','<canvas ref={a4PreviewRef}']) need(tool.includes(token),`product contract missing: ${token}`);
for(const token of ['.dropzoneReady{padding:18px 24px','.dropzoneReady::before{content:none;display:none}','workspaceDragging::after','previewPanel{grid-column:1/3','presetPanel{grid-column:3','lowerGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))','canvasWrap{position:relative;min-height:620px']) need(css.includes(token),`design CSS contract missing: ${token}`);
for(const token of ['kr-passport-print','kr-passport-online','us-passport-print','jp-passport-print','uk-passport-print','ca-passport-print','maxFileBytes: 15 * 1024 * 1024','maxSourcePixels: 40_000_000']) need(policy.includes(token),`policy contract missing: ${token}`);

need(core.includes("for (const locale of ['ko','en','ja'])"),'core must cover KO/EN/JA');
for(const [name,spec] of [['core',core],['boundary',boundary],['regression',regression],['limit',limit]]){need(spec.includes("getByTestId('tool025-file-input').setInputFiles"),`${name} must use stable mounted file-input selector`);need(!spec.includes("getByTestId('tool025-dropzone').locator('input"),`${name} contains stale nested dropzone input selector`)}
for(const token of ['corrupt.jpg','animated.webp','animated-apng.png']) need(boundary.includes(token),`boundary fixture missing: ${token}`);
for(const token of ['500 * 1024','kr-passport-online-413x531\\.jpg','selectOption(\'png\')']) need(feature.includes(token),`feature coverage missing: ${token}`);
for(const token of ['dropzoneReady','workspaceDragging','tool025-workspace-dropzone','dragenter','dragleave']) need(designState.includes(token),`runtime design-state coverage missing: ${token}`);
need(regression.includes("024 · CONTENT IMAGE"),'regression 024 residue guard missing');
for(const token of ['limit-40mp.jpg','limit-over-40mp.jpg']) need(limit.includes(token),`limit fixture missing: ${token}`);
for(const token of ['check-final-checklist.mjs','tests/tool-025-design-state.spec.ts','production-build','feature-design-state','SKIP=0','Desktop']) need(runner.includes(token),`runner contract missing: ${token}`);
for(const token of ["t(25,'id-passport-photo-maker'",'tool025-file-input','tool025-dropzone','tool025-workspace-dropzone','tool025-preview','TOOL025_INDIVIDUAL_DOWNLOAD','TOOL025_A4_DOWNLOAD','fatal-harness.json','TOOLBOX_MOBILE_REALPHOTO_001_025_${stamp}','resolveTool025Base','HARNESS_WEB_ROUTE_NOT_AVAILABLE','no server spawn']) need(mobileRunner.includes(token),`mobile runner contract missing: ${token}`);
need((mobileRunner.match(/\bt\((\d+),/g)||[]).length===25,'mobile runner must register 25 tools');
for(const token of ['tool definitions != 25','missing TOOL','TOOL025 id-passport workflow missing','run-mobile-real-photo-001-025.mjs']) need(mobileCheck.includes(token),`mobile self-check contract missing: ${token}`);
for(const token of ["['025','components/id-passport-photo-maker-tool.tsx'",'tool025-a4-download','MOBILE_REALPHOTO_001_025_SOURCE_AUDIT.json']) need(mobileAudit.includes(token),`mobile source audit contract missing: ${token}`);
for(const token of ['test:toolbox:025-mobile-real','test:toolbox:mobile-real-photo-001-025','check:toolbox:mobile-real-photo']) need(packageJson.includes(token),`package mobile script missing: ${token}`);

if(failures.length){console.error('FINAL CHECKLIST FAIL');for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log('FINAL CHECKLIST PASS');
