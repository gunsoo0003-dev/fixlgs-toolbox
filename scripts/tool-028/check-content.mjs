import fs from 'node:fs';
const text=fs.readFileSync('components/merge-pdf-page.tsx','utf8');
let fail=0; const check=(ok,msg)=>{console.log(`${ok?'[PASS]':'[FAIL]'} ${msg}`);if(!ok)fail++;};
for(const token of ['PDF 합치기','Merge PDF','PDF 結合ツール','브라우저','server','サーバー','copy','페이지','Page','ページ']) check(text.includes(token),`content ${token}`);
const how=(text.match(/steps:\s*\[/g)||[]).length; const faq=(text.match(/faqs:\s*\[/g)||[]).length; const guide=(text.match(/guide:\s*\[/g)||[]).length;
check(how===3,'HOW TO exists for 3 locales'); check(faq===3,'FAQ exists for 3 locales'); check(guide===3,'workflow guide exists for 3 locales');
check((text.match(/\[\"0[1-6]\"/g)||[]).length>=18,'expert workflow density present across locales');
process.exit(fail?1:0);
