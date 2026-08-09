import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {revealTool020Editor,TOOL020_PREVIEW_MODES,TOOL020_TESTIDS,tool020Root} from './helpers/tool-020';

test.describe('020 core-only',()=>{
  test('blank banner exposes preview modes and editable title',async({page})=>{
    const root=await revealTool020Editor(page,'blank');
    const canvas=root.getByTestId(TOOL020_TESTIDS.preview);
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('width','1280');
    await expect(canvas).toHaveAttribute('height','720');
    for(const mode of TOOL020_PREVIEW_MODES){await root.getByTestId(`tool020-preview-${mode}`).click()}
    await root.getByTestId(TOOL020_TESTIDS.title).fill('FIXLGS TOOLBOX');
    await expect(root.getByTestId(TOOL020_TESTIDS.title)).toHaveValue('FIXLGS TOOLBOX');
    await expect(root.getByTestId(TOOL020_TESTIDS.download)).toBeEnabled();
  });

  test('background upload reaches editor state without relying on input order',async({page})=>{
    const root=await revealTool020Editor(page,'background');
    await expect(root.getByTestId(TOOL020_TESTIDS.preview)).toBeVisible();
    await expect(root.getByTestId(TOOL020_TESTIDS.bgZoom)).toBeVisible();
  });

  test('PNG download is actual 2560x1440',async({page},testInfo)=>{
    const root=await revealTool020Editor(page,'blank');
    await root.getByLabel(/파일 형식|File Format|ファイル形式/).selectOption('png');
    const waiting=page.waitForEvent('download');
    await root.getByTestId(TOOL020_TESTIDS.download).click();
    const download=await waiting;
    const out=testInfo.outputPath('tool020.png');
    await download.saveAs(out);
    const bytes=await readFile(out);
    expect(bytes.subarray(1,4).toString()).toBe('PNG');
    expect(bytes.readUInt32BE(16)).toBe(2560);
    expect(bytes.readUInt32BE(20)).toBe(1440);
  });
});
