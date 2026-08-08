import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import {
  cleanupProjectValidationArtifacts,
  createValidationResultPackage,
  parseCounts,
} from './tool-validation-result-utils.mjs';

const definitions = [
  ['validator', ['run', 'check:tool016-validator']],
  ['source', ['run', 'check:tool016-source']],
  ['design', ['run', 'check:tool016-design']],
  ['delivery', ['run', 'check:tool016-delivery']],
  ['ja-terms', ['run', 'check:ja-terms']],
  ['build', ['run', 'build']],
  ['common', ['run', 'test:toolbox:016-common']],
  ['core', ['run', 'test:toolbox:016-core-only']],
  ['boundary', ['run', 'test:toolbox:016-boundary-only']],
  ['regression', ['run', 'test:toolbox:016-regression-only']],
  ['service-limit', ['run', 'test:toolbox:016-limit-only']],
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

  const started = Date.now();
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
    durationSeconds: Math.round((Date.now() - started) / 100) / 10,
    counts: (()=>{const c=parseCounts(`${stdout}\n${stderr}`);if(code===0&&c.passed===0)c.passed=1;if(code!==0&&c.failed===0)c.failed=1;return c})(),
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
const packaged = createValidationResultPackage({
  toolNumber: '016',
  validationType: 'final',
  status,
  startedAt,
  endedAt,
  steps,
});
let finalZipPath = packaged.zipPath;
if (packaged.zipCreated) {
  finalZipPath = resolve(dirname(packaged.zipPath), '016_final_검수결과.zip');
  rmSync(finalZipPath, { force: true });
  renameSync(packaged.zipPath, finalZipPath);
}
cleanupProjectValidationArtifacts();
console.log(`016 FINAL RESULT: ${status.toUpperCase()}`);
console.log(`FAIL ${steps.filter((step) => step.status === 'failed').length} / SKIP ${steps.filter((step) => step.status === 'skipped').length}`);
console.log(`결과 ZIP: ${finalZipPath}`);
process.exit(status === 'passed' && packaged.zipCreated ? 0 : 1);
