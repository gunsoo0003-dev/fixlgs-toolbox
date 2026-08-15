import { test, expect } from "@playwright/test";
import path from "node:path";
const fixture = (...parts: string[]) => path.join(process.cwd(), "fixtures", "tool-032", ...parts);

async function ready(page: any) {
  await page.goto("/en/pdf-signature");
  await page.getByTestId("tool032-file-input").setInputFiles(fixture("mixed-4page.pdf"));
  await expect(page.getByTestId("tool032-workspace")).toBeVisible();
}

test("032 damaged PDF is product error and does not create workspace", async ({ page }) => {
  await page.goto("/en/pdf-signature");
  await page.getByTestId("tool032-file-input").setInputFiles(fixture("broken.pdf"));
  await expect(page.getByTestId("tool032-status")).toHaveAttribute("role", "alert");
  await expect(page.getByTestId("tool032-workspace")).toHaveCount(0);
});

test("032 invalid custom page ranges cannot create output", async ({ page }) => {
  await ready(page);
  await page.getByRole("tab", { name: "Signature image" }).click();
  await page.getByTestId("tool032-signature-input").setInputFiles(fixture("signature.jpg"));
  await page.getByLabel("Custom range").check();
  for (const value of ["0", "-1", "5", "4-2", "1-99", "abc"]) {
    await page.getByTestId("tool032-range").fill(value);
    await expect(page.getByTestId("tool032-create")).toBeDisabled();
  }
  await page.getByTestId("tool032-range").fill("1-3,2,3-4");
  await expect(page.getByTestId("tool032-create")).toBeEnabled();
});

test("032 rejects signature MIME mismatch before decode", async ({ page }) => {
  await ready(page);
  await page.getByRole("tab", { name: "Signature image" }).click();
  await page.getByTestId("tool032-signature-input").setInputFiles(fixture("mime-mismatch.png"));
  await expect(page.getByTestId("tool032-status")).toHaveAttribute("role", "alert");
  await expect(page.getByTestId("tool032-signature-overlay")).toHaveCount(0);
});
