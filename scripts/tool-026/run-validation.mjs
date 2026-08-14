import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const mode = process.argv[2] || 'preflight';
const allowed = new Set(['preflight', 'core-only', 'boundary-only', 'feature-only', 'regression-only', 'limit-only', 'final']);
if (!allowed.has(mode)) {
  console.error(`unknown mode: ${mode}`);
  process.exit(2);
}

const root = process.cwd();
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `tool026-${mode}-`));
const results = [];

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zipDirectory(dir, zipPath) {
  const files = [];
  const walk = (cur, base = '') => {
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      const abs = path.join(cur, e.name);
      const rel = base ? `${base}/${e.name}` : e.name;
      e.isDirectory() ? walk(abs, rel) : files.push({ abs, rel: rel.replace(/\\/g, '/') });
    }
  };
  walk(dir);
  const local = [], central = [];
  let offset = 0;
  for (const f of files) {
    const body = fs.readFileSync(f.abs), name = Buffer.from(f.rel), crc = crc32(body), lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(body.length, 22); lh.writeUInt16LE(name.length, 26);
    local.push(lh, name, body);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(body.length, 24); ch.writeUInt16LE(name.length, 28); ch.writeUInt32LE(offset, 42);
    central.push(ch, name); offset += lh.length + name.length + body.length;
  }
  const cs = central.reduce((n, b) => n + b.length, 0), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cs, 12); end.writeUInt32LE(offset, 16);
  fs.writeFileSync(zipPath, Buffer.concat([...local, ...central, end]));
}

