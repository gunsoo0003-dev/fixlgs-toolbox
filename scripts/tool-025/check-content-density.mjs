import fs from 'node:fs';
const file='components/id-passport-photo-maker-page.tsx';
if(!fs.existsSync(file)){console.error('CONTENT DENSITY FAIL: missing page source');process.exit(1)}
const src=fs.readFileSync(file,'utf8');
let fail=0;
function need(ok,msg){if(!ok){console.error('CONTENT DENSITY FAIL:',msg);fail++}}
for(const token of [
  '사진 크기와 얼굴 크기는 따로 확인','한국 온라인 제출 조건 별도 적용','A4는 210×297mm 실제 크기','공식 여권과 일반 증명·취업사진 분리',
  'Check photo size and face size separately','Apply Korean online rules separately','A4 means actual 210×297mm output','Separate official passport and general ID sizes',
  '写真サイズと顔サイズを別々に確認','韓国オンライン条件を別適用','A4は210×297mmの実寸','公式パスポートと一般証明サイズを分離'
]) need(src.includes(token),`missing required dense-content topic: ${token}`);
const numbered=[...src.matchAll(/\["(0[1-8])",/g)].length;
need(numbered>=24,`expert cards expected >=24 across 3 locales, got ${numbered}`);
for(const phrase of ['500KB','No Stretch','100%','Actual Size','실제 크기','実際のサイズ','Canada','캐나다','カナダ']) need(src.includes(phrase),`missing operational guidance: ${phrase}`);
const faqQs=(src.match(/\["[^"\n]+\?",/g)||[]).length + (src.match(/\["[^"\n]+？",/g)||[]).length;
need(faqQs>=24,`FAQ density expected >=24 questions across 3 locales, got ${faqQs}`);
console.log(fail?'CONTENT DENSITY FAIL':'CONTENT DENSITY PASS');process.exit(fail?1:0);
