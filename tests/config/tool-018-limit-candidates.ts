export const TOOL018_LIMIT_CANDIDATES = {
  maxFiles: 20,
  maxFileBytes: 15 * 1024 * 1024,
  maxTotalBytes: 100 * 1024 * 1024,
  maxPixels: 48_000_000,
} as const;

export const TOOL018_LIMIT_SOURCES = {
  maxFiles: 'service-limit candidate: general batch privacy check without large-scale professional processing',
  maxFileBytes: 'service-limit candidate: current image-tool stability baseline and ordinary phone/camera images',
  maxTotalBytes: 'service-limit candidate: conservative multi-file browser memory budget',
  maxPixels: 'service-limit candidate: covers common high-resolution phone photos while excluding extreme professional images',
} as const;
