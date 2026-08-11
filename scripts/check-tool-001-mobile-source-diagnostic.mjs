import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'components/image-converter-tool.tsx');
const source = fs.readFileSync(file, 'utf8');
const checks = [
  ['INPUT_ACCEPT', /accept="image\/jpeg,image\/png,image\/webp,\.jpg,\.jpeg,\.png,\.webp"/.test(source)],
  ['FILE_ARRAYBUFFER', /file\.arrayBuffer\(\)/.test(source)],
  ['STRICT_FILENAME_KIND', /expectedKindFromName\(file\)/.test(source) && /if \(!expected \|\| expected !== kind\) throw new Error\("mismatch"\)/.test(source)],
  ['JPEG_REQUIRES_FINAL_EOI', /bytes\[bytes\.length - 2\] === 0xff/.test(source) && /bytes\[bytes\.length - 1\] === 0xd9/.test(source)],
  ['CREATE_IMAGE_BITMAP_FIRST', /createImageBitmap\(file, \{ imageOrientation: "from-image" \}\)/.test(source)],
  ['OBJECT_URL_FALLBACK', /URL\.createObjectURL\(file\)/.test(source) && /new Image\(\)/.test(source)],
  ['IMAGE_ONLOAD_DIMENSION', /image\.naturalWidth/.test(source) && /image\.naturalHeight/.test(source)],
  ['PIXEL_LIMIT_40MP', /MAX_PIXELS = 40_000_000/.test(source)],
  ['PREVIEW_OBJECT_URL', /previewUrl: URL\.createObjectURL\(file\)/.test(source)],
  ['INPUT_CLEAR_AFTER_ASYNC', /void addFiles\(selectedFiles\)\.finally\(\(\) => \{\s*input\.value = ""/.test(source)],
  ['ADD_FILES_SWALLOWS_REASON', /catch \{\s*rejected \+= 1;\s*\}/.test(source)],
  ['CONVERSION_REDECODE', /const loaded = await loadImageSource\(item\.file\)/.test(source)],
  ['CANVAS_READBACK', /ctx\.getImageData\(/.test(source)],
  ['CANVAS_TOBLOB', /canvas\.toBlob\(/.test(source)],
];

const findings = [];
for (const [name, value] of checks) {
  findings.push({ name, state: value ? 'PRESENT' : 'ABSENT' });
}

const riskFindings = [];
if (checks.find(([n]) => n === 'STRICT_FILENAME_KIND')?.[1]) {
  riskFindings.push({ severity: 'HIGH', code: 'FILENAME_EXTENSION_GATE', detail: 'Binary signature가 정상이어도 File.name 확장자가 없거나 다른 확장자면 001이 거부한다.' });
}
if (checks.find(([n]) => n === 'JPEG_REQUIRES_FINAL_EOI')?.[1]) {
  riskFindings.push({ severity: 'MEDIUM', code: 'JPEG_FINAL_EOI_GATE', detail: 'JPEG 마지막 2바이트가 FF D9가 아니면 디코더가 읽을 수 있는 JPEG도 사전검사에서 거부될 수 있다.' });
}
if (checks.find(([n]) => n === 'ADD_FILES_SWALLOWS_REASON')?.[1]) {
  riskFindings.push({ severity: 'HIGH', code: 'ERROR_REASON_SWALLOWED', detail: 'arrayBuffer/signature/decode 실패 원인이 모두 rejected 1개로 합쳐져 실제 실패 지점이 UI/기존 검수에서 사라진다.' });
}
if (checks.find(([n]) => n === 'CREATE_IMAGE_BITMAP_FIRST')?.[1]) {
  riskFindings.push({ severity: 'INFO', code: 'DUAL_DECODE_PATH', detail: 'createImageBitmap 실패 시 objectURL+Image fallback이 있으므로 두 경로를 분리 검사해야 한다.' });
}

const result = { generatedAt: new Date().toISOString(), source: path.relative(root, file), findings, riskFindings };
const outDir = path.join(root, 'test-results');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tool001-mobile-source-diagnostic.json'), JSON.stringify(result, null, 2));
fs.writeFileSync(path.join(outDir, 'tool001-mobile-source-diagnostic.txt'), [
  'TOOL 001 MOBILE SOURCE DIAGNOSTIC',
  ...findings.map(x => `${x.state}\t${x.name}`),
  '',
  '[RISK FINDINGS]',
  ...riskFindings.map(x => `${x.severity}\t${x.code}\t${x.detail}`),
].join('\n'));
console.log(fs.readFileSync(path.join(outDir, 'tool001-mobile-source-diagnostic.txt'), 'utf8'));
