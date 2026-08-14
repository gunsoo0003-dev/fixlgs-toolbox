import { test, expect, type Page } from '@playwright/test';

async function dispatchFileDrag(page:Page, testId:string, type:'dragenter'|'dragleave') {
  await page.evaluate(({testId,type}:{testId:string,type:string}) => {
    const el=document.querySelector(`[data-testid="${testId}"]`);
    if(!el) throw new Error(`missing ${testId}`);
    const dt=new DataTransfer();
    dt.items.add(new File(['tool025-drag-probe'],'tool025-drag-probe.jpg',{type:'image/jpeg'}));
    el.dispatchEvent(new DragEvent(type,{bubbles:true,cancelable:true,dataTransfer:dt,relatedTarget:type==='dragleave'?document.body:null}));
  },{testId,type});
}

test('025 TOOL024 dropzone state remains mounted after upload and workspace shares drag highlight', async ({ page }) => {
  await page.goto('/ko/id-passport-photo-maker');
  const dropzone=page.getByTestId('tool025-dropzone');
  const workspace=page.getByTestId('tool025-workspace-dropzone');

  await expect(dropzone).toBeVisible();
  await expect(dropzone).not.toHaveClass(/dropzoneReady/);

  await page.getByTestId('tool025-file-input').setInputFiles('test-fixtures/portrait-1080x1920.jpg');
  await expect(page.getByTestId('tool025-preview').locator('canvas')).toBeVisible();
  await expect(dropzone).toBeVisible();
  await expect(dropzone).toHaveClass(/dropzoneReady/);
  await expect(dropzone).not.toHaveClass(/dragging/);

  await dispatchFileDrag(page,'tool025-workspace-dropzone','dragenter');
  await expect(workspace).toHaveClass(/workspaceDragging/);
  await expect(dropzone).toHaveClass(/dragging/);

  await dispatchFileDrag(page,'tool025-workspace-dropzone','dragleave');
  await expect(workspace).not.toHaveClass(/workspaceDragging/);
  await expect(dropzone).not.toHaveClass(/dragging/);
  await expect(dropzone).toHaveClass(/dropzoneReady/);
});
