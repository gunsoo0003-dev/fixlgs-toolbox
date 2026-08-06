import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, copyFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outDir = resolve(root, 'test-results');
mkdirSync(outDir, { recursive: true });

const artifactNames = [
  'toolbox-validation-summary.txt',
  'toolbox-validation-summary.json',
  'toolbox-validation.json',
  'tool-009-auto-limit-report.txt',
  'tool-009-auto-limit-report.json',
  'tool-009-validation-master.txt',
  'tool-009-validation-master.json',
  'tool-009-build.log',
  'tool-009-core.log',
  'tool-009-limit.log',
  'tool-009-regression.log',
];
for (const name of artifactNames) {
  const file = resolve(outDir, name);
  if (existsSync(file)) rmSync(file, { force: true });
}

const npmCli = process.env.npm_execpath;
const command = npmCli && existsSync(npmCli)
  ? { executable: process.execPath, prefix: [npmCli] }
  : process.platform === 'win32'
    ? { executable: 'cmd.exe', prefix: ['/d', '/s', '/c', 'npm'] }
    : { executable: 'npm', prefix: [] };

const steps = [
  { name: 'build', args: ['run', 'build'] },
  { name: 'core', args: ['run', 'test:toolbox:009-core'], summary: true },
  { name: 'regression', args: ['run', 'test:toolbox:009-regression'], summary: true },
  { name: 'limit', args: ['run', 'test:toolbox:009-limit'], summary: true },
];

const results = [];

function tail(text, lines = 80) {
  return String(text || '').split(/\r?\n/).slice(-lines).join('\n');
}

function parseSummary(file) {
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch (error) { return { overallStatus: 'invalid', parseError: String(error) }; }
}

for (const step of steps) {
  console.log(`\n========== 009 ${step.name.toUpperCase()} ==========`);
  const startedAt = new Date();
  const fullArgs = [...command.prefix, ...step.args];
  const run = spawnSync(command.executable, fullArgs, {
    cwd: root,
    env: { ...process.env, FORCE_COLOR: '0' },
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    maxBuffer: 1024 * 1024 * 200,
  });

  const stdout = run.stdout || '';
  const stderr = run.stderr || '';
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  const logPath = resolve(outDir, `tool-009-${step.name}.log`);
  writeFileSync(logPath, [
    `command: ${command.executable} ${fullArgs.join(' ')}`,
    `startedAt: ${startedAt.toISOString()}`,
    `endedAt: ${new Date().toISOString()}`,
    `status: ${run.status}`,
    `signal: ${run.signal || ''}`,
    `error: ${run.error ? (run.error.stack || String(run.error)) : ''}`,
    '',
    '--- STDOUT ---', stdout,
    '',
    '--- STDERR ---', stderr,
  ].join('\n'), 'utf8');

  const status = typeof run.status === 'number' ? run.status : 1;
  let stepSummary = null;
  if (step.summary) {
    const genericJson = resolve(outDir, 'toolbox-validation-summary.json');
    const genericTxt = resolve(outDir, 'toolbox-validation-summary.txt');
    stepSummary = parseSummary(genericJson);
    if (existsSync(genericJson)) copyFileSync(genericJson, resolve(outDir, `tool-009-${step.name}-summary.json`));
    if (existsSync(genericTxt)) copyFileSync(genericTxt, resolve(outDir, `tool-009-${step.name}-summary.txt`));
    // prevent the next Playwright step from being mistaken for this step
    rmSync(genericJson, { force: true });
    rmSync(genericTxt, { force: true });
  }

  const item = {
    name: step.name,
    command: `${command.executable} ${fullArgs.join(' ')}`,
    startedAt: startedAt.toISOString(),
    endedAt: new Date().toISOString(),
    status,
    signal: run.signal || null,
    spawnError: run.error ? (run.error.stack || String(run.error)) : null,
    logPath,
    summary: stepSummary,
    stderrTail: tail(stderr),
    stdoutTail: tail(stdout),
  };
  results.push(item);

  if (status === 0) console.log(`[PASS] 009 ${step.name}`);
  else {
    console.error(`[FAIL] 009 ${step.name}: exit ${status}${run.signal ? ` / signal ${run.signal}` : ''}`);
    if (run.error) console.error(run.error.stack || String(run.error));
    console.error(`상세 로그: ${logPath}`);
  }
}

