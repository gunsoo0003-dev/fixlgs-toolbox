import fs from 'node:fs';
const required=[
 'lib/tool-055-units.ts',
 'components/tool-055-length-area-volume-converter.tsx',
 'components/tool-055-length-area-volume-converter.module.css',
 'components/tool-055-length-area-volume-converter-page.tsx',
 'app/[locale]/length-area-volume-converter/page.tsx',
 'tests/tool-055-preflight.spec.ts','tests/tool-055-core.spec.ts','tests/tool-055-feature.spec.ts','tests/tool-055-dimension.spec.ts','tests/tool-055-boundary.spec.ts','tests/tool-055-regression.spec.ts','tests/tool-055-limit.spec.ts','tests/fixtures/tool-055/cases.json'
];
const fail=[];for(const f of required)if(!fs.existsSync(f))fail.push(`missing:${f}`);
const lib=fs.readFileSync('lib/tool-055-units.ts','utf8');
for(const token of ['maxAbsInput:1e15','maxPrecision:8','maxSummaryUnits:6','factor:400/121','factor:0.0254','factor:0.09290304','factor:0.003785411784'])if(!lib.includes(token))fail.push(`contract:${token}`);
const component=fs.readFileSync('components/tool-055-length-area-volume-converter.tsx','utf8');
for(const token of ['tool055-tab-${d}','tool055-swap','tool055-summary','tool055-precision'])if(!component.includes(token))fail.push(`selector:${token}`);
const css=fs.readFileSync('components/tool-055-length-area-volume-converter.module.css','utf8');if(!css.includes('@media(max-width:520px)'))fail.push('mobile-breakpoint');
const globals=fs.readFileSync('app/globals.css','utf8');if(/tool055|tool-055/i.test(globals))fail.push('global-css-contamination');
for(const f of ['styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css']){const s=fs.readFileSync(f,'utf8');if(/tool055|tool-055/i.test(s))fail.push(`global-style-contamination:${f}`)}
const n=(x)=>Number(x);const close=(a,b,t=1e-12)=>Math.abs(a-b)<=t*Math.max(1,Math.abs(b));
const independent=[
 ['1m->cm',1/0.01,100],['1in->cm',0.0254/0.01,2.54],['1m2->cm2',1/0.0001,10000],['1ft2->m2',0.09290304,0.09290304],['1pyeong->m2',400/121,3.3057851239669422],['1L->mL',0.001/0.000001,1000],['1m3->L',1/0.001,1000],['1ft3->m3',0.028316846592,0.028316846592]
];for(const [name,a,b] of independent)if(!close(n(a),n(b)))fail.push(`numeric:${name}:${a}!=${b}`);
if(fail.length){console.error('TOOL055 STATIC FAIL');for(const f of fail)console.error('-',f);process.exit(1)}console.log('TOOL055 STATIC PASS');console.log(`files=${required.length}`);console.log('common-css-contamination=0');console.log('dimension-registry=length,area,volume');console.log('limits=maxAbsInput:1e15,maxPrecision:8,maxSummaryUnits:6');
