import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT=process.cwd();
const css=fs.readFileSync(path.join(ROOT,"components/social-media-image-maker-tool.module.css"),"utf8");
const html=`<!doctype html><html><head><meta charset="utf-8"><style>
:root {--tb-line:#d7dce4;--tb-panel:#fff;--tb-muted:#667085;--tb-soft:#f4f6f8;--tb-fg:#111827;--tb-inverse:#111827;--tb-inverse-fg:#fff;--blue:#1677ff;}
[data-theme="dark"] {--tb-line:#343a46;--tb-panel:#111827;--tb-muted:#aeb7c6;--tb-soft:#0b1220;--tb-fg:#f8fafc;--tb-inverse:#f8fafc;--tb-inverse-fg:#111827;--blue:#4ea1ff;}
*{box-sizing:border-box} body{margin:0;font-family:Arial,sans-serif;color:var(--tb-fg);background:var(--tb-soft)} main{max-width:1180px;margin:0 auto;padding:16px}
${css}</style></head><body><main class="wrapper" id="root">
<section class="platformSection"><div class="sectionHead"><div><p>PRESETS</p><h3>出力プラットフォーム</h3></div></div>
<div class="pillRow" id="pills">
${[["Instagram 投稿","1080×1350"],["Instagram Story","1080×1920"],["Facebook","1080×1350"],["X","1200×675"],["LinkedIn","1200×1200"]].map((x,i)=>`<div class="pillShell"><button class="pill ${i===0?"pillActive":""}"><span>${x[0]}</span><strong>${x[1]}</strong><small>現在のサイズのみ調整</small></button><label class="checkboxWrap"><input type="checkbox" checked></label></div>`).join("")}
</div></section>
<section class="editorGrid" id="editor">
<div class="previewPanel" id="preview"><div class="sectionHead"><div><p>PREVIEW</p><h3>現在の編集サイズ</h3></div><div class="previewMeta"><strong>Instagram 投稿</strong><span>1080 × 1350 · 4:5</span></div></div><div class="previewBox" tabindex="0"><canvas class="previewCanvas" width="190" height="238"></canvas></div><div class="editTargetRow"><span>編集対象</span><div class="segmented"><button class="segmentedActive">背景</button><button>タイトル</button><button>説明</button><button>ロゴ</button></div></div><div class="previewLegend"><span>公式対応範囲</span><strong>TOOLBOX preset</strong></div></div>
<aside class="controlPanel" id="controls">
<section class="controlCard" id="applyCard"><div class="sectionHeadCompact"><h4>すべてのサイズに適用</h4><div class="scopeToggle"><button class="scopeActive">全サイズ</button><button>このサイズ</button></div></div><div class="fieldGrid"><label><span>タイトル</span><input value="タイトル"></label><label><span>説明</span><textarea>日本語の長い説明テキストでもモバイル画面からはみ出さないことを確認します。</textarea></label><label><span>フォント</span><select><option>基本</option></select></label><label><span>タイトルサイズ</span><input type="range"></label><label><span>説明サイズ</span><input type="range"></label><label><span>オーバーレイ</span><input type="range"></label></div></section>
<section class="controlCard" id="formatCard"><div class="fieldGrid"><label><span>ファイル形式</span><select id="formatSelect"><option>JPG</option></select></label><label><span>画像品質 · 92</span><input type="range"></label></div><div class="actionStack"><button class="primaryButton" id="primary">現在のサイズをダウンロード</button><button class="secondaryButton">選択したサイズをZIPでダウンロード</button><button class="ghostButton">編集を続ける</button><button class="ghostButton">すべてリセット</button></div><p class="status">設定が準備できました。</p></section>
<section class="controlCard" id="commonCard"><div class="sectionHeadCompact"><h4>共通デザイン</h4></div><div class="positionBlock"><h5>背景位置</h5><div class="sliderRow"><span>横</span><input type="range"></div><div class="sliderRow"><span>縦</span><input type="range"></div><div class="sliderRow"><span>拡大・縮小</span><input type="range"></div></div><div class="positionBlock"><h5>タイトル位置</h5><div class="sliderRow"><span>横</span><input type="range"></div><div class="sliderRow"><span>縦</span><input type="range"></div></div><div class="positionBlock"><h5>説明位置</h5><div class="sliderRow"><span>横</span><input type="range"></div><div class="sliderRow"><span>縦</span><input type="range"></div></div><div class="positionBlock"><h5>ロゴ位置</h5><div class="sliderRow"><span>横</span><input type="range"></div><div class="sliderRow"><span>縦</span><input type="range"></div></div></section>
</aside></section></main></body></html>`;

