import { test, expect } from "@playwright/test";
const MiB = 1024 * 1024;

test("030 approved candidate-A service limits are centralized and visible", async ({ page }) => {
  await page.goto("/ko/pdf-page-organizer");
  const dropzone = page.getByTestId("tool030-dropzone");
  await expect(dropzone).toContainText("50MB");
  await expect(dropzone).toContainText("원본 100페이지");
});

test("030 accepts exactly 100 source pages", async ({ page }) => {
  await page.goto("/en/pdf-page-organizer");
  await page.getByTestId("tool030-file-input").setInputFiles("test-fixtures/tool-030/exact-100-pages.pdf");
  await expect(page.getByTestId("tool030-page-card")).toHaveCount(100);
});

test("030 rejects 101 source pages", async ({ page }) => {
  await page.goto("/en/pdf-page-organizer");
  await page.getByTestId("tool030-file-input").setInputFiles("test-fixtures/tool-030/over-100-pages.pdf");
  await expect(page.getByTestId("tool030-error")).toContainText("100");
});

test("030 rejects metadata size 50MiB + 1 before parsing", async ({ page }) => {
  await page.goto("/en/pdf-page-organizer");
  await page.getByTestId("tool030-file-input").evaluate((input, size) => {
    const file = new File([new Uint8Array(32)], "too-large.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: size });
    const dt = new DataTransfer(); dt.items.add(file);
    const el = input as HTMLInputElement; el.files = dt.files; el.dispatchEvent(new Event("change", { bubbles: true }));
  }, 50 * MiB + 1);
  await expect(page.getByTestId("tool030-error")).toContainText("50MB");
});
