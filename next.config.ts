import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const isTool016Regression = process.env.TOOL016_REGRESSION === "1";
const isTool016Runtime = process.env.TOOL016_RUNTIME === "1";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  distDir: isTool016Regression
    ? ".next-tool016-regression"
    : isTool016Runtime
      ? ".next-tool016-runtime"
      : ".next",
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
