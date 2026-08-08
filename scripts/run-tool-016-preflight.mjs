import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
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
    counts: (()=>{const c=parseCounts(`${stdout}\n${stderr}`);if(code===0&&c.passed===0)c.passed=1;if(code!==0&&c.failed===0)c.failed=1;return c})(),
    command,
    stdout,
    stderr,
  });
  return code;
}

function runNodeScript(scriptPath) {
  const started = Date.now();
  const run = spawnSync(process.execPath, [scriptPath], {
    cwd: process.cwd(), encoding: 'utf8', windowsHide: true, shell: false,
    env: { ...process.env, FORCE_COLOR: '0' }, maxBuffer: 1024 * 1024 * 50,
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
    args = [localCli, 'test', 'tests/tool-016-preflight.spec.ts', '--workers=1'];
  } else {
    const npmCli = process.env.npm_execpath;
    if (npmCli && existsSync(npmCli)) {
      exe = process.execPath;
      args = [npmCli, 'exec', '--', 'playwright', 'test', 'tests/tool-016-preflight.spec.ts', '--workers=1'];
    } else if (process.platform === 'win32') {
      exe = 'cmd.exe';
      args = ['/d', '/s', '/c', 'npm', 'exec', '--', 'playwright', 'test', 'tests/tool-016-preflight.spec.ts', '--workers=1'];
    } else {
      exe = 'npm';
      args = ['exec', '--', 'playwright', 'test', 'tests/tool-016-preflight.spec.ts', '--workers=1'];
    }
  }
  const run = spawnSync(exe, args, {
    cwd: process.cwd(), encoding: 'utf8', windowsHide: true, shell: false,
    env: { ...process.env, FORCE_COLOR: '0' }, maxBuffer: 1024 * 1024 * 100,
  });
  return recordStep('runtime-harness', `${exe} ${args.join(' ')}`, run, started);
}

let failed = false;
const staticCode = runNodeScript('scripts/check-tool-016-harness.mjs');
if (staticCode !== 0) {
  failed = true;
  steps.push({
    name: 'runtime-harness', status: 'skipped', exitCode: null, durationSeconds: 0,
    counts: { passed: 0, failed: 0, skipped: 1 },
    command: 'playwright preflight (not started because static harness failed)',
    stdout: '', stderr: 'Runtime preflight was not started because static selector/DOM preflight failed.',
  });
  console.error('HARNESS_ERROR: 016 static selector/DOM preflight failed. Feature tests were not started.');
} else {
  const runtimeCode = runPlaywrightPreflight();
  if (runtimeCode !== 0) {
    failed = true;
    console.error('HARNESS_ERROR: 016 runtime preflight failed. Check dependency/runtime availability, route, selector, expected UI text, and timing before classifying a product failure.');
  }
}

const endedAt = new Date();
const status = failed ? 'failed' : 'passed';
const packaged = createValidationResultPackage({ toolNumber: '016', validationType: 'preflight', status, startedAt, endedAt, steps });
cleanupProjectValidationArtifacts();
let finalZipPath = packaged.zipPath;
if (packaged.zipCreated) {
  const fixed = packaged.zipPath.replace(/016_preflight_검수결과_\d{8}_\d{6}\.zip$/, '016_preflight_검수결과.zip');
  if (fixed !== packaged.zipPath) { rmSync(fixed,{force:true}); renameSync(packaged.zipPath,fixed); finalZipPath=fixed; }
}
console.log(`016 PREFLIGHT RESULT: ${status.toUpperCase()}`);
console.log(`결과 ZIP: ${finalZipPath}`);
if (!failed) console.log('016 PREFLIGHT: PASS — route, expected visible UI values, and initial/ready-state selectors are connected. Full feature validation was not run.');
process.exit(status === 'passed' && packaged.zipCreated ? 0 : 1);
