import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import process from "node:process";
import {
  cleanupProjectValidationArtifacts,
  createValidationResultPackage,
  parseCounts,
} from "./tool-validation-result-utils.mjs";

const mode = process.argv[2];
if (!new Set(["fast", "check"]).has(mode)) {
  console.error("사용법: node scripts/run-tool-010-tier-validation.mjs fast|check");
  process.exit(2);
}

const npmCli = process.env.npm_execpath;
const npmCommand = npmCli && existsSync(npmCli)
  ? { executable: process.execPath, prefix: [npmCli] }
  : process.platform === "win32"
    ? { executable: "cmd.exe", prefix: ["/d", "/s", "/c", "npm"] }
    : { executable: "npm", prefix: [] };

const fastSpecs = [
  "tests/tool-010-image-mosaic-blur.spec.ts",
  "tests/tool-010-selection-history.spec.ts",
  "tests/tool-010-rendering-output.spec.ts",
];

const checkSpecs = [
  "tests/tool-010-image-mosaic-blur.spec.ts",
  "tests/tool-010-input-errors.spec.ts",
  "tests/tool-010-selection-history.spec.ts",
  "tests/tool-010-rendering-output.spec.ts",
  "tests/tool-010-output-decode.spec.ts",
  "tests/tool-010-view-mobile-accessibility.spec.ts",
  "tests/tool-010-device-theme.spec.ts",
  "tests/tool-010-memory-lifecycle.spec.ts",
  "tests/tool-010-additional.spec.ts",
  "tests/tool-010-seo-security-regression.spec.ts",
  "tests/tool-010-limit.spec.ts",
];

const steps = mode === "fast"
  ? [
      { name: "source", args: ["run", "check:tool010-source"] },
      { name: "fast-core", args: ["exec", "playwright", "test", ...fastSpecs, "--project=desktop-chromium", "--workers=4"] },
    ]
  : [
      { name: "validator", args: ["run", "check:tool010-validator"] },
      { name: "source", args: ["run", "check:tool010-source"] },
      { name: "ja-terms", args: ["run", "check:ja-terms"] },
      { name: "check-suite", args: ["exec", "playwright", "test", ...checkSpecs, "--workers=3"] },
      { name: "common-smoke", args: ["run", "test:toolbox:common-additive"] },
    ];

const startedAt = new Date();
const results = [];
let failed = false;

console.log(`\n========== 010 ${mode.toUpperCase()} VALIDATION ==========`);
for (const step of steps) {
  const stepStarted = Date.now();
  console.log(`\n----- ${step.name} -----`);
  const fullArgs = [...npmCommand.prefix, ...step.args];
  const run = spawnSync(npmCommand.executable, fullArgs, {
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
  const output = `${stdout}\n${stderr}`;
  results.push({
    name: step.name,
    status: exitCode === 0 ? "passed" : "failed",
    exitCode,
    durationSeconds: Math.round((Date.now() - stepStarted) / 100) / 10,
    counts: parseCounts(output),
    command: `${npmCommand.executable} ${fullArgs.join(" ")}`,
    stdout,
    stderr,
  });
  if (exitCode !== 0) {
    failed = true;
    console.error(`\n${step.name}: FAILED (exit ${exitCode})`);
    break;
  }
  console.log(`${step.name}: PASSED`);
}

const endedAt = new Date();
const status = failed ? "failed" : "passed";
const packaged = createValidationResultPackage({
  toolNumber: "010",
  validationType: mode,
  status,
  startedAt,
  endedAt,
  steps: results,
});
cleanupProjectValidationArtifacts();

console.log(`\n010 ${mode.toUpperCase()} RESULT: ${status.toUpperCase()}`);
console.log(`바탕화면 결과 ZIP: ${packaged.zipPath}`);
console.log(`ZIP 생성: ${packaged.zipCreated ? "SUCCESS" : "FAILED"}`);
process.exit(status === "passed" && packaged.zipCreated ? 0 : 1);
