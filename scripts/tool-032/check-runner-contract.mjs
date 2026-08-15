import fs from "node:fs";
import { spawnSync } from "node:child_process";
let fail = 0; const need = (ok, msg) => { console.log(ok ? "PASS" : "FAIL", msg); if (!ok) fail += 1; };
const files = [
  "scripts/tool-032/run-validation.mjs", "scripts/tool-032/runtime-workspace.mjs", "playwright.tool032.config.ts",
  "tests/tool-032-preflight.spec.ts", "tests/tool-032-core.spec.ts", "tests/tool-032-boundary.spec.ts", "tests/tool-032-feature.spec.ts", "tests/tool-032-regression.spec.ts", "tests/tool-032-limit.spec.ts",
  "docs/tool-032/SELECTOR_STATE_INVENTORY_032.md", "docs/tool-032/MOBILE_REAL_DEVICE_CONTRACT_032.md", "docs/tool-032/PACKAGE_PATCH_032.json",
  "scripts/run-mobile-real-photo-001-032.mjs", "scripts/check-mobile-real-photo-001-032-validator.mjs"
];
for (const f of files) need(fs.existsSync(f), `exists ${f}`);
for (const f of ["scripts/tool-032/run-validation.mjs", "scripts/tool-032/runtime-workspace.mjs"]) if (fs.existsSync(f)) {
  const r = spawnSync(process.execPath, ["--check", f], { encoding: "utf8" }); need(r.status === 0, `syntax ${f}`);
}
const runner = fs.existsSync(files[0]) ? fs.readFileSync(files[0], "utf8") : "";
need(!/\bnpx\b/.test(runner), "no interactive npx");
need(runner.includes("zipDirectory") && runner.includes("Desktop"), "Desktop result ZIP contract");
need(runner.includes("RUNNING") && runner.includes("PASS=") && runner.includes("remaining="), "visible progress contract");
need(runner.includes("pdf-lib") && runner.includes("1.17.1"), "pinned pdf-lib dependency guard");
need(!runner.includes("TOOL032_LIMIT_APPROVED_JSON"), "approved service limits no longer depend on runtime approval env");
const cfg = fs.existsSync("playwright.tool032.config.ts") ? fs.readFileSync("playwright.tool032.config.ts", "utf8") : "";
need(cfg.includes("desktop-032") && cfg.includes("mobile-032") && cfg.includes("reuseExistingServer: false"), "PC/mobile isolated runtime config");
process.exitCode = fail ? 1 : 0;
