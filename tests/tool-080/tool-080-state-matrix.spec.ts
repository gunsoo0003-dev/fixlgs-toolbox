import {test,expect} from '@playwright/test';

function watchRuntime(page:any){
  const errors:string[]=[];
  page.on('pageerror',(e:any)=>errors.push(`pageerror:${e.message}`));
  page.on('console',(m:any)=>{ if(m.type()==='error') errors.push(`console:${m.text()}`); });
  return errors;
}
function expectRuntimeClean(errors:string[]){ expect(errors,errors.join('\n')).toEqual([]); }


for(const locale of ['ko','en','ja'] as const){
  test(`${locale} default rental result`,async({page})=>{
    const runtime=watchRuntime(page);
    await page.goto(`/${locale}/rental-yield-calculator`);
    await expect(page.getByTestId('tool080-root')).toBeVisible();
    await expect(page.getByTestId('tool080-gross')).toContainText('6');
    await expect(page.getByTestId('tool080-net')).toContainText('5.2');
    await expect(page.getByTestId('tool080-capital')).toContainText('150,000,000');
    expectRuntimeClean(runtime);
  });
}

test('deposit error survives and recovers',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/en/rental-yield-calculator');
  const root=page.getByTestId('tool080-root');
  const deposit=page.getByTestId('tool080-deposit');
  await deposit.fill('200000000');
  await expect(page.getByTestId('tool080-error')).toBeVisible();
  await expect(root).toBeVisible(); await expect(deposit).toBeEditable();
  await expect(page.getByTestId('tool080-gross')).toBeVisible();
  await expect(page.getByTestId('tool080-net')).toBeVisible();
  await deposit.fill('50000000');
  await expect(page.getByTestId('tool080-error')).toHaveCount(0);
  await expect(page.getByTestId('tool080-net')).toContainText('5.2');
  expectRuntimeClean(runtime);
});

test('monthly annual interest transition',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/en/rental-yield-calculator');
  const unit=page.getByTestId('tool080-interest-unit');
  await unit.selectOption('monthly');
  await page.getByTestId('tool080-interest').fill('250000');
  await expect(page.getByTestId('tool080-annual-interest')).toContainText('3,000,000');
  await unit.selectOption('annual');
  await expect(page.getByTestId('tool080-annual-interest')).toContainText('250,000');
  expectRuntimeClean(runtime);
});

test('boundary negative input keeps DOM alive',async({page})=>{
  const runtime=watchRuntime(page);
  await page.goto('/en/rental-yield-calculator');
  const purchase=page.getByTestId('tool080-purchase');
  await purchase.fill('-1');
  await expect(page.getByTestId('tool080-error')).toBeVisible();
  await expect(page.getByTestId('tool080-root')).toBeVisible();
  await expect(purchase).toBeEditable();
  expectRuntimeClean(runtime);
});
