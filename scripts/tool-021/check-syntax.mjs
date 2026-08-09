import { spawnSync } from 'node:child_process';

const files = [
  'components/social-media-image-maker-tool.tsx',
  'components/social-media-image-maker-page.tsx',
  'tests/tool-021-core.spec.ts',
  'tests/tool-021-boundary.spec.ts',
  'tests/tool-021-regression.spec.ts',
  'tests/tool-021-limit.spec.ts',
  'tests/tool-021-design.spec.ts',
];
const args = ['--jsx','react-jsx','--target','es2022','--module','esnext','--moduleResolution','bundler','--noEmit','--skipLibCheck',...files];
const r = spawnSync('tsc', args, { encoding: 'utf8' });
const text = `${r.stdout || ''}${r.stderr || ''}`;
const lines = text.split(/\r?\n/).filter(Boolean);
const allowed = new Set(['TS2307','TS2580','TS2875']);
const unexpected = lines.filter(line => {
  const match = line.match(/error (TS\d+):/);
  return match && !allowed.has(match[1]);
});
const out = {
  tool: '021',
  files: files.length,
  diagnostics: lines.length,
  expectedDependencyDiagnostics: lines.length - unexpected.length,
  unexpectedDiagnostics: unexpected,
  syntaxPass: unexpected.length === 0,
  note: 'TS2307/TS2580/TS2875 are expected while node_modules/@types are unavailable in this auxiliary environment.',
};
console.log(JSON.stringify(out, null, 2));
if (unexpected.length) process.exit(1);
