import fs from "node:fs";
const page=fs.readFileSync("components/youtube-channel-banner-page.tsx","utf8");
const tool=fs.readFileSync("components/youtube-channel-banner-tool.tsx","utf8");
const css=fs.readFileSync("components/youtube-channel-banner-tool.module.css","utf8");
for(const token of ["ToolboxSubpageShell","toolbox-tool-detail-hero","HOW TO USE","ToolboxFaqList"]){if(!page.includes(token)){console.error(`TOOL020 DESIGN FAIL: ${token}`);process.exit(1)}}
for(const token of ["tool020-preview-${id}","tool020-preview-canvas","tool020-download"]){if(!tool.includes(token)){console.error(`TOOL020 DESIGN FAIL: ${token}`);process.exit(1)}}
if(!css.includes("@media")){console.error("TOOL020 DESIGN FAIL: responsive CSS missing");process.exit(1)}
console.log("TOOL020 DESIGN PASS");
