import { test, expect } from "@playwright/test";

const mixed = "test-fixtures/tool-035/embedded-images-repeated-alpha.pdf";

// FEATURE may exercise a full extraction once, but no individual UI contract may
// consume the global 180s timeout.
test.describe.configure({ timeout: 60_000 });

async function uploadPdfAndWaitReady(root: any, fixture: string) {
  await root.getByTestId("tool035-file-input").setInputFiles(fixture);
  await expect(root.getByTestId("tool035-extract")).toBeEnabled({ timeout: 30_000 });
}

async function selectRadioByTestId(root: any, testId: string) {
  const radio = root.getByTestId(testId);
  await radio.evaluate((element: HTMLElement) => element.click());
  await expect(radio).toBeChecked();
}

test("035 custom page range processes only requested pages", async ({ page }) => {
  await page.goto("/ko/pdf-text-image-extractor");
  const root = page.getByTestId("tool035-root");
  await uploadPdfAndWaitReady(root, "test-fixtures/tool-035/native-text-3pages.pdf");
  await root.getByRole("button", { name: "사용자 지정", exact: true }).click();
  await root.getByTestId("tool035-range-input").fill("1,3");
  await root.getByRole("button", { name: "범위 적용", exact: true }).click();
  await root.getByTestId("tool035-mode-text").click();
  await root.getByTestId("tool035-extract").click();
  await expect(root.getByTestId("tool035-text-page")).toHaveCount(2);
});

test("035 exclusion filter defaults to basic and supports 3 presets plus custom", async ({ page }) => {
  await page.goto("/en/pdf-text-image-extractor");
  const root = page.getByTestId("tool035-root");
  await uploadPdfAndWaitReady(root, mixed);
  await root.getByTestId("tool035-mode-images").click();

  await expect(root.getByTestId("tool035-filter-basic")).toBeChecked();
  await expect(root.getByTestId("tool035-filter-level1")).not.toBeChecked();
  await expect(root.getByTestId("tool035-filter-level2")).not.toBeChecked();
  await expect(root.getByTestId("tool035-filter-level3")).not.toBeChecked();
  await expect(root.getByTestId("tool035-filter-custom")).not.toBeChecked();
  await expect(root.getByTestId("tool035-filter-custom-size")).toHaveCount(0);

  await root.getByTestId("tool035-extract").click();
  await expect(root.getByTestId("tool035-results")).toBeVisible({ timeout: 20_000 });
  await expect(root.getByTestId("tool035-image-card").first()).toBeVisible({ timeout: 20_000 });
  const basicCount = await root.getByTestId("tool035-image-card").count();
  expect(basicCount).toBeGreaterThan(0);

  // Image-view policy belongs to FEATURE, and reuses the extraction above instead
  // of uploading/extracting the same fixture again in CORE.
  await expect(root.getByTestId("tool035-image-view-major")).toBeChecked();
  const majorVisible = Number(await root.getByTestId("tool035-stat-visible").textContent() || "0");
  await selectRadioByTestId(root, "tool035-image-view-all");
  const allVisible = Number(await root.getByTestId("tool035-stat-visible").textContent() || "0");
  expect(allVisible).toBeGreaterThanOrEqual(majorVisible);
  await selectRadioByTestId(root, "tool035-image-view-major");

  await selectRadioByTestId(root, "tool035-filter-level1");
  const level1Count = await root.getByTestId("tool035-image-card").count();
  expect(level1Count).toBeLessThanOrEqual(basicCount);

  await selectRadioByTestId(root, "tool035-filter-level2");
  const level2Count = await root.getByTestId("tool035-image-card").count();
  expect(level2Count).toBeLessThanOrEqual(level1Count);

  await selectRadioByTestId(root, "tool035-filter-level3");
  const level3Count = await root.getByTestId("tool035-image-card").count();
  expect(level3Count).toBeLessThanOrEqual(level2Count);

  await selectRadioByTestId(root, "tool035-filter-custom");
  await expect(root.getByTestId("tool035-filter-custom-size")).toBeVisible();
  await root.getByTestId("tool035-filter-custom-size").fill("64");
  const customCount = await root.getByTestId("tool035-image-card").count();
  expect(customCount).toBeLessThanOrEqual(basicCount);

  await expect(root.getByLabel("Hide duplicate images")).toHaveCount(0);
});

test("035 repeated extraction keeps the selected PDF and replaces stale results", async ({ page }) => {
  await page.goto("/en/pdf-text-image-extractor");
  const root = page.getByTestId("tool035-root");
  await uploadPdfAndWaitReady(root, mixed);
  await root.getByTestId("tool035-mode-text").click();
  await root.getByTestId("tool035-extract").click();
  await expect(root.getByTestId("tool035-text-page")).toHaveCount(3);
  await root.getByTestId("tool035-mode-images").click();
  await root.getByTestId("tool035-extract").click();
  await expect(root.getByTestId("tool035-image-results")).toBeVisible();
  await expect(root.getByTestId("tool035-file-info")).toContainText("embedded-images-repeated-alpha.pdf");
});


test("035 72-page picker exposes the final page without an internal capped viewport", async ({ page }) => {
  await page.goto("/ko/pdf-text-image-extractor");
  const root = page.getByTestId("tool035-root");
  await uploadPdfAndWaitReady(root, "test-fixtures/tool-035/real-world-hug-manual-72pages.pdf");
  await root.getByRole("button", { name: "선택", exact: true }).click();
  await expect(root.getByTestId("tool035-page-72")).toBeVisible();
  await expect(root.getByLabel("페이지 72")).toBeChecked();
});
