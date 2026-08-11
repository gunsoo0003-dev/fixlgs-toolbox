import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const root = process.cwd();
const desktop = path.join(os.homedir(), 'Desktop');
const outDir = path.join(root, 'test-results');
const staging = path.join(root, 'tool001-mobile-deep-diagnostic-result');
const expectedScenarioCount = 16;
const expectedAndroidStressCount = 12;
const expectedCauseMatrixCount = 30;
const causeJson = path.join(outDir, 'tool001-mobile-cause-matrix.json');
const causeTxt = path.join(outDir, 'tool001-mobile-cause-matrix.txt');
const causeCoverageJson = path.join(outDir, 'tool001-mobile-cause-coverage.json');
const causeCoverageTxt = path.join(outDir, 'tool001-mobile-cause-coverage.txt');
const androidJson = path.join(outDir, 'tool001-mobile-android-lifecycle.json');
const androidTxt = path.join(outDir, 'tool001-mobile-android-lifecycle.txt');
const browserJson = path.join(outDir, 'tool001-mobile-deep-diagnostic.json');
const browserTxt = path.join(outDir, 'tool001-mobile-deep-diagnostic.txt');
const browserLog = path.join(outDir, 'tool001-mobile-deep-playwright.log.txt');
const runnerStatus = path.join(outDir, 'tool001-mobile-deep-runner-status.txt');

fs.mkdirSync(outDir, { recursive: true });
for (const name of [
  'tool001-mobile-source-diagnostic.json', 'tool001-mobile-source-diagnostic.txt',
  'tool001-mobile-source-run.log.txt',
  'tool001-mobile-deep-diagnostic.json', 'tool001-mobile-deep-diagnostic.txt',
  'tool001-mobile-deep-playwright.log.txt', 'tool001-mobile-deep-runner-status.txt',
  'tool001-mobile-deep-runner-failure.txt',
  'tool001-mobile-android-lifecycle.json', 'tool001-mobile-android-lifecycle.txt',
  'tool001-mobile-cause-matrix.json', 'tool001-mobile-cause-matrix.txt',
  'tool001-mobile-cause-coverage.json', 'tool001-mobile-cause-coverage.txt', 'tool001-mobile-cause-coverage-run.log.txt',
  'tool001-mobile-cause-matrix.json', 'tool001-mobile-cause-matrix.txt',
  'tool001-mobile-cause-coverage.json', 'tool001-mobile-cause-coverage.txt'
]) fs.rmSync(path.join(outDir, name), { force: true });

function runCapturedSync(label, command, args, logFile, timeout = 30_000) {
  console.log(`\n========== ${label} ==========`);
  const started = Date.now();
  const r = spawnSync(command, args, {
    cwd: root,
    shell: false,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0' },
    maxBuffer: 64 * 1024 * 1024,
    timeout,
  });
  const stdout = r.stdout || '';
  const stderr = r.stderr || '';
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  if (logFile) {
    fs.writeFileSync(logFile, [
      `LABEL=${label}`,
      `COMMAND=${command} ${args.join(' ')}`,
      `STARTED=${new Date(started).toISOString()}`,
      `EXIT_STATUS=${typeof r.status === 'number' ? r.status : 'NULL'}`,
      `SIGNAL=${r.signal || ''}`,
      `ERROR=${r.error ? String(r.error.stack || r.error) : ''}`,
      '', '[STDOUT]', stdout, '', '[STDERR]', stderr,
    ].join('\n'));
  }
  return { code: typeof r.status === 'number' ? r.status : 1, started, result: r };
}

async function runStreaming(label, command, args, logFile, timeout = 300_000) {
  console.log(`\n========== ${label} ==========`);
  console.log(`[V15 RUNNER] ${command} ${args.join(' ')}`);
  const started = Date.now();
  const log = fs.createWriteStream(logFile, { flags: 'w' });
  log.write(`LABEL=${label}\nCOMMAND=${command} ${args.join(' ')}\nSTARTED=${new Date(started).toISOString()}\n\n`);

  return await new Promise((resolve) => {
    let settled = false;
    let timer = null;
    let child;
    try {
      child = spawn(command, args, {
        cwd: root,
        shell: false,
        env: { ...process.env, FORCE_COLOR: '0' },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      log.write(`SPAWN_THROW=${String(error?.stack || error)}\n`);
      log.end();
      resolve({ code: 1, started, error: String(error?.stack || error) });
      return;
    }

    const finish = (code, signal, error = '') => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      log.write(`\nEXIT_STATUS=${typeof code === 'number' ? code : 'NULL'}\nSIGNAL=${signal || ''}\nERROR=${error}\n`);
      log.end();
      resolve({ code: typeof code === 'number' ? code : 1, started, signal, error });
    };

    child.stdout.on('data', (chunk) => {
      process.stdout.write(chunk);
      log.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
      log.write(chunk);
    });
    child.on('error', (error) => finish(1, '', String(error?.stack || error)));
    child.on('close', (code, signal) => finish(code, signal));

    timer = setTimeout(() => {
      console.error(`\n[V15 RUNNER] TIMEOUT after ${timeout}ms - terminating Playwright`);
      log.write(`\nTIMEOUT_MS=${timeout}\n`);
      try { child.kill('SIGTERM'); } catch {}
      setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, 3000).unref();
    }, timeout);
  });
}

