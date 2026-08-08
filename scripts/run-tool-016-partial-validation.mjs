import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import process from 'node:process';
import {
  cleanupProjectValidationArtifacts,
  createValidationResultPackage,
  parseCounts,
} from './tool-validation-result-utils.mjs';

const mode = process.argv[2];
const defs = {
  'core-only': ['run', 'test:toolbox:016-core'],
  'boundary-only': ['run', 'test:toolbox:016-boundary'],
  'regression-only': ['run', 'test:toolbox:016-regression'],
  'limit-only': ['run', 'test:toolbox:016-limit'],
};
if (!defs[mode]) {
  console.error('mode: core-only | boundary-only | regression-only | limit-only');
  process.exit(2);
}

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
  cwd: process.cwd(), env: { ...process.env, FORCE_COLOR: '0' }, encoding: 'utf8',
  windowsHide: true, shell: false, maxBuffer: 1024 * 1024 * 300,
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
  counts: (()=>{const c=parseCounts(`${stdout}\n${stderr}`);if(code===0&&c.passed===0)c.passed=1;if(code!==0&&c.failed===0)c.failed=1;return c})(),
  command: `${cmd.exe} ${full.join(' ')}`,
  stdout,
  stderr,
}];
const packaged = createValidationResultPackage({
  toolNumber: '016', validationType: mode, status: code === 0 ? 'passed' : 'failed',
  startedAt, endedAt: new Date(), steps,
});
cleanupProjectValidationArtifacts();
let finalZipPath = packaged.zipPath;
if (packaged.zipCreated) {
  const fixed = packaged.zipPath.replace(/016_[^/\\]+_검수결과_\d{8}_\d{6}\.zip$/, `016_${mode}_검수결과.zip`);
  if (fixed !== packaged.zipPath) { rmSync(fixed,{force:true}); renameSync(packaged.zipPath,fixed); finalZipPath=fixed; }
}
console.log(`016 ${mode.toUpperCase()} RESULT: ${code === 0 ? 'PASSED' : 'FAILED'}`);
console.log(`결과 ZIP: ${finalZipPath}`);
process.exit(code === 0 && packaged.zipCreated ? 0 : 1);
