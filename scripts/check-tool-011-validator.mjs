import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(), failures=[]; const exists=f=>fs.existsSync(path.join(root,f)); const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const specs=['tests/tool-011-image-padding-background.spec.ts','tests/tool-011-input-errors.spec.ts','tests/tool-011-rendering-output.spec.ts','tests/tool-011-device-theme.spec.ts','tests/tool-011-regression.spec.ts','tests/tool-011-limit.spec.ts','tests/tool-011-operational-limit.spec.ts','tests/helpers/tool-011.ts'];
for(const f of specs){if(!exists(f))failures.push(`missing ${f}`)}
const semantic=[
 ['core',['all-side and separate padding','square and ratio','solid transparent and blur','alignment, drag, scale and undo redo']],
 ['input',['zero byte corrupt unsupported','negative, text, decimal and over-range','EXIF orientation consistently']],
 ['output',['transparent padding stays alpha','JPG with transparent background','blur background fills canvas','JPG PNG WebP']],
 ['device',['tablet portrait','tablet landscape','mobile','light and dark themes','keyboard focus order']],
 ['regression',['001-010 routes','SEO sitemap robots category']],
 ['limit',['operational-limit-evidence','browserBlobGeneration','actualToolDownloadAtMaxPassed','physicalMobileDeviceVerified']],
];
const files={core:'tests/tool-011-image-padding-background.spec.ts',input:'tests/tool-011-input-errors.spec.ts',output:'tests/tool-011-rendering-output.spec.ts',device:'tests/tool-011-device-theme.spec.ts',regression:'tests/tool-011-regression.spec.ts',limit:'tests/tool-011-operational-limit.spec.ts'};
for(const [k,marks] of semantic){const s=read(files[k]);for(const m of marks)if(!s.includes(m))failures.push(`${k} marker ${m}`)}
const plan=read('docs/validation/tool-001-136-validation-plan.json'); for(const m of ['"number": "011"','"canvas-image-compose"','"transparency"','"exif_orientation"','"output_redecode"','"undo_redo"','"touch_gestures"','"history_limit"']) if(!plan.includes(m)) failures.push(`prevalidation marker ${m}`);

const coverage=JSON.parse(read('docs/011-validation-coverage.json')); if(coverage.requirements.length!==96)failures.push(`coverage count ${coverage.requirements.length}`); for(const r of coverage.requirements)if(!exists(r.validator))failures.push(`coverage validator missing ${r.id} ${r.validator}`);
const helper=read('tests/helpers/tool-011.ts'); for(const m of ['decodeDownloadedImage','dragCanvasPointer','pointerType'])if(!helper.includes(m))failures.push(`helper semantic ${m}`);
const pkg=JSON.parse(read('package.json')); for(const k of ['check:tool011-validator','check:tool011-source','test:toolbox:011-core','test:toolbox:011-input','test:toolbox:011-device','test:toolbox:011-regression','test:toolbox:011-limit','test:toolbox:011-final','test:toolbox:011-fast','test:toolbox:011-core-only','test:toolbox:011-boundary-only','test:toolbox:011-regression-only','test:toolbox:011-limit-only'])if(!pkg.scripts?.[k])failures.push(`package script ${k}`);
for(const f of ['scripts/run-tool-011-final-validation.mjs','scripts/run-tool-011-tier-validation.mjs','scripts/run-tool-011-partial-validation.mjs'])if(!exists(f))failures.push(`runner missing ${f}`);

if(failures.length){console.error(JSON.stringify({status:'FAIL',failures},null,2));process.exit(1)} console.log(JSON.stringify({status:'PASS',files:specs.length,semanticGroups:semantic.length,coverage:coverage.requirements.length,prevalidation:'011 canvas-image-compose confirmed'},null,2));