// V13: 세 검수 묶음을 독립 실행한다.
// 한 묶음의 실패/timeout이 다음 묶음 실행을 막지 않으며, 각 결과는 Playwright의 outputDir 정리에서 보호한다.
const playwrightCliCandidates = [
  path.join(root, 'node_modules', '@playwright', 'test', 'cli.js'),
  path.join(root, 'node_modules', 'playwright', 'cli.js'),
];
const playwrightCli = playwrightCliCandidates.find((p) => fs.existsSync(p));
const cacheDir = path.join(root, 'tool001-mobile-deep-v14-cache');
fs.rmSync(cacheDir, { recursive: true, force: true });
fs.mkdirSync(cacheDir, { recursive: true });

function cacheReport(names) {
  for (const name of names) {
    const src = path.join(outDir, name);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(cacheDir, name));
  }
}
function restoreCachedReports() {
  for (const name of fs.readdirSync(cacheDir)) {
    fs.copyFileSync(path.join(cacheDir, name), path.join(outDir, name));
  }
}

const suiteRuns = [];
if (!playwrightCli) {
  const message = `LOCAL_PLAYWRIGHT_CLI_MISSING: ${playwrightCliCandidates.join(' | ')}`;
  fs.writeFileSync(browserLog, message + '\nRun npm install first.\n');
  console.error(message);
  suiteRuns.push({ name: 'BASE', code: 127, started: Date.now(), error: message });
  suiteRuns.push({ name: 'ANDROID', code: 127, started: Date.now(), error: message });
  suiteRuns.push({ name: 'CAUSE', code: 127, started: Date.now(), error: message });
} else {
  const baseRun = await runStreaming(
    '001 BASE DEEP 16/16 - V15',
    process.execPath,
    [playwrightCli, 'test', 'tests/tool-001-mobile-deep-diagnostic.spec.ts', '--workers=1', '--project=mobile-chromium', '--reporter=list'],
    path.join(outDir, 'tool001-mobile-deep-base-playwright.log.txt'),
    240_000,
  );
  suiteRuns.push({ name: 'BASE', ...baseRun });
  cacheReport(['tool001-mobile-deep-diagnostic.json', 'tool001-mobile-deep-diagnostic.txt', 'tool001-mobile-deep-base-playwright.log.txt']);

  const androidRun = await runStreaming(
    '001 ANDROID LIFECYCLE 12/12 - V15',
    process.execPath,
    [playwrightCli, 'test', 'tests/tool-001-mobile-android-lifecycle.spec.ts', '--workers=1', '--project=mobile-chromium', '--reporter=list'],
    path.join(outDir, 'tool001-mobile-android-playwright.log.txt'),
    240_000,
  );
  suiteRuns.push({ name: 'ANDROID', ...androidRun });
  cacheReport(['tool001-mobile-android-lifecycle.json', 'tool001-mobile-android-lifecycle.txt', 'tool001-mobile-android-playwright.log.txt']);

  const causeRun = await runStreaming(
    '001 CAUSE MATRIX 30/30 - V15',
    process.execPath,
    [playwrightCli, 'test', 'tests/tool-001-mobile-cause-matrix.spec.ts', '--workers=1', '--project=mobile-chromium', '--reporter=list'],
    path.join(outDir, 'tool001-mobile-cause-playwright.log.txt'),
    360_000,
  );
  suiteRuns.push({ name: 'CAUSE', ...causeRun });
  cacheReport(['tool001-mobile-cause-matrix.json', 'tool001-mobile-cause-matrix.txt', 'tool001-mobile-cause-playwright.log.txt']);

  // 마지막 Playwright 실행이 test-results를 정리하므로 앞선 두 묶음 결과를 복구한다.
  restoreCachedReports();

  const combined = [];
  for (const r of suiteRuns) combined.push(`${r.name}_EXIT=${r.code}\n${r.error || ''}`);
  fs.writeFileSync(browserLog, combined.join('\n') + '\n');
}

