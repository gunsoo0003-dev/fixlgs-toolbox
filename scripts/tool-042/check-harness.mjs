import fs from "node:fs";

const read=p=>fs.readFileSync(p,"utf8");
const productPath="components/text-find-replace-tool.tsx";
const product=read(productPath);
const packageJson=JSON.parse(read("package.json"));
const config=read("playwright.tool042.config.ts");
const runner=read("scripts/tool-042/run-validation-full.mjs");
const staticRunner=read("scripts/tool-042/run-static-validation.mjs");
const specFiles=[
  "tests/tool-042-preflight.spec.ts",
  "tests/tool-042-core.spec.ts",
  "tests/tool-042-boundary.spec.ts",
  "tests/tool-042-feature.spec.ts",
  "tests/tool-042-regression.spec.ts",
  "tests/tool-042-limit.spec.ts",
];
let fail=0;
const check=(name,ok)=>{console.log(`[${ok?"PASS":"FAIL"}] ${name}`);if(!ok)fail++;};

for(const f of [productPath,"tests/helpers/tool-042.ts",...specFiles,"playwright.tool042.config.ts","scripts/tool-042/run-validation-full.mjs"]){
  check(`harness file ${f}`,fs.existsSync(f));
}

const staticIds=[
  "tool042-root","tool042-workspace","tool042-input","tool042-rules","tool042-result","tool042-run","tool042-case-sensitive",
  "tool042-total-count","tool042-copy","tool042-download","tool042-reset","tool042-add-rule","tool042-file-input","tool042-replace-dialog",
  "tool042-replace-cancel","tool042-replace-confirm","tool042-error","tool042-file-info"
];
for(const id of staticIds)check(`product selector ${id}`,product.includes(`data-testid="${id}"`));
for(const prefix of ["tool042-find-","tool042-replace-","tool042-remove-","tool042-rule-error-","tool042-count-"]){
  check(`dynamic selector ${prefix}*`,product.includes(`data-testid={\`${prefix}\${i}\`}`));
}

const allSpecs=specFiles.map(read).join("\n");
const literalIds=[...allSpecs.matchAll(/getByTestId\(["']([^"']+)["']\)/g)].map(m=>m[1]);
const dynamicPrefixes=["tool042-find-","tool042-replace-","tool042-remove-","tool042-rule-error-","tool042-count-"];
for(const id of [...new Set(literalIds)]){
  const exact=product.includes(`data-testid="${id}"`);
  const dynamic=dynamicPrefixes.some(prefix=>id.startsWith(prefix)&&product.includes(`data-testid={\`${prefix}\${i}\`}`));
  check(`spec selector resolves ${id}`,exact||dynamic);
}

const discovery=specFiles.reduce((sum,f)=>sum+(read(f).match(/\btest\s*\(/g)||[]).length,0);
check(`test discovery nonzero (${discovery})`,discovery>0);
check("no test.skip",!/(?:\btest|\bdescribe)\.skip\s*\(/.test(allSpecs));
check("no test.fixme",!/(?:\btest|\bdescribe)\.fixme\s*\(/.test(allSpecs));
check("no test.only",!/(?:\btest|\bdescribe)\.only\s*\(/.test(allSpecs));
check("desktop project",/desktop-chromium/.test(config));
check("mobile project",/mobile-chromium/.test(config));
check("KO EN JA runtime route coverage",/\["ko","en","ja"\]/.test(read("tests/tool-042-regression.spec.ts")));
check("localization self-check invoked",staticRunner.includes("check-localization.mjs"));
for(const [spec,name] of [["preflight","preflight"],["core","core"],["boundary","boundary"],["feature","feature"],["regression","regression"],["limit","limit"]]){
  check(`FINAL runner ${name}`,runner.includes(`tests/tool-042-${spec}.spec.ts`));
}
check("package FINAL script",packageJson.scripts?.["test:toolbox:042"]==="node scripts/tool-042/run-validation-full.mjs final");
check("bounded native injection helper",/Object\.getOwnPropertyDescriptor\(proto,"value"\)/.test(read("tests/helpers/tool-042.ts")));
check("stale disabled-run click removed",!/empty find[\s\S]{0,700}tool042-run"\)\.click/.test(read("tests/tool-042-boundary.spec.ts")));

console.log(`TOOL042 CHECKER SELF-CHECK ${fail?"FAIL":"PASS"} | discovery=${discovery} | failed=${fail}`);
process.exitCode=fail?1:0;
