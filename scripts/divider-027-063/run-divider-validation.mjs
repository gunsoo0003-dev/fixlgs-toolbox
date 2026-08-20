import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const stamp = new Date().toISOString().replaceAll(':', '-');
const desktop = path.join(os.homedir(), 'Desktop');
const resultPath = path.join(desktop, `DIVIDER_027_065_검수결과_${stamp}.txt`);
const nextDir = path.join(process.cwd(), '.next');
try {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log(`PRECHECK_CLEANED=${nextDir}`);
} catch (error) {
  console.error(`PRECHECK_CLEAN_FAIL=${error instanceof Error ? error.message : String(error)}`);
}

const command = 'npx playwright test -c playwright.divider027063.config.ts';

const run = spawnSync(command, {
  cwd: process.cwd(),
  shell: true,
  encoding: 'utf8',
  env: process.env,
  maxBuffer: 64 * 1024 * 1024,
});

const stdout = run.stdout ?? '';
const stderr = run.stderr ?? '';
const exitCode = typeof run.status === 'number' ? run.status : 127;
const status = exitCode === 0 ? 'PASS' : 'FAIL';
const passLines = stdout.split(/\r?\n/).filter((line) => line.includes('DIVIDER_PASS '));
const expectedPages = 39 * 3 * 2;

const header = [
  'DIVIDER027_065 MODE=batch',
  'TOOLS=39',
  'LOCALES=3',
  'DEVICES=2',
  'SCOPE=IMPORTANT_NOTES_FULL_WIDTH_DIVIDER_ONLY',
  'GLOBAL_HORIZONTAL_OVERFLOW=INFO_ONLY',
  `EXPECTED_PAGE_CHECKS=${expectedPages}`,
  `RECORDED_PAGE_PASSES=${passLines.length}`,
  `EXIT=${exitCode}`,
  `STATUS=${status}`,
  `COMMAND=${command}`,
  '',
  '=== PLAYWRIGHT STDOUT ===',
  stdout.trimEnd(),
  '',
  '=== PLAYWRIGHT STDERR ===',
  stderr.trimEnd(),
  '',
].join('\n');

fs.mkdirSync(desktop, { recursive: true });
fs.writeFileSync(resultPath, header, 'utf8');
process.stdout.write(header);
process.stdout.write(`\nRESULT_TXT=${resultPath}\n`);
process.exit(exitCode);
