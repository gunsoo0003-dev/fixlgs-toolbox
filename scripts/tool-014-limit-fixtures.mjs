import { copyFileSync, existsSync, mkdirSync, openSync, closeSync, rmSync, statSync, ftruncateSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const source = resolve(root, 'test-fixtures/tool-014-limit/tiny-01.png');
const outDir = resolve(root, '.tmp-tool-014-limit-fixtures');

function ensure() {
  if (!existsSync(source)) throw new Error(`[HARNESS_ERROR] missing base fixture: ${source}`);
  mkdirSync(outDir, { recursive: true });
}
function paddedCopy(name, targetBytes) {
  ensure();
  const out = resolve(outDir, name);
  copyFileSync(source, out);
  const fd = openSync(out, 'r+');
  try {
    // PNG 디코딩은 1×1 그대로 유지하면서 파일 크기 조건만 재현하기 위해
    // 파일 후미를 확장한다. 브라우저별 trailing-data 허용 여부는 preflight에서 확인한다.
    const current = statSync(out).size;
    if (targetBytes > current) {
      ftruncateSync(fd, targetBytes);
    }
  } finally { closeSync(fd); }
  return out;
}
function cloneTiny(name) {
  ensure();
  const out = resolve(outDir, name);
  copyFileSync(source, out);
  return out;
}
function cleanup() {
  rmSync(outDir, { recursive: true, force: true });
}
export { outDir, paddedCopy, cloneTiny, cleanup };
