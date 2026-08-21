import fs from 'node:fs';
const files=['app/[locale]/flooring-material-quantity-calculator/page.tsx','components/tool-085-floor-material-calculator.tsx','components/tool-085-floor-material-calculator-page.tsx','components/tool-085-floor-material-calculator.module.css','lib/tool-085-floor-material.ts'];let pass=0,fail=0;
for(const f of files){if(fs.existsSync(f)){console.log('PASS source',f);pass++}else{console.log('FAIL missing',f);fail++}}
const all=files.filter(f=>fs.existsSync(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n');for(const token of ['tool085-root','flooring-material-quantity-calculator','장판·타일·마루 수량 계산기','Flooring Material Quantity Calculator','床材数量計算ツール','calculateTool085',"input.material==='wood'?requiredUnits:null"]){if(all.includes(token)){console.log('PASS token',token);pass++}else{console.log('FAIL token',token);fail++}}
console.log(`SOURCE PASS=${pass} FAIL=${fail}`);process.exitCode=fail?1:0;
