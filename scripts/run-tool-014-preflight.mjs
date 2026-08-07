import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import {
  cleanupProjectValidationArtifacts,
  createValidationResultPackage,
  parseCounts,
} from './tool-validation-result-utils.mjs';

const startedAt = new Date();
const steps = [];

function recordStep(name, command, run, startedMs) {
  const stdout = run.stdout || '';
  const stderr = run.stderr || '';
  const code = typeof run.status === 'number' ? run.status : 1;
  process.stdout.write(stdout);
  process.stderr.write(stderr);
  steps.push({
    name,
    status: code === 0 ? 'passed' : 'failed',
    exitCode: code,
    durationSeconds: Math.round((Date.now() - startedMs) / 100) / 10,
    counts: parseCounts(`${stdout}\n${stderr}`),
    command,
    stdout,
    stderr,
  });
  return code;
}

function runNodeScript(scriptPath) {
  const started = Date.now();
  const run = spawnSync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    env: { ...process.env, FORCE_COLOR: '0' },
    maxBuffer: 1024 * 1024 * 50,
  });
  return recordStep('static-harness', `${process.execPath} ${scriptPath}`, run, started);
}

function runPlaywrightPreflight() {
  const started = Date.now();
  const localCli = resolve(process.cwd(), 'node_modules', '@playwright', 'test', 'cli.js');
  let exe;
  let args;

  if (existsSync(localCli)) {
    exe = process.execPath;
    args = [localCli, 'test', 'tests/tool-014-preflight.spec.ts', '--workers=1'];
  } else {
    const npmCli = process.env.npm_execpath;
    if (npmCli && existsSync(npmCli)) {
      exe = process.execPath;
      args = [npmCli, 'exec', '--', 'playwright', 'test', 'tests/tool-014-preflight.spec.ts', '--workers=1'];
    } else if (process.platform === 'win32') {
      exe = 'cmd.exe';
      args = ['/d', '/s', '/c', 'npm', 'exec', '--', 'playwright', 'test', 'tests/tool-014-preflight.spec.ts', '--workers=1'];
    } else {
      exe = 'npm';
      args = ['exec', '--', 'playwright', 'test', 'tests/tool-014-preflight.spec.ts', '--workers=1'];
    }
  }

  const run = spawnSync(exe, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    env: { ...process.env, FORCE_COLOR: '0' },
    maxBuffer: 1024 * 1024 * 100,
  });
  return recordStep('runtime-harness', `${exe} ${args.join(' ')}`, run, started);
}

let failed = false;
const staticCode = runNodeScript('scripts/check-tool-014-harness.mjs');
if (staticCode !== 0) {
  failed = true;
  steps.push({
    name: 'runtime-harness',
    status: 'skipped',
    exitCode: null,
    durationSeconds: 0,
    counts: { passed: 0, failed: 0, skipped: 1 },
    command: 'playwright preflight (not started because static harness failed)',
    stdout: '',
    stderr: 'Runtime preflight was not started because static selector/DOM preflight failed.',
  });
  console.error('HARNESS_ERROR: 014 static selector/DOM preflight failed. Feature tests were not started.');
} else {
  const runtimeCode = runPlaywrightPreflight();
  if (runtimeCode !== 0) {
    failed = true;
    console.error('HARNESS_ERROR: 014 runtime preflight failed. Treat as harness/connection error until selector, route, timing, or environment cause is resolved. Do not classify this as feature FAIL.');
  }
}

const endedAt = new Date();
const status = failed ? 'failed' : 'passed';
const packaged = createValidationResultPackage({
  toolNumber: '014',
  validationType: 'preflight',
  status,
  startedAt,
  endedAt,
  steps,
});
cleanupProjectValidationArtifacts();

console.log(`014 PREFLIGHT RESULT: ${status.toUpperCase()}`);
console.log(`결과 ZIP: ${packaged.zipPath}`);
if (!failed) console.log('014 PREFLIGHT: PASS — harness can reach the route and required initial/ready-state DOM. Full feature validation was not run.');
process.exit(status === 'passed' && packaged.zipCreated ? 0 : 1);
