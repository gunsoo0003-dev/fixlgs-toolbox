import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';
import { resolve } from 'node:path';
import {
  cleanupProjectValidationArtifacts,
  createValidationResultPackage,
  parseCounts,
} from './tool-validation-result-utils.mjs';

const root = process.cwd();
const spec = resolve(root, 'tests/tool-014-limit.spec.ts');
const startedAt = new Date();

function finish(status, steps) {
  const endedAt = new Date();
  const result = createValidationResultPackage({
    toolNumber: '014',
    validationType: 'limit-only',
    status,
    startedAt,
    endedAt,
    steps,
    root,
  });
  cleanupProjectValidationArtifacts(root);
  if (!result.zipCreated) {
    console.error(`[HARNESS_ERROR] result ZIP creation failed: ${result.errorText || result.resultDir}`);
    process.exitCode = 2;
    return false;
  }
  console.log(`014 LIMIT-ONLY RESULT: ${status.toUpperCase()}`);
  console.log(`결과 ZIP: ${result.zipPath}`);
  return true;
}

if (!existsSync(spec)) {
  finish('harness_error', [{
    name: 'preflight',
    status: 'failed',
    exitCode: 2,
    durationSeconds: 0,
    counts: { passed: 0, failed: 1, skipped: 0 },
    command: 'spec existence check',
    stdout: '',
    stderr: `[HARNESS_ERROR] missing ${spec}`,
  }]);
  process.exit(2);
}

const npmCli = process.env.npm_execpath;
const cmd = npmCli && existsSync(npmCli)
  ? { exe: process.execPath, prefix: [npmCli] }
  : process.platform === 'win32'
    ? { exe: 'cmd.exe', prefix: ['/d', '/s', '/c', 'npm'] }
    : { exe: 'npm', prefix: [] };

const args = [
  ...cmd.prefix,
  'exec', 'playwright', 'test', 'tests/tool-014-limit.spec.ts',
  '--workers=1',
  '--project=desktop-chromium',
  '--reporter=line',
];

const stepStart = Date.now();
const run = spawnSync(cmd.exe, args, {
  cwd: root,
  encoding: 'utf8',
  windowsHide: true,
  shell: false,
  env: { ...process.env, FORCE_COLOR: '0' },
  maxBuffer: 1024 * 1024 * 300,
});

const stdout = run.stdout || '';
const stderr = run.stderr || '';
const spawnError = run.error ? String(run.error.stack || run.error.message || run.error) : '';
const output = `${stdout}\n${stderr}\n${spawnError}`;
const counts = parseCounts(output);
const exitCode = typeof run.status === 'number' ? run.status : 1;
const hasHarnessError = /\[HARNESS_ERROR\]/.test(output) || Boolean(run.error);
const hasProductFail = /\[PRODUCT_FAIL\]/.test(output);
const status = exitCode === 0
  ? 'passed'
  : hasHarnessError && !hasProductFail
    ? 'harness_error'
    : 'failed';

process.stdout.write(stdout);
process.stderr.write(stderr);
if (spawnError) process.stderr.write(`\n[HARNESS_ERROR] process launch failed\n${spawnError}\n`);

const steps = [{
  name: 'limit-only',
  status,
  exitCode,
  durationSeconds: Math.round((Date.now() - stepStart) / 100) / 10,
  counts,
  command: `${cmd.exe} ${args.join(' ')}`,
  stdout,
  stderr: [stderr, spawnError ? `[HARNESS_ERROR] process launch failed\n${spawnError}` : ''].filter(Boolean).join('\n'),
}];

const zipCreated = finish(status, steps);
if (!zipCreated) process.exit(2);
process.exit(status === 'passed' ? 0 : status === 'harness_error' ? 2 : 1);
