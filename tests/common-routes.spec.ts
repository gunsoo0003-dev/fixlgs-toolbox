import { expect, test } from "@playwright/test";
import { validationTools } from "../lib/validation/tool-registry";
import { assertNoPageErrors } from "./helpers/toolbox-validation";

test.describe("TOOLBOX 공개 경로", () => {
  for (const tool of validationTools) {
    for (const locale of tool.locales) {
      test(`${tool.number} ${locale} 페이지가 정상 렌더링된다`, async ({ page }) => {
        const verifyErrors = await assertNoPageErrors(page);
        const response = await page.goto(`/${locale}/${tool.slug}`);
        expect(response?.ok()).toBeTruthy();
        const actualH1 = (await page.locator("h1").textContent()) ?? "";
        const normalize = (value: string) => value.replace(/\s+/g, "").trim();
        expect(normalize(actualH1)).toContain(normalize(tool.expectedH1[locale]));
        await expect(page.locator("body")).not.toContainText(/Application error|Internal Server Error/);
        await verifyErrors();
      });
    }
  }
});
