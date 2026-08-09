import { createStoredZip } from '../../lib/zip.ts';

function readEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder('utf-8');
  const names = [];
  let offset = 0;
  while (offset + 30 <= bytes.length) {
    const sig = view.getUint32(offset, true);
    if (sig === 0x04034b50) {
      const flags = view.getUint16(offset + 6, true);
      const compSize = view.getUint32(offset + 18, true);
      const nameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);
      if ((flags & 0x0800) === 0) throw new Error('UTF-8 flag is missing');
      const nameStart = offset + 30;
      names.push(decoder.decode(bytes.slice(nameStart, nameStart + nameLen)));
      offset = nameStart + nameLen + extraLen + compSize;
      continue;
    }
    if (sig === 0x02014b50 || sig === 0x06054b50) break;
    throw new Error(`unexpected ZIP signature at ${offset}: ${sig.toString(16)}`);
  }
  return names;
}

const files = [
  { name: 'sample-instagram-post.png', blob: new Blob(['one']) },
  { name: '한글-instagram-story.png', blob: new Blob(['two']) },
  { name: '日本語-linkedin.png', blob: new Blob(['three']) },
];
const zip = await createStoredZip(files);
const bytes = new Uint8Array(await zip.arrayBuffer());
const names = readEntries(bytes);
const expected = files.map((file) => file.name);
const rows = [
  { id: 'mime', pass: zip.type === 'application/zip', got: zip.type },
  { id: 'non-empty', pass: zip.size > 100, got: zip.size },
  { id: 'entry-count', pass: names.length === expected.length, got: names.length },
  { id: 'entry-order', pass: JSON.stringify(names) === JSON.stringify(expected), got: names },
  { id: 'unicode-names', pass: names[1] === expected[1] && names[2] === expected[2], got: names.slice(1) },
];
const fail = rows.filter((row) => !row.pass).length;
console.log(JSON.stringify({ tool: '021', total: rows.length, pass: rows.length - fail, fail, rows }, null, 2));
if (fail) process.exit(1);