const rows=[];
const add=(name,pass,detail)=>rows.push({name,pass:Boolean(pass),detail});
const browser=await chromium.launch({headless:true});
try{
  for(const width of [320,360,390,768,1280]){
    const page=await browser.newPage({viewport:{width,height:900}});
    await page.setContent(html);
    const m=await page.evaluate(()=>({
      sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,
      pillDisplay:getComputedStyle(document.querySelector("#pills")).display,
      pillWrap:getComputedStyle(document.querySelector("#pills")).flexWrap,
      pillOverflow:getComputedStyle(document.querySelector("#pills")).overflowX,
      buttonH:document.querySelector("#primary").getBoundingClientRect().height,
      selectH:document.querySelector("#formatSelect").getBoundingClientRect().height,
      previewTop:document.querySelector("#preview").getBoundingClientRect().top,
      applyTop:document.querySelector("#applyCard").getBoundingClientRect().top,
      commonTop:document.querySelector("#commonCard").getBoundingClientRect().top,
      formatTop:document.querySelector("#formatCard").getBoundingClientRect().top,
      focusOutline:(()=>{const e=document.querySelector(".previewBox");e.focus();return getComputedStyle(e).outlineStyle})()
    }));
    add(`no-page-horizontal-overflow-${width}`,m.sw<=m.cw+1,m);
    if(width<=720){
      add(`mobile-horizontal-preset-strip-${width}`,m.pillDisplay==="flex"&&m.pillWrap==="nowrap"&&["auto","scroll"].includes(m.pillOverflow),m);
      add(`mobile-finalized-order-${width}`,m.previewTop<m.applyTop&&m.applyTop<m.commonTop&&m.commonTop<m.formatTop,m);
    }
    add(`touch-target-primary-${width}`,m.buttonH>=44,m.buttonH);
    add(`touch-target-select-${width}`,m.selectH>=44,m.selectH);
    add(`focus-visible-mechanic-${width}`,m.focusOutline!=="none",m.focusOutline);
    await page.close();
  }

  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  await page.setContent(html);
  const d=await page.evaluate(()=>{
    const p=document.querySelector("#preview").getBoundingClientRect(),a=document.querySelector("#applyCard").getBoundingClientRect(),c=document.querySelector("#commonCard").getBoundingClientRect(),f=document.querySelector("#formatCard").getBoundingClientRect(),e=document.querySelector("#editor").getBoundingClientRect();
    return {editorDisplay:getComputedStyle(document.querySelector("#editor")).display,previewLeft:p.left,applyLeft:a.left,commonLeft:c.left,previewTop:p.top,applyTop:a.top,commonTop:c.top,previewBottom:p.bottom,applyBottom:a.bottom,commonBottom:c.bottom,formatTop:f.top,formatLeft:f.left,formatRight:f.right,editorLeft:e.left,editorRight:e.right,cardRadius:parseFloat(getComputedStyle(document.querySelector("#applyCard")).borderRadius),cardBorder:getComputedStyle(document.querySelector("#applyCard")).borderTopWidth,cardPadding:parseFloat(getComputedStyle(document.querySelector("#applyCard")).paddingTop)};
  });
  add("desktop-finalized-three-column-top-row",d.editorDisplay==="grid"&&d.previewLeft<d.applyLeft&&d.applyLeft<d.commonLeft&&Math.abs(d.previewTop-d.applyTop)<=2&&Math.abs(d.applyTop-d.commonTop)<=2,d);
  add("desktop-top-row-bottom-aligned",Math.max(d.previewBottom,d.applyBottom,d.commonBottom)-Math.min(d.previewBottom,d.applyBottom,d.commonBottom)<=2,d);
  add("desktop-file-card-full-width-row-below",d.formatTop>=Math.max(d.previewBottom,d.applyBottom,d.commonBottom)+10&&Math.abs(d.formatLeft-d.editorLeft)<=2&&Math.abs(d.formatRight-d.editorRight)<=2,d);
  add("desktop-card-density-tokens",d.cardBorder==="1px"&&d.cardRadius===18&&d.cardPadding>=14&&d.cardPadding<=28,d);
  await page.close();
} finally { await browser.close(); }

const fail=rows.filter(r=>!r.pass).length;
console.log(JSON.stringify({tool:"021",kind:"finalized-actual-css-layout-in-node-playwright",total:rows.length,pass:rows.length-fail,fail,rows},null,2));
process.exit(fail?1:0);
