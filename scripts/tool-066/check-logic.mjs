const cases=[
 ['exclusive-10',100000,10,100000,10000,110000],
 ['exclusive-5',100000,5,100000,5000,105000],
 ['zero-rate',100000,0,100000,0,100000]
];
const failures=[];
for(const [id,supply,rate,es,ev,et] of cases){const vat=supply*rate/100,total=supply+vat;if(supply!==es||vat!==ev||total!==et)failures.push(id)}
for(const [id,total,rate,es,ev] of [['inclusive-10',110000,10,100000,10000]]){const supply=total/(1+rate/100),vat=total-supply;if(Math.abs(supply-es)>1e-9||Math.abs(vat-ev)>1e-9)failures.push(id)}
const rr=50000/500000*100;if(rr!==10)failures.push('reverse-rate');
console.log(JSON.stringify({check:'TOOL066 independent formula fixture',failures},null,2));
process.exitCode=failures.length?1:0;
