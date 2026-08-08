import { copyFileSync, mkdirSync, rmSync, statSync, truncateSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const dir = resolve(tmpdir(), 'fixlgs-toolbox-tool016-limit-fixtures');
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const source = resolve('test-fixtures', 'sample.jpg');
for (const [name, size] of [
  ['file-before.jpg', MAX_FILE_BYTES - 1],
  ['file-limit.jpg', MAX_FILE_BYTES],
  ['file-over.jpg', MAX_FILE_BYTES + 1],
]) {
  const out = resolve(dir, name);
  copyFileSync(source, out);
  truncateSync(out, size);
  if (statSync(out).size !== size) throw new Error(`fixture size mismatch: ${name}`);
}
console.log(`016 limit fixtures ready: ${dir}`);
