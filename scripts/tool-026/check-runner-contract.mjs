import fs from "node:fs";import path from "node:path";import { spawnSync } from "node:child_process";
const root=process.cwd();let fail=0;const need=(ok,msg)=>{console.log(ok?"PASS":"FAIL",msg);if(!ok)fail++;};
const files=['scripts/tool-026/run-validation.mjs','scripts/tool-026/runtime-workspace.mjs','playwright.tool026.config.ts','tests/tool-026-preflight.spec.ts','tests/tool-026-core.spec.ts','tests/tool-026-boundary.spec.ts','tests/tool-026-feature.spec.ts','tests/tool-026-design-state.spec.ts','tests/tool-026-regression.spec.ts','tests/tool-026-limit.spec.ts'];
for(const f of files)need(fs.existsSync(path.join(root,f)),`exists ${f}`);
for(const f of ['scripts/tool-026/run-validation.mjs','scripts/tool-026/runtime-workspace.mjs'])if(fs.existsSync(f)){const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});need(r.status===0,`syntax ${f}`);if(r.status!==0)console.error(r.stderr||r.stdout);}
const runner=fs.existsSync('scripts/tool-026/run-validation.mjs')?fs.readFileSync('scripts/tool-026/run-validation.mjs','utf8'):'';
need(runner.includes("node_modules', '@playwright', 'test', 'cli.js")||runner.includes("node_modules\", \"@playwright\", \"test\", \"cli.js"),"local Playwright CLI only");
need(!/\bnpx\b/.test(runner),"no interactive npx path");
need(runner.includes('zipDirectory')&&runner.includes('Desktop'),"Desktop ZIP on pass/fail");
need(runner.includes('RUNNING')&&runner.includes('remaining='),"stage progress contract");
const cfg=fs.existsSync('playwright.tool026.config.ts')?fs.readFileSync('playwright.tool026.config.ts','utf8'):'';
need(cfg.includes('desktop-026')&&cfg.includes('Desktop Chrome'),"desktop Chromium project registered");
need(cfg.includes('mobile-026')&&cfg.includes('Pixel 7'),"mobile viewport Chromium project registered");
need(!runner.includes("--project=desktop-026"),"runtime validation is not desktop-only");
process.exitCode=fail?1:0;
