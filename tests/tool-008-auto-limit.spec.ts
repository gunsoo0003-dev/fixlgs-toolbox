import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test.describe('008 automatic limit report',()=>{
  test('progressively measure canvas capability and write TXT/JSON report',async({page})=>{
    await page.goto('/ko/image-cropper-rotator');
    const capability=await page.evaluate(()=>{
      const probeSide=(side:number)=>{try{const c=document.createElement('canvas');c.width=side;c.height=1;const ctx=c.getContext('2d');if(!ctx||c.width!==side)return false;ctx.fillRect(side-1,0,1,1);return true;}catch{return false;}};
      const probeSquare=(side:number)=>{const start=performance.now();try{const c=document.createElement('canvas');c.width=side;c.height=side;const ctx=c.getContext('2d');if(!ctx||c.width!==side||c.height!==side)return {ok:false,ms:performance.now()-start};ctx.fillRect(0,0,1,1);ctx.getImageData(0,0,1,1);return {ok:true,ms:performance.now()-start};}catch{return {ok:false,ms:performance.now()-start};}};

      const sideSteps=[4096,8192,12288,16384,20000,24576,32767];
      const sideResults=sideSteps.map(side=>({side,ok:probeSide(side)}));
      let low=sideResults.filter(x=>x.ok).at(-1)?.side??0;
      let high=sideResults.find(x=>!x.ok)?.side??32767;
      if(high>low){for(let i=0;i<7&&high-low>128;i++){const mid=Math.floor((low+high)/2);if(probeSide(mid))low=mid;else high=mid;}}

      const squareSteps=[2048,3072,4096,4472,4608];
      const squareResults=squareSteps.map(side=>{const result=probeSquare(side);return {side,pixels:side*side,...result};});
      const maxSquare=squareResults.filter(x=>x.ok).at(-1);
      return {
        userAgent:navigator.userAgent,
        deviceMemory:(navigator as Navigator & {deviceMemory?:number}).deviceMemory??null,
        sideResults,
        squareResults,
        measuredMaxSide:low,
        firstFailedSide:high,
        measuredSquarePixels:maxSquare?.pixels??0,
      };
    });

    expect(capability.sideResults.some(x=>x.side===16384&&x.ok)).toBeTruthy();
    expect(capability.measuredSquarePixels).toBeGreaterThanOrEqual(16_000_000);

    const configured={files:10,perFileMB:15,totalMB:50,pixels:16_986_931,maxSide:16_384,maxZoom:5,undo:30};
    const measuredSafeSide=Math.floor(capability.measuredMaxSide*0.8);
    const measuredSafePixels=Math.floor(capability.measuredSquarePixels*0.8);
    const recommendation={
      files:configured.files,
      perFileMB:configured.perFileMB,
      totalMB:configured.totalMB,
      pixels:Math.min(configured.pixels,measuredSafePixels),
      maxSide:Math.min(configured.maxSide,measuredSafeSide),
      maxZoom:configured.maxZoom,
      undo:configured.undo,
      safetyMargin:'20%',
      needsCodeAdjustment: configured.pixels>measuredSafePixels || configured.maxSide>measuredSafeSide,
      safetyNote:'Recommendation uses a 20% margin below the measured browser-local envelope. Mobile device variance still applies.'
    };
    const report={generatedAt:new Date().toISOString(),tool:'008 image cropper rotator',configured,capability,recommendation};
    fs.mkdirSync(path.join(process.cwd(),'test-results'),{recursive:true});
    fs.writeFileSync(path.join(process.cwd(),'test-results','tool-008-auto-limit-report.json'),JSON.stringify(report,null,2));
    const txt=[
      'TOOLBOX 008 자동 한계탐색 결과',`생성: ${report.generatedAt}`,
      `측정 최대 한 변: ${capability.measuredMaxSide.toLocaleString()}px`,
      `첫 실패 한 변: ${capability.firstFailedSide.toLocaleString()}px`,
      `측정 성공 정사각 픽셀: ${capability.measuredSquarePixels.toLocaleString()}px`,
      `안전 여유: ${recommendation.safetyMargin}`,
      `파일 수 권장: ${recommendation.files}`,`파일당 권장: ${recommendation.perFileMB}MB`,`전체 권장: ${recommendation.totalMB}MB`,
      `픽셀 권장: ${recommendation.pixels.toLocaleString()}`,`최대 한 변 권장: ${recommendation.maxSide.toLocaleString()}px`,
      `최대 확대: ${recommendation.maxZoom}x`,`Undo 기록: ${recommendation.undo}`,
      `코드 한도 조정 필요: ${recommendation.needsCodeAdjustment?'예':'아니오'}`,'',
      ...capability.sideResults.map(x=>`한 변 ${x.side}px: ${x.ok?'PASS':'FAIL'}`),
      ...capability.squareResults.map(x=>`정사각 ${x.side}px (${x.pixels.toLocaleString()}px): ${x.ok?'PASS':'FAIL'} / ${x.ms.toFixed(1)}ms`)
    ];
    fs.writeFileSync(path.join(process.cwd(),'test-results','tool-008-auto-limit-report.txt'),txt.join('\n'));
  });
});
