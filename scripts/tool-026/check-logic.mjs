const mmToPt=mm=>mm*72/25.4;const a4={w:595.2755905512,h:841.8897637795};const letter={w:612,h:792};
function contain(pw,ph,m,iw,ih){const x=mmToPt(m),aw=pw-2*x,ah=ph-2*x;if(aw<=0||ah<=0)throw Error();const s=Math.min(aw/iw,ah/ih);return {w:iw*s,h:ih*s,x:(pw-iw*s)/2,y:(ph-ih*s)/2}}
const eps=.001;let fail=0;function ok(name,cond){console.log(cond?"PASS":"FAIL",name);if(!cond)fail++}
ok("A4 width",Math.abs(a4.w-mmToPt(210))<eps);ok("A4 height",Math.abs(a4.h-mmToPt(297))<eps);ok("Letter portrait",letter.w===612&&letter.h===792);const b=contain(a4.w,a4.h,10,4000,3000);ok("contain no stretch",Math.abs(b.w/b.h-4/3)<eps);ok("margin applied",b.x>=mmToPt(10)-eps&&b.y>=mmToPt(10)-eps);const land={w:a4.h,h:a4.w};ok("landscape swaps",land.w>a4.w&&land.h<a4.h);process.exitCode=fail?1:0;
