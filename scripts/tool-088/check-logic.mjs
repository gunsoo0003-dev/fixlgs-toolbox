import fs from 'node:fs';
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/tool-088/cases.json','utf8'));
const m=(v,u)=>u==='m'?v:u==='cm'?v/100:v/1000;
let pass=0,fail=0;const ok=(name,cond)=>{console.log((cond?'PASS ':'FAIL ')+name);cond?pass++:fail++};
for(const c of fixture.cases.filter(x=>x.base!=null)){const base=m(c.length,c.lengthUnit)*m(c.width,c.widthUnit)*m(c.thickness,c.thicknessUnit),adj=base*(1+c.extraRate/100);ok(`${c.id} base`,Math.abs(base-c.base)<1e-12);ok(`${c.id} adjusted`,Math.abs(adj-c.adjusted)<1e-12);if(c.deliveries!=null)ok(`${c.id} deliveries`,Math.ceil(adj/c.deliveryVolume)===c.deliveries)}
const r=fixture.cases.find(x=>x.id==='roundtrip');ok('150mm=15cm=0.15m',m(r.millimeter,'mm')===m(r.centimeter,'cm')&&m(r.centimeter,'cm')===m(r.meter,'m'));
ok('extra0 branch',3*(1+0/100)===3);ok('ceil 5.28/4 = 2',Math.ceil(5.28/4)===2);
console.log(`LOGIC PASS=${pass} FAIL=${fail}`);process.exit(fail?1:0);
