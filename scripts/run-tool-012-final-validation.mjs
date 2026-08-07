import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';
import {
  cleanupProjectValidationArtifacts,
  createValidationResultPackage,
  parseCounts,
} from './tool-validation-result-utils.mjs';

const definitions = [
  ['validator', ['run', 'check:tool012-validator']],
  ['source', ['run', 'check:tool012-source']],
  ['ja-terms', ['run', 'check:ja-terms']],
  ['build', ['run', 'build']],
  ['common', ['run', 'test:toolbox:common-additive']],
  ['core', ['run', 'test:toolbox:012-core']],
  ['boundary', ['run', 'test:toolbox:012-boundary']],
  ['regression', ['run', 'test:toolbox:012-regression']],
  ['service-limit', ['run', 'test:toolbox:012-limit']],
];

const npmCli = process.env.npm_execpath;
const cmd = npmCli && existsSync(npmCli)
  ? { exe: process.execPath, prefix: [npmCli] }
  : process.platform === 'win32'
    ? { exe: 'cmd.exe', prefix: ['/d', '/s', '/c', 'npm'] }
    : { exe: 'npm', prefix: [] };

const startedAt = new Date();
const steps = [];
let prerequisiteFailed = false;

for (const [name, args] of definitions) {
  if (prerequisiteFailed && name === 'service-limit') {
    steps.push({
      name,
      status: 'skipped',
      exitCode: null,
      durationSeconds: 0,
      counts: { passed: 0, failed: 0, skipped: 1 },
      command: 'skipped',
      stdout: '',
      stderr: '선행 단계 실패로 서비스 상한 검수 미실행',
    });
    continue;
  }

  const t = Date.now();
  const full = [...cmd.prefix, ...args];
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
  steps.push({
    name,
    status: code === 0 ? 'passed' : 'failed',
    exitCode: code,
    durationSeconds: Math.round((Date.now() - t) / 100) / 10,
    counts: parseCounts(`${stdout}\n${stderr}`),
    command: `${cmd.exe} ${full.join(' ')}`,
    stdout,
    stderr,
  });
  if (code !== 0 && name !== 'service-limit') prerequisiteFailed = true;
}

const endedAt = new Date();
const failed = steps.some((step) => step.status === 'failed');
const skipped = steps.some((step) => step.status === 'skipped');
const status = failed || skipped ? 'failed' : 'passed';
const pkg = createValidationResultPackage({
  toolNumber: '012',
  validationType: 'final',
  status,
  startedAt,
  endedAt,
  steps,
  extraFiles: [{
    source: 'test-results/tool-012-limit-report.json',
    destination: 'limit/tool-012-limit-report.json',
  }],
});
cleanupProjectValidationArtifacts();
console.log(`012 FINAL RESULT: ${status.toUpperCase()}`);
console.log(`FAIL ${steps.filter((step) => step.status === 'failed').length} / SKIP ${steps.filter((step) => step.status === 'skipped').length}`);
console.log(`결과 ZIP: ${pkg.zipPath}`);
process.exit(status === 'passed' && pkg.zipCreated ? 0 : 1);
