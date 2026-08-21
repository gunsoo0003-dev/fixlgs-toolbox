import {test,expect} from '@playwright/test';

function watchRuntime(page:any){
  const errors:string[]=[];
  page.on('pageerror',(e:any)=>errors.push(`pageerror:${e.message}`));
  page.on('console',(m:any)=>{ if(m.type()==='error') errors.push(`console:${m.text()}`); });
  return errors;
}
function expectRuntimeClean(errors:string[]){ expect(errors,errors.join('\n')).toEqual([]); }

for(const locale of ['ko','en','ja'] as const){
  test(`${locale} weighted average and target`,async({page})=>{
    const runtime=watchRuntime(page);
    await page.goto(`/${locale}/stock-average-cost-calculator`);
    await expect(page.getByTestId('tool078-root')).toBeVisible();
    await expect(page.getByTestId('tool078-average-cost')).toContainText('9,333.33');
    await expect(page.getByTestId('tool078-total-shares')).toContainText('150');
    await expect(page.getByTestId('tool078-total-cost')).toContainText('1,400,000');
    await expect(page.getByTestId('tool078-target-sell')).toContainText('10,266.67');
    expectRuntimeClean(runtime);
  });
}

test('multi-buy add remove roundtrip',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/ko/stock-average-cost-calculator');
  await page.getByTestId('tool078-add-row').click();
  await page.getByTestId('tool078-row-2-qty').fill('100');
  await page.getByTestId('tool078-row-2-price').fill('12000');
  await expect(page.getByTestId('tool078-average-cost')).toContainText('10,400');
  await page.getByTestId('tool078-row-2-remove').click();
  await expect(page.getByTestId('tool078-average-cost')).toContainText('9,333.33');
  expectRuntimeClean(runtime);
});

test('error state survives and recovers',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/en/stock-average-cost-calculator');
  const root=page.getByTestId('tool078-root');
  const qty=page.getByTestId('tool078-existing-qty');
  await qty.fill('0');
  await expect(page.getByTestId('tool078-error')).toBeVisible();
  await expect(root).toBeVisible(); await expect(qty).toBeEditable();
  await expect(page.getByTestId('tool078-result')).toBeVisible();
  await qty.fill('100');
  await expect(page.getByTestId('tool078-error')).toHaveCount(0);
  await expect(page.getByTestId('tool078-average-cost')).toContainText('9,333.33');
  expectRuntimeClean(runtime);
});

test('target state transition and details actionability',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/en/stock-average-cost-calculator');
  await page.getByTestId('tool078-target-return').fill('20');
  await expect(page.getByTestId('tool078-target-sell')).toContainText('11,200');

  // Scope to the tool root so FAQ <details> elements cannot collide.
  const toolRoot=page.getByTestId('tool078-root');
  const details=toolRoot.locator('details');
  await expect(details).toHaveCount(1);
  await details.locator('summary').click();

  const precision=page.getByTestId('tool078-precision');
  await expect(precision).toBeVisible();
  await expect(precision).toBeEnabled();
  await precision.fill('4');
  expectRuntimeClean(runtime);
});
