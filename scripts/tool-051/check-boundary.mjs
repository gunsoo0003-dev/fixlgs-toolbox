import { addOrSubtractTime, format24, timeDifference, twelveToTwentyFour } from '../../lib/tool-051-time-calculator.ts';
let pass=0,fail=0;const check=(n,o)=>{console.log(`${o?'PASS':'FAIL'} ${n}`);o?pass++:fail++};
check('00:00 valid',format24({hour:0,minute:0,second:0})==='00:00');check('23:59 valid',format24({hour:23,minute:59,second:0})==='23:59');
const edge=timeDifference({hour:23,minute:59,second:0},{hour:0,minute:0,second:0},true);check('23:59 -> 00:00 = 1 minute',edge.hours===0&&edge.minutes===1);
const same=timeDifference({hour:12,minute:0,second:0},{hour:12,minute:0,second:0},false);check('same time = zero',same.hours===0&&same.minutes===0&&same.seconds===0);
const full=addOrSubtractTime({hour:10,minute:0,second:0},{hours:24,minutes:0,seconds:0},'add');check('exact 24h preserves clock and +1 day',format24(full)==='10:00'&&full.dayOffset===1);
const max=addOrSubtractTime({hour:0,minute:0,second:0},{hours:999,minutes:59,seconds:59},'add');check('999:59:59 accepted',Number.isInteger(max.totalSeconds));
let invalid=0;for(const fn of [()=>format24({hour:24,minute:10,second:0}),()=>twelveToTwentyFour(12,60,0,'AM'),()=>twelveToTwentyFour(7,61,0,'PM')]){try{fn()}catch{invalid++}}check('invalid clock ranges rejected',invalid===3);
console.log(`RESULT BOUNDARY PASS=${pass} FAIL=${fail}`);if(fail)process.exit(1);