// Playwright는 실행 시작 시 outputDir를 정리할 수 있으므로 정적 진단은 모든 브라우저 검수 뒤에 실행한다.
const coverage = runCapturedSync(
  '001 CAUSE COVERAGE AUDIT V15',
  process.execPath,
  ['scripts/check-tool-001-mobile-cause-coverage.mjs'],
  path.join(outDir, 'tool001-mobile-cause-coverage-run.log.txt'),
);
const source = runCapturedSync(
  '001 SOURCE DIAGNOSTIC V15',
  process.execPath,
  ['scripts/check-tool-001-mobile-source-diagnostic.mjs'],
  path.join(outDir, 'tool001-mobile-source-run.log.txt'),
);
const browser = {
  code: suiteRuns.every((x) => x.code === 0) ? 0 : 1,
  started: Math.min(...suiteRuns.map((x) => x.started || Date.now())),
  suites: suiteRuns,
};
let report = null;
let reportError = '';
try {
  if (!fs.existsSync(browserJson)) throw new Error('BROWSER_REPORT_JSON_MISSING');
  const stat = fs.statSync(browserJson);
  if (stat.mtimeMs + 1000 < browser.started) throw new Error('BROWSER_REPORT_JSON_STALE');
  report = JSON.parse(fs.readFileSync(browserJson, 'utf8'));
  if (!Array.isArray(report.results)) throw new Error('BROWSER_REPORT_RESULTS_MISSING');
} catch (error) {
  reportError = String(error?.message || error);
}

const scenarioCount = Array.isArray(report?.results) ? report.results.length : 0;
const normalJpg = report?.results?.find?.((x) => x.label === 'NORMAL_JPG_PATH_FILE');
const normalPng = report?.results?.find?.((x) => x.label === 'NORMAL_PNG_PATH_FILE');
const browserExecuted = scenarioCount > 0;
const completeScenarioSet = scenarioCount >= expectedScenarioCount;
const normalEvidencePresent = Boolean(normalJpg && normalPng);
let androidReport = null;
let androidReportError = '';
try {
  if (!fs.existsSync(androidJson)) throw new Error('ANDROID_LIFECYCLE_JSON_MISSING');
  androidReport = JSON.parse(fs.readFileSync(androidJson, 'utf8'));
  if (!Array.isArray(androidReport.results)) throw new Error('ANDROID_LIFECYCLE_RESULTS_MISSING');
} catch (error) { androidReportError = String(error?.message || error); }
const androidScenarioCount = Array.isArray(androidReport?.results) ? androidReport.results.length : 0;
const androidComplete = androidScenarioCount >= expectedAndroidStressCount;
let causeReport = null;
let causeReportError = '';
try {
  if (!fs.existsSync(causeJson)) throw new Error('CAUSE_MATRIX_JSON_MISSING');
  causeReport = JSON.parse(fs.readFileSync(causeJson, 'utf8'));
  if (!Array.isArray(causeReport.results)) throw new Error('CAUSE_MATRIX_RESULTS_MISSING');
} catch (error) { causeReportError = String(error?.message || error); }
const causeScenarioCount = Array.isArray(causeReport?.results) ? causeReport.results.length : 0;
const causeComplete = causeScenarioCount >= expectedCauseMatrixCount;
let causeCoverage = null;
let causeCoverageError = '';
try {
  if (!fs.existsSync(causeCoverageJson)) throw new Error('CAUSE_COVERAGE_JSON_MISSING');
  causeCoverage = JSON.parse(fs.readFileSync(causeCoverageJson, 'utf8'));
  if ((causeCoverage?.missingCount ?? 999) !== 0) throw new Error(`CAUSE_COVERAGE_MISSING_${causeCoverage?.missingCount}`);
} catch (error) { causeCoverageError = String(error?.message || error); }
const browserRuntimeValid = coverage.code === 0 && browser.code === 0 && browserExecuted && completeScenarioSet && normalEvidencePresent && !reportError && androidComplete && !androidReportError && causeComplete && !causeReportError && !causeCoverageError;

