import fs from "node:fs";
const files=["app/globals.css","styles/global-base.css","styles/toolbox-common.css","styles/toolbox-detail-common.css","styles/theme.css","styles/toolbox-compat.css","styles/legacy-site-sealed.css","styles/legacy-tools-sealed.css"];
let fail=0;for(const f of files){const s=fs.readFileSync(f,"utf8");const a=!s.includes("tool042")&&!s.includes("TOOL042");const b=!s.includes("text-find-replace-tool");console.log(`[${a&&b?"PASS":"FAIL"}] ${f} protected`);if(!(a&&b))fail++}
const css=fs.readFileSync("components/text-find-replace-tool.module.css","utf8");const ok=!css.includes("legacy-site-sealed")&&!css.includes("legacy-tools-sealed");console.log(`[${ok?"PASS":"FAIL"}] dedicated module has no sealed import`);if(!ok)fail++;
process.exitCode=fail?1:0;
