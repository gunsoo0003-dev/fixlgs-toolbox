from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright

ROOT=Path.cwd()
css=(ROOT/'components/social-media-image-maker-tool.module.css').read_text(encoding='utf-8')

html=f'''<!doctype html><html><head><meta charset="utf-8"><style>
:root {{--tb-line:#d7dce4;--tb-panel:#fff;--tb-muted:#667085;--tb-soft:#f4f6f8;--tb-fg:#111827;--tb-inverse:#111827;--tb-inverse-fg:#fff;--blue:#1677ff;}}
[data-theme="dark"] {{--tb-line:#343a46;--tb-panel:#111827;--tb-muted:#aeb7c6;--tb-soft:#0b1220;--tb-fg:#f8fafc;--tb-inverse:#f8fafc;--tb-inverse-fg:#111827;--blue:#4ea1ff;}}
*{{box-sizing:border-box}} body{{margin:0;font-family:Arial,sans-serif;color:var(--tb-fg);background:var(--tb-soft)}} main{{max-width:1180px;margin:0 auto;padding:16px}}
{css}
</style></head><body><main class="wrapper" id="root">
<section class="platformSection"><div class="sectionHead"><div><p>PRESETS</p><h3>出力プラットフォーム</h3></div></div>
<div class="pillRow" id="pills">
'''+''.join([f'''<div class="pillShell"><button class="pill {'pillActive' if i==0 else ''}"><span>{label}</span><strong>{dim}</strong><small>現在のサイズのみ調整</small></button><label class="checkboxWrap"><input type="checkbox" checked></label></div>''' for i,(label,dim) in enumerate([
('Instagram 投稿','1080×1350'),('Instagram Story','1080×1920'),('Facebook','1080×1350'),('X','1200×675'),('LinkedIn','1200×1200')])])+'''</div></section>

<section class="editorGrid" id="editor">
  <div class="previewPanel" id="preview">
    <div class="sectionHead"><div><p>PREVIEW</p><h3>現在の編集サイズ</h3></div><div class="previewMeta"><strong>Instagram 投稿</strong><span>1080 × 1350 · 4:5</span></div></div>
    <div class="previewBox" tabindex="0"><canvas class="previewCanvas" width="190" height="238"></canvas></div>
    <div class="editTargetRow"><span>編集対象</span><div class="segmented"><button class="segmentedActive">背景</button><button>タイトル</button><button>説明</button><button>ロゴ</button></div></div>
    <div class="previewLegend"><span>公式対応範囲</span><strong>TOOLBOX preset</strong></div>
  </div>

  <aside class="controlPanel" id="controls">
    <section class="controlCard" id="applyCard">
      <div class="sectionHeadCompact"><h4>すべてのサイズに適用</h4><div class="scopeToggle"><button class="scopeActive">全サイズ</button><button>このサイズ</button></div></div>
      <div class="fieldGrid">
        <label><span>タイトル</span><input value="タイトル"></label>
        <label><span>説明</span><textarea>日本語の長い説明テキストでもモバイル画面からはみ出さないことを確認します。</textarea></label>
        <label><span>フォント</span><select><option>基本</option></select></label>
        <label><span>タイトルサイズ</span><input type="range"></label>
        <label><span>説明サイズ</span><input type="range"></label>
        <label><span>オーバーレイ</span><input type="range"></label>
      </div>
    </section>

    <section class="controlCard" id="formatCard">
      <div class="fieldGrid">
        <label><span>ファイル形式</span><select id="formatSelect"><option>JPG</option></select></label>
        <label><span>画像品質 · 92</span><input type="range"></label>
      </div>
      <div class="actionStack">
        <button class="primaryButton" id="primary">現在のサイズをダウンロード</button>
        <button class="secondaryButton">選択したサイズをZIPでダウンロード</button>
        <button class="ghostButton">編集を続ける</button>
        <button class="ghostButton">すべてリセット</button>
      </div>
      <p class="status">設定が準備できました。</p>
    </section>

    <section class="controlCard" id="commonCard">
      <div class="sectionHeadCompact"><h4>共通デザイン</h4></div>
      <div class="positionBlock">
        <h5>背景位置</h5>
        <div class="sliderRow"><span>横</span><input type="range"></div>
        <div class="sliderRow"><span>縦</span><input type="range"></div>
        <div class="sliderRow"><span>拡大・縮小</span><input type="range"></div>
      </div>
      <div class="positionBlock"><h5>タイトル位置</h5><div class="sliderRow"><span>横</span><input type="range"></div><div class="sliderRow"><span>縦</span><input type="range"></div></div>
      <div class="positionBlock"><h5>説明位置</h5><div class="sliderRow"><span>横</span><input type="range"></div><div class="sliderRow"><span>縦</span><input type="range"></div></div>
      <div class="positionBlock"><h5>ロゴ位置</h5><div class="sliderRow"><span>横</span><input type="range"></div><div class="sliderRow"><span>縦</span><input type="range"></div></div>
    </section>
  </aside>
</section>

<section class="gridSection"><div class="previewGrid"><article class="previewCard"><div class="previewCardHead"><div><h4>Instagram 投稿</h4><p>1080 × 1350 · 4:5</p></div></div><p class="previewNote" id="longfile">非常に長い日本語ファイル名_ソーシャルメディア画像制作用_テストテストテストテストテストテストテスト.jpg</p></article></div></section>
</main></body></html>'''

