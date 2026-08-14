import fs from "node:fs"; const s=fs.readFileSync("components/pdf-to-image-converter-page.tsx","utf8");
let fail=0;const need=(ok,msg)=>{console.log(ok?"PASS":"FAIL",msg);if(!ok)fail++;};
for(const token of ["PDF 표·도표 → 선명한 PNG","특정 페이지만 JPG로 공유","여러 페이지 → ZIP 전달","PDF를 이미지로 바꿀 때 실전 기준","PDF 페이지는 고정 픽셀 원본이 아닙니다","JPG와 PNG는 용도가 다릅니다","페이지 이미지 변환과 원본 이미지 추출은 다릅니다","toolbox-tool-guide","toolbox-tool-use-cases--editorial","toolbox-tool-expert-post","toolbox-tool-info-band","toolbox-tool-faq"]) need(s.includes(token),`content ${token}`);
need(s.includes('ko: {')&&s.includes('en: {')&&s.includes('ja: {'),"KO EN JA content");
process.exitCode=fail?1:0;
