import { expect, test } from "@playwright/test";
import path from "node:path";

const fixture = (name: string) => path.join(process.cwd(), "test-fixtures", name);

async function waitForUploadOutcome(page: import("@playwright/test").Page, timeout = 120_000) {
  const editor = page.locator('[data-testid="tool009-editor"]');
  const error = page.locator('[data-testid="tool009-error"]');
  await expect(editor.or(error)).toBeVisible({ timeout });
  return { editor, error };
}

test.describe("009 추가 완료검수", () => {
  test("19.2MP는 허용하고 19.2MP 초과는 오류 UI로 차단한다", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto("/ko/image-brightness-color-adjuster");
    await page.locator('input[type="file"]').first().setInputFiles(fixture("tool009-probe-19_2mp.png"));
    let outcome = await waitForUploadOutcome(page);
    await expect(outcome.editor).toBeVisible();

    await page.goto("/ko/image-brightness-color-adjuster");
    await page.locator('input[type="file"]').first().setInputFiles(fixture("tool009-probe-over-19_2mp.png"));
    outcome = await waitForUploadOutcome(page);
    await expect(outcome.editor).toHaveCount(0);
    await expect(outcome.error).toContainText(/최대 1,920만 픽셀|초과한 이미지는 처리할 수 없습니다|너무 커|메모리/, { timeout: 120_000 });
  });

  test("MIME·확장자 불일치, 빈 파일, 손상 파일을 각각 오류로 처리한다", async ({ page }) => {
    await page.goto("/ko/image-brightness-color-adjuster");

    await page.locator('input[type="file"]').first().setInputFiles({
      name: "fake.png",
      mimeType: "image/jpeg",
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    });
    await expect(page.locator('[data-testid="tool009-error"]')).toContainText("지원하지 않는");

    await page.locator('input[type="file"]').first().setInputFiles({
      name: "empty.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.alloc(0),
    });
    await expect(page.locator('[data-testid="tool009-error"]')).toContainText("빈 파일");

    await page.locator('input[type="file"]').first().setInputFiles({
      name: "broken.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("not-an-image"),
    });
    await expect(page.locator('[data-testid="tool009-error"]')).toContainText(/읽을 수 없습니다|메모리/);
  });

  test("처리 중 전체 초기화와 이미지 교체가 이전 작업 결과를 남기지 않는다", async ({ page }) => {
    await page.goto("/ko/image-brightness-color-adjuster");
    await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
    await expect(page.locator('[data-testid="tool009-editor"]')).toBeVisible();

    await page.locator('[data-testid="tool009-brightness"]').fill("25");
    await page.locator('[data-testid="tool009-brightness"]').press("ArrowRight");
    await page.locator('[data-testid="tool009-full-reset"]').click();
    await expect(page.locator('[data-testid="tool009-editor"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="tool009-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool009-result"]')).toHaveCount(0);

    await page.locator('input[type="file"]').first().setInputFiles(fixture("sample.jpg"));
    await expect(page.locator('[data-testid="tool009-editor"]')).toBeVisible();
    await page.locator('input[type="file"]').first().setInputFiles(fixture("transparent.png"));
    await expect(page.locator('[data-testid="tool009-editor"]')).toContainText("transparent.png");
    await expect(page.locator('[data-testid="tool009-brightness"]')).toHaveValue("0");
  });

  test("009 카테고리 번호·LIVE 링크와 010~018 준비 카드가 유지된다", async ({ page }) => {
    await page.goto("/ko/category/image-edit");
    const tool008 = page.locator('a[href="/ko/image-cropper-rotator"]');
    const tool009 = page.locator('a[href="/ko/image-brightness-color-adjuster"]');
    await expect(tool008).toBeVisible();
    await expect(tool008).toContainText("08");
    await expect(tool008).toContainText("이미지 자르기");
    await expect(tool008).toContainText("회전 도구");
    await expect(tool009).toBeVisible();
    await expect(tool009).toContainText("09");
    await expect(tool009).toContainText("이미지 밝기");
    await expect(tool009).toContainText("색상 보정기");
    for (const number of ["10", "11", "12", "13", "14", "15", "16", "17", "18"]) {
      await expect(page.getByText(number, { exact: true }).first()).toBeVisible();
    }
  });
});
