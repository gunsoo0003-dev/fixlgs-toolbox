import { expect, test } from "@playwright/test";
import { route042, setRule } from "./helpers/tool-042";
test("TOOL042 single replace and count",async({page})=>{
  await page.goto(route042());
  await page.getByTestId("tool042-input").fill("Hello world world");
  await setRule(page,0,"world","FIX");
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-result")).toHaveValue("Hello FIX FIX");
  await expect(page.getByTestId("tool042-total-count")).toContainText("2");
  await expect(page.getByTestId("tool042-count-0")).toContainText("2");
});
test("TOOL042 simultaneous replacement does not chain",async({page})=>{
  await page.goto(route042());
  await page.getByTestId("tool042-input").fill("A B");
  await setRule(page,0,"A","B");
  await page.getByTestId("tool042-add-rule").click();
  await setRule(page,1,"B","C");
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-result")).toHaveValue("B C");
});
test("TOOL042 case-sensitive toggle",async({page})=>{
  await page.goto(route042());
  await page.getByTestId("tool042-input").fill("Cat cat CAT");
  await setRule(page,0,"cat","dog");
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-result")).toHaveValue("Cat dog CAT");
  await page.getByTestId("tool042-case-sensitive").uncheck();
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-result")).toHaveValue("dog dog dog");
});
