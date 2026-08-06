import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { resolve } from "node:path";
import process from "node:process";

const root = process.cwd();
const playwrightResults = resolve(root, "test-results");

function resolveDesktopPath() {
  // 이 프로젝트의 기존 검수 방식과 동일하게 USERPROFILE\Desktop을 사용한다.
  // 외부 명령(reg.exe/PowerShell)의 stdout은 Windows 환경에 따라 경고·ANSI 문구가
  // 섞일 수 있으므로 바탕화면 경로 판정에 사용하지 않는다.
  if (process.platform === "win32") {
    const userProfile = process.env.USERPROFILE || homedir();
    const desktop = resolve(userProfile, "Desktop");
    if (existsSync(desktop)) return desktop;

    const oneDrive = process.env.OneDrive || process.env.OneDriveConsumer;
    if (oneDrive) {
      const oneDriveDesktop = resolve(oneDrive, "Desktop");
      if (existsSync(oneDriveDesktop)) return oneDriveDesktop;
    }
  }

  const desktop = resolve(homedir(), "Desktop");
  return existsSync(desktop) ? desktop : tmpdir();
}

// 최종 검수 결과는 기존 운영 방식대로 프로젝트 내부가 아니라 실제 바탕화면에만 둔다.
const desktop = resolveDesktopPath();
const finalDir = resolve(desktop, "009_검수결과");
const desktopZip = resolve(desktop, "009_검수결과.zip");
const summaryDir = resolve(finalDir, "01_최종요약");
const logsDir = resolve(finalDir, "02_단계별로그");
const limitDir = resolve(finalDir, "03_한계검수");
const failureDir = resolve(finalDir, "04_실패자료");

rmSync(finalDir, { recursive: true, force: true });
rmSync(desktopZip, { force: true });
mkdirSync(summaryDir, { recursive: true });
mkdirSync(logsDir, { recursive: true });
mkdirSync(limitDir, { recursive: true });
mkdirSync(playwrightResults, { recursive: true });

const npmCli = process.env.npm_execpath;
const command = npmCli && existsSync(npmCli)
  ? { executable: process.execPath, prefix: [npmCli] }
  : process.platform === "win32"
    ? { executable: "cmd.exe", prefix: ["/d", "/s", "/c", "npm"] }
    : { executable: "npm", prefix: [] };

const steps = [
  { name: "build", args: ["run", "build"], type: "build" },
  { name: "common", args: ["run", "test:toolbox:common-additive"], type: "playwright" },
  { name: "core", args: ["run", "test:toolbox:009-core"], type: "playwright" },
  { name: "additional", args: ["run", "test:toolbox:009-additional"], type: "playwright" },
  { name: "regression", args: ["run", "test:toolbox:009-regression"], type: "playwright" },
  {
    name: "boundary",
    args: ["exec", "playwright", "test", "tests/tool-009-limit.spec.ts", "--workers=1", "--project=desktop-chromium"],
    type: "playwright",
  },
  {
    name: "auto-limit",
    args: ["exec", "playwright", "test", "tests/tool-009-auto-limit.spec.ts", "--workers=1", "--project=desktop-chromium"],
    type: "limit",
  },
];

const results = [];
let prerequisiteFailed = false;
let unexpectedRunnerError = null;

function parseJson(file) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    return { overallStatus: "invalid", parseError: String(error) };
  }
}

function safeWrite(file, content) {
  mkdirSync(resolve(file, ".."), { recursive: true });
  writeFileSync(file, content, "utf8");
}

