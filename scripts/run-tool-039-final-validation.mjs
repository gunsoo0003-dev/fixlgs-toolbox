import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const node = process.execPath;
const runner = path.join(root, 'scripts', 'tool-039', 'run-validation.mjs');

if (!fs.existsSync(runner)) {
  console.error('TOOL039 FINAL RUNNER MISSING');
  process.exit(87);
}

const result = spawnSync(node, [runner, 'final'], {
  cwd: root,
  encoding: 'utf8',
  stdio: 'inherit',
  shell: false,
  windowsHide: true,
});

process.exit(typeof result.status === 'number' ? result.status : 1);
