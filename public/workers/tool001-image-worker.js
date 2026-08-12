/* TOOL001 V26 isolated image worker. No DOM/React/FilePicker references. */
function targetSize(width, height, maxDimension) {
  if (!width || !height || !maxDimension || Math.max(width, height) <= maxDimension) {
    return { width, height };
  }
  const scale = maxDimension / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

self.onmessage = async (event) => {
  const request = event.data || {};
  const id = request.id;
  let bitmap = null;
  let canvas = null;
  try {
    if (!(request.blob instanceof Blob)) throw new Error("worker-invalid-blob");
    const diagnosticFault = String(request.diagnosticFault || "");
    if (diagnosticFault === "bitmap-hang") await new Promise(() => {});
    if (diagnosticFault === "bitmap-throw") throw new Error("worker-diagnostic-bitmap");
    if (typeof createImageBitmap !== "function") throw new Error("worker-bitmap-unsupported");
    if (typeof OffscreenCanvas === "undefined") throw new Error("worker-offscreen-unsupported");

    const sourceWidth = Number(request.sourceWidth || 0);
    const sourceHeight = Number(request.sourceHeight || 0);
    if (sourceWidth > 0 && sourceHeight > 0 && sourceWidth * sourceHeight > request.maxPixels) {
      throw new Error("worker-pixel-limit");
    }
    const wanted = targetSize(sourceWidth, sourceHeight, Number(request.maxDimension || 0));
    const options = wanted.width > 0 && wanted.height > 0 && (wanted.width !== sourceWidth || wanted.height !== sourceHeight)
      ? { imageOrientation: "from-image", resizeWidth: wanted.width, resizeHeight: wanted.height, resizeQuality: "high" }
      : { imageOrientation: "from-image" };

    bitmap = await createImageBitmap(request.blob, options);
    if (!bitmap.width || !bitmap.height) throw new Error("worker-empty-bitmap");
    if (bitmap.width * bitmap.height > request.maxPixels) throw new Error("worker-pixel-limit");

    const output = targetSize(bitmap.width, bitmap.height, Number(request.maxDimension || 0));
    canvas = new OffscreenCanvas(output.width, output.height);
    const ctx = canvas.getContext("2d", { alpha: request.outputFormat !== "image/jpeg" });
    if (!ctx) throw new Error("worker-canvas-context");
    if (request.outputFormat === "image/jpeg") {
      ctx.fillStyle = request.backgroundColor || "#ffffff";
      ctx.fillRect(0, 0, output.width, output.height);
    } else {
      ctx.clearRect(0, 0, output.width, output.height);
    }
    ctx.drawImage(bitmap, 0, 0, output.width, output.height);
    bitmap.close();
    bitmap = null;

    const opts = { type: request.outputFormat };
    if (typeof request.quality === "number") opts.quality = request.quality;
    let blob;
    if (diagnosticFault === "export-throw") throw new Error("worker-diagnostic-export");
    if (diagnosticFault === "export-zero") blob = new Blob([], { type: request.outputFormat });
    else blob = await canvas.convertToBlob(opts);
    canvas.width = 0;
    canvas.height = 0;
    canvas = null;
    if (!blob || blob.size <= 0) throw new Error("worker-empty-result");
    self.postMessage({
      id, ok: true, blob, width: output.width, height: output.height,
      diagnostic: diagnosticFault === "report-options" ? { bitmapOptions: options, outputWidth: output.width, outputHeight: output.height } : undefined,
    });
  } catch (error) {
    try { bitmap && bitmap.close(); } catch {}
    try { if (canvas) { canvas.width = 0; canvas.height = 0; } } catch {}
    self.postMessage({ id, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
