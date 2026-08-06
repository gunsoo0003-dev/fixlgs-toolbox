import { expect, test } from "@playwright/test";

const POC = "/dev/cropperjs-poc.html";

test.describe("008 Cropper.js 2.1.1 isolated capability PoC", () => {
  test("initializes selection and exposes required v2 APIs", async ({ page }) => {
    await page.goto(POC);
    await expect(page.getByTestId("poc-status")).toContainText("READY", { timeout: 30_000 });
    const result = await page.evaluate(() => {
      const poc = (window as any).__cropperPoc;
      return {
        hasImageApi: ["$rotate", "$zoom", "$scale", "$center", "$getTransform"].every((name) => typeof poc.image[name] === "function"),
        hasSelectionApi: ["$change", "$reset", "$render", "$toCanvas"].every((name) => typeof poc.selection[name] === "function"),
        width: poc.selection.width,
        height: poc.selection.height,
      };
    });
    expect(result.hasImageApi).toBeTruthy();
    expect(result.hasSelectionApi).toBeTruthy();
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  test("changes ratio, rotates, flips, zooms and exports a real canvas", async ({ page }) => {
    await page.goto(POC);
    await expect(page.getByTestId("poc-status")).toContainText("READY", { timeout: 30_000 });
    const before = await page.evaluate(() => (window as any).__cropperPoc.getState());
    await page.getByRole("button", { name: "1:1" }).click();
    await page.getByRole("button", { name: "↷ 90°" }).click();
    await page.getByRole("button", { name: "좌우 반전" }).click();
    await page.getByRole("button", { name: "확대" }).click();
    const after = await page.evaluate(() => (window as any).__cropperPoc.getState());
    expect(Math.abs(after.selection.width - after.selection.height)).toBeLessThan(2);
    expect(after.transform).not.toEqual(before.transform);
    await page.getByRole("button", { name: "결과 캔버스 생성" }).click();
    await expect(page.getByTestId("poc-status")).toContainText("PASS");
    await expect(page.getByTestId("poc-preview")).toHaveAttribute("src", /^data:image\/png/);
  });

  test("supports precise x y width height bidirectional controls", async ({ page }) => {
    await page.goto(POC);
    await expect(page.getByTestId("poc-status")).toContainText("READY", { timeout: 30_000 });
    await page.locator("#x").fill("40");
    await page.locator("#y").fill("35");
    await page.locator("#w").fill("220");
    await page.locator("#h").fill("160");
    await page.getByRole("button", { name: "좌표 적용" }).click();
    const state = await page.evaluate(() => (window as any).__cropperPoc.getState());
    expect(Math.round(state.selection.x)).toBe(40);
    expect(Math.round(state.selection.y)).toBe(35);
    expect(Math.round(state.selection.width)).toBe(220);
    expect(Math.round(state.selection.height)).toBe(160);
  });

  test("mobile viewport keeps the editing stage usable", async ({ page }) => {
    test.skip(test.info().project.name !== "mobile-chromium", "mobile-only PoC layout assertion");
    await page.goto(POC);
    await expect(page.getByTestId("poc-status")).toContainText("READY", { timeout: 30_000 });
    const box = await page.getByTestId("poc-stage").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(box!.height).toBeGreaterThan(300);
  });
});
