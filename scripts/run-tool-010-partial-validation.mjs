import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import process from "node:process";
import {
  cleanupProjectValidationArtifacts,
  createValidationResultPackage,
  parseCounts,
} from "./tool-validation-result-utils.mjs";

const mode = process.argv[2];
const definitions = {
  failed: ["exec", "playwright", "test", "--last-failed", "--workers=3"],
  "limit-only": ["exec", "playwright", "test", "tests/tool-010-auto-limit.spec.ts", "tests/tool-010-stress-limits.spec.ts", "--workers=1", "--project=desktop-chromium"],
  "core-only": ["run", "test:toolbox:010-core"],
  "boundary-only": ["run", "test:toolbox:010-limit"],
  "regression-only": ["run", "test:toolbox:010-regression"],
};
if (!definitions[mode]) {
  console.error(`지원하지 않는 부분검수: ${mode}`);
  process.exit(2);
}

const npmCli = process.env.npm_execpath;
const command = npmCli && existsSync(npmCli)
  ? { executable: process.execPath, prefix: [npmCli] }
  : process.platform === "win32"
    ? { executable: "cmd.exe", prefix: ["/d", "/s", "/c", "npm"] }
    : { executable: "npm", prefix: [] };

const startedAt = new Date();
const fullArgs = [...command.prefix, ...definitions[mode]];
const stepStarted = Date.now();
const run = spawnSync(command.executable, fullArgs, {
  cwd: process.cwd(),
  env: { ...process.env, FORCE_COLOR: "0", TOOLBOX_VALIDATION_MODE: mode },
  encoding: "utf8",
  windowsHide: true,
  shell: false,
  maxBuffer: 1024 * 1024 * 300,
});
const stdout = run.stdout || "";
const stderr = run.stderr || "";
if (stdout) process.stdout.write(stdout);
if (stderr) process.stderr.write(stderr);
const exitCode = typeof run.status === "number" ? run.status : 1;
const status = exitCode === 0 ? "passed" : "failed";
const endedAt = new Date();
const results = [{
  name: mode,
  status,
  exitCode,
  durationSeconds: Math.round((Date.now() - stepStarted) / 100) / 10,
  counts: parseCounts(`${stdout}\n${stderr}`),
  command: `${command.executable} ${fullArgs.join(" ")}`,
  stdout,
  stderr,
}];

const packaged = createValidationResultPackage({
  toolNumber: "010",
  validationType: mode,
  status,
  startedAt,
  endedAt,
  steps: results,
  extraFiles: [
    { source: "test-results/tool-010-auto-limit-report.json", destination: "limit/tool-010-auto-limit-report.json" },
    { source: "test-results/tool-010-auto-limit-report.txt", destination: "limit/tool-010-auto-limit-report.txt" },
  ],
});
cleanupProjectValidationArtifacts();
console.log(`\n010 ${mode.toUpperCase()} RESULT: ${status.toUpperCase()}`);
console.log(`바탕화면 결과 ZIP: ${packaged.zipPath}`);
console.log(`ZIP 생성: ${packaged.zipCreated ? "SUCCESS" : "FAILED"}`);
process.exit(status === "passed" && packaged.zipCreated ? 0 : 1);
