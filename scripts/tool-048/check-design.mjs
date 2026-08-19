import fs from 'node:fs';

const pagePath='components/age-life-calculator-page.tsx';
const toolPath='components/age-life-calculator-tool.tsx';
const cssPath='components/age-life-calculator-tool.module.css';
const baselinePath='components/date-add-subtract-calculator-page.tsx';

const page=fs.readFileSync(pagePath,'utf8');
const tool=fs.readFileSync(toolPath,'utf8');
const css=fs.readFileSync(cssPath,'utf8');
const baseline=fs.readFileSync(baselinePath,'utf8');

let pass=0, fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`); ok?pass++:fail++;};

// 1) Detail page common vertical contract: hero -> body -> next -> how-to -> expert -> notes -> faq.
const ordered=[
  'toolbox-tool-detail-hero',
  'toolbox-tool-detail-body',
  'toolbox-next-work',
  'toolbox-tool-guide',
  'toolbox-tool-format-guide',
  'toolbox-tool-info-band',
  'toolbox-tool-faq',
];
for(const token of ordered) check(`common structure ${token}`,page.includes(token));
let cursor=-1, orderOk=true;
for(const token of ordered){
  const next=page.indexOf(token,cursor+1);
  if(next<0 || next<cursor){ orderOk=false; break; }
  cursor=next;
}
check('detail sections keep common vertical order',orderOk);

// 2) TOOL045/046 date-family expert layout contract. Presence alone is not enough.
const expertOpen='toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head';
check('expert wrapper exact common class set',page.includes(expertOpen));
check('expert uses common format-guide-head',page.includes('className="toolbox-tool-format-guide-head"'));
check('expert uses common format body',page.includes('className="toolbox-tool-format-body"'));
check('expert uses common format grid',page.includes('className="toolbox-tool-format-grid"'));
check('expert has eyebrow + heading + description',/<div className="toolbox-tool-format-guide-head"><p>[^<]+<\/p><h2>\{t\.guide\}<\/h2><span>\{t\.guideDesc\}<\/span><\/div>/.test(page));
check('expert renders structured article cards',page.includes('<article key={tag}><strong>{tag}</strong><h3>{title}</h3><p>{desc}</p></article>'));

// 3) Important notes contract must stay separate from expert content.
const notesOpen='toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head';
check('important notes exact common class set',page.includes(notesOpen));
check('important notes common head',page.includes('className="toolbox-tool-info-band-head"'));
check('important notes label',page.includes('<p>IMPORTANT NOTES</p>'));
check('important notes list',page.includes('className="toolbox-tool-info-band-list"'));

// 4) FAQ common contract.
check('FAQ section common wrapper',page.includes('<section className="toolbox-tool-faq">'));
check('FAQ uses ToolboxFaqList',page.includes('<ToolboxFaqList'));
check('FAQ list common class',page.includes('className="toolbox-tool-faq-list"'));
check('FAQ localization controls',page.includes('moreLabel=')&&page.includes('collapseLabel='));

// 5) Date-family baseline parity: guard against drifting back to generic content-section layout.
for(const token of [
  'toolbox-tool-expert-post--wide-head',
  'toolbox-tool-format-guide-head',
  'toolbox-tool-format-body',
  'toolbox-tool-format-grid',
  'toolbox-tool-info-band--section-start',
  'toolbox-tool-info-band--bottom-gap',
  'toolbox-tool-info-band--left-head',
  'toolbox-tool-info-band--format-head',
]){
  check(`TOOL046 baseline carries ${token}`,baseline.includes(token));
  check(`TOOL048 inherits ${token}`,page.includes(token));
}
check('expert area is not generic content-section',!/<section className="toolbox-tool-content-section"[^>]*>[\s\S]{0,300}AGE GUIDE/.test(page));

// 6) Tool workspace/module CSS design contract.
for(const token of ['dateGrid','workspace','primaryCard','resultGrid'])
  check(`module style .${token}`,css.includes(`.${token}`));
check('no legacy sealed reference in product',!tool.includes('legacy-')&&!css.includes('legacy-'));

// 7) Protected global CSS must not receive TOOL048 one-off selectors.
for(const file of [
  'app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css',
  'styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css'
]){
  const src=fs.readFileSync(file,'utf8');
  check(`protected ${file} has no TOOL048 selector`,!/tool048|age-life-calculator/i.test(src));
}

console.log(`RESULT DESIGN PASS=${pass} FAIL=${fail}`);
if(fail) process.exit(1);
