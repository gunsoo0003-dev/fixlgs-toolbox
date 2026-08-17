import { expect, test } from "@playwright/test";
import { route042 } from "./helpers/tool-042";

test("TOOL042 root primary controls and initial state match the product DOM",async({page})=>{
  await page.goto(route042());
  await expect(page.getByTestId("tool042-root")).toBeVisible();
  await expect(page.getByTestId("tool042-workspace")).toHaveCount(1);
  await expect(page.getByTestId("tool042-input")).toBeVisible();
  await expect(page.getByTestId("tool042-find-0")).toBeVisible();
  await expect(page.getByTestId("tool042-replace-0")).toBeVisible();
  await expect(page.getByTestId("tool042-case-sensitive")).toBeChecked();
  await expect(page.getByTestId("tool042-run")).toBeDisabled();
  await expect(page.getByTestId("tool042-reset")).toBeDisabled();
  await expect(page.getByTestId("tool042-copy")).toBeVisible();
  await expect(page.getByTestId("tool042-copy")).toBeDisabled();
  await expect(page.getByTestId("tool042-download")).toBeVisible();
  await expect(page.getByTestId("tool042-download")).toBeDisabled();
});
