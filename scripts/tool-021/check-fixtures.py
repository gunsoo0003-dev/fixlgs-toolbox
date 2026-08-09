from pathlib import Path
from PIL import Image
import json, sys
root=Path.cwd()/"test-fixtures/tool-021"
required={
 'landscape.jpg':(1200,800),'portrait.jpg':(800,1200),'square.jpg':(900,900),'no-stretch-marker.png':(1200,800),
 'transparent.png':(640,640),'sample.webp':(800,600),'tiny.jpg':(8,8),'large-30mp.jpg':(6000,5000),'over-40mp.jpg':(7000,6000),'over-20mb.jpg':None,
 'corrupted.jpg':None,'mismatch.png':None,'한글 파일명.jpg':(1200,800),'日本語ファイル名.jpg':(800,1200),
 'animated.webp':(320,240),'animated.png':(320,240),'exif-rotated.jpg':(300,500),'text-cases.json':None,
}
rows=[]
for name,expected in required.items():
 p=root/name
 ok=p.exists()
 detail='missing'
 if ok and expected and name!='mismatch.png':
  try:
   with Image.open(p) as im:
    detail=f"{im.size[0]}x{im.size[1]} {im.format} animated={getattr(im,'is_animated',False)}"
    ok=im.size==expected
  except Exception as e:
   ok=False; detail=str(e)
 elif ok and name=='mismatch.png':
  with Image.open(p) as im:
   detail=f"extension=.png actual={im.format}"
   ok=im.format=='JPEG'
 elif ok and name=='over-20mb.jpg':
  detail=f"bytes={p.stat().st_size}"
  ok=p.stat().st_size>20*1024*1024 and p.read_bytes()[:2]==b'\xff\xd8'
 elif ok and name=='corrupted.jpg':
  try:
   Image.open(p).verify(); ok=False; detail='unexpectedly decodable'
  except Exception: ok=True; detail='intentionally corrupt'
 elif ok and name=='text-cases.json':
  data=json.loads(p.read_text(encoding='utf-8')); ok=all(k in data for k in ['koLong','enLong','jaNoSpace','emoji']); detail=f"keys={list(data)}"
 rows.append({'fixture':name,'pass':ok,'detail':detail})
print(json.dumps({'tool':'021','total':len(rows),'pass':sum(r['pass'] for r in rows),'fail':sum(not r['pass'] for r in rows),'rows':rows},ensure_ascii=False,indent=2))
sys.exit(1 if any(not r['pass'] for r in rows) else 0)
