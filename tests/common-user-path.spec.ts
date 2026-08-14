import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { armSelectedImageFileProbe, probeSelectedImageFile } from "./common-validation/image-file-probe";

type Profile = {
  tool: string;
  slug: string;
  trigger: string;
  dropTarget: string;
  fixture: string;
  upload: boolean;
  desktopDragDrop: boolean;
  mobileDragDrop: boolean;
  ready?: string;
};

const root = process.cwd();
const profiles = JSON.parse(fs.readFileSync(path.join(root, "tests/common-validation/capability-profile.json"), "utf8")) as Profile[];
const fixture = (name: string) => path.join(root, "test-fixtures", name);

function watchRuntime(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}\n${error.stack || ""}`));
  page.on("console", message => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/favicon|Failed to load resource.*404/i.test(text)) return;
    const loc = message.location();
    errors.push(`console: ${text} @ ${loc.url || "unknown"}:${loc.lineNumber ?? "?"}:${loc.columnNumber ?? "?"}`);
  });
  return errors;
}

async function assertClickablePath(page: Page, selector: string) {
  const trigger = page.locator(selector).first();
  await expect(trigger).toBeVisible();
  await expect(trigger).toBeEnabled();
  const box = await trigger.boundingBox();
  expect(box, "interactive element must have a rendered box").not.toBeNull();
  expect((box?.width ?? 0) > 0 && (box?.height ?? 0) > 0).toBeTruthy();
  return trigger;
}

async function actualChooserEntry(page: Page, item: Profile, mobile: boolean) {
  await page.goto(`/ko/${item.slug}`);
  const runtimeErrors = watchRuntime(page);
  await page.evaluate(() => {
    document.documentElement.dataset.commonUploadChange = "0";
    const marker = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== "file") return;
      document.documentElement.dataset.commonUploadChange = "1";
      document.removeEventListener("change", marker, true);
    };
    document.addEventListener("change", marker, true);
  });
  await armSelectedImageFileProbe(page);
  const trigger = await assertClickablePath(page, item.trigger);
  const chooserPromise = page.waitForEvent("filechooser");
  if (mobile) await trigger.tap();
  else await trigger.click();
  const chooser = await chooserPromise;
  await chooser.setFiles(fixture(item.fixture));
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.commonUploadChange)).toBe("1");
  await probeSelectedImageFile(page);
  if (item.ready) await expect(page.locator(item.ready).first()).toBeVisible();
  const unreadable = page.getByRole("alert").filter({ hasText: /읽을 수|불러오지 못|지원하지 않는 이미지|could not be read|not supported|読み込め|対応していない/i });
  await expect(unreadable).toHaveCount(0);
  expect(runtimeErrors, `${item.tool} runtime errors: ${JSON.stringify(runtimeErrors)}`).toEqual([]);
}

async function desktopDrop(page: Page, item: Profile) {
  await page.goto(`/ko/${item.slug}`);
  const runtimeErrors = watchRuntime(page);
  const target = page.locator(item.dropTarget).first();
  await expect(target).toBeVisible();
  const filePath = fixture(item.fixture);
  const data = fs.readFileSync(filePath).toString("base64");
  const mime = item.fixture.endsWith(".svg") ? "image/svg+xml" : "image/jpeg";
  await target.evaluate((el, payload) => {
    const bytes = Uint8Array.from(atob(payload.data), c => c.charCodeAt(0));
    const file = new File([bytes], payload.name, { type: payload.mime });
    const dt = new DataTransfer();
    dt.items.add(file);
    for (const type of ["dragenter", "dragover", "drop"]) {
      el.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt }));
    }
  }, { data, name: path.basename(filePath), mime });
  if (item.ready) await expect(page.locator(item.ready).first()).toBeVisible();
  expect(runtimeErrors, `${item.tool} drag/drop runtime errors`).toEqual([]);
}

test.describe("COMMON USER PATH · desktop upload", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });
  for (const item of profiles.filter(p => p.upload)) {
    test(`${item.tool} desktop click -> chooser -> change`, async ({ page }) => actualChooserEntry(page, item, false));
  }
});

test.describe("COMMON USER PATH · mobile browser upload", () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  for (const item of profiles.filter(p => p.upload)) {
    test(`${item.tool} mobile tap -> chooser -> change`, async ({ page }) => actualChooserEntry(page, item, true));
  }
});

test.describe("COMMON USER PATH · desktop drag/drop", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });
  for (const item of profiles.filter(p => p.desktopDragDrop)) {
    test(`${item.tool} desktop drag/drop entry`, async ({ page }) => desktopDrop(page, item));
  }
});

test.describe("COMMON ROUTE / LOCALE / RUNTIME / RELOAD", () => {
  for (const item of profiles) {
    test(`${item.tool} ko/en/ja direct URL + reload has no runtime failure`, async ({ page }) => {
      for (const locale of ["ko", "en", "ja"] as const) {
        const runtimeErrors = watchRuntime(page);
        const response = await page.goto(`/${locale}/${item.slug}`);
        expect(response?.ok(), `${item.tool}/${locale} direct route`).toBeTruthy();
        await expect(page.locator("h1").first()).toBeVisible();
        await page.reload();
        await expect(page.locator("h1").first()).toBeVisible();
        expect(runtimeErrors, `${item.tool}/${locale} runtime errors`).toEqual([]);
      }
    });
  }
});

test("COMMON CAPABILITY semantics: mobile drag/drop is N/A, not SKIP", async () => {
  expect(profiles.filter(p => p.mobileDragDrop).length).toBe(0);
  expect(profiles.filter(p => p.desktopDragDrop).length).toBe(profiles.length);
});
