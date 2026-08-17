import { expect, test } from "@playwright/test";
import { route042, setRule } from "./helpers/tool-042";

test("TOOL042 empty find is reported inline and run remains disabled",async({page})=>{
  await page.goto(route042());
  await page.getByTestId("tool042-input").fill("abc");
  await expect(page.getByTestId("tool042-rule-error-0")).toBeVisible();
  await expect(page.getByTestId("tool042-run")).toBeDisabled();
  await expect(page.getByTestId("tool042-result")).toHaveValue("");
});

test("TOOL042 duplicate find is rejected under case-insensitive policy",async({page})=>{
  await page.goto(route042());
  await page.getByTestId("tool042-input").fill("Cat cat");
  await setRule(page,0,"cat","X");
  await page.getByTestId("tool042-add-rule").click();
  await setRule(page,1,"CAT","Y");
  await page.getByTestId("tool042-case-sensitive").uncheck();
  await expect(page.getByTestId("tool042-rule-error-1")).toBeVisible();
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-error")).toBeVisible();
  await expect(page.getByTestId("tool042-result")).toHaveValue("");
});

test("TOOL042 overlap uses longer search first",async({page})=>{
  await page.goto(route042());
  await page.getByTestId("tool042-input").fill("catalog cat");
  await setRule(page,0,"cat","X");
  await page.getByTestId("tool042-add-rule").click();
  await setRule(page,1,"catalog","Y");
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-result")).toHaveValue("Y X");
});
