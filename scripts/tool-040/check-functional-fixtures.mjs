import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["--experimental-strip-types", "scripts/tool-040/check-functional-fixtures-runner.mjs"], {
  cwd: process.cwd(),
  encoding: "utf8",
  stdio: "inherit",
});
if (result.error) {
  console.error(`[FAIL] functional fixture runner spawn | ${result.error.message}`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
