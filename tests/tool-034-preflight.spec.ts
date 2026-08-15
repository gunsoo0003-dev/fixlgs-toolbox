import {expect,test} from '@playwright/test';import {route034} from './helpers/tool-034';
test('034 route and initial selector contract',async({page})=>{await page.goto(route034());await expect(page.getByTestId('tool034-root')).toBeVisible();await expect(page.getByTestId('tool034-file-input')).toHaveCount(1);await expect(page.getByTestId('tool034-dropzone')).toBeVisible();});
