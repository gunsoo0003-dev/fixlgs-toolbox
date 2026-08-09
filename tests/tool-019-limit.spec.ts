import {test,expect} from '@playwright/test';
import {openTool019,tool019Root} from './helpers/tool-019';
import {TOOL019_SERVICE_LIMITS,validateTool019FileBytes,validateTool019ImageDimensions} from '../lib/tool-019-service-limits';

test.describe('019 limit-only',()=>{
 test('service limit metadata matches independent expected values',async({page})=>{await openTool019(page);const root=page.getByTestId('tool019-root');expect(Number(await root.getAttribute('data-max-file-bytes'))).toBe(20*1024*1024);expect(Number(await root.getAttribute('data-max-pixels'))).toBe(40_000_000);});
 test('file bytes before/candidate/over',()=>{const m=20*1024*1024;expect(validateTool019FileBytes(m-1)).toBeTruthy();expect(validateTool019FileBytes(m)).toBeTruthy();expect(validateTool019FileBytes(m+1)).toBeFalsy();});
 test('max side before/candidate/over',()=>{expect(validateTool019ImageDimensions(9999,1)).toBeTruthy();expect(validateTool019ImageDimensions(10000,1)).toBeTruthy();expect(validateTool019ImageDimensions(10001,1)).toBeFalsy();});
 test('40MP before/candidate/over',()=>{expect(validateTool019ImageDimensions(4000,9999)).toBeTruthy();expect(validateTool019ImageDimensions(4000,10000)).toBeTruthy();expect(validateTool019ImageDimensions(4001,10000)).toBeFalsy();});
 test('title 120 and subtitle 200 limits',async({page})=>{await openTool019(page);await tool019Root(page).getByRole('button',{name:/단색 배경/}).click();const title=page.getByTestId('tool019-title-text'),sub=page.getByTestId('tool019-subtitle-text');await title.fill('가'.repeat(121));await expect(title).toHaveValue('가'.repeat(120));await sub.fill('나'.repeat(201));await expect(sub).toHaveValue('나'.repeat(200));});
 test('declared candidates retain expected values',()=>{expect(TOOL019_SERVICE_LIMITS.maxPixels).toBe(40_000_000);expect(TOOL019_SERVICE_LIMITS.candidateMaxPixels).toBe(48_000_000);expect(TOOL019_SERVICE_LIMITS.maxTitleChars).toBe(120);expect(TOOL019_SERVICE_LIMITS.maxSubtitleChars).toBe(200);expect(TOOL019_SERVICE_LIMITS.maxHistory).toBeLessThanOrEqual(30);});
});
