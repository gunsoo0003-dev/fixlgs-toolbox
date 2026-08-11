import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

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
const allProfiles = JSON.parse(fs.readFileSync(path.join(root, "tests/common-validation/capability-profile.json"), "utf8")) as Profile[];
const rawTargetTool = process.env.TOOLBOX_VALIDATION_TOOL || "";
const targetTool = rawTargetTool ? rawTargetTool.padStart(3, "0") : "";
const profiles = targetTool ? allProfiles.filter(item => item.tool === targetTool) : allProfiles;
const fixture = (name: string) => path.join(root, "test-fixtures", name);

function watchRuntime(page: Page) {
  const errors: string[] = [];
  const onPageError = (error: Error) => errors.push(`pageerror: ${error.message}\n${error.stack || ""}`);
  const onConsole = (message: any) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/favicon|Failed to load resource.*404/i.test(text)) return;
    const loc = message.location();
    errors.push(`console: ${text} @ ${loc.url || "unknown"}:${loc.lineNumber ?? "?"}:${loc.columnNumber ?? "?"}`);
  };
  page.on("pageerror", onPageError);
  page.on("console", onConsole);
  return {
    errors,
    dispose() {
      page.off("pageerror", onPageError);
      page.off("console", onConsole);
    },
  };
}

async function runUploadOne(page: Page, item: Profile, mobile: boolean) {
  const runtime = watchRuntime(page);
  try {
    await page.goto(`/ko/${item.slug}`, { waitUntil: "domcontentloaded", timeout: 12_000 });
    await page.evaluate(() => {
      document.documentElement.dataset.commonUploadChange = "0";
      for (const input of document.querySelectorAll<HTMLInputElement>('input[type="file"]')) {
        input.addEventListener("change", () => { document.documentElement.dataset.commonUploadChange = "1"; }, { once: true });
      }
    });

    const trigger = page.locator(item.trigger).first();
    await expect(trigger).toBeVisible({ timeout: 5_000 });
    await expect(trigger).toBeEnabled({ timeout: 2_000 });

    const chooserPromise = page.waitForEvent("filechooser", { timeout: 5_000 });
    if (mobile) await trigger.tap({ timeout: 5_000 });
    else await trigger.click({ timeout: 5_000 });
    const chooser = await chooserPromise;
    await chooser.setFiles(fixture(item.fixture));
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.commonUploadChange), { timeout: 5_000 }).toBe("1");
    if (item.ready) await expect(page.locator(item.ready).first()).toBeVisible({ timeout: 5_000 });
    const unreadable = page.getByRole("alert").filter({ hasText: /읽을 수|불러오지 못|지원하지 않는 이미지|could not be read|not supported|読み込め|対応していない/i });
    await expect(unreadable).toHaveCount(0, { timeout: 2_000 });
    if (runtime.errors.length) throw new Error(`${item.tool} runtime errors:\n${runtime.errors.join("\n---\n")}`);
    return { tool: item.tool, ok: true as const, error: "" };
  } catch (error) {
    return { tool: item.tool, ok: false as const, error: error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error) };
  } finally {
    runtime.dispose();
  }
}

async function runUploadBatch(page: Page, mobile: boolean) {
  const items = profiles.filter(p => p.upload);
  const failures: string[] = [];
  for (const [index, item] of items.entries()) {
    console.log(`[FULL ${mobile ? "MOBILE" : "DESKTOP"}] ${index + 1}/${items.length} TOOL ${item.tool}`);
    const result = await runUploadOne(page, item, mobile);
    if (!result.ok) {
      failures.push(`TOOL ${result.tool}: ${result.error}`);
      console.error(`[FULL FAIL] TOOL ${result.tool}: ${result.error.split("\n")[0]}`);
    } else {
      console.log(`[FULL PASS] TOOL ${result.tool}`);
    }
  }
  expect(failures, `FULL upload failures (${failures.length})\n${failures.join("\n\n")}`).toEqual([]);
}

