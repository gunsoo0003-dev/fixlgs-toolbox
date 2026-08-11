import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const profilePath = path.join(root, 'tests/common-validation/capability-profile.json');
const specPath = path.join(root, 'tests/common-user-path.spec.ts');
const allProfiles = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
const rawTargetTool = process.env.TOOLBOX_VALIDATION_TOOL || '';
const targetTool = rawTargetTool ? rawTargetTool.padStart(3, '0') : '';
const profiles = targetTool ? allProfiles.filter(p => p.tool === targetTool) : allProfiles;
if (targetTool && profiles.length === 0) {
  console.error(`COVERAGE_MISSING\t${targetTool}\tcapability profile not registered`);
  process.exit(1);
}
const spec = fs.readFileSync(specPath, 'utf8');

const findings = [];
const seen = new Set();
for (const p of profiles) {
  if (seen.has(p.tool)) findings.push({ state:'FAIL', tool:p.tool, reason:'duplicate profile' });
  seen.add(p.tool);
  for (const key of ['slug','trigger','dropTarget','fixture']) {
    if (!p[key]) findings.push({ state:'COVERAGE_MISSING', tool:p.tool, reason:`missing ${key}` });
  }
  if (p.upload && !spec.includes('desktop click -> chooser -> change')) findings.push({ state:'COVERAGE_MISSING', tool:p.tool, reason:'desktop upload user-path suite missing' });
  if (p.upload && !spec.includes('mobile tap -> chooser -> change')) findings.push({ state:'COVERAGE_MISSING', tool:p.tool, reason:'mobile upload user-path suite missing' });
  if (p.desktopDragDrop && !spec.includes('desktop drag/drop entry')) findings.push({ state:'COVERAGE_MISSING', tool:p.tool, reason:'desktop drag/drop suite missing' });
  if (p.mobileDragDrop) findings.push({ state:'FAIL', tool:p.tool, reason:'mobile drag/drop must be N/A for current TOOLBOX policy' });
}

for (const required of ['COMMON ROUTE / LOCALE / RUNTIME / RELOAD','mobile drag/drop is N/A']) {
  if (!spec.includes(required)) findings.push({ state:'COVERAGE_MISSING', tool:'COMMON', reason:`missing suite: ${required}` });
}

const counts = {
  PASS: profiles.length,
  FAIL: findings.filter(x => x.state === 'FAIL').length,
  COVERAGE_MISSING: findings.filter(x => x.state === 'COVERAGE_MISSING').length,
  NA_MOBILE_DRAGDROP: profiles.filter(x => !x.mobileDragDrop).length,
};
console.log('=== FIXLGS COMMON USER-PATH COVERAGE ===');
console.log(JSON.stringify(counts, null, 2));
if (findings.length) {
  console.log('\nFindings:');
  for (const f of findings) console.log(`${f.state}\t${f.tool}\t${f.reason}`);
  process.exitCode = 1;
} else {
  console.log('PASS: capability/profile coverage structure is complete for the current first-wave suites.');
}
