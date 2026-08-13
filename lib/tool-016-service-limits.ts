export const TOOL016_SERVICE_LIMITS = {
  maxFileBytes: 15 * 1024 * 1024,
  // 20 MP service ceiling: leaves practical headroom above common 12–16 MP phone photos
  // while preserving the existing 15 MiB file cap and 6,000 px per-side guard.
  maxPixels: 20_000_000,
  maxSide: 6_000,
  maxLayers: 20,
  maxTextChars: 2_000,
  maxHistory: 30,
} as const;
