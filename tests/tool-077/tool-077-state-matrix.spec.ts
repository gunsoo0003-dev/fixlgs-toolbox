import {test,expect} from '@playwright/test';

function watchRuntime(page:any){
  const errors:string[]=[];
  page.on('pageerror',(e:any)=>errors.push(`pageerror:${e.message}`));
  page.on('console',(m:any)=>{ if(m.type()==='error') errors.push(`console:${m.text()}`); });
  return errors;
}
function expectRuntimeClean(errors:string[]){ expect(errors,errors.join('\n')).toEqual([]); }


for(const locale of ['ko','en','ja'] as const){
  test(`${locale} normal result survives`,async({page})=>{
    const runtime=watchRuntime(page);
    await page.goto(`/${locale}/investment-return-calculator`);
    const root=page.getByTestId('tool077-root');
    await expect(root).toBeVisible();
    await page.getByTestId('tool077-purchase').fill('10000000');
    await page.getByTestId('tool077-current').fill('13000000');
    await page.getByTestId('tool077-period').fill('2');
    await page.getByTestId('tool077-period-unit').selectOption('years');
    await expect(page.getByTestId('tool077-total-return')).toContainText('30');
    await expect(page.getByTestId('tool077-annualized-return')).toContainText('14.02');
    await expect(root).toBeVisible();
    expectRuntimeClean(runtime);
  });
}

test('error state survives and recovers',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/ko/investment-return-calculator');
  const root=page.getByTestId('tool077-root');
  const purchase=page.getByTestId('tool077-purchase');
  const current=page.getByTestId('tool077-current');
  const period=page.getByTestId('tool077-period');
  await purchase.fill('0'); await current.fill('13000000'); await period.fill('2');
  await expect(page.getByTestId('tool077-error')).toBeVisible();
  await expect(root).toBeVisible(); await expect(purchase).toBeEditable();
  await purchase.fill('10000000');
  await expect(page.getByTestId('tool077-error')).toHaveCount(0);
  await expect(page.getByTestId('tool077-total-return')).toContainText('30');
  expectRuntimeClean(runtime);
});

test('boundary and state transition',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/en/investment-return-calculator');
  await page.getByTestId('tool077-purchase').fill('100');
  await page.getByTestId('tool077-current').fill('80');
  await page.getByTestId('tool077-period').fill('1');
  await expect(page.getByTestId('tool077-state')).toHaveText('Loss');
  await page.getByTestId('tool077-current').fill('100');
  await expect(page.getByTestId('tool077-state')).toHaveText('No change');
  await page.getByTestId('tool077-current').fill('120');
  await expect(page.getByTestId('tool077-state')).toHaveText('Gain');
  expectRuntimeClean(runtime);
});

test('details controls open then actionable',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/en/investment-return-calculator');
  const details=page.locator('details').filter({has:page.getByText('Investment A/B comparison',{exact:true})});
  await details.locator('summary').click();
  const precision=page.getByTestId('tool077-precision');
  await expect(precision).toBeVisible();
  await expect(precision).toBeEnabled();
  await precision.fill('4');
  await page.getByTestId('tool077-compare-a-purchase').fill('100');
  await page.getByTestId('tool077-compare-a-current').fill('121');
  await page.getByTestId('tool077-compare-a-period').fill('2');
  await expect(page.getByTestId('tool077-compare-a-result')).toContainText('%');
  expectRuntimeClean(runtime);
});
