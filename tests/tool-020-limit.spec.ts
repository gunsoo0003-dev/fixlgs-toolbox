import {test,expect} from '@playwright/test';
import {TOOL020_SERVICE_LIMITS,validateImageFile} from '../lib/tool-020-youtube-banner';
import {revealTool020Editor,TOOL020_TESTIDS} from './helpers/tool-020';

test.describe('020 limit-only',()=>{
  test('declared general-user service limits remain fixed',()=>{
    expect(TOOL020_SERVICE_LIMITS.backgroundCount).toBe(1);
    expect(TOOL020_SERVICE_LIMITS.logoCount).toBe(1);
    expect(TOOL020_SERVICE_LIMITS.backgroundMaxBytes).toBe(20*1024*1024);
    expect(TOOL020_SERVICE_LIMITS.logoMaxBytes).toBe(5*1024*1024);
    expect(TOOL020_SERVICE_LIMITS.maxSourcePixels).toBe(40_000_000);
    expect(TOOL020_SERVICE_LIMITS.maxTitleChars).toBe(120);
    expect(TOOL020_SERVICE_LIMITS.maxHistoryStates).toBeLessThanOrEqual(24);
  });

  test('file-byte before/candidate/over boundaries are independent of DOM',()=>{
    const make=(size:number,role:'background'|'logo')=>new File([new Uint8Array(size)],role==='background'?'probe.jpg':'probe.png',{type:role==='background'?'image/jpeg':'image/png'});
    const bg=TOOL020_SERVICE_LIMITS.backgroundMaxBytes;
    expect(validateImageFile(make(bg-1,'background'),'background').ok).toBeTruthy();
    expect(validateImageFile(make(bg,'background'),'background').ok).toBeTruthy();
    expect(validateImageFile(make(bg+1,'background'),'background').ok).toBeFalsy();
    const logo=TOOL020_SERVICE_LIMITS.logoMaxBytes;
    expect(validateImageFile(make(logo-1,'logo'),'logo').ok).toBeTruthy();
    expect(validateImageFile(make(logo,'logo'),'logo').ok).toBeTruthy();
    expect(validateImageFile(make(logo+1,'logo'),'logo').ok).toBeFalsy();
  });

  test('title service limit is 120 characters in ready DOM',async({page})=>{
    const root=await revealTool020Editor(page,'blank');
    const title=root.getByTestId(TOOL020_TESTIDS.title);
    await title.fill('가'.repeat(140));
    await expect(title).toHaveValue('가'.repeat(120));
  });
});
