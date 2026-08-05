import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const fixture = (name: string) => path.resolve(process.cwd(), "public", "test-fixtures", name);

async function upload(page: import("@playwright/test").Page, name: string) {
  await page.getByTestId("target-file-input").setInputFiles(fixture(name));
  const card = page.getByTestId("target-file-card").last();
  await expect(card).toBeVisible();
  return card;
}

async function run(page: import("@playwright/test").Page) {
  await page.getByTestId("target-compress-button").click();
  const cards = page.getByTestId("target-file-card");
  await expect.poll(async () => {
    const states = await cards.evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-status")));
    return states.every((s) => ["reached", "already", "unreached", "failed", "cancelled"].includes(s || ""));
  }, { timeout: 180_000 }).toBe(true);
}

function numbers(card: import("@playwright/test").Locator) {
  return card.evaluate((node) => ({
    status: node.getAttribute("data-status"),
    original: Number(node.getAttribute("data-original-size")),
    result: Number(node.getAttribute("data-result-size")),
    width: Number(node.getAttribute("data-result-width")),
    height: Number(node.getAttribute("data-result-height")),
    quality: Number(node.getAttribute("data-quality")),
    scale: Number(node.getAttribute("data-scale")),
    attempts: Number(node.getAttribute("data-attempts")),
  }));
}