function copyIfExists(source, destination) {
  if (!existsSync(source)) return false;
  mkdirSync(resolve(destination, ".."), { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
  return true;
}

function collectPlaywrightArtifacts(stepName, exitCode) {
  const genericJson = resolve(playwrightResults, "toolbox-validation-summary.json");
  const genericTxt = resolve(playwrightResults, "toolbox-validation-summary.txt");
  const summary = parseJson(genericJson);

  // 단계별 요약은 로그 폴더에 평면 구조로 보관한다.
  copyIfExists(genericJson, resolve(logsDir, `${stepName}-summary.json`));
  copyIfExists(genericTxt, resolve(logsDir, `${stepName}-summary.txt`));

  // 성공한 단계의 Playwright 내부 산출물은 최종 결과에 넣지 않는다.
  // 실패한 단계만 스크린샷·trace·video·HTML 보고서를 보존한다.
  if (exitCode !== 0) {
    const stepDir = resolve(failureDir, stepName);
    mkdirSync(stepDir, { recursive: true });

    for (const entry of [".last-run.json", "toolbox-validation.json"]) {
      copyIfExists(resolve(playwrightResults, entry), resolve(stepDir, entry));
    }

    if (existsSync(playwrightResults)) {
      try {
        cpSync(playwrightResults, resolve(stepDir, "test-results"), {
          recursive: true,
          force: true,
        });
      } catch {
        // 일부 파일이 잠겨 있어도 최종 보고서 생성은 계속한다.
      }
    }

    if (existsSync(resolve(root, "playwright-report"))) {
      try {
        cpSync(resolve(root, "playwright-report"), resolve(stepDir, "playwright-report"), {
          recursive: true,
          force: true,
        });
      } catch {
        // 보고서 복사 실패가 전체 검수 결과 생성을 막지 않게 한다.
      }
    }
  }

  return summary;
}

function runStep(step) {
  const startedAt = new Date();
  const logPath = resolve(logsDir, `${step.name}.log`);
  const fullArgs = [...command.prefix, ...step.args];

  if (step.name === "auto-limit" && prerequisiteFailed) {
    const item = {
      name: step.name,
      status: "skipped",
      exitCode: null,
      startedAt: startedAt.toISOString(),
      endedAt: new Date().toISOString(),
      reason: "공통·핵심·추가·회귀·경계검수 중 하나 이상 실패하여 한계검수를 시작하지 않음",
      logPath,
    };
    safeWrite(logPath, `${item.reason}\n`);
    results.push(item);
    return;
  }

  console.log(`\n========== 009 ${step.name.toUpperCase()} ==========`);

  let run;
  try {
    run = spawnSync(command.executable, fullArgs, {
      cwd: root,
      env: { ...process.env, FORCE_COLOR: "0" },
      encoding: "utf8",
      windowsHide: true,
      shell: false,
      maxBuffer: 1024 * 1024 * 300,
    });
  } catch (error) {
    run = { status: 1, stdout: "", stderr: "", signal: null, error };
  }

  const stdout = run.stdout || "";
  const stderr = run.stderr || "";
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  const exitCode = typeof run.status === "number" ? run.status : 1;
  const endedAt = new Date();

  // Playwright가 test-results를 지웠더라도 finalDir은 별도 경로라 유지된다.
  mkdirSync(finalDir, { recursive: true });
  safeWrite(logPath, [
    `command: ${command.executable} ${fullArgs.join(" ")}`,
    `startedAt: ${startedAt.toISOString()}`,
    `endedAt: ${endedAt.toISOString()}`,
    `exitCode: ${exitCode}`,
    `signal: ${run.signal || ""}`,
    `error: ${run.error ? run.error.stack || String(run.error) : ""}`,
    "",
    "--- STDOUT ---",
    stdout,
    "",
    "--- STDERR ---",
    stderr,
  ].join("\n"));

  const summary = step.type === "playwright" || step.type === "limit"
    ? collectPlaywrightArtifacts(step.name, exitCode)
    : null;

  const item = {
    name: step.name,
    status: exitCode === 0 ? "passed" : "failed",
    exitCode,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationSeconds: Math.round((endedAt.getTime() - startedAt.getTime()) / 10) / 100,
    logPath,
    summary,
  };
  results.push(item);
  if (exitCode !== 0 && step.name !== "auto-limit") prerequisiteFailed = true;
}

function buildMaster() {
  const failed = results.filter((item) => item.status === "failed");
  const skipped = results.filter((item) => item.status === "skipped");
  const overallStatus = failed.length === 0 && skipped.length === 0 && !unexpectedRunnerError
    ? "passed"
    : "failed";

  const master = {
    generatedAt: new Date().toISOString(),
    overallStatus,
    rule: "기존 001~008 검수기는 보존하고, 추가 공통검수 + 009 고유검수 + 내부 단계별 한계검수를 연결",
    runnerError: unexpectedRunnerError ? String(unexpectedRunnerError.stack || unexpectedRunnerError) : null,
    results,
    counts: {
      total: results.length,
      passed: results.filter((item) => item.status === "passed").length,
      failed: failed.length,
      skipped: skipped.length,
    },
  };

  const text = [
    "TOOLBOX 009 최종 단계별 검수",
    `생성: ${master.generatedAt}`,
    `최종 상태: ${overallStatus.toUpperCase()}`,
    `통과 ${master.counts.passed} / 실패 ${master.counts.failed} / 스킵 ${master.counts.skipped}`,
    "",
    "[검수 원칙]",
    master.rule,
    "한계검수는 앞 단계가 모두 통과한 경우에만 9MP → 16MP → 19.2MP → 초과 차단 순서로 내부 실행",
    "",
    "[단계별 결과]",
    ...results.map((item) => `${item.name}: ${item.status.toUpperCase()}${item.exitCode === null || item.exitCode === undefined ? "" : ` / exit ${item.exitCode}`}${item.reason ? ` / ${item.reason}` : ""}`),
    ...(unexpectedRunnerError ? ["", "[실행기 오류]", String(unexpectedRunnerError.stack || unexpectedRunnerError)] : []),
    "",
    "[먼저 확인할 로그]",
    ...failed.map((item) => item.logPath),
  ];

  mkdirSync(finalDir, { recursive: true });
  safeWrite(resolve(summaryDir, "009-final-summary.json"), JSON.stringify(master, null, 2));
  safeWrite(resolve(summaryDir, "009-final-summary.txt"), `${text.join("\n")}\n`);
  safeWrite(resolve(finalDir, "README_먼저확인.txt"), [
    "1. 01_최종요약/009-final-summary.txt를 먼저 확인하세요.",
    "2. 단계별 로그와 요약은 02_단계별로그에 있습니다.",
    "3. 한계검수 보고서는 03_한계검수에 있습니다.",
    "4. 04_실패자료는 실패한 단계가 있을 때만 생성됩니다.",
    "5. 검수가 모두 통과하면 내부 Playwright 산출물은 결과 ZIP에 포함하지 않습니다.",
  ].join("\n") + "\n");

  mkdirSync(playwrightResults, { recursive: true });
  safeWrite(resolve(playwrightResults, "tool-009-validation-master.json"), JSON.stringify(master, null, 2));
  safeWrite(resolve(playwrightResults, "tool-009-validation-master.txt"), `${text.join("\n")}\n`);

  return { master, text, overallStatus };
}

function createDesktopZip() {
  if (process.platform !== "win32") return null;

  const escapedSource = finalDir.replace(/'/g, "''");
  const escapedZip = desktopZip.replace(/'/g, "''");
  const zipRun = spawnSync("powershell.exe", [
    "-NoProfile",
    "-Command",
    `Remove-Item '${escapedZip}' -Force -ErrorAction SilentlyContinue; Compress-Archive -Path '${escapedSource}\*' -DestinationPath '${escapedZip}' -CompressionLevel Optimal -Force`,
  ], { encoding: "utf8", windowsHide: true });

  if (zipRun.status !== 0) {
    safeWrite(resolve(summaryDir, "ZIP_생성오류.txt"), [
      `exitCode: ${zipRun.status}`,
      `stdout: ${zipRun.stdout || ""}`,
      `stderr: ${zipRun.stderr || ""}`,
    ].join("\n"));
    return { finalDir, desktopZip, zipCreated: false };
  }

  console.log(`바탕화면 결과 폴더: ${finalDir}`);
  console.log(`바탕화면 결과 ZIP: ${desktopZip}`);
  return { finalDir, desktopZip, zipCreated: true };
}

let overallStatus = "failed";
try {
  for (const step of steps) runStep(step);

  for (const name of [
    "tool-009-auto-limit-report.txt",
    "tool-009-auto-limit-report.json",
    "toolbox-validation.json",
  ]) {
    copyIfExists(resolve(playwrightResults, name), resolve(limitDir, name));
  }
} catch (error) {
  unexpectedRunnerError = error;
  console.error(error);
} finally {
  const built = buildMaster();
  overallStatus = built.overallStatus;
  if (existsSync(failureDir)) {
    try {
      const entries = readdirSync(failureDir);
      if (entries.length === 0) rmSync(failureDir, { recursive: true, force: true });
    } catch {
      // 정리 실패는 검수 판정을 바꾸지 않는다.
    }
  }
  try {
    createDesktopZip();
  } catch (error) {
    safeWrite(resolve(summaryDir, "바탕화면_ZIP_오류.txt"), String(error.stack || error));
    console.error(error);
  } finally {
    // Playwright 임시 생성물은 바탕화면 결과로 수집한 뒤 프로젝트에서 정리한다.
    rmSync(playwrightResults, { recursive: true, force: true });
    rmSync(resolve(root, "playwright-report"), { recursive: true, force: true });
    rmSync(resolve(root, "validation-results"), { recursive: true, force: true });
  }
}

console.log(`\n009 FINAL RESULT: ${overallStatus.toUpperCase()}`);
console.log(`바탕화면 보고서: ${resolve(summaryDir, "009-final-summary.txt")}`);
process.exit(overallStatus === "passed" ? 0 : 1);
