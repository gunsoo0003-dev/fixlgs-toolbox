import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fixtureDir = path.join(root, "test-fixtures", "tool-021");
const allowed = new Set([
  "animated.png","animated.webp","corrupt.jpg","exif-rotated.jpg","landscape.jpg",
  "large-30mp.jpg","mismatch.png","no-stretch-marker.png","over-20mb.jpg","over-40mp.jpg",
  "portrait.jpg","sample.webp","square.jpg","text-cases.json","tiny.jpg","transparent.png",
  "한글 파일명.jpg","日本語ファイル名.jpg"
]);

const problems = [];

if (fs.existsSync(fixtureDir)) {
  for (const name of fs.readdirSync(fixtureDir)) {
    if (!allowed.has(name)) problems.push(`unexpected fixture: test-fixtures/tool-021/${name}`);
  }
}

for (const name of fs.readdirSync(root)) {
  if (/^\.tool021-runtime-/.test(name)) problems.push(`stale runtime: ${name}`);
  if (/[�╣║╚┐└┴┬├┤│─▓▒░]/u.test(name) || /^[φµì]/u.test(name)) {
    problems.push(`mojibake root entry: ${name}`);
  }
}

if (problems.length) {
  console.error("FAIL: mojibake/runtime hygiene");
  for (const p of problems) console.error(" -", p);
  process.exit(1);
}

console.log("PASS: mojibake/runtime hygiene");
