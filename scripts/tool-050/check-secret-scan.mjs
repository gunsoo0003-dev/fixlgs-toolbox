import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EXCLUDED_DIRS = new Set([
  '.git','node_modules','.next','out','dist','build','coverage','test-results','playwright-report'
]);
const MAX_TEXT_BYTES = 2_000_000;
const TEXT_EXTENSIONS = new Set([
  '.js','.jsx','.mjs','.cjs','.ts','.tsx','.json','.md','.txt','.yml','.yaml','.toml','.ini',
  '.env','.css','.scss','.html','.xml','.sh','.ps1','.properties','.conf','.config'
]);

const RULES = [
  ['AWS_ACCESS_KEY', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ['GITHUB_TOKEN', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g],
  ['OPENAI_API_KEY', /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/g],
  ['GOOGLE_API_KEY', /\bAIza[0-9A-Za-z_-]{30,}\b/g],
  ['SLACK_TOKEN', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g],
  ['STRIPE_LIVE_SECRET', /\bsk_live_[A-Za-z0-9]{16,}\b/g],
  ['PRIVATE_KEY_PEM', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
];

const PLACEHOLDER = /^(?:changeme|change_me|example|sample|dummy|placeholder|your[_-]?(?:key|token|secret|password)|test|none|null|undefined|\*+|x+)$/i;
const ASSIGNMENT = /^\s*(?:export\s+)?([A-Z0-9_.-]*(?:SECRET|TOKEN|PASSWORD|PASSWD|API[_-]?KEY|PRIVATE[_-]?KEY)[A-Z0-9_.-]*)\s*[=:]\s*["']?([^"'\s#]+)["']?/i;

function walk(dir, out=[]) {
  for (const ent of fs.readdirSync(dir,{withFileTypes:true})) {
    if (EXCLUDED_DIRS.has(ent.name)) continue;
    const full=path.join(dir,ent.name);
    if (ent.isDirectory()) walk(full,out);
    else if (ent.isFile()) out.push(full);
  }
  return out;
}
function isTextCandidate(file) {
  const name=path.basename(file);
  return name.startsWith('.env') || TEXT_EXTENSIONS.has(path.extname(file).toLowerCase());
}
function lineOf(text,index){return text.slice(0,index).split('\n').length;}
function relative(file){return path.relative(ROOT,file).replaceAll('\\','/');}

const findings=[];
let scanned=0;
for (const file of walk(ROOT)) {
  if (!isTextCandidate(file)) continue;
  const stat=fs.statSync(file);
  if (stat.size>MAX_TEXT_BYTES) continue;
  let text;
  try { text=fs.readFileSync(file,'utf8'); } catch { continue; }
  scanned++;
  for (const [rule,re] of RULES) {
    re.lastIndex=0;
    for (const match of text.matchAll(re)) findings.push({file:relative(file),line:lineOf(text,match.index??0),rule});
  }
  if (path.basename(file).startsWith('.env') && !/\.example$|\.sample$|\.template$/i.test(file)) {
    const lines=text.split(/\r?\n/);
    lines.forEach((line,i)=>{
      const m=line.match(ASSIGNMENT);
      if (!m) return;
      const value=m[2].trim();
      if (value.length>=12 && !PLACEHOLDER.test(value)) findings.push({file:relative(file),line:i+1,rule:'ENV_SECRET_ASSIGNMENT'});
    });
  }
}

// Never print matched secret material. Only rule, file and line are evidence.
if (findings.length) {
  console.log(`RESULT SECRET_SCAN FAIL scanned=${scanned} findings=${findings.length}`);
  for (const f of findings) console.log(`FAIL ${f.rule} ${f.file}:${f.line}`);
  process.exit(1);
}
console.log(`RESULT SECRET_SCAN PASS scanned=${scanned} findings=0`);
