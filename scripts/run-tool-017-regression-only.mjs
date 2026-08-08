import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { cleanupProjectValidationArtifacts, createValidationResultPackage, parseCounts, resolveDesktopPath } from './tool-validation-result-utils.mjs';

const npmCli = process.env.npm_execpath;
const cmd = npmCli && existsSync(npmCli)
  ? { exe: process.execPath, prefix: [npmCli] }
  : process.platform === 'win32'
    ? { exe: 'cmd.exe', prefix: ['/d', '/s', '/c', 'npm'] }
    : { exe: 'npm', prefix: [] };
const startedAt = new Date();
const started = Date.now();
const full = [...cmd.prefix, 'run', 'test:toolbox:017-regression'];
const run = spawnSync(cmd.exe, full, { cwd: process.cwd(), env: { ...process.env, FORCE_COLOR: '0' }, encoding: 'utf8', windowsHide: true, shell: false, maxBuffer: 1024 * 1024 * 300 });
const stdout = run.stdout || '';
const stderr = run.stderr || '';
const code = typeof run.status === 'number' ? run.status : 1;
process.stdout.write(stdout);
process.stderr.write(stderr);
const text = `${stdout}\n${stderr}`;
const hasHarnessError = /\[HARNESS_ERROR\]/.test(text) || Boolean(run.error);
const hasProductFail = /\[PRODUCT_FAIL\]/.test(text);
const status = code === 0 ? 'passed' : hasHarnessError && !hasProductFail ? 'harness_error' : 'failed';
const steps = [{ name: 'regression-only', status, exitCode: code, durationSeconds: Math.round((Date.now() - started) / 100) / 10, counts: parseCounts(text), command: `${cmd.exe} ${full.join(' ')}`, stdout, stderr: run.error ? `${stderr}\n${run.error.message}` : stderr }];
const pkg = createValidationResultPackage({ toolNumber: '017', validationType: 'regression-only', status, startedAt, endedAt: new Date(), steps });
cleanupProjectValidationArtifacts();
let finalZip = pkg.zipPath;
if (pkg.zipCreated) {
  const fixed = resolve(resolveDesktopPath(), '017_regression-only_검수결과.zip');
  try { rmSync(fixed, { force: true }); renameSync(pkg.zipPath, fixed); finalZip = fixed; }
  catch (error) { console.error(`[HARNESS_ERROR] fixed result ZIP rename failed: ${error instanceof Error ? error.message : String(error)}`); }
}
console.log(`017 REGRESSION-ONLY RESULT: ${status.toUpperCase()}`);
console.log(`결과 ZIP: ${finalZip}`);
process.exit(code === 0 && pkg.zipCreated ? 0 : status === 'harness_error' ? 2 : 1);
