import fs from 'node:fs';
const s=fs.readFileSync('lib/tool-078-stock-average-cost.ts','utf8');
for(const token of ['existingQty*existingPrice','additionalCost+=lot.qty*lot.price','totalCost/totalShares','averageCost*(1+targetReturn/100)','maxRows:100','maxPrecision:8'])if(!s.includes(token))throw new Error(`logic token missing ${token}`);
console.log('TOOL078 LOGIC CONTRACT PASS');