const statusLines = [
  'TOOL001 MOBILE DEEP DIAGNOSTIC V13',
  `CAUSE_COVERAGE_EXIT=${coverage.code}`,
  `SOURCE_EXIT=${source.code}`,
  `PLAYWRIGHT_EXIT=${browser.code}`,
  ...browser.suites.map((x) => `${x.name}_SUITE_EXIT=${x.code}`),
  `BROWSER_RUNTIME_EXECUTED=${browserExecuted ? 'YES' : 'NO'}`,
  `BASE_SCENARIO_COUNT=${scenarioCount}/${expectedScenarioCount}`,
  `ANDROID_STRESS_COUNT=${androidScenarioCount}/${expectedAndroidStressCount}`,
  `CAUSE_MATRIX_COUNT=${causeScenarioCount}/${expectedCauseMatrixCount}`,
  `CAUSE_MATRIX_ERROR=${causeReportError || 'NONE'}`,
  `CAUSE_COVERAGE_ERROR=${causeCoverageError || 'NONE'}`,
  `ANDROID_REPORT_ERROR=${androidReportError || 'NONE'}`,
  `NORMAL_JPG_EVIDENCE=${normalJpg ? 'YES' : 'NO'}`,
  `NORMAL_PNG_EVIDENCE=${normalPng ? 'YES' : 'NO'}`,
  `REPORT_ERROR=${reportError || 'NONE'}`,
  `MOBILE_DEEP_DIAGNOSTIC=${browserRuntimeValid ? 'PASS' : 'FAIL'}`,
  'REAL_DEVICE_NOT_VERIFIED',
];
fs.writeFileSync(runnerStatus, statusLines.join('\n') + '\n');
console.log('\n========== V15 FINAL ==========' );
console.log(statusLines.join('\n'));

if (!browserRuntimeValid) {
  const failure = [
    'TOOL001 MOBILE DEEP DIAGNOSTIC V15 - BROWSER RUNTIME FAILURE',
    ...statusLines,
    '',
    '브라우저 심층검수가 끝까지 실행되지 않았거나 정상 JPG/PNG 증거가 부족합니다.',
    '이 파일이 존재하면 진단 PASS로 취급하면 안 됩니다.',
    '',
    '우선 확인:',
    '1) npm install',
    '2) npx playwright install chromium',
    '3) tool001-mobile-deep-playwright.log.txt',
    '4) tool001-mobile-deep-diagnostic.json partial results',
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'tool001-mobile-deep-runner-failure.txt'), failure + '\n');
}

fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(staging, { recursive: true });
const collect = [
  'tool001-mobile-source-diagnostic.json', 'tool001-mobile-source-diagnostic.txt', 'tool001-mobile-source-run.log.txt',
  'tool001-mobile-deep-diagnostic.json', 'tool001-mobile-deep-diagnostic.txt',
  'tool001-mobile-deep-playwright.log.txt', 'tool001-mobile-deep-base-playwright.log.txt', 'tool001-mobile-android-playwright.log.txt', 'tool001-mobile-cause-playwright.log.txt', 'tool001-mobile-deep-runner-status.txt', 'tool001-mobile-deep-runner-failure.txt',
  'tool001-mobile-android-lifecycle.json', 'tool001-mobile-android-lifecycle.txt',
  'tool001-mobile-cause-matrix.json', 'tool001-mobile-cause-matrix.txt',
  'tool001-mobile-cause-coverage.json', 'tool001-mobile-cause-coverage.txt', 'tool001-mobile-cause-coverage-run.log.txt',
  'toolbox-validation.json',
].filter(name => fs.existsSync(path.join(outDir, name)));
for (const name of collect) fs.copyFileSync(path.join(outDir, name), path.join(staging, name));
fs.writeFileSync(path.join(staging, 'REAL_DEVICE_STATUS.txt'), [
  browserRuntimeValid ? 'MOBILE_BROWSER_PATH_DIAGNOSTIC_COMPLETE' : 'MOBILE_BROWSER_PATH_DIAGNOSTIC_FAILED',
  'REAL_DEVICE_NOT_VERIFIED',
].join('\n') + '\n');

if (process.platform === 'win32') {
  const zip = path.join(desktop, 'TOOLBOX_001_모바일심층진단_V15_시나리오격리_58개완주_검수결과.zip');
  fs.rmSync(zip, { force: true });
  const ps = `Compress-Archive -Path '${staging.replaceAll("'", "''")}\\*' -DestinationPath '${zip.replaceAll("'", "''")}' -Force`;
  const z = spawnSync('powershell.exe', ['-NoProfile', '-Command', ps], { cwd: root, encoding: 'utf8' });
  if (z.status === 0) console.log(`Desktop result ZIP: ${zip}`); else console.error(z.stderr || 'ZIP_CREATE_FAILED');
} else {
  console.log(`Result folder: ${staging}`);
}

process.exit(source.code === 0 && coverage.code === 0 && browserRuntimeValid ? 0 : 1);
