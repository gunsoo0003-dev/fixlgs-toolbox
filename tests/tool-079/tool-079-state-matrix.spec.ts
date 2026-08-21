import {test,expect} from '@playwright/test';

function watchRuntime(page:any){
  const errors:string[]=[];
  page.on('pageerror',(e:any)=>errors.push(`pageerror:${e.message}`));
  page.on('console',(m:any)=>{ if(m.type()==='error') errors.push(`console:${m.text()}`); });
  return errors;
}
function expectRuntimeClean(errors:string[]){ expect(errors,errors.join('\n')).toEqual([]); }

for(const locale of ['ko','en','ja'] as const){
  test(`${locale} normal dividend result`,async({page})=>{
    const runtime=watchRuntime(page);
    await page.goto(`/${locale}/dividend-yield-calculator`);
    const root=page.getByTestId('tool079-root');
    await expect(root).toBeVisible();
    await page.getByTestId('tool079-share-price').fill('50000');
    await page.getByTestId('tool079-annual-dps').fill('2000');
    await page.getByTestId('tool079-shares').fill('100');
    await expect(page.getByTestId('tool079-dividend-yield')).toContainText('4');
    await expect(page.getByTestId('tool079-expected-dividend')).toContainText('200,000');
    await expect(page.getByTestId('tool079-annual-basis')).toBeVisible();
    expectRuntimeClean(runtime);
  });
}

test('zero shares is valid boundary',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/en/dividend-yield-calculator');
  await page.getByTestId('tool079-share-price').fill('50000');
  await page.getByTestId('tool079-annual-dps').fill('2000');
  await page.getByTestId('tool079-shares').fill('0');
  await expect(page.getByTestId('tool079-dividend-yield')).toContainText('4');
  await expect(page.getByTestId('tool079-expected-dividend')).toHaveText('0');
  expectRuntimeClean(runtime);
});

test('error survives and recovers',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/en/dividend-yield-calculator');
  const root=page.getByTestId('tool079-root');
  const price=page.getByTestId('tool079-share-price');
  await price.fill('0');
  await page.getByTestId('tool079-annual-dps').fill('2000');
  await page.getByTestId('tool079-shares').fill('100');
  await expect(page.getByTestId('tool079-error')).toBeVisible();
  await expect(root).toBeVisible(); await expect(price).toBeEditable();
  await price.fill('50000');
  await expect(page.getByTestId('tool079-error')).toHaveCount(0);
  await expect(page.getByTestId('tool079-dividend-yield')).toContainText('4');
  expectRuntimeClean(runtime);
});

test('scenario details open before action',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/en/dividend-yield-calculator');

  // Scope to the tool root so FAQ <details> elements cannot collide.
  const toolRoot=page.getByTestId('tool079-root');
  const details=toolRoot.locator('details');
  await expect(details).toHaveCount(1);
  await details.locator('summary').click();

  const ap=page.getByTestId('tool079-scenario-a-price');
  await expect(ap).toBeVisible();
  await expect(ap).toBeEditable();
  await ap.fill('50000');
  await page.getByTestId('tool079-scenario-a-dps').fill('2000');
  await page.getByTestId('tool079-scenario-b-price').fill('40000');
  await page.getByTestId('tool079-scenario-b-dps').fill('2000');
  await expect(page.getByTestId('tool079-scenario-a-result')).toContainText('4');
  await expect(page.getByTestId('tool079-scenario-b-result')).toContainText('5');
  expectRuntimeClean(runtime);
});
