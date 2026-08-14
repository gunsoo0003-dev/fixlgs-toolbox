import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { armSelectedImageFileProbe, probeSelectedImageFile } from "./common-validation/image-file-probe";

type Profile = {
  tool: string;
  slug: string;
  trigger: string;
  fixture: string;
  upload: boolean;
  ready?: string;
};

const root = process.cwd();
const allProfiles = JSON.parse(fs.readFileSync(path.join(root, "tests/common-validation/capability-profile.json"), "utf8")) as Profile[];
const fixture = (name: string) => path.join(root, "test-fixtures", name);

// FAST는 전수검사가 아니라 대표군 샘플링이다.
// 001: 구형 시작점, 008: cropper, 009/012/016/017: 실기기 정상 기준군,
// 018: runtime 의심군, 024: 최신 카테고리3 기준군.
const FAST_TOOLS = new Set(["001", "008", "009", "012", "016", "017", "018", "024"]);
const profiles = allProfiles.filter(p => p.upload && FAST_TOOLS.has(p.tool));

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

async function runOne(page: Page, item: Profile, mobile: boolean) {
  const runtime = watchRuntime(page);
  try {
    await page.goto(`/ko/${item.slug}`, { waitUntil: "domcontentloaded", timeout: 10_000 });
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

    const trigger = page.locator(item.trigger).first();
    await expect(trigger).toBeVisible({ timeout: 5_000 });
    await expect(trigger).toBeEnabled({ timeout: 2_000 });

    const chooserPromise = page.waitForEvent("filechooser", { timeout: 5_000 });
    if (mobile) await trigger.tap({ timeout: 5_000 });
    else await trigger.click({ timeout: 5_000 });
    const chooser = await chooserPromise;
    await chooser.setFiles(fixture(item.fixture));
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.commonUploadChange), { timeout: 5_000 }).toBe("1");
    await probeSelectedImageFile(page);
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

async function runBatch(page: Page, mobile: boolean) {
  const failures: string[] = [];
  for (const [index, item] of profiles.entries()) {
    console.log(`[FAST ${mobile ? "MOBILE" : "DESKTOP"}] ${index + 1}/${profiles.length} TOOL ${item.tool}`);
    const result = await runOne(page, item, mobile);
    if (!result.ok) {
      failures.push(`TOOL ${result.tool}: ${result.error}`);
      console.error(`[FAST FAIL] TOOL ${result.tool}: ${result.error.split("\n")[0]}`);
    } else {
      console.log(`[FAST PASS] TOOL ${result.tool}`);
    }
  }
  expect(failures, `FAST failures (${failures.length})\n${failures.join("\n\n")}`).toEqual([]);
}

test.describe("FAST desktop upload", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });
  test("representative actual click -> chooser -> change", async ({ page }) => {
    test.setTimeout(120_000);
    await runBatch(page, false);
  });
});

test.describe("FAST mobile upload", () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  test("representative actual tap -> chooser -> change", async ({ page }) => {
    test.setTimeout(120_000);
    await runBatch(page, true);
  });
});
