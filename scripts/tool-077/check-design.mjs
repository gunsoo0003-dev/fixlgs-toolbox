import fs from 'node:fs';
let pass=0,fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};
const page=fs.readFileSync('components/tool-077-investment-return-calculator-page.tsx','utf8');
const css=fs.readFileSync('components/tool-077-investment-return-calculator.module.css','utf8');
const seq=[
 'toolbox-tool-guide toolbox-tool-guide--five',
 'toolbox-tool-format-guide toolbox-tool-expert-post',
 'toolbox-tool-info-band toolbox-tool-info-band--section-start',
 'toolbox-tool-faq'
].map(x=>page.indexOf(x));
check('lower section exact order',seq.every((v,i)=>v>=0&&(i===0||v>seq[i-1])));
check('ToolNavigation current tool',page.includes('ToolNavigation')&&page.includes('currentTool={77}'));
check('expert shared wide head',page.includes('toolbox-tool-expert-post--wide-head'));
const expertTags=["TOTAL RETURN", "ANNUALIZED", "PERIOD", "GAIN / LOSS", "REFERENCE", "BOUNDARY"];
check('expert six article contract',expertTags.every(x=>page.includes(x)));
check('IMPORTANT NOTES common info band',page.includes('toolbox-tool-info-band--format-head')&&page.includes('toolbox-tool-info-band-list'));
check('FAQ shared API/class',page.includes('ToolboxFaqList')&&page.includes('className="toolbox-tool-faq-list"')&&page.includes('initialCount={4}'));
check('actual tool number',page.includes('077'));
check('mobile breakpoint',css.includes('@media(max-width:560px)')||css.includes('@media(max-width:820px)'));
check('no module important',!css.includes('!important'));
check('no global selector mutation',!css.includes(':global(')&&!css.includes('.toolbox-tool-'));
console.log(`RESULT TOOL077 DESIGN PASS=${pass} FAIL=${fail}`);
process.exitCode=fail?1:0;
