import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const mode = process.argv[2] ?? 'dev';
if (!new Set(['dev','build']).has(mode)) {
  console.error(`Unsupported mode: ${mode}`);
  process.exit(2);
}

const root = process.cwd();
const nextCli = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
if (!fs.existsSync(nextCli)) {
  console.error('BLOCKED: root node_modules/.bin/next is unavailable.');
  process.exit(87);
}

const runtimeRoot = fs.mkdtempSync(path.join(root, '.tool021-runtime-'));
const sourceDirs = ['app','components','lib','styles','public','icons'];
const sourceFiles = ['package.json','package-lock.json','tsconfig.json','next-env.d.ts','postcss.config.mjs','proxy.ts','manifest.webmanifest','favicon.png'];
for (const name of sourceDirs) {
  const src = path.join(root,name);
  if (fs.existsSync(src)) fs.cpSync(src,path.join(runtimeRoot,name),{recursive:true});
}
for (const name of sourceFiles) {
  const src = path.join(root,name);
  if (fs.existsSync(src)) fs.copyFileSync(src,path.join(runtimeRoot,name));
}

const escapedRoot = runtimeRoot.replace(/\\/g,'\\\\');
fs.writeFileSync(path.join(runtimeRoot,'next.config.ts'), `import type { NextConfig } from "next";\nconst nextConfig: NextConfig = {\n  allowedDevOrigins: ["127.0.0.1", "localhost"],\n  distDir: ".next-tool021-runtime",\n  turbopack: { root: ${JSON.stringify(escapedRoot)} },\n};\nexport default nextConfig;\n`);

const cleanup = () => fs.rmSync(runtimeRoot,{recursive:true,force:true});

if (mode === 'build') {
  const result = spawnSync(process.execPath,[nextCli,'build',runtimeRoot,'--webpack'],{cwd:root,stdio:'inherit',env:{...process.env,TOOL021_RUNTIME:'1'}});
  cleanup();
  process.exit(result.status ?? 1);
}

const child = spawn(process.execPath,[nextCli,'dev',runtimeRoot,'--webpack','--hostname','127.0.0.1','--port','3021'],{
  cwd:root,
  stdio:'inherit',
  env:{...process.env,TOOL021_RUNTIME:'1'},
});
const forward = (signal) => { if (!child.killed) child.kill(signal); };
process.on('SIGINT',()=>forward('SIGINT'));
process.on('SIGTERM',()=>forward('SIGTERM'));
child.on('exit',(code,signal)=>{
  cleanup();
  if (signal) process.kill(process.pid,signal);
  else process.exit(code ?? 1);
});
