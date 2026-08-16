import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const must=["app/[locale]/list-sorter-duplicate-remover/page.tsx","components/list-sorter-duplicate-remover-page.tsx","components/list-sorter-duplicate-remover-tool.tsx","components/list-sorter-duplicate-remover-tool.module.css","lib/tool-039-list-operations.ts","tests/tool-039-preflight.spec.ts","tests/tool-039-core.spec.ts","tests/tool-039-boundary.spec.ts","tests/tool-039-feature.spec.ts","tests/tool-039-regression.spec.ts","tests/tool-039-limit.spec.ts"];
let fail=0; const report=[];
for(const rel of must){const ok=fs.existsSync(path.join(root,rel));report.push(`${ok?"PASS":"FAIL"} | exists | ${rel}`);if(!ok)fail++;}
const helper=fs.readFileSync(path.join(root,"lib/tool-039-list-operations.ts"),"utf8");
for(const [name,re] of [["exact Set dedupe",/new Set<string>/],["Intl.Collator",/new Intl\.Collator\(locale/],["strict numeric parser",/STRICT_NUMBER/],["reverse source",/\[\.\.\.lines\]\.reverse\(\)/],["Fisher-Yates",/for \(let i = result\.length - 1; i > 0; i -= 1\)/],["crypto RNG",/crypto\.getRandomValues/]]){const ok=re.test(helper);report.push(`${ok?"PASS":"FAIL"} | ${name}`);if(!ok)fail++;}
const css=fs.readFileSync(path.join(root,"components/list-sorter-duplicate-remover-tool.module.css"),"utf8");
for(const token of ["var(--tb-line)","var(--tb-panel)","var(--blue)","@media(max-width:720px)",".activeWorkspace", ".workspaceDragging", ".startDropzone", ".fileBar", ".dialogBackdrop"]){const ok=css.includes(token);report.push(`${ok?"PASS":"FAIL"} | design token | ${token}`);if(!ok)fail++;}
console.log(report.join("\n"));process.exitCode=fail?1:0;
