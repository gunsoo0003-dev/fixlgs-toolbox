export const TOOL016_SERVICE_LIMITS = {
  maxFileBytes: 15 * 1024 * 1024,
  // Common phone “12 MP” sensors often output 4032×3024 = 12,192,768 pixels.
  // Keep the service in the 12 MP class while allowing that standard native frame.
  maxPixels: 12_500_000,
  maxSide: 6_000,
  maxLayers: 20,
  maxTextChars: 2_000,
  maxHistory: 30,
} as const;
