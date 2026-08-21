const failures=[];
const near=(a,b)=>Math.abs(a-b)<1e-9;
const depositInterest=10000000*0.03*(12/12);if(!near(depositInterest,300000))failures.push('deposit-10m-3pct-12m');
const savingsInterest=500000*0.03/12*(12*13/2);if(!near(savingsInterest,97500))failures.push('savings-500k-3pct-12m');
if(!(savingsInterest<180000))failures.push('savings-interest-bound');
if(12!==1*12)failures.push('term-normalization');
const afterTax=300000*(1-0.10);if(!near(afterTax,270000))failures.push('tax-interest-only');
console.log(JSON.stringify({check:'TOOL073 independent formula fixture',depositInterest,savingsInterest,afterTax,failures},null,2));
process.exitCode=failures.length?1:0;
