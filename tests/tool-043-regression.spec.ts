import {expect,test} from "@playwright/test";
test("042 remains reachable and links to 043",async({page})=>{await page.goto("/ko/text-find-replace");await expect(page.getByRole("link",{name:/두 텍스트 비교기/})).toHaveAttribute("href","/ko/text-diff-compare");});
test("043 mobile layout remains usable",async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto("/ko/text-diff-compare");await expect(page.getByTestId("tool043-input-a")).toBeVisible();await expect(page.getByTestId("tool043-input-b")).toBeVisible();await expect(page.getByTestId("tool043-run")).toBeVisible();});
