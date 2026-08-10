import fs from 'node:fs';
const tool=fs.readFileSync('components/app-icon-favicon-generator-tool.tsx','utf8');
const limit=fs.readFileSync('tests/tool-023-limit.spec.ts','utf8');
const tests=[
  'tests/helpers/tool-023.ts',
  'tests/tool-023-preflight.spec.ts',
  'tests/tool-023-core.spec.ts',
  'tests/tool-023-boundary.spec.ts',
  'tests/tool-023-regression.spec.ts'
].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const contracts=[
  'tool023-root','tool023-file-input','tool023-preview','tool023-generate','tool023-status',
  'tool023-start-card','tool023-dropzone','tool023-workspace-dropzone',
  'tool023-reset-settings','tool023-reset-all','tool023-safe-toggle'
];
let fail=false;
for(const id of contracts){
  const ok=tool.includes(id)&&tests.includes(id);
  console.log(`${ok?'PASS':'FAIL'} selector-contract ${id}`);
  if(!ok)fail=true;
}
const stableRuntimeChecks={
  initialWorkspaceContract:tests.includes('toolbox-workbench-upload')&&tests.includes('toolbox-upload-focus'),
  chronicDesignGuard:tests.includes('toolbox-tool-info-band--section-start')&&tests.includes('toolbox-tool-expert-post'),
  resetSplitGuard:tests.includes('tool023-reset-settings')&&tests.includes('tool023-reset-all'),
  faviconPreviewGuard:tests.includes('naturalWidth')&&tests.includes('faviconPreviewImage'),
  generationWaitGuard:tests.includes('GENERATION_TIMEOUT_MS=20000')&&tests.includes('waitForGenerationComplete'),
  dimensionZipGuard:tests.includes('storedZipEntries')&&tests.includes('downloadAllZip')&&tests.includes('test.setTimeout(90000)'),
  boundaryAlertScopeGuard:tests.includes("dropzone:'tool023-dropzone'")&&tests.includes("getByTestId(TOOL023_TESTIDS.dropzone).getByRole('alert')")&&!tests.includes("expect(page.getByRole('alert'))"),
  limitAlertScopeGuard:limit.includes("getByTestId(TOOL023_TESTIDS.dropzone).getByRole('alert')")&&!limit.includes("expect(page.getByRole('alert'))")
};
for(const [name,ok] of Object.entries(stableRuntimeChecks)){
  console.log(`${ok?'PASS':'FAIL'} runtime-contract ${name}`);
  if(!ok)fail=true;
}
process.exit(fail?1:0);
