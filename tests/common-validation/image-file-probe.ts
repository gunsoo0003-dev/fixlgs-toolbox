import { expect, type Page } from "@playwright/test";

export type ImageFileProbeResult = {
  state: "IMAGE_DECODE_PENDING" | "IMAGE_DECODE_PASS" | "IMAGE_DECODE_FAIL";
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

/**
 * Arms a capture-phase file probe BEFORE the product's own change handler runs.
 *
 * Why this is necessary:
 * Some TOOLBOX inputs intentionally consume the selected File and then replace,
 * clear, or unmount the native <input type="file"> as part of the normal user
 * workflow. Looking for input.files[0] after the change handler has completed can
 * therefore report FILE_NOT_FOUND even though the user selection was valid and
 * the product already accepted it.
 *
 * The probe below snapshots the real File at the change-event boundary and owns
 * its own object URL until image decode settles. It does not modify the product
 * File, input, DataTransfer, or application state.
 */
export async function armSelectedImageFileProbe(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as typeof window & {
      __toolboxCommonImageProbe?: ImageFileProbeResult;
      __toolboxCommonImageProbeHandler?: EventListener;
    };

    if (w.__toolboxCommonImageProbeHandler) {
      document.removeEventListener("change", w.__toolboxCommonImageProbeHandler, true);
    }

    w.__toolboxCommonImageProbe = undefined;

    const handler: EventListener = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== "file") return;
      const file = target.files?.[0];
      if (!file) return;

      document.removeEventListener("change", handler, true);
      w.__toolboxCommonImageProbeHandler = undefined;

      const base = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        objectUrlCreated: false,
        imageOnload: false,
        imageOnerror: false,
        naturalWidth: 0,
        naturalHeight: 0,
        error: "",
      };

      w.__toolboxCommonImageProbe = {
        state: "IMAGE_DECODE_PENDING",
        ...base,
      };

      let objectUrl = "";
      try {
        objectUrl = URL.createObjectURL(file);
      } catch (error) {
        w.__toolboxCommonImageProbe = {
          state: "IMAGE_DECODE_FAIL",
          ...base,
          error: `OBJECT_URL_CREATE_FAILED: ${error instanceof Error ? error.message : String(error)}`,
        };
        return;
      }

      w.__toolboxCommonImageProbe = {
        state: "IMAGE_DECODE_PENDING",
        ...base,
        objectUrlCreated: true,
      };

      const image = new Image();
      let settled = false;
      const finish = (value: ImageFileProbeResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        URL.revokeObjectURL(objectUrl);
        w.__toolboxCommonImageProbe = value;
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
    };

    w.__toolboxCommonImageProbeHandler = handler;
    document.addEventListener("change", handler, true);
  });
}

export async function probeSelectedImageFile(page: Page): Promise<ImageFileProbeResult> {
  await expect.poll(
    () => page.evaluate(() => {
      const result = (window as typeof window & { __toolboxCommonImageProbe?: ImageFileProbeResult }).__toolboxCommonImageProbe;
      return result?.state ?? "NO_CAPTURE";
    }),
    { timeout: 6_000, message: "capture-phase file probe must observe and decode the selected file" },
  ).not.toBe("NO_CAPTURE");

  await expect.poll(
    () => page.evaluate(() => {
      const result = (window as typeof window & { __toolboxCommonImageProbe?: ImageFileProbeResult }).__toolboxCommonImageProbe;
      return result?.state ?? "NO_CAPTURE";
    }),
    { timeout: 6_000, message: "selected image decode must settle" },
  ).not.toBe("IMAGE_DECODE_PENDING");

  const result = await page.evaluate(() => {
    const captured = (window as typeof window & { __toolboxCommonImageProbe?: ImageFileProbeResult }).__toolboxCommonImageProbe;
    return captured ?? {
      state: "IMAGE_DECODE_FAIL" as const,
      fileName: "",
      fileType: "",
      fileSize: 0,
      objectUrlCreated: false,
      imageOnload: false,
      imageOnerror: false,
      naturalWidth: 0,
      naturalHeight: 0,
      error: "CAPTURE_NOT_FOUND",
    };
  });

  console.log(
    `[IMAGE FILE PROBE] ${result.state} name=${JSON.stringify(result.fileName)} type=${JSON.stringify(result.fileType)} size=${result.fileSize} objectURL=${result.objectUrlCreated} onload=${result.imageOnload} onerror=${result.imageOnerror} natural=${result.naturalWidth}x${result.naturalHeight}${result.error ? ` error=${result.error}` : ""}`,
  );

  expect(result.fileName, "selected File.name must be present at change-event capture").not.toBe("");
  expect(result.fileSize, "selected File.size must be > 0 at change-event capture").toBeGreaterThan(0);
  expect(result.objectUrlCreated, "URL.createObjectURL(file) must succeed").toBeTruthy();
  expect(result.imageOnerror, `Image.onerror must not fire (${result.error})`).toBeFalsy();
  expect(result.imageOnload, `Image.onload must fire (${result.error})`).toBeTruthy();
  expect(result.naturalWidth, "decoded image naturalWidth must be > 0").toBeGreaterThan(0);
  expect(result.naturalHeight, "decoded image naturalHeight must be > 0").toBeGreaterThan(0);
  expect(result.state).toBe("IMAGE_DECODE_PASS");

  return result;
}
