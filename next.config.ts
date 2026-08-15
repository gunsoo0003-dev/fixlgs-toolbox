import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const isTool016Regression = process.env.TOOL016_REGRESSION === "1";
const isTool016Runtime = process.env.TOOL016_RUNTIME === "1";
const isTool017Regression = process.env.TOOL017_REGRESSION === "1";
const isTool017Runtime = process.env.TOOL017_RUNTIME === "1";
const isTool018Runtime = process.env.TOOL018_RUNTIME === "1";
const isTool019Runtime = process.env.TOOL019_RUNTIME === "1";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  distDir: isTool019Runtime
    ? ".next-tool019-runtime"
    : isTool018Runtime
      ? ".next-tool018-runtime"
    : isTool017Regression
      ? ".next-tool017-regression"
    : isTool017Runtime
      ? ".next-tool017-runtime"
      : isTool016Regression
        ? ".next-tool016-regression"
        : isTool016Runtime
          ? ".next-tool016-runtime"
          : ".next",
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      fs: { browser: "./lib/browser-empty-module.ts" },
      path: { browser: "./lib/browser-empty-module.ts" },
    },
  },
};

export default nextConfig;
