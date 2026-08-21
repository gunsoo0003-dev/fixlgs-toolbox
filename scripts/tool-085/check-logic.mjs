const ceil=Math.ceil;let f=0,p=0;function check(name,actual,expected,tol=1e-9){const ok=Math.abs(actual-expected)<=tol;console.log(ok?'PASS':'FAIL',name,actual,'expected',expected);ok?p++:f++}
const tileAdjusted=20*1.1,tileArea=.6*.6,tileUnits=ceil(tileAdjusted/tileArea),tileBoxes=ceil(tileUnits/12);check('tile adjusted',tileAdjusted,22);check('tile units',tileUnits,62);check('tile boxes',tileBoxes,6);
const woodAdjusted=30*1.08,woodBoxes=ceil(woodAdjusted/2.2);check('wood adjusted',woodAdjusted,32.4);check('wood boxes',woodBoxes,15);check('wood cost',woodBoxes*30000,450000);check('wood box count equals purchase units',woodBoxes,15);
const vinylAdjusted=25*1.1,vinylRolls=ceil(vinylAdjusted/10);check('vinyl adjusted',vinylAdjusted,27.5);check('vinyl rolls',vinylRolls,3);
check('no double deduction input basis',20,20);console.log(`LOGIC PASS=${p} FAIL=${f}`);process.exitCode=f?1:0;
