import fs from 'node:fs';
const css=fs.readFileSync('components/pdf-to-image-converter-tool.module.css','utf8');
const page=fs.readFileSync('components/pdf-to-image-converter-page.tsx','utf8');
for(const x of ['toolbox-tool-detail-hero','toolbox-next-work','ToolboxFaqList']) if(!page.includes(x)) throw new Error('common pattern missing '+x);
if(!/@media\s*\(max-width\s*:\s*(900|720|430)px\)/.test(css)||!css.includes('grid-template-columns')) throw new Error('responsive missing');
console.log('TOOL027 DESIGN-CODE PASS | MAIN=026 | CATEGORY=PDF');
