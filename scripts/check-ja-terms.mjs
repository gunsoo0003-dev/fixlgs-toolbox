import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JA_AVOID_TERMS } from "../lib/i18n/ja-tool-rules.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const scanRoots = ["app", "components", "lib"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md"]);
const ignoredRelativePaths = new Set([
  "lib/i18n/ja-tool-terms.ts",
  "lib/i18n/ja-tool-rules.mjs",
  "lib/i18n/ja-term-baseline.json",
]);

const baselinePath = path.join(projectRoot, "lib/i18n/ja-term-baseline.json");
const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const baselineKeys = new Set(
  baseline.entries.map((entry) => `${entry.file}::${entry.term}::${entry.preferred}`),
);

function collectFiles(directory, output = []) {
  if (!fs.existsSync(directory)) return output;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (["node_modules", ".next", "test-results", "playwright-report"].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(absolute, output);
    else if (extensions.has(path.extname(entry.name))) output.push(absolute);
  }
  return output;
}

const findings = [];
for (const root of scanRoots) {
  for (const file of collectFiles(path.join(projectRoot, root))) {
    const relative = path.relative(projectRoot, file).replaceAll(path.sep, "/");
    if (ignoredRelativePaths.has(relative)) continue;
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      for (const rule of JA_AVOID_TERMS) {
        for (const term of rule.avoid) {
          if (!line.includes(term)) continue;
          const key = `${relative}::${term}::${rule.preferred}`;
          findings.push({
            file: relative,
            line: index + 1,
            term,
            preferred: rule.preferred,
            text: line.trim(),
            baseline: baselineKeys.has(key),
          });
        }
      }
    }
  }
}

const existing = findings.filter((item) => item.baseline);
const newFindings = findings.filter((item) => !item.baseline);

console.log(`[일본어 용어 검수] 기존 기준선 ${existing.length}건 / 신규 위반 ${newFindings.length}건`);
if (existing.length) {
  console.log("\n기존 정비 대상(현재 빌드 차단 안 함):");
  for (const item of existing) {
    console.log(`- ${item.file}:${item.line}  ${item.term} → ${item.preferred}`);
  }
}
if (newFindings.length) {
  console.error("\n신규 일본어 표준 위반:");
  for (const item of newFindings) {
    console.error(`- ${item.file}:${item.line}  ${item.term} → ${item.preferred}`);
    console.error(`  ${item.text}`);
  }
  process.exitCode = 1;
} else {
  console.log("\n신규 일본어 표준 위반이 없습니다.");
}
