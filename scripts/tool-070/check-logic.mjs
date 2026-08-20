const failures=[];const near=(a,b,e=1e-9)=>Math.abs(a-b)<=e;
const itemA=9900/10,itemB=17800/20;if(itemA!==990||itemB!==890||itemA-itemB!==100)failures.push('items');
const wA=6000/500*100,wB=10000/1000*100;if(wA!==1200||wB!==1000)failures.push('weight');
const vA=1500/300*100,vB=4200/1000*100;if(vA!==500||vB!==420)failures.push('volume');
const bundle=2500/(6*250)*100;if(!near(bundle,166.66666666666666))failures.push('bundle-volume');
const eqA=5000/500,eqB=10000/1000;if(eqA!==eqB)failures.push('equal');
if(1*1000!==1000||1*1000!==1000)failures.push('roundtrip');
console.log(JSON.stringify({check:'TOOL070 independent formula fixture',failures},null,2));process.exitCode=failures.length?1:0;