const core = results.find(x => x.name === 'core')?.summary;
const regression = results.find(x => x.name === 'regression')?.summary;
const limit = results.find(x => x.name === 'limit')?.summary;
const summaries = [core, regression, limit];
const counts = {
  total: summaries.reduce((sum, item) => sum + (item?.counts?.total || 0), 0),
  passed: summaries.reduce((sum, item) => sum + (item?.counts?.passed || 0), 0),
  failed: summaries.reduce((sum, item) => sum + (item?.counts?.failed || 0), 0),
  skipped: summaries.reduce((sum, item) => sum + (item?.counts?.skipped || 0), 0),
};
const failed = results.some(x => x.status !== 0) || counts.failed > 0;
const missingReports = results.filter(x => ['core','regression','limit'].includes(x.name) && !x.summary).map(x => x.name);
const overallStatus = failed || missingReports.length ? 'failed' : 'passed';
const master = {
  generatedAt: new Date().toISOString(),
  overallStatus,
  counts,
  missingReports,
  runtime: {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    cwd: root,
    npmExecPath: npmCli || null,
  },
  steps: results,
  failureGroups: [
    ...(core?.failureGroups || []).map(x => ({ ...x, phase: 'core' })),
    ...(regression?.failureGroups || []).map(x => ({ ...x, phase: 'regression' })),
    ...(limit?.failureGroups || []).map(x => ({ ...x, phase: 'limit' })),
  ],
  skipGroups: [
    ...(core?.skipGroups || []).map(x => ({ ...x, phase: 'core' })),
    ...(regression?.skipGroups || []).map(x => ({ ...x, phase: 'regression' })),
    ...(limit?.skipGroups || []).map(x => ({ ...x, phase: 'limit' })),
  ],
};

const lines = [
  'TOOLBOX 009 통합 자동검수 최종 요약',
  `생성: ${master.generatedAt}`,
  `최종 상태: ${overallStatus}`,
  `전체 ${counts.total} / 통과 ${counts.passed} / 실패 ${counts.failed} / 스킵 ${counts.skipped}`,
  '',
  '[단계별 결과]',
  ...results.map(x => `${x.name}: ${x.status === 0 ? 'PASS' : 'FAIL'} / exit ${x.status}${x.spawnError ? ` / spawn=${x.spawnError.split('\n')[0]}` : ''}`),
  ...(missingReports.length ? ['', `[누락된 단계 보고서] ${missingReports.join(', ')}`] : []),
  '',
  '[실패 원인]',
  ...(master.failureGroups.length ? master.failureGroups.map((x, i) => `${i + 1}. [${x.phase}] ${x.title}\n   원인: ${x.cause}`) : ['없음']),
  '',
  '[진단 로그]',
  ...results.map(x => `${x.name}: ${x.logPath}`),
  '',
  '[한계탐색 결과]',
  existsSync(resolve(outDir, 'tool-009-auto-limit-report.txt')) ? '생성됨' : '생성되지 않음',
];

writeFileSync(resolve(outDir, 'tool-009-validation-master.json'), JSON.stringify(master, null, 2), 'utf8');
writeFileSync(resolve(outDir, 'tool-009-validation-master.txt'), lines.join('\n') + '\n', 'utf8');
// The user's one-command copier expects these generic names. They now always contain the combined current-run result.
writeFileSync(resolve(outDir, 'toolbox-validation-summary.json'), JSON.stringify(master, null, 2), 'utf8');
writeFileSync(resolve(outDir, 'toolbox-validation-summary.txt'), lines.join('\n') + '\n', 'utf8');

console.log(`\n009 FINAL RESULT: ${overallStatus.toUpperCase()}`);
console.log(`통합 보고서: ${resolve(outDir, 'tool-009-validation-master.txt')}`);
process.exit(overallStatus === 'passed' ? 0 : 1);
