const cases = [
  { name:'landscape-to-story', sw:1200, sh:800, tw:1080, th:1920, expectedScale:2.4, expectedW:2880, expectedH:1920 },
  { name:'portrait-to-x', sw:800, sh:1200, tw:1200, th:675, expectedScale:1.5, expectedW:1200, expectedH:1800 },
  { name:'square-to-instagram', sw:900, sh:900, tw:1080, th:1350, expectedScale:1.5, expectedW:1350, expectedH:1350 },
];
const rows = cases.map(c => {
  const scale = Math.max(c.tw / c.sw, c.th / c.sh);
  const dw = c.sw * scale;
  const dh = c.sh * scale;
  const noStretch = Math.abs(dw / dh - c.sw / c.sh) < 1e-12;
  const covers = dw + 1e-9 >= c.tw && dh + 1e-9 >= c.th;
  const exact = Math.abs(scale-c.expectedScale)<1e-12 && Math.abs(dw-c.expectedW)<1e-9 && Math.abs(dh-c.expectedH)<1e-9;
  return {name:c.name, scale, draw:[dw,dh], noStretch, covers, expected:exact, pass:noStretch&&covers&&exact};
});
console.log(JSON.stringify({tool:'021',rows,pass:rows.every(r=>r.pass)},null,2));
if(rows.some(r=>!r.pass)) process.exit(1);
