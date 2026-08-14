import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

const MiB = 1024 * 1024;
const sampleBytes = Array.from(fs.readFileSync("test-fixtures/tool-026/sample.jpg"));
type Payload = { name: string; type: string; bytes: number[]; originalSize?: number };

async function isMobileStable(page: Page) {
  return (await page.getByTestId("tool026-file-input").getAttribute("data-mobile-stable-input")) === "android-chrome";
}

async function dispatchBatch(page: Page, payloads: Payload[], padToOriginalSize: boolean) {
  await page.getByTestId("tool026-file-input").evaluate((input, arg) => {
    const { items, pad } = arg as { items: Payload[]; pad: boolean };
    const dt = new DataTransfer();
    for (const item of items) {
      const base = new Uint8Array(item.bytes);
      const parts: BlobPart[] = [base];
      if (pad && typeof item.originalSize === "number" && item.originalSize > base.byteLength) {
        parts.push(new Uint8Array(item.originalSize - base.byteLength));
      }
      const file = new File(parts, item.name, { type: item.type, lastModified: Date.now() });
      if (!pad && typeof item.originalSize === "number") {
        Object.defineProperty(file, "__stableMobileOriginalInfo", {
          value: { name: file.name, size: item.originalSize, type: file.type, lastModified: file.lastModified },
          configurable: true,
        });
      }
      dt.items.add(file);
    }
    const el = input as HTMLInputElement;
    el.files = dt.files;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, { items: payloads, pad: padToOriginalSize });
}

async function dispatchFiles(page: Page, payloads: Payload[]) {
  if (!(await isMobileStable(page))) {
    await dispatchBatch(page, payloads, false);
    return;
  }
  // Android Chrome stable input intentionally accepts one native picker file at a time.
  // Feed synthetic files sequentially so viewport tests mirror that product contract.
  for (const payload of payloads) {
    await dispatchBatch(page, [payload], true);
  }
}

async function addRepeatedFixture(page: Page, count: number) {
  const input = page.getByTestId("tool026-file-input");
  if (!(await isMobileStable(page))) {
    await input.setInputFiles(Array.from({ length: count }, () => "test-fixtures/tool-026/sample.jpg"));
    return;
  }
  for (let i = 0; i < count; i++) {
    await input.setInputFiles("test-fixtures/tool-026/sample.jpg");
    await expect(page.getByTestId("tool026-count")).toHaveText(`${i + 1} / 20`);
  }
}

test("026 centralized service-limit contract is visible in the live product", async ({ page }) => {
  await page.goto("/ko/image-to-pdf");
  const root = page.getByTestId("tool026-root");
  await expect(root).toHaveAttribute("data-max-files", "20");
  await expect(root).toHaveAttribute("data-max-file-bytes", String(15 * MiB));
  await expect(root).toHaveAttribute("data-max-total-bytes", String(80 * MiB));
  await expect(root).toHaveAttribute("data-max-pixels", "24000000");
  await expect(root).toHaveAttribute("data-max-margin-mm", "50");
  await expect(page.getByTestId("tool026-count")).toHaveText("0 / 20");
  await expect(page.getByTestId("tool026-total")).toContainText("/ 80 MB");
  await expect(page.getByText(/파일당 15MB/)).toBeVisible();
  await expect(page.getByText(/이미지당 24MP/)).toBeVisible();
});

test("026 accepts exactly 20 images and rejects 21", async ({ page }) => {
  await page.goto("/ko/image-to-pdf");
  const mobileStable = await isMobileStable(page);
  await addRepeatedFixture(page, 20);
  await expect(page.getByTestId("tool026-count")).toHaveText("20 / 20");

  if (mobileStable) {
    await page.getByTestId("tool026-file-input").setInputFiles("test-fixtures/tool-026/sample.jpg");
    await expect(page.getByTestId("tool026-error")).toContainText("최대 20장");
    await expect(page.getByTestId("tool026-count")).toHaveText("20 / 20");
  } else {
    await page.getByTestId("tool026-reset-all").click();
    const files = Array.from({ length: 21 }, (_, i) => ({ name: `x-${i}.jpg`, mimeType: "image/jpeg", buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) }));
    await page.getByTestId("tool026-file-input").setInputFiles(files);
    await expect(page.getByTestId("tool026-error")).toContainText("최대 20장");
    await expect(page.getByTestId("tool026-count")).toHaveText("0 / 20");
  }
});

test("026 rejects per-file 15MiB + 1 from original metadata", async ({ page }) => {
  await page.goto("/en/image-to-pdf");
  await dispatchFiles(page, [{ name: "too-large.jpg", type: "image/jpeg", bytes: sampleBytes, originalSize: 15 * MiB + 1 }]);
  await expect(page.getByTestId("tool026-error")).toContainText("15MB or smaller");
});

test("026 accepts total 80MiB and rejects 80MiB + 1", async ({ page }) => {
  await page.goto("/en/image-to-pdf");
  const mobileStable = await isMobileStable(page);
  const exact = [15, 15, 15, 15, 15, 5].map((m, i) => ({ name: `exact-${i}.jpg`, type: "image/jpeg", bytes: sampleBytes, originalSize: m * MiB }));
  await dispatchFiles(page, exact);
  await expect(page.getByTestId("tool026-count")).toHaveText("6 / 20");
  await expect(page.getByTestId("tool026-total")).toContainText("80.0 MB / 80 MB");
  await page.getByTestId("tool026-reset-all").click();

  const over = [15, 15, 15, 15, 15].map((m, i) => ({ name: `over-${i}.jpg`, type: "image/jpeg", bytes: sampleBytes, originalSize: m * MiB }));
  over.push({ name: "over-last.jpg", type: "image/jpeg", bytes: sampleBytes, originalSize: 5 * MiB + 1 });
  await dispatchFiles(page, over);
  await expect(page.getByTestId("tool026-error")).toContainText("80MB or smaller");
  await expect(page.getByTestId("tool026-count")).toHaveText(mobileStable ? "5 / 20" : "0 / 20");
});

test("026 accepts exactly 24MP and rejects above 24MP", async ({ page }) => {
  await page.goto("/ko/image-to-pdf");
  await page.getByTestId("tool026-file-input").setInputFiles("test-fixtures/tool-026/exact-24mp.jpg");
  await expect(page.getByTestId("tool026-count")).toHaveText("1 / 20");
  await page.getByTestId("tool026-reset-all").click();
  await page.getByTestId("tool026-file-input").setInputFiles("test-fixtures/tool-026/over-24mp.jpg");
  await expect(page.getByTestId("tool026-error")).toContainText("최대 24MP");
});
