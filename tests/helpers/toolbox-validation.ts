import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";
import path from "node:path";

export const fixturePath = (name: string) => path.join(process.cwd(), "public", "test-fixtures", name);

export async function assertNoPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return async () => expect(errors, errors.join("\n")).toEqual([]);
}

export async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

export async function attachScreenshot(page: Page, testInfo: TestInfo, name: string) {
  const file = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await testInfo.attach(name, { path: file, contentType: "image/png" });
}

export async function uploadCompressorFixture(page: Page, fileName: string) {
  await page.getByTestId("compressor-file-input").setInputFiles(fixturePath(fileName));
  const card = page.getByTestId("compressor-file-card").last();
  await expect(card).toBeVisible();
  return card;
}

export async function runCompressor(page: Page) {
  await page.getByTestId("compressor-run").click();
  const card = page.getByTestId("compressor-file-card").last();
  await expect(card).toHaveAttribute("data-status", /done|kept|failed|excluded|cancelled/, { timeout: 120_000 });
  return card;
}

export async function resetCompressor(page: Page) {
  await page.getByTestId("compressor-reset").click();
  await expect(page.getByTestId("compressor-file-card")).toHaveCount(0, { timeout: 10_000 });
}

export async function cardNumbers(card: Locator) {
  return card.evaluate((element) => ({
    originalSize: Number(element.getAttribute("data-original-size") || 0),
    resultSize: Number(element.getAttribute("data-result-size") || 0),
    width: Number(element.getAttribute("data-width") || 0),
    height: Number(element.getAttribute("data-height") || 0),
    orientation: Number(element.getAttribute("data-orientation") || 1),
    resultName: element.getAttribute("data-result-name") || "",
    status: element.getAttribute("data-status") || "",
    format: element.getAttribute("data-format") || "",
  }));
}
