import fs from 'node:fs';
let fail=0;const need=(ok,msg)=>{console.log(ok?'PASS':'FAIL',msg);if(!ok)fail++;};
const specs=['tests/tool-035-preflight.spec.ts','tests/tool-035-core.spec.ts','tests/tool-035-boundary.spec.ts','tests/tool-035-feature.spec.ts','tests/tool-035-regression.spec.ts','tests/tool-035-limit.spec.ts'];
for(const f of specs) need(fs.existsSync(f),f);
const fixtures=['native-text-3pages.pdf','text-only-mixed-pages.pdf','embedded-images-repeated-alpha.pdf','scan-image-only.pdf','rotated-mixed-size.pdf','encrypted-password.pdf','corrupt.pdf','not-a-pdf.pdf','embedded-photo.jpg','alpha-image.png','tiny-image.png','repeated-xobject.pdf','soft-mask.pdf','inline-image.pdf','image-mask.pdf','real-world-hug-manual-72pages.pdf','exact-200-pages.pdf','over-200-pages.pdf'];
for(const f of fixtures) need(fs.existsSync(`test-fixtures/tool-035/${f}`),`fixture ${f}`);
const joined=specs.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const tool=fs.readFileSync('components/pdf-text-image-extractor-tool.tsx','utf8');
for(const token of ['tool035-root','tool035-file-input','tool035-extract','tool035-results','tool035-text-results','tool035-image-results','tool035-scan-hint','tool035-image-view-major','tool035-image-view-all']) need(joined.includes(token)&&tool.includes(token),`selector contract ${token}`);
for(const token of ['tool035-filter-basic','tool035-filter-level1','tool035-filter-level2','tool035-filter-level3','tool035-filter-custom','tool035-filter-custom-size']) need(joined.includes(token),`browser selector contract ${token}`);
need(tool.includes('data-testid={`tool035-filter-${key}`}')&&tool.includes('tool035-filter-custom-size'),'product exposes dynamic 5-choice exclusion-filter testids');
need(!tool.includes('Use minimum image-size filter')&&!tool.includes('Hide duplicate images'),'stale opt-in size/dedup product controls absent');
need(joined.includes('exclusion filter defaults to basic and supports 3 presets plus custom'),'browser feature spec covers current 5-choice exclusion filter contract');
need(joined.includes('uploadPdfAndWaitReady')&&joined.includes('toBeEnabled({ timeout: 30_000 })'),'valid-PDF browser specs wait for asynchronous load readiness before interacting');
need(joined.includes('operator-special fixtures remain available without duplicating browser extraction work')&&joined.includes('fs.statSync(fixture).size'),'operator-special fixtures use bounded structural CORE coverage instead of duplicate browser extraction');
need(joined.includes('real-world fixture remains the canonical 72-page manual')&&joined.includes('doc.getPageCount()).toBe(72)'),'72-page real-world CORE coverage is bounded to fixture integrity/page-count');
need(!joined.includes('image operator path handles ${kind} fixture'),'stale per-special-fixture browser extraction loop absent from CORE');
need(!joined.includes('real-world 72-page manual detects and decodes embedded images'),'stale full real-world extraction absent from CORE');

const coreSpec=fs.readFileSync('tests/tool-035-core.spec.ts','utf8');
const featureSpec=fs.readFileSync('tests/tool-035-feature.spec.ts','utf8');
need(coreSpec.includes('test.describe.configure({ timeout: 30_000 })'),'CORE uses a 30-second per-test ceiling instead of the global 180-second timeout');
need(!coreSpec.includes('defaults to major images and can reveal all images'),'major/all image-view UI contract is not redundantly re-extracted in CORE');
need(featureSpec.includes('tool035-image-view-major')&&featureSpec.includes('tool035-image-view-all')&&featureSpec.includes('allVisible).toBeGreaterThanOrEqual(majorVisible)'),'FEATURE covers major/all image-view policy using its existing extraction result');
need(featureSpec.includes('test.describe.configure({ timeout: 60_000 })'),'FEATURE uses a bounded 60-second per-test ceiling');
need(featureSpec.includes('selectRadioByTestId')&&featureSpec.includes('radio.evaluate((element: HTMLElement) => element.click())'),'FEATURE radio controls use DOM click helper so label/header overlays cannot stall Playwright actionability');
need(!featureSpec.includes('tool035-image-view-all").check()')&&!featureSpec.includes('tool035-image-view-major").check()')&&!featureSpec.includes('tool035-filter-level1").check()')&&!featureSpec.includes('tool035-filter-level2").check()')&&!featureSpec.includes('tool035-filter-level3").check()')&&!featureSpec.includes('tool035-filter-custom").check()'),'FEATURE has no stale locator.check calls for label-wrapped radio controls');

need(joined.includes('await expect(root.getByTestId("tool035-results")).toBeVisible({ timeout: 20_000 })'),'feature waits for extraction completion before counting filtered image cards');
need(joined.includes('fs.ftruncateSync(fd, 50 * 1024 * 1024 + 1)')&&!joined.includes('Buffer.alloc(50 * 1024 * 1024 + 1'),'50MB limit test uses a physical temp file instead of Playwright oversized buffer');
need(joined.includes('operator-special fixtures remain available without duplicating browser extraction work'),'special image fixtures do not consume browser-runtime budget in CORE');
need(joined.includes('APPROVED_2026_08_15'),'approved limit status is asserted');
for(const token of ['50 * 1024 * 1024','pages: 200','extractedImagesWarning: 500','extractedImagesHardStop: 1000','pageConcurrency: 1']) need(joined.includes(token),`limit expected ${token}`);

const runner=fs.readFileSync('scripts/tool-035/run-validation.mjs','utf8');
need(runner.includes("'core':300_000"),'runner core hard timeout is 300 seconds');
need(runner.includes('HARD_TIMEOUT:')&&runner.includes("finish(124,m,'hard-timeout')"),'runner records hard timeout and continues');
need(runner.includes("spawn('taskkill'")&&runner.includes("'/T','/F'")&&runner.includes('TASKKILL_TIMEOUT_3S'),'runner kills Windows child process tree asynchronously with bounded cleanup');
need(runner.includes("process.on('SIGINT'")&&runner.includes("finalize('INTERRUPTED'"),'Ctrl+C interruption preserves result package');
need(runner.includes('live-status.json')&&runner.includes('fs.appendFileSync(logPath,s)'),'runner persists live status and step output while running');
need(runner.includes('진행중.txt')&&runner.includes('진행중.json'),'runner mirrors live progress to Desktop TXT/JSON');
need(runner.includes('timeoutTriggered')&&runner.includes("child.on('close',code=>timeoutTriggered"),'hard-timeout close race keeps timeout classification');

need(fs.existsSync('scripts/tool-035/mobile-runner-entry.mjs'),'mobile runner entry exists');
process.exitCode=fail?1:0;

need(runner.includes("finish(124,m,'hard-timeout');")&&runner.indexOf("finish(124,m,'hard-timeout');") < runner.indexOf('killTreeAsync(child,status=>'),'runner records hard timeout before asynchronous Windows cleanup');
