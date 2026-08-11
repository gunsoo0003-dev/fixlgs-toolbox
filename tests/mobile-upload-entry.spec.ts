import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();
const fixture = (name: string) => path.join(root, "test-fixtures", name);

type EntryCase = {
  tool: string;
  slug: string;
  trigger: string;
  fixture?: string;
};

const category12: EntryCase[] = [
  { tool: "001", slug: "jpg-png-webp-image-converter", trigger: ".toolbox-upload-focus button" },
  { tool: "002", slug: "heic-avif-image-converter", trigger: ".toolbox-upload-focus button" },
  { tool: "003", slug: "svg-bmp-tiff-image-converter", trigger: ".toolbox-upload-focus button", fixture: "sample.svg" },
  { tool: "004", slug: "image-compressor", trigger: ".toolbox-upload-focus button" },
  { tool: "005", slug: "target-size-image-compressor", trigger: ".toolbox-upload-focus button" },
  { tool: "006", slug: "image-resizer", trigger: ".toolbox-upload-focus button" },
  { tool: "007", slug: "web-image-optimizer", trigger: ".toolbox-upload-focus button" },
  { tool: "008", slug: "image-cropper-rotator", trigger: ".toolbox-upload-focus button" },
  { tool: "009", slug: "image-brightness-color-adjuster", trigger: "[data-testid=tool009-select]" },
  { tool: "010", slug: "image-mosaic-blur-tool", trigger: "[data-testid=tool010-select]" },
  { tool: "011", slug: "image-padding-background-tool", trigger: ".toolbox-upload-focus button" },
  { tool: "012", slug: "image-border-rounded-corners-tool", trigger: ".toolbox-upload-focus button" },
  { tool: "013", slug: "image-merger", trigger: "[data-testid=tool013-select]" },
  { tool: "014", slug: "image-collage-maker", trigger: "[data-testid=tool014-select]" },
  { tool: "015", slug: "before-after-image-maker", trigger: "[data-testid=tool015-workbench] button" },
  { tool: "016", slug: "add-text-to-image", trigger: ".toolbox-upload-focus button" },
  { tool: "017", slug: "image-watermark-tool", trigger: ".toolbox-upload-focus button" },
  { tool: "018", slug: "image-metadata-checker", trigger: ".toolbox-upload-focus button" },
];

const category3Controls: EntryCase[] = [
  { tool: "019", slug: "youtube-thumbnail-maker", trigger: ".toolbox-upload-focus button" },
  { tool: "020", slug: "youtube-channel-banner-maker", trigger: ".toolbox-upload-focus button" },
  { tool: "021", slug: "social-media-image-maker", trigger: "label:has([data-testid=tool021-background-input])" },
  { tool: "022", slug: "blog-open-graph-image-maker", trigger: "label:has([data-testid=tool022-background-input])" },
  { tool: "023", slug: "app-icon-favicon-generator", trigger: ".toolbox-upload-focus button" },
  { tool: "024", slug: "app-store-screenshot-maker", trigger: "[data-testid=tool024-dropzone] button" },
];

async function actualMobileEntry(page: import("@playwright/test").Page, item: EntryCase) {
  await page.goto(`/ko/${item.slug}`);
  await page.evaluate(() => {
    document.documentElement.dataset.mobileUploadChange = "0";
    for (const input of document.querySelectorAll<HTMLInputElement>('input[type="file"]')) {
      input.addEventListener("change", () => {
        document.documentElement.dataset.mobileUploadChange = "1";
      }, { once: true });
    }
  });

  const trigger = page.locator(item.trigger).first();
  await expect(trigger, `${item.tool} upload trigger`).toBeVisible();
  const chooserPromise = page.waitForEvent("filechooser");
  await trigger.click();
  const chooser = await chooserPromise;
  await chooser.setFiles(fixture(item.fixture ?? "sample.jpg"));
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.mobileUploadChange)).toBe("1");
}

test.describe("mobile real upload entry", () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  for (const item of category12) {
    test(`${item.tool} opens chooser and dispatches change`, async ({ page }) => {
      await actualMobileEntry(page, item);
    });
  }

  for (const item of category3Controls) {
    test(`${item.tool} category-3 control keeps upload entry`, async ({ page }) => {
      await actualMobileEntry(page, item);
    });
  }


  const representativeFiles = [
    "sample.jpg",
    "transparent.png",
    "sample.webp",
    "target-large.jpg",
    "한국어-파일명.jpg",
    "日本語-ファイル名.jpg",
  ];

  for (const name of representativeFiles) {
    test(`009 mobile representative file: ${name}`, async ({ page }) => {
      await page.goto("/ko/image-brightness-color-adjuster");
      const chooserPromise = page.waitForEvent("filechooser");
      await page.locator("[data-testid=tool009-select]").click();
      const chooser = await chooserPromise;
      await chooser.setFiles(fixture(name));
      await expect(page.locator("[data-testid=tool009-editor]")).toBeVisible();
      await expect(page.getByRole("alert").filter({ hasText: /읽을 수|불러오지 못|지원하지 않는 이미지/i })).toHaveCount(0);
    });
  }

  for (const locale of ["ko", "en", "ja"] as const) {
    test(`009 mobile upload entry locale ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/image-brightness-color-adjuster`);
      const chooserPromise = page.waitForEvent("filechooser");
      await page.locator("[data-testid=tool009-select]").click();
      const chooser = await chooserPromise;
      await chooser.setFiles(fixture("sample.jpg"));
      await expect(page.locator("[data-testid=tool009-editor]")).toBeVisible();
    });
  }

  const decodeCases = [
    { tool: "008", slug: "image-cropper-rotator", trigger: ".toolbox-upload-focus button", ready: "[data-testid=cropper-stage]" },
    { tool: "009", slug: "image-brightness-color-adjuster", trigger: "[data-testid=tool009-select]", ready: "[data-testid=tool009-editor]" },
    { tool: "010", slug: "image-mosaic-blur-tool", trigger: "[data-testid=tool010-select]", ready: "[data-testid=tool010-editor]" },
    { tool: "013", slug: "image-merger", trigger: "[data-testid=tool013-select]", ready: "[data-testid=tool013-file-card]" },
    { tool: "014", slug: "image-collage-maker", trigger: "[data-testid=tool014-select]", ready: "[data-testid=tool014-preview-canvas]" },
    { tool: "015", slug: "before-after-image-maker", trigger: "[data-testid=tool015-workbench] button", ready: "[data-testid=tool015-preview-canvas]" },
    { tool: "019", slug: "youtube-thumbnail-maker", trigger: ".toolbox-upload-focus button", ready: "[data-testid=tool019-preview-canvas]" },
    { tool: "024", slug: "app-store-screenshot-maker", trigger: "[data-testid=tool024-dropzone] button", ready: "[data-testid=tool024-preview]" },
  ];

  for (const item of decodeCases) {
    test(`${item.tool} chooser -> change -> decode -> preview`, async ({ page }) => {
      await page.goto(`/ko/${item.slug}`);
      const chooserPromise = page.waitForEvent("filechooser");
      await page.locator(item.trigger).first().click();
      const chooser = await chooserPromise;
      await chooser.setFiles(fixture("sample.jpg"));
      await expect(page.locator(item.ready).first()).toBeVisible();
      const unreadable = page.getByRole("alert").filter({ hasText: /읽을 수|불러오지 못|지원하지 않는 이미지/i });
      await expect(unreadable).toHaveCount(0);
    });
  }
});
