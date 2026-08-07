import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';
import { cleanupProjectValidationArtifacts, createValidationResultPackage, parseCounts } from './tool-validation-result-utils.mjs';

const npmCli = process.env.npm_execpath;
const cmd = npmCli && existsSync(npmCli)
  ? { exe: process.execPath, prefix: [npmCli] }
  : process.platform === 'win32'
    ? { exe: 'cmd.exe', prefix: ['/d', '/s', '/c', 'npm'] }
    : { exe: 'npm', prefix: [] };

const startedAt = new Date();
const startedMs = Date.now();
const full = [...cmd.prefix, 'run', 'test:toolbox:013-regression'];
const result = spawnSync(cmd.exe, full, {
  cwd: process.cwd(),
  env: { ...process.env, FORCE_COLOR: '0' },
  encoding: 'utf8',
  windowsHide: true,
  shell: false,
  maxBuffer: 1024 * 1024 * 300,
});
const stdout = result.stdout || '';
const stderr = result.stderr || '';
const code = typeof result.status === 'number' ? result.status : 1;
process.stdout.write(stdout);
process.stderr.write(stderr);
const steps = [{
  name: 'regression-only',
  status: code === 0 ? 'passed' : 'failed',
  exitCode: code,
  durationSeconds: Math.round((Date.now() - startedMs) / 100) / 10,
  counts: parseCounts(`${stdout}\n${stderr}`),
  command: `${cmd.exe} ${full.join(' ')}`,
  stdout,
  stderr,
}];
const endedAt = new Date();
const status = code === 0 ? 'passed' : 'failed';
const pkg = createValidationResultPackage({
  toolNumber: '013',
  validationType: 'regression-only',
  status,
  startedAt,
  endedAt,
  steps,
});
cleanupProjectValidationArtifacts();
console.log(`013 REGRESSION-ONLY RESULT: ${status.toUpperCase()}`);
console.log(`결과 ZIP: ${pkg.zipPath}`);
process.exit(status === 'passed' && pkg.zipCreated ? 0 : 1);
