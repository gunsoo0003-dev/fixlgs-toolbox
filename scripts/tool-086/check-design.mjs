import fs from 'node:fs';
let fail=0;
const css=fs.readFileSync('components/tool-086-sheet-material-calculator.module.css','utf8');
const page=fs.readFileSync('components/tool-086-sheet-material-calculator-page.tsx','utf8');
const check=(ok,label)=>{console.log(ok?'PASS':'FAIL',label);if(!ok)fail++};
for(const x of ['toolbox-tool-detail-hero','toolbox-tool-guide','toolbox-tool-format-guide','toolbox-tool-expert-post','toolbox-tool-expert-post--wide-head','toolbox-tool-format-grid','toolbox-tool-info-band','toolbox-tool-faq']) check(page.includes(x),x);
for(const x of ['@media(max-width:560px)','.primary{border:1px solid #111;background:#111;color:#fff}']) check(css.includes(x),x);
process.exitCode=fail?1:0;
