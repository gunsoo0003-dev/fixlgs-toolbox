import fs from "node:fs";
let fail = 0; const need = (ok, msg) => { console.log(ok ? "PASS" : "FAIL", msg); if (!ok) fail += 1; };
for (const f of ["mixed-4page.pdf", "broken.pdf", "mime-mismatch.pdf", "transparent-signature.png", "signature.jpg", "signature.webp", "mime-mismatch.png", "페이지범위_한글_日本語.txt"]) {
  const p = `fixtures/tool-032/${f}`; need(fs.existsSync(p) && fs.statSync(p).size > 0, `fixture ${f}`);
}
const pdf = fs.readFileSync("fixtures/tool-032/mixed-4page.pdf"); need(pdf.subarray(0, 5).toString() === "%PDF-", "normal PDF header");
const png = fs.readFileSync("fixtures/tool-032/transparent-signature.png"); need(png[0] === 0x89 && png[1] === 0x50, "transparent PNG signature header");
process.exitCode = fail ? 1 : 0;
