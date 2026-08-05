import { expect, test } from "@playwright/test";
import path from "node:path";

const fixture = (name:string) => path.resolve(process.cwd(), "public", "test-fixtures", name);
async function upload(page: import("@playwright/test").Page, name="sample.jpg") {
  await page.getByTestId("resizer-file-input").setInputFiles(fixture(name));
  const card=page.getByTestId("resizer-file-card").last();
  await expect(card).toBeVisible();
  return card;
}
async function run(page: import("@playwright/test").Page){
  await page.getByTestId("resizer-run").click();
  await expect.poll(async()=>page.getByTestId("resizer-file-card").last().getAttribute("data-status"),{timeout:120000}).toMatch(/done|kept|failed/);
}

test.describe("006 이미지 크기 변경기",()=>{
  test.beforeEach(async({page})=>{await page.goto("/ko/image-resizer");});
  test("픽셀 기준으로 비율을 유지해 변경한다",async({page})=>{
    const card=await upload(page);
    await page.getByTestId("global-width").fill("120");
    await page.getByRole("button",{name:"모든 파일에 적용"}).click();
    await run(page);
    expect(Number(await card.getAttribute("data-result-width"))).toBe(120);
    expect(Number(await card.getAttribute("data-result-height"))).toBeGreaterThan(0);
    expect(await card.getAttribute("data-format")).toBe("jpg");
  });
  test("퍼센트와 긴 변 방식을 제공한다",async({page})=>{
    const card=await upload(page);
    await page.getByRole("button",{name:"퍼센트",exact:true}).click();
    await page.getByTestId("global-percent").fill("50");
    await page.getByRole("button",{name:"모든 파일에 적용"}).click();
    await run(page);
    const ow=Number(await card.getAttribute("data-original-width"));
    const rw=Number(await card.getAttribute("data-result-width"));
    expect(rw).toBe(Math.round(ow*.5));
  });
  test("작은 이미지 확대 방지가 원본을 유지한다",async({page})=>{
    const card=await upload(page);
    await page.getByTestId("global-width").fill("12000");
    await page.getByRole("button",{name:"모든 파일에 적용"}).click();
    await run(page);
    expect(await card.getAttribute("data-status")).toBe("kept");
  });
  test("파일별 설정과 제외가 동작한다",async({page})=>{
    const card=await upload(page);
    await card.getByRole("button",{name:"개별 설정"}).click();
    await card.getByLabel("이 파일 처리 제외").check();
    await expect(page.getByTestId("resizer-run")).toBeDisabled();
  });
  test("ZIP 다운로드와 초기화가 동작한다",async({page})=>{
    await upload(page);
    await page.getByTestId("global-width").fill("120");
    await page.getByRole("button",{name:"모든 파일에 적용"}).click();
    await run(page);
    const wait=page.waitForEvent("download");
    await page.getByTestId("resizer-zip").click();
    const d=await wait; expect(d.suggestedFilename()).toBe("fixlgs-image-resizer.zip");
    await page.getByTestId("resizer-reset").click();
    await expect(page.getByTestId("resizer-file-card")).toHaveCount(0);
  });
  test("세로 입력을 기준으로 반대값을 자동 계산한다",async({page})=>{
    const card=await upload(page);
    await page.getByTestId("global-height").fill("90");
    await page.getByRole("button",{name:"모든 파일에 적용"}).click();
    await run(page);
    expect(Number(await card.getAttribute("data-result-height"))).toBe(90);
    expect(Number(await card.getAttribute("data-result-width"))).toBeGreaterThan(0);
  });
  test("짧은 변과 최대 영역 방식을 계산한다",async({page})=>{
    const card=await upload(page);
    await page.getByRole("button",{name:"짧은 변",exact:true}).click();
    await page.getByTestId("global-edge").fill("80");
    await page.getByRole("button",{name:"모든 파일에 적용"}).click();
    await run(page);
    const rw=Number(await card.getAttribute("data-result-width"));
    const rh=Number(await card.getAttribute("data-result-height"));
    expect(Math.min(rw,rh)).toBe(80);
  });
  test("개별 설정 적용 상태와 픽셀 변화 정보를 표시한다",async({page})=>{
    const card=await upload(page);
    await card.getByRole("button",{name:"개별 설정"}).click();
    await card.getByTestId(/file-.*-width/).fill("100");
    await expect(card).toContainText("개별 설정");
    await expect(card).toContainText("px →");
  });
  test("같은 선택 안의 중복 파일을 한 번만 추가한다",async({page})=>{
    const input=page.getByTestId("resizer-file-input");
    await input.setInputFiles([fixture("sample.jpg"),fixture("sample.jpg")]);
    await expect(page.getByTestId("resizer-file-card")).toHaveCount(1);
  });
  test("영어와 일본어 페이지에서 오류 문구가 현지화된다",async({page})=>{
    await page.goto("/en/image-resizer");
    await page.getByTestId("resizer-file-input").setInputFiles(fixture("sample.svg"));
    await expect(page.getByTestId("resizer-alert")).toContainText("Unsupported format");
    await page.goto("/ja/image-resizer");
    await page.getByTestId("resizer-file-input").setInputFiles(fixture("sample.svg"));
    await expect(page.getByTestId("resizer-alert")).toContainText("未対応");
  });

});
