import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';
import {
  cleanupProjectValidationArtifacts,
  createValidationResultPackage,
  parseCounts,
} from './tool-validation-result-utils.mjs';

const mode = process.argv[2];
const defs = {
  'core-only': ['run', 'test:toolbox:012-core'],
  'boundary-only': ['run', 'test:toolbox:012-boundary'],
  'regression-only': ['run', 'test:toolbox:012-regression'],
  'limit-only': ['run', 'test:toolbox:012-limit'],
};
if (!defs[mode]) process.exit(2);

const npmCli = process.env.npm_execpath;
const cmd = npmCli && existsSync(npmCli)
  ? { exe: process.execPath, prefix: [npmCli] }
  : process.platform === 'win32'
    ? { exe: 'cmd.exe', prefix: ['/d', '/s', '/c', 'npm'] }
    : { exe: 'npm', prefix: [] };

const startedAt = new Date();
const started = Date.now();
const full = [...cmd.prefix, ...defs[mode]];
const run = spawnSync(cmd.exe, full, {
  cwd: process.cwd(),
  env: { ...process.env, FORCE_COLOR: '0' },
  encoding: 'utf8',
  windowsHide: true,
  shell: false,
  maxBuffer: 1024 * 1024 * 300,
});
const stdout = run.stdout || '';
const stderr = run.stderr || '';
const code = typeof run.status === 'number' ? run.status : 1;
process.stdout.write(stdout);
process.stderr.write(stderr);

const steps = [{
  name: mode,
  status: code === 0 ? 'passed' : 'failed',
  exitCode: code,
  durationSeconds: Math.round((Date.now() - started) / 100) / 10,
  counts: parseCounts(`${stdout}\n${stderr}`),
  command: `${cmd.exe} ${full.join(' ')}`,
  stdout,
  stderr,
}];
const endedAt = new Date();
const status = code === 0 ? 'passed' : 'failed';
const pkg = createValidationResultPackage({
  toolNumber: '012',
  validationType: mode,
  status,
  startedAt,
  endedAt,
  steps,
  extraFiles: mode === 'limit-only' ? [{
    source: 'test-results/tool-012-limit-report.json',
    destination: 'tool-012-limit-report.json',
  }] : [],
});
cleanupProjectValidationArtifacts();
console.log(`012 ${mode.toUpperCase()} RESULT: ${status.toUpperCase()}`);
console.log(`결과 ZIP: ${pkg.zipPath}`);
process.exit(status === 'passed' && pkg.zipCreated ? 0 : 1);
