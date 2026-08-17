import { expect, test } from "@playwright/test";
import { injectTextLike, LIMITS, route042, setRule } from "./helpers/tool-042";

async function expectBlocked(page:any){
  await expect(page.getByTestId("tool042-error")).toBeVisible();
  await expect(page.getByTestId("tool042-result")).toHaveValue("");
  await expect(page.getByTestId("tool042-total-count")).toContainText("0");
  await expect(page.getByTestId("tool042-copy")).toBeDisabled();
  await expect(page.getByTestId("tool042-download")).toBeDisabled();
}

test("TOOL042 approved limit contract is rendered",async({page})=>{
  await page.goto(route042("en"));
  await expect(page.locator("body")).toContainText("1,000,000");
  await expect(page.locator("body")).toContainText("100 rules");
  await expect(page.locator("body")).toContainText("1,000 find characters");
  await expect(page.locator("body")).toContainText("10,000 replacement characters");
  await expect(page.locator("body")).toContainText("5,000,000 result characters");
});

test("TOOL042 input limit plus one blocks result using bounded native injection",async({page})=>{
  await page.goto(route042("en"));
  await setRule(page,0,"A","B");
  await injectTextLike(page.getByTestId("tool042-input"),"A".repeat(LIMITS.input+1));
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-error")).toContainText("input exceeds");
  await expectBlocked(page);
});

test("TOOL042 find limit plus one blocks result",async({page})=>{
  await page.goto(route042("en"));
  await page.getByTestId("tool042-input").fill("source");
  await injectTextLike(page.getByTestId("tool042-find-0"),"A".repeat(LIMITS.find+1));
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-error")).toContainText("find value exceeds");
  await expectBlocked(page);
});

test("TOOL042 replacement limit plus one blocks result",async({page})=>{
  await page.goto(route042("en"));
  await page.getByTestId("tool042-input").fill("A");
  await page.getByTestId("tool042-find-0").fill("A");
  await injectTextLike(page.getByTestId("tool042-replace-0"),"B".repeat(LIMITS.replacement+1));
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-error")).toContainText("replacement value exceeds");
  await expectBlocked(page);
});

test("TOOL042 projected result limit blocks result without huge typing",async({page})=>{
  await page.goto(route042("en"));
  await page.getByTestId("tool042-input").fill("A ".repeat(501));
  await page.getByTestId("tool042-find-0").fill("A");
  await injectTextLike(page.getByTestId("tool042-replace-0"),"B".repeat(LIMITS.replacement));
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-error")).toContainText("result would exceed");
  await expectBlocked(page);
});

test("TOOL042 rule add control stops exactly at 100 rules",async({page})=>{
  test.setTimeout(60_000);
  await page.goto(route042("en"));
  const add=page.getByTestId("tool042-add-rule");
  for(let i=1;i<LIMITS.rules;i++)await add.click();
  await expect(page.getByTestId(`tool042-find-${LIMITS.rules-1}`)).toBeVisible();
  await expect(add).toBeDisabled();
  await expect(page.locator('[data-testid^="tool042-find-"]')).toHaveCount(LIMITS.rules);
});
