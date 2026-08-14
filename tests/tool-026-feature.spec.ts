import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

async function addFixtureFiles(page: Page, paths: string[]) {
  const input = page.getByTestId("tool026-file-input");
  const mobileStable = (await input.getAttribute("data-mobile-stable-input")) === "android-chrome";
  if (!mobileStable) {
    await input.setInputFiles(paths);
    return;
  }
  for (let i = 0; i < paths.length; i++) {
    await input.setInputFiles(paths[i]);
    await expect(page.getByTestId("tool026-count")).toHaveText(`${i + 1} / 20`);
  }
}

test("026 multi-image order, Letter landscape, and real PDF download", async ({ page }, testInfo) => {
  await page.goto("/ko/image-to-pdf");
  await addFixtureFiles(page, [
    "test-fixtures/tool-026/sample.jpg",
    "test-fixtures/tool-026/transparent.png",
  ]);
  await expect(page.getByTestId("tool026-item")).toHaveCount(2);
  await expect(page.getByTestId("tool026-count")).toHaveText("2 / 20");

  const namesBefore = await page.getByTestId("tool026-item").locator("strong").allTextContents();
  const second = page.getByTestId("tool026-item").nth(1);
  await second.getByRole("button", { name: /first$/ }).click();
  const namesAfter = await page.getByTestId("tool026-item").locator("strong").allTextContents();
  expect(namesAfter[0]).not.toBe(namesBefore[0]);

  await page.getByTestId("tool026-page-size").selectOption("letter");
  await page.getByTestId("tool026-orientation").selectOption("landscape");
  await page.getByTestId("tool026-margin-number").fill("10");
  await page.getByTestId("tool026-filename").fill("tool026-feature");
  await page.getByTestId("tool026-create").click();
  await expect(page.getByTestId("tool026-result")).toBeVisible();
  await expect(page.getByTestId("tool026-result-meta")).toContainText("2 페이지");

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("tool026-download").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("tool026-feature.pdf");
  const out = testInfo.outputPath("tool026-feature.pdf");
  await download.saveAs(out);
  const buf = fs.readFileSync(out);
  expect(buf.subarray(0, 8).toString("latin1")).toContain("%PDF-1.4");
  const text = buf.toString("latin1");
  expect(text).toContain("/Count 2");
  expect(text).toContain("/MediaBox [0 0 792.0000 612.0000]");
  expect(text).toContain("/DCTDecode");
});

test("026 reset all restores initial state", async ({ page }) => {
  await page.goto("/ja/image-to-pdf");
  await page.getByTestId("tool026-file-input").setInputFiles("test-fixtures/tool-026/sample.jpg");
  await page.getByTestId("tool026-page-size").selectOption("letter");
  await page.getByTestId("tool026-orientation").selectOption("landscape");
  await page.getByTestId("tool026-margin-number").fill("20");
  await page.getByTestId("tool026-reset-all").click();
  await expect(page.getByTestId("tool026-count")).toHaveText("0 / 20");
  await expect(page.getByTestId("tool026-workspace-dropzone")).toHaveCount(0);

  // The settings panel is intentionally hidden in the empty initial state.
  // Re-enter the workspace and verify that reset restored the defaults.
  await page.getByTestId("tool026-file-input").setInputFiles("test-fixtures/tool-026/sample.jpg");
  await expect(page.getByTestId("tool026-page-size")).toHaveValue("a4");
  await expect(page.getByTestId("tool026-orientation")).toHaveValue("auto");
  await expect(page.getByTestId("tool026-margin-number")).toHaveValue("10");
});
