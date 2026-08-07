import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, resolve } from "node:path";

export function resolveDesktopPath() {
  if (process.platform === "win32") {
    const profile = process.env.USERPROFILE || homedir();
    const candidates = [
      resolve(profile, "Desktop"),
      process.env.OneDrive ? resolve(process.env.OneDrive, "Desktop") : null,
      process.env.OneDriveConsumer ? resolve(process.env.OneDriveConsumer, "Desktop") : null,
    ].filter(Boolean);
    for (const candidate of candidates) {
      if (existsSync(candidate)) return candidate;
    }
  }
  const desktop = resolve(homedir(), "Desktop");
  return existsSync(desktop) ? desktop : tmpdir();
}

export function timestampForFile(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function safeWrite(file, content) {
  mkdirSync(resolve(file, ".."), { recursive: true });
  writeFileSync(file, content, "utf8");
}

export function copyIfExists(source, destination) {
  if (!existsSync(source)) return false;
  mkdirSync(resolve(destination, ".."), { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
  return true;
}

export function parseCounts(output = "") {
  const counts = { passed: 0, failed: 0, skipped: 0 };
  const normalized = output.replace(/\x1B\[[0-9;]*m/g, "");
  const patterns = [
    ["passed", /(\d+)\s+passed\b/gi],
    ["failed", /(\d+)\s+failed\b/gi],
    ["skipped", /(\d+)\s+skipped\b/gi],
  ];
  for (const [key, regex] of patterns) {
    let match;
    while ((match = regex.exec(normalized))) counts[key] = Math.max(counts[key], Number(match[1]));
  }
  return counts;
}

export function collectFailureArtifacts(root, resultDir) {
  const locations = [
    [resolve(root, "test-results"), resolve(resultDir, "failure-artifacts", "test-results")],
    [resolve(root, "playwright-report"), resolve(resultDir, "failure-artifacts", "playwright-report")],
    [resolve(root, "validation-results"), resolve(resultDir, "failure-artifacts", "validation-results")],
  ];
  for (const [source, destination] of locations) {
    if (!existsSync(source)) continue;
    try {
      cpSync(source, destination, { recursive: true, force: true });
    } catch {
      // 잠긴 파일이 있어도 요약과 ZIP 생성을 계속한다.
    }
  }
}

export function createZipAndRemoveFolder({ resultDir, zipPath }) {
  rmSync(zipPath, { force: true });
  let zipCreated = false;
  let errorText = "";

  if (process.platform === "win32") {
    const source = resultDir.replace(/'/g, "''");
    const zip = zipPath.replace(/'/g, "''");
    const run = spawnSync("powershell.exe", [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${source}\\*' -DestinationPath '${zip}' -CompressionLevel Optimal -Force`,
    ], { encoding: "utf8", windowsHide: true });
    zipCreated = run.status === 0 && existsSync(zipPath);
    errorText = `${run.stdout || ""}\n${run.stderr || ""}`.trim();
  } else {
    const run = spawnSync("zip", ["-qr", zipPath, "."], {
      cwd: resultDir,
      encoding: "utf8",
    });
    zipCreated = run.status === 0 && existsSync(zipPath);
    errorText = `${run.stdout || ""}\n${run.stderr || ""}`.trim();
  }

  if (zipCreated) rmSync(resultDir, { recursive: true, force: true });
  return { zipCreated, errorText };
}

export function createValidationResultPackage({
  toolNumber,
  validationType,
  status,
  startedAt,
  endedAt,
  steps,
  root = process.cwd(),
  extraFiles = [],
}) {
  const desktop = resolveDesktopPath();
  const stamp = timestampForFile(endedAt);
  const baseName = `${toolNumber}_${validationType}_검수결과_${stamp}`;
  const resultDir = resolve(tmpdir(), `${baseName}_${process.pid}`);
  const zipPath = resolve(desktop, `${baseName}.zip`);
  rmSync(resultDir, { recursive: true, force: true });
  mkdirSync(resultDir, { recursive: true });

  const aggregate = steps.reduce((acc, step) => {
    acc.passed += step.counts?.passed || 0;
    acc.failed += step.counts?.failed || 0;
    acc.skipped += step.counts?.skipped || 0;
    return acc;
  }, { passed: 0, failed: 0, skipped: 0 });

  const summary = {
    toolNumber,
    validationType,
    status,
    generatedAt: endedAt.toISOString(),
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationSeconds: Math.round((endedAt.getTime() - startedAt.getTime()) / 100) / 10,
    counts: aggregate,
    steps: steps.map((step) => ({
      name: step.name,
      status: step.status,
      exitCode: step.exitCode,
      durationSeconds: step.durationSeconds,
      counts: step.counts,
      command: step.command,
    })),
  };

  safeWrite(resolve(resultDir, "summary.json"), JSON.stringify(summary, null, 2));
  safeWrite(resolve(resultDir, "summary.txt"), [
    `도구번호: ${toolNumber}`,
    `검수종류: ${validationType}`,
    `상태: ${status.toUpperCase()}`,
    `통과: ${aggregate.passed}`,
    `실패: ${aggregate.failed}`,
    `스킵: ${aggregate.skipped}`,
    `소요시간: ${summary.durationSeconds}초`,
    "",
    "[단계별 결과]",
    ...summary.steps.map((step) => `${step.name}: ${step.status.toUpperCase()} / exit ${step.exitCode ?? "-"} / ${step.durationSeconds ?? 0}초`),
  ].join("\n") + "\n");

  for (const step of steps) {
    safeWrite(resolve(resultDir, "logs", `${step.name}.log`), [
      `command: ${step.command}`,
      `status: ${step.status}`,
      `exitCode: ${step.exitCode ?? ""}`,
      `durationSeconds: ${step.durationSeconds ?? ""}`,
      "",
      "--- STDOUT ---",
      step.stdout || "",
      "",
      "--- STDERR ---",
      step.stderr || "",
    ].join("\n"));
  }

  if (status !== "passed") collectFailureArtifacts(root, resultDir);
  for (const file of extraFiles) {
    if (!file?.source || !file?.destination) continue;
    copyIfExists(file.source, resolve(resultDir, file.destination));
  }

  const zipped = createZipAndRemoveFolder({ resultDir, zipPath });
  if (!zipped.zipCreated) {
    safeWrite(resolve(resultDir, "ZIP_생성오류.txt"), zipped.errorText || "알 수 없는 ZIP 생성 오류");
    return { zipCreated: false, zipPath, resultDir, errorText: zipped.errorText };
  }
  return { zipCreated: true, zipPath, resultDir: null, errorText: "" };
}

export function cleanupProjectValidationArtifacts(root = process.cwd()) {
  for (const name of ["test-results", "playwright-report", "validation-results"]) {
    rmSync(resolve(root, name), { recursive: true, force: true });
  }
}
