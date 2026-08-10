from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image
import io, zipfile, json
html=Path('/mnt/data/022_runtime/index.html').read_text()
outdir=Path('/mnt/data/022_browser_evidence'); outdir.mkdir(exist_ok=True)
for x in outdir.iterdir():
    if x.is_file(): x.unlink()
report={'checks':[],'errors':[]}
def ok(n,c,d=''):
    report['checks'].append({'name':n,'pass':bool(c),'detail':d}); print(('PASS' if c else 'FAIL'),n,d)
def attach(page):
    page.on('pageerror', lambda exc: report['errors'].append(str(exc)))
with sync_playwright() as p:
    browser=p.chromium.connect_over_cdp('http://127.0.0.1:9222')
    ctx=browser.contexts[0]
    # PC page
    page=ctx.new_page(); attach(page); page.set_viewport_size({'width':1440,'height':1100}); page.set_content(html,wait_until='domcontentloaded')
    ok('PC H1','블로그' in page.locator('#h1').inner_text()); ok('Starter visible',page.locator('#starter').is_visible())
    page.locator('#blank').click(); page.wait_for_timeout(50); ok('Workspace visible',page.locator('#app').is_visible()); ok('4 presets',page.locator('.preset').count()==4)
    page.locator('#bg').set_input_files('/mnt/data/022_runtime/fixtures/landscape.jpg'); page.wait_for_timeout(100)
    page.locator('#logo').set_input_files('/mnt/data/022_runtime/fixtures/logo.png'); page.wait_for_timeout(100)
    page.locator('#title').fill('테스트 제목 BLOG TITLE'); page.locator('#detail').fill('설명 텍스트 description 日本語テスト')
    page.screenshot(path=str(outdir/'pc-ko.png'),full_page=True)
    ok('PC no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth'))
    with page.expect_download() as d: page.locator('#download').click()
    dl=d.value; jp=outdir/dl.suggested_filename; dl.save_as(str(jp)); im=Image.open(jp); ok('OG JPG dimensions',im.size==(1200,630),f'{im.size} {im.format}')
    page.locator('#format').select_option('png')
    with page.expect_download() as d: page.locator('#download').click()
    dl=d.value; pp=outdir/dl.suggested_filename; dl.save_as(str(pp)); im=Image.open(pp); ok('OG PNG dimensions',im.size==(1200,630) and im.format=='PNG',f'{im.size} {im.format}')
    with page.expect_download() as d: page.locator('#zip').click()
    dl=d.value; zp=outdir/dl.suggested_filename; dl.save_as(str(zp))
    with zipfile.ZipFile(zp) as z:
        names=z.namelist(); dims={n:Image.open(io.BytesIO(z.read(n))).size for n in names}
        ok('ZIP four results',len(names)==4,str(names)); ok('ZIP dimensions',dims=={'design-naver-blog.png':(1200,675),'design-blogger.png':(1200,675),'design-website-featured.png':(1200,630),'design-open-graph.png':(1200,630)},str(dims))
    page.locator('#sel').uncheck()
    with page.expect_download() as d: page.locator('#zip').click()
    dl=d.value; z3=outdir/'selected3.zip'; dl.save_as(str(z3))
    with zipfile.ZipFile(z3) as z: ok('ZIP selection respected',len(z.namelist())==3,str(z.namelist()))
    page.close()
    # corrupted page
    page=ctx.new_page(); attach(page); page.set_content(html,wait_until='domcontentloaded'); page.locator('#bg').set_input_files('/mnt/data/022_runtime/fixtures/corrupted.jpg'); page.wait_for_timeout(200); ok('Corrupted rejected',bool(page.locator('#err').inner_text().strip()),page.locator('#err').inner_text()); page.close()
    # mobile JA long page
    page=ctx.new_page(); attach(page); page.set_viewport_size({'width':390,'height':844}); page.set_content(html,wait_until='domcontentloaded'); page.locator('#blank').click(); page.wait_for_timeout(50)
    ok('Mobile workspace visible',page.locator('#app').is_visible())
    page.locator('#title').fill('日本語の非常に長いタイトルを確認するためのテストです長い文字列でも横方向にはみ出さないことを確認します'); page.locator('#detail').fill('説明文も長い日本語を入力してモバイル画面の折り返しと横スクロールが発生しないことを確認します。')
    page.screenshot(path=str(outdir/'mobile-ja-long.png'),full_page=True)
    sw=page.evaluate('document.documentElement.scrollWidth'); cw=page.evaluate('document.documentElement.clientWidth'); ok('Mobile 390 no horizontal overflow',sw<=cw,f'{sw}/{cw}')
    cols=page.locator('.presetGrid').evaluate("e=>getComputedStyle(e).gridTemplateColumns.split(' ').filter(Boolean).length"); ok('Mobile preset 2 columns',cols==2,str(cols))
    page.close(); ok('No runtime page errors',len(report['errors'])==0,str(report['errors']))
    browser.close()
report['pass']=all(c['pass'] for c in report['checks'])
(outdir/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)); print('FINAL',report['pass'])
