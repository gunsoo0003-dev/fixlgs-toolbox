import {expect,test} from "@playwright/test"; import {route043,injectText} from "./helpers/tool-043";
test("character limit plus one preserves input and blocks result",async({page})=>{await page.goto(route043());const value="A".repeat(200001);await injectText(page,"tool043-input-a",value);await page.getByTestId("tool043-run").click();await expect(page.getByTestId("tool043-error")).toBeVisible();await expect(page.getByTestId("tool043-input-a")).toHaveValue(value);await expect(page.getByTestId("tool043-result")).toHaveCount(0);});


test("line limit plus one preserves input and blocks result",async({page})=>{
  await page.goto(route043());
  const value=Array.from({length:20001},()=>"x").join("\n");
  await injectText(page,"tool043-input-b",value);
  await page.getByTestId("tool043-run").click();
  await expect(page.getByTestId("tool043-error")).toBeVisible();
  await expect(page.getByTestId("tool043-input-b")).toHaveValue(value);
  await expect(page.getByTestId("tool043-result")).toHaveCount(0);
});
