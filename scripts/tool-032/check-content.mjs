import fs from "node:fs";
let fail = 0; const need = (ok, msg) => { console.log(ok ? "PASS" : "FAIL", msg); if (!ok) fail += 1; };
const page = fs.readFileSync("components/pdf-signature-page.tsx", "utf8");
const tool = fs.readFileSync("components/pdf-signature-tool.tsx", "utf8");
for (const token of ["ko:", "en:", "ja:", "toolbox-tool-guide", "toolbox-tool-use-cases--editorial", "toolbox-tool-expert-post", "toolbox-tool-info-band", "toolbox-tool-faq"]) need(page.includes(token), `page content ${token}`);
for (const token of ["인증서", "PKI", "legal validity", "法的効力", "서버", "current browser", "ブラウザ内"]) need((page + tool).includes(token), `trust/boundary wording ${token}`);
for (const token of ["서명 그리기", "Draw signature", "署名を描く", "서명 이미지", "Signature image", "署名画像", "여러 페이지", "multiple pages", "複数ページ"]) need((page + tool).includes(token), `required UI/content ${token}`);
need(!/(법적 효력을 보장합니다|legally binding guaranteed|法的効力を保証します)/i.test(page + tool), "no legal-effect guarantee");
process.exitCode = fail ? 1 : 0;
