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
const t = Date.now();
const args = [...cmd.prefix, 'exec', 'playwright', 'test', 'tests/tool-013-limit.spec.ts', '--workers=1', '--project=desktop-chromium'];
const result = spawnSync(cmd.exe, args, {
  cwd: process.cwd(),
  env: { ...process.env, FORCE_COLOR: '0' },
  encoding: 'utf8',
  windowsHide: true,
  shell: false,
  maxBuffer: 1024 * 1024 * 300,
});
const stdout = result.stdout || '';
const stderr = result.stderr || '';
const exitCode = typeof result.status === 'number' ? result.status : 1;
process.stdout.write(stdout);
process.stderr.write(stderr);
const endedAt = new Date();
const status = exitCode === 0 ? 'passed' : 'failed';
const steps = [{
  name: 'limit-only',
  status,
  exitCode,
  durationSeconds: Math.round((Date.now() - t) / 100) / 10,
  counts: parseCounts(`${stdout}\n${stderr}`),
  command: `${cmd.exe} ${args.join(' ')}`,
  stdout,
  stderr,
}];
const pkg = createValidationResultPackage({
  toolNumber: '013',
  validationType: 'limit-only',
  status,
  startedAt,
  endedAt,
  steps,
  extraFiles: [{ source: 'test-results/tool-013-limit-report.json', destination: 'limit/tool-013-limit-report.json' }],
});
cleanupProjectValidationArtifacts();
console.log(`013 LIMIT-ONLY RESULT: ${status.toUpperCase()}`);
console.log(`결과 ZIP: ${pkg.zipPath}`);
process.exit(status === 'passed' && pkg.zipCreated ? 0 : 1);
