import fs from 'node:fs';
const fail=[];const need=(v,m)=>{if(!v)fail.push(m)};const tool=fs.readFileSync('components/pdf-password-metadata-tool.tsx','utf8');const policy=fs.readFileSync('lib/tool-034-pdf-policy.ts','utf8');
for(const x of ['password','metadata','protected','unlocked','metadata-clean'])need(tool.includes(x)||policy.includes(x),`flow token missing ${x}`);
need(policy.includes('maxFiles: 1')&&policy.includes('maxBytes: 50 * 1024 * 1024')&&policy.includes('maxPasswordLength: 128')&&policy.includes('maxMetadataLength: 2000'),'approved service limit source missing');need(tool.includes('TOOL034_SERVICE_LIMITS.maxBytes'),'UI validation not linked to approved service limit source');need(tool.includes('inspectEncryption(out,newPassword)'),'protected-result verification missing');need(tool.includes('inspectEncryption(plain)'),'unlock-result verification missing');need(tool.includes('readTool034Metadata(changed)'),'metadata-result reanalysis missing');

for(const p of ['tests/fixtures/tool-034/protected-known-password.pdf','tests/tool-034-core.spec.ts','tests/tool-034-boundary.spec.ts','tests/tool-034-feature.spec.ts'])need(fs.existsSync(p),`checker coverage file missing ${p}`);
const core=fs.readFileSync('tests/tool-034-core.spec.ts','utf8');const boundary=fs.readFileSync('tests/tool-034-boundary.spec.ts','utf8');const feature=fs.readFileSync('tests/tool-034-feature.spec.ts','utf8');
need(core.includes('tool034ProtectedFixture')&&core.includes('tool034-remove-password'),'encrypted-PDF removal browser coverage missing');
need(boundary.includes('tool034ProtectedFixture')&&boundary.includes('definitely-wrong-password'),'wrong-password boundary coverage missing');
need(feature.includes("workspace.getByTestId('tool034-file-info')")&&feature.includes("workspace.getByTestId('tool034-main-panel')"),'single post-upload drag-wrapper browser coverage missing');

if(fail.length){console.error('TOOL034 HARNESS STRUCTURE FAIL');fail.forEach(x=>console.error(' -',x));process.exit(1)}console.log('TOOL034 HARNESS STRUCTURE PASS');
