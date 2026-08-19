import {test,expect} from '@playwright/test';

test('TOOL054 presets keyboard fullscreen copy hooks',async({page})=>{
 const runtimeErrors:string[]=[];
 page.on('pageerror',error=>runtimeErrors.push(error.message));
 await page.goto('/ko/timer-stopwatch');
 await page.getByTestId('tool054-preset-60').click();
 await expect(page.getByTestId('tool054-clock')).toHaveText('00:01:00');
 await page.keyboard.press('Space');
 await expect(page.getByTestId('tool054-state')).toContainText('진행');
 await page.keyboard.press('Space');
 await page.getByTestId('tool054-copy').click();
 await expect(page.getByTestId('tool054-copy-status')).toBeVisible();
 expect(runtimeErrors.filter(message=>/clipboard|NotAllowedError|writeText/i.test(message))).toEqual([]);
 await expect(page.getByTestId('tool054-fullscreen')).toBeVisible();
});
