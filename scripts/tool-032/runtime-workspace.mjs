import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
const mode = process.argv[2] ?? "dev";
if (!new Set(["dev", "build"]).has(mode)) { console.error(`Unsupported mode: ${mode}`); process.exit(2); }
const root = process.cwd(); const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");
if (!fs.existsSync(nextCli)) { console.error("BLOCKED: Next.js runtime is unavailable. Run npm install first."); process.exit(87); }
for (const e of fs.readdirSync(root, { withFileTypes: true })) if (e.isDirectory() && e.name.startsWith(".tool032-runtime-")) fs.rmSync(path.join(root, e.name), { recursive: true, force: true });
const runtimeRoot = fs.mkdtempSync(path.join(root, ".tool032-runtime-"));
for (const name of ["app", "components", "lib", "styles", "public", "icons", "types"]) { const src = path.join(root, name); if (fs.existsSync(src)) fs.cpSync(src, path.join(runtimeRoot, name), { recursive: true }); }
for (const name of ["package.json", "package-lock.json", "tsconfig.json", "next-env.d.ts", "postcss.config.mjs", "proxy.ts", "manifest.webmanifest", "favicon.png"]) { const src = path.join(root, name); if (fs.existsSync(src)) fs.copyFileSync(src, path.join(runtimeRoot, name)); }
const escapedRoot = runtimeRoot.replace(/\\/g, "\\\\");
fs.writeFileSync(path.join(runtimeRoot, "next.config.ts"), `import type { NextConfig } from "next";\nconst nextConfig: NextConfig={allowedDevOrigins:["127.0.0.1","localhost"],distDir:".next-tool032-runtime",turbopack:{root:${JSON.stringify(escapedRoot)}}};\nexport default nextConfig;\n`);
let cleaned = false; const cleanup = () => { if (cleaned) return; cleaned = true; fs.rmSync(runtimeRoot, { recursive: true, force: true }); }; process.on("exit", cleanup);
if (mode === "build") { let status = 1; try { const r = spawnSync(process.execPath, [nextCli, "build", runtimeRoot, "--webpack"], { cwd: root, stdio: "inherit", env: { ...process.env, TOOL032_RUNTIME: "1" } }); status = r.status ?? 1; } finally { cleanup(); } process.exit(status); }
const child = spawn(process.execPath, [nextCli, "dev", runtimeRoot, "--webpack", "--hostname", "127.0.0.1", "--port", "3032"], { cwd: root, stdio: "inherit", env: { ...process.env, TOOL032_RUNTIME: "1" } });
const forward = (s) => { if (!child.killed) child.kill(s); }; process.on("SIGINT", () => forward("SIGINT")); process.on("SIGTERM", () => forward("SIGTERM")); child.on("error", (e) => { console.error(e); cleanup(); process.exit(1); }); child.on("exit", (code, signal) => { cleanup(); if (signal) process.kill(process.pid, signal); else process.exit(code ?? 1); });
