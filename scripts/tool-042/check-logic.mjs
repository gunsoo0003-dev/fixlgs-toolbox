const L={input:1000000,rules:100,find:1000,replacement:10000,result:5000000};
function validate(src,rules,cs=true){const e=[];if(src.length>L.input)e.push("INPUT_LIMIT");if(rules.length>L.rules)e.push("RULE_LIMIT");const seen=new Set();rules.forEach(r=>{if(!r.find)e.push("EMPTY_FIND");if(r.find.length>L.find)e.push("FIND_LIMIT");if(r.replacement.length>L.replacement)e.push("REPLACEMENT_LIMIT");const k=cs?r.find:r.find.toLocaleLowerCase("en-US");if(seen.has(k))e.push("DUPLICATE_FIND");seen.add(k)});return e}
function spans(s,n){const a=[];let p=0;while(p<=s.length){const i=s.indexOf(n,p);if(i<0)break;a.push([i,i+n.length]);p=i+Math.max(1,n.length)}return a}
function replace(src,rules,cs){if(validate(src,rules,cs).length)throw Error("VALIDATION");const c=[];rules.forEach((r,ri)=>{const ss=cs?spans(src,r.find):spans(src.toLocaleLowerCase("en-US"),r.find.toLocaleLowerCase("en-US"));ss.forEach(([start,end])=>c.push({start,end,ri}))});c.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start)||a.ri-b.ri);const a=[];let cursor=-1;for(const x of c){if(x.start<cursor)continue;a.push(x);cursor=x.end}const counts=rules.map(r=>({...r,count:0}));let out="",p=0;for(const x of a){out+=src.slice(p,x.start)+rules[x.ri].replacement;p=x.end;counts[x.ri].count++}out+=src.slice(p);if(out.length>L.result)throw Error("RESULT_LIMIT");return{out,total:a.length,counts}}
const cases=[
["F01","Hello world",[["world","FIX"]],true,"Hello FIX",1],
["F02","Cat cat CAT",[["cat","dog"]],true,"Cat dog CAT",1],
["F03","Cat cat CAT",[["cat","dog"]],false,"dog dog dog",3],
["F04","abc abc",[["abc",""]],true," ",2],
["F05","catalog cat",[["cat","X"],["catalog","Y"]],true,"Y X",2],
["F06","A B",[["A","B"],["B","C"]],true,"B C",2],
["F07","a.b a*b",[[".","X"]],true,"aXb a*b",1],
["F08","안녕하세요 안녕",[["안녕","반가워"]],true,"반가워하세요 반가워",2],
["F09","日本語日本語",[["日本","JP"]],true,"JP語JP語",2],
["F10","😀😀",[["😀","🙂"]],true,"🙂🙂",2],
["F11","same",[["same","same"]],true,"same",1]
];
let pass=0;
for(const [id,src,rs,cs,exp,count] of cases){const rules=rs.map(([find,replacement])=>({find,replacement}));const got=replace(src,rules,cs);if(got.out!==exp||got.total!==count){console.error("FAIL",id,got);process.exit(1)}pass++}
if(!validate("x",[{find:"cat",replacement:"X"},{find:"CAT",replacement:"Y"}],false).includes("DUPLICATE_FIND"))process.exit(1);
if(!validate("x",[{find:"",replacement:"Y"}]).includes("EMPTY_FIND"))process.exit(1);
if(!validate("A".repeat(L.input+1),[{find:"A",replacement:"B"}]).includes("INPUT_LIMIT"))process.exit(1);
try{replace("A".repeat(600000),[{find:"A",replacement:"AAAAAAAAAA"}],true);process.exit(1)}catch(e){if(e.message!=="RESULT_LIMIT")throw e}
console.log(`TOOL042 LOGIC FIXTURE PASS ${pass+4} / ${pass+4}`);
