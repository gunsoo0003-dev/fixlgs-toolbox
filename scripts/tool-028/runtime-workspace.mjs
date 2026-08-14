import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const mode = process.argv[2] ?? 'dev';
if (!new Set(['dev', 'build']).has(mode)) { console.error(`Unsupported mode: ${mode}`); process.exit(2); }
const root = process.cwd();
const nextCli = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
if (!fs.existsSync(nextCli)) { console.error('BLOCKED: Next.js runtime is unavailable. Run npm ci first.'); process.exit(87); }
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name.startsWith('.tool028-runtime-')) fs.rmSync(path.join(root, entry.name), { recursive: true, force: true });
}
const runtimeRoot = fs.mkdtempSync(path.join(root, '.tool028-runtime-'));
for (const name of ['app', 'components', 'lib', 'styles', 'public', 'icons', 'types']) {
  const src = path.join(root, name); if (fs.existsSync(src)) fs.cpSync(src, path.join(runtimeRoot, name), { recursive: true });
}
for (const name of ['package.json', 'package-lock.json', 'tsconfig.json', 'next-env.d.ts', 'postcss.config.mjs', 'proxy.ts', 'manifest.webmanifest', 'favicon.png']) {
  const src = path.join(root, name); if (fs.existsSync(src)) fs.copyFileSync(src, path.join(runtimeRoot, name));
}
const escapedRoot = runtimeRoot.replace(/\\/g, '\\\\');
fs.writeFileSync(path.join(runtimeRoot, 'next.config.ts'), `import type { NextConfig } from "next";\nconst nextConfig: NextConfig={allowedDevOrigins:["127.0.0.1","localhost"],distDir:".next-tool028-runtime",turbopack:{root:${JSON.stringify(escapedRoot)}}};\nexport default nextConfig;\n`);
let cleaned = false;
const cleanup = () => { if (cleaned) return; cleaned = true; fs.rmSync(runtimeRoot, { recursive: true, force: true }); };
process.on('exit', cleanup);
if (mode === 'build') {
  let status = 1;
  try { const r = spawnSync(process.execPath, [nextCli, 'build', runtimeRoot, '--webpack'], { cwd: root, stdio: 'inherit', env: { ...process.env, TOOL028_RUNTIME: '1' } }); status = r.status ?? 1; }
  finally { cleanup(); }
  process.exit(status);
}
const child = spawn(process.execPath, [nextCli, 'dev', runtimeRoot, '--webpack', '--hostname', '127.0.0.1', '--port', '3028'], { cwd: root, stdio: 'inherit', env: { ...process.env, TOOL028_RUNTIME: '1' } });
const forward = signal => { if (!child.killed) child.kill(signal); };
process.on('SIGINT', () => forward('SIGINT')); process.on('SIGTERM', () => forward('SIGTERM'));
child.on('error', error => { console.error(error); cleanup(); process.exit(1); });
child.on('exit', (code, signal) => { cleanup(); if (signal) process.kill(process.pid, signal); else process.exit(code ?? 1); });
