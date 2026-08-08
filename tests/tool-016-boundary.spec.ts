import { test, expect } from '@playwright/test';
import { openTool016, upload016, TOOL016_TESTIDS } from './helpers/tool-016';

test.describe('016 boundary-only',()=>{
  test('rejects an unsupported file before editor activation',async({page})=>{
    await openTool016(page);
    await page.getByTestId(TOOL016_TESTIDS.fileInput).setInputFiles({name:'not-image.txt',mimeType:'text/plain',buffer:Buffer.from('not image')});
    await expect(page.getByTestId(TOOL016_TESTIDS.error)).toContainText('지원하지 않는 이미지 형식입니다.');
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toHaveCount(0);
  });
  test('keeps manual newlines and very narrow text width editable',async({page})=>{
    await upload016(page);await page.getByRole('button',{name:'본문 추가'}).click();
    const input=page.getByTestId(TOOL016_TESTIDS.content);await input.fill('첫째 줄\n둘째 줄\n\n넷째 줄');await input.blur();
    await page.getByTestId(TOOL016_TESTIDS.maxWidth).fill('20');
    await expect(input).toHaveValue('첫째 줄\n둘째 줄\n\n넷째 줄');
    await expect(page.getByTestId(TOOL016_TESTIDS.maxWidth)).toHaveValue('20');
  });
  test('font size never remains zero or negative',async({page})=>{
    await upload016(page);await page.getByRole('button',{name:'제목 추가'}).click();
    const size=page.getByTestId(TOOL016_TESTIDS.fontSize);await size.fill('-20');await expect(size).toHaveValue('8');
  });
  test('hidden layer remains in the list while becoming non-visible',async({page})=>{
    await upload016(page);await page.getByRole('button',{name:'제목 추가'}).click();
    await page.getByRole('button',{name:'숨기기'}).click();await expect(page.getByTestId('tool016-layer')).toHaveCount(1);await expect(page.getByRole('button',{name:'표시'})).toBeVisible();
  });
});