async function runDragDropOne(page: Page, item: Profile) {
  const runtime = watchRuntime(page);
  try {
    await page.goto(`/ko/${item.slug}`, { waitUntil: "domcontentloaded", timeout: 12_000 });
    const target = page.locator(item.dropTarget).first();
    await expect(target).toBeVisible({ timeout: 5_000 });
    const filePath = fixture(item.fixture);
    const data = fs.readFileSync(filePath).toString("base64");
    const mime = item.fixture.endsWith(".svg") ? "image/svg+xml" : item.fixture.endsWith(".png") ? "image/png" : item.fixture.endsWith(".webp") ? "image/webp" : "image/jpeg";
    await target.evaluate((el, payload) => {
      const bytes = Uint8Array.from(atob(payload.data), c => c.charCodeAt(0));
      const file = new File([bytes], payload.name, { type: payload.mime });
      const dt = new DataTransfer();
      dt.items.add(file);
      for (const type of ["dragenter", "dragover", "drop"]) {
        el.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt }));
      }
    }, { data, name: path.basename(filePath), mime });
    if (item.ready) await expect(page.locator(item.ready).first()).toBeVisible({ timeout: 5_000 });
    if (runtime.errors.length) throw new Error(`${item.tool} drag/drop runtime errors:\n${runtime.errors.join("\n---\n")}`);
    return { tool: item.tool, ok: true as const, error: "" };
  } catch (error) {
    return { tool: item.tool, ok: false as const, error: error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error) };
  } finally {
    runtime.dispose();
  }
}

async function runDragDropBatch(page: Page) {
  const items = profiles.filter(p => p.desktopDragDrop);
  const failures: string[] = [];
  for (const [index, item] of items.entries()) {
    console.log(`[FULL DRAGDROP] ${index + 1}/${items.length} TOOL ${item.tool}`);
    const result = await runDragDropOne(page, item);
    if (!result.ok) failures.push(`TOOL ${result.tool}: ${result.error}`);
  }
  expect(failures, `FULL drag/drop failures (${failures.length})\n${failures.join("\n\n")}`).toEqual([]);
}

async function runRouteLocaleBatch(page: Page) {
  const failures: string[] = [];
  const locales = ["ko", "en", "ja"] as const;
  let count = 0;
  const total = profiles.length * locales.length;
  for (const item of profiles) {
    for (const locale of locales) {
      count += 1;
      console.log(`[FULL ROUTE] ${count}/${total} TOOL ${item.tool} ${locale}`);
      const runtime = watchRuntime(page);
      try {
        const response = await page.goto(`/${locale}/${item.slug}`, { waitUntil: "domcontentloaded", timeout: 12_000 });
        if (!response?.ok()) throw new Error(`HTTP ${response?.status() ?? "NO_RESPONSE"}`);
        await expect(page.locator("h1").first()).toBeVisible({ timeout: 5_000 });
        await page.reload({ waitUntil: "domcontentloaded", timeout: 12_000 });
        await expect(page.locator("h1").first()).toBeVisible({ timeout: 5_000 });
        if (runtime.errors.length) throw new Error(runtime.errors.join("\n---\n"));
      } catch (error) {
        failures.push(`TOOL ${item.tool}/${locale}: ${error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error)}`);
      } finally {
        runtime.dispose();
      }
    }
  }
  expect(failures, `FULL route/locale/runtime failures (${failures.length})\n${failures.join("\n\n")}`).toEqual([]);
}

test.describe("FULL OPTIMIZED desktop upload", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });
  test("001-024 desktop actual click -> chooser -> change", async ({ page }) => {
    test.setTimeout(300_000);
    await runUploadBatch(page, false);
  });
});

test.describe("FULL OPTIMIZED mobile upload", () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  test("001-024 mobile actual tap -> chooser -> change", async ({ page }) => {
    test.setTimeout(300_000);
    await runUploadBatch(page, true);
  });
});

test.describe("FULL OPTIMIZED desktop drag/drop", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });
  test("001-024 desktop drag/drop", async ({ page }) => {
    test.setTimeout(300_000);
    await runDragDropBatch(page);
  });
});

test.describe("FULL OPTIMIZED route/locale/runtime/reload", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });
  test("001-024 ko/en/ja direct URL + reload", async ({ page }) => {
    test.setTimeout(420_000);
    await runRouteLocaleBatch(page);
  });
});

test("FULL OPTIMIZED capability semantics", async () => {
  expect(profiles.filter(p => p.mobileDragDrop).length).toBe(0);
  expect(profiles.filter(p => p.desktopDragDrop).length).toBe(profiles.length);
});
