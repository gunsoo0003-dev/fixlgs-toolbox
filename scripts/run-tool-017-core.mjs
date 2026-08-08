import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import {
  cleanupProjectValidationArtifacts,
  createValidationResultPackage,
  parseCounts,
  resolveDesktopPath,
} from './tool-validation-result-utils.mjs';

const startedAt = new Date();
const started = Date.now();

function resolvePlaywrightCommand() {
  const local = resolve(process.cwd(), 'node_modules', '@playwright', 'test', 'cli.js');
  if (existsSync(local)) {
    return { exe: process.execPath, args: [local, 'test', '--workers=1', '--config=playwright.tool017-core.config.ts'] };
  }
  const npmCli = process.env.npm_execpath;
  if (npmCli && existsSync(npmCli)) {
    return { exe: process.execPath, args: [npmCli, 'exec', '--', 'playwright', 'test', '--workers=1', '--config=playwright.tool017-core.config.ts'] };
  }
  if (process.platform === 'win32') {
    return { exe: 'cmd.exe', args: ['/d', '/s', '/c', 'npm', 'exec', '--', 'playwright', 'test', '--workers=1', '--config=playwright.tool017-core.config.ts'] };
  }
  return { exe: 'npm', args: ['exec', '--', 'playwright', 'test', '--workers=1', '--config=playwright.tool017-core.config.ts'] };
}

const cmd = resolvePlaywrightCommand();
const run = spawnSync(cmd.exe, cmd.args, {
  cwd: process.cwd(),
  env: { ...process.env, FORCE_COLOR: '0' },
  encoding: 'utf8',
  windowsHide: true,
  shell: false,
  maxBuffer: 1024 * 1024 * 200,
});

const stdout = run.stdout || '';
const stderr = run.stderr || '';
const exitCode = typeof run.status === 'number' ? run.status : 1;
process.stdout.write(stdout);
process.stderr.write(stderr);

const text = `${stdout}\n${stderr}`;
const hasHarnessError = /\[HARNESS_ERROR\]/.test(text) || Boolean(run.error);
const hasProductFail = /\[PRODUCT_FAIL\]/.test(text);
const status = exitCode === 0 ? 'passed' : hasHarnessError && !hasProductFail ? 'harness_error' : 'failed';
const steps = [{
  name: 'core-only',
  status,
  exitCode,
  durationSeconds: Math.round((Date.now() - started) / 100) / 10,
  counts: parseCounts(text),
  command: `${cmd.exe} ${cmd.args.join(' ')}`,
  stdout,
  stderr: run.error ? `${stderr}\n${run.error.message}` : stderr,
}];

const endedAt = new Date();
const pkg = createValidationResultPackage({
  toolNumber: '017',
  validationType: 'core-only',
  status,
  startedAt,
  endedAt,
  steps,
});
cleanupProjectValidationArtifacts();

let finalZip = pkg.zipPath;
if (pkg.zipCreated) {
  const fixed = resolve(resolveDesktopPath(), '017_core-only_검수결과.zip');
  try {
    rmSync(fixed, { force: true });
    renameSync(pkg.zipPath, fixed);
    finalZip = fixed;
  } catch (error) {
    console.error(`[HARNESS_ERROR] fixed result ZIP rename failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`017 CORE-ONLY RESULT: ${status.toUpperCase()}`);
console.log(`결과 ZIP: ${finalZip}`);
process.exit(exitCode === 0 && pkg.zipCreated ? 0 : status === 'harness_error' ? 2 : 1);
