import fs from "node:fs";
let fail = 0;
const need = (ok, msg) => { console.log(ok ? "PASS" : "FAIL", msg); if (!ok) fail += 1; };
const lib = fs.readFileSync("lib/tool-032-pdf-signature.ts", "utf8");
const page = fs.readFileSync("components/pdf-signature-page.tsx", "utf8");
const tool = fs.readFileSync("components/pdf-signature-tool.tsx", "utf8");
const spec = fs.readFileSync("tests/tool-032-limit.spec.ts", "utf8");
for (const [token, label] of [
  ["maxPdfBytes: 30 * 1024 * 1024", "PDF 30 MiB"],
  ["maxPages: 300", "PDF 300 pages"],
  ["maxSignatureImageBytes: 10 * 1024 * 1024", "signature 10 MiB"],
  ["maxSignaturePixels: 20_000_000", "signature 20 MP"],
  ["maxStrokePoints: 20_000", "stroke 20,000 points"],
]) need(lib.includes(token) && spec.includes(token), `approved limit ${label} is independent in product + test`);
need(page.includes("확정 서비스 한도") && page.includes("Approved service limits") && page.includes("確定サービス上限"), "KO/EN/JA approved-limit wording");
need(!page.includes("서비스 한도 승인 게이트") && !page.includes("pending the service-limit approval gate") && !page.includes("サービス上限承認ゲート"), "approval-pending wording removed");
for (const attr of ["data-max-pdf-bytes", "data-max-pages", "data-max-signature-bytes", "data-max-signature-pixels", "data-max-stroke-points"]) need(tool.includes(attr), `DOM contract ${attr}`);
process.exitCode = fail ? 1 : 0;
