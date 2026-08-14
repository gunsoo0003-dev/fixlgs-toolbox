import fs from "node:fs";
const file="components/image-to-pdf-page.tsx";
if(!fs.existsSync(file)){console.error("FAIL missing",file);process.exit(1)}
const s=fs.readFileSync(file,"utf8");
let fail=0;
const checks=[
  ["KO HOW TO 4-step",["JPG·PNG 이미지를 한 장 또는 여러 장 선택합니다.","썸네일 순서를 확인하고","A4·Letter, 방향, 여백","PDF 만들기를 누른 뒤"]],
  ["KO exact delivery use cases",["영수증 JPG 6장 → A4 PDF","PNG 안내 이미지 3장 → Letter + 10mm","세로·가로 사진 10장 → Auto"]],
  ["EN use cases",["6 receipt JPGs → A4 PDF","3 PNG guides → Letter + 10 mm","10 mixed photos → Auto"]],
  ["JA use cases",["領収書JPG 6枚 → A4 PDF","案内PNG 3枚 → Letter + 10mm","縦横混在10枚 → Auto"]],
  ["Expert post section",["EXPERT POST","expertTitle","expertLead","t.expert.map"]],
  ["Expert decision topics",["A4와 Letter는 최종 사용처에 맞춰 선택","Portrait·Landscape·Auto의 역할을 구분","여백은 장식이 아니라 인쇄·가독성 공간","No Stretch와 contain으로 원본 비율 유지","투명 PNG는 흰 페이지 위 합성 결과 확인","고해상도 이미지는 PDF 용량과 메모리를 함께 증가","이미지 PDF와 OCR PDF는 목적이 다름","생성 후에는 순서·페이지 수·용량을 다시 확인"]],
  ["Official common content classes",["toolbox-tool-use-cases--editorial","toolbox-tool-expert-post","toolbox-tool-info-band","toolbox-tool-faq"]],
  ["KO EN JA branches",["ko: {","en: {","ja: {"]],
];
for(const [name,tokens] of checks){
  const missing=tokens.filter(x=>!s.includes(x));
  if(missing.length){console.error("FAIL",name,"missing:",missing.join(" | "));fail++}
  else console.log("PASS",name);
}
const expertKo=(s.match(/\[\"A4와 Letter는 최종 사용처에 맞춰 선택\"/g)||[]).length;
if(expertKo!==1){console.error("FAIL KO expert anchor count",expertKo);fail++} else console.log("PASS KO expert anchor count");
process.exitCode=fail?1:0;
