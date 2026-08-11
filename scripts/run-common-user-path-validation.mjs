import { spawn } from 'node:child_process';
import { existsSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  cleanupProjectValidationArtifacts,
  createValidationResultPackage,
  parseCounts,
  resolveDesktopPath,
} from './tool-validation-result-utils.mjs';

const root = process.cwd();
const mode = process.argv[2] === 'fast' ? 'fast' : 'full';
const rawTarget = process.argv[3] || '';
const targetTool = /^\d{1,3}$/.test(rawTarget) ? rawTarget.padStart(3, '0') : '';
const startedAt = new Date();
cleanupProjectValidationArtifacts(root);

function run(name, command, args) {
  return new Promise((resolveRun) => {
    const started = Date.now();
    let stdout = '';
    let stderr = '';

    console.log(`\n[STEP START] ${name}`);
    console.log(`[COMMAND] ${[command, ...args].join(' ')}`);

    const child = spawn(command, args, {
      cwd: root,
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        TOOLBOX_VALIDATION_MODE: mode === 'fast' ? 'fast' : 'final',
        TOOLBOX_VALIDATION_TOOL: targetTool,
      },
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    const heartbeat = setInterval(() => {
      const seconds = Math.round((Date.now() - started) / 1000);
      console.log(`[RUNNING] ${name} ... ${seconds}s`);
    }, 30000);

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on('error', (error) => {
      clearInterval(heartbeat);
      const text = `[HARNESS_ERROR] ${name}: ${error.message}\n`;
      stderr += text;
      process.stderr.write(text);
      resolveRun({
        name,
        command: [command, ...args].join(' '),
        status: 'failed',
        exitCode: 1,
        durationSeconds: Math.round((Date.now() - started) / 100) / 10,
        counts: parseCounts(`${stdout}\n${stderr}`),
        stdout,
        stderr,
      });
    });

    child.on('close', (code) => {
      clearInterval(heartbeat);
      const exitCode = code ?? 1;
      console.log(`[STEP END] ${name} -> ${exitCode === 0 ? 'PASS' : 'FAIL'} (${Math.round((Date.now() - started) / 100) / 10}s)`);
      resolveRun({
        name,
        command: [command, ...args].join(' '),
        status: exitCode === 0 ? 'passed' : 'failed',
        exitCode,
        durationSeconds: Math.round((Date.now() - started) / 100) / 10,
        counts: parseCounts(`${stdout}\n${stderr}`),
        stdout,
        stderr,
      });
    });
  });
}

if (targetTool) {
  const profilePath = resolve(root, 'tests/common-validation/capability-profile.json');
  const profiles = JSON.parse(readFileSync(profilePath, 'utf8'));
  if (!profiles.some((item) => item.tool === targetTool)) {
    console.error(`[COMMON USER PATH] TOOL ${targetTool} capability profile is not registered.`);
    console.error('Register the new tool in tests/common-validation/capability-profile.json first.');
    process.exit(2);
  }
  console.log(`[COMMON USER PATH] SINGLE TOOL MODE: ${targetTool}`);
}

const steps = [];
steps.push(await run('coverage', 'npm', ['run', 'check:toolbox:common-user-path-coverage']));

if (mode === 'fast') {
  // FAST: 대표 8개 도구를 한 Page에서 연속 검수해 브라우저/context 재생성 비용을 크게 줄인다.
  steps.push(await run('fast-desktop-upload', 'npx', ['playwright', 'test', 'tests/common-user-path-fast.spec.ts', '--workers=1', '--project=desktop-chromium', '--grep', 'FAST desktop upload']));
  steps.push(await run('fast-mobile-upload', 'npx', ['playwright', 'test', 'tests/common-user-path-fast.spec.ts', '--workers=1', '--project=mobile-chromium', '--grep', 'FAST mobile upload']));
} else {
  // FULL OPTIMIZED: 001~024 전수 범위는 유지하되, 각 단계에서 한 Page를 재사용해 브라우저/context 재생성 비용을 제거한다.
  steps.push(await run('desktop-upload-full', 'npx', ['playwright', 'test', 'tests/common-user-path-full-optimized.spec.ts', '--workers=1', '--project=desktop-chromium', '--grep', '001-024 desktop actual click']));
  steps.push(await run('mobile-upload-full', 'npx', ['playwright', 'test', 'tests/common-user-path-full-optimized.spec.ts', '--workers=1', '--project=mobile-chromium', '--grep', '001-024 mobile actual tap']));
  steps.push(await run('desktop-dragdrop-full', 'npx', ['playwright', 'test', 'tests/common-user-path-full-optimized.spec.ts', '--workers=1', '--project=desktop-chromium', '--grep', '001-024 desktop drag/drop']));
  steps.push(await run('route-locale-runtime-full', 'npx', ['playwright', 'test', 'tests/common-user-path-full-optimized.spec.ts', '--workers=1', '--project=desktop-chromium', '--grep', '001-024 ko/en/ja direct URL']));
  steps.push(await run('capability-semantics', 'npx', ['playwright', 'test', 'tests/common-user-path-full-optimized.spec.ts', '--workers=1', '--project=desktop-chromium', '--grep', 'FULL OPTIMIZED capability semantics']));
}

const endedAt = new Date();
const failed = steps.some(step => step.status !== 'passed');
const mobileStep = steps.find(step => step.name === 'mobile-upload-full' || step.name === 'fast-mobile-upload');
if (mobileStep?.status === 'passed') {
  console.log('MOBILE_BROWSER_PATH_PASS');
} else {
  console.log('MOBILE_BROWSER_PATH_FAIL');
}
console.log('REAL_DEVICE_NOT_VERIFIED');
const pkg = createValidationResultPackage({
  toolNumber: targetTool ? `TOOLBOX_${targetTool}` : 'TOOLBOX_COMMON',
  validationType: targetTool ? `common-user-path-tool-${targetTool}` : (mode === 'fast' ? 'common-user-path-fast' : 'common-user-path'),
  status: failed ? 'failed' : 'passed',
  startedAt,
  endedAt,
  steps,
  root,
  extraFiles: [
    { source: resolve(root, 'tests/common-validation/capability-profile.json'), destination: 'capability-profile.json' },
    { source: resolve(root, 'test-results/toolbox-validation-summary.txt'), destination: 'latest-playwright-summary.txt' },
    { source: resolve(root, 'test-results/toolbox-validation-summary.json'), destination: 'latest-playwright-summary.json' },
  ],
});

let finalZip = pkg.zipPath;
if (pkg.zipCreated) {
  const fixed = resolve(
      resolveDesktopPath(),
      targetTool
        ? `TOOLBOX_${targetTool}_공통검수_검수결과.zip`
        : (mode === 'fast' ? 'TOOLBOX_공통검수_fast_검수결과.zip' : 'TOOLBOX_공통검수_검수결과.zip'),
    );
  try {
    rmSync(fixed, { force: true });
    renameSync(pkg.zipPath, fixed);
    finalZip = fixed;
  } catch (error) {
    console.error(`[HARNESS_ERROR] result ZIP rename failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`\n[COMMON USER PATH HARNESS] ${failed ? 'FAIL' : 'PASS'}`);
console.log(`Desktop result ZIP: ${pkg.zipCreated && existsSync(finalZip) ? finalZip : 'ZIP_CREATE_FAILED'}`);
process.exit(failed ? 1 : 0);
