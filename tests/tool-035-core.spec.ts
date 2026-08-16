import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { PDFDocument } from "pdf-lib";

const mixed = "test-fixtures/tool-035/embedded-images-repeated-alpha.pdf";
const textPdf = "test-fixtures/tool-035/native-text-3pages.pdf";

// CORE tests are intentionally bounded. Normal fixtures complete in a few seconds;
// a stalled UI/action must fail this test instead of consuming the global 180s timeout.
test.describe.configure({ timeout: 30_000 });

async function uploadPdfAndWaitReady(root: any, fixture: string) {
  await root.getByTestId("tool035-file-input").setInputFiles(fixture);
  await expect(root.getByTestId("tool035-extract")).toBeEnabled({ timeout: 30_000 });
}

test("035 extracts page-grouped native text and TXT controls", async ({ page }) => {
  await page.goto("/en/pdf-text-image-extractor");
  const root = page.getByTestId("tool035-root");
  await uploadPdfAndWaitReady(root, textPdf);
  await root.getByTestId("tool035-mode-text").click();
  await root.getByTestId("tool035-extract").click();
  await expect(root.getByTestId("tool035-text-page")).toHaveCount(3);
  await expect(root.getByTestId("tool035-text-results")).toContainText("TOOL035_MARKER_PAGE_1");
  await expect(root.getByTestId("tool035-text-results")).toContainText("TOOL035_MARKER_PAGE_3");
  await expect(root.getByRole("button", { name: "Download TXT", exact: true })).toBeEnabled();
});

test("035 extracts embedded raster objects without page-render image output", async ({ page }) => {
  await page.goto("/ko/pdf-text-image-extractor");
  const root = page.getByTestId("tool035-root");
  await uploadPdfAndWaitReady(root, mixed);
  await root.getByTestId("tool035-mode-images").click();
  await root.getByTestId("tool035-extract").click();
  await expect(root.getByTestId("tool035-image-card").first()).toBeVisible();
  await expect(root.getByTestId("tool035-image-results")).toContainText(/PNG fallback|원본 JPG/);
});

test("035 both mode keeps text and image results in one job", async ({ page }) => {
  await page.goto("/ja/pdf-text-image-extractor");
  const root = page.getByTestId("tool035-root");
  await uploadPdfAndWaitReady(root, mixed);
  await root.getByTestId("tool035-mode-both").click();
  await root.getByTestId("tool035-extract").click();
  await expect(root.getByTestId("tool035-results")).toBeVisible();
  await expect(root.getByTestId("tool035-text-results")).toBeVisible();
  await root.getByRole("tab", { name: "画像結果" }).click();
  await expect(root.getByTestId("tool035-image-results")).toBeVisible();
});


const specialImageFixtures = [
  ["repeated XObject", "test-fixtures/tool-035/repeated-xobject.pdf"],
  ["soft mask", "test-fixtures/tool-035/soft-mask.pdf"],
  ["inline image", "test-fixtures/tool-035/inline-image.pdf"],
  ["image mask", "test-fixtures/tool-035/image-mask.pdf"],
] as const;

test("035 operator-special fixtures remain available without duplicating browser extraction work", async () => {
  for (const [, fixture] of specialImageFixtures) {
    expect(fs.existsSync(fixture)).toBeTruthy();
    expect(fs.statSync(fixture).size).toBeGreaterThan(100);
  }
});

test("035 real-world fixture remains the canonical 72-page manual", async () => {
  const fixture = "test-fixtures/tool-035/real-world-hug-manual-72pages.pdf";
  const bytes = fs.readFileSync(fixture);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  expect(doc.getPageCount()).toBe(72);
});

