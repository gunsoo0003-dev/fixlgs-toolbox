import { expect, type Page } from "@playwright/test";

export type ImageFileProbeResult = {
  state: "IMAGE_DECODE_PASS" | "IMAGE_DECODE_FAIL";
  fileName: string;
  fileType: string;
  fileSize: number;
  objectUrlCreated: boolean;
  imageOnload: boolean;
  imageOnerror: boolean;
  naturalWidth: number;
  naturalHeight: number;
  error: string;
};

export async function probeSelectedImageFile(page: Page): Promise<ImageFileProbeResult> {
  const result = await page.evaluate(async () => {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"]'));
    const input = inputs.find(candidate => (candidate.files?.length ?? 0) > 0);
    const file = input?.files?.[0];

    if (!file) {
      return {
        state: "IMAGE_DECODE_FAIL" as const,
        fileName: "",
        fileType: "",
        fileSize: 0,
        objectUrlCreated: false,
        imageOnload: false,
        imageOnerror: false,
        naturalWidth: 0,
        naturalHeight: 0,
        error: "FILE_NOT_FOUND_AFTER_CHANGE",
      };
    }

    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch (error) {
      return {
        state: "IMAGE_DECODE_FAIL" as const,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        objectUrlCreated: false,
        imageOnload: false,
        imageOnerror: false,
        naturalWidth: 0,
        naturalHeight: 0,
        error: `OBJECT_URL_CREATE_FAILED: ${error instanceof Error ? error.message : String(error)}`,
      };
    }

    return await new Promise<ImageFileProbeResult>((resolve) => {
      const image = new Image();
      let settled = false;
      const finish = (value: ImageFileProbeResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        URL.revokeObjectURL(objectUrl);
        resolve(value);
      };
      const timer = window.setTimeout(() => finish({
        state: "IMAGE_DECODE_FAIL",
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        objectUrlCreated: true,
        imageOnload: false,
        imageOnerror: false,
        naturalWidth: image.naturalWidth || 0,
        naturalHeight: image.naturalHeight || 0,
        error: "IMAGE_LOAD_TIMEOUT",
      }), 5000);

      image.onload = () => {
        const width = image.naturalWidth || 0;
        const height = image.naturalHeight || 0;
        finish({
          state: width > 0 && height > 0 ? "IMAGE_DECODE_PASS" : "IMAGE_DECODE_FAIL",
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          objectUrlCreated: true,
          imageOnload: true,
          imageOnerror: false,
          naturalWidth: width,
          naturalHeight: height,
          error: width > 0 && height > 0 ? "" : "ZERO_NATURAL_DIMENSION",
        });
      };
      image.onerror = () => finish({
        state: "IMAGE_DECODE_FAIL",
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        objectUrlCreated: true,
        imageOnload: false,
        imageOnerror: true,
        naturalWidth: image.naturalWidth || 0,
        naturalHeight: image.naturalHeight || 0,
        error: "IMAGE_ONERROR",
      });
      image.src = objectUrl;
    });
  });

  console.log(
    `[IMAGE FILE PROBE] ${result.state} name=${JSON.stringify(result.fileName)} type=${JSON.stringify(result.fileType)} size=${result.fileSize} objectURL=${result.objectUrlCreated} onload=${result.imageOnload} onerror=${result.imageOnerror} natural=${result.naturalWidth}x${result.naturalHeight}${result.error ? ` error=${result.error}` : ""}`,
  );

  expect(result.fileName, "selected File.name must be present").not.toBe("");
  expect(result.fileSize, "selected File.size must be > 0").toBeGreaterThan(0);
  expect(result.objectUrlCreated, "URL.createObjectURL(file) must succeed").toBeTruthy();
  expect(result.imageOnerror, `Image.onerror must not fire (${result.error})`).toBeFalsy();
  expect(result.imageOnload, `Image.onload must fire (${result.error})`).toBeTruthy();
  expect(result.naturalWidth, "decoded image naturalWidth must be > 0").toBeGreaterThan(0);
  expect(result.naturalHeight, "decoded image naturalHeight must be > 0").toBeGreaterThan(0);
  expect(result.state).toBe("IMAGE_DECODE_PASS");

  return result;
}
