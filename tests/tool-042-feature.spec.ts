import { expect, test } from "@playwright/test";
import { route042, setRule } from "./helpers/tool-042";

test("TOOL042 file replacement confirm and cancel preserve the 041 contract",async({page})=>{
  await page.goto(route042());
  await page.getByTestId("tool042-input").fill("keep me");
  await page.getByTestId("tool042-file-input").setInputFiles({name:"new.txt",mimeType:"text/plain",buffer:Buffer.from("new text")});
  await expect(page.getByTestId("tool042-replace-dialog")).toBeVisible();
  await page.getByTestId("tool042-replace-cancel").click();
  await expect(page.getByTestId("tool042-input")).toHaveValue("keep me");
  await page.getByTestId("tool042-file-input").setInputFiles({name:"new.txt",mimeType:"text/plain",buffer:Buffer.from("new text")});
  await page.getByTestId("tool042-replace-confirm").click();
  await expect(page.getByTestId("tool042-input")).toHaveValue("new text");
  await expect(page.getByTestId("tool042-file-info")).toContainText("new.txt");
});

test("TOOL042 single activeWorkspace owns drag state and file drop",async({page})=>{
  await page.goto(route042());
  const workspace=page.getByTestId("tool042-workspace");
  await expect(workspace).toHaveCount(1);
  const handle=await page.evaluateHandle(()=>{const dt=new DataTransfer();dt.items.add(new File(["drag text"],"drag.txt",{type:"text/plain"}));return dt;});
  await workspace.dispatchEvent("dragenter",{dataTransfer:handle});
  await expect(workspace).toHaveAttribute("data-drag-active","true");
  await workspace.dispatchEvent("drop",{dataTransfer:handle});
  await handle.dispose();
  await expect(workspace).toHaveAttribute("data-drag-active","false");
  await expect(page.getByTestId("tool042-input")).toHaveValue("drag text");
  await expect(page.getByTestId("tool042-file-info")).toContainText("drag.txt");
});

test("TOOL042 unsupported file is rejected without replacing source",async({page})=>{
  await page.goto(route042());
  await page.getByTestId("tool042-input").fill("keep source");
  await page.getByTestId("tool042-file-input").setInputFiles({name:"bad.png",mimeType:"image/png",buffer:Buffer.from([1,2,3])});
  await expect(page.getByTestId("tool042-error")).toBeVisible();
  await expect(page.getByTestId("tool042-input")).toHaveValue("keep source");
});

test("TOOL042 complete reset clears source rules result file state and case policy",async({page})=>{
  await page.goto(route042());
  await page.getByTestId("tool042-input").fill("Cat cat");
  await setRule(page,0,"cat","dog");
  await page.getByTestId("tool042-case-sensitive").uncheck();
  await page.getByTestId("tool042-run").click();
  await expect(page.getByTestId("tool042-result")).toHaveValue("dog dog");
  await page.getByTestId("tool042-reset").click();
  await expect(page.getByTestId("tool042-input")).toHaveValue("");
  await expect(page.getByTestId("tool042-find-0")).toHaveValue("");
  await expect(page.getByTestId("tool042-replace-0")).toHaveValue("");
  await expect(page.getByTestId("tool042-case-sensitive")).toBeChecked();
  await expect(page.getByTestId("tool042-result")).toHaveValue("");
  await expect(page.getByTestId("tool042-reset")).toBeDisabled();
  await expect(page.getByTestId("tool042-copy")).toBeDisabled();
  await expect(page.getByTestId("tool042-download")).toBeDisabled();
});

test("TOOL042 result download produces a TXT file",async({page})=>{
  await page.goto(route042());
  await page.getByTestId("tool042-input").fill("A");
  await setRule(page,0,"A","B");
  await page.getByTestId("tool042-run").click();
  const downloadPromise=page.waitForEvent("download");
  await page.getByTestId("tool042-download").click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe("find-replace-result.txt");
});
