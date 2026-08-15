import { test, expect } from "@playwright/test";
import path from "node:path";
const fixture = (...parts: string[]) => path.join(process.cwd(), "fixtures", "tool-032", ...parts);

async function ready(page: any) {
  await page.goto("/en/pdf-signature");
  const root = page.getByTestId("tool032-root");
  await root.getByTestId("tool032-file-input").setInputFiles(fixture("mixed-4page.pdf"));
  await expect(root.getByTestId("tool032-workspace")).toBeVisible();
  return root;
}

test("032 first PDF page renders immediately after upload without page navigation", async ({ page }) => {
  const root = await ready(page);
  const canvas = root.locator("canvas").first();
  await expect.poll(async () => canvas.evaluate((node: HTMLCanvasElement) => ({ width: node.width, height: node.height }))).toEqual(
    expect.objectContaining({ width: expect.any(Number), height: expect.any(Number) })
  );
  await expect.poll(async () => canvas.evaluate((node: HTMLCanvasElement) => node.width > 1 && node.height > 1)).toBe(true);
  await expect(root.getByText("Page 1 / 4")).toBeVisible();
});

test("032 upload state becomes compact file card and shared replacement workspace", async ({ page }) => {
  const root = await ready(page);
  await expect(root.getByTestId("tool032-dropzone")).toHaveCount(0);
  await expect(root.getByTestId("tool032-file-info")).toBeVisible();
  await expect(root.getByTestId("tool032-workspace")).toHaveAttribute("data-drop-target", "pdf-replace");
  await expect(root.getByTestId("tool032-file-info")).toHaveAttribute("data-drag-active", "false");
  await expect(root.getByTestId("tool032-workspace")).toHaveAttribute("data-drag-active", "false");
});

test("032 image signature supports page scopes, position preset, size, rotation, undo/redo", async ({ page }) => {
  const root = await ready(page);
  await root.getByRole("tab", { name: "Signature image" }).click();
  await root.getByTestId("tool032-signature-input").setInputFiles(fixture("transparent-signature.png"));
  await expect(root.getByTestId("tool032-signature-overlay")).toBeVisible();
  await root.getByRole("button", { name: "Top left" }).click();
  const size = root.getByTestId("tool032-size");
  await size.fill("30");
  await root.getByLabel("Signature rotation").selectOption("15");
  await root.getByLabel("Odd pages").check();
  await expect(root.getByTestId("tool032-preview-scope-state")).toHaveAttribute("data-applied", "true");
  await expect(root.getByTestId("tool032-signature-overlay")).toBeVisible();
  await root.getByRole("button", { name: "Next" }).click();
  await expect(root.getByTestId("tool032-preview-scope-state")).toHaveAttribute("data-applied", "false");
  await expect(root.getByTestId("tool032-signature-overlay")).toHaveCount(0);
  await root.getByRole("button", { name: "Next" }).click();
  await expect(root.getByTestId("tool032-preview-scope-state")).toHaveAttribute("data-applied", "true");
  await expect(root.getByTestId("tool032-signature-overlay")).toBeVisible();
  await expect(root.getByTestId("tool032-create")).toBeEnabled();
  await root.getByRole("button", { name: "Undo" }).click();
  await root.getByRole("button", { name: "Redo" }).click();
});