rows=[]
def add(name, ok, detail): rows.append({'name':name,'pass':bool(ok),'detail':detail})

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])

    for width in [320,360,390,768,1280]:
        page=browser.new_page(viewport={'width':width,'height':900})
        page.set_content(html)
        metrics=page.evaluate('''() => ({
          sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,
          pillDisplay:getComputedStyle(document.querySelector('#pills')).display,
          pillWrap:getComputedStyle(document.querySelector('#pills')).flexWrap,
          pillOverflow:getComputedStyle(document.querySelector('#pills')).overflowX,
          buttonH:document.querySelector('#primary').getBoundingClientRect().height,
          selectH:document.querySelector('#formatSelect').getBoundingClientRect().height,
          previewTop:document.querySelector('#preview').getBoundingClientRect().top,
          applyTop:document.querySelector('#applyCard').getBoundingClientRect().top,
          commonTop:document.querySelector('#commonCard').getBoundingClientRect().top,
          formatTop:document.querySelector('#formatCard').getBoundingClientRect().top,
          focusOutline:(()=>{const e=document.querySelector('.previewBox');e.focus();return getComputedStyle(e).outlineStyle})()
        })''')
        add(f'no-page-horizontal-overflow-{width}', metrics['sw'] <= metrics['cw']+1, metrics)
        if width <= 720:
            add(f'mobile-horizontal-preset-strip-{width}', metrics['pillDisplay']=='flex' and metrics['pillWrap']=='nowrap' and metrics['pillOverflow'] in ('auto','scroll'), metrics)
            add(f'mobile-finalized-order-{width}', metrics['previewTop'] < metrics['applyTop'] < metrics['commonTop'] < metrics['formatTop'], metrics)
        add(f'touch-target-primary-{width}', metrics['buttonH'] >= 44, metrics['buttonH'])
        add(f'touch-target-select-{width}', metrics['selectH'] >= 44, metrics['selectH'])
        add(f'focus-visible-mechanic-{width}', metrics['focusOutline'] != 'none', metrics['focusOutline'])
        page.close()

    page=browser.new_page(viewport={'width':1280,'height':1000})
    page.set_content(html)
    desktop=page.evaluate('''() => {
      const p=document.querySelector('#preview').getBoundingClientRect();
      const a=document.querySelector('#applyCard').getBoundingClientRect();
      const c=document.querySelector('#commonCard').getBoundingClientRect();
      const f=document.querySelector('#formatCard').getBoundingClientRect();
      return {
        rootWidth:document.querySelector('#root').getBoundingClientRect().width,
        editorDisplay:getComputedStyle(document.querySelector('#editor')).display,
        previewLeft:p.left, applyLeft:a.left, commonLeft:c.left,
        previewTop:p.top, applyTop:a.top, commonTop:c.top,
        previewBottom:p.bottom, applyBottom:a.bottom, commonBottom:c.bottom,
        formatTop:f.top, formatLeft:f.left, formatRight:f.right,
        editorLeft:document.querySelector('#editor').getBoundingClientRect().left,
        editorRight:document.querySelector('#editor').getBoundingClientRect().right,
        cardRadius:parseFloat(getComputedStyle(document.querySelector('#applyCard')).borderRadius),
        cardBorder:getComputedStyle(document.querySelector('#applyCard')).borderTopWidth,
        cardPadding:parseFloat(getComputedStyle(document.querySelector('#applyCard')).paddingTop)
      };
    }''')
    add('desktop-finalized-three-column-top-row',
        desktop['editorDisplay']=='grid'
        and desktop['previewLeft'] < desktop['applyLeft'] < desktop['commonLeft']
        and abs(desktop['previewTop']-desktop['applyTop']) <= 2
        and abs(desktop['applyTop']-desktop['commonTop']) <= 2,
        desktop)
    add('desktop-top-row-bottom-aligned',
        max(desktop['previewBottom'],desktop['applyBottom'],desktop['commonBottom']) - min(desktop['previewBottom'],desktop['applyBottom'],desktop['commonBottom']) <= 2,
        desktop)
    add('desktop-file-card-full-width-row-below',
        desktop['formatTop'] >= max(desktop['previewBottom'],desktop['applyBottom'],desktop['commonBottom']) + 10
        and abs(desktop['formatLeft']-desktop['editorLeft']) <= 2
        and abs(desktop['formatRight']-desktop['editorRight']) <= 2,
        desktop)
    add('desktop-card-density-tokens', desktop['cardBorder']=='1px' and desktop['cardRadius']==18 and 14 <= desktop['cardPadding'] <= 28, desktop)

    tokens=page.evaluate('''() => ({
      inputRadius:parseFloat(getComputedStyle(document.querySelector('textarea')).borderRadius),
      selectRadius:parseFloat(getComputedStyle(document.querySelector('#formatSelect')).borderRadius),
      primaryRadius:parseFloat(getComputedStyle(document.querySelector('#primary')).borderRadius),
      primaryHeight:document.querySelector('#primary').getBoundingClientRect().height
    })''')
    add('reference-control-radius-12', tokens['inputRadius']==12 and tokens['selectRadius']==12, tokens)
    add('reference-primary-pill', tokens['primaryRadius'] >= tokens['primaryHeight']/2, tokens)
    page.close()

    page=browser.new_page(viewport={'width':360,'height':500})
    page.set_content(html)
    page.focus('textarea')
    keyboard_metrics=page.evaluate('''() => ({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,textareaRight:document.querySelector('textarea').getBoundingClientRect().right,rootRight:document.querySelector('#root').getBoundingClientRect().right})''')
    add('mobile-reduced-viewport-keyboard-overflow', keyboard_metrics['sw'] <= keyboard_metrics['cw']+1 and keyboard_metrics['textareaRight'] <= keyboard_metrics['rootRight']+1, keyboard_metrics)
    page.close()

    page=browser.new_page(viewport={'width':360,'height':900})
    page.set_content(html)
    light=page.evaluate('''() => ({canvas:getComputedStyle(document.querySelector('canvas')).backgroundColor,panel:getComputedStyle(document.querySelector('#applyCard')).backgroundColor})''')
    page.evaluate("document.documentElement.setAttribute('data-theme','dark')")
    dark=page.evaluate('''() => ({canvas:getComputedStyle(document.querySelector('canvas')).backgroundColor,panel:getComputedStyle(document.querySelector('#applyCard')).backgroundColor})''')
    add('canvas-theme-independent-css', light['canvas']==dark['canvas'], {'light':light,'dark':dark})
    add('editor-panel-theme-changes', light['panel']!=dark['panel'], {'light':light,'dark':dark})
    line_metrics=page.evaluate('''() => Array.from(document.querySelectorAll('.actionStack button')).map(e=>({h:e.getBoundingClientRect().height,lh:parseFloat(getComputedStyle(e).lineHeight)||16,text:e.textContent}))''')
    add('ja-mobile-action-buttons-under-3-lines', all(m['h'] < max(80,m['lh']*3+24) for m in line_metrics), line_metrics)
    page.close()

    browser.close()

fail=sum(not r['pass'] for r in rows)
print(json.dumps({'tool':'021','kind':'finalized-actual-css-layout-in-chromium','total':len(rows),'pass':len(rows)-fail,'fail':fail,'rows':rows},ensure_ascii=False,indent=2))
sys.exit(1 if fail else 0)
