import {test,expect} from '@playwright/test';
import {openTool023,upload023,TOOL023_TESTIDS} from './helpers/tool-023';

async function expectRejected(page:any,path:string,pattern:RegExp){
  await openTool023(page);
  await page.getByTestId(TOOL023_TESTIDS.fileInput).setInputFiles(path);
  const productAlert=page.getByTestId(TOOL023_TESTIDS.dropzone).getByRole('alert');
  await expect(productAlert).toHaveCount(1);
  await expect(productAlert).toContainText(pattern);
}

test('023 rejects empty input',async({page})=>{await expectRejected(page,'tests/fixtures/tool023/empty.png',/처리|process|画像/)});
test('023 rejects mime mismatch',async({page})=>{await expectRejected(page,'tests/fixtures/tool023/mime-mismatch.png',/일치|match|一致/)});
test('023 rejects corrupted PNG',async({page})=>{await expectRejected(page,'tests/fixtures/tool023/corrupted.png',/처리|process|画像/)});
test('023 rejects corrupted JPG',async({page})=>{await expectRejected(page,'tests/fixtures/tool023/corrupted.jpg',/처리|process|画像/)});
test('023 rejects files over 20MB before decode',async({page})=>{await expectRejected(page,'tests/fixtures/tool023/over-20mb.png',/20MB|20 MB/)});
test('023 accepts static WebP',async({page})=>{await upload023(page,'tests/fixtures/tool023/static.webp');await expect(page.getByTestId(TOOL023_TESTIDS.preview)).toBeVisible()});
test('023 accepts portrait source without stretching',async({page})=>{await upload023(page,'tests/fixtures/tool023/portrait.jpg');await expect(page.getByTestId(TOOL023_TESTIDS.status)).toContainText('300×500')});
test('023 accepts Korean filename',async({page})=>{await upload023(page,'tests/fixtures/tool023/한글-아이콘.png');await expect(page.getByTestId(TOOL023_TESTIDS.status)).toContainText('한글-아이콘.png')});
test('023 accepts Japanese filename',async({page})=>{await upload023(page,'tests/fixtures/tool023/日本語-アイコン.png');await expect(page.getByTestId(TOOL023_TESTIDS.status)).toContainText('日本語-アイコン.png')});
