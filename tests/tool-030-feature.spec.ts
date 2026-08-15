import { test, expect } from "@playwright/test";

test("030 mixed scenario keeps state identity and can save", async ({ page }) => {
  await page.goto("/en/pdf-page-organizer");
  const root = page.getByTestId("tool030-root");
  await root.getByTestId("tool030-file-input").setInputFiles("test-fixtures/tool-030/marker-5.pdf");
  await root.getByRole("checkbox", { name: "Current 2", exact: true }).check();
  await root.getByRole("button", { name: "Duplicate", exact: true }).click();
  await root.getByRole("checkbox", { name: "Current 4", exact: true }).check();
  await root.getByRole("button", { name: "Rotate right", exact: true }).click();
  await root.getByRole("button", { name: "Add blank page", exact: true }).click();
  await page.getByTestId("tool030-blank-position").selectOption("last");
  await root.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByTestId("tool030-save").click();
  await expect(page.getByTestId("tool030-result-verification")).toBeVisible();
  await expect(page.getByTestId("tool030-download")).toBeEnabled();
});

test("030 same PDF can be selected repeatedly without alternating failure", async ({ page }) => {
  await page.goto("/ko/pdf-page-organizer");
  const root = page.getByTestId("tool030-root");
  const input = root.getByTestId("tool030-file-input");
  const fixture = "test-fixtures/tool-030/marker-5.pdf";

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    if (attempt > 1) {
      await root.getByRole("checkbox", { name: "현재 1", exact: true }).check();
      await root.getByRole("button", { name: "오른쪽 회전", exact: true }).click();
      await expect(root.getByTestId("tool030-page-card").first()).toHaveAttribute("data-rotation", "90");
    }

    await input.setInputFiles(fixture);
    await expect(root.getByTestId("tool030-uploaded-file")).toContainText("marker-5.pdf");
    await expect(root.getByTestId("tool030-page-card")).toHaveCount(5);
    await expect(root.getByTestId("tool030-page-card").first()).toHaveAttribute("data-rotation", "0");
    await expect(root.getByRole("checkbox", { name: "현재 1", exact: true })).not.toBeChecked();
    await expect(input).toHaveValue("");
    await expect(root.getByTestId("tool030-error")).toHaveCount(0);
  }
});

test("030 post-upload workspace shares external PDF drag state without treating internal reorder as file drag", async ({ page }) => {
  await page.goto("/en/pdf-page-organizer");
  const root = page.getByTestId("tool030-root");
  await root.getByTestId("tool030-file-input").setInputFiles("test-fixtures/tool-030/marker-5.pdf");
  const workspace = root.getByTestId("tool030-workspace");
  const uploadedFile = root.getByTestId("tool030-uploaded-file");
  await expect(root.getByTestId("tool030-dropzone")).toHaveCount(0);
  await expect(uploadedFile).toBeVisible();
  await expect(workspace).toBeVisible();

  await workspace.evaluate((node) => {
    const dt = new DataTransfer();
    dt.items.add(new File(["%PDF-1.4"], "replacement.pdf", { type: "application/pdf" }));
    node.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: dt }));
  });
  await expect(workspace).toHaveAttribute("data-drag-active", "true");
  await expect(uploadedFile).toHaveAttribute("data-drag-active", "true");

  await workspace.evaluate((node) => {
    node.dispatchEvent(new DragEvent("dragleave", { bubbles: true, cancelable: true, relatedTarget: document.body }));
  });
  await expect(workspace).toHaveAttribute("data-drag-active", "false");
  await expect(uploadedFile).toHaveAttribute("data-drag-active", "false");

  await workspace.evaluate((node) => {
    const dt = new DataTransfer();
    dt.setData("text/tool030-index", "0");
    node.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: dt }));
  });
  await expect(workspace).toHaveAttribute("data-drag-active", "false");
  await expect(uploadedFile).toHaveAttribute("data-drag-active", "false");
});
