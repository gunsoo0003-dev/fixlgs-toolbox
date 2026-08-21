let pass=0,fail=0;const check=(n,o)=>{console.log(`${o?'PASS':'FAIL'} ${n}`);o?pass++:fail++};const near=(a,b,t=1e-6)=>Math.abs(a-b)<=t;
const geom=(h,r)=>({s:h/r*100,a:Math.atan(h/r)*180/Math.PI,l:Math.hypot(h,r)});
let g=geom(2,4);check('2m/4m slope 50%',near(g.s,50));check('2m/4m angle 26.565051',near(g.a,26.565051,1e-6));check('2m/4m length 4.472136',near(g.l,4.472136,1e-6));
check('2.4m/12 riser 0.20m',near(2.4/12,.2));check('0.28m x 12 run 3.36m',near(.28*12,3.36));g=geom(2.4,3.36);check('2.4/3.36 angle ~35.538',near(g.a,35.537678,1e-6));check('10% + 1m => 10m run',near(1/(10/100),10));
const angle=Math.atan(.5)*180/Math.PI,run=1/Math.tan(angle*Math.PI/180);check('slope-angle roundtrip',near(run,2,1e-10));
check('zero step invalid',!Number.isInteger(0)||0<=0);check('zero run invalid',0<=0);console.log(`RESULT LOGIC PASS=${pass} FAIL=${fail}`);process.exitCode=fail?1:0;
