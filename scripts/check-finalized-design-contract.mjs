import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=process.cwd();
const baselinePath=path.join(ROOT,'scripts','finalized-design-baseline-066-090.json');

export function runFinalizedDesignCheck(toolId){
  const id=String(toolId).padStart(3,'0');
  const all=JSON.parse(fs.readFileSync(baselinePath,'utf8'));
  const b=all[id];
  let pass=0,fail=0;
  const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} FINAL-DESIGN ${id} ${name}`);ok?pass++:fail++;};
  check('baseline entry',Boolean(b));
  if(!b){console.log(`RESULT FINALIZED-DESIGN TOOL=${id} PASS=${pass} FAIL=${fail}`);return {pass,fail};}
  const pagePath=path.join(ROOT,b.page);
  check('page exists',fs.existsSync(pagePath));
  if(!fs.existsSync(pagePath)){console.log(`RESULT FINALIZED-DESIGN TOOL=${id} PASS=${pass} FAIL=${fail}`);return {pass,fail};}
  const page=fs.readFileSync(pagePath,'utf8');
  const tokens=[
    'ToolboxSubpageShell',
    'toolbox-tool-detail-hero',
    'toolbox-tool-detail-body',
    'toolbox-tool-guide toolbox-tool-guide--five',
    'toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head',
    'toolbox-tool-format-grid',
    'toolbox-tool-info-band toolbox-tool-info-band--section-start',
    'toolbox-tool-faq',
    'ToolboxFaqList'
  ];
  for(const token of tokens) check(`common contract ${token}`,page.includes(token));
  const order=[
    'toolbox-tool-guide toolbox-tool-guide--five',
    'toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head',
    'toolbox-tool-info-band toolbox-tool-info-band--section-start',
    'toolbox-tool-faq'
  ].map(x=>page.indexOf(x));
  check('lower order HOWTO>EXPERT>NOTES>FAQ',order.every((v,i)=>v>=0&&(i===0||v>order[i-1])));
  check('expert article mapper',page.includes('<article')&&page.includes('.map('));
  check('important notes label',page.includes('IMPORTANT NOTES'));
  check('FAQ shared class',page.includes('className="toolbox-tool-faq-list"'));
  check('FAQ initial count baseline',page.includes(`initialCount={${b.faqInitialCount}}`));
  check('FAQPage JSON-LD',page.includes('FAQPage')&&page.includes('mainEntity'));
  check('KO expert title baseline',page.includes(b.expertTitle.ko));
  check('JA expert title baseline',page.includes(b.expertTitle.ja));
  check('EN expert title baseline',page.includes(b.expertTitle.en));
  check('summary title not legacy sentence',!page.includes('단계별로 확인합니다')&&!page.includes('분리해 확인합니다'));
  if(b.requiresToolNavigation){
    check('ToolNavigation present',page.includes('ToolNavigation'));
    check('ToolNavigation currentTool',page.includes(`currentTool={${Number(id)}}`));
  }
  const moduleCandidates=fs.readdirSync(path.join(ROOT,'components')).filter(x=>x.startsWith(`tool-${id}-`)&&x.endsWith('.module.css'));
  check('dedicated module css exists',moduleCandidates.length>0);
  if(moduleCandidates.length){
    const css=moduleCandidates.map(x=>fs.readFileSync(path.join(ROOT,'components',x),'utf8')).join('\n');
    check('responsive media contract',css.includes('@media(max-width:'));
  }
  console.log(`RESULT FINALIZED-DESIGN TOOL=${id} PASS=${pass} FAIL=${fail}`);
  return {pass,fail};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const tool=process.argv[2];
  if(!tool){console.error('Usage: node scripts/check-finalized-design-contract.mjs <tool>');process.exit(2);}
  const r=runFinalizedDesignCheck(tool);process.exitCode=r.fail?1:0;
}