function safeFilePart(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

async function runStep(index, total, name, cmd, args) {
  console.log(`\n[${index}/${total}] START ${name}`);
  const startedAt = Date.now();
  const started = new Date(startedAt).toISOString();
  let stdout = '', stderr = '';

  return await new Promise((resolve) => {
    let done = false;
    let heartbeat = null;

    const finish = (code, error) => {
      if (done) return;
      done = true;
      if (heartbeat) clearInterval(heartbeat);
      const ended = new Date().toISOString();
      const elapsedSec = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      const logName = `${String(index).padStart(2, '0')}-${safeFilePart(name)}.log`;
      fs.writeFileSync(
        path.join(outDir, logName),
        `$ ${cmd} ${args.join(' ')}\nSTART=${started}\nEND=${ended}\nELAPSED_SEC=${elapsedSec}\nEXIT=${code}\n\n${stdout}\n${stderr}`
      );
      results.push({ name, status: code, error, started, ended, elapsedSec });
      const pass = results.filter(x => x.status === 0).length;
      const fail = results.length - pass;
      console.log(`[${index}/${total}] ${code === 0 ? 'PASS' : 'FAIL'} ${name} | PASS=${pass} FAIL=${fail} | remaining=${total - index}`);
      resolve(code === 0);
    };

    let child;
    try {
      // Windows-safe contract: never spawn .cmd/.bat directly. All local JS CLIs are launched via process.execPath.
      child = spawn(cmd, args, { cwd: root, env: process.env, shell: false, windowsHide: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      stderr += `\nSPAWN_THROW: ${message}\n`;
      finish(1, message);
      return;
    }

    heartbeat = setInterval(() => {
      const elapsedSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      console.log(`[${index}/${total}] RUNNING ${name} | elapsed ${elapsedSec}s`);
    }, 15000);
    heartbeat.unref?.();

    child.stdout?.on('data', d => { const s = d.toString(); stdout += s; process.stdout.write(s); });
    child.stderr?.on('data', d => { const s = d.toString(); stderr += s; process.stderr.write(s); });
    child.on('error', e => {
      const message = e instanceof Error ? e.message : String(e);
      stderr += `\nSPAWN_ERROR: ${message}\n`;
      finish(1, message);
    });
    child.on('close', code => finish(code ?? 1, null));
  });
}

const nextCli = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const pwCli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
const tscCli = path.join(root, 'node_modules', 'typescript', 'lib', 'tsc.js');
const node = process.execPath;

const staticSteps = [
  ['runner-contract', node, ['scripts/tool-026/check-runner-contract.mjs']],
  ['source', node, ['scripts/tool-026/check-source.mjs']],
  ['logic', node, ['scripts/tool-026/check-logic.mjs']],
  ['integration', node, ['scripts/tool-026/check-integration.mjs']],
  ['design-transplant', node, ['scripts/tool-026/check-design-transplant.mjs']],
  ['content', node, ['scripts/tool-026/check-content.mjs']],
  ['common-design', node, ['scripts/check-toolbox-common-design.mjs']],
];

const runtime = (spec, name) => [name, node, [pwCli, 'test', spec, '--workers=1', '--config=playwright.tool026.config.ts']];
let steps = [...staticSteps];
if (mode === 'core-only') steps.push(runtime('tests/tool-026-core.spec.ts', 'core'));
if (mode === 'boundary-only') steps.push(runtime('tests/tool-026-boundary.spec.ts', 'boundary'));
if (mode === 'feature-only') {
  steps.push(runtime('tests/tool-026-feature.spec.ts', 'feature'));
  steps.push(runtime('tests/tool-026-design-state.spec.ts', 'feature-design-state'));
}
if (mode === 'regression-only') steps.push(runtime('tests/tool-026-regression.spec.ts', 'regression'));
if (mode === 'limit-only') steps.push(runtime('tests/tool-026-limit.spec.ts', 'limit'));
if (mode === 'preflight') steps.push(runtime('tests/tool-026-preflight.spec.ts', 'harness-minimal-runtime'));
if (mode === 'final') {
  steps.push(['typescript', node, [tscCli, '--noEmit']]);
  steps.push(['production-build', node, ['scripts/tool-026/runtime-workspace.mjs', 'build']]);
  steps.push(runtime('tests/tool-026-core.spec.ts', 'core'));
  steps.push(runtime('tests/tool-026-boundary.spec.ts', 'boundary'));
  steps.push(runtime('tests/tool-026-feature.spec.ts', 'feature'));
  steps.push(runtime('tests/tool-026-design-state.spec.ts', 'feature-design-state'));
  steps.push(runtime('tests/tool-026-regression.spec.ts', 'regression'));
  steps.push(runtime('tests/tool-026-limit.spec.ts', 'limit'));
}

let fatalMessage = null;
try {
  const missing = [];
  if (!fs.existsSync(nextCli)) missing.push('node_modules/next');
  if (!fs.existsSync(pwCli)) missing.push('node_modules/@playwright/test');
  if (!fs.existsSync(tscCli)) missing.push('node_modules/typescript/lib/tsc.js');

  if (missing.length) {
    const msg = `ENVIRONMENT_FAIL: local dependencies unavailable: ${missing.join(', ')}. Run npm ci before validation.\n`;
    fs.writeFileSync(path.join(outDir, '00-environment.log'), msg);
    const now = new Date().toISOString();
    results.push({ name: 'environment-preflight', status: 87, error: msg.trim(), started: now, ended: now, elapsedSec: 0 });
    console.error(msg);
  } else {
    console.log(`TOOL 026 ${mode.toUpperCase()} | total steps=${steps.length}`);
    for (let i = 0; i < steps.length; i++) {
      const [name, cmd, args] = steps[i];
      await runStep(i + 1, steps.length, name, cmd, args);
    }
  }
} catch (e) {
  fatalMessage = e instanceof Error ? (e.stack || e.message) : String(e);
  const now = new Date().toISOString();
  results.push({ name: 'validator-internal', status: 99, error: fatalMessage, started: now, ended: now, elapsedSec: 0 });
  try { fs.writeFileSync(path.join(outDir, '99-validator-internal.log'), fatalMessage); } catch {}
  console.error(`VALIDATOR_INTERNAL_FAIL\n${fatalMessage}`);
}

const pass = results.filter(x => x.status === 0).length;
const fail = results.length - pass;
const ok = fail === 0 && !fatalMessage;
const summary = `TOOL 026 ${mode}\nPASS=${pass}\nFAIL=${fail}\nSKIP=0\nSTATUS=${ok ? 'PASS' : 'FAIL'}\n`;
try { fs.writeFileSync(path.join(outDir, 'summary.txt'), summary); } catch {}
try { fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify({ tool: '026', mode, pass, fail, skip: 0, status: ok ? 'PASS' : 'FAIL', results }, null, 2)); } catch {}

const desktop = path.join(process.env.USERPROFILE || os.homedir(), 'Desktop');
const outBase = process.env.TOOL026_RESULT_DIR ? path.resolve(process.env.TOOL026_RESULT_DIR) : desktop;
let zipPath = path.join(outBase, `026_${mode}_검수결과.zip`);
try {
  fs.mkdirSync(outBase, { recursive: true });
  try { fs.unlinkSync(zipPath); } catch {}
  zipDirectory(outDir, zipPath);
  console.log(`\n${summary}ZIP=${zipPath}`);
} catch (e) {
  const archiveError = e instanceof Error ? e.message : String(e);
  console.error(`RESULT_ARCHIVE_FAIL: ${archiveError}`);
  zipPath = '(archive failed)';
} finally {
  try { fs.rmSync(outDir, { recursive: true, force: true }); } catch {}
}

process.exit(ok ? 0 : 1);
