import fs from 'node:fs';
import {TOOL067_LIMITS,calculateTool067AllowedCost,calculateTool067Margin,calculateTool067TargetPrice,reverseTool067Cost} from '../../lib/tool-067-margin.ts';
const fx=JSON.parse(fs.readFileSync('tests/fixtures/tool-067/cases.json','utf8'));let pass=0,fail=0;const c=(n,v)=>{console.log(`${v?'PASS':'FAIL'} ${n}`);v?pass++:fail++};const eq=(a,b)=>Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(a),Math.abs(b));
for(const x of fx.core){const r=calculateTool067Margin(x.cost,x.selling);c(`core ${x.cost}/${x.selling} profit`,eq(r.profit,x.profit));c(`core ${x.cost}/${x.selling} margin`,eq(r.margin,x.margin));c(`core ${x.cost}/${x.selling} markup`,eq(r.markup??NaN,x.markup));if('loss'in x)c('loss state',r.loss===x.loss)}
for(const x of fx.target)c(`target ${x.margin}%`,eq(calculateTool067TargetPrice(x.cost,x.margin),x.price));
for(const x of fx.allowed)c(`allowed ${x.margin}%`,eq(calculateTool067AllowedCost(x.selling,x.margin),x.cost));
for(const x of fx.markup){const selling=x.cost*(1+x.markup/100),r=calculateTool067Margin(x.cost,selling);c('markup 30 selling 13000',eq(selling,x.selling));c('markup 30 margin 23.0769',eq(r.margin,x.margin))}
c('reverse cost 15000-5000=10000',reverseTool067Cost(15000,5000)===10000);
let e='';try{calculateTool067TargetPrice(10000,100)}catch(x){e=x instanceof Error?x.message:''}c('target 100 blocked',e===fx.boundary.target100);
e='';try{calculateTool067Margin(10000,0)}catch(x){e=x instanceof Error?x.message:''}c('selling 0 blocked',e===fx.boundary.selling0);
e='';try{calculateTool067Margin(-1,100)}catch(x){e=x instanceof Error?x.message:''}c('negative amount blocked',e===fx.boundary.negative);
c('limits contract',TOOL067_LIMITS.maxAbsAmount===fx.limits.maxAbsAmount&&TOOL067_LIMITS.maxPrecision===fx.limits.maxPrecision&&TOOL067_LIMITS.maxInputChars===fx.limits.maxInputChars);
console.log(`RESULT LOGIC PASS=${pass} FAIL=${fail}`);if(fail)process.exit(1);
