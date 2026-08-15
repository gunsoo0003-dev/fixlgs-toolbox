import { test, expect, type Page } from "@playwright/test";

async function sources(page: Page) {
  return page.getByTestId("tool030-page-card").evaluateAll((els) => els.map((el) => el.getAttribute("data-source-page")));
}
async function load(page: Page, fixture = "marker-4.pdf", locale = "ko") {
  await page.goto(`/${locale}/pdf-page-organizer`);
  const root = page.getByTestId("tool030-root");
  await root.getByTestId("tool030-file-input").setInputFiles(`test-fixtures/tool-030/${fixture}`);
  await expect(root.getByTestId("tool030-page-grid")).toBeVisible();
  return root;
}

test("030 delete keeps requested marker order", async ({ page }) => {
  const root = await load(page, "marker-5.pdf");
  await root.getByRole("checkbox", { name: "현재 2", exact: true }).check();
  await root.getByRole("checkbox", { name: "현재 4", exact: true }).check();
  await root.getByRole("button", { name: "삭제", exact: true }).click();
  await expect(page.getByTestId("tool030-page-card")).toHaveCount(3);
  expect(await sources(page)).toEqual(["1", "3", "5"]);
  await page.getByTestId("tool030-save").click();
  await expect(page.getByTestId("tool030-result-verification")).toContainText("3 페이지");
});

test("030 duplicate inserts immediately after source", async ({ page }) => {
  const root = await load(page);
  await root.getByRole("checkbox", { name: "현재 2", exact: true }).check();
  await root.getByRole("button", { name: "복제", exact: true }).click();
  expect(await sources(page)).toEqual(["1", "2", "2", "3", "4"]);
  await expect(page.getByTestId("tool030-page-card").nth(2)).toHaveAttribute("data-duplicate", "true");
});

test("030 rotation is stateful and result recheck passes", async ({ page }) => {
  const root = await load(page);
  await root.getByRole("checkbox", { name: "현재 2", exact: true }).check();
  await root.getByRole("button", { name: "오른쪽 회전", exact: true }).click();
  await expect(page.getByTestId("tool030-page-card").nth(1)).toHaveAttribute("data-rotation", "90");
  await page.getByTestId("tool030-save").click();
  await expect(page.getByTestId("tool030-result-verification")).toBeVisible();
});

test("030 reverse and undo restore exact order", async ({ page }) => {
  const root = await load(page);
  page.once("dialog", (dialog) => dialog.accept());
  await root.getByRole("button", { name: "역순 정렬", exact: true }).click();
  expect(await sources(page)).toEqual(["4", "3", "2", "1"]);
  await root.getByRole("button", { name: "실행 취소", exact: true }).click();
  expect(await sources(page)).toEqual(["1", "2", "3", "4"]);
});

test("030 blank A4 page can be inserted first", async ({ page }) => {
  const root = await load(page);
  await root.getByRole("button", { name: "빈 페이지 추가", exact: true }).click();
  await page.getByTestId("tool030-blank-position").selectOption("first");
  await page.getByTestId("tool030-blank-size").selectOption("a4");
  await root.getByRole("button", { name: "추가", exact: true }).click();
  const first = page.getByTestId("tool030-page-card").first();
  await expect(first).toHaveAttribute("data-blank", "true");
  await expect(first).toHaveAttribute("data-source-page", "blank");
});
