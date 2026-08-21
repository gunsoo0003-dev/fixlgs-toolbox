import fs from 'node:fs';
const src=fs.readFileSync('lib/tool-075-loan.ts','utf8');
const stripped=src.replace(/export type[\s\S]*?};\n/g,'').replace(/export /g,'').replace(/:Tool075Method/g,'').replace(/:Tool075TermUnit/g,'').replace(/:Tool075ScheduleRow\[\]/g,'').replace(/:Tool075LoanResult/g,'').replace(/:number\|null/g,'').replace(/:number/g,'').replace(/:string/g,'');
if(!src.includes('period === months ? balance'))throw new Error('final equal-payment adjustment missing');
if(!src.includes('period === months ? balance : Math.min(balance,basePrincipal)'))throw new Error('final equal-principal adjustment missing');
if(!src.includes("const isLast = i === months-1"))throw new Error('bullet final principal missing');
console.log('TOOL075 ENGINE CONTRACT PASS');