test.describe("005 목표 용량 이미지 압축기 실제 기능", () => {
  test.beforeEach(async ({ page }) => { await page.goto("/ko/target-size-image-compressor"); });

  test("JPG가 달성 가능한 목표 바이트 이하의 최고 품질 후보를 생성한다", async ({ page }) => {
    const card = await upload(page, "target-large.jpg");
    await page.getByTestId("target-value").fill("400");
    await page.getByTestId("target-unit").selectOption("KB");
    await page.getByRole("button", { name: "모든 파일에 적용" }).click();
    await run(page);
    const r = await numbers(card);
    expect(r.status).toBe("reached");
    expect(r.result).toBeLessThanOrEqual(398_000);
    expect(r.result).toBeGreaterThan(0);
    expect(r.width).toBe(1200); expect(r.height).toBe(900);
    expect(r.quality).toBeGreaterThanOrEqual(40);
    expect(r.attempts).toBeLessThanOrEqual(10);
  });

  test("WebP가 달성 가능한 목표 바이트 이하 결과를 생성한다", async ({ page }) => {
    const card = await upload(page, "target-large.webp");
    await page.getByTestId("target-value").fill("500");
    await page.getByRole("button", { name: "모든 파일에 적용" }).click();
    await run(page);
    const r = await numbers(card);
    expect(r.status).toBe("reached");
    expect(r.result).toBeLessThanOrEqual(497_500);
    expect(r.width).toBe(1200); expect(r.height).toBe(900);
  });

  test("PNG가 무손실 및 색상 최적화를 거쳐 목표를 탐색한다", async ({ page }) => {
    const card = await upload(page, "target-large.png");
    await page.getByTestId("target-value").fill("12");
    await page.getByRole("button", { name: "모든 파일에 적용" }).click();
    await run(page);
    const r = await numbers(card);
    expect(["reached", "unreached"]).toContain(r.status);
    expect(r.result).toBeGreaterThan(0);
    expect(r.width).toBe(900); expect(r.height).toBe(700);
    expect(r.attempts).toBeGreaterThan(1);
    if (r.status === "reached") expect(r.result).toBeLessThanOrEqual(11_940);
  });

  test("이미 목표 이하인 파일은 원본을 유지한다", async ({ page }) => {
    const card = await upload(page, "sample.jpg");
    await page.getByTestId("target-value").fill("1");
    await page.getByTestId("target-unit").selectOption("MB");
    await page.getByRole("button", { name: "모든 파일에 적용" }).click();
    await run(page);
    const r = await numbers(card);
    expect(r.status).toBe("already");
    expect(r.result).toBe(r.original);
    expect(r.attempts).toBe(0);
  });

  test("크기 축소 허용 시 작은 목표를 위해 픽셀을 줄일 수 있다", async ({ page }) => {
    const card = await upload(page, "target-large.jpg");
    await page.getByTestId("target-value").fill("20");
    await page.getByLabel("목표 달성을 위해 이미지 크기 축소 허용").check();
    await page.getByText("고급 설정", { exact: true }).click();
    await page.getByTestId("minimum-quality").fill("60");
    await page.getByRole("button", { name: "모든 파일에 적용" }).click();
    await run(page);
    const r = await numbers(card);
    expect(["reached", "unreached"]).toContain(r.status);
    expect(r.width).toBeLessThanOrEqual(1200);
    expect(r.height).toBeLessThanOrEqual(900);
    if (r.status === "reached") expect(r.result).toBeLessThanOrEqual(19_900);
  });

  test("0 목표값은 실행되지 않고 오류를 표시한다", async ({ page }) => {
    await upload(page, "sample.jpg");
    await page.getByTestId("target-value").fill("0");
    await expect(page.getByTestId("target-compress-button")).toBeDisabled();
  });

  test("파일별 목표값은 전체값과 독립적으로 변경할 수 있다", async ({ page }) => {
    await page.getByTestId("target-file-input").setInputFiles([fixture("target-large.jpg"), fixture("target-large.webp")]);
    const cards = page.getByTestId("target-file-card");
    await cards.nth(0).locator('input[type="number"]').fill("400");
    await cards.nth(1).locator('input[type="number"]').fill("500");
    await run(page);
    const a = await numbers(cards.nth(0)), b = await numbers(cards.nth(1));
    expect(a.status).toBe("reached");
    expect(b.status).toBe("reached");
    expect(a.result).toBeLessThanOrEqual(398_000);
    expect(b.result).toBeLessThanOrEqual(497_500);
  });

  test("ZIP에는 목표 달성 또는 이미 목표 이하 파일만 포함된다", async ({ page }) => {
    await upload(page, "sample.jpg");
    await page.getByTestId("target-value").fill("1"); await page.getByTestId("target-unit").selectOption("MB");
    await page.getByRole("button", { name: "모든 파일에 적용" }).click(); await run(page);
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("target-zip-button").click();
    const download = await downloadPromise; const saved = await download.path(); expect(saved).toBeTruthy();
    const bytes = await fs.readFile(saved!); expect(bytes.subarray(0, 2).toString("ascii")).toBe("PK");
  });

  test("비교 화면과 전체 초기화가 동작한다", async ({ page }) => {
    await upload(page, "sample.jpg");
    await page.getByTestId("target-value").fill("1"); await page.getByTestId("target-unit").selectOption("MB");
    await page.getByRole("button", { name: "모든 파일에 적용" }).click(); await run(page);
    await page.getByRole("button", { name: "원본과 비교" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "닫기" }).click();
    await page.getByRole("button", { name: "전체 초기화" }).click();
    await expect(page.getByTestId("target-file-card")).toHaveCount(0);
  });
  test("EXIF 회전 JPG의 표시 방향과 결과 픽셀 크기를 유지한다", async ({ page }) => {
    const card = await upload(page, "exif-rotated.jpg");
    expect(Number(await card.getAttribute("data-orientation"))).toBe(6);
    await page.getByTestId("target-value").fill("2");
    await page.getByRole("button", { name: "모든 파일에 적용" }).click();
    await run(page);
    const result = await numbers(card);
    expect(["reached", "unreached"]).toContain(result.status);
    expect(result.width).toBe(500);
    expect(result.height).toBe(300);
  });

  test("파일별 최소 품질과 최소 이미지 크기를 독립적으로 설정한다", async ({ page }) => {
    const card = await upload(page, "target-large.jpg");
    await card.getByLabel(/최소 품질/).fill("65");
    await card.getByLabel(/크기 축소 허용/).check();
    await card.getByLabel(/최소 이미지 크기/).selectOption("0.5");
    await card.locator('input[type="number"]').fill("20");
    await run(page);
    const result = await numbers(card);
    expect(["reached", "unreached"]).toContain(result.status);
    expect(result.quality).toBeGreaterThanOrEqual(20);
    expect(result.scale).toBeGreaterThanOrEqual(0.5);
  });

  test("설정 변경 시 이전 결과를 제거하고 새 설정으로 다시 처리한다", async ({ page }) => {
    const card = await upload(page, "sample.jpg");
    await page.getByTestId("target-value").fill("1");
    await page.getByTestId("target-unit").selectOption("MB");
    await page.getByRole("button", { name: "모든 파일에 적용" }).click();
    await run(page);
    expect((await numbers(card)).status).toBe("already");
    await card.locator('input[type="number"]').fill("10");
    expect(await card.getAttribute("data-result-size")).toBe("");
    expect(await card.getAttribute("data-status")).toBe("ready");
  });

  test("목표 미달성 결과는 사용자가 명시적으로 선택한 뒤에만 다운로드한다", async ({ page }) => {
    const card = await upload(page, "target-large.jpg");
    await card.locator('input[type="number"]').fill("1");
    await run(page);
    expect((await numbers(card)).status).toBe("unreached");
    await expect(card.getByRole("button", { name: "다운로드" })).toHaveCount(0);
    await card.getByRole("button", { name: "현재 결과 사용" }).click();
    await expect(card.getByRole("button", { name: "다운로드" })).toBeVisible();
  });

});
