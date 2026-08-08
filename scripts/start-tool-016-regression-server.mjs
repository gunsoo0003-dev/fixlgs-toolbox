import { existsSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, resolve } from "node:path";

const sourceRoot = resolve(process.cwd());
const sourceNodeModules = join(sourceRoot, "node_modules");
const nextCli = join(sourceNodeModules, "next", "dist", "bin", "next");
const regressionDistDir = join(sourceRoot, ".next-tool016-regression");

if (!existsSync(sourceNodeModules)) {
  console.error("HARNESS_ERROR: node_modules not found in current fixlgs-toolbox project.");
  process.exit(1);
}

if (!existsSync(nextCli)) {
  console.error(`HARNESS_ERROR: Next.js CLI not found: ${nextCli}`);
  process.exit(1);
}

rmSync(regressionDistDir, { recursive: true, force: true });

const child = spawn(
  process.execPath,
  [nextCli, "dev", "--webpack", "--hostname", "127.0.0.1", "--port", "3016"],
  {
    cwd: sourceRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      TOOL016_REGRESSION: "1",
    },
    windowsHide: true,
  },
);

let cleaning = false;
function cleanup() {
  if (cleaning) return;
  cleaning = true;
  try {
    rmSync(regressionDistDir, { recursive: true, force: true });
  } catch {}
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
    cleanup();
  });
}

child.on("exit", (code, signal) => {
  cleanup();
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(`HARNESS_ERROR: failed to start regression server: ${error.message}`);
  cleanup();
  process.exit(1);
});
